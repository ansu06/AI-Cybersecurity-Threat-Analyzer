"""
Week 5 — FastAPI Endpoint
==========================
AI-Powered Cybersecurity Threat Detection System
AI/ML Team

What this script does:
  1. Loads the trained Random Forest model (Week 3)
  2. Loads the threat response module (Week 4)
  3. Loads the scaler and label encoder (Week 2)
  4. Creates a FastAPI endpoint that:
     - Receives threat data
     - Preprocesses features
     - Predicts attack type
     - Scores severity
     - Generates recommendations
     - Returns JSON response

Requirements:
    pip install fastapi uvicorn pydantic joblib numpy pandas

Usage:
    python week5_fastapi_endpoint.py
    
    Then visit:
    - http://localhost:8000/docs (interactive API docs)
    - http://localhost:8000/predict (POST endpoint)

Testing with fake threat generator:
    python fake_threat_generator.py --url http://localhost:8000/predict
"""

import os
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

# Import threat response module
from week4_threat_response import analyze_threat

# ── Initialize FastAPI app ─────────────────────────────────────────────────────
app = FastAPI(
    title="AI/ML Cybersecurity Threat Detection API",
    description="Detects and analyzes cybersecurity threats using Random Forest ML model",
    version="1.0.0"
)

# ── Load models and preprocessors ──────────────────────────────────────────────
print("\n" + "="*70)
print("Loading models and preprocessors...")
print("="*70)

# Paths
MODEL_PATH = os.path.join("CLEAN", "random_forest_model.pkl")
SCALER_PATH = os.path.join("CLEAN", "scaler.pkl")
ENCODER_PATH = os.path.join("CLEAN", "label_encoder.pkl")

# Load model
try:
    model = joblib.load(MODEL_PATH)
    print(f"✓ Random Forest model loaded from {MODEL_PATH}")
except FileNotFoundError:
    print(f"✗ ERROR: Model not found at {MODEL_PATH}")
    print(f"  Make sure you've run week2_preprocessing.py and week3_model_training.py")
    exit(1)

# Load scaler
try:
    scaler = joblib.load(SCALER_PATH)
    print(f"✓ Scaler loaded from {SCALER_PATH}")
except FileNotFoundError:
    print(f"✗ ERROR: Scaler not found at {SCALER_PATH}")
    exit(1)

# Load label encoder
try:
    label_encoder = joblib.load(ENCODER_PATH)
    print(f"✓ Label encoder loaded from {ENCODER_PATH}")
except FileNotFoundError:
    print(f"✗ ERROR: Label encoder not found at {ENCODER_PATH}")
    exit(1)

print("="*70 + "\n")

# ── Define request/response models ─────────────────────────────────────────────

class ThreatInputRequest(BaseModel):
    """Input format for threat prediction"""
    Destination_Port: float
    Flow_Duration: float
    Total_Fwd_Packets: float
    Total_Backward_Packets: float
    Flow_Bytes_s: float
    Flow_Packets_s: float
    Packet_Length_Mean: float
    Packet_Length_Std: float
    Max_Packet_Length: float
    Min_Packet_Length: float
    SYN_Flag_Count: float
    ACK_Flag_Count: float
    PSH_Flag_Count: float
    FIN_Flag_Count: float
    RST_Flag_Count: float
    Down_Up_Ratio: float
    Average_Packet_Size: float
    Fwd_Packets_s: float
    Bwd_Packets_s: float
    IP_is_internal: float
    IP_octet1: float
    IP_octet2: float
    
    class Config:
        schema_extra = {
            "example": {
                "Destination_Port": 80,
                "Flow_Duration": 1000,
                "Total_Fwd_Packets": 50,
                "Total_Backward_Packets": 45,
                "Flow_Bytes_s": 5000,
                "Flow_Packets_s": 100,
                "Packet_Length_Mean": 512,
                "Packet_Length_Std": 100,
                "Max_Packet_Length": 1500,
                "Min_Packet_Length": 20,
                "SYN_Flag_Count": 1,
                "ACK_Flag_Count": 10,
                "PSH_Flag_Count": 5,
                "FIN_Flag_Count": 0,
                "RST_Flag_Count": 0,
                "Down_Up_Ratio": 0.9,
                "Average_Packet_Size": 500,
                "Fwd_Packets_s": 50,
                "Bwd_Packets_s": 45,
                "IP_is_internal": 1,
                "IP_octet1": 192,
                "IP_octet2": 168
            }
        }


class ThreatPredictionResponse(BaseModel):
    """Output format for threat prediction"""
    attack_type: str
    confidence: float
    severity: str
    recommendations: List[str]
    timestamp: str
    model_version: str = "Week 5 - v1.0"


