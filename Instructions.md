Here is the unified, production-grade master specification and implementation blueprint for **PulseGuard AI**.

---

# 🩺 PulseGuard AI: Master Production Blueprint

PulseGuard AI is an autonomous, event-driven intensive care unit (ICU) telemetry monitor and clinical workflow assistant. By wrapping high-frequency telemetry tracking, local retrieval-augmented generation (RAG), and a multi-agent orchestration mesh inside a **Human-in-the-Loop (HITL)** checkpoint architecture, it transforms raw, noisy ICU machine data into structured, pre-validated, and safety-audited clinical action items.

---

## 🎯 1. Project Goal & Value Proposition

* **The Core Problem:** Traditional ICU monitors trigger binary, isolated threshold alerts (e.g., beeping the second Blood Pressure drops). This raw volatility leads to **alarm fatigue**, where 85% to 95% of beeps are clinically insignificant, desensitizing staff and causing critical systemic conditions to slip through the cracks.
* **The Solution:** PulseGuard AI introduces a stateful clinical intelligence layer. It acts as an ambient resident, executing background **pattern recognition** across multiple vital signs simultaneously, cross-referencing anomalies with local medical guidelines, inspecting the patient's record for contraindications, and generating clear treatment plans.
* **The Objective:** Catch systemic deterioration (like early-stage septic shock) before it reaches a critical, physical emergency. It delivers pre-formatted, verified medication orders directly to the clinician's dashboard, requiring only a single click to sign off and execute.

---

## 🛠️ 2. Finalized Zero-Cost Tech Stack

The architecture is entirely decoupled, running locally with zero cloud subscription overhead, utilizing the free tier of the Gemini API for intelligence processing.

* **Frontend UI:** React (Vanilla JavaScript) scaffolded via Vite.
* **Backend Application Server:** FastAPI managed by a concurrent Uvicorn ASGI process loop.
* **Agentic Orchestration & Graph Logic:** LangChain Core combined with LangGraph for stateful Directed Acyclic Graph (DAG) management.
* **AI Engine Layer:** Gemini API via the free tier of Google AI Studio.
* *Model Tiering Strategy:* `gemini-2.5-flash` handles low-latency routing, Pydantic parsing, and simple structural validations. `gemini-2.5-pro` is invoked specifically for complex multi-agent clinical synthesis.


* **Data Validation Shield:** Pydantic v2.
* **Vector Database (Local Knowledge RAG):** Chroma DB (Embedded Local Deployment running in-process within the Python server framework).
* **AI Observability & Tracing:** Arize Phoenix (Local Open-Source deployment tracking OpenTelemetry spans and execution latency entirely offline).
* **Execution Isolation Sandbox:** Local Restricted Subprocess Execution using native Python resource constraint wrappers to safely compute dynamic formulas (like the SOFA score) away from the main application thread.

---

## 📂 3. Modular Project Structure

To maintain clean separation of concerns, the code workspace is structured into standalone, independent directories:

```text
pulseguard-ai/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI App Entrypoint & WebSocket handling
│   │   ├── database.py         # Mock EHR local data operations (SQLite)
│   │   ├── simulator.py        # Async telemetry vitals generator loop
│   │   ├── schemas.py          # Strict Pydantic Data validation schemas
│   │   ├── agents/
│   │   │   ├── __init__.py
│   │   │   ├── graph.py        # LangGraph State Machine Workflow DAG
│   │   │   ├── triage.py       # Triage Micro-agent node
│   │   │   ├── pharmacy.py     # Pharmacology Specialist node
│   │   │   └── reporter.py     # Final Reporting Supervisor node
│   │   └── rag/
│   │       ├── __init__.py
│   │       ├── vector_store.py # Local Chroma DB interactions
│   │       └── parser.py       # Layout-aware markdown PDF splitter
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── TelemetryPanel.jsx # Real-time ticking vitals cards via WebSockets
    │   │   ├── ThoughtStream.jsx  # Live agent reasoning terminal timeline
    │   │   └── ActionDeck.jsx     # HITL Accordion interactive panel (Approve/Reject)
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js

```

---

## 🔄 4. End-to-End User Flow (The Clinician Journey)

The interaction pattern avoids distracting an already busy physician, requiring zero manual querying or prompting unless an explicit, actionable event occurs.

```
[Ambient Monitoring] ──► Vitals tick silently on the left panel via WebSockets.
          │
[Anomaly Triggered]  ──► Patient vitals deteriorate; agents activate silently in center log.
          │
[Workflow Breakpoint]──► Graph reaches a critical node; state checkpoints to database.
          │
[Action Required]    ──► Right panel alerts flash with a pre-formatted Pydantic clinical brief.
          │
[Physician Decision] ──► Doctor selects: [Approve & Sign], [Modify], or [Reject].
          │
[System Resolution]  ──► Graph resumes, writes to mock EHR database, and vitals stabilize.

```

