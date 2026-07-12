import React, { useState, useEffect } from 'react';
import { HeartPulse, Droplets, Activity, Thermometer } from 'lucide-react';

const TelemetryPanel = ({ patientId = "patient-1" }) => {
  const [vitals, setVitals] = useState({
    heart_rate: '--',
    blood_pressure: '--/--',
    spO2: '--',
    temperature: '--'
  });
  const [status, setStatus] = useState('Connecting...');

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket(`ws://localhost:8000/ws/vitals/${patientId}`);

    ws.onopen = () => {
      setStatus('Connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setVitals(data);
      } catch (e) {
        console.error("Error parsing vitals data:", e);
      }
    };

    ws.onclose = () => {
      setStatus('Disconnected');
    };

    return () => {
      ws.close();
    };
  }, [patientId]);

  const getCardStatus = (vitalName, value) => {
    if (value === '--') return 'card-normal';
    
    if (vitalName === 'heart_rate') {
      if (value < 50 || value > 120) return 'card-critical';
      if (value < 60 || value > 100) return 'card-warning';
      return 'card-normal';
    }
    
    if (vitalName === 'spO2') {
      if (value < 90) return 'card-critical';
      if (value < 95) return 'card-warning';
      return 'card-normal';
    }

    if (vitalName === 'temperature') {
      if (value > 39 || value < 35) return 'card-critical';
      if (value > 37.5) return 'card-warning';
      return 'card-normal';
    }
    
    return 'card-normal';
  };

  return (
    <div className="left-panel">
      <div style={{ padding: '0 12px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Telemetry</h2>
        <p className="text-secondary" style={{ fontSize: '12px', marginTop: '4px' }}>
          Status: <span style={{ color: status === 'Connected' ? 'var(--accent-normal)' : 'var(--accent-warning)' }}>{status}</span>
        </p>
      </div>

      <div className={`glass-panel vitals-card ${getCardStatus('heart_rate', vitals.heart_rate)}`}>
        <div className="vitals-header">
          <span className="vitals-title">Heart Rate</span>
          <HeartPulse size={20} className={getCardStatus('heart_rate', vitals.heart_rate) === 'card-critical' ? 'text-critical' : 'text-secondary'} />
        </div>
        <div>
          <span className="vitals-value">{vitals.heart_rate}</span>
          <span className="vitals-unit">bpm</span>
        </div>
      </div>

      <div className="glass-panel vitals-card card-normal">
        <div className="vitals-header">
          <span className="vitals-title">Blood Pressure</span>
          <Activity size={20} className="text-secondary" />
        </div>
        <div>
          <span className="vitals-value">{vitals.blood_pressure}</span>
          <span className="vitals-unit">mmHg</span>
        </div>
      </div>

      <div className={`glass-panel vitals-card ${getCardStatus('spO2', vitals.spO2)}`}>
        <div className="vitals-header">
          <span className="vitals-title">SpO2</span>
          <Droplets size={20} className={getCardStatus('spO2', vitals.spO2) === 'card-critical' ? 'text-critical' : 'text-secondary'} />
        </div>
        <div>
          <span className="vitals-value">{vitals.spO2}</span>
          <span className="vitals-unit">%</span>
        </div>
      </div>

      <div className={`glass-panel vitals-card ${getCardStatus('temperature', vitals.temperature)}`}>
        <div className="vitals-header">
          <span className="vitals-title">Body Temp</span>
          <Thermometer size={20} className={getCardStatus('temperature', vitals.temperature) === 'card-critical' ? 'text-critical' : 'text-secondary'} />
        </div>
        <div>
          <span className="vitals-value">{vitals.temperature}</span>
          <span className="vitals-unit">°C</span>
        </div>
      </div>
    </div>
  );
};

export default TelemetryPanel;
