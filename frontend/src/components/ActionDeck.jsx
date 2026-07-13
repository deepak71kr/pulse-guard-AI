import React, { useState, useEffect } from 'react';
import { Check, X, Edit2 } from 'lucide-react';

const ActionDeck = ({ patientId }) => {
  const [status, setStatus] = useState('pending'); // pending, approved, rejected
  const [recommendation, setRecommendation] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editAction, setEditAction] = useState("");
  const [editDosage, setEditDosage] = useState("");

  // Load from localStorage on mount or patient change
  useEffect(() => {
    if (patientId) {
      const savedStatus = localStorage.getItem(`actionDeck_status_${patientId}`);
      const savedRec = localStorage.getItem(`actionDeck_rec_${patientId}`);
      if (savedStatus) setStatus(savedStatus);
      if (savedRec) setRecommendation(JSON.parse(savedRec));
    }
  }, [patientId]);

  // Save to localStorage when changed
  useEffect(() => {
    if (patientId) {
      localStorage.setItem(`actionDeck_status_${patientId}`, status);
      if (recommendation) {
        localStorage.setItem(`actionDeck_rec_${patientId}`, JSON.stringify(recommendation));
      } else {
        localStorage.removeItem(`actionDeck_rec_${patientId}`);
      }
    }
  }, [status, recommendation, patientId]);

  useEffect(() => {
    const handleTelemetry = (e) => {
      const payload = e.detail;
      if (payload.recommendation) {
        setRecommendation(payload.recommendation);
        // Reset status if we get a new critical condition after being normal
        if (!recommendation) {
            setStatus('pending');
        }
      } else {
        setRecommendation(null);
        setStatus('pending');
      }
    };
    window.addEventListener('telemetryUpdate', handleTelemetry);
    return () => window.removeEventListener('telemetryUpdate', handleTelemetry);
  }, [recommendation]);

  const handleApprove = async () => {
    setStatus('approved');
    try {
      await fetch('http://localhost:8000/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recommendation)
      });
      // Optionally trigger an event so ThoughtStream can refetch history
      window.dispatchEvent(new CustomEvent('historyUpdated', { detail: { patientId } }));
    } catch (e) {
      console.error("Failed to log approval", e);
    }
  };

  const handleEditClick = () => {
    setEditAction(recommendation.recommended_action);
    setEditDosage(recommendation.dosage_guidance || "");
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setRecommendation({
      ...recommendation,
      recommended_action: editAction,
      dosage_guidance: editDosage
    });
    setIsEditing(false);
  };

  if (!recommendation) {
    return (
      <div className="right-panel glass-panel" style={{ flex: '0 0 400px' }}>
        <h2 style={{ marginTop: 0 }}>Action Deck</h2>
        <div style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-secondary)', marginTop: 0 }}>Monitoring</h3>
          <p className="text-secondary">Vitals are stable. No clinical interventions required.</p>
        </div>
      </div>
    );
  }

  if (status === 'approved') {
    return (
      <div className="right-panel glass-panel" style={{ flex: '0 0 400px' }}>
        <h2 style={{ marginTop: 0 }}>Action Deck</h2>
        <div style={{ padding: '24px', background: 'rgba(52, 199, 89, 0.1)', borderRadius: '12px', borderLeft: '4px solid var(--accent-normal)' }}>
          <h3 style={{ color: 'var(--accent-normal)', marginTop: 0 }}>Order Approved</h3>
          <p>Medication orders have been sent to pharmacy and logged in the EHR.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="right-panel glass-panel" style={{ flex: '0 0 400px' }}>
      <h2 style={{ marginTop: 0 }}>Action Deck</h2>
      <p className="text-secondary">Clinical recommendations for review.</p>
      
      <div style={{ marginTop: '20px', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', borderTop: '4px solid var(--accent-critical)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent-critical)', textTransform: 'uppercase', fontWeight: 'bold' }}>Critical Action Required</div>
        <h3 style={{ margin: '8px 0' }}>{recommendation.condition_detected}</h3>
        
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '14px', margin: '4px 0', color: 'var(--text-secondary)' }}><strong>Reasoning:</strong> {recommendation.reasoning}</p>
        </div>
        
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>Recommended Order:</div>
          {isEditing ? (
            <>
              <textarea 
                value={editAction} 
                onChange={(e) => setEditAction(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--accent-normal)', borderRadius: '4px', padding: '8px', marginBottom: '8px', fontFamily: 'monospace' }}
                rows={3}
              />
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Dosage:</div>
              <input 
                type="text" 
                value={editDosage} 
                onChange={(e) => setEditDosage(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--accent-normal)', borderRadius: '4px', padding: '8px', fontSize: '12px' }}
              />
            </>
          ) : (
            <>
              <div style={{ fontFamily: 'monospace', color: 'var(--accent-normal)' }}>{recommendation.recommended_action}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Dosage: {recommendation.dosage_guidance}</div>
            </>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {isEditing ? (
             <button onClick={handleSaveEdit} style={{ flex: 1, padding: '10px', background: 'var(--accent-normal)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
               <Check size={18} /> Save Changes
             </button>
          ) : (
            <>
              <button onClick={handleApprove} style={{ flex: 1, padding: '10px', background: 'var(--accent-normal)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Check size={18} /> Approve
              </button>
              <button onClick={handleEditClick} style={{ padding: '10px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Edit2 size={18} />
              </button>
              <button onClick={() => setStatus('rejected')} style={{ padding: '10px', background: 'rgba(255,69,58,0.2)', color: 'var(--accent-critical)', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionDeck;
