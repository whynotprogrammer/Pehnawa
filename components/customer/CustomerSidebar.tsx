"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Sparkles, HeartHandshake, Gift, Package, Heart, User, Leaf } from 'lucide-react';

const navItems = [
  { name: 'Home', href: '/customer/dashboard', icon: Home },
  { name: 'Shop', href: '/customer/shop', icon: ShoppingBag },
  { name: 'AI Stylist', href: '/customer/ai-stylist', icon: Sparkles },
  { name: 'Donations', href: '/customer/donations', icon: HeartHandshake },
  { name: 'Rewards', href: '/customer/rewards', icon: Gift },
  { name: 'My Orders', href: '/customer/orders', icon: Package },
  { name: 'Wishlist', href: '/customer/wishlist', icon: Heart },
  { name: 'Profile', href: '/customer/profile', icon: User },
];

export default function CustomerSidebar() {
  const pathname = usePathname();
  
  // Make active state dynamic rather than hardcoded to Home
  const isActive = (href: string) => {
    if (href === '/customer/dashboard' && pathname === '/customer/dashboard') return true;
    if (href !== '/customer/dashboard' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <aside className="hidden md:flex flex-col w-72 h-screen fixed left-0 top-0 bg-pehnawa-warm-ivory border-r border-pehnawa-cream/50 z-20">
      
      {/* Brand Header */}
      <div className="p-10 pb-8 flex flex-col items-start">
        <h1 className="text-2xl font-serif tracking-widest uppercase text-pehnawa-forest-green mb-1">
          Pehnawa
        </h1>
        <p className="text-xs tracking-widest text-pehnawa-charcoal/60 uppercase font-medium">
          Wear. Rewear. Redefine.
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors duration-200 group
                ${active 
                  ? 'bg-pehnawa-forest-green/5 text-pehnawa-forest-green font-medium' 
                  : 'text-pehnawa-charcoal/70 hover:bg-pehnawa-forest-green/5 hover:text-pehnawa-forest-green'
                }
              `}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-pehnawa-forest-green' : 'text-pehnawa-charcoal/50 group-hover:text-pehnawa-forest-green'}`} />
              <span className="text-[15px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Message */}
      <div className="p-10 pt-8 mt-auto">
        <div className="flex flex-col items-start space-y-2">
          <Leaf className="w-5 h-5 text-pehnawa-forest-green/70" />
          <p className="text-sm font-serif text-pehnawa-charcoal/70 leading-relaxed">
            Small choices.<br />
            Big impact.
          </p>
        </div>
      </div>
    </aside>
  );
}
