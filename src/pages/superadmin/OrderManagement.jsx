import { useEffect, useState } from "react";
import axios from "axios";
import {
    Search,
    Eye,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ShoppingCart,
    UserRound,
    Truck,
    CheckCircle,
    XCircle,
    PackageCheck,
    Undo2,
    FileText,
    Navigation,
    Package,
    Filter,
    Download,
    Upload,
} from "lucide-react";

import "../../css/superadmin/orderManagement.css";

const ORDERS_PER_PAGE = 10;

const EMPTY_ORDER_FORM = {
    orderNumber: "",
    orderDate: "",
    dealer: "",
    salesExecutive: "",
    orderType: "Dealer Order",
    product: "",
    quantity: 1,
    amount: "",
    status: "New",
    paymentStatus: "Pending",
};

const OrderManagement = () => {
    //     =
    // DATA STATE
    //     =
    const [orders, setOrders] = useState([]);
    const [dealers, setDealers] = useState([]);
    const [salesExecutives, setSalesExecutives] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    //     =
    // FILTER STATE
    //     =
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [orderType, setOrderType] = useState("");
    const [dealer, setDealer] = useState("");
    const [salesExecutive, setSalesExecutive] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    //     
    // CREATE ORDER STATE
    //     
    const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
    const [creatingOrder, setCreatingOrder] = useState(false);
    const [orderForm, setOrderForm] = useState(EMPTY_ORDER_FORM);

    //     
    // VIEW ORDER STATE
    //     
    const [viewOrder, setViewOrder] = useState(null);

    //     
    // EDIT ORDER STATE
    //     
    const [showEditOrderModal, setShowEditOrderModal] = useState(false);
    const [updatingOrder, setUpdatingOrder] = useState(false);
    const [editOrderId, setEditOrderId] = useState(null);
    const [editOrderForm, setEditOrderForm] = useState(EMPTY_ORDER_FORM);

    //     
    // PAGINATION / SELECTION
    //     
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOrders, setSelectedOrders] = useState([]);

    //     
    // FETCH ORDERS
    //     
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const response = await axios.get("https://oneplussparkpaintsserver.onrender.com/api/orders", {
                headers: { Authorization: `Bearer ${token}` },
            });

            setOrders(Array.isArray(response.data.orders) ? response.data.orders : []);
        } catch (error) {
            console.error("Fetch orders error:", error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    //     
    // FETCH USERS (Dealers + Sales Executives come from User Management)
    //     
    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get("https://oneplussparkpaintsserver.onrender.com/api/users", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const userList = Array.isArray(response.data.users) ? response.data.users : [];

            const dealerList = userList.filter(
                (user) => String(user.role || "").toLowerCase().trim() === "dealer"
            );

            const salesExecutiveList = userList.filter((user) => {
                const role = String(user.role || "")
                    .toLowerCase()
                    .trim()
                    .replace(/[-_]/g, " ");
                return role === "sales executive";
            });

            setDealers(dealerList);
            setSalesExecutives(salesExecutiveList);
        } catch (error) {
            console.error("Fetch users error:", error);
            setDealers([]);
            setSalesExecutives([]);
        }
    };

    //     
    // FETCH PRODUCTS
    //     
    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get("https://oneplussparkpaintsserver.onrender.com/api/products", {
                headers: { Authorization: `Bearer ${token}` },
            });

            setProducts(Array.isArray(response.data.products) ? response.data.products : []);
        } catch (error) {
            console.error("Fetch products error:", error);
            setProducts([]);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchOrders();
        fetchProducts();
    }, []);

    //     
    // ORDER STATS
    //     
    const totalOrders = orders.length;
    const newOrders = orders.filter((order) => order.status === "New").length;
    const processingOrders = orders.filter((order) => order.status === "Processing").length;
    const approvedOrders = orders.filter((order) => order.status === "Approved").length;
    const dispatchedOrders = orders.filter((order) => order.status === "Dispatched").length;
    const deliveredOrders = orders.filter((order) => order.status === "Delivered").length;
    const cancelledOrders = orders.filter((order) => order.status === "Cancelled").length;

    //     
    // FILTER ORDERS
    //     
    const filteredOrders = orders.filter((order) => {
        const searchValue = search.toLowerCase().trim();

        const matchesSearch =
            !searchValue ||
            order.orderNumber?.toLowerCase().includes(searchValue) ||
            order.dealer?.name?.toLowerCase().includes(searchValue) ||
            order.dealer?.email?.toLowerCase().includes(searchValue) ||
            order.salesExecutive?.name?.toLowerCase().includes(searchValue);

        const matchesStatus = !status || order.status === status;
        const matchesOrderType = !orderType || order.orderType === orderType;
        const matchesDealer = !dealer || order.dealer?._id === dealer;
        const matchesSalesExecutive = !salesExecutive || order.salesExecutive?._id === salesExecutive;

        const orderDate = new Date(order.orderDate);
        const matchesStartDate = !startDate || orderDate >= new Date(`${startDate}T00:00:00`);
        const matchesEndDate = !endDate || orderDate <= new Date(`${endDate}T23:59:59`);

        return (
            matchesSearch &&
            matchesStatus &&
            matchesOrderType &&
            matchesDealer &&
            matchesSalesExecutive &&
            matchesStartDate &&
            matchesEndDate
        );
    });

    //     
    // PAGINATION
    //     
    const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
    const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
    const currentOrders = filteredOrders.slice(startIndex, startIndex + ORDERS_PER_PAGE);

    // Reset page whenever a filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search, status, orderType, dealer, salesExecutive, startDate, endDate]);

    //     
    // STATUS CLASS
    //     
    const getStatusClass = (orderStatus) => {
        switch (orderStatus) {
            case "Draft":
                return "order-status draft";
            case "New":
                return "order-status new";
            case "Processing":
                return "order-status processing";
            case "Approved":
                return "order-status approved";
            case "Dispatched":
                return "order-status dispatched";
            case "Delivered":
                return "order-status delivered";
            case "Cancelled":
                return "order-status cancelled";
            default:
                return "order-status";
        }
    };

    //     
    // DELETE ORDER
    //     
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this order?");
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("token");

            await axios.delete(`https://oneplussparkpaintsserver.onrender.com/api/orders/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("Order deleted successfully");

            setSelectedOrders((prev) => prev.filter((orderId) => orderId !== id));
            fetchOrders();
        } catch (error) {
            console.error("Delete order error:", error);
            alert(error.response?.data?.message || "Failed to delete order");
        }
    };

    //     
    // ORDER FOR HELPERS
    //     
    const handleOrderFormChange = (e) => {
        const { name, value } = e.target;
        setOrderForm((prev) => ({ ...prev, [name]: value }));
    };

    const selectedProduct = products.find((product) => product._id === orderForm.product);
    const productPrice = Number(selectedProduct?.price || selectedProduct?.sellingPrice || 0);
    const calculatedAmount = productPrice * Number(orderForm.quantity || 0);

    const openCreateOrderModal = () => {
        const nextOrderNumber = `ORD-${String(orders.length + 1).padStart(3, "0")}`;

        setOrderForm({
            ...EMPTY_ORDER_FORM,
            orderNumber: nextOrderNumber,
            orderDate: new Date().toISOString(),
        });

        setShowCreateOrderModal(true);
    };

    const closeCreateOrderModal = () => {
        if (creatingOrder) return;

        setShowCreateOrderModal(false);
        setOrderForm(EMPTY_ORDER_FORM);
    };

    //     
    // CREATE ORDER
    //     
    const handleCreateOrder = async (e) => {
        e.preventDefault();

        if (!orderForm.dealer) return alert("Please select dealer");
        if (!orderForm.salesExecutive) return alert("Please select sales executive");
        if (!orderForm.product) return alert("Please select product");
        if (!orderForm.quantity || Number(orderForm.quantity) <= 0) return alert("Please enter valid quantity");
        if (!orderForm.amount && calculatedAmount <= 0) return alert("Please enter valid amount");

        try {
            setCreatingOrder(true);
            const token = localStorage.getItem("token");
            const finalAmount = Number(orderForm.amount || calculatedAmount);

            const payload = {
                dealer: orderForm.dealer,
                salesExecutive: orderForm.salesExecutive,
                orderType: orderForm.orderType,
                items: [
                    {
                        product: orderForm.product,
                        quantity: Number(orderForm.quantity),
                        price: productPrice,
                        total: finalAmount,
                    },
                ],
                totalAmount: finalAmount,
                status: orderForm.status,
                paymentStatus: orderForm.paymentStatus,
            };

            await axios.post("https://oneplussparkpaintsserver.onrender.com/api/orders", payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("Order created successfully");
            closeCreateOrderModal();
            await fetchOrders();
        } catch (error) {
            console.error("Create order error:", error);
            alert(error.response?.data?.message || "Failed to create order");
        } finally {
            setCreatingOrder(false);
        }
    };

    //     
    // VIEW ORDER
    //     
    const openViewOrderModal = (order) => {
        setViewOrder(order);
    };

    const closeViewOrderModal = () => {
        setViewOrder(null);
    };

    //     
    // EDIT ORDER
    //     
    const openEditOrderModal = (order) => {
        setEditOrderId(order._id);

        setEditOrderForm({
            orderNumber: order.orderNumber || "",
            orderDate: order.orderDate || "",
            dealer: order.dealer?._id || "",
            salesExecutive: order.salesExecutive?._id || "",
            orderType: order.orderType || "Dealer Order",
            product: order.items?.[0]?.product?._id || "",
            quantity: order.items?.[0]?.quantity || 1,
            amount: order.totalAmount || "",
            status: order.status || "New",
            paymentStatus: order.paymentStatus || "Pending",
        });

        setShowEditOrderModal(true);
    };

    const closeEditOrderModal = () => {
        if (updatingOrder) return;

        setShowEditOrderModal(false);
        setEditOrderId(null);
        setEditOrderForm(EMPTY_ORDER_FORM);
    };

    const handleEditOrderFormChange = (e) => {
        const { name, value } = e.target;
        setEditOrderForm((prev) => ({ ...prev, [name]: value }));
    };

    const editSelectedProduct = products.find((product) => product._id === editOrderForm.product);
    const editProductPrice = Number(editSelectedProduct?.price || editSelectedProduct?.sellingPrice || 0);
    const editCalculatedAmount = editProductPrice * Number(editOrderForm.quantity || 0);

    const handleUpdateOrder = async (e) => {
        e.preventDefault();

        if (!editOrderForm.dealer) return alert("Please select dealer");
        if (!editOrderForm.salesExecutive) return alert("Please select sales executive");
        if (!editOrderForm.product) return alert("Please select product");
        if (!editOrderForm.quantity || Number(editOrderForm.quantity) <= 0)
            return alert("Please enter valid quantity");
        if (!editOrderForm.amount && editCalculatedAmount <= 0) return alert("Please enter valid amount");

        try {
            setUpdatingOrder(true);
            const token = localStorage.getItem("token");

            const finalAmount = Number(editOrderForm.amount || editCalculatedAmount);

            const payload = {
                dealer: editOrderForm.dealer,
                salesExecutive: editOrderForm.salesExecutive,
                orderType: editOrderForm.orderType,
                items: [
                    {
                        product: editOrderForm.product,
                        quantity: Number(editOrderForm.quantity),
                        price: editProductPrice,
                        total: finalAmount,
                    },
                ],
                totalAmount: finalAmount,
                status: editOrderForm.status,
                paymentStatus: editOrderForm.paymentStatus,
            };

            await axios.put(`https://oneplussparkpaintsserver.onrender.com/api/orders/${editOrderId}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("Order updated successfully");
            closeEditOrderModal();
            await fetchOrders();
        } catch (error) {
            console.error("Update order error:", error);
            alert(error.response?.data?.message || "Failed to update order");
        } finally {
            setUpdatingOrder(false);
        }
    };

    //     
    // DERIVED LISTS FOR FILTER DROPDOWNS
    //     
    const dealerOptions = [
        ...new Map(
            orders.filter((order) => order.dealer).map((order) => [order.dealer._id, order.dealer])
        ).values(),
    ];

    const salesExecutiveOptions = [
        ...new Map(
            orders
                .filter((order) => order.salesExecutive)
                .map((order) => [order.salesExecutive._id, order.salesExecutive])
        ).values(),
    ];

    //     
    // TOP SELLING PRODUCTS (derived from orders)
    //     
    const topProducts = (() => {
        const productMap = {};

        orders.forEach((order) => {
            order.items?.forEach((item) => {
                const productId = item.product?._id || item.product?.sku || "unknown";
                const productName =
                    item.product?.name || item.product?.productName || item.product?.sku || "Product";

                if (!productMap[productId]) {
                    productMap[productId] = { name: productName, quantity: 0 };
                }

                productMap[productId].quantity += Number(item.quantity || 0);
            });
        });

        return Object.values(productMap)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
    })();

    //     
    // RECENT ORDERS (derived from orders)
    //     
    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    //     
    // ORDER SUMMARY (this month donut)
    //     
    const statusSummary = {
        New: newOrders,
        Processing: processingOrders,
        Approved: approvedOrders,
        Dispatched: dispatchedOrders,
        Delivered: deliveredOrders,
        Cancelled: cancelledOrders,
    };

    const summaryTotal = Object.values(statusSummary).reduce((sum, value) => sum + value, 0);

    const summaryItems = [
        { label: "New", value: statusSummary.New, className: "new" },
        { label: "Processing", value: statusSummary.Processing, className: "processing" },
        { label: "Approved", value: statusSummary.Approved, className: "approved" },
        { label: "Dispatched", value: statusSummary.Dispatched, className: "dispatched" },
        { label: "Delivered", value: statusSummary.Delivered, className: "delivered" },
        { label: "Cancelled", value: statusSummary.Cancelled, className: "cancelled" },
    ].map((item) => ({
        ...item,
        percentage: summaryTotal > 0 ? (item.value / summaryTotal) * 100 : 0,
    }));

    const donutColors = {
        new: "#1570ef",
        processing: "#f79009",
        approved: "#12b8a6",
        dispatched: "#7f56d9",
        delivered: "#12b76a",
        cancelled: "#f04438",
    };

    let cumulativePercentage = 0;
    const donutStops = summaryItems
        .map((item) => {
            const start = cumulativePercentage;
            const end = cumulativePercentage + item.percentage;
            cumulativePercentage = end;
            return `${donutColors[item.className]} ${start}% ${end}%`;
        })
        .join(", ");

    const donutStyle = { background: `conic-gradient(${donutStops})` };

    return (
        <div className="order-management-page">
            {/*                HEADER            */}
            <div className="order-management-header">
                <div>
                    <h1>Order Management</h1>
                    <p>Manage and track dealer orders</p>
                </div>

                <div className="order-management-actions">
                    <button type="button" className="order-header-btn">
                        <Upload size={15} />
                        <span>Import</span>
                    </button>

                    <button type="button" className="order-header-btn">
                        <Download size={15} />
                        <span>Export</span>
                    </button>

                    <button
                        type="button"
                        className="order-header-btn create-order-btn"
                        onClick={openCreateOrderModal}
                    >
                        + Create Order
                    </button>
                </div>
            </div>

            {/*               ORDER SUMMARY CARDS                */}
            <section className="order-stats-grid">
                <div className="order-stat-card">
                    <div className="order-stat-icon total">
                        <ShoppingCart size={20} />
                    </div>
                    <div className="order-stat-content">
                        <span>Total Orders</span>
                        <strong>{totalOrders}</strong>
                        <small className="stat-neutral">Current orders</small>
                    </div>
                </div>

                <div className="order-stat-card">
                    <div className="order-stat-icon new">
                        <PackageCheck size={20} />
                    </div>
                    <div className="order-stat-content">
                        <span>New Orders</span>
                        <strong>{newOrders}</strong>
                        <small className="stat-positive">Current status</small>
                    </div>
                </div>

                <div className="order-stat-card">
                    <div className="order-stat-icon processing">
                        <UserRound size={20} />
                    </div>
                    <div className="order-stat-content">
                        <span>Processing</span>
                        <strong>{processingOrders}</strong>
                        <small className="stat-neutral">Current status</small>
                    </div>
                </div>

                <div className="order-stat-card">
                    <div className="order-stat-icon dispatched">
                        <Truck size={20} />
                    </div>
                    <div className="order-stat-content">
                        <span>Dispatched</span>
                        <strong>{dispatchedOrders}</strong>
                        <small className="stat-neutral">Current status</small>
                    </div>
                </div>

                <div className="order-stat-card">
                    <div className="order-stat-icon delivered">
                        <CheckCircle size={20} />
                    </div>
                    <div className="order-stat-content">
                        <span>Delivered</span>
                        <strong>{deliveredOrders}</strong>
                        <small className="stat-positive">Current status</small>
                    </div>
                </div>

                <div className="order-stat-card">
                    <div className="order-stat-icon cancelled">
                        <XCircle size={20} />
                    </div>
                    <div className="order-stat-content">
                        <span>Cancelled</span>
                        <strong>{cancelledOrders}</strong>
                        <small className="stat-negative">Current status</small>
                    </div>
                </div>
            </section>

            {/*                     SEARCH & FILTERS                */}
            <section className="order-filter-card">
                <div className="order-search-box">
                    <Search size={17} />
                    <input
                        type="text"
                        placeholder="Search by order no., dealer, invoice..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="order-filter-field">
                    <label>Order Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="Draft">Draft</option>
                        <option value="New">New</option>
                        <option value="Processing">Processing</option>
                        <option value="Approved">Approved</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="order-filter-field">
                    <label>Order Type</label>
                    <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
                        <option value="">All Types</option>
                        <option value="Dealer Order">Dealer Order</option>
                        <option value="Shop Order">Shop Order</option>
                    </select>
                </div>

                <div className="order-filter-field">
                    <label>Dealer / Shop</label>
                    <select value={dealer} onChange={(e) => setDealer(e.target.value)}>
                        <option value="">All Dealers</option>
                        {dealerOptions.map((item) => (
                            <option key={item._id} value={item._id}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="order-filter-field">
                    <label>Sales Executive</label>
                    <select value={salesExecutive} onChange={(e) => setSalesExecutive(e.target.value)}>
                        <option value="">All Executives</option>
                        {salesExecutiveOptions.map((item) => (
                            <option key={item._id} value={item._id}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="order-date-filter">
                    <label>Date Range</label>
                    <div className="order-date-inputs">
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        <span>-</span>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                </div>

                <button type="button" className="order-filter-button">
                    <Filter size={16} />
                    Filters
                </button>

                <button
                    type="button"
                    className="order-reset-button"
                    onClick={() => {
                        setSearch("");
                        setStatus("");
                        setOrderType("");
                        setDealer("");
                        setSalesExecutive("");
                        setStartDate("");
                        setEndDate("");
                    }}
                >
                    Reset
                </button>
            </section>

            {/*                 ORDER LIST             */}
            <section className="order-list-card">
                <div className="order-list-header">
                    <h3>Order Status Overview</h3>

                    <div className="order-status-overview">
                        <div className="status-overview-card">
                            <div className="status-overview-icon new">
                                <ShoppingCart size={20} />
                            </div>
                            <div className="status-overview-content">
                                <strong>{newOrders}</strong>
                                <span>New</span>
                            </div>
                        </div>

                        <ChevronRight className="status-overview-arrow" size={22} />

                        <div className="status-overview-card">
                            <div className="status-overview-icon processing">
                                <PackageCheck size={20} />
                            </div>
                            <div className="status-overview-content">
                                <strong>{processingOrders}</strong>
                                <span>Processing</span>
                            </div>
                        </div>

                        <ChevronRight className="status-overview-arrow" size={22} />

                        <div className="status-overview-card">
                            <div className="status-overview-icon approved">
                                <CheckCircle size={20} />
                            </div>
                            <div className="status-overview-content">
                                <strong>{approvedOrders}</strong>
                                <span>Approved</span>
                            </div>
                        </div>

                        <ChevronRight className="status-overview-arrow" size={22} />

                        <div className="status-overview-card">
                            <div className="status-overview-icon dispatched">
                                <Truck size={20} />
                            </div>
                            <div className="status-overview-content">
                                <strong>{dispatchedOrders}</strong>
                                <span>Dispatched</span>
                            </div>
                        </div>

                        <ChevronRight className="status-overview-arrow" size={22} />

                        <div className="status-overview-card">
                            <div className="status-overview-icon delivered">
                                <CheckCircle size={20} />
                            </div>
                            <div className="status-overview-content">
                                <strong>{deliveredOrders}</strong>
                                <span>Delivered</span>
                            </div>
                        </div>

                        <ChevronRight className="status-overview-arrow" size={22} />

                        <div className="status-overview-card">
                            <div className="status-overview-icon cancelled">
                                <XCircle size={20} />
                            </div>
                            <div className="status-overview-content">
                                <strong>{cancelledOrders}</strong>
                                <span>Cancelled</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="order-table-wrapper">
                    <table className="order-table">
                        <thead>
                            <tr>
                                <th className="checkbox-column">
                                    <input
                                        type="checkbox"
                                        checked={
                                            currentOrders.length > 0 &&
                                            selectedOrders.length === currentOrders.length
                                        }
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedOrders(currentOrders.map((order) => order._id));
                                            } else {
                                                setSelectedOrders([]);
                                            }
                                        }}
                                    />
                                </th>
                                <th>Order No.</th>
                                <th>Date & Time</th>
                                <th>Dealer</th>
                                <th>Sales Executive</th>
                                <th>Order Type</th>
                                <th>Items</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="11" className="order-empty">
                                        Loading orders...
                                    </td>
                                </tr>
                            ) : currentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="11" className="order-empty">
                                        No orders found
                                    </td>
                                </tr>
                            ) : (
                                currentOrders.map((order) => (
                                    <tr key={order._id}>
                                        <td className="checkbox-column">
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.includes(order._id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedOrders((prev) => [...prev, order._id]);
                                                    } else {
                                                        setSelectedOrders((prev) =>
                                                            prev.filter((id) => id !== order._id)
                                                        );
                                                    }
                                                }}
                                            />
                                        </td>

                                        <td>
                                            <div className="order-details">
                                                <strong>{order.orderNumber}</strong>
                                                <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="order-date-time">
                                                <strong>
                                                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                                                </strong>
                                                <span>
                                                    {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="order-person">
                                                <strong>{order.dealer?.name || "N/A"}</strong>
                                                <span>{order.dealer?.email || ""}</span>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="order-person">
                                                <strong>{order.salesExecutive?.name || "N/A"}</strong>
                                            </div>
                                        </td>

                                        <td>{order.orderType}</td>

                                        <td>
                                            <span className="order-items-count">{order.items?.length || 0}</span>
                                        </td>

                                        <td>
                                            <strong className="order-amount">
                                                ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                                            </strong>
                                        </td>

                                        <td>
                                            <span className={getStatusClass(order.status)}>{order.status}</span>
                                        </td>

                                        <td>
                                            <span className="payment-status">{order.paymentStatus}</span>
                                        </td>

                                        <td>
                                            <div className="order-actions">
                                                <button
                                                    type="button"
                                                    title="View Order"
                                                    className="order-action"
                                                    onClick={() => openViewOrderModal(order)}
                                                >
                                                    <Eye size={17} />
                                                </button>

                                                <button
                                                    type="button"
                                                    title="Edit Order"
                                                    className="order-action"
                                                    onClick={() => openEditOrderModal(order)}
                                                >
                                                    <Pencil size={17} />
                                                </button>

                                                <button
                                                    type="button"
                                                    title="Delete Order"
                                                    className="order-action delete"
                                                    onClick={() => handleDelete(order._id)}
                                                >
                                                    <Trash2 size={17} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/*                    PAGINATION           */}
                {orders.length > 0 && (
                    <div className="order-pagination">
                        <span>
                            Showing {startIndex + 1}–{Math.min(startIndex + ORDERS_PER_PAGE, filteredOrders.length)}{" "}
                            of {filteredOrders.length}
                        </span>

                        <div className="pagination-buttonss">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((prev) => prev - 1)}
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {Array.from(
                                { length: totalPages },
                                (_, index) => index + 1
                            ).map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    className={currentPage === page ? "active" : ""}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                type="button"
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage((prev) => prev + 1)}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {/*                      BOTTOM ORDER DASHBOARD                 */}
            <div className="order-bottom-dashboard">
                {/* TOP SELLING PRODUCTS */}
                <div className="order-bottom-card">
                    <div className="order-bottom-card-header">
                        <h3>Top Selling Products</h3>
                        <button type="button" className="view-all-btn">
                            View All
                        </button>
                    </div>

                    <div className="top-products-list">
                        {topProducts.length === 0 ? (
                            <div className="bottom-empty">No product data available</div>
                        ) : (
                            topProducts.map((product, index) => (
                                <div className="top-product-row" key={`${product.name}-${index}`}>
                                    <span className="product-rank">{index + 1}</span>
                                    <div className="product-small-icon">
                                        <Package size={15} />
                                    </div>
                                    <span className="product-name">{product.name}</span>
                                    <strong className="product-qty">{product.quantity} Qty</strong>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RECENT ORDERS */}
                <div className="order-bottom-card">
                    <div className="order-bottom-card-header">
                        <h3>Recent Orders</h3>
                        <button type="button" className="view-all-btn">
                            View All
                        </button>
                    </div>

                    <div className="recent-orders-list">
                        {recentOrders.length === 0 ? (
                            <div className="bottom-empty">No recent orders</div>
                        ) : (
                            recentOrders.map((order) => (
                                <div className="recent-order-row" key={order._id}>
                                    <div className="recent-order-icon">
                                        <ShoppingCart size={14} />
                                    </div>

                                    <div className="recent-order-info">
                                        <strong>{order.orderNumber}</strong>
                                        <span>{order.dealer?.name || "N/A"}</span>
                                    </div>

                                    <span className={getStatusClass(order.status)}>{order.status}</span>

                                    <span className="recent-order-time">
                                        {order.orderDate
                                            ? new Date(order.orderDate).toLocaleTimeString("en-IN", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })
                                            : "--"}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ORDER SUMMARY */}
                <div className="order-bottom-card">
                    <div className="order-bottom-card-header">
                        <h3>Order Summary (This Month)</h3>
                    </div>

                    <div className="order-summary-content">
                        <div className="order-donut-wrapper">
                            <div className="order-donut" style={donutStyle}>
                                <div className="order-donut-center">
                                    <strong>{summaryTotal.toLocaleString("en-IN")}</strong>
                                    <span>Total Orders</span>
                                </div>
                            </div>
                        </div>

                        <div className="order-summary-legend">
                            {summaryItems.map((item) => (
                                <div className="summary-legend-item" key={item.label}>
                                    <div className="legend-name">
                                        <span className={`legend-dot ${item.className}`} />
                                        <span>{item.label}</span>
                                    </div>

                                    <span className="legend-value">
                                        {item.value.toLocaleString("en-IN")} ({item.percentage.toFixed(1)}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* QUICK ACTIONS */}
                <div className="order-bottom-card">
                    <div className="order-bottom-card-header">
                        <h3>Quick Actions</h3>
                    </div>

                    <div className="quick-actions-grid">
                        <button type="button" className="quick-action-btn" onClick={openCreateOrderModal}>
                            <ShoppingCart size={18} />
                            <span>Create Order</span>
                        </button>

                        <button type="button" className="quick-action-btn">
                            <Undo2 size={18} />
                            <span>Order Returns</span>
                        </button>

                        <button type="button" className="quick-action-btn">
                            <Navigation size={18} />
                            <span>Track Order</span>
                        </button>

                        <button type="button" className="quick-action-btn">
                            <XCircle size={18} />
                            <span>Cancelled Orders</span>
                        </button>

                        <button type="button" className="quick-action-btn">
                            <Upload size={18} />
                            <span>Bulk Upload</span>
                        </button>

                        <button type="button" className="quick-action-btn">
                            <FileText size={18} />
                            <span>Order Report</span>
                        </button>
                    </div>
                </div>
            </div>

            {/*                     CREATE ORDER MODAL                 */}
            {showCreateOrderModal && (
                <div className="order-modal-overlay">
                    <div className="order-create-modal">
                        <div className="order-modal-header">
                            <div>
                                <h2>Create New Order</h2>
                                <p>Create a new dealer order.</p>
                            </div>
                        </div>

                        <form className="order-create-form" onSubmit={handleCreateOrder}>
                            <div className="order-form-grid">
                                <div className="order-form-group">
                                    <label>Order No.</label>
                                    <input type="text" value="Auto Generated" disabled />
                                </div>

                                <div className="order-form-group">
                                    <label>Date & Time</label>
                                    <input type="text" value={new Date().toLocaleString("en-IN")} disabled />
                                </div>

                                <div className="order-form-group">
                                    <label>Dealer</label>
                                    <select name="dealer" value={orderForm.dealer} onChange={handleOrderFormChange}>
                                        <option value="">Select Dealer</option>
                                        {dealers.map((user) => (
                                            <option key={user._id} value={user._id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="order-form-group">
                                    <label>Sales Executive</label>
                                    <select
                                        name="salesExecutive"
                                        value={orderForm.salesExecutive}
                                        onChange={handleOrderFormChange}
                                    >
                                        <option value="">Select Sales Executive</option>
                                        {salesExecutives.map((user) => (
                                            <option key={user._id} value={user._id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="order-form-group">
                                    <label>Order Type</label>
                                    <select
                                        name="orderType"
                                        value={orderForm.orderType}
                                        onChange={handleOrderFormChange}
                                    >
                                        <option value="Dealer Order">Dealer Order</option>
                                    </select>
                                </div>

                                <div className="order-form-group">
                                    <label>Item / Product</label>
                                    <select name="product" value={orderForm.product} onChange={handleOrderFormChange}>
                                        <option value="">Select Product</option>
                                        {products.map((product) => (
                                            <option key={product._id} value={product._id}>
                                                {product.name || product.productName || product.sku}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="order-form-group">
                                    <label>Quantity</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        min="1"
                                        value={orderForm.quantity}
                                        onChange={handleOrderFormChange}
                                    />
                                </div>

                                <div className="order-form-group">
                                    <label>Amount</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        min="0"
                                        step="0.01"
                                        placeholder={calculatedAmount > 0 ? calculatedAmount : "Enter amount"}
                                        value={orderForm.amount}
                                        onChange={handleOrderFormChange}
                                    />
                                </div>

                                <div className="order-form-group">
                                    <label>Status</label>
                                    <select name="status" value={orderForm.status} onChange={handleOrderFormChange}>
                                        <option value="Draft">Draft</option>
                                        <option value="New">New</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Dispatched">Dispatched</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div className="order-form-group">
                                    <label>Payment Status</label>
                                    <select
                                        name="paymentStatus"
                                        value={orderForm.paymentStatus}
                                        onChange={handleOrderFormChange}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Partially Paid">Partially Paid</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Refunded">Refunded</option>
                                    </select>
                                </div>
                            </div>

                            <div className="order-modal-footer">
                                <button type="button" className="order-modal-cancel" onClick={closeCreateOrderModal}>
                                    Cancel
                                </button>

                                <button type="submit" className="order-modal-submit" disabled={creatingOrder}>
                                    {creatingOrder ? "Creating..." : "Create Order"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/*                     VIEW ORDER MODAL                 */}
            {viewOrder && (
                <div className="order-modal-overlay">
                    <div className="order-view-modal">
                        <div className="order-view-header">
                            <h2>Order Details</h2>
                        </div>

                        <div className="order-view-body">
                            <div className="order-view-grid">
                                <div className="order-view-item">
                                    <span>Order No.</span>
                                    <strong>{viewOrder.orderNumber || "N/A"}</strong>
                                </div>

                                <div className="order-view-item">
                                    <span>Order Date</span>
                                    <strong>
                                        {viewOrder.orderDate
                                            ? new Date(viewOrder.orderDate).toLocaleDateString("en-IN")
                                            : "N/A"}
                                    </strong>
                                </div>

                                <div className="order-view-item">
                                    <span>Dealer</span>
                                    <strong>{viewOrder.dealer?.name || "N/A"}</strong>
                                </div>

                                <div className="order-view-item">
                                    <span>Sales Executive</span>
                                    <strong>{viewOrder.salesExecutive?.name || "N/A"}</strong>
                                </div>

                                <div className="order-view-item">
                                    <span>Order Type</span>
                                    <strong>{viewOrder.orderType || "N/A"}</strong>
                                </div>

                                <div className="order-view-item">
                                    <span>Product</span>
                                    <strong>
                                        {viewOrder.items?.[0]?.product?.name ||
                                            viewOrder.items?.[0]?.product?.productName ||
                                            viewOrder.items?.[0]?.product?.sku ||
                                            "N/A"}
                                    </strong>
                                </div>

                                <div className="order-view-item">
                                    <span>Quantity</span>
                                    <strong>{viewOrder.items?.[0]?.quantity ?? "N/A"}</strong>
                                </div>

                                <div className="order-view-item">
                                    <span>Amount</span>
                                    <strong>₹{Number(viewOrder.totalAmount || 0).toLocaleString("en-IN")}</strong>
                                </div>

                                <div className="order-view-item">
                                    <span>Status</span>
                                    <strong>{viewOrder.status || "N/A"}</strong>
                                </div>

                                <div className="order-view-item">
                                    <span>Payment Status</span>
                                    <strong>{viewOrder.paymentStatus || "N/A"}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="order-view-footer">
                            <button type="button" className="order-modal-om-close" onClick={closeViewOrderModal}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/*                     EDIT ORDER MODAL                 */}
            {showEditOrderModal && (
                <div className="order-modal-overlay">
                    <div className="order-create-modal">
                        <div className="order-modal-header">
                            <div>
                                <h2>Edit Order</h2>
                                <p>Update the dealer order details.</p>
                            </div>

                            <button type="button" className="order-modal-close" onClick={closeEditOrderModal}>
                                <XCircle size={20} />
                            </button>
                        </div>

                        <form className="order-create-form" onSubmit={handleUpdateOrder}>
                            <div className="order-form-grid">
                                <div className="order-form-group">
                                    <label>Order No.</label>
                                    <input type="text" value={editOrderForm.orderNumber} disabled />
                                </div>

                                <div className="order-form-group">
                                    <label>Date & Time</label>
                                    <input
                                        type="text"
                                        value={
                                            editOrderForm.orderDate
                                                ? new Date(editOrderForm.orderDate).toLocaleString("en-IN")
                                                : ""
                                        }
                                        disabled
                                    />
                                </div>

                                <div className="order-form-group">
                                    <label>Dealer</label>
                                    <select
                                        name="dealer"
                                        value={editOrderForm.dealer}
                                        onChange={handleEditOrderFormChange}
                                    >
                                        <option value="">Select Dealer</option>
                                        {dealers.map((user) => (
                                            <option key={user._id} value={user._id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="order-form-group">
                                    <label>Sales Executive</label>
                                    <select
                                        name="salesExecutive"
                                        value={editOrderForm.salesExecutive}
                                        onChange={handleEditOrderFormChange}
                                    >
                                        <option value="">Select Sales Executive</option>
                                        {salesExecutives.map((user) => (
                                            <option key={user._id} value={user._id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="order-form-group">
                                    <label>Order Type</label>
                                    <select
                                        name="orderType"
                                        value={editOrderForm.orderType}
                                        onChange={handleEditOrderFormChange}
                                    >
                                        <option value="Dealer Order">Dealer Order</option>
                                    </select>
                                </div>

                                <div className="order-form-group">
                                    <label>Item / Product</label>
                                    <select
                                        name="product"
                                        value={editOrderForm.product}
                                        onChange={handleEditOrderFormChange}
                                    >
                                        <option value="">Select Product</option>
                                        {products.map((product) => (
                                            <option key={product._id} value={product._id}>
                                                {product.name || product.productName || product.sku}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="order-form-group">
                                    <label>Quantity</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        min="1"
                                        value={editOrderForm.quantity}
                                        onChange={handleEditOrderFormChange}
                                    />
                                </div>

                                <div className="order-form-group">
                                    <label>Amount</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        min="0"
                                        step="0.01"
                                        placeholder={editCalculatedAmount > 0 ? editCalculatedAmount : "Enter amount"}
                                        value={editOrderForm.amount}
                                        onChange={handleEditOrderFormChange}
                                    />
                                </div>

                                <div className="order-form-group">
                                    <label>Status</label>
                                    <select
                                        name="status"
                                        value={editOrderForm.status}
                                        onChange={handleEditOrderFormChange}
                                    >
                                        <option value="Draft">Draft</option>
                                        <option value="New">New</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Dispatched">Dispatched</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div className="order-form-group">
                                    <label>Payment Status</label>
                                    <select
                                        name="paymentStatus"
                                        value={editOrderForm.paymentStatus}
                                        onChange={handleEditOrderFormChange}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Partially Paid">Partially Paid</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Refunded">Refunded</option>
                                    </select>
                                </div>
                            </div>

                            <div className="order-modal-footer">
                                <button type="button" className="order-modal-cancel" onClick={closeEditOrderModal}>
                                    Cancel
                                </button>

                                <button type="submit" className="order-modal-submit" disabled={updatingOrder}>
                                    {updatingOrder ? "Updating..." : "Update Order"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;