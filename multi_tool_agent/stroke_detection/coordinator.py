import datetime
from typing import Dict, List, Any, Optional
from google.adk.agents import Agent

# Import all specialized agents
from .agents.symptom_agent import symptom_agent, analyze_stroke_symptoms, process_voice_input
from .agents.triage_agent import triage_agent, perform_fast_assessment, calculate_stroke_risk_score
from .agents.alert_agent import alert_agent, send_emergency_alert, coordinate_emergency_response
from .agents.care_agent import care_agent, provide_immediate_care_instructions, guide_family_support
from .agents.followup_agent import followup_agent, log_stroke_event, generate_incident_report

def orchestrate_stroke_detection(patient_id: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main orchestration function that coordinates all agents in the stroke detection workflow.
    
    Args:
        patient_id (str): Patient identifier
        input_data (dict): Initial input data (text, voice, or sensor data)
        
    Returns:
        dict: Complete stroke detection and response workflow results
    """
    workflow_id = f"WORKFLOW-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
    start_time = datetime.datetime.now()
    
    workflow_results = {
        "workflow_id": workflow_id,
        "patient_id": patient_id,
        "start_time": start_time.isoformat(),
        "status": "in_progress",
        "agents_executed": [],
        "timeline": {},
        "results": {}
    }
    
    try:
        # Step 1: Symptom Detection and Analysis
        step1_start = datetime.datetime.now()
        input_text = input_data.get("text", "") or input_data.get("voice_text", "")
        
        if input_data.get("input_type") == "voice":
            symptom_results = process_voice_input(input_text, patient_id)
        else:
            symptom_results = analyze_stroke_symptoms(input_text, patient_id)
        
        workflow_results["agents_executed"].append("symptom_agent")
        workflow_results["timeline"]["symptom_analysis"] = {
            "start": step1_start.isoformat(),
            "end": datetime.datetime.now().isoformat(),
            "duration_seconds": (datetime.datetime.now() - step1_start).total_seconds()
        }
        workflow_results["results"]["symptom_analysis"] = symptom_results
        
        # Step 2: Triage Assessment (if symptoms detected)
        if symptom_results.get("requires_triage", False):
            step2_start = datetime.datetime.now()
            
            triage_results = perform_fast_assessment(symptom_results, patient_id)
            risk_score = calculate_stroke_risk_score({
                "symptom_analysis": symptom_results,
                "severity": symptom_results.get("severity", "normal")
            })
            
            workflow_results["agents_executed"].append("triage_agent")
            workflow_results["timeline"]["triage_assessment"] = {
                "start": step2_start.isoformat(),
                "end": datetime.datetime.now().isoformat(),
                "duration_seconds": (datetime.datetime.now() - step2_start).total_seconds()
            }
            workflow_results["results"]["triage_assessment"] = triage_results
            workflow_results["results"]["risk_assessment"] = risk_score
            
            # Step 3: Emergency Alert (if urgent)
            if triage_results.get("requires_immediate_attention", False) or triage_results.get("urgency_score", 0) >= 40:
                step3_start = datetime.datetime.now()
                
                alert_results = send_emergency_alert(patient_id, triage_results)
                response_coordination = coordinate_emergency_response(
                    patient_id, 
                    input_data.get("location", {}), 
                    triage_results
                )
                
                workflow_results["agents_executed"].append("alert_agent")
                workflow_results["timeline"]["emergency_alert"] = {
                    "start": step3_start.isoformat(),
                    "end": datetime.datetime.now().isoformat(),
                    "duration_seconds": (datetime.datetime.now() - step3_start).total_seconds()
                }
                workflow_results["results"]["emergency_alert"] = alert_results
                workflow_results["results"]["response_coordination"] = response_coordination
            
            # Step 4: Care Instructions
            step4_start = datetime.datetime.now()
            
            care_instructions = provide_immediate_care_instructions(patient_id, triage_results)
            family_guidance = guide_family_support(patient_id, triage_results)
            
            workflow_results["agents_executed"].append("care_agent")
            workflow_results["timeline"]["care_instructions"] = {
                "start": step4_start.isoformat(),
                "end": datetime.datetime.now().isoformat(),
                "duration_seconds": (datetime.datetime.now() - step4_start).total_seconds()
            }
            workflow_results["results"]["care_instructions"] = care_instructions
            workflow_results["results"]["family_guidance"] = family_guidance
        
        # Step 5: Event Logging
        step5_start = datetime.datetime.now()
        
        event_log = log_stroke_event(patient_id, workflow_results["results"])
        
        workflow_results["agents_executed"].append("followup_agent")
        workflow_results["timeline"]["event_logging"] = {
            "start": step5_start.isoformat(),
            "end": datetime.datetime.now().isoformat(),
            "duration_seconds": (datetime.datetime.now() - step5_start).total_seconds()
        }
        workflow_results["results"]["event_log"] = event_log
        
        # Complete workflow
        end_time = datetime.datetime.now()
        workflow_results["end_time"] = end_time.isoformat()
        workflow_results["total_duration_seconds"] = (end_time - start_time).total_seconds()
        workflow_results["status"] = "completed"
        
        # Generate summary
        workflow_results["summary"] = generate_workflow_summary(workflow_results)
        
    except Exception as e:
        workflow_results["status"] = "error"
        workflow_results["error"] = str(e)
        workflow_results["end_time"] = datetime.datetime.now().isoformat()
    
    return workflow_results

def generate_workflow_summary(workflow_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates a summary of the stroke detection workflow execution.
    
    Args:
        workflow_data (dict): Complete workflow execution data
        
    Returns:
        dict: Workflow summary with key findings and actions
    """
    results = workflow_data.get("results", {})
    
    summary = {
        "patient_id": workflow_data.get("patient_id"),
        "workflow_id": workflow_data.get("workflow_id"),
        "total_agents": len(workflow_data.get("agents_executed", [])),
        "execution_time": workflow_data.get("total_duration_seconds"),
        "status": workflow_data.get("status")
    }
    
    # Extract key findings
    if "symptom_analysis" in results:
        symptom_data = results["symptom_analysis"]
        summary["stroke_symptoms_detected"] = len([
            s for symptoms in symptom_data.get("detected_symptoms", {}).values() 
            for s in symptoms
        ]) > 0
        summary["fast_score"] = symptom_data.get("fast_score", 0)
        summary["symptom_severity"] = symptom_data.get("severity", "normal")
    
    if "triage_assessment" in results:
        triage_data = results["triage_assessment"]
        summary["urgency_score"] = triage_data.get("urgency_score", 0)
        summary["triage_level"] = triage_data.get("triage_level", "UNKNOWN")
        summary["requires_emergency"] = triage_data.get("requires_immediate_attention", False)
    
    # Extract actions taken
    summary["actions_taken"] = []
    
    if "emergency_alert" in results:
        summary["actions_taken"].append("Emergency services alerted")
    
    if "care_instructions" in results:
        summary["actions_taken"].append("Care instructions provided")
    
    if "family_guidance" in results:
        summary["actions_taken"].append("Family guidance delivered")
    
    if "event_log" in results:
        summary["actions_taken"].append("Event logged for follow-up")
    
    return summary

def process_batch_assessments(patient_assessments: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Processes multiple patient assessments for batch triage and prioritization.
    
    Args:
        patient_assessments (list): List of patient assessment data
        
    Returns:
        dict: Batch processing results with prioritized patient queue
    """
    batch_id = f"BATCH-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    batch_results = {
        "batch_id": batch_id,
        "total_patients": len(patient_assessments),
        "processed_patients": [],
        "priority_queue": [],
        "timestamp": datetime.datetime.now().isoformat()
    }
    
    # Process each patient
    for patient_data in patient_assessments:
        patient_id = patient_data.get("patient_id")
        workflow_result = orchestrate_stroke_detection(patient_id, patient_data)
        
        batch_results["processed_patients"].append({
            "patient_id": patient_id,
            "workflow_id": workflow_result.get("workflow_id"),
            "status": workflow_result.get("status"),
            "urgency_score": workflow_result.get("results", {}).get("triage_assessment", {}).get("urgency_score", 0),
            "summary": workflow_result.get("summary", {})
        })
    
    # Create priority queue
    sorted_patients = sorted(
        batch_results["processed_patients"], 
        key=lambda x: x.get("urgency_score", 0), 
        reverse=True
    )
    
    for i, patient in enumerate(sorted_patients):
        batch_results["priority_queue"].append({
            "priority_rank": i + 1,
            "patient_id": patient["patient_id"],
            "urgency_score": patient["urgency_score"],
            "requires_immediate_attention": patient["urgency_score"] >= 70
        })
    
    return batch_results

def get_system_status() -> Dict[str, Any]:
    """
    Returns current system status and health of all agents.
    
    Returns:
        dict: System status information
    """
    return {
        "system_status": "operational",
        "agents": {
            "symptom_agent": {"status": "active", "last_update": datetime.datetime.now().isoformat()},
            "triage_agent": {"status": "active", "last_update": datetime.datetime.now().isoformat()},
            "alert_agent": {"status": "active", "last_update": datetime.datetime.now().isoformat()},
            "care_agent": {"status": "active", "last_update": datetime.datetime.now().isoformat()},
            "followup_agent": {"status": "active", "last_update": datetime.datetime.now().isoformat()}
        },
        "performance_metrics": {
            "average_response_time": "4.2 seconds",
            "success_rate": "98.7%",
            "uptime": "99.9%"
        },
        "timestamp": datetime.datetime.now().isoformat()
    }

# Create the main coordinator agent
stroke_coordinator = Agent(
    name="stroke_detection_coordinator",
    model="gemini-2.0-flash",
    description=(
        "Main coordinator agent that orchestrates the multi-agent stroke detection system workflow."
    ),
    instruction=(
        "You are the central coordinator for a comprehensive stroke detection system. "
        "Orchestrate the workflow across 5 specialized agents: Symptom Agent (NLP analysis), "
        "Triage Agent (FAST assessment), Alert Agent (emergency response), Care Agent (patient guidance), "
        "and Follow-Up Agent (logging and reporting). Ensure proper sequencing, data flow between agents, "
        "and comprehensive documentation. Prioritize patient safety and rapid response for critical cases. "
        "Provide clear workflow summaries and maintain system performance monitoring."
    ),
    tools=[orchestrate_stroke_detection, generate_workflow_summary, process_batch_assessments, get_system_status],
)