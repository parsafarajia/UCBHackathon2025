"""
Data structures and type definitions for the stroke detection multi-agent system.
"""

from typing import Dict, List, Any, Optional, NamedTuple
from dataclasses import dataclass
from enum import Enum
import datetime

class UrgencyLevel(Enum):
    """Urgency levels for triage assessment."""
    IMMEDIATE = "IMMEDIATE"  # RED - 0-5 minutes
    URGENT = "URGENT"        # YELLOW - 5-15 minutes
    SEMI_URGENT = "SEMI-URGENT"  # GREEN - 30-60 minutes
    NON_URGENT = "NON-URGENT"    # BLUE - 2-4 hours

class SeverityLevel(Enum):
    """Severity levels for symptom assessment."""
    CRITICAL = "critical"
    WARNING = "warning"
    NORMAL = "normal"

@dataclass
class SymptomAnalysis:
    """Data structure for symptom analysis results."""
    patient_id: str
    input_text: str
    detected_symptoms: Dict[str, List[str]]
    fast_score: int
    severity: SeverityLevel
    recommendation: str
    requires_triage: bool
    timestamp: str

@dataclass
class FASTAssessment:
    """Data structure for FAST assessment results."""
    face: bool
    arms: bool
    speech: bool
    time: str

@dataclass
class TriageResults:
    """Data structure for triage assessment results."""
    patient_id: str
    fast_assessment: FASTAssessment
    urgency_score: int
    triage_level: UrgencyLevel
    triage_color: str
    estimated_response_time: str
    requires_immediate_attention: bool
    requires_emergency_transport: bool
    timestamp: str

@dataclass
class EmergencyContact:
    """Data structure for emergency contact information."""
    name: str
    relation: str
    phone: str
    priority: int
    notification_method: str = "phone_call"

@dataclass
class LocationData:
    """Data structure for patient location information."""
    address: str
    coordinates: Dict[str, float]
    access_notes: str

@dataclass
class EmergencyUnit:
    """Data structure for emergency response units."""
    unit: str
    eta: str
    crew: str
    role: str = ""
    equipment: str = ""

@dataclass
class AlertResults:
    """Data structure for emergency alert results."""
    alert_id: str
    patient_id: str
    urgency_level: UrgencyLevel
    urgency_score: int
    recipients: List[Dict[str, Any]]
    timestamp: str
    alert_message: str

@dataclass
class CareInstructions:
    """Data structure for patient care instructions."""
    patient_id: str
    immediate_actions: List[str]
    positioning: List[str]
    monitoring: List[str]
    do_not_do: List[str]
    special_instructions: Dict[str, List[str]]
    urgency_level: UrgencyLevel
    timestamp: str

@dataclass
class WorkflowResults:
    """Data structure for complete workflow execution results."""
    workflow_id: str
    patient_id: str
    start_time: str
    end_time: Optional[str]
    status: str
    agents_executed: List[str]
    timeline: Dict[str, Dict[str, Any]]
    results: Dict[str, Any]
    summary: Optional[Dict[str, Any]]
    total_duration_seconds: Optional[float]

class StrokeEventTimeline(NamedTuple):
    """Timeline structure for stroke event tracking."""
    symptom_onset: Optional[str]
    first_assessment: Optional[str]
    emergency_called: Optional[str]
    response_arrival: Optional[str]
    hospital_arrival: Optional[str]

@dataclass
class StrokeEventLog:
    """Comprehensive stroke event log structure."""
    event_id: str
    patient_id: str
    event_timestamp: str
    initial_symptoms: Dict[str, Any]
    triage_assessment: Dict[str, Any]
    emergency_response: Dict[str, Any]
    care_provided: Dict[str, Any]
    timeline: StrokeEventTimeline
    outcomes: Dict[str, Any]

@dataclass
class QualityMetrics:
    """Quality and performance metrics structure."""
    response_time_targets_met: Optional[bool]
    protocol_adherence: str
    communication_effectiveness: str
    areas_for_improvement: List[str]

@dataclass
class IncidentReport:
    """Formal incident report structure."""
    report_id: str
    event_id: str
    report_type: str
    generated_by: str
    report_date: str
    patient_id: str
    executive_summary: Dict[str, Any]
    timeline_analysis: Dict[str, Any]
    clinical_findings: Dict[str, Any]
    quality_indicators: QualityMetrics

@dataclass
class PatientOutcome:
    """Patient outcome tracking structure."""
    tracking_id: str
    patient_id: str
    follow_up_schedule: Dict[str, str]
    assessment_areas: Dict[str, Any]
    treatment_effectiveness: Dict[str, Any]
    outcome_score: int
    outcome_category: str

@dataclass
class SystemPerformance:
    """System performance metrics structure."""
    analysis_id: str
    time_period: str
    response_times: Dict[str, str]
    accuracy_metrics: Dict[str, float]
    system_reliability: Dict[str, float]
    patient_outcomes: Dict[str, Any]
    recommendations: List[Dict[str, Any]]
    overall_system_grade: str

def create_default_symptom_analysis(patient_id: str) -> SymptomAnalysis:
    """Creates a default symptom analysis structure."""
    return SymptomAnalysis(
        patient_id=patient_id,
        input_text="",
        detected_symptoms={"face": [], "arm": [], "speech": [], "other": []},
        fast_score=0,
        severity=SeverityLevel.NORMAL,
        recommendation="Monitor symptoms",
        requires_triage=False,
        timestamp=datetime.datetime.now().isoformat()
    )

def create_default_triage_results(patient_id: str) -> TriageResults:
    """Creates a default triage results structure."""
    return TriageResults(
        patient_id=patient_id,
        fast_assessment=FASTAssessment(False, False, False, datetime.datetime.now().isoformat()),
        urgency_score=0,
        triage_level=UrgencyLevel.NON_URGENT,
        triage_color="BLUE",
        estimated_response_time="2-4 hours",
        requires_immediate_attention=False,
        requires_emergency_transport=False,
        timestamp=datetime.datetime.now().isoformat()
    )

def validate_workflow_data(workflow_data: Dict[str, Any]) -> bool:
    """
    Validates workflow data structure completeness.
    
    Args:
        workflow_data (dict): Workflow data to validate
        
    Returns:
        bool: True if valid, False otherwise
    """
    required_fields = ["workflow_id", "patient_id", "start_time", "status"]
    
    for field in required_fields:
        if field not in workflow_data:
            return False
    
    return True

def calculate_response_time_metrics(timeline: Dict[str, Dict[str, Any]]) -> Dict[str, float]:
    """
    Calculates response time metrics from workflow timeline.
    
    Args:
        timeline (dict): Workflow timeline data
        
    Returns:
        dict: Response time metrics in seconds
    """
    metrics = {}
    
    for step, timing in timeline.items():
        if "duration_seconds" in timing:
            metrics[f"{step}_duration"] = timing["duration_seconds"]
    
    if timeline:
        total_duration = sum(
            timing.get("duration_seconds", 0) 
            for timing in timeline.values()
        )
        metrics["total_workflow_duration"] = total_duration
    
    return metrics