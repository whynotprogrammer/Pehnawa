// @ts-nocheck
import React from 'react';
import ProductForm from '@/components/business/ProductForm';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Edit Product | Pehnawa',
};

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images (url, display_order)
    `)
    .eq('id', params.id)
    .single();

  if (error || !product) {
    redirect('/business/products');
  }

  // Ensure images are sorted
  if (product.product_images) {
    product.product_images.sort((a: any, b: any) => a.display_order - b.display_order);
  }

  return (
    <div className="flex flex-col space-y-8">
      <div>
        <h2 className="text-3xl font-serif text-pehnawa-charcoal mb-1">Edit Product</h2>
        <p className="text-sm text-pehnawa-charcoal/60">Update details for {product.name}</p>
      </div>

      <ProductForm initialData={product} isEdit={true} />
    </div>
  );
}
