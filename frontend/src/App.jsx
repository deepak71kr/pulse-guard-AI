import React, { useState } from 'react';
import TelemetryPanel from './components/TelemetryPanel';
import ThoughtStream from './components/ThoughtStream';
import ActionDeck from './components/ActionDeck';

function App() {
  const [patientId, setPatientId] = useState("patient-1");

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>PulseGuard AI</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Active Patient:</span>
          <select 
            value={patientId} 
            onChange={(e) => setPatientId(e.target.value)}
            style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              color: 'white', 
              border: '1px solid var(--accent-normal)', 
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '14px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="patient-1" style={{ color: 'black' }}>Patient 1 (ICU-A)</option>
            <option value="patient-2" style={{ color: 'black' }}>Patient 2 (ICU-B)</option>
            <option value="patient-3" style={{ color: 'black' }}>Patient 3 (ICU-C)</option>
          </select>
        </div>
      </div>

      <div className="app-container" style={{ flex: 1 }}>
        <TelemetryPanel patientId={patientId} />
        <ThoughtStream patientId={patientId} />
        <ActionDeck patientId={patientId} />
      </div>
    </div>
  );
}

export default App;
