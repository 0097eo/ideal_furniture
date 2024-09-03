import React, { useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';
import '../App.css';

const Product = ({ product }) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const addToCart = async (productId) => {
    if (!user) {
      alert('Please log in to add items to your cart.');
      return;
    }

    try {
      const response = await axios.post('/cart', {
        product_id: productId,
        quantity: 1,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });

      if (response.status === 201) {
        alert('Product added to cart successfully!');
      }
    } catch (error) {
      console.error('Failed to add product to cart:', error);
      alert('Failed to add product to cart.');
    }
  };

  const handleModalOpen = () => setShowModal(true);
  const handleModalClose = () => setShowModal(false);

  return (
    <>
      <div className="product" onClick={handleModalOpen}>
        <img src={product.image_url} alt={product.name} />
        <p>Price: Ksh {product.price}</p>
        <h2>{product.name}</h2>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={handleModalClose}>×</button>
            <img src={product.image_url} alt={product.name} />
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p>Price: Ksh {product.price}</p>
            {user && (
              <button onClick={() => addToCart(product.id)}>Add to Cart</button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Product;
