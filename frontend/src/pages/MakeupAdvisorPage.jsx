import React, { useState, useEffect } from 'react';
import { 
  Sparkle, 
  Sparkles, 
  Eye, 
  ShoppingBag, 
  CheckCircle2, 
  Palette, 
  Calendar, 
  Layers, 
  Heart, 
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const MakeupAdvisorPage = ({ setActiveTab }) => {
  const { skinAnalysis } = useAuth();

  const monkId = skinAnalysis?.monk_tone_id || 'MST-04';
  const undertone = skinAnalysis?.estimated_undertone || 'Warm';

  const [activeCategory, setActiveCategory] = useState('All'); // 'All' | 'Foundation' | 'Lipstick' | 'Eyeshadow' | 'Eyeliner' | 'Blush'
  const [selectedOccasion, setSelectedOccasion] = useState('Office makeup');
  const [products, setProducts] = useState([]);
  const [occasionLooks, setOccasionLooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Foundation', 'Lipstick', 'Eyeshadow Palette', 'Eyeliner', 'Blush', 'Highlighter'];

  const occasionList = [
    'Daily makeup',
    'College makeup',
    'Office makeup',
    'Party makeup',
    'Wedding makeup',
    'Traditional makeup',
    'Minimal makeup',
    'Glam makeup',
  ];

  useEffect(() => {
    fetchMakeupData();
  }, [monkId, undertone, selectedOccasion]);

  const fetchMakeupData = async () => {
    setLoading(true);
    try {
      const res = await api.getMakeupRecommendations({
        monkToneId: monkId,
        undertone,
        makeupStyle: selectedOccasion,
      });
      setProducts(res.products || []);
      setOccasionLooks(res.occasion_looks || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (activeCategory === 'All') return true;
    return p.product_category.toLowerCase().includes(activeCategory.toLowerCase());
  });

  const currentOccasionLook = occasionLooks.find((o) => o.occasion === selectedOccasion) || occasionLooks[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E2DDD5]">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#B76E79]">
            <Sparkle className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Complete Beauty & Cosmetics Advisor</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1715]">
            Personalized Makeup Architecture
          </h1>
          <p className="text-xs sm:text-sm text-[#6E645A] max-w-2xl leading-relaxed">
            Calibrated against your <strong>{skinAnalysis?.monk_tone_name || 'Monk Tone 04'}</strong> depth 
            and <strong>{undertone}</strong> undertone. Precise foundation matches, flattering lip pigments, and occasion lookbooks.
          </p>
        </div>

        {/* Tone Badge */}
        <div className="glass-panel p-4 rounded-2xl border border-[#D4AF37]/40 flex items-center space-x-3 shrink-0">
          <div
            className="w-10 h-10 rounded-xl border border-white shadow-xs shrink-0"
            style={{ backgroundColor: skinAnalysis?.monk_hex || '#eadaba' }}
          ></div>
          <div>
            <p className="text-[10px] text-[#8C7A6B] font-bold uppercase">Calibrated Base</p>
            <p className="text-xs font-serif font-bold text-[#1A1715]">
              {monkId} • {undertone} Undertone
            </p>
          </div>
        </div>
      </div>

      {/* Occasion Lookbook Showcase */}
      {currentOccasionLook && (
        <div className="rounded-3xl bg-gradient-to-r from-[#FAF6F3] via-[#FAF8F5] to-[#F5EFEB] border border-[#E5C378]/40 p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D8]">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#B8860B]">
                Curated Occasion Combination
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#1A1715]">
                {currentOccasionLook.occasion} Edition
              </h2>
              <p className="text-xs text-[#6E645A]">
                Focal Aesthetic: <strong>{currentOccasionLook.focus}</strong>
              </p>
            </div>

            {/* Occasion Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-[#8C7A6B] font-semibold">Select Occasion:</span>
              <select
                value={selectedOccasion}
                onChange={(e) => setSelectedOccasion(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-[#E2DDD5] text-xs font-semibold focus:outline-none focus:border-[#D4AF37]"
              >
                {occasionList.map((occ) => (
                  <option key={occ} value={occ}>{occ}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 4-Quadrant Application Blueprint */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-4 rounded-2xl bg-white border border-[#E2DDD5] space-y-1 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B8860B]">
                1. Base & Canvas
              </span>
              <p className="text-xs text-[#3D3730] font-medium leading-relaxed">
                {currentOccasionLook.base}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E2DDD5] space-y-1 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#631B2A]">
                2. Eyes & Lashes
              </span>
              <p className="text-xs text-[#3D3730] font-medium leading-relaxed">
                {currentOccasionLook.eyes}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E2DDD5] space-y-1 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B76E79]">
                3. Cheeks & Glow
              </span>
              <p className="text-xs text-[#3D3730] font-medium leading-relaxed">
                {currentOccasionLook.cheeks}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E2DDD5] space-y-1 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A4D2E]">
                4. Lip Architecture
              </span>
              <p className="text-xs text-[#3D3730] font-medium leading-relaxed">
                {currentOccasionLook.lips}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-[#1C1A18] text-[#FAF8F5] shadow-xs'
                : 'bg-white border border-[#E2DDD5] text-[#5A5147] hover:border-[#D4AF37]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-[#7A6E62]">
            Loading calibrated cosmetics...
          </div>
        ) : (
          filteredProducts.map((item, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-3xl border border-[#E2DDD5] hover:border-[#D4AF37]/60 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B8860B]">
                      {item.product_category}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#1A1715]">
                      {item.shade_name}
                    </h3>
                  </div>

                  {item.hex_color && (
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow-xs shrink-0"
                      style={{ backgroundColor: item.hex_color }}
                      title={`Hex: ${item.hex_color}`}
                    ></div>
                  )}
                </div>

                <div className="p-3 rounded-2xl bg-[#FBF9F6] border border-[#E8E2D8] text-xs space-y-1">
                  <p className="font-semibold text-emerald-800 text-[11px]">
                    ✓ {item.undertone_match}
                  </p>
                  <p className="text-[#5A5147] text-[11px] leading-relaxed">
                    {item.explanation}
                  </p>
                  {item.recommended_finish && (
                    <p className="text-[10px] text-[#8C7A6B] font-medium pt-1">
                      Recommended Texture: <strong>{item.recommended_finish}</strong>
                    </p>
                  )}
                </div>
              </div>

              {/* Shopping Links */}
              <div className="pt-3 border-t border-[#F0EBE4] space-y-2">
                <span className="text-[10px] text-[#8C7A6B] font-semibold uppercase block">
                  Find & Shop Matching Shades:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <a
                    href={item.shopping_links.myntra}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E2DDD5] text-[10px] font-semibold text-[#2E2822] hover:border-[#D4AF37] hover:text-[#B8860B]"
                  >
                    Myntra
                  </a>
                  <a
                    href={item.shopping_links.ajio}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E2DDD5] text-[10px] font-semibold text-[#2E2822] hover:border-[#D4AF37] hover:text-[#B8860B]"
                  >
                    AJIO
                  </a>
                  <a
                    href={item.shopping_links.amazon}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E2DDD5] text-[10px] font-semibold text-[#2E2822] hover:border-[#D4AF37] hover:text-[#B8860B]"
                  >
                    Amazon
                  </a>
                  <a
                    href={item.shopping_links.flipkart}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E2DDD5] text-[10px] font-semibold text-[#2E2822] hover:border-[#D4AF37] hover:text-[#B8860B]"
                  >
                    Flipkart
                  </a>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
