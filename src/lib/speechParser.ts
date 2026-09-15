import { ExtractionResult } from './types';

/**
 * Intelligent client-side natural language parser for spoken vitals
 */
export function parseSpokenVitals(transcript: string): ExtractionResult {
  const text = transcript.toLowerCase().trim();

  // Pattern 1: Blood Pressure with "over" or "/" (e.g. "140 over 90", "bp 135/85", "120 by 80")
  const bpMatch = text.match(/(?:bp|blood pressure|pressure)?\s*(\d{2,3})\s*(?:over|\/|by|-)\s*(\d{2,3})(?:\s*(?:pulse|heart rate|hr|rate)?\s*(\d{2,3}))?/i);
  
  // Pattern 2: Explicit BP numbers ("bp 140 90")
  const bpExplicit = text.match(/(?:bp|blood pressure)\s*(\d{2,3})\s+(\d{2,3})/i);

  if (bpMatch || bpExplicit) {
    const match = bpMatch || bpExplicit;
    const sys = parseInt(match![1], 10);
    const dia = parseInt(match![2], 10);
    const pulse = match![3] ? parseInt(match![3], 10) : null;

    if (sys >= 60 && sys <= 250 && dia >= 40 && dia <= 160) {
      return {
        type: 'bp',
        systolic: sys,
        diastolic: dia,
        pulse,
        glucose: null,
        confidence: 'high',
        confidenceScore: 96,
        rawText: transcript,
      };
    }
  }

  // Pattern 3: Blood Glucose / Sugar (e.g. "glucose 110", "sugar 145 mg per dl", "112 blood sugar")
  const glucMatch = text.match(/(?:glucose|sugar|blood sugar|sugar level)?\s*(\d{2,3})\s*(?:mg\/dl|mg|milligrams)?/i);
  if (glucMatch && (text.includes('glucose') || text.includes('sugar') || text.includes('mg'))) {
    const gluc = parseInt(glucMatch[1], 10);
    if (gluc >= 20 && gluc <= 600) {
      return {
        type: 'glucose',
        systolic: null,
        diastolic: null,
        pulse: null,
        glucose: gluc,
        confidence: 'high',
        confidenceScore: 94,
        rawText: transcript,
      };
    }
  }

  // Fallback: Check for any numbers
  const numberMatches = text.match(/\d+/g);
  if (numberMatches && numberMatches.length >= 2) {
    const sys = parseInt(numberMatches[0], 10);
    const dia = parseInt(numberMatches[1], 10);
    if (sys >= 70 && sys <= 220 && dia >= 40 && dia <= 140) {
      return {
        type: 'bp',
        systolic: sys,
        diastolic: dia,
        pulse: numberMatches[2] ? parseInt(numberMatches[2], 10) : null,
        confidence: 'medium',
        confidenceScore: 82,
        rawText: transcript,
        glucose: null,
      };
    }
  } else if (numberMatches && numberMatches.length === 1) {
    const num = parseInt(numberMatches[0], 10);
    if (num >= 40 && num <= 400) {
      return {
        type: 'glucose',
        systolic: null,
        diastolic: null,
        pulse: null,
        glucose: num,
        confidence: 'medium',
        confidenceScore: 80,
        rawText: transcript,
      };
    }
  }

  return {
    type: 'unknown',
    systolic: null,
    diastolic: null,
    pulse: null,
    glucose: null,
    confidence: 'low',
    confidenceScore: 35,
    rawText: transcript || 'No clear numbers detected',
  };
}

/**
 * Check if Web Speech API is supported
 */
export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
}
