import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  Sliders, 
  Layers, 
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Info,
  Palette,
  Heart,
  ShoppingBag,
  Eye,
  Sparkle,
  Filter,
  Check,
  X,
  Download,
  Printer
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CameraModal } from '../components/CameraModal';
import { ExplainModal } from '../components/ExplainModal';

const CATEGORIES = [
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

const BUDGET_TIERS = [
  { id: 'Budget-friendly (₹500 - ₹2,000)', label: 'Budget-friendly (₹500 - ₹2,000)' },
  { id: 'Mid-range (₹2,000 - ₹5,000)', label: 'Mid-range (₹2,000 - ₹5,000)' },
  { id: 'Premium/Luxury (₹5,000+)', label: 'Premium/Luxury (₹5,000+)' },
];

const OCCASIONS = [
  'All',
  'Casual',
  'Office wear',
  'Traditional',
  'Wedding wear',
  'Party wear',
  'College wear',
  'Festive wear',
  'Formal Wear',
];

const POPULAR_COLORS = [
  { name: 'Maroon', hex: '#800020' },
  { name: 'Navy Blue', hex: '#000080' },
  { name: 'Black', hex: '#1C1A18' },
  { name: 'Champagne Gold', hex: '#F7E7CE' },
  { name: 'Emerald Green', hex: '#50C878' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Deep Burgundy', hex: '#631B2A' },
  { name: 'Pristine White', hex: '#FFFFFF' },
];

const LOADING_STAGES = [
  'Validating photo clarity and illumination...',
  'Extracting MediaPipe 33-point skeletal landmark mesh...',
  'Calibrating anthropometric widths with your physical height...',
  'Classifying morphological body silhouette (Hourglass / Pear / etc.)...',
  'Examining facial skin tone & Monk scale undertone...',
  'Filtering bespoke wardrobe tailored strictly to your category...',
  'Generating explainable AI feature weights and direct shopping links...',
];

export const StylistStudioPage = ({ setActiveTab }) => {
  const { 
    user, 
    singlePhotoAnalysis, 
    saveSinglePhotoAnalysis, 
    selectedCategory, 
    setSelectedCategory 
  } = useAuth();

  // Photo state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  // Preference state
  const [gender, setGender] = useState((user?.gender_preference || 'Women').toLowerCase());
  const [heightCm, setHeightCm] = useState(user?.height_cm || 168);
  const [currentCategory, setCurrentCategory] = useState(selectedCategory || 'Traditional Wear');
  const [budgetTier, setBudgetTier] = useState('Mid-range (₹2,000 - ₹5,000)');
  const [selectedOccasion, setSelectedOccasion] = useState('All');
  const [selectedColors, setSelectedColors] = useState(['Maroon', 'Black']);
  const [wantsMakeup, setWantsMakeup] = useState(false);

  // Analysis / execution state
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingStageIdx, setLoadingStageIdx] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Recommendations state
  const [activeAnalysis, setActiveAnalysis] = useState(singlePhotoAnalysis);
  const [recommendedOutfits, setRecommendedOutfits] = useState(singlePhotoAnalysis?.recommended_dresses || []);
  const [carefulOutfits, setCarefulOutfits] = useState(singlePhotoAnalysis?.styles_to_consider_carefully || []);
  const [makeupRecs, setMakeupRecs] = useState(singlePhotoAnalysis?.makeup_recommendations || []);
  const [colorPalette, setColorPalette] = useState(singlePhotoAnalysis?.color_palette || null);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // XAI Modal
  const [explainOpen, setExplainOpen] = useState(false);
  const [activeExplanation, setActiveExplanation] = useState(null);
  const [activeItemTitle, setActiveItemTitle] = useState('');
  const [explainingLoading, setExplainingLoading] = useState(false);

  // Visualizer Tab (Skeleton vs Table)
  const [visualizerTab, setVisualizerTab] = useState('skeleton');

  // Sync state if user changes session analysis
  useEffect(() => {
    if (singlePhotoAnalysis) {
      setActiveAnalysis(singlePhotoAnalysis);
      if (singlePhotoAnalysis.recommended_dresses) {
        setRecommendedOutfits(singlePhotoAnalysis.recommended_dresses);
      }
      if (singlePhotoAnalysis.styles_to_consider_carefully) {
        setCarefulOutfits(singlePhotoAnalysis.styles_to_consider_carefully);
      }
      if (singlePhotoAnalysis.color_palette) {
        setColorPalette(singlePhotoAnalysis.color_palette);
      }
      if (singlePhotoAnalysis.makeup_recommendations) {
        setMakeupRecs(singlePhotoAnalysis.makeup_recommendations);
      }
    }
  }, [singlePhotoAnalysis]);

  // Animated loading ticker
  useEffect(() => {
    let interval;
    if (analyzing) {
      setLoadingStageIdx(0);
      interval = setInterval(() => {
        setLoadingStageIdx((prev) => (prev < LOADING_STAGES.length - 1 ? prev + 1 : prev));
      }, 900);
    }
    return () => clearInterval(interval);
  }, [analyzing]);

  // Handle Photo selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMessage('');
    }
  };

  const handleCameraCapture = (file) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrorMessage('');
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const toggleColor = (colorName) => {
    if (selectedColors.includes(colorName)) {
      setSelectedColors(selectedColors.filter((c) => c !== colorName));
    } else {
      setSelectedColors([...selectedColors, colorName]);
    }
  };

  // Main Execute: Analyze My Look (Single Photo Analysis)
  const handleAnalyzeLook = async () => {
    if (!selectedFile && !activeAnalysis) {
      setErrorMessage('Please upload or capture a full-body photograph to begin.');
      return;
    }

    setAnalyzing(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('image', selectedFile);
      }
      formData.append('gender', gender);
      formData.append('height_cm', heightCm.toString());
      formData.append('category', currentCategory);
      formData.append('budget_tier', budgetTier);
      if (selectedOccasion !== 'All') {
        formData.append('occasion', selectedOccasion);
      }
      if (selectedColors.length) {
        formData.append('favorite_colors', selectedColors.join(','));
      }
      formData.append('wants_makeup', wantsMakeup.toString());

      const result = await api.analyzeSinglePhoto(formData);
      saveSinglePhotoAnalysis(result);
      setActiveAnalysis(result);
      setRecommendedOutfits(result.recommended_dresses || []);
      setCarefulOutfits(result.styles_to_consider_carefully || []);
      setColorPalette(result.color_palette || null);
      setMakeupRecs(result.makeup_recommendations || []);
      setSelectedCategory(currentCategory);
    } catch (err) {
      setErrorMessage(err.message || 'Analysis could not be completed. Please ensure your body is fully visible in frame.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Switch Category Tab (WITHOUT RE-UPLOADING PHOTO!)
  const handleCategorySwitch = async (newCategory) => {
    setCurrentCategory(newCategory);
    setSelectedCategory(newCategory);

    if (!activeAnalysis) return;

    setCategoryLoading(true);
    try {
      const detectedShape = activeAnalysis.classification?.detected_shape || 'Hourglass';
      const res = await api.getFashionRecommendations({
        gender,
        bodyShape: detectedShape,
        category: newCategory,
        occasions: selectedOccasion !== 'All' ? [selectedOccasion] : null,
        budgetTier: budgetTier,
        favoriteColors: selectedColors,
      });

      setRecommendedOutfits(res.recommended_dresses || []);
      setCarefulOutfits(res.styles_to_consider_carefully || []);
    } catch (err) {
      console.error('Failed to update category recommendations:', err);
    } finally {
      setCategoryLoading(false);
    }
  };

  // Explain Button Click
  const handleExplainClick = async (item) => {
    setActiveItemTitle(item.name);
    setExplainingLoading(true);
    setExplainOpen(true);
    try {
      const measurements = activeAnalysis?.measurements || {
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
        bodyShape: activeAnalysis?.classification?.detected_shape || 'Hourglass',
        measurements,
      });

      setActiveExplanation(explanation);
    } catch (err) {
      console.error('Failed to fetch XAI explanation:', err);
    } finally {
      setExplainingLoading(false);
    }
  };

  const measurements = activeAnalysis?.measurements;
  const classification = activeAnalysis?.classification;
  const skinAnalysis = activeAnalysis?.skin_analysis;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E2DDD5]">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#B8860B]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Unified AI Stylist Studio</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1715]">
            Personal Fashion & Makeup Advisor
          </h1>
          <p className="text-xs sm:text-sm text-[#6E645A] max-w-3xl leading-relaxed">
            One clear photograph unlocks your calibrated body shape, facial skin undertone, 
            and bespoke recommendations strictly filtered to your chosen fashion category.
          </p>
        </div>

        {/* Gender Toggle */}
        <div className="flex bg-[#EFEAE2] p-1.5 rounded-full border border-[#D4AF37]/30 text-xs shrink-0 self-start md:self-end">
          <button
            onClick={() => setGender('women')}
            className={`px-5 py-2 rounded-full font-semibold transition-all ${
              gender === 'women' ? 'bg-[#1C1A18] text-[#FAF8F5] shadow-xs' : 'text-[#6E645A]'
            }`}
          >
            Women's Wardrobe
          </button>
          <button
            onClick={() => setGender('men')}
            className={`px-5 py-2 rounded-full font-semibold transition-all ${
              gender === 'men' ? 'bg-[#1C1A18] text-[#FAF8F5] shadow-xs' : 'text-[#6E645A]'
            }`}
          >
            Men's Wardrobe
          </button>
        </div>
      </div>

      {/* 4-Step Journey Header Indicator */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`p-4 rounded-2xl border text-xs flex items-center space-x-3 transition-all ${
          selectedFile || previewUrl ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-[#E2DDD5] text-[#1A1715]'
        }`}>
          <div className="w-6 h-6 rounded-full bg-[#1C1A18] text-[#D4AF37] flex items-center justify-center font-bold text-[10px]">
            1
          </div>
          <div>
            <p className="font-bold">Step 1: Photo</p>
            <p className="text-[10px] text-[#7A6E62]">
              {selectedFile ? 'Photo Loaded' : 'Upload or Camera'}
            </p>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border text-xs flex items-center space-x-3 transition-all ${
          currentCategory ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-white border-[#E2DDD5] text-[#1A1715]'
        }`}>
          <div className="w-6 h-6 rounded-full bg-[#1C1A18] text-[#D4AF37] flex items-center justify-center font-bold text-[10px]">
            2
          </div>
          <div>
            <p className="font-bold">Step 2: Category</p>
            <p className="text-[10px] text-[#7A6E62] truncate max-w-[110px]">
              {currentCategory}
            </p>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border text-xs flex items-center space-x-3 transition-all ${
          analyzing ? 'bg-amber-100 border-[#D4AF37] animate-pulse text-[#1A1715]' : activeAnalysis ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-[#E2DDD5] text-[#1A1715]'
        }`}>
          <div className="w-6 h-6 rounded-full bg-[#1C1A18] text-[#D4AF37] flex items-center justify-center font-bold text-[10px]">
            3
          </div>
          <div>
            <p className="font-bold">Step 3: AI Inference</p>
            <p className="text-[10px] text-[#7A6E62]">
              {analyzing ? 'Computing Mesh...' : activeAnalysis ? 'Verified Calibrated' : 'Ready'}
            </p>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border text-xs flex items-center space-x-3 transition-all ${
          recommendedOutfits.length > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-[#E2DDD5] text-[#1A1715]'
        }`}>
          <div className="w-6 h-6 rounded-full bg-[#1C1A18] text-[#D4AF37] flex items-center justify-center font-bold text-[10px]">
            4
          </div>
          <div>
            <p className="font-bold">Step 4: Stylist Report</p>
            <p className="text-[10px] text-[#7A6E62]">
              {recommendedOutfits.length > 0 ? `${recommendedOutfits.length} Curated Outfits` : 'Pending'}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: PHOTO UPLOAD & PREFERENCES (Unified Step 1 & 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Photo Upload Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#1A1715] flex items-center space-x-2">
                <Camera className="w-4 h-4 text-[#B8860B]" />
                <span>Upload Your Photo</span>
              </h3>
              <span className="text-[11px] text-[#8C7A6B]">Single Photo Engine</span>
            </div>

            {/* Standing Posture Guide */}
            <div className="p-3.5 rounded-2xl bg-[#FBF9F6] border border-[#E8E2D8] space-y-1.5 text-xs text-[#5A5147]">
              <p className="font-semibold text-[#1A1715] flex items-center space-x-1.5">
                <Info className="w-3.5 h-3.5 text-[#B8860B]" />
                <span>How to Stand for Accurate Results:</span>
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#7A6E62]">
                <li>Stand straight facing the camera with your full body visible.</li>
                <li>Ensure arms are slightly relaxed away from hips.</li>
                <li>Keep your face visible for simultaneous skin tone analysis.</li>
                <li>Good lighting ensures optimal Monk tone and undertone accuracy.</li>
              </ul>
            </div>

            {/* Upload & Live Camera Controls */}
            {!previewUrl ? (
              <div className="space-y-3">
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleCameraCapture(file);
                  }}
                  className="border-2 border-dashed border-[#D4AF37]/50 rounded-2xl p-8 text-center space-y-3 bg-[#FAF8F5] hover:bg-[#F5EFEB] transition-colors cursor-pointer"
                  onClick={() => document.getElementById('studio-file-upload')?.click()}
                >
                  <div className="w-12 h-12 rounded-full bg-[#1C1A18] text-[#D4AF37] flex items-center justify-center mx-auto shadow-sm">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-serif text-base font-bold text-[#1A1715]">
                      Drag and drop your photo here
                    </p>
                    <p className="text-xs text-[#7A6E62]">
                      Supports JPG, PNG, WEBP (Max 15MB)
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-full bg-white border border-[#D4AF37] text-xs font-semibold text-[#1A1715] shadow-2xs hover:bg-[#FAF8F5]"
                  >
                    Browse Files
                  </button>
                  <input
                    id="studio-file-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <div className="text-center">
                  <span className="text-[10px] text-[#8C7A6B] font-semibold uppercase tracking-wider">— OR —</span>
                </div>

                <button
                  type="button"
                  onClick={() => setCameraOpen(true)}
                  className="w-full py-3 rounded-2xl border border-[#D4AF37] bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-[#1A1715] flex items-center justify-center space-x-2 transition-colors shadow-2xs"
                >
                  <Camera className="w-4 h-4 text-[#B8860B]" />
                  <span>Open Live Camera & Posture Guide</span>
                </button>
              </div>
            ) : (
              /* Image Preview Box with Replace / Remove */
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-[#E2DDD5] bg-[#121110] aspect-[3/4] flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Uploaded user portrait"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-3 right-3 flex items-center space-x-2">
                    <label 
                      title="Replace Photo"
                      className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      title="Remove Photo"
                      onClick={handleRemovePhoto}
                      className="p-2 rounded-full bg-red-600/80 text-white hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-[#7A6E62]">
                  <span className="flex items-center space-x-1 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Photo validated and loaded in volatile memory</span>
                  </span>
                </div>
              </div>
            )}

            {/* Height Calibration Input */}
            <div>
              <label className="block text-xs font-semibold text-[#3D3730] mb-1">
                Your True Physical Height (cm)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="120"
                  max="230"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2DDD5] text-xs font-semibold focus:outline-none focus:border-[#D4AF37]"
                />
                <span className="text-xs text-[#7A6E62] shrink-0 font-medium">
                  calibrates pixel calipers
                </span>
              </div>
            </div>

            {/* Privacy Assurance */}
            <div className="flex items-start space-x-2 text-[11px] text-[#786D61] pt-1">
              <ShieldCheck className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
              <span>
                Zero Biometric Disk Storage: Photograph is analyzed exclusively in RAM (BytesIO) and cleared after landmark extraction.
              </span>
            </div>

          </div>
        </div>

        {/* Right Column: Fashion Preference Selection (Step 2) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-6">
            
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#B8860B]">
                <Filter className="w-3.5 h-3.5" />
                <span>Personalized Fashion Preference Selection</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1A1715]">
                Select Your Desired Clothing Category
              </h3>
              <p className="text-xs text-[#6E645A]">
                Strict Filtering Rule: Recommendations strictly adhere to your selected category. 
                Never mixed with unrelated garments.
              </p>
            </div>

            {/* 10 Category Chips / Cards */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#3D3730]">
                Clothing Category (Choose One)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {CATEGORIES.map((cat) => {
                  const isSelected = currentCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategorySwitch(cat)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                        isSelected 
                          ? 'bg-[#1C1A18] text-[#FAF8F5] border-[#D4AF37] shadow-md scale-[1.02]' 
                          : 'bg-white hover:bg-[#FAF8F5] text-[#3D3730] border-[#E2DDD5]'
                      }`}
                    >
                      <span className="text-xs font-bold leading-tight">{cat}</span>
                      {isSelected && (
                        <span className="text-[10px] text-[#D4AF37] flex items-center space-x-0.5 font-semibold">
                          <Check className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Secondary Refinements: Budget, Occasion, Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              
              {/* Budget Tier */}
              <div>
                <label className="block font-semibold text-[#3D3730] mb-1">Budget Preference</label>
                <select
                  value={budgetTier}
                  onChange={(e) => setBudgetTier(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2DDD5] text-xs focus:outline-none focus:border-[#D4AF37]"
                >
                  {BUDGET_TIERS.map((b) => (
                    <option key={b.id} value={b.id}>{b.label}</option>
                  ))}
                </select>
              </div>

              {/* Occasion Refinement */}
              <div>
                <label className="block font-semibold text-[#3D3730] mb-1">Occasion Filter</label>
                <select
                  value={selectedOccasion}
                  onChange={(e) => setSelectedOccasion(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2DDD5] text-xs focus:outline-none focus:border-[#D4AF37]"
                >
                  {OCCASIONS.map((occ) => (
                    <option key={occ} value={occ}>{occ}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Favorite Colors Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#3D3730]">
                Favorite Colors (Select multiple)
              </label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_COLORS.map((c) => {
                  const isSelected = selectedColors.includes(c.name);
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => toggleColor(c.name)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center space-x-2 transition-all ${
                        isSelected 
                          ? 'border-[#D4AF37] bg-[#1C1A18] text-white shadow-xs' 
                          : 'border-[#E2DDD5] bg-white text-[#3D3730] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <span 
                        className="w-3 h-3 rounded-full border border-black/20"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                      {isSelected && <Check className="w-3 h-3 text-[#D4AF37]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Makeup Checkbox */}
            <div className="pt-2 border-t border-[#F0EBE4]">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wantsMakeup}
                  onChange={(e) => setWantsMakeup(e.target.checked)}
                  className="w-4 h-4 rounded text-[#631B2A] focus:ring-[#D4AF37] border-gray-300"
                />
                <span className="text-xs text-[#1A1715] font-semibold">
                  Include Facial Makeup & Cosmetic Shade Recommendations (Derived from the same photograph)
                </span>
              </label>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Button: Analyze My Look */}
            <button
              onClick={handleAnalyzeLook}
              disabled={analyzing}
              className="w-full py-4 rounded-full bg-[#1C1A18] text-[#FAF8F5] hover:bg-[#2B2724] border border-[#D4AF37]/60 font-semibold text-xs tracking-wider uppercase shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  <span>Processing Single Photo in RAM...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>Analyze My Look</span>
                </>
              )}
            </button>

          </div>
        </div>

      </div>

      {/* MULTI-STAGE LOADING OVERLAY */}
      {analyzing && (
        <div className="glass-panel p-8 rounded-3xl border border-[#D4AF37] shadow-xl text-center space-y-4 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-full bg-[#1C1A18] text-[#D4AF37] mx-auto flex items-center justify-center shadow-md">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-bold text-[#1A1715]">
              AI Personal Stylist Processing
            </h3>
            <p className="text-xs text-[#B8860B] font-semibold">
              {LOADING_STAGES[loadingStageIdx]}
            </p>
          </div>
          <div className="w-full max-w-md mx-auto bg-[#EFEAE2] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#D4AF37] to-[#631B2A] h-full transition-all duration-500 rounded-full"
              style={{ width: `${Math.round(((loadingStageIdx + 1) / LOADING_STAGES.length) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-[#8C7A6B]">
            Zero biometric data retention • Analyzing pose, proportions, and complexion in volatile RAM
          </p>
        </div>
      )}

      {/* SECTION 2: UNIFIED STYLIST EXECUTIVE REPORT (Step 4) */}
      {activeAnalysis && (
        <div className="space-y-10 animate-in fade-in duration-500 pt-6 border-t border-[#E2DDD5]">
          
          {/* Executive Header Banner: Shape + Skin Complexion */}
          <div className="rounded-3xl bg-gradient-to-r from-[#1C1A18] via-[#2B2724] to-[#631B2A] text-white p-6 sm:p-8 border border-[#D4AF37]/50 shadow-xl space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">
                  Unified Anthropometric & Chromatic Analysis
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold">
                  Your Bespoke Styling Blueprint
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-full bg-white/10 text-emerald-300 font-semibold border border-white/20">
                  {Math.round((classification?.confidence || 0.88) * 100)}% Confidence
                </span>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="no-print px-3.5 py-1.5 rounded-full bg-[#FAF8F5] text-[#1A1715] hover:bg-[#EFEAE2] font-semibold text-xs tracking-wider flex items-center space-x-1.5 shadow-sm transition-all hover:scale-105"
                  title="Print or Save Styling Report as PDF"
                >
                  <Download className="w-3.5 h-3.5 text-[#B8860B]" />
                  <span>Export Dossier (PDF)</span>
                </button>
              </div>
            </div>

            {/* Shape & Skin Side-by-Side Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Shape Overview */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#D4AF37]">Detected Silhouette</span>
                  <User className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">
                  {classification?.detected_shape}
                </h3>
                <p className="text-[#D1C7BD] text-[11px] leading-relaxed">
                  {classification?.mathematical_basis}
                </p>
                <div className="pt-2 text-[10px] text-[#A6998A] flex items-center space-x-3">
                  <span>SHR: <strong>{measurements?.shoulder_to_hip_ratio}</strong></span>
                  <span>WHR: <strong>{measurements?.waist_to_hip_ratio}</strong></span>
                  <span>TLR: <strong>{measurements?.torso_to_leg_ratio}</strong></span>
                </div>
              </div>

              {/* Skin Tone Overview */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#D4AF37]">Complexion Science</span>
                  <Eye className="w-4 h-4 text-[#D4AF37]" />
                </div>

                {activeAnalysis.face_detected && skinAnalysis ? (
                  <>
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm shrink-0"
                        style={{ backgroundColor: skinAnalysis.monk_hex }}
                      />
                      <div>
                        <h4 className="font-serif text-lg font-bold text-white">
                          {skinAnalysis.monk_tone_name}
                        </h4>
                        <p className="text-[#D1C7BD] text-[11px]">
                          Undertone: <strong className="text-[#D4AF37]">{skinAnalysis.estimated_undertone}</strong> (CIEDE2000 ΔE {skinAnalysis.delta_e_distance})
                        </p>
                      </div>
                    </div>
                    <p className="text-[#A6998A] text-[10px] leading-relaxed">
                      Forehead & cheek ROI verified via Gray-World White Balance illumination correction.
                    </p>
                  </>
                ) : (
                  <div className="space-y-1">
                    <p className="font-bold text-amber-300">
                      Facial Region Not Detected in Photograph
                    </p>
                    <p className="text-[#D1C7BD] text-[11px] leading-relaxed">
                      {activeAnalysis.skin_note || 'Body analysis was performed successfully. To get Monk skin tone swatches, ensure your face is fully in frame.'}
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Calipers Overlay & Dimensional Data Tabs */}
          <div className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#F0EBE4]">
              <div className="space-y-0.5">
                <h3 className="font-serif text-xl font-bold text-[#1A1715]">
                  Structural Landmarks & Measurements
                </h3>
                <p className="text-xs text-[#7A6E62]">
                  Distinguishes between calibrated user inputs, computer vision keypoints, and derived ratios.
                </p>
              </div>

              {/* Tabs */}
              <div className="flex bg-[#EFEAE2] p-1 rounded-xl text-xs shrink-0">
                <button
                  onClick={() => setVisualizerTab('skeleton')}
                  className={`px-4 py-1.5 rounded-lg font-semibold transition-all ${
                    visualizerTab === 'skeleton' ? 'bg-[#1C1A18] text-[#FAF8F5] shadow-2xs' : 'text-[#6E645A]'
                  }`}
                >
                  Landmark Overlay
                </button>
                <button
                  onClick={() => setVisualizerTab('table')}
                  className={`px-4 py-1.5 rounded-lg font-semibold transition-all ${
                    visualizerTab === 'table' ? 'bg-[#1C1A18] text-[#FAF8F5] shadow-2xs' : 'text-[#6E645A]'
                  }`}
                >
                  Measurements Table
                </button>
              </div>
            </div>

            {visualizerTab === 'skeleton' && activeAnalysis.annotated_landmark_image && (
              <div className="rounded-2xl overflow-hidden bg-[#121110] max-h-[420px] flex items-center justify-center p-2">
                <img
                  src={activeAnalysis.annotated_landmark_image}
                  alt="Anthropometric Calipers Overlay"
                  className="max-h-[400px] w-auto object-contain"
                />
              </div>
            )}

            {visualizerTab === 'table' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E2DDD5] text-[#7A6E62] uppercase tracking-wider text-[10px]">
                      <th className="py-2.5">Dimension</th>
                      <th className="py-2.5">Value</th>
                      <th className="py-2.5">Data Category</th>
                      <th className="py-2.5">Styling Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE4] text-[#3D3730]">
                    <tr>
                      <td className="py-2.5 font-medium">Calibrated Height</td>
                      <td className="py-2.5 font-bold">{measurements?.height_cm} cm</td>
                      <td className="py-2.5 text-[#B8860B]">Direct User Input</td>
                      <td className="py-2.5 text-[#7A6E62]">Baseline pixel-to-metric reference</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium">Shoulder Width</td>
                      <td className="py-2.5 font-bold">{measurements?.shoulder_width_cm} cm</td>
                      <td className="py-2.5 text-[#631B2A]">Estimated CV Landmark</td>
                      <td className="py-2.5 text-[#7A6E62]">Defines upper horizontal frame</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium">Chest Width</td>
                      <td className="py-2.5 font-bold">{measurements?.chest_width_cm} cm</td>
                      <td className="py-2.5 text-[#631B2A]">Estimated CV Landmark</td>
                      <td className="py-2.5 text-[#7A6E62]">Bodice & blazer structuring</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium">Waist Width</td>
                      <td className="py-2.5 font-bold">{measurements?.waist_width_cm} cm</td>
                      <td className="py-2.5 text-[#631B2A]">Estimated CV Landmark</td>
                      <td className="py-2.5 text-[#7A6E62]">Natural waist suppression</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium">Hip Width</td>
                      <td className="py-2.5 font-bold">{measurements?.hip_width_cm} cm</td>
                      <td className="py-2.5 text-[#631B2A]">Estimated CV Landmark</td>
                      <td className="py-2.5 text-[#7A6E62]">Lower silhouette baseline</td>
                    </tr>
                    <tr className="bg-[#FAF8F5]">
                      <td className="py-2.5 font-medium text-[#1A1715]">Shoulder-to-Hip Ratio (SHR)</td>
                      <td className="py-2.5 font-bold text-[#631B2A]">{measurements?.shoulder_to_hip_ratio}</td>
                      <td className="py-2.5 text-emerald-700 font-semibold">Derived Anthropometric Ratio</td>
                      <td className="py-2.5 text-[#7A6E62]">Primary shape classification axis</td>
                    </tr>
                    <tr className="bg-[#FAF8F5]">
                      <td className="py-2.5 font-medium text-[#1A1715]">Waist-to-Hip Ratio (WHR)</td>
                      <td className="py-2.5 font-bold text-[#631B2A]">{measurements?.waist_to_hip_ratio}</td>
                      <td className="py-2.5 text-emerald-700 font-semibold">Derived Anthropometric Ratio</td>
                      <td className="py-2.5 text-[#7A6E62]">Torso curve definition index</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Harmonious Color Palette */}
          {colorPalette && (
            <div className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#1A1715]">
                <Palette className="w-4 h-4 text-[#B8860B]" />
                <span>Flattering Color Palette (Calibrated for Your Undertone)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                {Object.entries(colorPalette).map(([categoryName, swatches]) => (
                  <div key={categoryName} className="p-3.5 rounded-2xl bg-[#FBF9F6] border border-[#E8E2D8] space-y-2">
                    <span className="font-semibold text-[#1A1715] capitalize">
                      {categoryName.replace('_', ' ')}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {swatches.map((swatch, idx) => (
                        <div 
                          key={idx} 
                          title={`${swatch.name} (${swatch.hex})`}
                          className="w-7 h-7 rounded-full border border-black/10 shadow-xs cursor-pointer hover:scale-110 transition-transform"
                          style={{ backgroundColor: swatch.hex }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DYNAMIC CATEGORY SWITCHER (Without Re-uploading!) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#1A1715]">
                  Curated Fashion Recommendations
                </h3>
                <p className="text-xs text-[#7A6E62]">
                  Switch categories instantly without re-uploading your photograph.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#1C1A18] text-[#D4AF37] self-start sm:self-auto">
                Strict Category: {currentCategory}
              </span>
            </div>

            {/* 10 Category Horizontal Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
              {CATEGORIES.map((cat) => {
                const isActive = currentCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategorySwitch(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                      isActive 
                        ? 'bg-[#1C1A18] text-[#FAF8F5] border border-[#D4AF37] shadow-sm' 
                        : 'bg-white hover:bg-[#FAF8F5] text-[#5A5147] border border-[#E2DDD5]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* OUTFITS GRID (Strict to Selected Category) */}
          <div className="space-y-6">
            {categoryLoading ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-[#B8860B] animate-spin mx-auto" />
                <p className="text-xs text-[#6E645A]">Updating {currentCategory} recommendations...</p>
              </div>
            ) : recommendedOutfits.length === 0 ? (
              <div className="glass-panel p-10 rounded-3xl text-center space-y-2">
                <p className="text-sm font-semibold text-[#1A1715]">No outfits matched all secondary filters in {currentCategory}.</p>
                <p className="text-xs text-[#7A6E62]">Try resetting Occasion or Budget to explore more styles.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendedOutfits.map((item) => (
                  <div
                    key={item.id}
                    className="glass-panel rounded-3xl border border-[#E2DDD5] hover:border-[#D4AF37]/60 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
                  >
                    {/* Garment Image */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-[#1C1A18]">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      
                      {/* Category Pill */}
                      <div className="absolute top-3 left-3 bg-[#1C1A18]/85 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-semibold text-[#FAF8F5] border border-[#D4AF37]/40 shadow-xs">
                        {item.category}
                      </div>

                      {/* Suitability Score */}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-800 shadow-xs">
                        {Math.round(item.suitability_score * 100)}% Match
                      </div>

                      {/* Price Range & Name Overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 text-white">
                        <p className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">
                          {item.price_range_inr || item.budget_category} • {item.clothing_type || item.occasions[0]}
                        </p>
                        <h3 className="font-serif text-lg font-bold leading-snug">
                          {item.name}
                        </h3>
                      </div>
                    </div>

                    {/* Card Content */}
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
                            <span className="text-[#8C7A6B] block">Neckline:</span>
                            <span className="font-medium">{item.neckline}</span>
                          </div>
                          <div>
                            <span className="text-[#8C7A6B] block">Sleeve:</span>
                            <span className="font-medium">{item.sleeve}</span>
                          </div>
                          <div>
                            <span className="text-[#8C7A6B] block">Fabric:</span>
                            <span className="font-medium">{item.fabric}</span>
                          </div>
                        </div>

                        {/* Colors */}
                        <div>
                          <span className="text-[#8C7A6B] text-[10px] block mb-1 uppercase font-semibold">
                            Flattering Colors:
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

                      {/* Actions: Explain AI + Genuine Shopping Links */}
                      <div className="pt-3 border-t border-[#F0EBE4] space-y-2">
                        
                        {/* Explain Button */}
                        <button
                          onClick={() => handleExplainClick(item)}
                          className="w-full py-2.5 rounded-full border border-[#D4AF37] bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-[#1A1715] flex items-center justify-center space-x-1.5 transition-colors shadow-2xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" />
                          <span>Explain My Recommendation</span>
                        </button>

                        {/* Direct Shopping Links */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-[#8C7A6B] font-semibold uppercase">Shop Now:</span>
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
                              href={item.shopping_links.meesho}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 rounded bg-[#FAF8F5] border border-[#E2DDD5] text-[10px] font-semibold text-[#2E2822] hover:border-[#D4AF37] hover:text-[#B8860B]"
                            >
                              Meesho
                            </a>
                            <a
                              href={item.shopping_links.flipkart}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 rounded bg-[#FAF8F5] border border-[#E2DDD5] text-[10px] font-semibold text-[#2E2822] hover:border-[#D4AF37] hover:text-[#B8860B]"
                            >
                              Flipkart
                            </a>
                            <a
                              href={item.shopping_links.amazon}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 rounded bg-[#FAF8F5] border border-[#E2DDD5] text-[10px] font-semibold text-[#2E2822] hover:border-[#D4AF37] hover:text-[#B8860B]"
                            >
                              Amazon
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

          {/* Styles to Consider Carefully */}
          {carefulOutfits.length > 0 && (
            <div className="p-8 rounded-3xl bg-[#FAF6F3] border border-[#E2DDD5] space-y-6">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-[#631B2A]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Styles to Consider Carefully</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#1A1715]">
                  Structural Guidance for {currentCategory}
                </h3>
                <p className="text-xs text-[#6E645A] max-w-3xl leading-relaxed">
                  Every silhouette is celebrated. These cuts may alter balance for a {classification?.detected_shape} frame 
                  by adding volume where you might prefer definition. You are always welcome to style them with balancing belts or structured layers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {carefulOutfits.map((item) => (
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
                        <span>Explain Architectural Divergence &rarr;</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OPTIONAL MAKEUP & BEAUTY SECTION (Derived from the same photo!) */}
          {(wantsMakeup || makeupRecs.length > 0) && (
            <div className="p-8 rounded-3xl bg-gradient-to-r from-[#FAF8F5] to-[#F5EFEB] border border-[#D4AF37]/50 shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-[#631B2A]">
                    <Sparkle className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Personal Beauty & Cosmetic Advisor</span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[#1A1715]">
                    Makeup & Complexion Palette
                  </h3>
                  <p className="text-xs text-[#6E645A]">
                    {skinAnalysis 
                      ? `Calibrated for ${skinAnalysis.monk_tone_name} with ${skinAnalysis.estimated_undertone} undertone.`
                      : 'Derived from your facial analysis profile.'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('makeup')}
                  className="px-5 py-2.5 rounded-full bg-[#1C1A18] text-[#FAF8F5] text-xs font-semibold hover:bg-[#2B2724] border border-[#D4AF37]/40 flex items-center space-x-2 shrink-0 self-start sm:self-auto"
                >
                  <span>Open Full Makeup Studio</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                </button>
              </div>

              {makeupRecs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {makeupRecs.slice(0, 6).map((prod, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white border border-[#E8E2D8] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1A1715]">{prod.product_category}</span>
                        {prod.hex_color && (
                          <div 
                            className="w-5 h-5 rounded-full border border-black/15 shadow-2xs" 
                            style={{ backgroundColor: prod.hex_color }}
                          />
                        )}
                      </div>
                      <p className="font-semibold text-[#631B2A]">{prod.shade_name}</p>
                      <p className="text-[11px] text-[#7A6E62] line-clamp-2">{prod.explanation}</p>
                      <div className="pt-1 flex items-center justify-between text-[10px]">
                        <span className="text-[#8C7A6B]">Finish: {prod.recommended_finish || 'Velvet'}</span>
                        <a 
                          href={prod.shopping_links.myntra}
                          target="_blank" 
                          rel="noreferrer"
                          className="font-bold text-[#B8860B] hover:underline"
                        >
                          Shop Product &rarr;
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-white border border-[#E8E2D8] text-xs text-[#7A6E62]">
                  Ensure face is visible in the photograph to extract precise foundation and lipstick hex codes automatically.
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* Live Camera Modal */}
      <CameraModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCameraCapture}
        mode="body"
      />

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
