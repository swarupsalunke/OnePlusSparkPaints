import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
    Bell,
    BellRing,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    FileText,
    Filter,
    Mail,
    MessageSquare,
    MoreVertical,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    Send,
    Trash2,
    Upload,
    UserPlus,
    Users,
    UserX,
    X,
    CreditCard,
} from "lucide-react";

import "../../css/superadmin/notificationmanagement.css";

const API_BASE_URL = "https://oneplussparkpaintsserver.onrender.com/api";

const emptyNotification = {
    title: "",
    channel: "PUSH",
    userType: "ALL_USERS",
    targetAudience: "ALL_ACTIVE_USERS",
    message: "",
    territory: "",
    status: "SENT",
};

const channelLabel = (value) => {
    const map = {
        PUSH: "Push",
        EMAIL: "Email",
        SMS: "SMS",
    };
    return map[value] || value || "-";
};

const userTypeLabel = (value) => {
    const map = {
        ALL_USERS: "All Users",
        DEALERS: "Dealers",
        PAINTERS: "Painters",
        REFERRERS: "Referrers",
        STORE_STAFF: "Store Staff",
        SUBSCRIBERS: "Subscribers",
    };
    return map[value] || value || "-";
};

const statusLabel = (value) => {
    const map = {
        SENT: "Sent",
        PENDING: "Pending",
        FAILED: "Failed",
        DRAFT: "Draft",
    };
    return map[value] || value || "-";
};

const formatNumber = (value) =>
    Number(value || 0).toLocaleString("en-IN");

const formatDateTime = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
};

const StatCard = ({ icon, title, value, subtitle, iconClass }) => (
    <div className="notification-stat-card">
        <div className={`notification-stat-icon ${iconClass || ""}`}>
            {icon}
        </div>
        <div>
            <span>{title}</span>
            <strong>{value}</strong>
            <small>{subtitle}</small>
        </div>
    </div>
);

