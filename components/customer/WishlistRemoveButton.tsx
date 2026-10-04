"use client";

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toggleWishlist } from '@/app/actions/shop';

export default function WishlistRemoveButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    
    setLoading(true);
    try {
      await toggleWishlist(productId);
      // It handles its own revalidation
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleRemove}
      disabled={loading}
      className="p-1.5 rounded-full bg-white/80 hover:bg-red-50 text-pehnawa-charcoal/40 hover:text-red-500 backdrop-blur-sm transition-all duration-200 shadow-sm"
      title="Remove from Wishlist"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
