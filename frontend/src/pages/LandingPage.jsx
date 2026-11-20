import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Sliders, 
  UserCheck, 
  ShoppingBag, 
  Palette, 
  Camera, 
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = ({ setActiveTab }) => {
  const { isAuthenticated, login } = useAuth();

  const handleDemoClient = async () => {
    try {
      await login('demo.user@styleai.com', 'StyleAiDemoPassword2026!');
      setActiveTab('dashboard');
    } catch (e) {
      // If demo user does not exist yet, proceed directly to signup tab or dashboard
      setActiveTab('auth-login');
    }
  };

  return (
    <div className="space-y-24 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Typography & CTAs */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#1C1A18] text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-semibold tracking-wider uppercase shadow-xs">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Explainable AI Fashion & Makeup Advisor</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#1A1715] leading-[1.08]">
                Bespoke Styling, <br />
                <span className="gold-gradient-text italic font-normal">
                  Scientifically Explained.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#5A5147] max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Elevate your personal image with intelligent body architecture analysis, 
                inclusive 10-tone Monk scale skin science, and transparent styling rationales. 
                Engineered for <strong>both Men and Women</strong>.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => setActiveTab(isAuthenticated ? 'studio' : 'auth-signup')}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#1C1A18] text-[#FAF8F5] hover:bg-[#2B2724] border border-[#D4AF37] font-semibold text-sm tracking-wider uppercase flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <span>Start Your Analysis</span>
                  <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                </button>

                <button
                  onClick={handleDemoClient}
                  className="w-full sm:w-auto px-6 py-4 rounded-full bg-white/80 hover:bg-white text-[#1A1715] border border-[#E2DDD5] font-semibold text-sm tracking-wider uppercase shadow-xs hover:border-[#D4AF37] transition-all"
                >
                  Quick Demo Access
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-[#E8E2D8] grid grid-cols-3 gap-4 text-center lg:text-left max-w-lg mx-auto lg:mx-0">
                <div>
                  <p className="font-serif text-2xl font-bold text-[#1A1715]">10 Tones</p>
                  <p className="text-[11px] text-[#7A6E62]">Monk Scale Inclusivity</p>
                </div>
                <div>
                  <p className="font-serif text-2xl font-bold text-[#1A1715]">100% Traceable</p>
                  <p className="text-[11px] text-[#7A6E62]">SHAP Explanations</p>
                </div>
                <div>
                  <p className="font-serif text-2xl font-bold text-[#1A1715]">Zero Storage</p>
                  <p className="text-[11px] text-[#7A6E62]">Volatile RAM Privacy</p>
                </div>
              </div>

            </div>

            {/* Right Column: Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md">
                
                {/* Decorative glow */}
                <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-[#D4AF37]/15 blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-10 -left-10 w-72 h-72 rounded-full bg-[#631B2A]/10 blur-3xl pointer-events-none"></div>

                {/* Layered Card 1: Dual Gender Fashion Card */}
                <div className="relative z-10 glass-panel p-6 rounded-3xl shadow-xl border border-[#D4AF37]/40 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]"></span>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#1A1715]">
                        Live Styling Engine
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1C1A18] text-[#D4AF37] font-medium">
                      Men & Women
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl overflow-hidden relative group">
                      <img
                        src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80"
                        alt="Women Fashion"
                        className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2.5 text-white">
                        <span className="text-[10px] font-semibold text-[#D4AF37]">Hourglass & Pear</span>
                        <p className="text-xs font-bold">A-Line Midi & Silk Wrap</p>
                      </div>
                    </div>

                    <div className="rounded-2xl overflow-hidden relative group">
                      <img
                        src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80"
                        alt="Men Fashion"
                        className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2.5 text-white">
                        <span className="text-[10px] font-semibold text-[#D4AF37]">Trapezoid & Rectangle</span>
                        <p className="text-xs font-bold">Structured Bespoke Blazer</p>
                      </div>
                    </div>
                  </div>

                  {/* Micro XAI widget */}
                  <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E2DDD5] text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-semibold text-[#1A1715]">
                      <span className="flex items-center space-x-1">
                        <Sliders className="w-3.5 h-3.5 text-[#B8860B]" />
                        <span>Why This Matches You</span>
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold">94% Fit Symmetry</span>
                    </div>
                    <p className="text-[11px] text-[#6E645A]">
                      "Shoulder-to-Hip Ratio of 1.15 complements the tapered waistline, creating visual height."
                    </p>
                  </div>
                </div>

                {/* Floating pill */}
                <div className="absolute -bottom-5 -right-4 z-20 glass-panel px-4 py-2.5 rounded-2xl shadow-lg border border-[#D4AF37]/50 flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-600/15 flex items-center justify-center text-emerald-700">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1A1715]">Privacy Guaranteed</p>
                    <p className="text-[10px] text-[#7A6E62]">RAM-Only In-Memory CV</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Pillar Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#B8860B]">
            Comprehensive Architecture
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1715]">
            How Style AI Works For You
          </h2>
          <p className="text-sm text-[#6E645A]">
            A complete fusion of computer vision, color science, and explainable intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="glass-panel p-8 rounded-3xl border border-[#E2DDD5] hover:border-[#D4AF37]/60 transition-all duration-300 space-y-4 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-[#1C1A18] text-[#D4AF37] flex items-center justify-center shadow-md">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1A1715]">
              1. Calibrated Body & Skin Analysis
            </h3>
            <p className="text-xs text-[#6E645A] leading-relaxed">
              Upload photographs or use our live posture-guided camera. Calibrated with your exact physical height to compute anatomical widths, ratios, and monk skin tone brackets.
            </p>
            <ul className="text-xs text-[#524B43] space-y-1.5 pt-2">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#B8860B]" />
                <span>MediaPipe Pose & FaceMesh tracking</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#B8860B]" />
                <span>Gray-World illumination correction</span>
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-8 rounded-3xl border border-[#E2DDD5] hover:border-[#D4AF37]/60 transition-all duration-300 space-y-4 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-[#1C1A18] text-[#D4AF37] flex items-center justify-center shadow-md">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1A1715]">
              2. Explainable AI & SHAP Insights
            </h3>
            <p className="text-xs text-[#6E645A] leading-relaxed">
              No black-box guesses. Every recommendation comes with a verifiable rule-based trace, SHAP feature importance bar charts, and mathematical counterfactual boundary shifts.
            </p>
            <ul className="text-xs text-[#524B43] space-y-1.5 pt-2">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#B8860B]" />
                <span>Surrogate Decision Tree explanation</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#B8860B]" />
                <span>Dual Simple & Technical view modes</span>
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-8 rounded-3xl border border-[#E2DDD5] hover:border-[#D4AF37]/60 transition-all duration-300 space-y-4 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-[#1C1A18] text-[#D4AF37] flex items-center justify-center shadow-md">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1A1715]">
              3. Direct Multi-Store Shopping
            </h3>
            <p className="text-xs text-[#6E645A] leading-relaxed">
              Love a recommended outfit or makeup shade? Jump straight to genuine retail search listings across Myntra, AJIO, Meesho, Flipkart, and Amazon with customized parameters.
            </p>
            <ul className="text-xs text-[#524B43] space-y-1.5 pt-2">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#B8860B]" />
                <span>No fake inventory or phantom pricing</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#B8860B]" />
                <span>Personalized color & silhouette queries</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* Gender Inclusivity Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#1C1A18] via-[#2B2724] to-[#631B2A] text-white p-8 sm:p-14 border border-[#D4AF37]/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="text-[11px] font-bold tracking-widest text-[#D4AF37] uppercase">
              Equal Excellence
            </span>
            <h3 className="font-serif text-2xl sm:text-4xl font-bold">
              Fashion Architecture for Men and Women
            </h3>
            <p className="text-xs sm:text-sm text-[#D1C7BD] leading-relaxed">
              Whether you need bespoke blazers, kurtas, and streetwear for men, or wrap dresses, sarees, and gowns for women, Style AI provides dedicated algorithms, proportions, and optional makeup recommendations for all.
            </p>
          </div>
          <button
            onClick={() => setActiveTab(isAuthenticated ? 'dashboard' : 'auth-signup')}
            className="shrink-0 px-8 py-3.5 rounded-full bg-[#FAF8F5] text-[#1A1715] hover:bg-[#EFEAE2] font-semibold text-xs tracking-wider uppercase shadow-md transition-all hover:scale-105"
          >
            Create Your Profile
          </button>
        </div>
      </section>

    </div>
  );
};
