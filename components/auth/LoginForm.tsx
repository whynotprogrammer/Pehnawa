"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PasswordInput from './PasswordInput';
import SocialLoginButtons from './SocialLoginButtons';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');

    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.refresh(); // Refresh to trigger middleware
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col justify-center h-full min-h-screen px-6 py-12 lg:min-h-0 lg:py-0">
      
      {/* Mobile Top Navigation */}
      <div className="lg:hidden flex justify-end w-full mb-8">
        <div className="text-sm">
          <span className="text-gray-500 mr-1">New here?</span>
          <Link href="/register" className="font-medium hover:text-pehnawa-forest-green transition-colors">
            Create an account &rarr;
          </Link>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-3xl font-serif text-pehnawa-charcoal mb-2">Welcome back</h2>
        <p className="text-gray-500 text-sm">Log in to continue your journey with Pehnawa.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-pehnawa-charcoal">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
            }}
            className={`w-full px-4 py-3 bg-transparent border rounded-md outline-none transition-colors duration-200
              ${emailError ? 'border-red-500 focus:border-red-600' : 'border-gray-300 focus:border-pehnawa-forest-green'}
            `}
            placeholder="you@example.com"
            disabled={loading}
          />
          {emailError && <p className="text-sm text-red-500 mt-1">{emailError}</p>}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-pehnawa-charcoal">
              Password
            </label>
            <Link 
              href="/forgot-password" 
              className="text-sm text-gray-500 hover:text-pehnawa-forest-green transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            placeholder="••••••••"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pehnawa-forest-green hover:bg-pehnawa-dark-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pehnawa-forest-green transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>Log In &rarr;</>
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

      <div className="mt-10 lg:hidden flex justify-center text-sm">
        <span className="text-gray-500 mr-1">Don't have an account?</span>
        <Link href="/register" className="font-medium hover:text-pehnawa-forest-green transition-colors">
          Sign up
        </Link>
      </div>
    </div>
  );
}
