import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

interface AppointmentBookingProps {
  onBack: () => void;
  onConfirm: () => void;
}

type Step = 'department' | 'doctor' | 'slot' | 'confirm' | 'success';

const DEPARTMENTS = [
  { id: 'general', title: 'General Check-up', desc: 'Feeling unwell? Start with a General Check-up.' },
  { id: 'maternity', title: 'Maternity', desc: 'Expecting a baby? Our Maternity team is ready.' },
  { id: 'optometry', title: 'Optometry', desc: 'Eye problems? See our optometrist.' },
  { id: 'immunization', title: 'Immunization', desc: 'Need a vaccination for your child? Go to Immunisation.' },
];

interface Doctor {
  id: string | number;
  name: string;
  specialty: string;
  bio: string;
  reviews: number;
}

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({ onBack, onConfirm }) => {
  const [step, setStep] = useState<Step>('department');
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDept && step === 'doctor') {
      const fetchData = async () => {
        setLoading(true);
        try {
          const response = await apiFetch('/api/appointments/available-slots/', {
            method: 'POST',
            body: JSON.stringify({ specialty: selectedDept })
          });
          if (response.ok) {
            const data = await response.json();
            const mappedDoctors: Doctor[] = data.map((item: any) => ({
              id: item.doctor_id,
              name: item.doctor,
              specialty: 'Medical Professional',
              bio: 'Experienced clinical specialist at TrueHealth.',
              reviews: 4.8 + Math.random() * 0.2
            }));
            const uniqueDoctors = Array.from(new Map(mappedDoctors.map((d: any) => [d.id, d])).values() as Iterable<Doctor>);
            setDoctors(uniqueDoctors);
            setSlots(data);
          }
        } catch (e) {
          console.error("Failed to fetch slots", e);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [selectedDept, step]);

  const nextStep = () => {
    if (step === 'department') setStep('doctor');
    else if (step === 'doctor') setStep('slot');
    else if (step === 'slot') setStep('confirm');
    else if (step === 'confirm') setStep('success');
  };

  const prevStep = () => {
    if (step === 'doctor') setStep('department');
    else if (step === 'slot') setStep('doctor');
    else if (step === 'confirm') setStep('slot');
    else onBack();
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    try {
      const response = await apiFetch('/api/appointments/book/', {
        method: 'POST',
        body: JSON.stringify({
          doctor_id: selectedSlot.doctor_id,
          datetime: selectedSlot.datetime
        })
      });
      if (response.ok) {
        setStep('success');
      }
    } catch (e) {
      console.error("Booking failed", e);
    } finally {
      setLoading(false);
    }
  };

  const renderProgress = () => (
    <div className="progress-stepper">
      <div className={`step-indicator ${['department', 'doctor', 'slot', 'confirm'].includes(step) ? 'active' : ''}`} />
      <div className={`step-indicator ${['doctor', 'slot', 'confirm'].includes(step) ? 'active' : ''}`} />
      <div className={`step-indicator ${['slot', 'confirm'].includes(step) ? 'active' : ''}`} />
      <div className={`step-indicator ${['confirm'].includes(step) ? 'active' : ''}`} />
    </div>
  );

  if (step === 'success') {
    return (
      <div className="booking-container" style={{ textAlign: 'center' }}>
        <div className="success-icon" style={{ margin: '0 auto 2rem' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
        </div>
        <h1 className="booking-step-title">All set!</h1>
        <p className="card-text" style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>
          You’ll get a confirmation SMS shortly. Arrive 10 minutes early to complete any forms.
        </p>
        <button className="card-button" onClick={onConfirm} style={{ margin: '0 auto' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="booking-container">
      {renderProgress()}

      {step === 'department' && (
        <>
          <h1 className="booking-step-title">Which department do you need?</h1>
          <div className="selectable-grid">
            {DEPARTMENTS.map((dept) => (
              <div 
                key={dept.id}
                className={`selectable-card ${selectedDept === dept.id ? 'selected' : ''}`}
                onClick={() => { setSelectedDept(dept.id); nextStep(); }}
              >
                <h3 className="card-title" style={{ marginBottom: '0.5rem' }}>{dept.title}</h3>
                <p className="card-text" style={{ fontSize: '1rem' }}>{dept.desc}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {step === 'doctor' && (
        <>
          <h1 className="booking-step-title">Choose your doctor</h1>
          {loading ? (
            <p className="card-text">Finding available doctors...</p>
          ) : (
            <>
              <p className="card-text" style={{ marginBottom: '2rem' }}>
                Here are our available doctors for <strong>{DEPARTMENTS.find(d => d.id === selectedDept)?.title}</strong>.
              </p>
              <div className="doctor-list">
                {doctors.map((doc) => (
                  <div 
                    key={doc.id}
                    className="doctor-card"
                    onClick={() => { setSelectedDoctor(doc); nextStep(); }}
                  >
                    <div className="doctor-avatar">
                      {typeof doc.name === 'string' ? doc.name.split(' ')[1]?.[0] || doc.name[0] : '?'}
                    </div>
                    <div>
                      <div className="tooltip-trigger">
                        <h3 className="card-title" style={{ fontSize: '1.25rem' }}>{doc.name}</h3>
                        <div className="tooltip-content">
                          <strong>Bio:</strong> {doc.bio}<br /><br />
                          <strong>Rating:</strong> ⭐ {doc.reviews.toFixed(1)} / 5.0
                        </div>
                      </div>
                      <p className="card-text" style={{ fontSize: '0.9375rem' }}>{doc.specialty}</p>
                    </div>
                    <button className="card-button card-button-secondary" style={{ marginLeft: 'auto' }}>
                      Select
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {step === 'slot' && (
        <>
          <h1 className="booking-step-title">Pick Date & Time</h1>
          <p className="card-text">Select a time that works for you. We’ll send a reminder by SMS.</p>
          <div style={{ marginTop: '2rem' }}>
            <h3 className="card-title" style={{ fontSize: '1.125rem' }}>Available times for {selectedDoctor?.name}</h3>
            <div className="slot-grid">
              {slots
                .filter(s => s.doctor_id === selectedDoctor?.id)
                .map((s, idx) => {
                  const t = new Date(s.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div 
                      key={idx}
                      className={`time-slot ${selectedSlot === s ? 'selected' : ''}`}
                      onClick={() => setSelectedSlot(s)}
                    >
                      {t}
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}

      {step === 'confirm' && (
        <>
          <h1 className="booking-step-title">Confirm Appointment</h1>
          <div className="booking-summary">
            <h3>Booking Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p className="card-text"><strong>Department:</strong> {DEPARTMENTS.find(d => d.id === selectedDept)?.title}</p>
              <p className="card-text"><strong>Doctor:</strong> {selectedDoctor?.name}</p>
              <p className="card-text"><strong>Time:</strong> {selectedSlot ? new Date(selectedSlot.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
              <p className="card-text"><strong>Date:</strong> {selectedSlot ? new Date(selectedSlot.datetime).toLocaleDateString() : ''}</p>
            </div>
          </div>
        </>
      )}

      <div className="nav-buttons">
        <button className="card-button card-button-secondary" onClick={prevStep} disabled={loading}>
          {step === 'department' ? 'Cancel' : 'Back'}
        </button>
        {step !== 'department' && step !== 'doctor' && (
          <button 
            className="card-button" 
            onClick={step === 'confirm' ? handleConfirmBooking : nextStep}
            disabled={loading || (step === 'slot' && !selectedSlot)}
          >
            {loading ? 'Processing...' : (step === 'confirm' ? 'Confirm my appointment' : 'Next')}
          </button>
        )}
      </div>
    </div>
  );
};

export default AppointmentBooking;
