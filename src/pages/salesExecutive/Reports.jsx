
import { useEffect, useMemo, useState } from "react";
import {
    FileText,
    FileSpreadsheet,
    RefreshCw,
    ChartColumn,
    ShoppingCart,
    MapPinned,
    Wallet,
    ClipboardList,
    AlertCircle,
    LoaderCircle,
    FileSearch,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import "../../css/salesExecutive/Reports.css";

const API_BASE_URL = "https://oneplussparkpaintsserver.onrender.com";

const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    "";

const REPORT_TYPES = {
    "Daily Reports": [
        "Daily Sales", "Visit Summary", "Collections", "Orders",
        "Leads", "Registrations", "Complaints",
    ],
    "Visit Report": [
        "Planned Visits", "Completed Visits", "Missed Visits", "GPS Report",
    ],
    "Sales Report": [
        "Product-wise", "Dealer-wise", "Territory-wise", "Executive-wise",
    ],
    "Collection Report": ["Outstanding", "Collected", "Pending"],
    "Expense Report": ["Travel", "Food", "Accommodation", "Miscellaneous"],
};

const REPORT_ICONS = {
    "Daily Reports": ChartColumn,
    "Visit Report": MapPinned,
    "Sales Report": ShoppingCart,
    "Collection Report": Wallet,
    "Expense Report": FileSpreadsheet,
};

const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    });

const formatDate = (date) => {
    if (!date) return "—";
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime())
        ? "—"
        : parsed.toLocaleDateString("en-IN");
};

const toDateInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const getVisitStatus = (visit) =>
    String(visit.visitStatus || "").toUpperCase();

const getVisitRows = (visits, reportType) => {
    if (reportType === "Planned Visits") {
        return visits.filter((visit) => getVisitStatus(visit) === "PLANNED");
    }

    if (reportType === "Completed Visits") {
        return visits.filter((visit) => getVisitStatus(visit) === "COMPLETED");
    }

    if (reportType === "Missed Visits") {
        return visits.filter((visit) => getVisitStatus(visit) === "MISSED");
    }

    if (reportType === "GPS Report") {
        return visits.filter(
            (visit) =>
                visit.location?.latitude != null &&
                visit.location?.longitude != null
        );
    }

    return visits;
};

