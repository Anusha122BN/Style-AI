import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  Sparkles, 
  BarChart2, 
  TrendingUp, 
  Scale, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  AlertCircle 
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

export const ExplainModal = ({ isOpen, onClose, explanation, itemTitle }) => {
  const [mode, setMode] = useState('simple'); // 'simple' | 'technical'

  if (!isOpen || !explanation) return null;

  const shapData = (explanation.shap_features || []).map((feat) => ({
    name: feat.feature_name.split(' (')[0], // Short label
    fullName: feat.feature_name,
    score: feat.importance_score,
    userVal: feat.user_feature_value,
    impact: feat.impact_description,
    direction: feat.direction,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] border border-[#D4AF37]/40 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#FAF8F5]/90 backdrop-blur-md px-6 py-4 border-b border-[#E2DDD5] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-[#1C1A18] text-[#D4AF37] flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#1A1715]">
                Why This Suits You | Explainable AI
              </h3>
              <p className="text-xs text-[#7A6E62]">
                {itemTitle || explanation.dress_name}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Mode Switcher */}
            <div className="flex items-center bg-[#EFEAE2] p-1 rounded-full border border-[#D4AF37]/30 text-xs">
              <button
                onClick={() => setMode('simple')}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  mode === 'simple'
                    ? 'bg-[#1C1A18] text-[#FAF8F5] shadow-xs'
                    : 'text-[#6E645A] hover:text-[#1A1715]'
                }`}
              >
                Simple
              </button>
              <button
                onClick={() => setMode('technical')}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  mode === 'technical'
                    ? 'bg-[#1C1A18] text-[#FAF8F5] shadow-xs'
                    : 'text-[#6E645A] hover:text-[#1A1715]'
                }`}
              >
                Technical
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#7A6E62] hover:text-[#1A1715] hover:bg-[#EFEAE2] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Section 1: Rule-Based Recommendation Rationale */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#FBF9F6] to-[#F5EFEB] border border-[#E5C378]/30 shadow-xs">
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 w-6 h-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#B8860B] shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-[#1A1715] flex items-center space-x-1.5">
                  <span>Styling Rationale</span>
                  <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#8A6D1C]">
                    Rule-Based Trace
                  </span>
                </h4>
                <p className="text-xs text-[#524B43] leading-relaxed">
                  {explanation.rule_explanation}
                </p>
                {explanation.proportions_complemented && (
                  <p className="text-xs text-[#7A6E62] italic pt-1">
                    "{explanation.proportions_complemented}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: SHAP Feature Importance */}
          <div className="p-5 rounded-2xl bg-white border border-[#E2DDD5] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-[#B8860B]" />
                <h4 className="text-sm font-semibold text-[#1A1715]">
                  Feature Importance Analysis (SHAP)
                </h4>
              </div>
              <span className="text-[10px] text-[#8C7A6B]">
                Surrogate Decision Tree Contribution
              </span>
            </div>

            <p className="text-xs text-[#6B6156]">
              {mode === 'simple'
                ? 'These anatomical metrics contributed most strongly to why our personal stylist model selected this silhouette:'
                : 'Exact Shapley additive values representing log-odds deviation from the baseline population expectation across calibrated ratios:'}
            </p>

            {/* Horizontal Bar Chart */}
            <div className="h-48 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={shapData}
                  margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                >
                  <XAxis type="number" domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip
                    formatter={(val, name, props) => [
                      `${val > 0 ? '+' : ''}${val.toFixed(3)} (${props.payload.direction})`,
                      'SHAP Weight',
                    ]}
                    labelFormatter={(label, payload) => payload[0]?.payload.fullName || label}
                  />
                  <ReferenceLine x={0} stroke="#9CA3AF" strokeDasharray="3 3" />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {shapData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.score >= 0 ? '#D4AF37' : '#9E4756'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Feature impact list */}
            <div className="space-y-1.5 pt-2 border-t border-[#F0EBE4]">
              {shapData.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-start justify-between text-xs py-1">
                  <span className="font-medium text-[#2E2822]">{item.fullName}:</span>
                  <span className="text-[#6E645A] text-right ml-4">{item.impact}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Counterfactual Explanations */}
          {explanation.counterfactuals && explanation.counterfactuals.length > 0 && (
            <div className="p-5 rounded-2xl bg-white border border-[#E2DDD5] shadow-xs space-y-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-[#631B2A]" />
                <h4 className="text-sm font-semibold text-[#1A1715]">
                  Counterfactual Boundary Explanations
                </h4>
              </div>

              <p className="text-xs text-[#6B6156]">
                What minimal proportional shift would cause the recommendation to pivot toward another category?
              </p>

              <div className="space-y-2">
                {explanation.counterfactuals.map((cf, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#FBF9F6] border border-[#E8E2D8] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#631B2A] flex items-center space-x-1">
                        <span>Target Category:</span>
                        <span className="px-2 py-0.5 bg-[#631B2A]/10 rounded-full font-serif font-bold text-[#631B2A]">
                          {cf.target_shape}
                        </span>
                      </span>
                    </div>
                    <p className="text-[#4F473E]">{cf.explanation}</p>
                    {mode === 'technical' && (
                      <div className="mt-1 font-mono text-[10px] text-[#786D61] bg-[#F4EFEB] p-1.5 rounded">
                        Required Delta: {JSON.stringify(cf.required_ratio_changes)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Why Divergent Styles Were Deprioritized */}
          {explanation.why_unsuitable_styles_diverge && (
            <div className="p-4 rounded-2xl bg-[#F7EBE8]/60 border border-[#B76E79]/30 text-xs text-[#4F363A] space-y-1">
              <div className="flex items-center space-x-2 font-semibold text-[#631B2A]">
                <AlertCircle className="w-4 h-4" />
                <span>Styles Considered Carefully</span>
              </div>
              <p className="leading-relaxed">
                {explanation.why_unsuitable_styles_diverge}
              </p>
            </div>
          )}

          {/* Technical Engine Mode Extra Details */}
          {mode === 'technical' && explanation.technical_details && (
            <div className="p-4 rounded-2xl bg-[#1C1A18] text-[#FAF8F5] text-xs font-mono space-y-2">
              <div className="flex items-center space-x-2 text-[#D4AF37] font-semibold font-sans">
                <Cpu className="w-4 h-4" />
                <span>Model & Calibration Diagnostics</span>
              </div>
              <pre className="overflow-x-auto text-[11px] text-[#E0D8CE] p-2 bg-black/40 rounded-lg">
                {JSON.stringify(explanation.technical_details, null, 2)}
              </pre>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#FAF8F5] px-6 py-3 border-t border-[#E2DDD5] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full text-xs font-semibold bg-[#1C1A18] text-[#FAF8F5] hover:bg-[#2B2724] border border-[#D4AF37]/40 shadow-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
