"""
Week 2 — Preprocessing Pipeline
================================
AI-Powered Cybersecurity Threat Detection System
AI/ML Team

What this script does:
  1. Loads all raw CSV files from RAW/
  2. Fixes all dirty data issues (NaN, Inf, duplicates, column name spaces)
  3. Engineers Source IP into usable numerical features
  4. Encodes Protocol Type as numbers
  5. Selects the final feature set
  6. Normalizes all numerical features
  7. Merges everything into one clean dataset
  8. Splits into train (80%) and test (20%) sets
  9. Saves all outputs to CLEAN/

Requirements:
    pip install pandas numpy scikit-learn joblib

Usage:
    python week2_preprocessing.py
"""

import os
import glob
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
import joblib

# ── Paths ─────────────────────────────────────────────────────────────────────
RAW_DIR       = "RAW"             # folder with your CSV files
OUTPUT_DIR    = "CLEAN"           # folder where outputs will be saved
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── Label Mapping ─────────────────────────────────────────────────────────────
# Standardize all attack label variants into clean categories
LABEL_MAP = {
    "BENIGN":           "Benign",
    "benign":           "Benign",
    "Benign":           "Benign",
    "DDoS":             "DDoS",
    "DoS Hulk":         "DoS",
    "DoS GoldenEye":    "DoS",
    "DoS slowloris":    "DoS",
    "DoS Slowhttptest": "DoS",
    "Heartbleed":       "DoS",
    "PortScan":         "PortScan",
    "FTP-Patator":      "Brute Force",
    "SSH-Patator":      "Brute Force",
    "Bot":              "Botnet",
    "Web Attack – Brute Force":    "Web Attack",
    "Web Attack – XSS":            "Web Attack",
    "Web Attack – Sql Injection":  "Web Attack",
    "Infiltration":                "Infiltration",
}

# ── Feature Selection ─────────────────────────────────────────────────────────
# These are the final features the model will train on.
# Selected to match the backend's input parameters.
SELECTED_FEATURES = [
    "Destination Port",
    "Flow Duration",
    "Total Fwd Packets",
    "Total Backward Packets",
    "Flow Bytes/s",
    "Flow Packets/s",
    "Packet Length Mean",
    "Packet Length Std",
    "Max Packet Length",
    "Min Packet Length",
    "SYN Flag Count",
    "ACK Flag Count",
    "PSH Flag Count",
    "FIN Flag Count",
    "RST Flag Count",
    "Down/Up Ratio",
    "Average Packet Size",
    "Fwd Packets/s",
    "Bwd Packets/s",
    # Engineered IP features (added in step below)
    "IP_is_internal",
    "IP_octet1",
    "IP_octet2",
]


# ══════════════════════════════════════════════════════════════════════════════
# STEP 1 — Load all raw CSV files
# ══════════════════════════════════════════════════════════════════════════════
def load_all_csvs(raw_dir):
    csv_files = glob.glob(os.path.join(raw_dir, "*.csv"))
    if not csv_files:
        raise FileNotFoundError(
            f"No CSV files found in '{raw_dir}'. "
            "Make sure your raw CSV files are in the RAW/ folder."
        )

    print(f"\n{'='*55}")
    print("STEP 1 — Loading raw CSV files")
    print(f"{'='*55}")

    frames = []
    for f in csv_files:
        df = pd.read_csv(f, low_memory=False)
        print(f"  Loaded: {os.path.basename(f)} — {df.shape[0]:,} rows")
        frames.append(df)

    combined = pd.concat(frames, ignore_index=True)
    print(f"\n  Total rows loaded: {combined.shape[0]:,}")
    print(f"  Total columns:     {combined.shape[1]}")
    return combined


# ══════════════════════════════════════════════════════════════════════════════
# STEP 2 — Fix column names (strip leading/trailing spaces)
# ══════════════════════════════════════════════════════════════════════════════
def fix_column_names(df):
    print(f"\n{'='*55}")
    print("STEP 2 — Fixing column names")
    print(f"{'='*55}")

    before = df.columns.tolist()
    df.columns = df.columns.str.strip()
    after = df.columns.tolist()

    fixed = sum(1 for a, b in zip(before, after) if a != b)
    print(f"  Fixed {fixed} column names with leading/trailing spaces")
    return df


