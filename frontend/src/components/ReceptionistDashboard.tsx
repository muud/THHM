import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

interface Patient {
  id: number;
  name: string;
  mrn: string;
}

interface Visit {
  id: number;
  patient_name: string;
  mrn: string;
  status: string;
  status_display: string;
  time: string;
}

interface Invoice {
  id: number;
  total_amount: string;
  is_paid: boolean;
  patient_name?: string;
  created_at: string;
}

const ReceptionistDashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'checkin' | 'billing' | 'reports'>('checkin');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, vRes, iRes] = await Promise.all([
        apiFetch('/api/patients/list/'),
        apiFetch('/api/appointments/queue/'),
        apiFetch('/api/billing/invoices/')
      ]);
      
      if (pRes.ok) setPatients(await pRes.json());
      if (vRes.ok) setVisits(await vRes.json());
      if (iRes.ok) setInvoices(await iRes.json());
    } catch (e) {
      console.error("Fetch failed", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (patientId: number) => {
    const doctorId = prompt("Enter Doctor ID (placeholder):", "1");
    if (!doctorId) return;

    try {
      const res = await apiFetch('/api/appointments/check-in/', {
        method: 'POST',
        body: JSON.stringify({ patient_id: patientId, doctor_id: doctorId })
      });
      if (res.ok) {
        alert("Patient checked in and consultation invoice generated.");
        fetchData();
      }
    } catch (e) {
      alert("Check-in failed");
    }
  };

  const handleProcessPayment = async (invoiceId: number) => {
    try {
      const res = await apiFetch(`/api/billing/pay/${invoiceId}/`, { method: 'POST' });
      if (res.ok) {
        alert("Payment processed successfully.");
        fetchData();
      }
    } catch (e) {
      alert("Payment failed");
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.mrn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingInvoices = invoices.filter(inv => !inv.is_paid);

  return (
    <div className="dashboard-layout" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <header className="dashboard-header" style={{ background: 'none', border: 'none', padding: '0', marginBottom: '2rem' }}>
        <h1 className="greeting-text" style={{ color: '#1E293B' }}>Reception & Billing</h1>
        <p className="greeting-time" style={{ color: '#64748B' }}>Welcome back. Manage patient arrivals and payments here.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab('checkin')}
            className={`cta-button w-full justify-start ${activeTab === 'checkin' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            <i className="fas fa-user-check mr-2"></i> Arrivals / Check-in
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            className={`cta-button w-full justify-start ${activeTab === 'billing' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            <i className="fas fa-file-invoice-dollar mr-2"></i> Pending Payments
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`cta-button w-full justify-start ${activeTab === 'reports' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            <i className="fas fa-file-alt mr-2"></i> Ready for Reports
          </button>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'checkin' && (
            <div className="dashboard-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="card-title">Patient Arrival</h3>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search name or MRN..." 
                    className="form-input py-2 px-4 rounded-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredPatients.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                    <div>
                      <p className="font-bold text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-500 font-mono">MRN: {p.mrn}</p>
                    </div>
                    <button 
                      onClick={() => handleCheckIn(p.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition"
                    >
                      CHECK-IN
                    </button>
                  </div>
                ))}
                {filteredPatients.length === 0 && <p className="text-center text-slate-400 py-8">No patients found matches your search.</p>}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="dashboard-card p-6">
              <h3 className="card-title mb-6">Unpaid Consultation & Lab Fees</h3>
              <p className="text-slate-500 mb-4">The following patients need to clear their balance before moving to the next stage.</p>
              
              <div className="space-y-4">
                {pendingInvoices.map(inv => (
                  <div key={inv.id} className="flex justify-between items-center p-4 bg-orange-50 rounded-2xl border border-orange-100">
                    <div>
                      <p className="font-bold text-slate-800">{inv.patient_name}</p>
                      <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">Awaiting Fee Payment</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-800">KSh {inv.total_amount}</p>
                      <button 
                        onClick={() => handleProcessPayment(inv.id)}
                        className="text-blue-600 text-xs font-bold underline mt-1"
                      >
                        PROCESS PAYMENT
                      </button>
                    </div>
                  </div>
                ))}
                {pendingInvoices.length === 0 && (
                  <div className="text-center py-12">
                     <i className="fas fa-check-circle text-4xl text-green-200 mb-3"></i>
                     <p className="text-slate-400">All fees are cleared!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="dashboard-card p-6">
              <h3 className="card-title mb-6">Discharge & Reporting</h3>
              <div className="space-y-4">
                {visits.filter(v => v.status === 'completed').map(v => (
                  <div key={v.id} className="flex justify-between items-center p-4 bg-green-50 rounded-2xl border border-green-100">
                    <div>
                      <p className="font-bold text-slate-800">{v.patient_name}</p>
                      <p className="text-xs text-green-600 font-bold">TREATMENT COMPLETE</p>
                    </div>
                    <button className="bg-white border-2 border-green-600 text-green-600 px-4 py-2 rounded-xl text-xs font-black shadow-sm">
                      DOWNLOAD FINAL REPORT
                    </button>
                  </div>
                ))}
                {visits.filter(v => v.status === 'completed').length === 0 && (
                   <div className="text-center py-12">
                      <p className="text-slate-400">No patients are currently ready for report generation.</p>
                   </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
