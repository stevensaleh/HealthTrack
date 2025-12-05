import { Integration } from '@/hooks/useIntegrations';
import { HealthDataEntry } from '@/hooks/useHealthData';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AddIcon from '@mui/icons-material/Add';
import BarChartIcon from '@mui/icons-material/BarChart';
import HotelIcon from '@mui/icons-material/Hotel';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import FavoriteIcon from '@mui/icons-material/Favorite';

interface ActivityFeedProps {
  caloriesBurned: number;
  integrations: Integration[];
  onAddIntegration: () => void;
  healthData: HealthDataEntry[];
}

export default function ActivityFeed({
  caloriesBurned,
  integrations,
  onAddIntegration,
  healthData,
}: ActivityFeedProps) {
  // Sort health data by date descending
  const sortedHealthData = [...healthData].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 10); // last 10 entries

  // Helper to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Helper to get metrics summary for an entry
  const getMetricsSummary = (entry: HealthDataEntry) => {
    const metrics = [];
    
    if (entry.steps) metrics.push({ icon: <DirectionsWalkIcon />, value: `${entry.steps.toLocaleString()} steps`, color: '#10B981' });
    if (entry.exercise) metrics.push({ icon: <LocalFireDepartmentIcon />, value: `${entry.exercise} min active`, color: '#F59E0B' });
    if (entry.calories) metrics.push({ icon: <RestaurantIcon />, value: `${entry.calories} cal`, color: '#EF4444' });
    if (entry.heartRate) metrics.push({ icon: <FavoriteIcon />, value: `${entry.heartRate} bpm`, color: '#DC2626' });
    if (entry.sleep) metrics.push({ icon: <HotelIcon />, value: `${entry.sleep.toFixed(1)} hrs sleep`, color: '#8B5CF6' });
    if (entry.water) metrics.push({ icon: <WaterDropIcon />, value: `${entry.water.toFixed(1)} L water`, color: '#3B82F6' });
    if (entry.weight) metrics.push({ icon: <MonitorWeightIcon />, value: `${entry.weight.toFixed(1)} kg`, color: '#6B7280' });
    
    return metrics;
  };

  const getProviderColor = (provider: string) => {
    const colors: { [key: string]: string } = {
      STRAVA: '#FC4C02',
      FITBIT: '#00B0B9',
      LOSE_IT: '#00A86B',
      MANUAL: '#666666',
    };
    return colors[provider] || '#666666';
  };

  return (
    <aside
      style={{
        width: '320px',
        height: '100vh',
        background: 'var(--color-bg-white)',
        borderLeft: '1px solid var(--color-border-light)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        right: 0,
        top: 0,
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 'var(--space-6)',
          borderBottom: '1px solid var(--color-border-light)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-2)',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-bold)',
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-text-primary)',
            }}
          >
            Activity
          </h2>
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
              color: 'var(--color-text-secondary)',
            }}
          >
            <BarChartIcon />
          </button>
        </div>
      </div>

      {/* Calorie Burn Summary */}
      <div
        style={{
          padding: 'var(--space-6)',
          background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 100%)',
          borderBottom: '1px solid var(--color-border-light)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-3)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              color: 'white',
            }}
          >
            <LocalFireDepartmentIcon style={{ fontSize: '28px' }} />
          </div>
          <div>
            <div
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)',
                marginBottom: '2px',
              }}
            >
              Calorie Burnt
            </div>
            <div
              style={{
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
              }}
            >
              {caloriesBurned}
              <span
                style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'normal',
                  color: 'var(--color-text-muted)',
                }}
              >
                {' '}
                kcal
              </span>
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          Average calorie burnt over the all activity is{' '}
          <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>500 kcal</span>
        </div>
      </div>

      {/* Latest Activity Header */}
      <div
        style={{
          padding: 'var(--space-5) var(--space-6) var(--space-3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
          }}
        >
          Latest Activity
        </h3>
        <button
          onClick={onAddIntegration}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-accent)',
            fontWeight: 'var(--font-weight-semibold)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
          }}
        >
          <AddIcon style={{ fontSize: '16px' }} />
          <span>Add</span>
        </button>
      </div>

      {/* Activity List */}
      <div style={{ padding: '0 var(--space-6)', flex: 1, overflowY: 'auto' }}>
        {sortedHealthData.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--space-10) var(--space-4)',
            }}
          >
            <BarChartIcon style={{ fontSize: '64px', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }} />
            <p
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--space-4)',
              }}
            >
              No activity data yet
            </p>
            <p
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
              }}
            >
              {integrations.length === 0 
                ? 'Connect apps or add manual entries to see your activity'
                : 'Add manual entries or sync your integrations'}
            </p>
          </div>
        ) : (
          sortedHealthData.map((entry) => {
            const metrics = getMetricsSummary(entry);
            const source = entry.source || 'MANUAL';
            
            return (
              <div
                key={entry.id}
                style={{
                  padding: 'var(--space-4)',
                  marginBottom: 'var(--space-3)',
                  background: 'var(--color-bg-white)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-light)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {/* Date and Source Badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-3)',
                  }}
                >
                  <span
                    style={{
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {formatDate(entry.date)}
                  </span>
                  <div
                    style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 'var(--font-weight-medium)',
                      background: `${getProviderColor(source)}20`,
                      color: getProviderColor(source),
                    }}
                  >
                    {source}
                  </div>
                </div>

                {/* Metrics Grid */}
                {metrics.length > 0 ? (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 'var(--space-2)',
                    }}
                  >
                    {metrics.map((metric, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        <span style={{ color: metric.color, fontSize: '16px', display: 'flex' }}>
                          {metric.icon}
                        </span>
                        <span>{metric.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-muted)',
                      fontStyle: 'italic',
                    }}
                  >
                    No metrics tracked
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}