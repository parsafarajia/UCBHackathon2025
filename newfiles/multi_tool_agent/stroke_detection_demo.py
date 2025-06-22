"""
Demo script for the multi-agent stroke detection system.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from stroke_detection.coordinator import orchestrate_stroke_detection, process_batch_assessments, get_system_status
from stroke_detection.agents.symptom_agent import analyze_stroke_symptoms
from stroke_detection.agents.triage_agent import perform_fast_assessment
from stroke_detection.agents.alert_agent import send_emergency_alert
from stroke_detection.agents.care_agent import provide_immediate_care_instructions
from stroke_detection.agents.followup_agent import log_stroke_event

def demo_individual_agents():
    """Demonstrates individual agent functionality."""
    print("=== STROKE DETECTION MULTI-AGENT SYSTEM DEMO ===\n")
    
    patient_id = "demo-patient-001"
    symptom_text = "I suddenly can't speak properly and my face feels numb on the left side"
    
    print("1. SYMPTOM AGENT - Analyzing stroke symptoms...")
    symptom_results = analyze_stroke_symptoms(symptom_text, patient_id)
    print(f"   FAST Score: {symptom_results['fast_score']}")
    print(f"   Severity: {symptom_results['severity']}")
    print(f"   Detected Symptoms: {symptom_results['detected_symptoms']}")
    print(f"   Requires Triage: {symptom_results['requires_triage']}\n")
    
    if symptom_results['requires_triage']:
        print("2. TRIAGE AGENT - Performing FAST assessment...")
        triage_results = perform_fast_assessment(symptom_results, patient_id)
        print(f"   Urgency Score: {triage_results['urgency_score']}")
        print(f"   Triage Level: {triage_results['triage_level']}")
        print(f"   Response Time: {triage_results['estimated_response_time']}")
        print(f"   Emergency Required: {triage_results['requires_immediate_attention']}\n")
        
        if triage_results['requires_immediate_attention']:
            print("3. ALERT AGENT - Sending emergency alerts...")
            alert_results = send_emergency_alert(patient_id, triage_results)
            print(f"   Alert Recipients: {len(alert_results['dispatch_info']['recipients'])}")
            print(f"   Response Time: {alert_results['estimated_response_time']}\n")
        
        print("4. CARE AGENT - Providing care instructions...")
        care_results = provide_immediate_care_instructions(patient_id, triage_results)
        print(f"   Immediate Actions: {len(care_results['care_instructions']['immediate_actions'])}")
        print(f"   Monitoring Steps: {len(care_results['care_instructions']['monitoring'])}\n")
        
        print("5. FOLLOW-UP AGENT - Logging event...")
        log_results = log_stroke_event(patient_id, {
            "symptom_analysis": symptom_results,
            "triage_data": triage_results
        })
        print(f"   Event ID: {log_results['event_id']}")
        print(f"   Storage Location: {log_results['storage_location']}\n")

def demo_coordinated_workflow():
    """Demonstrates coordinated multi-agent workflow."""
    print("=== COORDINATED WORKFLOW DEMO ===\n")
    
    # Test case 1: Critical stroke symptoms
    test_case_1 = {
        "patient_id": "patient-critical-001",
        "text": "My husband suddenly collapsed, his face is drooping on one side, he can't lift his right arm, and his speech is very slurred",
        "input_type": "text",
        "location": {
            "address": "123 Emergency Lane, Critical City, ST 12345",
            "coordinates": {"lat": 40.7128, "lng": -74.0060},
            "access_notes": "Second floor apartment, use elevator"
        }
    }
    
    print("Processing CRITICAL case...")
    critical_results = orchestrate_stroke_detection(test_case_1["patient_id"], test_case_1)
    print(f"Workflow Status: {critical_results['status']}")
    print(f"Agents Executed: {critical_results['agents_executed']}")
    print(f"Total Duration: {critical_results.get('total_duration_seconds', 0):.2f} seconds")
    print(f"Summary: {critical_results.get('summary', {})}\n")
    
    # Test case 2: Warning level symptoms
    test_case_2 = {
        "patient_id": "patient-warning-002", 
        "text": "I have a mild headache and feel a bit dizzy, also some tingling in my left hand",
        "input_type": "text"
    }
    
    print("Processing WARNING case...")
    warning_results = orchestrate_stroke_detection(test_case_2["patient_id"], test_case_2)
    print(f"Workflow Status: {warning_results['status']}")
    print(f"Agents Executed: {warning_results['agents_executed']}")
    print(f"Total Duration: {warning_results.get('total_duration_seconds', 0):.2f} seconds")
    print(f"Summary: {warning_results.get('summary', {})}\n")

def demo_batch_processing():
    """Demonstrates batch processing of multiple patients."""
    print("=== BATCH PROCESSING DEMO ===\n")
    
    batch_patients = [
        {
            "patient_id": "batch-patient-001",
            "text": "Severe facial drooping and cannot speak",
            "input_type": "text"
        },
        {
            "patient_id": "batch-patient-002", 
            "text": "Mild dizziness and slight weakness in arm",
            "input_type": "text"
        },
        {
            "patient_id": "batch-patient-003",
            "text": "Sudden severe headache and vision problems",
            "input_type": "text"
        }
    ]
    
    print("Processing batch of 3 patients...")
    batch_results = process_batch_assessments(batch_patients)
    
    print(f"Batch ID: {batch_results['batch_id']}")
    print(f"Total Patients: {batch_results['total_patients']}")
    print("\nPriority Queue:")
    for patient in batch_results['priority_queue']:
        print(f"  Rank {patient['priority_rank']}: {patient['patient_id']} "
              f"(Score: {patient['urgency_score']}, "
              f"Critical: {patient['requires_immediate_attention']})")

def demo_system_status():
    """Demonstrates system status monitoring."""
    print("\n=== SYSTEM STATUS DEMO ===\n")
    
    status = get_system_status()
    print(f"System Status: {status['system_status']}")
    print(f"Performance Metrics:")
    for metric, value in status['performance_metrics'].items():
        print(f"  {metric}: {value}")
    
    print(f"\nAgent Status:")
    for agent, details in status['agents'].items():
        print(f"  {agent}: {details['status']}")

def main():
    """Main demo function."""
    try:
        # Demo individual agents
        demo_individual_agents()
        
        # Demo coordinated workflow
        demo_coordinated_workflow()
        
        # Demo batch processing
        demo_batch_processing()
        
        # Demo system status
        demo_system_status()
        
        print("\n=== DEMO COMPLETED SUCCESSFULLY ===")
        
    except Exception as e:
        print(f"\nDEMO ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()