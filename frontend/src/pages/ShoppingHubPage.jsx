import React, { useState } from 'react';
import { 
  ShoppingBag, 
  ExternalLink, 
  Search, 
  Sparkles, 
  Filter, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';
import { api } from '../services/api';

export const ShoppingHubPage = () => {
  const [query, setQuery] = useState('A line crepe midi dress');
  const [category, setCategory] = useState('Dresses');
  const [color, setColor] = useState('Emerald Green');
  const [links, setLinks] = useState(null);
  const [loading, setLoading] = useState(false);

  const curatedPresets = [
    { title: 'A-Line Crepe Midi Dress', category: 'Dresses', color: 'Emerald Green' },
    { title: 'Silk Wrap Tie Waist Dress', category: 'Dresses', color: 'Burgundy' },
    { title: 'Structured Single Breasted Blazer Suit', category: 'Suits', color: 'Navy Blue' },
    { title: 'Straight Cut Linen Kurti Palazzo Set', category: 'Ethnic Wear', color: 'Warm Ivory' },
    { title: 'Mercerized Cotton Polo Shirt', category: 'Casual', color: 'Charcoal' },
    { title: 'Raw Silk Nehru Bandhgala Jacket', category: 'Traditional', color: 'Gold Champagne' },
    { title: 'Peachy Warm Nude Hydrating Lipstick', category: 'Lipstick', color: 'Peach Nude' },
    { title: 'Warm Bronze Eyeshadow Palette', category: 'Cosmetics', color: 'Bronze Gold' },
  ];

  const handleGenerate = async (q = query, cat = category, col = color) => {
    setLoading(true);
    try {
      const res = await api.getShoppingLinks(q, cat, col);
      setLinks(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (preset) => {
    setQuery(preset.title);
    setCategory(preset.category);
    setColor(preset.color);
    handleGenerate(preset.title, preset.category, preset.color);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="space-y-2 pb-6 border-b border-[#E2DDD5]">
        <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#B8860B]">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Direct Retail Engine</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1715]">
          Multi-Store Fashion & Beauty Shopping Hub
        </h1>
        <p className="text-xs sm:text-sm text-[#6E645A] max-w-2xl leading-relaxed">
          Redirects seamlessly to live product search queries across Myntra, AJIO, Meesho, Flipkart, and Amazon India. 
          Generates genuine URL-encoded queries without inventing fictitious prices or phantom stock.
        </p>
      </div>

      {/* Query Generator Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-5">
        <h3 className="font-serif text-lg font-bold text-[#1A1715] flex items-center space-x-2">
          <Search className="w-4 h-4 text-[#B8860B]" />
          <span>Encode Custom Shopping Search</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-[#3D3730] mb-1">Garment or Beauty Item</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Slim fit Oxford shirt"
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2DDD5] text-xs focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-[#3D3730] mb-1">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Shirts"
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2DDD5] text-xs focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#3D3730] mb-1">Color / Tone</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. Navy"
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2DDD5] text-xs focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              onClick={() => handleGenerate()}
              disabled={loading || !query}
              className="w-full py-2.5 rounded-xl bg-[#1C1A18] text-[#FAF8F5] hover:bg-[#2B2724] border border-[#D4AF37]/50 font-semibold text-xs tracking-wider uppercase shadow-xs transition-all"
            >
              Generate Links
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="pt-2 border-t border-[#F0EBE4] space-y-2">
          <span className="text-[11px] text-[#8C7A6B] font-semibold uppercase block">
            Popular Recommendations:
          </span>
          <div className="flex flex-wrap gap-2">
            {curatedPresets.map((p, i) => (
              <button
                key={i}
                onClick={() => handleApplyPreset(p)}
                className="px-3 py-1 rounded-full bg-white border border-[#E2DDD5] hover:border-[#D4AF37] text-[11px] text-[#2E2822] transition-colors"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generated Retail Links Cards */}
      {links && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <h2 className="font-serif text-2xl font-bold text-[#1A1715]">
            Live Verified Store Destinations
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Myntra */}
            <a
              href={links.myntra}
              target="_blank"
              rel="noreferrer"
              className="glass-panel p-5 rounded-2xl border border-[#E2DDD5] hover:border-[#D4AF37] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#E00A63]">
                  Fashion Specialist
                </span>
                <h3 className="font-serif text-lg font-bold text-[#1A1715] flex items-center justify-between">
                  <span>Myntra</span>
                  <ExternalLink className="w-4 h-4 text-[#7A6E62] group-hover:text-[#D4AF37]" />
                </h3>
                <p className="text-xs text-[#6E645A]">
                  Curated designer brands, western dresses, suits & kurtas.
                </p>
              </div>
              <span className="inline-block text-xs font-semibold text-[#D4AF37]">
                Shop on Myntra &rarr;
              </span>
            </a>

            {/* AJIO */}
            <a
              href={links.ajio}
              target="_blank"
              rel="noreferrer"
              className="glass-panel p-5 rounded-2xl border border-[#E2DDD5] hover:border-[#D4AF37] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#2C4152]">
                  Premium Trends
                </span>
                <h3 className="font-serif text-lg font-bold text-[#1A1715] flex items-center justify-between">
                  <span>AJIO</span>
                  <ExternalLink className="w-4 h-4 text-[#7A6E62] group-hover:text-[#D4AF37]" />
                </h3>
                <p className="text-xs text-[#6E645A]">
                  Bespoke international labels, luxury suiting, and ethnic collections.
                </p>
              </div>
              <span className="inline-block text-xs font-semibold text-[#D4AF37]">
                Shop on AJIO &rarr;
              </span>
            </a>

            {/* Meesho */}
            <a
              href={links.meesho}
              target="_blank"
              rel="noreferrer"
              className="glass-panel p-5 rounded-2xl border border-[#E2DDD5] hover:border-[#D4AF37] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#9B27B0]">
                  Budget-Friendly
                </span>
                <h3 className="font-serif text-lg font-bold text-[#1A1715] flex items-center justify-between">
                  <span>Meesho</span>
                  <ExternalLink className="w-4 h-4 text-[#7A6E62] group-hover:text-[#D4AF37]" />
                </h3>
                <p className="text-xs text-[#6E645A]">
                  Accessible daily wear, college outfits, sarees, and festive staples.
                </p>
              </div>
              <span className="inline-block text-xs font-semibold text-[#D4AF37]">
                Shop on Meesho &rarr;
              </span>
            </a>

            {/* Flipkart */}
            <a
              href={links.flipkart}
              target="_blank"
              rel="noreferrer"
              className="glass-panel p-5 rounded-2xl border border-[#E2DDD5] hover:border-[#D4AF37] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#2874F0]">
                  Pan-India Catalog
                </span>
                <h3 className="font-serif text-lg font-bold text-[#1A1715] flex items-center justify-between">
                  <span>Flipkart</span>
                  <ExternalLink className="w-4 h-4 text-[#7A6E62] group-hover:text-[#D4AF37]" />
                </h3>
                <p className="text-xs text-[#6E645A]">
                  Wide multi-brand catalog, footwear, cosmetics, and accessories.
                </p>
              </div>
              <span className="inline-block text-xs font-semibold text-[#D4AF37]">
                Shop on Flipkart &rarr;
              </span>
            </a>

            {/* Amazon */}
            <a
              href={links.amazon}
              target="_blank"
              rel="noreferrer"
              className="glass-panel p-5 rounded-2xl border border-[#E2DDD5] hover:border-[#D4AF37] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#FF9900]">
                  Prime Delivery
                </span>
                <h3 className="font-serif text-lg font-bold text-[#1A1715] flex items-center justify-between">
                  <span>Amazon India</span>
                  <ExternalLink className="w-4 h-4 text-[#7A6E62] group-hover:text-[#D4AF37]" />
                </h3>
                <p className="text-xs text-[#6E645A]">
                  Fast delivery, verified cosmetics, beauty tools, and global fashion.
                </p>
              </div>
              <span className="inline-block text-xs font-semibold text-[#D4AF37]">
                Shop on Amazon &rarr;
              </span>
            </a>

          </div>
        </div>
      )}

    </div>
  );
};
