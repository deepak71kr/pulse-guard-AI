import asyncio
import os
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .simulator import generate_vitals, MANUAL_OVERRIDES
from .sandbox import calculate_sofa_score_isolated
from .schemas import ClinicalRecommendation
from .database import init_db, log_approval, get_patient_history
from pydantic import BaseModel
from .agents.graph import graph

# Phoenix / OpenTelemetry Integration
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from openinference.instrumentation.langchain import LangChainInstrumentor
from opentelemetry import trace as trace_api
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk import trace as trace_sdk
from opentelemetry.sdk.trace.export import BatchSpanProcessor

endpoint = "http://127.0.0.1:6006/v1/traces"
tracer_provider = trace_sdk.TracerProvider()
trace_api.set_tracer_provider(tracer_provider)
tracer_provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(endpoint)))

LangChainInstrumentor().instrument()

init_db()

app = FastAPI(title="PulseGuard AI - Telemetry Server")

# Instrument FastAPI
FastAPIInstrumentor.instrument_app(app)

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "PulseGuard AI Telemetry Server Running"}

@app.post("/api/approve")
def approve_recommendation(rec: ClinicalRecommendation):
    # Log to local SQLite mock EHR
    log_approval(rec.model_dump())
    
    # Resume graph (human-in-the-loop)
    config = {"configurable": {"thread_id": rec.patient_id}}
    graph.update_state(config, {"approval_status": "approved"}, as_node="human_approval")
    # Execute the remainder of the graph
    graph.invoke(None, config)
    
    return {"status": "approved", "message": "Order successfully verified and logged."}

@app.get("/api/history/{patient_id}")
def get_history(patient_id: str):
    history = get_patient_history(patient_id)
    return {"status": "success", "history": history}

class ManualOverride(BaseModel):
    heart_rate: int
    blood_pressure: str
    spO2: int
    temperature: float

@app.post("/api/override/{patient_id}")
def override_vitals(patient_id: str, overrides: ManualOverride):
    MANUAL_OVERRIDES[patient_id] = overrides.model_dump()
    return {"status": "success", "message": "Overrides applied"}

@app.websocket("/ws/vitals/{patient_id}")
async def websocket_endpoint(websocket: WebSocket, patient_id: str, scenario: str = "normal"):
    await websocket.accept()
    try:
        # Create the generator for the specific patient
        vitals_generator = generate_vitals(patient_id, scenario=scenario)
        
        async for vitals_json in vitals_generator:
            await websocket.send_text(vitals_json)
            
    except WebSocketDisconnect:
        print(f"Client disconnected for patient {patient_id}")
    except Exception as e:
        print(f"Error: {e}")
