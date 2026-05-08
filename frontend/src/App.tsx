import { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import LoginScreen from './components/LoginScreen';
import RegistrationForm from './components/RegistrationForm';
import PatientDashboard from './components/PatientDashboard';
import AppointmentBooking from './components/AppointmentBooking';
import ReceptionistDashboard from './components/ReceptionistDashboard';
import NurseDashboard from './components/NurseDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import LabDashboard from './components/LabDashboard';
import AdminDashboard from './components/AdminDashboard';
import AdmissionWorkflow from './components/AdmissionWorkflow';
import MedGemmaDiagnosis from './components/MedGemmaDiagnosis';

import BottomNav from './components/BottomNav';
import QuickActionsPanel from './components/QuickActionsPanel';
import PrescriptionExperience from './components/PrescriptionExperience';
import AttendanceToggle from './components/AttendanceToggle';
type ViewState = 'welcome' | 'login' | 'register' | 'dashboard' | 'booking' | 'lab' | 'radio' | 'vitals' | 'admin' | 'admit' | 'medgemma' | 'refill' | 'reception' | 'doctor';

function App() {
  const [view, setView] = useState<ViewState>('welcome');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeout);
      if (view !== 'login' && view !== 'welcome' && view !== 'register') {
        timeout = setTimeout(() => {
          setView('login');
          setUserRole(null);
        }, 300000); // 5 minutes
      }
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [view]);

  const goToWelcome = () => setView('welcome');
  const goToLogin = () => setView('login');
  const goToRegister = () => setView('register');
  const goToDashboard = () => setView('dashboard');
  const goToBooking = () => setView('booking');
  const goToLab = () => setView('lab');
  const goToRadio = () => setView('radio');
  const goToVitals = () => setView('vitals');
  const goToAdmin = () => setView('admin');
  const goToAdmit = () => setView('admit');
  const goToMedGemma = () => setView('medgemma');
  const goToRefill = () => setView('refill');

  const handleLoginSuccess = (role: string, isPatient: boolean) => {
    setUserRole(role);
    if (isPatient || role === 'patient') {
      setView('dashboard');
    } else if (role === 'receptionist' || role === 'cashier') {
      setView('reception');
    } else if (role === 'nurse') {
      setView('vitals');
    } else if (role === 'doctor') {
      setView('doctor');
    } else if (role === 'lab_tech') {
      setView('lab');
    } else if (role === 'pharmacist') {
      setView('refill');
    } else if (role === 'admin' || role === 'manager' || role === 'er_developer') {
      setView('admin');
    } else {
      setView('dashboard');
    }
  };


  const handleAction = (action: string) => {
    setIsPanelOpen(false);

    // Simple RBAC checks
    const hasAdminAccess = ['admin', 'manager', 'er_developer'].includes(userRole || '');
    if (action === 'admin' && !hasAdminAccess) {
        alert('Access Denied: Only Admins and Managers can access the Command Center.');
        return;
    }



    if (action === 'booking') goToBooking();
    if (action === 'lab') goToLab();
    if (action === 'radio') goToRadio();
    if (action === 'vitals') goToVitals();
    if (action === 'admin') goToAdmin();
    if (action === 'refill') goToRefill();
    if (action === 'support') alert("Connecting you to TrueHealth live support... (Coming soon)");
  };

  const showNav = ['dashboard', 'booking', 'lab', 'radio', 'vitals', 'admin', 'refill', 'reception', 'doctor'].includes(view);

  return (
    <div className="App">
      {showNav && (
        <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 1000 }}>
          <AttendanceToggle />
        </div>
      )}
      {view === 'welcome' && (
        <WelcomeScreen 
          onStart={goToRegister} 
          onLogin={goToLogin} 
        />
      )}
      
      {view === 'login' && (
        <LoginScreen 
          onBack={goToWelcome} 
          onSuccess={handleLoginSuccess}
        />
      )}

      {view === 'register' && (
        <RegistrationForm 
          onBack={goToWelcome} 
          onSuccess={() => handleLoginSuccess('patient', true)}
        />
      )}

      {view === 'dashboard' && (
        <PatientDashboard 
          userName="John Doe" 
          onBook={goToBooking}
          onViewLabs={goToLab}
          onViewRadio={goToRadio}
        />
      )}

      {view === 'booking' && (
        <AppointmentBooking 
          onBack={goToDashboard}
          onConfirm={goToDashboard}
        />
      )}

      {view === 'reception' && (
        <ReceptionistDashboard />
      )}
      
      {view === 'lab' && (
        <LabDashboard />
      )}

      {view === 'vitals' && (
        <NurseDashboard />
      )}

      {view === 'doctor' && (
        <DoctorDashboard />
      )}

      {view === 'admin' && (
        <AdminDashboard 
          onAdmit={goToAdmit}
          onDiagnose={goToMedGemma}
        />
      )}

      {view === 'admit' && (
        <AdmissionWorkflow 
          onBack={goToAdmin}
          onSuccess={goToAdmin}
        />
      )}

      {view === 'medgemma' && (
        <MedGemmaDiagnosis 
          onBack={goToAdmin}
        />
      )}

      {view === 'refill' && (
        <PrescriptionExperience 
          onBack={goToDashboard}
        />
      )}
      
      {showNav && (
        <>
          <BottomNav 
            activeView={view} 
            onViewChange={setView} 
            onFabClick={() => setIsPanelOpen(true)} 
          />
          <QuickActionsPanel 
            isOpen={isPanelOpen} 
            onClose={() => setIsPanelOpen(false)} 
            onAction={handleAction} 
          />
        </>
      )}
    </div>
  );
}

export default App;
