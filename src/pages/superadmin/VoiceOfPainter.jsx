import React, { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Search,
    RotateCcw,
    Eye,
    Trash2,
    Edit,
    Image as ImageIcon,
    Mic,
    Video,
    MessageSquare,
    FileText,
    UserRound,
    Clock,
    CheckCircle,
    XCircle,
    Users,
    Send,
    AlertCircle,
    Lightbulb,
    Package,
    Headphones,
    X,
    Upload,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import "../../css/superadmin/voiceOfPainter.css";

const API_BASE = "https://oneplussparkpaintsserver.onrender.com/api/feedback";

const emptyForm = {
    title: "",
    feedbackType: "COMPLAINT",
    description: "",
    painter: "",
    location: "",
    priority: "MEDIUM",
    image: null,
    audio: null,
    video: null,
};

const feedbackTypes = [
    "COMPLAINT",
    "SUGGESTION",
    "PRODUCT_FEEDBACK",
    "SERVICE_FEEDBACK",
];

const statuses = [
    "OPEN",
    "ASSIGNED",
    "UNDER_REVIEW",
    "RESOLVED",
    "CLOSED",
];

const priorities = ["LOW", "MEDIUM", "HIGH"];

const typeInfo = {
    COMPLAINT: {
        label: "Complaint",
        description: "Report issues or problems faced with our products or services.",
        icon: AlertCircle,
    },
    SUGGESTION: {
        label: "Suggestion",
        description: "Share your ideas and suggestions to help us improve.",
        icon: Lightbulb,
    },
    PRODUCT_FEEDBACK: {
        label: "Product Feedback",
        description: "Share your feedback about product quality, performance, packaging etc.",
        icon: Package,
    },
    SERVICE_FEEDBACK: {
        label: "Service Feedback",
        description: "Share your experience with our service, delivery, support etc.",
        icon: Headphones,
    },
};

const statusInfo = {
    OPEN: {
        label: "Open",
    },
    ASSIGNED: {
        label: "Assigned",
    },
    UNDER_REVIEW: {
        label: "Under Review",
    },
    RESOLVED: {
        label: "Resolved",
    },
    CLOSED: {
        label: "Closed",
    },
};

function VoiceOfPainter() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        assigned: 0,
        underReview: 0,
        resolved: 0,
        closed: 0,
        complaints: 0,
        suggestions: 0,
        productFeedback: 0,
        serviceFeedback: 0,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [filters, setFilters] = useState({
        feedbackType: "",
        status: "",
        painter: "",
        location: "",
        search: "",
        date: "",
    });

    const [form, setForm] = useState(emptyForm);

    const [showForm, setShowForm] = useState(false);
    const [showView, setShowView] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    const [editingId, setEditingId] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // =====================================================
    // FETCH FEEDBACK
    // =====================================================

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);

            const response = await fetch(API_BASE);
            const data = await response.json();

            if (data.success) {
                setFeedbacks(data.feedbacks || []);
            } else {
                alert(data.message || "Failed to load feedback");
            }
        } catch (error) {
            console.error("Get feedback error:", error);
            alert("Unable to connect with backend.");
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // FETCH STATS
    // =====================================================

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_BASE}/stats`);
            const data = await response.json();

            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error("Get stats error:", error);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
        fetchStats();
    }, []);

    // =====================================================
    // FORM INPUT
    // =====================================================

    const handleFormChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: files[0] || null,
        }));
    };

    // =====================================================
    // OPEN ADD FORM
    // =====================================================

    const openAddForm = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowForm(true);
    };

    // =====================================================
    // OPEN EDIT FORM
    // =====================================================

    const openEditForm = (feedback) => {
        setEditingId(feedback._id);

        setForm({
            title: feedback.title || "",
            feedbackType: feedback.feedbackType || "COMPLAINT",
            description: feedback.description || "",
            painter: feedback.painter || "",
            location: feedback.location || "",
            priority: feedback.priority || "MEDIUM",
            image: null,
            audio: null,
            video: null,
        });

        setShowForm(true);
    };

    // =====================================================
    // CREATE / UPDATE
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title.trim()) {
            alert("Please enter feedback title.");
            return;
        }

        if (!form.painter.trim()) {
            alert("Please enter painter name.");
            return;
        }

        try {
            setSaving(true);

            const formData = new FormData();

            formData.append("title", form.title);
            formData.append("feedbackType", form.feedbackType);
            formData.append("description", form.description);
            formData.append("painter", form.painter);
            formData.append("location", form.location);
            formData.append("priority", form.priority);

            if (form.image) {
                formData.append("image", form.image);
            }

            if (form.audio) {
                formData.append("audio", form.audio);
            }

            if (form.video) {
                formData.append("video", form.video);
            }

            const url = editingId
                ? `${API_BASE}/${editingId}`
                : API_BASE;

            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                body: formData,
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Request failed");
            }

            alert(
                editingId
                    ? "Feedback updated successfully."
                    : "Feedback created successfully."
            );

            setShowForm(false);
            setEditingId(null);
            setForm(emptyForm);

            await fetchFeedbacks();
            await fetchStats();
        } catch (error) {
            console.error("Feedback save error:", error);
            alert(error.message || "Unable to save feedback.");
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // VIEW
    // =====================================================

    const handleView = async (feedback) => {
        try {
            const response = await fetch(`${API_BASE}/${feedback._id}`);
            const data = await response.json();

            if (data.success) {
                setSelectedFeedback(data.feedback);
            } else {
                setSelectedFeedback(feedback);
            }
        } catch (error) {
            setSelectedFeedback(feedback);
        }

        setShowView(true);
    };

    // =====================================================
    // DELETE
    // =====================================================

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this feedback?"
        );

        if (!confirmDelete) return;

        try {
            const response = await fetch(`${API_BASE}/${id}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Delete failed");
            }

            alert("Feedback deleted successfully.");

            await fetchFeedbacks();
            await fetchStats();
        } catch (error) {
            console.error("Delete error:", error);
            alert(error.message || "Unable to delete feedback.");
        }
    };

    // =====================================================
    // STATUS UPDATE
    // =====================================================

    const handleStatusChange = async (id, status) => {
        try {
            const response = await fetch(`${API_BASE}/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Status update failed");
            }

            await fetchFeedbacks();
            await fetchStats();
        } catch (error) {
            console.error("Status update error:", error);
            alert(error.message || "Unable to update status.");
        }
    };

    // =====================================================
    // FILTERS
    // =====================================================

    const filteredFeedbacks = useMemo(() => {
        return feedbacks.filter((item) => {
            const search = filters.search.toLowerCase().trim();

            const matchesSearch =
                !search ||
                item.title?.toLowerCase().includes(search) ||
                item.feedbackType?.toLowerCase().includes(search) ||
                item.painter?.toLowerCase().includes(search) ||
                item.location?.toLowerCase().includes(search);

            const matchesType =
                !filters.feedbackType ||
                item.feedbackType === filters.feedbackType;

            const matchesStatus =
                !filters.status ||
                item.status === filters.status;

            const matchesPainter =
                !filters.painter ||
                item.painter?.toLowerCase().includes(filters.painter.toLowerCase());

            const matchesLocation =
                !filters.location ||
                item.location?.toLowerCase().includes(filters.location.toLowerCase());

            const matchesDate =
                !filters.date ||
                new Date(item.createdAt).toISOString().slice(0, 10) ===
                filters.date;

            return (
                matchesSearch &&
                matchesType &&
                matchesStatus &&
                matchesPainter &&
                matchesLocation &&
                matchesDate
            );
        });
    }, [feedbacks, filters]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    // =====================================================
    // RESET FILTER
    // =====================================================

    const resetFilters = () => {
        setFilters({
            feedbackType: "",
            status: "",
            painter: "",
            location: "",
            search: "",
            date: "",
        });

        setCurrentPage(1);
    };

    // =====================================================
    // PAGINATION
    // =====================================================

    const totalPages = Math.max(
        1,
        Math.ceil(filteredFeedbacks.length / itemsPerPage)
    );

    const paginatedFeedbacks = filteredFeedbacks.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // =====================================================
    // CHART DATA
    // =====================================================

    const typeTotal =
        stats.complaints +
        stats.suggestions +
        stats.productFeedback +
        stats.serviceFeedback;

    const statusTotal =
        stats.open +
        stats.assigned +
        stats.underReview +
        stats.resolved +
        stats.closed;

    const typePercent = (value) =>
        typeTotal ? ((value / typeTotal) * 100).toFixed(1) : 0;

    const statusPercent = (value) =>
        statusTotal ? ((value / statusTotal) * 100).toFixed(1) : 0;

    // =====================================================
    // HELPERS
    // =====================================================

    const formatType = (type) => {
        return (
            typeInfo[type]?.label ||
            type?.replaceAll("_", " ") ||
            "-"
        );
    };

    const formatStatus = (status) => {
        return statusInfo[status]?.label || status || "-";
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const attachmentCount = (feedback) => {
        return [
            feedback.image,
            feedback.audio,
            feedback.video,
        ].filter(Boolean).length;
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="voice-painter-page">

            {/* =================================================
          PAGE HEADER
      ================================================= */}

            <div className="voice-page-header">

                <div>
                    <h1>Voice of Painter</h1>

                    <p>
                        Capture feedback and suggestions from painters to improve
                        our products and services.
                    </p>

                    <div className="voice-breadcrumb">
                        Dashboard <span>›</span> Voice of Painter <span>›</span>{" "}
                        Overview
                    </div>
                </div>

                <div className="voice-header-actions">

                    <button
                        className="voice-primary-btn"
                        onClick={openAddForm}
                    >
                        <Plus size={18} />
                        Add New Feedback
                    </button>

                </div>

            </div>

            {/* =================================================
          STATISTICS
      ================================================= */}

            <div className="voice-stat-grid">

                <div className="voice-stat-card">
                    <div className="voice-stat-icon purple">
                        <MessageSquare size={25} />
                    </div>

                    <div>
                        <span>Total Feedback</span>
                        <strong>{stats.total}</strong>
                        <small>All feedback</small>
                    </div>
                </div>

                <div className="voice-stat-card">
                    <div className="voice-stat-icon orange">
                        <FileText size={25} />
                    </div>

                    <div>
                        <span>Open</span>
                        <strong>{stats.open}</strong>
                        <small>
                            {stats.total
                                ? ((stats.open / stats.total) * 100).toFixed(2)
                                : 0}
                            % of total
                        </small>
                    </div>
                </div>

                <div className="voice-stat-card">
                    <div className="voice-stat-icon blue">
                        <UserRound size={25} />
                    </div>

                    <div>
                        <span>Assigned</span>
                        <strong>{stats.assigned}</strong>
                        <small>
                            {stats.total
                                ? ((stats.assigned / stats.total) * 100).toFixed(2)
                                : 0}
                            % of total
                        </small>
                    </div>
                </div>

                <div className="voice-stat-card">
                    <div className="voice-stat-icon yellow">
                        <Clock size={25} />
                    </div>

                    <div>
                        <span>Under Review</span>
                        <strong>{stats.underReview}</strong>
                        <small>
                            {stats.total
                                ? ((stats.underReview / stats.total) * 100).toFixed(2)
                                : 0}
                            % of total
                        </small>
                    </div>
                </div>

                <div className="voice-stat-card">
                    <div className="voice-stat-icon green">
                        <CheckCircle size={25} />
                    </div>

                    <div>
                        <span>Resolved</span>
                        <strong>{stats.resolved}</strong>
                        <small>
                            {stats.total
                                ? ((stats.resolved / stats.total) * 100).toFixed(2)
                                : 0}
                            % of total
                        </small>
                    </div>
                </div>

                <div className="voice-stat-card">
                    <div className="voice-stat-icon navy">
                        <XCircle size={25} />
                    </div>

                    <div>
                        <span>Closed</span>
                        <strong>{stats.closed}</strong>
                        <small>
                            {stats.total
                                ? ((stats.closed / stats.total) * 100).toFixed(2)
                                : 0}
                            % of total
                        </small>
                    </div>
                </div>

            </div>

            {/* =================================================
          FILTERS
      ================================================= */}

            <div className="voice-filter-card">

                <div className="voice-filter-field">

                    <label>Date Range</label>

                    <input
                        type="date"
                        value={filters.date}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                date: e.target.value,
                            })
                        }
                    />

                </div>

                <div className="voice-filter-field">

                    <label>Feedback Type</label>

                    <select
                        value={filters.feedbackType}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                feedbackType: e.target.value,
                            })
                        }
                    >
                        <option value="">All Types</option>

                        {feedbackTypes.map((type) => (
                            <option key={type} value={type}>
                                {formatType(type)}
                            </option>
                        ))}
                    </select>

                </div>

                <div className="voice-filter-field">

                    <label>Status</label>

                    <select
                        value={filters.status}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                status: e.target.value,
                            })
                        }
                    >
                        <option value="">All Status</option>

                        {statuses.map((status) => (
                            <option key={status} value={status}>
                                {formatStatus(status)}
                            </option>
                        ))}
                    </select>

                </div>

                <div className="voice-filter-field">

                    <label>Painter</label>

                    <input
                        type="text"
                        placeholder="All Painters"
                        value={filters.painter}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                painter: e.target.value,
                            })
                        }
                    />

                </div>

                <div className="voice-filter-field">

                    <label>Location / Branch</label>

                    <input
                        type="text"
                        placeholder="All Branches"
                        value={filters.location}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                location: e.target.value,
                            })
                        }
                    />

                </div>

                <div className="voice-filter-field voice-search-field">

                    <label>Search</label>

                    <div className="voice-search-box">

                        <Search size={17} />

                        <input
                            type="text"
                            placeholder="Search by title or keyword..."
                            value={filters.search}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    search: e.target.value,
                                })
                            }
                        />

                    </div>

                </div>

                <button
                    className="voice-reset-btn"
                    onClick={resetFilters}
                    title="Reset filters"
                >
                    <RotateCcw size={17} />
                    Reset
                </button>

            </div>

            {/* =================================================
          MAIN CONTENT
      ================================================= */}

            <div className="voice-main-grid">

                {/* =================================================
            LEFT
        ================================================= */}

                <div className="voice-left-content">

                    <div className="voice-table-card">

                        <div className="voice-section-header">

                            <h2>Recent Feedback</h2>

                            <span>
                                {filteredFeedbacks.length} feedback
                            </span>

                        </div>

                        <div className="voice-table-wrapper">

                            <table className="voice-table">

                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Title</th>
                                        <th>Feedback Type</th>
                                        <th>Painter</th>
                                        <th>Location / Branch</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Priority</th>
                                        <th>Attachments</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {loading ? (

                                        <tr>
                                            <td colSpan="10" className="voice-empty">
                                                Loading feedback...
                                            </td>
                                        </tr>

                                    ) : paginatedFeedbacks.length === 0 ? (

                                        <tr>
                                            <td colSpan="10" className="voice-empty">
                                                No feedback found.
                                            </td>
                                        </tr>

                                    ) : (

                                        paginatedFeedbacks.map((feedback) => (

                                            <tr key={feedback._id}>

                                                <td>
                                                    <span className="voice-feedback-id">
                                                        VPF-
                                                        {feedback._id
                                                            ?.slice(-6)
                                                            .toUpperCase()}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="voice-title-cell">
                                                        {feedback.title}
                                                    </div>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`voice-type-badge ${feedback.feedbackType?.toLowerCase()}`}
                                                    >
                                                        {formatType(feedback.feedbackType)}
                                                    </span>
                                                </td>

                                                <td>{feedback.painter || "-"}</td>

                                                <td>{feedback.location || "-"}</td>

                                                <td>
                                                    {formatDate(feedback.createdAt)}
                                                </td>

                                                <td>

                                                    <select
                                                        className={`voice-status-select ${feedback.status?.toLowerCase()}`}
                                                        value={feedback.status}
                                                        onChange={(e) =>
                                                            handleStatusChange(
                                                                feedback._id,
                                                                e.target.value
                                                            )
                                                        }
                                                    >

                                                        {statuses.map((status) => (
                                                            <option
                                                                key={status}
                                                                value={status}
                                                            >
                                                                {formatStatus(status)}
                                                            </option>
                                                        ))}

                                                    </select>

                                                </td>

                                                <td>

                                                    <span
                                                        className={`voice-priority ${feedback.priority?.toLowerCase()}`}
                                                    >
                                                        {feedback.priority || "-"}
                                                    </span>

                                                </td>

                                                <td>

                                                    <div className="voice-attachments">

                                                        {feedback.image && (
                                                            <span title="Image">
                                                                <ImageIcon size={15} />
                                                            </span>
                                                        )}

                                                        {feedback.audio && (
                                                            <span title="Audio">
                                                                <Mic size={15} />
                                                            </span>
                                                        )}

                                                        {feedback.video && (
                                                            <span title="Video">
                                                                <Video size={15} />
                                                            </span>
                                                        )}

                                                        {!attachmentCount(feedback) && (
                                                            <span className="no-attachment">
                                                                0
                                                            </span>
                                                        )}

                                                    </div>

                                                </td>

                                                <td>

                                                    <div className="voice-action-buttons">

                                                        <button
                                                            onClick={() =>
                                                                handleView(feedback)
                                                            }
                                                            title="View"
                                                        >
                                                            <Eye size={16} />
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                openEditForm(feedback)
                                                            }
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>

                                                        <button
                                                            className="delete-action"
                                                            onClick={() =>
                                                                handleDelete(feedback._id)
                                                            }
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

                        </div>

                        {/* Pagination */}

                        <div className="voice-pagination">

                            <span>
                                Showing{" "}
                                {filteredFeedbacks.length === 0
                                    ? 0
                                    : (currentPage - 1) * itemsPerPage + 1}
                                {" - "}
                                {Math.min(
                                    currentPage * itemsPerPage,
                                    filteredFeedbacks.length
                                )}{" "}
                                of {filteredFeedbacks.length} entries
                            </span>

                            <div className="voice-pagination-controls">

                                <button
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                        setCurrentPage((page) =>
                                            Math.max(1, page - 1)
                                        )
                                    }
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                {Array.from(
                                    { length: Math.min(totalPages, 5) },
                                    (_, index) => index + 1
                                ).map((page) => (

                                    <button
                                        key={page}
                                        className={
                                            currentPage === page ? "active" : ""
                                        }
                                        onClick={() =>
                                            setCurrentPage(page)
                                        }
                                    >
                                        {page}
                                    </button>

                                ))}

                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() =>
                                        setCurrentPage((page) =>
                                            Math.min(totalPages, page + 1)
                                        )
                                    }
                                >
                                    <ChevronRight size={16} />
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

                {/* =================================================
            RIGHT SIDEBAR
        ================================================= */}

                <div className="voice-right-sidebar">

                    {/* Feedback by Type */}

                    <div className="voice-side-card">

                        <div className="voice-side-title">
                            <h3>Feedback by Type</h3>
                        </div>

                        <div className="voice-chart-area">

                            <div
                                className="voice-donut"
                                style={{
                                    background: `conic-gradient(
                    #ef4444 0% ${typePercent(stats.complaints)}%,
                    #8b5cf6 ${typePercent(stats.complaints)}% ${Number(typePercent(stats.complaints)) + Number(typePercent(stats.suggestions))}%,
                    #2563eb ${Number(typePercent(stats.complaints)) + Number(typePercent(stats.suggestions))}% ${Number(typePercent(stats.complaints)) + Number(typePercent(stats.suggestions)) + Number(typePercent(stats.productFeedback))}%,
                    #14b8a6 ${Number(typePercent(stats.complaints)) + Number(typePercent(stats.suggestions)) + Number(typePercent(stats.productFeedback))}% 100%
                  )`,
                                }}
                            >
                                <div>
                                    <strong>{typeTotal}</strong>
                                    <span>Total</span>
                                </div>
                            </div>

                            <div className="voice-chart-legend">

                                <div>
                                    <i className="dot red"></i>
                                    <span>Complaint</span>
                                    <b>{stats.complaints}</b>
                                </div>

                                <div>
                                    <i className="dot purple"></i>
                                    <span>Suggestion</span>
                                    <b>{stats.suggestions}</b>
                                </div>

                                <div>
                                    <i className="dot blue"></i>
                                    <span>Product Feedback</span>
                                    <b>{stats.productFeedback}</b>
                                </div>

                                <div>
                                    <i className="dot teal"></i>
                                    <span>Service Feedback</span>
                                    <b>{stats.serviceFeedback}</b>
                                </div>

                            </div>

                        </div>

                    </div>

                    {/* Feedback by Status */}

                    <div className="voice-side-card">

                        <div className="voice-side-title">
                            <h3>Feedback by Status</h3>
                        </div>

                        <div className="voice-chart-area">

                            <div
                                className="voice-donut status-donut"
                                style={{
                                    background: `conic-gradient(
                    #ef4444 0% ${statusPercent(stats.open)}%,
                    #f59e0b ${statusPercent(stats.open)}% ${Number(statusPercent(stats.open)) + Number(statusPercent(stats.assigned))}%,
                    #f97316 ${Number(statusPercent(stats.open)) + Number(statusPercent(stats.assigned))}% ${Number(statusPercent(stats.open)) + Number(statusPercent(stats.assigned)) + Number(statusPercent(stats.underReview))}%,
                    #16a34a ${Number(statusPercent(stats.open)) + Number(statusPercent(stats.assigned)) + Number(statusPercent(stats.underReview))}% ${Number(statusPercent(stats.open)) + Number(statusPercent(stats.assigned)) + Number(statusPercent(stats.underReview)) + Number(statusPercent(stats.resolved))}%,
                    #64748b ${Number(statusPercent(stats.open)) + Number(statusPercent(stats.assigned)) + Number(statusPercent(stats.underReview)) + Number(statusPercent(stats.resolved))}% 100%
                  )`,
                                }}
                            >
                                <div>
                                    <strong>{statusTotal}</strong>
                                    <span>Total</span>
                                </div>
                            </div>

                            <div className="voice-chart-legend">

                                <div>
                                    <i className="dot red"></i>
                                    <span>Open</span>
                                    <b>{stats.open}</b>
                                </div>

                                <div>
                                    <i className="dot orange"></i>
                                    <span>Assigned</span>
                                    <b>{stats.assigned}</b>
                                </div>

                                <div>
                                    <i className="dot yellow"></i>
                                    <span>Under Review</span>
                                    <b>{stats.underReview}</b>
                                </div>

                                <div>
                                    <i className="dot green"></i>
                                    <span>Resolved</span>
                                    <b>{stats.resolved}</b>
                                </div>

                                <div>
                                    <i className="dot gray"></i>
                                    <span>Closed</span>
                                    <b>{stats.closed}</b>
                                </div>

                            </div>

                        </div>

                    </div>

                    {/* Quick Actions */}

                    <div className="voice-side-card">

                        <div className="voice-side-title">
                            <h3>Quick Actions</h3>
                        </div>

                        <div className="voice-quick-grid">

                            <button onClick={openAddForm}>
                                <Plus size={16} />
                                Add New Feedback
                            </button>

                            <button
                                onClick={() => {
                                    setFilters({
                                        ...filters,
                                        painter: "My",
                                    });
                                }}
                            >
                                <UserRound size={16} />
                                View My Feedback
                            </button>

                            <button
                                onClick={() =>
                                    alert("Feedback reports module can be connected here.")
                                }
                            >
                                <FileText size={16} />
                                Feedback Reports
                            </button>

                            <button
                                onClick={() => {
                                    const csv = filteredFeedbacks
                                        .map(
                                            (item) =>
                                                `${item.title},${item.feedbackType},${item.painter},${item.location},${item.status},${item.priority}`
                                        )
                                        .join("\n");

                                    const blob = new Blob(
                                        [
                                            `Title,Feedback Type,Painter,Location,Status,Priority\n${csv}`,
                                        ],
                                        { type: "text/csv" }
                                    );

                                    const url = URL.createObjectURL(blob);

                                    const link = document.createElement("a");
                                    link.href = url;
                                    link.download = "feedback-report.csv";
                                    link.click();

                                    URL.revokeObjectURL(url);
                                }}
                            >
                                <Upload size={16} />
                                Download Reports
                            </button>

                        </div>

                    </div>

                    {/* Today's Summary */}

                    <div className="voice-side-card">

                        <div className="voice-side-title">
                            <h3>Today's Summary</h3>
                        </div>

                        <div className="voice-summary-list">

                            <div>
                                <span>
                                    <i className="summary-dot purple"></i>
                                    New Feedback
                                </span>

                                <b>{stats.total}</b>
                            </div>

                            <div>
                                <span>
                                    <i className="summary-dot blue"></i>
                                    Assigned
                                </span>

                                <b>{stats.assigned}</b>
                            </div>

                            <div>
                                <span>
                                    <i className="summary-dot green"></i>
                                    Resolved
                                </span>

                                <b>{stats.resolved}</b>
                            </div>

                            <div>
                                <span>
                                    <i className="summary-dot gray"></i>
                                    Closed
                                </span>

                                <b>{stats.closed}</b>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* =================================================
          FEEDBACK TYPE INFORMATION
      ================================================= */}

            <div className="voice-information-section">

                <h2>Feedback Type Information</h2>

                <div className="voice-info-grid">

                    {feedbackTypes.map((type) => {

                        const Icon = typeInfo[type].icon;

                        const countMap = {
                            COMPLAINT: stats.complaints,
                            SUGGESTION: stats.suggestions,
                            PRODUCT_FEEDBACK: stats.productFeedback,
                            SERVICE_FEEDBACK: stats.serviceFeedback,
                        };

                        const count = countMap[type];

                        return (
                            <div
                                className="voice-info-card"
                                key={type}
                            >

                                <div className="voice-info-icon">
                                    <Icon size={22} />
                                </div>

                                <div className="voice-info-content">

                                    <h3>
                                        {typeInfo[type].label}
                                    </h3>

                                    <p>
                                        {typeInfo[type].description}
                                    </p>

                                    <div className="voice-info-bottom">

                                        <strong>
                                            {count} Feedback
                                        </strong>

                                        <span>
                                            {typeTotal
                                                ? ((count / typeTotal) * 100).toFixed(2)
                                                : 0}
                                            %
                                        </span>

                                    </div>

                                </div>

                            </div>
                        );
                    })}

                </div>

            </div>

            {/* =================================================
          ADD / EDIT FEEDBACK MODAL
      ================================================= */}

            {showForm && (

                <div className="voice-modal-overlay">

                    <div className="voice-modal">

                        <div className="voice-modal-header">

                            <div>
                                <h2>
                                    {editingId
                                        ? "Edit Feedback"
                                        : "Add New Feedback"}
                                </h2>

                                <p>
                                    Capture feedback directly from painter.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowForm(false)}
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form
                            className="voice-feedback-form"
                            onSubmit={handleSubmit}
                        >

                            <div className="voice-form-grid">

                                <div className="voice-form-field">

                                    <label>
                                        Title <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        value={form.title}
                                        onChange={handleFormChange}
                                        placeholder="Enter feedback title"
                                        required
                                    />

                                </div>

                                <div className="voice-form-field">

                                    <label>
                                        Feedback Type <span>*</span>
                                    </label>

                                    <select
                                        name="feedbackType"
                                        value={form.feedbackType}
                                        onChange={handleFormChange}
                                    >

                                        {feedbackTypes.map((type) => (
                                            <option
                                                key={type}
                                                value={type}
                                            >
                                                {formatType(type)}
                                            </option>
                                        ))}

                                    </select>

                                </div>

                                <div className="voice-form-field">
                                    <label>
                                        Painter <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="painter"
                                        value={form.painter}
                                        onChange={(e) => /^[A-Za-z\s]*$/.test(e.target.value) && handleFormChange(e)}
                                        placeholder="Enter painter name"
                                        required
                                    />
                                </div>

                                <div className="voice-form-field">

                                    <label>Location / Branch</label>

                                    <input
                                        type="text"
                                        name="location"
                                        value={form.location}
                                        onChange={handleFormChange}
                                        placeholder="Enter location / branch"
                                    />

                                </div>

                                <div className="voice-form-field">

                                    <label>Priority</label>

                                    <select
                                        name="priority"
                                        value={form.priority}
                                        onChange={handleFormChange}
                                    >

                                        {priorities.map((priority) => (
                                            <option
                                                key={priority}
                                                value={priority}
                                            >
                                                {priority}
                                            </option>
                                        ))}

                                    </select>

                                </div>

                                <div className="voice-form-field full">

                                    <label>Description</label>

                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleFormChange}
                                        placeholder="Enter feedback description..."
                                        rows="4"
                                    />

                                </div>

                                <div className="voice-form-field">

                                    <label>Image Upload</label>

                                    <label className="voice-file-input">

                                        <ImageIcon size={18} />

                                        <span>
                                            {form.image
                                                ? form.image.name
                                                : "Choose image"}
                                        </span>

                                        <input
                                            type="file"
                                            name="image"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />

                                    </label>

                                </div>

                                <div className="voice-form-field">

                                    <label>Audio Upload</label>

                                    <label className="voice-file-input">

                                        <Mic size={18} />

                                        <span>
                                            {form.audio
                                                ? form.audio.name
                                                : "Choose audio"}
                                        </span>

                                        <input
                                            type="file"
                                            name="audio"
                                            accept="audio/*"
                                            onChange={handleFileChange}
                                        />

                                    </label>

                                </div>

                                <div className="voice-form-field full">

                                    <label>Video Upload</label>

                                    <label className="voice-file-input">

                                        <Video size={18} />

                                        <span>
                                            {form.video
                                                ? form.video.name
                                                : "Choose video"}
                                        </span>

                                        <input
                                            type="file"
                                            name="video"
                                            accept="video/*"
                                            onChange={handleFileChange}
                                        />

                                    </label>

                                </div>

                            </div>

                            <div className="voice-modal-footer">

                                <button
                                    type="button"
                                    className="voice-cancel-btn"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="voice-primary-btn"
                                    disabled={saving}
                                >
                                    <Send size={17} />

                                    {saving
                                        ? "Saving..."
                                        : editingId
                                            ? "Update Feedback"
                                            : "Submit Feedback"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {/* =================================================
          VIEW MODAL
      ================================================= */}

            {showView && selectedFeedback && (

                <div className="voice-modal-overlay">

                    <div className="voice-modal voice-view-modal">

                        <div className="voice-modal-header">

                            <div>
                                <h2>Feedback Details</h2>
                                <p>
                                    Complete feedback information
                                </p>
                            </div>

                        </div>

                        <div className="voice-view-content">

                            <div className="voice-view-row">
                                <span>Title</span>
                                <strong>
                                    {selectedFeedback.title}
                                </strong>
                            </div>

                            <div className="voice-view-row">
                                <span>Feedback Type</span>
                                <strong>
                                    {formatType(
                                        selectedFeedback.feedbackType
                                    )}
                                </strong>
                            </div>

                            <div className="voice-view-row">
                                <span>Description</span>
                                <strong>
                                    {selectedFeedback.description || "-"}
                                </strong>
                            </div>

                            <div className="voice-view-row">
                                <span>Painter</span>
                                <strong>
                                    {selectedFeedback.painter || "-"}
                                </strong>
                            </div>

                            <div className="voice-view-row">
                                <span>Location</span>
                                <strong>
                                    {selectedFeedback.location || "-"}
                                </strong>
                            </div>

                            <div className="voice-view-row">
                                <span>Status</span>
                                <strong>
                                    {formatStatus(selectedFeedback.status)}
                                </strong>
                            </div>

                            <div className="voice-view-row">
                                <span>Priority</span>
                                <strong>
                                    {selectedFeedback.priority || "-"}
                                </strong>
                            </div>

                            <div className="voice-view-row">
                                <span>Date</span>
                                <strong>
                                    {formatDate(selectedFeedback.createdAt)}
                                </strong>
                            </div>

                            <div className="voice-view-attachments">

                                <h3>Attachments</h3>

                                <div>

                                    {selectedFeedback.image && (
                                        <a
                                            href={selectedFeedback.image}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <ImageIcon size={17} />
                                            Image
                                        </a>
                                    )}

                                    {selectedFeedback.audio && (
                                        <a
                                            href={selectedFeedback.audio}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <Mic size={17} />
                                            Audio
                                        </a>
                                    )}

                                    {selectedFeedback.video && (
                                        <a
                                            href={selectedFeedback.video}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <Video size={17} />
                                            Video
                                        </a>
                                    )}

                                    {!attachmentCount(
                                        selectedFeedback
                                    ) && <span>No attachments</span>}

                                </div>

                            </div>

                        </div>

                        <div className="voice-modal-footer">

                            <button
                                className="voice-cancel-btn"
                                onClick={() => setShowView(false)}
                            >
                                Close
                            </button>

                            <button
                                className="voice-primary-btn"
                                onClick={() => {
                                    setShowView(false);
                                    openEditForm(selectedFeedback);
                                }}
                            >
                                <Edit size={17} />
                                Edit Feedback
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default VoiceOfPainter;