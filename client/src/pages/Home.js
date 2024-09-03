import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import Footer from '../components/Footer';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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

    const handleShop= () => {
        navigate('/products');
    };

    return (
        <>
        <div className="hero-section">
            <img src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGZ1cm5pdHVyZXxlbnwwfHwwfHx8MA%3D%3D" alt="Hero Banner" />
                <div className="hero-text">
                    <h1>Welcome to Ideal Furniture & Decor</h1>
                    <p>Discover our latest collection and find the perfect items for your home.</p>
                    <button className="cta-button" onClick={handleShop}>Shop Now</button>
                </div>
        </div>

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
        <div className="testimonials">
            <h2>What Our Customers Say</h2>
                <div className="testimonial">
                    <p>"Great service and wonderful products!"</p>
                    <p>- John Doe</p>
                </div>
                <div className="testimonial">
                    <p>"I found exactly what I was looking for. Highly recommend!"</p>
                    <p>- Jane Smith</p>
                </div>
        </div>
        <Footer />
        </>
    );
};

export default Home;
