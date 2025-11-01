// src/types/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string; // For Google OAuth profile picture
  provider: 'email' | 'google'; // Track auth provider
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  height?: number; // cm
  weight?: number; // kg
  activityLevel?: number; // 1.2 - 1.9
  preferences?: UserPreferences;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserPreferences {
  units: 'metric' | 'imperial';
  weekStartsOn: 'sunday' | 'monday';
  notifications: boolean;
  dataSourcePriority: DataSource[];
}

export type DataSource = 
  | 'manual'
  | 'fitbit'
  | 'strava'
  | 'google_fit'
  | 'apple_health'
  | 'nutritionix';

export interface AuthResponse {
  success: boolean;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
}

// Google OAuth types
export interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
  clientId?: string;
}

export interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified?: boolean;
  given_name?: string;
  family_name?: string;
}