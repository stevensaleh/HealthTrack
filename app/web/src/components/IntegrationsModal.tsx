// src/components/IntegrationsModal.tsx
import { useState } from 'react';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import WatchIcon from '@mui/icons-material/Watch';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import CloseIcon from '@mui/icons-material/Close';

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (provider: 'STRAVA' | 'FITBIT' | 'LOSE_IT') => void;
}

export default function IntegrationsModal({
  isOpen,
  onClose,
  onConnect,
}: IntegrationsModalProps) {
  const [connecting, setConnecting] = useState<string | null>(null);

  if (!isOpen) return null;

  const providers = [
    {
      id: 'STRAVA' as const,
      name: 'Strava',
      icon: <DirectionsRunIcon />,
      color: '#FC4C02',
      description: 'Connect your running, cycling, and fitness activities',
    },
    {
      id: 'FITBIT' as const,
      name: 'Fitbit',
      icon: <WatchIcon />,
      color: '#00B0B9',
      description: 'Sync steps, heart rate, and sleep data',
    },
    {
      id: 'LOSE_IT' as const,
      name: 'Lose It!',
      icon: <RestaurantMenuIcon />,
      color: '#00A86B',
      description: 'Track your nutrition and calorie intake',
    },
  ];

  const handleConnect = async (provider: 'STRAVA' | 'FITBIT' | 'LOSE_IT') => {
    setConnecting(provider);
    try {
      await onConnect(provider);
    } catch (error) {
      console.error('Connection error:', error);
      setConnecting(null);
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
          width: 'min(600px, 90vw)',
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
              Connect Apps
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-muted)',
              }}
            >
              Sync your health data from your favorite apps
            </p>
          </div>
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

        {/* Providers Grid */}
        <div
          style={{
            display: 'grid',
            gap: 'var(--space-4)',
          }}
        >
          {providers.map((provider) => (
            <div
              key={provider.id}
              style={{
                border: '2px solid var(--color-border-light)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                transition: 'all var(--transition-base)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = provider.color;
                e.currentTarget.style.background = `${provider.color}10`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-light)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-md)',
                  background: `${provider.color}20`,
                  color: provider.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  flexShrink: 0,
                }}
              >
                {provider.icon}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    margin: '0 0 var(--space-1)',
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {provider.name}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {provider.description}
                </p>
              </div>

              {/* Connect Button */}
              <button
                onClick={() => handleConnect(provider.id)}
                disabled={connecting === provider.id}
                style={{
                  padding: 'var(--space-3) var(--space-6)',
                  background: provider.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  cursor: connecting === provider.id ? 'not-allowed' : 'pointer',
                  opacity: connecting === provider.id ? 0.6 : 1,
                  transition: 'all var(--transition-fast)',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (connecting !== provider.id) {
                    e.currentTarget.style.opacity = '0.9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (connecting !== provider.id) {
                    e.currentTarget.style.opacity = '1';
                  }
                }}
              >
                {connecting === provider.id ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div
          style={{
            marginTop: 'var(--space-6)',
            padding: 'var(--space-4)',
            background: '#f9f9f9',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          <strong>Note:</strong> You'll be redirected to authenticate with each service. Your
          data is synced securely and can be disconnected at any time.
        </div>
      </div>
    </div>
  );
}