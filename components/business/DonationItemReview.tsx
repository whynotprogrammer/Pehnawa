"use client";

import React, { useState } from 'react';
import { allocateDonationItem } from '@/app/actions/donations';
import { Loader2, ArrowRight, Check } from 'lucide-react';

export default function DonationItemReview({ item, donationId, index }: any) {
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState<string>(item.destination || '');
  const [details, setDetails] = useState<any>({});
  
  // Thrift specifics
  const [productDetails, setProductDetails] = useState({
    name: item.clothing_type,
    brand: item.brand || '',
    size: item.size || '',
    condition: item.condition,
    description: item.description || '',
    price: '',
    original_price: ''
  });

  const [charityName, setCharityName] = useState('');
  const [upcyclingUse, setUpcyclingUse] = useState('');

  const isAllocated = !!item.destination;

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalDetails: any = {};
      
      if (destination === 'THRIFT_STORE') {
        finalDetails = { product: productDetails };
      } else if (destination === 'CHARITY') {
        finalDetails = { organization_name: charityName };
      } else if (destination === 'UPCYCLING') {
        finalDetails = { intended_use: upcyclingUse };
      }

      await allocateDonationItem(donationId, item.id, destination, finalDetails);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white border rounded-2xl p-6 shadow-sm overflow-hidden transition-colors ${isAllocated ? 'border-green-200 bg-green-50/30' : 'border-pehnawa-cream'}`}>
      
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left: Images */}
        <div className="w-full md:w-48 space-y-2">
          {item.image_urls && item.image_urls.length > 0 ? (
            <>
              <div className="aspect-square rounded-lg overflow-hidden bg-pehnawa-cream">
                <img src={item.image_urls[0]} className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {item.image_urls.slice(1).map((img: string, idx: number) => (
                  <img key={idx} src={img} className="w-12 h-12 rounded object-cover border border-pehnawa-cream flex-shrink-0" />
                ))}
              </div>
            </>
          ) : (
            <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No images</div>
          )}
        </div>

        {/* Right: Info & Allocation */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-semibold text-pehnawa-charcoal/50 uppercase tracking-widest block mb-1">Item #{index}</span>
              <h4 className="text-xl font-serif text-pehnawa-charcoal">{item.clothing_type}</h4>
            </div>
            {isAllocated && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center border border-green-200">
                <Check className="w-3 h-3 mr-1" /> Allocated
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mb-6 text-pehnawa-charcoal/80 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div><span className="text-pehnawa-charcoal/50">Category:</span> {item.category}</div>
            <div><span className="text-pehnawa-charcoal/50">Condition:</span> <span className="capitalize">{item.condition.replace('_', ' ')}</span></div>
            {item.brand && <div><span className="text-pehnawa-charcoal/50">Brand:</span> {item.brand}</div>}
            {item.size && <div><span className="text-pehnawa-charcoal/50">Size:</span> {item.size}</div>}
            {item.description && <div className="col-span-2 mt-2"><span className="text-pehnawa-charcoal/50 block">Description:</span> {item.description}</div>}
          </div>

          {!isAllocated ? (
            <form onSubmit={handleAllocate} className="space-y-4 border-t border-pehnawa-cream pt-6 mt-auto">
              <div>
                <label className="block text-sm font-medium text-pehnawa-charcoal mb-2">Select Destination *</label>
                <div className="flex flex-wrap gap-2">
                  {['THRIFT_STORE', 'CHARITY', 'UPCYCLING', 'TEXTILE_RECOVERY', 'REJECTED'].map(dest => (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => setDestination(dest)}
                      className={`px-3 py-2 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-colors ${
                        destination === dest 
                          ? 'bg-pehnawa-forest-green text-white border-pehnawa-forest-green' 
                          : 'bg-white text-pehnawa-charcoal/60 hover:border-pehnawa-forest-green hover:text-pehnawa-forest-green'
                      }`}
                    >
                      {dest.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Sub-forms */}
              {destination === 'THRIFT_STORE' && (
                <div className="bg-pehnawa-warm-ivory p-4 rounded-xl border border-pehnawa-cream space-y-4">
                  <h5 className="text-sm font-medium text-pehnawa-charcoal">Convert to Thrift Store Product</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-pehnawa-charcoal/60 mb-1">Product Name</label>
                      <input required value={productDetails.name} onChange={e => setProductDetails({...productDetails, name: e.target.value})} className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:border-pehnawa-forest-green" />
                    </div>
                    <div>
                      <label className="block text-xs text-pehnawa-charcoal/60 mb-1">Selling Price (₹)</label>
                      <input required type="number" value={productDetails.price} onChange={e => setProductDetails({...productDetails, price: e.target.value})} className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:border-pehnawa-forest-green" />
                    </div>
                    <div>
                      <label className="block text-xs text-pehnawa-charcoal/60 mb-1">Original Value (₹)</label>
                      <input type="number" value={productDetails.original_price} onChange={e => setProductDetails({...productDetails, original_price: e.target.value})} className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:border-pehnawa-forest-green" />
                    </div>
                  </div>
                </div>
              )}

              {destination === 'CHARITY' && (
                <div className="bg-pehnawa-warm-ivory p-4 rounded-xl border border-pehnawa-cream">
                  <label className="block text-xs text-pehnawa-charcoal/60 mb-1">Target Charity / NGO Name (Optional)</label>
                  <input value={charityName} onChange={e => setCharityName(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:border-pehnawa-forest-green" placeholder="e.g. Goonj" />
                </div>
              )}

              {destination === 'UPCYCLING' && (
                <div className="bg-pehnawa-warm-ivory p-4 rounded-xl border border-pehnawa-cream">
                  <label className="block text-xs text-pehnawa-charcoal/60 mb-1">Intended Upcycling Use</label>
                  <input required value={upcyclingUse} onChange={e => setUpcyclingUse(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:border-pehnawa-forest-green" placeholder="e.g. Pillow Covers, Tote Bag" />
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={!destination || loading}
                  className="px-6 py-2.5 bg-pehnawa-forest-green hover:bg-pehnawa-dark-green text-white rounded-lg text-sm font-medium transition-colors flex items-center disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Confirm Allocation
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-auto border-t border-green-200/50 pt-4">
              <p className="text-sm text-green-800">
                <span className="font-semibold text-green-900 mr-2">Assigned Destination:</span>
                <span className="px-2 py-1 bg-green-100 rounded text-xs font-bold uppercase tracking-wider">{item.destination.replace('_', ' ')}</span>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
