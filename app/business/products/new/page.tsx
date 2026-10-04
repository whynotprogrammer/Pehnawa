import React from 'react';
import ProductForm from '@/components/business/ProductForm';

export const metadata = {
  title: 'Add New Product | Pehnawa',
};

export default function NewProductPage() {
  return (
    <div className="flex flex-col space-y-8">
      <div>
        <h2 className="text-3xl font-serif text-pehnawa-charcoal mb-1">Add New Product</h2>
        <p className="text-sm text-pehnawa-charcoal/60">Give a pre-loved item a second life.</p>
      </div>

      <ProductForm />
    </div>
  );
}
