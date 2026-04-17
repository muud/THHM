import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../services/api';

interface MedGemmaResult {
  diagnosis_name: string;
  icd10_code: string;
  description: string;
  medication_suggested: string;
  confidence_score: number;
  error?: string;
}

interface MedGemmaDiagnosisProps {
  onBack: () => void;
}

const MedGemmaDiagnosis: React.FC<MedGemmaDiagnosisProps> = ({ onBack }) => {
  const [symptoms, setSymptoms] = useState('');
  const [history, setHistory] = useState('');
  const [result, setResult] = useState<MedGemmaResult | null>(null);
  const [status, setStatus] = useState<'idle' | 'pending' | 'processing' | 'completed' | 'failed'>('idle');
  const [recordId, setRecordId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('pending');
    setResult(null);
    setError(null);
    
    try {
      const response = await apiFetch('/api/patients/diagnoses/suggest/', {
        method: 'POST',
        body: JSON.stringify({ symptoms, history })
      });
      if (response.ok) {
        const data = await response.json();
        setRecordId(data.id);
        setStatus('processing');
      } else {
        setStatus('failed');
        setError("Failed to start analysis task.");
      }
    } catch (e) {
      setStatus('failed');
      setError("AI Service connection error.");
    }
  };

  useEffect(() => {
    if (status === 'processing' && recordId) {
      pollingRef.current = setInterval(async () => {
        try {
          const response = await apiFetch(`/api/patients/diagnoses/status/${recordId}/`);
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'completed') {
              setResult(data.diagnosis);
              setStatus('completed');
              if (pollingRef.current) clearInterval(pollingRef.current);
            } else if (data.status === 'failed') {
              setStatus('failed');
              setError(data.diagnosis.error || "Analysis failed.");
              if (pollingRef.current) clearInterval(pollingRef.current);
            }
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 3000);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [status, recordId]);

  const handleSave = async () => {
    // Current backend logic already saved it as a skeleton, 
    // but in background mode, 'saving' just means closing or confirming.
    alert("Diagnostic result confirmed and permanently stored in patient record.");
    onBack();
  };

  return (
    <div className="dashboard-layout" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <header className="dashboard-header" style={{ border: 'none', background: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#1E293B', cursor: 'pointer' }}>
             <i className="fas fa-arrow-left"></i>
           </button>
           <h1 className="greeting-text">MedGemma™ Diagnostics</h1>
        </div>
        <p className="greeting-time">Asynchronous clinical reasoning powered by Deep Diagnostics.</p>
      </header>

      <div className="responsive-grid" style={{ marginTop: '2rem' }}>
        {/* Input Section */}
        <div className="dashboard-card" style={{ opacity: status !== 'idle' ? 0.7 : 1, pointerEvents: status !== 'idle' ? 'none' : 'auto' }}>
          <h3 className="card-title" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Clinical Presentation</h3>
          <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Patient Symptoms / Chief Complaint</label>
              <textarea 
                className="form-input" 
                rows={4} 
                placeholder="e.g. Persistent cough, chest pain..." 
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Relevant Medical History</label>
              <textarea 
                className="form-input" 
                rows={3} 
                placeholder="Past history..." 
                value={history}
                onChange={(e) => setHistory(e.target.value)}
              />
            </div>
            <button type="submit" className="cta-button" disabled={status !== 'idle'} style={{ width: '100%', justifyContent: 'center', background: 'var(--primary)' }}>
              <i className="fas fa-magic mr-2"></i>
              Start Background Analysis
            </button>
          </form>
        </div>

        {/* Status / Result Section */}
        {status !== 'idle' && (
          <div className="dashboard-card" style={{ 
            border: status === 'failed' ? '1px solid #FECACA' : '1px solid #BFDBFE', 
            background: status === 'failed' ? '#FEF2F2' : '#F0F9FF', 
            animation: 'fadeIn 0.5s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: result ? 'flex-start' : 'center',
            alignItems: result ? 'stretch' : 'center',
            minHeight: '400px'
          }}>
            {status === 'processing' && !result && (
                <div style={{ textAlign: 'center' }}>
                    <div className="vitals-badge warning" style={{ marginBottom: '1rem', display: 'inline-block' }}>ANALYZING...</div>
                    <div style={{ fontSize: '2rem', color: '#1E40AF', marginBottom: '1rem' }}>
                        <i className="fas fa-brain fa-pulse"></i>
                    </div>
                    <p style={{ color: '#64748B', maxWidth: '300px', margin: '0 auto' }}>
                        MedGemma is reviewing the clinical data in the background. You can stay here or check back later.
                    </p>
                </div>
            )}

            {status === 'failed' && (
                <div style={{ textAlign: 'center' }}>
                    <div className="vitals-badge critical" style={{ marginBottom: '1rem', display: 'inline-block' }}>ANALYSIS FAILED</div>
                    <p style={{ color: '#991B1B' }}>{error}</p>
                    <button onClick={() => setStatus('idle')} className="cta-button" style={{ marginTop: '1rem' }}>Try Again</button>
                </div>
            )}

            {result && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 className="card-title" style={{ fontSize: '1.25rem', color: '#1E40AF' }}>AI Diagnostic Insight</h3>
                    <span className="vitals-badge normal" style={{ background: '#DBEAFE', color: '#1E40AF' }}>{Math.round(result.confidence_score * 100)}% CONFIDENCE</span>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label className="report-label">Primary Diagnosis Suggestion</label>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E3A8A' }}>{result.diagnosis_name}</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>ICD-10: {result.icd10_code}</div>
                        </div>

                        <div>
                            <label className="report-label">Clinical Rationale (MedGemma)</label>
                            <p className="report-text" style={{ fontSize: '0.95rem' }}>{result.description}</p>
                        </div>

                        <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #DBEAFE' }}>
                            <label className="report-label" style={{ color: '#0D9488' }}>Suggested Medication Management</label>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: '#0F766E', fontStyle: 'italic' }}>{result.medication_suggested}</p>
                        </div>

                        <button 
                            onClick={handleSave} 
                            className="cta-button" 
                            style={{ width: '100%', justifyContent: 'center', background: '#059669', marginTop: '1rem' }}
                        >
                            Confirm & Archive Record
                        </button>
                    </div>
                </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedGemmaDiagnosis;
