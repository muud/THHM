import React from 'react';

const HospitalLogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className} 
      style={{ width: '100%', height: '100%' }}
    >
      {/* Background Circle / Hand shape */}
      <path 
        d="M20,50 C20,20 80,20 80,50 C80,80 50,95 20,80 C15,75 10,65 15,55" 
        fill="none" 
        stroke="#4FC3F7" 
        strokeWidth="8" 
        strokeLinecap="round"
      />
      
      {/* Pink Person */}
      <path d="M30,70 L25,55 C25,50 35,50 35,55 L30,70" fill="#E91E63" />
      <circle cx="30" cy="50" r="4" fill="#E91E63" />
      
      {/* Purple Person (Center) */}
      <path d="M50,75 L45,55 C45,45 55,45 55,55 L50,75" fill="#673AB7" />
      <circle cx="50" cy="45" r="5" fill="#673AB7" />
      
      {/* Green Person */}
      <path d="M70,70 L75,55 C75,50 65,50 65,55 L70,70" fill="#8BC34A" />
      <circle cx="70" cy="50" r="4" fill="#8BC34A" />
      
      {/* Colorful dots */}
      <circle cx="35" cy="35" r="3" fill="#8BC34A" />
      <circle cx="50" cy="30" r="4" fill="#FF9800" />
      <circle cx="65" cy="35" r="3" fill="#FF5722" />
    </svg>
  );
};

export default HospitalLogo;
