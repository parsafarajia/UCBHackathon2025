import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  Box,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  Favorite,
  Thermostat,
  MonitorHeart,
  LocalHospital,
  Warning,
  Emergency
} from '@mui/icons-material';
import PatientDashboard from './components/PatientDashboard';
import PatientList from './components/PatientList';
import './App.css';

function App() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setSelectedTab(1); // Switch to dashboard tab
  };

  return (
    <div className="App">
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <LocalHospital sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Health Monitoring System
          </Typography>
          <Typography variant="body2">
            Real-time Patient Monitoring
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Patient List" />
            <Tab label="Patient Dashboard" disabled={!selectedPatient} />
          </Tabs>
        </Box>

        {selectedTab === 0 && (
          <PatientList onPatientSelect={handlePatientSelect} />
        )}

        {selectedTab === 1 && selectedPatient && (
          <PatientDashboard patient={selectedPatient} />
        )}
      </Container>
    </div>
  );
}

export default App;