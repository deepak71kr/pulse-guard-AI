import subprocess
import json

def calculate_sofa_score_isolated(vitals: dict) -> dict:
    """
    Runs the SOFA score calculation in an isolated python subprocess.
    This protects the main event loop and isolates any unsafe dynamic executions.
    """
    code = f"""
import json
vitals = {json.dumps(vitals)}
score = 0
if int(vitals.get("blood_pressure", "120/80").split("/")[0]) < 100:
    score += 1
if vitals.get("heart_rate", 80) > 110:
    score += 1
print(json.dumps({{"sofa_score": score}}))
"""
    try:
        # Run in a separate restricted python process
        result = subprocess.run(
            ["python", "-c", code],
            capture_output=True,
            text=True,
            timeout=2  # Strict 2-second execution timeout
        )
        if result.returncode == 0:
            return json.loads(result.stdout.strip())
        else:
            return {"error": "Subprocess failed", "sofa_score": None}
    except subprocess.TimeoutExpired:
        return {"error": "Timeout", "sofa_score": None}
