// src/components/GoalCard.tsx
import { Goal } from '@/hooks/useGoals';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import HotelIcon from '@mui/icons-material/Hotel';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import StarIcon from '@mui/icons-material/Star';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onComplete: (goalId: string) => void;
  onPause: (goalId: string) => void;
  onResume: (goalId: string) => void;
}

export default function GoalCard({
  goal,
  onEdit,
  onDelete,
  onComplete,
  onPause,
  onResume,
}: GoalCardProps) {
  
  // Helper to get unit based on goal type
  const getUnit = (type: string) => {
    const units: { [key: string]: string } = {
      STEPS: 'steps',
      WEIGHT_LOSS: 'kg',
      WEIGHT_GAIN: 'kg',
      EXERCISE: 'min',
      SLEEP: 'hours',
      WATER: 'liters',
      CALORIES: 'kcal',
      CUSTOM: 'units',
    };
    return units[type] || 'units';
  };
  
  const getGoalIcon = (type: string) => {
    const icons: { [key: string]: JSX.Element } = {
      STEPS: <DirectionsRunIcon />,
      WEIGHT_LOSS: <MonitorWeightIcon />,
      WEIGHT_GAIN: <TrendingUpIcon />,
      EXERCISE: <FitnessCenterIcon />,
      SLEEP: <HotelIcon />,
      WATER: <WaterDropIcon />,
      CALORIES: <RestaurantIcon />,
      CUSTOM: <StarIcon />,
    };
    return icons[type] || <StarIcon />;
  };

  const getGoalColor = (type: string) => {
    const colors: { [key: string]: string } = {
      STEPS: '#3B82F6',
      WEIGHT_LOSS: '#FF8C42',
      WEIGHT_GAIN: '#10B981',
      EXERCISE: '#EF4444',
      SLEEP: '#8B5CF6',
      WATER: '#06B6D4',
      CALORIES: '#F97316',
      CUSTOM: '#6B7280',
    };
    return colors[type] || '#6B7280';
  };

  const getStatusBadge = (status: string) => {
    const config: { [key: string]: { label: string; color: string; bg: string } } = {
      ACTIVE: { label: 'Active', color: '#10B981', bg: '#D1FAE5' },
      COMPLETED: { label: 'Completed', color: '#8B5CF6', bg: '#EDE9FE' },
      PAUSED: { label: 'Paused', color: '#F59E0B', bg: '#FEF3C7' },
      CANCELLED: { label: 'Cancelled', color: '#6B7280', bg: '#F3F4F6' },
    };
    return config[status] || config.ACTIVE;
  };

  const color = getGoalColor(goal.type);
  const statusBadge = getStatusBadge(goal.status);
  const isActive = goal.status === 'ACTIVE';
  const isPaused = goal.status === 'PAUSED';
  const isCompleted = goal.status === 'COMPLETED';

  return (
    <div
      style={{
        background: 'var(--color-bg-white)',
        borderRadius: 'var(--radius-lg)',
        border: '2px solid var(--color-border-light)',
        padding: 'var(--space-5)',
        transition: 'all var(--transition-base)',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border-light)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', gap: 'var(--space-3)', flex: 1 }}>
          {/* Icon */}
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: `${color}20`,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              flexShrink: 0,
            }}
          >
            {getGoalIcon(goal.type)}
          </div>

          {/* Title and Description */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                margin: '0 0 4px 0',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {goal.title}
            </h3>
            {goal.description && (
              <p
                style={{
                  margin: 0,
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {goal.description}
              </p>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div
          style={{
            padding: '4px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-medium)',
            background: statusBadge.bg,
            color: statusBadge.color,
            whiteSpace: 'nowrap',
          }}
        >
          {statusBadge.label}
        </div>
      </div>

      {/* Progress Section */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        {/* Current → Target */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-2)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <span>
            <strong>{goal.progress.currentValue?.toFixed(1) || '0.0'}</strong> {getUnit(goal.type)}
          </span>
          <span>→</span>
          <span>
            <strong>{goal.targetValue.toFixed(1)}</strong> {getUnit(goal.type)}
          </span>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            width: '100%',
            height: '8px',
            background: '#E5E7EB',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            marginBottom: 'var(--space-2)',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(goal.progress.percentage || 0, 100)}%`,
              background: color,
              borderRadius: 'var(--radius-sm)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Progress Stats */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          <span style={{ fontWeight: 'var(--font-weight-semibold)', color: color }}>
            {(goal.progress.percentage || 0).toFixed(0)}% Complete
          </span>
          <span>
            {goal.progress.daysRemaining > 0
              ? `${goal.progress.daysRemaining} days left`
              : goal.progress.daysRemaining === 0
              ? 'Due today'
              : 'Overdue'}
          </span>
        </div>

        {/* Progress Rate */}
        {goal.progress.message && (
          <div
            style={{
              marginTop: 'var(--space-2)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              fontStyle: 'italic',
            }}
          >
            {goal.progress.message}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          paddingTop: 'var(--space-4)',
          borderTop: '1px solid var(--color-border-light)',
        }}
      >
        {/* Pause/Resume */}
        {isActive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPause(goal.id);
            }}
            style={{
              flex: 1,
              padding: 'var(--space-2)',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-1)',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F3F4F6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <PauseIcon style={{ fontSize: '16px' }} />
            Pause
          </button>
        )}

        {isPaused && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onResume(goal.id);
            }}
            style={{
              flex: 1,
              padding: 'var(--space-2)',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-1)',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F3F4F6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <PlayArrowIcon style={{ fontSize: '16px' }} />
            Resume
          </button>
        )}

        {/* Edit */}
        {!isCompleted && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(goal);
            }}
            style={{
              flex: 1,
              padding: 'var(--space-2)',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-1)',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F3F4F6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <EditIcon style={{ fontSize: '16px' }} />
            Edit
          </button>
        )}

        {/* Complete */}
        {isActive && goal.progress.percentage >= 100 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete(goal.id);
            }}
            style={{
              flex: 1,
              padding: 'var(--space-2)',
              background: '#10B981',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-1)',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#059669';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#10B981';
            }}
          >
            <CheckCircleIcon style={{ fontSize: '16px' }} />
            Complete
          </button>
        )}

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Delete "${goal.title}"?`)) {
              onDelete(goal.id);
            }
          }}
          style={{
            padding: 'var(--space-2)',
            background: 'transparent',
            border: '1px solid var(--color-error)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-error)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#FEE2E2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <DeleteIcon style={{ fontSize: '16px' }} />
        </button>
      </div>
    </div>
  );
}