// src/components/Sidebar.tsx
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import SettingsIcon from '@mui/icons-material/Settings';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

interface SidebarProps {
  goalsCompleted: number;
  daysTracked: number;
  currentStreak: number;
}

export default function Sidebar({ goalsCompleted, daysTracked, currentStreak }: SidebarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: HomeIcon, label: 'Home', path: '/dashboard' },
    // { icon: ShowChartIcon, label: 'Activity', path: '/activity' },
    // { icon: BarChartIcon, label: 'Analytics', path: '/analytics' },
    { icon: TrackChangesIcon, label: 'Goals', path: '/goals' },
    { icon: SettingsIcon, label: 'Settings', path: '/settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      style={{
        width: '280px',
        height: '100vh',
        background: 'var(--color-bg-white)',
        borderRight: '1px solid var(--color-border-light)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: 'var(--space-8) var(--space-6)',
          borderBottom: '1px solid var(--color-border-light)',
        }}
      >
        <h1
          className="heading-4"
          style={{
            fontFamily: 'var(--font-heading)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <LocalHospitalIcon style={{ fontSize: '28px', color: 'var(--color-accent)' }} />
          HealthHive
        </h1>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: 'var(--space-6) var(--space-4)' }}>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
                padding: 'var(--space-4) var(--space-5)',
                marginBottom: 'var(--space-2)',
                background: isActive(item.path) ? '#fff5ed' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-base)',
                fontWeight: isActive(item.path) ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
                color: isActive(item.path) ? 'var(--color-accent)' : 'var(--color-text-primary)',
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = '#f9f9f9';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <IconComponent style={{ fontSize: '20px' }} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile Card */}
      <div
        style={{
          padding: 'var(--space-6)',
          borderTop: '1px solid var(--color-border-light)',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-5)',
            textAlign: 'center',
          }}
        >
          {/* User Avatar */}
          {user?.profileImage || user?.picture ? (
            <img
              src={user?.profileImage || user?.picture}
              alt={user?.firstName || user?.email}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-full)',
                border: '3px solid var(--color-accent)',
                objectFit: 'cover',
                margin: '0 auto var(--space-4)',
              }}
            />
          ) : (
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-accent)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                margin: '0 auto var(--space-4)',
              }}
            >
              {user?.firstName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
            </div>
          )}

          {/* User Name */}
          <h3
            style={{
              margin: '0 0 var(--space-1)',
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--font-size-lg)',
              color: 'var(--color-text-primary)',
            }}
          >
            {user?.firstName && user?.lastName 
              ? `${user.firstName} ${user.lastName}`
              : user?.firstName || user?.email}
          </h3>
          <p
            style={{
              margin: '0 0 var(--space-5)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            {user?.email}
          </p>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              gap: 'var(--space-3)',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {goalsCompleted}
              </div>
              <div
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Goals
              </div>
            </div>

            <div
              style={{
                width: '1px',
                background: 'var(--color-border-light)',
              }}
            />

            <div>
              <div
                style={{
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {daysTracked}
              </div>
              <div
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Days
              </div>
            </div>

            <div
              style={{
                width: '1px',
                background: 'var(--color-border-light)',
              }}
            />

            <div>
              <div
                style={{
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-1)',
                }}
              >
                {currentStreak}
                <LocalFireDepartmentIcon style={{ fontSize: '20px' }} />
              </div>
              <div
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Streak
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}