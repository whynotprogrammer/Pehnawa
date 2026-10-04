"use client";

import React, { useState } from 'react';
import { claimDonation } from '@/app/actions/donations';
import { Loader2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ClaimDonationButton({ donationId }: { donationId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClaim = async () => {
    setLoading(true);
    try {
      await claimDonation(donationId);
      router.push(`/business/donations/${donationId}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleClaim}
      disabled={loading}
      className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <Plus className="w-4 h-4" />
          <span>Claim Donation</span>
        </>
      )}
    </button>
  );
}
