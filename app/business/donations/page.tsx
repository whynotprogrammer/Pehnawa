// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import { Package, Search, Filter, Eye, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ClaimDonationButton from '@/components/business/ClaimDonationButton';

export const metadata = {
  title: 'Donation Management | Pehnawa Business',
};

export const dynamic = 'force-dynamic';

export default async function BusinessDonationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).single();
  
  // 1. Fetch donations assigned to this business
  let myDonations = [];
  if (business) {
    const { data: assigned } = await supabase
      .from('donations')
      .select(`
        id, status, submitted_at, total_items, 
        profiles!donations_customer_id_fkey ( full_name, email )
      `)
      .eq('business_id', business.id)
      .order('updated_at', { ascending: false });
    myDonations = assigned || [];
  }

  // 2. Fetch unassigned donations for claiming
  const { data: poolDonations } = await supabase
    .from('donations')
    .select(`
      id, status, submitted_at, total_items,
      profiles!donations_customer_id_fkey ( full_name )
    `)
    .is('business_id', null)
    .eq('status', 'SUBMITTED')
    .order('submitted_at', { ascending: false })
    .limit(10);

  return (
    <div className="flex flex-col space-y-8 pb-20">
      
      <div>
        <h2 className="text-3xl font-serif text-pehnawa-charcoal mb-1">Donation Management</h2>
        <p className="text-sm text-pehnawa-charcoal/60">Review submitted clothing, sort, and allocate to thrift, charity or upcycling.</p>
      </div>

      {/* Unassigned Pool */}
      {poolDonations && poolDonations.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-medium text-amber-900">New Donations Available</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {poolDonations.map(don => (
              <div key={don.id} className="bg-white border border-amber-100 rounded-xl p-4 shadow-sm flex flex-col">
                <span className="text-xs font-semibold text-amber-600 mb-1">ID: {don.id.split('-')[0]}</span>
                <span className="text-sm font-medium text-pehnawa-charcoal">{don.profiles?.full_name || 'Anonymous User'}</span>
                <span className="text-xs text-pehnawa-charcoal/60 mb-4">{don.total_items} items • {new Date(don.submitted_at).toLocaleDateString()}</span>
                
                <div className="mt-auto">
                  <ClaimDonationButton donationId={don.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-pehnawa-warm-ivory border border-pehnawa-cream rounded-2xl shadow-sm p-4 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-pehnawa-charcoal/40 group-focus-within:text-pehnawa-forest-green" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2.5 bg-white border border-pehnawa-cream rounded-xl text-sm placeholder-pehnawa-charcoal/40 focus:outline-none focus:border-pehnawa-forest-green transition-all"
            placeholder="Search donations by ID or Donor..."
          />
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-white px-4 py-2.5 border border-pehnawa-cream rounded-xl text-sm text-pehnawa-charcoal/70 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* My Assigned Donations */}
      {!myDonations || myDonations.length === 0 ? (
        <div className="bg-white border border-pehnawa-cream rounded-2xl p-16 flex flex-col items-center justify-center text-center">
          <Package className="w-12 h-12 text-pehnawa-charcoal/20 mb-4" />
          <h3 className="text-xl font-serif text-pehnawa-charcoal mb-2">No assigned donations</h3>
          <p className="text-sm text-pehnawa-charcoal/60 max-w-md">
            You are not currently processing any donations. Claim a donation from the pool above when available.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-pehnawa-cream rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-pehnawa-cream bg-pehnawa-warm-ivory/50">
                  <th className="py-4 px-6 text-xs font-semibold text-pehnawa-charcoal/60 uppercase tracking-wider">Donation ID</th>
                  <th className="py-4 px-6 text-xs font-semibold text-pehnawa-charcoal/60 uppercase tracking-wider">Donor</th>
                  <th className="py-4 px-6 text-xs font-semibold text-pehnawa-charcoal/60 uppercase tracking-wider">Date</th>
                  <th className="py-4 px-6 text-xs font-semibold text-pehnawa-charcoal/60 uppercase tracking-wider">Items</th>
                  <th className="py-4 px-6 text-xs font-semibold text-pehnawa-charcoal/60 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-xs font-semibold text-pehnawa-charcoal/60 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pehnawa-cream">
                {myDonations.map((don) => {
                  const getStatusColor = (status: string) => {
                    switch(status) {
                      case 'COMPLETED': return 'bg-green-50 text-green-700 border-green-200';
                      case 'ALLOCATED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                      case 'SORTING': return 'bg-blue-50 text-blue-700 border-blue-200';
                      case 'UNDER_REVIEW': return 'bg-purple-50 text-purple-700 border-purple-200';
                      case 'REJECTED': return 'bg-red-50 text-red-700 border-red-200';
                      default: return 'bg-gray-50 text-gray-700 border-gray-200';
                    }
                  };

                  return (
                    <tr key={don.id} className="hover:bg-pehnawa-warm-ivory/50 transition-colors">
                      <td className="py-4 px-6 text-sm font-medium text-pehnawa-charcoal">...{don.id.split('-')[0]}</td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-pehnawa-charcoal">{don.profiles?.full_name || 'Unknown'}</span>
                          <span className="text-xs text-pehnawa-charcoal/50">{don.profiles?.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-pehnawa-charcoal/70">
                        {new Date(don.submitted_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-pehnawa-charcoal">
                        {don.total_items}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(don.status)}`}>
                          {don.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link 
                          href={`/business/donations/${don.id}`} 
                          className="inline-flex items-center justify-center space-x-1 px-3 py-1.5 bg-pehnawa-forest-green/10 text-pehnawa-forest-green hover:bg-pehnawa-forest-green hover:text-white rounded-md text-sm font-medium transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
