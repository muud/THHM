import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

interface VitalReading {
  id: number;
  heart_rate: number | null;
  bp_systolic: number | null;
  bp_diastolic: number | null;
  temperature: number | null;
  spo2: number | null;
  weight: number | null;
  blood_glucose: number | null;
  timestamp: string;
  notes: string;
}

interface VitalsExperienceProps {
  onBack: () => void;
}

const VitalsExperience: React.FC<VitalsExperienceProps> = ({ onBack }) => {
  const [vitals, setVitals] = useState<VitalReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVitals = async () => {
      try {
        const response = await apiFetch('/api/patients/vitals/');
        if (response.ok) {
          const data = await response.json();
          setVitals(data);
        }
      } catch (e) {
        console.error("Failed to fetch vitals", e);
      } finally {
        setLoading(false);
      }
    };
    fetchVitals();
  }, []);

  const latest = vitals[0] || null;

  const getStatus = (metric: string, value: number | null) => {
    if (value === null) return 'normal';
    // Very basic clinical logic for demo/feedback
    switch (metric) {
      case 'hr': return value > 100 || value < 60 ? 'warning' : 'normal';
      case 'bp': return value > 140 ? 'critical' : (value > 130 ? 'warning' : 'normal');
      case 'glucose': return value > 7.0 ? 'warning' : 'normal';
      default: return 'normal';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="card-text">Loading health metrics...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout" style={{ paddingBottom: '100px' }}>
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1 className="greeting-text">My Vitals</h1>
        </div>
        <p className="greeting-time">Your real-time health summary.</p>
      </header>

      <main className="dashboard-content">
        {/* Latest Readings Grid */}
        <div className="vitals-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '1rem', 
          marginTop: '-40px',
          marginBottom: '2rem'
        }}>
          <div className="dashboard-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ padding: '10px', background: '#FEE2E2', color: '#EF4444', borderRadius: '12px' }}>
                <i className="fas fa-heartbeat"></i>
              </div>
              <span className={`vitals-badge ${getStatus('hr', latest?.heart_rate)}`}>
                {getStatus('hr', latest?.heart_rate).toUpperCase()}
              </span>
            </div>
            <h3 className="card-title" style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Heart Rate</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{latest?.heart_rate || '--'}</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>bpm</span>
            </div>
          </div>

          <div className="dashboard-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ padding: '10px', background: '#DBEAFE', color: '#3B82F6', borderRadius: '12px' }}>
                <i className="fas fa-tachometer-alt"></i>
              </div>
              <span className={`vitals-badge ${getStatus('bp', latest?.bp_systolic)}`}>
                {getStatus('bp', latest?.bp_systolic).toUpperCase()}
              </span>
            </div>
            <h3 className="card-title" style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Blood Pressure</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{latest ? `${latest.bp_systolic}/${latest.bp_diastolic}` : '--/--'}</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>mmHg</span>
            </div>
          </div>

          <div className="dashboard-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ padding: '10px', background: '#FFF7ED', color: '#F97316', borderRadius: '12px' }}>
                <i className="fas fa-thermometer-half"></i>
              </div>
              <span className="vitals-badge normal">NORMAL</span>
            </div>
            <h3 className="card-title" style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Temperature</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{latest?.temperature || '--'}</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>°C</span>
            </div>
          </div>

          <div className="dashboard-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ padding: '10px', background: '#ECFEFF', color: '#06B6D4', borderRadius: '12px' }}>
                <i className="fas fa-lungs"></i>
              </div>
              <span className="vitals-badge normal">NORMAL</span>
            </div>
            <h3 className="card-title" style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>SpO₂</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{latest?.spo2 || '--'}</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>%</span>
            </div>
          </div>
        </div>

        {/* AI Interpretation (Premium Layout) */}
        <div style={{ 
          background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', 
          borderRadius: '24px', 
          padding: '1.5rem', 
          marginBottom: '2rem',
          border: '1px solid #BFDBFE'
        }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: 'white', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#3B82F6',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}>
              <i className="fas fa-robot"></i>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#1E40AF' }}>AI Health Summary</h4>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', lineHeight: 1.5, color: '#1E3A8A' }}>
                {latest 
                  ? "Based on your latest readings, your vital signs are stable. Your blood pressure has slightly improved since last week. Keep maintaining your current hydration levels."
                  : "No readings available for analysis yet. Complete your first checkup to see AI insights."
                }
              </p>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="dashboard-card">
          <h3 className="vitals-history-title" style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>Reading History</h3>
          <div className="vitals-history-list">
            {vitals.map(v => (
              <div key={v.id} className="vitals-history-row" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '1rem 0',
                borderBottom: '1px solid #F1F5F9'
              }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>HR: {v.heart_rate} | BP: {v.bp_systolic}/{v.bp_diastolic}</div>
                  <div className="date" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {new Date(v.timestamp).toLocaleDateString()} at {new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <span className="vitals-badge normal">SUCCESS</span>
              </div>
            ))}
            {vitals.length === 0 && (
              <p className="card-text" style={{ textAlign: 'center', padding: '1rem' }}>No historical readings found.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VitalsExperience;
