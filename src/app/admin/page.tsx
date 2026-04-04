import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminDashboardControls } from "./AdminDashboardControls";

export const metadata: Metadata = {
  title: 'Kitchen Dashboard - OM Indian Restaurant',
  robots: {
    index: false,
    follow: false,
  },
};

const ACTIVE_STATUSES = ['PAID', 'IN_PROGRESS', 'READY'];
const STATUS_OPTIONS = ['PAID', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED'] as const;

const STATUS_STYLES: Record<string, string> = {
  PAID: 'bg-sky-100 text-sky-800 ring-1 ring-sky-200',
  IN_PROGRESS: 'bg-amber-100 text-amber-900 ring-1 ring-amber-200',
  READY: 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200',
  COMPLETED: 'bg-stone-200 text-stone-800 ring-1 ring-stone-300',
  CANCELLED: 'bg-rose-100 text-rose-800 ring-1 ring-rose-200',
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200',
  PAYMENT_FAILED: 'bg-rose-100 text-rose-800 ring-1 ring-rose-200',
};

type AdminPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    type?: string;
  }>;
};

function normalizeSearchValue(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function fuzzyMatch(query: string, value: string) {
  const normalizedQuery = normalizeSearchValue(query);
  const normalizedValue = normalizeSearchValue(value);

  if (!normalizedQuery) {
    return true;
  }

  if (normalizedValue.includes(normalizedQuery)) {
    return true;
  }

  let queryIndex = 0;
  for (const character of normalizedValue) {
    if (character === normalizedQuery[queryIndex]) {
      queryIndex += 1;
      if (queryIndex === normalizedQuery.length) {
        return true;
      }
    }
  }

  return false;
}

function orderMatchesQuery(order: any, query: string) {
  const haystacks = [
    order.customerName,
    order.customerPhone,
    order.type,
    order.status,
    order.notes || '',
    order.id,
    ...order.items.map((item: any) => `${item.name} ${item.note || ''}`),
  ];

  return haystacks.some((value) => fuzzyMatch(query, String(value)));
}

function getNextActions(status: string, orderType: string) {
  switch (status) {
    case 'PAID':
      return [{ label: 'Start Preparing', status: 'IN_PROGRESS', className: 'bg-amber-600 hover:bg-amber-700' }];
    case 'IN_PROGRESS':
      return [{
        label: orderType === 'DELIVERY' ? 'Mark Out For Delivery' : 'Mark Ready',
        status: 'READY',
        className: 'bg-emerald-600 hover:bg-emerald-700',
      }];
    case 'READY':
      return [{ label: 'Mark Completed', status: 'COMPLETED', className: 'bg-stone-800 hover:bg-black' }];
    default:
      return [];
  }
}

async function updateStatus(orderId: string, newStatus: string) {
  "use server";

  await requireAdminSession();

  if (!STATUS_OPTIONS.includes(newStatus as (typeof STATUS_OPTIONS)[number])) {
    throw new Error('Invalid order status.');
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus }
  });
  revalidatePath('/admin');
}

export const dynamic = 'force-dynamic';

