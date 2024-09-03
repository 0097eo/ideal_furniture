import React, { useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../App.css'
import Footer from '../components/Footer';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, verifyEmail } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(username, password);
      if (result.success) {
        navigate('/dashboard'); 
      } else if (result.needsVerification) {
        setNeedsVerification(true);
        setEmail(username); 
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }

    setIsLoading(false);
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await verifyEmail(email, verificationCode);
      if (result.success) {
        setNeedsVerification(false);
        setError('');
        alert('Email verified successfully. Please log in again.');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred during verification. Please try again.');
    }

    setIsLoading(false);
  };

  if (needsVerification) {
    return (
      <div className="login-container">
        <section className="login-image">
          <img src="https://images.unsplash.com/photo-1567016432779-094069958ea5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZnVybml0dXJlfGVufDB8fDB8fHww" alt="Login" />
        </section>
        <section className="login-form">
          <div className="form-container">
            <h2 className="form-title">Verify Your Email</h2>
            <form onSubmit={handleVerification}>
              <div className="input-group">
                <label htmlFor="email-address">Email address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label htmlFor="verification-code">Verification Code</label>
                <input
                  id="verification-code"
                  name="code"
                  type="text"
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </div>

              {error && <div className="error">{error}</div>}

              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>
          </div>
        </section>
      </div>
    );
  }

  return (
    <>
    <div className="login-container">
      <section className="login-image">
        <img src="https://images.unsplash.com/photo-1567016432779-094069958ea5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZnVybml0dXJlfGVufDB8fDB8fHww" alt="Login" />
      </section>
      <section className="login-form">
        <div className="form-container">
          <h2 className="form-title">Sign in to your account</h2>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <div className="error">{error}</div>}

            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </section>
    </div>
    <Footer />
    </>
  );
};

export default Login;
