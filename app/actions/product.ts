// @ts-nocheck
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getBusinessId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  // Get business for this user
  let { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  // For testing/mock purposes, auto-create a business if one doesn't exist
  if (!business) {
    const { data: newBusiness, error } = await supabase
      .from('businesses')
      .insert({ owner_id: user.id, name: 'My Thrift Store' })
      .select('id')
      .single()
      
    if (error) throw new Error('Failed to create business profile')
    business = newBusiness
  }

  return business.id
}

export async function createProduct(formData: any, imageUrls: string[]) {
  const supabase = await createClient()
  const businessId = await getBusinessId()

  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({
      business_id: businessId,
      name: formData.name,
      description: formData.description,
      brand: formData.brand,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      condition: formData.condition,
      gender: formData.gender,
      sizes: formData.sizes,
      colors: formData.colors,
      stock_quantity: parseInt(formData.stock_quantity),
      sku: formData.sku,
      status: formData.status
    })
    .select()
    .single()

  if (productError) throw new Error(productError.message)

  if (imageUrls.length > 0) {
    const imageInserts = imageUrls.map((url, idx) => ({
      product_id: product.id,
      url: url,
      display_order: idx
    }))
    const { error: imageError } = await supabase.from('product_images').insert(imageInserts)
    if (imageError) throw new Error(imageError.message)
  }

  revalidatePath('/business/products')
  revalidatePath('/customer/dashboard')
  return product
}

export async function updateProduct(id: string, formData: any, imageUrls: string[]) {
  const supabase = await createClient()
  const businessId = await getBusinessId() // validates auth

  const { error: productError } = await supabase
    .from('products')
    .update({
      name: formData.name,
      description: formData.description,
      brand: formData.brand,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      condition: formData.condition,
      gender: formData.gender,
      sizes: formData.sizes,
      colors: formData.colors,
      stock_quantity: parseInt(formData.stock_quantity),
      sku: formData.sku,
      status: formData.status
    })
    .eq('id', id)
    .eq('business_id', businessId) // Security check

  if (productError) throw new Error(productError.message)

  // Handle images: Simple approach - delete old, insert new
  // In production, you'd compare and only insert new/delete removed
  await supabase.from('product_images').delete().eq('product_id', id)
  
  if (imageUrls.length > 0) {
    const imageInserts = imageUrls.map((url, idx) => ({
      product_id: id,
      url: url,
      display_order: idx
    }))
    await supabase.from('product_images').insert(imageInserts)
  }

  revalidatePath('/business/products')
  revalidatePath('/customer/dashboard')
  return true
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const businessId = await getBusinessId()

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('business_id', businessId)

  if (error) throw new Error(error.message)

  revalidatePath('/business/products')
  revalidatePath('/customer/dashboard')
  return true
}

export async function toggleProductStatus(id: string, currentStatus: string) {
  const supabase = await createClient()
  const businessId = await getBusinessId()
  const newStatus = currentStatus === 'published' ? 'draft' : 'published'

  const { error } = await supabase
    .from('products')
    .update({ status: newStatus })
    .eq('id', id)
    .eq('business_id', businessId)

  if (error) throw new Error(error.message)

  revalidatePath('/business/products')
  revalidatePath('/customer/dashboard')
  return newStatus
}
