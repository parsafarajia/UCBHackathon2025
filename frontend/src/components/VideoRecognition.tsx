import React, { useState, useRef, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material'
import {
  Videocam,
  VideocamOff,
  PlayArrow,
  Stop,
  CheckCircle,
  Warning,
} from '@mui/icons-material'

interface VideoAnalysisResult {
  faceSymmetry: number
  armMovement: number
  overallRisk: 'low' | 'medium' | 'high'
  confidence: number
}

const VideoRecognition: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user' // Use front-facing camera
        },
        audio: false 
      })
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        // Ensure video plays immediately
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
        }
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.')
      console.error('Camera access error:', err)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [stream])

  const startRecording = useCallback(() => {
    if (!stream) return

    try {
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: BlobPart[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        await analyzeVideo(blob)
      }

      mediaRecorder.start()
      setIsRecording(true)
      
      // Auto-stop after 10 seconds for demo
      setTimeout(() => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop()
          setIsRecording(false)
        }
      }, 10000)
      
    } catch (err) {
      setError('Recording failed. Please try again.')
      console.error('Recording error:', err)
    }
  }, [stream])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  const analyzeVideo = async (_: Blob) => {
    setIsAnalyzing(true)
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Mock analysis results for demo
    const mockResult: VideoAnalysisResult = {
      faceSymmetry: Math.random() * 100,
      armMovement: Math.random() * 100,
      overallRisk: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
      confidence: 85 + Math.random() * 15
    }
    
    setAnalysisResult(mockResult)
    setIsAnalyzing(false)
  }

  const resetAnalysis = () => {
    setAnalysisResult(null)
    setError(null)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'success'
      default: return 'info'
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high': return <Warning color="error" />
      case 'medium': return <Warning color="warning" />
      case 'low': return <CheckCircle color="success" />
      default: return null
    }
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Video Analysis for Stroke Detection
      </Typography>
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        AI-powered analysis of facial symmetry and arm movement patterns
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        <Box>
          <Card>
            <CardContent>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Camera Feed
                </Typography>
                
                <Paper 
                  sx={{ 
                    width: '100%', 
                    height: 360, 
                    bgcolor: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  {stream ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        borderRadius: 4,
                        transform: 'scaleX(-1)' // Mirror the video so user sees themselves normally
                      }}
                    />
                  ) : (
                    <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                      <Videocam sx={{ fontSize: 64, mb: 1 }} />
                      <Typography>Click "Start Camera" to begin</Typography>
                    </Box>
                  )}
                  
                  {stream && (
                    <Box sx={{ 
                      position: 'absolute', 
                      bottom: 10, 
                      left: 10, 
                      bgcolor: 'rgba(0,0,0,0.7)', 
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem'
                    }}>
                      Camera Active
                    </Box>
                  )}
                </Paper>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  {!stream ? (
                    <Button
                      variant="contained"
                      startIcon={<Videocam />}
                      onClick={startCamera}
                    >
                      Start Camera
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        startIcon={<VideocamOff />}
                        onClick={stopCamera}
                      >
                        Stop Camera
                      </Button>
                      
                      {!isRecording ? (
                        <Button
                          variant="contained"
                          startIcon={<PlayArrow />}
                          onClick={startRecording}
                          disabled={isAnalyzing}
                        >
                          Start Recording
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<Stop />}
                          onClick={stopRecording}
                        >
                          Stop Recording
                        </Button>
                      )}
                    </>
                  )}
                </Box>

                {isRecording && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    Recording... (Auto-stops after 10 seconds)
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Analysis Results
              </Typography>

              {isAnalyzing && (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CircularProgress sx={{ mb: 2 }} />
                  <Typography>Analyzing video...</Typography>
                </Box>
              )}

              {analysisResult && (
                <Box>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {getRiskIcon(analysisResult.overallRisk)}
                      <Typography variant="h6" sx={{ ml: 1 }}>
                        Risk Level: {analysisResult.overallRisk.toUpperCase()}
                      </Typography>
                    </Box>
                    <Alert severity={getRiskColor(analysisResult.overallRisk) as any}>
                      Confidence: {analysisResult.confidence.toFixed(1)}%
                    </Alert>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Face Symmetry Score:
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {analysisResult.faceSymmetry.toFixed(1)}%
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" gutterBottom>
                      Arm Movement Score:
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {analysisResult.armMovement.toFixed(1)}%
                    </Typography>
                  </Box>

                  <Button 
                    variant="outlined" 
                    fullWidth 
                    onClick={resetAnalysis}
                  >
                    New Analysis
                  </Button>
                </Box>
              )}

              {!isAnalyzing && !analysisResult && (
                <Typography variant="body2" color="text.secondary">
                  Start recording to begin analysis
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  )
}

export default VideoRecognition