import React from 'react';
import { Loader2 } from 'lucide-react';

export default function BusinessLoading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="w-8 h-8 text-pehnawa-forest-green animate-spin mb-4" />
      <p className="text-sm font-medium text-pehnawa-charcoal/50 uppercase tracking-widest animate-pulse">
        Loading...
      </p>
    </div>
  );
}
