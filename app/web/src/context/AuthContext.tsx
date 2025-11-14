// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/authService';
import { User, AuthResponse, LoginCredentials, RegisterData, GoogleUserInfo } from '@/types/user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  loginWithGoogle: (credential: string) => Promise<AuthResponse>; // Changed parameter type
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'healthhive_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const toDate = (value?: string | Date): Date | undefined => {
    if (!value) {
      return undefined;
    }

    if (value instanceof Date) {
      return value;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  };

  const hydrateStoredUser = (storedValue: string): User | null => {
    try {
      const parsed = JSON.parse(storedValue) as User & {
        createdAt?: string | Date;
        updatedAt?: string | Date;
        dateOfBirth?: string | Date;
      };

      if (!parsed || !parsed.id || !parsed.email) {
        return null;
      }

      return {
        ...parsed,
        createdAt: toDate(parsed.createdAt),
        updatedAt: toDate(parsed.updatedAt),
        dateOfBirth: toDate(parsed.dateOfBirth),
      };
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  };

  const storeUser = (nextUser: User | null) => {
    setUser(nextUser);

    if (!nextUser) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const serializableUser = {
      ...nextUser,
      createdAt: nextUser.createdAt?.toISOString(),
      updatedAt: nextUser.updatedAt?.toISOString(),
      dateOfBirth:
        nextUser.dateOfBirth instanceof Date
          ? nextUser.dateOfBirth.toISOString()
          : nextUser.dateOfBirth,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializableUser));
  };

  const persistTokens = (tokens?: {
    accessToken?: string | null;
    refreshToken?: string | null;
  }) => {
    if (!tokens) {
      return;
    }

    if (tokens.accessToken !== undefined) {
      if (tokens.accessToken) {
        localStorage.setItem('accessToken', tokens.accessToken);
      } else {
        localStorage.removeItem('accessToken');
      }
    }

    if (tokens.refreshToken !== undefined) {
      if (tokens.refreshToken) {
        localStorage.setItem('refreshToken', tokens.refreshToken);
      } else {
        localStorage.removeItem('refreshToken');
      }
    }
  };

  const persistSession = (
    sessionUser: User,
    tokens?: { accessToken?: string; refreshToken?: string },
  ) => {
    storeUser(sessionUser);
    persistTokens(tokens);
  };

  const clearSession = () => {
    storeUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEY);
        if (storedUser) {
          const hydratedUser = hydrateStoredUser(storedUser);
          if (hydratedUser) {
            setUser(hydratedUser);
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
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
      const response = await authService.login(credentials);

      if (response.success && response.user) {
        const tokenPayload: { accessToken?: string; refreshToken?: string } = {};

        if (response.accessToken !== undefined) {
          tokenPayload.accessToken = response.accessToken;
        }

        if (response.refreshToken !== undefined) {
          tokenPayload.refreshToken = response.refreshToken;
        }

        persistSession(
          response.user,
          Object.keys(tokenPayload).length > 0 ? tokenPayload : undefined,
        );
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  };

  // Register new user
  const register = async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await authService.register(data);

      if (response.success && response.user) {
        const tokenPayload: { accessToken?: string; refreshToken?: string } = {};

        if (response.accessToken !== undefined) {
          tokenPayload.accessToken = response.accessToken;
        }

        if (response.refreshToken !== undefined) {
          tokenPayload.refreshToken = response.refreshToken;
        }

        persistSession(
          response.user,
          Object.keys(tokenPayload).length > 0 ? tokenPayload : undefined,
        );
      }

      return response;
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Registration failed',
      };
    }
  };

  // Login with Google - now accepts string token directly
  const loginWithGoogle = async (credential: string): Promise<AuthResponse> => {
    try {
      const response = await authService.loginWithGoogle(credential);

      if (response.success && response.user) {
        const tokenPayload: { accessToken?: string; refreshToken?: string } = {};

        if (response.accessToken !== undefined) {
          tokenPayload.accessToken = response.accessToken;
        }

        if (response.refreshToken !== undefined) {
          tokenPayload.refreshToken = response.refreshToken;
        }

        persistSession(
          response.user,
          Object.keys(tokenPayload).length > 0 ? tokenPayload : undefined,
        );
      }

      return response;
    } catch (error) {
      console.error('Google login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Google authentication failed',
      };
    }
  };

  // Logout
  const logout = () => {
    clearSession();
  };

  // Update user profile
  const updateUser = (updatedUser: User) => {
    storeUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    loginWithGoogle,
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