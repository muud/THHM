import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

interface RadiologyExperienceProps {
  onBack: () => void;
}

interface XRayOrder {
  id: number;
  patient_name: string;
  body_part: string;
  clinical_history: string;
  status: string;
  images: Array<{ id: number, image: string }>;
  report?: {
    findings: string;
    impression: string;
    ai_findings: string;
    ai_impression: string;
    patient_explanation: string;
    is_ai_generated: boolean;
  };
}

const RadiologyExperience: React.FC<RadiologyExperienceProps> = ({ onBack }) => {
  const [orders, setOrders] = useState<XRayOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    try {
      // Use the new patient-specific endpoint
      const resp = await apiFetch('/radio/api/orders/my_xrays/');
      if (resp.ok) {
        const data = await resp.json();
        setOrders(data);
      }
    } catch (e) {
      console.error("Failed to fetch radiology orders", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAnalyze = async (orderId: number) => {
    setAnalyzingId(orderId);
    try {
      const resp = await apiFetch(`/radio/api/orders/${orderId}/analyze/`, { method: 'POST' });
      if (resp.ok) {
        await fetchOrders(); // Refresh orders to get the new report
      } else {
        const error = await resp.json();
        alert(`Analysis failed: ${error.error || 'Unknown error'}`);
      }
    } catch (e) {
      console.error("Analysis error", e);
    } finally {
      setAnalyzingId(null);
    }
  };

  if (loading) {
    return (
      <div className="lab-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p className="card-text">Loading your scans...</p>
      </div>
    );
  }

  return (
    <div className="lab-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="booking-step-title" style={{ marginBottom: '0.5rem' }}>Imaging & X-Ray Reports</h1>
          <p className="card-text">View your scans and AI-powered health insights.</p>
        </div>
        <button className="card-button card-button-secondary" style={{ width: 'auto', padding: '0.75rem 1.75rem' }} onClick={onBack}>
          Back to Dashboard
        </button>
      </div>

      <div className="result-list">
        {orders.length === 0 ? (
          <div className="dashboard-card" style={{ textAlign: 'center', padding: '4rem' }}>
            <p className="card-text">No imaging records found. Speak to your doctor if you're expecting a scan.</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="result-item" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
              <div className="result-header">
                <span className="result-name">{order.body_part} X-Ray</span>
                <span className={`status-badge ${order.status === 'reported' ? 'status-normal' : 'status-review'}`}>
                  {order.status === 'reported' ? 'Result Ready' : order.status}
                </span>
              </div>
              
              <div className="plain-language" style={{ marginTop: '1rem', border: 'none', fontStyle: 'italic', padding: 0 }}>
                <strong>Clinical Context:</strong> {order.clinical_history || "Routine screening."}
              </div>

              {order.images.length > 0 && (
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1.25rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                  {order.images.map(img => (
                    <div key={img.id} className="hero-image-container" style={{ width: '200px', height: '200px', flexShrink: 0 }}>
                       <img src={img.image} alt="Scan" className="hero-image" />
                    </div>
                  ))}
                </div>
              )}

              {order.report ? (
                <div className="radiology-report-box" style={{ marginTop: '2rem', padding: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div className="glass-badge" style={{ margin: 0 }}>
                      {order.report.is_ai_generated ? "✨ Gemme 4 AI Diagnostic" : "📋 Clinical Report"}
                    </div>
                  </div>
                  
                  <div className="report-section">
                    <span className="report-label">Observation Findings</span>
                    <p className="report-text" style={{ fontSize: '1rem' }}>{order.report.findings}</p>
                  </div>

                  {order.report.patient_explanation && (
                    <div className="report-section" style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--secondary)' }}>
                      <span className="report-label" style={{ color: 'var(--accent)' }}>What this means for you</span>
                      <p className="report-text" style={{ fontSize: '1.05rem', fontWeight: 500 }}>{order.report.patient_explanation}</p>
                    </div>
                  )}

                  <div className="report-section" style={{ marginBottom: 0 }}>
                    <p className="form-hint" style={{ fontSize: '0.8125rem' }}>
                      Disclaimer: This screening is provided by Gemme 4 AI. Always consult with your primary physician for final clinical assessment.
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '2rem', textAlign: 'center', background: 'var(--secondary)', padding: '3rem', borderRadius: '24px' }}>
                  <h3 className="card-title" style={{ marginBottom: '1rem' }}>Generate Health Report</h3>
                  <p className="card-text" style={{ marginBottom: '1.5rem' }}>
                    Our <strong>Gemme 4 Diagnostic AI</strong> can analyze your imaging and provide a plain-language explanation of findings.
                  </p>
                  <button 
                    className="card-button" 
                    disabled={analyzingId === order.id || order.images.length === 0}
                    onClick={() => handleAnalyze(order.id)}
                    style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', padding: '1rem 2.5rem' }}
                  >
                    {analyzingId === order.id ? "Analyzing Scan..." : "⚡ Generate Gemme 4 Analysis"}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RadiologyExperience;
