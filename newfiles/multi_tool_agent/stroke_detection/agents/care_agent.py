import datetime
from typing import Dict, List, Any
from google.adk.agents import Agent

def provide_immediate_care_instructions(patient_id: str, stroke_assessment: Dict[str, Any]) -> Dict[str, Any]:
    """
    Provides immediate care instructions for stroke patients.
    
    Args:
        patient_id (str): Patient identifier
        stroke_assessment (dict): Current stroke assessment data
        
    Returns:
        dict: Immediate care instructions and guidance
    """
    urgency_score = stroke_assessment.get("urgency_score", 0)
    fast_assessment = stroke_assessment.get("fast_assessment", {})
    
    # Base emergency instructions
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
        ],
        "do_not_do": [
            "Do not give aspirin or other medications",
            "Do not give food or water",
            "Do not leave patient alone",
            "Do not allow patient to drive"
        ]
    }
    
    # Add specific instructions based on FAST findings
    if fast_assessment.get("face", False):
        instructions["face_care"] = [
            "Support affected side of face if drooping",
            "Clear any saliva from mouth",
            "Speak clearly and slowly to patient"
        ]
    
    if fast_assessment.get("arms", False):
        instructions["arm_care"] = [
            "Support weakened arm with pillow",
            "Do not force movement of affected limb",
            "Protect arm from injury"
        ]
    
    if fast_assessment.get("speech", False):
        instructions["communication"] = [
            "Be patient with speech difficulties",
            "Use yes/no questions",
            "Give patient time to respond",
            "Speak slowly and clearly"
        ]
    
    # Urgency-specific instructions
    if urgency_score >= 70:
        instructions["critical_care"] = [
            "Prepare for immediate transport",
            "Gather all medications patient is taking",
            "Have insurance information ready",
            "Designate someone to accompany patient"
        ]
    
    return {
        "status": "success",
        "patient_id": patient_id,
        "care_instructions": instructions,
        "urgency_level": stroke_assessment.get("triage_level", "UNKNOWN"),
        "timestamp": datetime.datetime.now().isoformat()
    }

