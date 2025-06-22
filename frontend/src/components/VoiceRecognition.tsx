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
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material'
import {
  Mic,
  Stop,
  VolumeUp,
  CheckCircle,
  Warning,
} from '@mui/icons-material'

interface SpeechAnalysisResult {
  clarity: number
  fluency: number
  pronunciation: number
  responseTime: number
  overallRisk: 'low' | 'medium' | 'high'
  confidence: number
  detectedIssues: string[]
}

const testPhrases = [
  "The early bird catches the worm",
  "She sells seashells by the seashore",
  "Peter Piper picked a peck of pickled peppers",
  "Red leather, yellow leather",
  "Unique New York"
]

const VoiceRecognition: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<SpeechAnalysisResult | null>(null)
  const [currentPhrase, setCurrentPhrase] = useState(0)
  const [recordedPhrases, setRecordedPhrases] = useState<boolean[]>(new Array(testPhrases.length).fill(false))
  const [error, setError] = useState<string | null>(null)
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<BlobPart[]>([])

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await analyzeAudio(audioBlob)
        
        // Mark current phrase as recorded
        const newRecordedPhrases = [...recordedPhrases]
        newRecordedPhrases[currentPhrase] = true
        setRecordedPhrases(newRecordedPhrases)
        
        // Move to next phrase or complete
        if (currentPhrase < testPhrases.length - 1) {
          setCurrentPhrase(currentPhrase + 1)
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingStartTime(Date.now())
      
      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop()
          setIsRecording(false)
        }
      }, 10000)
      
    } catch (err) {
      setError('Unable to access microphone. Please check permissions.')
      console.error('Microphone access error:', err)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPhrase, recordedPhrases]) // analyzeAudio is defined below

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  const analyzeAudio = async (_: Blob) => {
    setIsAnalyzing(true)
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock analysis results for demo
    const responseTime = recordingStartTime ? Date.now() - recordingStartTime : 0
    const issues: string[] = []
    
    // Generate realistic mock data
    const clarity = 70 + Math.random() * 30
    const fluency = 60 + Math.random() * 40
    const pronunciation = 75 + Math.random() * 25
    
    if (clarity < 80) issues.push('Speech clarity below normal')
    if (fluency < 75) issues.push('Reduced speech fluency')
    if (pronunciation < 85) issues.push('Pronunciation difficulties')
    if (responseTime > 5000) issues.push('Delayed response time')
    
    const overallScore = (clarity + fluency + pronunciation) / 3
    let overallRisk: 'low' | 'medium' | 'high' = 'low'
    
    if (overallScore < 70 || issues.length >= 3) {
      overallRisk = 'high'
    } else if (overallScore < 85 || issues.length >= 2) {
      overallRisk = 'medium'
    }
    
    const mockResult: SpeechAnalysisResult = {
      clarity,
      fluency,
      pronunciation,
      responseTime: responseTime / 1000,
      overallRisk,
      confidence: 80 + Math.random() * 20,
      detectedIssues: issues
    }
    
    setAnalysisResult(mockResult)
    setIsAnalyzing(false)
  }

  const resetAnalysis = () => {
    setAnalysisResult(null)
    setCurrentPhrase(0)
    setRecordedPhrases(new Array(testPhrases.length).fill(false))
    setError(null)
  }

  const speakPhrase = (phrase: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(phrase)
      utterance.rate = 0.8
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
    }
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

  const allPhrasesRecorded = recordedPhrases.every(recorded => recorded)

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Voice Analysis for Speech Assessment
      </Typography>
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        AI-powered analysis of speech clarity, fluency, and pronunciation
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
              <Typography variant="h6" gutterBottom>
                Speech Test Phrases
              </Typography>
              
              <List>
                {testPhrases.map((phrase, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      border: '1px solid',
                      borderColor: currentPhrase === index ? 'primary.main' : 'grey.300',
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: recordedPhrases[index] ? 'success.light' : 'background.paper',
                    }}
                  >
                    <ListItemText
                      primary={`${index + 1}. ${phrase}`}
                      secondary={currentPhrase === index ? 'Current phrase' : recordedPhrases[index] ? 'Completed' : 'Pending'}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<VolumeUp />}
                        onClick={() => speakPhrase(phrase)}
                      >
                        Listen
                      </Button>
                      {recordedPhrases[index] && (
                        <Chip icon={<CheckCircle />} label="Done" color="success" size="small" />
                      )}
                    </Box>
                  </ListItem>
                ))}
              </List>

              <Paper sx={{ p: 2, mt: 3, textAlign: 'center' }}>
                {!allPhrasesRecorded && (
                  <Typography variant="h6" gutterBottom>
                    Current Phrase: "{testPhrases[currentPhrase]}"
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                  {!isRecording ? (
                    <Button
                      variant="contained"
                      startIcon={<Mic />}
                      onClick={startRecording}
                      disabled={isAnalyzing || allPhrasesRecorded}
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
                  
                  {allPhrasesRecorded && !analysisResult && (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => analyzeAudio(new Blob())}
                    >
                      Analyze Results
                    </Button>
                  )}
                </Box>

                {isRecording && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    Recording... Speak clearly into your microphone
                  </Typography>
                )}
              </Paper>
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
                  <Typography>Analyzing speech...</Typography>
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
                    <Typography variant="body2" gutterBottom>Speech Clarity:</Typography>
                    <Typography variant="h6" color="primary">{analysisResult.clarity.toFixed(1)}%</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>Speech Fluency:</Typography>
                    <Typography variant="h6" color="primary">{analysisResult.fluency.toFixed(1)}%</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>Pronunciation:</Typography>
                    <Typography variant="h6" color="primary">{analysisResult.pronunciation.toFixed(1)}%</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>Response Time:</Typography>
                    <Typography variant="h6" color="primary">{analysisResult.responseTime.toFixed(1)}s</Typography>
                  </Box>

                  {analysisResult.detectedIssues.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>Detected Issues:</Typography>
                      {analysisResult.detectedIssues.map((issue, index) => (
                        <Chip
                          key={index}
                          label={issue}
                          color="warning"
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}

                  <Button variant="outlined" fullWidth onClick={resetAnalysis}>
                    New Analysis
                  </Button>
                </Box>
              )}

              {!isAnalyzing && !analysisResult && (
                <Typography variant="body2" color="text.secondary">
                  Record all phrases to begin analysis
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  )
}

export default VoiceRecognition