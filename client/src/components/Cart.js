import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../utils/AuthContext';

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
        setCartItems([]); // Clear cart items after successful checkout
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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!cartItems.length) {
    return <div>Your cart is empty</div>;
  }

  const calculateTotalAmount = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  return (
    <div>
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
        <div className="checkout-error" style={{ color: 'red' }}>
          {checkoutError}
        </div>
      )}

      {!checkoutSuccess && (
        <>
          <ul>
            {cartItems.map((item) => (
              <li key={item.id} style={{ marginBottom: '20px' }}>
                <img
                  src={item.image_url}
                  alt={item.product_name}
                  width="100"
                  height="100"
                  style={{ objectFit: 'cover' }}
                />
                <h3>{item.product_name}</h3>
                <p>Price: Ksh {item.price.toFixed(2)}</p>
                <div>
                  Quantity:
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
                    style={{ width: '60px', marginLeft: '10px' }}
                  />
                </div>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  style={{
                    marginTop: '10px',
                    backgroundColor: '#ff4d4f',
                    color: '#fff',
                    border: 'none',
                    padding: '5px 10px',
                    cursor: 'pointer',
                    borderRadius: '5px',
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: '20px' }}>
            <h3>
              Total Amount: Ksh {calculateTotalAmount().toFixed(2)}
            </h3>
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              style={{
                marginTop: '10px',
                backgroundColor: '#4caf50',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                cursor: 'pointer',
                borderRadius: '5px',
                fontSize: '16px',
              }}
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
