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
  source?: string; 
  createdAt: string;
  updatedAt: string;
  height?: number;
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

export type TimePeriod = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

export function useHealthData(timePeriod: TimePeriod = 'WEEK') {
  const [latestData, setLatestData] = useState<HealthDataEntry | null>(null);
  const [historicalData, setHistoricalData] = useState<HealthDataEntry[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch latest health data
      try {
        const latestResponse = await apiClient.get('/health/latest');

        setLatestData(latestResponse.data);

      } catch (err: any) {

        if (err.response?.status === 404) {
          console.log('No health data found yet - this is normal for new users');
          setLatestData(null);

        } 
        else {
          throw err; 
        }
      }

      // Fetch historical data based on time period
      try {
        const now = new Date();
        let startDate: string;
        
        switch (timePeriod) {
          case 'DAY':
            startDate = now.toISOString().split('T')[0];
            break;
          case 'WEEK':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            startDate = weekAgo.toISOString().split('T')[0];
            break;
          case 'MONTH':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            startDate = monthAgo.toISOString().split('T')[0];
            break;
          case 'YEAR':
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            startDate = yearAgo.toISOString().split('T')[0];
            break;
        }
        
        const historicalResponse = await apiClient.get('/health', {
          params: {
            startDate,
            endDate: now.toISOString().split('T')[0],
          }
        });
        
        setHistoricalData(Array.isArray(historicalResponse.data) ? historicalResponse.data : []);
      } catch (err: any) {
        if (err.response?.status === 404) {
          console.log('No historical data found yet');
          
          setHistoricalData([]);
        } 
        else if (err.response?.status === 400) {

          console.error('Invalid query parameters:', err.response?.data);
          setHistoricalData([]);
        } 
        else {
          throw err;
        }
      }

      // Fetch stats
      try {
        const statsEndpoint = (timePeriod === 'MONTH' || timePeriod === 'YEAR') 
          ? '/health/stats/monthly' 
          : '/health/stats/weekly';
        const statsResponse = await apiClient.get(statsEndpoint);

        setWeeklyStats(statsResponse.data);

      } catch (err: any) {
        if (err.response?.status === 404) {
          console.log('No stats yet this is normal for new users');

          setWeeklyStats(null);

        } else {
          throw err;
        }
      }

      // Fetch tracking status
      try {
        const statusResponse = await apiClient.get('/health/tracking-status');
        setTrackingStatus(statusResponse.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          console.log('No tracking status yet this is normal for new users');
          setTrackingStatus(null);
        } else {
          throw err;
        }
      }

    } catch (err: any) {
      console.error('Error fetching health data:', err);

      setError(err.response?.data?.message || 'Failed to fetch health data');

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, [timePeriod]); 

  return {
    latestData,
    historicalData,
    weeklyStats,
    trackingStatus,
    loading,
    error,
    refetch: fetchHealthData,
  };
}