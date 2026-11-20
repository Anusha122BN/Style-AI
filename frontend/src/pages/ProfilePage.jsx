import React, { useState } from 'react';
import { 
  User, 
  Sparkles, 
  Save, 
  Trash2, 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  Lock 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ProfilePage = ({ setActiveTab }) => {
  const { user, updateProfile, logout } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [gender, setGender] = useState(user?.gender_preference || 'Women');
  const [heightCm, setHeightCm] = useState(user?.height_cm || 168);
  const [budgetTier, setBudgetTier] = useState(user?.preferences?.budget_tier || 'Mid-range');
  const [wantsMakeup, setWantsMakeup] = useState(user?.preferences?.wants_makeup ?? true);

  const [selectedStyles, setSelectedStyles] = useState(
    user?.preferences?.preferred_styles || ['Formal', 'Casual', 'Traditional']
  );
  const [selectedColors, setSelectedColors] = useState(
    user?.preferences?.favorite_colors || ['Champagne Gold', 'Burgundy', 'Navy Blue']
  );

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const availableStyles = [
    'Casual',
    'Formal',
    'Traditional',
    'Party wear',
    'Office wear',
    'Wedding wear',
    'College wear',
    'Sportswear',
    'Streetwear',
  ];

  const availableColors = [
    'Champagne Gold',
    'Burgundy',
    'Emerald Green',
    'Navy Blue',
    'Warm Ivory',
    'Rose Gold',
    'Olive Moss',
    'Black',
    'Mustard Saffron',
    'Terracotta',
  ];

  const toggleStyle = (style) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const toggleColor = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await updateProfile({
        full_name: fullName,
        gender_preference: gender,
        height_cm: parseFloat(heightCm),
        budget_tier: budgetTier,
        wants_makeup: wantsMakeup,
        preferred_styles: selectedStyles,
        favorite_colors: selectedColors,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.deleteAccount();
      logout();
      setActiveTab('landing');
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="space-y-2 pb-6 border-b border-[#E2DDD5]">
        <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#B8860B]">
          <User className="w-3.5 h-3.5" />
          <span>Client Profile & Styling Preferences</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1715]">
          Manage Your Style Profile
        </h1>
        <p className="text-xs sm:text-sm text-[#6E645A]">
          Configure your personal wardrobe gender, height calibration, occasion preferences, and privacy controls.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Personal Details */}
        <div className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#1A1715]">
            1. Core Identity & Calibration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#3D3730] mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2DDD5] text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#3D3730] mb-1">Wardrobe Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2DDD5] text-xs focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="Women">Women</option>
                <option value="Men">Men</option>
                <option value="Prefer not to specify">Prefer not to specify</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#3D3730] mb-1">Physical Height (cm)</label>
              <input
                type="number"
                min="120"
                max="230"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2DDD5] text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>
        </div>

        {/* Style & Occasion Preferences */}
        <div className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#1A1715]">
            2. Preferred Occasions & Aesthetics
          </h3>

          <div className="flex flex-wrap gap-2 pt-1">
            {availableStyles.map((style) => {
              const isSelected = selectedStyles.includes(style);
              return (
                <button
                  type="button"
                  key={style}
                  onClick={() => toggleStyle(style)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#1C1A18] text-[#FAF8F5] border border-[#D4AF37]/50 shadow-xs'
                      : 'bg-white border border-[#E2DDD5] text-[#554D43] hover:border-[#D4AF37]'
                  }`}
                >
                  {style}
                </button>
              );
            })}
          </div>
        </div>

        {/* Budget & Makeup Options */}
        <div className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#1A1715]">
            3. Budget & Beauty Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-semibold text-[#3D3730] mb-1">Budget Category</label>
              <select
                value={budgetTier}
                onChange={(e) => setBudgetTier(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2DDD5] text-xs focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="Budget-friendly">Budget-friendly</option>
                <option value="Mid-range">Mid-range</option>
                <option value="Premium/Luxury">Premium / Luxury</option>
              </select>
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <input
                type="checkbox"
                id="wantsMakeupCheck"
                checked={wantsMakeup}
                onChange={(e) => setWantsMakeup(e.target.checked)}
                className="w-4 h-4 accent-[#B8860B] rounded cursor-pointer"
              />
              <label htmlFor="wantsMakeupCheck" className="font-semibold text-[#3D3730] cursor-pointer">
                Include Makeup & Beauty Recommendations (Optional)
              </label>
            </div>
          </div>
        </div>

        {/* Favorite Colors */}
        <div className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#1A1715]">
            4. Favorite Color Preferences
          </h3>
          <div className="flex flex-wrap gap-2 pt-1">
            {availableColors.map((color) => {
              const isSelected = selectedColors.includes(color);
              return (
                <button
                  type="button"
                  key={color}
                  onClick={() => toggleColor(color)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#631B2A] text-white border border-[#D4AF37]/50 shadow-xs'
                      : 'bg-white border border-[#E2DDD5] text-[#554D43] hover:border-[#D4AF37]'
                  }`}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-4">
          {savedSuccess ? (
            <span className="text-xs font-semibold text-emerald-800 flex items-center space-x-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Profile updated successfully!</span>
            </span>
          ) : (
            <span></span>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-full bg-[#1C1A18] text-[#FAF8F5] hover:bg-[#2B2724] border border-[#D4AF37]/50 font-semibold text-xs tracking-wider uppercase shadow-md flex items-center space-x-2 transition-all hover:scale-105"
          >
            <Save className="w-4 h-4 text-[#D4AF37]" />
            <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </div>

      </form>

      {/* Account Deletion / GDPR Erasure Section */}
      <div className="p-6 rounded-3xl bg-red-50/70 border border-red-200 space-y-3">
        <div className="flex items-center space-x-2 text-red-800 font-semibold text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>Privacy & Permanent Account Deletion (Right to Erasure)</span>
        </div>
        <p className="text-xs text-red-700 leading-relaxed">
          In strict compliance with Privacy by Design, deleting your account permanently purges your credentials and preference records. 
          Remember: your biometric images were already never saved.
        </p>
        <button
          onClick={() => setDeleteModalOpen(true)}
          className="px-4 py-2 rounded-full bg-red-700 text-white hover:bg-red-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Permanently Erase Account</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-red-200">
            <h4 className="font-serif text-lg font-bold text-red-900">
              Confirm Permanent Erasure
            </h4>
            <p className="text-xs text-red-700 leading-relaxed">
              Are you sure? This action cannot be undone. All your saved profile preferences will be permanently wiped.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-full border border-gray-300 text-xs font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-4 py-2 rounded-full bg-red-700 text-white text-xs font-semibold hover:bg-red-800"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