const NotificationManagement = () => {
    const [notifications, setNotifications] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [dateRange, setDateRange] = useState("");
    const [channel, setChannel] = useState("ALL");
    const [userType, setUserType] = useState("ALL_USERS");
    const [territory, setTerritory] = useState("ALL");
    const [status, setStatus] = useState("ALL_STATUS");
    const [trendRange, setTrendRange] = useState("This Week");

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showReportMenu, setShowReportMenu] = useState(false);

    const [editingNotification, setEditingNotification] = useState(null);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [form, setForm] = useState(emptyNotification);

    // Subscription information is frontend-only for now.
    // No /api/subscriptions call is made because subscription backend is not available.
    const subscriptions = [
        { planName: "Premium Plan", duration: "12 Months", subscribers: 0, amount: 0, status: "Active" },
        { planName: "Standard Plan", duration: "6 Months", subscribers: 0, amount: 0, status: "Active" },
        { planName: "Basic Plan", duration: "3 Months", subscribers: 0, amount: 0, status: "Active" },
        { planName: "Free Plan", duration: "1 Month", subscribers: 0, amount: 0, status: "Active" },
    ];

    const subscriberStats = {
        active: 0,
        unsubscribed: 0,
        bounced: 0,
        inactive: 0,
        total: 0,
    };

    const fileInputRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                `${API_BASE_URL}/notifications`,
                getAuthConfig()
            );

            const data =
                response.data?.notifications ||
                response.data?.data ||
                [];

            setNotifications(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch notifications error:", err);
            setNotifications([]);
            setError(
                err.response?.data?.message ||
                "Failed to load notification data."
            );
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        fetchNotifications();
    }, []);

    const normalizedNotifications = useMemo(
        () =>
            notifications.map((item) => ({
                ...item,
                notificationId:
                    item.notificationId ||
                    item.notificationNumber ||
                    item._id ||
                    "-",
                title: item.title || item.notificationTitle || "-",
                channel: item.channel || "PUSH",
                userType: item.userType || "ALL_USERS",
                targetAudience:
                    item.targetAudience || item.audience || "ALL_ACTIVE_USERS",
                sentOn: item.sentOn || item.sentAt || item.createdAt,
                sentTo: item.sentTo ?? item.recipientCount ?? 0,
                status: item.status || "SENT",
                openRate: item.openRate ?? "-",
                clickRate: item.clickRate ?? "-",
                territory: item.territory || "",
            })),
        [notifications]
    );

    const filteredNotifications = useMemo(() => {
        const value = search.toLowerCase().trim();

        return normalizedNotifications.filter((item) => {
            const matchesSearch =
                !value ||
                String(item.notificationId).toLowerCase().includes(value) ||
                String(item.title).toLowerCase().includes(value) ||
                String(item.userType).toLowerCase().includes(value) ||
                String(item.targetAudience).toLowerCase().includes(value);

            const matchesChannel =
                channel === "ALL" || item.channel === channel;

            const matchesUserType =
                userType === "ALL_USERS" || item.userType === userType;

            const matchesTerritory =
                territory === "ALL" ||
                !territory ||
                item.territory === territory;

            const matchesStatus =
                status === "ALL_STATUS" || item.status === status;

            let matchesDate = true;
            if (dateRange) {
                const itemDate = new Date(item.sentOn);
                const selectedDate = new Date(dateRange);
                matchesDate =
                    !Number.isNaN(itemDate.getTime()) &&
                    !Number.isNaN(selectedDate.getTime()) &&
                    itemDate.toDateString() === selectedDate.toDateString();
            }

            return (
                matchesSearch &&
                matchesChannel &&
                matchesUserType &&
                matchesTerritory &&
                matchesStatus &&
                matchesDate
            );
        });
    }, [
        normalizedNotifications,
        search,
        channel,
        userType,
        territory,
        status,
        dateRange,
    ]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredNotifications.length / rowsPerPage)
    );

    const paginatedNotifications = filteredNotifications.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const stats = useMemo(() => {
        const total = normalizedNotifications.length;

        const push = normalizedNotifications.filter(
            (x) => x.channel === "PUSH"
        ).length;

        const email = normalizedNotifications.filter(
            (x) => x.channel === "EMAIL"
        ).length;

        const sms = normalizedNotifications.filter(
            (x) => x.channel === "SMS"
        ).length;

        // Subscription stats remain frontend placeholders until subscription backend is added.
        const activeSubscribers = 0;
        const unsubscribed = 0;

        const sentTo = normalizedNotifications.reduce(
            (sum, item) => sum + Number(item.sentTo || 0),
            0
        );

        return {
            total,
            push,
            email,
            sms,
            activeSubscribers,
            unsubscribed,
            sentTo,
        };
    }, [normalizedNotifications]);

    const resetFilters = () => {
        setSearch("");
        setDateRange("");
        setChannel("ALL");
        setUserType("ALL_USERS");
        setTerritory("ALL");
        setStatus("ALL_STATUS");
        setCurrentPage(1);
    };

    const openAddModal = () => {
        setEditingNotification(null);
        setForm(emptyNotification);
        setShowAddModal(true);
    };

    const openEditModal = (notification) => {
        setEditingNotification(notification);
        setForm({
            title: notification.title || "",
            channel: notification.channel || "PUSH",
            userType: notification.userType || "ALL_USERS",
            targetAudience:
                notification.targetAudience || "ALL_ACTIVE_USERS",
            message: notification.message || "",
            territory: notification.territory || "",
            status: notification.status || "SENT",
        });
        setShowAddModal(true);
    };

    const saveNotification = async (e) => {
        e.preventDefault();

        try {
            if (editingNotification?._id) {
                await axios.put(
                    `${API_BASE_URL}/notifications/${editingNotification._id}`,
                    form,
                    getAuthConfig()
                );
                alert("Notification updated successfully");
            } else {
                await axios.post(
                    `${API_BASE_URL}/notifications`,
                    form,
                    getAuthConfig()
                );
                alert("Notification created successfully");
            }

            setShowAddModal(false);
            setEditingNotification(null);
            setForm(emptyNotification);
            fetchNotifications();
        } catch (err) {
            console.error("Save notification error:", err);
            alert(
                err.response?.data?.message ||
                "Failed to save notification"
            );
        }
    };

    const deleteNotification = async (item) => {
        if (!item?._id) return;

        if (!window.confirm("Delete this notification?")) return;

        try {
            await axios.delete(
                `${API_BASE_URL}/notifications/${item._id}`,
                getAuthConfig()
            );
            fetchNotifications();
        } catch (err) {
            console.error("Delete notification error:", err);
            alert(
                err.response?.data?.message ||
                "Failed to delete notification"
            );
        }
    };

    const viewNotification = (item) => {
        setSelectedNotification(item);
        setShowViewModal(true);
    };

    const exportNotifications = () => {
        if (!filteredNotifications.length) {
            alert("No notification data available to export.");
            return;
        }

        const headers = [
            "Notification ID",
            "Title",
            "Channel",
            "User Type",
            "Target Audience",
            "Sent On",
            "Sent To",
            "Status",
            "Open Rate",
            "Click Rate",
        ];

        const rows = filteredNotifications.map((item) => [
            item.notificationId,
            item.title,
            channelLabel(item.channel),
            userTypeLabel(item.userType),
            item.targetAudience,
            formatDateTime(item.sentOn),
            item.sentTo,
            statusLabel(item.status),
            item.openRate,
            item.clickRate,
        ]);

        const csv = [headers, ...rows]
            .map((row) =>
                row
                    .map(
                        (cell) =>
                            `"${String(cell ?? "").replace(/"/g, '""')}"`
                    )
                    .join(",")
            )
            .join("\n");

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "notification-report.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleUploadSubscriberList = () => {
        fileInputRef.current?.click();
    };

    const handleSubscriberFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        alert(
            `${file.name} selected. Subscriber import API can be connected to the existing backend upload route.`
        );

        e.target.value = "";
    };

    const quickAction = (message) => {
        alert(message);
    };

    const channelData = [
        { label: "Push", value: stats.push, className: "push" },
        { label: "Email", value: stats.email, className: "email" },
        { label: "SMS", value: stats.sms, className: "sms" },
    ];

    const channelTotal = channelData.reduce(
        (sum, item) => sum + item.value,
        0
    );

    const getPercent = (value, total) =>
        total ? ((value / total) * 100).toFixed(1) : "0.0";

    return (
        <div className="notification-management-page">
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                style={{ display: "none" }}
                onChange={handleSubscriberFile}
            />

            {/* PAGE HEADER */}
            <div className="notification-page-header">
                <div>
                    <h1>Notification &amp; Subscription Management</h1>

                    <div className="notification-breadcrumb">
                        <span>Dashboard</span>
                        <span>›</span>
                        <span>Notification &amp; Subscription Management</span>
                        <span>›</span>
                        <span>Overview</span>
                    </div>
                </div>

                <div className="notification-header-actions">
                    <div className="notification-dropdown-wrap">
                        <button
                            className="notification-outline-btn"
                            onClick={() =>
                                setShowReportMenu((prev) => !prev)
                            }
                        >
                            <Download size={15} />
                            Notification Reports
                            <ChevronDown size={14} />
                        </button>

                        {showReportMenu && (
                            <div className="notification-dropdown-menu">
                                <button onClick={exportNotifications}>
                                    Export Notification Report
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="notification-dropdown-wrap">
                        <button
                            className="notification-primary-btn"
                            onClick={openAddModal}
                        >
                            <Plus size={17} />
                            Create Notification
                            <ChevronDown size={14} />
                        </button>

                    </div>
                </div>
            </div>

            {/* STATS */}
            <div className="notification-stats-grid">
                <StatCard
                    icon={<Send size={21} />}
                    iconClass="blue"
                    title="Total Notifications Sent"
                    value={formatNumber(stats.sentTo || stats.total)}
                    subtitle="Current notification volume"
                />

                <StatCard
                    icon={<BellRing size={21} />}
                    iconClass="purple"
                    title="Push Notifications"
                    value={formatNumber(stats.push)}
                    subtitle="Push notifications"
                />

                <StatCard
                    icon={<Mail size={21} />}
                    iconClass="green"
                    title="Email Notifications"
                    value={formatNumber(stats.email)}
                    subtitle="Email notifications"
                />

                <StatCard
                    icon={<MessageSquare size={21} />}
                    iconClass="orange"
                    title="SMS Notifications"
                    value={formatNumber(stats.sms)}
                    subtitle="SMS notifications"
                />

                <StatCard
                    icon={<Users size={21} />}
                    iconClass="blue"
                    title="Active Subscribers"
                    value={formatNumber(stats.activeSubscribers)}
                    subtitle="Active subscriptions"
                />

                <StatCard
                    icon={<UserX size={21} />}
                    iconClass="red"
                    title="Unsubscribed Users"
                    value={formatNumber(stats.unsubscribed)}
                    subtitle="Unsubscribed users"
                />
            </div>

            {/* FILTERS */}
            <div className="notification-filter-section">
                <div className="notification-filter-grid">
                    <div className="notification-filter-field">
                        <label>Date Range</label>
                        <div className="notification-input-icon">
                            {/* <CalendarDays size={14} /> */}
                            <input
                                type="date"
                                value={dateRange}
                                onChange={(e) => {
                                    setDateRange(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>

                    <div className="notification-filter-field">
                        <label>Channel</label>
                        <select
                            value={channel}
                            onChange={(e) => {
                                setChannel(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="ALL">All Channels</option>
                            <option value="PUSH">Push</option>
                            <option value="EMAIL">Email</option>
                            <option value="SMS">SMS</option>
                        </select>
                    </div>

                    <div className="notification-filter-field">
                        <label>User Type</label>
                        <select
                            value={userType}
                            onChange={(e) => {
                                setUserType(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="ALL_USERS">All User Types</option>
                            <option value="DEALERS">Dealers</option>
                            <option value="PAINTERS">Painters</option>
                            <option value="REFERRERS">Referrers</option>
                            <option value="STORE_STAFF">Store Staff</option>
                            <option value="SUBSCRIBERS">Subscribers</option>
                        </select>
                    </div>

                    <div className="notification-filter-field">
                        <label>Territory</label>
                        <select
                            value={territory}
                            onChange={(e) => {
                                setTerritory(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="ALL">All Territories</option>
                            <option value="North">North</option>
                            <option value="South">South</option>
                            <option value="East">East</option>
                            <option value="West">West</option>
                        </select>
                    </div>

                    <div className="notification-filter-field">
                        <label>Status</label>
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="ALL_STATUS">All Status</option>
                            <option value="SENT">Sent</option>
                            <option value="PENDING">Pending</option>
                            <option value="FAILED">Failed</option>
                            <option value="DRAFT">Draft</option>
                        </select>
                    </div>

                    <div className="notification-filter-buttons">
                        <button
                            className="notification-filter-btn"
                            type="button"
                            onClick={() => setCurrentPage(1)}
                        >
                            <Filter size={16} />
                            Filters
                        </button>

                        <button
                            className="notification-reset-btn"
                            type="button"
                            onClick={resetFilters}
                            title="Reset"
                        >
                            <RefreshCw size={15} />
                        </button>
                    </div>
                </div>
            </div>

            {/* MAIN DASHBOARD GRID */}
            <div className="notification-main-dashboard-grid">

                {/* =====================================================
        NOTIFICATION OVERVIEW - BY CHANNEL
    ===================================================== */}

                <section className="notification-panel notification-channel-panel">

                    <div className="notification-panel-header">
                        <div>
                            <h3>Notification Overview (By Channel)</h3>
                        </div>
                    </div>

                    <div className="notification-donut-layout">

                        <div
                            className="notification-donut"
                            style={{
                                background: `conic-gradient(
                        #2563eb 0 ${getPercent(
                                    stats.push,
                                    channelTotal
                                )}%,

                        #16a34a ${getPercent(
                                    stats.push,
                                    channelTotal
                                )}% ${(
                                    Number(
                                        getPercent(
                                            stats.push,
                                            channelTotal
                                        )
                                    ) +
                                    Number(
                                        getPercent(
                                            stats.email,
                                            channelTotal
                                        )
                                    )
                                ).toFixed(1)
                                    }%,

                        #f59e0b ${(
                                        Number(
                                            getPercent(
                                                stats.push,
                                                channelTotal
                                            )
                                        ) +
                                        Number(
                                            getPercent(
                                                stats.email,
                                                channelTotal
                                            )
                                        )
                                    ).toFixed(1)
                                    }% 100%
                    )`,
                            }}
                        >
                            <div>
                                <strong>
                                    {formatNumber(stats.total)}
                                </strong>

                                <span>Total</span>
                            </div>
                        </div>


                        <div className="notification-chart-legend">

                            {channelData.map((item) => (
                                <div
                                    className="notification-legend-row"
                                    key={item.label}
                                >

                                    <span
                                        className={`legend-dot ${item.className}`}
                                    />

                                    <span className="legend-label">
                                        {item.label}
                                    </span>

                                    <strong>
                                        {formatNumber(item.value)}
                                    </strong>

                                    <small>
                                        (
                                        {getPercent(
                                            item.value,
                                            channelTotal
                                        )}
                                        %)
                                    </small>

                                </div>
                            ))}

                        </div>

                    </div>

                </section>


                {/* =====================================================
        NOTIFICATION TREND
    ===================================================== */}

                <section className="notification-panel notification-trend-panel">

                    <div className="notification-panel-header">

                        <h3>Notification Trend</h3>

                        <select
                            value={trendRange}
                            onChange={(e) =>
                                setTrendRange(e.target.value)
                            }
                        >
                            <option>This Week</option>
                            <option>This Month</option>
                            <option>Last 3 Months</option>
                        </select>

                    </div>


                    <div className="notification-trend-legend">

                        <span>
                            <i className="trend-dot push" />
                            Push
                        </span>

                        <span>
                            <i className="trend-dot email" />
                            Email
                        </span>

                        <span>
                            <i className="trend-dot sms" />
                            SMS
                        </span>

                    </div>


                    <div className="notification-trend-chart">

                        <div className="trend-y-axis">

                            <span>40K</span>
                            <span>30K</span>
                            <span>20K</span>
                            <span>10K</span>
                            <span>0</span>

                        </div>


                        <div className="trend-area">

                            <div className="trend-line push-line" />

                            <div className="trend-line email-line" />

                            <div className="trend-line sms-line" />


                            <div className="trend-points push-points">

                                {[18, 28, 39, 34, 43, 37, 48].map(
                                    (v, i) => (
                                        <span
                                            key={i}
                                            style={{
                                                left: `${i * 16.66}%`,
                                                bottom: `${v}%`,
                                            }}
                                        />
                                    )
                                )}

                            </div>


                            <div className="trend-points email-points">

                                {[27, 40, 40, 48, 34, 50, 58].map(
                                    (v, i) => (
                                        <span
                                            key={i}
                                            style={{
                                                left: `${i * 16.66}%`,
                                                bottom: `${v}%`,
                                            }}
                                        />
                                    )
                                )}

                            </div>


                            <div className="trend-points sms-points">

                                {[10, 20, 17, 23, 14, 16, 28].map(
                                    (v, i) => (
                                        <span
                                            key={i}
                                            style={{
                                                left: `${i * 16.66}%`,
                                                bottom: `${v}%`,
                                            }}
                                        />
                                    )
                                )}

                            </div>

                        </div>

                    </div>


                    <div className="notification-trend-days">

                        <span>16 May</span>
                        <span>17 May</span>
                        <span>18 May</span>
                        <span>19 May</span>
                        <span>20 May</span>
                        <span>21 May</span>
                        <span>22 May</span>

                    </div>

                </section>


                {/* =====================================================
        SUBSCRIBERS OVERVIEW
    ===================================================== */}

                <section className="notification-panel notification-subscriber-panel">

                    <div className="notification-panel-header">
                        <h3>Subscribers Overview</h3>
                    </div>


                    <div className="notification-donut-layout">

                        <div
                            className="notification-donut subscriber-donut"
                            style={{
                                background:
                                    "conic-gradient(#2563eb 0 90%, #f59e0b 90% 95%, #ef4444 95% 97%, #94a3b8 97% 100%)",
                            }}
                        >

                            <div>

                                <strong>
                                    {formatNumber(
                                        subscriberStats.active
                                    )}
                                </strong>

                                <span>Active</span>

                            </div>

                        </div>


                        <div className="notification-chart-legend">

                            <div className="notification-legend-row">

                                <span className="legend-dot push" />

                                <span className="legend-label">
                                    Active
                                </span>

                                <strong>
                                    {formatNumber(
                                        subscriberStats.active
                                    )}
                                </strong>

                                <small>
                                    (
                                    {getPercent(
                                        subscriberStats.active,
                                        subscriberStats.total
                                    )}
                                    %)
                                </small>

                            </div>


                            <div className="notification-legend-row">

                                <span className="legend-dot orange" />

                                <span className="legend-label">
                                    Unsubscribed
                                </span>

                                <strong>
                                    {formatNumber(
                                        subscriberStats.unsubscribed
                                    )}
                                </strong>

                                <small>
                                    (
                                    {getPercent(
                                        subscriberStats.unsubscribed,
                                        subscriberStats.total
                                    )}
                                    %)
                                </small>

                            </div>


                            <div className="notification-legend-row">

                                <span className="legend-dot red" />

                                <span className="legend-label">
                                    Bounced
                                </span>

                                <strong>
                                    {formatNumber(
                                        subscriberStats.bounced
                                    )}
                                </strong>

                                <small>
                                    (
                                    {getPercent(
                                        subscriberStats.bounced,
                                        subscriberStats.total
                                    )}
                                    %)
                                </small>

                            </div>


                            <div className="notification-legend-row">

                                <span className="legend-dot gray" />

                                <span className="legend-label">
                                    Inactive
                                </span>

                                <strong>
                                    {formatNumber(
                                        subscriberStats.inactive
                                    )}
                                </strong>

                                <small>
                                    (
                                    {getPercent(
                                        subscriberStats.inactive,
                                        subscriberStats.total
                                    )}
                                    %)
                                </small>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =====================================================
        RIGHT COLUMN
    ===================================================== */}

                <aside className="notification-right-column">


                    {/* ================= QUICK ACTIONS ================= */}

                    <section className="notification-panel quick-actions-panel">

                        <div className="notification-panel-header">
                            <h3>Quick Actions</h3>
                        </div>


                        <button onClick={openAddModal}>

                            <span className="quick-action-icon blue">
                                <Send size={15} />
                            </span>

                            <span className="quick-action-content">

                                <strong>
                                    Create Notification
                                </strong>

                                <small>
                                    Send notifications via multiple channels
                                </small>

                            </span>

                        </button>


                        <button
                            onClick={() =>
                                quickAction(
                                    "Create Subscription Plan"
                                )
                            }
                        >

                            <span className="quick-action-icon purple">
                                <CreditCard size={15} />
                            </span>

                            <span className="quick-action-content">

                                <strong>
                                    Create Subscription Plan
                                </strong>

                                <small>
                                    Add or update subscription plans
                                </small>

                            </span>

                        </button>


                        <button
                            onClick={handleUploadSubscriberList}
                        >

                            <span className="quick-action-icon blue">
                                <Upload size={15} />
                            </span>

                            <span className="quick-action-content">

                                <strong>
                                    Upload Subscriber List
                                </strong>

                                <small>
                                    Import subscribers in bulk
                                </small>

                            </span>

                        </button>


                        <button
                            onClick={() =>
                                quickAction(
                                    "Email / SMS Templates"
                                )
                            }
                        >

                            <span className="quick-action-icon cyan">
                                <FileText size={15} />
                            </span>

                            <span className="quick-action-content">

                                <strong>
                                    Email / SMS Templates
                                </strong>

                                <small>
                                    Manage templates
                                </small>

                            </span>

                        </button>


                        <button
                            onClick={() =>
                                quickAction(
                                    "Notification Logs"
                                )
                            }
                        >

                            <span className="quick-action-icon orange">
                                <Bell size={15} />
                            </span>

                            <span className="quick-action-content">

                                <strong>
                                    Notification Logs
                                </strong>

                                <small>
                                    View all sent notifications
                                </small>

                            </span>

                        </button>

                    </section>


                    {/* ================= SUBSCRIPTION SUMMARY ================= */}

                    <section className="notification-panel subscription-summary-panel">

                        <div className="notification-panel-header">
                            <h3>Subscription Summary</h3>
                        </div>


                        <div className="notification-summary-row">

                            <span>Total Subscribers</span>

                            <strong>
                                {formatNumber(
                                    subscriberStats.total
                                )}
                            </strong>

                        </div>


                        <div className="notification-summary-row">

                            <span>Active Subscribers</span>

                            <strong>
                                {formatNumber(
                                    subscriberStats.active
                                )}
                            </strong>

                        </div>


                        <div className="notification-summary-row">

                            <span>Unsubscribed</span>

                            <strong>
                                {formatNumber(
                                    subscriberStats.unsubscribed
                                )}
                            </strong>

                        </div>


                        <div className="notification-summary-row">

                            <span>Bounced</span>

                            <strong>
                                {formatNumber(
                                    subscriberStats.bounced
                                )}
                            </strong>

                        </div>


                        <div className="notification-summary-row">

                            <span>Inactive</span>

                            <strong>
                                {formatNumber(
                                    subscriberStats.inactive
                                )}
                            </strong>

                        </div>

                    </section>


                    {/* ================= RECENT ACTIVITY ================= */}

                    <section className="notification-panel recent-activity-panel">

                        <div className="notification-panel-header">

                            <h3>Recent Activity</h3>

                            <button
                                onClick={() =>
                                    quickAction(
                                        "Opening all recent activity"
                                    )
                                }
                            >
                                View All
                            </button>

                        </div>


                        {[
                            [
                                "Push Notification sent",
                                "10 min ago",
                                "blue",
                            ],
                            [
                                "Email Notification sent",
                                "25 min ago",
                                "green",
                            ],
                            [
                                "SMS Notification sent",
                                "35 min ago",
                                "orange",
                            ],
                            [
                                "Subscription Plan updated",
                                "1 hr ago",
                                "purple",
                            ],
                            [
                                "New Subscribers added",
                                "2 hrs ago",
                                "blue",
                            ],
                        ].map(([text, time, cls]) => (

                            <div
                                className="recent-activity-item"
                                key={text}
                            >

                                <span
                                    className={`activity-dot ${cls}`}
                                />

                                <span>
                                    {text}
                                </span>

                                <small>
                                    {time}
                                </small>

                            </div>

                        ))}

                    </section>

                </aside>


                {/* =====================================================
        RECENT NOTIFICATIONS
        IMPORTANT:
        This is grid columns 1-3 only.
        It will NOT go below Quick Actions.
    ===================================================== */}

                <section className="notification-panel recent-notifications-panel">


                    <div className="notification-panel-header">

                        <div>
                            <h3>Recent Notifications</h3>
                        </div>
                        <div className="notification-table-search">
                            <input
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Search notifications..."
                            />
                            <Search size={15} />
                        </div>

                    </div>


                    {error && (
                        <div className="notification-inline-message">
                            {error}
                        </div>
                    )}


                    <div className="notification-table-wrapper">

                        <table className="notification-table">

                            <thead>

                                <tr>

                                    <th>
                                        Notification ID
                                    </th>

                                    <th>
                                        Title
                                    </th>

                                    <th>
                                        Channel
                                    </th>

                                    <th>
                                        User Type
                                    </th>

                                    <th>
                                        Target Audience
                                    </th>

                                    <th>
                                        Sent On
                                    </th>

                                    <th>
                                        Sent To
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Open Rate
                                    </th>

                                    <th>
                                        Click Rate
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {loading ? (

                                    <tr>

                                        <td
                                            colSpan="11"
                                            className="notification-empty"
                                        >
                                            Loading notification data...
                                        </td>

                                    </tr>

                                ) : paginatedNotifications.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="11"
                                            className="notification-empty"
                                        >
                                            No notification data available
                                        </td>

                                    </tr>

                                ) : (

                                    paginatedNotifications.map(
                                        (item) => (

                                            <tr
                                                key={
                                                    item._id ||
                                                    item.notificationId
                                                }
                                            >

                                                <td>
                                                    {item.notificationId}
                                                </td>


                                                <td>
                                                    <strong>
                                                        {item.title}
                                                    </strong>
                                                </td>


                                                <td>

                                                    <span
                                                        className={`channel-badge ${String(
                                                            item.channel
                                                        ).toLowerCase()}`}
                                                    >
                                                        {channelLabel(
                                                            item.channel
                                                        )}
                                                    </span>

                                                </td>


                                                <td>
                                                    {userTypeLabel(
                                                        item.userType
                                                    )}
                                                </td>


                                                <td>
                                                    {item.targetAudience}
                                                </td>


                                                <td>
                                                    {formatDateTime(
                                                        item.sentOn
                                                    )}
                                                </td>


                                                <td>
                                                    {formatNumber(
                                                        item.sentTo
                                                    )}
                                                </td>


                                                <td>

                                                    <span
                                                        className={`notification-status-badge ${String(
                                                            item.status
                                                        ).toLowerCase()}`}
                                                    >
                                                        {statusLabel(
                                                            item.status
                                                        )}
                                                    </span>

                                                </td>


                                                <td>
                                                    {item.openRate}
                                                </td>


                                                <td>
                                                    {item.clickRate}
                                                </td>


                                                <td>

                                                    <div className="notification-action-buttons">

                                                        <button
                                                            type="button"
                                                            title="View"
                                                            onClick={() =>
                                                                viewNotification(
                                                                    item
                                                                )
                                                            }
                                                        >
                                                            <Eye size={15} />
                                                        </button>


                                                        <button
                                                            type="button"
                                                            title="Edit"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    item
                                                                )
                                                            }
                                                        >
                                                            <Pencil size={15} />
                                                        </button>


                                                        <button className="notification-delete"
                                                            type="button"
                                                            title="Delete"
                                                            onClick={() =>
                                                                deleteNotification(
                                                                    item
                                                                )
                                                            }
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>


                                                        <button
                                                            type="button"
                                                            title="More"
                                                            onClick={() =>
                                                                quickAction(
                                                                    `More options for ${item.title}`
                                                                )
                                                            }
                                                        >
                                                            <MoreVertical
                                                                size={15}
                                                            />
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>


                    {/* ================= TABLE FOOTER ================= */}

                    <div className="notification-table-footer">

                        <span>

                            Showing{" "}

                            {filteredNotifications.length
                                ? (currentPage - 1) *
                                rowsPerPage +
                                1
                                : 0}

                            {" "}to{" "}

                            {Math.min(
                                currentPage * rowsPerPage,
                                filteredNotifications.length
                            )}

                            {" "}of{" "}

                            {filteredNotifications.length}

                            {" "}entries

                        </span>


                        <div className="notification-pagination">

                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.max(1, p - 1)
                                    )
                                }
                            >
                                <ChevronLeft size={15} />
                            </button>


                            {Array.from(
                                {
                                    length: Math.min(
                                        totalPages,
                                        5
                                    ),
                                },
                                (_, index) => index + 1
                            ).map((page) => (

                                <button
                                    type="button"
                                    key={page}
                                    className={
                                        currentPage === page
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setCurrentPage(page)
                                    }
                                >
                                    {page}
                                </button>

                            ))}


                            <button
                                type="button"
                                disabled={
                                    currentPage === totalPages
                                }
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(
                                            totalPages,
                                            p + 1
                                        )
                                    )
                                }
                            >
                                <ChevronRight size={15} />
                            </button>
                        </div>

                    </div>

                </section>

            </div>

            {/* BOTTOM GRID */}
            <div className="notification-bottom-grid">
                {/* SUBSCRIPTION PLANS */}
                <section className="notification-panel subscription-plans-panel">
                    <div className="notification-panel-header">
                        <h3>Subscription Plans</h3>
                    </div>

                    <div className="notification-table-wrapper">
                        <table className="notification-table compact">
                            <thead>
                                <tr>
                                    <th>Plan Name</th>
                                    <th>Duration</th>
                                    <th>Subscribers</th>
                                    <th>Amount (₹)</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {subscriptions.slice(0, 4).map((item) => (
                                    <tr key={item._id || item.planName}>
                                        <td>{item.planName || item.name || "-"}</td>
                                        <td>{item.duration || "-"}</td>
                                        <td>
                                            {formatNumber(
                                                item.subscribers ??
                                                item.subscriberCount ??
                                                0
                                            )}
                                        </td>
                                        <td>
                                            ₹
                                            {formatNumber(
                                                item.amount ?? item.price ?? 0
                                            )}
                                        </td>
                                        <td>
                                            <span className="notification-status-badge active">
                                                {item.status || "Active"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="notification-action-buttons">
                                                <button
                                                    onClick={() =>
                                                        quickAction(
                                                            `Edit ${item.planName || item.name}`
                                                        )
                                                    }
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        quickAction(
                                                            `More options for ${item.planName || item.name}`
                                                        )
                                                    }
                                                >
                                                    <MoreVertical size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {!subscriptions.length && (
                                    <tr>
                                        <td colSpan="6" className="notification-empty">
                                            No subscription plans available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <button
                        className="notification-view-all-link"
                        onClick={() =>
                            quickAction("View All Plans")
                        }
                    >
                        View All Plans <ChevronRight size={14} />
                    </button>
                </section>

                {/* TOP SUBSCRIPTION PLANS */}
                <section className="notification-panel top-plans-panel">
                    <div className="notification-panel-header">
                        <h3>Top Subscription Plans</h3>
                    </div>

                    <div className="top-plans-content">
                        <div
                            className="notification-donut subscription-donut"
                            style={{
                                background:
                                    "conic-gradient(#2563eb 0 30%, #16a34a 30% 68%, #f59e0b 68% 90%, #94a3b8 90% 100%)",
                            }}
                        >
                            <div>
                                <strong>
                                    {formatNumber(subscriberStats.total)}
                                </strong>
                                <span>Total Subscribers</span>
                            </div>
                        </div>

                        <div className="top-plans-legend">
                            {[
                                ["Premium Plan", 30, "blue"],
                                ["Standard Plan", 38, "green"],
                                ["Basic Plan", 21, "orange"],
                                ["Free Plan", 11, "gray"],
                            ].map(([name, percent, cls]) => (
                                <div key={name}>
                                    <span className={`legend-dot ${cls}`} />
                                    <span>{name}</span>
                                    <strong>
                                        {formatNumber(
                                            Math.round(
                                                (subscriberStats.total * percent) /
                                                100
                                            )
                                        )}
                                    </strong>
                                    <small>({percent}.0%)</small>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* TEMPLATE OVERVIEW */}
                <section className="notification-panel template-overview-panel">
                    <div className="notification-panel-header">
                        <h3>Template Overview</h3>
                    </div>

                    {[
                        [
                            <Bell size={15} />,
                            "Push Templates",
                            "24",
                        ],
                        [
                            <Mail size={15} />,
                            "Email Templates",
                            "32",
                        ],
                        [
                            <MessageSquare size={15} />,
                            "SMS Templates",
                            "18",
                        ],
                    ].map(([icon, name, count]) => (
                        <div
                            className="template-overview-row"
                            key={name}
                        >
                            <span className="template-icon">{icon}</span>
                            <strong>{name}</strong>
                            <span>{count}</span>
                            <button
                                onClick={() =>
                                    quickAction(`Manage ${name}`)
                                }
                            >
                                Manage
                            </button>
                        </div>
                    ))}

                    <button
                        className="notification-view-all-link"
                        onClick={() =>
                            quickAction("View All Templates")
                        }
                    >
                        View All Templates <ChevronRight size={14} />
                    </button>
                </section>
            </div>

            {/* ADD / EDIT MODAL */}
            {showAddModal && (
                <div
                    className="notification-modal-overlay"
                    onClick={() => setShowAddModal(false)}
                >
                    <div
                        className="notification-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="notification-modal-header">
                            <div>
                                <h2>
                                    {editingNotification
                                        ? "Edit Notification"
                                        : "Create Notification"}
                                </h2>
                                <p>
                                    Send notifications through multiple
                                    channels
                                </p>
                            </div>

                            <button
                                onClick={() => setShowAddModal(false)}
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <form
                            onSubmit={saveNotification}
                            className="notification-form"
                        >
                            <div className="notification-form-grid">
                                <div className="notification-form-group">
                                    <label>Notification Title *</label>
                                    <input
                                        value={form.title}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                title: e.target.value,
                                            })
                                        }
                                        placeholder="Enter notification title"
                                        required
                                    />
                                </div>

                                <div className="notification-form-group">
                                    <label>Channel *</label>
                                    <select
                                        value={form.channel}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                channel: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="PUSH">Push</option>
                                        <option value="EMAIL">Email</option>
                                        <option value="SMS">SMS</option>
                                    </select>
                                </div>

                                <div className="notification-form-group">
                                    <label>User Type *</label>
                                    <select
                                        value={form.userType}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                userType: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="ALL_USERS">
                                            All Users
                                        </option>
                                        <option value="DEALERS">Dealers</option>
                                        <option value="PAINTERS">Painters</option>
                                        <option value="REFERRERS">
                                            Referrers
                                        </option>
                                        <option value="STORE_STAFF">
                                            Store Staff
                                        </option>
                                        <option value="SUBSCRIBERS">
                                            Subscribers
                                        </option>
                                    </select>
                                </div>

                                <div className="notification-form-group">
                                    <label>Target Audience *</label>
                                    <input
                                        value={form.targetAudience}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                targetAudience: e.target.value,
                                            })
                                        }
                                        placeholder="Enter target audience"
                                        required
                                    />
                                </div>

                                <div className="notification-form-group">
                                    <label>Territory</label>
                                    <input
                                        value={form.territory}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                territory: e.target.value,
                                            })
                                        }
                                        placeholder="Enter territory"
                                    />
                                </div>

                                <div className="notification-form-group">
                                    <label>Status</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                status: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="SENT">Sent</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="FAILED">Failed</option>
                                        <option value="DRAFT">Draft</option>
                                    </select>
                                </div>

                                <div className="notification-form-group full">
                                    <label>Message *</label>
                                    <textarea
                                        rows="5"
                                        value={form.message}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                message: e.target.value,
                                            })
                                        }
                                        placeholder="Enter notification message"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="notification-modal-footern">
                                <button
                                    type="button"
                                    className="notification-cancel-btn"
                                    onClick={() =>
                                        setShowAddModal(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="notification-primary-btn"
                                >
                                    <Send size={15} />
                                    {editingNotification
                                        ? "Save Changes"
                                        : "Create Notification"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* VIEW MODAL */}
            {showViewModal && selectedNotification && (
                <div
                    className="notification-modal-overlay"
                    onClick={() => setShowViewModal(false)}
                >
                    <div
                        className="notification-modal notification-view-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="notification-modal-header">
                            <div>
                                <h2>Notification Details</h2>
                                <p>Complete notification information</p>
                            </div>
                        </div>

                        <div className="notification-detail-grid">
                            <div>
                                <span>Notification ID</span>
                                <strong>
                                    {selectedNotification.notificationId}
                                </strong>
                            </div>

                            <div>
                                <span>Title</span>
                                <strong>
                                    {selectedNotification.title}
                                </strong>
                            </div>

                            <div>
                                <span>Channel</span>
                                <strong>
                                    {channelLabel(
                                        selectedNotification.channel
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>User Type</span>
                                <strong>
                                    {userTypeLabel(
                                        selectedNotification.userType
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Target Audience</span>
                                <strong>
                                    {selectedNotification.targetAudience}
                                </strong>
                            </div>

                            <div>
                                <span>Sent On</span>
                                <strong>
                                    {formatDateTime(
                                        selectedNotification.sentOn
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Sent To</span>
                                <strong>
                                    {formatNumber(
                                        selectedNotification.sentTo
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Status</span>
                                <strong>
                                    {statusLabel(
                                        selectedNotification.status
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Open Rate</span>
                                <strong>
                                    {selectedNotification.openRate}
                                </strong>
                            </div>

                            <div>
                                <span>Click Rate</span>
                                <strong>
                                    {selectedNotification.clickRate}
                                </strong>
                            </div>

                            <div className="full">
                                <span>Message</span>
                                <strong>
                                    {selectedNotification.message || "-"}
                                </strong>
                            </div>
                        </div>

                        <div className="notification-modal-footern">
                            <button
                                className="notification-cancel-btn"
                                onClick={() =>
                                    setShowViewModal(false)
                                }
                            >
                                Close
                            </button>

                            <button
                                className="notification-primary-btn"
                                onClick={() => {
                                    setShowViewModal(false);
                                    openEditModal(selectedNotification);
                                }}
                            >
                                <Pencil size={15} />
                                Edit Notification
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationManagement;