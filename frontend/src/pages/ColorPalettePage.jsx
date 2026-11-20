import React, { useState, useEffect } from 'react';
import { Palette, Sparkles, Copy, Check, Eye, Sliders } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ColorPalettePage = () => {
  const { skinAnalysis } = useAuth();

  const [monkId, setMonkId] = useState(skinAnalysis?.monk_tone_id || 'MST-04');
  const [undertone, setUndertone] = useState(skinAnalysis?.estimated_undertone || 'Warm');
  const [palette, setPalette] = useState(null);
  const [copiedHex, setCopiedHex] = useState(null);

  useEffect(() => {
    fetchPalette();
  }, [monkId, undertone]);

  const fetchPalette = async () => {
    try {
      const data = await api.getColorPalette({ monkToneId: monkId, undertone });
      setPalette(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopy = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E2DDD5]">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#B8860B]">
            <Palette className="w-3.5 h-3.5" />
            <span>Harmonious Color Science</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1715]">
            Bespoke Color Palette Advisor
          </h1>
          <p className="text-xs sm:text-sm text-[#6E645A] max-w-2xl leading-relaxed">
            Chromatically calibrated to your Monk Skin Tone bracket and undertone. 
            Click any swatch to copy its verified HEX code for styling or shopping.
          </p>
        </div>

        {/* Undertone Switcher */}
        <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl border border-[#E2DDD5] shadow-xs text-xs">
          <span className="font-semibold text-[#3D3730]">Undertone:</span>
          {['Warm', 'Cool', 'Neutral', 'Olive'].map((u) => (
            <button
              key={u}
              onClick={() => setUndertone(u)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                undertone === u
                  ? 'bg-[#1C1A18] text-[#FAF8F5] shadow-xs'
                  : 'text-[#6E645A] hover:bg-[#F2ECE4]'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Palette Sections */}
      {palette && (
        <div className="space-y-10">
          
          {/* 1. Best Clothing Colors */}
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#1A1715] flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              <span>Signature Wardrobe Palette (Best Matches)</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {palette.best_clothing?.map((swatch, i) => (
                <div
                  key={i}
                  onClick={() => handleCopy(swatch.hex)}
                  className="glass-panel p-3.5 rounded-2xl border border-[#E2DDD5] hover:border-[#D4AF37] transition-all cursor-pointer group shadow-2xs space-y-2.5"
                >
                  <div
                    className="w-full h-24 rounded-xl border border-black/10 shadow-inner group-hover:scale-[1.02] transition-transform flex items-end justify-end p-2"
                    style={{ backgroundColor: swatch.hex }}
                  >
                    <span className="p-1 rounded-md bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      {copiedHex === swatch.hex ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1A1715] truncate">{swatch.name}</p>
                    <p className="text-[10px] text-[#7A6E62] font-mono">{swatch.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Traditional & Festive Colors */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-[#1A1715]">
              Traditional, Ethnic & Wedding Celebrations
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {palette.traditional_colors?.map((swatch, i) => (
                <div
                  key={i}
                  onClick={() => handleCopy(swatch.hex)}
                  className="glass-panel p-3.5 rounded-2xl border border-[#E2DDD5] hover:border-[#D4AF37] transition-all cursor-pointer group shadow-2xs space-y-2.5"
                >
                  <div
                    className="w-full h-20 rounded-xl border border-black/10 shadow-inner"
                    style={{ backgroundColor: swatch.hex }}
                  ></div>
                  <div>
                    <p className="text-xs font-bold text-[#1A1715] truncate">{swatch.name}</p>
                    <p className="text-[10px] text-[#7A6E62] font-mono">{swatch.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Formal & Suiting Colors */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-[#1A1715]">
              Executive, Formal & Suiting Shades
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {palette.formal_colors?.map((swatch, i) => (
                <div
                  key={i}
                  onClick={() => handleCopy(swatch.hex)}
                  className="glass-panel p-3.5 rounded-2xl border border-[#E2DDD5] hover:border-[#D4AF37] transition-all cursor-pointer group shadow-2xs space-y-2.5"
                >
                  <div
                    className="w-full h-20 rounded-xl border border-black/10 shadow-inner"
                    style={{ backgroundColor: swatch.hex }}
                  ></div>
                  <div>
                    <p className="text-xs font-bold text-[#1A1715] truncate">{swatch.name}</p>
                    <p className="text-[10px] text-[#7A6E62] font-mono">{swatch.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Luxury Neutral Foundations */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-[#1A1715]">
              Luxury Neutral Foundations
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {palette.neutrals?.map((swatch, i) => (
                <div
                  key={i}
                  onClick={() => handleCopy(swatch.hex)}
                  className="glass-panel p-3.5 rounded-2xl border border-[#E2DDD5] hover:border-[#D4AF37] transition-all cursor-pointer group shadow-2xs space-y-2.5"
                >
                  <div
                    className="w-full h-20 rounded-xl border border-black/10 shadow-inner"
                    style={{ backgroundColor: swatch.hex }}
                  ></div>
                  <div>
                    <p className="text-xs font-bold text-[#1A1715] truncate">{swatch.name}</p>
                    <p className="text-[10px] text-[#7A6E62] font-mono">{swatch.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Jewelry & Accessories Metaltone */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-[#1A1715]">
              Jewelry & Hardware Metallic Tones
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {palette.accessories?.map((swatch, i) => (
                <div
                  key={i}
                  onClick={() => handleCopy(swatch.hex)}
                  className="glass-panel p-4 rounded-2xl border border-[#E2DDD5] hover:border-[#D4AF37] transition-all cursor-pointer group shadow-2xs flex items-center space-x-3"
                >
                  <div
                    className="w-12 h-12 rounded-xl border border-black/10 shadow-inner shrink-0"
                    style={{ backgroundColor: swatch.hex }}
                  ></div>
                  <div>
                    <p className="text-xs font-bold text-[#1A1715]">{swatch.name}</p>
                    <p className="text-[10px] text-[#7A6E62] font-mono">{swatch.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
