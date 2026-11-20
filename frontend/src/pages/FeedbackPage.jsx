import React, { useState } from 'react';
import { ShieldCheck, Star, Send, CheckCircle2, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const FeedbackPage = () => {
  const { user } = useAuth();

  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('Styling Recommendations');
  const [recommendationHelpful, setRecommendationHelpful] = useState(true);
  const [bodyShapeAccurate, setBodyShapeAccurate] = useState(true);
  const [skinToneAccurate, setSkinToneAccurate] = useState(true);
  const [comments, setComments] = useState('');
  const [consent, setConsent] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    'Styling Recommendations',
    'Body Shape Detection',
    'Skin Tone & Undertone Match',
    'Explainable AI Rationales',
    'User Interface & Design',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitFeedback({
        user_email: user?.email,
        rating,
        category,
        recommendation_helpful: recommendationHelpful,
        body_shape_accurate: bodyShapeAccurate,
        skin_tone_accurate: skinToneAccurate,
        comments,
        consent_for_anonymous_storage: consent,
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="space-y-2 pb-6 border-b border-[#E2DDD5] text-center">
        <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#B8860B]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Fairness & Quality Evaluation</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1715]">
          Stylist Feedback & Model Evaluation
        </h1>
        <p className="text-xs sm:text-sm text-[#6E645A] max-w-md mx-auto">
          Help us evaluate the fairness, accuracy, and clarity of our explainable styling recommendations.
        </p>
      </div>

      {submitted ? (
        <div className="glass-panel p-10 rounded-3xl border border-[#D4AF37]/50 text-center space-y-4 animate-in fade-in duration-300">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#1A1715]">
            Thank You For Your Feedback
          </h3>
          <p className="text-xs text-[#6E645A] max-w-sm mx-auto">
            Your review helps us refine our anthropometric boundary models and Monk scale calibration.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-6 py-2 rounded-full border border-[#D4AF37] text-xs font-semibold text-[#1A1715] hover:bg-white"
          >
            Submit Another Review
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-6">
          
          {/* Star Rating */}
          <div className="text-center space-y-2">
            <label className="block text-xs font-semibold text-[#3D3730]">Overall Experience Rating</label>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-2xl transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-[#3D3730] mb-1">Focus Area</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2DDD5] text-xs focus:outline-none focus:border-[#D4AF37]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Quick Yes/No Evaluation Toggles */}
          <div className="space-y-3 pt-2 border-t border-[#F0EBE4] text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium text-[#3D3730]">Were the clothing silhouettes flattering?</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setRecommendationHelpful(true)}
                  className={`px-3 py-1 rounded-lg border text-xs font-semibold ${
                    recommendationHelpful ? 'bg-[#1C1A18] text-white border-[#1C1A18]' : 'bg-white text-[#554D43] border-[#E2DDD5]'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setRecommendationHelpful(false)}
                  className={`px-3 py-1 rounded-lg border text-xs font-semibold ${
                    !recommendationHelpful ? 'bg-[#1C1A18] text-white border-[#1C1A18]' : 'bg-white text-[#554D43] border-[#E2DDD5]'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium text-[#3D3730]">Did the detected body shape feel accurate?</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setBodyShapeAccurate(true)}
                  className={`px-3 py-1 rounded-lg border text-xs font-semibold ${
                    bodyShapeAccurate ? 'bg-[#1C1A18] text-white border-[#1C1A18]' : 'bg-white text-[#554D43] border-[#E2DDD5]'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setBodyShapeAccurate(false)}
                  className={`px-3 py-1 rounded-lg border text-xs font-semibold ${
                    !bodyShapeAccurate ? 'bg-[#1C1A18] text-white border-[#1C1A18]' : 'bg-white text-[#554D43] border-[#E2DDD5]'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium text-[#3D3730]">Was the Monk skin tone & undertone match accurate?</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setSkinToneAccurate(true)}
                  className={`px-3 py-1 rounded-lg border text-xs font-semibold ${
                    skinToneAccurate ? 'bg-[#1C1A18] text-white border-[#1C1A18]' : 'bg-white text-[#554D43] border-[#E2DDD5]'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setSkinToneAccurate(false)}
                  className={`px-3 py-1 rounded-lg border text-xs font-semibold ${
                    !skinToneAccurate ? 'bg-[#1C1A18] text-white border-[#1C1A18]' : 'bg-white text-[#554D43] border-[#E2DDD5]'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-xs font-semibold text-[#3D3730] mb-1">
              Comments, Explanations, or Suggestions
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="What did you think of the SHAP explanations or clothing recommendations?"
              className="w-full p-3 rounded-xl bg-white border border-[#E2DDD5] text-xs focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Consent */}
          <div className="flex items-center space-x-2.5 text-xs text-[#6E645A]">
            <input
              type="checkbox"
              id="consentBox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="w-4 h-4 accent-[#B8860B] rounded cursor-pointer"
            />
            <label htmlFor="consentBox" className="cursor-pointer">
              I consent to saving this anonymous feedback for quality evaluation.
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-full bg-[#1C1A18] text-[#FAF8F5] hover:bg-[#2B2724] border border-[#D4AF37]/50 font-semibold text-xs tracking-wider uppercase shadow-md flex items-center justify-center space-x-2 transition-all"
          >
            <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{submitting ? 'Submitting...' : 'Send Review'}</span>
          </button>

        </form>
      )}

    </div>
  );
};
