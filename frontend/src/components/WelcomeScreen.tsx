import React from 'react';
import './../index.css';

interface WelcomeScreenProps {
  onStart: () => void;
  onLogin: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onLogin }) => {
  return (
    <main className="welcome-container">
      <div className="hero-section">
        <div className="hero-content">
          <div className="glass-badge">
            Your Health, Our Mission
          </div>
          <h1 className="hero-title">
            Welcome to TrueHealth.<br />
            We’re here to listen, heal, and support you – every step of the way.
          </h1>
          <p className="hero-subtext">
            No medical jargon. No rushed decisions. Just clear, compassionate care.
          </p>
          <button 
            className="cta-button"
            onClick={onStart}
          >
            Start my health journey
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              style={{ marginLeft: '4px' }}
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="hero-image-container">
          <img 
            src="/welcome_hero.png" 
            alt="Compassionate care from TrueHealth" 
            className="hero-image"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1576091160550-21735999291c?auto=format&fit=crop&q=80&w=2000';
            }}
          />
        </div>
      </div>
      <div className="form-footer" style={{ marginTop: '2rem' }}>
        <p>
          Already have an account?{' '}
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onLogin(); }} 
            className="form-link"
          >
            Sign in to your account
          </a>
        </p>
      </div>
    </main>
  );
};

export default WelcomeScreen;
