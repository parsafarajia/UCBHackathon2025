import datetime
import re
from typing import Dict, List, Any
from google.adk.agents import Agent

def analyze_stroke_symptoms(input_text: str, patient_id: str) -> Dict[str, Any]:
    """
    Analyzes text/voice input for stroke symptoms using NLP patterns.
    
    Args:
        input_text (str): Patient's description of symptoms
        patient_id (str): Patient identifier
        
    Returns:
        dict: Stroke symptom analysis with severity and recommendations
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

def extract_symptom_keywords(input_text: str) -> List[str]:
    """
    Extracts relevant medical keywords from input text.
    
    Args:
        input_text (str): Raw input text
        
    Returns:
        list: Extracted medical keywords
    """
    medical_keywords = [
        "pain", "headache", "weakness", "numbness", "tingling", "dizziness",
        "nausea", "vomiting", "confusion", "speech", "vision", "balance",
        "coordination", "paralysis", "drooping", "slurred"
    ]
    
    found_keywords = []
    input_lower = input_text.lower()
    
    for keyword in medical_keywords:
        if keyword in input_lower:
            found_keywords.append(keyword)
    
    return found_keywords

def process_voice_input(voice_text: str, patient_id: str) -> Dict[str, Any]:
    """
    Processes voice-to-text input for stroke symptom detection.
    
    Args:
        voice_text (str): Transcribed voice input
        patient_id (str): Patient identifier
        
    Returns:
        dict: Processed voice analysis
    """
    # Clean and normalize voice input
    cleaned_text = re.sub(r'[^\w\s]', '', voice_text)
    keywords = extract_symptom_keywords(cleaned_text)
    symptom_analysis = analyze_stroke_symptoms(cleaned_text, patient_id)
    
    return {
        "status": "success",
        "patient_id": patient_id,
        "original_voice_text": voice_text,
        "cleaned_text": cleaned_text,
        "extracted_keywords": keywords,
        "symptom_analysis": symptom_analysis,
        "timestamp": datetime.datetime.now().isoformat()
    }

# Create the Symptom Agent
symptom_agent = Agent(
    name="stroke_symptom_agent",
    model="gemini-2.0-flash",
    description=(
        "Specialized agent for detecting stroke symptoms from voice and text input using NLP and medical pattern recognition."
    ),
    instruction=(
        "You are a medical symptom analysis agent focused on stroke detection. "
        "Analyze patient input for FAST stroke indicators: Face (drooping, weakness), "
        "Arms (weakness, numbness), Speech (slurred, difficulty), and Time (urgency). "
        "Use pattern matching to identify stroke symptoms and calculate risk scores. "
        "For FAST scores >= 6, immediately flag as critical. For scores >= 3, flag as warning. "
        "Always provide clear recommendations and indicate if triage assessment is needed."
    ),
    tools=[analyze_stroke_symptoms, extract_symptom_keywords, process_voice_input],
)