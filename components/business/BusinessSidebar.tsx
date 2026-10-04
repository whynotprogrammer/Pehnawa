"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  ShoppingBag, 
  Package, 
  FileText, 
  Users, 
  HeartHandshake, 
  Gift, 
  BarChart2, 
  Settings,
  Leaf
} from 'lucide-react';

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

export default function BusinessSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => { if (href === "/business/dashboard" && pathname === "/business/dashboard") return true; if (href !== "/business/dashboard" && pathname.startsWith(href)) return true;
    
    return false;
  };

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 h-screen fixed left-0 top-0 bg-pehnawa-warm-ivory border-r border-pehnawa-cream/80 z-20">
      
      {/* Brand Header */}
      <div className="p-8 pb-8 flex items-center space-x-3">
        <Leaf className="w-8 h-8 text-pehnawa-forest-green" />
        <div className="flex flex-col">
          <h1 className="text-2xl font-serif text-pehnawa-forest-green">Pehnawa</h1>
          <p className="text-[10px] tracking-widest text-pehnawa-charcoal/60 uppercase font-medium">
            Wear. Rewear. Redefine.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto hide-scrollbar">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${active 
                  ? 'bg-pehnawa-forest-green text-white font-medium shadow-sm' 
                  : 'text-pehnawa-charcoal/70 hover:bg-pehnawa-forest-green/5 hover:text-pehnawa-forest-green'
                }
              `}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-pehnawa-charcoal/50 group-hover:text-pehnawa-forest-green'}`} />
              <span className="text-[14px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Message */}
      <div className="p-8 pt-8 mt-auto">
        <div className="flex items-start space-x-3">
          <Leaf className="w-5 h-5 text-pehnawa-forest-green/60 mt-1" />
          <p className="text-sm font-serif text-pehnawa-charcoal/70 leading-relaxed">
            Small choices.<br />
            Big impact.
          </p>
        </div>
      </div>
    </aside>
  );
}
