import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    Plus,
    Upload,
    Download,
    FileText,
    Eye,
    Pencil,
    Trash2,
    X,
    RotateCcw,
    Filter,
    PackageCheck,
    Clock3,
    CheckCircle2,
    XCircle,
    ChevronDown,
    Save,
    ClipboardCheck,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import "../../css/superadmin/inboundMaterialOverview.css";

const API_BASE_URL = "https://oneplussparkpaintsserver.onrender.com/api";

const STATUS_OPTIONS = [
    { value: "RECEIVED", label: "Received" },
    { value: "IN_TRANSIT", label: "In Transit" },
    { value: "PENDING_QC", label: "Pending QC" },
    { value: "REJECTED", label: "Rejected" },
    { value: "CANCELLED", label: "Cancelled" },
];

const QC_OPTIONS = [
    { value: "PENDING", label: "Pending" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
];

const QUANTITY_CHECK_OPTIONS = [
    { value: "PENDING", label: "Pending" },
    { value: "PASSED", label: "Passed" },
    { value: "MISMATCH", label: "Mismatch" },
];

const EMPTY_FORM = {
    poDate: "",
    vendor: "",
    material: "",
    category: "",
    quantityOrdered: "",
    receivedQuantity: "",
    eta: "",
    lrNumber: "",
    transport: "",
    freight: "",
    receivedDate: "",
    warehouse: "",
    billLocation: "",
    qualityCheck: "PENDING",
    quantityCheck: "PENDING",
    status: "IN_TRANSIT",
    value: "",
    remarks: "",
};

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

const toDateOnly = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
};

const statusLabel = (status) =>
    STATUS_OPTIONS.find((item) => item.value === status)?.label ||
    status ||
    "-";

const qcLabel = (value) =>
    QC_OPTIONS.find((item) => item.value === value)?.label ||
    value ||
    "-";

const quantityCheckLabel = (value) =>
    QUANTITY_CHECK_OPTIONS.find((item) => item.value === value)?.label ||
    value ||
    "-";

