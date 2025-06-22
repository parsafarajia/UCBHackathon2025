import React from 'react'
import { ThemeProvider, CssBaseline, Typography, Box } from '@mui/material'
import { ictusTheme } from './theme/theme'

function AppSimple() {
  return (
    <ThemeProvider theme={ictusTheme}>
      <CssBaseline />
      <Box sx={{ p: 4 }}>
        <Typography variant="h1" color="primary" gutterBottom>
          ICTUS
        </Typography>
        <Typography variant="h4" gutterBottom>
          AI-Powered Stroke Detection System
        </Typography>
        <Typography variant="body1">
          This is a test to ensure the basic app loads correctly.
        </Typography>
      </Box>
    </ThemeProvider>
  )
}

export default AppSimple