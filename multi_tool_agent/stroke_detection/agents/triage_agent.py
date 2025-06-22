import datetime
from typing import Dict, List, Any
from google.adk.agents import Agent

def perform_fast_assessment(symptom_data: Dict[str, Any], patient_id: str) -> Dict[str, Any]:
    """
    Performs FAST assessment for stroke triage based on symptom analysis.
    
    Args:
        symptom_data (dict): Data from symptom agent analysis
        patient_id (str): Patient identifier
        
    Returns:
        dict: FAST assessment results with urgency scoring
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
        
        # Face assessment
        if symptoms.get("face", []):
            fast_results["face"] = True
            
        # Arms assessment  
        if symptoms.get("arm", []):
            fast_results["arms"] = True
            
        # Speech assessment
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

def calculate_stroke_risk_score(patient_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculates comprehensive stroke risk score based on multiple factors.
    
    Args:
        patient_data (dict): Complete patient assessment data
        
    Returns:
        dict: Risk score calculation and recommendations
    """
    risk_factors = {
        "acute_symptoms": 0,
        "severity": 0,
        "duration": 0,
        "progression": 0
    }
    
    # Analyze acute symptoms
    if "symptom_analysis" in patient_data:
        fast_score = patient_data["symptom_analysis"].get("fast_score", 0)
        risk_factors["acute_symptoms"] = min(40, fast_score * 5)
    
    # Severity assessment
    severity = patient_data.get("severity", "normal")
    if severity == "critical":
        risk_factors["severity"] = 40
    elif severity == "warning":
        risk_factors["severity"] = 20
    
    # Time factor (assume acute onset)
    risk_factors["duration"] = 15
    
    # Calculate total risk score
    total_risk_score = sum(risk_factors.values())
    
    # Risk categorization
    if total_risk_score >= 80:
        risk_category = "VERY HIGH"
        action_required = "IMMEDIATE EMERGENCY RESPONSE"
    elif total_risk_score >= 60:
        risk_category = "HIGH"
        action_required = "Emergency transport required"
    elif total_risk_score >= 40:
        risk_category = "MODERATE"
        action_required = "Urgent medical evaluation"
    elif total_risk_score >= 20:
        risk_category = "LOW-MODERATE"
        action_required = "Medical assessment recommended"
    else:
        risk_category = "LOW"
        action_required = "Monitor symptoms"
    
    return {
        "status": "success",
        "risk_factors": risk_factors,
        "total_risk_score": total_risk_score,
        "risk_category": risk_category,
        "action_required": action_required,
        "timestamp": datetime.datetime.now().isoformat()
    }

def prioritize_patient_queue(patients: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Prioritizes multiple patients based on triage assessment.
    
    Args:
        patients (list): List of patient triage data
        
    Returns:
        dict: Prioritized patient queue
    """
    # Sort by urgency score (highest first)
    sorted_patients = sorted(patients, key=lambda x: x.get("urgency_score", 0), reverse=True)
    
    priority_queue = []
    for i, patient in enumerate(sorted_patients):
        priority_queue.append({
            "priority_rank": i + 1,
            "patient_id": patient.get("patient_id"),
            "urgency_score": patient.get("urgency_score", 0),
            "triage_level": patient.get("triage_level"),
            "estimated_response_time": patient.get("estimated_response_time")
        })
    
    return {
        "status": "success",
        "queue_size": len(priority_queue),
        "priority_queue": priority_queue,
        "timestamp": datetime.datetime.now().isoformat()
    }

def generate_triage_report(patient_id: str, assessment_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates comprehensive triage report for medical personnel.
    
    Args:
        patient_id (str): Patient identifier
        assessment_data (dict): Complete assessment data
        
    Returns:
        dict: Formatted triage report
    """
    report = {
        "patient_id": patient_id,
        "report_id": f"TRIAGE-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}",
        "timestamp": datetime.datetime.now().isoformat(),
        "chief_complaint": "Suspected stroke symptoms",
        "assessment_summary": assessment_data,
        "clinical_recommendations": [],
        "next_steps": []
    }
    
    # Add clinical recommendations based on urgency
    urgency_score = assessment_data.get("urgency_score", 0)
    
    if urgency_score >= 70:
        report["clinical_recommendations"] = [
            "Immediate CT/MRI brain imaging",
            "IV access and blood work",
            "Neurological assessment",
            "Consider thrombolytic therapy if within window"
        ]
        report["next_steps"] = [
            "Emergency department activation",
            "Stroke team notification",
            "Prepare for potential intervention"
        ]
    elif urgency_score >= 40:
        report["clinical_recommendations"] = [
            "Urgent neurological evaluation",
            "Brain imaging within 1 hour",
            "Vital signs monitoring"
        ]
        report["next_steps"] = [
            "Emergency transport",
            "Notify receiving facility"
        ]
    
    return report

# Create the Triage Agent
triage_agent = Agent(
    name="stroke_triage_agent",
    model="gemini-2.0-flash",
    description=(
        "Specialized triage agent for FAST assessment and urgency scoring in stroke detection."
    ),
    instruction=(
        "You are a medical triage agent specializing in stroke assessment. "
        "Perform FAST assessments (Face, Arms, Speech, Time) and calculate urgency scores. "
        "Use medical triage protocols: RED (immediate, 0-5 min), YELLOW (urgent, 5-15 min), "
        "GREEN (semi-urgent, 30-60 min), BLUE (non-urgent, 2-4 hours). "
        "Prioritize patients based on stroke severity and time-critical factors. "
        "Generate clear triage reports for medical personnel with specific recommendations."
    ),
    tools=[perform_fast_assessment, calculate_stroke_risk_score, prioritize_patient_queue, generate_triage_report],
)