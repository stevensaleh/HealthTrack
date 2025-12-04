// src/hooks/useIntegrations.ts
import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';

export interface Integration {
  id: string;
  userId: string;
  provider: 'STRAVA' | 'FITBIT' | 'LOSE_IT';
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  isActive: boolean;
  lastSyncedAt?: string;  // Changed from lastSyncAt to match backend
  syncErrorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderInfo {
  name: string;
  authUrl: string;
  scopes: string[];
  description: string;
}

export function useIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user integrations
      const response = await apiClient.get('/integrations');
      // Backend returns { integrations: [...], total: number }
      setIntegrations(response.data.integrations || []);

    } catch (err: any) {
      console.error('Error fetching integrations:', err);
      setError(err.response?.data?.message || 'Failed to fetch integrations');
      setIntegrations([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const initiateConnection = async (provider: 'STRAVA' | 'FITBIT' | 'LOSE_IT') => {
    try {
      const response = await apiClient.post('/integrations/connect', { provider });
      // Redirect to OAuth URL
      if (response.data.authUrl) {
        window.location.href = response.data.authUrl;
      }
    } catch (err: any) {
      console.error('Error initiating connection:', err);
      throw new Error(err.response?.data?.message || 'Failed to connect');
    }
  };

  const disconnectIntegration = async (integrationId: string) => {
    try {
      await apiClient.delete(`/integrations/${integrationId}`);
      await fetchIntegrations(); // Refresh list
    } catch (err: any) {
      console.error('Error disconnecting integration:', err);
      throw new Error(err.response?.data?.message || 'Failed to disconnect');
    }
  };

  const syncIntegration = async (integrationId: string) => {
    try {
      await apiClient.post(`/integrations/${integrationId}/sync`);
      await fetchIntegrations(); // Refresh list
    } catch (err: any) {
      console.error('Error syncing integration:', err);
      throw new Error(err.response?.data?.message || 'Failed to sync');
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  return {
    integrations,
    loading,
    error,
    refetch: fetchIntegrations,
    initiateConnection,
    disconnectIntegration,
    syncIntegration,
  };
}