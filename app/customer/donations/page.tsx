// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import { HeartHandshake, Plus, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'My Donations | Pehnawa',
};

export const dynamic = 'force-dynamic';

export default async function CustomerDonationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: donations, error } = await supabase
    .from('donations')
    .select(`
      id, status, submitted_at, total_items, reward_points,
      donation_items ( destination )
    `)
    .eq('customer_id', user.id)
    .order('submitted_at', { ascending: false });

  return (
    <div className="flex flex-col space-y-8 pb-24">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif text-pehnawa-charcoal mb-2">My Donations</h2>
          <p className="text-sm text-pehnawa-charcoal/60">
            Track your impact and see how your pre-loved clothes are given a second life.
          </p>
        </div>
        <Link 
          href="/customer/donations/new" 
          className="inline-flex items-center justify-center space-x-2 bg-pehnawa-forest-green hover:bg-pehnawa-dark-green text-white px-6 py-3 rounded-full text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Donate Clothes</span>
        </Link>
      </div>

      {!donations || donations.length === 0 ? (
        <div className="w-full bg-pehnawa-cream/40 border border-pehnawa-cream rounded-2xl p-16 flex flex-col items-center justify-center text-center">
          <HeartHandshake className="w-12 h-12 text-pehnawa-charcoal/20 mb-4" />
          <h3 className="text-xl font-serif text-pehnawa-charcoal mb-2">Start your sustainability journey</h3>
          <p className="text-sm text-pehnawa-charcoal/60 max-w-md mb-8">
            Clear out your closet and help the planet. Donate the clothes you no longer wear to be resold, given to charity, or upcycled.
          </p>
          <Link 
            href="/customer/donations/new" 
            className="inline-flex items-center space-x-2 bg-pehnawa-forest-green hover:bg-pehnawa-dark-green text-white px-8 py-3.5 rounded-full text-sm font-medium transition-colors"
          >
            <span>Start a Donation</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {donations.map((donation) => {
            // Calculate breakdown
            let thrift = 0, charity = 0, upcycling = 0, recycling = 0;
            donation.donation_items.forEach(i => {
              if (i.destination === 'THRIFT_STORE') thrift++;
              if (i.destination === 'CHARITY') charity++;
              if (i.destination === 'UPCYCLING') upcycling++;
              if (i.destination === 'TEXTILE_RECOVERY') recycling++;
            });

            const getStatusBadge = (status: string) => {
              switch(status) {
                case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
                case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
                case 'SUBMITTED': return 'bg-gray-100 text-gray-700 border-gray-200';
                default: return 'bg-blue-100 text-blue-700 border-blue-200'; // Under review, sorting, allocated
              }
            };

            return (
              <div key={donation.id} className="bg-white border border-pehnawa-cream rounded-2xl p-6 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-6 border-b border-pehnawa-cream pb-4">
                  <div>
                    <span className="text-xs text-pehnawa-charcoal/50 uppercase tracking-wider block mb-1">Donation #{donation.id.split('-')[0]}</span>
                    <span className="text-sm font-medium text-pehnawa-charcoal">
                      {new Date(donation.submitted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${getStatusBadge(donation.status)}`}>
                    {donation.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-pehnawa-charcoal/70">Total Items Submitted</span>
                    <span className="font-semibold text-pehnawa-charcoal">{donation.total_items}</span>
                  </div>
                  
                  {donation.status !== 'SUBMITTED' && donation.status !== 'REJECTED' && (
                    <div className="bg-pehnawa-warm-ivory p-4 rounded-xl space-y-2 border border-pehnawa-cream">
                      <p className="text-xs font-semibold text-pehnawa-charcoal/50 uppercase tracking-widest mb-2">Allocation Impact</p>
                      {thrift > 0 && <div className="flex justify-between text-sm"><span className="text-pehnawa-charcoal/80">Selected for Thrift Resale</span><span className="font-medium text-pehnawa-forest-green">{thrift}</span></div>}
                      {charity > 0 && <div className="flex justify-between text-sm"><span className="text-pehnawa-charcoal/80">Allocated to Charity</span><span className="font-medium text-pehnawa-forest-green">{charity}</span></div>}
                      {upcycling > 0 && <div className="flex justify-between text-sm"><span className="text-pehnawa-charcoal/80">Sent for Upcycling</span><span className="font-medium text-pehnawa-forest-green">{upcycling}</span></div>}
                      {recycling > 0 && <div className="flex justify-between text-sm"><span className="text-pehnawa-charcoal/80">Textile Recycling</span><span className="font-medium text-pehnawa-forest-green">{recycling}</span></div>}
                      
                      {thrift === 0 && charity === 0 && upcycling === 0 && recycling === 0 && (
                        <p className="text-xs text-pehnawa-charcoal/60 italic">Items are currently being sorted...</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-pehnawa-cream flex justify-between items-center">
                  <span className="text-sm font-medium text-pehnawa-charcoal/70">Rewards Earned</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-pehnawa-forest-green" />
                    <span className="text-lg font-serif text-pehnawa-forest-green">{donation.reward_points} pts</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
