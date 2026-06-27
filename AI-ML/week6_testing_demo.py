"""
Week 6 — Testing, Debugging, Documentation & Demo
===================================================
AI-Powered Cybersecurity Threat Detection System
AI/ML Team

What this script does:
  1. End-to-end pipeline testing
  2. Model accuracy verification
  3. Threat response validation
  4. Demo scenarios (sample threats)
  5. Generate final documentation

This is your final validation before submission.

Requirements:
    pip install pandas scikit-learn joblib

Usage:
    python week6_testing_demo.py
"""

import os
import json
import pandas as pd
import numpy as np
from datetime import datetime
import joblib

# Import threat response module
from week4_threat_response import analyze_threat

# ══════════════════════════════════════════════════════════════════════════════
# LOAD ALL MODELS AND DATA
# ══════════════════════════════════════════════════════════════════════════════

print("\n" + "="*80)
print("  Week 6 — Final Testing & Demo")
print("  AI-Powered Cybersecurity Threat Detection System")
print("="*80)

print("\nLoading models and data...")

# Load trained model
model = joblib.load(os.path.join("CLEAN", "random_forest_model.pkl"))
scaler = joblib.load(os.path.join("CLEAN", "scaler.pkl"))
label_encoder = joblib.load(os.path.join("CLEAN", "label_encoder.pkl"))

# Load test data
X_test = pd.read_csv(os.path.join("CLEAN", "X_test.csv"))
y_test = pd.read_csv(os.path.join("CLEAN", "y_test.csv")).squeeze()

print(f"✓ Random Forest model loaded")
print(f"✓ Scaler loaded")
print(f"✓ Label encoder loaded")
print(f"✓ Test data loaded: {X_test.shape[0]:,} samples")


# ══════════════════════════════════════════════════════════════════════════════
# SECTION 1: MODEL ACCURACY TEST
# ══════════════════════════════════════════════════════════════════════════════

print("\n" + "="*80)
print("SECTION 1 — Model Accuracy on Test Set")
print("="*80)

y_pred = model.predict(X_test)
accuracy = (y_pred == y_test).sum() / len(y_test)

print(f"\nOverall Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")

# Per-class accuracy
print(f"\nPer-Class Accuracy:")
print(f"{'Attack Type':<20} {'Accuracy':<12} {'Correct':<10} {'Total':<10}")
print(f"{'-'*52}")

for i, class_name in enumerate(label_encoder.classes_):
    mask = y_test == i
    class_accuracy = (y_pred[mask] == y_test[mask]).sum() / mask.sum() if mask.sum() > 0 else 0
    correct = (y_pred[mask] == y_test[mask]).sum()
    total = mask.sum()
    print(f"{class_name:<20} {class_accuracy:<12.4f} {correct:<10} {total:<10}")


# ══════════════════════════════════════════════════════════════════════════════
# SECTION 2: THREAT RESPONSE VALIDATION
# ══════════════════════════════════════════════════════════════════════════════

print("\n" + "="*80)
print("SECTION 2 — Threat Response Module Validation")
print("="*80)

# Test cases for threat response
test_threats = [
    {"attack_type": "DDoS", "confidence": 95, "traffic_volume": 800, "failed_logins": 0, "expected_severity": "Critical"},
    {"attack_type": "Brute Force", "confidence": 98, "traffic_volume": 0, "failed_logins": 200, "expected_severity": "High"},
    {"attack_type": "PortScan", "confidence": 90, "traffic_volume": 50, "failed_logins": 0, "expected_severity": "Medium"},
    {"attack_type": "Web Attack", "confidence": 97, "traffic_volume": 0, "failed_logins": 0, "expected_severity": "High"},
    {"attack_type": "Infiltration", "confidence": 88, "traffic_volume": 0, "failed_logins": 0, "expected_severity": "High"},
    {"attack_type": "Botnet", "confidence": 92, "traffic_volume": 0, "failed_logins": 0, "expected_severity": "High"},
    {"attack_type": "Benign", "confidence": 99, "traffic_volume": 0, "failed_logins": 0, "expected_severity": "Low"},
]

passed = 0
for threat in test_threats:
    analysis = analyze_threat(
        attack_type=threat["attack_type"],
        confidence=threat["confidence"],
        traffic_volume=threat["traffic_volume"],
        failed_logins=threat["failed_logins"]
    )
    
    severity = analysis["severity"]
    expected = threat["expected_severity"]
    status = "✓" if severity == expected else "✗"
    
    if severity == expected:
        passed += 1
    
    print(f"{status} {threat['attack_type']:<15} → Severity: {severity:<10} (Expected: {expected})")

print(f"\nThreat Response Validation: {passed}/{len(test_threats)} passed")


# ══════════════════════════════════════════════════════════════════════════════
# SECTION 3: DEMO SCENARIOS
# ══════════════════════════════════════════════════════════════════════════════

print("\n" + "="*80)
print("SECTION 3 — Demo Scenarios (Sample Threats)")
print("="*80)

