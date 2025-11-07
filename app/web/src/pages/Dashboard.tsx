// src/pages/Dashboard.tsx
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showEntryModal, setShowEntryModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
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
        {/* Welcome Section */}
        <h2 className="heading-1 mb-4">Welcome to HealthTrack 🏃‍♂️🥗🏋️‍♂️</h2>
        <p className="body-xl text-secondary text-italic mb-16">
          Your journey to a healthier you starts here 📍
        </p>

        {/* Quick Action Buttons */}
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

        {/* Coming Soon Card */}
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

      {/* --- CENTERED BLANK POPUP MODAL --- */}
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
            // Close when clicking backdrop
            if (e.target === e.currentTarget) setShowEntryModal(false);
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
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <h3 style={{ margin: 0 }}>Add Entry</h3>
              <button
                onClick={() => setShowEntryModal(false)}
                className="btn-secondary btn-sm"
              >
                Close
              </button>
            </div>

            {/* Blank body area */}
            <div style={{ minHeight: 160 }} />
          </div>
        </div>
      )}
    </div>
  );
}
