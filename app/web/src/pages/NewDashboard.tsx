// src/pages/NewDashboard.tsx
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useHealthData, HealthDataEntry } from '@/hooks/useHealthData';
import { useGoals } from '@/hooks/useGoals';
import { useIntegrations } from '@/hooks/useIntegrations';

import Sidebar from '@/components/Sidebar';
import ActivityFeed from '@/components/ActivityFeed';
import StatCard from '@/components/StatCard';
import TimePeriodToggle, { TimePeriod } from '@/components/TimePeriodToggle';
import IntegrationsModal from '@/components/IntegrationsModal';
import HealthEntryModal from '@/components/HealthEntryModal';
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
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('WEEK');
  const { latestData, historicalData, weeklyStats, trackingStatus, loading: healthLoading, refetch: refetchHealth } = useHealthData(timePeriod);
  const { stats: goalStats, loading: goalsLoading } = useGoals();
  const { integrations, initiateConnection } = useIntegrations();

  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);
  const [showHealthEntryModal, setShowHealthEntryModal] = useState(false);

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

  const handleHealthEntrySuccess = async () => {
    try {
      console.log('Starting health data refresh...');
      
      // Close modal first
      setShowHealthEntryModal(false);
      
      // Small delay to ensure modal is fully closed and unmounted
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Now refresh health data
      await refetchHealth();
      console.log('Health data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing health data:', error);
      // Alert user if refresh fails
      alert('Data saved successfully, but failed to refresh dashboard. Please reload the page.');
    }
  };

  // Get current date and time info
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 18 ? 'Good Afternoon' : 'Good Evening';

  // Mock weather (in real app, fetch from API)
  const weather = 'Sunny day in Port Huron';

  // Generate real chart data from historical data
  const generateChartData = (metric: keyof HealthDataEntry) => {
    if (!historicalData || historicalData.length === 0) {
      return []; // Return empty array if no data
    }
    
    return historicalData
      .filter(entry => entry[metric] != null) // Only include entries with this metric
      .map(entry => ({
        value: entry[metric] as number,
        label: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }));
  };

  // Helper to check if we should show chart (need 2+ points for a trend)
  const shouldShowChart = (metric: keyof HealthDataEntry) => {
    const data = generateChartData(metric);
    return data.length >= 2;
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
              color: 'var(--color-accent)',
              marginBottom: 'var(--space-4)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-muted)' }}>
            Loading your health data...
          </p>
        </div>
      </div>
    );
  }

  // Show empty state if no health data and not loading
  const hasNoData = !latestData && !weeklyStats && !trackingStatus && !healthLoading;
  
  if (hasNoData) {
    console.log('No health data available yet - showing empty state');
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
              value={latestData?.height || 170}
              unit="cm"
              subtitle="Current height"
              color="#9333EA"
            />

            {/* Weight Card */}
            <StatCard
              icon={<ScaleIcon />}
              title="Weight"
              value={latestData?.weight || weeklyStats?.metrics?.weight?.average || 70}
              unit="kg"
              subtitle={`Target: ${(latestData?.weight || weeklyStats?.metrics?.weight?.average || 70) - 5} kg`}
              trend="down"
              trendValue="-2%"
              color="#DC2626"
            />

            {/* Heart Rate Card with Chart */}
            <StatCard
              icon={<FavoriteIcon />}
              title="Heart Rate"
              value={latestData?.heartRate || weeklyStats?.metrics?.heartRate?.average || 72}
              unit="BPM"
              subtitle="Normal"
              trend="neutral"
              color="#DC2626"
              chart={shouldShowChart('heartRate') ? <MiniLineChart data={generateChartData('heartRate')} color="#DC2626" /> : undefined}
            />

            {/* Steps Card with Chart */}
            <StatCard
              icon={<DirectionsWalkIcon />}
              title="Steps"
              value={latestData?.steps || weeklyStats?.metrics?.steps?.average || 8500}
              subtitle={`Avg: ${Math.round(weeklyStats?.metrics?.steps?.average || latestData?.steps || 8500)} steps`}
              trend="up"
              trendValue="+12%"
              color="#10B981"
              chart={shouldShowChart('steps') ? <MiniLineChart data={generateChartData('steps')} color="#10B981" /> : undefined}
            />

            {/* Active Energy Card with Bar Chart */}
            <StatCard
              icon={<LocalFireDepartmentIcon />}
              title="Active Energy"
              value={(latestData?.exercise || weeklyStats?.metrics?.exercise?.average || 45).toFixed(1)}
              unit="min"
              subtitle="Normal activity level"
              color="#F59E0B"
              chart={shouldShowChart('exercise') ? <MiniBarChart data={generateChartData('exercise')} color="#F59E0B" /> : undefined}
            />

            {/* Sleep Activity Card */}
            <StatCard
              icon={<BedtimeIcon />}
              title="Sleep Activity"
              value={latestData?.sleep || weeklyStats?.metrics?.sleep?.average || 8}
              unit="hours"
              subtitle="Good sleep quality"
              color="#6366F1"
              chart={
                <SleepChart
                  sleepHours={latestData?.sleep || weeklyStats?.metrics?.sleep?.average || 8}
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
              value={latestData?.calories || weeklyStats?.metrics?.calories?.average || 2000}
              unit="kcal"
              subtitle={`Goal: ${2200} kcal`}
              trend="neutral"
              color="#FF8C42"
            />

            {/* Water Intake Card */}
            <StatCard
              icon={<WaterDropIcon />}
              title="Water"
              value={latestData?.water || weeklyStats?.metrics?.water?.average || 2.5}
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
            onClick={() => setShowHealthEntryModal(true)}
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
        caloriesBurned={weeklyStats?.metrics?.calories?.total || 1000}
        integrations={integrations}
        onAddIntegration={handleAddIntegration}
      />

      {/* Integrations Modal */}
      <IntegrationsModal
        isOpen={showIntegrationsModal}
        onClose={() => setShowIntegrationsModal(false)}
        onConnect={handleConnectIntegration}
      />

      {/* Health Entry Modal */}
      <HealthEntryModal
        isOpen={showHealthEntryModal}
        onClose={() => setShowHealthEntryModal(false)}
        onSuccess={handleHealthEntrySuccess}
      />
    </div>
  );
}