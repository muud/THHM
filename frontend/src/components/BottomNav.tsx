import React from 'react';

interface BottomNavProps {
  activeView: string;
  onViewChange: (view: any) => void;
  onFabClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onViewChange, onFabClick }) => {
  return (
    <nav className="bottom-nav">
      <button 
        className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
        onClick={() => onViewChange('dashboard')}
      >
        <i className="fas fa-th-large"></i>
        <span>Overview</span>
      </button>

      <button 
        className={`nav-item ${activeView === 'vitals' ? 'active' : ''}`}
        onClick={() => onViewChange('vitals')}
      >
        <i className="fas fa-heartbeat"></i>
        <span>Vitals</span>
      </button>

      <button 
        className={`nav-item ${activeView === 'admin' ? 'active' : ''}`}
        onClick={() => onViewChange('admin')}
      >
        <i className="fas fa-hospital-user"></i>
        <span>Admin</span>
      </button>
      
      <button className="fab-center" onClick={onFabClick}>
        <i className="fas fa-plus"></i>
      </button>

      <button 
        className={`nav-item ${activeView === 'lab' ? 'active' : ''}`}
        onClick={() => onViewChange('lab')}
      >
        <i className="fas fa-flask"></i>
        <span>Labs</span>
      </button>

      <button 
        className={`nav-item ${activeView === 'radio' ? 'active' : ''}`}
        onClick={() => onViewChange('radio')}
      >
        <i className="fas fa-x-ray"></i>
        <span>Imaging</span>
      </button>
    </nav>
  );
};

export default BottomNav;
