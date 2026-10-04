import os

filepath = 'app/actions/checkout.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''      // Decrement stock
      const newStock = item.products.stock_quantity - item.quantity
      await supabase.from('products')
        .update({ stock_quantity: newStock })
        .eq('id', item.product_id)'''

replacement = '''      // Decrement stock securely via RPC
      const { data: success } = await supabase.rpc('decrement_stock', { p_id: item.product_id, q: item.quantity })
      if (success === false) throw new Error('Failed to secure stock. It may have just sold out.')
      const newStock = item.products.stock_quantity - item.quantity'''

content = content.replace(target, replacement)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