async function requireAdminSession() {
  const token = (await cookies()).get(getSessionCookieName())?.value;
  const session = verifySessionToken(token);

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

function formatCurrency(value: number | null | undefined) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function renderOrderCard(order: any) {
  return (
    <article
      key={order.id}
      className="overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white shadow-[0_18px_60px_-30px_rgba(26,26,26,0.35)]"
    >
      <div className="border-b border-stone-200 bg-gradient-to-r from-stone-950 via-stone-900 to-[#4b1821] px-6 py-5 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-2xl font-bold tracking-tight">
                #{order.id.slice(0, 8).toUpperCase()} • {order.customerName}
              </h3>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${STATUS_STYLES[order.status] || 'bg-stone-100 text-stone-700'}`}>
                {order.status.replace('_', ' ')}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-300">
              <span>{order.type === 'DELIVERY' ? 'Delivery' : 'Pickup'}</span>
              <span>{order.customerPhone}</span>
              <span>{new Date(order.createdAt).toLocaleString()}</span>
              {order.pickupTime ? <span>Scheduled {new Date(order.pickupTime).toLocaleString()}</span> : null}
            </div>
          </div>
          <div className="text-left lg:text-right">
            <p className="text-xs uppercase tracking-[0.25em] text-stone-400">Order Total</p>
            <p className="mt-1 text-3xl font-bold text-[#D4AF37]">{formatCurrency(Number(order.total))}</p>
            <p className="mt-2 text-sm text-stone-300">
              Subtotal {formatCurrency(Number(order.subtotal))} • Tax {formatCurrency(Number(order.tax))} • Tip {formatCurrency(Number(order.tip))}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-6 py-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-stone-900">Items</h4>
            <p className="text-sm text-stone-500">
              {order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)} item{order.items.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="space-y-3">
            {order.items.map((item: any) => (
              <div key={item.id} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-stone-900">{item.quantity}x {item.name}</p>
                    {item.note ? <p className="mt-1 text-sm text-[#8a2437]">Note: {item.note}</p> : null}
                  </div>
                  <p className="font-semibold text-stone-700">{formatCurrency(Number(item.price) * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Customer</h4>
            <p className="mt-3 text-lg font-semibold text-stone-900">{order.customerName}</p>
            <p className="mt-1 text-stone-700">{order.customerPhone}</p>
            {order.transactionId ? (
              <p className="mt-3 text-xs text-stone-500">Payment ref: {order.transactionId}</p>
            ) : null}
          </div>

          {order.notes ? (
            <div className="rounded-2xl border border-[#e8d7ab] bg-[#fff6df] p-4">
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8c6820]">Kitchen Notes</h4>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-stone-800">{order.notes}</p>
            </div>
          ) : null}

          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Actions</h4>
            <div className="mt-4 flex flex-wrap gap-2">
              {getNextActions(order.status, order.type).map((action) => (
                <form key={action.status} action={updateStatus.bind(null, order.id, action.status)}>
                  <button className={`${action.className} rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors`}>
                    {action.label}
                  </button>
                </form>
              ))}
              {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' ? (
                <form action={updateStatus.bind(null, order.id, 'CANCELLED')}>
                  <button className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700">
                    Cancel Order
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default async function AdminDashboard({ searchParams }: AdminPageProps) {
  await requireAdminSession();

  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q?.trim() || '';
  const statusFilter = resolvedSearchParams.status?.trim() || 'ALL';
  const typeFilter = resolvedSearchParams.type?.trim() || 'ALL';

  let orders: any[] = [];
  let dbError = false;

  try {
    orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
      take: 75
    });
  } catch (error) {
    console.error('Database error:', error);
    dbError = true;
  }

  const filteredOrders = orders.filter((order) => {
    const matchesQuery = query ? orderMatchesQuery(order, query) : true;
    const matchesStatus = statusFilter !== 'ALL' ? order.status === statusFilter : true;
    const matchesType = typeFilter !== 'ALL' ? order.type === typeFilter : true;
    return matchesQuery && matchesStatus && matchesType;
  });
  const activeOrders = filteredOrders.filter((order) => ACTIVE_STATUSES.includes(order.status));
  const completedOrders = filteredOrders.filter((order) => !ACTIVE_STATUSES.includes(order.status));

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.12),_transparent_22%),linear-gradient(180deg,#f7f1e5_0%,#efe5d0_40%,#f5f5f0_100%)] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white/85 shadow-[0_30px_120px_-45px_rgba(26,26,26,0.45)] backdrop-blur">
          <div className="border-b border-stone-200 bg-[#13100f] px-6 py-8 text-white md:px-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#D4AF37]">OM Operations</p>
                <h1 className="mt-3 text-4xl font-bold tracking-tight">Kitchen Dashboard</h1>
                <p className="mt-3 max-w-2xl text-sm text-stone-300 md:text-base">
                  Live service view for incoming orders, prep status, and pickup or delivery handoff.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <form action="/api/auth/logout" method="post">
                  <button className="rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20">
                    Sign Out
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 md:px-10">
            <AdminDashboardControls
              initialQuery={query}
              initialStatus={statusFilter}
              initialType={typeFilter}
              activeOrderCount={activeOrders.length}
            />

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm">
                <p className="text-sm uppercase tracking-[0.15em] text-stone-500">Active Orders</p>
                <p className="mt-3 text-4xl font-bold text-stone-950">{activeOrders.length}</p>
              </div>
              <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm">
                <p className="text-sm uppercase tracking-[0.15em] text-stone-500">Ready Now</p>
                <p className="mt-3 text-4xl font-bold text-emerald-700">
                  {filteredOrders.filter((order) => order.status === 'READY').length}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm">
                <p className="text-sm uppercase tracking-[0.15em] text-stone-500">Awaiting Payment</p>
                <p className="mt-3 text-4xl font-bold text-yellow-700">
                  {filteredOrders.filter((order) => order.status === 'PENDING_PAYMENT').length}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm">
                <p className="text-sm uppercase tracking-[0.15em] text-stone-500">Visible Gross</p>
                <p className="mt-3 text-4xl font-bold text-stone-950">
                  {formatCurrency(filteredOrders.reduce((sum, order) => sum + Number(order.total), 0))}
                </p>
              </div>
            </div>

            {dbError ? (
              <div className="mt-6 rounded-2xl border border-yellow-300 bg-yellow-50 px-5 py-4 text-yellow-900">
                <strong>Database unavailable.</strong> Orders will appear once the production database is connected.
              </div>
            ) : null}

            <section className="mt-10">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-stone-950">Active Service Board</h2>
                  <p className="text-sm text-stone-500">Paid, in-progress, and ready orders stay at the top.</p>
                </div>
                {(query || statusFilter !== 'ALL' || typeFilter !== 'ALL') ? (
                  <p className="text-sm text-stone-500">
                    Filters:
                    {' '}
                    <span className="font-semibold text-stone-900">
                      {query || 'all orders'}
                      {statusFilter !== 'ALL' ? ` • ${statusFilter.toLowerCase().replace('_', ' ')}` : ''}
                      {typeFilter !== 'ALL' ? ` • ${typeFilter.toLowerCase()}` : ''}
                    </span>
                  </p>
                ) : null}
              </div>

              <div className="space-y-6">
                {activeOrders.map(renderOrderCard)}
                {activeOrders.length === 0 ? (
                  <div className="rounded-[1.75rem] border border-dashed border-stone-300 bg-white/70 px-6 py-14 text-center">
                    <p className="text-xl font-semibold text-stone-800">No active orders right now.</p>
                    <p className="mt-2 text-sm text-stone-500">New paid orders will appear here automatically.</p>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="mt-12">
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-stone-950">Recent History</h2>
                <p className="text-sm text-stone-500">Completed, cancelled, and payment exception orders.</p>
              </div>

              <details className="group overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-left">
                  <div>
                    <p className="text-base font-semibold text-stone-900">Show completed and archived orders</p>
                    <p className="text-sm text-stone-500">{completedOrders.length} order{completedOrders.length === 1 ? '' : 's'} in history</p>
                  </div>
                  <span className="rounded-full border border-stone-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600 transition group-open:rotate-180">
                    Expand
                  </span>
                </summary>

                <div className="grid gap-4 border-t border-stone-200 px-5 py-5">
                  {completedOrders.map((order) => (
                    <article key={order.id} className="rounded-[1.5rem] border border-stone-200 bg-[#fcfaf7] px-5 py-4 shadow-sm">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-stone-900">
                            #{order.id.slice(0, 8).toUpperCase()} • {order.customerName}
                          </p>
                          <p className="mt-1 text-sm text-stone-600">
                            {order.customerPhone} • {order.type === 'DELIVERY' ? 'Delivery' : 'Pickup'} • {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${STATUS_STYLES[order.status] || 'bg-stone-100 text-stone-700'}`}>
                            {order.status.replace('_', ' ')}
                          </span>
                          <span className="text-lg font-semibold text-stone-900">{formatCurrency(Number(order.total))}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                  {completedOrders.length === 0 ? (
                    <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white/70 px-6 py-10 text-center text-stone-500">
                      No recent completed or cancelled orders.
                    </div>
                  ) : null}
                </div>
              </details>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
