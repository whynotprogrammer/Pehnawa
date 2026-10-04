// @ts-nocheck
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/app/actions/notifications'

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const supabase = await createClient()
  
  const { data: order, error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)
    .select('customer_id, total_amount')
    .single()

  if (error) throw new Error(error.message)

  // Trigger Notifications
  if (newStatus === 'shipped') {
    await createNotification(order.customer_id, 'Order Shipped', `Your order #${orderId.split('-')[0]} for ₹${order.total_amount} is on its way!`, 'order')
  } else if (newStatus === 'delivered') {
    await createNotification(order.customer_id, 'Order Delivered', `Your order #${orderId.split('-')[0]} has been delivered successfully.`, 'order')
  }

  revalidatePath('/business/orders')
  revalidatePath(`/business/orders/${orderId}`)
  revalidatePath('/customer/orders')
  revalidatePath(`/customer/orders/${orderId}`)
}
