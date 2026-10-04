// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getWishlistId } from '@/app/actions/shop';
import WishlistToCartButton from '@/components/customer/WishlistToCartButton';
import WishlistRemoveButton from '@/components/customer/WishlistRemoveButton';

export const metadata = {
  title: 'Wishlist | Pehnawa',
};

export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
  const supabase = await createClient();
  let items = [];
  let errorMsg = null;

  try {
    const wishlistId = await getWishlistId();
    
    const { data, error } = await supabase
      .from('wishlist_items')
      .select(`
        id,
        created_at,
        product_id,
        products (
          id, name, brand, price, original_price, condition, stock_quantity, status,
          product_images (url)
        )
      `)
      .eq('wishlist_id', wishlistId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Filter out items where the product is no longer published or was deleted
    items = (data || []).filter(item => item.products && item.products.status === 'published');
    
  } catch (err: any) {
    if (err.message === 'Not authenticated') {
      errorMsg = 'Please log in to view your wishlist.';
    } else {
      errorMsg = 'Failed to load wishlist items.';
    }
  }

  return (
    <div className="flex flex-col space-y-8 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-serif text-pehnawa-charcoal mb-2">My Wishlist</h2>
        <p className="text-sm text-pehnawa-charcoal/60">
          Save your favorite pre-loved items for later.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-md text-red-600 text-sm">
          {errorMsg}
        </div>
      )}

      {items.length === 0 && !errorMsg ? (
        <div className="w-full bg-pehnawa-cream/40 border border-pehnawa-cream rounded-2xl p-16 flex flex-col items-center justify-center text-center">
          <Heart className="w-12 h-12 text-pehnawa-charcoal/20 mb-4" />
          <h3 className="text-xl font-serif text-pehnawa-charcoal mb-2">Your wishlist is empty</h3>
          <p className="text-sm text-pehnawa-charcoal/60 max-w-md mb-8">
            You haven't saved any items yet. Discover sustainable fashion and add your favorites here.
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((item) => {
            const product = item.products;
            const image = product.product_images && product.product_images[0] ? product.product_images[0].url : null;
            const isOutOfStock = product.stock_quantity === 0;

            let discountStr = '';
            if (product.original_price && product.price < product.original_price) {
              const diff = product.original_price - product.price;
              const percent = Math.round((diff / product.original_price) * 100);
              discountStr = `${percent}% OFF`;
            }

            return (
              <div key={item.id} className="flex flex-col group relative bg-white border border-pehnawa-cream rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                
                <div className="relative aspect-[3/4] mb-3 bg-pehnawa-cream rounded-lg overflow-hidden flex items-center justify-center">
                  <Link href={`/customer/shop/${product.id}`} className="absolute inset-0 z-0">
                    {image ? (
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url('${image}')` }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <ShoppingBag className="w-8 h-8 text-pehnawa-charcoal/20" />
                      </div>
                    )}
                  </Link>

                  <div className="absolute top-2 right-2 z-10">
                    <WishlistRemoveButton productId={product.id} />
                  </div>
                  
                  {discountStr && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-pehnawa-burgundy rounded uppercase tracking-wider z-10 pointer-events-none">
                      {discountStr}
                    </div>
                  )}

                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10 pointer-events-none">
                      <span className="px-4 py-2 bg-pehnawa-charcoal text-white text-xs font-bold uppercase tracking-widest rounded">Sold Out</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col mb-4">
                  <span className="text-[10px] sm:text-xs text-pehnawa-charcoal/60 uppercase tracking-wider mb-1 line-clamp-1">{product.brand || 'Unbranded'}</span>
                  <Link href={`/customer/shop/${product.id}`} className="hover:text-pehnawa-forest-green transition-colors">
                    <h4 className="text-sm font-medium text-pehnawa-charcoal mb-1 line-clamp-1">{product.name}</h4>
                  </Link>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-pehnawa-forest-green">₹{product.price}</span>
                    {product.original_price && (
                      <span className="text-xs text-pehnawa-charcoal/40 line-through">₹{product.original_price}</span>
                    )}
                  </div>
                </div>

                <div className="mt-auto">
                  <WishlistToCartButton productId={product.id} disabled={isOutOfStock} />
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
