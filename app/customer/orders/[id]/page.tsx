// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, MapPin, Package, CreditCard } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';

export const metadata = {
  title: 'Order Details | Pehnawa',
};

export const dynamic = 'force-dynamic';

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      businesses ( name, email ),
      addresses ( address_line1, address_line2, city, state, postal_code, country ),
      order_items (
        id, quantity, price_at_time, size, color,
        products ( id, name, brand, product_images(url) )
      )
    `)
    .eq('id', params.id)
    .single();

  if (error || !order || order.customer_id !== user.id) {
    notFound();
  }

  // Calculate Subtotal (since shipping was merged into total in checkout process for simplicity)
  let subtotal = 0;
  order.order_items.forEach(item => {
    subtotal += (item.price_at_time * item.quantity);
  });
  const shipping = order.total_amount - subtotal;

  return (
    <div className="flex flex-col space-y-8 pb-24 max-w-4xl mx-auto">
      
      <div>
        <Link href="/customer/orders" className="inline-flex items-center text-sm font-medium text-pehnawa-charcoal/60 hover:text-pehnawa-forest-green transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Link>
        <div className="flex items-center space-x-3 text-pehnawa-forest-green mb-2">
          <CheckCircle2 className="w-8 h-8" />
          <h2 className="text-3xl font-serif">Order Confirmed</h2>
        </div>
        <p className="text-sm text-pehnawa-charcoal/60">
          Thank you for shopping sustainably. Your order has been placed successfully.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left: Items */}
        <div className="space-y-6">
          <div className="bg-white border border-pehnawa-cream rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-serif text-pehnawa-charcoal mb-4">Items Ordered</h3>
            <p className="text-sm text-pehnawa-charcoal/60 mb-6">Seller: <span className="font-medium text-pehnawa-charcoal">{order.businesses?.name}</span></p>
            
            <div className="space-y-6">
              {order.order_items.map((item) => {
                const image = item.products?.product_images?.[0]?.url;
                return (
                  <div key={item.id} className="flex space-x-4">
                    <div className="relative w-20 h-28 bg-pehnawa-cream rounded-lg overflow-hidden border border-pehnawa-cream flex-shrink-0">
                      {image ? (
                        <img src={image} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 m-auto text-gray-300 mt-10" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <span className="text-[10px] sm:text-xs text-pehnawa-charcoal/60 uppercase tracking-wider mb-1">{item.products?.brand || 'Unbranded'}</span>
                      <h4 className="text-sm font-medium text-pehnawa-charcoal mb-1">{item.products?.name}</h4>
                      <div className="flex gap-3 text-xs text-pehnawa-charcoal/60 mb-2">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                        <span>Qty: {item.quantity}</span>
                      </div>
                      <span className="text-sm font-semibold text-pehnawa-forest-green mt-auto">₹{(item.price_at_time * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Order Summary & Info */}
        <div className="space-y-6">
          
          <div className="bg-pehnawa-warm-ivory border border-pehnawa-cream rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-serif text-pehnawa-charcoal mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm text-pehnawa-charcoal/70">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-pehnawa-charcoal">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium text-pehnawa-charcoal">₹{shipping.toFixed(2)}</span>
              </div>
              <hr className="border-pehnawa-cream my-2" />
              <div className="flex justify-between items-end">
                <span className="text-base font-medium text-pehnawa-charcoal">Total</span>
                <span className="text-xl font-serif text-pehnawa-forest-green">₹{order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-pehnawa-cream rounded-2xl p-6 shadow-sm">
            <div className="flex items-center space-x-2 text-pehnawa-charcoal mb-4">
              <MapPin className="w-5 h-5 text-pehnawa-forest-green" />
              <h3 className="text-lg font-serif">Shipping Address</h3>
            </div>
            {order.addresses ? (
              <address className="not-italic text-sm text-pehnawa-charcoal/70 space-y-1">
                <p>{order.addresses.address_line1}</p>
                {order.addresses.address_line2 && <p>{order.addresses.address_line2}</p>}
                <p>{order.addresses.city}, {order.addresses.state} {order.addresses.postal_code}</p>
                <p>{order.addresses.country}</p>
              </address>
            ) : (
              <p className="text-sm text-pehnawa-charcoal/50">No shipping address provided.</p>
            )}
          </div>

          <div className="bg-white border border-pehnawa-cream rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-2 text-pehnawa-charcoal">
              <CreditCard className="w-5 h-5 text-pehnawa-forest-green" />
              <h3 className="text-lg font-serif">Payment Status</h3>
            </div>
            <span className="px-3 py-1 rounded-full border border-green-200 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider">
              {order.payment_status}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
