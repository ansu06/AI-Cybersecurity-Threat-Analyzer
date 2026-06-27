"""
Week 4 — Threat Response Module
================================
AI-Powered Cybersecurity Threat Detection System
AI/ML Team

What this module does:
  1. Severity Scoring — assigns threat level (Low/Medium/High/Critical)
  2. Recommendation Engine — suggests specific mitigation actions
  3. Threat Analysis — ties everything together

This is rule-based (not ML), so it's deterministic and easy to customize.

Usage:
    from week4_threat_response import analyze_threat
    
    result = analyze_threat(
        attack_type="DDoS",
        confidence=95.2,
        traffic_volume=500,
        failed_logins=0
    )
    print(result)
    
Output:
    {
        "attack_type": "DDoS",
        "confidence": 95.2,
        "severity": "High",
        "recommendations": ["Activate DDoS protection service / WAF", ...]
    }
"""

import json


# ══════════════════════════════════════════════════════════════════════════════
# SEVERITY SCORING MODULE
# ══════════════════════════════════════════════════════════════════════════════

def score_severity(attack_type, confidence, traffic_volume, failed_logins):
    """
    Assign a threat severity level based on attack characteristics.
    
    Args:
        attack_type (str): Type of attack (e.g., 'DDoS', 'PortScan', 'Brute Force')
        confidence (float): Model confidence (0-100)
        traffic_volume (float): Traffic volume in Mbps
        failed_logins (int): Number of failed authentication attempts
        
    Returns:
        str: Severity level ('Low', 'Medium', 'High', 'Critical')
    """
    
    severity = "Low"  # default
    
    # ── DDoS Attack ───────────────────────────────────────────────────────────
    if attack_type == "DDoS":
        if traffic_volume > 1000:
            severity = "Critical"
        elif traffic_volume > 200:
            severity = "High"
        elif traffic_volume > 50:
            severity = "Medium"
        else:
            severity = "Low"
    
    # ── DoS Attack ─────────────────────────────────────────────────────────────
    elif attack_type == "DoS":
        if traffic_volume > 500:
            severity = "Critical"
        elif traffic_volume > 100:
            severity = "High"
        elif traffic_volume > 20:
            severity = "Medium"
        else:
            severity = "Low"
    
    # ── Brute Force ────────────────────────────────────────────────────────────
    elif attack_type == "Brute Force":
        if failed_logins > 500:
            severity = "Critical"
        elif failed_logins > 100:
            severity = "High"
        elif failed_logins > 20:
            severity = "Medium"
        else:
            severity = "Low"
    
    # ── Port Scan ──────────────────────────────────────────────────────────────
    elif attack_type == "PortScan":
        if traffic_volume > 100:  # high traffic during scan
            severity = "High"
        elif traffic_volume > 20:
            severity = "Medium"
        else:
            severity = "Low"
    
    # ── Web Attack ─────────────────────────────────────────────────────────────
    elif attack_type == "Web Attack":
        if confidence > 95:
            severity = "High"
        elif confidence > 85:
            severity = "Medium"
        else:
            severity = "Low"
    
    # ── Botnet Attack ──────────────────────────────────────────────────────────
    elif attack_type == "Botnet":
        if confidence > 90:
            severity = "High"
        elif confidence > 80:
            severity = "Medium"
        else:
            severity = "Low"
    
    # ── Infiltration ───────────────────────────────────────────────────────────
    elif attack_type == "Infiltration":
        # Infiltration is always high severity due to data breach risk
        if confidence > 80:
            severity = "Critical"
        else:
            severity = "High"
    
    # ── Benign (no threat) ─────────────────────────────────────────────────────
    elif attack_type == "Benign":
        severity = "Low"
    
    # ── Adjust for low confidence ──────────────────────────────────────────────
    if confidence < 75 and severity != "Low":
        # Reduce severity by one level if confidence is low
        if severity == "Critical":
            severity = "High"
        elif severity == "High":
            severity = "Medium"
        elif severity == "Medium":
            severity = "Low"
    
    return severity


# ══════════════════════════════════════════════════════════════════════════════
# RECOMMENDATION ENGINE
# ══════════════════════════════════════════════════════════════════════════════

