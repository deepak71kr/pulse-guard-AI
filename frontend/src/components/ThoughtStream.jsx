import React, { useState, useEffect } from 'react';

const ThoughtStream = ({ patientId }) => {
  const [thoughts, setThoughts] = useState([
    "[System] System initialized...",
    "[System] Waiting for anomalies..."
  ]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('thoughts');

  // Load thoughts from localStorage
  useEffect(() => {
    if (patientId) {
      const savedThoughts = localStorage.getItem(`thoughtStream_${patientId}`);
      if (savedThoughts) {
        setThoughts(JSON.parse(savedThoughts));
      }
    }
  }, [patientId]);

  // Save thoughts to localStorage
  useEffect(() => {
    if (patientId) {
      localStorage.setItem(`thoughtStream_${patientId}`, JSON.stringify(thoughts));
    }
  }, [thoughts, patientId]);

  // Fetch history
  const fetchHistory = async () => {
    if (!patientId) return;
    try {
      const res = await fetch(`http://localhost:8000/api/history/${patientId}`);
      const data = await res.json();
      if (data.status === 'success') {
        setHistory(data.history);
      }
    } catch (e) {
      console.error("Failed to fetch history", e);
    }
  };

  useEffect(() => {
    fetchHistory();
    const handleHistoryUpdated = (e) => {
      if (e.detail.patientId === patientId) {
        fetchHistory();
      }
    };
    window.addEventListener('historyUpdated', handleHistoryUpdated);
    return () => window.removeEventListener('historyUpdated', handleHistoryUpdated);
  }, [patientId]);

  useEffect(() => {
    const handleTelemetry = (e) => {
      const payload = e.detail;
      if (payload.thoughts && payload.thoughts.length > 0) {
        setThoughts(payload.thoughts);
      }
    };
    window.addEventListener('telemetryUpdate', handleTelemetry);
    return () => window.removeEventListener('telemetryUpdate', handleTelemetry);
  }, []);

  const getColor = (thought) => {
    if (thought.includes('[Triage]')) return 'var(--accent-warning)';
    if (thought.includes('[Pharmacy]')) return 'var(--accent-blue)';
    if (thought.includes('[Reporter]')) return 'var(--accent-critical)';
    return 'var(--text-secondary)';
  };

  return (
    <div className="center-panel glass-panel" style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px', paddingBottom: '8px' }}>
        <div>
          <h2 style={{ margin: 0, marginTop: 0 }}>Clinical Workspace</h2>
          <p className="text-secondary" style={{ margin: '4px 0 0 0', fontSize: '14px' }}>Agent execution and records</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            onClick={() => setActiveTab('thoughts')}
            style={{
              background: 'none', border: 'none', color: activeTab === 'thoughts' ? 'var(--accent-normal)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'thoughts' ? 'bold' : 'normal', cursor: 'pointer', fontSize: '14px', padding: '0 0 4px 0',
              borderBottom: activeTab === 'thoughts' ? '2px solid var(--accent-normal)' : '2px solid transparent'
            }}
          >
            Live Thoughts
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              background: 'none', border: 'none', color: activeTab === 'history' ? 'var(--accent-normal)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'history' ? 'bold' : 'normal', cursor: 'pointer', fontSize: '14px', padding: '0 0 4px 0',
              borderBottom: activeTab === 'history' ? '2px solid var(--accent-normal)' : '2px solid transparent'
            }}
          >
            Patient History
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'thoughts' ? (
          <div style={{ fontFamily: 'monospace', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', flex: 1, overflowY: 'auto' }}>
            {thoughts.map((thought, i) => (
              <div key={i} style={{ color: getColor(thought), marginTop: thought.includes('[Triage]') ? '16px' : '4px' }}>
                {'>'} {thought}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '16px', background: 'rgba(52, 199, 89, 0.05)', borderRadius: '8px', flex: 1, overflowY: 'auto', border: '1px solid rgba(52, 199, 89, 0.2)' }}>
            {history.length > 0 ? (
              history.map((record, i) => (
                <div key={i} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(record.timestamp).toLocaleString()}</div>
                  <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{record.condition}</div>
                  <div style={{ fontFamily: 'monospace', color: 'var(--accent-normal)', margin: '4px 0' }}>{record.action}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{record.reasoning}</div>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '20px' }}>No approved interventions yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThoughtStream;
