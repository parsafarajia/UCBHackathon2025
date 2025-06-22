import React, { useState } from 'react'
import {
  ThemeProvider,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Tabs,
  Tab,
  Box,
} from '@mui/material'
import { ictusTheme } from './theme/theme'
import FASTAssessment from './components/FASTAssessment'
import EnhancedFASTAssessment from './components/EnhancedFASTAssessment'
import StrokeChatbot from './components/StrokeChatbot'
import EnhancedVideoRecognition from './components/EnhancedVideoRecognition'
import VoiceRecognition from './components/VoiceRecognition'
import EmergencyAlert from './components/EmergencyAlert'
import AgentStatus from './components/AgentStatus'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

function App() {
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  return (
    <ThemeProvider theme={ictusTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              ICTUS - AI Stroke Detection System
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ mt: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="Ictus navigation tabs">
              <Tab label="FAST Assessment" />
              <Tab label="AI-Enhanced FAST" />
              <Tab label="AI Chatbot" />
              <Tab label="AI-Enhanced Video" />
              <Tab label="Voice Analysis" />
              <Tab label="Emergency" />
              <Tab label="Agent Status" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <FASTAssessment />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <EnhancedFASTAssessment />
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <StrokeChatbot />
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            <EnhancedVideoRecognition />
          </TabPanel>
          
          <TabPanel value={tabValue} index={4}>
            <VoiceRecognition />
          </TabPanel>
          
          <TabPanel value={tabValue} index={5}>
            <EmergencyAlert 
              patientData={{
                name: "John Doe",
                age: 65,
                conditions: ["Hypertension", "Diabetes"]
              }}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={6}>
            <AgentStatus />
          </TabPanel>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App
