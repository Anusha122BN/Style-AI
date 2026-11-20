import React from 'react';
import { Sparkles, Shield, Lock, Cpu, Globe } from 'lucide-react';

export const Footer = ({ setActiveTab }) => {
  return (
    <footer className="no-print bg-[#1C1A18] text-[#E0D8CE] border-t border-[#D4AF37]/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2B2724] to-[#631B2A] flex items-center justify-center border border-[#D4AF37]/60">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-[0.2em] text-[#FAF8F5]">
                Style AI
              </span>
            </div>
            <p className="text-xs text-[#A89C8F] leading-relaxed">
              Explainable AI Fashion & Makeup Advisor. Tailored structural silhouettes, Monk scale skin matching, and transparent recommendations for men and women.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-[#D4AF37]">
              <Lock className="w-3.5 h-3.5" />
              <span>RAM-Only Biometrics (Privacy-by-Design)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-[#FAF8F5] tracking-wider uppercase mb-4 border-b border-[#38332E] pb-2">
              Advisor Suites
            </h4>
            <ul className="space-y-2 text-xs text-[#A89C8F]">
              <li>
                <button onClick={() => setActiveTab('studio')} className="text-[#D4AF37] font-semibold hover:underline transition-colors flex items-center space-x-1">
                  <span>✦ AI Stylist Studio (1-Photo)</span>
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('body')} className="hover:text-[#D4AF37] transition-colors">
                  Body Shape Analysis
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('skin')} className="hover:text-[#D4AF37] transition-colors">
                  Monk Skin & Undertone
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('fashion')} className="hover:text-[#D4AF37] transition-colors">
                  Fashion Recommendations
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('makeup')} className="hover:text-[#D4AF37] transition-colors">
                  Complete Makeup Advisor
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('palette')} className="hover:text-[#D4AF37] transition-colors">
                  Personal Color Palette
                </button>
              </li>
            </ul>
          </div>

          {/* Explainable AI & Science */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-[#FAF8F5] tracking-wider uppercase mb-4 border-b border-[#38332E] pb-2">
              AI & Architecture
            </h4>
            <ul className="space-y-2 text-xs text-[#A89C8F]">
              <li>
                <button onClick={() => setActiveTab('xai')} className="hover:text-[#D4AF37] transition-colors">
                  SHAP Feature Explanations
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('xai')} className="hover:text-[#D4AF37] transition-colors">
                  Counterfactual Boundary Testing
                </button>
              </li>
              <li>
                <span className="text-[#786D61]">MediaPipe Pose & FaceMesh</span>
              </li>
              <li>
                <span className="text-[#786D61]">CIEDE2000 & Gray-World White Balance</span>
              </li>
              <li>
                <button onClick={() => setActiveTab('privacy')} className="hover:text-[#D4AF37] transition-colors">
                  GDPR & Privacy Manifest
                </button>
              </li>
            </ul>
          </div>

          {/* Shopping & Verification */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-[#FAF8F5] tracking-wider uppercase mb-4 border-b border-[#38332E] pb-2">
              Shopping Integrations
            </h4>
            <p className="text-xs text-[#A89C8F] leading-relaxed mb-3">
              Direct live search queries encoded to verified retail destinations:
            </p>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="px-2.5 py-1 rounded bg-[#2B2724] border border-[#3D3732] text-[#D4AF37]">Myntra</span>
              <span className="px-2.5 py-1 rounded bg-[#2B2724] border border-[#3D3732] text-[#D4AF37]">AJIO</span>
              <span className="px-2.5 py-1 rounded bg-[#2B2724] border border-[#3D3732] text-[#D4AF37]">Meesho</span>
              <span className="px-2.5 py-1 rounded bg-[#2B2724] border border-[#3D3732] text-[#D4AF37]">Flipkart</span>
              <span className="px-2.5 py-1 rounded bg-[#2B2724] border border-[#3D3732] text-[#D4AF37]">Amazon</span>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#2E2925] flex flex-col sm:flex-row items-center justify-between text-xs text-[#786D61]">
          <p>© 2026 Style AI | Personal AI Fashion & Makeup Advisor. All rights reserved.</p>
          <div className="flex items-center space-x-6 mt-4 sm:mt-0">
            <button onClick={() => setActiveTab('privacy')} className="hover:text-[#D4AF37] transition-colors">
              Privacy by Design
            </button>
            <button onClick={() => setActiveTab('feedback')} className="hover:text-[#D4AF37] transition-colors">
              Feedback & Fairness
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
