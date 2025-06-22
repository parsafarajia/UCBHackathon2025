import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Button,
  CircularProgress,
  List,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import {
  Psychology,
  LocalHospital,
  Emergency,
  Assignment,
  Timeline,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  ExpandMore,
  Refresh,
} from '@mui/icons-material'
import { useStrokeAnalysis } from '../hooks/useStrokeAnalysis'

interface AgentStatusProps {
  autoRefresh?: boolean
  refreshInterval?: number
}

const AgentStatus: React.FC<AgentStatusProps> = ({ 
  autoRefresh = true, 
  refreshInterval = 30000 
}) => {
  const [systemStatus, setSystemStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const { getSystemStatus } = useStrokeAnalysis()

  const fetchSystemStatus = async () => {
    setLoading(true)
    try {
      const status = await getSystemStatus()
      setSystemStatus(status)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to fetch system status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSystemStatus()

    if (autoRefresh) {
      const interval = setInterval(fetchSystemStatus, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'operational':
        return 'success'
      case 'warning':
        return 'warning'
      case 'error':
      case 'inactive':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'operational':
        return <CheckCircle color="success" />
      case 'warning':
        return <Warning color="warning" />
      case 'error':
      case 'inactive':
        return <ErrorIcon color="error" />
      default:
        return <Psychology />
    }
  }

  const agentIcons = {
    symptom_agent: <Psychology />,
    triage_agent: <LocalHospital />,
    alert_agent: <Emergency />,
    care_agent: <Assignment />,
    followup_agent: <Timeline />
  }

  const agentDescriptions = {
    symptom_agent: 'Analyzes patient symptoms using NLP and pattern recognition',
    triage_agent: 'Performs FAST assessment and risk scoring',
    alert_agent: 'Coordinates emergency response and dispatch',
    care_agent: 'Provides immediate care instructions and guidance',
    followup_agent: 'Logs events and generates reports for continuity'
  }

  if (!systemStatus && loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading system status...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Multi-Agent System Status
        </Typography>
        <Button
          variant="outlined"
          startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
          onClick={fetchSystemStatus}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {systemStatus && (
        <>
          {/* System Overview */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {getStatusIcon(systemStatus.system_status)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  System Status: {systemStatus.system_status?.toUpperCase()}
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Average Response Time
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {systemStatus.performance_metrics?.average_response_time || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Success Rate
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {systemStatus.performance_metrics?.success_rate || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    System Uptime
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {systemStatus.performance_metrics?.uptime || 'N/A'}
                  </Typography>
                </Box>
              </Box>

              {lastUpdate && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Last updated: {lastUpdate.toLocaleString()}
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Agent Status */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Individual Agent Status
              </Typography>

              <List>
                {Object.entries(systemStatus.agents || {}).map(([agentName, agentData]: [string, any]) => (
                  <Accordion key={agentName}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <Box sx={{ mr: 2 }}>
                          {agentIcons[agentName as keyof typeof agentIcons] || <Psychology />}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1">
                            {agentName.replace('_', ' ').toUpperCase()}
                          </Typography>
                        </Box>
                        <Chip
                          label={agentData.status?.toUpperCase() || 'UNKNOWN'}
                          color={getStatusColor(agentData.status) as any}
                          size="small"
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {agentDescriptions[agentName as keyof typeof agentDescriptions] || 
                         'Specialized agent for stroke detection workflow'}
                      </Typography>
                      
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Status
                          </Typography>
                          <Typography variant="body1">
                            {agentData.status?.toUpperCase() || 'UNKNOWN'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Last Update
                          </Typography>
                          <Typography variant="body1">
                            {agentData.last_update ? 
                              new Date(agentData.last_update).toLocaleString() : 
                              'Never'
                            }
                          </Typography>
                        </Box>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </List>
            </CardContent>
          </Card>
        </>
      )}

      {!systemStatus && !loading && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Warning color="warning" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Unable to Connect to Agent System
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              The multi-agent stroke detection system is currently unavailable.
              This could be due to network issues or the backend service being offline.
            </Typography>
            <Button
              variant="contained"
              onClick={fetchSystemStatus}
              startIcon={<Refresh />}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default AgentStatus