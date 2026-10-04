"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Loader2, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createProduct, updateProduct, deleteProduct } from '@/app/actions/product';

type ProductFormProps = {
  initialData?: any;
  isEdit?: boolean;
};

export default function ProductForm({ initialData, isEdit }: ProductFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  const [images, setImages] = useState<string[]>(
    initialData?.product_images?.map((img: any) => img.url) || []
  );

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    brand: initialData?.brand || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    original_price: initialData?.original_price || '',
    condition: initialData?.condition || 'good',
    gender: initialData?.gender || '',
    sizes: initialData?.sizes?.join(', ') || '',
    colors: initialData?.colors?.join(', ') || '',
    stock_quantity: initialData?.stock_quantity || '1',
    sku: initialData?.sku || '',
    status: initialData?.status || 'draft',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    setError('');
    
    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('product_images') // Requires this bucket to be created in Supabase
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}. Make sure the 'product_images' storage bucket exists and is public.`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product_images')
        .getPublicUrl(filePath);

      setImages(prev => [...prev, publicUrl]);
    } catch (err: any) {
      setError(err.message || 'Error uploading image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    setDeleteLoading(true);
    setError('');
    
    try {
      if (initialData?.id) {
        await deleteProduct(initialData.id);
        setSuccess('Product deleted successfully!');
        setTimeout(() => router.push('/business/products'), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete product');
      setDeleteLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Clean up array fields
      const cleanedData = {
        ...formData,
        sizes: formData.sizes ? formData.sizes.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        colors: formData.colors ? formData.colors.split(',').map((c: string) => c.trim()).filter(Boolean) : [],
      };

      if (isEdit && initialData?.id) {
        await updateProduct(initialData.id, cleanedData, images);
        setSuccess('Product updated successfully!');
        setTimeout(() => router.push('/business/products'), 1500);
      } else {
        await createProduct(cleanedData, images);
        setSuccess('Product created successfully!');
        setTimeout(() => router.push('/business/products'), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-pehnawa-warm-ivory border border-pehnawa-cream rounded-2xl shadow-sm p-6 md:p-8 max-w-4xl relative">
      
      {isEdit && (
        <button 
          type="button" 
          onClick={handleDelete}
          disabled={deleteLoading || loading}
          className="absolute top-6 right-6 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors flex items-center"
          title="Delete Product"
        >
          {deleteLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
        </button>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-md text-green-600 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 mt-2">
        
        {/* Section: Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-serif text-pehnawa-charcoal border-b border-pehnawa-cream pb-2">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-pehnawa-charcoal">Product Name *</label>
              <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-pehnawa-cream rounded-md outline-none focus:border-pehnawa-forest-green" placeholder="e.g. Vintage Denim Jacket" />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-pehnawa-charcoal">Brand</label>
              <input name="brand" value={formData.brand} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-pehnawa-cream rounded-md outline-none focus:border-pehnawa-forest-green" placeholder="e.g. Levi's" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-pehnawa-charcoal">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-4 py-2 bg-white border border-pehnawa-cream rounded-md outline-none focus:border-pehnawa-forest-green" placeholder="Describe the item, its history, flaws, etc." />
          </div>
        </div>

        {/* Section: Pricing & Inventory */}
        <div className="space-y-4">
          <h3 className="text-lg font-serif text-pehnawa-charcoal border-b border-pehnawa-cream pb-2">Pricing & Inventory</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-pehnawa-charcoal">Price (₹) *</label>
              <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-pehnawa-cream rounded-md outline-none focus:border-pehnawa-forest-green" />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-pehnawa-charcoal">Original Price (₹)</label>
              <input type="number" step="0.01" name="original_price" value={formData.original_price} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-pehnawa-cream rounded-md outline-none focus:border-pehnawa-forest-green" placeholder="Retail price" />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-pehnawa-charcoal">Stock Quantity *</label>
              <input required type="number" min="0" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-pehnawa-cream rounded-md outline-none focus:border-pehnawa-forest-green" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-pehnawa-charcoal">SKU</label>
              <input name="sku" value={formData.sku} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-pehnawa-cream rounded-md outline-none focus:border-pehnawa-forest-green" placeholder="e.g. VDJ-001" />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-pehnawa-charcoal">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-pehnawa-cream rounded-md outline-none focus:border-pehnawa-forest-green">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section: Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-serif text-pehnawa-charcoal border-b border-pehnawa-cream pb-2">Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-pehnawa-charcoal">Condition</label>
              <select name="condition" value={formData.condition} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-pehnawa-cream rounded-md outline-none focus:border-pehnawa-forest-green">
                <option value="new_with_tags">New With Tags</option>
                <option value="like_new">Like New / Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-pehnawa-charcoal">Gender / Category</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-pehnawa-cream rounded-md outline-none focus:border-pehnawa-forest-green">
                <option value="">Select...</option>
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="unisex">Unisex</option>
                <option value="kids">Kids</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-pehnawa-charcoal">Sizes (comma separated)</label>
              <input name="sizes" value={formData.sizes} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-pehnawa-cream rounded-md outline-none focus:border-pehnawa-forest-green" placeholder="e.g. S, M, L, 32" />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-pehnawa-charcoal">Colors (comma separated)</label>
              <input name="colors" value={formData.colors} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-pehnawa-cream rounded-md outline-none focus:border-pehnawa-forest-green" placeholder="e.g. Blue, Black" />
            </div>
          </div>
        </div>

        {/* Section: Images */}
        <div className="space-y-4">
          <h3 className="text-lg font-serif text-pehnawa-charcoal border-b border-pehnawa-cream pb-2">Product Images</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg border border-pehnawa-cream overflow-hidden bg-white">
                <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            <label className="relative aspect-square rounded-lg border-2 border-dashed border-pehnawa-cream bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
              {uploading ? (
                <Loader2 className="w-6 h-6 text-pehnawa-forest-green animate-spin" />
              ) : (
                <>
                  <Upload className="w-6 h-6 text-pehnawa-charcoal/40 mb-2" />
                  <span className="text-xs text-pehnawa-charcoal/60">Upload Image</span>
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
        </div>

        {/* Submit */}
        <div className="pt-6 flex justify-end space-x-4">
          <button 
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-pehnawa-cream rounded-full text-sm font-medium text-pehnawa-charcoal hover:bg-gray-50 transition-colors"
            disabled={loading || deleteLoading}
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading || deleteLoading}
            className="px-8 py-3 bg-pehnawa-forest-green hover:bg-pehnawa-dark-green text-white rounded-full text-sm font-medium transition-colors flex items-center"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Publish Product'}
          </button>
        </div>

      </form>
    </div>
  );
}