# ── Health check endpoint ──────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    """Check if the API is running and models are loaded"""
    return {
        "status": "healthy",
        "model": "Random Forest Classifier",
        "version": "Week 5 - v1.0",
        "timestamp": datetime.utcnow().isoformat()
    }


# ── Main prediction endpoint ───────────────────────────────────────────────────

@app.post("/predict", response_model=ThreatPredictionResponse)
def predict_threat(request: ThreatInputRequest):
    """
    Predict threat type, severity, and recommendations.
    
    Takes 22 network flow features and returns:
    - Predicted attack type
    - Confidence score
    - Severity level
    - Mitigation recommendations
    
    Usage:
        curl -X POST "http://localhost:8000/predict" \
             -H "Content-Type: application/json" \
             -d '{"Destination_Port": 80, "Flow_Duration": 1000, ...}'
    """
    
    try:
        # Convert request to DataFrame (must match feature order from Week 2)
        features = [
            request.Destination_Port,
            request.Flow_Duration,
            request.Total_Fwd_Packets,
            request.Total_Backward_Packets,
            request.Flow_Bytes_s,
            request.Flow_Packets_s,
            request.Packet_Length_Mean,
            request.Packet_Length_Std,
            request.Max_Packet_Length,
            request.Min_Packet_Length,
            request.SYN_Flag_Count,
            request.ACK_Flag_Count,
            request.PSH_Flag_Count,
            request.FIN_Flag_Count,
            request.RST_Flag_Count,
            request.Down_Up_Ratio,
            request.Average_Packet_Size,
            request.Fwd_Packets_s,
            request.Bwd_Packets_s,
            request.IP_is_internal,
            request.IP_octet1,
            request.IP_octet2,
        ]
        
        # Normalize features using the scaler from Week 2
        features_scaled = scaler.transform([features])
        
        # Predict using Random Forest model
        prediction_encoded = model.predict(features_scaled)[0]
        prediction_proba = model.predict_proba(features_scaled)[0]
        
        # Decode attack type
        attack_type = label_encoder.inverse_transform([prediction_encoded])[0]
        
        # Get confidence (max probability * 100)
        confidence = float(np.max(prediction_proba) * 100)
        
        # Get severity and recommendations from Week 4 module
        threat_analysis = analyze_threat(
            attack_type=attack_type,
            confidence=confidence,
            traffic_volume=request.Flow_Bytes_s / 1_000_000,  # convert to Mbps
            failed_logins=int(request.SYN_Flag_Count)  # proxy for failed attempts
        )
        
        # Build response
        response = ThreatPredictionResponse(
            attack_type=attack_type,
            confidence=confidence,
            severity=threat_analysis["severity"],
            recommendations=threat_analysis["recommendations"],
            timestamp=datetime.utcnow().isoformat() + "Z"
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")


# ── Demo endpoint for testing ──────────────────────────────────────────────────

@app.post("/predict/demo")
def predict_demo():
    """
    Demo endpoint with a sample DDoS attack for testing.
    
    Use this to verify the API is working without needing to send custom data.
    """
    
    sample_ddos = ThreatInputRequest(
        Destination_Port=80,
        Flow_Duration=100,
        Total_Fwd_Packets=5000,
        Total_Backward_Packets=4500,
        Flow_Bytes_s=50_000_000,  # 50 Mbps
        Flow_Packets_s=10000,
        Packet_Length_Mean=512,
        Packet_Length_Std=100,
        Max_Packet_Length=1500,
        Min_Packet_Length=20,
        SYN_Flag_Count=1000,  # high SYN for DDoS
        ACK_Flag_Count=50,
        PSH_Flag_Count=10,
        FIN_Flag_Count=0,
        RST_Flag_Count=500,  # high RST for DDoS
        Down_Up_Ratio=0.9,
        Average_Packet_Size=500,
        Fwd_Packets_s=5000,
        Bwd_Packets_s=4500,
        IP_is_internal=0,  # external source
        IP_octet1=203,
        IP_octet2=99
    )
    
    return predict_threat(sample_ddos)


# ── Run the server ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("\n" + "="*70)
    print("  Starting FastAPI Server")
    print("="*70)
    print("\n  API Documentation:")
    print("    - Interactive Docs: http://localhost:8000/docs")
    print("    - ReDoc:           http://localhost:8000/redoc")
    print("\n  Endpoints:")
    print("    - GET  /health         — Check if API is running")
    print("    - POST /predict        — Make threat prediction")
    print("    - POST /predict/demo   — Test with sample DDoS data")
    print("\n  Test with fake threat generator:")
    print("    python fake_threat_generator.py --url http://localhost:8000/predict")
    print("\n" + "="*70 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
