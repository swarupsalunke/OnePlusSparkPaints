import React, { useEffect, useState } from "react";
import { Search, Package, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../css/painter/PainterShopProductListing.css";

const PRODUCT_API = "https://oneplussparkpaintsserver.onrender.com/api/painter/products";
const SERVER_URL = "https://oneplussparkpaintsserver.onrender.com";

const PainterShopProductListing = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [selectedProducts, setSelectedProducts] = useState([]);

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

    const filteredProducts = products.filter((product) => {
        const searchValue = search.toLowerCase().trim();

        if (!searchValue) {
            return true;
        }

        return (
            product.productName
                ?.toLowerCase()
                .includes(searchValue) ||
            product.sku
                ?.toLowerCase()
                .includes(searchValue) ||
            product.category
                ?.toLowerCase()
                .includes(searchValue) ||
            product.brand
                ?.toLowerCase()
                .includes(searchValue)
        );
    });

    const handleView = (id) => {
        navigate(`/painter/shop-product-details/${id}`);
    };

    const handleAdd = (product) => {
        setSelectedProducts((previousProducts) => {
            const alreadySelected = previousProducts.some(
                (item) => item.product?._id === product._id
            );

            if (alreadySelected) {
                return previousProducts.filter(
                    (item) => item.product?._id !== product._id
                );
            }

            return [
                ...previousProducts,
                {
                    product,
                    quantity: 1,
                },
            ];
        });
    };

    const handleGoToCart = () => {
        if (selectedProducts.length === 0) {
            return;
        }

        navigate("/painter/shop-cart", {
            state: {
                products: selectedProducts,
            },
        });
    };

    const isProductSelected = (productId) => {
        return selectedProducts.some(
            (item) => item.product?._id === productId
        );
    };

    return (
        <div className="painter-shop-product-listing-page">

            <div className="painter-shop-product-listing-header">
                <div>
                    <h1>Product Listing</h1>

                    <p>
                        Oneplus Spark PAINTS • Painter experience
                    </p>
                </div>
            </div>

            <div className="painter-shop-product-listing-top">
                <h2>Products</h2>

                <div className="painter-shop-product-search">
                    <Search size={15} />

                    <input
                        type="text"
                        placeholder="Search products"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />
                </div>
            </div>

            {loading ? (
                <div className="painter-shop-product-listing-message">
                    Loading products...
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="painter-shop-product-listing-message">
                    No products found.
                </div>
            ) : (
                <div className="painter-shop-product-grid">
                    {filteredProducts.map((product) => {
                        const selected = isProductSelected(
                            product._id
                        );

                        return (
                            <div
                                className={`painter-shop-product-card ${selected
                                        ? "painter-shop-product-card-selected"
                                        : ""
                                    }`}
                                key={product._id}
                            >
                                <div className="painter-shop-product-image">
                                    {product.image ? (
                                        <img
                                            src={`${SERVER_URL}${product.image}`}
                                            alt={product.productName || "Product"}
                                        />
                                    ) : (
                                        <Package size={34} />
                                    )}

                                    {selected && (
                                        <div className="painter-shop-product-selected-icon">
                                            <Check size={16} />
                                        </div>
                                    )}
                                </div>

                                <div className="painter-shop-product-content">
                                    <h3>
                                        {product.productName}
                                    </h3>

                                    <p>
                                        Dealer / painter pricing
                                    </p>

                                    <div className="painter-shop-product-actions">
                                        <button
                                            type="button"
                                            className="painter-shop-view-btn"
                                            onClick={() =>
                                                handleView(
                                                    product._id
                                                )
                                            }
                                        >
                                            View
                                        </button>

                                        <button
                                            type="button"
                                            className={`painter-shop-add-btn ${selected
                                                    ? "painter-shop-add-btn-selected"
                                                    : ""
                                                }`}
                                            onClick={() =>
                                                handleAdd(product)
                                            }
                                        >
                                            {selected
                                                ? "Selected"
                                                : "Add"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedProducts.length > 0 && (
                <div className="painter-shop-selected-bar">
                    <div>
                        <strong>
                            {selectedProducts.length}
                        </strong>{" "}
                        product
                        {selectedProducts.length > 1
                            ? "s"
                            : ""}{" "}
                        selected
                    </div>

                    <button
                        type="button"
                        onClick={handleGoToCart}
                    >
                        Go to Cart
                    </button>
                </div>
            )}
        </div>
    );
};

export default PainterShopProductListing;