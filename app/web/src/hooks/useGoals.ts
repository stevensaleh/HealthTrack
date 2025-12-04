// src/hooks/useGoals.ts
import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';

export interface GoalProgress {
  percentage: number;
  currentValue: number;
  remaining: number;
  onTrack: boolean;
  daysElapsed: number;
  daysRemaining: number;
  projectedCompletionDate?: string;
  message?: string;
}

export interface Goal {
  id: string;
  userId: string;
  type: 'WEIGHT_LOSS' | 'WEIGHT_GAIN' | 'STEPS' | 'EXERCISE' | 'SLEEP' | 'WATER' | 'CALORIES' | 'CUSTOM';
  title: string;
  description?: string;
  targetValue: number;
  startValue?: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'PAUSED';
  progress: GoalProgress; // Nested progress object
  createdAt: string;
  updatedAt: string;
}

export interface GoalStats {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  paused: number;
  completionRate: number;
  averageProgress: number;
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<GoalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all goals
      const goalsResponse = await apiClient.get('/goals');
      setGoals(Array.isArray(goalsResponse.data.goals) ? goalsResponse.data.goals : []);

      // Fetch active goals
      const activeResponse = await apiClient.get('/goals/active');
      setActiveGoals(Array.isArray(activeResponse.data.goals) ? activeResponse.data.goals : []);

      // Fetch goal statistics
      const statsResponse = await apiClient.get('/goals/stats');
      setStats(statsResponse.data);

    } catch (err: any) {
      console.error('Error fetching goals:', err);
      setError(err.response?.data?.message || 'Failed to fetch goals');
      // Ensure arrays remain even on error
      setGoals([]);
      setActiveGoals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return {
    goals,
    activeGoals,
    stats,
    loading,
    error,
    refetch: fetchGoals,
  };
}