# ══════════════════════════════════════════════════════════════════════════════
# STEP 3 — Remove duplicates
# ══════════════════════════════════════════════════════════════════════════════
def remove_duplicates(df):
    print(f"\n{'='*55}")
    print("STEP 3 — Removing duplicate rows")
    print(f"{'='*55}")

    before = len(df)
    df = df.drop_duplicates()
    removed = before - len(df)
    print(f"  Removed: {removed:,} duplicate rows")
    print(f"  Remaining: {len(df):,} rows")
    return df


# ══════════════════════════════════════════════════════════════════════════════
# STEP 4 — Handle infinite values and NaN
# ══════════════════════════════════════════════════════════════════════════════
def handle_missing_and_inf(df):
    print(f"\n{'='*55}")
    print("STEP 4 — Removing infinite values and NaN")
    print(f"{'='*55}")

    # Replace inf/-inf with NaN first so we can drop them all at once
    before_inf = np.isinf(df.select_dtypes(include=np.number)).sum().sum()
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    print(f"  Infinite values replaced with NaN: {before_inf:,}")

    before_nan = df.isnull().sum().sum()
    before_rows = len(df)
    df.dropna(inplace=True)
    print(f"  NaN values removed: {before_nan:,}")
    print(f"  Rows dropped:       {before_rows - len(df):,}")
    print(f"  Remaining rows:     {len(df):,}")
    return df


# ══════════════════════════════════════════════════════════════════════════════
# STEP 5 — Standardize labels
# ══════════════════════════════════════════════════════════════════════════════
def standardize_labels(df):
    print(f"\n{'='*55}")
    print("STEP 5 — Standardizing attack labels")
    print(f"{'='*55}")

    df["Label"] = df["Label"].str.strip().map(LABEL_MAP)

    # Drop any rows whose label wasn't in our map
    unknown = df["Label"].isnull().sum()
    if unknown > 0:
        print(f"  WARNING: {unknown} rows had unknown labels — dropping them")
        df = df.dropna(subset=["Label"])

    print("  Label distribution after standardization:")
    for label, count in df["Label"].value_counts().items():
        print(f"    {label:<20} {count:>10,} rows")
    return df


# ══════════════════════════════════════════════════════════════════════════════
# STEP 6 — Engineer Source IP features
# ══════════════════════════════════════════════════════════════════════════════
def engineer_ip_features(df):
    print(f"\n{'='*55}")
    print("STEP 6 — Engineering Source IP features")
    print(f"{'='*55}")

    if "Source IP" not in df.columns:
        print("  'Source IP' column not found — skipping (already absent in this dataset)")
        df["IP_is_internal"] = 0
        df["IP_octet1"] = 0
        df["IP_octet2"] = 0
        return df

    def is_internal(ip):
        try:
            parts = str(ip).split(".")
            if parts[0] == "10":               return 1
            if parts[0] == "172" and 16 <= int(parts[1]) <= 31: return 1
            if parts[0] == "192" and parts[1] == "168": return 1
            return 0
        except:
            return 0

    def get_octet(ip, n):
        try:
            return int(str(ip).split(".")[n])
        except:
            return 0

    df["IP_is_internal"] = df["Source IP"].apply(is_internal)
    df["IP_octet1"]      = df["Source IP"].apply(lambda x: get_octet(x, 0))
    df["IP_octet2"]      = df["Source IP"].apply(lambda x: get_octet(x, 1))

    print("  Created: IP_is_internal, IP_octet1, IP_octet2")
    print(f"  Internal IPs: {df['IP_is_internal'].sum():,} | External: {(df['IP_is_internal']==0).sum():,}")
    return df


# ══════════════════════════════════════════════════════════════════════════════
# STEP 7 — Encode Protocol Type
# ══════════════════════════════════════════════════════════════════════════════
def encode_protocol(df):
    print(f"\n{'='*55}")
    print("STEP 7 — Encoding Protocol Type")
    print(f"{'='*55}")

    if "Protocol" not in df.columns:
        print("  'Protocol' column not found — skipping")
        return df

    # CICIDS2017 stores protocol as numeric already (6=TCP, 17=UDP, 0=other)
    # Map to simplified 0/1/2
    protocol_map = {6: 0, 17: 1}
    df["Protocol"] = df["Protocol"].map(protocol_map).fillna(2).astype(int)
    print("  TCP (6) → 0 | UDP (17) → 1 | Other → 2")
    print(f"  Protocol distribution: {df['Protocol'].value_counts().to_dict()}")
    return df


