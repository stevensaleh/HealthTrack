// src/hooks/useHealthData.ts
import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';

export interface HealthDataEntry {
  id: string;
  userId: string;
  date: string;
  weight?: number;
  steps?: number;
  calories?: number;
  sleep?: number;
  water?: number;
  exercise?: number;
  heartRate?: number;
  protein?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyStats {
  period: string;
  metrics: {
    weight?: { average: number; min: number; max: number; change: number };
    steps?: { average: number; total: number; max: number };
    calories?: { average: number; total: number };
    sleep?: { average: number; total: number };
    water?: { average: number; total: number };
    exercise?: { average: number; total: number };
    heartRate?: { average: number; min: number; max: number };
    protein?: { average: number; total: number };
  };
  daysTracked: number;
  completionRate: number;
}

export interface TrackingStatus {
  currentStreak: number;
  longestStreak: number;
  totalDaysTracked: number;
  lastEntryDate: string | null;
  streakStatus: 'active' | 'broken' | 'none';
}

export function useHealthData() {
  const [latestData, setLatestData] = useState<HealthDataEntry | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch latest health data
      const latestResponse = await apiClient.get('/health/latest');
      setLatestData(latestResponse.data);

      // Fetch weekly statistics
      const statsResponse = await apiClient.get('/health/stats/weekly');
      setWeeklyStats(statsResponse.data);

      // Fetch tracking status
      const statusResponse = await apiClient.get('/health/tracking-status');
      setTrackingStatus(statusResponse.data);

    } catch (err: any) {
      console.error('Error fetching health data:', err);
      setError(err.response?.data?.message || 'Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  return {
    latestData,
    weeklyStats,
    trackingStatus,
    loading,
    error,
    refetch: fetchHealthData,
  };
}