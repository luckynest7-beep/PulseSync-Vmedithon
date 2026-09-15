import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, Volume2, Play } from 'lucide-react';
import { ExtractionResult } from '../../lib/types';
import { parseSpokenVitals, isSpeechRecognitionSupported } from '../../lib/speechParser';
import { extractTextViaApi } from '../../lib/api';
import { ConfirmCard } from './ConfirmCard';

interface VoiceInputProps {
  onSaveReading: (reading: any) => void;
  onCancel: () => void;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onSaveReading, onCancel }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const recognitionRef = useRef<any>(null);

  const isSupported = isSpeechRecognitionSupported();

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let current = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        current += event.results[i][0].transcript;
      }
      setTranscript(current);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isSupported]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Recognition start failed:', err);
      }
    }
  };

  const handleParse = async (textToParse: string) => {
    try {
      const res = await extractTextViaApi(textToParse);
      setExtractionResult(res);
    } catch {
      // Backend unreachable or Gemini not configured — fall back to the local regex parser.
      setExtractionResult(parseSpokenVitals(textToParse));
    }
  };

  const runQuickVoiceSample = (sample: string) => {
    setTranscript(sample);
    handleParse(sample);
  };

  if (extractionResult) {
    return (
      <ConfirmCard
        initialData={extractionResult}
        source="voice"
        onSave={onSaveReading}
        onCancel={() => {
          setExtractionResult(null);
          setTranscript('');
        }}
      />
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '12px 0' }}>
      <div
        className="glass-card"
        style={{
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'rgba(6, 182, 212, 0.04)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
        }}
      >
        <button
          type="button"
          onClick={toggleListening}
          className="add-fab-btn"
          style={{
            width: '72px',
            height: '72px',
            transform: 'none',
            background: isListening
              ? 'linear-gradient(135deg, #f43f5e, #e11d48)'
              : 'linear-gradient(135deg, #06b6d4, #2563eb)',
            boxShadow: isListening
              ? '0 0 30px rgba(244, 63, 94, 0.6)'
              : '0 0 24px rgba(6, 182, 212, 0.4)',
          }}
          title={isListening ? 'Stop Listening' : 'Start Speaking'}
        >
          {isListening ? <Mic size={32} /> : <MicOff size={32} />}
        </button>

        {/* Audio Wave Visualizer */}
        <div className="voice-wave-container">
          <div className={`wave-bar ${isListening ? 'active' : ''}`} />
          <div className={`wave-bar ${isListening ? 'active' : ''}`} />
          <div className={`wave-bar ${isListening ? 'active' : ''}`} />
          <div className={`wave-bar ${isListening ? 'active' : ''}`} />
          <div className={`wave-bar ${isListening ? 'active' : ''}`} />
        </div>

        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
          {isListening ? 'Listening for numbers...' : 'Tap Mic to Speak Reading'}
        </h4>

        <p style={{ fontSize: '0.78rem', color: '#94a3b8', maxWidth: '300px' }}>
          Say e.g. <span style={{ color: '#22d3ee' }}>"Blood pressure 145 over 92"</span> or{' '}
          <span style={{ color: '#22d3ee' }}>"Glucose 110"</span>
        </p>

        {/* Spoken Transcript Box */}
        {transcript && (
          <div
            style={{
              width: '100%',
              marginTop: '16px',
              padding: '12px',
              borderRadius: '10px',
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '4px' }}>
              TRANSCRIPT:
            </div>
            <div style={{ fontSize: '0.92rem', color: '#f8fafc', fontWeight: 600 }}>
              "{transcript}"
            </div>
          </div>
        )}

        {transcript && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleParse(transcript)}
            style={{ marginTop: '14px' }}
          >
            <Sparkles size={16} /> Parse Spoken Vitals
          </button>
        )}
      </div>

      {/* Quick Audio Test Presets for Demo Walkthrough */}
      <div style={{ marginTop: '20px', textAlign: 'left' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
          HACKATHON QUICK VOICE PRESETS:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.78rem', justifyContent: 'flex-start' }}
            onClick={() => runQuickVoiceSample('Blood pressure 148 over 94 pulse 82')}
          >
            <Volume2 size={14} color="#f43f5e" /> "Blood pressure 148 over 94 pulse 82"
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.78rem', justifyContent: 'flex-start' }}
            onClick={() => runQuickVoiceSample('Glucose 115 mg per dL')}
          >
            <Volume2 size={14} color="#06b6d4" /> "Glucose 115 mg per dL"
          </button>
        </div>
      </div>
    </div>
  );
};
