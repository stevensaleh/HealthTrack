// src/pages/Dashboard.tsx
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);

  const [calories, setCalories] = useState('');
  const [steps, setSteps] = useState('');
  const [hours, setHours] = useState('');

  const [goalCalories, setGoalCalories] = useState('');
  const [goalSteps, setGoalSteps] = useState('');
  const [goalSleep, setGoalSleep] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const resetForm = () => {
    setCalories('');
    setSteps('');
    setHours('');
  };

  const resetGoals = () => {
    setGoalCalories('');
    setGoalSteps('');
    setGoalSleep('');
  };

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
          <button
            onClick={() => setShowEntryModal(true)}
            className="btn-primary btn-lg btn-elevated"
          >
            Add Entry
          </button>
          <button
            onClick={() => setShowGoalsModal(true)}
            className="btn-primary btn-lg btn-elevated"
          >
            My Goals
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="btn-primary btn-lg btn-elevated"
          >
            Analytics
          </button>
        </div>
      </main>

      {/* Add Entry Popup */}
      {showEntryModal && (
        <Modal
          title="ADD ENTRIES FOR THE WEEK"
          onClose={() => {
            setShowEntryModal(false);
            resetForm();
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Calories"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Steps"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Hours Slept"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              style={inputStyle}
            />
          </div>
        </Modal>
      )}

      {/* My Goals Popup */}
      {showGoalsModal && (
        <Modal
          title="MY GOALS"
          onClose={() => {
            setShowGoalsModal(false);
            resetGoals();
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Calories Goal"
              value={goalCalories}
              onChange={(e) => setGoalCalories(e.target.value)}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Steps Goal"
              value={goalSteps}
              onChange={(e) => setGoalSteps(e.target.value)}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Sleep Goal (hrs)"
              value={goalSleep}
              onChange={(e) => setGoalSleep(e.target.value)}
              style={inputStyle}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
