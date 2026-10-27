import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../../css/painter/PainterShopProductDetails.css";

const PRODUCT_API = "https://oneplussparkpaintsserver.onrender.com/api/painter/products";

const PainterShopProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);

    const fetchProduct = async () => {
        if (!id) return;

        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const response = await axios.get(
                `${PRODUCT_API}/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data?.success) {
                setProduct(response.data.product);
            } else {
                setProduct(null);
            }
        } catch (error) {
            console.error(
                "Fetch product details error:",
                error
            );

            setProduct(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const handleQuantityChange = (value) => {
        const newQuantity = Number(value);

        if (newQuantity >= 1) {
            setQuantity(newQuantity);
        } else if (value === "") {
            setQuantity("");
        }
    };

    const handleAddToCart = () => {
        if (!product || !quantity) return;

        navigate("/painter/shop-cart", {
            state: {
                product,
                quantity,
            },
        });
    };

    const handleSubmitEnquiry = () => {
        if (!product || !quantity) return;

        navigate("/painter/shop-submit-enquiry", {
            state: {
                product,
                quantity,
            },
        });
    };

    /* SIDEBAR SE DIRECT PAGE OPEN */
    if (!id) {
        return (
            <div className="painter-shop-product-details-page">
                <div className="painter-shop-product-details-header">
                    <h1>Product Details</h1>

                    <p>
                        Oneplus Spark PAINTS • Painter experience
                    </p>
                </div>

                <div className="painter-shop-product-details-message-card">
                    <h2>Please select a product</h2>

                    <p>
                        Please select a product from the Product
                        Listing to view its details.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/painter/shop-product-listing"
                            )
                        }
                    >
                        Go to Product Listing
                    </button>
                </div>
            </div>
        );
    }

    /* PRODUCT LOADING */
    if (loading) {
        return (
            <div className="painter-shop-product-details-page">
                <div className="painter-shop-product-details-message-card">
                    <h2>Loading product details...</h2>
                    <p>
                        Please wait while the product details are
                        being loaded.
                    </p>
                </div>
            </div>
        );
    }

    /* PRODUCT NOT FOUND */
    if (!product) {
        return (
            <div className="painter-shop-product-details-page">
                <div className="painter-shop-product-details-message-card">
                    <h2>Product not found</h2>

                    <p>
                        The selected product could not be found.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/painter/shop-product-listing"
                            )
                        }
                    >
                        Back to Product Listing
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="painter-shop-product-details-page">

            {/* HEADER */}
            <div className="painter-shop-product-details-header">
                <h1>Product Details</h1>

                <p>
                    Oneplus Spark PAINTS • Painter experience
                </p>
            </div>

            {/* PRODUCT CARD */}
            <div className="painter-shop-product-details-card">

                {/* PRODUCT IMAGE */}
                <div className="painter-shop-product-details-image">
                    {product.image ? (
                        <img
                            src={`https://oneplussparkpaintsserver.onrender.com${product.image}`}
                            alt={product.productName || "Product"}
                        />
                    ) : (
                        <>
                            <span>PRODUCT</span>
                            <strong>IMAGE</strong>
                        </>
                    )}
                </div>

                {/* PRODUCT CONTENT */}
                <div className="painter-shop-product-details-content">

                    <h2>{product.productName}</h2>

                    <p className="painter-shop-product-description">
                        Premium interior finish • Multiple shades
                    </p>

                    {/* PRODUCT FIELDS */}
                    <div className="painter-shop-product-fields">

                        <div className="painter-shop-product-field">
                            <label htmlFor="product-quantity">
                                Quantity *
                            </label>

                            <input
                                id="product-quantity"
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) =>
                                    handleQuantityChange(
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="painter-shop-product-field">
                            <label htmlFor="product-unit">
                                Unit *
                            </label>

                            <input
                                id="product-unit"
                                type="text"
                                value={
                                    product.packingSize ||
                                    "Bucket"
                                }
                                readOnly
                            />
                        </div>

                    </div>

                    {/* PRICING */}
                    <div className="painter-shop-product-pricing">

                        <p>
                            MRP{" "}
                            <span>
                                ₹
                                {product.mrp
                                    ? product.mrp.toLocaleString(
                                        "en-IN"
                                    )
                                    : "0"}
                            </span>
                        </p>

                        <h3>
                            Your price{" "}
                            <span>
                                ₹
                                {product.discountPrice
                                    ? product.discountPrice.toLocaleString(
                                        "en-IN"
                                    )
                                    : "0"}
                            </span>
                        </h3>

                    </div>

                    {/* ACTIONS */}
                    <div className="painter-shop-product-details-actions">

                        <button
                            type="button"
                            className="painter-shop-add-cart-btn"
                            onClick={handleAddToCart}
                            disabled={!quantity}
                        >
                            Add to Cart
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PainterShopProductDetails;