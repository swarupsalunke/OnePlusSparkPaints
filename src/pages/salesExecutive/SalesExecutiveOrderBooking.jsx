import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Search, Package, RefreshCw } from "lucide-react";
import "../../css/salesExecutive/SalesExecutiveOrderBooking.css";

const API_BASE_URL = "https://oneplussparkpaintsserver.onrender.com";

const getAuthConfig = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    return { headers: token ? { Authorization: `Bearer ${token}` } : {} };
};

const getList = (data) => {
    if (Array.isArray(data)) return data;
    return data?.users || data?.products || data?.data || [];
};

const getId = (item) => item?._id || item?.id || "";

const SalesExecutiveOrderBooking = () => {
    const [dealers, setDealers] = useState([]);
    const [products, setProducts] = useState([]);
    const [dealer, setDealer] = useState("");
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState([]);
    const [remarks, setRemarks] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [leads, setLeads] = useState([]);
    const [lead, setLead] = useState("");

    const loadData = async () => {
        setLoading(true);
        try {
            const config = getAuthConfig();
            const [dealerRes, productRes, leadRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/users`, config),
                axios.get(`${API_BASE_URL}/api/sales-executive/orders/products`, config),
                axios.get(`${API_BASE_URL}/api/sales-executive/leads`, config),
            ]);

            setDealers(
                getList(dealerRes.data).filter((user) =>
                    String(user.role || user.userRole || user.userType || "")
                        .toUpperCase()
                        .includes("DEALER")
                )
            );

            setProducts(getList(productRes.data));
            setLeads(leadRes.data.leads || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to load order booking data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const filteredProducts = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return products;
        return products.filter((product) =>
            [product.productName, product.sku, product.barcode, product.category, product.brand, product.group]
                .filter(Boolean).some((value) => String(value).toLowerCase().includes(term))
        );
    }, [products, search]);

    const addToCart = (product) => {
        const productId = getId(product);
        const stock = Number(product.stockQuantity || 0);
        if (stock < 1) {
            toast.error("This product is out of stock");
            return;
        }
        setCart((current) => {
            const existing = current.find((item) => item.product === productId);
            if (existing) {
                if (existing.quantity >= stock) {
                    toast.error("You cannot add more than the available stock");
                    return current;
                }
                return current.map((item) => item.product === productId
                    ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...current, {
                product: productId,
                productName: product.productName,
                sku: product.sku,
                unit: product.packingSize || "Unit",
                unitPrice: Number(product.discountPrice ?? product.mrp ?? 0),
                quantity: 1,
                discount: 0,
                stockQuantity: stock,
            }];
        });
    };

    const updateCartItem = (productId, field, value) => {
        setCart((current) => current.map((item) => {
            if (item.product !== productId) return item;
            if (field === "quantity") {
                return { ...item, quantity: Math.max(1, Math.min(item.stockQuantity, Number(value) || 1)) };
            }
            if (field === "discount") {
                const gross = item.unitPrice * item.quantity;
                return { ...item, discount: Math.max(0, Math.min(gross, Number(value) || 0)) };
            }
            return item;
        }));
    };

    const removeCartItem = (productId) =>
        setCart((current) => current.filter((item) => item.product !== productId));

    const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const totalDiscount = cart.reduce((sum, item) => sum + item.discount, 0);
    const totalAmount = subtotal - totalDiscount;


    const submitOrder = async (status) => {
        if (!lead) {
            return toast.error("Please select a lead");
        }

        if (!dealer) {
            return toast.error("Please select a dealer");
        }

        if (!cart.length) {
            return toast.error("Please add at least one product");
        }

        const token =
            localStorage.getItem("token") ||
            localStorage.getItem("authToken");

        if (!token) {
            return toast.error("Login token not found. Please log in again.");
        }

        setSubmitting(true);

        try {
            await axios.post(
                `${API_BASE_URL}/api/sales-executive/orders`,
                {
                    lead,
                    dealer,
                    items: cart.map((item) => ({
                        product: item.product,
                        quantity: item.quantity,
                        unit: item.unit,
                        discount: item.discount,
                    })),
                    remarks,
                    status,
                },
                getAuthConfig()
            );

            toast.success(
                status === "Draft"
                    ? "Order saved as draft"
                    : "Order submitted successfully"
            );

            setCart([]);
            setLead("");
            setDealer("");
            setRemarks("");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to create order"
            );
        } finally {
            setSubmitting(false);
        }
    };


    const formatCurrency = (amount) =>
        `₹${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

    return (
        <div className="se-order-page">
            <div className="se-order-header">
                <div>
                    <h1>Order Booking</h1>
                    <p>Create a new dealer order.</p>
                </div>
                <button type="button" className="se-order-refresh" onClick={loadData} disabled={loading}>
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            <div className="se-order-content">
                <section className="se-order-panel">
                    <div className="se-order-panel-heading">
                        <div><h2>Product Catalogue</h2><p>Select products to add them to your order.</p></div>
                        <span className="se-order-count">{filteredProducts.length} products</span>
                    </div>
                    <div className="se-order-search">
                        <Search size={18} />
                        <input type="search" placeholder="Search product, SKU, brand or category..."
                            value={search} onChange={(event) => setSearch(event.target.value)} />
                    </div>

                    {loading ? <div className="se-order-empty">Loading products...</div>
                        : filteredProducts.length === 0 ? <div className="se-order-empty">No products found.</div>
                            : <div className="se-product-grid">
                                {filteredProducts.map((product) => (
                                    <article className="se-product-card" key={getId(product)}>
                                        <div className="se-product-icon"><Package size={25} /></div>
                                        <div className="se-product-info">
                                            <h3>{product.productName}</h3>
                                            <p>{product.sku || "No SKU"}{product.brand ? ` · ${product.brand}` : ""}</p>
                                            <span>{product.category || product.group || "Product"}</span>
                                        </div>
                                        <div className="se-product-price">
                                            <strong>{formatCurrency(product.discountPrice ?? product.mrp)}</strong>
                                            {product.discountPrice != null && product.mrp != null &&
                                                Number(product.discountPrice) < Number(product.mrp) &&
                                                <del>{formatCurrency(product.mrp)}</del>}
                                            <small>Stock: {product.stockQuantity ?? 0}</small>
                                        </div>
                                        <button type="button" className="se-add-product" onClick={() => addToCart(product)}
                                            disabled={Number(product.stockQuantity || 0) < 1}>
                                            {Number(product.stockQuantity || 0) < 1 ? "Out of stock" : "Add to Order"}
                                        </button>
                                    </article>
                                ))}
                            </div>}
                </section>

                <aside className="se-order-panel se-order-summary-panel">
                    <div className="se-order-panel-heading">
                        <div><h2>Order Details</h2><p>Choose dealer and review items.</p></div>
                        <span className="se-order-count">{cart.length} items</span>
                    </div>


                    <label className="se-order-label" htmlFor="se-lead">
                        Select Lead
                    </label>

                    <select
                        id="se-lead"
                        value={lead}
                        onChange={(event) => setLead(event.target.value)}
                    >
                        <option value="">Choose a lead</option>

                        {leads.map((item) => (
                            <option key={item._id} value={item._id}>
                                {item.customerName} - {item.businessType}
                            </option>
                        ))}
                    </select>

                    {leads.length === 0 && !loading && (
                        <p className="se-order-hint">No leads found.</p>
                    )}


                    <label className="se-order-label" htmlFor="se-dealer">Select Dealer</label>
                    <select id="se-dealer" value={dealer} onChange={(event) => setDealer(event.target.value)}>
                        <option value="">Choose a dealer</option>
                        {dealers.map((item) => <option key={getId(item)} value={getId(item)}>
                            {item.name || item.fullName || item.username || item.email || "Dealer"}
                        </option>)}
                    </select>
                    {dealers.length === 0 && !loading &&
                        <p className="se-order-hint">No dealers found. Check the response and role field from /api/users.</p>}

                    <div className="se-cart-items">
                        {cart.length === 0 ? <div className="se-order-empty">Your order is empty. Add products from the catalogue.</div>
                            : cart.map((item) => <div className="se-cart-item" key={item.product}>
                                <div className="se-cart-item-heading">
                                    <div><strong>{item.productName}</strong>
                                        <small>{item.sku || "No SKU"} · {formatCurrency(item.unitPrice)} / {item.unit}</small>
                                    </div>
                                    <button type="button" className="se-remove-item" onClick={() => removeCartItem(item.product)}>Remove</button>
                                </div>
                                <div className="se-cart-fields">
                                    <label>Quantity<input type="number" min="1" max={item.stockQuantity} value={item.quantity}
                                        onChange={(event) => updateCartItem(item.product, "quantity", event.target.value)} /></label>
                                    <label>Discount (₹)<input type="number" min="0" max={item.unitPrice * item.quantity}
                                        value={item.discount} onChange={(event) => updateCartItem(item.product, "discount", event.target.value)} /></label>
                                </div>
                                <div className="se-cart-line-total">Line total:
                                    <strong>{formatCurrency(item.unitPrice * item.quantity - item.discount)}</strong>
                                </div>
                            </div>)}
                    </div>

                    <label className="se-order-label" htmlFor="se-order-remarks">Remarks (optional)</label>
                    <textarea id="se-order-remarks" rows="3" placeholder="Add order notes..."
                        value={remarks} onChange={(event) => setRemarks(event.target.value)} />

                    <div className="se-order-totals">
                        <div><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
                        <div><span>Total discount</span><strong>- {formatCurrency(totalDiscount)}</strong></div>
                        <div className="se-order-grand-total"><span>Total amount</span><strong>{formatCurrency(totalAmount)}</strong></div>
                    </div>
                    <div className="se-order-actions">
                        <button type="button" className="se-order-draft-btn" onClick={() => submitOrder("Draft")}
                            disabled={submitting || !cart.length}>Save Draft</button>
                        <button type="button" className="se-order-submit-btn" onClick={() => submitOrder("Submitted")}
                            disabled={submitting || !cart.length}>{submitting ? "Submitting..." : "Submit Order"}</button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default SalesExecutiveOrderBooking;
