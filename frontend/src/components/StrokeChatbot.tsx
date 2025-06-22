import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material'
import {
  Send,
  Mic,
  MicOff,
  Psychology,
  LocalHospital,
  Phone,
  Warning,
  CheckCircle,
  Person,
  SmartToy,
  Emergency,
} from '@mui/icons-material'

interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
  type?: 'text' | 'analysis' | 'emergency' | 'care'
  data?: any
}

interface StrokeAnalysisData {
  symptom_analysis?: {
    detected_symptoms: {
      face: string[]
      arm: string[]
      speech: string[]
      other: string[]
    }
    fast_score: number
    severity: string
    recommendation: string
  }
  triage_assessment?: {
    urgency_score: number
    triage_level: string
    requires_immediate_attention: boolean
  }
  emergency_alert?: {
    alert_sent: boolean
    alert_id: string
    estimated_response_time: string
  }
  care_instructions?: {
    immediate_actions: string[]
    monitoring_guidelines: string[]
  }
}

const StrokeChatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI stroke detection assistant. I can help analyze symptoms and provide guidance. Please describe any symptoms you or someone nearby is experiencing.',
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [patientId] = useState(`patient-chat-${Date.now()}`)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Simulate stroke detection analysis using the agent logic
  const analyzeSymptoms = async (inputText: string): Promise<StrokeAnalysisData> => {
    // Simulate the symptom analysis from the agent
    const input = inputText.toLowerCase()
    
    const faceSymptoms = ['face drooping', 'facial droop', 'face droop', 'smile uneven', 'mouth drooping']
    const armSymptoms = ['arm weakness', 'can\'t lift arm', 'arm feels heavy', 'arm numb', 'one arm weak']
    const speechSymptoms = ['slurred speech', 'can\'t speak', 'speech unclear', 'difficulty speaking', 'trouble talking']
    const otherSymptoms = ['sudden headache', 'severe headache', 'vision loss', 'dizziness', 'confusion']
    
    const detected_symptoms = {
      face: faceSymptoms.filter(symptom => input.includes(symptom)),
      arm: armSymptoms.filter(symptom => input.includes(symptom)),
      speech: speechSymptoms.filter(symptom => input.includes(symptom)),
      other: otherSymptoms.filter(symptom => input.includes(symptom))
    }
    
    // Calculate FAST score
    let fast_score = 0
    if (detected_symptoms.face.length > 0) fast_score += 3
    if (detected_symptoms.arm.length > 0) fast_score += 3
    if (detected_symptoms.speech.length > 0) fast_score += 3
    if (detected_symptoms.other.length > 0) fast_score += detected_symptoms.other.length
    
    // Determine severity
    let severity = 'normal'
    let recommendation = 'Monitor symptoms, consult healthcare provider if concerned'
    let requires_emergency = false
    
    if (fast_score >= 6) {
      severity = 'critical'
      recommendation = 'IMMEDIATE EMERGENCY RESPONSE REQUIRED'
      requires_emergency = true
    } else if (fast_score >= 3) {
      severity = 'warning'
      recommendation = 'Seek immediate medical attention'
      requires_emergency = true
    }
    
    const analysisData: StrokeAnalysisData = {
      symptom_analysis: {
        detected_symptoms,
        fast_score,
        severity,
        recommendation
      }
    }
    
    // Add triage assessment if needed
    if (fast_score >= 3) {
      analysisData.triage_assessment = {
        urgency_score: fast_score * 10 + Math.floor(Math.random() * 20),
        triage_level: severity === 'critical' ? 'URGENT' : 'HIGH',
        requires_immediate_attention: requires_emergency
      }
    }
    
    // Add emergency alert if critical
    if (requires_emergency) {
      analysisData.emergency_alert = {
        alert_sent: true,
        alert_id: `EMR-${Date.now()}`,
        estimated_response_time: '3-8 minutes'
      }
      
      analysisData.care_instructions = {
        immediate_actions: [
          'Keep the person calm and still',
          'Do not give food or water',
          'Note the time symptoms started',
          'Prepare for emergency responders'
        ],
        monitoring_guidelines: [
          'Check breathing and pulse regularly',
          'Watch for changes in consciousness',
          'Keep the person comfortable'
        ]
      }
    }
    
    return analysisData
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsAnalyzing(true)
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Analyze the symptoms
      const analysisData = await analyzeSymptoms(userMessage.content)
      
      // Create bot response with analysis
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'I\'ve analyzed the symptoms you described. Here\'s my assessment:',
        sender: 'bot',
        timestamp: new Date(),
        type: 'analysis',
        data: analysisData
      }
      
      setMessages(prev => [...prev, botMessage])
      
      // Add follow-up message if emergency
      if (analysisData.emergency_alert?.alert_sent) {
        const emergencyMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          content: 'CRITICAL: I have detected serious stroke indicators. Emergency services have been notified.',
          sender: 'bot',
          timestamp: new Date(),
          type: 'emergency',
          data: analysisData.emergency_alert
        }
        
        setTimeout(() => {
          setMessages(prev => [...prev, emergencyMessage])
        }, 1000)
      }
      
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'I\'m sorry, I encountered an error analyzing your message. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsAnalyzing(false)
    }
  }

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: BlobPart[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        // Simulate voice-to-text conversion
        const voiceText = "I'm having trouble speaking clearly and my left arm feels weak"
        setInputMessage(voiceText)
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      
      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop()
          setIsRecording(false)
        }
      }, 10000)
      
    } catch (error) {
      console.error('Voice recording error:', error)
    }
  }

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const renderMessage = (message: ChatMessage) => {
    const isBot = message.sender === 'bot'
    
    return (
      <Box
        key={message.id}
        sx={{
          display: 'flex',
          justifyContent: isBot ? 'flex-start' : 'flex-end',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', maxWidth: '80%' }}>
          {isBot && (
            <Avatar sx={{ mr: 1, bgcolor: '#008080' }}>
              <SmartToy />
            </Avatar>
          )}
          
          <Paper
            sx={{
              p: 2,
              bgcolor: isBot ? 'grey.100' : 'primary.main',
              color: isBot ? 'text.primary' : 'primary.contrastText',
              borderRadius: 2,
            }}
          >
            <Typography variant="body1" sx={{ mb: 1 }}>
              {message.content}
            </Typography>
            
            {/* Render analysis data */}
            {message.type === 'analysis' && message.data && (
              <Box sx={{ mt: 2 }}>
                {message.data.symptom_analysis && (
                  <Alert 
                    severity={
                      message.data.symptom_analysis.severity === 'critical' ? 'error' :
                      message.data.symptom_analysis.severity === 'warning' ? 'warning' : 'success'
                    }
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="h6">
                      FAST Score: {message.data.symptom_analysis.fast_score}
                    </Typography>
                    <Typography variant="body2">
                      Severity: {message.data.symptom_analysis.severity.toUpperCase()}
                    </Typography>
                    <Typography variant="body2">
                      {message.data.symptom_analysis.recommendation}
                    </Typography>
                  </Alert>
                )}
                
                {/* Show detected symptoms */}
                {message.data.symptom_analysis?.detected_symptoms && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Detected Symptoms:
                    </Typography>
                    {Object.entries(message.data.symptom_analysis.detected_symptoms).map(([category, symptoms]) => (
                      (symptoms as string[]).length > 0 && (
                        <Box key={category} sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {category.toUpperCase()}:
                          </Typography>
                          {(symptoms as string[]).map((symptom, index) => (
                            <Chip
                              key={index}
                              label={symptom}
                              size="small"
                              color="warning"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      )
                    ))}
                  </Box>
                )}
                
                {/* Show care instructions */}
                {message.data.care_instructions && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Immediate Care Instructions:
                    </Typography>
                    <List dense>
                      {message.data.care_instructions.immediate_actions.map((action: string, index: number) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <LocalHospital color="error" />
                          </ListItemIcon>
                          <ListItemText primary={action} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            )}
            
            {/* Emergency alert */}
            {message.type === 'emergency' && message.data && (
              <Alert severity="error" icon={<Emergency />} sx={{ mt: 2 }}>
                <Typography variant="h6">
                  Emergency Alert Sent
                </Typography>
                <Typography variant="body2">
                  Alert ID: {message.data.alert_id}
                </Typography>
                <Typography variant="body2">
                  Estimated Response Time: {message.data.estimated_response_time}
                </Typography>
              </Alert>
            )}
            
            <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
              {message.timestamp.toLocaleTimeString()}
            </Typography>
          </Paper>
          
          {!isBot && (
            <Avatar sx={{ ml: 1, bgcolor: 'primary.main' }}>
              <Person />
            </Avatar>
          )}
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, height: '80vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" align="center" gutterBottom>
        AI Stroke Detection Assistant
      </Typography>
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
        Describe symptoms for immediate AI analysis and guidance
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Emergency:</strong> If someone is having a stroke, call 911 immediately. 
          This tool provides additional support but should not replace emergency services.
        </Typography>
      </Alert>

      {/* Chat Messages */}
      <Paper 
        sx={{ 
          flexGrow: 1, 
          p: 2, 
          mb: 2, 
          overflowY: 'auto',
          bgcolor: 'grey.50'
        }}
      >
        {messages.map(renderMessage)}
        
        {isAnalyzing && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ mr: 1, bgcolor: '#008080' }}>
                <SmartToy />
              </Avatar>
              <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Analyzing symptoms...
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Paper>

      {/* Input Area */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Describe the symptoms you're experiencing..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            multiline
            maxRows={3}
            disabled={isAnalyzing}
          />
          
          <IconButton
            color="primary"
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            disabled={isAnalyzing}
            sx={{ alignSelf: 'flex-end' }}
          >
            {isRecording ? <MicOff /> : <Mic />}
          </IconButton>
          
          <Button
            variant="contained"
            endIcon={<Send />}
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isAnalyzing}
            sx={{ alignSelf: 'flex-end' }}
          >
            Send
          </Button>
        </Box>
        
        {isRecording && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            Recording... Speak clearly about your symptoms
          </Typography>
        )}
      </Paper>
      
      {/* Quick Actions */}
      <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setInputMessage('I have sudden facial drooping on one side')}
        >
          Face Drooping
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setInputMessage('My arm feels weak and I can\'t lift it')}
        >
          Arm Weakness
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setInputMessage('I\'m having trouble speaking clearly')}
        >
          Speech Problems
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setInputMessage('I have a sudden severe headache')}
        >
          Severe Headache
        </Button>
      </Box>
    </Box>
  )
}

export default StrokeChatbot