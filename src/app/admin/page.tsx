import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Simple Server Action for Status Update
async function updateStatus(orderId: string, newStatus: string) {
  "use server";
  await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus }
  });
  revalidatePath('/admin');
}

// Force dynamic rendering to avoid build-time database access
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  let orders: any[] = [];
  let dbError = false;
  
  try {
    orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
      take: 50
    });
  } catch (error) {
    console.error('Database error:', error);
    dbError = true;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Kitchen Dashboard</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Refresh
          </button>
        </div>

        {dbError && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            <strong>Note:</strong> Database connection unavailable. Orders will appear once database is configured.
          </div>
        )}

        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
              <div className="flex flex-col md:flex-row justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    #{order.id.slice(0, 8)} - {order.customerName}
                  </h2>
                  <p className="text-gray-600">{order.customerPhone}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right mt-4 md:mt-0">
                  <div className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold mb-2">
                    {order.status}
                  </div>
                  <p className="font-bold text-lg">${Number(order.total).toFixed(2)}</p>
                </div>
              </div>

              {order.notes && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mb-4">
                  <span className="font-bold text-yellow-800">Order Note:</span> {order.notes}
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Items:</h3>
                <ul className="space-y-2">
                  {order.items.map((item: { id: string; quantity: number; name: string; note: string | null }) => (
                    <li key={item.id} className="flex justify-between items-start">
                      <div>
                        <span className="font-bold">{item.quantity}x</span> {item.name}
                        {item.note && (
                          <p className="text-red-600 text-sm font-medium ml-6">Note: {item.note}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex gap-2 justify-end">
                 <form action={updateStatus.bind(null, order.id, 'COMPLETED')}>
                    <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium">
                      Mark Completed
                    </button>
                 </form>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-center text-gray-500 text-lg">No orders found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

