import { useState } from 'react';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import WatchIcon from '@mui/icons-material/Watch';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import SyncIcon from '@mui/icons-material/Sync';

interface Integration {
  id: string;
  provider: 'STRAVA' | 'FITBIT' | 'LOSE_IT';
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  lastSyncedAt?: string; 
}

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (provider: 'STRAVA' | 'FITBIT' | 'LOSE_IT') => void;
  integrations?: Integration[];
  onDisconnect?: (integrationId: string) => void;
  onSync?: (integrationId: string) => Promise<void>;
}

export default function IntegrationsModal({
  isOpen,
  onClose,
  onConnect,
  integrations = [],
  onDisconnect,
  onSync,
}: IntegrationsModalProps) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

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

  // Helper to check if provider is connected
  const getIntegration = (provider: 'STRAVA' | 'FITBIT' | 'LOSE_IT') => {
    return integrations.find((i) => i.provider === provider && i.status === 'ACTIVE');
  };

  const isConnected = (provider: 'STRAVA' | 'FITBIT' | 'LOSE_IT') => {
    return !!getIntegration(provider);
  };

  const handleConnect = async (provider: 'STRAVA' | 'FITBIT' | 'LOSE_IT') => {
    setConnecting(provider);
    try {
      await onConnect(provider);
    } catch (error) {
      console.error('Connection error:', error);
      setConnecting(null);
    }
  };

  const handleDisconnect = async (provider: 'STRAVA' | 'FITBIT' | 'LOSE_IT') => {
    const integration = getIntegration(provider);
    if (!integration || !onDisconnect) return;
    
    setDisconnecting(provider);
    try {
      await onDisconnect(integration.id);
    } catch (error) {
      console.error('Disconnect error:', error);
    } finally {
      setDisconnecting(null);
    }
  };

  const handleSync = async (provider: 'STRAVA' | 'FITBIT' | 'LOSE_IT') => {
    const integration = getIntegration(provider);
    if (!integration || !onSync) return;
    
    setSyncing(provider);
    try {
      await onSync(integration.id);
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to sync data. Please try again.');
    } finally {
      setSyncing(null);
    }
  };

  // Helper to format last synced time
  const getLastSyncedText = (lastSyncedAt?: string) => {
    if (!lastSyncedAt) return 'Never synced';
    
    const now = new Date();
    const synced = new Date(lastSyncedAt);
    const diffMs = now.getTime() - synced.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
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

              {/* Connect/Disconnect/Sync Buttons */}
              {isConnected(provider.id) ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', alignItems: 'flex-end' }}>
                  {/* Connected Badge */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      color: 'var(--color-success)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                    }}
                  >
                    <CheckCircleIcon style={{ fontSize: '18px' }} />
                    Connected
                  </div>
                  
                  {/* Last Synced Text */}
                  <div
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    Last synced: {getLastSyncedText(getIntegration(provider.id)?.lastSyncedAt)}
                  </div>
                  
                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    {/* Sync Button */}
                    <button
                      onClick={() => handleSync(provider.id)}
                      disabled={syncing === provider.id}
                      style={{
                        padding: 'var(--space-2) var(--space-4)',
                        background: 'transparent',
                        color: provider.color,
                        border: `1px solid ${provider.color}`,
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 'var(--font-weight-medium)',
                        cursor: syncing === provider.id ? 'not-allowed' : 'pointer',
                        opacity: syncing === provider.id ? 0.6 : 1,
                        transition: 'all var(--transition-fast)',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-1)',
                      }}
                      onMouseEnter={(e) => {
                        if (syncing !== provider.id) {
                          e.currentTarget.style.background = `${provider.color}10`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (syncing !== provider.id) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      {syncing === provider.id ? (
                        <>
                          <SyncIcon style={{ fontSize: '14px', animation: 'spin 1s linear infinite' }} />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <SyncIcon style={{ fontSize: '14px' }} />
                          Sync
                        </>
                      )}
                    </button>
                    
                    {/* Disconnect Button */}
                    <button
                      onClick={() => handleDisconnect(provider.id)}
                      disabled={disconnecting === provider.id}
                      style={{
                        padding: 'var(--space-2) var(--space-4)',
                        background: 'transparent',
                        color: 'var(--color-error)',
                        border: '1px solid var(--color-error)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 'var(--font-weight-medium)',
                        cursor: disconnecting === provider.id ? 'not-allowed' : 'pointer',
                        opacity: disconnecting === provider.id ? 0.6 : 1,
                        transition: 'all var(--transition-fast)',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-1)',
                      }}
                      onMouseEnter={(e) => {
                        if (disconnecting !== provider.id) {
                          e.currentTarget.style.background = 'var(--color-error-bg)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (disconnecting !== provider.id) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      {disconnecting === provider.id ? (
                        'Disconnecting...'
                      ) : (
                        <>
                          <LinkOffIcon style={{ fontSize: '14px' }} />
                          Disconnect
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
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
              )}
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
    </>
  );
}