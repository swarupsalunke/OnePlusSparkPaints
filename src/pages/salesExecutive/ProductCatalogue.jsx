
import { useEffect, useMemo, useState } from "react";
import {
    Search,
    Package,
    ShoppingCart,
    Eye,
    Share2,
    X,
    Plus,
    Minus,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    LoaderCircle,
    PackageCheck,
    IndianRupee,
    ImageOff,
} from "lucide-react";
import "../../css/salesExecutive/ProductCatalogue.css";

const API_BASE_URL = "https://oneplussparkpaintsserver.onrender.com";

const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    "";

const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    });

const getImageUrl = (image) => {
    if (!image) return "";
    if (image.startsWith("http://") || image.startsWith("https://")) {
        return image;
    }
    return `${API_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};

export default function ProductCatalogue() {
    const [products, setProducts] = useState([]);
    const [dealers, setDealers] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [subCategory, setSubCategory] = useState("");
    const [group, setGroup] = useState("");
    const [brand, setBrand] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadingDealers, setLoadingDealers] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [orderProduct, setOrderProduct] = useState(null);
    const [dealerId, setDealerId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [remarks, setRemarks] = useState("");
    const [orderStatus, setOrderStatus] = useState("Submitted");
    const [submitting, setSubmitting] = useState(false);

    const requestHeaders = () => ({
        Authorization: `Bearer ${getToken()}`,
    });

    async function fetchProducts() {
        setLoading(true);
        setError("");

        try {
            const params = new URLSearchParams();

            if (search.trim()) params.set("search", search.trim());
            if (category) params.set("category", category);
            if (group) params.set("group", group);
            if (brand) params.set("brand", brand);

            const response = await fetch(
                `${API_BASE_URL}/api/sales-executive/orders/products?${params}`,
                { headers: requestHeaders() }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to fetch products.");
            }

            setProducts(data.products || []);
        } catch (err) {
            setProducts([]);
            setError(err.message || "Unable to fetch products.");
        } finally {
            setLoading(false);
        }
    }

    async function fetchDealers() {
        setLoadingDealers(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/users`, {
                headers: requestHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to load dealers. Check access to the users API."
                );
            }

            const users = data.users || [];

            const activeDealers = users.filter(
                (user) =>
                    user.role === "DEALER" &&
                    user.status === "ACTIVE" &&
                    !user.isRegistrationRequest &&
                    user._id
            );

            setDealers(activeDealers);
        } catch (err) {
            setError(err.message || "Unable to load dealers.");
            setDealers([]);
        } finally {
            setLoadingDealers(false);
        }
    }

    useEffect(() => {
        fetchProducts();
    }, [category, group, brand]);

    useEffect(() => {
        fetchDealers();
    }, []);

    const categories = useMemo(
        () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
        [products]
    );

    const subCategories = useMemo(
        () =>
            [
                ...new Set(
                    products
                        .filter((p) => !category || p.category === category)
                        .map((p) => p.subCategory)
                        .filter(Boolean)
                ),
            ].sort(),
        [products, category]
    );

    const groups = useMemo(
        () => [...new Set(products.map((p) => p.group).filter(Boolean))].sort(),
        [products]
    );

    const brands = useMemo(
        () => [...new Set(products.map((p) => p.brand).filter(Boolean))].sort(),
        [products]
    );

    const filteredProducts = useMemo(
        () =>
            products.filter(
                (product) =>
                    (!subCategory || product.subCategory === subCategory)
            ),
        [products, subCategory]
    );

    function resetFilters() {
        setSearch("");
        setCategory("");
        setSubCategory("");
        setGroup("");
        setBrand("");
    }

    function startOrder(product) {
        setOrderProduct(product);
        setSelectedProduct(null);
        setDealerId("");
        setQuantity(1);
        setRemarks("");
        setOrderStatus("Submitted");
        setError("");
        setNotice("");
    }

    async function submitOrder(event) {
        event.preventDefault();
        setError("");
        setNotice("");

        if (!orderProduct?._id) {
            setError("Please select a product.");
            return;
        }

        if (!dealerId) {
            setError("Please select a dealer.");
            return;
        }

        const requestedQuantity = Number(quantity);

        if (
            !Number.isInteger(requestedQuantity) ||
            requestedQuantity < 1
        ) {
            setError("Quantity must be a whole number greater than zero.");
            return;
        }

        if (requestedQuantity > Number(orderProduct.stockQuantity || 0)) {
            setError("Requested quantity exceeds available stock.");
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/sales-executive/orders`,
                {
                    method: "POST",
                    headers: {
                        ...requestHeaders(),
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        dealer: dealerId,
                        items: [
                            {
                                product: orderProduct._id,
                                quantity: requestedQuantity,
                                unit: orderProduct.packingSize || "Unit",
                                discount: 0,
                            },
                        ],
                        remarks: remarks.trim(),
                        status: orderStatus,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || "Order creation failed.");
            }

            setNotice(
                `Order ${data.order?.orderId || ""} created successfully.`.trim()
            );
            setOrderProduct(null);
            fetchProducts();
        } catch (err) {
            setError(err.message || "Unable to create order.");
        } finally {
            setSubmitting(false);
        }
    }

    async function shareProduct(product) {
        const text = [
            product.productName,
            `SKU: ${product.sku || "—"}`,
            `Brand: ${product.brand || "—"}`,
            `Packing: ${product.packingSize || "—"}`,
            `MRP: ${formatPrice(product.mrp)}`,
            `Price: ${formatPrice(product.discountPrice)}`,
            `Availability: ${product.status === "ACTIVE" && Number(product.stockQuantity) > 0
                ? "In stock"
                : "Currently unavailable"
            }`,
        ].join("\n");

        try {
            if (navigator.share) {
                await navigator.share({
                    title: product.productName,
                    text,
                });
            } else if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                setNotice("Product details copied. You can now share them.");
            } else {
                setNotice("Sharing is not supported in this browser.");
            }
        } catch (err) {
            if (err.name !== "AbortError") {
                setError("Unable to share product details.");
            }
        }
    }

    return (
        <div className="product-catalogue-page">
            <header className="pc-header">
                <div>
                    <h1>Product Catalogue</h1>
                    <p>Explore products, check prices and availability, and create orders.</p>
                </div>

                <div className="pc-product-count">
                    <Package size={19} />
                    <span>{filteredProducts.length} Products</span>
                </div>
            </header>

            {error && (
                <div className="pc-alert pc-alert-error" role="alert">
                    <AlertCircle size={19} />
                    <span>{error}</span>
                    <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
                        <X size={17} />
                    </button>
                </div>
            )}

            {notice && (
                <div className="pc-alert pc-alert-success" role="status">
                    <CheckCircle2 size={19} />
                    <span>{notice}</span>
                    <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message">
                        <X size={17} />
                    </button>
                </div>
            )}

            <section className="pc-filter-panel">
                <div className="pc-search">
                    <Search size={19} />
                    <input
                        type="search"
                        placeholder="Search product, SKU or barcode..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") fetchProducts();
                        }}
                    />
                    <button type="button" onClick={fetchProducts}>Search</button>
                </div>

                <div className="pc-filters">
                    <select
                        aria-label="Category"
                        value={category}
                        onChange={(event) => {
                            setCategory(event.target.value);
                            setSubCategory("");
                        }}
                    >
                        <option value="">All Categories</option>
                        {categories.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>

                    <select
                        aria-label="Subcategory"
                        value={subCategory}
                        onChange={(event) => setSubCategory(event.target.value)}
                    >
                        <option value="">All Subcategories</option>
                        {subCategories.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>

                    <select
                        aria-label="Product group"
                        value={group}
                        onChange={(event) => setGroup(event.target.value)}
                    >
                        <option value="">All Groups</option>
                        {groups.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>

                    <select
                        aria-label="Brand"
                        value={brand}
                        onChange={(event) => setBrand(event.target.value)}
                    >
                        <option value="">All Brands</option>
                        {brands.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>

                    <button type="button" className="pc-reset-btn" onClick={resetFilters}>
                        <RefreshCw size={16} />
                        Reset
                    </button>
                </div>
            </section>

            {loading ? (
                <div className="pc-state">
                    <LoaderCircle className="pc-spinner" size={32} />
                    <p>Loading product catalogue...</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="pc-state pc-empty">
                    <Package size={42} />
                    <h3>No products found</h3>
                    <p>Try changing your search or filters.</p>
                    <button type="button" onClick={resetFilters}>Clear Filters</button>
                </div>
            ) : (
                <section className="pc-product-grid">
                    {filteredProducts.map((product) => {
                        const inStock =
                            product.status === "ACTIVE" &&
                            Number(product.stockQuantity) > 0;

                        return (
                            <article className="pc-product-card" key={product._id}>
                                <div className="pc-product-image">
                                    {product.image ? (
                                        <img
                                            src={getImageUrl(product.image)}
                                            alt={product.productName}
                                            loading="lazy"
                                            onError={(event) => {
                                                event.currentTarget.style.display = "none";
                                            }}
                                        />
                                    ) : (
                                        <div className="pc-image-placeholder">
                                            <ImageOff size={36} />
                                            <span>No image available</span>
                                        </div>
                                    )}

                                    <span className={`pc-stock-badge ${inStock ? "in-stock" : "out-stock"}`}>
                                        {inStock ? "In Stock" : "Out of Stock"}
                                    </span>
                                </div>

                                <div className="pc-product-content">
                                    <div className="pc-product-meta">
                                        <span>{product.brand || "—"}</span>
                                        <span>SKU: {product.sku || "—"}</span>
                                    </div>

                                    <h3>{product.productName}</h3>
                                    <p className="pc-product-category">
                                        {[product.category, product.subCategory, product.group]
                                            .filter(Boolean)
                                            .join(" / ")}
                                    </p>

                                    <div className="pc-packing">
                                        Packing: <strong>{product.packingSize || "—"}</strong>
                                    </div>

                                    <div className="pc-price-row">
                                        <strong>{formatPrice(product.discountPrice)}</strong>
                                        {Number(product.mrp) > Number(product.discountPrice) && (
                                            <del>{formatPrice(product.mrp)}</del>
                                        )}
                                    </div>

                                    <p className="pc-stock-quantity">
                                        <PackageCheck size={16} />
                                        Available quantity: {Number(product.stockQuantity || 0)}
                                    </p>

                                    <div className="pc-card-actions">
                                        <button
                                            type="button"
                                            className="pc-details-btn"
                                            onClick={() => setSelectedProduct(product)}
                                        >
                                            <Eye size={17} />
                                            Details
                                        </button>

                                        <button
                                            type="button"
                                            className="pc-share-btn"
                                            onClick={() => shareProduct(product)}
                                            aria-label={`Share ${product.productName}`}
                                        >
                                            <Share2 size={17} />
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        className="pc-add-order-btn"
                                        onClick={() => startOrder(product)}
                                        disabled={!inStock}
                                    >
                                        <ShoppingCart size={18} />
                                        Add to Order
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </section>
            )}

            {selectedProduct && (
                <div className="pc-modal-backdrop" onClick={() => setSelectedProduct(null)}>
                    <section
                        className="pc-modal pc-product-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="pc-detail-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="pc-modal-header">
                            <div>
                                <span className="pc-eyebrow">PRODUCT DETAILS</span>
                                <h2 id="pc-detail-title">{selectedProduct.productName}</h2>
                            </div>
                            <button type="button" className="pc-close-btn" onClick={() => setSelectedProduct(null)} aria-label="Close">
                                <X size={21} />
                            </button>
                        </div>

                        <div className="pc-detail-layout">
                            <div className="pc-detail-image">
                                {selectedProduct.image ? (
                                    <img
                                        src={getImageUrl(selectedProduct.image)}
                                        alt={selectedProduct.productName}
                                    />
                                ) : (
                                    <ImageOff size={42} />
                                )}
                            </div>

                            <div className="pc-detail-info">
                                {[
                                    ["SKU", selectedProduct.sku],
                                    ["Barcode", selectedProduct.barcode],
                                    ["Brand", selectedProduct.brand],
                                    ["Category", selectedProduct.category],
                                    ["Subcategory", selectedProduct.subCategory],
                                    ["Group", selectedProduct.group],
                                    ["Packing Size", selectedProduct.packingSize],
                                    ["MRP", formatPrice(selectedProduct.mrp)],
                                    ["Selling Price", formatPrice(selectedProduct.discountPrice)],
                                    ["Availability", Number(selectedProduct.stockQuantity) > 0 ? "In Stock" : "Out of Stock"],
                                    ["Available Quantity", selectedProduct.stockQuantity],
                                ].map(([label, value]) => (
                                    <div className="pc-detail-row" key={label}>
                                        <span>{label}</span>
                                        <strong>{value === undefined || value === "" ? "—" : value}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pc-modal-footer">
                            <button
                                type="button"
                                className="pc-share-btn pc-share-detail"
                                onClick={() => shareProduct(selectedProduct)}
                            >
                                <Share2 size={17} /> Share Details
                            </button>
                            <button
                                type="button"
                                className="pc-add-order-btn"
                                disabled={
                                    selectedProduct.status !== "ACTIVE" ||
                                    Number(selectedProduct.stockQuantity) <= 0
                                }
                                onClick={() => startOrder(selectedProduct)}
                            >
                                <ShoppingCart size={18} /> Add to Order
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {orderProduct && (
                <div className="pc-modal-backdrop" onClick={() => !submitting && setOrderProduct(null)}>
                    <section
                        className="pc-modal pc-order-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="pc-order-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="pc-modal-header">
                            <div>
                                <span className="pc-eyebrow">CREATE SALES ORDER</span>
                                <h2 id="pc-order-title">Add to Order</h2>
                            </div>
                            <button
                                type="button"
                                className="pc-close-btn"
                                onClick={() => setOrderProduct(null)}
                                disabled={submitting}
                                aria-label="Close"
                            >
                                <X size={21} />
                            </button>
                        </div>

                        <div className="pc-order-product">
                            {orderProduct.image ? (
                                <img src={getImageUrl(orderProduct.image)} alt={orderProduct.productName} />
                            ) : (
                                <div className="pc-order-image-placeholder"><Package size={27} /></div>
                            )}
                            <div>
                                <h3>{orderProduct.productName}</h3>
                                <p>SKU: {orderProduct.sku || "—"} · {orderProduct.packingSize || "Unit"}</p>
                                <strong>{formatPrice(orderProduct.discountPrice)} / unit</strong>
                                <span>Stock: {orderProduct.stockQuantity}</span>
                            </div>
                        </div>

                        <form onSubmit={submitOrder}>
                            <label className="pc-form-label" htmlFor="pc-dealer">
                                Select Dealer <span>*</span>
                            </label>
                            <select
                                id="pc-dealer"
                                className="pc-form-control"
                                value={dealerId}
                                onChange={(event) => setDealerId(event.target.value)}
                                required
                                disabled={loadingDealers || submitting}
                            >
                                <option value="">
                                    {loadingDealers ? "Loading dealers..." : "Select a dealer"}
                                </option>
                                {dealers.map((dealer) => (
                                    <option key={dealer._id} value={dealer._id}>
                                        {dealer.name} ({dealer.userId || dealer.mobile})
                                    </option>
                                ))}
                            </select>

                            {!loadingDealers && dealers.length === 0 && (
                                <p className="pc-field-help">
                                    No active Dealer accounts found. Check the users API response and permissions.
                                </p>
                            )}

                            <label className="pc-form-label" htmlFor="pc-quantity">
                                Quantity <span>*</span>
                            </label>
                            <div className="pc-quantity-control">
                                <button
                                    type="button"
                                    onClick={() => setQuantity((value) => Math.max(1, Number(value) - 1))}
                                    disabled={Number(quantity) <= 1 || submitting}
                                    aria-label="Decrease quantity"
                                >
                                    <Minus size={17} />
                                </button>
                                <input
                                    id="pc-quantity"
                                    type="number"
                                    min="1"
                                    max={Number(orderProduct.stockQuantity || 0)}
                                    step="1"
                                    value={quantity}
                                    onChange={(event) => setQuantity(event.target.value)}
                                    required
                                    disabled={submitting}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setQuantity((value) =>
                                            Math.min(
                                                Number(orderProduct.stockQuantity || 0),
                                                Number(value || 0) + 1
                                            )
                                        )
                                    }
                                    disabled={
                                        Number(quantity) >= Number(orderProduct.stockQuantity || 0) ||
                                        submitting
                                    }
                                    aria-label="Increase quantity"
                                >
                                    <Plus size={17} />
                                </button>
                            </div>

                            <label className="pc-form-label" htmlFor="pc-status">
                                Order Status
                            </label>
                            <select
                                id="pc-status"
                                className="pc-form-control"
                                value={orderStatus}
                                onChange={(event) => setOrderStatus(event.target.value)}
                                disabled={submitting}
                            >
                                <option value="Draft">Save as Draft</option>
                                <option value="Submitted">Submit Order</option>
                            </select>

                            <label className="pc-form-label" htmlFor="pc-remarks">
                                Remarks (Optional)
                            </label>
                            <textarea
                                id="pc-remarks"
                                className="pc-form-control pc-remarks"
                                rows={3}
                                placeholder="Add order remarks..."
                                value={remarks}
                                onChange={(event) => setRemarks(event.target.value)}
                                maxLength={1000}
                                disabled={submitting}
                            />

                            <div className="pc-order-total">
                                <span>Estimated Total</span>
                                <strong>
                                    <IndianRupee size={17} />
                                    {(
                                        Number(orderProduct.discountPrice || 0) *
                                        Math.max(0, Number(quantity) || 0)
                                    ).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                                </strong>
                            </div>

                            <p className="pc-field-help">
                                Final pricing and stock are validated by the server when the order is submitted.
                            </p>

                            <div className="pc-modal-footer">
                                <button
                                    type="button"
                                    className="pc-cancel-btn"
                                    onClick={() => setOrderProduct(null)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="pc-add-order-btn"
                                    disabled={submitting || loadingDealers || dealers.length === 0}
                                >
                                    {submitting ? (
                                        <>
                                            <LoaderCircle className="pc-spinner" size={18} />
                                            Creating Order...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart size={18} />
                                            {orderStatus === "Draft" ? "Save Draft" : "Submit Order"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </div>
    );
}
