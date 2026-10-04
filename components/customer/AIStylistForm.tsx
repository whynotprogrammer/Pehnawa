"use client";

import React, { useState } from 'react';
import { generateOutfit } from '@/app/actions/ai-stylist';
import { addToCart } from '@/app/actions/shop';
import { Loader2, Sparkles, RefreshCw, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AIStylistForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState('');

  const [formData, setFormData] = useState({
    occasion: 'Casual',
    style: 'Minimalist',
    budget: '2000',
    colors: '',
    gender: 'Any',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecommendations([]);
    setCartSuccess('');

    try {
      const outfit = await generateOutfit(formData);
      setRecommendations(outfit);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while curating your outfit.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllToCart = async () => {
    if (addingToCart || recommendations.length === 0) return;
    setAddingToCart(true);
    try {
      for (const product of recommendations) {
        await addToCart(product.id, 1, product.sizes?.[0] || null, product.colors?.[0] || null);
      }
      setCartSuccess('Outfit added to your cart successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to add items to cart.');
    } finally {
      setAddingToCart(false);
    }
  };

  const totalOutfitPrice = recommendations.reduce((sum, item) => sum + Number(item.price), 0);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      
      {/* Left: Preferences Form */}
      <div className="w-full lg:w-1/3 bg-white border border-pehnawa-cream rounded-2xl p-6 shadow-sm sticky top-24">
        <h3 className="text-xl font-serif text-pehnawa-charcoal mb-6">Your Preferences</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-pehnawa-charcoal mb-1">Occasion</label>
            <select name="occasion" value={formData.occasion} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pehnawa-forest-green focus:bg-white text-sm transition-colors">
              {['Casual', 'College', 'Party', 'Formal', 'Date', 'Wedding', 'Vacation'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-pehnawa-charcoal mb-1">Style</label>
            <select name="style" value={formData.style} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pehnawa-forest-green focus:bg-white text-sm transition-colors">
              {['Minimalist', 'Vintage', 'Streetwear', 'Y2K', 'Boho', 'Classic', 'Edgy'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-pehnawa-charcoal mb-1">Gender / Category</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pehnawa-forest-green focus:bg-white text-sm transition-colors">
              {['Any', 'Men', 'Women', 'Unisex'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-pehnawa-charcoal mb-1">Max Budget (₹)</label>
            <input type="number" name="budget" value={formData.budget} onChange={handleChange} placeholder="e.g. 2000" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pehnawa-forest-green focus:bg-white text-sm transition-colors" />
          </div>

          <div>
            <label className="block text-sm font-medium text-pehnawa-charcoal mb-1">Preferred Colors</label>
            <input type="text" name="colors" value={formData.colors} onChange={handleChange} placeholder="e.g. Earth tones, Black, Pastel" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pehnawa-forest-green focus:bg-white text-sm transition-colors" />
          </div>

          <div>
            <label className="block text-sm font-medium text-pehnawa-charcoal mb-1">Additional Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="e.g. I need something warm, no leather, etc." rows={3} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pehnawa-forest-green focus:bg-white text-sm transition-colors" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full pt-2"
          >
            <div className="w-full flex items-center justify-center space-x-2 bg-pehnawa-forest-green hover:bg-pehnawa-dark-green text-white py-3.5 rounded-xl font-medium transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              <span>{loading ? 'Curating Outfit...' : 'Generate Outfit'}</span>
            </div>
          </button>
        </form>
      </div>

      {/* Right: AI Output Display */}
      <div className="w-full lg:w-2/3">
        
        {loading && (
          <div className="w-full h-96 bg-pehnawa-warm-ivory/50 border border-pehnawa-cream border-dashed rounded-2xl flex flex-col items-center justify-center text-center animate-pulse p-6">
            <Sparkles className="w-10 h-10 text-pehnawa-forest-green/50 mb-4 animate-bounce" />
            <h3 className="text-xl font-serif text-pehnawa-charcoal mb-2">Analyzing Inventory</h3>
            <p className="text-sm text-pehnawa-charcoal/60">Finding the perfect pre-loved pieces to match your style...</p>
          </div>
        )}

        {error && !loading && (
          <div className="w-full p-6 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex flex-col items-center text-center">
            <RefreshCw className="w-8 h-8 mb-3 opacity-50" />
            <p className="font-medium">{error}</p>
            <p className="text-sm mt-2 opacity-80">Make sure GEMINI_API_KEY is configured in your environment, or try widening your budget/preferences.</p>
          </div>
        )}

        {!loading && !error && recommendations.length === 0 && (
          <div className="w-full h-96 bg-pehnawa-warm-ivory/30 border border-pehnawa-cream rounded-2xl flex flex-col items-center justify-center text-center p-6">
            <Sparkles className="w-12 h-12 text-pehnawa-charcoal/20 mb-4" />
            <h3 className="text-xl font-serif text-pehnawa-charcoal mb-2">Ready to style you</h3>
            <p className="text-sm text-pehnawa-charcoal/60 max-w-sm">
              Enter your preferences on the left and our AI will build a complete outfit from real, available items in our thrift stores.
            </p>
          </div>
        )}

        {!loading && !error && recommendations.length > 0 && (
          <div className="space-y-6">
            
            <div className="bg-pehnawa-warm-ivory border border-pehnawa-cream rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-xl font-serif text-pehnawa-charcoal">Your AI Curated Outfit</h3>
                <p className="text-sm text-pehnawa-charcoal/70">Total Outfit Value: <span className="font-bold text-pehnawa-forest-green">₹{totalOutfitPrice.toFixed(2)}</span></p>
              </div>
              <button 
                onClick={handleAddAllToCart}
                disabled={addingToCart || !!cartSuccess}
                className="flex items-center space-x-2 bg-pehnawa-charcoal hover:bg-black text-white px-6 py-3 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
              >
                {addingToCart ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
                <span>{cartSuccess ? 'Added to Cart!' : 'Add All to Cart'}</span>
              </button>
            </div>

            {cartSuccess && (
              <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm flex justify-between items-center">
                <span>{cartSuccess}</span>
                <Link href="/customer/cart" className="font-bold hover:underline flex items-center">
                  View Cart <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((item, idx) => (
                <div key={item.id} className="bg-white border border-pehnawa-cream rounded-2xl overflow-hidden shadow-sm group">
                  <div className="relative aspect-[3/4] bg-pehnawa-cream overflow-hidden">
                    {item.product_images?.[0]?.url ? (
                      <img src={item.product_images[0].url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-pehnawa-charcoal/20">No Image</div>
                    )}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-pehnawa-charcoal tracking-wider">
                      Part {idx + 1}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs text-pehnawa-charcoal/50 uppercase tracking-widest">{item.brand || 'Unbranded'}</span>
                        <Link href={`/customer/shop/${item.id}`} className="block mt-1">
                          <h4 className="text-base font-medium text-pehnawa-charcoal hover:text-pehnawa-forest-green transition-colors line-clamp-1">{item.name}</h4>
                        </Link>
                      </div>
                      <span className="text-lg font-semibold text-pehnawa-forest-green">₹{item.price}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-pehnawa-charcoal/60 mt-3">
                      {item.sizes?.[0] && <span className="bg-gray-50 px-2 py-1 rounded border">Size: {item.sizes[0]}</span>}
                      {item.condition && <span className="bg-gray-50 px-2 py-1 rounded border capitalize">{item.condition.replace('_', ' ')}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
