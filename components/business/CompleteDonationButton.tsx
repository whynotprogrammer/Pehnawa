"use client";

import React, { useState } from 'react';
import { approveDonation } from '@/app/actions/donations';
import { Loader2, Gift } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CompleteDonationButton({ donationId, isComplete, canComplete, currentReward }: any) {
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState(100); // Default reward

  const handleComplete = async () => {
    if (!canComplete || loading) return;
    setLoading(true);
    try {
      await approveDonation(donationId, points);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (isComplete) {
    return (
      <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center justify-between">
        <span className="text-sm font-medium text-green-800">Donation Processing Complete</span>
        <div className="flex items-center space-x-1 text-green-700">
          <Gift className="w-4 h-4" />
          <span className="text-sm font-bold">{currentReward} points issued</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-pehnawa-charcoal/60 uppercase tracking-wider mb-1">Issue Reward Points</label>
        <div className="flex items-center space-x-2">
          <input 
            type="number" 
            value={points} 
            onChange={(e) => setPoints(Number(e.target.value))} 
            className="w-24 px-3 py-2 border border-pehnawa-cream rounded-md text-sm outline-none focus:border-pehnawa-forest-green" 
            disabled={!canComplete}
          />
          <span className="text-sm text-pehnawa-charcoal/60">pts</span>
        </div>
      </div>
      
      <button 
        onClick={handleComplete}
        disabled={!canComplete || loading}
        className="w-full py-3 bg-pehnawa-forest-green hover:bg-pehnawa-dark-green text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <CheckCircleIcon className="w-4 h-4" />
            <span>Complete & Issue Rewards</span>
          </>
        )}
      </button>
      
      {!canComplete && (
        <p className="text-xs text-amber-600 text-center">
          You must allocate all items before completing the donation.
        </p>
      )}
    </div>
  );
}

function CheckCircleIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}
