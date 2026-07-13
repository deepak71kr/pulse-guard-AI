# PulseGuard AI - New Features Definition

Here are the upcoming features to be implemented in the PulseGuard AI system:

## 1. Multi-Patient Management
- **Patient Switching:** The UI must support switching between different patients seamlessly.
- **Patient Simulation:** Ability to simulate telemetry for different users dynamically.

## 2. Patient Data & Reports Upload
- **Report Uploads:** Functionality to upload patient details and medical reports.
- **PostgreSQL Integration:** All uploaded patient details and reports will first be saved in a PostgreSQL database to maintain a structured source of truth.
- **Vector DB Ingestion:** After being saved to PostgreSQL, the text data will be chunked and embedded into the Chroma DB (Vector DB) for Retrieval-Augmented Generation (RAG).

## 3. Interactive Simulation Controls
- **Value Tweaking:** Add slider/scroller bars to the UI allowing the user to manually tweak any telemetry values (e.g., Blood Pressure, Heart Rate) during simulation to test the AI's response in real-time.

## 4. Conversational AI & Reporting
- **Doctor Q&A:** A chat interface where the doctor can ask questions specifically about the patient's current state, history, and guidelines.
- **AI-Generated Reports:** The AI should be able to dynamically generate and provide a comprehensive clinical report when requested by the user.
