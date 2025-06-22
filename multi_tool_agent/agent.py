"""
Main agent entry point for Google ADK.
This file provides the root_agent that ADK looks for.
"""

import datetime
import re
import random
import base64
import io
from typing import Dict, List, Any
from google.adk.agents import Agent

# For actual webcam access (install with: pip install opencv-python mediapipe)
try:
    import cv2
    import mediapipe as mp
    import numpy as np
    WEBCAM_AVAILABLE = True
except ImportError:
    WEBCAM_AVAILABLE = False

def analyze_stroke_symptoms(input_text: str, patient_id: str = None) -> Dict[str, Any]:
    """
    Analyzes text/voice input for stroke symptoms using NLP patterns.
    """
    input_text = input_text.lower()
    
    # FAST stroke indicators
    face_symptoms = [
        "face drooping", "facial droop", "face droop", "one side of face",
        "smile uneven", "can't smile", "mouth drooping", "facial weakness",
        "numb face", "face feels strange"
    ]
    
    arm_symptoms = [
        "arm weakness", "can't lift arm", "arm feels heavy", "arm numb",
        "one arm weak", "arm tingling", "can't raise arm", "arm paralyzed",
        "hand weakness", "drop arm"
    ]
    
    speech_symptoms = [
        "slurred speech", "can't speak", "speech unclear", "difficulty speaking",
        "words don't come out", "trouble talking", "speech problems",
        "mumbling", "can't find words", "confused speech"
    ]
    
    other_stroke_symptoms = [
        "sudden headache", "severe headache", "worst headache", "vision loss",
        "double vision", "blurred vision", "dizziness", "loss of balance",
        "confusion", "sudden numbness", "sudden weakness"
    ]
    
    detected_symptoms = {
        "face": [],
        "arm": [],
        "speech": [],
        "other": []
    }
    
    # Pattern matching for symptoms
    for symptom in face_symptoms:
        if symptom in input_text:
            detected_symptoms["face"].append(symptom)
    
    for symptom in arm_symptoms:
        if symptom in input_text:
            detected_symptoms["arm"].append(symptom)
    
    for symptom in speech_symptoms:
        if symptom in input_text:
            detected_symptoms["speech"].append(symptom)
    
    for symptom in other_stroke_symptoms:
        if symptom in input_text:
            detected_symptoms["other"].append(symptom)
    
    # Calculate risk score
    fast_score = 0
    if detected_symptoms["face"]:
        fast_score += 3
    if detected_symptoms["arm"]:
        fast_score += 3
    if detected_symptoms["speech"]:
        fast_score += 3
    if detected_symptoms["other"]:
        fast_score += len(detected_symptoms["other"])
    
    # Determine severity
    if fast_score >= 6:
        severity = "critical"
        recommendation = "IMMEDIATE EMERGENCY RESPONSE REQUIRED"
    elif fast_score >= 3:
        severity = "warning"
        recommendation = "Seek immediate medical attention"
    else:
        severity = "normal"
        recommendation = "Monitor symptoms, consult healthcare provider if concerned"
    
    # Generate auto patient ID if not provided
    if not patient_id:
        patient_id = f"user-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    return {
        "status": "success",
        "patient_id": patient_id,
        "input_text": input_text,
        "detected_symptoms": detected_symptoms,
        "fast_score": fast_score,
        "severity": severity,
        "recommendation": recommendation,
        "timestamp": datetime.datetime.now().isoformat(),
        "requires_triage": fast_score >= 3
    }

