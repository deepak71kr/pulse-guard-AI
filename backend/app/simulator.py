import asyncio
import random
import json

async def generate_vitals(patient_id: str):
    """
    Simulates a patient's vital signs and yields them as JSON strings.
    """
    heart_rate = 80
    blood_pressure_systolic = 120
    blood_pressure_diastolic = 80
    spO2 = 98
    temperature = 37.0

    while True:
        # Random walk for vitals
        heart_rate = max(40, min(200, heart_rate + random.randint(-2, 2)))
        blood_pressure_systolic = max(70, min(200, blood_pressure_systolic + random.randint(-3, 3)))
        blood_pressure_diastolic = max(40, min(120, blood_pressure_diastolic + random.randint(-2, 2)))
        spO2 = max(80, min(100, spO2 + random.randint(-1, 1)))
        temperature = max(35.0, min(41.0, temperature + random.uniform(-0.1, 0.1)))

        vitals = {
            "patient_id": patient_id,
            "heart_rate": heart_rate,
            "blood_pressure": f"{blood_pressure_systolic}/{blood_pressure_diastolic}",
            "spO2": spO2,
            "temperature": round(temperature, 1)
        }
        
        yield json.dumps(vitals)
        await asyncio.sleep(1) # Simulate real-time ticking every second
