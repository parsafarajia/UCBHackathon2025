# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a UCB Hackathon 2025 AI project featuring a Google ADK-based health monitoring agent that detects medical anomalies and automatically calls emergency services.

## Development Environment Setup

### Virtual Environment and Dependencies
```bash
# Create and activate virtual environment
cd multi_tool_agent
python3 -m venv venv
source venv/bin/activate

# Install Google ADK
pip install google-adk
```

### Running the Agent
```bash
# Activate virtual environment and run
source venv/bin/activate
python agent.py
```

## Architecture

### Core Agent Structure
The project uses Google ADK's Agent framework with the following pattern:
- **Tool Functions**: Health monitoring functions that return structured dictionaries
- **Agent Configuration**: Centralized agent with model, description, instructions, and tool array
- **Emergency Response System**: Automatic 911 calling when critical thresholds are exceeded

### Health Monitoring System
The agent implements a three-tier monitoring system:

**Vital Sign Functions:**
- `monitor_heart_rate(patient_id)` - Heart rate monitoring with BPM thresholds
- `monitor_blood_pressure(patient_id)` - Blood pressure monitoring with systolic/diastolic thresholds  
- `monitor_temperature(patient_id)` - Body temperature monitoring in Fahrenheit/Celsius

**Emergency Response:**
- `call_emergency_services(patient_id, condition)` - 911 simulation with dispatch details
- `get_patient_status(patient_id)` - Comprehensive health overview aggregating all vitals

### Critical Thresholds
Health monitoring uses medically-based severity levels:

**Heart Rate:**
- Critical: <50 or >150 BPM
- Warning: <60 or >120 BPM

**Blood Pressure:**
- Critical: Systolic >180 or <90, Diastolic >110
- Warning: Systolic >140, Diastolic >90

**Temperature:**
- Critical: <95�F or >104�F
- Warning: <96�F or >100.4�F

### Data Flow
1. Individual monitoring functions generate simulated vital signs
2. Threshold detection triggers severity classification (normal/warning/critical)
3. Critical conditions automatically invoke emergency services
4. `get_patient_status()` aggregates all vitals and emergency responses
5. Agent returns structured JSON with timestamps, alerts, and emergency details

## Configuration

### Environment Variables
The `.env` file contains:
- `GOOGLE_GENAI_USE_VERTEXAI=FALSE` - Uses Google GenAI API directly
- `GOOGLE_API_KEY` - Authentication for Google's Gemini model

### Agent Configuration
- **Model**: `gemini-2.0-flash`
- **Name**: `health_monitoring_agent`
- **Tools**: All health monitoring and emergency response functions
- **Instructions**: Embedded medical thresholds and safety protocols

## Key Implementation Details

### Emergency Response Simulation
- Generates unique emergency IDs with timestamp format `EMR-YYYYMMDDHHMMSS`
- Returns realistic dispatch information (units, response times)
- Maintains emergency log within patient status reports

### Data Structure Consistency
All monitoring functions return standardized dictionaries with:
- `status`, `patient_id`, `timestamp`
- Vital-specific measurements
- `severity` classification
- Conditional `alert` and `emergency_response` fields

### Testing Patient Scenarios
Use patient IDs like "patient-001" or "patient-123" to simulate different monitoring scenarios. The system generates random but realistic vital signs that may trigger different severity levels.

## Web Application Architecture

### Backend (Flask API)
Located in `/backend/` directory:
- **Framework**: Flask with CORS support
- **API Endpoints**:
  - `GET /api/health` - Health check
  - `GET /api/patients` - List all patients
  - `GET /api/patients/{id}/status` - Complete patient health status
  - `GET /api/patients/{id}/heart-rate` - Heart rate monitoring
  - `GET /api/patients/{id}/blood-pressure` - Blood pressure monitoring
  - `GET /api/patients/{id}/temperature` - Temperature monitoring
  - `POST /api/emergency` - Manual emergency services call
- **Dependencies**: Flask, Flask-CORS, google-adk, gunicorn

### Frontend (React)
Located in `/frontend/` directory:
- **Framework**: React 18 with Material-UI components
- **Key Components**:
  - `PatientList.js` - Patient overview dashboard
  - `PatientDashboard.js` - Individual patient monitoring
  - `VitalChart.js` - Real-time vital signs visualization
- **Features**: Real-time updates, emergency alerts, vital signs charts
- **Dependencies**: React, Material-UI, Recharts, Axios

## Development Commands

### Local Development
```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py

# Frontend
cd frontend
npm install
npm start
```

### Docker Development
```bash
# Build and run with Docker Compose
docker-compose up --build

# Individual containers
docker build -t health-backend ./backend
docker build -t health-frontend ./frontend
```

## Google Cloud Deployment

### App Engine Deployment
```bash
# Deploy backend
cd backend
gcloud app deploy app.yaml

# Deploy frontend (requires separate service)
cd frontend
npm run build
# Manual deployment to Cloud Storage + CDN
```

### Cloud Run Deployment
```bash
# Automated with Cloud Build
gcloud builds submit --config cloudbuild.yaml

# Manual deployment
docker build -t gcr.io/PROJECT_ID/health-backend ./backend
docker push gcr.io/PROJECT_ID/health-backend
gcloud run deploy health-backend --image gcr.io/PROJECT_ID/health-backend --platform managed
```

### Environment Variables for Production
- `GOOGLE_API_KEY` - Google GenAI API key
- `GOOGLE_GENAI_USE_VERTEXAI=FALSE` - Use direct API access
- `PORT` - Application port (default: 8080 for backend, 80 for frontend)

## Key Implementation Details

### Real-time Updates
- Frontend polls backend every 5 seconds for patient status
- Chart data updates every 10 seconds
- Emergency alerts trigger immediate UI updates

### Emergency Response Integration
- Manual 911 calling from dashboard
- Automatic emergency detection from health monitoring agent
- Emergency response logging and tracking

### Security Considerations
- CORS configured for frontend-backend communication
- API key stored as environment variable
- No sensitive data in client-side code