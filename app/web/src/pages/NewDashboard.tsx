// src/pages/NewDashboard.tsx
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useHealthData } from '@/hooks/useHealthData';
import { useGoals } from '@/hooks/useGoals';
import { useIntegrations } from '@/hooks/useIntegrations';

import Sidebar from '@/components/Sidebar';
import ActivityFeed from '@/components/ActivityFeed';
import StatCard from '@/components/StatCard';
import TimePeriodToggle, { TimePeriod } from '@/components/TimePeriodToggle';
import IntegrationsModal from '@/components/IntegrationsModal';
import { MiniLineChart, MiniBarChart, SleepChart } from '@/components/MiniChart';

// Material UI Icons
import HeightIcon from '@mui/icons-material/Height';
import ScaleIcon from '@mui/icons-material/Scale';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AddIcon from '@mui/icons-material/Add';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import LinkIcon from '@mui/icons-material/Link';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

export default function NewDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { latestData, weeklyStats, trackingStatus, loading: healthLoading } = useHealthData();
  const { stats: goalStats, loading: goalsLoading } = useGoals();
  const { integrations, initiateConnection } = useIntegrations();

  const [timePeriod, setTimePeriod] = useState<TimePeriod>('WEEK');
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddIntegration = () => {
    setShowIntegrationsModal(true);
  };

  const handleConnectIntegration = async (provider: 'STRAVA' | 'FITBIT' | 'LOSE_IT') => {
    try {
      await initiateConnection(provider);
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  // Get current date and time info
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 18 ? 'Good Afternoon' : 'Good Evening';

  // Mock weather (in real app, fetch from API)
  const weather = 'Sunny day in Port Huron';

  // Generate mock chart data based on weekly stats
  const generateChartData = (metric: string, count: number = 7) => {
    const base = weeklyStats?.metrics[metric as keyof typeof weeklyStats.metrics];
    if (!base || typeof base !== 'object' || !('average' in base)) {
      return Array.from({ length: count }, (_, i) => ({ value: Math.random() * 100, label: `Day ${i + 1}` }));
    }
    const avg = base.average;
    return Array.from({ length: count }, (_, i) => ({
      value: avg + (Math.random() - 0.5) * avg * 0.3,
      label: `Day ${i + 1}`,
    }));
  };

  if (healthLoading || goalsLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--color-bg-gradient-start)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <LocalHospitalIcon
            style={{
              fontSize: '48px',
              marginBottom: 'var(--space-4)',
              animation: 'pulse 2s ease-in-out infinite',
              color: 'var(--color-accent)',
            }}
          />
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading your health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#fafafa' }}>
      {/* Left Sidebar */}
      <Sidebar
        goalsCompleted={goalStats?.completed || 0}
        daysTracked={trackingStatus?.totalDaysTracked || 0}
        currentStreak={trackingStatus?.currentStreak || 0}
      />

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          marginLeft: '280px',
          marginRight: '320px',
          padding: 'var(--space-8)',
          overflowY: 'auto',
          height: '100vh',
        }}
      >
        {/* Header Section */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 'var(--space-8)',
          }}
        >
          <div>
            <h1
              style={{
                margin: '0 0 var(--space-2)',
                fontSize: 'var(--font-size-5xl)',
                fontWeight: 'var(--font-weight-bold)',
                fontFamily: 'var(--font-heading)',
                color: 'var(--color-text-primary)',
              }}
            >
              {greeting}, {user?.firstName || 'User'}
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: 'var(--font-size-base)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {dayName}, {dateStr} | {weather}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <TimePeriodToggle selected={timePeriod} onChange={setTimePeriod} />
            <button onClick={handleLogout} className="btn-secondary btn-sm">
              Logout
            </button>
          </div>
        </div>

        {/* Health Statistics Section */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-5)',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
              }}
            >
              Health Statistics
            </h2>
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                padding: 'var(--space-2)',
              }}
            >
              ↗
            </button>
          </div>

          {/* Stats Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--space-5)',
            }}
          >
            {/* Height Card */}
            <StatCard
              icon={<HeightIcon />}
              title="Height"
              value={user?.height || 170}
              unit="cm"
              subtitle="Current height"
              color="#9333EA"
            />

            {/* Weight Card */}
            <StatCard
              icon={<ScaleIcon />}
              title="Weight"
              value={latestData?.weight || weeklyStats?.metrics.weight?.average || 0}
              unit="kg"
              subtitle={`Target: ${(latestData?.weight || 70) - 5} kg`}
              trend="down"
              trendValue="-2%"
              color="#DC2626"
            />

            {/* Blood Type Card */}
            <StatCard
              icon={<BloodtypeIcon />}
              title="Blood"
              value="AB+"
              subtitle="blood type"
              color="#EF4444"
            />

            {/* Heart Rate Card with Chart */}
            <StatCard
              icon={<FavoriteIcon />}
              title="Heart Rate"
              value={latestData?.heartRate || 77}
              unit="BPM"
              subtitle="Normal"
              trend="neutral"
              color="#DC2626"
              chart={<MiniLineChart data={generateChartData('heartRate', 10)} color="#DC2626" />}
            />

            {/* Steps Card with Chart */}
            <StatCard
              icon={<DirectionsWalkIcon />}
              title="Steps"
              value={latestData?.steps || weeklyStats?.metrics.steps?.average || 1000}
              subtitle={`Avg: ${weeklyStats?.metrics.steps?.average || 600} steps`}
              trend="up"
              trendValue="+12%"
              color="#10B981"
              chart={<MiniLineChart data={generateChartData('steps', 7)} color="#10B981" />}
            />

            {/* Active Energy Card with Bar Chart */}
            <StatCard
              icon={<LocalFireDepartmentIcon />}
              title="Active Energy"
              value={weeklyStats?.metrics.exercise?.average?.toFixed(1) || '41.5'}
              unit="kcal"
              subtitle="Normal activity level"
              color="#F59E0B"
              chart={<MiniBarChart data={generateChartData('exercise', 6)} color="#F59E0B" />}
            />

            {/* Sleep Activity Card */}
            <StatCard
              icon={<BedtimeIcon />}
              title="Sleep Activity"
              value={latestData?.sleep || weeklyStats?.metrics.sleep?.average || 9}
              unit="hours"
              subtitle="Good sleep quality"
              color="#6366F1"
              chart={
                <SleepChart
                  sleepHours={latestData?.sleep || 9}
                  deepSleep={2.5}
                  lightSleep={4.5}
                  rem={2}
                />
              }
            />

            {/* Calories Card */}
            <StatCard
              icon={<RestaurantIcon />}
              title="Calories"
              value={latestData?.calories || weeklyStats?.metrics.calories?.average || 2000}
              unit="kcal"
              subtitle={`Goal: ${2200} kcal`}
              trend="neutral"
              color="#FF8C42"
            />

            {/* Water Intake Card */}
            <StatCard
              icon={<WaterDropIcon />}
              title="Water"
              value={latestData?.water || weeklyStats?.metrics.water?.average || 2.5}
              unit="L"
              subtitle="Stay hydrated!"
              trend="up"
              trendValue="+8%"
              color="#06B6D4"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-4)',
            marginTop: 'var(--space-8)',
          }}
        >
          <button
            onClick={() => navigate('/add-entry')}
            className="btn-primary btn-md"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}
          >
            <AddIcon style={{ fontSize: '18px' }} />
            <span>Add Health Entry</span>
          </button>
          <button
            onClick={() => navigate('/goals')}
            className="btn-secondary btn-md"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}
          >
            <TrackChangesIcon style={{ fontSize: '18px' }} />
            <span>Manage Goals</span>
          </button>
          <button
            onClick={handleAddIntegration}
            className="btn-ghost btn-md"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}
          >
            <LinkIcon style={{ fontSize: '18px' }} />
            <span>Connect Apps</span>
          </button>
        </div>
      </main>

      {/* Right Activity Feed */}
      <ActivityFeed
        caloriesBurned={weeklyStats?.metrics.calories?.total || 1000}
        integrations={integrations}
        onAddIntegration={handleAddIntegration}
      />

      {/* Integrations Modal */}
      <IntegrationsModal
        isOpen={showIntegrationsModal}
        onClose={() => setShowIntegrationsModal(false)}
        onConnect={handleConnectIntegration}
      />
    </div>
  );
}