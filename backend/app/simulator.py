import asyncio
import random
import json

MANUAL_OVERRIDES = {}

async def generate_vitals(patient_id: str, scenario: str = "normal"):
    """
    Simulates a patient's vital signs and yields them as JSON strings.
    Scenarios supported: normal, sepsis, hypoxia, bradycardia
    """
    # Initial baselines
    heart_rate = 80
    blood_pressure_systolic = 120
    blood_pressure_diastolic = 80
    spO2 = 98
    temperature = 37.0

    while True:
        # Base random walk
        hr_change = random.randint(-2, 2)
        bps_change = random.randint(-3, 3)
        bpd_change = random.randint(-2, 2)
        spo2_change = random.randint(-1, 1)
        temp_change = random.uniform(-0.1, 0.1)

        # Apply scenario conditions
        if scenario == "manual":
            # Override with manual values if they exist, else use current and jitter
            overrides = MANUAL_OVERRIDES.get(patient_id) or {}
            heart_rate = max(30, min(220, overrides.get("heart_rate", heart_rate) + hr_change))
            
            # Parse BP
            bp_str = overrides.get("blood_pressure", f"{int(blood_pressure_systolic)}/{int(blood_pressure_diastolic)}")
            if "/" in bp_str:
                bps, bpd = bp_str.split("/")
                blood_pressure_systolic = max(50, min(200, int(bps) + bps_change))
                blood_pressure_diastolic = max(30, min(120, int(bpd) + bpd_change))
                
            spO2 = max(60, min(100, overrides.get("spO2", spO2) + spo2_change))
            temperature = max(34.0, min(42.0, overrides.get("temperature", temperature) + temp_change))
        else:
            if scenario == "sepsis":
                # Tachycardia, hypotension, fever
                hr_change += random.randint(1, 3)
                bps_change -= random.randint(1, 4)
                bpd_change -= random.randint(1, 2)
                temp_change += random.uniform(0.1, 0.3)
            elif scenario == "hypoxia":
                # Low spO2, slightly elevated HR
                spo2_change -= random.randint(1, 3)
                hr_change += random.randint(0, 2)
            elif scenario == "bradycardia":
                # Low HR
                hr_change -= random.randint(1, 4)

            heart_rate = max(30, min(220, heart_rate + hr_change))
            blood_pressure_systolic = max(50, min(200, blood_pressure_systolic + bps_change))
            blood_pressure_diastolic = max(30, min(120, blood_pressure_diastolic + bpd_change))
            spO2 = max(60, min(100, spO2 + spo2_change))
            temperature = max(34.0, min(42.0, temperature + temp_change))

        vitals = {
            "patient_id": patient_id,
            "heart_rate": int(heart_rate),
            "blood_pressure": f"{int(blood_pressure_systolic)}/{int(blood_pressure_diastolic)}",
            "spO2": int(spO2),
            "temperature": round(temperature, 1),
            "scenario": scenario
        }
        
        # Check condition locally to avoid graph spam
        current_condition = "Normal"
        anomalies = []
        if vitals["heart_rate"] > 100: anomalies.append("Tachycardia")
        if vitals["heart_rate"] < 60: anomalies.append("Bradycardia")
        if int(blood_pressure_systolic) < 90: anomalies.append("Hypotension")
        if vitals["spO2"] < 92: anomalies.append("Hypoxia")
        
        if "Hypoxia" in anomalies: current_condition = "Hypoxia"
        elif "Bradycardia" in anomalies: current_condition = "Bradycardia"
        elif "Tachycardia" in anomalies and "Hypotension" in anomalies: current_condition = "Suspected Sepsis"
        elif anomalies: current_condition = "Abnormal Vitals"

        payload = {"vitals": vitals, "recommendation": None, "thoughts": []}
        
        if current_condition != "Normal":
            from .agents.graph import graph
            state = {"patient_id": patient_id, "vitals": vitals, "anomalies": anomalies}
            config = {"configurable": {"thread_id": patient_id}}
            
            # Record thoughts dynamically
            thoughts = [
                f"[System] Vitals generated for scenario: {scenario}",
                f"[Triage] Anomalies detected: {', '.join(anomalies) if anomalies else 'None'}",
                f"[Pharmacy] Querying guidelines for condition: {current_condition}"
            ]
            
            # Run graph in thread
            result = await asyncio.to_thread(graph.invoke, state, config)
            payload["recommendation"] = result.get("recommendation")
            
            thoughts.append(f"[Reporter] Recommendation formulated. Waiting for physician approval...")
            payload["thoughts"] = thoughts
        else:
            payload["thoughts"] = ["[System] Vitals generated. Normal condition."]

        yield json.dumps(payload)
        await asyncio.sleep(0.5) # Simulate real-time ticking every 0.5 seconds
