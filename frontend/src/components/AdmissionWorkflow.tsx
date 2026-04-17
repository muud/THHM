import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

interface Bed {
  id: number;
  number: string;
  type: string;
}

interface WardInfo {
  ward: string;
  ward_id: number;
  available_count: number;
  beds: Bed[];
}

interface Patient {
  id: number;
  name: string;
  mrn: string;
}

interface AdmissionWorkflowProps {
  onBack: () => void;
  onSuccess: () => void;
}

const AdmissionWorkflow: React.FC<AdmissionWorkflowProps> = ({ onBack, onSuccess }) => {
  const [wards, setWards] = useState<WardInfo[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [selectedBed, setSelectedBed] = useState<number | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bedsRes, patientsRes] = await Promise.all([
          apiFetch('/api/beds/available/'),
          apiFetch('/api/patients/list/')
        ]);
        
        if (bedsRes.ok) setWards(await bedsRes.json());
        if (patientsRes.ok) setPatients(await patientsRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !selectedBed) return;
    
    setSubmitting(true);
    try {
      const response = await apiFetch('/api/beds/admit/', {
        method: 'POST',
        body: JSON.stringify({
          patient_id: selectedPatient,
          bed_id: selectedBed,
          diagnosis: diagnosis
        })
      });
      
      if (response.ok) {
        alert("Patient successfully admitted.");
        onSuccess();
      }
    } catch (e) {
      alert("Admission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="dashboard-layout"><p>Loading census data...</p></div>;

  return (
    <div className="dashboard-layout" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <header className="dashboard-header" style={{ border: 'none', background: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#1E293B', cursor: 'pointer' }}>
             <i className="fas fa-arrow-left"></i>
           </button>
           <h1 className="greeting-text">Patient Admission</h1>
        </div>
        <p className="greeting-time">Assign patient to an available hospital bed.</p>
      </header>

      <div className="dashboard-card" style={{ marginTop: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="form-group">
            <label className="form-label">Search / Select Patient</label>
            <select 
              className="form-input" 
              value={selectedPatient || ''} 
              onChange={(e) => setSelectedPatient(Number(e.target.value))}
              required
            >
              <option value="">Select a patient for admission</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.mrn})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Available Wards & Beds</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {wards.map(w => (
                <div key={w.ward_id} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem' }}>
                   <div style={{ fontWeight: 700, marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{w.ward}</span>
                      <span style={{ fontSize: '0.75rem', color: '#10B981' }}>{w.available_count} beds free</span>
                   </div>
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {w.beds.map(b => (
                        <button 
                          key={b.id}
                          type="button"
                          onClick={() => setSelectedBed(b.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            border: '1px solid',
                            borderColor: selectedBed === b.id ? 'var(--primary)' : '#E2E8F0',
                            background: selectedBed === b.id ? 'var(--secondary)' : 'white',
                            color: selectedBed === b.id ? 'var(--primary)' : '#64748B',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Bed {b.number} ({b.type})
                        </button>
                      ))}
                   </div>
                </div>
              ))}
              {wards.length === 0 && <p style={{ fontSize: '0.9rem', color: '#94A3B8' }}>No beds available in system.</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Admitting Diagnosis / Chief Complaint</label>
            <textarea 
              className="form-input" 
              rows={3} 
              placeholder="Primary reason for admission..." 
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="cta-button" disabled={submitting} style={{ flex: 1, justifyContent: 'center' }}>
              {submitting ? 'Processing...' : 'Complete Admission'}
            </button>
            <button type="button" onClick={onBack} className="cta-button" style={{ background: '#F1F5F9', color: '#64748B', border: 'none' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdmissionWorkflow;
