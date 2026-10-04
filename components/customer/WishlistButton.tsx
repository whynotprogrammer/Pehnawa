"use client";

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { toggleWishlist, checkWishlistStatus } from '@/app/actions/shop';

export default function WishlistButton({ productId }: { productId: string }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      try {
        const status = await checkWishlistStatus(productId);
        setIsWishlisted(status);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, [productId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    // Optimistic UI
    const previous = isWishlisted;
    setIsWishlisted(!previous);

    try {
      const newState = await toggleWishlist(productId);
      setIsWishlisted(newState);
    } catch (err) {
      setIsWishlisted(previous); // revert
    }
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 shadow-sm
        ${isWishlisted 
          ? 'bg-pehnawa-burgundy/10 text-pehnawa-burgundy hover:bg-pehnawa-burgundy/20' 
          : 'bg-white/80 hover:bg-white text-pehnawa-charcoal/60 hover:text-pehnawa-burgundy'
        }
      `}
      title="Add to Wishlist"
    >
      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
    </button>
  );
}
