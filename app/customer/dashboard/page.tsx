// @ts-nocheck
import React from 'react';
import Image from 'next/image';
import { ArrowRight, Heart, ShoppingBag } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Dashboard | Pehnawa',
};

// Next.js dynamic routing to ensure we fetch fresh products
export const dynamic = 'force-dynamic';

const FEATURE_CARDS = [
  {
    title: 'Women',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
    isAiStylist: false,
  },
  {
    title: 'Men',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1000&auto=format&fit=crop',
    isAiStylist: false,
  },
  {
    title: 'New In',
    image: 'https://images.unsplash.com/photo-1520006403909-838d6b92c22e?q=80&w=1000&auto=format&fit=crop',
    isAiStylist: false,
  },
  {
    title: 'AI Stylist',
    subtitle: 'Get personalized\noutfit suggestions',
    isAiStylist: true,
  },
];

export default async function CustomerDashboard() {
  const supabase = await createClient();
  
  // Fetch real published products
  const { data: newArrivals, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images (url)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="flex flex-col space-y-12 pb-20">
      
      {/* 1. HERO BANNER */}
      <section className="relative w-full rounded-2xl overflow-hidden h-[400px] md:h-[480px] bg-pehnawa-cream flex items-center group">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-pehnawa-charcoal/60 to-transparent" />
        
        <div className="relative z-10 p-8 md:p-16 max-w-2xl text-white">
          <p className="text-xs md:text-sm font-medium tracking-[0.2em] uppercase mb-4 text-pehnawa-warm-ivory/90">
            Sustainable Fashion, Real Impact
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.1] mb-6 text-pehnawa-warm-ivory">
            Timeless styles.<br />
            A kinder planet.
          </h2>
          <p className="text-base md:text-lg text-pehnawa-warm-ivory/90 font-light mb-8 max-w-md">
            Pre-loved fashion, curated for you.<br />
            Shop consciously, dress beautifully.
          </p>
          
          <button className="inline-flex items-center space-x-2 bg-pehnawa-forest-green hover:bg-pehnawa-dark-green text-white px-8 py-4 rounded-full font-medium transition-colors duration-300">
            <span>Explore Thrift</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 right-8 flex space-x-2 z-10">
          <div className="w-8 h-1 bg-white rounded-full"></div>
          <div className="w-2 h-1 bg-white/40 rounded-full"></div>
          <div className="w-2 h-1 bg-white/40 rounded-full"></div>
        </div>
      </section>

      {/* 2. FOUR FEATURE CARDS */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {FEATURE_CARDS.map((card, idx) => (
          <div 
            key={idx} 
            className={`relative rounded-xl overflow-hidden aspect-[4/5] group cursor-pointer ${card.isAiStylist ? 'bg-[#EFE9DF] flex flex-col justify-center items-center text-center p-6 border border-pehnawa-cream' : ''}`}
          >
            {!card.isAiStylist && card.image && (
              <>
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${card.image}')` }}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
              </>
            )}
            
            <div className={`relative z-10 w-full h-full flex flex-col ${card.isAiStylist ? 'items-center justify-center' : 'p-6 justify-end'}`}>
              <div className={`flex items-center ${card.isAiStylist ? 'flex-col space-y-4' : 'justify-between w-full'}`}>
                {card.isAiStylist ? (
                  <>
                    <h3 className="text-2xl font-serif text-pehnawa-forest-green">{card.title}</h3>
                    <p className="text-sm text-pehnawa-charcoal/70 whitespace-pre-line">{card.subtitle}</p>
                    <div className="mt-4 w-10 h-10 rounded-full bg-pehnawa-forest-green/10 flex items-center justify-center text-pehnawa-forest-green group-hover:bg-pehnawa-forest-green group-hover:text-white transition-colors duration-300">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl md:text-2xl font-serif text-white drop-shadow-md">{card.title}</h3>
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white group-hover:bg-white group-hover:text-pehnawa-charcoal transition-colors duration-300">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 3. NEW ARRIVALS */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-serif text-pehnawa-charcoal">New Arrivals</h2>
          <a href="/shop/new-arrivals" className="text-sm font-medium text-pehnawa-forest-green hover:text-pehnawa-dark-green inline-flex items-center group">
            View all 
            <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {(!newArrivals || newArrivals.length === 0) ? (
          <div className="w-full bg-pehnawa-cream/50 rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <ShoppingBag className="w-8 h-8 text-pehnawa-charcoal/20 mb-3" />
            <h3 className="text-lg font-serif text-pehnawa-charcoal mb-1">More styles arriving soon</h3>
            <p className="text-sm text-pehnawa-charcoal/60">Our thrift stores are currently preparing their catalogs.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 overflow-x-auto pb-4 hide-scrollbar">
            {newArrivals.map((product) => {
              const image = product.product_images && product.product_images[0] ? product.product_images[0].url : null;
              
              // Calculate discount if both exist
              let discountStr = '';
              if (product.original_price && product.price < product.original_price) {
                const diff = product.original_price - product.price;
                const percent = Math.round((diff / product.original_price) * 100);
                discountStr = `${percent}% OFF`;
              }
              
              return (
                <div key={product.id} className="flex flex-col group cursor-pointer min-w-[160px]">
                  <div className="relative aspect-[3/4] mb-4 bg-pehnawa-cream rounded-lg overflow-hidden flex items-center justify-center">
                    {image ? (
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url('${image}')` }}
                      />
                    ) : (
                      <ShoppingBag className="w-8 h-8 text-pehnawa-charcoal/20" />
                    )}
                    <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-pehnawa-charcoal/60 hover:text-pehnawa-burgundy backdrop-blur-sm transition-colors z-10">
                      <Heart className="w-4 h-4" />
                    </button>
                    {discountStr && (
                      <div className="absolute bottom-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-pehnawa-burgundy rounded uppercase tracking-wider">
                        {discountStr}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-pehnawa-charcoal/60 uppercase tracking-wider mb-1">{product.brand || 'Unbranded'}</span>
                    <h4 className="text-sm font-medium text-pehnawa-charcoal mb-2 truncate">{product.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-pehnawa-forest-green">₹{product.price}</span>
                      {product.original_price && (
                        <span className="text-xs text-pehnawa-charcoal/40 line-through">₹{product.original_price}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
