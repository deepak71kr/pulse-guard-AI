import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .simulator import generate_vitals

app = FastAPI(title="PulseGuard AI - Telemetry Server")

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

@app.websocket("/ws/vitals/{patient_id}")
async def websocket_endpoint(websocket: WebSocket, patient_id: str):
    await websocket.accept()
    try:
        # Create the generator for the specific patient
        vitals_generator = generate_vitals(patient_id)
        
        async for vitals_json in vitals_generator:
            await websocket.send_text(vitals_json)
            
    except WebSocketDisconnect:
        print(f"Client disconnected for patient {patient_id}")
    except Exception as e:
        print(f"Error: {e}")
