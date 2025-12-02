// src/pages/Dashboard.tsx
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);

  // ENTRY FIELDS
  const [calories, setCalories] = useState('');
  const [steps, setSteps] = useState('');
  const [hours, setHours] = useState('');
  const [water, setWater] = useState('');
  const [exercise, setExercise] = useState('');
  const [weight, setWeight] = useState('');
  const [protein, setProtein] = useState('');

  // GOALS FIELDS
  const [goalCalories, setGoalCalories] = useState('');
  const [goalSteps, setGoalSteps] = useState('');
  const [goalSleep, setGoalSleep] = useState('');
  const [goalWater, setGoalWater] = useState('');
  const [goalExercise, setGoalExercise] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [goalProtein, setGoalProtein] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const resetForm = () => {
    setCalories('');
    setSteps('');
    setHours('');
    setWater('');
    setExercise('');
    setWeight('');
    setProtein('');
  };

  const resetGoals = () => {
    setGoalCalories('');
    setGoalSteps('');
    setGoalSleep('');
    setGoalWater('');
    setGoalExercise('');
    setGoalWeight('');
    setGoalProtein('');
  };

  // Calculate Sunday date
  const getSundayDate = () => {
    const today = new Date();
    const day = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - day);
    return sunday.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const sundayDate = getSundayDate();

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 0.9rem',
    border: '1px solid #e5e7eb',
    borderRadius: '0.75rem',
  };

  const Modal = ({ title, onClose, children }: any) => (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '1.25rem',
          width: 'min(520px, 95vw)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} className="btn-secondary btn-sm">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <div className="page-gradient" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <h1 className="heading-4">HealthTrack</h1>
          <div className="header-actions">
            {user?.picture && (
              <img src={user.picture} alt={user.name} className="user-avatar" />
            )}
            <span className="user-name">{user?.name || user?.email}</span>
            <button onClick={handleLogout} className="btn-secondary btn-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="page-container text-center">
        <h2 className="heading-1 mb-4">Welcome to HealthTrack 🏃‍♂️🥗🏋️‍♂️</h2>
        <p className="body-xl text-secondary text-italic mb-16">
          Your journey to a healthier you starts here 📍
        </p>

        <div className="button-group mt-16 mb-20">
          <button onClick={() => setShowEntryModal(true)} className="btn-primary btn-lg btn-elevated">
            Add Entry
          </button>
          <button onClick={() => setShowGoalsModal(true)} className="btn-primary btn-lg btn-elevated">
            My Goals
          </button>
          <button onClick={() => navigate('/analytics')} className="btn-primary btn-lg btn-elevated">
            Analytics
          </button>
        </div>
      </main>

      {/* Add Entry Modal */}
      {showEntryModal && (
        <Modal
          title={`Add entries for the week of ${sundayDate}`}
          onClose={() => {
            setShowEntryModal(false);
            resetForm();
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input style={inputStyle} type="text" placeholder="Calories" value={calories} onChange={(e) => setCalories(e.target.value)} />
            <input style={inputStyle} type="text" placeholder="Steps" value={steps} onChange={(e) => setSteps(e.target.value)} />
            <input style={inputStyle} type="text" placeholder="Hours Slept" value={hours} onChange={(e) => setHours(e.target.value)} />
            <input style={inputStyle} type="text" placeholder="Water Intake (oz)" value={water} onChange={(e) => setWater(e.target.value)} />
            <input style={inputStyle} type="text" placeholder="Exercise Hours" value={exercise} onChange={(e) => setExercise(e.target.value)} />
            <input style={inputStyle} type="text" placeholder="Weight (lbs)" value={weight} onChange={(e) => setWeight(e.target.value)} />
            <input style={inputStyle} type="text" placeholder="Protein Intake (g)" value={protein} onChange={(e) => setProtein(e.target.value)} />
            <button type="button" className="btn-primary btn-lg btn-elevated">
              Submit Entry
            </button>
          </div>
        </Modal>
      )}

      {/* My Goals Modal */}
      {showGoalsModal && (
        <Modal
          title={`My goals for the week of ${sundayDate}`}
          onClose={() => {
            setShowGoalsModal(false);
            resetGoals();
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input style={inputStyle} type="text" placeholder="Calories Goal" value={goalCalories} onChange={(e) => setGoalCalories(e.target.value)} />
            <input style={inputStyle} type="text" placeholder="Steps Goal" value={goalSteps} onChange={(e) => setGoalSteps(e.target.value)} />
            <input style={inputStyle} type="text" placeholder="Sleep Goal (hrs)" value={goalSleep} onChange={(e) => setGoalSleep(e.target.value)} />
            <input style={inputStyle} type="text" placeholder="Water Intake Goal (oz)" value={goalWater} onChange={(e) => setGoalWater(e.target.value)} />
            <input style={inputStyle} type="text" placeholder="Exercise Hours Goal" value={goalExercise} onChange={(e) => setGoalExercise(e.target.value)} />
            <input style={inputStyle} type="text" placeholder="Weight Goal (lbs)" value={goalWeight} onChange={(e) => setGoalWeight(e.target.value)} />
            <input style={inputStyle} type="text" placeholder="Protein Intake Goal (g)" value={goalProtein} onChange={(e) => setGoalProtein(e.target.value)} />
            <button type="button" className="btn-primary btn-lg btn-elevated">
              Save Goals
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
