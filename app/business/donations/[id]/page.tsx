// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Box, MapPin, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import DonationItemReview from '@/components/business/DonationItemReview';
import CompleteDonationButton from '@/components/business/CompleteDonationButton';

export const metadata = {
  title: 'Donation Inspection | Pehnawa Business',
};

export const dynamic = 'force-dynamic';

export default async function DonationInspectionPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  const { data: donation, error } = await supabase
    .from('donations')
    .select(`
      *,
      profiles!donations_customer_id_fkey ( full_name, email ),
      donation_items (
        id, clothing_type, category, brand, size, condition, description, image_urls, destination, destination_status
      )
    `)
    .eq('id', params.id)
    .single();

  if (error || !donation) {
    notFound();
  }

  const allAllocated = donation.donation_items.every((i: any) => i.destination !== null);

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
    <div className="flex flex-col space-y-8 pb-24">
      
      {/* Header */}
      <div>
        <Link href="/business/donations" className="inline-flex items-center text-sm font-medium text-pehnawa-charcoal/60 hover:text-pehnawa-forest-green transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Donations
        </Link>
        <div className="flex items-center space-x-4 mb-2">
          <h2 className="text-3xl font-serif text-pehnawa-charcoal">Donation #{donation.id.split('-')[0]}</h2>
          <span className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${getStatusColor(donation.status)}`}>
            {donation.status.replace('_', ' ')}
          </span>
        </div>
        <p className="text-sm text-pehnawa-charcoal/60">Review and allocate donated items.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Items List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-serif text-pehnawa-charcoal mb-2">Items to Review ({donation.total_items})</h3>
          
          <div className="space-y-6">
            {donation.donation_items.map((item: any, index: number) => (
              <DonationItemReview key={item.id} item={item} donationId={donation.id} index={index + 1} />
            ))}
          </div>
        </div>

        {/* Right: Sidebar Info */}
        <div className="space-y-6">
          
          <div className="bg-white border border-pehnawa-cream rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-serif text-pehnawa-charcoal mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-pehnawa-forest-green" /> Donor Information
            </h3>
            <div className="space-y-1">
              <p className="text-base font-medium text-pehnawa-charcoal">{donation.profiles?.full_name || 'Anonymous'}</p>
              <p className="text-sm text-pehnawa-charcoal/60">{donation.profiles?.email}</p>
            </div>
            
            <hr className="border-pehnawa-cream my-4" />
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-pehnawa-charcoal/70">
                <span>Submitted:</span>
                <span className="font-medium text-pehnawa-charcoal">{new Date(donation.submitted_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-pehnawa-charcoal/70">
                <span>Total Items:</span>
                <span className="font-medium text-pehnawa-charcoal">{donation.total_items}</span>
              </div>
            </div>
          </div>

          <div className="bg-pehnawa-warm-ivory border border-pehnawa-cream rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-serif text-pehnawa-charcoal mb-4 flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-pehnawa-forest-green" /> Completion
            </h3>
            <p className="text-sm text-pehnawa-charcoal/70 mb-6 leading-relaxed">
              Once all items have been allocated a destination (Thrift, Charity, Upcycling, Recycling, or Rejected), you can finalize this donation and issue reward points to the customer.
            </p>
            
            <CompleteDonationButton 
              donationId={donation.id} 
              isComplete={donation.status === 'COMPLETED'}
              canComplete={allAllocated && donation.status !== 'COMPLETED'}
              currentReward={donation.reward_points}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
