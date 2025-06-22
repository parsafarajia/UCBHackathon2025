import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography } from '@mui/material';
import axios from 'axios';

const VitalChart = ({ patientId }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (patientId) {
      generateChartData();
      const interval = setInterval(generateChartData, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [patientId]);

  const generateChartData = async () => {
    try {
      // Generate multiple data points for trend visualization
      const dataPoints = [];
      const now = new Date();
      
      for (let i = 0; i < 10; i++) {
        const timestamp = new Date(now.getTime() - (9 - i) * 60000); // Last 10 minutes
        
        // Fetch fresh data for each point (simulating historical data)
        const [heartRateRes, bloodPressureRes, temperatureRes] = await Promise.all([
          axios.get(`/api/patients/${patientId}/heart-rate`),
          axios.get(`/api/patients/${patientId}/blood-pressure`),
          axios.get(`/api/patients/${patientId}/temperature`)
        ]);

        dataPoints.push({
          time: timestamp.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          heartRate: heartRateRes.data.heart_rate,
          systolic: bloodPressureRes.data.systolic,
          diastolic: bloodPressureRes.data.diastolic,
          temperature: temperatureRes.data.temperature_f
        });
      }
      
      setChartData(dataPoints);
    } catch (error) {
      console.error('Error generating chart data:', error);
    }
  };

  if (chartData.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={300}>
        <Typography>Loading chart data...</Typography>
      </Box>
    );
  }

  return (
    <Box className="vital-chart">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="heartRate" 
            stroke="#e91e63" 
            strokeWidth={2}
            name="Heart Rate (BPM)"
          />
          <Line 
            type="monotone" 
            dataKey="systolic" 
            stroke="#2196f3" 
            strokeWidth={2}
            name="Systolic BP (mmHg)"
          />
          <Line 
            type="monotone" 
            dataKey="diastolic" 
            stroke="#4caf50" 
            strokeWidth={2}
            name="Diastolic BP (mmHg)"
          />
          <Line 
            type="monotone" 
            dataKey="temperature" 
            stroke="#ff9800" 
            strokeWidth={2}
            name="Temperature (°F)"
            yAxisId="right"
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default VitalChart;