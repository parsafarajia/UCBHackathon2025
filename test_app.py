#!/usr/bin/env python3
"""
Quick test script for the Health Monitoring Web Application
"""

import requests
import json
import time

BASE_URL = "http://localhost:8080"

def test_health_endpoint():
    """Test the health check endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        print(f"✅ Health check: {response.status_code} - {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_patients_endpoint():
    """Test the patients listing endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/patients", timeout=5)
        print(f"✅ Patients list: {response.status_code}")
        patients = response.json()["patients"]
        print(f"   Found {len(patients)} patients")
        return patients[0]["id"] if patients else None
    except Exception as e:
        print(f"❌ Patients list failed: {e}")
        return None

def test_patient_status(patient_id):
    """Test patient status endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/patients/{patient_id}/status", timeout=5)
        print(f"✅ Patient status: {response.status_code}")
        status = response.json()
        print(f"   Patient {patient_id} overall severity: {status.get('overall_severity', 'unknown')}")
        return True
    except Exception as e:
        print(f"❌ Patient status failed: {e}")
        return False

def test_emergency_call(patient_id):
    """Test emergency call endpoint"""
    try:
        payload = {
            "patient_id": patient_id,
            "condition": "Test emergency call from test script"
        }
        response = requests.post(f"{BASE_URL}/api/emergency", json=payload, timeout=5)
        print(f"✅ Emergency call: {response.status_code}")
        emergency = response.json()
        print(f"   Emergency ID: {emergency.get('emergency_id', 'unknown')}")
        return True
    except Exception as e:
        print(f"❌ Emergency call failed: {e}")
        return False

def main():
    print("🏥 Health Monitoring System - API Test")
    print("=" * 50)
    
    print("\n📡 Testing API endpoints...")
    
    # Test health check
    if not test_health_endpoint():
        print("❌ Cannot reach the API. Make sure the backend is running on port 8080")
        return
    
    # Test patients list
    patient_id = test_patients_endpoint()
    if not patient_id:
        print("❌ No patients found in the system")
        return
    
    # Test patient status
    test_patient_status(patient_id)
    
    # Test emergency call
    test_emergency_call(patient_id)
    
    print("\n✅ API testing complete!")
    print(f"\n🌐 Frontend should be accessible at: http://localhost:3000")
    print(f"🔧 Backend API is running at: {BASE_URL}")

if __name__ == "__main__":
    main()