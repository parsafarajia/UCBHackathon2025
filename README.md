### UCBHackathon2025 — Stroke Detection Tool

A multimodal stroke detection tool that guides users through FAST assessment, performs real-time facial droop detection, and coordinates alerts and triage via an agent-based backend with a React frontend.

### Features
- **FAST Assessment**: Structured flow for Face, Arm, Speech, Time checks.
- **Real-time Vision**: Face/landmark detection for facial droop analysis.
- **Conversational Agents**: Symptom intake, triage, care guidance, and alert coordination.
- **Web Frontend**: React-based UI with modular components.
- **Extensible Backends**: Pluggable stroke detection pipelines and agents.

### Project Structure
- `frontend/`: React app (TypeScript) with components like `FASTAssessment.tsx`, `VideoRecognition.tsx`, `StrokeDetectionChatbot.tsx`.
- `facial_droop_model/`: Python scripts for dataset prep, training, and real-time droop detection (`real_time_face_detection.py`, `train_stroke_model.py`).
- `multi_tool_agent/`: Agent orchestration (Python).
- `newfiles/multi_tool_agent/stroke_detection/`: New agentized stroke detection demo with coordinator and agents.

### Architecture
- **Frontend (React)**: UI for FAST, video/voice capture, and chat.
- **CV/ML (Python)**: Facial droop detection and model training scripts.
- **Agent Layer (Python)**: Coordinator orchestrates specialized agents: symptom, triage, care, follow-up, alert.

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ (recommend venv)
- macOS (tested), camera + microphone permissions enabled
- Optional: GPU/accelerators for training

### Quick Start

#### 1) Frontend
```bash
cd /Users/sewonmyung/programming/UCBHackathon2025/frontend
npm install
npm start
```
- App runs at `http://localhost:3000`.

#### 2) Facial Droop Model (Real-time Demo)
```bash
cd /Users/sewonmyung/programming/UCBHackathon2025/facial_droop_model
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python real_time_face_detection.py
```

#### 3) Agent Demo (Coordinator + Agents)
```bash
cd /Users/sewonmyung/programming/UCBHackathon2025/newfiles/multi_tool_agent
python -m venv venv && source venv/bin/activate
pip install -e .
python stroke_detection_demo.py
```

### Key Frontend Components
- `components/FASTAssessment.tsx`: Core FAST workflow.
- `components/EnhancedFASTAssessment.tsx`: Extended evaluation.
- `components/VideoRecognition.tsx` and `components/EnhancedVideoRecognition.tsx`: Camera capture + CV integration.
- `components/StrokeDetectionChatbot.tsx` and `components/FASTChatbot.tsx`: Guided chat for assessment.
- `hooks/useStrokeAnalysis.ts`: Client logic for analysis/API calls.
- `lib/strokeAgentAPI.ts`: Client wrapper for backend interactions.

### CV/ML Pipeline
- `setup_dataset.py`, `analyze_stroke_dataset.py`: Dataset prep and EDA.
- `train_stroke_model.py` / `train_model.py`: Model training.
- `real_time_face_detection.py`: Webcam-based inference and droop estimation.
- `deploy_model.py`: Packaging/deployment utilities.
- You can swap models by updating loaders/inference in `facial_droop_model/`.

### Agent Orchestration
- `newfiles/multi_tool_agent/stroke_detection/coordinator.py`: Orchestrates multi-agent flow.
- Agents in `stroke_detection/agents/`: 
  - `symptom_agent.py`, `triage_agent.py`, `care_agent.py`, `followup_agent.py`, `alert_agent.py`.
- `utils/data_structures.py`: Core types for messages, tasks, and results.

### Environment Variables
Create `.env` files as needed:
- Frontend (`frontend/.env`):
  - `REACT_APP_BACKEND_URL` (if integrating with a running API)
  - `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY` (if using Supabase)
- Python backends:
  - `OPENAI_API_KEY` or provider keys (if LLM-backed)
  - Any alerting integrations (e.g., `TWILIO_*`, `SENDGRID_*`) if used.

### Development Scripts
- Frontend:
  - `npm start`: Dev server
  - `npm test`: Unit tests
  - `npm run build`: Production build
- CV/ML:
  - `python setup_dataset.py`
  - `python train_stroke_model.py`
  - `python real_time_face_detection.py`
- Agents:
  - `python stroke_detection_demo.py`

### API Notes
- Client-side wrapper is in `frontend/src/lib/strokeAgentAPI.ts`.
- If you expose local APIs (e.g., Flask/FastAPI), set `REACT_APP_BACKEND_URL` accordingly and implement endpoints for:
  - `POST /analyze/face` (image/stream analysis)
  - `POST /fast/assess` (FAST questionnaire/session)
  - `POST /agent/route` (coordinator entrypoint)

### Data, Privacy, and Safety
- For demo use only; not a medical device.
- Do not use for diagnosis or emergency response.
- Handle all audio/video data locally where possible; obtain consent before capture.
- Review logging in `facial_droop_model/api.log` and disable PII logging for production.

### Troubleshooting
- Camera/mic blocked: Allow permissions in the browser and macOS System Settings.
- GPU issues: Force CPU inference or update drivers.
- CORS: Configure your backend to allow `http://localhost:3000`.
- Build errors: Clear cache `rm -rf node_modules && npm install`.

### Contributing
- Use feature branches and submit PRs.
- Keep edits focused and well-described.
- Add tests for new logic where possible.

### License
- Specify your license (e.g., MIT) in a `LICENSE` file.

- Implemented a complete, concise `README.md` covering setup, architecture, components, scripts, and safety guidance.
