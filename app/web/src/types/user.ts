// src/types/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: 'email' | 'google';
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  activityLevel?: number;
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
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
}

// Remove the custom GoogleCredentialResponse - we'll use the library's type
// export interface GoogleCredentialResponse { ... }

export interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified?: boolean;
  given_name?: string;
  family_name?: string;
}