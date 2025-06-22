import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import {
  Face,
  RecordVoiceOver,
  PanTool,
  AccessTime,
  Emergency,
  Psychology,
  ExpandMore,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  LocalHospital,
} from '@mui/icons-material'
import { useStrokeAnalysis } from '../hooks/useStrokeAnalysis'

interface FASTStep {
  letter: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
  result?: 'normal' | 'abnormal'
  agentData?: any
}

const EnhancedFASTAssessment: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [assessmentComplete, setAssessmentComplete] = useState(false)
  const [emergencyTriggered, setEmergencyTriggered] = useState(false)
  const [patientId] = useState(`patient-${Date.now()}`)
  const [symptomText, setSymptomText] = useState('')
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false)
  
  const { isAnalyzing, result, error, analyzeText, reset } = useStrokeAnalysis()

  const [fastSteps, setFastSteps] = useState<FASTStep[]>([
    {
      letter: 'F',
      title: 'Face Drooping',
      description: 'AI analysis of facial asymmetry and drooping patterns',
      icon: <Face sx={{ fontSize: 40, color: '#008080' }} />,
      completed: false,
    },
    {
      letter: 'A',
      title: 'Arm Weakness',
      description: 'Detection of arm weakness and coordination issues',
      icon: <PanTool sx={{ fontSize: 40, color: '#008080' }} />,
      completed: false,
    },
    {
      letter: 'S',
      title: 'Speech Difficulty',
      description: 'Analysis of speech patterns and clarity',
      icon: <RecordVoiceOver sx={{ fontSize: 40, color: '#008080' }} />,
      completed: false,
    },
    {
      letter: 'T',
      title: 'Time to Call 911',
      description: 'Emergency response coordination and dispatch',
      icon: <AccessTime sx={{ fontSize: 40, color: '#008080' }} />,
      completed: false,
    },
  ])

  // Update assessment based on agent analysis
  useEffect(() => {
    if (result?.results?.symptom_analysis) {
      const analysis = result.results.symptom_analysis
      const symptoms = analysis.detected_symptoms

      const updatedSteps = fastSteps.map(step => {
        let hasSymptoms = false
        let agentData = null

        switch (step.letter) {
          case 'F':
            hasSymptoms = symptoms.face.length > 0
            agentData = { symptoms: symptoms.face, confidence: analysis.fast_score }
            break
          case 'A':
            hasSymptoms = symptoms.arm.length > 0
            agentData = { symptoms: symptoms.arm, confidence: analysis.fast_score }
            break
          case 'S':
            hasSymptoms = symptoms.speech.length > 0
            agentData = { symptoms: symptoms.speech, confidence: analysis.fast_score }
            break
          case 'T':
            hasSymptoms = result.results?.emergency_alert?.alert_sent || false
            agentData = result.results?.emergency_alert
            break
        }

        return {
          ...step,
          completed: true,
          result: hasSymptoms ? 'abnormal' as const : 'normal' as const,
          agentData
        }
      })

      setFastSteps(updatedSteps)
      setAssessmentComplete(true)

      // Check if emergency response is needed
      if (result.results?.emergency_alert?.alert_sent) {
        setEmergencyTriggered(true)
      }
    }
  }, [result])

  const handleStartAnalysis = async () => {
    if (!symptomText.trim()) {
      return
    }

    setShowAnalysisDialog(false)
    await analyzeText(symptomText, patientId)
  }

  const handleStepComplete = (result: 'normal' | 'abnormal') => {
    const updatedSteps = [...fastSteps]
    updatedSteps[currentStep] = {
      ...updatedSteps[currentStep],
      completed: true,
      result,
    }
    setFastSteps(updatedSteps)

    if (result === 'abnormal') {
      setEmergencyTriggered(true)
    }

    if (currentStep < fastSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setAssessmentComplete(true)
    }
  }

  const resetAssessment = () => {
    setCurrentStep(0)
    setAssessmentComplete(false)
    setEmergencyTriggered(false)
    setSymptomText('')
    setFastSteps(prev => prev.map(step => ({ 
      ...step, 
      completed: false, 
      result: undefined,
      agentData: undefined 
    })))
    reset()
  }

  const abnormalResults = fastSteps.filter(step => step.result === 'abnormal').length
  const progress = ((fastSteps.filter(step => step.completed).length) / fastSteps.length) * 100

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error'
      case 'warning': return 'warning' 
      case 'normal': return 'success'
      default: return 'info'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <ErrorIcon color="error" />
      case 'warning': return <Warning color="warning" />
      case 'normal': return <CheckCircle color="success" />
      default: return <Psychology color="info" />
    }
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      <Typography variant="h2" align="center" gutterBottom>
        ICTUS Enhanced FAST Assessment
      </Typography>
      <Typography variant="h5" align="center" color="text.secondary" gutterBottom>
        AI-Powered Stroke Detection with Multi-Agent Analysis
      </Typography>

      {/* Emergency Alert */}
      {emergencyTriggered && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          icon={<Emergency />}
        >
          <Typography variant="h6">
            STROKE INDICATORS DETECTED - EMERGENCY SERVICES CONTACTED
          </Typography>
          {result?.results?.emergency_alert && (
            <Typography variant="body2">
              Alert ID: {result.results.emergency_alert.alert_id} | 
              ETA: {result.results.emergency_alert.estimated_response_time}
            </Typography>
          )}
        </Alert>
      )}

      {/* Analysis Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Analysis Error: {error}
        </Alert>
      )}

      {/* AI Analysis Results */}
      {result && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Psychology sx={{ mr: 2, color: '#008080' }} />
              <Typography variant="h6">
                Multi-Agent Analysis Results
              </Typography>
              {getSeverityIcon(result.results?.symptom_analysis?.severity || 'normal')}
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">FAST Score</Typography>
                <Typography variant="h5" color="primary">
                  {result.results?.symptom_analysis?.fast_score || 0}%
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Severity Level</Typography>
                <Chip 
                  label={result.results?.symptom_analysis?.severity?.toUpperCase() || 'NORMAL'}
                  color={getSeverityColor(result.results?.symptom_analysis?.severity || 'normal') as any}
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Response Time</Typography>
                <Typography variant="h6">
                  {result.total_duration_seconds?.toFixed(1)}s
                </Typography>
              </Box>
            </Box>

            {/* Agents Executed */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">
                  Agents Executed ({result.agents_executed?.length || 0})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {result.agents_executed?.map((agent, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={agent.replace('_', ' ').toUpperCase()}
                        secondary={`Agent ${index + 1} of ${result.agents_executed?.length}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Progress Card */}
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
          {isAnalyzing && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                AI agents analyzing symptoms...
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* FAST Steps */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
        {fastSteps.map((step, index) => (
          <Card 
            key={step.letter}
            sx={{ 
              height: '100%',
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
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    label={step.result === 'normal' ? 'Normal' : 'Abnormal'}
                    color={step.result === 'normal' ? 'success' : 'error'}
                    sx={{ mb: 1 }}
                  />
                  {step.agentData?.symptoms && step.agentData.symptoms.length > 0 && (
                    <Box>
                      <Typography variant="caption" display="block">
                        Detected: {step.agentData.symptoms.join(', ')}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {currentStep === index && !step.completed && !result && (
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button 
                    variant="contained" 
                    color="success"
                    onClick={() => handleStepComplete('normal')}
                  >
                    Normal
                  </Button>
                  <Button 
                    variant="contained" 
                    color="error"
                    onClick={() => handleStepComplete('abnormal')}
                  >
                    Abnormal
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Action Buttons */}
      <Card sx={{ textAlign: 'center' }}>
        <CardContent>
          {!result && !isAnalyzing && (
            <Button 
              variant="contained" 
              size="large"
              startIcon={<Psychology />}
              onClick={() => setShowAnalysisDialog(true)}
              sx={{ mr: 2 }}
            >
              Start AI Analysis
            </Button>
          )}
          
          {(assessmentComplete || result) && (
            <Box>
              <Typography variant="h5" gutterBottom>
                Assessment Complete
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {result?.summary ? (
                  `${result.summary.stroke_symptoms_detected ? 'Stroke symptoms detected' : 'No stroke symptoms detected'}. 
                   FAST Score: ${result.summary.fast_score}%. 
                   ${result.summary.requires_emergency ? 'Emergency services contacted.' : 'Monitoring recommended.'}`
                ) : (
                  `${abnormalResults > 0 
                    ? `${abnormalResults} abnormal indicator(s) detected. Emergency services have been contacted.`
                    : 'No stroke indicators detected. Continue monitoring if symptoms persist.'
                  }`
                )}
              </Typography>
              <Button 
                variant="contained" 
                onClick={resetAssessment}
                startIcon={<CheckCircle />}
              >
                New Assessment
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Symptom Input Dialog */}
      <Dialog open={showAnalysisDialog} onClose={() => setShowAnalysisDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Psychology sx={{ mr: 1, color: '#008080' }} />
            Describe Symptoms for AI Analysis
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Patient Symptoms Description"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={symptomText}
            onChange={(e) => setSymptomText(e.target.value)}
            placeholder="Describe the symptoms you're experiencing or observing (e.g., 'I can't lift my right arm and my speech is slurred')"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            The AI will analyze this text using multiple specialized agents for comprehensive stroke detection.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAnalysisDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleStartAnalysis} 
            variant="contained"
            disabled={!symptomText.trim()}
            startIcon={<LocalHospital />}
          >
            Analyze Symptoms
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default EnhancedFASTAssessment