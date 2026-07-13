from .state import AgentState
from ..schemas import ClinicalRecommendation
from langchain_google_genai import ChatGoogleGenerativeAI
import os

def reporter_node(state: AgentState):
    """
    Reporting Supervisor: Formats the final Pydantic recommendation card using Gemini.
    """
    anomalies = state.get("anomalies", [])
    guidance = state.get("medical_guidance", "Continue monitoring.")
    condition = state.get("condition", "Unknown")
    patient_id = state.get("patient_id", "Unknown")

    if not anomalies:
        rec = ClinicalRecommendation(
            patient_id=patient_id,
            condition_detected=condition,
            severity="Normal",
            recommended_action="Continue monitoring",
            dosage_guidance=None,
            reasoning="Vitals are within normal limits.",
            source_guideline=guidance
        )
        return {"recommendation": rec.model_dump(), "approval_status": "pending"}

    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0)
    structured_llm = llm.with_structured_output(ClinicalRecommendation)
    
    prompt = f"""
    You are an ICU Reporting Supervisor AI. Your job is to format a clinical recommendation based on the following context.
    
    Patient ID: {patient_id}
    Anomalies Detected: {anomalies}
    Condition: {condition}
    Pharmacy Guidance & Dosage: {guidance}
    
    Please provide a structured clinical recommendation. 
    Separate the recommended action from the dosage guidance cleanly.
    Provide a professional, clinical reasoning paragraph.
    Set severity to "Critical" or "Warning" appropriately.
    """
    
    try:
        rec = structured_llm.invoke(prompt)
        rec.patient_id = patient_id
        rec.source_guideline = guidance
    except Exception as e:
        print("Reporter LLM Error:", e)
        rec = ClinicalRecommendation(
            patient_id=patient_id,
            condition_detected=condition,
            severity="Critical",
            recommended_action=guidance,
            dosage_guidance="Refer to protocols",
            reasoning=f"Patient exhibits {', '.join(anomalies)}.",
            source_guideline=guidance
        )
    
    return {"recommendation": rec.model_dump(), "approval_status": "pending"}
