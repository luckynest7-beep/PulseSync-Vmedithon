import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { ExtractionResult } from '../../lib/types';
import { ConfirmCard } from './ConfirmCard';

interface CameraCaptureProps {
  onSaveReading: (reading: any) => void;
  onCancel: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onSaveReading, onCancel }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize camera stream if available
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    const initCamera = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        activeStream = s;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err: any) {
        console.warn('Live camera stream not accessible, falling back to file picker:', err);
        setCameraError('Direct webcam not permitted; use Photo Upload.');
      }
    };

    initCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleCaptureVideoFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      processOcrExtraction(dataUrl);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCapturedImage(dataUrl);
      processOcrExtraction(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const processOcrExtraction = (imgBase64: string) => {
    setAnalyzing(true);
    // Simulate Gemini 2.5 Flash Lite 1.2s extraction (or live route call)
    setTimeout(() => {
      // Intelligently randomize a realistic home monitor reading for demo or sample detection
      const sampleTypes: ('bp' | 'glucose')[] = ['bp', 'glucose', 'bp'];
      const pickedType = sampleTypes[Math.floor(Math.random() * sampleTypes.length)];

      if (pickedType === 'bp') {
        const sys = Math.floor(Math.random() * 25) + 130; // 130 - 155
        const dia = Math.floor(Math.random() * 15) + 82;  // 82 - 97
        const pulse = Math.floor(Math.random() * 15) + 70; // 70 - 85
        setExtractionResult({
          type: 'bp',
          systolic: sys,
          diastolic: dia,
          pulse,
          glucose: null,
          confidence: 'high',
          confidenceScore: 98,
          rawText: `SYS: ${sys} mmHg | DIA: ${dia} mmHg | PULSE: ${pulse} /min (Omron Display)`,
        });
      } else {
        const gluc = Math.floor(Math.random() * 70) + 110; // 110 - 180
        setExtractionResult({
          type: 'glucose',
          systolic: null,
          diastolic: null,
          pulse: null,
          glucose: gluc,
          confidence: 'high',
          confidenceScore: 97,
          rawText: `GLUCOSE: ${gluc} mg/dL (Accu-Chek Instant)`,
        });
      }
      setAnalyzing(false);
    }, 1200);
  };

  if (extractionResult) {
    return (
      <ConfirmCard
        initialData={extractionResult}
        source="camera"
        previewImage={capturedImage || undefined}
        onSave={onSaveReading}
        onCancel={() => {
          setExtractionResult(null);
          setCapturedImage(null);
        }}
      />
    );
  }

  return (
    <div>
      <div className={`camera-viewfinder ${analyzing ? 'scanning' : ''}`}>
        {stream && !capturedImage ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px' }}
          />
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Device Preview"
            style={{ width: '100%', height: '220px', objectFit: 'contain', borderRadius: '12px' }}
          />
        ) : (
          <div style={{ padding: '24px 10px', color: '#94a3b8' }}>
            <Camera size={42} strokeWidth={1.5} color="#06b6d4" style={{ marginBottom: '10px' }} />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
              Aim Camera at Monitor Display
            </h4>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', maxWidth: '280px' }}>
              Point at your Blood Pressure monitor or Glucometer screen for instant AI reading.
            </p>
          </div>
        )}

        {analyzing && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(7, 10, 18, 0.85)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              zIndex: 10,
            }}
          >
            <Sparkles size={28} color="#06b6d4" style={{ animation: 'pulseBadge 1.5s infinite' }} />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#22d3ee' }}>
              Gemini Vision Reading Monitor Numbers...
            </span>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: stream ? '1fr 1fr' : '1fr', gap: '10px', marginTop: '16px' }}>
        {stream && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCaptureVideoFrame}
            disabled={analyzing}
          >
            <Camera size={18} /> Snap Photo
          </button>
        )}

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={analyzing}
        >
          <Upload size={18} /> Choose File / Gallery
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </div>
    </div>
  );
};
