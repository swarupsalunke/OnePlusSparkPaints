import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../css/painter/PainterDownloadProductListing.css";

const API_URL = "https://oneplussparkpaintsserver.onrender.com/api/painter/products";
const SERVER_URL = "https://oneplussparkpaintsserver.onrender.com";

const PainterDownloadProductListing = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const fetchProducts = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const response = await axios.get(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data?.success) {
                setProducts(response.data.products || []);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error("Fetch painter products error:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleView = (product) => {
        navigate(`/painter/download-product-details/${product._id}`);
    };

    return (
        <div className="painter-product-listing-page">
            <div className="painter-product-listing-header">
                <div>
                    <h1>Product Listing</h1>
                    <p>Oneplus Spark PAINTS • Painter experience</p>
                </div>
            </div>

            {loading ? (
                <div className="painter-product-listing-loading">
                    Loading products...
                </div>
            ) : products.length === 0 ? (
                <div className="painter-product-listing-empty">
                    No products available.
                </div>
            ) : (
                <div className="painter-product-listing-grid">
                    {products.map((product) => (
                        <div
                            className="painter-product-listing-card"
                            key={product._id}
                        >
                            <div className="painter-product-listing-image">
                                {product.image ? (
                                    <img
                                        src={`${SERVER_URL}${product.image}`}
                                        alt={product.productName || "Product"}
                                    />
                                ) : (
                                    <span>P</span>
                                )}
                            </div>

                            <div className="painter-product-listing-info">
                                <h3>{product.productName}</h3>

                                <p>
                                    Catalogue <span>•</span> TDS{" "}
                                    <span>•</span> Usage Guide
                                </p>

                                <button
                                    type="button"
                                    onClick={() => handleView(product)}
                                >
                                    View
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="painter-product-listing-footer">
                © Oneplus Spark PAINTS • Painter Mobile App UI
            </div>
        </div>
    );
};

export default PainterDownloadProductListing;