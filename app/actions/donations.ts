// @ts-nocheck
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

import { createNotification } from '@/app/actions/notifications';
export async function submitDonation(items: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // 1. Create parent Donation record
  const { data: donation, error: donationError } = await supabase
    .from('donations')
    .insert({
      customer_id: user.id,
      status: 'SUBMITTED',
      total_items: items.length
    })
    .select('id')
    .single()

  if (donationError) throw new Error('Failed to create donation record: ' + donationError.message)

  // 2. Create Donation Items
  const formattedItems = items.map(item => ({
    donation_id: donation.id,
    clothing_type: item.clothing_type,
    category: item.category,
    brand: item.brand || null,
    size: item.size || null,
    condition: item.condition,
    description: item.description,
    image_urls: item.image_urls
  }))

  const { error: itemsError } = await supabase
    .from('donation_items')
    .insert(formattedItems)

  if (itemsError) throw new Error('Failed to save donation items: ' + itemsError.message)

  // Notify all business owners of a new donation available
  const { data: businesses } = await supabase.from('businesses').select('owner_id')
  if (businesses) {
    for (const b of businesses) {
      await createNotification(b.owner_id, 'New Donation Available', 'A customer has submitted a new donation. Claim it in your dashboard.', 'donation')
    }
  }

  revalidatePath('/customer/donations')
  return donation.id
}

// Business Actions

export async function claimDonation(donationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  // Get business ID
  const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).single()
  if (!business) throw new Error('No business found')

  const { error } = await supabase
    .from('donations')
    .update({ 
      business_id: business.id,
      status: 'UNDER_REVIEW',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', donationId)
    .is('business_id', null) // Only claim unassigned

  if (error) throw new Error(error.message)
  revalidatePath('/business/donations')
  revalidatePath(`/business/donations/${donationId}`)
}

export async function allocateDonationItem(
  donationId: string, 
  itemId: string, 
  destination: string, 
  details: any
) {
  const supabase = await createClient()

  // 1. Update item status
  await supabase.from('donation_items').update({
    destination,
    destination_status: 'Allocated'
  }).eq('id', itemId)

  // 2. Create allocation record
  await supabase.from('donation_allocations').insert({
    donation_id: donationId,
    donation_item_id: itemId,
    destination,
    quantity: 1,
    organization_name: details.organization_name || null,
    intended_use: details.intended_use || null,
    status: 'Pending',
    notes: details.notes || null
  })

  // 3. If Thrift Store, convert to Product
  if (destination === 'THRIFT_STORE' && details.product) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).single()
    
    await supabase.from('products').insert({
      business_id: business.id,
      donation_item_id: itemId,
      name: details.product.name,
      description: details.product.description,
      brand: details.product.brand,
      price: details.product.price,
      original_price: details.product.original_price,
      condition: details.product.condition,
      category_id: null, // Skip for now unless provided
      sizes: details.product.size ? [details.product.size] : [],
      stock_quantity: 1,
      status: 'published'
    })
    // Insert images would ideally happen too, but requires passing them or copying them.
  }

  // 4. Check if all items are allocated to update Donation Status
  const { data: allItems } = await supabase.from('donation_items').select('destination').eq('donation_id', donationId)
  const unallocated = allItems?.filter(i => !i.destination) || []
  
  if (unallocated.length === 0) {
    // All items allocated, let's mark it as SORTING or COMPLETED based on logic
    // For simplicity, mark ALLOCATED
    await supabase.from('donations').update({ status: 'ALLOCATED' }).eq('id', donationId)
  } else {
    // Still sorting
    await supabase.from('donations').update({ status: 'SORTING' }).eq('id', donationId)
  }

  revalidatePath(`/business/donations/${donationId}`)
}

export async function approveDonation(donationId: string, rewardPoints: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: donation } = await supabase.from('donations').select('customer_id, status').eq('id', donationId).single()
  if (!donation || donation.status === 'COMPLETED') throw new Error('Invalid donation')

  await supabase.from('donations').update({ 
    status: 'COMPLETED',
    reward_points: rewardPoints
  }).eq('id', donationId)

  // Generate reward points for the customer
  if (rewardPoints > 0) {
    await supabase.from('reward_transactions').insert({
      customer_id: donation.customer_id,
      donation_id: donationId,
      type: 'earned',
      points: rewardPoints,
      description: 'Reward for approved clothing donation'
    })
    // Notification for reward
    await createNotification(donation.customer_id, 'Reward Received', `You earned ${rewardPoints} points for your recent donation!`, 'reward')
  }

  // Notification for approved donation
  await createNotification(donation.customer_id, 'Donation Completed', `Your donation #${donationId.split('-')[0]} has been reviewed and allocated successfully.`, 'donation')

  revalidatePath(`/business/donations/${donationId}`)
  revalidatePath('/business/donations')
}

export async function rejectDonation(donationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: donation } = await supabase.from('donations').select('customer_id, status').eq('id', donationId).single()
  if (!donation) throw new Error('Invalid donation')

  await supabase.from('donations').update({ 
    status: 'REJECTED'
  }).eq('id', donationId)

  await createNotification(donation.customer_id, 'Donation Rejected', `Unfortunately, your donation #${donationId.split('-')[0]} was not approved for processing.`, 'donation')

  revalidatePath(`/business/donations/${donationId}`)
  revalidatePath('/business/donations')
}
