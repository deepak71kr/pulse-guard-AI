from pydantic import BaseModel, Field
from typing import Optional

class VitalsRecord(BaseModel):
    patient_id: str
    heart_rate: int = Field(..., ge=0, description="Heart rate in bpm")
    blood_pressure: str = Field(..., pattern=r"^\d{2,3}/\d{2,3}$", description="BP in systolic/diastolic format")
    spO2: int = Field(..., ge=0, le=100, description="Oxygen saturation percentage")
    temperature: float = Field(..., description="Body temperature in Celsius")

class ClinicalRecommendation(BaseModel):
    patient_id: str
    condition_detected: str = Field(..., description="The medical condition deduced by the AI")
    severity: str = Field(..., description="Normal, Warning, or Critical")
    recommended_action: str = Field(..., description="Specific, actionable medication or intervention order")
    dosage_guidance: Optional[str] = Field(None, description="Recommended dosage if applicable")
    reasoning: str = Field(..., description="Brief explanation for the recommendation")
    source_guideline: Optional[str] = Field(None, description="The RAG text snippet backing this decision")

class TriageResult(BaseModel):
    anomalies: list[str] = Field(..., description="List of detected anomalies, e.g., Tachycardia, Hypotension")
    condition: str = Field(..., description="Synthesized clinical condition, e.g., Suspected Sepsis, Hypoxia, Bradycardia, or Normal")
