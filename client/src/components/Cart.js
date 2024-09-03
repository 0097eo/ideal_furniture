import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../utils/AuthContext';
import '../App.css'

const Cart = () => {
  const { user, loading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        try {
          const token = localStorage.getItem('accessToken');
          const response = await axios.get('/cart', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCartItems(response.data);
        } catch (error) {
          setError('Failed to fetch cart items');
          console.error('Error fetching cart:', error);
        } finally {
          setLoadingCart(false);
        }
      } else {
        setLoadingCart(false);
      }
    };

    fetchCart();
  }, [user]);

  const handleUpdateQuantity = async (cartItemId, quantity) => {
    if (quantity <= 0) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(
        `/cart/${cartItemId}`,
        { quantity },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.id === cartItemId ? { ...item, quantity } : item
          )
        );
      }
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
    }
  };

  const handleDeleteItem = async (cartItemId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.delete(`/cart/${cartItemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.id !== cartItemId)
        );
      }
    } catch (error) {
      console.error('Error deleting cart item:', error);
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    setCheckoutSuccess(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        '/checkout',
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 201) {
        setCheckoutSuccess(response.data);
        setCartItems([]); 
      } else {
        setCheckoutError(response.data.message || 'Checkout failed');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      setCheckoutError(
        error.response?.data?.message || 'An error occurred during checkout'
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading || loadingCart) {
    return <div className='cart-container'>
      <h2>Loading...</h2>
      </div>;
  }

  if (error) {
    return <div className="checkout-error">{error}</div>;
  }

  if (!cartItems.length) {
    return <div className='cart-container'>
      <h2>Your cart is empty</h2>
      </div>;
  }

  const calculateTotalAmount = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>

      {checkoutSuccess && (
        <div className="checkout-success">
          <h3>Checkout Successful!</h3>
          <p>Order ID: {checkoutSuccess.order_id}</p>
          <p>Total Amount: Ksh {checkoutSuccess.total_amount.toFixed(2)}</p>
          <p>{checkoutSuccess.message}</p>
          {/* Add any additional payment instructions or details here */}
        </div>
      )}

      {checkoutError && (
        <div className="checkout-error">
          {checkoutError}
        </div>
      )}

      {!checkoutSuccess && (
        <>
          <ul>
            {cartItems.map((item) => (
              <li key={item.id} className="cart-item">
                <img
                  src={item.image_url}
                  alt={item.product_name}
                />
                <div>
                  <h3>{item.product_name}</h3>
                  <p>Ksh {item.price.toFixed(2)}</p>
                  <div>
                    
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateQuantity(
                          item.id,
                          parseInt(e.target.value, 10)
                        )
                      }
                      min="1"
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="checkout-section">
            <h3>
              Subtotal: Ksh {calculateTotalAmount().toFixed(2)}
            </h3>
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? 'Processing...' : 'Checkout'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
