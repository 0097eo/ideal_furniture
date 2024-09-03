import React from 'react';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';

const Product = ({ product }) => {
  const { user } = useAuth();

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

  return (
    <div className="product">
      <h2>{product.name}</h2>
      <img src={product.image_url} alt={product.name} />
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
      <button onClick={() => addToCart(product.id)}>Add to Cart</button>
    </div>
  );
};

export default Product;
