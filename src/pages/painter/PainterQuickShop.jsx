import React, { useEffect, useState } from "react";
import { Eye, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import "../../css/painter/PainterQuickShop.css";

const PainterQuickShop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    const [showEnquiryModal, setShowEnquiryModal] = useState(false);
    const [enquiryProduct, setEnquiryProduct] = useState(null);

    const [quantity, setQuantity] = useState(1);
    const [message, setMessage] = useState("");
    const [enquiryLoading, setEnquiryLoading] = useState(false);

    const API_URL = "https://oneplussparkpaintsserver.onrender.com/api";
    const SERVER_URL = "https://oneplussparkpaintsserver.onrender.com";

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const response = await fetch(`${API_URL}/painter/products`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setProducts(data.products || []);
            }
        } catch (error) {
            console.error("Quick Shop products error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewProduct = (product) => {
        setSelectedProduct(product);
        setShowViewModal(true);
    };

    const handleCloseViewModal = () => {
        setShowViewModal(false);
        setSelectedProduct(null);
    };

    const handleEnquire = (product) => {
        setEnquiryProduct(product);
        setQuantity(1);
        setMessage("");
        setShowEnquiryModal(true);
    };

    const handleSubmitEnquiry = async (e) => {
        e.preventDefault();

      if (!enquiryProduct?._id) {
    toast.error("Product information is missing.");
    return;
}

        try {
            setEnquiryLoading(true);
            

            const token = localStorage.getItem("token");

            const response = await fetch(`${API_URL}/painter/enquiries`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    product: enquiryProduct._id,
                    quantity: Number(quantity),
                    message,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
    toast.success("Product enquiry submitted successfully.");
    setQuantity(1);
    setMessage("");
} else {
    toast.error(
        data.message || "Failed to submit product enquiry."
    );
}
        } catch (error) {
    console.error("Enquiry error:", error);
    toast.error("Unable to connect to server.");
} finally {
            setEnquiryLoading(false);
        }
    };

    return (
        <div className="painter-quick-shop">
            <div className="painter-quick-shop-header">
                <div>
                    <h1>Quick Shop</h1>
                    <p>Popular products available for enquiry</p>
                </div>
            </div>

            <div className="painter-quick-shop-card">
                {loading ? (
                    <div className="painter-shop-empty">
                        Loading products...
                    </div>
                ) : products.length === 0 ? (
                    <div className="painter-shop-empty">
                        No products available.
                    </div>
                ) : (
                    <div className="painter-shop-product-grid">
                        {products.map((product) => (
                            <div
                                className="painter-shop-product-card"
                                key={product._id}
                            >
                                <div className="painter-shop-product-image">
                                    {product.image ? (
                                        <img
                                            src={`${SERVER_URL}${product.image}`}
                                            alt={product.productName || "Product"}
                                        />
                                    ) : (
                                        <span>No Image</span>
                                    )}
                                </div>

                                <div className="painter-shop-product-info">
                                    <h3>{product.productName || "-"}</h3>

                                    <p>
                                        MRP: ₹
                                        {Number(product.mrp || product.price || 0).toLocaleString()}
                                    </p>

                                    <div className="painter-shop-product-actions">
                                        <button
                                            type="button"
                                            className="painter-shop-view-btn"
                                            onClick={() => handleViewProduct(product)}
                                        >
                                            <Eye size={15} />
                                            View
                                        </button>

                                        <button
                                            type="button"
                                            className="painter-shop-enquire-btn"
                                            onClick={() => handleEnquire(product)}
                                        >
                                            <MessageSquare size={15} />
                                            Enquire
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* View Product Modal */}
            {showViewModal && selectedProduct && (
                <div
                    className="painter-shop-modal-overlay"
                    onClick={handleCloseViewModal}
                >
                    <div
                        className="painter-shop-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="painter-shop-modal-header">
                            <div>
                                <h2>Product Details</h2>
                                <p>View product information</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowViewModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="painter-shop-modal-body">
                            <div className="painter-shop-modal-image">
                                {selectedProduct.image ? (
                                    <img
                                        src={`${SERVER_URL}${selectedProduct.image}`}
                                        alt={selectedProduct.productName || "Product"}
                                    />
                                ) : (
                                    <span>No Image</span>
                                )}
                            </div>

                            <h3>{selectedProduct.productName || "-"}</h3>

                            <p>
                                MRP: ₹
                                {Number(
                                    selectedProduct.mrp || selectedProduct.price || 0
                                ).toLocaleString()}
                            </p>

                            <div className="painter-shop-product-details">
                                <div className="painter-shop-detail-row">
                                    <span>SKU</span>
                                    <strong>{selectedProduct.sku || "-"}</strong>
                                </div>

                                <div className="painter-shop-detail-row">
                                    <span>Barcode</span>
                                    <strong>{selectedProduct.barcode || "-"}</strong>
                                </div>

                                <div className="painter-shop-detail-row">
                                    <span>Category</span>
                                    <strong>{selectedProduct.category || "-"}</strong>
                                </div>

                                <div className="painter-shop-detail-row">
                                    <span>Sub Category</span>
                                    <strong>{selectedProduct.subCategory || "-"}</strong>
                                </div>

                                <div className="painter-shop-detail-row">
                                    <span>Group</span>
                                    <strong>{selectedProduct.group || "-"}</strong>
                                </div>

                                <div className="painter-shop-detail-row">
                                    <span>Brand</span>
                                    <strong>{selectedProduct.brand || "-"}</strong>
                                </div>

                                <div className="painter-shop-detail-row">
                                    <span>Packing Size</span>
                                    <strong>{selectedProduct.packingSize || "-"}</strong>
                                </div>

                                <div className="painter-shop-detail-row">
                                    <span>MRP</span>
                                    <strong>
                                        ₹{Number(selectedProduct.mrp || 0).toLocaleString()}
                                    </strong>
                                </div>

                                <div className="painter-shop-detail-row">
                                    <span>Discount Price</span>
                                    <strong>
                                        ₹{Number(selectedProduct.discountPrice || 0).toLocaleString()}
                                    </strong>
                                </div>

                                <div className="painter-shop-detail-row">
                                    <span>Stock Quantity</span>
                                    <strong>{selectedProduct.stockQuantity ?? 0}</strong>
                                </div>

                                <div className="painter-shop-detail-row">
                                    <span>Status</span>
                                    <strong>{selectedProduct.status || "-"}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Enquiry Modal */}
            {showEnquiryModal && enquiryProduct && (
                <div
                    className="painter-shop-modal-overlay"
                    onClick={() => setShowEnquiryModal(false)}
                >
                    <div
                        className="painter-shop-modal painter-enquiry-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="painter-shop-modal-header">
                            <div>
                                <h2>Product Enquiry</h2>
                                <p>Submit your product requirement</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowEnquiryModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <form
                            className="painter-enquiry-form"
                            onSubmit={handleSubmitEnquiry}
                        >
                            <div className="painter-enquiry-product">
                                <span>Product</span>
                                <strong>{enquiryProduct.productName || "-"}</strong>
                            </div>

                            <div className="painter-form-group">
                                <label htmlFor="enquiry-quantity">
                                    Quantity
                                </label>

                                <input
                                    id="enquiry-quantity"
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="painter-form-group">
                                <label htmlFor="enquiry-message">
                                    Message / Requirement
                                </label>

                                <textarea
                                    id="enquiry-message"
                                    rows="4"
                                    placeholder="Enter your requirement"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="painter-submit-enquiry-btn"
                                disabled={enquiryLoading}
                            >
                                {enquiryLoading
                                    ? "Submitting..."
                                    : "Submit Enquiry"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PainterQuickShop;