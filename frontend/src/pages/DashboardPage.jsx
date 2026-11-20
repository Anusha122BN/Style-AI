import React from 'react';
import { 
  Sparkles, 
  User, 
  Camera, 
  Upload, 
  ShoppingBag, 
  Palette, 
  Sliders, 
  ArrowRight, 
  ShieldCheck, 
  ChevronRight,
  Sparkle,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DashboardPage = ({ setActiveTab }) => {
  const { user, bodyAnalysis, skinAnalysis } = useAuth();

  const detectedShape = bodyAnalysis?.classification?.detected_shape || user?.last_body_shape || 'Hourglass';
  const detectedSkin = skinAnalysis?.monk_tone_name || user?.last_skin_tone || 'Monk Tone 04 (Wheat)';
  const detectedUndertone = skinAnalysis?.estimated_undertone || 'Warm';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1C1A18] via-[#2B2724] to-[#631B2A] text-white p-8 sm:p-10 border border-[#D4AF37]/40 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Style AI Intelligence Suite</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
              Bonjour, {user?.full_name || 'Stylist Client'}
            </h1>
            <p className="text-xs sm:text-sm text-[#D1C7BD] leading-relaxed">
              Your bespoke style portfolio is synchronized. Review your calibrated body shape, monk tone analysis, and explainable recommendations below.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('studio')}
              className="px-5 py-3 rounded-full bg-[#FAF8F5] text-[#1A1715] hover:bg-[#EFEAE2] font-semibold text-xs tracking-wider uppercase shadow-md flex items-center space-x-2 transition-all hover:scale-105"
            >
              <Camera className="w-4 h-4 text-[#B8860B]" />
              <span>AI Stylist Studio (1-Photo)</span>
            </button>
            <button
              onClick={() => setActiveTab('studio')}
              className="px-5 py-3 rounded-full bg-[#1C1A18]/60 text-white hover:bg-[#1C1A18] border border-[#D4AF37]/40 font-semibold text-xs tracking-wider uppercase transition-all"
            >
              <span>Explore Wardrobe</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Body Shape */}
        <div className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A6E62]">
              Body Silhouette
            </span>
            <span className="w-8 h-8 rounded-full bg-[#D4AF37]/15 flex items-center justify-center text-[#B8860B]">
              <User className="w-4 h-4" />
            </span>
          </div>

          <div>
            <h3 className="font-serif text-2xl font-bold text-[#1A1715]">
              {detectedShape}
            </h3>
            <p className="text-xs text-[#6E645A] mt-1">
              {bodyAnalysis ? 'Height-Calibrated MediaPipe Analysis' : 'Default / Estimated Persona'}
            </p>
          </div>

          <div className="pt-2 border-t border-[#F0EBE4] flex items-center justify-between text-xs">
            <span className="text-[#8C7A6B]">
              Confidence: <strong>{bodyAnalysis ? `${Math.round(bodyAnalysis.classification.confidence * 100)}%` : '85%'}</strong>
            </span>
            <button
              onClick={() => setActiveTab('body')}
              className="text-[#631B2A] font-semibold flex items-center space-x-1 hover:underline"
            >
              <span>{bodyAnalysis ? 'Inspect Keypoints' : 'Run Body Scan'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Skin Tone */}
        <div className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A6E62]">
              Complexion Science
            </span>
            <span className="w-8 h-8 rounded-full bg-[#B76E79]/15 flex items-center justify-center text-[#B76E79]">
              <Eye className="w-4 h-4" />
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm shrink-0"
              style={{ backgroundColor: skinAnalysis?.monk_hex || '#eadaba' }}
            ></div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1A1715] truncate">
                {detectedSkin}
              </h3>
              <p className="text-xs text-[#6E645A]">
                Undertone: <strong>{detectedUndertone}</strong>
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#F0EBE4] flex items-center justify-between text-xs">
            <span className="text-[#8C7A6B]">Monk Scale Delta E: <strong>{skinAnalysis ? skinAnalysis.delta_e_distance : '1.4'}</strong></span>
            <button
              onClick={() => setActiveTab('skin')}
              className="text-[#631B2A] font-semibold flex items-center space-x-1 hover:underline"
            >
              <span>{skinAnalysis ? 'View Swatches' : 'Analyze Skin'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 3: Explainable AI Engine */}
        <div className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A6E62]">
              XAI Status
            </span>
            <span className="w-8 h-8 rounded-full bg-[#1C1A18] text-[#D4AF37] flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </span>
          </div>

          <div>
            <h3 className="font-serif text-xl font-bold text-[#1A1715]">
              Surrogate SHAP Engine
            </h3>
            <p className="text-xs text-[#6E645A] mt-1">
              Active tree depth 5. Verifiable mathematical boundaries & counterfactuals.
            </p>
          </div>

          <div className="pt-2 border-t border-[#F0EBE4] flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% Traceable</span>
            </span>
            <button
              onClick={() => setActiveTab('xai')}
              className="text-[#631B2A] font-semibold flex items-center space-x-1 hover:underline"
            >
              <span>Open XAI Lab</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Quick Launchpad Grid */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#1A1715]">
          Styling & Recommendation Suites
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div 
            onClick={() => setActiveTab('fashion')}
            className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] hover:border-[#D4AF37] transition-all cursor-pointer group shadow-xs space-y-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#1C1A18] text-[#D4AF37] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#1A1715]">
              Fashion Recommendations
            </h3>
            <p className="text-xs text-[#6E645A] leading-relaxed">
              Curated silhouettes for your body shape with neckline, sleeve, fabric, and proportion guides.
            </p>
            <span className="inline-flex items-center text-xs text-[#631B2A] font-semibold group-hover:translate-x-1 transition-transform">
              Explore Outfits &rarr;
            </span>
          </div>

          <div 
            onClick={() => setActiveTab('makeup')}
            className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] hover:border-[#D4AF37] transition-all cursor-pointer group shadow-xs space-y-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#631B2A] text-[#FAF8F5] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkle className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#1A1715]">
              Makeup & Beauty Advisor
            </h3>
            <p className="text-xs text-[#6E645A] leading-relaxed">
              Foundation matches, lipsticks, eyeliners, eyeshadows, and occasion combinations.
            </p>
            <span className="inline-flex items-center text-xs text-[#631B2A] font-semibold group-hover:translate-x-1 transition-transform">
              Explore Cosmetics &rarr;
            </span>
          </div>

          <div 
            onClick={() => setActiveTab('palette')}
            className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] hover:border-[#D4AF37] transition-all cursor-pointer group shadow-xs space-y-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 text-[#B8860B] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#1A1715]">
              Color Palette Advisor
            </h3>
            <p className="text-xs text-[#6E645A] leading-relaxed">
              Wardrobe, festive, formal, and accessory color swatches calibrated to your undertone.
            </p>
            <span className="inline-flex items-center text-xs text-[#631B2A] font-semibold group-hover:translate-x-1 transition-transform">
              View Color Swatches &rarr;
            </span>
          </div>

          <div 
            onClick={() => setActiveTab('shopping')}
            className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] hover:border-[#D4AF37] transition-all cursor-pointer group shadow-xs space-y-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#1C1A18] text-[#D4AF37] flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#1A1715]">
              Multi-Store Shopping Hub
            </h3>
            <p className="text-xs text-[#6E645A] leading-relaxed">
              Direct search queries encoded for Myntra, AJIO, Meesho, Flipkart, and Amazon.
            </p>
            <span className="inline-flex items-center text-xs text-[#631B2A] font-semibold group-hover:translate-x-1 transition-transform">
              Open Shopping Hub &rarr;
            </span>
          </div>

        </div>
      </div>

    </div>
  );
};
