// src/pages/Login.tsx
import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import { GoogleCredentialResponse } from '@/types/user';

export default function Login() {
  const { isAuthenticated, login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLoginMode) {
        if (!formData.email || !formData.password) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }
        result = await login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        if (!formData.email || !formData.password || !formData.name) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }
        result = await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });
      }

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: GoogleCredentialResponse) => {
    setError('');
    setLoading(true);

    try {
      const result = await loginWithGoogle(credentialResponse);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Google authentication failed');
      }
    } catch (err) {
      setError('An error occurred with Google sign-in. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in failed. Please try again.');
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setFormData({ email: '', password: '', name: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-teal-800 to-gray-100 p-5">
      <div className="bg-white/95 rounded-3xl shadow-2xl p-10 w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-teal-700 mb-2">HealthHive</h1>
          <p className="text-gray-600">
            {isLoginMode ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLoginMode && (
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
              disabled={loading}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter your password"
              disabled={loading}
              required
              minLength={6}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3 rounded-lg font-semibold hover:from-teal-700 hover:to-teal-800 transform hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
          >
            {loading ? 'Loading...' : isLoginMode ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500 font-medium">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_blue"
            size="large"
            text={isLoginMode ? 'signin_with' : 'signup_with'}
            width="320"
          />
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>
            {isLoginMode ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={toggleMode}
              className="text-teal-600 font-semibold hover:text-teal-700 hover:underline transition-colors"
            >
              {isLoginMode ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}