from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'multi_tool_agent'))
from agent import monitor_heart_rate, monitor_blood_pressure, monitor_temperature, call_emergency_services, get_patient_status

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "timestamp": datetime.datetime.now().isoformat()})

@app.route('/api/patients/<patient_id>/heart-rate', methods=['GET'])
def get_heart_rate(patient_id):
    try:
        result = monitor_heart_rate(patient_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "error_message": str(e)}), 500

@app.route('/api/patients/<patient_id>/blood-pressure', methods=['GET'])
def get_blood_pressure(patient_id):
    try:
        result = monitor_blood_pressure(patient_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "error_message": str(e)}), 500

@app.route('/api/patients/<patient_id>/temperature', methods=['GET'])
def get_temperature(patient_id):
    try:
        result = monitor_temperature(patient_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "error_message": str(e)}), 500

@app.route('/api/patients/<patient_id>/status', methods=['GET'])
def get_patient_full_status(patient_id):
    try:
        result = get_patient_status(patient_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "error_message": str(e)}), 500

@app.route('/api/emergency', methods=['POST'])
def call_emergency():
    try:
        data = request.get_json()
        patient_id = data.get('patient_id')
        condition = data.get('condition')
        
        if not patient_id or not condition:
            return jsonify({"status": "error", "error_message": "Missing patient_id or condition"}), 400
        
        result = call_emergency_services(patient_id, condition)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "error_message": str(e)}), 500

@app.route('/api/patients', methods=['GET'])
def get_all_patients():
    sample_patients = [
        {"id": "patient-001", "name": "John Doe", "age": 45, "room": "101A"},
        {"id": "patient-002", "name": "Jane Smith", "age": 67, "room": "102B"},
        {"id": "patient-003", "name": "Bob Johnson", "age": 32, "room": "103C"},
        {"id": "patient-004", "name": "Alice Brown", "age": 78, "room": "104D"},
        {"id": "patient-005", "name": "Charlie Wilson", "age": 55, "room": "105E"}
    ]
    return jsonify({"patients": sample_patients})

@app.route('/api/patients/<patient_id>/alerts', methods=['GET'])
def get_patient_alerts(patient_id):
    try:
        status = get_patient_status(patient_id)
        alerts = status.get('alerts', [])
        emergency_responses = status.get('emergency_responses', [])
        
        return jsonify({
            "patient_id": patient_id,
            "alerts": alerts,
            "emergency_responses": emergency_responses,
            "overall_severity": status.get('overall_severity', 'normal'),
            "timestamp": datetime.datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({"status": "error", "error_message": str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({"status": "error", "error_message": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"status": "error", "error_message": "Internal server error"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True)