// @ts-nocheck
'use server'

import { createClient } from '@/lib/supabase/server'

export async function generateOutfit(preferences: any) {
  const supabase = await createClient()

  // 1. Fetch available products (stock > 0, published)
  let query = supabase
    .from('products')
    .select(`
      id, name, brand, price, condition, gender, sizes, colors, description, category:category_id,
      product_images (url)
    `)
    .eq('status', 'published')
    .gt('stock_quantity', 0)
    .order('created_at', { ascending: false })
    .limit(100) // limit context size

  if (preferences.gender && preferences.gender !== 'Any') {
    query = query.eq('gender', preferences.gender.toLowerCase())
  }
  
  if (preferences.budget) {
    query = query.lte('price', parseInt(preferences.budget))
  }

  const { data: products, error } = await query

  if (error) throw new Error('Database error while fetching products.')
  if (!products || products.length === 0) {
    throw new Error('No available products match your basic criteria. Try increasing your budget or changing the gender category.')
  }

  // 2. Prepare minimal JSON for LLM to avoid token limits
  const availableInventory = products.map(p => ({
    id: p.id,
    name: p.name,
    brand: p.brand || 'Unbranded',
    price: p.price,
    gender: p.gender,
    colors: p.colors?.join(', ') || 'N/A',
    desc: p.description?.substring(0, 50) || ''
  }))

  // 3. Call LLM
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY
  
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in the server environment.')
  }

  const prompt = `
You are an expert AI fashion stylist. You MUST ONLY recommend products from the following JSON list of available inventory. 
DO NOT invent, guess, or create any products or IDs that are not in this list.

Inventory:
${JSON.stringify(availableInventory, null, 2)}

User Preferences:
- Occasion: ${preferences.occasion}
- Style: ${preferences.style}
- Budget: ${preferences.budget ? `₹${preferences.budget}` : 'Any'}
- Preferred Colors: ${preferences.colors || 'Any'}
- Additional Notes: ${preferences.notes || 'None'}

Task:
Create a cohesive outfit using 2 to 4 items from the inventory. Ensure the total price of selected items is less than or equal to the budget (if specified). The outfit should match the occasion and style.

Return ONLY a valid JSON array of the string IDs of the products you select. No markdown, no explanation, just the JSON array.
Example: ["uuid-1", "uuid-2"]
  `

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    })

    if (!response.ok) {
      throw new Error('Failed to communicate with AI provider.')
    }

    const aiData = await response.json()
    const textResult = aiData?.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!textResult) throw new Error('AI returned an empty response.')

    let selectedIds = []
    try {
      selectedIds = JSON.parse(textResult.trim())
      if (!Array.isArray(selectedIds)) throw new Error('Not an array')
    } catch (parseErr) {
      throw new Error('AI returned an invalid format. Please try again.')
    }

    // 4. Validate IDs and fetch full hydrated products
    const finalProducts = products.filter(p => selectedIds.includes(p.id))

    if (finalProducts.length === 0) {
      throw new Error('The AI could not find a suitable combination from the current inventory that matches your strict preferences.')
    }

    return finalProducts

  } catch (err: any) {
    console.error('AI Stylist Error:', err)
    throw new Error(err.message || 'An unexpected error occurred.')
  }
}
