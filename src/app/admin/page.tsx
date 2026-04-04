import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminDashboardControls } from "./AdminDashboardControls";

export const metadata: Metadata = {
  title: 'Kitchen Dashboard — OM Indian Restaurant',
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
  COMPLETED: 'bg-stone-200 text-stone-700 ring-1 ring-stone-300',
  CANCELLED: 'bg-rose-100 text-rose-800 ring-1 ring-rose-200',
};

const STATUS_LABELS: Record<string, string> = {
  PAID: 'Paid',
  IN_PROGRESS: 'In Progress',
  READY: 'Ready',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
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

  if (!normalizedQuery) return true;
  if (normalizedValue.includes(normalizedQuery)) return true;

  let queryIndex = 0;
  for (const character of normalizedValue) {
    if (character === normalizedQuery[queryIndex]) {
      queryIndex += 1;
      if (queryIndex === normalizedQuery.length) return true;
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
        label: orderType === 'DELIVERY' ? 'Out for Delivery' : 'Mark Ready',
        status: 'READY',
        className: 'bg-emerald-600 hover:bg-emerald-700',
      }];
    case 'READY':
      return [{ label: 'Mark Completed', status: 'COMPLETED', className: 'bg-stone-800 hover:bg-stone-950' }];
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
  if (!session) redirect("/admin/login");
  return session;
}

