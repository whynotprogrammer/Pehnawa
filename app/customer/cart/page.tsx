// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCartId } from '@/app/actions/shop';
import CartItemControls from '@/components/customer/CartItemControls';

export const metadata = {
  title: 'Shopping Cart | Pehnawa',
};

export const dynamic = 'force-dynamic';

export default async function CartPage() {
  const supabase = await createClient();
  let cartItems = [];
  let errorMsg = null;
  let subtotal = 0;

  try {
    const cartId = await getCartId();
    
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        size,
        color,
        product_id,
        products (
          id, name, brand, price, stock_quantity, status,
          businesses ( name ),
          product_images (url)
        )
      `)
      .eq('cart_id', cartId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    // Filter out items where the product is no longer published or was deleted
    // And calculate subtotal
    cartItems = (data || []).filter(item => {
      if (item.products && item.products.status === 'published') {
        // Adjust quantity if it exceeds current stock
        const effectiveQuantity = Math.min(item.quantity, item.products.stock_quantity);
        subtotal += (item.products.price * effectiveQuantity);
        return true;
      }
      return false;
    });
    
  } catch (err: any) {
    if (err.message === 'Not authenticated') {
      errorMsg = 'Please log in to view your cart.';
    } else {
      errorMsg = 'Failed to load cart items.';
    }
  }

  const shipping = subtotal > 0 ? (subtotal > 5000 ? 0 : 99) : 0;
  const total = subtotal + shipping;

  return (
    <div className="flex flex-col space-y-8 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-serif text-pehnawa-charcoal mb-2">Shopping Cart</h2>
        <p className="text-sm text-pehnawa-charcoal/60">
          Review your items before checkout.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-md text-red-600 text-sm">
          {errorMsg}
        </div>
      )}

      {cartItems.length === 0 && !errorMsg ? (
        <div className="w-full bg-pehnawa-cream/40 border border-pehnawa-cream rounded-2xl p-16 flex flex-col items-center justify-center text-center">
          <ShoppingBag className="w-12 h-12 text-pehnawa-charcoal/20 mb-4" />
          <h3 className="text-xl font-serif text-pehnawa-charcoal mb-2">Your cart is empty</h3>
          <p className="text-sm text-pehnawa-charcoal/60 max-w-md mb-8">
            Looks like you haven't added anything to your cart yet. Let's change that!
          </p>
          <Link 
            href="/customer/shop" 
            className="inline-flex items-center space-x-2 bg-pehnawa-forest-green hover:bg-pehnawa-dark-green text-white px-8 py-3.5 rounded-full text-sm font-medium transition-colors"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left: Cart Items */}
          <div className="w-full lg:w-2/3 space-y-4">
            {cartItems.map((item) => {
              const product = item.products;
              const image = product.product_images && product.product_images[0] ? product.product_images[0].url : null;
              const isOutOfStock = product.stock_quantity === 0;
              const effectiveQuantity = Math.min(item.quantity, product.stock_quantity);

              return (
                <div key={item.id} className="bg-white border border-pehnawa-cream rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row gap-6 shadow-sm relative">
                  
                  {/* Image */}
                  <div className="relative w-24 h-32 md:w-32 md:h-40 flex-shrink-0 bg-pehnawa-cream rounded-lg overflow-hidden flex items-center justify-center">
                    <Link href={`/customer/shop/${product.id}`} className="absolute inset-0">
                      {image ? (
                        <img src={image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-pehnawa-charcoal/20" />
                      )}
                    </Link>
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10 pointer-events-none">
                        <span className="px-2 py-1 bg-pehnawa-charcoal text-white text-[10px] font-bold uppercase tracking-widest rounded">Sold Out</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs text-pehnawa-charcoal/60 uppercase tracking-wider mb-1 block">
                          {product.brand || 'Unbranded'} · {product.businesses?.name || 'Partner'}
                        </span>
                        <Link href={`/customer/shop/${product.id}`} className="hover:text-pehnawa-forest-green transition-colors">
                          <h4 className="text-base md:text-lg font-medium text-pehnawa-charcoal mb-1 line-clamp-2">
                            {product.name}
                          </h4>
                        </Link>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-pehnawa-charcoal/70">
                          {item.size && <span>Size: <span className="font-medium text-pehnawa-charcoal">{item.size}</span></span>}
                          {item.color && <span>Color: <span className="font-medium text-pehnawa-charcoal">{item.color}</span></span>}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <span className="text-lg font-semibold text-pehnawa-forest-green block">₹{product.price}</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 flex items-center justify-between">
                      {/* Quantity Controls */}
                      <CartItemControls 
                        itemId={item.id} 
                        quantity={effectiveQuantity} 
                        stock={product.stock_quantity} 
                        isOutOfStock={isOutOfStock} 
                      />
                      
                      <div className="text-right">
                        <span className="text-xs text-pehnawa-charcoal/50 block mb-1">Subtotal</span>
                        <span className="text-base font-medium text-pehnawa-charcoal">₹{(product.price * effectiveQuantity).toFixed(2)}</span>
                      </div>
                    </div>

                    {!isOutOfStock && item.quantity > product.stock_quantity && (
                      <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded">
                        Quantity adjusted. Only {product.stock_quantity} left in stock.
                      </p>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-1/3 bg-pehnawa-warm-ivory border border-pehnawa-cream rounded-2xl p-6 lg:p-8 shadow-sm sticky top-24">
            <h3 className="text-xl font-serif text-pehnawa-charcoal mb-6 border-b border-pehnawa-cream pb-4">Order Summary</h3>
            
            <div className="space-y-4 text-sm text-pehnawa-charcoal/70">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.length} items)</span>
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
              {shipping > 0 && (
                <div className="text-xs text-pehnawa-charcoal/50">
                  Free shipping on orders over ₹5,000.
                </div>
              )}
            </div>

            <hr className="border-pehnawa-cream my-6" />

            <div className="flex justify-between items-end mb-8">
              <span className="text-base font-medium text-pehnawa-charcoal">Total</span>
              <span className="text-2xl font-serif text-pehnawa-forest-green">₹{total.toFixed(2)}</span>
            </div>

            <button 
              className="w-full flex items-center justify-center space-x-2 bg-pehnawa-forest-green hover:bg-pehnawa-dark-green text-white py-4 rounded-xl font-medium transition-colors mb-4 shadow-md"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center space-x-2 text-xs text-pehnawa-charcoal/60 mt-4">
              <ShieldCheck className="w-4 h-4" />
              <span>Secure checkout. Sustainable packaging.</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