const escapeCsv = (value) => {
    const text = String(value ?? "");
    return /[",]/.test(text)
        ? `"${text.replace(/"/g, '""')}"`
        : text;
};

const parseCsvRow = (line) => {
    const values = [];
    let current = "";
    let quoted = false;

    for (let i = 0; i < line.length; i += 1) {
        const char = line[i];

        if (char === '"' && line[i + 1] === '"') {
            current += '"';
            i += 1;
            continue;
        }

        if (char === '"') {
            quoted = !quoted;
            continue;
        }

        if (char === "," && !quoted) {
            values.push(current);
            current = "";
            continue;
        }

        current += char;
    }

    values.push(current);
    return values;
};

const InboundMaterialManagement = () => {
    const [inbounds, setInbounds] = useState([]);
    const [stats, setStats] = useState({
        totalGRNs: 0,
        totalQuantity: 0,
        totalValue: 0,
        inTransit: 0,
        pendingQC: 0,
        rejectedGRNs: 0,
    });
    const [overview, setOverview] = useState({
        statusData: [],
        trendData: [],
        supplierData: [],
        recentInbounds: [],
    });
    const [summary, setSummary] = useState(null);
    const [alerts, setAlerts] = useState({
        pendingQC: [],
        rejected: [],
        inTransit: [],
        quantityMismatch: [],
    });
    const [monthlyStats, setMonthlyStats] = useState([]);

    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [selectedWarehouse, setSelectedWarehouse] = useState("ALL");
    const [selectedVendor, setSelectedVendor] = useState("ALL");

    const [warehouseOptions, setWarehouseOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const [modal, setModal] = useState(null);
    const [selectedInbound, setSelectedInbound] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);

    const getToken = () =>
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken");

    const authConfig = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    const getApiError = (err, fallback) =>
        err?.response?.data?.message || err?.message || fallback;

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                status:
                    selectedStatus !== "ALL"
                        ? selectedStatus
                        : undefined,
                category:
                    selectedCategory !== "ALL"
                        ? selectedCategory
                        : undefined,
                warehouse:
                    selectedWarehouse !== "ALL"
                        ? selectedWarehouse
                        : undefined,
                vendor:
                    selectedVendor !== "ALL"
                        ? selectedVendor
                        : undefined,
                dateFrom: dateFrom || undefined,
                dateTo: dateTo || undefined,
            };

            const [
                listResponse,
                statsResponse,
                overviewResponse,
                summaryResponse,
                alertsResponse,
                monthlyResponse,
            ] = await Promise.all([
                axios.get(`${API_BASE_URL}/inbound`, {
                    ...authConfig(),
                    params,
                }),
                axios.get(`${API_BASE_URL}/inbound/stats`, authConfig()),
                axios.get(`${API_BASE_URL}/inbound/overview`, authConfig()),
                axios.get(`${API_BASE_URL}/inbound/summary`, authConfig()),
                axios.get(`${API_BASE_URL}/inbound/alerts`, authConfig()),
                axios.get(
                    `${API_BASE_URL}/inbound/monthly-stats`,
                    authConfig()
                ),
            ]);

            const list = Array.isArray(listResponse.data?.inbounds)
                ? listResponse.data.inbounds
                : [];

            setInbounds(list);

            if (statsResponse.data?.success) {
                setStats({
                    totalGRNs: 0,
                    totalQuantity: 0,
                    totalValue: 0,
                    inTransit: 0,
                    pendingQC: 0,
                    rejectedGRNs: 0,
                    ...(statsResponse.data.stats || {}),
                });
            }

            if (overviewResponse.data?.success) {
                setOverview(
                    overviewResponse.data.overview || {
                        statusData: [],
                        trendData: [],
                        supplierData: [],
                        recentInbounds: [],
                    }
                );
            }

            if (summaryResponse.data?.success) {
                setSummary(summaryResponse.data.summary || null);
            }

            if (alertsResponse.data?.success) {
                setAlerts(
                    alertsResponse.data.alerts || {
                        pendingQC: [],
                        rejected: [],
                        inTransit: [],
                        quantityMismatch: [],
                    }
                );
            }

            if (monthlyResponse.data?.success) {
                setMonthlyStats(
                    Array.isArray(monthlyResponse.data.monthlyStats)
                        ? monthlyResponse.data.monthlyStats
                        : []
                );
            }

            setWarehouseOptions(
                Array.from(
                    new Set(
                        list.map((item) => item.warehouse).filter(Boolean)
                    )
                )
            );

            setCategoryOptions(
                Array.from(
                    new Set(
                        list.map((item) => item.category).filter(Boolean)
                    )
                )
            );

            setVendorOptions(
                Array.from(
                    new Set(
                        list.map((item) => item.vendor).filter(Boolean)
                    )
                )
            );
        } catch (err) {
            console.error(
                "Inbound dashboard error:",
                err?.response?.data || err
            );
            setError(
                getApiError(
                    err,
                    "Failed to load inbound material dashboard"
                )
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
        // Filters are applied through the regular Filters button.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openCreateModal = () => {
        setForm({
            ...EMPTY_FORM,
            status: "IN_TRANSIT",
            qualityCheck: "PENDING",
            quantityCheck: "PENDING",
        });
        setSelectedInbound(null);
        setModal("CREATE");
    };

    const openEditModal = (item) => {
        setSelectedInbound(item);
        setForm({
            poDate: toDateOnly(item.poDate),
            vendor: item.vendor || "",
            material: item.material || "",
            category: item.category || "",
            quantityOrdered: item.quantityOrdered ?? "",
            receivedQuantity: item.receivedQuantity ?? "",
            eta: toDateOnly(item.eta),
            lrNumber: item.lrNumber || "",
            transport: item.transport || "",
            freight: item.freight ?? "",
            receivedDate: toDateOnly(item.receivedDate),
            warehouse: item.warehouse || "",
            billLocation: item.billLocation || "",
            qualityCheck: item.qualityCheck || "PENDING",
            quantityCheck: item.quantityCheck || "PENDING",
            status: item.status || "IN_TRANSIT",
            value: item.value ?? "",
            remarks: item.remarks || "",
        });
        setModal("EDIT");
    };

    const openViewModal = (item) => {
        setSelectedInbound(item);
        setModal("VIEW");
    };

    const closeModal = () => {
        if (saving) return;
        setModal(null);
        setSelectedInbound(null);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const buildPayload = () => ({
        poDate: form.poDate || null,
        vendor: form.vendor,
        material: form.material,
        category: form.category || "",
        quantityOrdered: Number(form.quantityOrdered),
        receivedQuantity:
            form.receivedQuantity === ""
                ? 0
                : Number(form.receivedQuantity),
        eta: form.eta || null,
        lrNumber: form.lrNumber || "",
        transport: form.transport || "",
        freight: form.freight === "" ? 0 : Number(form.freight),
        receivedDate: form.receivedDate || null,
        warehouse: form.warehouse,
        billLocation: form.billLocation || "",
        qualityCheck: form.qualityCheck,
        quantityCheck: form.quantityCheck,
        status: form.status,
        value: form.value === "" ? 0 : Number(form.value),
        remarks: form.remarks || "",
    });

    const submitCreate = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);

            const response = await axios.post(
                `${API_BASE_URL}/inbound`,
                buildPayload(),
                authConfig()
            );

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message || "Failed to create GRN"
                );
            }

            closeModal();
            await fetchDashboard();
            alert("GRN created successfully");
        } catch (err) {
            console.error(
                "Create inbound error:",
                err?.response?.data || err
            );
            alert(getApiError(err, "Failed to create GRN"));
        } finally {
            setSaving(false);
        }
    };

    const submitEdit = async (e) => {
        e.preventDefault();

        if (!selectedInbound?._id) return;

        try {
            setSaving(true);

            const response = await axios.put(
                `${API_BASE_URL}/inbound/${selectedInbound._id}`,
                buildPayload(),
                authConfig()
            );

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message || "Failed to update GRN"
                );
            }

            closeModal();
            await fetchDashboard();
            alert("GRN updated successfully");
        } catch (err) {
            console.error(
                "Update inbound error:",
                err?.response?.data || err
            );
            alert(getApiError(err, "Failed to update GRN"));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        const confirmed = window.confirm(
            `Delete ${item.grnNumber}?`
        );

        if (!confirmed) return;

        try {
            setSaving(true);

            const response = await axios.delete(
                `${API_BASE_URL}/inbound/${item._id}`,
                authConfig()
            );

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message || "Failed to delete GRN"
                );
            }

            setModal(null);
            setSelectedInbound(null);
            await fetchDashboard();
            alert("GRN deleted successfully");
        } catch (err) {
            console.error(
                "Delete inbound error:",
                err?.response?.data || err
            );
            alert(getApiError(err, "Failed to delete GRN"));
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (item, status) => {
        try {
            setSaving(true);

            const response = await axios.patch(
                `${API_BASE_URL}/inbound/${item._id}/status`,
                { status },
                authConfig()
            );

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message ||
                    "Failed to update status"
                );
            }

            setSelectedInbound(response.data.inbound);
            await fetchDashboard();
        } catch (err) {
            console.error(
                "Inbound status error:",
                err?.response?.data || err
            );
            alert(getApiError(err, "Failed to update status"));
        } finally {
            setSaving(false);
        }
    };

    const updateQualityCheck = async (item, qualityCheck) => {
        try {
            setSaving(true);

            const response = await axios.patch(
                `${API_BASE_URL}/inbound/${item._id}/quality-check`,
                { qualityCheck },
                authConfig()
            );

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message ||
                    "Failed to update quality check"
                );
            }

            setSelectedInbound(response.data.inbound);
            await fetchDashboard();
        } catch (err) {
            console.error(
                "Quality check error:",
                err?.response?.data || err
            );
            alert(
                getApiError(
                    err,
                    "Failed to update quality check"
                )
            );
        } finally {
            setSaving(false);
        }
    };

    const updateQuantityCheck = async (item, quantityCheck) => {
        try {
            setSaving(true);

            const response = await axios.patch(
                `${API_BASE_URL}/inbound/${item._id}/quantity-check`,
                { quantityCheck },
                authConfig()
            );

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message ||
                    "Failed to update quantity check"
                );
            }

            setSelectedInbound(response.data.inbound);
            await fetchDashboard();
        } catch (err) {
            console.error(
                "Quantity check error:",
                err?.response?.data || err
            );
            alert(
                getApiError(
                    err,
                    "Failed to update quantity check"
                )
            );
        } finally {
            setSaving(false);
        }
    };

    const exportCsv = () => {
        const rows = [
            [
                "GRN No.",
                "GRN Date",
                "PO Date",
                "Vendor",
                "Material",
                "Category",
                "Warehouse",
                "Quantity Ordered",
                "Received Quantity",
                "ETA",
                "LR Number",
                "Transport",
                "Freight",
                "Received Date",
                "Bill Location",
                "Quality Check",
                "Quantity Check",
                "Status",
                "Value",
                "Remarks",
            ],
            ...inbounds.map((item) => [
                item.grnNumber,
                formatDateTime(item.grnDate),
                formatDate(item.poDate),
                item.vendor,
                item.material,
                item.category,
                item.warehouse,
                item.quantityOrdered,
                item.receivedQuantity,
                formatDate(item.eta),
                item.lrNumber,
                item.transport,
                item.freight,
                formatDate(item.receivedDate),
                item.billLocation,
                qcLabel(item.qualityCheck),
                quantityCheckLabel(item.quantityCheck),
                statusLabel(item.status),
                item.value,
                item.remarks,
            ]),
        ];

        const csv = rows
            .map((row) => row.map(escapeCsv).join(","))
            .join("");

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `inbound-grn-report-${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    };

    const importCsv = (file) => {
        if (!file) return;

        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const text = String(event.target?.result || "");
                const lines = text.split(/\r?\n/).filter(Boolean);

                if (lines.length < 2) {
                    throw new Error("CSV has no data rows");
                }

                const headers = parseCsvRow(lines[0]);
                const rows = lines.slice(1).map(parseCsvRow);

                let importedCount = 0;

                for (const values of rows) {
                    const record = {};
                    headers.forEach((header, index) => {
                        record[String(header || "").trim()] =
                            values[index] ?? "";
                    });

                    if (
                        !record.Vendor ||
                        !record.Material ||
                        !record["Quantity Ordered"] ||
                        !record.Warehouse
                    ) {
                        continue;
                    }

                    await axios.post(
                        `${API_BASE_URL}/inbound`,
                        {
                            poDate: record["PO Date"] || null,
                            vendor: record.Vendor,
                            material: record.Material,
                            category: record.Category || "",
                            quantityOrdered: Number(
                                record["Quantity Ordered"]
                            ),
                            receivedQuantity:
                                record["Received Quantity"] === ""
                                    ? 0
                                    : Number(
                                        record["Received Quantity"]
                                    ),
                            eta: record.ETA || null,
                            lrNumber: record["LR Number"] || "",
                            transport: record.Transport || "",
                            freight: Number(record.Freight || 0),
                            receivedDate:
                                record["Received Date"] || null,
                            warehouse: record.Warehouse,
                            billLocation: record["Bill Location"] || "",
                            qualityCheck:
                                record["Quality Check"] || "PENDING",
                            quantityCheck:
                                record["Quantity Check"] || "PENDING",
                            status: record.Status || "IN_TRANSIT",
                            value: Number(record.Value || 0),
                            remarks: record.Remarks || "",
                        },
                        authConfig()
                    );

                    importedCount += 1;
                }

                await fetchDashboard();
                alert(
                    `${importedCount} GRN record(s) imported successfully`
                );
            } catch (err) {
                console.error(
                    "Import inbound error:",
                    err?.response?.data || err
                );
                alert(
                    getApiError(
                        err,
                        "Failed to import GRN CSV"
                    )
                );
            }
        };

        reader.readAsText(file);
    };

    const statusTotal = useMemo(
        () =>
            (overview.statusData || []).reduce(
                (sum, item) => sum + Number(item?.count || 0),
                0
            ),
        [overview.statusData]
    );

    const statusGradient = useMemo(() => {
        const data = (overview.statusData || []).filter(
            (item) => Number(item?.count || 0) > 0
        );

        if (!data.length || statusTotal <= 0) {
            return "#e2e8f0";
        }

        const colors = {
            RECEIVED: "#16a34a",
            IN_TRANSIT: "#2563eb",
            PENDING_QC: "#f59e0b",
            REJECTED: "#ef4444",
            CANCELLED: "#7c3aed",
        };

        let degree = 0;

        const segments = data.map((item) => {
            const value = Number(item?.count || 0);
            const segment = (value / statusTotal) * 360;
            const start = degree;
            const end = degree + segment;
            degree = end;

            return `${colors[item._id] || "#94a3b8"
                } ${start}deg ${end}deg`;
        });

        return `conic-gradient(${segments.join(", ")})`;
    }, [overview.statusData, statusTotal]);

    const trendPoints = useMemo(() => {
        const sorted = [...(overview.trendData || [])].sort(
            (a, b) =>
                Number(a?._id?.year || 0) -
                Number(b?._id?.year || 0) ||
                Number(a?._id?.month || 0) -
                Number(b?._id?.month || 0)
        );

        if (!sorted.length) {
            return { points: "", labels: [] };
        }

        const width = 420;
        const height = 180;
        const max = Math.max(
            ...sorted.map((item) =>
                Number(item?.quantity || 0)
            ),
            1
        );

        const points = sorted.map((item, index) => {
            const x =
                sorted.length === 1
                    ? width / 2
                    : (index / (sorted.length - 1)) * width;

            const y =
                height -
                (Number(item?.quantity || 0) / max) *
                (height - 20);

            return {
                x,
                y,
                label: `${item?._id?.month || "-"}/${item?._id?.year || ""}`,
                value: Number(item?.quantity || 0),
            };
        });

        return {
            points: points
                .map((item) => `${item.x},${item.y}`)
                .join(" "),
            labels: points,
        };
    }, [overview.trendData]);

    const receivedMonthQuantity = useMemo(
        () =>
            monthlyStats
                .filter(
                    (item) =>
                        item?._id?.status === "RECEIVED"
                )
                .reduce(
                    (sum, item) =>
                        sum + Number(item?.quantity || 0),
                    0
                ),
        [monthlyStats]
    );

    const transitMonthQuantity = useMemo(
        () =>
            monthlyStats
                .filter(
                    (item) =>
                        item?._id?.status === "IN_TRANSIT"
                )
                .reduce(
                    (sum, item) =>
                        sum + Number(item?.quantity || 0),
                    0
                ),
        [monthlyStats]
    );

    const pendingQCMonthQuantity = useMemo(
        () =>
            monthlyStats
                .filter(
                    (item) =>
                        item?._id?.status === "PENDING_QC"
                )
                .reduce(
                    (sum, item) =>
                        sum + Number(item?.quantity || 0),
                    0
                ),
        [monthlyStats]
    );

    const rejectedMonthQuantity = useMemo(
        () =>
            monthlyStats
                .filter(
                    (item) =>
                        item?._id?.status === "REJECTED"
                )
                .reduce(
                    (sum, item) =>
                        sum + Number(item?.quantity || 0),
                    0
                ),
        [monthlyStats]
    );

    const cancelledMonthQuantity = useMemo(
        () =>
            monthlyStats
                .filter(
                    (item) =>
                        item?._id?.status === "CANCELLED"
                )
                .reduce(
                    (sum, item) =>
                        sum + Number(item?.quantity || 0),
                    0
                ),
        [monthlyStats]
    );

    const [inboundCurrentPage, setInboundCurrentPage] = useState(1);
    const INBOUND_ITEMS_PER_PAGE = 10;

    const inboundTotalPages = Math.ceil(
        inbounds.length / INBOUND_ITEMS_PER_PAGE
    );

    const inboundStartIndex =
        (inboundCurrentPage - 1) * INBOUND_ITEMS_PER_PAGE;

    const paginatedInbounds = inbounds.slice(
        inboundStartIndex,
        inboundStartIndex + INBOUND_ITEMS_PER_PAGE
    );

    return (
        <div className="inbound-material-management-page">
            <div className="inbound-page-header">
                <div>
                    <h1>Inbound Material Management</h1>
                    <div className="inbound-breadcrumb">
                        <span>Dashboard</span>
                        <span>›</span>
                        <span>Inbound Material Management</span>
                        <span>›</span>
                        <span>Overview</span>
                    </div>
                </div>

                <div className="inbound-header-actions">
                    <label className="inbound-secondary-btn">
                        <Upload size={15} />
                        Import GRN
                        <input
                            type="file"
                            accept=".csv,text/csv"
                            hidden
                            onChange={(e) => {
                                importCsv(e.target.files?.[0]);
                                e.target.value = "";
                            }}
                        />
                    </label>

                    <button
                        type="button"
                        className="inbound-secondary-btn"
                        onClick={exportCsv}
                    >
                        <Download size={15} />
                        Export
                    </button>

                    <button
                        type="button"
                        className="inbound-primary-btn"
                        onClick={openCreateModal}
                    >
                        <Plus size={16} />
                        Add GRN
                        <ChevronDown size={14} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="inbound-page-error">
                    {error}
                </div>
            )}

            <div className="inbound-stats-grid">
                <div className="inbound-stat-card">
                    <div className="inbound-stat-icon blue">
                        <FileText size={18} />
                    </div>
                    <div>
                        <span>Total GRNs</span>
                        <strong>
                            {loading ? "..." : formatNumber(stats.totalGRNs)}
                        </strong>
                    </div>
                </div>

                <div className="inbound-stat-card">
                    <div className="inbound-stat-icon orange">
                        <PackageCheck size={18} />
                    </div>
                    <div>
                        <span>Total Quantity (MT/Ltrs)</span>
                        <strong>
                            {loading
                                ? "..."
                                : formatNumber(stats.totalQuantity)}
                        </strong>
                    </div>
                </div>

                <div className="inbound-stat-card">
                    <div className="inbound-stat-icon purple">
                        <FileText size={18} />
                    </div>
                    <div>
                        <span>Total Value (₹)</span>
                        <strong>
                            {loading
                                ? "..."
                                : formatCurrency(stats.totalValue)}
                        </strong>
                    </div>
                </div>

                <div className="inbound-stat-card">
                    <div className="inbound-stat-icon blue">
                        <Clock3 size={18} />
                    </div>
                    <div>
                        <span>In Transit</span>
                        <strong>
                            {loading ? "..." : formatNumber(stats.inTransit)}
                        </strong>
                    </div>
                </div>

                <div className="inbound-stat-card">
                    <div className="inbound-stat-icon amber">
                        <ClipboardCheck size={18} />
                    </div>
                    <div>
                        <span>Pending Quality Check</span>
                        <strong>
                            {loading ? "..." : formatNumber(stats.pendingQC)}
                        </strong>
                    </div>
                </div>

                <div className="inbound-stat-card">
                    <div className="inbound-stat-icon red">
                        <XCircle size={18} />
                    </div>
                    <div>
                        <span>Rejected GRNs</span>
                        <strong>
                            {loading
                                ? "..."
                                : formatNumber(stats.rejectedGRNs)}
                        </strong>
                    </div>
                </div>
            </div>

            <div className="inbound-filter-card">
                <div className="inbound-filter-field date-range-field">
                    <label>Date Range</label>
                    <div className="inbound-date-range">
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                        />
                        <span>to</span>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                        />
                    </div>
                </div>

                <div className="inbound-filter-field">
                    <label>Status</label>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="ALL">All Status</option>
                        {STATUS_OPTIONS.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="inbound-filter-field">
                    <label>Material Category</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) =>
                            setSelectedCategory(e.target.value)
                        }
                    >
                        <option value="ALL">All Categories</option>
                        {categoryOptions.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="inbound-filter-field">
                    <label>Warehouse</label>
                    <select
                        value={selectedWarehouse}
                        onChange={(e) =>
                            setSelectedWarehouse(e.target.value)
                        }
                    >
                        <option value="ALL">All Warehouses</option>
                        {warehouseOptions.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="inbound-filter-field">
                    <label>Supplier</label>
                    <select
                        value={selectedVendor}
                        onChange={(e) =>
                            setSelectedVendor(e.target.value)
                        }
                    >
                        <option value="ALL">All Suppliers</option>
                        {vendorOptions.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="inbound-filter-actions">
                    <button
                        type="button"
                        className="inbound-filter-btn"
                        onClick={fetchDashboard}
                    >
                        <Filter size={15} />
                        Filters
                    </button>
                    <button
                        type="button"
                        className="inbound-reset-btn"
                        onClick={() => {
                            setDateFrom("");
                            setDateTo("");
                            setSelectedStatus("ALL");
                            setSelectedCategory("ALL");
                            setSelectedWarehouse("ALL");
                            setSelectedVendor("ALL");
                            setTimeout(() => fetchDashboard(), 0);
                        }}
                    >
                        <RotateCcw size={14} />
                        Reset
                    </button>
                </div>
            </div>

            <div className="inbound-analytics-grid">
                <div className="inbound-panel">
                    <div className="inbound-panel-header">
                        <div>
                            <h2>GRN Status</h2>
                            <p>Status-wise GRN distribution</p>
                        </div>
                    </div>

                    <div className="inbound-status-chart">
                        <div
                            className="inbound-donut"
                            style={{ background: statusGradient }}
                        >
                            <div>
                                <strong>
                                    {formatNumber(statusTotal)}
                                </strong>
                                <span>Total GRNs</span>
                            </div>
                        </div>

                        <div className="inbound-status-legend">
                            {overview.statusData?.length === 0 ? (
                                <div className="inbound-empty-small">
                                    No status data.
                                </div>
                            ) : (
                                overview.statusData.map((item) => {
                                    const count = Number(
                                        item?.count || 0
                                    );
                                    const percent =
                                        statusTotal > 0
                                            ? (
                                                (count / statusTotal) *
                                                100
                                            ).toFixed(1)
                                            : "0.0";

                                    return (
                                        <div
                                            key={item._id}
                                            className="inbound-status-row"
                                        >
                                            <span>
                                                <i
                                                    className={`inbound-legend-dot inbound-status-dot-${String(
                                                        item._id
                                                    ).toLowerCase()}`}
                                                />
                                                {statusLabel(item._id)}
                                            </span>
                                            <strong>
                                                {formatNumber(count)} (
                                                {percent}%)
                                            </strong>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                <div className="inbound-panel">
                    <div className="inbound-panel-header">
                        <div>
                            <h2>Inbound Trend (MT/Ltrs)</h2>
                            <p>Monthly inbound quantity</p>
                        </div>
                    </div>

                    <div className="inbound-trend-chart">
                        {trendPoints.labels.length === 0 ? (
                            <div className="inbound-empty-small">
                                No trend data.
                            </div>
                        ) : (
                            <>
                                <svg
                                    viewBox="0 0 420 220"
                                    className="inbound-line-chart"
                                    preserveAspectRatio="none"
                                >
                                    <line
                                        x1="0"
                                        y1="180"
                                        x2="420"
                                        y2="180"
                                        stroke="#e2e8f0"
                                        strokeWidth="1"
                                    />
                                    <line
                                        x1="0"
                                        y1="90"
                                        x2="420"
                                        y2="90"
                                        stroke="#eef2f7"
                                        strokeWidth="1"
                                    />
                                    <line
                                        x1="0"
                                        y1="20"
                                        x2="420"
                                        y2="20"
                                        stroke="#eef2f7"
                                        strokeWidth="1"
                                    />
                                    <polyline
                                        points={trendPoints.points}
                                        fill="none"
                                        stroke="#2563eb"
                                        strokeWidth="3"
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                    />
                                    {trendPoints.labels.map((point) => (
                                        <circle
                                            key={`${point.label}-${point.x}`}
                                            cx={point.x}
                                            cy={point.y}
                                            r="4"
                                            fill="#2563eb"
                                        />
                                    ))}
                                </svg>

                                <div className="inbound-trend-labels">
                                    {trendPoints.labels.map((point) => (
                                        <span key={`${point.label}-label`}>
                                            {point.label}
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="inbound-panel">
                    <div className="inbound-panel-header">
                        <div>
                            <h2>Top Suppliers (By Value)</h2>
                            <p>Highest inbound value</p>
                        </div>
                    </div>

                    <div className="inbound-supplier-list">
                        {overview.supplierData?.length === 0 ? (
                            <div className="inbound-empty-small">
                                No supplier data.
                            </div>
                        ) : (
                            overview.supplierData.map((item, index) => (
                                <div
                                    key={item._id}
                                    className="inbound-supplier-row"
                                >
                                    <div>
                                        <span className="inbound-rank">
                                            {index + 1}
                                        </span>
                                        <strong>
                                            {item._id || "-"}
                                        </strong>
                                    </div>
                                    <span>
                                        {formatCurrency(item.value)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="inbound-main-grid">
                <div>
                    <div className="inbound-panel">
                        <div className="inbound-panel-header">
                            <div>
                                <h2>
                                    Recent Inbound Material (GRNs)
                                </h2>
                                <p>
                                    Latest inbound material receipts
                                </p>
                            </div>
                            <span className="inbound-record-count">
                                {inbounds.length} records
                            </span>
                        </div>

                        <div className="inbound-table-wrapper">
                            <table className="inbound-table">
                                <thead>
                                    <tr>
                                        <th>GRN No.</th>
                                        <th>GRN Date</th>
                                        <th>Supplier</th>
                                        <th>Material</th>
                                        <th>Category</th>
                                        <th>Warehouse</th>
                                        <th>Qty (MT/Ltrs)</th>
                                        <th>Value (₹)</th>
                                        <th>Status</th>
                                        <th>QC Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan="11"
                                                className="inbound-empty-cell"
                                            >
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : inbounds.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="11"
                                                className="inbound-empty-cell"
                                            >
                                                No inbound GRNs found.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedInbounds.map((item) => (
                                            <tr key={item._id}>
                                                <td>
                                                    <strong>
                                                        {item.grnNumber}
                                                    </strong>
                                                </td>
                                                <td>
                                                    {formatDateTime(
                                                        item.grnDate
                                                    )}
                                                </td>
                                                <td>{item.vendor}</td>
                                                <td>{item.material}</td>
                                                <td>
                                                    {item.category || "-"}
                                                </td>
                                                <td>{item.warehouse}</td>
                                                <td>
                                                    {formatNumber(
                                                        item.receivedQuantity ||
                                                        item.quantityOrdered
                                                    )}
                                                </td>
                                                <td>
                                                    {formatCurrency(item.value)}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`inbound-status-badge inbound-status-${String(
                                                            item.status || ""
                                                        ).toLowerCase()}`}
                                                    >
                                                        {statusLabel(
                                                            item.status
                                                        )}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`inbound-qc-badge inbound-qc-${String(
                                                            item.qualityCheck ||
                                                            ""
                                                        ).toLowerCase()}`}
                                                    >
                                                        {qcLabel(
                                                            item.qualityCheck
                                                        )}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="inbound-action-group">
                                                        <button
                                                            type="button"
                                                            className="inbound-icon-btn"
                                                            title="View"
                                                            onClick={() =>
                                                                openViewModal(
                                                                    item
                                                                )
                                                            }
                                                        >
                                                            <Eye size={15} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="inbound-icon-btn"
                                                            title="Edit"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    item
                                                                )
                                                            }
                                                        >
                                                            <Pencil size={15} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="inbound-icon-btn danger"
                                                            title="Delete"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    item
                                                                )
                                                            }
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>



                        <div className="inbound-pagination">
                            <span>
                                Showing{" "}
                                {inbounds.length === 0 ? 0 : inboundStartIndex + 1}{" "}
                                to{" "}
                                {Math.min(
                                    inboundStartIndex + INBOUND_ITEMS_PER_PAGE,
                                    inbounds.length
                                )}{" "}
                                of {inbounds.length} entries
                            </span>

                            <div className="inbound-pagination-controls">
                                <button
                                    type="button"
                                    disabled={inboundCurrentPage === 1}
                                    onClick={() =>
                                        setInboundCurrentPage((prev) =>
                                            Math.max(1, prev - 1)
                                        )
                                    }
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                {Array.from(
                                    { length: inboundTotalPages },
                                    (_, index) => index + 1
                                ).map((page) => (
                                    <button
                                        type="button"
                                        key={page}
                                        className={
                                            inboundCurrentPage === page ? "active" : ""
                                        }
                                        onClick={() => setInboundCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    disabled={
                                        inboundCurrentPage === inboundTotalPages ||
                                        inboundTotalPages === 0
                                    }
                                    onClick={() =>
                                        setInboundCurrentPage((prev) =>
                                            Math.min(inboundTotalPages, prev + 1)
                                        )
                                    }
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="inbound-monthly-grid">
                        <div className="inbound-monthly-card">
                            <div className="inbound-stat-icon green">
                                <PackageCheck size={18} />
                            </div>
                            <div>
                                <span>Total Received (MT/Ltrs)</span>
                                <strong>
                                    {formatNumber(receivedMonthQuantity)}
                                </strong>
                            </div>
                        </div>

                        <div className="inbound-monthly-card">
                            <div className="inbound-stat-icon blue">
                                <Clock3 size={18} />
                            </div>
                            <div>
                                <span>Total In Transit (MT/Ltrs)</span>
                                <strong>
                                    {formatNumber(transitMonthQuantity)}
                                </strong>
                            </div>
                        </div>

                        <div className="inbound-monthly-card">
                            <div className="inbound-stat-icon amber">
                                <ClipboardCheck size={18} />
                            </div>
                            <div>
                                <span>Total Pending QC (MT/Ltrs)</span>
                                <strong>
                                    {formatNumber(
                                        pendingQCMonthQuantity
                                    )}
                                </strong>
                            </div>
                        </div>

                        <div className="inbound-monthly-card">
                            <div className="inbound-stat-icon red">
                                <XCircle size={18} />
                            </div>
                            <div>
                                <span>Total Rejected (MT/Ltrs)</span>
                                <strong>
                                    {formatNumber(
                                        rejectedMonthQuantity
                                    )}
                                </strong>
                            </div>
                        </div>

                        <div className="inbound-monthly-card">
                            <div className="inbound-stat-icon purple">
                                <XCircle size={18} />
                            </div>
                            <div>
                                <span>Total Cancelled (MT/Ltrs)</span>
                                <strong>
                                    {formatNumber(
                                        cancelledMonthQuantity
                                    )}
                                </strong>
                            </div>
                        </div>

                        <div className="inbound-monthly-card">
                            <div className="inbound-stat-icon blue">
                                <FileText size={18} />
                            </div>
                            <div>
                                <span>Total Value (₹)</span>
                                <strong>
                                    {formatCurrency(
                                        monthlyStats.reduce(
                                            (sum, item) =>
                                                sum +
                                                Number(item?.value || 0),
                                            0
                                        )
                                    )}
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="inbound-panel">
                        <div className="inbound-panel-header">
                            <div>
                                <h2>Quick Actions</h2>
                                <p>Common GRN operations</p>
                            </div>
                        </div>

                        <div className="inbound-quick-actions">
                            <button
                                type="button"
                                onClick={openCreateModal}
                            >
                                <Plus size={16} />
                                <span>
                                    <strong>Add GRN</strong>
                                    <small>Create a new GRN</small>
                                </span>
                                <span>›</span>
                            </button>

                            <label>
                                <Upload size={16} />
                                <span>
                                    <strong>Import GRN</strong>
                                    <small>Import GRNs from CSV</small>
                                </span>
                                <span>›</span>
                                <input
                                    type="file"
                                    accept=".csv,text/csv"
                                    hidden
                                    onChange={(e) => {
                                        importCsv(
                                            e.target.files?.[0]
                                        );
                                        e.target.value = "";
                                    }}
                                />
                            </label>

                            <button
                                type="button"
                                onClick={() => {
                                    const item =
                                        alerts.pendingQC?.[0];
                                    if (item) {
                                        openViewModal(item);
                                    } else {
                                        alert(
                                            "No quality check pending GRN"
                                        );
                                    }
                                }}
                            >
                                <ClipboardCheck size={16} />
                                <span>
                                    <strong>
                                        Quality Check Pending
                                    </strong>
                                    <small>
                                        {Array.isArray(alerts.pendingQC)
                                            ? alerts.pendingQC.length
                                            : 0}{" "}
                                        pending record(s)
                                    </small>
                                </span>
                                <span>›</span>
                            </button>

                            <button
                                type="button"
                                onClick={exportCsv}
                            >
                                <FileText size={16} />
                                <span>
                                    <strong>Inward Reports</strong>
                                    <small>
                                        Export inbound report
                                    </small>
                                </span>
                                <span>›</span>
                            </button>
                        </div>
                    </div>

                    <div className="inbound-panel">
                        <div className="inbound-panel-header">
                            <div>
                                <h2>GRN Summary</h2>
                                <p>Inbound material summary</p>
                            </div>
                        </div>

                        <div className="inbound-summary-list">
                            <div>
                                <span>Total GRNs</span>
                                <strong>
                                    {formatNumber(
                                        summary?.totalGRNs ??
                                        stats.totalGRNs
                                    )}
                                </strong>
                            </div>
                            <div>
                                <span>Total Quantity</span>
                                <strong>
                                    {formatNumber(
                                        summary?.totalQuantity
                                    )}
                                </strong>
                            </div>
                            <div>
                                <span>Total Value</span>
                                <strong>
                                    {formatCurrency(
                                        summary?.totalValue
                                    )}
                                </strong>
                            </div>
                            <div>
                                <span>Average GRN Value</span>
                                <strong>
                                    {formatCurrency(
                                        summary?.averageGRNValue
                                    )}
                                </strong>
                            </div>
                            <div>
                                <span>Pending QC</span>
                                <strong>
                                    {formatNumber(summary?.pendingQC)}
                                </strong>
                            </div>
                            <div>
                                <span>Rejected GRNs</span>
                                <strong>
                                    {formatNumber(summary?.rejectedGRNs)}
                                </strong>
                            </div>
                            <div>
                                <span>Cancelled GRNs</span>
                                <strong>
                                    {formatNumber(
                                        summary?.cancelledGRNs
                                    )}
                                </strong>
                            </div>
                        </div>
                    </div>

                    <div className="inbound-panel">
                        <div className="inbound-panel-header">
                            <div>
                                <h2>Live Alerts</h2>
                                <p>Current inbound attention items</p>
                            </div>
                        </div>

                        <div className="inbound-alert-list">
                            {(alerts.pendingQC || [])
                                .slice(0, 3)
                                .map((item) => (
                                    <button
                                        type="button"
                                        className="inbound-alert-row"
                                        key={`qc-${item._id}`}
                                        onClick={() =>
                                            openViewModal(item)
                                        }
                                    >
                                        <ClipboardCheck size={16} />
                                        <span>
                                            {item.grnNumber} is pending
                                            quality check
                                        </span>
                                    </button>
                                ))}

                            {(alerts.rejected || [])
                                .slice(0, 3)
                                .map((item) => (
                                    <button
                                        type="button"
                                        className="inbound-alert-row"
                                        key={`reject-${item._id}`}
                                        onClick={() =>
                                            openViewModal(item)
                                        }
                                    >
                                        <XCircle size={16} />
                                        <span>
                                            {item.grnNumber} has been rejected
                                        </span>
                                    </button>
                                ))}

                            {(alerts.inTransit || [])
                                .slice(0, 3)
                                .map((item) => (
                                    <button
                                        type="button"
                                        className="inbound-alert-row"
                                        key={`transit-${item._id}`}
                                        onClick={() =>
                                            openViewModal(item)
                                        }
                                    >
                                        <Clock3 size={16} />
                                        <span>
                                            {item.grnNumber} is in transit
                                        </span>
                                    </button>
                                ))}

                            {(alerts.quantityMismatch || [])
                                .slice(0, 3)
                                .map((item) => (
                                    <button
                                        type="button"
                                        className="inbound-alert-row"
                                        key={`qty-${item._id}`}
                                        onClick={() =>
                                            openViewModal(item)
                                        }
                                    >
                                        <AlertTriangle size={16} />
                                        <span>
                                            {item.grnNumber} has a quantity
                                            mismatch
                                        </span>
                                    </button>
                                ))}

                            {(alerts.pendingQC || []).length === 0 &&
                                (alerts.rejected || []).length === 0 &&
                                (alerts.inTransit || []).length === 0 &&
                                (alerts.quantityMismatch || []).length === 0 ? (
                                <div className="inbound-empty-small">
                                    No live alerts.
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            {(modal === "CREATE" || modal === "EDIT") && (
                <div
                    className="inbound-modal-overlay"
                    onClick={closeModal}
                >
                    <div
                        className="inbound-modal large"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="inbound-modal-header">
                            <div>
                                <h2>
                                    {modal === "CREATE"
                                        ? "Add GRN"
                                        : "Edit GRN"}
                                </h2>
                                <p>
                                    {modal === "CREATE"
                                        ? "Record inbound raw material."
                                        : "Update inbound material details."}
                                </p>
                            </div>
                        </div>

                        <form
                            className="inbound-modal-form"
                            onSubmit={
                                modal === "CREATE"
                                    ? submitCreate
                                    : submitEdit
                            }
                        >
                            <div className="inbound-form-grid">
                                <div className="inbound-form-group">
                                    <label>PO Date</label>
                                    <input
                                        type="date"
                                        name="poDate"
                                        value={form.poDate}
                                        onChange={handleFormChange}
                                    />
                                </div>

                                <div className="inbound-form-group">
                                    <label>Vendor *</label>
                                    <input
                                        name="vendor"
                                        value={form.vendor}
                                        onChange={(e) => /^[A-Za-z\s]*$/.test(e.target.value) && handleFormChange(e)}
                                        required
                                    />
                                </div>

                                <div className="inbound-form-group">
                                    <label>Material *</label>
                                    <input
                                        name="material"
                                        value={form.material}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>

                                <div className="inbound-form-group">
                                    <label>Category</label>
                                    <input
                                        name="category"
                                        value={form.category}
                                        onChange={handleFormChange}
                                        placeholder="Raw Material"
                                    />
                                </div>

                                <div className="inbound-form-group">
                                    <label>Quantity Ordered *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        name="quantityOrdered"
                                        value={form.quantityOrdered}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>

                                <div className="inbound-form-group">
                                    <label>Received Quantity</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        name="receivedQuantity"
                                        value={form.receivedQuantity}
                                        onChange={handleFormChange}
                                    />
                                </div>

                                <div className="inbound-form-group">
                                    <label>ETA</label>
                                    <input
                                        type="date"
                                        name="eta"
                                        value={form.eta}
                                        onChange={handleFormChange}
                                    />
                                </div>

                                <div className="inbound-form-group">
                                    <label>LR Number</label>
                                    <input
                                        name="lrNumber"
                                        value={form.lrNumber}
                                        onChange={handleFormChange}
                                    />
                                </div>

                                <div className="inbound-form-group">
                                    <label>Transport</label>
                                    <input
                                        name="transport"
                                        value={form.transport}
                                        onChange={handleFormChange}
                                    />
                                </div>

                                <div className="inbound-form-group">
                                    <label>Freight</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        name="freight"
                                        value={form.freight}
                                        onChange={handleFormChange}
                                    />
                                </div>

                                <div className="inbound-form-group">
                                    <label>Received Date</label>
                                    <input
                                        type="date"
                                        name="receivedDate"
                                        value={form.receivedDate}
                                        onChange={handleFormChange}
                                    />
                                </div>

                                <div className="inbound-form-group">
                                    <label>Warehouse *</label>
                                    <input
                                        name="warehouse"
                                        value={form.warehouse}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>

                                <div className="inbound-form-group">
                                    <label>Bill Location</label>
                                    <input
                                        name="billLocation"
                                        value={form.billLocation}
                                        onChange={handleFormChange}
                                    />
                                </div>

                                <div className="inbound-form-group">
                                    <label>Quality Check</label>
                                    <select
                                        name="qualityCheck"
                                        value={form.qualityCheck}
                                        onChange={handleFormChange}
                                    >
                                        {QC_OPTIONS.map((item) => (
                                            <option
                                                key={item.value}
                                                value={item.value}
                                            >
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="inbound-form-group">
                                    <label>Quantity Check</label>
                                    <select
                                        name="quantityCheck"
                                        value={form.quantityCheck}
                                        onChange={handleFormChange}
                                    >
                                        {QUANTITY_CHECK_OPTIONS.map((item) => (
                                            <option
                                                key={item.value}
                                                value={item.value}
                                            >
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="inbound-form-group">
                                    <label>Status</label>
                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleFormChange}
                                    >
                                        {STATUS_OPTIONS.map((item) => (
                                            <option
                                                key={item.value}
                                                value={item.value}
                                            >
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="inbound-form-group">
                                    <label>Value (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        name="value"
                                        value={form.value}
                                        onChange={handleFormChange}
                                    />
                                </div>

                                <div className="inbound-form-group full-width">
                                    <label>Remarks</label>
                                    <textarea
                                        name="remarks"
                                        rows="3"
                                        value={form.remarks}
                                        onChange={handleFormChange}
                                    />
                                </div>
                            </div>

                            <div className="inbound-modal-footer">
                                <button
                                    type="button"
                                    className="inbound-secondary-btn"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inbound-primary-btn"
                                    disabled={saving}
                                >
                                    <Save size={15} />
                                    {saving
                                        ? "Saving..."
                                        : modal === "CREATE"
                                            ? "Create GRN"
                                            : "Update GRN"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {modal === "VIEW" && selectedInbound && (
                <div
                    className="inbound-modal-overlay"
                    onClick={closeModal}
                >
                    <div
                        className="inbound-modal large"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="inbound-modal-header">
                            <div>
                                <h2>GRN Details</h2>
                                <p>{selectedInbound.grnNumber}</p>
                            </div>
                        </div>

                        <div className="inbound-detail-grid">
                            {[
                                ["GRN No.", selectedInbound.grnNumber],
                                [
                                    "GRN Date",
                                    formatDateTime(selectedInbound.grnDate),
                                ],
                                [
                                    "PO Date",
                                    formatDate(selectedInbound.poDate),
                                ],
                                ["Vendor", selectedInbound.vendor],
                                ["Material", selectedInbound.material],
                                [
                                    "Category",
                                    selectedInbound.category || "-",
                                ],
                                [
                                    "Quantity Ordered",
                                    formatNumber(
                                        selectedInbound.quantityOrdered
                                    ),
                                ],
                                [
                                    "Received Quantity",
                                    formatNumber(
                                        selectedInbound.receivedQuantity
                                    ),
                                ],
                                [
                                    "ETA",
                                    formatDate(selectedInbound.eta),
                                ],
                                [
                                    "LR Number",
                                    selectedInbound.lrNumber || "-",
                                ],
                                [
                                    "Transport",
                                    selectedInbound.transport || "-",
                                ],
                                [
                                    "Freight",
                                    formatCurrency(selectedInbound.freight),
                                ],
                                [
                                    "Received Date",
                                    formatDate(selectedInbound.receivedDate),
                                ],
                                ["Warehouse", selectedInbound.warehouse],
                                [
                                    "Bill Location",
                                    selectedInbound.billLocation || "-",
                                ],
                                [
                                    "Quality Check",
                                    qcLabel(selectedInbound.qualityCheck),
                                ],
                                [
                                    "Quantity Check",
                                    quantityCheckLabel(
                                        selectedInbound.quantityCheck
                                    ),
                                ],
                                [
                                    "Status",
                                    statusLabel(selectedInbound.status),
                                ],
                                [
                                    "Value",
                                    formatCurrency(selectedInbound.value),
                                ],
                                [
                                    "Created By",
                                    selectedInbound.createdBy?.name ||
                                    selectedInbound.createdBy?.email ||
                                    "-",
                                ],
                                [
                                    "Remarks",
                                    selectedInbound.remarks || "-",
                                ],
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className={
                                        label === "Remarks"
                                            ? "inbound-detail-wide"
                                            : ""
                                    }
                                >
                                    <span>{label}</span>
                                    <strong>{value}</strong>
                                </div>
                            ))}
                        </div>

                        <div className="inbound-status-controls">
                            <span>Update Status</span>

                            {STATUS_OPTIONS.map((item) => (
                                <button
                                    type="button"
                                    key={item.value}
                                    className={
                                        selectedInbound.status === item.value
                                            ? "inbound-status-control active"
                                            : "inbound-status-control"
                                    }
                                    disabled={
                                        saving ||
                                        selectedInbound.status ===
                                        item.value
                                    }
                                    onClick={() =>
                                        updateStatus(
                                            selectedInbound,
                                            item.value
                                        )
                                    }
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        <div className="inbound-check-controls">
                            <div>
                                <span>Quality Check</span>
                                {QC_OPTIONS.map((item) => (
                                    <button
                                        type="button"
                                        key={item.value}
                                        className={
                                            selectedInbound.qualityCheck ===
                                                item.value
                                                ? "inbound-check-btn active"
                                                : "inbound-check-btn"
                                        }
                                        disabled={
                                            saving ||
                                            selectedInbound.qualityCheck ===
                                            item.value
                                        }
                                        onClick={() =>
                                            updateQualityCheck(
                                                selectedInbound,
                                                item.value
                                            )
                                        }
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>

                            <div>
                                <span>Quantity Check</span>
                                {QUANTITY_CHECK_OPTIONS.map((item) => (
                                    <button
                                        type="button"
                                        key={item.value}
                                        className={
                                            selectedInbound.quantityCheck ===
                                                item.value
                                                ? "inbound-check-btn active"
                                                : "inbound-check-btn"
                                        }
                                        disabled={
                                            saving ||
                                            selectedInbound.quantityCheck ===
                                            item.value
                                        }
                                        onClick={() =>
                                            updateQuantityCheck(
                                                selectedInbound,
                                                item.value
                                            )
                                        }
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="inbound-modal-footer">
                            <button
                                type="button"
                                className="view-im-close-bottom"
                                onClick={closeModal}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InboundMaterialManagement;