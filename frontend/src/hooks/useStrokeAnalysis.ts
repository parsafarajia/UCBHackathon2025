import { useState, useCallback, useRef } from 'react'
import { strokeAgentAPI, StrokeDetectionRequest, StrokeDetectionResponse } from '../lib/strokeAgentAPI'

interface UseStrokeAnalysisReturn {
  isAnalyzing: boolean
  result: StrokeDetectionResponse | null
  error: string | null
  analyzeText: (text: string, patientId: string) => Promise<void>
  analyzeVoice: (voiceText: string, patientId: string) => Promise<void>
  analyzeVideo: (videoData: string, patientId: string) => Promise<void>
  reset: () => void
  getSystemStatus: () => Promise<any>
}

export const useStrokeAnalysis = (): UseStrokeAnalysisReturn => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<StrokeDetectionResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const analyzeSymptoms = useCallback(async (request: StrokeDetectionRequest) => {
    // Cancel any ongoing analysis
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const response = await strokeAgentAPI.analyzeStrokeSymptoms(request)
      
      if (!abortControllerRef.current.signal.aborted) {
        setResult(response)
      }
    } catch (err) {
      if (!abortControllerRef.current.signal.aborted) {
        setError(err instanceof Error ? err.message : 'Analysis failed')
      }
    } finally {
      if (!abortControllerRef.current.signal.aborted) {
        setIsAnalyzing(false)
      }
    }
  }, [])

  const analyzeText = useCallback(async (text: string, patientId: string) => {
    if (!text.trim()) {
      setError('Please provide symptom description')
      return
    }

    const request: StrokeDetectionRequest = {
      patient_id: patientId,
      text: text.trim(),
      input_type: 'text',
      location: {
        address: 'Current Location (Browser geolocation)',
        coordinates: { lat: 37.7749, lng: -122.4194 }
      }
    }

    await analyzeSymptoms(request)
  }, [analyzeSymptoms])

  const analyzeVoice = useCallback(async (voiceText: string, patientId: string) => {
    if (!voiceText.trim()) {
      setError('No voice input detected')
      return
    }

    const request: StrokeDetectionRequest = {
      patient_id: patientId,
      voice_text: voiceText.trim(),
      input_type: 'voice',
      location: {
        address: 'Current Location (Voice input)',
        coordinates: { lat: 37.7749, lng: -122.4194 }
      }
    }

    await analyzeSymptoms(request)
  }, [analyzeSymptoms])

  const analyzeVideo = useCallback(async (videoData: string, patientId: string) => {
    const request: StrokeDetectionRequest = {
      patient_id: patientId,
      text: `Video analysis input: ${videoData}`,
      input_type: 'video',
      location: {
        address: 'Current Location (Video input)',
        coordinates: { lat: 37.7749, lng: -122.4194 }
      }
    }

    await analyzeSymptoms(request)
  }, [analyzeSymptoms])

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsAnalyzing(false)
    setResult(null)
    setError(null)
  }, [])

  const getSystemStatus = useCallback(async () => {
    try {
      return await strokeAgentAPI.getSystemStatus()
    } catch (err) {
      console.error('Failed to get system status:', err)
      return null
    }
  }, [])

  return {
    isAnalyzing,
    result,
    error,
    analyzeText,
    analyzeVoice,
    analyzeVideo,
    reset,
    getSystemStatus
  }
}