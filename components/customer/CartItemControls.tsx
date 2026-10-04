"use client";

import React, { useState } from 'react';
import { Minus, Plus, Trash2, Loader2 } from 'lucide-react';
import { updateCartQuantity, removeFromCart } from '@/app/actions/shop';

type Props = {
  itemId: string;
  quantity: number;
  stock: number;
  isOutOfStock: boolean;
};

export default function CartItemControls({ itemId, quantity, stock, isOutOfStock }: Props) {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (newQuantity: number) => {
    if (loading || newQuantity > stock) return;
    setLoading(true);
    try {
      if (newQuantity <= 0) {
        await removeFromCart(itemId);
      } else {
        await updateCartQuantity(itemId, newQuantity);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await removeFromCart(itemId);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Quantity Toggle */}
      {!isOutOfStock ? (
        <div className="flex items-center border border-pehnawa-cream rounded-lg overflow-hidden bg-white/50">
          <button 
            onClick={() => handleUpdate(quantity - 1)}
            disabled={loading}
            className="w-8 h-8 flex items-center justify-center text-pehnawa-charcoal/60 hover:text-pehnawa-forest-green hover:bg-pehnawa-cream/50 transition-colors disabled:opacity-50"
            title="Decrease Quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          
          <div className="w-8 h-8 flex items-center justify-center text-sm font-medium text-pehnawa-charcoal">
            {loading ? <Loader2 className="w-3 h-3 animate-spin text-pehnawa-charcoal/40" /> : quantity}
          </div>
          
          <button 
            onClick={() => handleUpdate(quantity + 1)}
            disabled={loading || quantity >= stock}
            className="w-8 h-8 flex items-center justify-center text-pehnawa-charcoal/60 hover:text-pehnawa-forest-green hover:bg-pehnawa-cream/50 transition-colors disabled:opacity-50"
            title={quantity >= stock ? "Max stock reached" : "Increase Quantity"}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="text-xs font-bold text-pehnawa-burgundy px-3 py-1.5 bg-red-50 rounded border border-red-100">
          Unavailable
        </div>
      )}

      {/* Remove Button */}
      <button 
        onClick={handleRemove}
        disabled={loading}
        className="text-sm font-medium text-pehnawa-charcoal/40 hover:text-red-500 transition-colors flex items-center space-x-1"
      >
        <Trash2 className="w-4 h-4" />
        <span className="hidden sm:inline">Remove</span>
      </button>
    </div>
  );
}
