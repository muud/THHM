import React, { useState } from 'react';
import { apiFetch } from '../services/api';

interface LoginScreenProps {
  onBack?: () => void;
  onSuccess: (role: string, isPatient: boolean) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onBack, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch('/api/core/login/', {
        method: 'POST',
        body: JSON.stringify({ username: email.trim(), password })
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        onSuccess(data.role || 'patient', data.is_patient || false);
      } else {
        setError(data.error || 'Invalid email or password.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="welcome-container">
      <div className="form-container">
        <div className="form-header">
          <h1 className="form-title">Welcome back</h1>
          <p className="form-subtitle">We're glad to see you again. Your health journey continues here.</p>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input 
              type="text" 
              id="email" 
              className="form-input" 
              placeholder="e.g. name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                className="form-input" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6B7280'
                }}
              >
                <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
              </button>
            </div>
          </div>

          <button type="submit" className="form-submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in securely'}
          </button>
        </form>



        <div className="form-footer" style={{ marginTop: '2rem' }}>
          <p>
            Forgot your password? It happens.{' '}
            <a href="#" className="form-link">We’ll help you reset it.</a>
          </p>
          <br />
          <button 
            onClick={onBack}
            className="form-link"
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              marginTop: '1rem' 
            }}
          >
            ← Back to welcome
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
