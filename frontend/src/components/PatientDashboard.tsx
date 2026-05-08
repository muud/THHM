import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

interface PatientDashboardProps {
  userName: string;
  onBook: () => void;
  onViewLabs: () => void;
  onViewRadio: () => void;
  onChat: () => void;
}

interface DashboardStats {
  appointments: number;
  labs: number;
  prescriptions: number;
  billing_due: number;
  insurance_cover: number;
  insurance_expiry: string;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ userName: initialUserName, onBook, onViewLabs, onViewRadio, onChat }) => {
  const [greeting, setGreeting] = useState('');
  const [subGreeting, setSubGreeting] = useState('');
  const [userName, setUserName] = useState(initialUserName);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiFetch('/api/core/patient-overview/');
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
          setUserName(data.userName);
        }
      } catch (e) {
        console.error("Failed to fetch dashboard stats", e);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting(`Good morning, ${userName}.`);
      setSubGreeting("Let’s have a healthy day.");
    } else if (hour < 18) {
      setGreeting(`Hi ${userName}.`);
      setSubGreeting("How are you feeling this afternoon?");
    } else {
      setGreeting(`Evening, ${userName}.`);
      setSubGreeting("Take a moment to breathe.");
    }
  }, [userName]);

  if (loading) {
    return (
      <div className="dashboard-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="card-text">Loading your health dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <h1 className="greeting-text">{greeting}</h1>
          <p className="greeting-time">{subGreeting}</p>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-grid">
          {/* 2.1 Upcoming Appointments Card */}
          <div className="dashboard-card">
            <div className="card-icon">
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h2 className="card-title">Upcoming Appointments</h2>
            <p className="card-text">
              You have <strong>{stats?.appointments || 0}</strong> appointment scheduled. We’ll remind you 24 hours before.
            </p>
            <button className="card-button" onClick={onBook}>
              View appointments →
            </button>
          </div>

          {/* 2.2 Pending Lab Results Card */}
          <div className="dashboard-card">
            <div className="card-icon" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <h2 className="card-title">Lab Results</h2>
            <p className="card-text">
              You have <strong>{stats?.labs || 0}</strong> results being reviewed. We explain everything in plain language.
            </p>
            <button className="card-button" onClick={onViewLabs}>
              View results →
            </button>
          </div>

          {/* 2.2b Radiology / X-Ray Card */}
          <div className="dashboard-card">
            <div className="card-icon" style={{ backgroundColor: '#F0F9FF', color: '#0369A1' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <path d="M12 8v8"/><path d="M8 12h8"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <h2 className="card-title">X-Ray & Imaging</h2>
            <p className="card-text">
              View your X-ray scans and <strong>Gemine 4 AI</strong> interprets the findings instantly.
            </p>
            <button className="card-button" onClick={onViewRadio}>
              Check scans →
            </button>
          </div>

          {/* 2.3 Prescription Refill Reminder */}
          <div className="dashboard-card">
            <div className="card-icon" style={{ backgroundColor: '#FFF7ED', color: '#EA580C' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
            </div>
            <h2 className="card-title">Active Prescriptions</h2>
            <p className="card-text">
              You have <strong>{stats?.prescriptions || 0}</strong> active medications. Need a refill?
            </p>
            <button className="card-button" style={{ backgroundColor: '#EA580C' }}>
              Request refill
            </button>
          </div>

          {/* 2.4 Immunization Due Alert */}
          <div className="dashboard-card">
            <div className="card-icon" style={{ backgroundColor: '#F0F9FF', color: '#0284C7' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14.5 3.5 6 6"/><path d="m10 7.5 6 6"/><path d="m7 10.5 6 6"/><path d="m3.5 14.5 6 6"/><path d="M2 22 7.5 16.5"/><path d="m16.5 7.5 4.5-4.5"/><path d="m7 21 1.5-1.5"/><path d="m11 17 4.5-4.5"/><path d="m3 15.5 1.5-1.5"/><path d="m13 13 4.5-4.5"/></svg>
            </div>
            <h2 className="card-title">Family Health</h2>
            <p className="card-text">
              Stay protected with our immunization tracking and pediatric support services.
            </p>
            <button className="card-button" style={{ backgroundColor: '#0284C7' }} onClick={onBook}>
              Schedule now
            </button>
          </div>

          {/* 2.5 Insurance & Billing Summary */}
          <div className="dashboard-card" style={{ gridColumn: 'span 1' }}>
            <div className="card-icon" style={{ backgroundColor: '#F5F3FF', color: '#7C3AED' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h2 className="card-title">Insurance & Billing</h2>
            <p className="card-text">
              Due: <strong>KSh {stats?.billing_due.toLocaleString() || '0'}</strong>. You have <strong>KSh {stats?.insurance_cover.toLocaleString() || '45,000'}</strong> in your cover.
            </p>
            <button className="card-button" style={{ backgroundColor: '#7C3AED' }}>
              View policy details
            </button>
          </div>

          {/* Quick Actions Card (Extra Polish) */}
          <div className="dashboard-card" style={{ background: 'var(--primary)', color: 'white', gridColumn: 'span 1' }}>
            <h2 className="card-title" style={{ color: 'white' }}>Need assistance?</h2>
            <p className="card-text" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Our compassionate care team is online and ready to listen.
            </p>
            <button className="card-button" style={{ background: 'white', color: 'var(--primary)' }} onClick={onChat}>
              Chat with care team
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
