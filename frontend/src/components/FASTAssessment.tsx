import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Chip,
} from '@mui/material'
import {
  Face,
  RecordVoiceOver,
  PanTool,
  AccessTime,
  Emergency,
} from '@mui/icons-material'

interface FASTStep {
  letter: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
  result?: 'normal' | 'abnormal'
}

const FASTAssessment: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [assessmentComplete, setAssessmentComplete] = useState(false)
  const [emergencyTriggered, setEmergencyTriggered] = useState(false)

  const [fastSteps, setFastSteps] = useState<FASTStep[]>([
    {
      letter: 'F',
      title: 'Face Drooping',
      description: 'AI Video Analysis: Checking for facial asymmetry and drooping',
      icon: <Face sx={{ fontSize: 40, color: '#008080' }} />,
      completed: false,
    },
    {
      letter: 'A',
      title: 'Arm Weakness',
      description: 'AI Video Analysis: Detecting arm weakness and coordination',
      icon: <PanTool sx={{ fontSize: 40, color: '#008080' }} />,
      completed: false,
    },
    {
      letter: 'S',
      title: 'Speech Difficulty',
      description: 'AI Voice Analysis: Analyzing speech patterns and clarity',
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
    setFastSteps(prev => prev.map(step => ({ ...step, completed: false, result: undefined })))
  }

  const abnormalResults = fastSteps.filter(step => step.result === 'abnormal').length
  const progress = ((fastSteps.filter(step => step.completed).length) / fastSteps.length) * 100

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
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

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {fastSteps.map((step, index) => (
          <Box key={step.letter}>
            <Card 
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
                  <Chip 
                    label={step.result === 'normal' ? 'Normal' : 'Abnormal'}
                    color={step.result === 'normal' ? 'success' : 'error'}
                    sx={{ mb: 2 }}
                  />
                )}

                {currentStep === index && !step.completed && (
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
          </Box>
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
              sx={{ mr: 2 }}
            >
              New Assessment
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default FASTAssessment