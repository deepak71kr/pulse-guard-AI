from typing import TypedDict, List, Optional

class AgentState(TypedDict):
    patient_id: str
    vitals: dict
    anomalies: List[str]
    condition: Optional[str]
    medical_guidance: Optional[str]
    recommendation: Optional[dict]
    approval_status: Optional[str] # pending, approved, rejected
