import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const { isAuthenticated, login, register } = useAuth();
  const navigate = useNavigate();

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

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setFormData({ email: '', password: '', name: '' });
  };

  return (
    <div className="page-gradient" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-10)', minHeight: '100vh' }}>
      <div className="card auth-container animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="heading-2 mb-2">HealthTrack</h1>
          <p className="body-lg text-secondary">
            {isLoginMode ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="name" className="input-label">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                disabled={loading}
                className="input-field"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="input-label">
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
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="input-label">
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
              className="input-field"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary btn-md btn-full btn-elevated"
          >
            {loading ? 'Loading...' : isLoginMode ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className="body-sm text-secondary">
            {isLoginMode ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={toggleMode}
              className="text-accent text-bold cursor-pointer no-underline"
              style={{
                background: 'none',
                border: 'none',
                textDecoration: 'underline',
                padding: 0,
                fontSize: 'inherit',
              }}
            >
              {isLoginMode ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}