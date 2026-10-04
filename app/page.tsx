import React from 'react';
import Link from 'next/link';
import { ArrowRight, Leaf, Recycle, ShoppingBag } from 'lucide-react';

export const metadata = {
  title: 'Pehnawa | Sustainable Thrift Fashion',
  description: 'Wear. Rewear. Redefine. Join the sustainable fashion movement.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-pehnawa-warm-ivory selection:bg-pehnawa-forest-green selection:text-white flex flex-col">
      
      {/* Navigation */}
      <nav className="w-full py-6 px-6 md:px-12 flex justify-between items-center relative z-20">
        <div className="flex items-center space-x-2">
          <Leaf className="w-6 h-6 text-pehnawa-forest-green" />
          <span className="text-2xl font-serif text-pehnawa-forest-green tracking-wide">Pehnawa</span>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-pehnawa-charcoal/80">
          <Link href="/login" className="hover:text-pehnawa-forest-green transition-colors">Our Mission</Link>
          <Link href="/login" className="hover:text-pehnawa-forest-green transition-colors">Shop</Link>
          <Link href="/login" className="hover:text-pehnawa-forest-green transition-colors">Donate</Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-sm font-medium text-pehnawa-charcoal hover:text-pehnawa-forest-green transition-colors hidden sm:block">
            Sign In
          </Link>
          <Link href="/register" className="bg-pehnawa-forest-green text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-pehnawa-dark-green transition-colors shadow-sm">
            Join Pehnawa
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10 pt-12 pb-24">
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-pehnawa-cream/50 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-1/4 right-1/4 translate-x-1/2 w-72 h-72 bg-pehnawa-tan/20 rounded-full blur-3xl -z-10"></div>

        <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm border border-pehnawa-cream px-4 py-1.5 rounded-full text-xs font-semibold text-pehnawa-forest-green uppercase tracking-wider mb-8">
          <Recycle className="w-3.5 h-3.5" />
          <span>Sustainable Fashion Ecosystem</span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-pehnawa-charcoal max-w-4xl mx-auto leading-[1.1] mb-8">
          Wear. Rewear. <span className="italic text-pehnawa-forest-green">Redefine.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-pehnawa-charcoal/70 max-w-2xl mx-auto mb-10 leading-relaxed">
          Give your clothes a second life. Shop curated thrift collections, donate your unused wardrobe, and earn rewards for making sustainable choices.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link href="/register" className="w-full sm:w-auto bg-pehnawa-charcoal text-white px-8 py-4 rounded-full font-medium hover:bg-black transition-all flex items-center justify-center space-x-2 group">
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/login" className="w-full sm:w-auto bg-white text-pehnawa-charcoal border border-pehnawa-cream px-8 py-4 rounded-full font-medium hover:bg-gray-50 transition-all flex items-center justify-center space-x-2">
            <ShoppingBag className="w-4 h-4 text-pehnawa-charcoal/60" />
            <span>Browse Collection</span>
          </Link>
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="w-full py-8 text-center text-sm text-pehnawa-charcoal/40 border-t border-pehnawa-cream/50">
        <p>© {new Date().getFullYear()} Pehnawa. All rights reserved.</p>
      </footer>
    </div>
  );
}
