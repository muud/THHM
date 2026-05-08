import React from 'react';
import './../index.css';
import microcopy from '../data/microcopy.json';

import HospitalLogo from './HospitalLogo';

interface WelcomeScreenProps {
  onStart: () => void;
  onLogin: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onLogin }) => {
  const w = microcopy.welcome;

  // Fallback banner if the uploaded one isn't found in /public yet
  const fallbackBanner = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000";

  return (
    <main className="welcome-branded">
      {/* Top Header with Logo */}
      <nav className="branded-nav">
        <div className="logo-container">
          <div className="hospital-logo">
            <HospitalLogo />
          </div>
          <div className="hospital-info">
            <h1 className="nav-title">{w.hospitalName}</h1>
            <p className="nav-tagline">{w.tagline}</p>
          </div>
        </div>
        <button onClick={onLogin} className="glass-btn primary">
          Sign In
        </button>
      </nav>

      {/* Main Banner Section */}
      <section className="banner-section">
        <div className="banner-container">
          <img 
            src={w.banner} 
            alt="Hospital Banner" 
            className="main-banner"
            onError={(e) => { (e.target as HTMLImageElement).src = fallbackBanner; }}
          />
        </div>
        
        <div className="welcome-content">
          <h2 className="welcome-heading">Welcome to {w.hospitalName}</h2>
          <p className="welcome-subheading">
            {w.services.join(' • ')}
          </p>
          
          <button className="premium-cta branded" onClick={onStart}>
            {w.cta}
          </button>
        </div>
      </section>

      {/* Footer Branded Info */}
      <footer className="branded-footer">
        <div className="address-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{w.address}</span>
        </div>
      </footer>
    </main>
  );
};

export default WelcomeScreen;
