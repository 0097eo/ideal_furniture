import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';
import '../App.css'

const UserDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSection, setSelectedSection] = useState('accountDetails');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get('/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch orders');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (!user) {
    return <div className="loading">Please log in to view your dashboard.</div>;
  }

  return (
    <div className="container">
      <div className="sidebar">
        <li  onClick={() => setSelectedSection('accountDetails')}>Account Details</li>
        <li onClick={() => setSelectedSection('orders')}>Orders</li>
      </div>

      <div className="main-content">
        {selectedSection === 'accountDetails' && (
          <div className="section">
            <h2>Account Details</h2>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Verified:</strong> {user.is_verified ? 'Yes' : 'No'}</p>
          </div>
        )}

        {selectedSection === 'orders' && (
          <div className="section">
            <h2>Orders</h2>
            {loading ? (
              <div className="loading">Loading orders...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : orders.length === 0 ? (
              <div>No orders found.</div>
            ) : (
              <div>
                {orders.map((order) => (
                  <div key={order.order_id} className="order-item">
                    <p><strong>Total Amount:</strong> Ksh{order.total_amount}</p>
                    <p><strong>Status:</strong> {order.status}</p>
                    <p><strong>Made On:</strong> {new Date(order.created_at).toLocaleString()}</p>
                    <h4 className="font-semibold mt-2">Items:</h4>
                    <ul className='listed'>
                      {order.items.map((item, index) => (
                        <li key={index}>
                          <p>
                          {item.product_name} - Quantity: {item.quantity}, Price: Ksh {item.price}
                          </p>
                          <img src={item.image_url} alt={item.product_name} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
