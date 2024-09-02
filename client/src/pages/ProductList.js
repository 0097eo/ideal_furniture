import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

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
    {id : 1, name: "Couches"},
    {id : 2, name: "Tables"},
    {id : 3, name: "Beds"},
  ]

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
          category_id: category
        }
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

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Products</h1>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-grow p-2 border rounded"
          />
          <select
            value={categoryId}
            onChange={handleCategoryChange}
            className="p-2 border rounded"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Search
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border p-4 rounded shadow">
            <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover mb-2" />
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-gray-600">{product.description}</p>
            <p className="text-lg font-bold mt-2">Ksh {product.price.toFixed(2)}</p>
          </div>
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