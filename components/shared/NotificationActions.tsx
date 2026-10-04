"use client";

import React, { useState } from 'react';
import { markAsRead, markAllAsRead } from '@/app/actions/notifications';
import { Check, CheckCircle2, Loader2 } from 'lucide-react';

export default function NotificationActions({ id }: { id?: string }) {
  const [loading, setLoading] = useState(false);

  const handleMarkAsRead = async () => {
    if (loading) return;
    setLoading(true);
    if (id) {
      await markAsRead(id);
    } else {
      await markAllAsRead();
    }
    setLoading(false);
  };

  if (id) {
    return (
      <button 
        onClick={handleMarkAsRead}
        disabled={loading}
        className="self-start flex items-center space-x-1 text-xs font-medium text-pehnawa-forest-green hover:text-pehnawa-dark-green transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
        <span>Mark as read</span>
      </button>
    );
  }

  return (
    <button 
      onClick={handleMarkAsRead}
      disabled={loading}
      className="inline-flex items-center space-x-2 text-sm font-medium text-pehnawa-charcoal/60 hover:text-pehnawa-forest-green transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
      <span>Mark all as read</span>
    </button>
  );
}
