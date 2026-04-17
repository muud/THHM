import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

interface Admission {
  id: number;
  patient_name: string;
  mrn: string;
  ward: string;
  bed_number: string;
  admission_date: string;
  diagnosis: string;
}

interface StaffMember {
  id: number;
  employee_id: string;
  name: string;
  role: string;
  department: string;
  is_active: boolean;
  hire_date: string;
}

interface AdminDashboardProps {
  onAdmit: () => void;
  onDiagnose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onAdmit, onDiagnose }) => {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'admissions' | 'staff' | 'manager'>('admissions');
  const [showAddStaff, setShowAddStaff] = useState(false);

  const [newStaff, setNewStaff] = useState({ username: '', password: '', role: 'doctor', department_id: '', first_name: '', last_name: '' });


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [admRes, staffRes] = await Promise.all([
          apiFetch('/api/beds/admissions/'),
          apiFetch('/api/management/staff/')
        ]);
        if (admRes.ok) setAdmissions(await admRes.json());
        if (staffRes.ok) setStaff(await staffRes.json());
      } catch (e) {
        console.error("Failed to fetch dashboard data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  const handleDischarge = async (id: number) => {
    if (!window.confirm("Are you sure you want to discharge this patient?")) return;
    try {
      const response = await apiFetch(`/api/beds/discharge/${id}/`, { method: 'POST' });
      if (response.ok) {
        setAdmissions(prev => prev.filter(adm => adm.id !== id));
      }
    } catch (e) {
      alert("Error discharging patient");
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiFetch('/api/core/users/', {
        method: 'POST',
        body: JSON.stringify(newStaff)
      });
      if (response.ok) {
        alert("Staff created successfully");
        setShowAddStaff(false);
        // Refresh staff list
        const staffRes = await apiFetch('/api/management/staff/');
        if (staffRes.ok) setStaff(await staffRes.json());
      }
    } catch (e) {
      alert("Failed to create staff");
    }
  };


  if (loading) return <div className="dashboard-layout"><p>Loading admin console...</p></div>;

  return (
    <div className="dashboard-layout" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <header className="dashboard-header" style={{ border: 'none', background: 'none' }}>
        <h1 className="greeting-text">Hospital Command Center</h1>
        <p className="greeting-time">Managing operations and system security.</p>
      </header>

      <div className="responsive-grid" style={{ marginTop: '2rem' }}>
        {/* Sidebar Controls */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button onClick={() => setActiveTab('admissions')} className="cta-button" style={{ width: '100%', justifyContent: 'center', background: activeTab === 'admissions' ? '#3B82F6' : '#E2E8F0', color: activeTab === 'admissions' ? 'white' : '#475569' }}>
            <i className="fas fa-bed"></i> Admissions List
          </button>
          <button onClick={() => setActiveTab('staff')} className="cta-button" style={{ width: '100%', justifyContent: 'center', background: activeTab === 'staff' ? '#3B82F6' : '#E2E8F0', color: activeTab === 'staff' ? 'white' : '#475569' }}>
            <i className="fas fa-users-cog"></i> Roster
          </button>
          <button onClick={() => setActiveTab('manager')} className="cta-button" style={{ width: '100%', justifyContent: 'center', background: activeTab === 'manager' ? '#3B82F6' : '#E2E8F0', color: activeTab === 'manager' ? 'white' : '#475569' }}>
            <i className="fas fa-desktop"></i> Activity Monitor
          </button>
          <button onClick={() => window.open('/admin/', '_blank')} className="cta-button" style={{ width: '100%', justifyContent: 'center', background: '#E2E8F0', color: '#475569' }}>
            <i className="fas fa-shield-alt"></i> THHM Admin
          </button>


          {activeTab === 'admissions' && (

             <>
                <button onClick={onAdmit} className="cta-button" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                  <i className="fas fa-user-plus"></i> New Admission
                </button>
                <button onClick={onDiagnose} className="cta-button" style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }}>
                  <i className="fas fa-brain"></i> MedGemma Diagnosis
                </button>
                
                <div className="dashboard-card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
                  <h3 className="card-title" style={{ fontSize: '1rem' }}>Capacity Stats</h3>
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem' }}>ICU Beds</span>
                      <span className="vitals-badge critical">4/10</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem' }}>General Ward</span>
                      <span className="vitals-badge warning">22/30</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem' }}>Isolation</span>
                      <span className="vitals-badge normal">0/5</span>
                    </div>
                  </div>
                </div>
             </>
          )}
        </aside>

        {/* Main Area */}
        <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden' }}>
            {activeTab === 'admissions' ? (
              <>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <h3 className="card-title" style={{ fontSize: '1.25rem' }}>Active Patient Admissions</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '300px' }}>
                     <input type="text" placeholder="Search..." className="form-input" style={{ borderRadius: '100px' }} />
                  </div>
                </div>
                
                <div className="mobile-scroll-container">
                  <table style={{ minWidth: '800px', width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC' }}>
                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B' }}>Patient</th>
                        <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B' }}>Ward/Bed</th>
                        <th className="mobile-hide" style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B' }}>Admission Date</th>
                        <th className="mobile-hide" style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B' }}>Admitting Diagnosis</th>
                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admissions.map(adm => (
                        <tr key={adm.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <div style={{ fontWeight: 700, color: '#1E293B' }}>{adm.patient_name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>MRN: {adm.mrn}</div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontSize: '0.9rem' }}>{adm.ward}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Bed {adm.bed_number}</div>
                          </td>
                          <td className="mobile-hide" style={{ padding: '1rem', fontSize: '0.85rem' }}>
                            {new Date(adm.admission_date).toLocaleDateString()}
                          </td>
                          <td className="mobile-hide" style={{ padding: '1rem' }}>
                            <div style={{ 
                              fontSize: '0.8rem', 
                              background: '#F1F5F9', 
                              padding: '0.4rem 0.8rem', 
                              borderRadius: '8px',
                              display: 'inline-block',
                              maxWidth: '200px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {adm.diagnosis || "Initial Triage"}
                            </div>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <button onClick={() => handleDischarge(adm.id)} style={{ 
                              background: '#FEE2E2', 
                              color: '#DC2626', 
                              border: 'none', 
                              padding: '0.5rem 1rem', 
                              borderRadius: '8px', 
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}>
                              DISCHARGE
                            </button>
                          </td>
                        </tr>
                      ))}
                      {admissions.length === 0 && (
                        <tr>
                          <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                            No active admissions found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : activeTab === 'staff' ? (
              <>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="card-title" style={{ fontSize: '1.25rem' }}>Workforce Roster</h3>
                  {!showAddStaff && (
                    <button onClick={() => setShowAddStaff(true)} className="card-button" style={{ fontSize: '0.85rem' }}>
                      <i className="fas fa-plus"></i> Add New Staff
                    </button>
                  )}
                </div>

                {showAddStaff && (
                  <div style={{ padding: '2rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <form onSubmit={handleAddStaff} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div className="form-group">
                        <label className="form-label">First Name</label>
                        <input className="form-input" type="text" value={newStaff.first_name} onChange={e => setNewStaff({...newStaff, first_name: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Last Name</label>
                        <input className="form-input" type="text" value={newStaff.last_name} onChange={e => setNewStaff({...newStaff, last_name: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Username / Login</label>
                        <input className="form-input" type="text" value={newStaff.username} onChange={e => setNewStaff({...newStaff, username: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-input" type="password" value={newStaff.password} onChange={e => setNewStaff({...newStaff, password: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Clinic / Department</label>
                        <select className="form-input" value={newStaff.department_id} onChange={e => setNewStaff({...newStaff, department_id: e.target.value})} required>
                          <option value="">Select Department...</option>
                          <optgroup label="Clinical">
                            <option value="DOC">Medical / Doctor</option>
                            <option value="NUR">Nursing</option>
                            <option value="MAT">Maternity</option>
                            <option value="EYE">Eye Clinic</option>
                          </optgroup>
                          <optgroup label="Support">
                            <option value="PHA">Pharmacy</option>
                            <option value="LAB">Laboratory</option>
                            <option value="XRY">X-Ray / Imaging</option>
                            <option value="REC">Receptionist</option>
                          </optgroup>
                          <optgroup label="Services">
                            <option value="SEC">Security</option>
                            <option value="MNT">Maintenance</option>
                          </optgroup>
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                        <button type="submit" className="card-button" style={{ width: '100%' }}>Create Profile</button>
                        <button type="button" onClick={() => setShowAddStaff(false)} className="card-button card-button-secondary">Cancel</button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="mobile-scroll-container">
                  <table style={{ minWidth: '800px', width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC' }}>
                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B' }}>Employee ID</th>
                        <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B' }}>Full Name</th>
                        <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B' }}>Role</th>
                        <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B' }}>Current Status</th>
                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B' }}>Hired</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.map(s => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '1.25rem 1.5rem', fontWeight: 800, color: 'var(--primary)', fontSize: '0.85rem' }}>{s.employee_id}</td>
                          <td style={{ padding: '1rem' }}>{s.name}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ fontSize: '0.8rem', background: '#F1F5F9', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>{s.role}</span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span className={`vitals-badge ${s.is_active ? 'normal' : 'critical'}`} style={{ fontSize: '0.65rem' }}>
                              {s.is_active ? 'ACTIVE ON SHIFT' : 'OFF DUTY'}
                            </span>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: '#64748B' }}>
                            {new Date(s.hire_date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : activeTab === 'manager' ? (
              <>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 className="card-title" style={{ fontSize: '1.25rem' }}>Active Personnel Monitor</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Real-time overview of staff currently clocked in across the facility.</p>
                  </div>
                  <div className="vitals-badge normal" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                    {staff.filter(s => s.is_active).length} STAFF ON SHIFT
                  </div>
                </div>
                <div className="status-grid">
                  {staff.map(s => (
                    <div key={s.id} className="status-card">
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.75rem', color: '#64748B' }}>{s.employee_id}</div>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E293B' }}>{s.name}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span className={`status-indicator ${s.is_active ? 'online' : 'offline'}`}></span>
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: s.is_active ? '#10B981' : '#94A3B8' }}>
                              {s.is_active ? 'Clocked In' : 'Clocked Out'}
                            </span>
                          </div>
                       </div>
                       <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '4px', background: '#F1F5F9', color: '#475569', fontWeight: 600 }}>
                            {s.department}
                          </span>
                          <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '4px', background: '#DBEAFE', color: '#1E40AF', fontWeight: 600 }}>
                            {s.role}
                          </span>
                       </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
        </div>




      </div>
    </div>
  );
};

export default AdminDashboard;