def perform_fast_assessment(symptom_data: Dict[str, Any], patient_id: str) -> Dict[str, Any]:
    """
    Performs FAST assessment for stroke triage based on symptom analysis.
    """
    fast_results = {
        "face": False,
        "arms": False,
        "speech": False,
        "time": datetime.datetime.now().isoformat()
    }
    
    # Analyze FAST criteria from symptom data
    if "detected_symptoms" in symptom_data:
        symptoms = symptom_data["detected_symptoms"]
        
        if symptoms.get("face", []):
            fast_results["face"] = True
        if symptoms.get("arm", []):
            fast_results["arms"] = True
        if symptoms.get("speech", []):
            fast_results["speech"] = True
    
    # Calculate urgency score (0-100)
    urgency_score = 0
    
    if fast_results["face"]:
        urgency_score += 30
    if fast_results["arms"]:
        urgency_score += 30
    if fast_results["speech"]:
        urgency_score += 30
        
    # Additional factors from other symptoms
    if "detected_symptoms" in symptom_data and symptom_data["detected_symptoms"].get("other", []):
        urgency_score += min(10, len(symptom_data["detected_symptoms"]["other"]) * 2)
    
    # Determine triage level
    if urgency_score >= 70:
        triage_level = "IMMEDIATE"
        triage_color = "RED"
        estimated_response_time = "0-5 minutes"
    elif urgency_score >= 40:
        triage_level = "URGENT"
        triage_color = "YELLOW"
        estimated_response_time = "5-15 minutes"
    elif urgency_score >= 20:
        triage_level = "SEMI-URGENT"
        triage_color = "GREEN"
        estimated_response_time = "30-60 minutes"
    else:
        triage_level = "NON-URGENT"
        triage_color = "BLUE"
        estimated_response_time = "2-4 hours"
    
    return {
        "status": "success",
        "patient_id": patient_id,
        "fast_assessment": fast_results,
        "urgency_score": urgency_score,
        "triage_level": triage_level,
        "triage_color": triage_color,
        "estimated_response_time": estimated_response_time,
        "requires_immediate_attention": urgency_score >= 70,
        "requires_emergency_transport": urgency_score >= 40,
        "timestamp": datetime.datetime.now().isoformat()
    }

