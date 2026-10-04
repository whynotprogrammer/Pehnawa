import React from 'react';
import AuthHero from '@/components/auth/AuthHero';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Login | Pehnawa',
  description: 'Log in to your Pehnawa account to continue your sustainable fashion journey.',
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen bg-pehnawa-warm-ivory selection:bg-pehnawa-forest-green selection:text-white">
      <AuthHero />
      <div className="w-full lg:w-[40%] xl:w-[45%] flex flex-col relative bg-pehnawa-warm-ivory shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] z-10">
        
        {/* Desktop Top Navigation */}
        <div className="hidden lg:flex justify-end p-8 w-full absolute top-0 right-0">
          <div className="text-sm">
            <span className="text-gray-500 mr-1">New here?</span>
            <a href="/register" className="font-medium hover:text-pehnawa-forest-green transition-colors">
              Create an account &rarr;
            </a>
          </div>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
