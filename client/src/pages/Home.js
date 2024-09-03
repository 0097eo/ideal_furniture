import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import '../App.css';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('/products');
                setProducts(response.data.products);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1
    };

    return (
        <div className="carousel-container">
            <h2>Featured Products</h2>
            <Slider {...settings}>
                {products.map(product => (
                    <div key={product.id} className="carousel-slide">
                        <img src={product.image_url} alt={product.name} />
                        <h3>{product.name}</h3>
                        <p>Ksh {product.price}</p>
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default Home;
