export interface User {
  id: string;
  email: string;
  firstName?: string;      
  lastName?: string;       
  picture?: string;
  profileImage?: string;  
  provider?: 'email';
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
  | 'strava';

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
  firstName?: string;        
  lastName?: string;         
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
}