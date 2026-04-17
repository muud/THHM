import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

interface LabExperienceProps {
  onBack: () => void;
  onBookFollowUp: () => void;
}

type LabStep = 'request' | 'instructions' | 'results';

interface LabTest {
  id: string;
  name: string;
  hint: string;
}

interface LabResult {
  id: string | number;
  name: string;
  value: string;
  unit: string;
  status: 'normal' | 'review';
  explanation: string;
}

const COMMON_TESTS: LabTest[] = [
  { id: 'glucose', name: 'Blood sugar (glucose)', hint: 'Check for diabetes risk.' },
  { id: 'malaria', name: 'Malaria rapid test', hint: 'If you have fever and chills.' },
  { id: 'urinalysis', name: 'Urinalysis', hint: 'For possible infection or kidney issues.' },
];

const LabExperience: React.FC<LabExperienceProps> = ({ onBack, onBookFollowUp }) => {
  const [step, setStep] = useState<LabStep>('results'); // Default to viewing results
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [results, setResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await apiFetch('/api/lab/my/');
        if (response.ok) {
          const data = await response.json();
          // Map backend data to internal format
          const mapped: LabResult[] = data.map((item: any, index: number) => ({
            id: index,
            name: item.test_name,
            value: item.value,
            unit: item.unit,
            status: item.interpretation === 'Normal' ? 'normal' : 'review',
            explanation: item.interpretation === 'Normal' 
              ? 'This is within the healthy range.' 
              : 'Your result is outside the usual range. Please discuss this with your doctor.'
          }));
          setResults(mapped);
        }
      } catch (e) {
        console.error("Failed to fetch lab results", e);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const toggleTest = (id: string) => {
    setSelectedTests(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  if (step === 'request') {
    return (
      <div className="lab-container">
        <h1 className="booking-step-title">Request a Lab Test</h1>
        <p className="card-text" style={{ marginBottom: '2.5rem', fontSize: '1.125rem' }}>
          Your doctor may have asked you to take some tests. You can also request common tests yourself.
        </p>
        
        <div className="selectable-grid">
          {COMMON_TESTS.map(test => (
            <div 
              key={test.id}
              className={`selectable-card ${selectedTests.includes(test.id) ? 'selected' : ''}`}
              onClick={() => toggleTest(test.id)}
            >
              <h3 className="card-title" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{test.name}</h3>
              <p className="test-hint">{test.hint}</p>
            </div>
          ))}
        </div>

        <div className="nav-buttons">
          <button className="card-button card-button-secondary" onClick={() => setStep('results')}>
            Back to Results
          </button>
          <button 
            className="card-button" 
            disabled={selectedTests.length === 0}
            onClick={() => setStep('instructions')}
          >
            Request these tests
          </button>
        </div>
      </div>
    );
  }

  if (step === 'instructions') {
    return (
      <div className="lab-container">
        <h1 className="booking-step-title">Collection Instructions</h1>
        <div className="instruction-banner">
          <svg 
            width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', opacity: 0.2 }}
          >
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <p className="card-text" style={{ fontSize: '1.125rem', lineHeight: '1.6' }}>
            <strong>For blood tests:</strong> 
            Please fast for 8 hours (no food, only water).
          </p>
          <p className="card-text" style={{ fontSize: '1.125rem', lineHeight: '1.6', marginTop: '1.5rem' }}>
            <strong>For urine:</strong> 
            Collect the first morning sample in a clean container.
          </p>
        </div>

        <div className="nav-buttons">
          <button className="card-button card-button-secondary" onClick={() => setStep('request')}>
            Back
          </button>
          <button 
            className="card-button" 
            onClick={async () => { 
                for (const testId of selectedTests) {
                  try {
                    await apiFetch('/api/lab/request/', { 
                        method: 'POST', 
                        body: JSON.stringify({ test_name: testId }) 
                    });
                  } catch(e) {}
                }
                onBookFollowUp(); 
            }}
          >
            I understand, schedule collection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lab-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h1 className="booking-step-title" style={{ marginBottom: 0 }}>Your Lab Results</h1>
        <button className="card-button card-button-secondary" style={{ width: 'auto', padding: '0.75rem 1.5rem' }} onClick={() => setStep('request')}>
          + Request New Test
        </button>
      </div>

      <p className="card-text" style={{ fontSize: '1.125rem', marginBottom: '2rem' }}>
        Your results are in. We explain them in plain language.
      </p>

      <div className="result-list">
        {loading ? (
          <p className="card-text">Loading your results...</p>
        ) : results.length === 0 ? (
          <p className="card-text">No lab results found. You can request a new test above.</p>
        ) : (
          results.map(result => (
            <div key={result.id} className="result-item">
              <div className="result-header">
                <span className="result-name">{result.name}</span>
                <span className={`status-badge ${result.status === 'normal' ? 'status-normal' : 'status-review'}`}>
                  {result.status === 'normal' ? 'Healthy' : 'Review Needed'}
                </span>
              </div>
              <div className="result-value">{result.value} {result.unit}</div>
              <div className="plain-language">
                {result.explanation}
                {result.status === 'review' && (
                  <button 
                    className="card-button" 
                    style={{ marginTop: '1.5rem', width: 'auto', padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}
                    onClick={onBookFollowUp}
                  >
                    Schedule follow-up
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="nav-buttons">
        <button className="card-button card-button-secondary" onClick={onBack}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default LabExperience;