function formatCurrency(value: number | null | undefined) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatTime(dateString: string | Date) {
  return new Date(dateString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatDate(dateString: string | Date) {
  return new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function renderOrderCard(order: any) {
  const nextActions = getNextActions(order.status, order.type);
  const totalItems = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);

  return (
    <article
      key={order.id}
      className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-4 border-b border-stone-100 bg-[#1A1A1A] px-5 py-4 text-white">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-xs text-stone-400">#{order.id.slice(0, 8).toUpperCase()}</span>
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[order.status] || 'bg-stone-100 text-stone-700'}`}>
              {STATUS_LABELS[order.status] ?? order.status.replace('_', ' ')}
            </span>
          </div>
          <h3 className="mt-1.5 text-xl font-bold tracking-tight">{order.customerName}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-400">
            <span>{order.type === 'DELIVERY' ? '🛵 Delivery' : '🛍 Pickup'}</span>
            <span>{order.customerPhone}</span>
            <span>{formatDate(order.createdAt)} at {formatTime(order.createdAt)}</span>
            {order.pickupTime ? (
              <span className="text-[#D4AF37]">Scheduled {formatTime(order.pickupTime)}</span>
            ) : null}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-bold text-[#D4AF37]">{formatCurrency(Number(order.total))}</p>
          <p className="mt-0.5 text-xs text-stone-500">
            {totalItems} item{totalItems !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Card Body */}
      <div className="px-5 py-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
          {/* Items */}
          <div className="space-y-2">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-start justify-between gap-4 rounded-xl bg-stone-50 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-semibold text-stone-900">
                    <span className="mr-2 text-[#C41E3A]">{item.quantity}×</span>
                    {item.name}
                  </p>
                  {item.note ? (
                    <p className="mt-0.5 text-sm text-amber-700">
                      <span className="font-medium">Note:</span> {item.note}
                    </p>
                  ) : null}
                </div>
                <p className="shrink-0 text-sm font-semibold text-stone-600">
                  {formatCurrency(Number(item.price) * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Right side: notes + actions */}
          <div className="flex flex-col gap-3 lg:w-64">
            {order.notes ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Kitchen Notes</p>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-stone-800">{order.notes}</p>
              </div>
            ) : null}

            {order.transactionId ? (
              <p className="text-xs text-stone-400">
                Payment ref: <span className="font-mono">{order.transactionId.slice(0, 16)}…</span>
              </p>
            ) : null}

            {/* Pricing breakdown */}
            <div className="rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(Number(order.subtotal))}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(Number(order.tax))}</span></div>
              {Number(order.tip) > 0 ? (
                <div className="flex justify-between"><span>Tip</span><span>{formatCurrency(Number(order.tip))}</span></div>
              ) : null}
              <div className="mt-1.5 flex justify-between border-t border-stone-200 pt-1.5 font-semibold text-stone-900">
                <span>Total</span><span>{formatCurrency(Number(order.total))}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {nextActions.map((action) => (
                <form key={action.status} action={updateStatus.bind(null, order.id, action.status)}>
                  <button
                    className={`${action.className} rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors`}
                  >
                    {action.label}
                  </button>
                </form>
              ))}
              {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' ? (
                <form action={updateStatus.bind(null, order.id, 'CANCELLED')}>
                  <button className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700">
                    Cancel
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
  const inKitchenCount = filteredOrders.filter((order) => order.status === 'IN_PROGRESS').length;
  const readyCount = filteredOrders.filter((order) => order.status === 'READY').length;

  return (
    <div className="min-h-screen bg-stone-100 px-4 py-0">
      {/* Page Header */}
      <div className="border-b border-stone-800 bg-[#1A1A1A] px-6 py-6 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">OM Operations</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">Kitchen Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <form action="/api/auth/logout" method="post">
              <button className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-0 pb-12 md:px-4">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-px border-b border-stone-200 bg-stone-200 md:grid-cols-4">
          <div className="bg-white px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Active Orders</p>
            <p className="mt-2 text-4xl font-bold text-stone-950">{activeOrders.length}</p>
          </div>
          <div className="bg-white px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">In Kitchen</p>
            <p className="mt-2 text-4xl font-bold text-amber-600">{inKitchenCount}</p>
          </div>
          <div className="bg-white px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Ready Now</p>
            <p className="mt-2 text-4xl font-bold text-emerald-600">{readyCount}</p>
          </div>
          <div className="bg-white px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Revenue Shown</p>
            <p className="mt-2 text-4xl font-bold text-stone-950">
              {formatCurrency(filteredOrders.reduce((sum, order) => sum + Number(order.total), 0))}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="border-b border-stone-200 bg-white px-6 py-4 md:px-10">
          <AdminDashboardControls
            initialQuery={query}
            initialStatus={statusFilter}
            initialType={typeFilter}
            activeOrderCount={activeOrders.length}
          />
        </div>

        <div className="px-4 py-8 md:px-10">
          {dbError ? (
            <div className="mb-6 rounded-xl border border-yellow-300 bg-yellow-50 px-5 py-4 text-yellow-900">
              <strong>Database unavailable.</strong> Orders will appear once the production database is connected.
            </div>
          ) : null}

          {/* Active Orders */}
          <section>
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <h2 className="text-xl font-bold text-stone-950">
                Active Orders
                {activeOrders.length > 0 ? (
                  <span className="ml-2 rounded-full bg-[#C41E3A] px-2 py-0.5 text-sm font-semibold text-white">
                    {activeOrders.length}
                  </span>
                ) : null}
              </h2>
              {(query || statusFilter !== 'ALL' || typeFilter !== 'ALL') ? (
                <p className="text-sm text-stone-500">
                  Filtered by{' '}
                  <span className="font-semibold text-stone-700">
                    {[query, statusFilter !== 'ALL' && statusFilter, typeFilter !== 'ALL' && typeFilter].filter(Boolean).join(' · ')}
                  </span>
                </p>
              ) : null}
            </div>

            <div className="space-y-4">
              {activeOrders.map(renderOrderCard)}
              {activeOrders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-2xl">
                    🍽
                  </div>
                  <p className="font-semibold text-stone-700">No active orders right now</p>
                  <p className="mt-1 text-sm text-stone-400">New paid orders will appear here automatically.</p>
                </div>
              ) : null}
            </div>
          </section>

          {/* History */}
          <section className="mt-10">
            <h2 className="mb-4 text-xl font-bold text-stone-950">Order History</h2>

            <details className="group overflow-hidden rounded-2xl border border-stone-200 bg-white">
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 hover:bg-stone-50">
                <div>
                  <p className="font-semibold text-stone-800">Completed &amp; Cancelled Orders</p>
                  <p className="text-sm text-stone-500">{completedOrders.length} order{completedOrders.length !== 1 ? 's' : ''}</p>
                </div>
                <span className="text-sm font-semibold text-stone-500 transition-transform group-open:rotate-180">▾</span>
              </summary>

              <div className="space-y-2 border-t border-stone-100 px-5 py-4">
                {completedOrders.map((order) => (
                  <div key={order.id} className="flex flex-col gap-2 rounded-xl bg-stone-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-stone-800">
                        {order.customerName}
                        <span className="ml-2 font-mono text-xs text-stone-400">#{order.id.slice(0, 8).toUpperCase()}</span>
                      </p>
                      <p className="text-sm text-stone-500">
                        {order.customerPhone} · {order.type === 'DELIVERY' ? 'Delivery' : 'Pickup'} · {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[order.status] || 'bg-stone-100 text-stone-700'}`}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                      <span className="font-semibold text-stone-800">{formatCurrency(Number(order.total))}</span>
                    </div>
                  </div>
                ))}
                {completedOrders.length === 0 ? (
                  <p className="py-6 text-center text-sm text-stone-400">No completed or cancelled orders.</p>
                ) : null}
              </div>
            </details>
          </section>
        </div>
      </div>
    </div>
  );
}
