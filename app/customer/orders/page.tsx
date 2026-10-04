// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import { Package, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'My Orders | Pehnawa',
};

export const dynamic = 'force-dynamic';

export default async function MyOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id, created_at, total_amount, status, payment_status,
      businesses ( name ),
      order_items (
        id, quantity, price_at_time,
        products ( name, product_images(url) )
      )
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) console.error(error);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'delivered': return 'text-green-600 bg-green-50 border-green-200';
      case 'shipped': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-amber-600 bg-amber-50 border-amber-200'; // pending, processing
    }
  };

  return (
    <div className="flex flex-col space-y-8 pb-24">
      <div>
        <h2 className="text-3xl font-serif text-pehnawa-charcoal mb-2">My Orders</h2>
        <p className="text-sm text-pehnawa-charcoal/60">
          Track and view your sustainable fashion purchases.
        </p>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="w-full bg-pehnawa-cream/40 border border-pehnawa-cream rounded-2xl p-16 flex flex-col items-center justify-center text-center">
          <Package className="w-12 h-12 text-pehnawa-charcoal/20 mb-4" />
          <h3 className="text-xl font-serif text-pehnawa-charcoal mb-2">No orders yet</h3>
          <p className="text-sm text-pehnawa-charcoal/60 max-w-md mb-8">
            You haven't placed any orders. Start exploring our thrift stores and give pre-loved fashion a new life.
          </p>
          <Link 
            href="/customer/shop" 
            className="inline-flex items-center space-x-2 bg-pehnawa-forest-green hover:bg-pehnawa-dark-green text-white px-8 py-3.5 rounded-full text-sm font-medium transition-colors"
          >
            <span>Explore Store</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-pehnawa-cream rounded-2xl p-6 shadow-sm">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-pehnawa-cream pb-4 mb-4 gap-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <div>
                    <span className="text-xs text-pehnawa-charcoal/50 uppercase tracking-wider block">Order Placed</span>
                    <span className="text-sm font-medium text-pehnawa-charcoal">
                      {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-pehnawa-charcoal/50 uppercase tracking-wider block">Total</span>
                    <span className="text-sm font-medium text-pehnawa-charcoal">₹{order.total_amount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-pehnawa-charcoal/50 uppercase tracking-wider block">Order #</span>
                    <span className="text-sm font-medium text-pehnawa-charcoal">...{order.id.split('-')[0]}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Link href={`/customer/orders/${order.id}`} className="text-sm font-medium text-pehnawa-forest-green hover:underline">
                    View Order Details
                  </Link>
                  <div className="hidden md:block w-px h-4 bg-pehnawa-cream" />
                  <span className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <span className="text-sm font-medium text-pehnawa-charcoal">
                  Seller: {order.businesses?.name}
                </span>
                
                <div className="flex flex-wrap gap-4">
                  {order.order_items.map((item, idx) => {
                    const image = item.products?.product_images?.[0]?.url;
                    return (
                      <Link href={`/customer/orders/${order.id}`} key={idx} className="relative w-20 h-24 bg-pehnawa-cream rounded-lg overflow-hidden border border-pehnawa-cream group block">
                        {image ? (
                          <img src={image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <Package className="w-6 h-6 m-auto text-gray-300 mt-8" />
                        )}
                        <span className="absolute bottom-1 right-1 bg-white/90 text-pehnawa-charcoal text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                          x{item.quantity}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
