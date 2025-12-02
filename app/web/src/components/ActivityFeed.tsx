// src/components/ActivityFeed.tsx
import { Integration } from '@/hooks/useIntegrations';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import PoolIcon from '@mui/icons-material/Pool';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AddIcon from '@mui/icons-material/Add';
import BarChartIcon from '@mui/icons-material/BarChart';
import PhonelinkIcon from '@mui/icons-material/Phonelink';

interface Activity {
  id: string;
  type: string;
  provider: 'STRAVA' | 'FITBIT' | 'LOSE_IT' | 'MANUAL';
  date: string;
  duration?: string;
  distance?: string;
  calories?: number;
}

interface ActivityFeedProps {
  caloriesBurned: number;
  integrations: Integration[];
  onAddIntegration: () => void;
}

export default function ActivityFeed({
  caloriesBurned,
  integrations,
  onAddIntegration,
}: ActivityFeedProps) {
  // Mock activities for now - in real app, fetch from API
  const activities: Activity[] = [
    {
      id: '1',
      type: 'Running',
      provider: 'STRAVA',
      date: new Date().toISOString(),
      duration: '1 hour',
      distance: '10 km',
      calories: 600,
    },
    {
      id: '2',
      type: 'Cycling',
      provider: 'STRAVA',
      date: new Date(Date.now() - 86400000).toISOString(),
      duration: '30 min',
      distance: '5 km',
      calories: 300,
    },
  ];

  const getActivityIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      Running: <DirectionsRunIcon />,
      Cycling: <DirectionsBikeIcon />,
      Swimming: <PoolIcon />,
      Walking: <DirectionsWalkIcon />,
      Yoga: <SelfImprovementIcon />,
      Weightlifting: <FitnessCenterIcon />,
      Meal: <RestaurantIcon />,
    };
    return icons[type] || <FitnessCenterOutlinedIcon />;
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
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
      <div style={{ padding: '0 var(--space-6)', flex: 1 }}>
        {integrations.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--space-10) var(--space-4)',
            }}
          >
            <PhonelinkIcon style={{ fontSize: '64px', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }} />
            <p
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--space-4)',
              }}
            >
              No integrations connected yet
            </p>
            <button onClick={onAddIntegration} className="btn-primary btn-sm">
              Connect Apps
            </button>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              style={{
                display: 'flex',
                gap: 'var(--space-4)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-3)',
                background: 'var(--color-bg-white)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-light)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent)';
                e.currentTarget.style.background = '#fffbf8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-light)';
                e.currentTarget.style.background = 'var(--color-bg-white)';
              }}
            >
              {/* Activity Icon */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  background: `${getProviderColor(activity.provider)}20`,
                  color: getProviderColor(activity.provider),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0,
                }}
              >
                {getActivityIcon(activity.type)}
              </div>

              {/* Activity Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '2px',
                  }}
                >
                  <span
                    style={{
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {activity.type}
                  </span>
                  <span
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {formatDate(activity.date)}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-muted)',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  {activity.duration} · {activity.distance}
                </div>

                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                  }}
                >
                  <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                    {activity.calories} kcal
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}