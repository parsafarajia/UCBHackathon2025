import datetime
from google.adk.agents import Agent
import random

def monitor_heart_rate(patient_id: str) -> dict:
    """Monitors a patient's heart rate and detects anomalies.

    Args:
        patient_id (str): The ID of the patient to monitor.

    Returns:
        dict: status, heart rate reading, and emergency alert if needed.
    """
    heart_rate = random.randint(45, 180)
    
    is_critical = heart_rate < 50 or heart_rate > 150
    is_warning = (heart_rate < 60 or heart_rate > 120) and not is_critical
    
    result = {
        "status": "success",
        "patient_id": patient_id,
        "heart_rate": heart_rate,
        "timestamp": datetime.datetime.now().isoformat(),
        "severity": "normal"
    }
    
    if is_critical:
        result["severity"] = "critical"
        result["alert"] = f"CRITICAL: Heart rate {heart_rate} BPM detected for patient {patient_id}"
        result["emergency_response"] = call_emergency_services(patient_id, f"Critical heart rate: {heart_rate} BPM")
    elif is_warning:
        result["severity"] = "warning"
        result["alert"] = f"WARNING: Abnormal heart rate {heart_rate} BPM for patient {patient_id}"
    
    return result

def monitor_blood_pressure(patient_id: str) -> dict:
    """Monitors a patient's blood pressure and detects anomalies.

    Args:
        patient_id (str): The ID of the patient to monitor.

    Returns:
        dict: status, blood pressure reading, and emergency alert if needed.
    """
    systolic = random.randint(80, 200)
    diastolic = random.randint(50, 120)
    
    is_critical = systolic > 180 or diastolic > 110 or systolic < 90
    is_warning = (systolic > 140 or diastolic > 90) and not is_critical
    
    result = {
        "status": "success",
        "patient_id": patient_id,
        "blood_pressure": f"{systolic}/{diastolic}",
        "systolic": systolic,
        "diastolic": diastolic,
        "timestamp": datetime.datetime.now().isoformat(),
        "severity": "normal"
    }
    
    if is_critical:
        result["severity"] = "critical"
        result["alert"] = f"CRITICAL: Blood pressure {systolic}/{diastolic} mmHg detected for patient {patient_id}"
        result["emergency_response"] = call_emergency_services(patient_id, f"Critical blood pressure: {systolic}/{diastolic} mmHg")
    elif is_warning:
        result["severity"] = "warning"
        result["alert"] = f"WARNING: Elevated blood pressure {systolic}/{diastolic} mmHg for patient {patient_id}"
    
    return result

def monitor_temperature(patient_id: str) -> dict:
    """Monitors a patient's body temperature and detects anomalies.

    Args:
        patient_id (str): The ID of the patient to monitor.

    Returns:
        dict: status, temperature reading, and emergency alert if needed.
    """
    temperature_f = round(random.uniform(95.0, 108.0), 1)
    temperature_c = round((temperature_f - 32) * 5/9, 1)
    
    is_critical = temperature_f < 95.0 or temperature_f > 104.0
    is_warning = (temperature_f < 96.0 or temperature_f > 100.4) and not is_critical
    
    result = {
        "status": "success",
        "patient_id": patient_id,
        "temperature_f": temperature_f,
        "temperature_c": temperature_c,
        "timestamp": datetime.datetime.now().isoformat(),
        "severity": "normal"
    }
    
    if is_critical:
        result["severity"] = "critical"
        result["alert"] = f"CRITICAL: Body temperature {temperature_f}°F ({temperature_c}°C) detected for patient {patient_id}"
        result["emergency_response"] = call_emergency_services(patient_id, f"Critical temperature: {temperature_f}°F")
    elif is_warning:
        result["severity"] = "warning"
        result["alert"] = f"WARNING: Abnormal temperature {temperature_f}°F ({temperature_c}°C) for patient {patient_id}"
    
    return result

def call_emergency_services(patient_id: str, condition: str) -> dict:
    """Simulates calling 911 for emergency medical response.

    Args:
        patient_id (str): The ID of the patient requiring emergency response.
        condition (str): Description of the medical emergency.

    Returns:
        dict: Emergency response details.
    """
    emergency_id = f"EMR-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    return {
        "emergency_id": emergency_id,
        "patient_id": patient_id,
        "condition": condition,
        "response_time": "5-8 minutes",
        "dispatched_units": ["Ambulance Unit 12", "Paramedic Team Alpha"],
        "status": "911 CALLED - Emergency services dispatched",
        "timestamp": datetime.datetime.now().isoformat(),
        "operator_message": f"Emergency services have been notified for patient {patient_id}. Medical emergency: {condition}"
    }

def get_patient_status(patient_id: str) -> dict:
    """Gets comprehensive health status for a patient.

    Args:
        patient_id (str): The ID of the patient to check.

    Returns:
        dict: Complete health monitoring report.
    """
    heart_rate_data = monitor_heart_rate(patient_id)
    bp_data = monitor_blood_pressure(patient_id)
    temp_data = monitor_temperature(patient_id)
    
    overall_severity = "normal"
    alerts = []
    emergency_responses = []
    
    for data in [heart_rate_data, bp_data, temp_data]:
        if data["severity"] == "critical":
            overall_severity = "critical"
        elif data["severity"] == "warning" and overall_severity == "normal":
            overall_severity = "warning"
        
        if "alert" in data:
            alerts.append(data["alert"])
        
        if "emergency_response" in data:
            emergency_responses.append(data["emergency_response"])
    
    return {
        "status": "success",
        "patient_id": patient_id,
        "overall_severity": overall_severity,
        "heart_rate": heart_rate_data,
        "blood_pressure": bp_data,
        "temperature": temp_data,
        "alerts": alerts,
        "emergency_responses": emergency_responses,
        "timestamp": datetime.datetime.now().isoformat()
    }

root_agent = Agent(
    name="health_monitoring_agent",
    model="gemini-2.0-flash",
    description=(
        "Advanced health monitoring agent that tracks patient vital signs, detects medical anomalies, and automatically calls emergency services when critical conditions are detected."
    ),
    instruction=(
        "You are a critical health monitoring agent responsible for patient safety. Monitor vital signs including heart rate, blood pressure, and body temperature. "
        "Detect anomalies and immediately alert emergency services for critical conditions. "
        "Heart rate: Critical if <50 or >150 BPM, Warning if <60 or >120 BPM. "
        "Blood pressure: Critical if systolic >180 or diastolic >110 or systolic <90, Warning if systolic >140 or diastolic >90. "
        "Temperature: Critical if <95°F or >104°F, Warning if <96°F or >100.4°F. "
        "Always prioritize patient safety and provide clear, actionable health information."
    ),
    tools=[monitor_heart_rate, monitor_blood_pressure, monitor_temperature, call_emergency_services, get_patient_status],
) 