def guide_family_support(patient_id: str, situation_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Provides guidance for family members and caregivers.
    
    Args:
        patient_id (str): Patient identifier
        situation_data (dict): Current situation assessment
        
    Returns:
        dict: Family support guidance and resources
    """
    guidance = {
        "emotional_support": {
            "for_patient": [
                "Remain calm and reassuring",
                "Hold patient's hand for comfort",
                "Speak in normal, calm voice",
                "Tell patient help is on the way"
            ],
            "for_family": [
                "Stay calm to help the patient stay calm",
                "Take turns monitoring patient",
                "Designate one person to communicate with emergency services",
                "Gather important medical information"
            ]
        },
        "information_gathering": [
            "List of current medications",
            "Known allergies",
            "Medical history and conditions",
            "Recent changes in health",
            "Time symptoms first appeared"
        ],
        "logistics": [
            "Identify who will accompany patient to hospital",
            "Arrange care for other family members/pets",
            "Gather insurance cards and ID",
            "Notify other family members as appropriate"
        ],
        "hospital_preparation": [
            "Pack small bag with essentials",
            "Bring list of emergency contacts",
            "Prepare questions for medical team",
            "Understand visiting policies"
        ]
    }
    
    # Add specific guidance based on severity
    urgency_score = situation_data.get("urgency_score", 0)
    
    if urgency_score >= 70:
        guidance["critical_situation"] = [
            "Time is critical - stroke treatment works best within first hours",
            "Hospital may need to act quickly",
            "Be prepared for rapid medical decisions",
            "Consider notifying other family members immediately"
        ]
    
    return {
        "status": "success",
        "patient_id": patient_id,
        "family_guidance": guidance,
        "resources": {
            "stroke_hotline": "1-888-4-STROKE",
            "american_stroke_association": "stroke.org",
            "local_support_groups": "Contact hospital social services"
        },
        "timestamp": datetime.datetime.now().isoformat()
    }

def monitor_patient_status(patient_id: str, baseline_assessment: Dict[str, Any]) -> Dict[str, Any]:
    """
    Provides ongoing monitoring instructions for patient status.
    
    Args:
        patient_id (str): Patient identifier
        baseline_assessment (dict): Initial stroke assessment
        
    Returns:
        dict: Monitoring checklist and warning signs
    """
    monitoring_protocol = {
        "vital_signs": {
            "consciousness": {
                "check_every": "2-3 minutes",
                "normal": "Patient responds to voice and touch",
                "warning": "Decreased responsiveness or confusion",
                "critical": "Unconscious or unresponsive"
            },
            "breathing": {
                "check_every": "1-2 minutes",
                "normal": "Regular, unlabored breathing",
                "warning": "Irregular or difficult breathing",
                "critical": "Stopped breathing or gasping"
            },
            "pulse": {
                "check_every": "5 minutes",
                "normal": "Regular pulse at wrist or neck",
                "warning": "Very fast or very slow pulse",
                "critical": "No pulse found"
            }
        },
        "neurological_signs": {
            "speech": {
                "test": "Ask patient to repeat simple phrase",
                "warning_signs": [
                    "Increased slurring",
                    "Unable to speak",
                    "Nonsensical words"
                ]
            },
            "movement": {
                "test": "Ask patient to squeeze hands, move feet",
                "warning_signs": [
                    "New weakness",
                    "Loss of movement",
                    "Increased numbness"
                ]
            },
            "facial_expression": {
                "test": "Ask patient to smile",
                "warning_signs": [
                    "Increased drooping",
                    "Unable to close eye",
                    "Difficulty swallowing"
                ]
            }
        },
        "deterioration_signs": [
            "Sudden severe headache",
            "Vomiting",
            "Seizure activity",
            "Loss of consciousness",
            "Difficulty breathing",
            "Worsening of any stroke symptoms"
        ]
    }
    
    return {
        "status": "success",
        "patient_id": patient_id,
        "monitoring_protocol": monitoring_protocol,
        "emergency_action": "Call 911 immediately if any deterioration signs appear",
        "baseline_time": datetime.datetime.now().isoformat(),
        "next_assessment": (datetime.datetime.now() + datetime.timedelta(minutes=5)).isoformat()
    }

def provide_comfort_measures(patient_id: str, patient_condition: Dict[str, Any]) -> Dict[str, Any]:
    """
    Provides comfort and supportive care measures for stroke patients.
    
    Args:
        patient_id (str): Patient identifier
        patient_condition (dict): Current patient condition data
        
    Returns:
        dict: Comfort care instructions and measures
    """
    comfort_measures = {
        "physical_comfort": {
            "positioning": [
                "Use pillows to support affected side",
                "Keep head elevated 15-30 degrees",
                "Turn patient every 30 minutes if conscious",
                "Protect affected limbs from pressure"
            ],
            "temperature": [
                "Maintain normal body temperature",
                "Remove excess clothing if warm",
                "Use light blanket if cool",
                "Monitor for fever"
            ],
            "hygiene": [
                "Keep mouth clean and moist",
                "Wipe face gently with damp cloth",
                "Clear any secretions from mouth",
                "Keep patient clean and dry"
            ]
        },
        "emotional_comfort": {
            "communication": [
                "Talk to patient even if they can't respond",
                "Explain what you're doing",
                "Provide reassurance frequently",
                "Play calming music if appropriate"
            ],
            "presence": [
                "Stay with patient if possible",
                "Hold their hand for comfort",
                "Maintain calm, peaceful environment",
                "Dim lights if patient is sensitive"
            ]
        },
        "safety_measures": [
            "Remove dentures if present",
            "Clear area of obstacles",
            "Have suction available if needed",
            "Keep emergency numbers handy"
        ]
    }
    
    # Adapt comfort measures based on specific symptoms
    fast_assessment = patient_condition.get("fast_assessment", {})
    
    if fast_assessment.get("speech", False):
        comfort_measures["communication_adaptations"] = [
            "Use simple yes/no questions",
            "Allow extra time for responses",
            "Use gestures and visual cues",
            "Be patient with communication attempts"
        ]
    
    return {
        "status": "success",
        "patient_id": patient_id,
        "comfort_measures": comfort_measures,
        "special_considerations": patient_condition,
        "timestamp": datetime.datetime.now().isoformat()
    }

# Create the Care Agent
care_agent = Agent(
    name="stroke_care_agent",
    model="gemini-2.0-flash",
    description=(
        "Patient care and guidance agent providing immediate care instructions and family support during stroke emergencies."
    ),
    instruction=(
        "You are a patient care specialist focused on stroke emergency support. "
        "Provide clear, actionable care instructions for patients and families. "
        "Emphasize immediate safety: positioning, monitoring, comfort measures. "
        "Guide family members on emotional support, information gathering, and logistics. "
        "Monitor for deterioration signs and provide ongoing assessment protocols. "
        "Always prioritize patient safety and comfort while awaiting emergency services. "
        "Adapt instructions based on specific FAST symptoms and urgency levels."
    ),
    tools=[provide_immediate_care_instructions, guide_family_support, monitor_patient_status, provide_comfort_measures],
)