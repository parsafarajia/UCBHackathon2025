import datetime
import random
from typing import Dict, List, Any
from google.adk.agents import Agent

def send_emergency_alert(patient_id: str, triage_data: Dict[str, Any], contact_info: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Sends emergency alerts to appropriate contacts and services.
    
    Args:
        patient_id (str): Patient identifier
        triage_data (dict): Triage assessment data
        contact_info (dict): Emergency contact information
        
    Returns:
        dict: Emergency alert dispatch results
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
    elif urgency_score >= 20:  # SEMI-URGENT
        alert_recipients = [
            {"type": "emergency_contact", "status": "notified", "method": "text"},
            {"type": "primary_care", "status": "notified", "method": "secure_message"}
        ]
    
    # Generate dispatch information
    dispatch_info = {
        "alert_id": alert_id,
        "patient_id": patient_id,
        "urgency_level": triage_level,
        "urgency_score": urgency_score,
        "recipients": alert_recipients,
        "timestamp": datetime.datetime.now().isoformat(),
        "alert_message": f"Stroke alert for patient {patient_id} - {triage_level} priority"
    }
    
    return {
        "status": "success",
        "dispatch_info": dispatch_info,
        "total_recipients": len(alert_recipients),
        "estimated_response_time": triage_data.get("estimated_response_time", "unknown")
    }

def notify_emergency_contacts(patient_id: str, emergency_data: Dict[str, Any], contact_list: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Notifies emergency contacts with stroke alert information.
    
    Args:
        patient_id (str): Patient identifier
        emergency_data (dict): Emergency situation data
        contact_list (list): List of emergency contacts
        
    Returns:
        dict: Contact notification results
    """
    if not contact_list:
        # Default emergency contacts for simulation
        contact_list = [
            {"name": "Emergency Contact 1", "relation": "spouse", "phone": "555-0101", "priority": 1},
            {"name": "Emergency Contact 2", "relation": "adult_child", "phone": "555-0102", "priority": 2},
            {"name": "Primary Care Physician", "relation": "doctor", "phone": "555-0103", "priority": 3}
        ]
    
    notification_results = []
    
    for contact in contact_list:
        # Simulate notification attempt
        success_rate = 0.9 if contact["priority"] <= 2 else 0.7
        notification_successful = random.random() < success_rate
        
        result = {
            "contact_name": contact["name"],
            "relation": contact["relation"],
            "phone": contact["phone"],
            "priority": contact["priority"],
            "notification_successful": notification_successful,
            "method": "phone_call" if contact["priority"] <= 2 else "text_message",
            "timestamp": datetime.datetime.now().isoformat()
        }
        
        if notification_successful:
            result["status"] = "contacted"
            result["response"] = "acknowledged"
        else:
            result["status"] = "failed"
            result["retry_scheduled"] = True
        
        notification_results.append(result)
    
    successful_contacts = sum(1 for r in notification_results if r["notification_successful"])
    
    return {
        "status": "success",
        "patient_id": patient_id,
        "total_contacts": len(contact_list),
        "successful_contacts": successful_contacts,
        "notification_results": notification_results,
        "emergency_data": emergency_data,
        "timestamp": datetime.datetime.now().isoformat()
    }

def coordinate_emergency_response(patient_id: str, location_data: Dict[str, Any], medical_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Coordinates emergency response dispatch and logistics.
    
    Args:
        patient_id (str): Patient identifier
        location_data (dict): Patient location information
        medical_data (dict): Medical assessment data
        
    Returns:
        dict: Emergency response coordination results
    """
    response_id = f"EMS-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    # Default location for simulation
    if not location_data:
        location_data = {
            "address": "123 Main St, Anytown, ST 12345",
            "coordinates": {"lat": 37.7749, "lng": -122.4194},
            "access_notes": "Front door, apartment 2B"
        }
    
    urgency_score = medical_data.get("urgency_score", 0)
    
    # Determine response resources
    if urgency_score >= 70:
        response_units = [
            {"unit": "Advanced Life Support", "eta": "4-6 minutes", "crew": "paramedic_team"},
            {"unit": "Stroke Response Unit", "eta": "8-12 minutes", "equipment": "mobile_ct"},
            {"unit": "Fire Department", "eta": "3-5 minutes", "role": "first_responder"}
        ]
        hospital_prep = {
            "stroke_team_activated": True,
            "ct_scanner_reserved": True,
            "thrombolytic_ready": True,
            "neuro_surgeon_notified": True
        }
    elif urgency_score >= 40:
        response_units = [
            {"unit": "Basic Life Support", "eta": "8-12 minutes", "crew": "emt_team"},
            {"unit": "Supervisor Unit", "eta": "10-15 minutes", "role": "assessment"}
        ]
        hospital_prep = {
            "emergency_dept_notified": True,
            "neurology_consulted": True
        }
    else:
        response_units = [
            {"unit": "Non-Emergency Transport", "eta": "20-30 minutes", "crew": "transport_team"}
        ]
        hospital_prep = {
            "outpatient_referral": True
        }
    
    return {
        "status": "success",
        "response_id": response_id,
        "patient_id": patient_id,
        "location": location_data,
        "response_units": response_units,
        "hospital_preparation": hospital_prep,
        "estimated_scene_time": "15-25 minutes",
        "estimated_transport_time": "10-20 minutes",
        "receiving_hospital": "Regional Medical Center - Stroke Center",
        "timestamp": datetime.datetime.now().isoformat()
    }

def send_hospital_alert(patient_id: str, stroke_data: Dict[str, Any], hospital_id: str = "RMC-001") -> Dict[str, Any]:
    """
    Sends pre-arrival alert to receiving hospital.
    
    Args:
        patient_id (str): Patient identifier
        stroke_data (dict): Stroke assessment data
        hospital_id (str): Target hospital identifier
        
    Returns:
        dict: Hospital alert confirmation
    """
    alert_id = f"HOSP-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    # Estimate arrival time
    estimated_arrival = datetime.datetime.now() + datetime.timedelta(minutes=random.randint(15, 35))
    
    hospital_alert = {
        "alert_id": alert_id,
        "hospital_id": hospital_id,
        "patient_id": patient_id,
        "alert_type": "stroke_incoming",
        "estimated_arrival": estimated_arrival.isoformat(),
        "patient_condition": stroke_data,
        "preparations_requested": [
            "activate_stroke_team",
            "prepare_ct_scanner",
            "ready_stroke_bay",
            "alert_neurology"
        ],
        "transport_mode": "emergency_ambulance",
        "special_requirements": [],
        "timestamp": datetime.datetime.now().isoformat()
    }
    
    # Add special requirements based on severity
    urgency_score = stroke_data.get("urgency_score", 0)
    if urgency_score >= 70:
        hospital_alert["special_requirements"] = [
            "thrombolytic_therapy_consideration",
            "neuro_surgeon_standby",
            "OR_availability_check"
        ]
    
    return {
        "status": "success",
        "hospital_alert": hospital_alert,
        "confirmation": "Hospital notified and preparing for arrival"
    }

# Create the Alert Agent
alert_agent = Agent(
    name="stroke_alert_agent",
    model="gemini-2.0-flash",
    description=(
        "Emergency contact and alert coordination agent for stroke response system."
    ),
    instruction=(
        "You are an emergency alert coordinator specializing in stroke response. "
        "Dispatch alerts based on triage urgency: IMMEDIATE (911 + stroke team), "
        "URGENT (emergency services + contacts), SEMI-URGENT (contacts + primary care). "
        "Coordinate emergency response resources, notify hospitals, and maintain "
        "communication with emergency contacts. Ensure rapid response for time-critical "
        "stroke cases and provide clear status updates throughout the emergency response."
    ),
    tools=[send_emergency_alert, notify_emergency_contacts, coordinate_emergency_response, send_hospital_alert],
)