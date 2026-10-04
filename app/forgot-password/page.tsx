import React from 'react';
import AuthHero from '@/components/auth/AuthHero';
import Link from 'next/link';

export const metadata = {
  title: 'Forgot Password | Pehnawa',
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen bg-pehnawa-warm-ivory selection:bg-pehnawa-forest-green selection:text-white">
      <AuthHero />
      <div className="w-full lg:w-[40%] xl:w-[45%] flex flex-col relative bg-pehnawa-warm-ivory shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] z-10 p-12 justify-center">
        <div className="max-w-[420px] mx-auto w-full">
          <h2 className="text-3xl font-serif text-pehnawa-charcoal mb-2">Reset Password</h2>
          <p className="text-gray-500 text-sm mb-8">Enter your email address to receive a password reset link.</p>
          
          <form className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-pehnawa-charcoal">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-4 py-3 bg-transparent border border-gray-300 rounded-md outline-none focus:border-pehnawa-forest-green transition-colors duration-200"
                placeholder="you@example.com"
              />
            </div>
            
            <button
              type="submit"
              className="w-full flex items-center justify-center py-3.5 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-pehnawa-forest-green hover:bg-pehnawa-dark-green transition-colors duration-200"
            >
              Send Reset Link &rarr;
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <Link href="/login" className="font-medium text-gray-500 hover:text-pehnawa-forest-green transition-colors">
              &larr; Back to login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
