import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Clock,
    Eye,
    FileText,
    Filter,
    History,
    MoreVertical,
    Plus,
    Search,
    Settings,
    UserCheck,
    Users,
    CheckCircle,
    XCircle,
    X,
    Pencil,
    Trash2,
} from "lucide-react";
import "../../css/superadmin/ApprovalWorkflow.css";


const API_URL = "https://oneplussparkpaintsserver.onrender.com/api/approvals";

const MODULE_TYPES = [
    "Reward Point Release",
    "Cash Reward Release",
    "Price Changes",
    "Bulk Payment Processing",
    "Dealer Registration Approval",
    "KYC Approval",
    "Product Price Revision",
    "Scheme Approval",
];

const ApprovalWorkflow = () => {
    const [dashboard, setDashboard] = useState({
        totalRequests: 0,
        pendingMyApproval: 0,
        pendingOthers: 0,
        approved: 0,
        rejected: 0,
        averageApprovalTime: 0,
    });

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [moduleFilter, setModuleFilter] = useState("All Modules");
    const [requestTypeFilter, setRequestTypeFilter] = useState("All Types");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [requestedByFilter, setRequestedByFilter] = useState("All Users");

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [showNewRequest, setShowNewRequest] = useState(false);
    const [showEditRequest, setShowEditRequest] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showView, setShowView] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [openMenu, setOpenMenu] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);

    const [actionLoading, setActionLoading] = useState(false);

    const [formData, setFormData] = useState({
        requestId: "",
        moduleType: "",
        requestType: "",
        requestDetails: "",
        requestedBy: "",
        amount: "",
        remarks: "",
    });

    const fetchDashboard = async () => {
        try {
            const response = await axios.get(`${API_URL}/dashboard`);

            if (response.data.success) {
                setDashboard(response.data.dashboard);
            }
        } catch (error) {
            console.error("Get approval dashboard error:", error);
        }
    };

    const fetchRequests = async () => {
        try {
            setLoading(true);

            const response = await axios.get(API_URL);

            if (response.data.success) {
                setRequests(response.data.requests || []);
            }
        } catch (error) {
            console.error("Get approval requests error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async () => {
        await Promise.all([
            fetchDashboard(),
            fetchRequests(),
        ]);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFormChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreateRequest = async (e) => {
        e.preventDefault();

        try {
            setActionLoading(true);

            const payload = {
                requestId: formData.requestId.trim(),
                moduleType: formData.moduleType,
                requestType: formData.requestType.trim(),
                requestDetails: formData.requestDetails.trim(),
                requestedBy: formData.requestedBy.trim(),
                amount:
                    formData.amount === ""
                        ? 0
                        : Number(formData.amount),
                remarks: formData.remarks.trim(),
            };

            const response = await axios.post(API_URL, payload);

            if (response.data.success) {
                alert("Approval request created successfully");

                setShowNewRequest(false);

                setFormData({
                    requestId: "",
                    moduleType: "",
                    requestType: "",
                    requestDetails: "",
                    requestedBy: "",
                    amount: "",
                    remarks: "",
                });

                await fetchData();
                setCurrentPage(1);
            }
        } catch (error) {
            console.error("Create approval request error:", error);

            alert(
                error.response?.data?.message ||
                "Failed to create approval request"
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleApprove = async (request) => {
        const confirmed = window.confirm(
            `Approve request ${request.requestId}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(true);

            const response = await axios.put(
                `${API_URL}/${request._id}/approve`,
                {
                    checker: "Super Admin",
                    remarks: "Approval request approved",
                }
            );

            if (response.data.success) {
                alert("Approval request approved successfully");

                setOpenMenu(null);
                setShowView(false);

                await fetchData();
            }
        } catch (error) {
            console.error("Approve request error:", error);

            alert(
                error.response?.data?.message ||
                "Failed to approve request"
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (request) => {
        const reason = window.prompt(
            "Enter rejection remarks:"
        );

        if (reason === null) {
            return;
        }

        try {
            setActionLoading(true);

            const response = await axios.put(
                `${API_URL}/${request._id}/reject`,
                {
                    checker: "Super Admin",
                    remarks:
                        reason.trim() ||
                        "Approval request rejected",
                }
            );

            if (response.data.success) {
                alert("Approval request rejected successfully");

                setOpenMenu(null);
                setShowView(false);

                await fetchData();
            }
        } catch (error) {
            console.error("Reject request error:", error);

            alert(
                error.response?.data?.message ||
                "Failed to reject request"
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleEdit = (request) => {
        setFormData({
            requestId: request.requestId || "",
            moduleType: request.moduleType || "",
            requestType: request.requestType || "",
            requestDetails: request.requestDetails || "",
            requestedBy: request.requestedBy || "",
            amount: request.amount ?? "",
            remarks: request.remarks || "",
        });

        setSelectedRequest(request);
        setShowEditRequest(true);
        setOpenMenu(null);
    };

    const handleDelete = async (request) => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete request ${request.requestId}?`
        );

        if (!confirmDelete) return;

        try {
            const response = await fetch(`${API_URL}/${request._id}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete approval request");
            }

            setRequests((prevRequests) =>
                prevRequests.filter((item) => item._id !== request._id)
            );

            setOpenMenu(null);
        } catch (error) {
            console.error("Delete approval request error:", error);
            alert(error.message);
        }
    };

    const handleUpdateRequest = async (e) => {
        e.preventDefault();

        try {
            setActionLoading(true);

            const payload = {
                moduleType: formData.moduleType,
                requestType: formData.requestType.trim(),
                requestDetails: formData.requestDetails.trim(),
                requestedBy: formData.requestedBy.trim(),
                amount:
                    formData.amount === ""
                        ? 0
                        : Number(formData.amount),
                currentStage: selectedRequest.currentStage,
                maker: selectedRequest.maker || "",
                checker: selectedRequest.checker || "",
                remarks: formData.remarks.trim(),
            };

            const response = await axios.put(
                `${API_URL}/${selectedRequest._id}`,
                payload
            );

            if (response.data.success) {
                alert("Approval request updated successfully");

                setRequests((prevRequests) =>
                    prevRequests.map((request) =>
                        request._id === selectedRequest._id
                            ? response.data.request
                            : request
                    )
                );

                setShowEditRequest(false);
                setSelectedRequest(null);
                setOpenMenu(null);
            }
        } catch (error) {
            console.error("Update approval request error:", error);

            alert(
                error.response?.data?.message ||
                "Failed to update approval request"
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleView = async (request) => {
        try {
            const response = await axios.get(
                `${API_URL}/${request._id}`
            );

            if (response.data.success) {
                setSelectedRequest(response.data.request);
                setShowView(true);
            }
        } catch (error) {
            console.error("Get approval request error:", error);

            alert(
                error.response?.data?.message ||
                "Failed to fetch request details"
            );
        }

        setOpenMenu(null);
    };

    const filteredRequests = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        return requests.filter((request) => {
            const matchesSearch =
                !searchValue ||
                request.requestId
                    ?.toLowerCase()
                    .includes(searchValue) ||
                request.requestDetails
                    ?.toLowerCase()
                    .includes(searchValue) ||
                request.remarks
                    ?.toLowerCase()
                    .includes(searchValue);

            const matchesModule =
                moduleFilter === "All Modules" ||
                request.moduleType === moduleFilter;

            const matchesRequestType =
                requestTypeFilter === "All Types" ||
                request.requestType === requestTypeFilter;

            const matchesStatus =
                statusFilter === "All Status" ||
                request.status === statusFilter;

            const matchesRequestedBy =
                requestedByFilter === "All Users" ||
                request.requestedBy === requestedByFilter;

            return (
                matchesSearch &&
                matchesModule &&
                matchesRequestType &&
                matchesStatus &&
                matchesRequestedBy
            );
        });
    }, [
        requests,
        search,
        moduleFilter,
        requestTypeFilter,
        statusFilter,
        requestedByFilter,
    ]);

    useEffect(() => {
        setCurrentPage(1);
    }, [
        search,
        moduleFilter,
        requestTypeFilter,
        statusFilter,
        requestedByFilter,
    ]);

    const totalPages = Math.max(
        1,
        Math.ceil(
            filteredRequests.length / itemsPerPage
        )
    );

    const safePage = Math.min(
        currentPage,
        totalPages
    );

    const startIndex =
        (safePage - 1) * itemsPerPage;

    const paginatedRequests = filteredRequests.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const uniqueRequestTypes = [
        ...new Set(
            requests
                .map((request) => request.requestType)
                .filter(Boolean)
        ),
    ];

    const uniqueRequestedUsers = [
        ...new Set(
            requests
                .map((request) => request.requestedBy)
                .filter(Boolean)
        ),
    ];

    const formatDateTime = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatAverageTime = (milliseconds) => {
        if (!milliseconds || milliseconds <= 0) {
            return "0m";
        }

        const totalMinutes = Math.floor(
            milliseconds / 60000
        );

        const hours = Math.floor(
            totalMinutes / 60
        );

        const minutes = totalMinutes % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }

        return `${minutes}m`;
    };

    const getStatusClass = (status) => {
        if (status === "Approved") {
            return "approval-status approved";
        }

        if (status === "Rejected") {
            return "approval-status rejected";
        }

        return "approval-status pending";
    };

    const getStageClass = (stage) => {
        if (stage === "Completed") {
            return "approval-stage completed";
        }

        return "approval-stage checker";
    };

    const stats = [
        {
            title: "Total Requests",
            value: dashboard.totalRequests,
            subtitle: "All Time",
            icon: FileText,
            className: "purple",
        },
        {
            title: "Pending (My Approval)",
            value: dashboard.pendingMyApproval,
            subtitle: "Requires your action",
            icon: Clock,
            className: "orange",
        },
        {
            title: "Pending (Others)",
            value: dashboard.pendingOthers,
            subtitle: "Awaiting approval",
            icon: Users,
            className: "orange",
        },
        {
            title: "Approved",
            value: dashboard.approved,
            subtitle: "This Year",
            icon: CheckCircle,
            className: "green",
        },
        {
            title: "Rejected",
            value: dashboard.rejected,
            subtitle: "This Year",
            icon: XCircle,
            className: "red",
        },
        {
            title: "Average Approval Time",
            value: formatAverageTime(
                dashboard.averageApprovalTime
            ),
            subtitle: "This Year",
            icon: Clock,
            className: "blue",
        },
    ];

    const statusTotal =
        dashboard.pendingMyApproval +
        dashboard.pendingOthers +
        dashboard.approved +
        dashboard.rejected;

    const pendingMyPercent =
        statusTotal > 0
            ? (
                (dashboard.pendingMyApproval /
                    statusTotal) *
                100
            ).toFixed(2)
            : "0.00";

    const pendingOthersPercent =
        statusTotal > 0
            ? (
                (dashboard.pendingOthers /
                    statusTotal) *
                100
            ).toFixed(2)
            : "0.00";

    const approvedPercent =
        statusTotal > 0
            ? (
                (dashboard.approved /
                    statusTotal) *
                100
            ).toFixed(2)
            : "0.00";

    const rejectedPercent =
        statusTotal > 0
            ? (
                (dashboard.rejected /
                    statusTotal) *
                100
            ).toFixed(2)
            : "0.00";

    const recentAuditTrail = requests
        .flatMap((request) =>
            (request.auditTrail || []).map(
                (audit) => ({
                    ...audit,
                    requestId: request.requestId,
                    moduleType: request.moduleType,
                })
            )
        )
        .sort(
            (a, b) =>
                new Date(b.performedAt) -
                new Date(a.performedAt)
        )
        .slice(0, 3);

    const renderPageNumbers = () => {
        const pages = [];

        if (totalPages <= 6) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }

            return pages;
        }

        pages.push(1);

        if (safePage > 3) {
            pages.push("...");
        }

        const start = Math.max(2, safePage - 1);
        const end = Math.min(
            totalPages - 1,
            safePage + 1
        );

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (safePage < totalPages - 2) {
            pages.push("...");
        }

        pages.push(totalPages);

        return pages;
    };

    return (
        <div className="approval-workflow-page">
            {/* PAGE HEADER */}
            <div className="approval-page-header">
                <div>
                    <h1>Maker–Checker Approval Workflow</h1>

                    <p>
                        Sensitive operations require dual approval
                        to ensure accuracy, compliance and
                        accountability.
                    </p>

                    <div className="approval-breadcrumb">
                        <span>Dashboard</span>
                        <ChevronRight size={14} />
                        <span>Maker–Checker Approval</span>
                        <ChevronRight size={14} />
                        <span>Approval Requests</span>
                    </div>
                </div>

                <div className="approval-header-actions">
                    <button
                        className="approval-secondary-btn"
                        onClick={() =>
                            setShowSettings(true)
                        }
                    >
                        <Settings size={16} />
                        Workflow Settings
                    </button>

                    <button
                        className="approval-primary-btn"
                        onClick={() =>
                            setShowNewRequest(true)
                        }
                    >
                        <Plus size={17} />
                        New Approval Request
                    </button>
                </div>
            </div>

            {/* STATS */}
            <div className="approval-stats-grid">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <div
                            className="approval-stat-card"
                            key={stat.title}
                        >
                            <div
                                className={`approval-stat-icon ${stat.className}`}
                            >
                                <Icon size={22} />
                            </div>

                            <div className="approval-stat-content">
                                <span>{stat.title}</span>
                                <strong>{stat.value}</strong>
                                <small>{stat.subtitle}</small>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* FILTERS */}
            <div className="approval-filter-card">
                <div className="approval-filter-item date">
                    <label>Date Range</label>

                    <div className="approval-date-box">
                        <span>16 May 2026 - 22 May 2026</span>
                        <ChevronDown size={14} />
                    </div>
                </div>

                <div className="approval-filter-item">
                    <label>Module / Type</label>

                    <select
                        value={moduleFilter}
                        onChange={(e) =>
                            setModuleFilter(e.target.value)
                        }
                    >
                        <option>All Modules</option>

                        {MODULE_TYPES.map((module) => (
                            <option
                                key={module}
                                value={module}
                            >
                                {module}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="approval-filter-item">
                    <label>Request Type</label>

                    <select
                        value={requestTypeFilter}
                        onChange={(e) =>
                            setRequestTypeFilter(e.target.value)
                        }
                    >
                        <option>All Types</option>

                        {uniqueRequestTypes.map((type) => (
                            <option
                                key={type}
                                value={type}
                            >
                                {type}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="approval-filter-item">
                    <label>Status</label>

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(e.target.value)
                        }
                    >
                        <option>All Status</option>
                        <option>Pending</option>
                        <option>Approved</option>
                        <option>Rejected</option>
                    </select>
                </div>

                <div className="approval-filter-item">
                    <label>Requested By</label>

                    <select
                        value={requestedByFilter}
                        onChange={(e) =>
                            setRequestedByFilter(e.target.value)
                        }
                    >
                        <option>All Users</option>

                        {uniqueRequestedUsers.map((user) => (
                            <option
                                key={user}
                                value={user}
                            >
                                {user}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="approval-search-box">
                    <Search size={17} />

                    <input
                        type="text"
                        placeholder="Search by request ID, remark..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />
                </div>

                <button
                    className="approval-filter-btn"
                    onClick={() => {
                        setCurrentPage(1);
                    }}
                >
                    <Filter size={16} />
                    Filters
                </button>
            </div>

            {/* MAIN GRID */}
            <div className="approval-main-grid">
                {/* REQUEST TABLE */}
                <div className="approval-table-card">
                    <div className="approval-table-header">
                        <h2>
                            Approval Requests (
                            {filteredRequests.length})
                        </h2>
                    </div>

                    <div className="approval-table-wrapper">
                        <table className="approval-table">
                            <thead>
                                <tr>
                                    <th className="expand-column"></th>
                                    <th>Request ID</th>
                                    <th>Module / Type</th>
                                    <th>Request Details</th>
                                    <th>Requested By</th>
                                    <th>Request Date & Time</th>
                                    <th>Amount (₹)</th>
                                    <th>Current Stage</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="10"
                                            className="approval-empty-cell"
                                        >
                                            Loading approval requests...
                                        </td>
                                    </tr>
                                ) : paginatedRequests.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="10"
                                            className="approval-empty-cell"
                                        >
                                            No approval requests found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedRequests.map(
                                        (request, index) => (
                                            <React.Fragment
                                                key={request._id}
                                            >
                                                <tr>
                                                    <td>
                                                        <button
                                                            className="approval-expand-btn"
                                                            onClick={() =>
                                                                setExpandedRow(
                                                                    expandedRow ===
                                                                        request._id
                                                                        ? null
                                                                        : request._id
                                                                )
                                                            }
                                                        >
                                                            {expandedRow ===
                                                                request._id ? (
                                                                <ChevronDown
                                                                    size={14}
                                                                />
                                                            ) : (
                                                                <ChevronRight
                                                                    size={14}
                                                                />
                                                            )}
                                                        </button>
                                                    </td>

                                                    <td>
                                                        <span className="request-id">
                                                            {request.requestId}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span className="module-name">
                                                            {request.moduleType}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span className="request-details">
                                                            {request.requestDetails ||
                                                                "-"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {request.requestedBy ||
                                                            "-"}
                                                    </td>

                                                    <td>
                                                        {formatDateTime(
                                                            request.requestedAt
                                                        )}
                                                    </td>

                                                    <td>
                                                        {Number(
                                                            request.amount || 0
                                                        ).toLocaleString(
                                                            "en-IN",
                                                            {
                                                                minimumFractionDigits: 2,
                                                            }
                                                        )}
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={getStageClass(
                                                                request.currentStage
                                                            )}
                                                        >
                                                            {request.currentStage}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={getStatusClass(
                                                                request.status
                                                            )}
                                                        >
                                                            {request.status}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <div className="approval-row-actions">
                                                            <button
                                                                className="row-icon-btn"
                                                                title="View"
                                                                onClick={() =>
                                                                    handleView(
                                                                        request
                                                                    )
                                                                }
                                                            >
                                                                <Eye size={16} />
                                                            </button>

                                                            <button
                                                                className="row-icon-btn"
                                                                onClick={() => handleEdit(request)}
                                                            >
                                                                <Pencil size={14} />
                                                            </button>

                                                            <button
                                                                className="row-icon-btn row-icon-btn-delete"
                                                                onClick={() => handleDelete(request)}
                                                                disabled={actionLoading}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>

                                                            {request.status ===
                                                                "Pending" && (
                                                                    <button
                                                                        className="row-icon-btn approve-icon"
                                                                        title="Approve"
                                                                        onClick={() =>
                                                                            handleApprove(
                                                                                request
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            actionLoading
                                                                        }
                                                                    >
                                                                        <CheckCircle
                                                                            size={20}
                                                                        />
                                                                    </button>
                                                                )}

                                                            <div className="approval-more-wrapper">
                                                                <button
                                                                    className="row-icon-btn"
                                                                    title="More"
                                                                    onClick={() =>
                                                                        setOpenMenu(
                                                                            openMenu ===
                                                                                request._id
                                                                                ? null
                                                                                : request._id
                                                                        )
                                                                    }
                                                                >
                                                                    <MoreVertical
                                                                        size={16}
                                                                    />
                                                                </button>

                                                                {openMenu ===
                                                                    request._id && (
                                                                        <div className="approval-more-menu">
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleView(
                                                                                        request
                                                                                    )
                                                                                }
                                                                            >
                                                                                <Eye
                                                                                    size={14}
                                                                                />
                                                                                View Details
                                                                            </button>

                                                                            {request.status ===
                                                                                "Pending" && (
                                                                                    <>
                                                                                        <button
                                                                                            onClick={() =>
                                                                                                handleApprove(
                                                                                                    request
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <CheckCircle
                                                                                                size={14}
                                                                                            />
                                                                                            Approve
                                                                                        </button>

                                                                                        <button
                                                                                            onClick={() =>
                                                                                                handleReject(
                                                                                                    request
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <XCircle
                                                                                                size={14}
                                                                                            />
                                                                                            Reject
                                                                                        </button>
                                                                                    </>
                                                                                )}

                                                                            <button
                                                                                onClick={() => {
                                                                                    setExpandedRow(
                                                                                        request._id
                                                                                    );
                                                                                    setOpenMenu(
                                                                                        null
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <History
                                                                                    size={14}
                                                                                />
                                                                                Audit Trail
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {expandedRow ===
                                                    request._id && (
                                                        <tr className="approval-expanded-row">
                                                            <td colSpan="10">
                                                                <div className="approval-expanded-content">
                                                                    <div>
                                                                        <strong>
                                                                            Request Type
                                                                        </strong>
                                                                        <span>
                                                                            {request.requestType ||
                                                                                "-"}
                                                                        </span>
                                                                    </div>

                                                                    <div>
                                                                        <strong>
                                                                            Maker
                                                                        </strong>
                                                                        <span>
                                                                            {request.maker ||
                                                                                "-"}
                                                                        </span>
                                                                    </div>

                                                                    <div>
                                                                        <strong>
                                                                            Checker
                                                                        </strong>
                                                                        <span>
                                                                            {request.checker ||
                                                                                "-"}
                                                                        </span>
                                                                    </div>

                                                                    <div>
                                                                        <strong>
                                                                            Remarks
                                                                        </strong>
                                                                        <span>
                                                                            {request.remarks ||
                                                                                "-"}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div className="approval-expanded-audit">
                                                                    <strong>
                                                                        Audit Trail
                                                                    </strong>

                                                                    {(request.auditTrail ||
                                                                        [])
                                                                        .slice()
                                                                        .reverse()
                                                                        .map(
                                                                            (
                                                                                audit,
                                                                                auditIndex
                                                                            ) => (
                                                                                <div
                                                                                    className="audit-line"
                                                                                    key={
                                                                                        audit._id ||
                                                                                        auditIndex
                                                                                    }
                                                                                >
                                                                                    <span>
                                                                                        {
                                                                                            audit.action
                                                                                        }
                                                                                    </span>

                                                                                    <span>
                                                                                        {
                                                                                            audit.performedBy
                                                                                        }
                                                                                    </span>

                                                                                    <span>
                                                                                        {formatDateTime(
                                                                                            audit.performedAt
                                                                                        )}
                                                                                    </span>

                                                                                    <span>
                                                                                        {audit.remarks ||
                                                                                            "-"}
                                                                                    </span>
                                                                                </div>
                                                                            )
                                                                        )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                            </React.Fragment>
                                        )
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    <div className="approval-pagination">
                        <span>
                            Showing{" "}
                            {filteredRequests.length === 0
                                ? 0
                                : startIndex + 1}{" "}
                            to{" "}
                            {Math.min(
                                startIndex + itemsPerPage,
                                filteredRequests.length
                            )}{" "}
                            of {filteredRequests.length} entries
                        </span>

                        <div className="pagination-controlsa">
                            <button
                                disabled={safePage === 1}
                                onClick={() =>
                                    setCurrentPage(
                                        Math.max(1, safePage - 1)
                                    )
                                }
                            >
                                <ChevronLeft size={15} />
                            </button>

                            {renderPageNumbers().map(
                                (page, index) =>
                                    page === "..." ? (
                                        <span
                                            className="pagination-dots"
                                            key={`dots-${index}`}
                                        >
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={page}
                                            className={
                                                safePage === page
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={() =>
                                                setCurrentPage(page)
                                            }
                                        >
                                            {page}
                                        </button>
                                    )
                            )}

                            <button
                                disabled={safePage === totalPages}
                                onClick={() =>
                                    setCurrentPage(
                                        Math.min(
                                            totalPages,
                                            safePage + 1
                                        )
                                    )
                                }
                            >
                                <ChevronRight size={15} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="approval-right-column">
                    {/* APPROVAL MATRIX */}
                    <div className="approval-side-card">
                        <div className="approval-side-header">
                            <h3>Approval Matrix</h3>
                        </div>

                        <div className="approval-matrix-header">
                            <span>Module / Type</span>
                            <span>Maker</span>
                            <span>Checker</span>
                        </div>

                        {MODULE_TYPES.map((module) => (
                            <div
                                className="approval-matrix-row"
                                key={module}
                            >
                                <span>{module}</span>

                                <UserCheck
                                    size={15}
                                    className="matrix-user-icon"
                                />

                                <UserCheck
                                    size={15}
                                    className="matrix-user-icon"
                                />
                            </div>
                        ))}
                    </div>

                    {/* STATUS OVERVIEW */}
                    <div className="approval-side-card">
                        <div className="approval-side-header">
                            <h3>Request Status Overview</h3>
                        </div>

                        <div className="approval-status-overview">
                            <div
                                className="approval-donut"
                                style={{
                                    background: `conic-gradient(
                    #f59e0b 0% ${pendingMyPercent}%,
                    #fb923c ${pendingMyPercent}% ${Number(pendingMyPercent) +
                                        Number(pendingOthersPercent)
                                        }%,
                    #22c55e ${Number(pendingMyPercent) +
                                        Number(pendingOthersPercent)
                                        }% ${Number(pendingMyPercent) +
                                        Number(pendingOthersPercent) +
                                        Number(approvedPercent)
                                        }%,
                    #ef4444 ${Number(pendingMyPercent) +
                                        Number(pendingOthersPercent) +
                                        Number(approvedPercent)
                                        }% 100%
                  )`,
                                }}
                            >
                                <div className="approval-donut-inner">
                                    <strong>{statusTotal}</strong>
                                    <span>Total</span>
                                </div>
                            </div>

                            <div className="approval-status-legend">
                                <div>
                                    <span className="legend-dot pending-my"></span>
                                    <span>
                                        Pending (My Approval)
                                    </span>
                                    <strong>
                                        {dashboard.pendingMyApproval}
                                    </strong>
                                </div>

                                <div>
                                    <span className="legend-dot pending-other"></span>
                                    <span>
                                        Pending (Others)
                                    </span>
                                    <strong>
                                        {dashboard.pendingOthers}
                                    </strong>
                                </div>

                                <div>
                                    <span className="legend-dot approved-dot"></span>
                                    <span>Approved</span>
                                    <strong>
                                        {dashboard.approved}
                                    </strong>
                                </div>

                                <div>
                                    <span className="legend-dot rejected-dot"></span>
                                    <span>Rejected</span>
                                    <strong>
                                        {dashboard.rejected}
                                    </strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RECENT AUDIT TRAIL */}
                    <div className="approval-side-card">
                        <div className="approval-side-header">
                            <h3>Recent Audit Trail</h3>

                            <button
                                onClick={() => {
                                    setExpandedRow(null);
                                    alert(
                                        "Recent audit trail is shown below."
                                    );
                                }}
                            >
                                View All
                            </button>
                        </div>

                        {recentAuditTrail.length === 0 ? (
                            <div className="approval-no-audit">
                                No audit activity available.
                            </div>
                        ) : (
                            <div className="recent-audit-list">
                                {recentAuditTrail.map(
                                    (audit, index) => (
                                        <div
                                            className="recent-audit-item"
                                            key={
                                                audit._id || index
                                            }
                                        >
                                            <div className="recent-audit-icon">
                                                {audit.action ===
                                                    "Approved" ? (
                                                    <CheckCircle
                                                        size={15}
                                                    />
                                                ) : audit.action ===
                                                    "Rejected" ? (
                                                    <XCircle size={15} />
                                                ) : (
                                                    <FileText
                                                        size={15}
                                                    />
                                                )}
                                            </div>

                                            <div className="recent-audit-content">
                                                <strong>
                                                    {audit.requestId}
                                                </strong>

                                                <span>
                                                    {audit.moduleType}
                                                </span>

                                                <small>
                                                    {audit.action} by{" "}
                                                    {audit.performedBy}
                                                </small>

                                                <small>
                                                    {formatDateTime(
                                                        audit.performedAt
                                                    )}
                                                </small>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ABOUT WORKFLOW */}
            <div className="approval-about-card">
                <div>
                    <h3>
                        About Maker–Checker Workflow
                    </h3>

                    <p>
                        This workflow ensures that critical and
                        sensitive operations are verified by an
                        independent authorized user.
                    </p>

                    <p>
                        All approvals and actions are logged for
                        complete transparency and audit compliance.
                    </p>
                </div>

                <div className="approval-flow">
                    <div className="approval-flow-item">
                        <div className="approval-flow-icon">
                            <Users size={21} />
                        </div>

                        <strong>Request Initiated</strong>
                        <span>(Maker)</span>
                    </div>

                    <ChevronRight size={20} />

                    <div className="approval-flow-item">
                        <div className="approval-flow-icon">
                            <Clock size={21} />
                        </div>

                        <strong>Pending for Approval</strong>
                        <span>(Checker)</span>
                    </div>

                    <ChevronRight size={20} />

                    <div className="approval-flow-item">
                        <div className="approval-flow-icon">
                            <CheckCircle size={21} />
                        </div>

                        <strong>Approved / Rejected</strong>
                        <span>(Decision)</span>
                    </div>

                    <ChevronRight size={20} />

                    <div className="approval-flow-item">
                        <div className="approval-flow-icon">
                            <FileText size={21} />
                        </div>

                        <strong>Action Executed</strong>
                        <span>(Completed)</span>
                    </div>
                </div>
            </div>

            {/* NEW APPROVAL REQUEST MODAL */}
            {showNewRequest && (
                <div
                    className="approval-modal-overlay"
                    onClick={() =>
                        setShowNewRequest(false)
                    }
                >
                    <div
                        className="approval-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        <div className="approval-modal-header">
                            <div>
                                <h2>New Approval Request</h2>
                                <p>
                                    Create a new maker–checker approval
                                    request.
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setShowNewRequest(false)
                                }
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleCreateRequest}
                        >
                            <div className="approval-form-grid">
                                <div className="approval-form-field">
                                    <label>
                                        Request ID<span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="requestId"
                                        value={formData.requestId}
                                        onChange={handleFormChange}
                                        placeholder="Enter request ID"
                                        required
                                    />
                                </div>

                                <div className="approval-form-field">
                                    <label>
                                        Module / Type<span>*</span>
                                    </label>

                                    <select
                                        name="moduleType"
                                        value={formData.moduleType}
                                        onChange={handleFormChange}
                                        required
                                    >
                                        <option value="">
                                            Select module / type
                                        </option>

                                        {MODULE_TYPES.map(
                                            (module) => (
                                                <option
                                                    key={module}
                                                    value={module}
                                                >
                                                    {module}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div className="approval-form-field">
                                    <label>Request Type</label>

                                    <input
                                        type="text"
                                        name="requestType"
                                        value={formData.requestType}
                                        onChange={handleFormChange}
                                        placeholder="Enter request type"
                                    />
                                </div>

                                <div className="approval-form-field">
                                    <label>
                                        Requested By<span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="requestedBy"
                                        value={formData.requestedBy}
                                        onChange={(e) => /^[A-Za-z\s]*$/.test(e.target.value) && handleFormChange(e)}
                                        placeholder="Enter requester name"
                                        required
                                    />
                                </div>

                                <div className="approval-form-field full">
                                    <label>Request Details</label>

                                    <textarea
                                        name="requestDetails"
                                        value={
                                            formData.requestDetails
                                        }
                                        onChange={handleFormChange}
                                        placeholder="Enter request details"
                                        rows="3"
                                    />
                                </div>

                                <div className="approval-form-field">
                                    <label>Amount (₹)</label>

                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleFormChange}
                                        placeholder="Enter amount"
                                        min="0"
                                    />
                                </div>

                                <div className="approval-form-field">
                                    <label>Remarks</label>

                                    <input
                                        type="text"
                                        name="remarks"
                                        value={formData.remarks}
                                        onChange={handleFormChange}
                                        placeholder="Enter remarks"
                                    />
                                </div>
                            </div>

                            <div className="approval-modal-footer">
                                <button
                                    type="button"
                                    className="approval-cancel-btn"
                                    onClick={() =>
                                        setShowNewRequest(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="approval-primary-btn"
                                    disabled={actionLoading}
                                >
                                    <Plus size={16} />
                                    {actionLoading
                                        ? "Creating..."
                                        : "Create Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* VIEW REQUEST MODAL */}
            {showView &&
                selectedRequest && (
                    <div
                        className="approval-modal-overlay"
                        onClick={() =>
                            setShowView(false)
                        }
                    >
                        <div
                            className="approval-modal approval-view-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >
                            <div className="approval-modal-header">
                                <div>
                                    <h2>
                                        Approval Request Details
                                    </h2>
                                    <p>
                                        {selectedRequest.requestId}
                                    </p>
                                </div>
                            </div>

                            <div className="approval-detail-grid">
                                <div>
                                    <label>Request ID</label>
                                    <strong>
                                        {selectedRequest.requestId}
                                    </strong>
                                </div>

                                <div>
                                    <label>Module / Type</label>
                                    <strong>
                                        {selectedRequest.moduleType}
                                    </strong>
                                </div>

                                <div>
                                    <label>Request Type</label>
                                    <strong>
                                        {selectedRequest.requestType ||
                                            "-"}
                                    </strong>
                                </div>

                                <div>
                                    <label>Requested By</label>
                                    <strong>
                                        {selectedRequest.requestedBy}
                                    </strong>
                                </div>

                                <div>
                                    <label>Request Date & Time</label>
                                    <strong>
                                        {formatDateTime(
                                            selectedRequest.requestedAt
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <label>Amount (₹)</label>
                                    <strong>
                                        {Number(
                                            selectedRequest.amount || 0
                                        ).toLocaleString("en-IN", {
                                            minimumFractionDigits: 2,
                                        })}
                                    </strong>
                                </div>

                                <div>
                                    <label>Current Stage</label>
                                    <strong>
                                        {selectedRequest.currentStage}
                                    </strong>
                                </div>

                                <div>
                                    <label>Status</label>
                                    <strong>
                                        {selectedRequest.status}
                                    </strong>
                                </div>

                                <div className="full">
                                    <label>Request Details</label>
                                    <strong>
                                        {selectedRequest.requestDetails ||
                                            "-"}
                                    </strong>
                                </div>

                                <div className="full">
                                    <label>Remarks</label>
                                    <strong>
                                        {selectedRequest.remarks ||
                                            "-"}
                                    </strong>
                                </div>
                            </div>

                            <div className="approval-view-audit">
                                <h3>Audit Trail</h3>

                                {(selectedRequest.auditTrail ||
                                    [])
                                    .slice()
                                    .reverse()
                                    .map(
                                        (audit, index) => (
                                            <div
                                                className="view-audit-row"
                                                key={
                                                    audit._id ||
                                                    index
                                                }
                                            >
                                                <div>
                                                    <strong>
                                                        {audit.action}
                                                    </strong>

                                                    <span>
                                                        {audit.performedBy}
                                                    </span>
                                                </div>

                                                <div>
                                                    <span>
                                                        {formatDateTime(
                                                            audit.performedAt
                                                        )}
                                                    </span>

                                                    <small>
                                                        {audit.remarks ||
                                                            "-"}
                                                    </small>
                                                </div>
                                            </div>
                                        )
                                    )}
                            </div>



                            {selectedRequest.status ===
                                "Pending" && (
                                    <div className="approval-modal-footer">
                                        <button
                                            className="approval-reject-btn"
                                            onClick={() =>
                                                handleReject(
                                                    selectedRequest
                                                )
                                            }
                                            disabled={actionLoading}
                                        >
                                            <XCircle size={16} />
                                            Reject
                                        </button>

                                        <button
                                            className="approval-approve-btn"
                                            onClick={() =>
                                                handleApprove(
                                                    selectedRequest
                                                )
                                            }
                                            disabled={actionLoading}
                                        >
                                            <CheckCircle size={16} />
                                            Approve
                                        </button>
                                    </div>
                                )}
                            <div className="view-aw-footer">
                                <button
                                    className="view-aw-footer-bottom"
                                    onClick={() =>
                                        setShowView(false)
                                    }
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                    </div>
                )}

            {/* WORKFLOW SETTINGS MODAL */}
            {showSettings && (
                <div
                    className="approval-modal-overlay"
                    onClick={() =>
                        setShowSettings(false)
                    }
                >
                    <div
                        className="approval-modal approval-settings-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        <div className="approval-modal-header">
                            <div>
                                <h2>Workflow Settings</h2>
                                <p>
                                    Approval modules configured for
                                    maker–checker workflow.
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setShowSettings(false)
                                }
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="workflow-settings-list">
                            {MODULE_TYPES.map(
                                (module, index) => (
                                    <div
                                        className="workflow-setting-row"
                                        key={module}
                                    >
                                        <span>
                                            {index + 1}
                                        </span>

                                        <strong>{module}</strong>

                                        <div>
                                            <UserCheck size={15} />
                                            Maker
                                        </div>

                                        <div>
                                            <UserCheck size={15} />
                                            Checker
                                        </div>
                                    </div>
                                )
                            )}
                        </div>

                        <div className="approval-modal-footer">
                            <button
                                className="approval-primary-btn"
                                onClick={() =>
                                    setShowSettings(false)
                                }
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT APPROVAL REQUEST MODAL */}
            {showEditRequest && selectedRequest && (
                <div
                    className="approval-modal-overlay"
                    onClick={() => setShowEditRequest(false)}
                >
                    <div
                        className="approval-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="approval-modal-header">
                            <div>
                                <h2>Edit Approval Request</h2>
                                <p>
                                    Update approval request details.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowEditRequest(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateRequest}>
                            <div className="approval-form-grid">

                                <div className="approval-form-field">
                                    <label>Request ID</label>
                                    <input
                                        type="text"
                                        value={formData.requestId}
                                        disabled
                                    />
                                </div>

                                <div className="approval-form-field">
                                    <label>
                                        Module / Type<span>*</span>
                                    </label>

                                    <select
                                        name="moduleType"
                                        value={formData.moduleType}
                                        onChange={handleFormChange}
                                        required
                                    >
                                        <option value="">
                                            Select module / type
                                        </option>

                                        {MODULE_TYPES.map((module) => (
                                            <option
                                                key={module}
                                                value={module}
                                            >
                                                {module}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="approval-form-field">
                                    <label>Request Type</label>

                                    <input
                                        type="text"
                                        name="requestType"
                                        value={formData.requestType}
                                        onChange={handleFormChange}
                                        placeholder="Enter request type"
                                    />
                                </div>

                                <div className="approval-form-field">
                                    <label>
                                        Requested By<span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="requestedBy"
                                        value={formData.requestedBy}
                                        onChange={(e) => /^[A-Za-z\s]*$/.test(e.target.value) && handleFormChange(e)}
                                        placeholder="Enter requester name"
                                        required
                                    />
                                </div>

                                <div className="approval-form-field full">
                                    <label>Request Details</label>

                                    <textarea
                                        name="requestDetails"
                                        value={formData.requestDetails}
                                        onChange={handleFormChange}
                                        placeholder="Enter request details"
                                        rows="3"
                                    />
                                </div>

                                <div className="approval-form-field">
                                    <label>Amount (₹)</label>

                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleFormChange}
                                        placeholder="Enter amount"
                                        min="0"
                                    />
                                </div>

                                <div className="approval-form-field">
                                    <label>Remarks</label>

                                    <input
                                        type="text"
                                        name="remarks"
                                        value={formData.remarks}
                                        onChange={handleFormChange}
                                        placeholder="Enter remarks"
                                    />
                                </div>
                            </div>

                            <div className="approval-modal-footer">
                                <button
                                    type="button"
                                    className="approval-cancel-btn"
                                    onClick={() => setShowEditRequest(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="approval-primary-btn"
                                    disabled={actionLoading}
                                >
                                    <Pencil size={16} />
                                    {actionLoading ? "Updating..." : "Update Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApprovalWorkflow;