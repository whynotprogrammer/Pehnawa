// @ts-nocheck
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getCartId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let { data: cart } = await supabase.from('cart').select('id').eq('customer_id', user.id).single()
  if (!cart) {
    const { data: newCart, error } = await supabase.from('cart').insert({ customer_id: user.id }).select('id').single()
    if (error) throw new Error(error.message)
    cart = newCart
  }
  return cart.id
}

export async function getWishlistId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let { data: wishlist } = await supabase.from('wishlists').select('id').eq('customer_id', user.id).single()
  if (!wishlist) {
    const { data: newWishlist, error } = await supabase.from('wishlists').insert({ customer_id: user.id }).select('id').single()
    if (error) throw new Error(error.message)
    wishlist = newWishlist
  }
  return wishlist.id
}

export async function addToCart(productId: string, quantity: number, size?: string, color?: string) {
  const supabase = await createClient()
  const cartId = await getCartId()

  // Verify stock
  const { data: product } = await supabase.from('products').select('stock_quantity').eq('id', productId).single()
  if (!product) throw new Error('Product not found')
  if (product.stock_quantity < quantity) throw new Error('Not enough stock available')

  const { error } = await supabase.from('cart_items').upsert({
    cart_id: cartId,
    product_id: productId,
    quantity,
    size: size || null,
    color: color || null
  }, { onConflict: 'cart_id, product_id, size, color' })

  if (error && error.code !== '23505') {
    throw new Error(error.message)
  }

  revalidatePath('/customer/cart')
  revalidatePath('/customer/shop')
  return true
}

export async function updateCartQuantity(cartItemId: string, newQuantity: number) {
  const supabase = await createClient()
  
  // Need to get product_id to check stock
  const { data: cartItem } = await supabase.from('cart_items').select('product_id, cart_id, cart(customer_id)').eq('id', cartItemId).single()
  if (!cartItem) throw new Error('Item not found in cart')

  // Verify user owns this cart
  const { data: { user } } = await supabase.auth.getUser()
  if (cartItem.cart?.customer_id !== user?.id) throw new Error('Unauthorized')

  if (newQuantity <= 0) {
    return removeFromCart(cartItemId)
  }

  // Check stock
  const { data: product } = await supabase.from('products').select('stock_quantity').eq('id', cartItem.product_id).single()
  if (!product || product.stock_quantity < newQuantity) throw new Error('Not enough stock available')

  const { error } = await supabase.from('cart_items').update({ quantity: newQuantity }).eq('id', cartItemId)
  if (error) throw new Error(error.message)

  revalidatePath('/customer/cart')
  return true
}

export async function removeFromCart(cartItemId: string) {
  const supabase = await createClient()
  
  const { data: cartItem } = await supabase.from('cart_items').select('cart_id, cart(customer_id)').eq('id', cartItemId).single()
  if (!cartItem) return true
  
  const { data: { user } } = await supabase.auth.getUser()
  if (cartItem.cart?.customer_id !== user?.id) throw new Error('Unauthorized')

  await supabase.from('cart_items').delete().eq('id', cartItemId)
  revalidatePath('/customer/cart')
  return true
}

export async function toggleWishlist(productId: string) {
  const supabase = await createClient()
  const wishlistId = await getWishlistId()

  const { data: existing } = await supabase.from('wishlist_items')
    .select('id')
    .eq('wishlist_id', wishlistId)
    .eq('product_id', productId)
    .single()

  if (existing) {
    await supabase.from('wishlist_items').delete().eq('id', existing.id)
    revalidatePath('/customer/wishlist')
    return false // removed
  } else {
    await supabase.from('wishlist_items').insert({
      wishlist_id: wishlistId,
      product_id: productId
    })
    revalidatePath('/customer/wishlist')
    return true // added
  }
}

export async function checkWishlistStatus(productId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: wishlist } = await supabase.from('wishlists').select('id').eq('customer_id', user.id).single()
  if (!wishlist) return false

  const { data: existing } = await supabase.from('wishlist_items')
    .select('id')
    .eq('wishlist_id', wishlist.id)
    .eq('product_id', productId)
    .single()

  return !!existing
}

export async function moveToCart(productId: string, size?: string, color?: string) {
  await addToCart(productId, 1, size, color)
  const supabase = await createClient()
  const wishlistId = await getWishlistId()
  await supabase.from('wishlist_items').delete().eq('wishlist_id', wishlistId).eq('product_id', productId)
  revalidatePath('/customer/wishlist')
  return true
}
