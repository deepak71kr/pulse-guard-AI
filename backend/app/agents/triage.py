from .state import AgentState
from langchain_google_genai import ChatGoogleGenerativeAI
from ..schemas import TriageResult
import os

def triage_node(state: AgentState):
    """
    Triage Micro-agent: Identifies anomalies in vitals using Gemini.
    """
    vitals = state.get("vitals", {})
    
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0)
    structured_llm = llm.with_structured_output(TriageResult)
    
    prompt = f"""
    You are an expert ICU Triage AI. Analyze the following patient vitals:
    Heart Rate: {vitals.get('heart_rate')} bpm
    Blood Pressure: {vitals.get('blood_pressure')} mmHg
    SpO2: {vitals.get('spO2')}%
    Temperature: {vitals.get('temperature')} C
    
    Determine if there are any anomalies (e.g., Tachycardia if HR > 100, Bradycardia if HR < 60, 
    Hypotension if systolic BP < 90, Hypoxia if SpO2 < 92).
    
    Synthesize a clinical condition based on the anomalies:
    - If Hypoxia, condition is 'Hypoxia'.
    - If Bradycardia, condition is 'Bradycardia'.
    - If Tachycardia AND Hypotension, condition is 'Suspected Sepsis'.
    - If any other anomaly, condition is 'Abnormal Vitals'.
    - Otherwise, condition is 'Normal'.
    """
    
    try:
        result = structured_llm.invoke(prompt)
        return {"anomalies": result.anomalies, "condition": result.condition}
    except Exception as e:
        print("Triage LLM Error:", e)
        return {"anomalies": ["Unknown Anomaly"], "condition": "Abnormal Vitals"}
