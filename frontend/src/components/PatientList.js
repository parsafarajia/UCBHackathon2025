import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { Person, Room, CalendarToday } from '@mui/icons-material';
import axios from 'axios';

const PatientList = ({ onPatientSelect }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientStatuses, setPatientStatuses] = useState({});

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/api/patients');
      const patientList = response.data.patients;
      setPatients(patientList);
      
      // Fetch status for each patient
      const statusPromises = patientList.map(patient => 
        fetchPatientStatus(patient.id)
      );
      
      await Promise.all(statusPromises);
      setLoading(false);
    } catch (err) {
      setError('Failed to load patients');
      setLoading(false);
    }
  };

  const fetchPatientStatus = async (patientId) => {
    try {
      const response = await axios.get(`/api/patients/${patientId}/status`);
      setPatientStatuses(prev => ({
        ...prev,
        [patientId]: response.data
      }));
    } catch (err) {
      console.error(`Failed to fetch status for patient ${patientId}:`, err);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      default: return 'success';
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 'critical': return 'CRITICAL';
      case 'warning': return 'WARNING';
      default: return 'STABLE';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Patient Monitoring Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {patients.map((patient) => {
          const status = patientStatuses[patient.id];
          const severity = status?.overall_severity || 'normal';
          
          return (
            <Grid item xs={12} sm={6} md={4} key={patient.id}>
              <Card 
                className="patient-card"
                sx={{ 
                  height: '100%',
                  border: severity === 'critical' ? '2px solid #d32f2f' : 
                          severity === 'warning' ? '2px solid #f57c00' : '1px solid #e0e0e0'
                }}
                onClick={() => onPatientSelect(patient)}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" component="h2">
                      {patient.name}
                    </Typography>
                    <Chip 
                      label={getSeverityLabel(severity)}
                      color={getSeverityColor(severity)}
                      size="small"
                      className={severity === 'critical' ? 'emergency-alert' : ''}
                    />
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <Person sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body2" color="text.secondary">
                      ID: {patient.id}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <CalendarToday sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body2" color="text.secondary">
                      Age: {patient.age}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={2}>
                    <Room sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body2" color="text.secondary">
                      Room: {patient.room}
                    </Typography>
                  </Box>

                  {status && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Latest Vitals:
                      </Typography>
                      <Typography variant="body2">
                        HR: {status.heart_rate?.heart_rate} BPM
                      </Typography>
                      <Typography variant="body2">
                        BP: {status.blood_pressure?.blood_pressure} mmHg
                      </Typography>
                      <Typography variant="body2">
                        Temp: {status.temperature?.temperature_f}°F
                      </Typography>
                      
                      {status.alerts && status.alerts.length > 0 && (
                        <Box mt={1}>
                          <Chip 
                            label={`${status.alerts.length} Alert(s)`}
                            color="error"
                            size="small"
                          />
                        </Box>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default PatientList;