// @ts-nocheck
import React from 'react';
import { Bell, CheckCircle2, Package, Gift, HeartHandshake, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import NotificationActions from '@/components/shared/NotificationActions';

export const metadata = {
  title: 'Notifications | Pehnawa',
};

export const dynamic = 'force-dynamic';

export default async function CustomerNotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });

  if (error) console.error(error);

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="w-5 h-5 text-blue-500" />;
      case 'reward': return <Gift className="w-5 h-5 text-purple-500" />;
      case 'donation': return <HeartHandshake className="w-5 h-5 text-green-500" />;
      case 'alert': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Bell className="w-5 h-5 text-pehnawa-charcoal/50" />;
    }
  };

  return (
    <div className="flex flex-col space-y-8 pb-24 max-w-4xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-pehnawa-cream pb-6">
        <div>
          <h2 className="text-3xl font-serif text-pehnawa-charcoal mb-2">Notifications</h2>
          <p className="text-sm text-pehnawa-charcoal/60">
            Stay updated on your orders, donations, and rewards.
          </p>
        </div>
        <NotificationActions />
      </div>

      {!notifications || notifications.length === 0 ? (
        <div className="w-full bg-pehnawa-cream/40 border border-pehnawa-cream rounded-2xl p-16 flex flex-col items-center justify-center text-center">
          <Bell className="w-12 h-12 text-pehnawa-charcoal/20 mb-4" />
          <h3 className="text-xl font-serif text-pehnawa-charcoal mb-2">You're all caught up!</h3>
          <p className="text-sm text-pehnawa-charcoal/60 max-w-md">
            No new notifications at the moment. We'll let you know when something important happens.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`bg-white border rounded-2xl p-6 shadow-sm flex gap-4 transition-colors ${notif.is_read ? 'border-pehnawa-cream opacity-70' : 'border-pehnawa-forest-green bg-pehnawa-forest-green/5'}`}
            >
              <div className="mt-1 flex-shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-base font-medium ${notif.is_read ? 'text-pehnawa-charcoal' : 'text-pehnawa-forest-green'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-xs text-pehnawa-charcoal/40 ml-4 whitespace-nowrap">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-pehnawa-charcoal/70 mb-3">{notif.message}</p>
                {!notif.is_read && (
                  <NotificationActions id={notif.id} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