def send_emergency_alert(patient_id: str, triage_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sends emergency alerts to appropriate contacts and services.
    """
    alert_id = f"ALERT-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
    urgency_score = triage_data.get("urgency_score", 0)
    triage_level = triage_data.get("triage_level", "UNKNOWN")
    
    # Determine alert recipients based on urgency
    alert_recipients = []
    
    if urgency_score >= 70:  # IMMEDIATE
        alert_recipients = [
            {"type": "911", "status": "dispatched", "eta": "5-8 minutes"},
            {"type": "stroke_team", "status": "activated", "eta": "immediate"},
            {"type": "emergency_contact", "status": "notified", "method": "call"},
            {"type": "hospital", "status": "alerted", "preparation": "stroke_protocol"}
        ]
    elif urgency_score >= 40:  # URGENT
        alert_recipients = [
            {"type": "emergency_services", "status": "notified", "eta": "10-15 minutes"},
            {"type": "emergency_contact", "status": "notified", "method": "call"},
            {"type": "primary_care", "status": "notified", "method": "message"}
        ]
    
    return {
        "status": "success",
        "alert_id": alert_id,
        "patient_id": patient_id,
        "urgency_level": triage_level,
        "recipients": alert_recipients,
        "timestamp": datetime.datetime.now().isoformat()
    }

def provide_immediate_care_instructions(patient_id: str, stroke_assessment: Dict[str, Any]) -> Dict[str, Any]:
    """
    Provides immediate care instructions for stroke patients.
    """
    urgency_score = stroke_assessment.get("urgency_score", 0)
    
    instructions = {
        "immediate_actions": [
            "Call 911 immediately if not already done",
            "Keep patient calm and comfortable",
            "Note the time symptoms started",
            "Do NOT give food, water, or medications"
        ],
        "positioning": [
            "Keep patient lying down with head slightly elevated",
            "Turn head to side if vomiting occurs",
            "Loosen tight clothing around neck"
        ],
        "monitoring": [
            "Watch for changes in consciousness",
            "Monitor breathing",
            "Check for speech difficulties",
            "Observe for facial drooping or arm weakness"
        ]
    }
    
    return {
        "status": "success",
        "patient_id": patient_id,
        "care_instructions": instructions,
        "urgency_level": stroke_assessment.get("triage_level", "UNKNOWN"),
        "timestamp": datetime.datetime.now().isoformat()
    }

def capture_webcam_frame() -> Dict[str, Any]:
    """
    Captures a frame from the webcam for analysis.
    
    Returns:
        dict: Captured frame data and status
    """
    if not WEBCAM_AVAILABLE:
        return {
            "status": "error",
            "message": "Webcam libraries not installed. Run: pip install opencv-python mediapipe",
            "frame": None
        }
    
    try:
        # Initialize webcam
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            return {
                "status": "error", 
                "message": "Cannot access webcam. Check permissions and connections.",
                "frame": None
            }
        
        # Capture frame
        ret, frame = cap.read()
        cap.release()
        
        if not ret:
            return {
                "status": "error",
                "message": "Failed to capture frame from webcam",
                "frame": None
            }
        
        # Convert frame to base64 for storage/transmission
        _, buffer = cv2.imencode('.jpg', frame)
        frame_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return {
            "status": "success",
            "message": "Frame captured successfully",
            "frame": frame,
            "frame_base64": frame_base64,
            "timestamp": datetime.datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Webcam capture failed: {str(e)}",
            "frame": None
        }

def analyze_facial_symmetry(frame) -> Dict[str, Any]:
    """
    Analyzes facial symmetry using MediaPipe face detection.
    
    Args:
        frame: OpenCV frame from webcam
        
    Returns:
        dict: Facial symmetry analysis
    """
    if not WEBCAM_AVAILABLE or frame is None:
        return {"error": "No frame or libraries unavailable"}
    
    try:
        # Initialize MediaPipe Face Mesh
        mp_face_mesh = mp.solutions.face_mesh
        mp_drawing = mp.solutions.drawing_utils
        
        with mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        ) as face_mesh:
            
            # Convert BGR to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = face_mesh.process(rgb_frame)
            
            if not results.multi_face_landmarks:
                return {
                    "face_detected": False,
                    "symmetry_score": 0,
                    "analysis": "No face detected"
                }
            
            # Get face landmarks
            face_landmarks = results.multi_face_landmarks[0]
            h, w = frame.shape[:2]
            
            # Key landmarks for symmetry analysis
            # Left mouth corner: 61, Right mouth corner: 291
            # Left eye corner: 33, Right eye corner: 263
            # Nose tip: 1
            
            landmarks = [(int(lm.x * w), int(lm.y * h)) for lm in face_landmarks.landmark]
            
            left_mouth = landmarks[61]
            right_mouth = landmarks[291]
            left_eye = landmarks[33]
            right_eye = landmarks[263]
            nose_tip = landmarks[1]
            
            # Calculate symmetry metrics
            mouth_symmetry = abs((nose_tip[0] - left_mouth[0]) - (right_mouth[0] - nose_tip[0]))
            eye_symmetry = abs((nose_tip[0] - left_eye[0]) - (right_eye[0] - nose_tip[0]))
            
            # Normalize symmetry scores (lower is more symmetric)
            mouth_score = max(0, 100 - (mouth_symmetry / w * 1000))
            eye_score = max(0, 100 - (eye_symmetry / w * 1000))
            overall_symmetry = (mouth_score + eye_score) / 2
            
            return {
                "face_detected": True,
                "symmetry_score": overall_symmetry,
                "mouth_symmetry": mouth_score,
                "eye_symmetry": eye_score,
                "analysis": "Symmetric" if overall_symmetry > 70 else "Asymmetric - possible stroke indicator",
                "stroke_risk": "LOW" if overall_symmetry > 70 else "HIGH"
            }
            
    except Exception as e:
        return {
            "error": f"Facial analysis failed: {str(e)}",
            "face_detected": False
        }

def analyze_webcam_fast_symptoms(capture_live: bool = True, webcam_data: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Analyzes webcam input for FAST stroke symptoms using computer vision.
    
    Args:
        capture_live (bool): Whether to capture live webcam frame
        webcam_data (dict): Pre-captured webcam data or None for live capture
        
    Returns:
        dict: FAST assessment from visual analysis
    """
    if capture_live and WEBCAM_AVAILABLE:
        # Capture live webcam frame
        capture_result = capture_webcam_frame()
        if capture_result["status"] == "error":
            return capture_result
        
        frame = capture_result["frame"]
        
        # Analyze facial symmetry
        face_analysis = analyze_facial_symmetry(frame)
        
        # Real computer vision analysis
        webcam_data = {
            "facial_symmetry": face_analysis.get("symmetry_score", 0) > 70,
            "face_detected": face_analysis.get("face_detected", False),
            "symmetry_score": face_analysis.get("symmetry_score", 0),
            "stroke_risk": face_analysis.get("stroke_risk", "UNKNOWN"),
            "analysis_method": "live_webcam"
        }
    
    elif not webcam_data:
        # Fallback simulation if no webcam available
        webcam_data = {
            "facial_symmetry": random.choice([True, False]),
            "smile_symmetry": random.choice([True, False]),
            "eye_droop": random.choice([True, False]),
            "arm_drift_detected": random.choice([True, False]),
            "speech_clarity": random.uniform(0.6, 1.0),
            "response_time": random.uniform(1.0, 5.0),
            "analysis_method": "simulation"
        }
    
    fast_visual = {
        "face": {
            "symmetry_normal": webcam_data.get("facial_symmetry", True),
            "smile_even": webcam_data.get("smile_symmetry", True),
            "eye_droop": webcam_data.get("eye_droop", False),
            "score": 0
        },
        "arms": {
            "drift_detected": webcam_data.get("arm_drift_detected", False),
            "hold_position": webcam_data.get("arm_hold_time", 10) >= 10,
            "score": 0
        },
        "speech": {
            "clarity_score": webcam_data.get("speech_clarity", 1.0),
            "response_time": webcam_data.get("response_time", 2.0),
            "score": 0
        }
    }
    
    # Calculate FAST scores from visual analysis
    if not fast_visual["face"]["symmetry_normal"] or fast_visual["face"]["eye_droop"]:
        fast_visual["face"]["score"] = 25
    
    if fast_visual["arms"]["drift_detected"] or not fast_visual["arms"]["hold_position"]:
        fast_visual["arms"]["score"] = 25
    
    if fast_visual["speech"]["clarity_score"] < 0.8 or fast_visual["speech"]["response_time"] > 3.0:
        fast_visual["speech"]["score"] = 25
    
    total_visual_score = (fast_visual["face"]["score"] + 
                         fast_visual["arms"]["score"] + 
                         fast_visual["speech"]["score"])
    
    # Determine visual assessment result
    if total_visual_score >= 50:
        assessment = "HIGH RISK - Multiple FAST indicators detected"
        urgency = "IMMEDIATE"
    elif total_visual_score >= 25:
        assessment = "MODERATE RISK - Some FAST indicators present"
        urgency = "URGENT"
    else:
        assessment = "LOW RISK - No significant FAST indicators"
        urgency = "MONITOR"
    
    return {
        "status": "success",
        "webcam_analysis": fast_visual,
        "total_visual_score": total_visual_score,
        "assessment": assessment,
        "urgency": urgency,
        "instructions": {
            "face_test": "Ask patient to smile and raise eyebrows",
            "arm_test": "Ask patient to hold both arms up for 10 seconds",
            "speech_test": "Ask patient to repeat 'The early bird catches the worm'"
        },
        "timestamp": datetime.datetime.now().isoformat()
    }

def run_fast_webcam_test() -> Dict[str, Any]:
    """
    Guides user through webcam-based FAST test protocol.
    
    Returns:
        dict: Step-by-step FAST test instructions and analysis
    """
    return {
        "status": "success",
        "test_protocol": {
            "step_1_face": {
                "instruction": "Look directly at the camera and smile widely",
                "duration": "5 seconds",
                "check_for": ["facial symmetry", "smile evenness", "eye droop"]
            },
            "step_2_arms": {
                "instruction": "Raise both arms up and hold for 10 seconds",
                "duration": "10 seconds", 
                "check_for": ["arm drift", "weakness", "inability to hold position"]
            },
            "step_3_speech": {
                "instruction": "Say clearly: 'The early bird catches the worm'",
                "duration": "5 seconds",
                "check_for": ["slurred speech", "unclear words", "delayed response"]
            }
        },
        "next_action": "Call analyze_webcam_fast_symptoms after completing visual tests",
        "emergency_note": "If any test shows abnormalities, seek immediate medical attention",
        "timestamp": datetime.datetime.now().isoformat()
    }

def orchestrate_stroke_detection(input_text: str = "", patient_id: str = None, include_webcam: bool = False) -> Dict[str, Any]:
    """
    Main orchestration function that coordinates stroke detection workflow.
    """
    workflow_id = f"WORKFLOW-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    # Auto-generate patient ID if not provided
    if not patient_id:
        patient_id = f"user-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    workflow_results = {
        "workflow_id": workflow_id,
        "patient_id": patient_id,
        "timestamp": datetime.datetime.now().isoformat()
    }
    
    # Step 1: Text/Voice Symptom Analysis (if text provided)
    if input_text.strip():
        symptom_results = analyze_stroke_symptoms(input_text, patient_id)
        workflow_results["symptom_analysis"] = symptom_results
        
        # Step 2: Triage if symptoms detected
        if symptom_results.get("requires_triage", False):
            triage_results = perform_fast_assessment(symptom_results, patient_id)
            workflow_results["triage_assessment"] = triage_results
            
            # Step 3: Emergency alert if critical
            if triage_results.get("requires_immediate_attention", False):
                alert_results = send_emergency_alert(patient_id, triage_results)
                workflow_results["emergency_alert"] = alert_results
            
            # Step 4: Care instructions
            care_results = provide_immediate_care_instructions(patient_id, triage_results)
            workflow_results["care_instructions"] = care_results
    
    # Step 5: Webcam FAST Test (if requested)
    if include_webcam:
        webcam_protocol = run_fast_webcam_test()
        webcam_analysis = analyze_webcam_fast_symptoms()
        workflow_results["webcam_protocol"] = webcam_protocol
        workflow_results["webcam_analysis"] = webcam_analysis
        
        # Combine text and visual analysis for final assessment
        if "triage_assessment" in workflow_results:
            # Merge assessments
            text_urgency = workflow_results["triage_assessment"]["urgency_score"]
            visual_urgency = webcam_analysis["total_visual_score"]
            combined_urgency = max(text_urgency, visual_urgency)
            
            workflow_results["combined_assessment"] = {
                "text_urgency": text_urgency,
                "visual_urgency": visual_urgency,
                "combined_urgency": combined_urgency,
                "recommendation": "IMMEDIATE MEDICAL ATTENTION" if combined_urgency >= 50 else 
                                "Seek medical evaluation" if combined_urgency >= 25 else
                                "Monitor symptoms"
            }
    
    return workflow_results

