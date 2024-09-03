import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import '../App.css'; 

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); 
  };

  return (
    <nav>
      <div className="nav-logo">
        <Link to='/home' className="nav-logo-link">
          <span className="furniture">Ideal Furniture</span><span className="decor"> & Decor</span>
        </Link>
      </div>
      <div className="nav-center">
        <ul>
          <li>
            <Link to="/products">Browse</Link>
          </li>
          {user && (
            <>
              <li>
                <Link to="/cart">Cart</Link>
              </li>
              <li>
                <Link to="/dashboard">Dashboard</Link>
              </li>
            </>
          )}
        </ul>
      </div>
      <div className="nav-links">
        {!user ? (
          <>
            <Link to="/signup">Signup</Link>
            <Link to="/login">Login</Link>
          </>
        ) : (
          <button onClick={handleLogout} className='logout-btn'>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
