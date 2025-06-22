import { createTheme } from '@mui/material/styles'

export const ictusTheme = createTheme({
  palette: {
    primary: {
      main: '#008080', // Teal
      light: '#4db6b6',
      dark: '#005959',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ffffff', // White
      light: '#ffffff',
      dark: '#f5f5f5',
      contrastText: '#000000',
    },
    background: {
      default: '#ffffff',
      paper: '#f8fffe',
    },
    text: {
      primary: '#000000',
      secondary: '#333333',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#ff9800',
    },
    success: {
      main: '#2e7d32',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      color: '#008080',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#008080',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#000000',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#000000',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#000000',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#000000',
    },
    body1: {
      fontSize: '1rem',
      color: '#333333',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      color: '#333333',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0, 128, 128, 0.3)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 128, 128, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e0e0e0',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#008080',
          boxShadow: '0 2px 8px rgba(0, 128, 128, 0.2)',
        },
      },
    },
  },
})