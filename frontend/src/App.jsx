import React from 'react';
import TelemetryPanel from './components/TelemetryPanel';

function App() {
  return (
    <div className="app-container">
      <TelemetryPanel patientId="patient-1" />
      
      <div className="center-panel glass-panel" style={{ flex: 1, overflowY: 'auto' }}>
        <h2 style={{ marginTop: 0 }}>Thought Stream</h2>
        <p className="text-secondary">Agent execution timeline will appear here in Phase 3.</p>
        <div style={{ fontFamily: 'monospace', marginTop: '20px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
          {'>'} System initialized...<br/>
          {'>'} Waiting for anomalies...
        </div>
      </div>

      <div className="right-panel glass-panel" style={{ flex: '0 0 400px' }}>
        <h2 style={{ marginTop: 0 }}>Action Deck</h2>
        <p className="text-secondary">Clinical recommendations will appear here for review.</p>
      </div>
    </div>
  );
}

export default App;
