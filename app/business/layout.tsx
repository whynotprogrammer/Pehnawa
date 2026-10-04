import React from 'react';
import BusinessSidebar from '@/components/business/BusinessSidebar';
import BusinessTopbar from '@/components/business/BusinessTopbar';

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-pehnawa-warm-ivory selection:bg-pehnawa-forest-green selection:text-white">
      <BusinessSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-64 lg:ml-72">
        <BusinessTopbar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
