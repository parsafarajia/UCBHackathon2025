import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  Emergency,
  Phone,
  LocationOn,
  Person,
  AccessTime,
  LocalHospital,
  CheckCircle,
  Warning,
} from '@mui/icons-material'

interface EmergencyCall {
  id: string
  timestamp: Date
  location: string
  patientInfo: string
  status: 'calling' | 'connected' | 'dispatched' | 'completed'
  estimatedArrival?: number
  dispatchedUnits?: string[]
}

interface EmergencyAlertProps {
  triggered?: boolean
  patientData?: {
    name: string
    age: number
    conditions: string[]
  }
}

const EmergencyAlert: React.FC<EmergencyAlertProps> = ({ 
  triggered = false, 
  patientData 
}) => {
  const [isEmergencyActive, setIsEmergencyActive] = useState(triggered)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [emergencyCall, setEmergencyCall] = useState<EmergencyCall | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)

  const handleEmergencyTrigger = useCallback(() => {
    setIsEmergencyActive(true)
    setCountdown(10) // 10 second countdown
  }, [])

  // Auto-trigger emergency when prop changes
  useEffect(() => {
    if (triggered && !isEmergencyActive) {
      handleEmergencyTrigger()
    }
  }, [triggered, isEmergencyActive, handleEmergencyTrigger])

  // Countdown timer effect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      initiateEmergencyCall()
    }
  }, [countdown])

  const handleManualEmergency = () => {
    setShowConfirmDialog(true)
  }

  const confirmEmergencyCall = () => {
    setShowConfirmDialog(false)
    handleEmergencyTrigger()
  }

  const cancelEmergencyCall = () => {
    setCountdown(null)
    setIsEmergencyActive(false)
    setEmergencyCall(null)
  }

  const initiateEmergencyCall = async () => {
    setCountdown(null)
    
    const newCall: EmergencyCall = {
      id: `EMR-${Date.now()}`,
      timestamp: new Date(),
      location: "Current Location (GPS Coordinates: 37.7749, -122.4194)",
      patientInfo: patientData ? 
        `${patientData.name}, Age: ${patientData.age}` : 
        "Unknown Patient",
      status: 'calling',
      dispatchedUnits: []
    }
    
    setEmergencyCall(newCall)
    
    // Simulate emergency call progression
    setTimeout(() => {
      setEmergencyCall(prev => prev ? { ...prev, status: 'connected' } : null)
    }, 2000)
    
    setTimeout(() => {
      setEmergencyCall(prev => prev ? { 
        ...prev, 
        status: 'dispatched',
        estimatedArrival: 8,
        dispatchedUnits: ['Unit 21 - Ambulance', 'Unit 15 - Paramedics']
      } : null)
    }, 5000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'calling': return 'warning'
      case 'connected': return 'info'
      case 'dispatched': return 'success'
      case 'completed': return 'success'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'calling': return <Phone />
      case 'connected': return <CheckCircle />
      case 'dispatched': return <LocalHospital />
      case 'completed': return <CheckCircle />
      default: return <Phone />
    }
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Emergency Response System
      </Typography>

      {!isEmergencyActive && !emergencyCall && (
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Emergency sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Emergency Services
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              In case of stroke symptoms detection, emergency services will be contacted automatically. 
              You can also manually trigger an emergency call if needed.
            </Typography>
            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={<Phone />}
              onClick={handleManualEmergency}
            >
              Call 911 Now
            </Button>
          </CardContent>
        </Card>
      )}

      {countdown !== null && (
        <Card>
          <CardContent>
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="h6">
                STROKE SYMPTOMS DETECTED - CALLING 911 IN {countdown} SECONDS
              </Typography>
            </Alert>
            
            <LinearProgress 
              variant="determinate" 
              value={(10 - countdown) * 10} 
              sx={{ mb: 3, height: 8 }}
            />
            
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={cancelEmergencyCall}
                sx={{ mr: 2 }}
              >
                Cancel Call
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => setCountdown(0)}
              >
                Call Now
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {emergencyCall && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Emergency sx={{ fontSize: 32, color: 'error.main', mr: 2 }} />
              <Box>
                <Typography variant="h6">
                  Emergency Call Active
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Call ID: {emergencyCall.id}
                </Typography>
              </Box>
            </Box>

            <Chip
              icon={getStatusIcon(emergencyCall.status)}
              label={emergencyCall.status.toUpperCase()}
              color={getStatusColor(emergencyCall.status) as any}
              sx={{ mb: 3 }}
            />

            <Box>
              <Box>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <AccessTime />
                    </ListItemIcon>
                    <ListItemText
                      primary="Call Time"
                      secondary={emergencyCall.timestamp.toLocaleString()}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <LocationOn />
                    </ListItemIcon>
                    <ListItemText
                      primary="Location"
                      secondary={emergencyCall.location}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText
                      primary="Patient Information"
                      secondary={emergencyCall.patientInfo}
                    />
                  </ListItem>

                  {patientData && patientData.conditions.length > 0 && (
                    <ListItem>
                      <ListItemIcon>
                        <Warning />
                      </ListItemIcon>
                      <ListItemText
                        primary="Medical Conditions"
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            {patientData.conditions.map((condition, index) => (
                              <Chip
                                key={index}
                                label={condition}
                                size="small"
                                variant="outlined"
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            ))}
                          </Box>
                        }
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            </Box>

            {emergencyCall.status === 'dispatched' && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Emergency Units Dispatched
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Estimated arrival: {emergencyCall.estimatedArrival} minutes
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {emergencyCall.dispatchedUnits?.map((unit, index) => (
                    <Chip
                      key={index}
                      label={unit}
                      color="success"
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              </Alert>
            )}

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setEmergencyCall(null)
                  setIsEmergencyActive(false)
                }}
              >
                Close
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Emergency sx={{ mr: 1, color: 'error.main' }} />
            Confirm Emergency Call
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to call 911? Emergency services will be contacted immediately.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={confirmEmergencyCall} 
            variant="contained" 
            color="error"
            autoFocus
          >
            Call 911
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default EmergencyAlert