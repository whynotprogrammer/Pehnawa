"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PasswordInput from './PasswordInput';
import SocialLoginButtons from './SocialLoginButtons';
import { createClient } from '@/lib/supabase/client';
import { registerWithRole } from '@/app/actions/auth';

export default function RegisterForm() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'business_owner'>('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await registerWithRole(email, password, role);
      setSuccess('Account created successfully! You can now log in.');
      router.refresh();
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.message === 'fetch failed' || err.message.includes('fetch')) {
        setError('Network Error: Failed to connect to Supabase. Check your internet connection or .env.local configuration.');
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col justify-center h-full min-h-screen px-6 py-12 lg:min-h-0 lg:py-0 overflow-y-auto">
      
      {/* Mobile Top Navigation */}
      <div className="lg:hidden flex justify-end w-full mb-8">
        <div className="text-sm">
          <span className="text-gray-500 mr-1">Already have an account?</span>
          <Link href="/login" className="font-medium hover:text-pehnawa-forest-green transition-colors">
            Log in &rarr;
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-serif text-pehnawa-charcoal mb-2">Create an account</h2>
        <p className="text-gray-500 text-sm">Join Pehnawa and redefine your wardrobe.</p>
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Role Selection */}
        <div className="flex space-x-4 mb-2">
          <label className={`flex-1 flex items-center justify-center py-3 border rounded-md cursor-pointer transition-colors ${role === 'customer' ? 'border-pehnawa-forest-green bg-pehnawa-forest-green/5 text-pehnawa-forest-green' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
            <input type="radio" name="role" value="customer" checked={role === 'customer'} onChange={() => setRole('customer')} className="hidden" />
            <span className="text-sm font-medium">Customer</span>
          </label>
          <label className={`flex-1 flex items-center justify-center py-3 border rounded-md cursor-pointer transition-colors ${role === 'business_owner' ? 'border-pehnawa-forest-green bg-pehnawa-forest-green/5 text-pehnawa-forest-green' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
            <input type="radio" name="role" value="business_owner" checked={role === 'business_owner'} onChange={() => setRole('business_owner')} className="hidden" />
            <span className="text-sm font-medium">Business Owner</span>
          </label>
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-pehnawa-charcoal">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-transparent border border-gray-300 rounded-md outline-none focus:border-pehnawa-forest-green transition-colors duration-200"
            placeholder="you@example.com"
            disabled={loading}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-pehnawa-charcoal">
            Password
          </label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 characters"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pehnawa-forest-green hover:bg-pehnawa-dark-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pehnawa-forest-green transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>Create Account &rarr;</>
          )}
        </button>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-pehnawa-warm-ivory text-gray-400 uppercase tracking-widest text-xs">
              Or
            </span>
          </div>
        </div>

        <div className="mt-8">
          <SocialLoginButtons />
        </div>
      </div>

    </div>
  );
}
