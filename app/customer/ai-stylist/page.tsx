import React from 'react';
import AIStylistForm from '@/components/customer/AIStylistForm';
import { Sparkles, Leaf } from 'lucide-react';

export const metadata = {
  title: 'AI Stylist | Pehnawa',
};

export default function AIStylistPage() {
  return (
    <div className="flex flex-col space-y-8 pb-24 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="text-center md:text-left">
        <div className="inline-flex items-center space-x-3 text-pehnawa-forest-green mb-3 bg-pehnawa-forest-green/10 px-4 py-2 rounded-full">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-widest">Pehnawa AI Stylist</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-serif text-pehnawa-charcoal mb-4">Discover your sustainable look.</h2>
        <p className="text-base text-pehnawa-charcoal/70 max-w-2xl leading-relaxed">
          Tell us about the occasion, your budget, and your vibe. Our AI will curate a complete, unique outfit using real, available thrifted pieces from our community.
        </p>
      </div>

      <hr className="border-pehnawa-cream" />

      {/* Main Interface */}
      <AIStylistForm />

    </div>
  );
}
