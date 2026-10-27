import React, { useEffect, useMemo, useState } from "react";
import { Package, Search, ShoppingBag, CheckCircle } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../css/painter/PainterShopDashboard.css";

const PRODUCT_API = "https://oneplussparkpaintsserver.onrender.com/api/painter/products";

const PainterShopDashboard = () => {
    const navigate = useNavigate();

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
            }
        } catch (error) {
            console.error("Fetch shop products error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const productCategories = useMemo(() => {
        const getCount = (callback) =>
            products.filter(
                (product) =>
                    product.status === "ACTIVE" && callback(product)
            ).length;

        return [
            {
                title: "Interior Paints",
                count: getCount(
                    (product) =>
                        product.category
                            ?.toLowerCase()
                            .includes("interior") ||
                        product.group === "Paints"
                ),
            },
            {
                title: "Exterior Paints",
                count: getCount(
                    (product) =>
                        product.category
                            ?.toLowerCase()
                            .includes("exterior")
                ),
            },
            {
                title: "Primers",
                count: getCount(
                    (product) =>
                        product.group === "Primers" ||
                        product.category
                            ?.toLowerCase()
                            .includes("primer")
                ),
            },
            {
                title: "Specialty",
                count: getCount(
                    (product) =>
                        product.group === "Others" &&
                        !product.category
                            ?.toLowerCase()
                            .includes("putty")
                ),
            },
        ];
    }, [products]);

    const handleBrowse = () => {
        navigate("/painter/shop-product-listing");
    };

    return (
        <div className="painter-shop-dashboard-page">

            <div className="painter-shop-dashboard-header">
                <div>
                    <h1>Shop Dashboard</h1>
                    <p>
                        Oneplus Spark PAINTS • Painter experience
                    </p>
                </div>
            </div>

            <section className="painter-shop-products-section">
                <h2>Explore Products</h2>

                <div className="painter-shop-category-grid">
                    {productCategories.map((category) => (
                        <div
                            className="painter-shop-category-card"
                            key={category.title}
                        >
                            <div className="painter-shop-category-top">
                                <div className="painter-shop-category-icon">
                                    P
                                </div>

                                <div className="painter-shop-category-info">
                                    <h3>{category.title}</h3>

                                    <span>
                                        {loading
                                            ? "Loading..."
                                            : `${category.count} products`}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleBrowse}
                            >
                                Browse
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section className="painter-shop-dashboard-bottom">

                <div className="painter-shop-enquiries-card">
                    <h2>My Enquiries</h2>

                    <div className="painter-shop-chart">
                        {["Apr", "May", "Jun", "Jul", "Aug", "Sep"].map(
                            (month, index) => {
                                const heights = [
                                    55,
                                    105,
                                    75,
                                    180,
                                    120,
                                    205,
                                ];

                                return (
                                    <div
                                        className="painter-shop-chart-column"
                                        key={month}
                                    >
                                        <div
                                            className={`painter-shop-chart-bar ${
                                                index === 5
                                                    ? "current"
                                                    : ""
                                            }`}
                                            style={{
                                                height: `${heights[index]}px`,
                                            }}
                                        />

                                        <span>{month}</span>
                                    </div>
                                );
                            }
                        )}
                    </div>
                </div>

                <div className="painter-shop-stats">

                    <div className="painter-shop-stat-card">
                        <div className="painter-shop-stat-icon">
                            <ShoppingBag size={16} />
                        </div>

                        <div>
                            <span>Open Enquiries</span>
                            <strong>0</strong>
                            <small>Enquiry data unavailable</small>
                        </div>
                    </div>

                    <div className="painter-shop-stat-card">
                        <div className="painter-shop-stat-icon success">
                            <CheckCircle size={16} />
                        </div>

                        <div>
                            <span>Converted Orders</span>
                            <strong>0</strong>
                            <small>Order data unavailable</small>
                        </div>
                    </div>

                </div>
            </section>

        </div>
    );
};

export default PainterShopDashboard;