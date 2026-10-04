// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Leaf } from 'lucide-react';
import DonationForm from '@/components/customer/DonationForm';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Donate Clothes | Pehnawa',
};

export default async function NewDonationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="flex flex-col space-y-8 pb-24 max-w-4xl mx-auto">
      
      <div>
        <Link href="/customer/donations" className="inline-flex items-center text-sm font-medium text-pehnawa-charcoal/60 hover:text-pehnawa-forest-green transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Donations
        </Link>
        <div className="flex items-center space-x-3 text-pehnawa-forest-green mb-3">
          <Leaf className="w-8 h-8" />
          <h2 className="text-3xl md:text-4xl font-serif text-pehnawa-charcoal">Give your clothes a second life.</h2>
        </div>
        <p className="text-base text-pehnawa-charcoal/70 max-w-2xl leading-relaxed">
          Donate the clothes you no longer wear. Selected pieces may be resold through Pehnawa, while other items can support charitable causes or be transformed into useful upcycled products. 
        </p>
      </div>

      <div className="bg-pehnawa-warm-ivory border border-pehnawa-cream rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 mb-8 shadow-sm">
        <div className="flex-1 space-y-2">
          <div className="w-8 h-8 rounded-full bg-pehnawa-forest-green/10 text-pehnawa-forest-green flex items-center justify-center font-bold mb-3">1</div>
          <h4 className="font-medium text-pehnawa-charcoal">Submit</h4>
          <p className="text-xs text-pehnawa-charcoal/60 leading-relaxed">List the items you wish to donate and upload clear photos of their condition.</p>
        </div>
        <div className="flex-1 space-y-2">
          <div className="w-8 h-8 rounded-full bg-pehnawa-forest-green/10 text-pehnawa-forest-green flex items-center justify-center font-bold mb-3">2</div>
          <h4 className="font-medium text-pehnawa-charcoal">Verify & Sort</h4>
          <p className="text-xs text-pehnawa-charcoal/60 leading-relaxed">Our partners assess each item to direct it to thrift resale, charity, or upcycling.</p>
        </div>
        <div className="flex-1 space-y-2">
          <div className="w-8 h-8 rounded-full bg-pehnawa-forest-green/10 text-pehnawa-forest-green flex items-center justify-center font-bold mb-3">3</div>
          <h4 className="font-medium text-pehnawa-charcoal">Earn Rewards</h4>
          <p className="text-xs text-pehnawa-charcoal/60 leading-relaxed">Receive reward points for approved donations, redeemable on sustainable purchases.</p>
        </div>
      </div>

      <hr className="border-pehnawa-cream" />

      <div>
        <h3 className="text-xl font-serif text-pehnawa-charcoal mb-6">Donation Details</h3>
        <DonationForm />
      </div>

    </div>
  );
}
