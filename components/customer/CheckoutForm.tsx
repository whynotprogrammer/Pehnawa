"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { processCheckout } from '@/app/actions/checkout';
import { Loader2, CreditCard } from 'lucide-react';

export default function CheckoutForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Process checkout via Server Action
      const orderIds = await processCheckout(formData);
      
      // Redirect to confirmation
      // For simplicity, we redirect to the first order ID or a generic success page
      router.push(`/customer/orders/${orderIds[0]}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred during checkout.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-pehnawa-cream rounded-2xl shadow-sm overflow-hidden">
      
      <div className="p-6 md:p-8 space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-serif text-pehnawa-charcoal mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pehnawa-charcoal mb-1">Email address</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pehnawa-forest-green focus:bg-white transition-colors" />
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div>
          <h3 className="text-lg font-serif text-pehnawa-charcoal mb-4">Shipping Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-pehnawa-charcoal mb-1">First name</label>
              <input required type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pehnawa-forest-green focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-pehnawa-charcoal mb-1">Last name</label>
              <input required type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pehnawa-forest-green focus:bg-white transition-colors" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-pehnawa-charcoal mb-1">Address line 1</label>
              <input required type="text" name="address_line1" value={formData.address_line1} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pehnawa-forest-green focus:bg-white transition-colors" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-pehnawa-charcoal mb-1">Address line 2 (Optional)</label>
              <input type="text" name="address_line2" value={formData.address_line2} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pehnawa-forest-green focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-pehnawa-charcoal mb-1">City</label>
              <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pehnawa-forest-green focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-pehnawa-charcoal mb-1">State / Province</label>
              <input required type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pehnawa-forest-green focus:bg-white transition-colors" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-pehnawa-charcoal mb-1">Postal code</label>
              <input required type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pehnawa-forest-green focus:bg-white transition-colors" />
            </div>
          </div>
        </div>

        {/* Payment Mock */}
        <div>
          <h3 className="text-lg font-serif text-pehnawa-charcoal mb-4">Payment</h3>
          <div className="p-4 border border-pehnawa-cream rounded-xl bg-gray-50 flex items-center space-x-3">
            <CreditCard className="w-5 h-5 text-pehnawa-charcoal/40" />
            <div className="text-sm text-pehnawa-charcoal/80">
              <span className="font-medium text-pehnawa-charcoal">Simulated Payment System.</span> No real charges will be made.
            </div>
          </div>
        </div>

      </div>

      <div className="p-6 md:p-8 bg-gray-50 border-t border-pehnawa-cream flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto px-8 py-4 bg-pehnawa-forest-green hover:bg-pehnawa-dark-green text-white rounded-xl font-medium transition-colors flex items-center justify-center disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Confirm & Pay'
          )}
        </button>
      </div>

    </form>
  );
}
