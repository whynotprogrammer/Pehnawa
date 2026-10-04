"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { submitDonation } from '@/app/actions/donations';
import { Loader2, Plus, Trash2, Upload, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function DonationForm() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Array of items
  const [items, setItems] = useState([
    {
      id: Date.now().toString(),
      clothing_type: '',
      category: 'Shirts',
      brand: '',
      size: '',
      condition: 'good',
      description: '',
      image_urls: [] as string[]
    }
  ]);

  const [activeItemIndex, setActiveItemIndex] = useState(0);

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      clothing_type: '',
      category: 'Shirts',
      brand: '',
      size: '',
      condition: 'good',
      description: '',
      image_urls: []
    }]);
    setActiveItemIndex(items.length);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    setActiveItemIndex(Math.max(0, index - 1));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    setError('');
    
    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `donations/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('donation_images') // Requires this bucket to be created in Supabase
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}. Make sure 'donation_images' bucket exists.`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('donation_images')
        .getPublicUrl(filePath);

      const newItems = [...items];
      newItems[activeItemIndex].image_urls.push(publicUrl);
      setItems(newItems);

    } catch (err: any) {
      setError(err.message || 'Error uploading image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (itemIndex: number, imgIndex: number) => {
    const newItems = [...items];
    newItems[itemIndex].image_urls.splice(imgIndex, 1);
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    for (let i = 0; i < items.length; i++) {
      if (!items[i].clothing_type) {
        setError(`Please provide a clothing type for Item ${i + 1}`);
        setLoading(false);
        setActiveItemIndex(i);
        return;
      }
    }

    try {
      await submitDonation(items);
      router.push('/customer/donations');
    } catch (err: any) {
      setError(err.message || 'Failed to submit donation.');
      setLoading(false);
    }
  };

  const activeItem = items[activeItemIndex];

  const categories = [
    'Shirts', 'T-shirts', 'Jeans', 'Trousers', 'Dresses', 
    'Kurtas', 'Jackets', 'Sweaters', 'Sarees', 'Ethnic wear', 
    'Bags', 'Accessories', 'Other'
  ];

  return (
    <div className="bg-white border border-pehnawa-cream rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">
      
      {/* Sidebar / Item List */}
      <div className="w-full md:w-64 bg-pehnawa-warm-ivory border-r border-pehnawa-cream p-4 flex flex-col">
        <h4 className="text-sm font-semibold text-pehnawa-charcoal uppercase tracking-wider mb-4">Donation Items</h4>
        <div className="space-y-2 flex-1 overflow-y-auto">
          {items.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveItemIndex(idx)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex justify-between items-center group
                ${activeItemIndex === idx 
                  ? 'bg-white border border-pehnawa-forest-green/20 text-pehnawa-forest-green shadow-sm' 
                  : 'text-pehnawa-charcoal/70 hover:bg-white/50 border border-transparent hover:border-pehnawa-cream'
                }
              `}
            >
              <span className="truncate pr-2">{item.clothing_type || `Item ${idx + 1}`}</span>
              {items.length > 1 && (
                <Trash2 
                  className={`w-3.5 h-3.5 ${activeItemIndex === idx ? 'text-pehnawa-forest-green/50' : 'opacity-0 group-hover:opacity-100'} hover:text-red-500 transition-all`} 
                  onClick={(e) => { e.stopPropagation(); removeItem(idx); }}
                />
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-pehnawa-cream border-dashed rounded-xl text-sm font-medium text-pehnawa-charcoal hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Item</span>
        </button>
      </div>

      {/* Main Form Area */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col relative">
        <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-8">
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-serif text-pehnawa-charcoal">Item {activeItemIndex + 1} Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-pehnawa-charcoal">Clothing Type *</label>
              <input required type="text" value={activeItem.clothing_type} onChange={(e) => handleItemChange(activeItemIndex, 'clothing_type', e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md outline-none focus:border-pehnawa-forest-green focus:bg-white transition-colors" placeholder="e.g. Denim Jacket" />
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-pehnawa-charcoal">Category *</label>
              <select value={activeItem.category} onChange={(e) => handleItemChange(activeItemIndex, 'category', e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md outline-none focus:border-pehnawa-forest-green focus:bg-white transition-colors">
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-pehnawa-charcoal">Condition *</label>
              <select value={activeItem.condition} onChange={(e) => handleItemChange(activeItemIndex, 'condition', e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md outline-none focus:border-pehnawa-forest-green focus:bg-white transition-colors">
                <option value="new_with_tags">Like New / New with tags</option>
                <option value="like_new">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair / Needs repair</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-pehnawa-charcoal">Brand (Optional)</label>
              <input type="text" value={activeItem.brand} onChange={(e) => handleItemChange(activeItemIndex, 'brand', e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md outline-none focus:border-pehnawa-forest-green focus:bg-white transition-colors" placeholder="e.g. Levi's" />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-pehnawa-charcoal">Size (Optional)</label>
              <input type="text" value={activeItem.size} onChange={(e) => handleItemChange(activeItemIndex, 'size', e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md outline-none focus:border-pehnawa-forest-green focus:bg-white transition-colors" placeholder="e.g. Medium / 32" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-pehnawa-charcoal">Description</label>
            <textarea value={activeItem.description} onChange={(e) => handleItemChange(activeItemIndex, 'description', e.target.value)} rows={3} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md outline-none focus:border-pehnawa-forest-green focus:bg-white transition-colors" placeholder="Describe the item, its history, any flaws or unique details." />
          </div>

          {/* Images */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-pehnawa-charcoal">Photos</label>
            <div className="flex flex-wrap gap-4">
              {activeItem.image_urls.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-lg border border-pehnawa-cream overflow-hidden bg-white">
                  <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => removeImage(activeItemIndex, idx)}
                    className="absolute top-1 right-1 p-1 bg-white/90 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              <label className="relative w-24 h-24 rounded-lg border-2 border-dashed border-pehnawa-cream bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-pehnawa-forest-green transition-colors">
                {uploading ? (
                  <Loader2 className="w-5 h-5 text-pehnawa-forest-green animate-spin" />
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-pehnawa-charcoal/40 mb-1" />
                    <span className="text-[10px] text-pehnawa-charcoal/60">Upload</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                  disabled={uploading}
                  ref={fileInputRef}
                />
              </label>
            </div>
            <p className="text-xs text-pehnawa-charcoal/50">Upload clear photos showing the front, back, and any flaws or tags.</p>
          </div>

        </div>

        {/* Submit */}
        <div className="p-6 border-t border-pehnawa-cream bg-gray-50 flex justify-end">
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-8 py-3.5 bg-pehnawa-forest-green hover:bg-pehnawa-dark-green text-white rounded-full text-sm font-medium transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Submit Donation ({items.length} {items.length === 1 ? 'item' : 'items'})
          </button>
        </div>
      </form>

    </div>
  );
}
