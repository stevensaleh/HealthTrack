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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-800 to-gray-100">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">HealthHive</h1>
          
          <div className="flex items-center gap-4">
            {user?.picture && (
              <img
                src={user.picture}
                alt={user.name}
                className="w-10 h-10 rounded-full border-2 border-white/30"
              />
            )}
            <span className="text-white font-medium">
              {user?.name || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border-2 border-white/30 text-white rounded-lg hover:bg-white/10 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 text-center text-white">
        <h2 className="text-5xl font-bold mb-4">
          Welcome to HealthHive 🏃‍♂️🥗🏋️‍♂️
        </h2>
        <p className="text-2xl mb-12 text-white/90">
          Your journey to a healthier you starts here 📍
        </p>

        {/* Quick Action Buttons */}
        <div className="flex justify-center gap-8 mt-20">
          <button 
            onClick={() => navigate('/data-entry')}
            className="px-8 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl hover:bg-white/30 transition-all text-lg font-semibold"
          >
            Add Entry
          </button>
          <button 
            onClick={() => navigate('/goals')}
            className="px-8 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl hover:bg-white/30 transition-all text-lg font-semibold"
          >
            My Goals
          </button>
          <button 
            onClick={() => navigate('/analytics')}
            className="px-8 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl hover:bg-white/30 transition-all text-lg font-semibold"
          >
            Analytics
          </button>
        </div>

        {/* Coming Soon Section */}
        <div className="mt-20 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-12 max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold mb-4">Dashboard Coming Soon!</h3>
          <p className="text-lg text-white/80">
            We're building an amazing dashboard to track your health metrics, 
            view progress charts, and get personalized insights.
          </p>
        </div>
      </main>
    </div>
  );
}