### Step-by-Step UI Execution Path:

1. **Dashboard Entry:** The physician logs into the workspace terminal screen. The left panel displays live numeric vital cards streaming data streams natively.
2. **Background Processing:** If parameters begin a negative trend, the *Triage Agent* triggers the workflow. The center timeline streams their steps dynamically (*"Querying history...", "Retrieving guidelines..."*), giving the doctor complete structural visibility into the AI's background deduction loop.
3. **The Intervention Prompt:** When a clinical recommendation is finalized, the right panel expands into an accordion view containing a highly structured order card. The execution pipeline pauses completely.
4. **Verification and Execution:** The doctor reviews the linked medical guideline text snippet, updates the dosage parameters if necessary, and hits **Approve & Sign**. The panel clears, the local mock EHR database records the order, and the backend adjusts the patient simulation engine toward recovery metrics.

---

## 🎨 5. Apple-Inspired Human Interface Style Guide

To match a premium, minimal, medical-grade aesthetic, the user interface follows high-contrast Human Interface Guidelines (HIG) optimized for high-stress workspaces.

### Visual Tokens & Style Specification Table

| Attribute | Specification Details | Implementation Intent |
| --- | --- | --- |
| **Typography Family** | `system-ui`, `-apple-system`, `SF Pro Display`, `Inter` | Maximizes geometric readability and legibility under acute stress. |
| **Neutral Canvas** | Pure Slate Dark Background paired with elevated glassmorphism panels. | Reduces optical strain and screen glare during long night shifts. |
| **Semantic Accents** | Soft Emerald (Normal), Amber (Warning), Crimson (Critical Action). | Highlights data hierarchy instantly without causing visual panic. |
| **Layout Density** | Strict flat workspace hierarchy with clean padding (`p-6`, `gap-6`). | Avoids cluttered text blocks; uses open, readable line heights (`leading-relaxed`). |
| **Micro-Interactions** | Smooth ease-in-out transitions (`transition-all duration-300`). | Ensures accordion state changes feel organic and predictable. |

### Component Design Specifications:

* **The Vitals Cards:** Rendered as clean, borderless blocks with bold, high-density numeric values. Rely entirely on background tone adjustments (e.g., shifting from subtle gray to deep crimson) to indicate health transformations.
* **The Thought Stream Timeline:** Fixed monospaced formatting (`font-mono`) inside a muted, dark panel, allowing technical step outputs to scroll cleanly without drawing attention away from primary statistics.
* **The Action Accordion:** Uses prominent, rounded interactive blocks (`rounded-lg`) with high-contrast text typography labels. Active states must include responsive visual hover and focus effects.

---

## 🗓️ 6. Modular Implementation Phases & Milestones

1. **Real-Time Telemetry & Communication Layer (Phase 1):** Milestone: Successful WebSocket telemetry broadcast.
Configure the core project directory architecture. Write the asynchronous telemetry generator loop inside `backend/app/simulator.py` utilizing Python's native event loop. Open the full-duplex WebSocket path (`/ws/vitals/{patient_id}`) inside `main.py` using Uvicorn. Build the React base dashboard using native state variables to render ticking vital metrics on the UI.


2. **The Pydantic Shield & Local Knowledge Base (Phase 2):** Milestone: Deterministic text schemas and error-free local semantic queries.
Enforce strict data integrity by declaring structural **Pydantic v2 schemas** for telemetry inputs and clinical suggestions. Implement local **Chroma DB** files to hold clinical guideline text fragments. Configure a local parsing script using open-source utilities to slice files cleanly along Markdown headers. Code the **HyDE** expansion pipeline using the Gemini API to maximize vector search accuracy.


3. **LangGraph Agent Mesh & Human-in-the-Loop Integration (Phase 3):** Milestone: Graph execution halts at the breakpoint and checks persistent storage.
Map the clinical workflow into a stateful **LangGraph Directed Acyclic Graph (DAG)**. Program three single-purpose micro-agents (*Triage*, *Pharmacy*, *Reporter*) as isolated graph nodes. Add a local SQLite-backed persistent **Checkpointer** to pause execution chains at the prescription stage, forcing a user payload approval check inside the React `ActionDeck` component before completion.


4. **Production Hardening, Sandboxing & Observability (Phase 4):** Milestone: Local calculation sandboxing and end-to-end telemetry auditing.
Set up a secure **Local Subprocess Sandbox** environment to run equations like the SOFA score away from the main server application process. Integrate **Arize Phoenix** via OpenTelemetry hooks to visually map agent execution traces and track token consumption metrics. Wrap all systems inside a clean environment configurations file layer.


---

## 🎛️ Local Workspace Pre-Requisites

Before starting execution within Antigravity, make sure you create your local environment file (`backend/.env`) containing your free access credentials:

```env
GEMINI_API_KEY=your_free_google_ai_studio_api_key_here
PHOENIX_PORT=6006

```