export default function Reports() {
    const today = toDateInput(new Date());

    const [category, setCategory] = useState("Daily Reports");
    const [reportType, setReportType] = useState("Orders");
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [search, setSearch] = useState("");
    const [orders, setOrders] = useState([]);
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [loaded, setLoaded] = useState(false);

    const isOrdersReport =
        category === "Daily Reports" &&
        ["Orders", "Daily Sales"].includes(reportType);

    const isVisitReport = category === "Visit Report";

    const isConnectedReport = isOrdersReport || isVisitReport;

    const fetchOrders = async () => {
        const response = await fetch(
            `${API_BASE_URL}/api/sales-executive/orders`,
            {
                headers: { Authorization: `Bearer ${getToken()}` },
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to fetch orders.");
        }

        setOrders(data.orders || []);
    };

    const fetchVisits = async () => {
        const response = await fetch(`${API_BASE_URL}/api/sales-visits`, {
            headers: { Authorization: `Bearer ${getToken()}` },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to fetch visits.");
        }

        setVisits(data.visits || []);
    };

    const fetchReportData = async () => {
        if (startDate && endDate && startDate > endDate) {
            setError("Start date cannot be after end date.");
            return;
        }

        setLoading(true);
        setError("");
        setLoaded(false);

        try {
            if (isOrdersReport) {
                await fetchOrders();
            } else if (isVisitReport) {
                await fetchVisits();
            }

            setLoaded(true);
        } catch (err) {
            setOrders([]);
            setVisits([]);
            setError(err.message || "Unable to fetch report data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isConnectedReport) {
            fetchReportData();
        } else {
            setLoaded(false);
            setError("");
        }
    }, [category, reportType]);

    const reportRows = useMemo(() => {
        const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
        const end = endDate ? new Date(`${endDate}T23:59:59.999`) : null;
        const keyword = search.trim().toLowerCase();

        if (isOrdersReport) {
            return orders
                .filter((order) => {
                    const date = new Date(order.createdAt);
                    if (start && date < start) return false;
                    if (end && date > end) return false;

                    if (!keyword) return true;

                    return [
                        order.orderId,
                        order.status,
                        order.dealer?.name,
                        order.salesExecutive?.name,
                        ...(order.items || []).map((item) => item.productName),
                    ]
                        .filter(Boolean)
                        .some((value) => String(value).toLowerCase().includes(keyword));
                })
                .sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                );
        }

        if (isVisitReport) {
            return getVisitRows(
                visits.filter((visit) => {
                    const date = new Date(visit.visitDate);
                    if (start && date < start) return false;
                    if (end && date > end) return false;

                    if (!keyword) return true;

                    return [
                        visit.customerName,
                        visit.customerMobile,
                        visit.territory,
                        visit.beat,
                        visit.route,
                        visit.assignedTo,
                        visit.visitType,
                        visit.visitStatus,
                    ]
                        .filter(Boolean)
                        .some((value) => String(value).toLowerCase().includes(keyword));
                }),
                reportType
            ).sort(
                (a, b) =>
                    new Date(b.visitDate).getTime() -
                    new Date(a.visitDate).getTime()
            );
        }

        return [];
    }, [
        orders,
        visits,
        startDate,
        endDate,
        search,
        isOrdersReport,
        isVisitReport,
        reportType,
    ]);

    const totalAmount = reportRows.reduce(
        (sum, order) =>
            sum + (isOrdersReport ? Number(order.totalAmount || 0) : 0),
        0
    );

    const deliveredAmount = reportRows.reduce(
        (sum, order) =>
            sum +
            (isOrdersReport && order.status === "Delivered"
                ? Number(order.totalAmount || 0)
                : 0),
        0
    );

    const totalProducts = reportRows.reduce(
        (sum, order) =>
            sum +
            (isOrdersReport
                ? (order.items || []).reduce(
                    (itemSum, item) => itemSum + Number(item.quantity || 0),
                    0
                )
                : 0),
        0
    );

    const exportRows = useMemo(() => {
        if (isOrdersReport) {
            return reportRows.map((order) => ({
                "Order ID": order.orderId || "",
                "Order Date": formatDate(order.createdAt),
                Dealer: order.dealer?.name || "",
                Products: (order.items || [])
                    .map((item) => `${item.productName} (${item.quantity})`)
                    .join(", "),
                "Product Quantity": (order.items || []).reduce(
                    (sum, item) => sum + Number(item.quantity || 0),
                    0
                ),
                "Total Amount": Number(order.totalAmount || 0),
                Status: order.status || "",
            }));
        }

        if (isVisitReport) {
            return reportRows.map((visit) => ({
                "Customer Name": visit.customerName || "",
                "Visit Type": visit.visitType || "",
                "Visit Date": formatDate(visit.visitDate),
                "Visit Time": visit.visitTime || "",
                Territory: visit.territory || "",
                Beat: visit.beat || "",
                Route: visit.route || "",
                "Assigned To": visit.assignedTo || "",
                Status: visit.visitStatus || "",
                Latitude: visit.location?.latitude ?? "",
                Longitude: visit.location?.longitude ?? "",
                "Last GPS Update": formatDate(visit.gpsTracking?.lastTrackedAt),
            }));
        }

        return [];
    }, [reportRows, isOrdersReport, isVisitReport]);

    const columns = isOrdersReport
        ? [
            ["Order ID", "Order ID"],
            ["Order Date", "Order Date"],
            ["Dealer", "Dealer"],
            ["Products", "Products"],
            ["Product Quantity", "Qty"],
            ["Total Amount", "Total Amount"],
            ["Status", "Status"],
        ]
        : [
            ["Customer Name", "Customer"],
            ["Visit Type", "Type"],
            ["Visit Date", "Visit Date"],
            ["Visit Time", "Time"],
            ["Territory", "Territory"],
            ["Beat", "Beat"],
            ["Route", "Route"],
            ["Assigned To", "Assigned To"],
            ["Status", "Status"],
            ...(reportType === "GPS Report"
                ? [
                    ["Latitude", "Latitude"],
                    ["Longitude", "Longitude"],
                    ["Last GPS Update", "Last GPS Update"],
                ]
                : []),
        ];

    const exportPDF = () => {
        if (!isConnectedReport || !reportRows.length) {
            setError("There is no loaded report data to export.");
            return;
        }

        const doc = new jsPDF({ orientation: "landscape" });
        doc.setFontSize(16);
        doc.text(`${reportType} Report`, 14, 18);
        doc.setFontSize(10);
        doc.text(`Period: ${startDate} to ${endDate}`, 14, 26);
        doc.text(`Records: ${reportRows.length}`, 14, 33);

        autoTable(doc, {
            startY: 40,
            head: [columns.map((column) => column[1])],
            body: exportRows.map((row) =>
                columns.map((column) => String(row[column[0]] ?? "—"))
            ),
            styles: { fontSize: 7, cellPadding: 2, overflow: "linebreak" },
            headStyles: { fillColor: [37, 99, 235] },
        });

        doc.save(
            `${reportType.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-report.pdf`
        );
    };

    const exportExcel = () => {
        if (!isConnectedReport || !reportRows.length) {
            setError("There is no loaded report data to export.");
            return;
        }

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(exportRows);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

        XLSX.writeFile(
            workbook,
            `${reportType.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-report.xlsx`
        );
    };

    const handleCategoryChange = (nextCategory) => {
        setCategory(nextCategory);
        setReportType(REPORT_TYPES[nextCategory][0]);
        setSearch("");
    };

    const SelectedIcon = REPORT_ICONS[category] || FileText;

    return (
        <div className="reports-page">
            <header className="reports-header">
                <div>
                    <h1>Reports</h1>
                    <p>View, filter and export your business reports.</p>
                </div>

                <button
                    type="button"
                    className="reports-refresh-btn"
                    onClick={fetchReportData}
                    disabled={loading || !isConnectedReport}
                >
                    <RefreshCw
                        size={17}
                        className={loading ? "reports-spin" : ""}
                    />
                    Refresh
                </button>
            </header>

            <section className="reports-category-grid">
                {Object.entries(REPORT_TYPES).map(([name, types]) => {
                    const Icon = REPORT_ICONS[name];

                    return (
                        <button
                            type="button"
                            key={name}
                            className={`reports-category-card ${category === name ? "active" : ""
                                }`}
                            onClick={() => handleCategoryChange(name)}
                        >
                            <span className="reports-category-icon">
                                <Icon size={21} />
                            </span>
                            <span className="reports-category-text">
                                <strong>{name}</strong>
                                <small>{types.length} report types</small>
                            </span>
                        </button>
                    );
                })}
            </section>

            <section className="reports-filter-panel">
                <div className="reports-panel-heading">
                    <div>
                        <h2>Generate Report</h2>
                        <p>Select the report type and date range.</p>
                    </div>
                    <SelectedIcon size={23} />
                </div>

                <div className="reports-filter-grid">
                    <label>
                        Report Category
                        <select
                            value={category}
                            onChange={(event) => handleCategoryChange(event.target.value)}
                        >
                            {Object.keys(REPORT_TYPES).map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Report Type
                        <select
                            value={reportType}
                            onChange={(event) => setReportType(event.target.value)}
                        >
                            {REPORT_TYPES[category].map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Start Date
                        <input
                            type="date"
                            value={startDate}
                            max={endDate || undefined}
                            onChange={(event) => setStartDate(event.target.value)}
                        />
                    </label>

                    <label>
                        End Date
                        <input
                            type="date"
                            value={endDate}
                            min={startDate || undefined}
                            onChange={(event) => setEndDate(event.target.value)}
                        />
                    </label>
                </div>

                <div className="reports-filter-actions">
                    {/* <div className="reports-search">
                        <input
                            type="search"
                            placeholder={
                                isOrdersReport
                                    ? "Search order, dealer or product..."
                                    : "Search customer, territory or status..."
                            }
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            disabled={!isConnectedReport}
                        />
                    </div> */}

                    <div className="reports-export-actions">
                        <button
                            type="button"
                            className="reports-pdf-btn"
                            onClick={exportPDF}
                            disabled={!isConnectedReport || !reportRows.length}
                        >
                            <FileText size={17} />
                            Export PDF
                        </button>

                        <button
                            type="button"
                            className="reports-excel-btn"
                            onClick={exportExcel}
                            disabled={!isConnectedReport || !reportRows.length}
                        >
                            <FileSpreadsheet size={17} />
                            Export Excel
                        </button>
                    </div>
                </div>

                {!isConnectedReport && (
                    <div className="reports-info-note">
                        <AlertCircle size={17} />
                        <span>
                            This report is not connected to an existing data API yet.
                            No sample data is displayed.
                        </span>
                    </div>
                )}
            </section>

            {error && (
                <div className="reports-error" role="alert">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                    <button type="button" onClick={() => setError("")}>
                        Dismiss
                    </button>
                </div>
            )}

            <section className="reports-summary-grid">
                <article className="reports-summary-card">
                    <span className="reports-summary-icon blue">
                        {isOrdersReport ? <ShoppingCart size={19} /> : <ClipboardList size={19} />}
                    </span>
                    <span>{isOrdersReport ? "Total Orders" : "Total Visits"}</span>
                    <strong>{isConnectedReport ? reportRows.length : "—"}</strong>
                </article>

                <article className="reports-summary-card">
                    <span className="reports-summary-icon green">
                        <Wallet size={19} />
                    </span>
                    <span>{isOrdersReport ? "Total Order Value" : "Completed Visits"}</span>
                    <strong>
                        {isOrdersReport
                            ? formatCurrency(totalAmount)
                            : isVisitReport
                                ? visits.filter((visit) => {
                                    const date = new Date(visit.visitDate);
                                    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
                                    const end = endDate ? new Date(`${endDate}T23:59:59.999`) : null;
                                    return (
                                        getVisitStatus(visit) === "COMPLETED" &&
                                        (!start || date >= start) &&
                                        (!end || date <= end)
                                    );
                                }).length
                                : "—"}
                    </strong>
                </article>

                <article className="reports-summary-card">
                    <span className="reports-summary-icon purple">
                        <FileText size={19} />
                    </span>
                    <span>{isOrdersReport ? "Delivered Value" : "Planned Visits"}</span>
                    <strong>
                        {isOrdersReport
                            ? formatCurrency(deliveredAmount)
                            : isVisitReport
                                ? visits.filter((visit) => {
                                    const date = new Date(visit.visitDate);
                                    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
                                    const end = endDate ? new Date(`${endDate}T23:59:59.999`) : null;
                                    return (
                                        getVisitStatus(visit) === "PLANNED" &&
                                        (!start || date >= start) &&
                                        (!end || date <= end)
                                    );
                                }).length
                                : "—"}
                    </strong>
                </article>

                <article className="reports-summary-card">
                    <span className="reports-summary-icon orange">
                        <MapPinned size={19} />
                    </span>
                    <span>{isOrdersReport ? "Product Quantity" : "Missed Visits"}</span>
                    <strong>
                        {isOrdersReport
                            ? totalProducts.toLocaleString("en-IN")
                            : isVisitReport
                                ? visits.filter((visit) => {
                                    const date = new Date(visit.visitDate);
                                    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
                                    const end = endDate ? new Date(`${endDate}T23:59:59.999`) : null;
                                    return (
                                        getVisitStatus(visit) === "MISSED" &&
                                        (!start || date >= start) &&
                                        (!end || date <= end)
                                    );
                                }).length
                                : "—"}
                    </strong>
                </article>
            </section>

            <section className="reports-table-panel">
                <div className="reports-table-heading">
                    <div>
                        <h2>{reportType}</h2>
                        <p>
                            {isConnectedReport
                                ? `${reportRows.length} records · ${startDate} to ${endDate}`
                                : "Data will appear when the corresponding API is connected."}
                        </p>
                    </div>

                    {isConnectedReport && (
                        <span className="reports-data-badge">
                            {loaded ? "Live API Data" : "Loading"}
                        </span>
                    )}
                </div>

                {loading && isConnectedReport ? (
                    <div className="reports-state">
                        <LoaderCircle className="reports-spin" size={30} />
                        <p>Loading report data...</p>
                    </div>
                ) : !isConnectedReport ? (
                    <div className="reports-state">
                        <FileSearch size={36} />
                        <h3>Report API not connected</h3>
                        <p>Choose Orders, Daily Sales or a Visit Report to view available data.</p>
                    </div>
                ) : reportRows.length === 0 ? (
                    <div className="reports-state">
                        <FileSearch size={36} />
                        <h3>No records found</h3>
                        <p>Try another date range or search term.</p>
                    </div>
                ) : (
                    <div className="reports-table-wrap">
                        <table className="reports-table">
                            <thead>
                                <tr>
                                    {columns.map((column) => (
                                        <th key={column[0]}>{column[1]}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {reportRows.map((row) => {
                                    if (isOrdersReport) {
                                        const exportRow = exportRows.find(
                                            (item) => item["Order ID"] === (row.orderId || "")
                                        ) || {};

                                        return (
                                            <tr key={row._id}>
                                                <td className="reports-order-id">{row.orderId || "—"}</td>
                                                <td>{formatDate(row.createdAt)}</td>
                                                <td>{row.dealer?.name || "—"}</td>
                                                <td>
                                                    {(row.items || []).map((item) => item.productName).filter(Boolean).join(", ") || "—"}
                                                </td>
                                                <td>{exportRow["Product Quantity"] ?? 0}</td>
                                                <td className="reports-amount">{formatCurrency(row.totalAmount)}</td>
                                                <td>
                                                    <span
                                                        className={`reports-status status-${String(row.status || "")
                                                            .toLowerCase()
                                                            .replace(/[^a-z]+/g, "-")}`}
                                                    >
                                                        {row.status || "Unknown"}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    }

                                    return (
                                        <tr key={row._id}>
                                            <td>{row.customerName || "—"}</td>
                                            <td>{row.visitType || "—"}</td>
                                            <td>{formatDate(row.visitDate)}</td>
                                            <td>{row.visitTime || "—"}</td>
                                            <td>{row.territory || "—"}</td>
                                            <td>{row.beat || "—"}</td>
                                            <td>{row.route || "—"}</td>
                                            <td>{row.assignedTo || "—"}</td>
                                            <td>
                                                <span
                                                    className={`reports-status status-${String(row.visitStatus || "")
                                                        .toLowerCase()
                                                        .replace(/[^a-z]+/g, "-")}`}
                                                >
                                                    {row.visitStatus || "Unknown"}
                                                </span>
                                            </td>
                                            {reportType === "GPS Report" && (
                                                <>
                                                    <td>{row.location?.latitude ?? "—"}</td>
                                                    <td>{row.location?.longitude ?? "—"}</td>
                                                    <td>{formatDate(row.gpsTracking?.lastTrackedAt)}</td>
                                                </>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
