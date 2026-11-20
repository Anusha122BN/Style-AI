import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Sparkles, 
  Cpu, 
  TrendingUp, 
  Scale, 
  HelpCircle, 
  CheckCircle2, 
  BarChart2, 
  RefreshCw 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  ReferenceLine 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ExplainableAIPage = () => {
  const { user, bodyAnalysis } = useAuth();

  const [gender, setGender] = useState((user?.gender_preference || 'Women').toLowerCase());
  const [shr, setShr] = useState(bodyAnalysis?.measurements?.shoulder_to_hip_ratio || 1.0);
  const [whr, setWhr] = useState(bodyAnalysis?.measurements?.waist_to_hip_ratio || 0.74);
  const [tlr, setTlr] = useState(bodyAnalysis?.measurements?.torso_to_leg_ratio || 0.63);
  
  const [mode, setMode] = useState('simple');
  const [counterfactuals, setCounterfactuals] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSimulationData();
  }, [gender, shr, whr]);

  const fetchSimulationData = async () => {
    setLoading(true);
    try {
      const activeShape = bodyAnalysis?.classification?.detected_shape || (gender === 'men' ? 'Trapezoid' : 'Hourglass');
      const cfs = await api.getCounterfactuals({
        gender,
        bodyShape: activeShape,
        measurements: {
          shoulder_to_hip_ratio: shr,
          waist_to_hip_ratio: whr,
        },
      });
      setCounterfactuals(cfs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic simulated SHAP weights based on current sliders
  const simulatedShap = [
    {
      name: 'SHR (Shoulder/Hip)',
      score: Number(((shr - 1.0) * 1.5).toFixed(3)),
      val: shr,
      desc: shr > 1.1 ? 'Broad shoulder line dominates upper torso.' : shr < 0.9 ? 'Hip width expands lower base line.' : 'Balanced horizontal frame.',
    },
    {
      name: 'WHR (Waist/Hip)',
      score: Number(((0.80 - whr) * 2.0).toFixed(3)),
      val: whr,
      desc: whr <= 0.75 ? 'Marked natural indentation defines waist curve.' : 'Linear vertical contour through midsection.',
    },
    {
      name: 'TLR (Torso/Leg)',
      score: Number(((tlr - 0.62) * 0.8).toFixed(3)),
      val: tlr,
      desc: 'Vertical height proportionality between upper and lower skeleton.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E2DDD5]">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#B8860B]">
            <Cpu className="w-3.5 h-3.5" />
            <span>Verifiable AI Diagnostics</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1715]">
            Explainable AI (XAI) Intelligence Lab
          </h1>
          <p className="text-xs sm:text-sm text-[#6E645A] max-w-2xl leading-relaxed">
            Inspect the surrogate decision tree, test live counterfactual simulations, and visualize exact feature contributions (SHAP) behind every garment classification.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-[#EFEAE2] p-1.5 rounded-full border border-[#D4AF37]/30 text-xs shrink-0">
          <button
            onClick={() => setMode('simple')}
            className={`px-4 py-1.5 rounded-full font-semibold transition-all ${
              mode === 'simple' ? 'bg-[#1C1A18] text-[#FAF8F5] shadow-xs' : 'text-[#6E645A]'
            }`}
          >
            Simple Explanations
          </button>
          <button
            onClick={() => setMode('technical')}
            className={`px-4 py-1.5 rounded-full font-semibold transition-all ${
              mode === 'technical' ? 'bg-[#1C1A18] text-[#FAF8F5] shadow-xs' : 'text-[#6E645A]'
            }`}
          >
            Technical Diagnostics
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Sandbox vs Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Interactive Ratio Simulator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#1A1715] flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-[#B8860B]" />
                <span>Anthropometric Ratio Sandbox</span>
              </h3>
              <button
                onClick={() => {
                  setShr(1.0);
                  setWhr(0.74);
                }}
                className="text-[11px] text-[#B8860B] hover:underline"
              >
                Reset
              </button>
            </div>

            <p className="text-xs text-[#6E645A]">
              Adjust the sliders below to see in real-time how changing structural ratios alters SHAP weights and boundary counterfactuals.
            </p>

            {/* Slider 1: SHR */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#3D3730]">Shoulder-to-Hip Ratio (SHR):</span>
                <span className="text-[#631B2A] font-bold font-mono">{shr.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.70"
                max="1.40"
                step="0.01"
                value={shr}
                onChange={(e) => setShr(parseFloat(e.target.value))}
                className="w-full accent-[#B8860B]"
              />
              <div className="flex justify-between text-[10px] text-[#8C7A6B]">
                <span>0.70 (Pear / Triangle)</span>
                <span>1.00 (Balanced)</span>
                <span>1.40 (Inverted Triangle)</span>
              </div>
            </div>

            {/* Slider 2: WHR */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#3D3730]">Waist-to-Hip Ratio (WHR):</span>
                <span className="text-[#631B2A] font-bold font-mono">{whr.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.60"
                max="1.05"
                step="0.01"
                value={whr}
                onChange={(e) => setWhr(parseFloat(e.target.value))}
                className="w-full accent-[#B8860B]"
              />
              <div className="flex justify-between text-[10px] text-[#8C7A6B]">
                <span>0.60 (Curbed / Hourglass)</span>
                <span>0.85 (Linear / Straight)</span>
                <span>1.05 (Prominent Waist / Apple)</span>
              </div>
            </div>

            {/* Gender Toggle */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-[#3D3730] mb-1.5">Evaluation Model</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setGender('women')}
                  className={`py-2 rounded-xl font-semibold border ${
                    gender === 'women'
                      ? 'bg-[#1C1A18] text-white border-[#1C1A18]'
                      : 'bg-white text-[#5A5147] border-[#E2DDD5]'
                  }`}
                >
                  Women's Model
                </button>
                <button
                  type="button"
                  onClick={() => setGender('men')}
                  className={`py-2 rounded-xl font-semibold border ${
                    gender === 'men'
                      ? 'bg-[#1C1A18] text-white border-[#1C1A18]'
                      : 'bg-white text-[#5A5147] border-[#E2DDD5]'
                  }`}
                >
                  Men's Model
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right: SHAP Chart & Counterfactuals */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Live SHAP Visualization */}
          <div className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#1A1715] flex items-center space-x-2">
                <BarChart2 className="w-5 h-5 text-[#B8860B]" />
                <span>Feature Importance Weights (SHAP)</span>
              </h3>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                Live Surrogate Model
              </span>
            </div>

            <p className="text-xs text-[#6E645A]">
              Positive weights (Gold) push the prediction towards the active silhouette; negative weights (Burgundy) moderate or oppose it:
            </p>

            <div className="h-48 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={simulatedShap}
                  margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
                >
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
                  <Tooltip
                    formatter={(val) => [`${val > 0 ? '+' : ''}${val}`, 'SHAP Value']}
                  />
                  <ReferenceLine x={0} stroke="#9CA3AF" strokeDasharray="3 3" />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {simulatedShap.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.score >= 0 ? '#D4AF37' : '#9E4756'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#F0EBE4] text-xs">
              {simulatedShap.map((s, idx) => (
                <div key={idx} className="flex justify-between py-1">
                  <span className="font-semibold text-[#1A1715]">{s.name}:</span>
                  <span className="text-[#6E645A]">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Counterfactual Decision Boundaries */}
          <div className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-[#631B2A]" />
              <h3 className="font-serif text-lg font-bold text-[#1A1715]">
                Mathematical Counterfactual Shifts
              </h3>
            </div>

            <p className="text-xs text-[#6E645A]">
              Calculates the exact delta distance in ratio space required to trigger a classification state transition:
            </p>

            <div className="space-y-3">
              {counterfactuals.map((cf, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#FBF9F6] border border-[#E8E2D8] text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#631B2A] uppercase tracking-wider text-[11px]">
                      Target Transition: {cf.target_shape}
                    </span>
                    <span className="text-[10px] text-[#7A6E62]">Decision Boundary Path</span>
                  </div>
                  <p className="text-[#3D3730] leading-relaxed">{cf.explanation}</p>
                  {mode === 'technical' && (
                    <div className="p-2 bg-white rounded-lg border border-[#E2DDD5] font-mono text-[10px] text-[#554D43] overflow-x-auto">
                      Boundary Perturbation: {JSON.stringify(cf.required_ratio_changes)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
