import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

interface Visit {
  id: number;
  patient_name: string;
  patient_id: number;
  mrn: string;
  status: string;
  status_display: string;
}

const DoctorDashboard: React.FC = () => {
  const [queue, setQueue] = useState<Visit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [consultData, setConsultData] = useState({
    diagnosis_name: '',
    clinical_notes: '',
    medication_suggested: '',
    lab_test_id: ''
  });

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const [wdRes, ldRes] = await Promise.all([
        apiFetch('/api/appointments/queue/?status=with_doctor'),
        apiFetch('/api/appointments/queue/?status=lab_done')
      ]);
      const wd = await wdRes.json();
      const ld = await ldRes.json();
      setQueue([...wd, ...ld]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleConsultAction = async (action: 'complete' | 'lab') => {
    if (!selectedVisit) return;

    try {
      if (action === 'complete') {
        const diagRes = await apiFetch('/api/patients/diagnoses/save/', {
          method: 'POST',
          body: JSON.stringify({
            patient_id: selectedVisit.patient_id,
            diagnosis_name: consultData.diagnosis_name,
            clinical_notes: consultData.clinical_notes,
            medication_suggested: consultData.medication_suggested
          })
        });
        if (diagRes.ok) {
          await apiFetch(`/api/appointments/status/${selectedVisit.id}/`, {
            method: 'POST',
            body: JSON.stringify({ status: 'completed' })
          });
          alert("Consultation completed.");
        }
      } else if (action === 'lab') {
        const labRes = await apiFetch('/api/lab/request/', {
          method: 'POST',
          body: JSON.stringify({
            patient_id: selectedVisit.patient_id,
            visit_id: selectedVisit.id,
            test_id: consultData.lab_test_id
          })
        });
        if (labRes.ok) {
          alert("Lab test requested. Patient moved to Lab queue.");
        }
      }
      setSelectedVisit(null);
      fetchQueue();
    } catch (e) {
      alert("Action failed");
    }
  };

  return (
    <div className="dashboard-layout" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <h1 className="greeting-text">Clinical Consultation</h1>
        <p className="greeting-time">Review vitals, diagnose, and prescribe treatment.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Waiting List */}
        <div className="lg:col-span-4 dashboard-card p-6">
          <h3 className="card-title mb-4">Patient Queue ({queue.length}) {loading && <span className="text-xs text-blue-500 animate-pulse ml-2">Loading...</span>}</h3>
          <div className="space-y-3">
            {queue.map(v => (
              <div 
                key={v.id} 
                className={`p-4 rounded-2xl border-2 cursor-pointer transition ${selectedVisit?.id === v.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                onClick={() => setSelectedVisit(v)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-800">{v.patient_name}</p>
                    <p className="text-xs text-slate-500">MRN: {v.mrn}</p>
                  </div>
                  <span className={`vitals-badge ${v.status === 'lab_done' ? 'normal' : 'warning'}`} style={{ fontSize: '0.65rem' }}>
                    {v.status === 'lab_done' ? 'LAB RESULTS READY' : 'VITALS READY'}
                  </span>
                </div>
              </div>
            ))}
            {queue.length === 0 && <p className="text-slate-400 text-center py-8">No patients awaiting consultation.</p>}
          </div>
        </div>

        {/* Consultation Form */}
        <div className="lg:col-span-8 dashboard-card p-8">
          {selectedVisit ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                 <div>
                    <h2 className="text-2xl font-black text-slate-800">{selectedVisit.patient_name}</h2>
                    <p className="text-sm text-slate-500 font-medium">History: 2 previous visits | Allergies: None disclosed</p>
                 </div>
                 <button className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">View Full Record</button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                 <div className="form-group">
                    <label className="form-label">Main Diagnosis / Findings</label>
                    <input 
                      className="form-input text-lg font-bold" 
                      placeholder="e.g. Acute Bacterial Sinusitis"
                      value={consultData.diagnosis_name}
                      onChange={e => setConsultData({...consultData, diagnosis_name: e.target.value})}
                    />
                 </div>
                 
                 <div className="form-group">
                    <label className="form-label">Clinical Notes</label>
                    <textarea 
                      className="form-input" 
                      rows={4} 
                      placeholder="Enter detailed examination findings and plan..."
                      value={consultData.clinical_notes}
                      onChange={e => setConsultData({...consultData, clinical_notes: e.target.value})}
                    ></textarea>
                 </div>

                 <div className="form-group">
                    <label className="form-label">Medication / Prescription Summary</label>
                    <textarea 
                      className="form-input" 
                      rows={3} 
                      placeholder="Dosage, frequency, duration..."
                      value={consultData.medication_suggested}
                      onChange={e => setConsultData({...consultData, medication_suggested: e.target.value})}
                    ></textarea>
                 </div>
              </div>

              <div className="flex gap-4 pt-4">
                 <div className="flex-1 p-6 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center">
                    <p className="text-sm font-bold text-slate-500 mb-3">Require Lab Investigation?</p>
                    <select 
                      className="form-input mb-4"
                      value={consultData.lab_test_id}
                      onChange={e => setConsultData({...consultData, lab_test_id: e.target.value})}
                    >
                       <option value="">Select Test...</option>
                       <option value="1">Complete Blood Count (CBC)</option>
                       <option value="2">Urinalysis</option>
                       <option value="3">Malaria RDT</option>
                    </select>
                    <button 
                      onClick={() => handleConsultAction('lab')}
                      className="bg-purple-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg"
                      disabled={!consultData.lab_test_id}
                    >
                       REQUEST LAB & PAUSE
                    </button>
                 </div>

                 <div className="flex-1 p-6 border-2 border-blue-100 bg-blue-50/30 rounded-[2rem] flex flex-col items-center justify-center">
                    <p className="text-sm font-bold text-blue-800 mb-3">Finalize Diagnosis</p>
                    <button 
                      onClick={() => handleConsultAction('complete')}
                      className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-base font-black shadow-xl hover:scale-105 transition transform"
                    >
                       COMPLETE CONSULTATION
                    </button>
                 </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
               <i className="fas fa-stethoscope text-6xl mb-4 opacity-50"></i>
               <p className="text-lg font-bold">Select a patient to start consultation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
