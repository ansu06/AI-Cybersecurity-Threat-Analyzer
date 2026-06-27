"""
Fake Threat Generator
---------------------
Simulates incoming network threat data and sends it to the FastAPI endpoint.
Keeps the AI/ML team unblocked from the backend team during development.

Usage:
    python fake_threat_generator.py               # sends 1 random threat
    python fake_threat_generator.py --count 10    # sends 10 threats
    python fake_threat_generator.py --loop        # runs continuously every 2 seconds
    python fake_threat_generator.py --url http://your-server:8000/predict

Requirements:
    pip install requests
"""

import random
import time
import json
import argparse
import requests
from datetime import datetime

# ── Config ────────────────────────────────────────────────────────────────────
DEFAULT_URL = "http://localhost:8000/predict"

ATTACK_PROFILES = {
    "Brute Force": {
        "login_attempts":        lambda: random.randint(200, 1000),
        "failed_authentications": lambda: random.randint(150, 950),
        "request_frequency":     lambda: random.randint(50, 300),
        "traffic_volume":        lambda: round(random.uniform(0.1, 2.0), 2),
        "port_number":           lambda: random.choice([22, 3389, 21, 23]),
        "protocol_type":         lambda: random.choice(["TCP", "UDP"]),
    },
    "Port Scan": {
        "login_attempts":        lambda: random.randint(0, 5),
        "failed_authentications": lambda: random.randint(0, 5),
        "request_frequency":     lambda: random.randint(500, 2000),
        "traffic_volume":        lambda: round(random.uniform(0.01, 0.5), 2),
        "port_number":           lambda: random.randint(1, 65535),
        "protocol_type":         lambda: "TCP",
    },
    "DoS": {
        "login_attempts":        lambda: random.randint(0, 10),
        "failed_authentications": lambda: random.randint(0, 10),
        "request_frequency":     lambda: random.randint(1000, 5000),
        "traffic_volume":        lambda: round(random.uniform(50, 200), 2),
        "port_number":           lambda: random.choice([80, 443, 8080]),
        "protocol_type":         lambda: random.choice(["TCP", "UDP"]),
    },
    "DDoS": {
        "login_attempts":        lambda: random.randint(0, 5),
        "failed_authentications": lambda: random.randint(0, 5),
        "request_frequency":     lambda: random.randint(5000, 20000),
        "traffic_volume":        lambda: round(random.uniform(200, 1000), 2),
        "port_number":           lambda: random.choice([80, 443]),
        "protocol_type":         lambda: random.choice(["TCP", "UDP"]),
    },
    "Web Attack": {
        "login_attempts":        lambda: random.randint(5, 50),
        "failed_authentications": lambda: random.randint(2, 30),
        "request_frequency":     lambda: random.randint(20, 200),
        "traffic_volume":        lambda: round(random.uniform(0.5, 10), 2),
        "port_number":           lambda: random.choice([80, 443, 8080, 8443]),
        "protocol_type":         lambda: "TCP",
    },
    "Normal": {
        "login_attempts":        lambda: random.randint(0, 5),
        "failed_authentications": lambda: random.randint(0, 2),
        "request_frequency":     lambda: random.randint(1, 30),
        "traffic_volume":        lambda: round(random.uniform(0.01, 1.0), 2),
        "port_number":           lambda: random.choice([80, 443, 22, 3306]),
        "protocol_type":         lambda: random.choice(["TCP", "UDP"]),
    },
}


def random_ip():
    """Generate a random IPv4 address."""
    return f"{random.randint(1, 254)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}"


def generate_threat(attack_type=None):
    """Build a single fake threat payload."""
    if attack_type is None:
        # Weighted so Normal is less common — makes testing more interesting
        weights = [3, 3, 2, 2, 2, 1]  # BF, PortScan, DoS, DDoS, WebAtk, Normal
        attack_type = random.choices(list(ATTACK_PROFILES.keys()), weights=weights, k=1)[0]

    profile = ATTACK_PROFILES[attack_type]
    payload = {
        "source_ip":             random_ip(),
        "timestamp":             datetime.utcnow().isoformat() + "Z",
        "login_attempts":        profile["login_attempts"](),
        "failed_authentications": profile["failed_authentications"](),
        "request_frequency":     profile["request_frequency"](),
        "traffic_volume":        profile["traffic_volume"](),
        "port_number":           profile["port_number"](),
        "protocol_type":         profile["protocol_type"](),
        # Ground truth label included so you can verify the model's prediction
        "_expected_label":       attack_type,
    }
    return payload


def send_threat(payload, url):
    """POST the payload to the FastAPI endpoint and print the response."""
    # Strip the internal ground-truth label before sending
    send_payload = {k: v for k, v in payload.items() if not k.startswith("_")}
    try:
        resp = requests.post(url, json=send_payload, timeout=5)
        result = resp.json()
        print(f"[{payload['timestamp']}]")
        print(f"  Sent     → {payload['source_ip']} | {payload['_expected_label']}")
        print(f"  Predicted→ {result.get('attack_type', 'N/A')} "
              f"| Confidence: {result.get('confidence', 'N/A')}% "
              f"| Severity: {result.get('severity', 'N/A')}")
        print(f"  Action   → {result.get('recommendation', 'N/A')}")
        print()
    except requests.exceptions.ConnectionError:
        print(f"[ERROR] Could not connect to {url}")
        print("        Make sure your FastAPI server is running.")
        print()
    except Exception as e:
        print(f"[ERROR] {e}")
        print()


def dry_run(payload):
    """Print the payload locally without sending — useful before API is ready."""
    print(json.dumps(payload, indent=2))
    print()


# ── CLI ───────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Fake Threat Generator for AI/ML testing")
    parser.add_argument("--url",    default=DEFAULT_URL,  help="FastAPI endpoint URL")
    parser.add_argument("--count",  type=int, default=1,  help="Number of threats to send")
    parser.add_argument("--loop",   action="store_true",  help="Send continuously every 2 seconds")
    parser.add_argument("--type",   default=None,         help="Force a specific attack type")
    parser.add_argument("--dry",    action="store_true",  help="Print payloads without sending")
    parser.add_argument("--delay",  type=float, default=2.0, help="Delay in seconds between sends (loop mode)")
    args = parser.parse_args()

    print("=" * 55)
    print("  Fake Threat Generator — AI/ML Cybersecurity Project")
    print("=" * 55)
    if args.dry:
        print("  Mode: DRY RUN (not sending to API)")
    else:
        print(f"  Target: {args.url}")
    print()

    if args.loop:
        print("  Running in loop mode. Press Ctrl+C to stop.\n")
        try:
            while True:
                payload = generate_threat(args.type)
                if args.dry:
                    dry_run(payload)
                else:
                    send_threat(payload, args.url)
                time.sleep(args.delay)
        except KeyboardInterrupt:
            print("\nStopped.")
    else:
        for _ in range(args.count):
            payload = generate_threat(args.type)
            if args.dry:
                dry_run(payload)
            else:
                send_threat(payload, args.url)


if __name__ == "__main__":
    main()
