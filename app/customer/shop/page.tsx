// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, ShoppingBag } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import WishlistButton from '@/components/customer/WishlistButton';

export const metadata = {
  title: 'Thrift Store | Pehnawa',
};

export const dynamic = 'force-dynamic';

export default async function ShopPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const supabase = await createClient();

  // Extract params
  const q = typeof searchParams.q === 'string' ? searchParams.q : '';
  const condition = typeof searchParams.condition === 'string' ? searchParams.condition : '';
  const gender = typeof searchParams.gender === 'string' ? searchParams.gender : '';
  const category = typeof searchParams.category === 'string' ? searchParams.category : '';
  const size = typeof searchParams.size === 'string' ? searchParams.size : '';
  const color = typeof searchParams.color === 'string' ? searchParams.color : '';
  const minPrice = typeof searchParams.minPrice === 'string' ? parseInt(searchParams.minPrice) : null;
  const maxPrice = typeof searchParams.maxPrice === 'string' ? parseInt(searchParams.maxPrice) : null;
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'newest';

  // Build query
  let query = supabase
    .from('products')
    .select(`
      id, name, brand, price, original_price, stock_quantity, condition, gender, sizes, colors,
      categories!inner ( name ),
      product_images (url)
    `)
    .eq('status', 'published')
    .gt('stock_quantity', 0); // Only show in-stock items

  // Apply Search
  if (q) {
    query = query.or(`name.ilike.%${q}%,brand.ilike.%${q}%,description.ilike.%${q}%`);
  }

  // Apply Filters
  if (condition && condition !== 'all') {
    query = query.eq('condition', condition);
  }
  
  if (gender && gender !== 'all') {
    query = query.eq('gender', gender);
  }

  // Categories (since it's a relation, we filter via inner join if needed, but supabase JS filtering on joined tables is tricky without raw RPC. 
  // We will fetch it and filter locally if category is selected, OR use 'categories!inner(name)' to filter.)
  if (category && category !== 'all') {
    query = query.eq('categories.name', category); // Supabase allows this if we define the join, but to be safe we'll fetch categories too.
  }

  if (size && size !== 'all') {
    query = query.contains('sizes', [size]);
  }

  if (color && color !== 'all') {
    query = query.contains('colors', [color]);
  }

  if (minPrice) query = query.gte('price', minPrice);
  if (maxPrice) query = query.lte('price', maxPrice);

  // Apply Sorting
  if (sort === 'price_asc') {
    query = query.order('price', { ascending: true });
  } else if (sort === 'price_desc') {
    query = query.order('price', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false }); // newest
  }

  const { data: products, error } = await query;
  if (error) console.error("Search Error:", error);

  // Fetch unique categories for the filter dropdown
  const { data: categories } = await supabase.from('categories').select('name').order('name');

  // Hardcoded standard sizes/colors for filters
  const standardSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38'];
  const standardColors = ['Black', 'White', 'Blue', 'Red', 'Green', 'Brown', 'Beige', 'Grey', 'Pink', 'Multicolor'];

  return (
    <div className="flex flex-col space-y-6 pb-24">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif text-pehnawa-charcoal mb-2">Thrift Store</h2>
          <p className="text-sm text-pehnawa-charcoal/60">
            Discover curated pre-loved fashion. Every piece has a story.
          </p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-pehnawa-warm-ivory border border-pehnawa-cream rounded-2xl p-5 flex flex-col space-y-4">
        
        {/* Top Row: Search & Sort */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <form method="GET" action="/customer/shop" className="relative w-full lg:w-1/2 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-pehnawa-charcoal/40 group-focus-within:text-pehnawa-forest-green" />
            </div>
            <input
              type="text"
              name="q"
              defaultValue={q}
              className="block w-full pl-10 pr-4 py-2.5 bg-white border border-pehnawa-cream rounded-xl text-sm placeholder-pehnawa-charcoal/40 focus:outline-none focus:border-pehnawa-forest-green transition-all shadow-sm"
              placeholder="Search clothes, brands, styles..."
            />
            {/* Hidden fields to preserve state */}
            {condition && <input type="hidden" name="condition" value={condition} />}
            {gender && <input type="hidden" name="gender" value={gender} />}
            {category && <input type="hidden" name="category" value={category} />}
            {size && <input type="hidden" name="size" value={size} />}
            {color && <input type="hidden" name="color" value={color} />}
            {minPrice && <input type="hidden" name="minPrice" value={minPrice} />}
            {maxPrice && <input type="hidden" name="maxPrice" value={maxPrice} />}
            {sort && <input type="hidden" name="sort" value={sort} />}
          </form>

          <form method="GET" action="/customer/shop" className="flex items-center gap-3 w-full lg:w-auto">
            {/* Hidden fields to preserve state */}
            {q && <input type="hidden" name="q" value={q} />}
            {condition && <input type="hidden" name="condition" value={condition} />}
            {gender && <input type="hidden" name="gender" value={gender} />}
            {category && <input type="hidden" name="category" value={category} />}
            {size && <input type="hidden" name="size" value={size} />}
            {color && <input type="hidden" name="color" value={color} />}
            {minPrice && <input type="hidden" name="minPrice" value={minPrice} />}
            {maxPrice && <input type="hidden" name="maxPrice" value={maxPrice} />}
            
            <div className="flex items-center space-x-2 text-sm text-pehnawa-charcoal/70 whitespace-nowrap">
              <span>Sort by:</span>
              <select 
                name="sort" 
                defaultValue={sort || 'newest'} 
                onChange={(e) => e.target.form?.submit()}
                className="px-3 py-2 bg-white border border-pehnawa-cream rounded-lg text-sm text-pehnawa-charcoal outline-none focus:border-pehnawa-forest-green font-medium shadow-sm"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </form>
        </div>

        {/* Bottom Row: Detailed Filters */}
        <form method="GET" action="/customer/shop" className="flex flex-wrap items-center gap-3 border-t border-pehnawa-cream pt-4">
          <div className="flex items-center space-x-2 mr-2 text-pehnawa-charcoal/60">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          {q && <input type="hidden" name="q" value={q} />}
          {sort && <input type="hidden" name="sort" value={sort} />}

          {/* Category */}
          <select name="category" defaultValue={category || 'all'} onChange={(e) => e.target.form?.submit()} className="px-3 py-2 bg-white border border-pehnawa-cream rounded-lg text-sm text-pehnawa-charcoal/70 outline-none hover:border-pehnawa-forest-green cursor-pointer">
            <option value="all">Category</option>
            {categories?.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>

          {/* Gender */}
          <select name="gender" defaultValue={gender || 'all'} onChange={(e) => e.target.form?.submit()} className="px-3 py-2 bg-white border border-pehnawa-cream rounded-lg text-sm text-pehnawa-charcoal/70 outline-none hover:border-pehnawa-forest-green cursor-pointer">
            <option value="all">Gender</option>
            <option value="women">Women</option>
            <option value="men">Men</option>
            <option value="unisex">Unisex</option>
          </select>

          {/* Size */}
          <select name="size" defaultValue={size || 'all'} onChange={(e) => e.target.form?.submit()} className="px-3 py-2 bg-white border border-pehnawa-cream rounded-lg text-sm text-pehnawa-charcoal/70 outline-none hover:border-pehnawa-forest-green cursor-pointer">
            <option value="all">Size</option>
            {standardSizes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Color */}
          <select name="color" defaultValue={color || 'all'} onChange={(e) => e.target.form?.submit()} className="px-3 py-2 bg-white border border-pehnawa-cream rounded-lg text-sm text-pehnawa-charcoal/70 outline-none hover:border-pehnawa-forest-green cursor-pointer">
            <option value="all">Color</option>
            {standardColors.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Condition */}
          <select name="condition" defaultValue={condition || 'all'} onChange={(e) => e.target.form?.submit()} className="px-3 py-2 bg-white border border-pehnawa-cream rounded-lg text-sm text-pehnawa-charcoal/70 outline-none hover:border-pehnawa-forest-green cursor-pointer">
            <option value="all">Condition</option>
            <option value="new_with_tags">New With Tags</option>
            <option value="like_new">Like New</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
          </select>

          {/* Price Range */}
          <div className="flex items-center space-x-2 bg-white border border-pehnawa-cream rounded-lg px-2 py-1.5 hover:border-pehnawa-forest-green transition-colors">
            <span className="text-xs text-pehnawa-charcoal/50 font-medium ml-1">₹</span>
            <input type="number" name="minPrice" defaultValue={minPrice || ''} placeholder="Min" className="w-16 text-sm outline-none bg-transparent placeholder-pehnawa-charcoal/30" onBlur={(e) => e.target.form?.submit()} onKeyDown={(e) => e.key === 'Enter' && e.target.form?.submit()} />
            <span className="text-pehnawa-charcoal/30">-</span>
            <input type="number" name="maxPrice" defaultValue={maxPrice || ''} placeholder="Max" className="w-16 text-sm outline-none bg-transparent placeholder-pehnawa-charcoal/30" onBlur={(e) => e.target.form?.submit()} onKeyDown={(e) => e.key === 'Enter' && e.target.form?.submit()} />
          </div>

          <Link href="/customer/shop" className="text-xs font-medium text-pehnawa-forest-green hover:underline ml-auto">
            Clear Filters
          </Link>
        </form>

      </div>

      {/* Product Grid */}
      {!products || products.length === 0 ? (
        <div className="w-full bg-pehnawa-cream/30 border border-pehnawa-cream rounded-2xl p-16 flex flex-col items-center justify-center text-center">
          <ShoppingBag className="w-12 h-12 text-pehnawa-charcoal/20 mb-4" />
          <h3 className="text-xl font-serif text-pehnawa-charcoal mb-2">No products found</h3>
          <p className="text-sm text-pehnawa-charcoal/60 mb-6">
            We couldn't find any items matching your current filters. Try adjusting your search or clearing the filters.
          </p>
          <Link href="/customer/shop" className="px-6 py-2.5 bg-pehnawa-forest-green text-white font-medium rounded-full hover:bg-pehnawa-dark-green transition-colors">
            Clear all filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {products.map((product) => {
            const image = product.product_images && product.product_images[0] ? product.product_images[0].url : null;
            
            let discountStr = '';
            if (product.original_price && product.price < product.original_price) {
              const diff = product.original_price - product.price;
              const percent = Math.round((diff / product.original_price) * 100);
              discountStr = `${percent}% OFF`;
            }
            
            return (
              <div key={product.id} className="flex flex-col group relative">
                <div className="relative aspect-[3/4] mb-4 bg-pehnawa-cream rounded-xl overflow-hidden flex items-center justify-center border border-pehnawa-cream/50 shadow-sm">
                  <Link href={`/customer/shop/${product.id}`} className="absolute inset-0 z-0">
                    {image ? (
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url('${image}')` }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <ShoppingBag className="w-8 h-8 text-pehnawa-charcoal/20" />
                      </div>
                    )}
                  </Link>
                  
                  {/* Overlay elements */}
                  <div className="absolute top-3 right-3 z-10">
                    <WishlistButton productId={product.id} />
                  </div>
                  
                  {discountStr && (
                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-pehnawa-burgundy rounded uppercase tracking-wider z-10 pointer-events-none">
                      {discountStr}
                    </div>
                  )}
                </div>

                <div className="flex flex-col px-1">
                  <span className="text-[10px] sm:text-xs text-pehnawa-charcoal/50 uppercase tracking-wider mb-1 line-clamp-1">{product.brand || 'Unbranded'}</span>
                  <Link href={`/customer/shop/${product.id}`} className="hover:text-pehnawa-forest-green transition-colors">
                    <h4 className="text-sm font-medium text-pehnawa-charcoal mb-1 line-clamp-1">{product.name}</h4>
                  </Link>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-pehnawa-forest-green">₹{product.price}</span>
                    {product.original_price && (
                      <span className="text-xs text-pehnawa-charcoal/40 line-through">₹{product.original_price}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
