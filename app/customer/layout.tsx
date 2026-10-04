import React from 'react';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import CustomerTopbar from '@/components/customer/CustomerTopbar';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-pehnawa-warm-ivory selection:bg-pehnawa-forest-green selection:text-white">
      <CustomerSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-72">
        <CustomerTopbar />
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
