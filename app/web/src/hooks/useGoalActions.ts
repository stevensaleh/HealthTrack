import { useState } from 'react';
import { apiClient } from '@/services/api';

export type GoalType = 
  | 'WEIGHT_LOSS' 
  | 'WEIGHT_GAIN' 
  | 'STEPS' 
  | 'EXERCISE' 
  | 'SLEEP' 
  | 'WATER' 
  | 'CALORIES' 
  | 'CUSTOM';

export interface CreateGoalData {
  type: GoalType;
  title: string;
  description?: string;
  targetValue: number;
  startValue?: number;
  startDate?: string;
  endDate: string; 
}

export interface UpdateGoalData {
  title?: string;
  description?: string;
  targetValue?: number;
  endDate?: string; 
}

export function useGoalActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGoal = async (data: CreateGoalData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.post('/goals', data);
      return response.data;
    } catch (err: any) {
      console.log('Full error object:', err);
      console.log('Error response:', err.response);
      console.log('Error response data:', err.response?.data);
      
      let errorMessage = 'Failed to create goal';
      
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data.message === 'string') {
          errorMessage = data.message;
        }
        else if (Array.isArray(data.message)) {
          errorMessage = data.message.join(', ');
        }
        else if (typeof data.error === 'string') {
          errorMessage = data.error;
        }
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateGoal = async (goalId: string, data: UpdateGoalData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.patch(`/goals/${goalId}`, data);
      return response.data;
    } catch (err: any) {
      let errorMessage = 'Failed to update goal';
      
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data.message === 'string') {
          errorMessage = data.message;
        } else if (Array.isArray(data.message)) {
          errorMessage = data.message.join(', ');
        } else if (typeof data.error === 'string') {
          errorMessage = data.error;
        }
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await apiClient.delete(`/goals/${goalId}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete goal';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const completeGoal = async (goalId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.post(`/goals/${goalId}/complete`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to complete goal';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const pauseGoal = async (goalId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.post(`/goals/${goalId}/pause`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to pause goal';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resumeGoal = async (goalId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.post(`/goals/${goalId}/resume`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to resume goal';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cancelGoal = async (goalId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.post(`/goals/${goalId}/cancel`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to cancel goal';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    createGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
    pauseGoal,
    resumeGoal,
    cancelGoal,
    loading,
    error,
  };
}