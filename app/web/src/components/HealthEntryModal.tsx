// src/components/HealthEntryModal.tsx
import { useState } from 'react';
import { apiClient } from '@/services/api';
import CloseIcon from '@mui/icons-material/Close';
import ScaleIcon from '@mui/icons-material/Scale';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FavoriteIcon from '@mui/icons-material/Favorite';
import NotesIcon from '@mui/icons-material/Notes';
import MoodIcon from '@mui/icons-material/Mood';
import HeightIcon from '@mui/icons-material/Height';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

interface HealthEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

interface HealthFormData {
  date: string;
  weight?: string;
  height?: string;
  steps?: string;
  calories?: string;
  sleep?: string;
  water?: string;
  exercise?: string;
  heartRate?: string;
  notes?: string;
  mood?: string;
}

export default function HealthEntryModal({ isOpen, onClose, onSuccess }: HealthEntryModalProps) {
  const [formData, setFormData] = useState<HealthFormData>({
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field: keyof HealthFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert string values to numbers where needed
      const payload: any = {
        date: formData.date,
      };

      if (formData.weight) payload.weight = parseFloat(formData.weight);
      if (formData.height) payload.height = parseFloat(formData.height);
      if (formData.steps) payload.steps = parseInt(formData.steps);
      if (formData.calories) payload.calories = parseInt(formData.calories);
      if (formData.sleep) payload.sleep = parseFloat(formData.sleep);
      if (formData.water) payload.water = parseFloat(formData.water);
      if (formData.exercise) payload.exercise = parseInt(formData.exercise);
      if (formData.heartRate) payload.heartRate = parseInt(formData.heartRate);
      if (formData.notes) payload.notes = formData.notes;
      if (formData.mood) payload.mood = formData.mood;

      console.log('Sending health data payload:', payload);
      
      await apiClient.post('/health', payload);

      setSuccess(true);
      
      // Wait a moment to show success message, then trigger parent callback
      setTimeout(async () => {
        try {
          await onSuccess();  // Parent will refresh data and close modal
        } catch (error) {
          console.error('Error in success callback:', error);
          handleClose();      // Close on error
        }
      }, 1500);
    } catch (err: any) {
      console.error('Error saving health data:', err);
      console.error('Error response:', err.response?.data);
      
      // Show detailed error message from backend
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error
        || (Array.isArray(err.response?.data?.message) 
            ? err.response.data.message.join(', ') 
            : 'Failed to save health data');
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ date: new Date().toISOString().split('T')[0] });
    setError(null);
    setSuccess(false);
    onClose();
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
      onClick={handleClose}
    >
      <div
        style={{
          background: 'var(--color-bg-white)',
          borderRadius: 'var(--radius-xl)',
          width: 'min(800px, 95vw)',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-2xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            background: 'var(--color-bg-white)',
            borderBottom: '1px solid var(--color-border-light)',
            padding: 'var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 1,
          }}
        >
          <div>
            <h2
              style={{
                margin: '0 0 var(--space-1)',
                fontSize: 'var(--font-size-3xl)',
                fontWeight: 'var(--font-weight-bold)',
                fontFamily: 'var(--font-heading)',
                color: 'var(--color-text-primary)',
              }}
            >
              Add Health Entry
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-muted)',
              }}
            >
              Track your daily health metrics
            </p>
          </div>
          <button
            onClick={handleClose}
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
              borderRadius: 'var(--radius-md)',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f5f5f5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div
            style={{
              margin: 'var(--space-6)',
              padding: 'var(--space-5)',
              background: 'var(--color-success-bg)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              color: 'var(--color-success)',
            }}
          >
            <CheckCircleIcon style={{ fontSize: '24px' }} />
            <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>
              Health data saved successfully!
            </span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            style={{
              margin: 'var(--space-6)',
              padding: 'var(--space-5)',
              background: 'var(--color-error-bg)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              color: 'var(--color-error)',
            }}
          >
            <ErrorIcon style={{ fontSize: '24px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 'var(--space-6)' }}>
          {/* Date Input */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)',
              }}
            >
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              required
              style={{
                width: '100%',
                padding: 'var(--space-4)',
                border: '2px solid var(--color-border-light)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-base)',
                fontFamily: 'var(--font-body)',
                transition: 'all var(--transition-fast)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent)';
                e.currentTarget.style.outline = 'none';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-light)';
              }}
            />
          </div>

          {/* Vital Statistics */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <h3
              style={{
                margin: '0 0 var(--space-4)',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
            >
              <FavoriteIcon style={{ color: 'var(--color-accent)' }} />
              Vital Statistics
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-4)',
              }}
            >
              <InputField
                icon={<ScaleIcon />}
                label="Weight"
                placeholder="70.5"
                unit="kg"
                value={formData.weight || ''}
                onChange={(value) => handleChange('weight', value)}
                type="number"
                step="0.1"
              />
              <InputField
                icon={<HeightIcon />}
                label="Height"
                placeholder="175"
                unit="cm"
                value={formData.height || ''}
                onChange={(value) => handleChange('height', value)}
                type="number"
                step="1"
              />
              <InputField
                icon={<FavoriteIcon />}
                label="Heart Rate"
                placeholder="72"
                unit="bpm"
                value={formData.heartRate || ''}
                onChange={(value) => handleChange('heartRate', value)}
                type="number"
                step="1"
              />
            </div>
          </div>

          {/* Activity */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <h3
              style={{
                margin: '0 0 var(--space-4)',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
            >
              <DirectionsWalkIcon style={{ color: 'var(--color-accent)' }} />
              Activity
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-4)',
              }}
            >
              <InputField
                icon={<DirectionsWalkIcon />}
                label="Steps"
                placeholder="10000"
                unit="steps"
                value={formData.steps || ''}
                onChange={(value) => handleChange('steps', value)}
                type="number"
                step="1"
              />
              <InputField
                icon={<FitnessCenterIcon />}
                label="Exercise"
                placeholder="45"
                unit="minutes"
                value={formData.exercise || ''}
                onChange={(value) => handleChange('exercise', value)}
                type="number"
                step="1"
              />
            </div>
          </div>

          {/* Nutrition & Wellness */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <h3
              style={{
                margin: '0 0 var(--space-4)',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
            >
              <RestaurantIcon style={{ color: 'var(--color-accent)' }} />
              Nutrition & Wellness
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-4)',
              }}
            >
              <InputField
                icon={<RestaurantIcon />}
                label="Calories"
                placeholder="2000"
                unit="kcal"
                value={formData.calories || ''}
                onChange={(value) => handleChange('calories', value)}
                type="number"
                step="1"
              />
              <InputField
                icon={<WaterDropIcon />}
                label="Water Intake"
                placeholder="2.5"
                unit="liters"
                value={formData.water || ''}
                onChange={(value) => handleChange('water', value)}
                type="number"
                step="0.1"
              />
              <InputField
                icon={<BedtimeIcon />}
                label="Sleep"
                placeholder="7.5"
                unit="hours"
                value={formData.sleep || ''}
                onChange={(value) => handleChange('sleep', value)}
                type="number"
                step="0.1"
              />
            </div>
          </div>

          {/* Notes & Mood */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <h3
              style={{
                margin: '0 0 var(--space-4)',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
            >
              <NotesIcon style={{ color: 'var(--color-accent)' }} />
              Additional Info
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <InputField
                icon={<MoodIcon />}
                label="Mood"
                placeholder="Happy, Tired, Energetic..."
                value={formData.mood || ''}
                onChange={(value) => handleChange('mood', value)}
              />
              <div>
                <label
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                  }}
                >
                  <NotesIcon style={{ fontSize: '18px', color: 'var(--color-text-muted)' }} />
                  Notes
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Any additional notes about your day..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: 'var(--space-4)',
                    border: '2px solid var(--color-border-light)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-base)',
                    fontFamily: 'var(--font-body)',
                    resize: 'vertical',
                    transition: 'all var(--transition-fast)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent)';
                    e.currentTarget.style.outline = 'none';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border-light)';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-4)',
              justifyContent: 'flex-end',
              paddingTop: 'var(--space-6)',
              borderTop: '1px solid var(--color-border-light)',
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              className="btn-ghost btn-md"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary btn-md"
              disabled={loading}
              style={{
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Reusable Input Field Component
interface InputFieldProps {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  unit?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  step?: string;
}

function InputField({
  icon,
  label,
  placeholder,
  unit,
  value,
  onChange,
  type = 'text',
  step,
}: InputFieldProps) {
  return (
    <div>
      <label
        style={{
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-2)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}
      >
        <span style={{ color: 'var(--color-text-muted)', fontSize: '18px', display: 'flex' }}>
          {icon}
        </span>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          step={step}
          style={{
            width: '100%',
            padding: unit ? 'var(--space-4) 60px var(--space-4) var(--space-4)' : 'var(--space-4)',
            border: '2px solid var(--color-border-light)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-base)',
            fontFamily: 'var(--font-body)',
            transition: 'all var(--transition-fast)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-accent)';
            e.currentTarget.style.outline = 'none';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border-light)';
          }}
        />
        {unit && (
          <span
            style={{
              position: 'absolute',
              right: 'var(--space-4)',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-muted)',
              pointerEvents: 'none',
            }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}