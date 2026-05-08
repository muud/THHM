import React, { useState, useEffect } from 'react';
import './../index.css';
import microcopy from '../data/microcopy.json';

interface WelcomeScreenProps {
  onStart: () => void;
  onLogin: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onLogin }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = microcopy.welcome.slides;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <main className="welcome-carousel">
      {/* Top Navigation */}
      <div className="auth-overlay">
        <button onClick={onLogin} className="glass-btn">
          Sign In
        </button>
      </div>

      {/* Carousel Slides */}
      {slides.map((slide, index) => (
        <div 
          key={index} 
          className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
        >
          <img src={slide.image} alt={slide.title} className="slide-image" />
          
          {index === currentSlide && (
            <div className="carousel-overlay">
              <h1 className="carousel-title">{slide.title}</h1>
              <p className="carousel-subtitle">{slide.subtitle}</p>
              <button className="premium-cta" onClick={onStart}>
                {microcopy.welcome.cta}
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Navigation Dots */}
      <div className="glass-nav">
        {slides.map((_, index) => (
          <div 
            key={index}
            className={`nav-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </main>
  );
};

export default WelcomeScreen;
