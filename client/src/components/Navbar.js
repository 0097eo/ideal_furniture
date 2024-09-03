import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); 
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px' }}>
      <div>
        <ul style={{ listStyleType: 'none', margin: 0, padding: 0 }}>
          <li>
            <Link to="/products" style={{ textDecoration: 'none', color: 'inherit' }}>Browse</Link>
          </li>
        </ul>
      </div>
      <div>
        {!user ? (
          <>
            <Link to="/signup" style={{ marginRight: '10px', textDecoration: 'none', color: 'inherit' }}>Signup</Link>
            <Link to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>Login</Link>
          </>
        ) : (
          <>
            <Link to="/cart" style={{ textDecoration: 'none', color: 'inherit' }}>Cart</Link>
            <Link to="/dashboard" style={{ marginRight: '10px', textDecoration: 'none', color: 'inherit' }}>Dashboard</Link>
            <button 
              onClick={handleLogout} 
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
              aria-label="Logout"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
