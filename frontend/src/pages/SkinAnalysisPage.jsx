import React, { useState } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  Palette, 
  Sun, 
  Info,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CameraModal } from '../components/CameraModal';

export const SkinAnalysisPage = ({ setActiveTab }) => {
  const { skinAnalysis, saveSkinAnalysis } = useAuth();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);

  // 10 Monk Skin Tone reference shades
  const monkTones = [
    { id: 'MST-01', hex: '#f6ede4', name: '01 Porcelain' },
    { id: 'MST-02', hex: '#f3e7db', name: '02 Ivory' },
    { id: 'MST-03', hex: '#f7ead0', name: '03 Sand' },
    { id: 'MST-04', hex: '#eadaba', name: '04 Wheat' },
    { id: 'MST-05', hex: '#d7bd96', name: '05 Honey' },
    { id: 'MST-06', hex: '#a07e56', name: '06 Caramel' },
    { id: 'MST-07', hex: '#825c43', name: '07 Bronze' },
    { id: 'MST-08', hex: '#604134', name: '08 Chestnut' },
    { id: 'MST-09', hex: '#3a312a', name: '09 Espresso' },
    { id: 'MST-10', hex: '#292420', name: '10 Ebony' },
  ];

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

  const handleRunAnalysis = async () => {
    if (!selectedFile) {
      setErrorMessage('Please capture or choose a face photograph.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      const res = await api.analyzeSkin(formData);
      saveSkinAnalysis(res);
    } catch (err) {
      setErrorMessage(err.message || 'Skin analysis failed. Please ensure your face is well-lit and clearly visible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#B8860B]">
          <Eye className="w-3.5 h-3.5" />
          <span>Color Science & Biometric Vision</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1715]">
          Monk Scale Skin Tone & Undertone Analysis
        </h1>
        <p className="text-xs sm:text-sm text-[#6E645A] max-w-3xl leading-relaxed">
          MediaPipe FaceMesh facial landmark sampling across forehead and cheeks, CIELAB color space transformation, 
          Gray-World white balance correction, and perceptual Delta E 2000 mapping against the 10 Monk Skin Tone reference categories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Image Selection & Capture */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-5">
            <h3 className="font-serif text-lg font-bold text-[#1A1715] flex items-center space-x-2">
              <Sun className="w-4 h-4 text-[#B8860B]" />
              <span>Facial Chromatic Input</span>
            </h3>

            <p className="text-xs text-[#6E645A]">
              Capture your face under diffuse, natural lighting. Avoid heavy colored filters or harsh direct flash for maximum color accuracy.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCameraOpen(true)}
                className="py-3 px-4 rounded-xl border border-[#D4AF37] bg-[#FAF8F5] hover:bg-[#F5EFEB] text-xs font-semibold text-[#1A1715] flex items-center justify-center space-x-2 transition-colors"
              >
                <Camera className="w-4 h-4 text-[#B8860B]" />
                <span>Live Camera</span>
              </button>

              <label className="py-3 px-4 rounded-xl border border-[#E2DDD5] bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-[#1A1715] flex items-center justify-center space-x-2 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-[#7A6E62]" />
                <span>Upload Face Photo</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Preview Box */}
            {previewUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-[#E2DDD5] bg-[#121110] aspect-square flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Face preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Execute Button */}
            <button
              onClick={handleRunAnalysis}
              disabled={loading || !selectedFile}
              className="w-full py-3.5 rounded-full bg-[#1C1A18] text-[#FAF8F5] hover:bg-[#2B2724] border border-[#D4AF37]/50 font-semibold text-xs tracking-wider uppercase shadow-md disabled:opacity-50 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  <span>Computing CIELAB & Delta E 2000 in RAM...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>Analyze Skin Tone & Undertone</span>
                </>
              )}
            </button>

            {/* Privacy Assurance */}
            <div className="flex items-center space-x-2 text-[11px] text-[#786D61] pt-1">
              <ShieldCheck className="w-4 h-4 text-[#B8860B] shrink-0" />
              <span>Biometric facial image is processed exclusively in RAM and cleared instantly.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Analysis Results */}
        <div className="lg:col-span-7 space-y-6">
          
          {skinAnalysis ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Tone Match & Undertone Badge */}
              <div className="glass-panel p-6 rounded-3xl border border-[#D4AF37]/50 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div
                    className="w-16 h-16 rounded-2xl border-2 border-white shadow-md shrink-0 flex items-center justify-center text-xs font-bold text-white drop-shadow"
                    style={{ backgroundColor: skinAnalysis.monk_hex }}
                  >
                    {skinAnalysis.monk_tone_id}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#B8860B]">
                      Monk Skin Tone Scale Match
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-[#1A1715]">
                      {skinAnalysis.monk_tone_name}
                    </h2>
                    <p className="text-xs text-[#6E645A]">
                      {skinAnalysis.monk_tone_description} ({skinAnalysis.monk_hex})
                    </p>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="text-xs font-semibold text-[#7A6E62] block">Estimated Undertone</span>
                  <span className="inline-block px-3 py-1 rounded-full bg-[#631B2A]/10 text-[#631B2A] font-serif text-lg font-bold">
                    {skinAnalysis.estimated_undertone}
                  </span>
                </div>
              </div>

              {/* 10 Monk Skin Tone Reference Spectrum */}
              <div className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-3">
                <h3 className="font-serif text-base font-bold text-[#1A1715]">
                  Monk Scale 10-Tone Reference Spectrum
                </h3>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {monkTones.map((m) => {
                    const isMatched = m.id === skinAnalysis.monk_tone_id;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col items-center p-1.5 rounded-xl transition-all ${
                          isMatched ? 'ring-2 ring-[#B8860B] bg-[#D4AF37]/15' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div
                          className="w-full aspect-square rounded-lg border border-black/10 shadow-inner"
                          style={{ backgroundColor: m.hex }}
                        ></div>
                        <span className="text-[9px] font-bold mt-1 text-[#1A1715] truncate w-full text-center">
                          {m.id}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Multi-Region Facial Sampling */}
              <div className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base font-bold text-[#1A1715]">
                    Facial Region Sampling & Consistency
                  </h3>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Consistency Score: {Math.round(skinAnalysis.color_consistency_score * 100)}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-2xl bg-[#FBF9F6] border border-[#E8E2D8] space-y-2">
                    <div
                      className="w-10 h-10 rounded-full mx-auto border border-white shadow-xs"
                      style={{ backgroundColor: skinAnalysis.forehead_color.hex_code }}
                    ></div>
                    <p className="text-xs font-semibold text-[#1A1715]">Forehead</p>
                    <p className="text-[10px] text-[#7A6E62] font-mono">
                      {skinAnalysis.forehead_color.hex_code}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FBF9F6] border border-[#E8E2D8] space-y-2">
                    <div
                      className="w-10 h-10 rounded-full mx-auto border border-white shadow-xs"
                      style={{ backgroundColor: skinAnalysis.left_cheek_color.hex_code }}
                    ></div>
                    <p className="text-xs font-semibold text-[#1A1715]">Left Cheek</p>
                    <p className="text-[10px] text-[#7A6E62] font-mono">
                      {skinAnalysis.left_cheek_color.hex_code}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FBF9F6] border border-[#E8E2D8] space-y-2">
                    <div
                      className="w-10 h-10 rounded-full mx-auto border border-white shadow-xs"
                      style={{ backgroundColor: skinAnalysis.right_cheek_color.hex_code }}
                    ></div>
                    <p className="text-xs font-semibold text-[#1A1715]">Right Cheek</p>
                    <p className="text-[10px] text-[#7A6E62] font-mono">
                      {skinAnalysis.right_cheek_color.hex_code}
                    </p>
                  </div>
                </div>

                {/* Lighting Audit Box */}
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E2DDD5] text-xs space-y-1">
                  <div className="flex items-center space-x-2 font-semibold text-[#1A1715]">
                    <Sun className="w-4 h-4 text-[#B8860B]" />
                    <span>Illumination Audit: {skinAnalysis.lighting_quality}</span>
                  </div>
                  <p className="text-[#6E645A]">
                    {skinAnalysis.lighting_recommendation}
                  </p>
                </div>
              </div>

              {/* Flattering Wardrobe Palette Quick Swatches */}
              <div className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base font-bold text-[#1A1715]">
                    Recommended Flattering Clothing Palette
                  </h3>
                  <button
                    onClick={() => setActiveTab('palette')}
                    className="text-xs text-[#631B2A] font-semibold flex items-center space-x-1 hover:underline"
                  >
                    <span>Full Palette Suite</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skinAnalysis.recommended_palette.map((colorName, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-full bg-white border border-[#D4AF37]/40 text-xs font-semibold text-[#1A1715] shadow-xs"
                    >
                      {colorName}
                    </span>
                  ))}
                </div>
              </div>

              {/* Limitations Notice */}
              <div className="p-4 rounded-2xl bg-[#FBF9F6] border border-[#E8E2D8] text-xs text-[#7A6E62] flex items-start space-x-2">
                <Info className="w-4 h-4 shrink-0 text-[#B8860B] mt-0.5" />
                <span>{skinAnalysis.limitations}</span>
              </div>

            </div>
          ) : (
            <div className="glass-panel p-12 rounded-3xl border border-dashed border-[#D4AF37]/40 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E2DDD5] mx-auto flex items-center justify-center text-[#B76E79]">
                <Eye className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="font-serif text-xl font-bold text-[#1A1715]">
                  No Skin Analysis Data
                </h3>
                <p className="text-xs text-[#7A6E62]">
                  Upload a clear facial photograph or use the live camera on the left to extract skin tone and undertone.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

      <CameraModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCameraCapture}
        mode="face"
      />

    </div>
  );
};
