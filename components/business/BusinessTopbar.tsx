"use client";

import React, { useState } from 'react';
import { Search, Bell, Menu, LogOut, X, Home, ShoppingBag, Package, FileText, Users, HeartHandshake, Gift, BarChart2, Settings, Leaf } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import NotificationBadge from '@/components/shared/NotificationBadge';
import Link from 'next/link';

export default function BusinessTopbar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { name: 'Overview', href: '/business/dashboard', icon: Home },
    { name: 'Products', href: '/business/products', icon: ShoppingBag },
    { name: 'Inventory', href: '/business/inventory', icon: Package },
    { name: 'Orders', href: '/business/orders', icon: FileText },
    { name: 'Customers', href: '/business/customers', icon: Users },
    { name: 'Donations', href: '/business/donations', icon: HeartHandshake },
    { name: 'Rewards', href: '/business/rewards', icon: Gift },
    { name: 'Analytics', href: '/business/analytics', icon: BarChart2 },
    { name: 'Store Settings', href: '/business/settings', icon: Settings },
  ];

  return (
    <>
      <header className="w-full bg-white px-6 md:px-10 py-6 flex items-center justify-between sticky top-0 z-30 border-b border-pehnawa-cream/50 md:border-none">
        
        {/* Mobile Menu Icon */}
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 -ml-2 text-pehnawa-charcoal/70 hover:text-pehnawa-forest-green"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-pehnawa-charcoal/40 group-focus-within:text-pehnawa-forest-green transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-pehnawa-cream rounded-full text-sm placeholder-pehnawa-charcoal/40 focus:outline-none focus:ring-1 focus:ring-pehnawa-forest-green focus:border-pehnawa-forest-green transition-all"
            placeholder="Search products, orders, customers..."
          />
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center space-x-6 md:space-x-8 ml-auto">
          <Link href="/business/notifications" className="text-pehnawa-charcoal/60 hover:text-pehnawa-forest-green transition-colors relative" aria-label="Notifications">
            <Bell className="w-5 h-5" />
            <NotificationBadge />
          </Link>

          <div className="h-6 w-px bg-pehnawa-charcoal/10 hidden sm:block" />

          <button className="flex items-center space-x-3 group" onClick={handleLogout} aria-label="Logout">
            <div className="h-9 w-9 rounded-full bg-pehnawa-cream overflow-hidden border border-pehnawa-charcoal/5 flex items-center justify-center">
              <span className="text-sm font-medium text-pehnawa-forest-green">B</span>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-sm font-medium text-pehnawa-charcoal group-hover:text-pehnawa-forest-green transition-colors">Business</span>
              <LogOut className="w-4 h-4 text-pehnawa-charcoal/50 group-hover:text-red-500 transition-colors" />
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-pehnawa-charcoal/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-72 max-w-sm bg-pehnawa-warm-ivory h-full flex flex-col border-r border-pehnawa-cream shadow-2xl animate-in slide-in-from-left">
            <div className="p-6 flex items-center justify-between border-b border-pehnawa-cream">
              <div className="flex items-center space-x-2">
                 <Leaf className="w-6 h-6 text-pehnawa-forest-green" />
                 <h2 className="text-xl font-serif text-pehnawa-forest-green">Pehnawa</h2>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-pehnawa-charcoal/60 hover:text-pehnawa-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {navItems.map((item) => {
                const active = pathname === item.href || (item.href !== '/business/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      active ? 'bg-pehnawa-forest-green text-white shadow-sm font-medium' : 'text-pehnawa-charcoal/70 hover:bg-white/50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-pehnawa-charcoal/50 group-hover:text-pehnawa-forest-green'}`} />
                    <span className="text-[14px]">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            
            <div className="p-6 border-t border-pehnawa-cream mt-auto">
               <button onClick={handleLogout} className="flex items-center space-x-3 text-pehnawa-charcoal/70 hover:text-red-600 w-full px-4 py-2">
                 <LogOut className="w-5 h-5" />
                 <span className="text-sm font-medium">Log Out</span>
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
