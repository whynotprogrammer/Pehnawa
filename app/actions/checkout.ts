// @ts-nocheck
'use server'

import { createClient } from '@/lib/supabase/server'
import { getCartId } from '@/app/actions/shop'
import { revalidatePath } from 'next/cache'

import { createNotification } from '@/app/actions/notifications';
export async function processCheckout(addressData: any) {
  const supabase = await createClient()
  
  // 1. Validate User
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // 2. Fetch Cart and Items
  const cartId = await getCartId()
  const { data: cartItems, error: cartError } = await supabase
    .from('cart_items')
    .select(`
      id, quantity, size, color, product_id,
      products (
        id, business_id, name, price, stock_quantity, status
      )
    `)
    .eq('cart_id', cartId)

  if (cartError || !cartItems || cartItems.length === 0) {
    throw new Error('Your cart is empty or could not be loaded.')
  }

  // 3. Validate Stock & Status
  for (const item of cartItems) {
    const p = item.products
    if (!p) throw new Error('A product in your cart no longer exists.')
    if (p.status !== 'published') throw new Error(`Product "${p.name}" is no longer available.`)
    if (p.stock_quantity < item.quantity) throw new Error(`Insufficient stock for "${p.name}". Only ${p.stock_quantity} left.`)
  }

  // 4. Save Shipping Address
  const { data: address, error: addressError } = await supabase
    .from('addresses')
    .insert({
      profile_id: user.id,
      type: 'shipping',
      address_line1: addressData.address_line1,
      address_line2: addressData.address_line2 || null,
      city: addressData.city,
      state: addressData.state,
      postal_code: addressData.postal_code,
      country: 'India',
      is_default: true
    })
    .select('id')
    .single()

  if (addressError) throw new Error('Failed to save shipping address.')

  // 5. Group by Business (Marketplace logic: 1 order per business)
  const itemsByBusiness = {}
  cartItems.forEach(item => {
    const bId = item.products.business_id
    if (!itemsByBusiness[bId]) itemsByBusiness[bId] = []
    itemsByBusiness[bId].push(item)
  })

  const createdOrderIds = []

  // 6. Transactional-like sequential processing
  for (const businessId of Object.keys(itemsByBusiness)) {
    const businessItems = itemsByBusiness[businessId]
    
    // Calculate total
    let businessTotal = 0
    businessItems.forEach(item => {
      businessTotal += (item.products.price * item.quantity)
    })
    
    // Add shipping logic per business if needed (we'll do flat 99 if under 5000 for simplicity)
    const shipping = businessTotal > 5000 ? 0 : 99
    businessTotal += shipping

    // Create Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: user.id,
        business_id: businessId,
        total_amount: businessTotal,
        status: 'pending',
        payment_status: 'paid', // Mocking successful payment
        shipping_address_id: address.id
      })
      .select('id')
      .single()

    if (orderError) throw new Error('Failed to create order.')
    createdOrderIds.push(order.id)

    // Create Order Items & Update Stock
    for (const item of businessItems) {
      // Insert Order Item
      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_time: item.products.price,
        size: item.size,
        color: item.color
      })

      // Decrement stock securely via RPC
      const { data: success } = await supabase.rpc('decrement_stock', { p_id: item.product_id, q: item.quantity })
      if (success === false) throw new Error('Failed to secure stock. It may have just sold out.')
      const newStock = item.products.stock_quantity - item.quantity

      // Notify Business of Low Stock
      if (newStock <= 2) {
        const { data: b } = await supabase.from('businesses').select('owner_id').eq('id', businessId).single()
        if (b) {
          await createNotification(b.owner_id, 'Low Stock Alert', `Product "${item.products.name}" is running low. Only ${newStock} left.`, 'alert')
        }
      }
    }

    // Notify Customer of Order Placed
    await createNotification(user.id, 'Order Placed', `Your order for ₹${businessTotal} has been placed successfully.`, 'order')
    
    // Notify Business of New Order
    const { data: b2 } = await supabase.from('businesses').select('owner_id').eq('id', businessId).single()
    if (b2) {
      await createNotification(b2.owner_id, 'New Order Received', `You received a new order for ₹${businessTotal}.`, 'order')
    }
  }

  // 7. Clear the cart
  await supabase.from('cart_items').delete().eq('cart_id', cartId)

  revalidatePath('/customer/cart')
  revalidatePath('/customer/orders')
  revalidatePath('/customer/shop')

  return createdOrderIds
}