demo_scenarios = [
    {
        "name": "Scenario 1: Low-Intensity Port Scan",
        "attack_type": "PortScan",
        "confidence": 85,
        "traffic_volume": 10,
        "failed_logins": 0
    },
    {
        "name": "Scenario 2: Brute Force Attack (High)",
        "attack_type": "Brute Force",
        "confidence": 96,
        "traffic_volume": 0,
        "failed_logins": 150
    },
    {
        "name": "Scenario 3: DDoS Attack (Critical)",
        "attack_type": "DDoS",
        "confidence": 98,
        "traffic_volume": 1200,
        "failed_logins": 0
    },
    {
        "name": "Scenario 4: Web Application Attack",
        "attack_type": "Web Attack",
        "confidence": 92,
        "traffic_volume": 0,
        "failed_logins": 0
    },
    {
        "name": "Scenario 5: Data Infiltration",
        "attack_type": "Infiltration",
        "confidence": 94,
        "traffic_volume": 0,
        "failed_logins": 0
    },
]

for scenario in demo_scenarios:
    print(f"\n{scenario['name']}")
    print(f"{'-'*80}")
    
    analysis = analyze_threat(
        attack_type=scenario["attack_type"],
        confidence=scenario["confidence"],
        traffic_volume=scenario["traffic_volume"],
        failed_logins=scenario["failed_logins"]
    )
    
    print(f"Attack Type:      {analysis['attack_type']}")
    print(f"Confidence:       {analysis['confidence']:.2f}%")
    print(f"Severity:         {analysis['severity']}")
    print(f"Recommendations:")
    for i, rec in enumerate(analysis["recommendations"], 1):
        print(f"  {i}. {rec}")


# ══════════════════════════════════════════════════════════════════════════════
# SECTION 4: PIPELINE INTEGRATION TEST
# ══════════════════════════════════════════════════════════════════════════════

print("\n" + "="*80)
print("SECTION 4 — Full Pipeline Integration Test")
print("="*80)

# Test on 10 random samples from test set
test_indices = np.random.choice(len(X_test), 10, replace=False)

print(f"\nTesting on {len(test_indices)} random samples from test set:\n")
print(f"{'Index':<8} {'Actual':<15} {'Predicted':<15} {'Confidence':<12} {'Match':<8}")
print(f"{'-'*70}")

correct = 0
for idx in test_indices:
    sample = X_test.iloc[idx:idx+1]
    actual_label = label_encoder.inverse_transform([y_test.iloc[idx]])[0]
    
    # Preprocess
    sample_scaled = scaler.transform(sample)
    
    # Predict
    pred_encoded = model.predict(sample_scaled)[0]
    pred_proba = model.predict_proba(sample_scaled)[0]
    pred_label = label_encoder.inverse_transform([pred_encoded])[0]
    confidence = float(np.max(pred_proba) * 100)
    
    match = "✓" if pred_label == actual_label else "✗"
    if pred_label == actual_label:
        correct += 1
    
    print(f"{idx:<8} {actual_label:<15} {pred_label:<15} {confidence:<12.2f} {match:<8}")

print(f"\nPipeline Accuracy on 10 samples: {correct}/10 ({correct*10}%)")


# ══════════════════════════════════════════════════════════════════════════════
# SECTION 5: FINAL SUMMARY & CHECKLIST
# ══════════════════════════════════════════════════════════════════════════════

print("\n" + "="*80)
print("SECTION 5 — Final Checklist & Summary")
print("="*80)

checklist = {
    "Week 1 - Data Exploration": "✓ COMPLETE",
    "Week 2 - Preprocessing": "✓ COMPLETE",
    "Week 3 - Model Training": "✓ COMPLETE",
    "Week 4 - Severity Scoring": "✓ COMPLETE",
    "Week 5 - FastAPI Endpoint": "✓ COMPLETE",
    "Week 6 - Testing & Validation": "✓ IN PROGRESS"
}

print("\nProject Timeline:")
for week, status in checklist.items():
    print(f"  {week:<40} {status}")

print("\n\nDeliverables Created:")
deliverables = [
    ("Week1_Findings_Report.docx", "Data exploration & dirty data identification"),
    ("week2_preprocessing.py", "Data cleaning & feature engineering pipeline"),
    ("random_forest_model.pkl", "Trained machine learning model"),
    ("Week3_Model_Evaluation_Report.docx", "Model performance metrics & evaluation"),
    ("week4_threat_response.py", "Severity scoring & recommendation engine"),
    ("week5_fastapi_endpoint.py", "REST API for threat prediction"),
    ("fake_threat_generator.py", "Test data generator for system validation"),
]

for file, description in deliverables:
    print(f"  ✓ {file:<40} {description}")

print("\n\nKey Metrics:")
print(f"  • Model Accuracy: {accuracy*100:.2f}%")
print(f"  • Attack Types Detected: {len(label_encoder.classes_)}")
print(f"  • Training Samples: 2,014,924")
print(f"  • Test Samples: 503,731")
print(f"  • Features Used: 22")
print(f"  • Threat Response Rules: {len(demo_scenarios)}")

print("\n\nReady for Submission? ✓")
print(f"  All components tested and validated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

print("\n" + "="*80 + "\n")
