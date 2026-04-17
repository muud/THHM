import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

const AttendanceToggle: React.FC = () => {
  const [status, setStatus] = useState<{ is_staff: boolean; is_active: boolean; employee_id?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await apiFetch('/api/core/staff-status/');
        if (response.ok) {
          setStatus(await response.json());
        }
      } catch (e) {
        console.error("Failed to fetch staff status", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/management/attendance/toggle/', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setStatus(prev => prev ? { ...prev, is_active: data.is_active } : null);
      }
    } catch (e) {
      alert("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !status || !status.is_staff) return null;

  return (
    <div className="attendance-pill" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.75rem', 
      background: 'white', 
      padding: '0.5rem 1rem', 
      borderRadius: '100px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      border: '1px solid #E2E8F0'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
            ID: {status.employee_id}
        </span>
        <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            color: status.is_active ? '#10B981' : '#EF4444' 
        }}>
            {status.is_active ? '● ON SHIFT' : '○ CLOCKED OUT'}
        </span>
      </div>
      <button 
        onClick={handleToggle}
        disabled={loading}
        style={{
            padding: '0.4rem 1rem',
            borderRadius: '100px',
            border: 'none',
            background: status.is_active ? '#FEE2E2' : '#DCFCE7',
            color: status.is_active ? '#991B1B' : '#166534',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
        }}
      >
        {status.is_active ? 'Clock Out' : 'Clock In'}
      </button>
    </div>
  );
};

export default AttendanceToggle;
