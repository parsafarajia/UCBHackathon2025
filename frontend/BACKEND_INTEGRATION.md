# Backend Integration Guide

This guide explains how to integrate the Google ADK multi-agent stroke detection system with the React frontend.

## Architecture Overview

```
Frontend (React) ←→ Backend API (Python/Flask) ←→ Google ADK Agents
     ↓                        ↓                         ↓
  Supabase           Environment Vars            Multi-Agent System
(API Keys)         (Google API Key)           (5 Specialized Agents)
```

## Integration Components

### 1. Frontend Integration Layer

- **`strokeAgentAPI.ts`**: Main API client for communicating with the backend
- **`useStrokeAnalysis.ts`**: React hook for managing stroke analysis state
- **Enhanced Components**: AI-powered versions of FAST assessment and video analysis
- **Agent Status**: Real-time monitoring of the multi-agent system

### 2. Multi-Agent System (from newfiles/)

The backend consists of 5 specialized agents:

1. **Symptom Agent**: NLP analysis of patient symptoms
2. **Triage Agent**: FAST assessment and risk scoring  
3. **Alert Agent**: Emergency response coordination
4. **Care Agent**: Immediate care instructions
5. **Follow-up Agent**: Event logging and reporting

### 3. Coordinator System

- **`coordinator.py`**: Orchestrates workflow across all agents
- **Workflow Management**: Handles agent sequencing and data flow
- **Batch Processing**: Supports multiple patient assessments
- **Performance Monitoring**: System health and metrics

## Deployment Steps

### Step 1: Backend API Server

Create a Flask API server to expose the agent functionality:

```python
# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add the stroke detection system to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'newfiles', 'multi_tool_agent'))

from stroke_detection.coordinator import orchestrate_stroke_detection, get_system_status

app = Flask(__name__)
CORS(app)

@app.route('/api/analyze', methods=['POST'])
def analyze_stroke():
    data = request.json
    patient_id = data.get('patient_id')
    input_data = {
        'text': data.get('text'),
        'voice_text': data.get('voice_text'), 
        'input_type': data.get('input_type', 'text'),
        'location': data.get('location', {})
    }
    
    try:
        result = orchestrate_stroke_detection(patient_id, input_data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/status', methods=['GET'])
def system_status():
    try:
        status = get_system_status()
        return jsonify(status)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
```

### Step 2: Environment Configuration

Update your environment variables:

```bash
# Backend Environment
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_GENAI_USE_VERTEXAI=FALSE
FLASK_ENV=production
PORT=8080

# Frontend Environment  
REACT_APP_STROKE_AGENT_URL=http://localhost:8080
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 3: Install Dependencies

```bash
# Backend dependencies
cd backend
pip install flask flask-cors google-adk python-dotenv

# Frontend dependencies (already installed)
cd ../frontend
npm install
```

### Step 4: Run the Integrated System

```bash
# Terminal 1: Start backend
cd backend
python app.py

