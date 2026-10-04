// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Ruler, Truck, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import AddToCartForm from '@/components/customer/AddToCartForm';
import WishlistButton from '@/components/customer/WishlistButton';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: product } = await supabase.from('products').select('name').eq('id', params.id).single();
  return {
    title: product ? `${product.name} | Pehnawa` : 'Product Not Found',
  };
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      businesses ( name ),
      product_images ( url, display_order )
    `)
    .eq('id', params.id)
    .eq('status', 'published')
    .single();

  if (error || !product) {
    notFound();
  }

  // Sort images
  if (product.product_images) {
    product.product_images.sort((a, b) => a.display_order - b.display_order);
  }

  const images = product.product_images || [];
  const mainImage = images.length > 0 ? images[0].url : null;
  
  const discountStr = (product.original_price && product.price < product.original_price) 
    ? `${Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF` 
    : '';

  return (
    <div className="flex flex-col space-y-6 pb-24">
      {/* Back navigation */}
      <div>
        <Link href="/customer/shop" className="inline-flex items-center text-sm font-medium text-pehnawa-charcoal/60 hover:text-pehnawa-forest-green transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shop
        </Link>
      </div>

      <div className="bg-pehnawa-warm-ivory border border-pehnawa-cream rounded-3xl overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left: Images */}
        <div className="w-full lg:w-1/2 p-6 md:p-10 flex flex-col space-y-4 border-b lg:border-b-0 lg:border-r border-pehnawa-cream">
          <div className="relative aspect-[3/4] md:aspect-square w-full rounded-2xl overflow-hidden bg-white">
            {mainImage ? (
              <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                No Image
              </div>
            )}
            
            {/* Absolute Badges */}
            <div className="absolute top-4 right-4">
              <WishlistButton productId={product.id} />
            </div>
            
            {discountStr && (
              <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-xs font-bold text-pehnawa-burgundy rounded uppercase tracking-wider">
                {discountStr}
              </div>
            )}
          </div>
          
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.slice(1, 5).map((img, idx) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-pehnawa-cream bg-white cursor-pointer hover:border-pehnawa-forest-green transition-colors">
                  <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="w-full lg:w-1/2 p-6 md:p-10 flex flex-col">
          
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-pehnawa-charcoal/50">
                {product.brand || 'Unbranded'}
              </span>
              <span className="text-xs font-medium text-pehnawa-forest-green bg-pehnawa-forest-green/10 px-2 py-1 rounded">
                Condition: {product.condition.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-pehnawa-charcoal mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-end space-x-3 mb-6">
              <span className="text-3xl font-medium text-pehnawa-charcoal">₹{product.price}</span>
              {product.original_price && (
                <span className="text-lg text-pehnawa-charcoal/40 line-through mb-1">₹{product.original_price}</span>
              )}
            </div>

            <p className="text-pehnawa-charcoal/70 leading-relaxed text-sm md:text-base">
              {product.description || 'No description provided for this item.'}
            </p>
          </div>

          <hr className="border-pehnawa-cream mb-8" />

          {/* Form for Cart */}
          <AddToCartForm product={product} />

          <hr className="border-pehnawa-cream my-8" />

          {/* Trust indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-pehnawa-forest-green/10 text-pehnawa-forest-green rounded-full">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-pehnawa-charcoal">Carbon Neutral Delivery</h4>
                <p className="text-xs text-pehnawa-charcoal/60 mt-0.5">Eco-friendly packaging for every order.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-pehnawa-forest-green/10 text-pehnawa-forest-green rounded-full">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-pehnawa-charcoal">Quality Assured</h4>
                <p className="text-xs text-pehnawa-charcoal/60 mt-0.5">Verified by {product.businesses?.name || 'our partners'}.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