def get_recommendations(attack_type, severity):
    """
    Generate mitigation recommendations based on attack type and severity.
    
    Args:
        attack_type (str): Type of attack
        severity (str): Severity level
        
    Returns:
        list: List of recommendation strings
    """
    
    recommendations = []
    
    # ── DDoS Attack ────────────────────────────────────────────────────────────
    if attack_type == "DDoS":
        recommendations.append("Activate DDoS protection service / WAF")
        recommendations.append("Implement rate limiting on endpoints")
        if severity == "Critical":
            recommendations.append("Scale infrastructure / enable auto-scaling")
            recommendations.append("Contact ISP for upstream filtering")
            recommendations.append("Isolate affected services if possible")
        elif severity == "High":
            recommendations.append("Increase server capacity / monitoring")
            recommendations.append("Block traffic from suspected source IP")
        else:
            recommendations.append("Monitor attack patterns")
    
    # ── DoS Attack ─────────────────────────────────────────────────────────────
    elif attack_type == "DoS":
        recommendations.append("Enable DoS detection rules")
        recommendations.append("Implement connection limits")
        if severity == "Critical":
            recommendations.append("Trigger incident response protocol")
            recommendations.append("Review all connections for patterns")
        elif severity == "High":
            recommendations.append("Block source IP address")
        recommendations.append("Review firewall logs")
    
    # ── Brute Force Attack ─────────────────────────────────────────────────────
    elif attack_type == "Brute Force":
        recommendations.append("Enable Multi-Factor Authentication (MFA)")
        recommendations.append("Implement login rate limiting (e.g., 5 attempts per minute)")
        if severity == "Critical":
            recommendations.append("Block source IP for 24+ hours")
            recommendations.append("Force password reset for affected accounts")
            recommendations.append("Enable account lockout after 5 failed attempts")
        elif severity == "High":
            recommendations.append("Block source IP temporarily")
            recommendations.append("Review recent login attempts in audit logs")
        else:
            recommendations.append("Monitor login attempts")
    
    # ── Port Scan ──────────────────────────────────────────────────────────────
    elif attack_type == "PortScan":
        recommendations.append("Close unused ports via firewall rules")
        recommendations.append("Update firewall to block reconnaissance traffic")
        if severity == "High":
            recommendations.append("Block source IP for suspicious scanning")
            recommendations.append("Enable IDS/IPS on network perimeter")
        recommendations.append("Review firewall logs for additional scan sources")
        recommendations.append("Hide service banners and version information")
    
    # ── Web Attack (XSS, SQLi, etc.) ───────────────────────────────────────────
    elif attack_type == "Web Attack":
        recommendations.append("Apply Web Application Firewall (WAF) rules")
        recommendations.append("Review and patch vulnerable endpoints immediately")
        recommendations.append("Sanitize all user input on affected forms")
        if severity == "High":
            recommendations.append("Take vulnerable application offline if critical")
            recommendations.append("Review application logs for successful attacks")
        recommendations.append("Implement Content Security Policy (CSP) headers")
        recommendations.append("Enable input validation on all forms")
    
    # ── Botnet / Malware ───────────────────────────────────────────────────────
    elif attack_type == "Botnet":
        recommendations.append("Isolate affected system from network")
        recommendations.append("Run full malware scan on the host")
        recommendations.append("Check for C&C communication attempts")
        if severity == "High":
            recommendations.append("Preserve forensic evidence before remediation")
            recommendations.append("Review process execution and network logs")
        recommendations.append("Update antivirus signatures")
        recommendations.append("Monitor for lateral movement to other systems")
    
    # ── Infiltration / APT ─────────────────────────────────────────────────────
    elif attack_type == "Infiltration":
        recommendations.append("TRIGGER FULL INCIDENT RESPONSE PROTOCOL")
        recommendations.append("Preserve all forensic evidence immediately")
        recommendations.append("Check for lateral movement to other systems")
        recommendations.append("Review ALL authentication logs for compromised accounts")
        recommendations.append("Isolate critical systems if compromise confirmed")
        recommendations.append("Contact security incident response team")
        recommendations.append("Prepare to notify affected stakeholders")
    
    # ── Benign (no recommendations needed) ──────────────────────────────────────
    elif attack_type == "Benign":
        recommendations.append("No action needed - traffic appears normal")
    
    # ── Unknown attack type ────────────────────────────────────────────────────
    else:
        recommendations.append("Review threat details manually")
        recommendations.append("Check threat intelligence databases")
    
    return recommendations if recommendations else ["Review threat manually"]


# ══════════════════════════════════════════════════════════════════════════════
# MAIN THREAT ANALYSIS FUNCTION
# ══════════════════════════════════════════════════════════════════════════════

