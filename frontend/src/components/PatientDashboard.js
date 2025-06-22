import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Box,
  CircularProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Favorite,
  Thermostat,
  MonitorHeart,
  Warning,
  Emergency,
  Refresh,
  LocalHospital
} from '@mui/icons-material';
import axios from 'axios';
import VitalChart from './VitalChart';

const PatientDashboard = ({ patient }) => {
  const [patientStatus, setPatientStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (patient) {
      fetchPatientStatus();
      const interval = setInterval(fetchPatientStatus, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [patient]);

  const fetchPatientStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/patients/${patient.id}/status`);
      setPatientStatus(response.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to load patient status');
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyCall = async () => {
    try {
      const response = await axios.post('/api/emergency', {
        patient_id: patient.id,
        condition: 'Manual emergency call from dashboard'
      });
      
      alert(`Emergency services called!\nEmergency ID: ${response.data.emergency_id}\nEstimated response time: ${response.data.response_time}`);
      
      // Refresh patient status to show the emergency response
      fetchPatientStatus();
    } catch (err) {
      alert('Failed to call emergency services');
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <Emergency color="error" />;
      case 'warning': return <Warning color="warning" />;
      default: return <Favorite color="success" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      default: return 'success';
    }
  };

  if (loading && !patientStatus) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !patientStatus) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {patient.name} - Room {patient.room}
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          {lastUpdated && (
            <Typography variant="body2" color="text.secondary">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
          )}
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchPatientStatus}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<Emergency />}
            onClick={handleEmergencyCall}
            className="emergency-button"
          >
            Call 911
          </Button>
        </Box>
      </Box>

      {patientStatus && (
        <>
          {/* Overall Status Card */}
          <Card sx={{ mb: 3, border: patientStatus.overall_severity === 'critical' ? '2px solid #d32f2f' : undefined }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                {getSeverityIcon(patientStatus.overall_severity)}
                <Typography variant="h6">
                  Overall Status: 
                </Typography>
                <Chip 
                  label={patientStatus.overall_severity.toUpperCase()}
                  color={getSeverityColor(patientStatus.overall_severity)}
                  className={patientStatus.overall_severity === 'critical' ? 'emergency-alert' : ''}
                />
              </Box>
              
              {patientStatus.alerts && patientStatus.alerts.length > 0 && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    Active Alerts:
                  </Typography>
                  {patientStatus.alerts.map((alert, index) => (
                    <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                      {alert}
                    </Alert>
                  ))}
                </Box>
              )}

              {patientStatus.emergency_responses && patientStatus.emergency_responses.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    Emergency Responses:
                  </Typography>
                  {patientStatus.emergency_responses.map((emergency, index) => (
                    <Alert key={index} severity="error" sx={{ mb: 1 }}>
                      <strong>Emergency ID:</strong> {emergency.emergency_id}<br />
                      <strong>Status:</strong> {emergency.status}<br />
                      <strong>Response Time:</strong> {emergency.response_time}<br />
                      <strong>Units:</strong> {emergency.dispatched_units.join(', ')}
                    </Alert>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Vital Signs Cards */}
          <Grid container spacing={3}>
            {/* Heart Rate */}
            <Grid item xs={12} md={4}>
              <Card className={`vital-card ${patientStatus.heart_rate.severity}`}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Favorite color={patientStatus.heart_rate.severity === 'critical' ? 'error' : 
                                   patientStatus.heart_rate.severity === 'warning' ? 'warning' : 'success'} />
                    <Typography variant="h6">Heart Rate</Typography>
                  </Box>
                  <Typography variant="h3" component="div" className={`severity-${patientStatus.heart_rate.severity}`}>
                    {patientStatus.heart_rate.heart_rate}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    BPM
                  </Typography>
                  <Chip 
                    label={patientStatus.heart_rate.severity.toUpperCase()}
                    color={getSeverityColor(patientStatus.heart_rate.severity)}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Blood Pressure */}
            <Grid item xs={12} md={4}>
              <Card className={`vital-card ${patientStatus.blood_pressure.severity}`}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <MonitorHeart color={patientStatus.blood_pressure.severity === 'critical' ? 'error' : 
                                        patientStatus.blood_pressure.severity === 'warning' ? 'warning' : 'success'} />
                    <Typography variant="h6">Blood Pressure</Typography>
                  </Box>
                  <Typography variant="h3" component="div" className={`severity-${patientStatus.blood_pressure.severity}`}>
                    {patientStatus.blood_pressure.blood_pressure}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    mmHg
                  </Typography>
                  <Chip 
                    label={patientStatus.blood_pressure.severity.toUpperCase()}
                    color={getSeverityColor(patientStatus.blood_pressure.severity)}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Temperature */}
            <Grid item xs={12} md={4}>
              <Card className={`vital-card ${patientStatus.temperature.severity}`}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Thermostat color={patientStatus.temperature.severity === 'critical' ? 'error' : 
                                     patientStatus.temperature.severity === 'warning' ? 'warning' : 'success'} />
                    <Typography variant="h6">Temperature</Typography>
                  </Box>
                  <Typography variant="h3" component="div" className={`severity-${patientStatus.temperature.severity}`}>
                    {patientStatus.temperature.temperature_f}°F
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ({patientStatus.temperature.temperature_c}°C)
                  </Typography>
                  <Chip 
                    label={patientStatus.temperature.severity.toUpperCase()}
                    color={getSeverityColor(patientStatus.temperature.severity)}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Vital Signs Chart */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Vital Signs Trends
              </Typography>
              <VitalChart patientId={patient.id} />
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default PatientDashboard;