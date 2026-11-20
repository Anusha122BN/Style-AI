import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, CheckCircle, AlertTriangle, ShieldCheck, User, Smile } from 'lucide-react';

export const CameraModal = ({ isOpen, onClose, onCapture, mode = 'body' }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [hasPermission, setHasPermission] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    setErrorMessage('');
    setPreviewImage(null);
    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
    } catch (err) {
      setHasPermission(false);
      setErrorMessage(
        'Unable to access camera. Please allow camera permissions in your browser or use the file upload option.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCountdown(null);
  };

  const handleCaptureClick = () => {
    // 3-second countdown for user to step into position
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          takeSnapshot();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `styleai_camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(blob);
        setPreviewImage({ file, previewUrl });
      }
    }, 'image/jpeg', 0.92);
  };

  const handleConfirm = () => {
    if (previewImage) {
      onCapture(previewImage.file);
      stopCamera();
      onClose();
    }
  };

  const handleRetake = () => {
    setPreviewImage(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] border border-[#D4AF37]/50 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E2DDD5] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-[#B8860B]" />
            <h3 className="font-serif text-lg font-bold text-[#1A1715]">
              {mode === 'face' ? 'Live Facial Capture for Skin Analysis' : 'Live Full-Body Camera Alignment'}
            </h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-[#EFEAE2] text-[#7A6E62]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video / Preview Viewport */}
        <div className="relative bg-[#121110] aspect-video w-full flex items-center justify-center overflow-hidden">
          {previewImage ? (
            <img
              src={previewImage.previewUrl}
              alt="Snapshot Preview"
              className="w-full h-full object-contain"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Dynamic Posture Guide Overlay */}
              {hasPermission && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {mode === 'body' ? (
                    <div className="border-2 border-dashed border-[#D4AF37]/80 w-44 h-80 rounded-3xl flex flex-col justify-between items-center p-3 shadow-inner">
                      <div className="text-[10px] tracking-wider font-semibold text-[#D4AF37] bg-black/60 px-2 py-0.5 rounded-full">
                        Head & Neck
                      </div>
                      <div className="w-full border-t border-dotted border-[#D4AF37]/50"></div>
                      <div className="text-[10px] tracking-wider font-semibold text-[#D4AF37] bg-black/60 px-2 py-0.5 rounded-full">
                        Waist Line
                      </div>
                      <div className="w-full border-t border-dotted border-[#D4AF37]/50"></div>
                      <div className="text-[10px] tracking-wider font-semibold text-[#D4AF37] bg-black/60 px-2 py-0.5 rounded-full">
                        Feet / Ankles
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-[#D4AF37]/80 w-52 h-64 rounded-[50%] flex flex-col justify-center items-center shadow-inner">
                      <Smile className="w-10 h-10 text-[#D4AF37]/50" />
                      <span className="text-[10px] text-[#D4AF37] bg-black/60 px-2 py-0.5 rounded-full mt-2">
                        Frame Face Here
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Countdown overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="font-serif text-7xl font-bold text-[#FAF8F5] animate-ping">
                    {countdown}
                  </span>
                </div>
              )}
            </>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
              <AlertTriangle className="w-10 h-10 text-amber-400" />
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Alignment & Privacy Indicator */}
        <div className="px-6 py-3 bg-[#FBF9F6] border-t border-[#E8E2D8] flex items-center justify-between text-xs text-[#6E645A]">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#B8860B]" />
            <span>Volatile RAM Capture: Photo is never stored on disk or server.</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium text-[#1A1715]">Stand Straight & Centered</span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-t border-[#E2DDD5] flex items-center justify-between">
          <p className="text-[11px] text-[#8C7A6B] max-w-xs">
            * Calibrated with your height to convert pixels to physical centimeters accurately.
          </p>

          <div className="flex items-center space-x-3">
            {previewImage ? (
              <>
                <button
                  onClick={handleRetake}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-[#D4AF37] text-[#1A1715] hover:bg-[#EFEAE2]"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex items-center space-x-1.5 px-6 py-2 rounded-full text-xs font-semibold bg-[#1C1A18] text-[#FAF8F5] hover:bg-[#2B2724] border border-[#D4AF37]/50 shadow-sm"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Use This Photo</span>
                </button>
              </>
            ) : (
              <button
                disabled={!hasPermission || countdown !== null}
                onClick={handleCaptureClick}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-semibold bg-[#1C1A18] text-[#FAF8F5] hover:bg-[#2B2724] border border-[#D4AF37]/50 shadow-sm disabled:opacity-50"
              >
                <Camera className="w-4 h-4 text-[#D4AF37]" />
                <span>Capture Photo (3s Timer)</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
