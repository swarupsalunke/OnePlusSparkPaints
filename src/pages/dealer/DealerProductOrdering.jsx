import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Eye, ShoppingCart, Package } from "lucide-react";
import "../../css/dealer/DealerProductOrdering.css";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const SERVER_URL = API_BASE_URL || "https://oneplussparkpaintsserver.onrender.com";

const DealerProductOrdering = () => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await axios.get(
                `${API_BASE_URL}/api/products?status=ACTIVE`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setProducts(response.data.products || []);
        } catch (error) {
            console.error("Fetch dealer products error:", error);
            setError("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const categories = [
        ...new Set(products.map((product) => product.category).filter(Boolean)),
    ];

    const filteredProducts = products.filter((product) => {
        const searchValue = search.toLowerCase().trim();

        const matchesSearch =
            !searchValue ||
            product.productName?.toLowerCase().includes(searchValue) ||
            product.sku?.toLowerCase().includes(searchValue) ||
            product.brand?.toLowerCase().includes(searchValue);

        const matchesCategory =
            !category || product.category === category;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="dealer-product-ordering">
            <div className="dealer-product-header">
                <div>
                    <h1>Product Ordering</h1>
                    <p>Browse products and place your order</p>
                </div>

                <button
                    type="button"
                    className="dealer-product-shopping-cart-btn"
                    onClick={() => navigate("/dealer/shopping-cart")}
                >
                    <ShoppingCart size={18} />
                    Shopping Cart
                </button>
            </div>

            <div className="dealer-product-filter">
                <div className="dealer-product-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search product name, SKU or brand..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">All Categories</option>

                    {categories.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="dealer-product-message">
                    Loading products...
                </div>
            ) : error ? (
                <div className="dealer-product-message dealer-product-error">
                    {error}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="dealer-product-message">
                    <Package size={30} />
                    <p>No products found</p>
                </div>
            ) : (
                <div className="dealer-product-grid">
                    {filteredProducts.map((product) => (
                        <div
                            className="dealer-product-card"
                            key={product._id}
                        >
                            <div className="dealer-product-image">
                                {product.image ? (
                                    <img
                                        src={`${SERVER_URL}${product.image}`}
                                        alt={product.productName}
                                    />
                                ) : (
                                    <Package size={42} />
                                )}
                            </div>

                            <div className="dealer-product-details">
                                <span className="dealer-product-category">
                                    {product.category}
                                </span>

                                <h3>{product.productName}</h3>

                                <p className="dealer-product-brand">
                                    {product.brand}
                                </p>

                                <div className="dealer-product-info">
                                    <span>SKU: {product.sku}</span>
                                    <span>{product.packingSize}</span>
                                </div>

                                <div className="dealer-product-price">
                                    <span>MRP</span>
                                    <strong>₹{product.mrp}</strong>
                                </div>

                                <div className="dealer-product-actions">
                                    <button
                                        type="button"
                                        className="dealer-product-view-btn"
                                        onClick={() => navigate(`/dealer/product-ordering/${product._id}`)}
                                    >
                                        <Eye size={16} />
                                        View Details
                                    </button>

                                    {/* <button
                                        type="button"
                                        className="dealer-product-cart-btn"
                                    >
                                        <ShoppingCart size={16} />
                                        Add to Cart
                                    </button> */}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DealerProductOrdering;