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
  const [scenario, setScenario] = useState('normal');
  const [sliderOverrides, setSliderOverrides] = useState({
    heart_rate: 80,
    bps: 120,
    spO2: 98,
    temperature: 37.0
  });
  const debounceRef = React.useRef(null);
  const latestOverrides = React.useRef({
    heart_rate: 80,
    bps: 120,
    bpd: 80,
    spO2: 98,
    temperature: 37.0
  });

  // When switching to manual, init sliders to current vitals so they don't jump
  useEffect(() => {
    if (scenario === 'manual') {
      let bps = 120, bpd = 80;
      if (vitals.blood_pressure && vitals.blood_pressure !== '--/--') {
        const parts = vitals.blood_pressure.split('/');
        bps = parseInt(parts[0]);
        bpd = parseInt(parts[1]);
      }
      setSliderOverrides({
        heart_rate: parseInt(vitals.heart_rate) || 80,
        bps: bps,
        spO2: parseInt(vitals.spO2) || 98,
        temperature: parseFloat(vitals.temperature) || 37.0
      });
      latestOverrides.current = {
        heart_rate: parseInt(vitals.heart_rate) || 80,
        bps: bps,
        bpd: bpd,
        spO2: parseInt(vitals.spO2) || 98,
        temperature: parseFloat(vitals.temperature) || 37.0
      };
    }
  }, [scenario]);

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket(`ws://localhost:8000/ws/vitals/${patientId}?scenario=${scenario}`);

    ws.onopen = () => {
      setStatus('Connected');
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        // The payload now has vitals, recommendation, and thoughts.
        // We only need vitals for this component, but we dispatch the whole payload for others.
        if (payload.vitals) {
          setVitals(payload.vitals);
          window.dispatchEvent(new CustomEvent('telemetryUpdate', { detail: payload }));
        } else {
          // Fallback if it's the old format
          setVitals(payload);
        }
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
  }, [patientId, scenario]);

  const handleOverride = async () => {
    if (!patientId) return;
    
    const current = latestOverrides.current;
    const payload = {
      heart_rate: parseInt(current.heart_rate),
      blood_pressure: `${current.bps}/${current.bpd}`,
      spO2: parseInt(current.spO2),
      temperature: parseFloat(current.temperature)
    };

    try {
        await fetch(`http://localhost:8000/api/override/${patientId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.error("Failed to send override", e);
    }
  };

  const handleSliderChange = (vitalName, value) => {
    setSliderOverrides(prev => ({ ...prev, [vitalName]: value }));
    latestOverrides.current[vitalName] = value;
    
    // Optimistic UI update for instant feedback
    setVitals(prev => {
      const next = { ...prev };
      if (vitalName === 'heart_rate') next.heart_rate = value;
      if (vitalName === 'spO2') next.spO2 = value;
      if (vitalName === 'temperature') next.temperature = parseFloat(value).toFixed(1);
      if (vitalName === 'bps') {
        const bpd = prev.blood_pressure.split('/')[1] || 80;
        next.blood_pressure = `${value}/${bpd}`;
      }
      return next;
    });

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleOverride();
    }, 150); // Debounce network requests while dragging
  };

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Telemetry</h2>
          <select 
            value={scenario} 
            onChange={(e) => setScenario(e.target.value)}
            style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              color: 'white', 
              border: '1px solid rgba(255, 255, 255, 0.2)', 
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '12px'
            }}
          >
            <option value="normal" style={{ color: 'black' }}>Normal</option>
            <option value="sepsis" style={{ color: 'black' }}>Sepsis</option>
            <option value="hypoxia" style={{ color: 'black' }}>Hypoxia</option>
            <option value="bradycardia" style={{ color: 'black' }}>Bradycardia</option>
            <option value="manual" style={{ color: 'black' }}>Manual Override</option>
          </select>
        </div>
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

      {scenario === 'manual' && (
        <div className="glass-panel" style={{ padding: '16px', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '300px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-warning)', borderBottom: '1px solid rgba(255,159,10,0.3)', paddingBottom: '8px' }}>Manual Overrides</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>Heart Rate ({sliderOverrides.heart_rate})</span>
            </div>
            <input type="range" min="30" max="220" value={sliderOverrides.heart_rate} onChange={(e) => handleSliderChange('heart_rate', e.target.value)} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>BP Systolic ({sliderOverrides.bps})</span>
            </div>
            <input type="range" min="50" max="200" value={sliderOverrides.bps} onChange={(e) => handleSliderChange('bps', e.target.value)} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>SpO2 ({sliderOverrides.spO2})</span>
            </div>
            <input type="range" min="60" max="100" value={sliderOverrides.spO2} onChange={(e) => handleSliderChange('spO2', e.target.value)} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>Temp ({sliderOverrides.temperature})</span>
            </div>
            <input type="range" min="34" max="42" step="0.1" value={sliderOverrides.temperature} onChange={(e) => handleSliderChange('temperature', e.target.value)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TelemetryPanel;
