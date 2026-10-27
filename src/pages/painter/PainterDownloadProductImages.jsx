import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/painter/PainterDownloadProductImages.css";

const PRODUCT_API = "https://oneplussparkpaintsserver.onrender.com/api/painter/products";
const SERVER_URL = "https://oneplussparkpaintsserver.onrender.com";

const PainterDownloadProductImages = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const response = await axios.get(PRODUCT_API, {
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
            console.error("Fetch product images error:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <div className="painter-product-images-page">

            <div className="painter-product-images-header">
                <h1>Product Images</h1>

                <p>
                    Oneplus Spark PAINTS • Painter experience
                </p>
            </div>

            <div className="painter-product-images-card">

                <h2>Product Images</h2>

                {loading ? (
                    <div className="painter-product-images-message">
                        Loading product images...
                    </div>
                ) : products.length === 0 ? (
                    <div className="painter-product-images-message">
                        No product images available.
                    </div>
                ) : (
                    <div className="painter-product-images-grid">

                        {products.map((product) => (
                            <div
                                className="painter-product-image-box"
                                key={product._id}
                            >
                                {product.image ? (
                                    <img
                                        src={`${SERVER_URL}${product.image}`}
                                        alt={
                                            product.productName ||
                                            "Product"
                                        }
                                    />
                                ) : (
                                    <span>PRODUCT IMAGE</span>
                                )}
                            </div>
                        ))}

                    </div>
                )}

            </div>

            <div className="painter-product-images-footer">
                © Oneplus Spark PAINTS • Painter Mobile App UI
            </div>

        </div>
    );
};

export default PainterDownloadProductImages;