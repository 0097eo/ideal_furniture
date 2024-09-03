import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import "../App.css"

const VerifyEmail = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await verifyEmail(email, verificationCode);
      if (result.success) {
        alert('Email verified successfully. You can now log in.');
        navigate('/login');
      } else {
        setError(result.error || 'Verification failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <section className="login-image">
        <img src="https://images.unsplash.com/photo-1567016432779-094069958ea5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZnVybml0dXJlfGVufDB8fDB8fHww" alt="Verify Email" />
      </section>
      <section className="login-form">
        <div className="form-container">
          <h2 className="form-title">Verify Your Email</h2>
          <p className="text-center text-sm text-gray-600">
            We've sent a verification code to your email. Please enter it below to complete your registration.
          </p>
          <form onSubmit={handleVerify}>
            <div className="input-group">
              <label htmlFor="email-address">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                readOnly
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
};

export default VerifyEmail;