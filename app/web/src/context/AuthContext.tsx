import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse, LoginCredentials, RegisterData } from '@/types/user';
import { apiClient } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_KEY = 'healthhive_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEY);

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser) as User;
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login with email and password
  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      // Validate input
      if (!credentials.email || !credentials.password) {
        return { 
          success: false, 
          error: 'Please provide email and password' 
        };
      }

      // Call real backend API
      const response = await apiClient.post('/users/login', {
        email: credentials.email,
        password: credentials.password,
      });

      const { accessToken, user, tokenType } = response.data;

      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('tokenType', tokenType || 'Bearer');
      
      // Store user data
      setUser(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      
      return { 
        success: true, 
        user,
        accessToken,
        refreshToken: accessToken, 
      };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific error responses from backend
      if (error.response?.status === 401) {
        return { 
          success: false, 
          error: 'Invalid email or password' 
        };
      }
      
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Login failed' 
      };
    }
  };

  // Register new user
  const register = async (data: RegisterData): Promise<AuthResponse> => {
    try {
      // Validate input
      if (!data.email || !data.password || !data.name) {
        return { 
          success: false, 
          error: 'Please provide all required fields' 
        };
      }

      if (data.password.length < 6) {
        return { 
          success: false, 
          error: 'Password must be at least 6 characters' 
        };
      }

      // Prepare registration data
      const registerDto = {
        email: data.email,
        password: data.password,
        firstName: data.name.split(' ')[0] || data.name,
        lastName: data.name.split(' ').slice(1).join(' ') || undefined,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        height: data.height,
        weight: data.weight,
      };

      // Call real backend API
      const response = await apiClient.post('/users/register', registerDto);

      const { accessToken, user, tokenType } = response.data;

      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('tokenType', tokenType || 'Bearer');
      
      // Store user data
      setUser(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      
      return { 
        success: true, 
        user,
        accessToken,
        refreshToken: accessToken,
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      
      
      if (error.response?.status === 409) {
        return { 
          success: false, 
          error: 'Email already exists' 
        };
      }
      
      if (error.response?.status === 400) {
        return { 
          success: false, 
          error: error.response?.data?.message || 'Invalid registration data' 
        };
      }
      
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Registration failed' 
      };
    }
  };



  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // Update user profile
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    register,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}