def analyze_threat(attack_type, confidence, traffic_volume=0, failed_logins=0):
    """
    Analyze an incoming threat and return severity + recommendations.
    
    This is the main function you'll call from your FastAPI endpoint.
    
    Args:
        attack_type (str): Predicted attack type from ML model
        confidence (float): Confidence score from ML model (0-100)
        traffic_volume (float): Network traffic volume in Mbps (default 0)
        failed_logins (int): Count of failed authentication attempts (default 0)
        
    Returns:
        dict: JSON-ready response with threat analysis
        
    Example:
        result = analyze_threat("DDoS", 97.4, traffic_volume=500)
        print(json.dumps(result, indent=2))
    """
    
    # Score severity
    severity = score_severity(attack_type, confidence, traffic_volume, failed_logins)
    
    # Get recommendations
    recommendations = get_recommendations(attack_type, severity)
    
    # Build response
    response = {
        "attack_type": attack_type,
        "confidence": round(confidence, 2),
        "severity": severity,
        "recommendations": recommendations,
        "timestamp": None  # backend will add this
    }
    
    return response


# ══════════════════════════════════════════════════════════════════════════════
# TEST CASES
# ══════════════════════════════════════════════════════════════════════════════

def run_tests():
    """Run test cases to verify the threat response module works correctly."""
    
    print("\n" + "="*70)
    print("Week 4 — Threat Response Module — Test Suite")
    print("="*70)
    
    # Test cases: (name, attack_type, confidence, traffic_volume, failed_logins, expected_severity)
    test_cases = [
        # DDoS tests
        ("DDoS - Critical (1500 Mbps)", "DDoS", 95, 1500, 0, "Critical"),
        ("DDoS - High (500 Mbps)", "DDoS", 95, 500, 0, "High"),
        ("DDoS - Medium (75 Mbps)", "DDoS", 90, 75, 0, "Medium"),
        ("DDoS - Low (10 Mbps)", "DDoS", 85, 10, 0, "Low"),
        
        # Brute Force tests
        ("Brute Force - Critical (800 failed)", "Brute Force", 98, 0, 800, "Critical"),
        ("Brute Force - High (150 failed)", "Brute Force", 97, 0, 150, "High"),
        ("Brute Force - Medium (30 failed)", "Brute Force", 95, 0, 30, "Medium"),
        ("Brute Force - Low (5 failed)", "Brute Force", 92, 0, 5, "Low"),
        
        # Port Scan tests
        ("Port Scan - High (150 Mbps)", "PortScan", 93, 150, 0, "High"),
        ("Port Scan - Medium (40 Mbps)", "PortScan", 90, 40, 0, "Medium"),
        ("Port Scan - Low (5 Mbps)", "PortScan", 88, 5, 0, "Low"),
        
        # Web Attack tests
        ("Web Attack - High (98% conf)", "Web Attack", 98, 0, 0, "High"),
        ("Web Attack - Medium (87% conf)", "Web Attack", 87, 0, 0, "Medium"),
        ("Web Attack - Low (75% conf)", "Web Attack", 75, 0, 0, "Low"),
        
        # Infiltration (always high severity)
        ("Infiltration - Critical (92% conf)", "Infiltration", 92, 0, 0, "Critical"),
        ("Infiltration - High (75% conf)", "Infiltration", 75, 0, 0, "High"),
        
        # Botnet tests
        ("Botnet - High (95% conf)", "Botnet", 95, 0, 0, "High"),
        ("Botnet - Medium (82% conf)", "Botnet", 82, 0, 0, "Medium"),
        
        # Benign (should always be Low)
        ("Benign traffic", "Benign", 99, 0, 0, "Low"),
        
        # Low confidence should reduce severity
        ("High attack, low confidence", "DDoS", 50, 500, 0, "Medium"),  # Would be High, reduced to Medium
    ]
    
    passed = 0
    failed = 0
    
    for test_name, attack_type, confidence, traffic_volume, failed_logins, expected_severity in test_cases:
        severity = score_severity(attack_type, confidence, traffic_volume, failed_logins)
        status = "✓ PASS" if severity == expected_severity else "✗ FAIL"
        
        if severity == expected_severity:
            passed += 1
        else:
            failed += 1
        
        print(f"\n{status}  {test_name}")
        print(f"       Expected: {expected_severity}, Got: {severity}")
    
    print(f"\n{'='*70}")
    print(f"Results: {passed} passed, {failed} failed out of {len(test_cases)} tests")
    print(f"{'='*70}\n")
    
    # Show sample output
    print("Sample Threat Analysis Output:")
    print("="*70)
    result = analyze_threat("DDoS", 97.4, traffic_volume=500, failed_logins=0)
    print(json.dumps(result, indent=2))
    print("="*70 + "\n")


# ══════════════════════════════════════════════════════════════════════════════
# RUN TESTS
# ══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    run_tests()
