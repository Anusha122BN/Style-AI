import React, { useState } from 'react';
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
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CameraModal } from '../components/CameraModal';

export const BodyAnalysisPage = ({ setActiveTab }) => {
  const { user, bodyAnalysis, saveBodyAnalysis } = useAuth();

  const [gender, setGender] = useState(user?.gender_preference || 'Women');
  const [heightCm, setHeightCm] = useState(user?.height_cm || 168);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);

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
      setErrorMessage('Please select or capture a photograph to begin analysis.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('gender', gender.toLowerCase());
      formData.append('height_cm', heightCm.toString());

      const result = await api.analyzeBody(formData);
      saveBodyAnalysis(result);
    } catch (err) {
      setErrorMessage(err.message || 'Body shape analysis failed. Please ensure the full body is visible.');
    } finally {
      setLoading(false);
    }
  };

  const measurements = bodyAnalysis?.measurements;
  const classification = bodyAnalysis?.classification;

  // Chart data for proportions
  const proportionChartData = measurements ? [
    { name: 'Shoulders', value: measurements.shoulder_width_cm, unit: 'cm' },
    { name: 'Chest', value: measurements.chest_width_cm, unit: 'cm' },
    { name: 'Waist', value: measurements.waist_width_cm, unit: 'cm' },
    { name: 'Hips', value: measurements.hip_width_cm, unit: 'cm' },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#B8860B]">
          <User className="w-3.5 h-3.5" />
          <span>Computer Vision Architecture</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1715]">
          Anthropometric Body Shape Analysis
        </h1>
        <p className="text-xs sm:text-sm text-[#6E645A] max-w-3xl leading-relaxed">
          MediaPipe skeletal landmark detection calibrated with your true height. 
          Distinguishes between user physical calibration inputs, estimated CV widths, and derived ratios.
        </p>
      </div>

      {/* Main Grid: Controls vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Image Input & Calibration Parameters */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-5">
            <h3 className="font-serif text-lg font-bold text-[#1A1715] flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-[#B8860B]" />
              <span>Calibration Parameters</span>
            </h3>

            {/* Gender and Height */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#3D3730] mb-1">Wardrobe Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2DDD5] text-xs focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="Women">Women</option>
                  <option value="Men">Men</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3D3730] mb-1">Physical Height (cm)</label>
                <input
                  type="number"
                  min="120"
                  max="230"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2DDD5] text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <p className="text-[11px] text-[#7A6E62] bg-[#FBF9F6] p-2.5 rounded-xl border border-[#E8E2D8]">
              * Height input calibrates pixel distances to physical centimeters. 
              We never guess heights without calibration.
            </p>

            {/* Upload vs Camera Buttons */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-[#3D3730]">Capture or Upload Full-Body Image</label>

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
                  <span>Choose Photo</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Preview Box */}
            {previewUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-[#E2DDD5] bg-[#121110] aspect-[3/4] flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Selected photograph"
                  className="w-full h-full object-contain"
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
                  <span>Extracting Keypoints in RAM...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>Run Geometric Shape Analysis</span>
                </>
              )}
            </button>

            {/* Privacy Assurance */}
            <div className="flex items-center space-x-2 text-[11px] text-[#786D61] pt-1">
              <ShieldCheck className="w-4 h-4 text-[#B8860B] shrink-0" />
              <span>Volatile Memory Only: Image is immediately deallocated from RAM after landmark calculation.</span>
            </div>

          </div>

        </div>

        {/* Right Column: Visualizer & Results Dashboard */}
        <div className="lg:col-span-7 space-y-6">
          
          {bodyAnalysis ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Classified Badge Card */}
              <div className="glass-panel p-6 rounded-3xl border border-[#D4AF37]/50 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#B8860B]">
                    Detected Anthropometric Shape
                  </span>
                  <h2 className="font-serif text-3xl font-bold text-[#1A1715]">
                    {classification?.detected_shape}
                  </h2>
                  <p className="text-xs text-[#6E645A]">
                    {classification?.mathematical_basis}
                  </p>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="text-xs font-semibold text-[#7A6E62] block">Confidence Level</span>
                  <span className="font-serif text-2xl font-bold text-emerald-700">
                    {Math.round((classification?.confidence || 0.85) * 100)}%
                  </span>
                </div>
              </div>

              {/* Annotated Landmark Image Overlay */}
              {bodyAnalysis.annotated_landmark_image && (
                <div className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-base font-bold text-[#1A1715]">
                      Annotated Landmark Keypoints & Calipers
                    </h3>
                    <span className="text-[10px] text-[#8C7A6B]">
                      Facial privacy blur applied
                    </span>
                  </div>

                  <div className="rounded-2xl overflow-hidden bg-[#121110] max-h-[380px] flex items-center justify-center">
                    <img
                      src={bodyAnalysis.annotated_landmark_image}
                      alt="Annotated Landmark Analysis"
                      className="max-h-[380px] w-auto object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Measurements Table (Distinguishing Measured vs Estimated vs Derived) */}
              <div className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-4">
                <h3 className="font-serif text-base font-bold text-[#1A1715]">
                  Comprehensive Dimensional Table
                </h3>

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
              </div>

              {/* Proportion Comparison Chart */}
              <div className="glass-panel p-6 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-3">
                <h3 className="font-serif text-base font-bold text-[#1A1715]">
                  Horizontal Silhouette Span (cm)
                </h3>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={proportionChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} domain={[0, 'auto']} />
                      <Tooltip formatter={(val) => [`${val} cm`, 'Calculated Width']} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {proportionChartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.name === 'Waist' ? '#B76E79' : '#D4AF37'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Action Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1C1A18] to-[#2B2724] text-white flex items-center justify-between border border-[#D4AF37]/50 shadow-lg">
                <div className="space-y-1">
                  <h4 className="font-serif text-lg font-bold">Ready for Curated Outfits?</h4>
                  <p className="text-xs text-[#D1C7BD]">
                    Explore bespoke garments tailored for your {classification?.detected_shape} silhouette.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('fashion')}
                  className="px-6 py-3 rounded-full bg-[#FAF8F5] text-[#1A1715] hover:bg-[#EFEAE2] font-semibold text-xs tracking-wider uppercase shadow-md flex items-center space-x-2 shrink-0 transition-transform hover:scale-105"
                >
                  <span>View Recommendations</span>
                  <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                </button>
              </div>

            </div>
          ) : (
            /* Empty State */
            <div className="glass-panel p-12 rounded-3xl border border-dashed border-[#D4AF37]/40 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E2DDD5] mx-auto flex items-center justify-center text-[#B8860B]">
                <User className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="font-serif text-xl font-bold text-[#1A1715]">
                  No Analysis Performed Yet
                </h3>
                <p className="text-xs text-[#7A6E62]">
                  Select a full-body photograph or use the live camera on the left to compute anatomical measurements and body shape.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Live Camera Modal */}
      <CameraModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCameraCapture}
        mode="body"
      />

    </div>
  );
};
