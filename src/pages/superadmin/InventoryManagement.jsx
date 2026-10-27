import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    Plus,
    Filter,
    RotateCcw,
    Eye,
    X,
    Package,
    AlertTriangle,
    Boxes,
    ArrowDownToLine,
    ArrowUpFromLine,
    ArrowLeftRight,
    SlidersHorizontal,
    ClipboardList,
    FileText,
    ChevronDown,
    Search,
    Save,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import "../../css/superadmin/inventoryManagement.css";

const API_BASE_URL = "https://oneplussparkpaintsserver.onrender.com/api";

const EMPTY_STATS = {
    totalInventoryValue: 0,
    totalItems: 0,
    totalStock: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    reorderLevelItems: 0,
    deadStockItems: 0,
};

const EMPTY_MOVEMENT_FORM = {
    product: "",
    warehouse: "",
    quantity: "",
    unit: "Ltr",
    reference: "",
    movementDate: "",
    remarks: "",
};

const EMPTY_TRANSFER_FORM = {
    product: "",
    fromWarehouse: "",
    toWarehouse: "",
    quantity: "",
    unit: "Ltr",
    reference: "",
    movementDate: "",
    remarks: "",
};

const InventoryManagement = () => {
    const [activeTab, setActiveTab] = useState("overview");

    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [selectedWarehouse, setSelectedWarehouse] = useState("ALL");
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [selectedGroup, setSelectedGroup] = useState("ALL");
    const [selectedProduct, setSelectedProduct] = useState("ALL");
    const [searchText, setSearchText] = useState("");

    const [stats, setStats] = useState(EMPTY_STATS);
    const [stocks, setStocks] = useState([]);
    const [movements, setMovements] = useState([]);
    const [products, setProducts] = useState([]);
    const [categoryStock, setCategoryStock] = useState([]);
    const [groupStock, setGroupStock] = useState([]);
    const [warehouseStock, setWarehouseStock] = useState([]);

    const [movementCurrentPage, setMovementCurrentPage] = useState(1);
    const MOVEMENTS_PER_PAGE = 10;
    const [warehouseCurrentPage, setWarehouseCurrentPage] = useState(1);
    const WAREHOUSE_ITEMS_PER_PAGE = 10;
    const [stockCurrentPage, setStockCurrentPage] = useState(1);
    const STOCKS_PER_PAGE = 10;

    const warehouseTotalPages = Math.ceil(
        warehouseStock.length / WAREHOUSE_ITEMS_PER_PAGE
    );

    const warehouseStartIndex =
        (warehouseCurrentPage - 1) * WAREHOUSE_ITEMS_PER_PAGE;

    const paginatedWarehouseStock = warehouseStock.slice(
        warehouseStartIndex,
        warehouseStartIndex + WAREHOUSE_ITEMS_PER_PAGE
    );
    const [lowStock, setLowStock] = useState([]);
    const [reorderItems, setReorderItems] = useState([]);
    const [deadStock, setDeadStock] = useState([]);
    const [stockAgeing, setStockAgeing] = useState([]);
    const [stockSummary, setStockSummary] = useState(null);
    const [topConsumedItems, setTopConsumedItems] = useState([]);

    const [statsLoading, setStatsLoading] = useState(true);
    const [stocksLoading, setStocksLoading] = useState(false);
    const [movementsLoading, setMovementsLoading] = useState(false);
    const [stocksError, setStocksError] = useState("");
    const [movementsError, setMovementsError] = useState("");

    const [modalType, setModalType] = useState(null);
    const [selectedStock, setSelectedStock] = useState(null);
    const [selectedMovement, setSelectedMovement] = useState(null);
    const [savingAction, setSavingAction] = useState(false);

    const [movementForm, setMovementForm] = useState(EMPTY_MOVEMENT_FORM);
    const [transferForm, setTransferForm] = useState(EMPTY_TRANSFER_FORM);



    const getToken = () =>
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken");

    const authConfig = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    const formatNumber = (value) =>
        Number(value || 0).toLocaleString("en-IN");

    const formatCurrency = (value) =>
        Number(value || 0).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        });

    const formatDate = (value) => {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatDateTime = (value) => {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const movementLabel = (type) =>
    ({
        INWARD: "Inward",
        OUTWARD: "Outward",
        TRANSFER: "Transfer",
        ADJUSTMENT: "Adjustment",
    }[type] || type || "-");

    const fetchProducts = async () => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/products`,
                authConfig()
            );
            if (!response.data?.success) return;
            const list =
                response.data.products ||
                response.data.data ||
                response.data.productsData ||
                [];
            setProducts(Array.isArray(list) ? list : []);
        } catch (error) {
            console.error("Inventory products error:", error?.response?.data || error);
        }
    };

    const fetchStats = async () => {
        try {
            setStatsLoading(true);
            const response = await axios.get(
                `${API_BASE_URL}/inventory/stats`,
                authConfig()
            );
            if (response.data?.success) {
                setStats({ ...EMPTY_STATS, ...(response.data.stats || {}) });
            }
        } catch (error) {
            console.error("Inventory stats error:", error?.response?.data || error);
        } finally {
            setStatsLoading(false);
        }
    };

    const fetchStocks = async () => {
        try {
            setStocksLoading(true);
            setStocksError("");
            const params = {};
            if (selectedWarehouse !== "ALL") params.warehouse = selectedWarehouse;
            if (selectedCategory !== "ALL") params.category = selectedCategory;
            if (selectedGroup !== "ALL") params.group = selectedGroup;
            if (selectedProduct !== "ALL") params.product = selectedProduct;

            const response = await axios.get(
                `${API_BASE_URL}/inventory/stock`,
                { ...authConfig(), params }
            );

            if (response.data?.success) {
                setStocks(Array.isArray(response.data.stocks) ? response.data.stocks : []);
            } else {
                setStocks([]);
                setStocksError(response.data?.message || "Failed to load stock listing");
            }
        } catch (error) {
            console.error("Inventory stock error:", error?.response?.data || error);
            setStocks([]);
            setStocksError(error?.response?.data?.message || "Failed to load stock listing");
        } finally {
            setStocksLoading(false);
        }
    };

    const fetchMovements = async () => {
        try {
            setMovementsLoading(true);
            setMovementsError("");
            const params = {};
            if (selectedWarehouse !== "ALL") params.warehouse = selectedWarehouse;
            if (selectedProduct !== "ALL") params.product = selectedProduct;
            if (dateFrom) params.dateFrom = dateFrom;
            if (dateTo) params.dateTo = dateTo;

            const response = await axios.get(
                `${API_BASE_URL}/inventory/movements`,
                { ...authConfig(), params }
            );

            if (response.data?.success) {
                setMovements(Array.isArray(response.data.movements) ? response.data.movements : []);
            } else {
                setMovements([]);
                setMovementsError(response.data?.message || "Failed to load stock movements");
            }
        } catch (error) {
            console.error("Inventory movements error:", error?.response?.data || error);
            setMovements([]);
            setMovementsError(error?.response?.data?.message || "Failed to load stock movements");
        } finally {
            setMovementsLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const endpoints = [
                ["category-stock", "categoryStock", "categoryStock"],
                ["group-stock", "groupStock", "groupStock"],
                ["warehouse-stock", "warehouseStock", "warehouseStock"],
                ["low-stock", "lowStock", "lowStock"],
                ["reorder-level", "reorderItems", "reorderLevelItems"],
                ["dead-stock", "deadStock", "deadStock"],
                ["stock-ageing", "stockAgeing", "ageing"],
                ["summary", "stockSummary", "summary"],
                ["top-consumed", "topConsumedItems", "topConsumedItems"],
            ];

            const responses = await Promise.all(
                endpoints.map(([endpoint]) =>
                    axios.get(`${API_BASE_URL}/inventory/${endpoint}`, authConfig())
                )
            );

            const setters = {
                categoryStock: (value) => setCategoryStock(Array.isArray(value) ? value : []),
                groupStock: (value) => setGroupStock(Array.isArray(value) ? value : []),
                warehouseStock: (value) => setWarehouseStock(Array.isArray(value) ? value : []),
                lowStock: (value) => setLowStock(Array.isArray(value) ? value : []),
                reorderItems: (value) => setReorderItems(Array.isArray(value) ? value : []),
                deadStock: (value) => setDeadStock(Array.isArray(value) ? value : []),
                stockAgeing: (value) => setStockAgeing(Array.isArray(value) ? value : []),
                stockSummary: (value) => setStockSummary(value || null),
                topConsumedItems: (value) => setTopConsumedItems(Array.isArray(value) ? value : []),
            };

            responses.forEach((response, index) => {
                const [, stateKey, responseKey] = endpoints[index];
                if (response.data?.success && setters[stateKey]) {
                    setters[stateKey](response.data[responseKey]);
                }
            });
        } catch (error) {
            console.error("Inventory analytics error:", error?.response?.data || error);
        }
    };

    const refreshInventory = async () => {
        await Promise.all([
            fetchStats(),
            fetchStocks(),
            fetchMovements(),
            fetchAnalytics(),
        ]);
    };

    useEffect(() => {
        fetchProducts();
        fetchStats();
        fetchStocks();
        fetchMovements();
        fetchAnalytics();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStocks();
            fetchMovements();
        }, 250);
        return () => clearTimeout(timer);
    }, [dateFrom, dateTo, selectedWarehouse, selectedCategory, selectedGroup, selectedProduct]);

    const warehouseOptions = useMemo(() => {
        const values = [];
        stocks.forEach((item) => item.warehouse && values.push(item.warehouse));
        warehouseStock.forEach((item) => item._id && values.push(item._id));
        return Array.from(new Set(values));
    }, [stocks, warehouseStock]);

    const categoryOptions = useMemo(() => {
        const values = [];
        stocks.forEach((item) => {
            const value = item.category || item.product?.category;
            if (value) values.push(value);
        });
        categoryStock.forEach((item) => item._id && values.push(item._id));
        return Array.from(new Set(values));
    }, [stocks, categoryStock]);

    const groupOptions = useMemo(() => {
        const values = [];
        stocks.forEach((item) => item.group && values.push(item.group));
        groupStock.forEach((item) => item._id && values.push(item._id));
        return Array.from(new Set(values));
    }, [stocks, groupStock]);

    const productOptions = useMemo(() => {
        const map = new Map();
        products.forEach((product) => {
            if (product?._id) {
                map.set(product._id, product.productName || product.sku || product._id);
            }
        });
        stocks.forEach((stock) => {
            if (stock.product?._id) {
                map.set(
                    stock.product._id,
                    stock.product.productName || stock.product.sku || stock.product._id
                );
            }
        });
        return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
    }, [products, stocks]);

    const resetFilters = () => {
        setDateFrom("");
        setDateTo("");
        setSelectedWarehouse("ALL");
        setSelectedCategory("ALL");
        setSelectedGroup("ALL");
        setSelectedProduct("ALL");
        setSearchText("");
    };

    const filteredStocks = useMemo(() => {
        const query = searchText.trim().toLowerCase();
        if (!query) return stocks;
        return stocks.filter((stock) =>
            [
                stock.product?.productName,
                stock.product?.sku,
                stock.warehouse,
                stock.category,
                stock.group,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(query)
        );
    }, [stocks, searchText]);

    const stockTotalPages = Math.ceil(
        filteredStocks.length / STOCKS_PER_PAGE
    );

    const stockStartIndex =
        (stockCurrentPage - 1) * STOCKS_PER_PAGE;

    const paginatedStocks = filteredStocks.slice(
        stockStartIndex,
        stockStartIndex + STOCKS_PER_PAGE
    );

    const getStockStatus = (stock) => {
        const quantity = Number(stock?.quantity || 0);
        const reorder = Number(stock?.reorderLevel || 0);
        if (quantity === 0) return { label: "Out of Stock", className: "inventory-status out" };
        if (reorder > 0 && quantity <= reorder) return { label: "Low Stock", className: "inventory-status low" };
        return { label: "In Stock", className: "inventory-status active" };
    };

    const getCategoryBucket = (category) => {
        const value = String(category || "")
            .trim()
            .toLowerCase();

        // Raw Material
        if (
            value === "raw material" ||
            value === "raw materials"
        ) {
            return "Raw Material";
        }

        // Packing Material
        if (
            value === "packing material" ||
            value === "packing materials"
        ) {
            return "Packing Material";
        }

        // WIP
        if (
            value === "work in progress" ||
            value === "wip"
        ) {
            return "Work in Progress";
        }

        // Finished Goods
        if (
            value === "finished goods" ||
            value === "finished good" ||
            value === "emulsion" ||
            value === "primer" ||
            value === "putty" ||
            value === "enamel" ||
            value === "texture" ||
            value === "wood finish" ||
            value === "waterproofing"
        ) {
            return "Finished Goods";
        }

        // Anything else
        return "Others";
    };

    const categoryBuckets = useMemo(() => {
        const bucketMap = {
            "Raw Material": 0,
            "Packing Material": 0,
            "Finished Goods": 0,
            "Work in Progress": 0,
            Others: 0,
        };
        categoryStock.forEach((item) => {
            const bucket = getCategoryBucket(item?._id);
            bucketMap[bucket] += Number(item?.totalStock || 0);
        });
        return Object.entries(bucketMap).map(([name, totalStock]) => ({ name, totalStock }));
    }, [categoryStock]);

    const normalizedGroupStock = useMemo(
        () =>
            groupStock
                .map((item) => ({
                    name: item?._id || "Other",
                    totalStock: Number(item?.totalStock || 0),
                }))
                .filter((item) => item.totalStock > 0),
        [groupStock]
    );

    const totalGroupStock = normalizedGroupStock.reduce(
        (sum, item) => sum + item.totalStock,
        0
    );

    const groupChartGradient = useMemo(() => {
        if (!normalizedGroupStock.length || totalGroupStock <= 0) return "#e2e8f0";
        const colors = ["#2563eb", "#16a34a", "#f59e0b", "#7c3aed", "#94a3b8", "#0ea5e9"];
        let currentDegree = 0;
        const segments = normalizedGroupStock.map((item, index) => {
            const degree = (item.totalStock / totalGroupStock) * 360;
            const start = currentDegree;
            const end = currentDegree + degree;
            currentDegree = end;
            return `${colors[index % colors.length]} ${start}deg ${end}deg`;
        });
        return `conic-gradient(${segments.join(", ")})`;
    }, [normalizedGroupStock, totalGroupStock]);

    const deadStockQuantity = deadStock.reduce(
        (sum, item) => sum + Number(item?.quantity || 0),
        0
    );

    const deadStockValue = deadStock.reduce(
        (sum, item) =>
            sum + Number(item?.quantity || 0) * Number(item?.product?.mrp || 0),
        0
    );

    const oldestStockAge = stockAgeing.length
        ? Math.max(...stockAgeing.map((item) => Number(item?.ageInDays || 0)))
        : 0;

    const openAddStockModal = () => {
        setMovementForm({ ...EMPTY_MOVEMENT_FORM });
        setModalType("INWARD");
    };

    const openOutwardModal = () => {
        setMovementForm({ ...EMPTY_MOVEMENT_FORM });
        setModalType("OUTWARD");
    };

    const openAdjustmentModal = () => {
        setMovementForm({ ...EMPTY_MOVEMENT_FORM });
        setModalType("ADJUSTMENT");
    };

    const openTransferModal = () => {
        setTransferForm({ ...EMPTY_TRANSFER_FORM });
        setModalType("TRANSFER");
    };

    const openViewStockModal = (stock) => {
        setSelectedStock(stock);
        setModalType("VIEW_STOCK");
    };

    const openViewMovementModal = (movement) => {
        setSelectedMovement(movement);
        setModalType("VIEW_MOVEMENT");
    };

    const handleEditMovement = (movement) => {
        setSelectedMovement(movement);

        setMovementForm({
            product: movement.product?._id || movement.product || "",
            warehouse: movement.warehouse || "",
            quantity: movement.quantity ?? "",
            unit: movement.unit || "Ltr",
            reference: movement.reference || "",
            movementDate: movement.movementDate
                ? new Date(movement.movementDate).toISOString().slice(0, 16)
                : "",
            remarks: movement.remarks || "",
        });

        setModalType("EDIT_MOVEMENT");
    };

    const handleDeleteMovement = async (id) => {
        if (!window.confirm("Are you sure you want to delete this stock movement?")) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_BASE_URL}/inventory/movements/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete movement");
            }

            alert("Stock movement deleted successfully");

            fetchMovements();
        } catch (error) {
            console.error("Delete movement error:", error);
            alert(error.message);
        }
    };

    const closeModal = () => {
        if (savingAction) return;
        setModalType(null);
        setSelectedStock(null);
        setSelectedMovement(null);
        setMovementForm({ ...EMPTY_MOVEMENT_FORM });
        setTransferForm({ ...EMPTY_TRANSFER_FORM });
    };

    const handleMovementFormChange = (e) => {
        const { name, value } = e.target;
        setMovementForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleTransferFormChange = (e) => {
        const { name, value } = e.target;
        setTransferForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleMovementSubmit = async (e) => {
        e.preventDefault();
        try {
            setSavingAction(true);

            if (modalType === "EDIT_MOVEMENT") {
                const response = await axios.put(
                    `${API_BASE_URL}/inventory/movements/${selectedMovement._id}`,
                    {
                        ...movementForm,
                        quantity: Number(movementForm.quantity),
                    },
                    authConfig()
                );

                if (!response.data?.success) {
                    throw new Error(response.data?.message || "Failed to update movement");
                }

                closeModal();
                await refreshInventory();
                alert(response.data?.message || "Stock movement updated successfully");
                return;
            }

            const endpointMap = {
                INWARD: "/inventory/movements/inward",
                OUTWARD: "/inventory/movements/outward",
                ADJUSTMENT: "/inventory/movements/adjustment",
            };
            const endpoint = endpointMap[modalType];
            if (!endpoint) return;

            const payload = {
                ...movementForm,
                quantity: Number(movementForm.quantity),
            };

            const response = await axios.post(
                `${API_BASE_URL}${endpoint}`,
                payload,
                authConfig()
            );

            if (!response.data?.success) {
                throw new Error(response.data?.message || "Operation failed");
            }

            closeModal();
            await refreshInventory();
            alert(response.data?.message || "Operation completed successfully");
        } catch (error) {
            console.error("Inventory movement submit error:", error?.response?.data || error);
            alert(error?.response?.data?.message || error?.message || "Operation failed");
        } finally {
            setSavingAction(false);
        }
    };

    const handleTransferSubmit = async (e) => {
        e.preventDefault();
        try {
            setSavingAction(true);
            const response = await axios.post(
                `${API_BASE_URL}/inventory/movements/transfer`,
                {
                    ...transferForm,
                    quantity: Number(transferForm.quantity),
                },
                authConfig()
            );

            if (!response.data?.success) {
                throw new Error(response.data?.message || "Stock transfer failed");
            }

            closeModal();
            await refreshInventory();
            alert(response.data?.message || "Stock transferred successfully");
        } catch (error) {
            console.error("Stock transfer error:", error?.response?.data || error);
            alert(error?.response?.data?.message || error?.message || "Stock transfer failed");
        } finally {
            setSavingAction(false);
        }
    };

    const handleQuickAction = (action) => {
        if (action === "ADD" || action === "INWARD") return openAddStockModal();
        if (action === "OUTWARD") return openOutwardModal();
        if (action === "TRANSFER") return openTransferModal();
        if (action === "ADJUSTMENT") return openAdjustmentModal();
        if (action === "REORDER") return setActiveTab("stockListing");
    };

    const renderStockTable = () => (
        <>
            <div className="inventory-table-wrapper">
                <table className="inventory-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>SKU</th>
                            <th>Warehouse</th>
                            <th>Category</th>
                            <th>Group</th>
                            <th>Quantity</th>
                            <th>Unit</th>
                            <th>Reorder Level</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocksLoading ? (
                            <tr><td colSpan="10" className="inventory-empty-cell">Loading stock...</td></tr>
                        ) : stocksError ? (
                            <tr><td colSpan="10" className="inventory-empty-cell">{stocksError}</td></tr>
                        ) : filteredStocks.length === 0 ? (
                            <tr><td colSpan="10" className="inventory-empty-cell">No stock records found.</td></tr>
                        ) : (
                            paginatedStocks.map((stock) => {
                                const status = getStockStatus(stock);
                                return (
                                    <tr
                                        key={stock._id}
                                        className={selectedStock?._id === stock._id ? "selected-row" : ""}
                                        onClick={() => openViewStockModal(stock)}
                                    >
                                        <td><strong>{stock.product?.productName || "-"}</strong></td>
                                        <td>{stock.product?.sku || "-"}</td>
                                        <td>{stock.warehouse || "-"}</td>
                                        <td>{stock.category || stock.product?.category || "-"}</td>
                                        <td>{stock.group || "-"}</td>
                                        <td>{formatNumber(stock.quantity)}</td>
                                        <td>{stock.unit || "-"}</td>
                                        <td>{formatNumber(stock.reorderLevel)}</td>
                                        <td><span className={status.className}>{status.label}</span></td>
                                        <td>
                                            <button
                                                type="button"
                                                className="inventory-icon-btn"
                                                title="View Stock"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openViewStockModal(stock);
                                                }}
                                            >
                                                <Eye size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            <div className="stock-pagination">
                <span>
                    Showing{" "}
                    {filteredStocks.length === 0
                        ? 0
                        : stockStartIndex + 1}{" "}
                    to{" "}
                    {Math.min(
                        stockStartIndex + STOCKS_PER_PAGE,
                        filteredStocks.length
                    )}{" "}
                    of {filteredStocks.length} entries
                </span>

                <div className="stock-pagination-controls">
                    <button
                        type="button"
                        disabled={stockCurrentPage === 1}
                        onClick={() =>
                            setStockCurrentPage((prev) =>
                                Math.max(1, prev - 1)
                            )
                        }
                    >
                        <ChevronLeft size={16} />
                    </button>

                    {Array.from(
                        { length: stockTotalPages },
                        (_, index) => index + 1
                    ).map((page) => (
                        <button
                            type="button"
                            key={page}
                            className={
                                stockCurrentPage === page
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setStockCurrentPage(page)
                            }
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        type="button"
                        disabled={
                            stockCurrentPage === stockTotalPages ||
                            stockTotalPages === 0
                        }
                        onClick={() =>
                            setStockCurrentPage((prev) =>
                                Math.min(
                                    stockTotalPages,
                                    prev + 1
                                )
                            )
                        }
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </>

    );

    const renderMovementTable = (onlyOutward = false) => {
        const list = onlyOutward
            ? movements.filter((movement) => movement?.movementType === "OUTWARD")
            : movements;

        const movementTotalPages = Math.ceil(
            list.length / MOVEMENTS_PER_PAGE
        );

        const movementStartIndex =
            (movementCurrentPage - 1) * MOVEMENTS_PER_PAGE;

        const paginatedMovements = list.slice(
            movementStartIndex,
            movementStartIndex + MOVEMENTS_PER_PAGE
        );

        return (
            <div className="inventory-table-wrapper">
                <table className="inventory-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Document No.</th>
                            <th>Type</th>
                            <th>Item / Product</th>
                            <th>Warehouse</th>
                            <th>Quantity</th>
                            <th>Reference</th>
                            <th>User</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movementsLoading ? (
                            <tr><td colSpan="9" className="inventory-empty-cell">Loading movements...</td></tr>
                        ) : movementsError ? (
                            <tr><td colSpan="9" className="inventory-empty-cell">{movementsError}</td></tr>
                        ) : list.length === 0 ? (
                            <tr><td colSpan="9" className="inventory-empty-cell">No stock movements found.</td></tr>
                        ) : (
                            paginatedMovements.map((movement) => (
                                <tr key={movement._id}>
                                    <td>{formatDate(movement.movementDate)}</td>
                                    <td>{movement._id}</td>
                                    <td><span className="inventory-movement-badge">{movementLabel(movement.movementType)}</span></td>
                                    <td><strong>{movement.product?.productName || "-"}</strong></td>
                                    <td>{movement.warehouse || "-"}</td>
                                    <td>{formatNumber(movement.quantity)} {movement.unit || ""}</td>
                                    <td>{movement.reference || "-"}</td>
                                    <td>{movement.user?.name || movement.user?.email || "-"}</td>
                                    <td><div className="inventory-action-buttons">
                                        <button
                                            type="button"
                                            className="inventory-icon-btn"
                                            title="View Movement"
                                            onClick={() => openViewMovementModal(movement)}
                                        >
                                            <Eye size={15} />
                                        </button>

                                        <button
                                            type="button"
                                            className="inventory-icon-btn"
                                            onClick={() => handleEditMovement(movement)}
                                            title="Edit"
                                        >
                                            <Pencil size={16} />
                                        </button>

                                        <button
                                            type="button"
                                            className="inventory-icon-btn inventory-icon-btn-delete"
                                            onClick={() => handleDeleteMovement(movement._id)}
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <div className="movement-pagination">
                    <span>
                        Showing{" "}
                        {list.length === 0 ? 0 : movementStartIndex + 1}{" "}
                        to{" "}
                        {Math.min(
                            movementStartIndex + MOVEMENTS_PER_PAGE,
                            list.length
                        )}{" "}
                        of {list.length} entries
                    </span>

                    <div className="movement-pagination-controls">
                        <button
                            type="button"
                            disabled={movementCurrentPage === 1}
                            onClick={() =>
                                setMovementCurrentPage((prev) =>
                                    Math.max(1, prev - 1)
                                )
                            }
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {Array.from(
                            { length: movementTotalPages },
                            (_, index) => index + 1
                        ).map((page) => (
                            <button
                                type="button"
                                key={page}
                                className={
                                    movementCurrentPage === page
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setMovementCurrentPage(page)
                                }
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            type="button"
                            disabled={
                                movementCurrentPage === movementTotalPages ||
                                movementTotalPages === 0
                            }
                            onClick={() =>
                                setMovementCurrentPage((prev) =>
                                    Math.min(
                                        movementTotalPages,
                                        prev + 1
                                    )
                                )
                            }
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="inventory-management-page">
            <div className="inventory-page-header">
                <div>
                    <h1>Inventory Management</h1>
                    <div className="inventory-breadcrumb">
                        <span>Dashboard</span><span>›</span>
                        <span>Inventory Management</span><span>›</span>
                        <span>Overview</span>
                    </div>
                </div>

                <button type="button" className="inventory-primary-btn" onClick={openAddStockModal}>
                    <Plus size={16} />
                    Add Stock
                    <ChevronDown size={14} />
                </button>
            </div>

            <div className="inventory-stats-grid">
                <div className="inventory-stat-card"><div className="inventory-stat-icon blue"><Boxes size={18} /></div><div><span>Total Inventory Value</span><strong>{statsLoading ? "..." : formatCurrency(stats.totalInventoryValue)}</strong></div></div>
                <div className="inventory-stat-card"><div className="inventory-stat-icon purple"><Package size={18} /></div><div><span>Total Items</span><strong>{statsLoading ? "..." : formatNumber(stats.totalItems)}</strong></div></div>
                <div className="inventory-stat-card"><div className="inventory-stat-icon green"><Boxes size={18} /></div><div><span>Total Stock (MT/Ltrs)</span><strong>{statsLoading ? "..." : formatNumber(stats.totalStock)}</strong></div></div>
                <div className="inventory-stat-card"><div className="inventory-stat-icon orange"><AlertTriangle size={18} /></div><div><span>Low Stock Items</span><strong>{statsLoading ? "..." : formatNumber(stats.lowStockItems)}</strong></div></div>
                <div className="inventory-stat-card"><div className="inventory-stat-icon red"><Package size={18} /></div><div><span>Out of Stock Items</span><strong>{statsLoading ? "..." : formatNumber(stats.outOfStockItems)}</strong></div></div>
                <div className="inventory-stat-card"><div className="inventory-stat-icon blue"><SlidersHorizontal size={18} /></div><div><span>Reorder Level Items</span><strong>{statsLoading ? "..." : formatNumber(stats.reorderLevelItems)}</strong></div></div>
                <div className="inventory-stat-card"><div className="inventory-stat-icon gray"><ClipboardList size={18} /></div><div><span>Dead Stock Items</span><strong>{statsLoading ? "..." : formatNumber(stats.deadStockItems)}</strong></div></div>
            </div>

            <div className="inventory-filter-card">
                <div className="inventory-filter-field date-range">
                    <label>Date Range</label>
                    <div className="inventory-date-range">
                        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                        <span>to</span>
                        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                    </div>
                </div>

                <div className="inventory-filter-field"><label>Warehouse</label><select value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(e.target.value)}><option value="ALL">All Warehouses</option>{warehouseOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                <div className="inventory-filter-field"><label>Category</label><select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}><option value="ALL">All Categories</option>{categoryOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                <div className="inventory-filter-field"><label>Group</label><select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}><option value="ALL">All Groups</option>{groupOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                <div className="inventory-filter-field"><label>Product</label><select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}><option value="ALL">All Products</option>{productOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>

                <div className="inventory-filter-actions">
                    <button type="button" className="inventory-filter-btn" onClick={() => { fetchStocks(); fetchMovements(); }}><Filter size={15} /> Filters</button>
                    <button type="button" className="inventory-reset-btn" onClick={resetFilters}><RotateCcw size={14} /> Reset</button>
                </div>
            </div>

            <div className="inventory-tabs">
                {[
                    ["overview", "Overview"],
                    ["stockListing", "Stock Listing"],
                    ["movements", "Stock Movement"],
                    ["inward", "Inward"],
                    ["outward", "Outward"],
                    // ["warehouse", "Warehouse Stock"],
                    ["summary", "Stock Summary"],
                    ["query", "Stock Query"],
                    ["reports", "Reports"],
                ].map(([value, label]) => (
                    <button key={value} type="button" className={activeTab === value ? "inventory-tab active" : "inventory-tab"} onClick={() => setActiveTab(value)}>{label}</button>
                ))}
            </div>

            {activeTab === "overview" && (
                <>
                    <div className="inventory-overview-cards">
                        <div className="inventory-overview-card"><div><span>Reorder Level Items</span><strong>{reorderItems.length}</strong></div><button type="button" onClick={() => setActiveTab("stockListing")}>View Details</button></div>
                        <div className="inventory-overview-card"><div><span>Low Stock Items</span><strong>{lowStock.length}</strong></div><button type="button" onClick={() => setActiveTab("stockListing")}>View Details</button></div>
                        <div className="inventory-overview-card"><div><span>Warehouse Stock</span><strong>{formatNumber(stats.totalStock)}</strong></div><button type="button" onClick={() => setActiveTab("warehouse")}>View Details</button></div>
                    </div>

                    <div className="inventory-overview-grid">
                        <div className="inventory-panel">
                            <div className="inventory-panel-header"><div><h2>Stock by Category</h2><p>Category-wise stock</p></div></div>
                            <div className="inventory-category-list">
                                {categoryBuckets.map((item) => {
                                    const total = categoryBuckets.reduce((sum, row) => sum + Number(row.totalStock || 0), 0);
                                    const percent = total > 0 ? ((Number(item.totalStock || 0) / total) * 100).toFixed(1) : 0;
                                    return <div className="inventory-category-row" key={item.name}><div><strong>{item.name}</strong><span>{formatNumber(item.totalStock)}</span></div><div className="inventory-progress"><span style={{ width: `${percent}%` }} /></div><small>{percent}%</small></div>;
                                })}
                            </div>
                        </div>

                        <div className="inventory-panel">
                            <div className="inventory-panel-header"><div><h2>Stock by Group</h2><p>Group-wise stock analysis</p></div></div>
                            <div className="inventory-group-chart">
                                <div className="inventory-donut" style={{ background: groupChartGradient }}><div><strong>{formatNumber(totalGroupStock)}</strong><span>MT/Ltrs</span></div></div>
                                <div className="inventory-group-legend">
                                    {normalizedGroupStock.length === 0 ? <div className="inventory-empty-small">No group stock data.</div> : normalizedGroupStock.map((item, index) => {
                                        const percent = totalGroupStock > 0 ? ((item.totalStock / totalGroupStock) * 100).toFixed(1) : 0;
                                        return <div key={`${item.name}-${index}`} className="inventory-legend-row"><span><i className={`legend-dot dot-${index % 5}`} />{item.name}</span><strong>{formatNumber(item.totalStock)} ({percent}%)</strong></div>;
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="inventory-panel">
                        <div className="inventory-panel-header"><div><h2>Recent Stock Movements</h2><p>Latest inventory activity</p></div><button type="button" className="inventory-link-btn" onClick={() => setActiveTab("movements")}>View All</button></div>
                        {renderMovementTable()}
                    </div>

                    <div className="inventory-overview-bottom-grid">
                        <div>
                            <div className="inventory-panel">
                                <div className="inventory-panel-header"><div><h2>Warehouse-wise Stock</h2><p>Stock by warehouse</p></div></div>
                                <div className="inventory-table-wrapper">
                                    <table className="inventory-table">
                                        <thead><tr><th>Warehouse</th><th>Raw Material</th><th>Packing Material</th><th>Finished Goods</th><th>WIP</th><th>Total Stock</th></tr></thead>
                                        <tbody>{warehouseStock.length === 0 ? <tr><td colSpan="6" className="inventory-empty-cell">No warehouse data.</td></tr> : paginatedWarehouseStock.map((item) => <tr key={item._id}><td><strong>{item._id}</strong></td><td>{formatNumber(item.rawMaterial)}</td><td>{formatNumber(item.packingMaterial)}</td><td>{formatNumber(item.finishedGoods)}</td><td>{formatNumber(item.wip)}</td><td><strong>{formatNumber(item.totalStock)}</strong></td></tr>)}</tbody>
                                    </table>
                                </div>
                                <div className="warehouse-pagination">
                                    <span>
                                        Showing{" "}
                                        {warehouseStock.length === 0
                                            ? 0
                                            : warehouseStartIndex + 1}{" "}
                                        to{" "}
                                        {Math.min(
                                            warehouseStartIndex + WAREHOUSE_ITEMS_PER_PAGE,
                                            warehouseStock.length
                                        )}{" "}
                                        of {warehouseStock.length} entries
                                    </span>

                                    <div className="warehouse-pagination-controls">
                                        <button
                                            type="button"
                                            disabled={warehouseCurrentPage === 1}
                                            onClick={() =>
                                                setWarehouseCurrentPage((prev) =>
                                                    Math.max(1, prev - 1)
                                                )
                                            }
                                        >
                                            <ChevronLeft size={16} />
                                        </button>

                                        {Array.from(
                                            { length: warehouseTotalPages },
                                            (_, index) => index + 1
                                        ).map((page) => (
                                            <button
                                                type="button"
                                                key={page}
                                                className={
                                                    warehouseCurrentPage === page
                                                        ? "active"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    setWarehouseCurrentPage(page)
                                                }
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        <button
                                            type="button"
                                            disabled={
                                                warehouseCurrentPage === warehouseTotalPages ||
                                                warehouseTotalPages === 0
                                            }
                                            onClick={() =>
                                                setWarehouseCurrentPage((prev) =>
                                                    Math.min(
                                                        warehouseTotalPages,
                                                        prev + 1
                                                    )
                                                )
                                            }
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="inventory-panel">
                                <div className="inventory-panel-header"><div><h2>Stock Summary</h2><p>Inventory movement summary</p></div></div>
                                <div className="inventory-summary-grid">
                                    {[["Total Stock", stockSummary?.totalStock], ["Total Inward", stockSummary?.totalInward], ["Total Outward", stockSummary?.totalOutward], ["Total Transfers", stockSummary?.totalTransfers], ["Adjustments", stockSummary?.totalAdjustments]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{formatNumber(value)}</strong></div>)}
                                </div>
                            </div>

                            <div className="inventory-panel">
                                <div className="inventory-panel-header"><div><h2>Top Consumed Items (This Month)</h2><p>Based on recorded outward movements</p></div></div>
                                <div className="inventory-top-consumed-list">
                                    {topConsumedItems.length === 0 ? <div className="inventory-empty-small">No outward consumption data.</div> : topConsumedItems.map((item) => <div className="inventory-consumed-row" key={item._id}><span>{item.productName || "-"}</span><strong>{formatNumber(item.consumedQuantity)} {item.unit || ""}</strong></div>)}
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="inventory-panel">
                                <div className="inventory-panel-header"><div><h2>Low Stock Alerts</h2><p>Items below reorder threshold</p></div><AlertTriangle size={18} /></div>
                                <div className="inventory-alert-list">
                                    {lowStock.length === 0 ? <div className="inventory-empty-small">No low stock alerts.</div> : lowStock.slice(0, 8).map((item) => <div className="inventory-alert-row" key={item._id}><div><strong>{item.product?.productName || "-"}</strong><span>Current: {formatNumber(item.quantity)} {item.unit || ""}</span></div><strong>Reorder: {formatNumber(item.reorderLevel)}</strong></div>)}
                                </div>
                            </div>

                            <div className="inventory-panel">
                                <div className="inventory-panel-headers"><div><h2>Quick Actions</h2><p>Common inventory operations</p></div></div>
                                <div className="inventory-quick-actionss">
                                    <button type="button" onClick={() => handleQuickAction("ADD")}><Plus size={16} /><span>Add Stock</span></button>
                                    <button type="button" onClick={() => handleQuickAction("TRANSFER")}><ArrowLeftRight size={16} /><span>Stock Transfer</span></button>
                                    <button type="button" onClick={() => handleQuickAction("ADJUSTMENT")}><SlidersHorizontal size={16} /><span>Stock Adjustment</span></button>
                                    <button type="button" onClick={() => handleQuickAction("INWARD")}><ArrowDownToLine size={16} /><span>Inward Material</span></button>
                                    <button type="button" onClick={() => handleQuickAction("OUTWARD")}><ArrowUpFromLine size={16} /><span>Outward Material</span></button>
                                    <button type="button" onClick={() => handleQuickAction("REORDER")}><SlidersHorizontal size={16} /><span>View Reorder Level</span></button>
                                </div>
                            </div>

                            <div className="inventory-panel">
                                <div className="inventory-panel-header"><div><h2>Dead Stock Summary</h2><p>Long-unused inventory</p></div></div>
                                <div className="inventory-dead-summary">
                                    <div><span>Dead Stock Items</span><strong>{deadStock.length}</strong></div>
                                    <div><span>Dead Stock Quantity</span><strong>{formatNumber(deadStockQuantity)}</strong></div>
                                    <div><span>Dead Stock Value</span><strong>{formatCurrency(deadStockValue)}</strong></div>
                                    <div><span>Oldest Stock Age</span><strong>{oldestStockAge ? `${oldestStockAge} Days` : "-"}</strong></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === "stockListing" && <div className="inventory-panel"><div className="inventory-panel-header"><div><h2>Stock Listing</h2><p>Current stock by warehouse and product</p></div><span className="inventory-record-count">{filteredStocks.length} records</span></div>{renderStockTable()}</div>}

            {activeTab === "movements" && <div className="inventory-panel"><div className="inventory-panel-header"><div><h2>Stock Movement</h2><p>Inward, outward, transfer and adjustment activity</p></div></div>{renderMovementTable()}</div>}

            {activeTab === "inward" && <div className="inventory-action-tab-panel"><div className="inventory-action-content"><ArrowDownToLine size={28} /><h2>Inward Material</h2><p>Record incoming material into a warehouse.</p><button type="button" className="inventory-primary-btn" onClick={openAddStockModal}><Plus size={15} />Add Stock</button></div></div>}

            {activeTab === "outward" && <div className="inventory-panel"><div className="inventory-panel-header"><div><h2>Outward Material</h2><p>Record material consumption.</p></div><button type="button" className="inventory-primary-btn" onClick={openOutwardModal}><Plus size={15} />Record Outward</button></div>{renderMovementTable(true)}</div>}



            {activeTab === "summary" && <div className="inventory-panel"><div className="inventory-panel-header"><div><h2>Stock Summary</h2><p>Inventory movement summary</p></div></div><div className="inventory-summary-grid">{[["Total Stock", stockSummary?.totalStock], ["Total Inward", stockSummary?.totalInward], ["Total Outward", stockSummary?.totalOutward], ["Total Transfers", stockSummary?.totalTransfers], ["Total Adjustments", stockSummary?.totalAdjustments]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{formatNumber(value)}</strong></div>)}</div></div>}

            {activeTab === "query" && <div className="inventory-panel"><div className="inventory-panel-header"><div><h2>Stock Query</h2><p>Filtered stock query</p></div></div>{renderStockTable()}</div>}

            {activeTab === "reports" && <div className="inventory-report-grid">
                {[
                    ["Stock Summary", "Inventory stock summary", "summary"],
                    ["Stock Query", "Filtered stock query", "query"],
                    ["Batch-wise FG Report", "Requires a dedicated batch-report backend endpoint.", null],
                    ["Item-wise Batch Report", "Requires a dedicated item-batch backend endpoint.", null],
                    ["Stock Ageing", `${stockAgeing.length} stock records`, null],
                    ["Dead Stock", `${deadStock.length} dead stock records`, null],
                    ["Inward", "Recorded inward movements", "inward"],
                    ["Outward", "Recorded outward movements", "outward"],
                    ["Warehouse-wise Stock", "Warehouse stock summary", "warehouse"],
                ].map(([title, text, tab]) => (
                    <div key={title}><FileText size={18} /><strong>{title}</strong><span>{text}</span>{tab && <button type="button" className="inventory-link-btn" onClick={() => setActiveTab(tab)}>Open</button>}</div>
                ))}
            </div>}

            {(modalType === "INWARD" ||
                modalType === "OUTWARD" ||
                modalType === "ADJUSTMENT" ||
                modalType === "EDIT_MOVEMENT") && (
                    <div className="inventory-modal-overlay" onClick={() => !savingAction && closeModal()}>
                        <div className="inventory-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="inventory-modal-header">
                                <div>
                                    <h2>{modalType === "EDIT_MOVEMENT"
                                        ? "Edit Stock Movement"
                                        : modalType === "INWARD"
                                            ? "Add Stock"
                                            : modalType === "OUTWARD"
                                                ? "Outward Material"
                                                : "Stock Adjustment"}</h2>
                                    <p>{modalType === "INWARD" ? "Record incoming material into a warehouse." : modalType === "OUTWARD" ? "Record material consumption." : "Adjust current stock quantity."}</p>
                                </div>
                            </div>

                            <form className="inventory-modal-form" onSubmit={handleMovementSubmit}>
                                <div className="inventory-form-grid">
                                    <div className="inventory-form-group"><label>Product *</label><select name="product" value={movementForm.product} onChange={handleMovementFormChange} required><option value="">Select Product</option>{productOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
                                    <div className="inventory-form-group"><label>Warehouse *</label><input type="text" name="warehouse" value={movementForm.warehouse} onChange={handleMovementFormChange} placeholder="Enter warehouse" required /></div>
                                    <div className="inventory-form-group"><label>Quantity *</label><input type="number" min={modalType === "ADJUSTMENT" ? undefined : "0"} step="any" name="quantity" value={movementForm.quantity} onChange={handleMovementFormChange} required />{modalType === "ADJUSTMENT" && <small className="inventory-form-help">Use a positive value to increase stock and a negative value to reduce stock.</small>}</div>
                                    <div className="inventory-form-group"><label>Unit *</label><select name="unit" value={movementForm.unit} onChange={handleMovementFormChange}><option value="Ltr">Ltr</option><option value="MT">MT</option><option value="Kg">Kg</option><option value="Nos">Nos</option></select></div>
                                    <div className="inventory-form-group"><label>Movement Date</label><input type="datetime-local" name="movementDate" value={movementForm.movementDate} onChange={handleMovementFormChange} /></div>
                                    <div className="inventory-form-group"><label>Reference</label><input type="text" name="reference" value={movementForm.reference} onChange={handleMovementFormChange} placeholder="Reference number" /></div>
                                    <div className="inventory-form-group full-width"><label>Remarks</label><textarea name="remarks" rows="3" value={movementForm.remarks} onChange={handleMovementFormChange} placeholder="Enter remarks" /></div>
                                </div>

                                <div className="inventory-modal-footer"><button type="button" className="inventory-secondary-btn" onClick={closeModal} disabled={savingAction}>Cancel</button><button type="submit" className="inventory-primary-btn" disabled={savingAction}><Save size={14} />{savingAction ? "Saving..." : modalType === "INWARD" ? "Add Stock" : modalType === "OUTWARD" ? "Record Outward" : "Save Adjustment"}</button></div>
                            </form>
                        </div>
                    </div>
                )}

            {modalType === "TRANSFER" && (
                <div className="inventory-modal-overlay" onClick={() => !savingAction && closeModal()}>
                    <div className="inventory-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="inventory-modal-header"><div><h2>Stock Transfer</h2><p>Transfer stock between warehouses.</p></div><button type="button" className="inventory-close-btn" onClick={closeModal} disabled={savingAction}><X size={18} /></button></div>
                        <form className="inventory-modal-form" onSubmit={handleTransferSubmit}>
                            <div className="inventory-form-grid">
                                <div className="inventory-form-group"><label>Product *</label><select name="product" value={transferForm.product} onChange={handleTransferFormChange} required><option value="">Select Product</option>{productOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
                                <div className="inventory-form-group"><label>From Warehouse *</label><select name="fromWarehouse" value={transferForm.fromWarehouse} onChange={handleTransferFormChange} required><option value="">Select Source</option>{warehouseOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                                <div className="inventory-form-group"><label>To Warehouse *</label><select name="toWarehouse" value={transferForm.toWarehouse} onChange={handleTransferFormChange} required><option value="">Select Destination</option>{warehouseOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                                <div className="inventory-form-group"><label>Quantity *</label><input type="number" min="0" step="any" name="quantity" value={transferForm.quantity} onChange={handleTransferFormChange} required /></div>
                                <div className="inventory-form-group"><label>Unit *</label><select name="unit" value={transferForm.unit} onChange={handleTransferFormChange}><option value="Ltr">Ltr</option><option value="MT">MT</option><option value="Kg">Kg</option><option value="Nos">Nos</option></select></div>
                                <div className="inventory-form-group"><label>Movement Date</label><input type="datetime-local" name="movementDate" value={transferForm.movementDate} onChange={handleTransferFormChange} /></div>
                                <div className="inventory-form-group"><label>Reference</label><input type="text" name="reference" value={transferForm.reference} onChange={handleTransferFormChange} /></div>
                                <div className="inventory-form-group full-width"><label>Remarks</label><textarea name="remarks" rows="3" value={transferForm.remarks} onChange={handleTransferFormChange} /></div>
                            </div>
                            <div className="inventory-modal-footer"><button type="button" className="inventory-secondary-btn" onClick={closeModal} disabled={savingAction}>Cancel</button><button type="submit" className="inventory-primary-btn" disabled={savingAction}><ArrowLeftRight size={14} />{savingAction ? "Transferring..." : "Transfer Stock"}</button></div>
                        </form>
                    </div>
                </div>
            )}

            {modalType === "VIEW_STOCK" && selectedStock && (
                <div className="inventory-modal-overlay" onClick={closeModal}>
                    <div className="inventory-modal large" onClick={(e) => e.stopPropagation()}>
                        <div className="inventory-modal-header"><div><h2>Stock Details</h2><p>{selectedStock.product?.productName || "-"}</p></div><button type="button" className="inventory-close-btn" onClick={closeModal}><X size={18} /></button></div>
                        <div className="inventory-detail-grid">
                            <div><span>Product</span><strong>{selectedStock.product?.productName || "-"}</strong></div>
                            <div><span>SKU</span><strong>{selectedStock.product?.sku || "-"}</strong></div>
                            <div><span>Warehouse</span><strong>{selectedStock.warehouse || "-"}</strong></div>
                            <div><span>Category</span><strong>{selectedStock.category || selectedStock.product?.category || "-"}</strong></div>
                            <div><span>Group</span><strong>{selectedStock.group || "-"}</strong></div>
                            <div><span>Quantity</span><strong>{formatNumber(selectedStock.quantity)} {selectedStock.unit || ""}</strong></div>
                            <div><span>Reorder Level</span><strong>{formatNumber(selectedStock.reorderLevel)}</strong></div>
                            <div><span>Status</span><strong>{getStockStatus(selectedStock).label}</strong></div>
                            <div><span>Last Movement</span><strong>{formatDate(selectedStock.lastMovementDate)}</strong></div>
                            <div><span>Last Received</span><strong>{formatDate(selectedStock.lastReceivedDate)}</strong></div>
                            <div className="inventory-detail-wide"><span>Product MRP</span><strong>{formatCurrency(selectedStock.product?.mrp)}</strong></div>
                        </div>
                    </div>
                </div>
            )}

            {modalType === "VIEW_MOVEMENT" && selectedMovement && (
                <div className="inventory-modal-overlay" onClick={closeModal}>
                    <div className="inventory-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="inventory-modal-header"><div><h2>Movement Details</h2><p>{movementLabel(selectedMovement.movementType)}</p></div></div>
                        <div className="inventory-detail-grid">
                            <div><span>Movement Type</span><strong>{movementLabel(selectedMovement.movementType)}</strong></div>
                            <div><span>Date</span><strong>{formatDateTime(selectedMovement.movementDate)}</strong></div>
                            <div><span>Product</span><strong>{selectedMovement.product?.productName || "-"}</strong></div>
                            <div><span>SKU</span><strong>{selectedMovement.product?.sku || "-"}</strong></div>
                            <div><span>Warehouse</span><strong>{selectedMovement.warehouse || "-"}</strong></div>
                            <div><span>Quantity</span><strong>{formatNumber(selectedMovement.quantity)} {selectedMovement.unit || ""}</strong></div>

                            <div><span>Reference</span><strong>{selectedMovement.reference || "-"}</strong></div>
                            <div><span>User</span><strong>{selectedMovement.user?.name || selectedMovement.user?.email || "-"}</strong></div>
                            <div className="inventory-detail-wide"><span>Remarks</span><strong>{selectedMovement.remarks || "-"}</strong></div>
                            {selectedMovement.movementType === "TRANSFER" && <><div><span>From Warehouse</span><strong>{selectedMovement.fromWarehouse || "-"}</strong></div><div><span>To Warehouse</span><strong>{selectedMovement.toWarehouse || "-"}</strong></div></>}
                        </div>
                        <div className="view-im-footer">
                            <button type="button" className="view-im-close-bottom" onClick={closeModal}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryManagement;