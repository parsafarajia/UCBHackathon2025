import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
} from '@mui/material'
import {
  Videocam,
  VideocamOff,
  PlayArrow,
  Stop,
  CheckCircle,
  Warning,
  Psychology,
  Emergency,
  Face,
  PanTool,
} from '@mui/icons-material'
import { useStrokeAnalysis } from '../hooks/useStrokeAnalysis'

interface VideoAnalysisResult {
  faceSymmetry: number
  armMovement: number
  overallRisk: 'low' | 'medium' | 'high'
  confidence: number
  agentAnalysis?: any
}

const EnhancedVideoRecognition: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [localAnalysisResult, setLocalAnalysisResult] = useState<VideoAnalysisResult | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [patientId] = useState(`patient-video-${Date.now()}`)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const { 
    isAnalyzing: agentAnalyzing, 
    result: agentResult, 
    error: agentError, 
    analyzeVideo: analyzeWithAgents,
    reset: resetAgents
  } = useStrokeAnalysis()

  useEffect(() => {
    if (agentResult?.results?.symptom_analysis) {
      const analysis = agentResult.results.symptom_analysis
      setLocalAnalysisResult(prev => ({
        ...prev,
        agentAnalysis: analysis,
        overallRisk: analysis.severity === 'critical' ? 'high' : 
                    analysis.severity === 'warning' ? 'medium' : 'low',
        confidence: analysis.fast_score
      } as VideoAnalysisResult))
    }
  }, [agentResult])

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false 
      })
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
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
      setRecordingDuration(0)
      
      // Start duration counter
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)

      // Auto-stop after 15 seconds for comprehensive analysis
      setTimeout(() => {
        if (mediaRecorderRef.current && isRecording) {
          stopRecording()
        }
      }, 15000)
      
    } catch (err) {
      setError('Recording failed. Please try again.')
      console.error('Recording error:', err)
    }
  }, [stream, isRecording])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
        durationIntervalRef.current = null
      }
    }
  }, [isRecording])

  const analyzeVideo = async (videoBlob: Blob) => {
    setIsAnalyzing(true)
    
    try {
      // Simulate local video analysis
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock local analysis results
      const mockLocalResult: VideoAnalysisResult = {
        faceSymmetry: 85 + Math.random() * 15,
        armMovement: 80 + Math.random() * 20,
        overallRisk: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        confidence: 85 + Math.random() * 15
      }
      
      setLocalAnalysisResult(mockLocalResult)
      
      // Generate analysis description for agent processing
      const videoAnalysisDescription = generateVideoAnalysisDescription(mockLocalResult)
      
      // Send to stroke detection agents
      await analyzeWithAgents(videoAnalysisDescription, patientId)
      
    } catch (error) {
      setError('Video analysis failed')
      console.error('Analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateVideoAnalysisDescription = (analysis: VideoAnalysisResult): string => {
    let description = 'Video analysis detected: '
    const observations = []

    if (analysis.faceSymmetry < 85) {
      observations.push('facial asymmetry and possible drooping')
    }
    
    if (analysis.armMovement < 85) {
      observations.push('arm weakness and reduced coordination')
    }

    if (analysis.overallRisk === 'high') {
      observations.push('multiple concerning motor symptoms')
    }

    if (observations.length === 0) {
      return 'Video analysis shows normal facial symmetry and arm coordination'
    }

    return description + observations.join(', ')
  }

  const resetAnalysis = () => {
    setLocalAnalysisResult(null)
    setError(null)
    setRecordingDuration(0)
    resetAgents()
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

  const isProcessing = isAnalyzing || agentAnalyzing

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Enhanced Video Analysis for Stroke Detection
      </Typography>
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        AI-powered analysis of facial symmetry and arm movement with multi-agent processing
      </Typography>

      {/* Errors */}
      {(error || agentError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || agentError}
        </Alert>
      )}

      {/* Emergency Alert */}
      {agentResult?.results?.emergency_alert?.alert_sent && (
        <Alert severity="error" sx={{ mb: 3 }} icon={<Emergency />}>
          <Typography variant="h6">
            STROKE INDICATORS DETECTED IN VIDEO - EMERGENCY SERVICES CONTACTED
          </Typography>
          <Typography variant="body2">
            Alert ID: {agentResult.results.emergency_alert.alert_id}
          </Typography>
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        {/* Video Feed */}
        <Box>
          <Card>
            <CardContent>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Video Analysis Feed
                </Typography>
                
                <Paper 
                  sx={{ 
                    width: '100%', 
                    height: 400, 
                    bgcolor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    position: 'relative'
                  }}
                >
                  {stream ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          borderRadius: 4
                        }}
                      />
                      {isRecording && (
                        <Box sx={{ 
                          position: 'absolute', 
                          top: 10, 
                          right: 10, 
                          bgcolor: 'error.main', 
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <Box sx={{ 
                            width: 8, 
                            height: 8, 
                            bgcolor: 'white', 
                            borderRadius: '50%',
                            animation: 'blink 1s infinite'
                          }} />
                          <Typography variant="caption">
                            REC {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                          </Typography>
                        </Box>
                      )}
                    </>
                  ) : (
                    <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                      <Videocam sx={{ fontSize: 64, mb: 1 }} />
                      <Typography>Click "Start Camera" to begin</Typography>
                    </Box>
                  )}
                </Paper>

                {/* Camera Controls */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
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
                          disabled={isProcessing}
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

                {/* Recording Progress */}
                {isRecording && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(recordingDuration / 15) * 100} 
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="error">
                      Recording... Auto-stops at 15 seconds ({15 - recordingDuration}s remaining)
                    </Typography>
                  </Box>
                )}

                {/* Processing Indicator */}
                {isProcessing && (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <CircularProgress sx={{ mb: 2 }} />
                    <Typography variant="body2">
                      {isAnalyzing && 'Analyzing video...'}
                      {agentAnalyzing && 'AI agents processing...'}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Analysis Results */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Psychology sx={{ mr: 1, color: '#008080' }} />
                Analysis Results
              </Typography>

              {/* Local Video Analysis */}
              {localAnalysisResult && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Video Processing Results
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {getRiskIcon(localAnalysisResult.overallRisk)}
                      <Typography variant="h6" sx={{ ml: 1 }}>
                        Risk: {localAnalysisResult.overallRisk.toUpperCase()}
                      </Typography>
                    </Box>
                    <Alert severity={getRiskColor(localAnalysisResult.overallRisk) as any}>
                      Confidence: {localAnalysisResult.confidence.toFixed(1)}%
                    </Alert>
                  </Box>

                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Face color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Face Symmetry"
                        secondary={`${localAnalysisResult.faceSymmetry.toFixed(1)}%`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PanTool color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Arm Movement"
                        secondary={`${localAnalysisResult.armMovement.toFixed(1)}%`}
                      />
                    </ListItem>
                  </List>
                </Box>
              )}

              {/* Agent Analysis Results */}
              {agentResult?.results?.symptom_analysis && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    AI Agent Analysis
                  </Typography>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">FAST Score</Typography>
                      <Typography variant="h6" color="primary">
                        {agentResult.results.symptom_analysis.fast_score}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Severity</Typography>
                      <Chip 
                        label={agentResult.results.symptom_analysis.severity.toUpperCase()}
                        color={getRiskColor(agentResult.results.symptom_analysis.severity) as any}
                        size="small"
                      />
                    </Box>
                  </Box>

                  {/* Detected Symptoms */}
                  {Object.entries(agentResult.results.symptom_analysis.detected_symptoms).map(([category, symptoms]) => (
                    symptoms.length > 0 && (
                      <Box key={category} sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {category.toUpperCase()} Symptoms:
                        </Typography>
                        <Typography variant="body2">
                          {(symptoms as string[]).join(', ')}
                        </Typography>
                      </Box>
                    )
                  ))}

                  {/* Emergency Response */}
                  {agentResult.results?.emergency_alert && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Emergency services notified
                      </Typography>
                      <Typography variant="caption">
                        ETA: {agentResult.results.emergency_alert.estimated_response_time}
                      </Typography>
                    </Alert>
                  )}
                </Box>
              )}

              {!isProcessing && !localAnalysisResult && !agentResult && (
                <Typography variant="body2" color="text.secondary">
                  Start video recording to begin analysis
                </Typography>
              )}

              {(localAnalysisResult || agentResult) && (
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={resetAnalysis}
                  sx={{ mt: 2 }}
                >
                  New Analysis
                </Button>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </Box>
  )
}

export default EnhancedVideoRecognition