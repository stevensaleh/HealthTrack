import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('healthtrack_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('healthtrack_user');
      }
    }
    setLoading(false);
  }, []);

  // Login with email and password
  const login = async (email, password) => {
    try {
      // TODO: Replace with actual API call
      // For now, simulate authentication
      const mockUser = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        provider: 'email'
      };
      
      setUser(mockUser);
      localStorage.setItem('healthtrack_user', JSON.stringify(mockUser));
      return { success: true, user: mockUser };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // Login with Google
  const loginWithGoogle = async (credentialResponse) => {
    try {
      // Decode the JWT token to get user info
      const base64Url = credentialResponse.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const googleUser = JSON.parse(jsonPayload);
      
      const user = {
        id: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        provider: 'google'
      };

      setUser(user);
      localStorage.setItem('healthtrack_user', JSON.stringify(user));
      return { success: true, user };
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: error.message };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('healthtrack_user');
  };

  // Register new user
  const register = async (email, password, name) => {
    try {
      // TODO: Replace with actual API call
      const mockUser = {
        id: Date.now().toString(),
        email,
        name,
        provider: 'email'
      };
      
      setUser(mockUser);
      localStorage.setItem('healthtrack_user', JSON.stringify(mockUser));
      return { success: true, user: mockUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    loginWithGoogle,
    logout,
    register,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

