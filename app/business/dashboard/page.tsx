import React from 'react';
import { ArrowRight, Package, ShoppingBag, Users, IndianRupee, ArrowUpRight, Leaf } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Business Dashboard | Pehnawa',
};

const STATS = [
  { label: 'Total Products', value: '124', change: '12%', up: true, icon: Package },
  { label: 'Total Orders', value: '86', change: '18%', up: true, icon: ShoppingBag },
  { label: 'Total Customers', value: '68', change: '15%', up: true, icon: Users },
  { label: 'Total Sales', value: '₹1,24,500', change: '22%', up: true, icon: IndianRupee },
];

const RECENT_ORDERS = [
  { id: '#ORD-1024', customer: 'Priya Sharma', date: 'Apr 25, 2025', status: 'Processing', amount: '₹1,899', image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a68f0?w=150&q=80' },
  { id: '#ORD-1023', customer: 'Rohan Mehta', date: 'Apr 24, 2025', status: 'Shipped', amount: '₹2,499', image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=150&q=80' },
  { id: '#ORD-1022', customer: 'Sneha Kapoor', date: 'Apr 23, 2025', status: 'Delivered', amount: '₹1,299', image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=150&q=80' },
  { id: '#ORD-1021', customer: 'Aarav Singh', date: 'Apr 22, 2025', status: 'Processing', amount: '₹3,499', image: 'https://images.unsplash.com/photo-1604198158504-20d09995cbf5?w=150&q=80' },
];

const LOW_STOCK = [
  { name: 'Oversized Jacket', variant: 'Size M, L', left: 5, image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=150&q=80' },
  { name: 'Knit Sweater', variant: 'Size S, M', left: 3, image: 'https://images.unsplash.com/photo-1621072156002-e2f5dc6129cb?w=150&q=80' },
  { name: 'Denim Jeans', variant: 'Size 28, 30', left: 2, image: 'https://images.unsplash.com/photo-1604198158504-20d09995cbf5?w=150&q=80' },
  { name: 'Shoulder Bag', variant: 'One size', left: 1, image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=150&q=80' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Processing': return 'bg-orange-100 text-orange-700';
    case 'Shipped': return 'bg-blue-100 text-blue-700';
    case 'Delivered': return 'bg-green-100 text-green-700';
    case 'Cancelled': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export default function BusinessDashboard() {
  return (
    <div className="flex flex-col space-y-6 pb-20">
      
      {/* 1. HERO BANNER */}
      <section className="relative w-full rounded-2xl overflow-hidden bg-[#D8D0C4]/30 flex flex-col md:flex-row border border-pehnawa-cream shadow-sm">
        <div className="p-8 md:p-12 flex-1 flex flex-col justify-center relative z-10 bg-[#D3CABB]/20 backdrop-blur-sm">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4 text-pehnawa-charcoal/60">
            Welcome back,
          </p>
          <h2 className="text-4xl md:text-5xl font-serif leading-[1.1] mb-4 text-pehnawa-charcoal">
            The Vintage Wardrobe
          </h2>
          <p className="text-lg text-pehnawa-charcoal/80 mb-6 font-medium">
            Your thrift store is making a difference.
          </p>
          <div className="flex items-center space-x-2 text-sm text-pehnawa-charcoal/60 mb-8">
            <span>Quality Pre-loved Fashion</span>
            <span>|</span>
            <span>Happy Customers</span>
            <span>|</span>
            <span>A Greener Tomorrow</span>
          </div>
          <div>
            <Link href="/business/products" className="inline-flex items-center space-x-2 bg-pehnawa-forest-green hover:bg-pehnawa-dark-green text-white px-6 py-3 rounded-full text-sm font-medium transition-colors duration-300">
              <span>Manage Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div 
          className="w-full md:w-5/12 h-64 md:h-auto bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2000&auto=format&fit=crop')" }}
        />
      </section>

      {/* 2. STATS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-pehnawa-warm-ivory border border-pehnawa-cream rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-pehnawa-forest-green/10 rounded-full text-pehnawa-forest-green">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-pehnawa-charcoal/60">{stat.label}</span>
                </div>
              </div>
              <div className="mt-auto">
                <div className="text-3xl font-serif text-pehnawa-charcoal mb-2">{stat.value}</div>
                <div className="flex items-center text-xs">
                  <ArrowUpRight className="w-3 h-3 text-pehnawa-forest-green mr-1" />
                  <span className="text-pehnawa-forest-green font-medium mr-1">{stat.change}</span>
                  <span className="text-pehnawa-charcoal/50">vs last month</span>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3. RECENT ORDERS (Takes up 1 column on LG, actually maybe 1.2, but 3 cols is good) */}
        <section className="bg-pehnawa-warm-ivory border border-pehnawa-cream rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-serif text-pehnawa-charcoal">Recent Orders</h3>
            <Link href="/business/orders" className="text-xs font-medium text-pehnawa-charcoal/70 hover:text-pehnawa-forest-green flex items-center">
              View all <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          <div className="flex flex-col space-y-4">
            {RECENT_ORDERS.map((order, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={order.image} alt={order.id} className="w-12 h-12 rounded-lg object-cover bg-pehnawa-cream" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-pehnawa-charcoal">{order.id}</span>
                    <span className="text-xs text-pehnawa-charcoal/60">{order.customer} · {order.date}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${getStatusBadge(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-medium text-pehnawa-charcoal w-16 text-right">{order.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. SALES OVERVIEW */}
        <section className="bg-pehnawa-warm-ivory border border-pehnawa-cream rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-serif text-pehnawa-charcoal">Sales Overview</h3>
            <select className="text-xs bg-white border border-pehnawa-cream text-pehnawa-charcoal/70 rounded-full px-3 py-1 outline-none">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="flex-1 flex items-end relative min-h-[180px]">
            {/* Simple CSS-based Area Chart representation */}
            <div className="w-full h-full absolute inset-0 flex flex-col justify-between text-[10px] text-pehnawa-charcoal/40 pb-6 pr-2">
              <span>20K</span>
              <span>15K</span>
              <span>10K</span>
              <span>5K</span>
              <span>0</span>
            </div>
            <div className="w-full h-[80%] ml-6 border-l border-b border-pehnawa-cream/50 relative">
              {/* SVG Line path for mock chart */}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1C4A2D" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#1C4A2D" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,80 L16,65 L33,55 L50,48 L66,35 L83,38 L100,20 L100,100 L0,100 Z" fill="url(#gradient)" />
                <path d="M0,80 L16,65 L33,55 L50,48 L66,35 L83,38 L100,20" fill="none" stroke="#1C4A2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="0" cy="80" r="3" fill="#1C4A2D" />
                <circle cx="16" cy="65" r="3" fill="#1C4A2D" />
                <circle cx="33" cy="55" r="3" fill="#1C4A2D" />
                <circle cx="50" cy="48" r="3" fill="#1C4A2D" />
                <circle cx="66" cy="35" r="3" fill="#1C4A2D" />
                <circle cx="83" cy="38" r="3" fill="#1C4A2D" />
                <circle cx="100" cy="20" r="3" fill="#1C4A2D" />
              </svg>
              <div className="absolute -bottom-6 w-full flex justify-between text-[10px] text-pehnawa-charcoal/40 px-1">
                <span>Apr 19</span>
                <span>Apr 20</span>
                <span>Apr 21</span>
                <span>Apr 22</span>
                <span>Apr 23</span>
                <span>Apr 24</span>
                <span>Apr 25</span>
              </div>
            </div>
          </div>
          <div className="mt-8 flex items-center bg-pehnawa-forest-green/5 rounded-xl p-4 space-x-3">
            <Leaf className="w-5 h-5 text-pehnawa-forest-green" />
            <p className="text-xs text-pehnawa-charcoal/80 font-medium">Your store is contributing to a<br/>more sustainable tomorrow.</p>
          </div>
        </section>

        {/* 5. LOW STOCK & SUSTAINABILITY */}
        <div className="flex flex-col space-y-6">
          <section className="bg-pehnawa-warm-ivory border border-pehnawa-cream rounded-2xl p-6 shadow-sm flex flex-col flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-serif text-pehnawa-charcoal">Low Stock Alert</h3>
              <Link href="/business/inventory" className="text-xs font-medium text-pehnawa-charcoal/70 hover:text-pehnawa-forest-green flex items-center">
                View all <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
            <div className="flex flex-col space-y-4">
              {LOW_STOCK.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-pehnawa-cream" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-pehnawa-charcoal">{item.name}</span>
                      <span className="text-xs text-pehnawa-charcoal/60">{item.variant}</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-pehnawa-burgundy">{item.left} left</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-pehnawa-forest-green/5 border border-pehnawa-forest-green/10 rounded-2xl p-6 shadow-sm flex items-center justify-between cursor-pointer hover:bg-pehnawa-forest-green/10 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-pehnawa-forest-green/10 rounded-full text-pehnawa-forest-green">
                <Leaf className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-pehnawa-charcoal">Support circular fashion</span>
                <span className="text-xs text-pehnawa-charcoal/60">Every purchase gives pre-loved clothes<br/>a second life.</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-pehnawa-charcoal/40" />
          </section>
        </div>

      </div>

    </div>
  );
}
