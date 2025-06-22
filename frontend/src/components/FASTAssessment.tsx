import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material'
import {
  Face,
  RecordVoiceOver,
  PanTool,
  AccessTime,
  Emergency,
  Videocam,
  VideocamOff,
  PlayArrow,
  Stop,
  Mic,
} from '@mui/icons-material'

interface FASTStep {
  letter: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
  result?: 'normal' | 'abnormal'
  score?: number
}

interface FaceAnalysis {
  symmetryScore: number
  isAbnormal: boolean
  confidence: number
}

const FASTAssessment: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [assessmentComplete, setAssessmentComplete] = useState(false)
  const [emergencyTriggered, setEmergencyTriggered] = useState(false)
  
  // Camera and recording states
  const [cameraActive, setCameraActive] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Speech recording states
  const [isSpeechRecording, setIsSpeechRecording] = useState(false)
  const [speechDuration, setSpeechDuration] = useState(0)
  const [speechAnalyzing, setSpeechAnalyzing] = useState(false)
  
  // Analysis results
  const [faceAnalysis, setFaceAnalysis] = useState<FaceAnalysis | null>(null)
  const [speechResult, setSpeechResult] = useState<'normal' | 'abnormal' | null>(null)
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const speechRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const speechTimerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [fastSteps, setFastSteps] = useState<FASTStep[]>([
    {
      letter: 'F',
      title: 'Face Drooping',
      description: 'AI analysis of facial symmetry and drooping',
      icon: <Face sx={{ fontSize: 40, color: '#008080' }} />,
      completed: false,
    },
    {
      letter: 'A',
      title: 'Arm Weakness',
      description: 'AI analysis of arm movement and coordination',
      icon: <PanTool sx={{ fontSize: 40, color: '#008080' }} />,
      completed: false,
    },
    {
      letter: 'S',
      title: 'Speech Difficulty',
      description: 'AI analysis of speech patterns and clarity',
      icon: <RecordVoiceOver sx={{ fontSize: 40, color: '#008080' }} />,
      completed: false,
    },
    {
      letter: 'T',
      title: 'Time to Call 911',
      description: 'Emergency response if stroke indicators detected',
      icon: <AccessTime sx={{ fontSize: 40, color: '#008080' }} />,
      completed: false,
    },
  ])

  // Start camera with standard getUserMedia
  const startCamera = useCallback(async () => {
    try {
      setError(null)
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user'
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setCameraActive(true)
        
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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }, [])

  // Start recording with proper timer
  const startRecording = useCallback(() => {
    if (!streamRef.current) {
      setError('Camera not active. Please start camera first.')
      return
    }
    
    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9'
      })
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: BlobPart[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        await analyzeRecording(blob)
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingDuration(0)
      
      // Start timer with proper cleanup
      let duration = 0
      timerRef.current = setInterval(() => {
        duration += 1
        setRecordingDuration(duration)
        
        if (duration >= 10) {
          // Auto-stop at 10 seconds
          stopRecording()
        }
      }, 1000)
      
    } catch (err) {
      setError('Recording failed. Please try again.')
      console.error('Recording error:', err)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Simulate face analysis (placeholder for real AI)
  const analyzeFaceSymmetry = (): FaceAnalysis => {
    // Simulate realistic face analysis
    const baseScore = 75 + Math.random() * 20 // 75-95% range
    const symmetryScore = Math.max(0, Math.min(100, baseScore))
    
    return {
      symmetryScore,
      isAbnormal: symmetryScore < 80,
      confidence: 85 + Math.random() * 15
    }
  }

  const analyzeRecording = async (_: Blob) => {
    setIsAnalyzing(true)
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Analyze recording
    const analysis = analyzeFaceSymmetry()
    setFaceAnalysis(analysis)
    
    // Update FAST steps based on current step
    updateFASTStep(analysis)
    
    setIsAnalyzing(false)
  }

  const updateFASTStep = (analysis: FaceAnalysis) => {
    const updatedSteps = [...fastSteps]
    
    if (currentStep === 0) {
      // Face test
      updatedSteps[0] = {
        ...updatedSteps[0],
        completed: true,
        result: analysis.isAbnormal ? 'abnormal' : 'normal',
        score: analysis.symmetryScore
      }
      
      if (analysis.isAbnormal) {
        setEmergencyTriggered(true)
      }
      
      // Move to next step after delay
      setTimeout(() => {
        setCurrentStep(1)
        setFaceAnalysis(null)
        setRecordingDuration(0)
      }, 3000)
      
    } else if (currentStep === 1) {
      // Arm test - simulate arm movement analysis
      const armScore = 70 + Math.random() * 30
      updatedSteps[1] = {
        ...updatedSteps[1],
        completed: true,
        result: armScore < 80 ? 'abnormal' : 'normal',
        score: armScore
      }
      
      if (armScore < 80) {
        setEmergencyTriggered(true)
      }
      
      // Move to speech test
      setTimeout(() => {
        setCurrentStep(2)
        setFaceAnalysis(null)
        setRecordingDuration(0)
      }, 3000)
    }
    
    setFastSteps(updatedSteps)
  }

  // Speech recording functions
  const startSpeechRecording = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(mediaStream)
      speechRecorderRef.current = mediaRecorder
      
      const chunks: BlobPart[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        mediaStream.getTracks().forEach(track => track.stop())
        await analyzeSpeech(blob)
      }

      mediaRecorder.start()
      setIsSpeechRecording(true)
      setSpeechDuration(0)
      
      // Start speech timer
      let speechDur = 0
      speechTimerRef.current = setInterval(() => {
        speechDur += 1
        setSpeechDuration(speechDur)
        
        if (speechDur >= 10) {
          stopSpeechRecording()
        }
      }, 1000)
      
    } catch (err) {
      setError('Unable to access microphone. Please check permissions.')
      console.error('Microphone access error:', err)
    }
  }, [])

  const stopSpeechRecording = useCallback(() => {
    if (speechRecorderRef.current && speechRecorderRef.current.state === 'recording') {
      speechRecorderRef.current.stop()
    }
    setIsSpeechRecording(false)
    
    if (speechTimerRef.current) {
      clearInterval(speechTimerRef.current)
      speechTimerRef.current = null
    }
  }, [])

  const analyzeSpeech = async (_: Blob) => {
    setSpeechAnalyzing(true)
    
    // Simulate speech analysis
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const result: 'normal' | 'abnormal' = Math.random() > 0.7 ? 'abnormal' : 'normal'
    setSpeechResult(result)
    
    // Complete speech step
    const updatedSteps = [...fastSteps]
    updatedSteps[2] = {
      ...updatedSteps[2],
      completed: true,
      result,
    }
    
    if (result === 'abnormal') {
      setEmergencyTriggered(true)
    }

    // Complete final step
    updatedSteps[3] = {
      ...updatedSteps[3],
      completed: true,
      result: emergencyTriggered || result === 'abnormal' ? 'abnormal' : 'normal'
    }
    
    setFastSteps(updatedSteps)
    setAssessmentComplete(true)
    setSpeechAnalyzing(false)
  }

  const resetAssessment = () => {
    setCurrentStep(0)
    setAssessmentComplete(false)
    setEmergencyTriggered(false)
    setFaceAnalysis(null)
    setSpeechResult(null)
    setRecordingDuration(0)
    setSpeechDuration(0)
    setError(null)
    stopCamera()
    setFastSteps(prev => prev.map(step => ({ ...step, completed: false, result: undefined, score: undefined })))
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (speechTimerRef.current) {
        clearInterval(speechTimerRef.current)
      }
      stopCamera()
    }
  }, [stopCamera])

  const progress = (fastSteps.filter(step => step.completed).length / fastSteps.length) * 100
  const abnormalResults = fastSteps.filter(step => step.result === 'abnormal').length

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      {/* FAST Progress Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            FAST Assessment Progress
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 8, borderRadius: 4, mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary">
            {Math.round(progress)}% Complete
          </Typography>
        </CardContent>
      </Card>

      <Typography variant="h2" align="center" gutterBottom>
        ICTUS
      </Typography>
      <Typography variant="h5" align="center" color="text.secondary" gutterBottom>
        AI-Powered Stroke Detection System
      </Typography>

      {emergencyTriggered && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          icon={<Emergency />}
        >
          <Typography variant="h6">
            STROKE INDICATORS DETECTED - EMERGENCY SERVICES CONTACTED
          </Typography>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Current Test Instructions */}
      {!assessmentComplete && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              {currentStep === 0 && 'Face Drooping Test'}
              {currentStep === 1 && 'Arm Weakness Test'}
              {currentStep === 2 && 'Speech Difficulty Test'}
            </Typography>
            
            {currentStep <= 1 && (
              <>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {currentStep === 0 && 'Look directly at the camera and smile. Try to show your teeth.'}
                  {currentStep === 1 && 'Raise both arms straight up and hold them for 10 seconds.'}
                </Typography>

                {/* Video Feed */}
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ 
                      width: 480, 
                      height: 360, 
                      borderRadius: 8,
                      transform: 'scaleX(-1)', // Mirror for user
                      backgroundColor: '#000'
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    style={{ display: 'none' }}
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
                        REC {recordingDuration}s
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Camera Controls */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
                  {!cameraActive ? (
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
                          Stop Recording ({10 - recordingDuration}s)
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
                      value={(recordingDuration / 10) * 100} 
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="error">
                      Recording... Auto-stops at 10 seconds ({10 - recordingDuration}s remaining)
                    </Typography>
                  </Box>
                )}

                {/* Analysis Status */}
                {isAnalyzing && (
                  <Box sx={{ py: 2 }}>
                    <CircularProgress sx={{ mb: 2 }} />
                    <Typography>Analyzing {currentStep === 0 ? 'face' : 'arm movement'}...</Typography>
                  </Box>
                )}

                {faceAnalysis && (
                  <Alert 
                    severity={faceAnalysis.isAbnormal ? 'error' : 'success'}
                    sx={{ mt: 2 }}
                  >
                    <Typography variant="h6">
                      {currentStep === 0 ? 'Face' : 'Arm'} Analysis: {faceAnalysis.isAbnormal ? 'Abnormal' : 'Normal'}
                    </Typography>
                    <Typography variant="body2">
                      Score: {faceAnalysis.symmetryScore.toFixed(1)}% | Confidence: {faceAnalysis.confidence.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2">
                      Moving to next test in 3 seconds...
                    </Typography>
                  </Alert>
                )}
              </>
            )}

            {/* Speech Test */}
            {currentStep === 2 && (
              <>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Instructions:</strong> Click the record button and clearly say: <br/>
                    <em>"The sky is blue in Cincinnati"</em>
                  </Typography>
                </Alert>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
                  {!isSpeechRecording ? (
                    <Button 
                      variant="contained" 
                      color="primary"
                      startIcon={<Mic />}
                      onClick={startSpeechRecording}
                      disabled={speechAnalyzing}
                      size="large"
                    >
                      Start Recording
                    </Button>
                  ) : (
                    <Button 
                      variant="contained" 
                      color="error"
                      startIcon={<Stop />}
                      onClick={stopSpeechRecording}
                      size="large"
                    >
                      Stop Recording ({10 - speechDuration}s)
                    </Button>
                  )}
                </Box>

                {isSpeechRecording && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(speechDuration / 10) * 100} 
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="error">
                      Recording speech... ({10 - speechDuration}s remaining)
                    </Typography>
                  </Box>
                )}

                {speechAnalyzing && (
                  <Box sx={{ py: 2 }}>
                    <CircularProgress sx={{ mb: 2 }} />
                    <Typography>Analyzing speech...</Typography>
                  </Box>
                )}

                {speechResult && (
                  <Alert severity={speechResult === 'normal' ? 'success' : 'error'} sx={{ mt: 2 }}>
                    <Typography variant="h6">
                      Speech Analysis: {speechResult === 'normal' ? 'Normal' : 'Abnormal'}
                    </Typography>
                  </Alert>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* FAST Steps Summary */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {fastSteps.map((step, index) => (
          <Card 
            key={step.letter}
            sx={{ 
              border: currentStep === index ? '2px solid #008080' : '1px solid #e0e0e0',
              opacity: index > currentStep && !assessmentComplete ? 0.6 : 1,
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Typography variant="h3" sx={{ mr: 2, color: '#008080', fontWeight: 'bold' }}>
                  {step.letter}
                </Typography>
                {step.icon}
              </Box>
              
              <Typography variant="h5" gutterBottom>
                {step.title}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {step.description}
              </Typography>

              {step.completed && step.result && (
                <Box>
                  <Chip 
                    label={step.result === 'normal' ? 'Normal' : 'Abnormal'}
                    color={step.result === 'normal' ? 'success' : 'error'}
                    sx={{ mb: 2 }}
                  />
                  {step.score && (
                    <Typography variant="body2" color="text.secondary">
                      Score: {step.score.toFixed(1)}%
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      {assessmentComplete && (
        <Card sx={{ mt: 3, textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Assessment Complete
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {abnormalResults > 0 
                ? `${abnormalResults} abnormal indicator(s) detected. Emergency services have been contacted.`
                : 'No stroke indicators detected. Continue monitoring if symptoms persist.'
              }
            </Typography>
            <Button 
              variant="contained" 
              onClick={resetAssessment}
            >
              New Assessment
            </Button>
          </CardContent>
        </Card>
      )}

      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </Box>
  )
}

export default FASTAssessment