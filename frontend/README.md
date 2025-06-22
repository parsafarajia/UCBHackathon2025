# ICTUS - AI Stroke Detection System

A React-based frontend for an AI-powered stroke detection system that implements the FAST (Face, Arms, Speech, Time) assessment protocol with video and voice recognition capabilities.

## Features

- **FAST Assessment Interface**: Interactive stroke detection workflow based on medical FAST protocol
- **Video Recognition**: AI-powered facial symmetry and arm movement analysis
- **Voice Recognition**: Speech clarity, fluency, and pronunciation assessment
- **Emergency Response**: Automated 911 calling system with patient data
- **Teal & White Theme**: Clean, medical-focused design with Inter font family
- **Supabase Integration**: Secure API key management for deployment

## Technology Stack

- React 18 with TypeScript
- Material-UI (MUI) for component library
- Supabase for backend services and API key management
- WebRTC for camera and microphone access
- Speech Synthesis API for text-to-speech

## Setup & Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Fallback API Keys (compatible with existing agent setup)
REACT_APP_GOOGLE_API_KEY=your_google_api_key_here
REACT_APP_GOOGLE_GENAI_USE_VERTEXAI=FALSE
```

### 3. Supabase Setup

Create a table in your Supabase database:

```sql
CREATE TABLE api_keys (
  id SERIAL PRIMARY KEY,
  google_api_key TEXT NOT NULL,
  google_genai_use_vertexai BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert your API keys
INSERT INTO api_keys (google_api_key, google_genai_use_vertexai) 
VALUES ('your_google_api_key', FALSE);
```

### 4. Development Server

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Deployment

### Prerequisites

- Supabase project with API keys table configured
- Google API key for AI services
- Hosting platform (Vercel, Netlify, etc.)

### Environment Variables for Production

Set the following environment variables in your deployment platform:

```
REACT_APP_SUPABASE_URL=your_production_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_production_supabase_anon_key
REACT_APP_GOOGLE_API_KEY=your_google_api_key (fallback)
REACT_APP_GOOGLE_GENAI_USE_VERTEXAI=FALSE
```

### Build for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

## Application Structure

```
src/
├── components/
│   ├── FASTAssessment.tsx    # Main FAST protocol interface
│   ├── VideoRecognition.tsx  # Video analysis component
│   ├── VoiceRecognition.tsx  # Voice analysis component
│   └── EmergencyAlert.tsx    # Emergency response system
├── lib/
│   └── supabase.ts          # Supabase configuration and API key management
├── theme/
│   └── theme.ts             # Material-UI theme configuration
└── App.tsx                  # Main application component
```

## Key Features Explained

### FAST Assessment
- **F**ace: Visual assessment for facial drooping
- **A**rms: Arm weakness and coordination testing
- **S**peech: Speech difficulty analysis
- **T**ime: Emergency response timing

### AI Recognition
- **Video Analysis**: Real-time face symmetry and arm movement detection
- **Voice Analysis**: Speech pattern analysis with test phrases
- **Risk Assessment**: Automated scoring with confidence levels

### Emergency System
- **Automatic 911 Calling**: Triggered by AI detection
- **Patient Information**: Integrated medical history
- **Location Services**: GPS-based emergency dispatch
- **Response Tracking**: Real-time emergency unit status

## Browser Requirements

- Modern browser with WebRTC support
- Camera and microphone permissions
- JavaScript enabled
- Minimum screen resolution: 1024x768

## Privacy & Security

- All API keys stored securely in Supabase
- No sensitive data transmitted to client
- Local processing for media streams when possible
- HIPAA-conscious data handling practices

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm run build`
Builds the app for production to the `build` folder

### `npm test`
Launches the test runner in interactive watch mode

## Contributing

This is a hackathon project focused on stroke detection and emergency response. The design prioritizes rapid assessment and clear visual feedback for medical scenarios.