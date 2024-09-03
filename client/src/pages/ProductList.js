import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Product from '../components/Product';
import '../App.css'

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const perPage = 10;

  const categories = [
    { id: 1, name: 'Couches' },
    { id: 2, name: 'Tables' },
    { id: 3, name: 'Beds' },
  ];

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const page = parseInt(queryParams.get('page') || '1', 10);
    const q = queryParams.get('q') || '';
    const category = queryParams.get('category_id') || '';

    setCurrentPage(page);
    setSearchQuery(q);
    setCategoryId(category);

    fetchProducts(page, q, category);
  }, [location.search]);

  const fetchProducts = async (page, q, category) => {
    setLoading(true);
    try {
      const response = await axios.get('/products', {
        params: {
          page,
          per_page: perPage,
          q,
          category_id: category,
        },
      });
      setProducts(response.data.products);
      setTotalPages(response.data.pages);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch products');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/products?page=1&q=${searchQuery}&category_id=${categoryId}`);
  };

  const handlePageChange = (newPage) => {
    navigate(`/products?page=${newPage}&q=${searchQuery}&category_id=${categoryId}`);
  };

  const handleCategoryChange = (e) => {
    setCategoryId(e.target.value);
    navigate(`/products?page=1&q=${searchQuery}&category_id=${e.target.value}`);
  };

  if (loading) return <div className="cart-container">
    <h2>Loading...</h2></div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="container">
    <form onSubmit={handleSearch}>
        <div className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
          />
          <select
            value={categoryId}
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button type="submit">Search</button>
        </div>
      </form>

      <div className="grid">
        {products.map((product) => (
          <Product key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-4 flex justify-center">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`mx-1 px-3 py-1 rounded ${
              currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