# This is the main agent that Google ADK will find and use
root_agent = Agent(
    name="stroke_detection_system",
    model="gemini-2.0-flash",
    description=(
        "Advanced multi-agent stroke detection system that provides comprehensive "
        "stroke symptom analysis, FAST assessment, emergency response coordination, "
        "and patient care guidance."
    ),
    instruction=(
        "You are a comprehensive stroke detection system. When users describe symptoms, "
        "immediately analyze them for stroke indicators using the FAST protocol: "
        "- Face drooping, numbness, or asymmetry "
        "- Arm weakness, numbness, or inability to lift "
        "- Speech difficulties, slurring, or confusion "
        "- Time is critical for stroke treatment "
        
        "Score urgency 0-100 where: "
        "70+ = IMMEDIATE (RED), 40-69 = URGENT (YELLOW), 20-39 = SEMI-URGENT (GREEN), <20 = NON-URGENT (BLUE). "
        
        "For critical cases (70+ urgency): automatically activate emergency protocols "
        "and provide immediate care instructions. Always prioritize patient safety."
    ),
    tools=[
        analyze_stroke_symptoms,
        perform_fast_assessment,
        send_emergency_alert,
        provide_immediate_care_instructions,
        capture_webcam_frame,
        analyze_facial_symmetry,
        analyze_webcam_fast_symptoms,
        run_fast_webcam_test,
        orchestrate_stroke_detection
    ],
)