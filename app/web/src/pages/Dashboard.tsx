// src/pages/Dashboard.tsx
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showEntryModal, setShowEntryModal] = useState(false);

  // form fields (text only)
  const [calories, setCalories] = useState('');
  const [steps, setSteps] = useState('');
  const [hours, setHours] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const resetForm = () => {
    setCalories('');
    setSteps('');
    setHours('');
  };

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

      {/* Main Content */}
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
            onClick={() => navigate('/goals')}
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

        <div className="content-wrapper">
          <div className="card card-elevated">
            <h3 className="heading-3 mb-4">Dashboard Coming Soon!</h3>
            <p className="body-lg text-secondary">
              We're building an amazing dashboard to track your health metrics, view
              progress charts, and get personalized insights.
            </p>
          </div>
        </div>
      </main>

      {/* --- CENTERED POPUP ENTRY FORM --- */}
      {showEntryModal && (
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
            if (e.target === e.currentTarget) {
              setShowEntryModal(false);
              resetForm();
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '1.25rem',
              width: 'min(520px, 95vw)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            }}
            onMouseDown={(e) => e.stopPropagation()} // prevent accidental close
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <h3 style={{ margin: 0 }}>ADD ENTRIES FOR THE WEEK</h3>
              <button
                onClick={() => {
                  setShowEntryModal(false);
                  resetForm();
                }}
                className="btn-secondary btn-sm"
              >
                Close
              </button>
            </div>

            {/* Simple text input fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Calories"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.9rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                }}
              />

              <input
                type="text"
                placeholder="Steps"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.9rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                }}
              />

              <input
                type="text"
                placeholder="Hours Slept"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.9rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
