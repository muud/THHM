import React from 'react';

interface QuickActionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({ isOpen, onClose, onAction }) => {
  return (
    <>
      <div 
        className={`g-panel-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      ></div>
      
      <div className={`g-panel ${isOpen ? 'open' : ''}`}>
        <div className="g-panel-handle"></div>
        <div className="g-panel-header">
          <span className="g-panel-title">
            <i className="fas fa-bolt mr-2 text-yellow-500"></i>
            Quick Actions
          </span>
          <button className="g-panel-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6 pb-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <button 
            onClick={() => onAction('booking')}
            className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-[2rem] border border-green-100 hover:bg-green-600 hover:text-white transition-all group"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', borderRadius: '2rem', border: '1px solid #DCFCE7', cursor: 'pointer', background: '#F0FDF4' }}
          >
            <i className="fas fa-calendar-plus text-2xl mb-3 text-green-600 group-hover:text-white" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}></i>
            <span className="text-[10px] font-black uppercase tracking-widest text-center" style={{ fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Book Appt.</span>
          </button>

          <button 
            onClick={() => onAction('refill')}
            className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-[2rem] border border-green-100 hover:bg-green-600 hover:text-white transition-all group"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', borderRadius: '2rem', border: '1px solid #DCFCE7', cursor: 'pointer', background: '#F0FDF4' }}
          >
            <i className="fas fa-prescription-bottle text-2xl mb-3 text-green-600 group-hover:text-white" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}></i>
            <span className="text-[10px] font-black uppercase tracking-widest text-center" style={{ fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Refill Meds</span>
          </button>

          <button 
            onClick={() => onAction('lab')}
            className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-[2rem] border border-green-100 hover:bg-green-600 hover:text-white transition-all group"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', borderRadius: '2rem', border: '1px solid #DCFCE7', cursor: 'pointer', background: '#F0FDF4' }}
          >
            <i className="fas fa-microscope text-2xl mb-3 text-green-600 group-hover:text-white" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}></i>
            <span className="text-[10px] font-black uppercase tracking-widest text-center" style={{ fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Lab Results</span>
          </button>

          <button 
            onClick={() => onAction('radio')}
            className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-[2rem] border border-green-100 hover:bg-green-600 hover:text-white transition-all group"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', borderRadius: '2rem', border: '1px solid #DCFCE7', cursor: 'pointer', background: '#F0FDF4' }}
          >
            <i className="fas fa-x-ray text-2xl mb-3 text-green-600 group-hover:text-white" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}></i>
            <span className="text-[10px] font-black uppercase tracking-widest text-center" style={{ fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Check Scans</span>
          </button>


          <button 
            onClick={() => onAction('support')}
            className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-[2rem] border border-green-100 hover:bg-green-600 hover:text-white transition-all group"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', borderRadius: '2rem', border: '1px solid #DCFCE7', cursor: 'pointer', background: '#F0FDF4' }}
          >
            <i className="fas fa-headset text-2xl mb-3 text-green-600 group-hover:text-white" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}></i>
            <span className="text-[10px] font-black uppercase tracking-widest text-center" style={{ fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Support</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default QuickActionsPanel;
