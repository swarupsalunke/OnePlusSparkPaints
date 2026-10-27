import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    ShoppingCart,
    Package,
    Minus,
    Plus,
} from "lucide-react";
import "../../css/dealer/DealerProductDetails.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const SERVER_URL = API_BASE_URL || "https://oneplussparkpaintsserver.onrender.com";

const DealerProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const fetchProduct = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await axios.get(
                `${API_BASE_URL}/api/products/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setProduct(response.data.product);
        } catch (error) {
            console.error("Fetch product details error:", error);
            setError(
                error.response?.data?.message || "Failed to load product details"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const increaseQuantity = () => {
        if (product && quantity < product.stockQuantity) {
            setQuantity((prev) => prev + 1);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity((prev) => prev - 1);
        }
    };

    const handleAddToCart = async () => {
        try {
            setAddingToCart(true);
            setMessage("");

            const token = localStorage.getItem("token");

            const response = await axios.post(
                `${API_BASE_URL}/api/dealer/cart/add`,
                {
                    productId: product._id,
                    quantity,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            navigate("/dealer/shopping-cart");
        } catch (error) {
            console.error("Add to cart error:", error);
            setMessage(
                error.response?.data?.message || "Failed to add product to cart"
            );
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) {
        return (
            <div className="dealer-product-details-page">
                <div className="dealer-product-details-message">
                    Loading product details...
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="dealer-product-details-page">
                <button
                    type="button"
                    className="dealer-product-details-back-btn"
                    onClick={() => navigate("/dealer/product-ordering")}
                >
                    <ArrowLeft size={18} />
                    Back
                </button>

                <div className="dealer-product-details-message dealer-product-details-error">
                    {error || "Product not found"}
                </div>
            </div>
        );
    }

    return (
        <div className="dealer-product-details-page">
            <div className="dealer-product-details-top">
                <button
                    type="button"
                    className="dealer-product-details-back-btn"
                    onClick={() => navigate("/dealer/product-ordering")}
                >
                    <ArrowLeft size={18} />
                    Back
                </button>

                <div className="dealer-product-details-breadcrumb">
                    <span onClick={() => navigate("/dealer/product-ordering")}>
                        Product Ordering
                    </span>
                    <span>/</span>
                    <strong>View Details</strong>
                </div>
            </div>

            <div className="dealer-product-details-card">
                <div className="dealer-product-details-image-section">
                    <div className="dealer-product-details-image">
                        {product.image ? (
                            <img
                                src={`${SERVER_URL}${product.image}`}
                                alt={product.productName}
                            />
                        ) : (
                            <Package size={70} />
                        )}
                    </div>
                </div>

                <div className="dealer-product-details-content">
                    <span className="dealer-product-details-category">
                        {product.category}
                    </span>

                    <h1>{product.productName}</h1>

                    <p className="dealer-product-details-brand">
                        Brand: {product.brand}
                    </p>

                    <div className="dealer-product-details-info-grid">
                        <div>
                            <span>SKU</span>
                            <strong>{product.sku || "-"}</strong>
                        </div>

                        <div>
                            <span>Barcode</span>
                            <strong>{product.barcode || "-"}</strong>
                        </div>

                        <div>
                            <span>Category</span>
                            <strong>{product.category || "-"}</strong>
                        </div>

                        <div>
                            <span>Sub Category</span>
                            <strong>{product.subCategory || "-"}</strong>
                        </div>

                        <div>
                            <span>Group</span>
                            <strong>{product.group || "-"}</strong>
                        </div>

                        <div>
                            <span>Brand</span>
                            <strong>{product.brand || "-"}</strong>
                        </div>

                        <div>
                            <span>Packing Size</span>
                            <strong>{product.packingSize || "-"}</strong>
                        </div>

                        <div>
                            <span>Stock Quantity</span>
                            <strong>{product.stockQuantity}</strong>
                        </div>
                    </div>

                    <div className="dealer-product-details-price-section">
                        <div>
                            <span>MRP</span>
                            <strong>₹{product.mrp}</strong>
                        </div>

                        <div>
                            <span>Discount Price</span>
                            <strong>₹{product.discountPrice}</strong>
                        </div>

                        <div>
                            <span>Status</span>
                            <strong className={product.status === "ACTIVE" ? "active" : "inactive"}>
                                {product.status}
                            </strong>
                        </div>
                    </div>

                    <div className="dealer-product-details-order-section">
                        <div className="dealer-product-details-quantity">
                            <span>Quantity</span>

                            <div className="dealer-product-details-quantity-control">
                                <button
                                    type="button"
                                    onClick={decreaseQuantity}
                                    disabled={quantity <= 1}
                                >
                                    <Minus size={16} />
                                </button>

                                <span>{quantity}</span>

                                <button
                                    type="button"
                                    onClick={increaseQuantity}
                                    disabled={quantity >= product.stockQuantity}
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="dealer-product-details-cart-btn"
                            onClick={handleAddToCart}
                            disabled={addingToCart || product.stockQuantity < 1}
                        >
                            <ShoppingCart size={18} />
                            {addingToCart ? "Adding..." : "Add to Cart"}
                        </button>
                    </div>

                    {message && (
                        <div className="dealer-product-details-message-inline">
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DealerProductDetails;