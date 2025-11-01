// src/pages/Dashboard.tsx
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
            onClick={() => navigate('/data-entry')}
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
    </div>
  );
}