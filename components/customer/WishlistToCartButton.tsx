"use client";

import React, { useState } from 'react';
import { ShoppingBag, Loader2, Check } from 'lucide-react';
import { moveToCart } from '@/app/actions/shop';

type Props = {
  productId: string;
  disabled: boolean;
};

export default function WishlistToCartButton({ productId, disabled }: Props) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleMove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || loading) return;

    setLoading(true);
    try {
      await moveToCart(productId);
      setAdded(true);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (disabled) {
    return (
      <button disabled className="w-full py-2.5 rounded-lg bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed">
        Out of Stock
      </button>
    );
  }

  return (
    <button
      onClick={handleMove}
      disabled={loading || added}
      className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center space-x-2
        ${added 
          ? 'bg-pehnawa-forest-green text-white' 
          : 'bg-white border border-pehnawa-forest-green text-pehnawa-forest-green hover:bg-pehnawa-forest-green hover:text-white'
        }
      `}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : added ? (
        <>
          <Check className="w-4 h-4" />
          <span>Moved to Cart</span>
        </>
      ) : (
        <>
          <ShoppingBag className="w-4 h-4" />
          <span>Move to Cart</span>
        </>
      )}
    </button>
  );
}
