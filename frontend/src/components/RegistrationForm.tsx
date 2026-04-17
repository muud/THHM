import React, { useState } from 'react';
import { apiFetch } from '../services/api';

interface RegistrationFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    nhif_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    allergies: '',
    chronic_conditions: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch('/api/patients/register/', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          nhif_number: formData.nhif_number,
          emergency_contact_name: formData.emergency_contact_name,
          emergency_contact_phone: formData.emergency_contact_phone,
          allergies: formData.allergies,
          chronic_conditions: formData.chronic_conditions
        })
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Registration failed. Please check your details.');
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="welcome-container">
        <div className="form-container success-message">
          <div className="success-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <h1 className="form-title">Welcome to TrueHealth!</h1>
          <p className="form-subtitle">Your account and patient profile have been created successfully.</p>
          <button onClick={onSuccess} className="form-submit" style={{ marginTop: '2rem' }}>Go to my dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="welcome-container">
      <div className="form-container" style={{ maxWidth: '800px' }}>
        <div className="form-header">
          <h1 className="form-title">Let’s get you registered.</h1>
          <p className="form-subtitle">Complete your profile to access personalized care.</p>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="hero-section" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="hero-content" style={{ textAlign: 'left', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="firstName">First Name</label>
                  <input type="text" id="firstName" className="form-input" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="lastName">Last Name</label>
                  <input type="text" id="lastName" className="form-input" value={formData.lastName} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">Email address</label>
                <input type="email" id="email" className="form-input" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input type="password" id="password" className="form-input" value={formData.password} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="date_of_birth">Date of birth</label>
                <input type="date" id="date_of_birth" className="form-input" value={formData.date_of_birth} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="gender">Gender</label>
                <select id="gender" className="form-input" value={formData.gender} onChange={handleChange} required>
                  <option value="">Select gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
            </div>

            <div className="hero-content" style={{ textAlign: 'left', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="phone">Mobile phone</label>
                <input type="tel" id="phone" className="form-input" value={formData.phone} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="emergency_contact_name">Emergency Contact Name</label>
                <input type="text" id="emergency_contact_name" className="form-input" value={formData.emergency_contact_name} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="emergency_contact_phone">Emergency Contact Phone</label>
                <input type="tel" id="emergency_contact_phone" className="form-input" value={formData.emergency_contact_phone} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="nhif_number">NHIF number (optional)</label>
                <input type="text" id="nhif_number" className="form-input" value={formData.nhif_number} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="hero-section" style={{ gridTemplateColumns: '1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label" htmlFor="allergies">Allergies (if any)</label>
              <textarea id="allergies" className="form-input" rows={2} value={formData.allergies} onChange={handleChange}></textarea>
            </div>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label" htmlFor="chronic_conditions">Ongoing health issues</label>
              <textarea id="chronic_conditions" className="form-input" rows={2} value={formData.chronic_conditions} onChange={handleChange}></textarea>
            </div>
          </div>

          <button type="submit" className="form-submit" disabled={loading} style={{ maxWidth: '400px', margin: '2rem auto 0' }}>
            {loading ? 'Creating account...' : 'Register & continue →'}
          </button>
        </form>

        <div className="form-footer">
          <button onClick={onBack} className="form-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            ← Cancel and go back
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
