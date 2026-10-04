// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, ShoppingBag } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCartId } from '@/app/actions/shop';
import CheckoutForm from '@/components/customer/CheckoutForm';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Checkout | Pehnawa',
};

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const cartId = await getCartId();
  const { data: cartItems, error } = await supabase
    .from('cart_items')
    .select(`
      id, quantity, size, color,
      products (
        id, name, brand, price, stock_quantity, status,
        businesses ( name ),
        product_images (url)
      )
    `)
    .eq('cart_id', cartId);

  if (error || !cartItems || cartItems.length === 0) {
    redirect('/customer/cart');
  }

  // Filter valid items
  const validItems = cartItems.filter(item => item.products && item.products.status === 'published');
  if (validItems.length === 0) redirect('/customer/cart');

  let subtotal = 0;
  validItems.forEach(item => {
    subtotal += (item.products.price * Math.min(item.quantity, item.products.stock_quantity));
  });

  const shipping = subtotal > 5000 ? 0 : 99;
  const total = subtotal + shipping;

  return (
    <div className="flex flex-col space-y-8 pb-24 max-w-6xl mx-auto">
      
      {/* Header */}
      <div>
        <Link href="/customer/cart" className="inline-flex items-center text-sm font-medium text-pehnawa-charcoal/60 hover:text-pehnawa-forest-green transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Return to Cart
        </Link>
        <h2 className="text-3xl font-serif text-pehnawa-charcoal mb-2">Checkout</h2>
        <p className="text-sm text-pehnawa-charcoal/60">
          Complete your sustainable purchase.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left: Form */}
        <div className="w-full lg:w-2/3">
          <CheckoutForm />
        </div>

        {/* Right: Order Summary */}
        <div className="w-full lg:w-1/3 bg-pehnawa-warm-ivory border border-pehnawa-cream rounded-2xl p-6 lg:p-8 shadow-sm sticky top-24">
          <h3 className="text-xl font-serif text-pehnawa-charcoal mb-6 border-b border-pehnawa-cream pb-4">Order Summary</h3>
          
          {/* Item Mini List */}
          <div className="space-y-4 mb-6 max-h-60 overflow-y-auto hide-scrollbar">
            {validItems.map(item => {
              const image = item.products.product_images?.[0]?.url;
              return (
                <div key={item.id} className="flex space-x-3 items-center">
                  <div className="relative w-12 h-16 bg-white rounded border border-pehnawa-cream overflow-hidden">
                    {image ? (
                      <img src={image} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-4 h-4 m-auto text-gray-300 mt-5" />
                    )}
                    <span className="absolute -top-2 -right-2 bg-pehnawa-charcoal text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full z-10 border border-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-pehnawa-charcoal line-clamp-1">{item.products.name}</p>
                    <p className="text-xs text-pehnawa-charcoal/60">{item.products.businesses?.name}</p>
                  </div>
                  <div className="text-sm font-semibold text-pehnawa-charcoal">
                    ₹{item.products.price * item.quantity}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-4 text-sm text-pehnawa-charcoal/70 pt-4 border-t border-pehnawa-cream">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-pehnawa-charcoal">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              {shipping === 0 ? (
                <span className="font-medium text-pehnawa-forest-green">Free</span>
              ) : (
                <span className="font-medium text-pehnawa-charcoal">₹{shipping.toFixed(2)}</span>
              )}
            </div>
          </div>

          <hr className="border-pehnawa-cream my-6" />

          <div className="flex justify-between items-end mb-4">
            <span className="text-base font-medium text-pehnawa-charcoal">Total</span>
            <span className="text-2xl font-serif text-pehnawa-forest-green">₹{total.toFixed(2)}</span>
          </div>

          <div className="flex items-center space-x-2 text-xs text-pehnawa-charcoal/60 bg-white p-3 rounded-lg border border-pehnawa-cream">
            <ShieldCheck className="w-8 h-8 text-pehnawa-forest-green" />
            <span>Payments are securely processed. This is a simulated checkout environment.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
