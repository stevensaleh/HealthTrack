// src/components/CreateGoalModal.tsx
import { useState, useEffect } from 'react';
import { Goal } from '@/hooks/useGoals';
import { GoalType } from '@/hooks/useGoalActions';
import CloseIcon from '@mui/icons-material/Close';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import HotelIcon from '@mui/icons-material/Hotel';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import StarIcon from '@mui/icons-material/Star';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  editingGoal?: Goal | null;
}

export default function CreateGoalModal({
  isOpen,
  onClose,
  onSubmit,
  editingGoal,
}: CreateGoalModalProps) {
  const [type, setType] = useState<GoalType>('STEPS');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startValue, setStartValue] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editingGoal) {
      setType(editingGoal.type as GoalType);
      setTitle(editingGoal.title);
      setDescription(editingGoal.description || '');
      setStartValue(editingGoal.startValue?.toString() || '');
      setTargetValue(editingGoal.targetValue.toString());
      setTargetDate(editingGoal.endDate.split('T')[0]); // Backend uses 'endDate'
    } else {
      // Reset form
      setType('STEPS');
      setTitle('');
      setDescription('');
      setStartValue('');
      setTargetValue('');
      setTargetDate('');
    }
  }, [editingGoal, isOpen]);

  if (!isOpen) return null;

  const goalTypes = [
    { value: 'STEPS', label: 'Steps', icon: <DirectionsRunIcon />, unit: 'steps', color: '#3B82F6' },
    { value: 'WEIGHT_LOSS', label: 'Weight Loss', icon: <MonitorWeightIcon />, unit: 'kg', color: '#FF8C42' },
    { value: 'WEIGHT_GAIN', label: 'Weight Gain', icon: <TrendingUpIcon />, unit: 'kg', color: '#10B981' },
    { value: 'EXERCISE', label: 'Exercise', icon: <FitnessCenterIcon />, unit: 'min', color: '#EF4444' },
    { value: 'SLEEP', label: 'Sleep', icon: <HotelIcon />, unit: 'hours', color: '#8B5CF6' },
    { value: 'WATER', label: 'Water', icon: <WaterDropIcon />, unit: 'liters', color: '#06B6D4' },
    { value: 'CALORIES', label: 'Calories', icon: <RestaurantIcon />, unit: 'kcal', color: '#F97316' },
    { value: 'CUSTOM', label: 'Custom', icon: <StarIcon />, unit: 'units', color: '#6B7280' },
  ];

  const selectedType = goalTypes.find((t) => t.value === type) || goalTypes[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !targetValue || !targetDate) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      if (editingGoal) {
        // Update existing goal
        await onSubmit({
          title: title.trim(),
          description: description.trim() || undefined,
          targetValue: parseFloat(targetValue),
          endDate: new Date(targetDate).toISOString(),
        });
      } else {
        // Create new goal
        await onSubmit({
          type,
          title: title.trim(),
          description: description.trim() || undefined,
          startValue: startValue ? parseFloat(startValue) : undefined,
          targetValue: parseFloat(targetValue),
          endDate: new Date(targetDate).toISOString(),
        });
      }
      onClose();
    } catch (error) {
      console.error('Error submitting goal:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 'var(--z-modal)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--color-bg-white)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8)',
          width: 'min(560px, 90vw)',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-2xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-6)',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 'var(--font-weight-bold)',
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-text-primary)',
            }}
          >
            {editingGoal ? 'Edit Goal' : 'Create New Goal'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '24px',
              padding: 'var(--space-2)',
              color: 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Goal Type Selector (only for new goals) */}
          {!editingGoal && (
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-3)',
                }}
              >
                Goal Type
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 'var(--space-2)',
                }}
              >
                {goalTypes.map((goalType) => (
                  <button
                    key={goalType.value}
                    type="button"
                    onClick={() => setType(goalType.value as GoalType)}
                    style={{
                      padding: 'var(--space-3)',
                      background: type === goalType.value ? `${goalType.color}20` : 'transparent',
                      border: `2px solid ${type === goalType.value ? goalType.color : 'var(--color-border-light)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 'var(--space-1)',
                      transition: 'all var(--transition-fast)',
                      color: type === goalType.value ? goalType.color : 'var(--color-text-muted)',
                    }}
                    onMouseEnter={(e) => {
                      if (type !== goalType.value) {
                        e.currentTarget.style.borderColor = goalType.color;
                        e.currentTarget.style.background = `${goalType.color}10`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (type !== goalType.value) {
                        e.currentTarget.style.borderColor = 'var(--color-border-light)';
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{goalType.icon}</span>
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)' }}>
                      {goalType.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)',
              }}
            >
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Walk 10,000 steps daily"
              required
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                fontSize: 'var(--font-size-base)',
                border: '2px solid var(--color-border-light)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                transition: 'border-color var(--transition-fast)',
              }}
              onFocus={(e) => (e.target.style.borderColor = selectedType.color)}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-border-light)')}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)',
              }}
            >
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about your goal..."
              rows={3}
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                fontSize: 'var(--font-size-base)',
                border: '2px solid var(--color-border-light)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'border-color var(--transition-fast)',
              }}
              onFocus={(e) => (e.target.style.borderColor = selectedType.color)}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-border-light)')}
            />
          </div>

          {/* Values */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
            {/* Start Value */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                {editingGoal ? 'Current Value' : 'Start Value'} (optional)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={startValue}
                  onChange={(e) => setStartValue(e.target.value)}
                  placeholder="0"
                  step="0.1"
                  disabled={!!editingGoal}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    paddingRight: '60px',
                    fontSize: 'var(--font-size-base)',
                    border: '2px solid var(--color-border-light)',
                    borderRadius: 'var(--radius-md)',
                    outline: 'none',
                    transition: 'border-color var(--transition-fast)',
                    opacity: editingGoal ? 0.6 : 1,
                    cursor: editingGoal ? 'not-allowed' : 'text',
                  }}
                  onFocus={(e) => !editingGoal && (e.target.style.borderColor = selectedType.color)}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--color-border-light)')}
                />
                <span
                  style={{
                    position: 'absolute',
                    right: 'var(--space-3)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-muted)',
                    pointerEvents: 'none',
                  }}
                >
                  {selectedType.unit}
                </span>
              </div>
            </div>

            {/* Target Value */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                Target Value *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="0"
                  required
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    paddingRight: '60px',
                    fontSize: 'var(--font-size-base)',
                    border: '2px solid var(--color-border-light)',
                    borderRadius: 'var(--radius-md)',
                    outline: 'none',
                    transition: 'border-color var(--transition-fast)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = selectedType.color)}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--color-border-light)')}
                />
                <span
                  style={{
                    position: 'absolute',
                    right: 'var(--space-3)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-muted)',
                    pointerEvents: 'none',
                  }}
                >
                  {selectedType.unit}
                </span>
              </div>
            </div>
          </div>

          {/* Target Date */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)',
              }}
            >
              Target Date *
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                fontSize: 'var(--font-size-base)',
                border: '2px solid var(--color-border-light)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                transition: 'border-color var(--transition-fast)',
              }}
              onFocus={(e) => (e.target.style.borderColor = selectedType.color)}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-border-light)')}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: 'var(--space-3)',
                background: 'transparent',
                border: '2px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F3F4F6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1,
                padding: 'var(--space-3)',
                background: selectedType.color,
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'white',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (!submitting) e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                if (!submitting) e.currentTarget.style.opacity = '1';
              }}
            >
              {submitting ? 'Saving...' : editingGoal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}