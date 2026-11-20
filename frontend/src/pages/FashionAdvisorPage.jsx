import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Sliders, 
  ShoppingBag, 
  Layers, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ExplainModal } from '../components/ExplainModal';

export const FashionAdvisorPage = ({ setActiveTab }) => {
  const { user, bodyAnalysis } = useAuth();

  const detectedShape = bodyAnalysis?.classification?.detected_shape || user?.last_body_shape || 'Hourglass';
  const initialGender = (user?.gender_preference || 'Women').toLowerCase();

  const [gender, setGender] = useState(initialGender === 'men' ? 'men' : 'women');
  const [selectedShape, setSelectedShape] = useState(detectedShape);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedOccasion, setSelectedOccasion] = useState('All');
  const [selectedBudget, setSelectedBudget] = useState('All');
  
  const [recommendations, setRecommendations] = useState([]);
  const [carefulStyles, setCarefulStyles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Explain modal state
  const [explainOpen, setExplainOpen] = useState(false);
  const [activeExplanation, setActiveExplanation] = useState(null);
  const [activeItemTitle, setActiveItemTitle] = useState('');
  const [explainingLoading, setExplainingLoading] = useState(false);

  const categories = [
    'All',
    'Traditional Wear',
    'Western Wear',
    'Office Wear',
    'Casual Wear',
    'Party Wear',
    'Wedding Wear',
    'College Wear',
    'Festive Wear',
    'Formal Wear',
    'Ethnic Fusion',
  ];

  const femaleShapes = ['Hourglass', 'Pear', 'Apple', 'Rectangle', 'Inverted Triangle'];
  const maleShapes = ['Trapezoid', 'Rectangle', 'Triangle', 'Inverted Triangle', 'Oval'];

  const occasions = [
    'All',
    'Casual',
    'Formal',
    'Traditional',
    'Party wear',
    'Office wear',
    'Wedding wear',
    'College wear',
    'Streetwear',
  ];

  const budgetTiers = ['All', 'Budget-friendly', 'Mid-range', 'Premium/Luxury'];

  useEffect(() => {
    fetchRecommendations();
  }, [gender, selectedShape, selectedCategory, selectedOccasion, selectedBudget]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const occList = selectedOccasion !== 'All' ? [selectedOccasion] : null;
      const bTier = selectedBudget !== 'All' ? selectedBudget : null;

      const res = await api.getFashionRecommendations({
        gender,
        bodyShape: selectedShape,
        category: selectedCategory !== 'All' ? selectedCategory : null,
        occasions: occList,
        budgetTier: bTier,
      });

      setRecommendations(res.recommended_dresses || []);
      setCarefulStyles(res.styles_to_consider_carefully || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExplainClick = async (item) => {
    setActiveItemTitle(item.name);
    setExplainingLoading(true);
    setExplainOpen(true);
    try {
      const measurements = bodyAnalysis?.measurements || {
        shoulder_to_hip_ratio: gender === 'men' ? 1.15 : 1.0,
        waist_to_hip_ratio: gender === 'men' ? 0.85 : 0.74,
        torso_to_leg_ratio: 0.63,
        shoulder_width_cm: gender === 'men' ? 44.0 : 38.0,
        hip_width_cm: gender === 'men' ? 38.0 : 38.0,
        waist_width_cm: gender === 'men' ? 32.0 : 28.0,
      };

      const explanation = await api.explainDress({
        dressId: item.id,
        gender,
        bodyShape: selectedShape,
        measurements,
      });

      setActiveExplanation(explanation);
    } catch (err) {
      console.error(err);
    } finally {
      setExplainingLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E2DDD5]">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#B8860B]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Personal Fashion Advisor</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1715]">
            Curated Silhouettes & Styling
          </h1>
          <p className="text-xs sm:text-sm text-[#6E645A] max-w-2xl leading-relaxed">
            Specific cuts, necklines, sleeves, fits, and fabrics architected for your physical proportions. 
            Works for both men and women with verifiable explainability.
          </p>
        </div>

        {/* Gender Toggle */}
        <div className="flex bg-[#EFEAE2] p-1.5 rounded-full border border-[#D4AF37]/30 text-xs shrink-0">
          <button
            onClick={() => {
              setGender('women');
              setSelectedShape('Hourglass');
            }}
            className={`px-5 py-2 rounded-full font-semibold transition-all ${
              gender === 'women' ? 'bg-[#1C1A18] text-[#FAF8F5] shadow-xs' : 'text-[#6E645A]'
            }`}
          >
            Women's Wardrobe
          </button>
          <button
            onClick={() => {
              setGender('men');
              setSelectedShape('Trapezoid');
            }}
            className={`px-5 py-2 rounded-full font-semibold transition-all ${
              gender === 'men' ? 'bg-[#1C1A18] text-[#FAF8F5] shadow-xs' : 'text-[#6E645A]'
            }`}
          >
            Men's Wardrobe
          </button>
        </div>
      </div>

      {/* Interactive Filters Bar */}
      <div className="glass-panel p-5 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#1A1715]">
          <Filter className="w-4 h-4 text-[#B8860B]" />
          <span>Refine Wardrobe Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {/* Clothing Category Filter */}
          <div>
            <label className="block font-semibold text-[#3D3730] mb-1">
              Clothing Category (Strict)
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2DDD5] text-xs font-semibold focus:outline-none focus:border-[#D4AF37]"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Body Shape Selector / Override */}
          <div>
            <label className="block font-semibold text-[#3D3730] mb-1">
              Body Shape Model {selectedShape === detectedShape && '(Detected)'}
            </label>
            <select
              value={selectedShape}
              onChange={(e) => setSelectedShape(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2DDD5] text-xs focus:outline-none focus:border-[#D4AF37]"
            >
              {(gender === 'men' ? maleShapes : femaleShapes).map((shape) => (
                <option key={shape} value={shape}>
                  {shape} Silhouette {shape === detectedShape ? '★ Detected' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Occasion Filter */}
          <div>
            <label className="block font-semibold text-[#3D3730] mb-1">Occasion</label>
            <select
              value={selectedOccasion}
              onChange={(e) => setSelectedOccasion(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2DDD5] text-xs focus:outline-none focus:border-[#D4AF37]"
            >
              {occasions.map((occ) => (
                <option key={occ} value={occ}>{occ}</option>
              ))}
            </select>
          </div>

          {/* Budget Tier */}
          <div>
            <label className="block font-semibold text-[#3D3730] mb-1">Budget Tier</label>
            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2DDD5] text-xs focus:outline-none focus:border-[#D4AF37]"
            >
              {budgetTiers.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Recommendations Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-[#1A1715]">
            Recommended Outfits & Silhouettes ({recommendations.length})
          </h2>
          <span className="text-xs text-[#7A6E62]">
            Optimized for {selectedShape} Proportions
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-[#B8860B] animate-spin mx-auto" />
            <p className="text-xs text-[#6E645A]">Curating architectural fashion recommendations...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="glass-panel p-10 rounded-3xl text-center space-y-3">
            <p className="text-sm font-semibold text-[#1A1715]">No specific outfits matched all filter criteria.</p>
            <p className="text-xs text-[#7A6E62]">Try resetting Occasion or Budget to "All".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendations.map((item) => (
              <div
                key={item.id}
                className="glass-panel rounded-3xl border border-[#E2DDD5] hover:border-[#D4AF37]/60 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Outfit Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-[#1C1A18]">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 bg-[#1C1A18]/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-semibold text-[#FAF8F5] border border-[#D4AF37]/40 shadow-xs">
                    {item.category}
                  </div>

                  {/* Suitability Score */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-800 shadow-xs">
                    {Math.round(item.suitability_score * 100)}% Fit Match
                  </div>

                  {/* Gradient Overlay at bottom */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 text-white">
                    <p className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">
                      {item.budget_category} • {item.occasions[0]}
                    </p>
                    <h3 className="font-serif text-lg font-bold leading-snug">
                      {item.name}
                    </h3>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  
                  <div className="space-y-3 text-xs">
                    
                    {/* Why It Suits You */}
                    <div className="p-3 rounded-2xl bg-[#FBF9F6] border border-[#E8E2D8] space-y-1">
                      <p className="font-semibold text-[#1A1715] flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#B8860B]" />
                        <span>Why It Suits You</span>
                      </p>
                      <p className="text-[#5A5147] text-[11px] leading-relaxed">
                        {item.why_suits_body}
                      </p>
                    </div>

                    {/* Structural Specifications */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[#4A4540]">
                      <div>
                        <span className="text-[#8C7A6B] block">Fit:</span>
                        <span className="font-medium">{item.fit}</span>
                      </div>
                      <div>
                        <span className="text-[#8C7A6B] block">Neckline / Collar:</span>
                        <span className="font-medium">{item.neckline}</span>
                      </div>
                      <div>
                        <span className="text-[#8C7A6B] block">Sleeve / Cuff:</span>
                        <span className="font-medium">{item.sleeve}</span>
                      </div>
                      <div>
                        <span className="text-[#8C7A6B] block">Best Fabric:</span>
                        <span className="font-medium">{item.fabric}</span>
                      </div>
                    </div>

                    {/* Suitable Colors */}
                    <div>
                      <span className="text-[#8C7A6B] text-[10px] block mb-1 uppercase font-semibold">
                        Recommended Colors:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.suitable_colors.map((c, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-full bg-white border border-[#E2DDD5] text-[10px] text-[#2E2822]"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Actions: Explain AI + Direct Shopping */}
                  <div className="pt-3 border-t border-[#F0EBE4] space-y-2">
                    
                    {/* Explain Button */}
                    <button
                      onClick={() => handleExplainClick(item)}
                      className="w-full py-2 rounded-full border border-[#D4AF37] bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-[#1A1715] flex items-center justify-center space-x-1.5 transition-colors shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" />
                      <span>Explain My Recommendation</span>
                    </button>

                    {/* Shopping Links Buttons */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-[#8C7A6B] font-semibold uppercase">Shop On:</span>
                      <div className="flex items-center space-x-1.5">
                        <a
                          href={item.shopping_links.myntra}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded bg-[#FAF8F5] border border-[#E2DDD5] text-[10px] font-semibold text-[#2E2822] hover:border-[#D4AF37] hover:text-[#B8860B]"
                        >
                          Myntra
                        </a>
                        <a
                          href={item.shopping_links.ajio}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded bg-[#FAF8F5] border border-[#E2DDD5] text-[10px] font-semibold text-[#2E2822] hover:border-[#D4AF37] hover:text-[#B8860B]"
                        >
                          AJIO
                        </a>
                        <a
                          href={item.shopping_links.amazon}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded bg-[#FAF8F5] border border-[#E2DDD5] text-[10px] font-semibold text-[#2E2822] hover:border-[#D4AF37] hover:text-[#B8860B]"
                        >
                          Amazon
                        </a>
                        <a
                          href={item.shopping_links.flipkart}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded bg-[#FAF8F5] border border-[#E2DDD5] text-[10px] font-semibold text-[#2E2822] hover:border-[#D4AF37] hover:text-[#B8860B]"
                        >
                          Flipkart
                        </a>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Styles to Consider Carefully Section */}
      {carefulStyles.length > 0 && (
        <div className="p-8 rounded-3xl bg-[#FAF6F3] border border-[#E2DDD5] space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-[#631B2A]">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Architectural Guidance</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#1A1715]">
              Styles to Consider Carefully
            </h3>
            <p className="text-xs text-[#6E645A] max-w-3xl leading-relaxed">
              Every body silhouette is unique and celebrated. These garments feature structural lines 
              that may diminish your preferred waist definition or balance. You are always welcome to style them with balancing accessories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {carefulStyles.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white border border-[#E8E2D8] flex flex-col sm:flex-row gap-4 items-start"
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-24 h-24 rounded-xl object-cover shrink-0"
                />
                <div className="space-y-1.5 text-xs">
                  <h4 className="font-serif text-base font-bold text-[#1A1715]">
                    {item.name}
                  </h4>
                  <p className="text-[#6E645A] text-[11px] leading-relaxed">
                    {item.consideration_reason}
                  </p>
                  <button
                    onClick={() => handleExplainClick(item)}
                    className="text-[11px] text-[#B8860B] font-semibold hover:underline flex items-center space-x-1 pt-1"
                  >
                    <span>Explain Architectural Contrast &rarr;</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explainable AI Modal */}
      <ExplainModal
        isOpen={explainOpen}
        onClose={() => setExplainOpen(false)}
        explanation={activeExplanation}
        itemTitle={activeItemTitle}
      />

    </div>
  );
};
