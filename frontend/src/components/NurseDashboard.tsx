import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

interface Visit {
  id: number;
  patient_name: string;
  patient_id: number;
  mrn: string;
  status: string;
}

const NurseDashboard: React.FC = () => {
  const [queue, setQueue] = useState<Visit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [vitalsData, setVitalsData] = useState({
    heart_rate: '',
    bp_systolic: '',
    bp_diastolic: '',
    temperature: '',
    spo2: '',
    weight: '',
    blood_glucose: '',
    notes: ''
  });

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/appointments/queue/?status=waiting_nurse');
      if (res.ok) setQueue(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisit) return;

    try {
      const res = await apiFetch('/api/patients/vitals/save/', {
        method: 'POST',
        body: JSON.stringify({
          ...vitalsData,
          patient_id: selectedVisit.patient_id,
          visit_id: selectedVisit.id
        })
      });
      if (res.ok) {
        alert("Vitals recorded. Patient moved to Doctor queue.");
        setSelectedVisit(null);
        fetchQueue();
      }
    } catch (e) {
      alert("Failed to save vitals");
    }
  };

  return (
    <div className="dashboard-layout" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <h1 className="greeting-text">Nursing Station</h1>
        <p className="greeting-time">Record vital signs and prep patients for consultation.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Waiting List */}
        <div className="dashboard-card p-6">
          <h3 className="card-title mb-4">Awaiting Vitals ({queue.length}) {loading && <span className="text-xs text-blue-500 animate-pulse ml-2">Loading...</span>}</h3>

          <div className="space-y-3">
            {queue.map(v => (
              <div 
                key={v.id} 
                className={`p-4 rounded-2xl border-2 cursor-pointer transition ${selectedVisit?.id === v.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                onClick={() => setSelectedVisit(v)}
              >
                <p className="font-bold text-slate-800">{v.patient_name}</p>
                <p className="text-xs text-slate-500">MRN: {v.mrn}</p>
              </div>
            ))}
            {queue.length === 0 && <p className="text-slate-400 text-center py-8">No patients currently waiting.</p>}
          </div>
        </div>

        {/* Input Form */}
        <div className="dashboard-card p-6">
          <h3 className="card-title mb-4">Record Vitals</h3>
          {selectedVisit ? (
            <form onSubmit={handleSubmitVitals} className="space-y-4">
              <p className="text-sm font-bold text-blue-600 mb-4">Patient: {selectedVisit.patient_name}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label text-xs">Heart Rate (bpm)</label>
                  <input type="number" className="form-input" value={vitalsData.heart_rate} onChange={e => setVitalsData({...vitalsData, heart_rate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Temperature (°C)</label>
                  <input type="number" step="0.1" className="form-input" value={vitalsData.temperature} onChange={e => setVitalsData({...vitalsData, temperature: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label text-xs">BP Systolic</label>
                  <input type="number" className="form-input" value={vitalsData.bp_systolic} onChange={e => setVitalsData({...vitalsData, bp_systolic: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">BP Diastolic</label>
                  <input type="number" className="form-input" value={vitalsData.bp_diastolic} onChange={e => setVitalsData({...vitalsData, bp_diastolic: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label text-xs">SpO₂ (%)</label>
                  <input type="number" className="form-input" value={vitalsData.spo2} onChange={e => setVitalsData({...vitalsData, spo2: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Weight (kg)</label>
                  <input type="number" step="0.1" className="form-input" value={vitalsData.weight} onChange={e => setVitalsData({...vitalsData, weight: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label text-xs">Notes</label>
                <textarea className="form-input" rows={2} value={vitalsData.notes} onChange={e => setVitalsData({...vitalsData, notes: e.target.value})}></textarea>
              </div>

              <button type="submit" className="cta-button w-full justify-center mt-4">
                SAVE VITALS & HANDOVER
              </button>
            </form>
          ) : (
            <div className="text-center py-20 text-slate-400">
              <i className="fas fa-hand-pointer text-4xl mb-4"></i>
              <p>Select a patient from the list to start recording vitals.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;
