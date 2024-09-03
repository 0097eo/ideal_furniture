import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import React from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import UserDashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import { useAuth } from './utils/AuthContext';
import Navbar from './components/Navbar';
import Cart from './components/Cart';
import Home from './pages/Home';


const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/dashboard' element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/verify-email' element={<VerifyEmail />} />
        <Route path='/products' element={<ProductList />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/' element={<Home />} />
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
      
    </Router>
  );
}

export default App;