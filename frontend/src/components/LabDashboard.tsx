import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

interface Visit {
  id: number;
  patient_name: string;
  mrn: string;
  status: string;
}

const LabDashboard: React.FC = () => {
  const [queue, setQueue] = useState<Visit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [resultData, setResultData] = useState({
    test_value: '',
    test_notes: '',
    is_abnormal: false
  });

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/appointments/queue/?status=lab_required');
      if (res.ok) setQueue(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordResults = async () => {
    if (!selectedVisit) return;

    try {
      const res = await apiFetch('/api/lab/results/record/', {
        method: 'POST',
        body: JSON.stringify({
          visit_id: selectedVisit.id,
          request_id: selectedVisit.id, // Using visit_id as request_id for the simplified logic
          ...resultData
        })
      });
      if (res.ok) {
        alert("Results recorded. Patient returned to Doctor queue.");
        setSelectedVisit(null);
        fetchQueue();
      }
    } catch (e) {
      alert("Failed to record results");
    }
  };

  return (
    <div className="dashboard-layout" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <h1 className="greeting-text">Diagnostic Laboratory</h1>
        <p className="greeting-time">Processing patient samples and reporting findings.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Waiting List */}
        <div className="dashboard-card p-6">
          <h3 className="card-title mb-4">Awaiting Tests ({queue.length})</h3>
          <div className="space-y-3">
            {queue.map(v => (
              <div 
                key={v.id} 
                className={`p-4 rounded-2xl border-2 cursor-pointer transition ${selectedVisit?.id === v.id ? 'border-purple-500 bg-purple-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                onClick={() => setSelectedVisit(v)}
              >
                <div className="flex justify-between items-center">
                   <div>
                      <p className="font-bold text-slate-800">{v.patient_name}</p>
                      <p className="text-xs text-slate-500">MRN: {v.mrn}</p>
                   </div>
                   <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                      <i className="fas fa-microscope"></i>
                   </div>
                </div>
              </div>
            ))}
            {queue.length === 0 && <p className="text-slate-400 text-center py-8">No tests pending.</p>}
          </div>
        </div>

        {/* Action Panel */}
        <div className="dashboard-card p-6">
          <h3 className="card-title mb-4">Record Test Results</h3>
          {selectedVisit ? (
            <div className="space-y-6">
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Patient</p>
                  <p className="font-bold text-slate-800">{selectedVisit.patient_name}</p>
               </div>

               <div className="form-group">
                  <label className="form-label">Result Value</label>
                  <input 
                    className="form-input text-xl font-black text-purple-700" 
                    placeholder="e.g. 12.5 g/dL"
                    value={resultData.test_value}
                    onChange={e => setResultData({...resultData, test_value: e.target.value})}
                  />
               </div>

               <div className="form-group">
                  <label className="form-label">Technical Notes</label>
                  <textarea 
                    className="form-input" 
                    rows={3} 
                    placeholder="Observations from specimen analysis..."
                    value={resultData.test_notes}
                    onChange={e => setResultData({...resultData, test_notes: e.target.value})}
                  ></textarea>
               </div>

               <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="abnormal" 
                    className="w-5 h-5"
                    checked={resultData.is_abnormal}
                    onChange={e => setResultData({...resultData, is_abnormal: e.target.checked})}
                  />
                  <label htmlFor="abnormal" className="font-bold text-red-600">Mark as Critical/Abnormal</label>
               </div>

               <button 
                  onClick={handleRecordResults}
                  className="bg-purple-600 text-white w-full py-3 rounded-2xl text-base font-black shadow-xl hover:bg-purple-700 transition"
               >
                  SUBMIT & MOVE TO DOCTOR
               </button>
            </div>
          ) : (
            <div className="text-center py-24 text-slate-300">
               <i className="fas fa-flask text-6xl mb-4 opacity-50"></i>
               <p>Select a patient with pending tests</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabDashboard;
