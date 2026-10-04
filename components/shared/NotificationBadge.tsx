"use client";

import React, { useEffect, useState } from 'react';
import { getUnreadCount } from '@/app/actions/notifications';

export default function NotificationBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const c = await getUnreadCount();
      setCount(c);
    };
    fetchCount();
  }, []);

  if (count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-pehnawa-burgundy text-[9px] font-bold text-white ring-2 ring-pehnawa-warm-ivory">
      {count > 9 ? '9+' : count}
    </span>
  );
}