# ══════════════════════════════════════════════════════════════════════════════
# STEP 8 — Select features
# ══════════════════════════════════════════════════════════════════════════════
def select_features(df):
    print(f"\n{'='*55}")
    print("STEP 8 — Selecting features")
    print(f"{'='*55}")

    available = [f for f in SELECTED_FEATURES if f in df.columns]
    missing   = [f for f in SELECTED_FEATURES if f not in df.columns]

    if missing:
        print(f"  WARNING: These features not found in dataset: {missing}")
        print("  They will be skipped.")

    print(f"  Using {len(available)} features: {available}")
    return df[available + ["Label"]]


# ══════════════════════════════════════════════════════════════════════════════
# STEP 9 — Normalize numerical features
# ══════════════════════════════════════════════════════════════════════════════
def normalize_features(df):
    print(f"\n{'='*55}")
    print("STEP 9 — Normalizing numerical features (StandardScaler)")
    print(f"{'='*55}")

    feature_cols = [c for c in df.columns if c != "Label"]
    scaler = StandardScaler()
    df[feature_cols] = scaler.fit_transform(df[feature_cols])

    # Save scaler for use during prediction
    joblib.dump(scaler, os.path.join(OUTPUT_DIR, "scaler.pkl"))
    print(f"  Normalized {len(feature_cols)} feature columns")
    print(f"  Scaler saved → {OUTPUT_DIR}/scaler.pkl")
    return df, scaler


# ══════════════════════════════════════════════════════════════════════════════
# STEP 10 — Encode labels and split
# ══════════════════════════════════════════════════════════════════════════════
def encode_and_split(df):
    print(f"\n{'='*55}")
    print("STEP 10 — Encoding labels and splitting dataset")
    print(f"{'='*55}")

    le = LabelEncoder()
    df["Label_encoded"] = le.fit_transform(df["Label"])

    # Save encoder
    joblib.dump(le, os.path.join(OUTPUT_DIR, "label_encoder.pkl"))
    print(f"  Label classes: {list(le.classes_)}")
    print(f"  Encoder saved → {OUTPUT_DIR}/label_encoder.pkl")

    X = df.drop(columns=["Label", "Label_encoded"])
    y = df["Label_encoded"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"\n  Training set:  {X_train.shape[0]:,} rows ({X_train.shape[1]} features)")
    print(f"  Test set:      {X_test.shape[0]:,} rows")
    return X_train, X_test, y_train, y_test, le


# ══════════════════════════════════════════════════════════════════════════════
# STEP 11 — Save outputs
# ══════════════════════════════════════════════════════════════════════════════
def save_outputs(X_train, X_test, y_train, y_test, df_clean):
    print(f"\n{'='*55}")
    print("STEP 11 — Saving outputs")
    print(f"{'='*55}")

    X_train.to_csv(os.path.join(OUTPUT_DIR, "X_train.csv"), index=False)
    X_test.to_csv(os.path.join(OUTPUT_DIR, "X_test.csv"),  index=False)
    y_train.to_csv(os.path.join(OUTPUT_DIR, "y_train.csv"), index=False)
    y_test.to_csv(os.path.join(OUTPUT_DIR, "y_test.csv"),  index=False)
    df_clean.to_csv(os.path.join(OUTPUT_DIR, "full_clean_dataset.csv"), index=False)

    print(f"  X_train.csv          → {OUTPUT_DIR}/")
    print(f"  X_test.csv           → {OUTPUT_DIR}/")
    print(f"  y_train.csv          → {OUTPUT_DIR}/")
    print(f"  y_test.csv           → {OUTPUT_DIR}/")
    print(f"  full_clean_dataset.csv → {OUTPUT_DIR}/")
    print(f"  scaler.pkl           → {OUTPUT_DIR}/")
    print(f"  label_encoder.pkl    → {OUTPUT_DIR}/")


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("\n" + "="*55)
    print("  Week 2 — Preprocessing Pipeline")
    print("  CICIDS2017 | AI/ML Cybersecurity Project")
    print("="*55)

    df = load_all_csvs(RAW_DIR)
    df = fix_column_names(df)
    df = remove_duplicates(df)
    df = handle_missing_and_inf(df)
    df = standardize_labels(df)
    df = engineer_ip_features(df)
    df = encode_protocol(df)
    df = select_features(df)
    df, scaler = normalize_features(df)
    X_train, X_test, y_train, y_test, le = encode_and_split(df)
    save_outputs(X_train, X_test, y_train, y_test, df)

    print(f"\n{'='*55}")
    print("  ✅ Preprocessing complete!")
    print(f"  All outputs saved to: {OUTPUT_DIR}/")
    print(f"{'='*55}\n")
