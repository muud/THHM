import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

interface PrescriptionExperienceProps {
  onBack: () => void;
}

type PrescriptionStep = 'list' | 'refill' | 'confirmation';

interface Prescription {
  id: string;
  drug: string;
  dosage: string;
  remaining: number;
}

const PrescriptionExperience: React.FC<PrescriptionExperienceProps> = ({ onBack }) => {
  const [step, setStep] = useState<PrescriptionStep>('list');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [address, setAddress] = useState('');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await apiFetch('/api/pharmacy/my/');
        if (response.ok) {
          const data = await response.json();
          setPrescriptions(data);
        }
      } catch (e) {
        console.error("Failed to fetch prescriptions");
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  const handleRefillRequest = async () => {
    if (!selectedPrescription) return;
    try {
      const response = await apiFetch('/api/pharmacy/refill/', {
        method: 'POST',
        body: JSON.stringify({ prescription_id: selectedPrescription })
      });
      if (response.ok) {
        setStep('confirmation');
      } else {
        alert("Failed to request refill.");
      }
    } catch(e) {
      alert("Network Error");
    }
  };

  if (step === 'confirmation') {
    return (
      <div className="pharmacy-container" style={{ textAlign: 'center' }}>
        <div className="success-icon" style={{ margin: '0 auto 2rem' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
        </div>
        <h1 className="booking-step-title">Order Received</h1>
        <p className="card-text" style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>
          Your medicine is ready for {deliveryMethod}. {deliveryMethod === 'pickup' && 'Please bring this confirmation to the pharmacy.'}
        </p>
        <button className="card-button" onClick={onBack} style={{ margin: '0 auto' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (step === 'refill') {
    return (
      <div className="pharmacy-container">
        <h1 className="booking-step-title">Refill Request</h1>
        <p className="card-text">We’ll prepare your medicine. Pick it up from our pharmacy or get it delivered (fee applies).</p>
        
        <div className="delivery-options">
          <div 
            className={`delivery-option-card ${deliveryMethod === 'pickup' ? 'active' : ''}`}
            onClick={() => setDeliveryMethod('pickup')}
          >
            <h3 className="card-title">Pharmacy Pickup</h3>
            <p className="card-text" style={{ fontSize: '0.875rem' }}>Ready in 30 minutes.</p>
          </div>
          <div 
            className={`delivery-option-card ${deliveryMethod === 'delivery' ? 'active' : ''}`}
            onClick={() => setDeliveryMethod('delivery')}
          >
            <h3 className="card-title">Home Delivery</h3>
            <span className="delivery-badge">Nairobi Only</span>
            <p className="card-text" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Our rider will bring it within 3 hours.</p>
          </div>
        </div>

        {deliveryMethod === 'delivery' && (
          <div style={{ marginBottom: '2rem' }}>
            <label className="report-label">Delivery Address</label>
            <textarea 
              className="address-textarea" 
              placeholder="Enter your address..." 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
            />
          </div>
        )}

        <div className="nav-buttons">
          <button className="card-button card-button-secondary" onClick={() => setStep('list')}>
            Back
          </button>
          <button className="card-button" onClick={handleRefillRequest}>
            Order now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pharmacy-container">
      <h1 className="booking-step-title">Active Prescriptions</h1>
      {loading ? (
        <p>Loading your prescriptions...</p>
      ) : prescriptions.length > 0 ? (
        prescriptions.map(rx => (
          <div key={rx.id} className="prescription-card">
            <h2 className="card-title">{rx.drug}</h2>
            <p className="dosage-hint">{rx.dosage}</p>
            <p className="card-text" style={{ fontSize: '0.875rem' }}>
              Remaining Refills: <strong>{rx.remaining}</strong>
            </p>
            <button 
              className="card-button" 
              style={{ marginTop: '1.5rem', width: 'auto', padding: '0.75rem 1.5rem' }}
              onClick={() => { setSelectedPrescription(rx.id); setStep('refill'); }}
            >
              Request refill
            </button>
          </div>
        ))
      ) : (
        <p className="card-text text-center my-8">No active prescriptions available for refill.</p>
      )}
      <div className="nav-buttons">
        <button className="card-button card-button-secondary" onClick={onBack}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PrescriptionExperience;
