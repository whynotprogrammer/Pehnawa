// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import { Plus, Search, MoreVertical, Edit, Trash2, ShoppingBag } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getBusinessId } from '@/app/actions/product';

export const metadata = {
  title: 'Products | Pehnawa Business',
};

// Next.js config to ensure dynamic rendering if we rely on cookies/auth
export const dynamic = 'force-dynamic';

export default async function BusinessProductsPage() {
  const supabase = await createClient();
  let products = [];
  let errorMsg = null;

  try {
    const businessId = await getBusinessId();
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (url)
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    products = data || [];
  } catch (err: any) {
    errorMsg = err.message || 'Failed to load products.';
  }

  return (
    <div className="flex flex-col space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif text-pehnawa-charcoal mb-1">Products</h2>
          <p className="text-sm text-pehnawa-charcoal/60">Manage your thrift store inventory</p>
        </div>
        <Link 
          href="/business/products/new" 
          className="inline-flex items-center justify-center space-x-2 bg-pehnawa-forest-green hover:bg-pehnawa-dark-green text-white px-6 py-3 rounded-full text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Link>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-md text-red-600 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-pehnawa-warm-ivory border border-pehnawa-cream rounded-2xl shadow-sm p-4 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-pehnawa-charcoal/40 group-focus-within:text-pehnawa-forest-green" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2.5 bg-white border border-pehnawa-cream rounded-xl text-sm placeholder-pehnawa-charcoal/40 focus:outline-none focus:border-pehnawa-forest-green transition-all"
            placeholder="Search products..."
          />
        </div>
        <div className="flex items-center space-x-3">
          <select className="px-4 py-2.5 bg-white border border-pehnawa-cream rounded-xl text-sm text-pehnawa-charcoal/70 outline-none focus:border-pehnawa-forest-green">
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Products Table/Grid */}
      {products.length === 0 ? (
        <div className="bg-pehnawa-warm-ivory border border-pehnawa-cream rounded-2xl shadow-sm p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 border border-pehnawa-cream">
            <ShoppingBag className="w-8 h-8 text-pehnawa-charcoal/20" />
          </div>
          <h3 className="text-xl font-serif text-pehnawa-charcoal mb-2">No products yet</h3>
          <p className="text-sm text-pehnawa-charcoal/60 max-w-md mb-6">
            You haven't added any products to your store yet. Start building your sustainable inventory!
          </p>
          <Link 
            href="/business/products/new" 
            className="inline-flex items-center space-x-2 bg-pehnawa-forest-green hover:bg-pehnawa-dark-green text-white px-6 py-3 rounded-full text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Product</span>
          </Link>
        </div>
      ) : (
        <div className="bg-pehnawa-warm-ivory border border-pehnawa-cream rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-pehnawa-cream bg-white/40">
                  <th className="py-4 px-6 text-xs font-semibold text-pehnawa-charcoal/60 uppercase tracking-wider">Product</th>
                  <th className="py-4 px-6 text-xs font-semibold text-pehnawa-charcoal/60 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-xs font-semibold text-pehnawa-charcoal/60 uppercase tracking-wider">Inventory</th>
                  <th className="py-4 px-6 text-xs font-semibold text-pehnawa-charcoal/60 uppercase tracking-wider">Price</th>
                  <th className="py-4 px-6 text-xs font-semibold text-pehnawa-charcoal/60 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pehnawa-cream">
                {products.map((product: any) => (
                  <tr key={product.id} className="hover:bg-white/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-lg bg-white border border-pehnawa-cream overflow-hidden flex-shrink-0">
                          {product.product_images && product.product_images[0] ? (
                            <img src={product.product_images[0].url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                              <ShoppingBag className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-pehnawa-charcoal">{product.name}</span>
                          <span className="text-xs text-pehnawa-charcoal/50">{product.brand || 'No brand'} · SKU: {product.sku || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider
                        ${product.status === 'published' ? 'bg-green-50 text-green-700 border border-green-200' : 
                          product.status === 'draft' ? 'bg-gray-100 text-gray-700 border border-gray-200' : 
                          'bg-yellow-50 text-yellow-700 border border-yellow-200'}
                      `}>
                        {product.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-sm text-pehnawa-charcoal">{product.stock_quantity} in stock</span>
                        <span className="text-xs text-pehnawa-charcoal/50">{product.condition.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-pehnawa-charcoal">₹{product.price}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link href={`/business/products/${product.id}/edit`} className="p-2 text-pehnawa-charcoal/40 hover:text-pehnawa-forest-green hover:bg-pehnawa-forest-green/5 rounded-md transition-colors">
                          <Edit className="w-4 h-4" />
                        </Link>
                        {/* We could add a Delete action button here, but for brevity we'll just show the Edit path which leads to form */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