# Terminal 2: Start frontend  
cd frontend
npm start
```

## API Endpoints

### POST /api/analyze
Analyzes patient symptoms using the multi-agent system.

**Request:**
```json
{
  "patient_id": "patient-123",
  "text": "I can't lift my right arm and my speech is slurred",
  "input_type": "text",
  "location": {
    "address": "123 Main St",
    "coordinates": {"lat": 40.7128, "lng": -74.0060}
  }
}
```

**Response:**
```json
{
  "workflow_id": "WORKFLOW-20231220154532",
  "patient_id": "patient-123",
  "status": "completed",
  "agents_executed": ["symptom_agent", "triage_agent", "alert_agent", "care_agent", "followup_agent"],
  "total_duration_seconds": 4.2,
  "results": {
    "symptom_analysis": {
      "fast_score": 66,
      "severity": "critical",
      "detected_symptoms": {
        "face": [],
        "arm": ["can't lift arm", "arm weakness"],
        "speech": ["speech slurred"],
        "other": []
      },
      "requires_triage": true
    },
    "triage_assessment": {
      "urgency_score": 85,
      "triage_level": "RED",
      "estimated_response_time": "< 5 minutes",
      "requires_immediate_attention": true
    },
    "emergency_alert": {
      "alert_id": "ALERT-20231220154535",
      "alert_sent": true,
      "estimated_response_time": "4-6 minutes"
    }
  },
  "summary": {
    "stroke_symptoms_detected": true,
    "fast_score": 66,
    "requires_emergency": true,
    "actions_taken": ["Emergency services alerted", "Care instructions provided"]
  }
}
```

### GET /api/status
Returns current system status and agent health.

**Response:**
```json
{
  "system_status": "operational",
  "agents": {
    "symptom_agent": {"status": "active", "last_update": "2023-12-20T15:45:32Z"},
    "triage_agent": {"status": "active", "last_update": "2023-12-20T15:45:32Z"},
    "alert_agent": {"status": "active", "last_update": "2023-12-20T15:45:32Z"},
    "care_agent": {"status": "active", "last_update": "2023-12-20T15:45:32Z"},
    "followup_agent": {"status": "active", "last_update": "2023-12-20T15:45:32Z"}
  },
  "performance_metrics": {
    "average_response_time": "4.2 seconds",
    "success_rate": "98.7%",
    "uptime": "99.9%"
  }
}
```

## Frontend Integration Points

### Enhanced FAST Assessment
- **Location**: `src/components/EnhancedFASTAssessment.tsx`
- **Features**: 
  - Symptom text input for AI analysis
  - Real-time agent workflow visualization
  - Emergency response integration
  - FAST score calculation with confidence levels

### Enhanced Video Recognition  
- **Location**: `src/components/EnhancedVideoRecognition.tsx`
- **Features**:
  - Video recording with facial/arm analysis
  - Integration with symptom analysis agents
  - Emergency dispatch for critical findings
  - Multi-modal analysis combining video + text

### Agent Status Dashboard
- **Location**: `src/components/AgentStatus.tsx`
- **Features**:
  - Real-time system health monitoring
  - Individual agent status tracking
  - Performance metrics display
  - Auto-refresh capabilities

## Production Deployment

### Docker Configuration

```dockerfile
# Dockerfile.backend
FROM python:3.9-slim

WORKDIR /app
COPY backend/ ./backend/
COPY newfiles/ ./newfiles/

RUN pip install -r backend/requirements.txt

EXPOSE 8080
CMD ["python", "backend/app.py"]
```

```dockerfile
# Dockerfile.frontend  
FROM node:18-alpine

WORKDIR /app
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
EXPOSE 80
```

### Docker Compose

```yaml
version: '3.8'
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "8080:8080"
    environment:
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - GOOGLE_GENAI_USE_VERTEXAI=FALSE
    
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    environment:
      - REACT_APP_STROKE_AGENT_URL=http://backend:8080
    depends_on:
      - backend
```

### Cloud Deployment (Google Cloud)

```bash
# Deploy backend to Cloud Run
gcloud run deploy stroke-backend \
  --source ./backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars GOOGLE_API_KEY=${GOOGLE_API_KEY}

# Deploy frontend to Cloud Storage + CDN
npm run build
gsutil rsync -r -d build/ gs://stroke-detection-frontend/
```

## Testing the Integration

### Unit Tests
```bash
# Backend tests
cd backend
python -m pytest tests/

# Frontend tests  
cd frontend
npm test
```

### Integration Tests
```bash
# Test full workflow
curl -X POST http://localhost:8080/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "test-patient",
    "text": "I have facial drooping and arm weakness",
    "input_type": "text"
  }'
```

## Monitoring and Observability

### Logging
- Backend: Python logging with structured JSON output
- Frontend: Browser console + error tracking service
- Agents: Individual agent execution logs

### Metrics
- Response times for each agent
- Success/failure rates by agent type
- Emergency alert frequency and response times
- System resource utilization

### Alerting
- Agent failures or degraded performance
- High emergency alert volumes
- System resource exhaustion
- API endpoint failures

## Security Considerations

### API Security
- Rate limiting on analysis endpoints
- Input validation and sanitization
- CORS configuration for frontend origins
- API key rotation and secret management

### Data Privacy
- Patient data encryption in transit
- Minimal data retention policies
- Anonymization of non-critical data
- HIPAA compliance considerations

### Agent Security
- Secure communication between agents
- Input validation for all agent functions
- Error handling without data exposure
- Audit logging for emergency responses

This integration provides a complete, production-ready stroke detection system combining the power of Google ADK multi-agent architecture with a modern React frontend.