"use client";

import React, { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { addToCart } from '@/app/actions/shop';

type AddToCartFormProps = {
  product: any;
};

export default function AddToCartForm({ product }: AddToCartFormProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');

  const isOutOfStock = product.stock_quantity === 0;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    
    setLoading(true);
    setError('');
    
    try {
      await addToCart(product.id, 1, selectedSize, selectedColor);
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleAdd} className="space-y-6">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sizes */}
        {product.sizes && product.sizes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-pehnawa-charcoal">Size</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size: string) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[3rem] px-3 py-2 text-sm font-medium border rounded-md transition-colors ${
                    selectedSize === size 
                      ? 'border-pehnawa-forest-green bg-pehnawa-forest-green text-white' 
                      : 'border-pehnawa-cream bg-white text-pehnawa-charcoal hover:border-pehnawa-forest-green/50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Colors */}
        {product.colors && product.colors.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-pehnawa-charcoal">Color</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color: string) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 text-sm font-medium border rounded-md transition-colors ${
                    selectedColor === color 
                      ? 'border-pehnawa-forest-green bg-pehnawa-forest-green/5 text-pehnawa-forest-green' 
                      : 'border-pehnawa-cream bg-white text-pehnawa-charcoal hover:border-pehnawa-forest-green/50'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-2">
        {isOutOfStock ? (
          <button 
            disabled 
            className="w-full py-4 rounded-full bg-pehnawa-cream text-pehnawa-charcoal/40 font-medium cursor-not-allowed"
          >
            Out of Stock
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading || added}
            className={`w-full py-4 rounded-full font-medium transition-all duration-300 flex items-center justify-center space-x-2
              ${added 
                ? 'bg-pehnawa-forest-green text-white' 
                : 'bg-pehnawa-charcoal hover:bg-black text-white'
              }
              ${loading ? 'opacity-70 cursor-not-allowed' : ''}
            `}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : added ? (
              <>
                <Check className="w-5 h-5" />
                <span>Added to Cart</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        )}
        {!isOutOfStock && <p className="text-center text-xs text-pehnawa-charcoal/50 mt-3">Only {product.stock_quantity} left in stock!</p>}
      </div>
    </form>
  );
}
