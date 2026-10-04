import React from 'react';

export default function AuthHero() {
  return (
    <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between overflow-hidden bg-pehnawa-cream">
      {/* Background Image Setup */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop')",
        }}
      />
      
      {/* Overlay to ensure text readability while maintaining image visibility */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-pehnawa-charcoal/80 via-pehnawa-charcoal/40 to-transparent" />
      <div className="absolute inset-0 z-0 bg-pehnawa-forest-green/10" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-12 xl:p-20 text-white">
        
        {/* Brand Header */}
        <div className="flex flex-col space-y-1">
          <h1 className="text-2xl font-semibold tracking-widest uppercase">Pehnawa</h1>
          <p className="text-sm tracking-widest text-pehnawa-warm-ivory/80 font-light uppercase">
            Wear. Rewear. Redefine.
          </p>
        </div>

        {/* Hero Copy */}
        <div className="mt-auto mb-24 max-w-xl">
          <p className="text-sm md:text-base font-medium tracking-widest uppercase mb-4 text-pehnawa-warm-ivory/90">
            More than just fashion.
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.1] mb-8 text-pehnawa-warm-ivory">
            A kinder closet <br />
            for a brighter <br />
            tomorrow.
          </h2>
          <p className="text-base md:text-lg text-pehnawa-warm-ivory/80 leading-relaxed font-light">
            Shop pre-loved. Discover new styles.<br />
            Donate. Earn rewards. Make a difference.
          </p>
        </div>
      </div>
    </div>
  );
}
