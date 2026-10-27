import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    Activity,
    AlertCircle,
    Calendar,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock,
    Edit,
    Eye,
    FileText,
    Filter,
    Gift,
    History,
    MoreVertical,
    Phone,
    Plus,
    RefreshCcw,
    Search,
    ShieldCheck,
    Trash2,
    UserCheck,
    Users,
    X,
} from "lucide-react";

import "../../css/superadmin/followUpManagement.css";

const API_BASE_URL = "https://oneplussparkpaintsserver.onrender.com/api/follow-ups";

const TRIGGER_OPTIONS = [
    {
        value: "REWARDS_NOT_REDEEMED",
        label: "Rewards Not Redeemed",
    },
    {
        value: "NO_RECENT_ORDERS",
        label: "No Recent Orders",
    },
    {
        value: "LOW_QR_SCANNING",
        label: "Low QR Scanning",
    },
    {
        value: "REGISTRATION_PENDING",
        label: "Registration Pending",
    },
    {
        value: "PENDING_KYC",
        label: "Pending KYC",
    },
    {
        value: "PENDING_PAYMENTS",
        label: "Pending Payments",
    },
    {
        value: "INACTIVE_USERS",
        label: "Inactive Users",
    },
];

const STATUS_OPTIONS = [
    { value: "PENDING", label: "Pending" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "CLOSED", label: "Closed" },
    { value: "OVERDUE", label: "Overdue" },
];

const PRIORITY_OPTIONS = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
];

const PAGE_SIZE = 10;

const emptyForm = {
    customerName: "",
    customerMobile: "",
    customerId: "",
    triggerType: "",
    lastActivity: "",
    dueDate: "",
    priority: "MEDIUM",
    assignedTo: "",
    status: "PENDING",
    remarks: "",
};

const getTriggerLabel = (value) => {
    const item = TRIGGER_OPTIONS.find(
        (option) => option.value === value
    );

    return item ? item.label : value || "-";
};

const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "-";

    return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatDateTime = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "-";

    return parsed.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const toInputDate = (date) => {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "";

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getDueText = (dueDate, status) => {
    if (!dueDate) return "-";

    if (status === "CLOSED") {
        return "Closed";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const difference =
        Math.round((due - today) / (1000 * 60 * 60 * 24));

    if (difference < 0) {
        return `Overdue by ${Math.abs(difference)} day${Math.abs(difference) === 1 ? "" : "s"
            }`;
    }

    if (difference === 0) return "Due Today";
    if (difference === 1) return "Due Tomorrow";

    return `In ${difference} Days`;
};

const getDueClass = (dueDate, status) => {
    if (status === "CLOSED") return "due-closed";

    if (!dueDate) return "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    if (due < today) return "due-overdue";
    if (due.getTime() === today.getTime()) return "due-today";

    return "due-upcoming";
};

const getInitials = (name) => {
    if (!name) return "?";

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
};

const getTriggerIcon = (triggerType) => {
    switch (triggerType) {
        case "REWARDS_NOT_REDEEMED":
            return Gift;

        case "NO_RECENT_ORDERS":
            return Clock;

        case "LOW_QR_SCANNING":
            return Activity;

        case "REGISTRATION_PENDING":
            return UserCheck;

        case "PENDING_KYC":
            return ShieldCheck;

        case "PENDING_PAYMENTS":
            return FileText;

        case "INACTIVE_USERS":
            return Users;

        default:
            return AlertCircle;
    }
};

const FollowUpManagement = () => {
    const [followUps, setFollowUps] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        closed: 0,
        overdue: 0,
        today: 0,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [triggerFilter, setTriggerFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [priorityFilter, setPriorityFilter] = useState("ALL");
    const [assignedFilter, setAssignedFilter] = useState("ALL");
    const [dateRange, setDateRange] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    const [selectedIds, setSelectedIds] = useState([]);

    const [showNewModal, setShowNewModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showRemarksModal, setShowRemarksModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [selectedFollowUp, setSelectedFollowUp] = useState(null);

    const [form, setForm] = useState(emptyForm);

    const [remarks, setRemarks] = useState("");

    const [scheduleForm, setScheduleForm] = useState({
        scheduledDate: "",
        scheduledTime: "",
    });

    const [assignedTo, setAssignedTo] = useState("");

    const [showMoreMenu, setShowMoreMenu] = useState(null);

    const [actionLoading, setActionLoading] = useState(false);

    // =====================================================
    // FETCH FOLLOW-UPS
    // =====================================================

    const fetchFollowUps = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {};

            if (triggerFilter !== "ALL") {
                params.triggerType = triggerFilter;
            }

            if (statusFilter !== "ALL") {
                params.status = statusFilter;
            }

            if (priorityFilter !== "ALL") {
                params.priority = priorityFilter;
            }

            if (assignedFilter !== "ALL") {
                params.assignedTo = assignedFilter;
            }

            if (search.trim()) {
                params.search = search.trim();
            }

            const response = await axios.get(API_BASE_URL, {
                params,
            });

            if (response.data.success) {
                setFollowUps(response.data.followUps || []);
            }
        } catch (err) {
            console.error("Get follow-ups error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to fetch follow-ups."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // FETCH STATS
    // =====================================================

    const fetchStats = async () => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/stats`
            );

            if (response.data.success) {
                setStats(
                    response.data.stats || {
                        total: 0,
                        pending: 0,
                        inProgress: 0,
                        closed: 0,
                        overdue: 0,
                        today: 0,
                    }
                );
            }
        } catch (err) {
            console.error("Get follow-up stats error:", err);
        }
    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        fetchFollowUps();
        fetchStats();
    }, []);

    // =====================================================
    // FILTER SEARCH
    // =====================================================

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchFollowUps();
            setCurrentPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [
        search,
        triggerFilter,
        statusFilter,
        priorityFilter,
        assignedFilter,
    ]);

    // =====================================================
    // ASSIGNED OWNERS
    // =====================================================

    const assignedOwners = useMemo(() => {
        return [
            ...new Set(
                followUps
                    .map((item) => item.assignedTo)
                    .filter(Boolean)
            ),
        ];
    }, [followUps]);

    // =====================================================
    // TRIGGER COUNTS
    // =====================================================

    const triggerCounts = useMemo(() => {
        return TRIGGER_OPTIONS.map((trigger) => {
            const count = followUps.filter(
                (item) => item.triggerType === trigger.value
            ).length;

            return {
                ...trigger,
                count,
            };
        });
    }, [followUps]);

    // =====================================================
    // TRIGGER PERCENTAGE
    // =====================================================

    const getTriggerPercentage = (count) => {
        if (!followUps.length) return 0;

        return Math.round(
            (count / followUps.length) * 100
        );
    };

    // =====================================================
    // PAGINATION
    // =====================================================

    const totalPages = Math.max(
        1,
        Math.ceil(followUps.length / PAGE_SIZE)
    );

    const paginatedFollowUps = useMemo(() => {
        const start =
            (currentPage - 1) * PAGE_SIZE;

        return followUps.slice(
            start,
            start + PAGE_SIZE
        );
    }, [followUps, currentPage]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    // =====================================================
    // FORM HANDLER
    // =====================================================

    const handleFormChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =====================================================
    // NEW FOLLOW-UP
    // =====================================================

    const openNewModal = () => {
        setForm(emptyForm);
        setShowNewModal(true);
    };

    const closeNewModal = () => {
        setShowNewModal(false);
        setForm(emptyForm);
    };

    const handleCreateFollowUp = async (e) => {
        e.preventDefault();

        if (!form.customerName.trim()) {
            alert("Please enter customer name.");
            return;
        }

        if (!form.customerId.trim()) {
            alert("Please enter customer ID.");
            return;
        }

        if (!form.triggerType) {
            alert("Please select trigger type.");
            return;
        }

        if (!form.dueDate) {
            alert("Please select due date.");
            return;
        }

        try {
            setActionLoading(true);

            const payload = {
                customerName: form.customerName.trim(),
                customerMobile: form.customerMobile.trim(),
                customerId: form.customerId.trim(),
                triggerType: form.triggerType,
                lastActivity: form.lastActivity
                    ? new Date(form.lastActivity).toISOString()
                    : null,
                dueDate: new Date(
                    `${form.dueDate}T00:00:00`
                ).toISOString(),
                priority: form.priority,
                assignedTo: form.assignedTo.trim(),
                status: form.status,
                remarks: form.remarks.trim(),
            };

            const response = await axios.post(
                API_BASE_URL,
                payload
            );

            if (!response.data.success) {
                throw new Error(
                    response.data.message ||
                    "Failed to create follow-up."
                );
            }

            alert("Follow-up created successfully.");

            closeNewModal();

            await Promise.all([
                fetchFollowUps(),
                fetchStats(),
            ]);

            setCurrentPage(1);
        } catch (err) {
            console.error("Create follow-up error:", err);

            alert(
                err.response?.data?.message ||
                err.message ||
                "Failed to create follow-up."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // =====================================================
    // VIEW
    // =====================================================

    const openViewModal = (followUp) => {
        setSelectedFollowUp(followUp);
        setShowViewModal(true);
        setShowMoreMenu(null);
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setSelectedFollowUp(null);
    };

    // =====================================================
    // EDIT
    // =====================================================

    const openEditModal = (followUp) => {
        setSelectedFollowUp(followUp);

        setForm({
            customerName: followUp.customerName || "",
            customerMobile: followUp.customerMobile || "",
            customerId: followUp.customerId || "",
            triggerType: followUp.triggerType || "",
            lastActivity: toInputDate(
                followUp.lastActivity
            ),
            dueDate: toInputDate(followUp.dueDate),
            priority: followUp.priority || "MEDIUM",
            assignedTo: followUp.assignedTo || "",
            status: followUp.status || "PENDING",
            remarks: followUp.remarks || "",
        });

        setShowEditModal(true);
        setShowMoreMenu(null);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setSelectedFollowUp(null);
        setForm(emptyForm);
    };

    const handleUpdateFollowUp = async (e) => {
        e.preventDefault();

        if (!selectedFollowUp) return;

        if (!form.customerName.trim()) {
            alert("Please enter customer name.");
            return;
        }

        if (!form.customerId.trim()) {
            alert("Please enter customer ID.");
            return;
        }

        if (!form.triggerType) {
            alert("Please select trigger type.");
            return;
        }

        if (!form.dueDate) {
            alert("Please select due date.");
            return;
        }

        try {
            setActionLoading(true);

            const payload = {
                customerName: form.customerName.trim(),
                customerMobile: form.customerMobile.trim(),
                customerId: form.customerId.trim(),
                triggerType: form.triggerType,
                lastActivity: form.lastActivity
                    ? new Date(
                        `${form.lastActivity}T00:00:00`
                    ).toISOString()
                    : null,
                dueDate: new Date(
                    `${form.dueDate}T00:00:00`
                ).toISOString(),
                priority: form.priority,
                assignedTo: form.assignedTo.trim(),
                status: form.status,
                remarks: form.remarks.trim(),
            };

            const response = await axios.put(
                `${API_BASE_URL}/${selectedFollowUp._id}`,
                payload
            );

            if (!response.data.success) {
                throw new Error(
                    response.data.message ||
                    "Failed to update follow-up."
                );
            }

            alert("Follow-up updated successfully.");

            closeEditModal();

            await Promise.all([
                fetchFollowUps(),
                fetchStats(),
            ]);
        } catch (err) {
            console.error("Update follow-up error:", err);

            alert(
                err.response?.data?.message ||
                err.message ||
                "Failed to update follow-up."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // =====================================================
    // DELETE
    // =====================================================

    const openDeleteModal = (followUp) => {
        setSelectedFollowUp(followUp);
        setShowDeleteModal(true);
        setShowMoreMenu(null);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setSelectedFollowUp(null);
    };

    const handleDeleteFollowUp = async () => {
        if (!selectedFollowUp) return;

        try {
            setActionLoading(true);

            const response = await axios.delete(
                `${API_BASE_URL}/${selectedFollowUp._id}`
            );

            if (!response.data.success) {
                throw new Error(
                    response.data.message ||
                    "Failed to delete follow-up."
                );
            }

            alert("Follow-up deleted successfully.");

            closeDeleteModal();

            await Promise.all([
                fetchFollowUps(),
                fetchStats(),
            ]);
        } catch (err) {
            console.error("Delete follow-up error:", err);

            alert(
                err.response?.data?.message ||
                err.message ||
                "Failed to delete follow-up."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // =====================================================
    // REMARKS
    // =====================================================

    const openRemarksModal = (followUp) => {
        setSelectedFollowUp(followUp);
        setRemarks(followUp.remarks || "");
        setShowRemarksModal(true);
        setShowMoreMenu(null);
    };

    const closeRemarksModal = () => {
        setShowRemarksModal(false);
        setSelectedFollowUp(null);
        setRemarks("");
    };

    const handleAddRemarks = async (e) => {
        e.preventDefault();

        if (!selectedFollowUp) return;

        if (!remarks.trim()) {
            alert("Please enter remarks.");
            return;
        }

        try {
            setActionLoading(true);

            const response = await axios.patch(
                `${API_BASE_URL}/${selectedFollowUp._id}/remarks`,
                {
                    remarks: remarks.trim(),
                }
            );

            if (!response.data.success) {
                throw new Error(
                    response.data.message ||
                    "Failed to add remarks."
                );
            }

            alert("Remarks added successfully.");

            closeRemarksModal();

            await fetchFollowUps();
        } catch (err) {
            console.error("Add remarks error:", err);

            alert(
                err.response?.data?.message ||
                err.message ||
                "Failed to add remarks."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // =====================================================
    // SCHEDULE
    // =====================================================

    const openScheduleModal = (followUp) => {
        setSelectedFollowUp(followUp);

        setScheduleForm({
            scheduledDate: toInputDate(
                followUp.scheduledDate
            ),
            scheduledTime: followUp.scheduledTime || "",
        });

        setShowScheduleModal(true);
        setShowMoreMenu(null);
    };

    const closeScheduleModal = () => {
        setShowScheduleModal(false);
        setSelectedFollowUp(null);

        setScheduleForm({
            scheduledDate: "",
            scheduledTime: "",
        });
    };

    const handleScheduleFollowUp = async (e) => {
        e.preventDefault();

        if (!selectedFollowUp) return;

        if (!scheduleForm.scheduledDate) {
            alert("Please select scheduled date.");
            return;
        }

        try {
            setActionLoading(true);

            const response = await axios.patch(
                `${API_BASE_URL}/${selectedFollowUp._id}/schedule`,
                {
                    scheduledDate: new Date(
                        `${scheduleForm.scheduledDate}T00:00:00`
                    ).toISOString(),
                    scheduledTime:
                        scheduleForm.scheduledTime,
                }
            );

            if (!response.data.success) {
                throw new Error(
                    response.data.message ||
                    "Failed to schedule follow-up."
                );
            }

            alert("Follow-up scheduled successfully.");

            closeScheduleModal();

            await Promise.all([
                fetchFollowUps(),
                fetchStats(),
            ]);
        } catch (err) {
            console.error(
                "Schedule follow-up error:",
                err
            );

            alert(
                err.response?.data?.message ||
                err.message ||
                "Failed to schedule follow-up."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // =====================================================
    // ASSIGN OWNERSHIP
    // =====================================================

    const openAssignModal = (followUp) => {
        setSelectedFollowUp(followUp);
        setAssignedTo(followUp.assignedTo || "");
        setShowAssignModal(true);
        setShowMoreMenu(null);
    };

    const closeAssignModal = () => {
        setShowAssignModal(false);
        setSelectedFollowUp(null);
        setAssignedTo("");
    };

    const handleAssignOwnership = async (e) => {
        e.preventDefault();

        if (!selectedFollowUp) return;

        if (!assignedTo.trim()) {
            alert("Please enter assigned owner.");
            return;
        }

        try {
            setActionLoading(true);

            const response = await axios.patch(
                `${API_BASE_URL}/${selectedFollowUp._id}/assign`,
                {
                    assignedTo: assignedTo.trim(),
                }
            );

            if (!response.data.success) {
                throw new Error(
                    response.data.message ||
                    "Failed to assign follow-up."
                );
            }

            alert("Follow-up assigned successfully.");

            closeAssignModal();

            await Promise.all([
                fetchFollowUps(),
                fetchStats(),
            ]);
        } catch (err) {
            console.error(
                "Assign ownership error:",
                err
            );

            alert(
                err.response?.data?.message ||
                err.message ||
                "Failed to assign follow-up."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // =====================================================
    // CLOSE FOLLOW-UP
    // =====================================================

    const handleCloseFollowUp = async (followUp) => {
        setShowMoreMenu(null);

        const confirmed = window.confirm(
            "Are you sure you want to close this follow-up?"
        );

        if (!confirmed) return;

        try {
            setActionLoading(true);

            const response = await axios.patch(
                `${API_BASE_URL}/${followUp._id}/close`
            );

            if (!response.data.success) {
                throw new Error(
                    response.data.message ||
                    "Failed to close follow-up."
                );
            }

            alert("Follow-up closed successfully.");

            await Promise.all([
                fetchFollowUps(),
                fetchStats(),
            ]);
        } catch (err) {
            console.error(
                "Close follow-up error:",
                err
            );

            alert(
                err.response?.data?.message ||
                err.message ||
                "Failed to close follow-up."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // =====================================================
    // CALL CUSTOMER
    // =====================================================

    const handleCallCustomer = (followUp) => {
        setShowMoreMenu(null);

        if (!followUp.customerMobile) {
            alert("Customer mobile number is not available.");
            return;
        }

        window.location.href = `tel:${followUp.customerMobile}`;
    };

    // =====================================================
    // MORE MENU
    // =====================================================

    const toggleMoreMenu = (id) => {
        setShowMoreMenu((prev) =>
            prev === id ? null : id
        );
    };

    // =====================================================
    // RESET FILTERS
    // =====================================================

    const handleResetFilters = () => {
        setSearch("");
        setTriggerFilter("ALL");
        setStatusFilter("ALL");
        setPriorityFilter("ALL");
        setAssignedFilter("ALL");
        setDateRange("");
        setCurrentPage(1);
    };

    // =====================================================
    // SELECT CHECKBOX
    // =====================================================

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    const allCurrentSelected =
        paginatedFollowUps.length > 0 &&
        paginatedFollowUps.every((item) =>
            selectedIds.includes(item._id)
        );

    const toggleSelectAll = () => {
        if (allCurrentSelected) {
            setSelectedIds((prev) =>
                prev.filter(
                    (id) =>
                        !paginatedFollowUps.some(
                            (item) => item._id === id
                        )
                )
            );
        } else {
            setSelectedIds((prev) => [
                ...new Set([
                    ...prev,
                    ...paginatedFollowUps.map(
                        (item) => item._id
                    ),
                ]),
            ]);
        }
    };

    // =====================================================
    // STATISTICS CARDS
    // =====================================================

    const statCards = [
        {
            title: "Total Follow-ups",
            value: stats.total,
            icon: Users,
            className: "total",
        },
        {
            title: "Pending Follow-ups",
            value: stats.pending,
            icon: Clock,
            className: "pending",
        },
        {
            title: "In Progress",
            value: stats.inProgress,
            icon: Activity,
            className: "progress",
        },
        {
            title: "Closed Follow-ups",
            value: stats.closed,
            icon: CheckCircle2,
            className: "closed",
        },
        {
            title: "Overdue Follow-ups",
            value: stats.overdue,
            icon: AlertCircle,
            className: "overdue",
        },
        {
            title: "Today's Follow-ups",
            value: stats.today,
            icon: CalendarDays,
            className: "today",
        },
    ];

    // =====================================================
    // STATUS OVERVIEW
    // =====================================================

    const statusTotal =
        stats.pending +
        stats.inProgress +
        stats.closed +
        stats.overdue;

    const statusPercentage = (value) => {
        if (!statusTotal) return 0;

        return Math.round(
            (value / statusTotal) * 100
        );
    };

    return (
        <div className="followup-page">

            {/* =================================================
            HEADER
        ================================================= */}

            <div className="followup-header">

                <div className="followup-header-left">
                    <h1>Follow-up Management</h1>

                    <p>
                        Automatically identify inactive customers and
                        manage follow-ups to improve engagement and
                        business.
                    </p>

                    <div className="followup-breadcrumb">
                        <span>Dashboard</span>
                        <span>›</span>
                        <span>Follow-up Management</span>
                        <span>›</span>
                        <span>Overview</span>
                    </div>
                </div>

                <div className="followup-header-actions">

                    <button
                        className="followup-report-btn"
                        type="button"
                    >
                        <FileText size={16} />
                        Follow-up Reports
                    </button>

                    <button
                        className="new-followup-btn"
                        type="button"
                        onClick={openNewModal}
                    >
                        <Plus size={17} />
                        New Follow-up
                    </button>

                </div>

            </div>


            {/* =================================================
            ERROR
        ================================================= */}

            {error && (
                <div className="followup-error">
                    <AlertCircle size={17} />
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={() => {
                            fetchFollowUps();
                            fetchStats();
                        }}
                    >
                        Retry
                    </button>
                </div>
            )}


            {/* =================================================
            STATISTICS
        ================================================= */}

            <div className="followup-stats-grid">

                {statCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            className={`followup-stat-card ${card.className}`}
                            key={card.title}
                        >
                            <div className="stat-card-top">

                                <div className="stat-card-icon">
                                    <Icon size={19} />
                                </div>

                            </div>

                            <div className="stat-card-value">
                                {card.value}
                            </div>

                            <div className="stat-card-title">
                                {card.title}
                            </div>
                        </div>
                    );
                })}

            </div>


            {/* =================================================
            FOLLOW-UP TRIGGERS
        ================================================= */}

            <div className="followup-section trigger-section">

                <div className="followup-section-header">

                    <div>
                        <h2>Follow-up Triggers (Auto Identified)</h2>
                        <p>
                            Customers identified based on predefined
                            follow-up triggers.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="view-all-trigger-btn"
                        onClick={() => {
                            setTriggerFilter("ALL");
                            setCurrentPage(1);
                            document
                                .getElementById("followup-list")
                                ?.scrollIntoView({
                                    behavior: "smooth",
                                });
                        }}
                    >
                        View All Triggers
                        <ChevronRight size={15} />
                    </button>

                </div>

                <div className="trigger-grid">

                    {triggerCounts.map((trigger) => {
                        const Icon = getTriggerIcon(
                            trigger.value
                        );

                        return (
                            <div
                                className="trigger-card"
                                key={trigger.value}
                            >

                                <div className="trigger-card-icon">
                                    <Icon size={18} />
                                </div>

                                <div className="trigger-card-content">

                                    <h3>{trigger.label}</h3>

                                    <div className="trigger-count-row">
                                        <strong>{trigger.count}</strong>

                                        <span>
                                            {getTriggerPercentage(
                                                trigger.count
                                            )}%
                                        </span>
                                    </div>

                                </div>

                                <button
                                    type="button"
                                    className="trigger-view-btn"
                                    onClick={() => {
                                        setTriggerFilter(
                                            trigger.value
                                        );
                                        setCurrentPage(1);

                                        document
                                            .getElementById(
                                                "followup-list"
                                            )
                                            ?.scrollIntoView({
                                                behavior: "smooth",
                                            });
                                    }}
                                >
                                    View
                                </button>

                            </div>
                        );
                    })}

                </div>

            </div>


            {/* =================================================
            MAIN CONTENT GRID
        ================================================= */}

            <div className="followup-content-grid">
                <div className="followup-main-content">

                    {/* FILTERS */}

                    <div className="followup-filters-card">

                        <div className="filters-header">

                            <div>
                                <h2>Follow-up List</h2>
                                <p>
                                    Manage and track customer follow-ups.
                                </p>
                            </div>
                        </div>

                        <div className="filters-row">

                            <div className="filter-field">
                                <label>Date Range</label>

                                <div className="filter-input-wrapper">
                                    {/* <Calendar size={15} /> */}

                                    <input
                                        type="date"
                                        value={dateRange}
                                        onChange={(e) =>
                                            setDateRange(
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>


                            <div className="filter-field">
                                <label>Trigger Type</label>

                                <select
                                    value={triggerFilter}
                                    onChange={(e) => {
                                        setTriggerFilter(
                                            e.target.value
                                        );
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="ALL">
                                        All Triggers
                                    </option>

                                    {TRIGGER_OPTIONS.map(
                                        (option) => (
                                            <option
                                                value={option.value}
                                                key={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>


                            <div className="filter-field">
                                <label>Follow-up Status</label>

                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(
                                            e.target.value
                                        );
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="ALL">
                                        All Status
                                    </option>

                                    {STATUS_OPTIONS.map(
                                        (option) => (
                                            <option
                                                value={option.value}
                                                key={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>


                            <div className="filter-field">
                                <label>Priority</label>

                                <select
                                    value={priorityFilter}
                                    onChange={(e) => {
                                        setPriorityFilter(
                                            e.target.value
                                        );
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="ALL">
                                        All Priority
                                    </option>

                                    {PRIORITY_OPTIONS.map(
                                        (option) => (
                                            <option
                                                value={option.value}
                                                key={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>


                            <div className="filter-field">
                                <label>Assigned To</label>

                                <select
                                    value={assignedFilter}
                                    onChange={(e) => {
                                        setAssignedFilter(
                                            e.target.value
                                        );
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="ALL">
                                        All Owners
                                    </option>

                                    {assignedOwners.map(
                                        (owner) => (
                                            <option
                                                value={owner}
                                                key={owner}
                                            >
                                                {owner}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>


                            <div className="filter-field search-filter">
                                <label>Search</label>

                                <div className="filter-input-wrapper">


                                    <input
                                        type="text"
                                        placeholder="Search customer..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>
                            </div>

                            <button
                                type="button"
                                className="apply-filter-btn"
                                onClick={() => {
                                    fetchFollowUps();
                                    fetchStats();
                                    setCurrentPage(1);
                                }}
                            >
                                <Filter size={15} />
                                Filters
                            </button>
                            <button
                                type="button"
                                className="apply-filter-btn"
                                onClick={handleResetFilters}
                            >
                                <RefreshCcw size={15} />
                                Reset
                            </button>

                        </div>

                    </div>


                    {/* TABLE */}

                    <div
                        className="followup-table-card"
                        id="followup-list"
                    >

                        <div className="table-header">

                            <div>
                                <h2>Follow-up List</h2>

                                <span>
                                    {followUps.length} entries
                                </span>
                            </div>

                            {selectedIds.length > 0 && (
                                <span className="selected-count">
                                    {selectedIds.length} selected
                                </span>
                            )}

                        </div>

                        <div className="followup-table-wrapper">

                            <table className="followup-table">

                                <thead>
                                    <tr>

                                        <th className="checkbox-column">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    allCurrentSelected
                                                }
                                                onChange={
                                                    toggleSelectAll
                                                }
                                            />
                                        </th>

                                        <th>Customer Details</th>
                                        <th>Customer ID</th>
                                        <th>Trigger Type</th>
                                        <th>Last Activity</th>
                                        <th>Due Date</th>
                                        <th>Priority</th>
                                        <th>Assigned To</th>
                                        <th>Status</th>
                                        <th>Actions</th>

                                    </tr>
                                </thead>

                                <tbody>

                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan="10"
                                                className="table-empty"
                                            >
                                                Loading follow-ups...
                                            </td>
                                        </tr>
                                    ) : paginatedFollowUps.length ===
                                        0 ? (
                                        <tr>
                                            <td
                                                colSpan="10"
                                                className="table-empty"
                                            >
                                                No follow-ups found.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedFollowUps.map(
                                            (followUp) => (
                                                <tr key={followUp._id}>

                                                    <td className="checkbox-column">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.includes(
                                                                followUp._id
                                                            )}
                                                            onChange={() =>
                                                                toggleSelect(
                                                                    followUp._id
                                                                )
                                                            }
                                                        />
                                                    </td>


                                                    {/* CUSTOMER */}
                                                    <td>
                                                        <div className="customer-details">

                                                            <div className="customer-avatar">
                                                                {getInitials(
                                                                    followUp.customerName
                                                                )}
                                                            </div>

                                                            <div>
                                                                <strong>
                                                                    {
                                                                        followUp.customerName
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        followUp.customerMobile ||
                                                                        "-"
                                                                    }
                                                                </span>
                                                            </div>

                                                        </div>
                                                    </td>


                                                    {/* CUSTOMER ID */}
                                                    <td>
                                                        <span className="customer-id">
                                                            {followUp.customerId ||
                                                                "-"}
                                                        </span>
                                                    </td>


                                                    {/* TRIGGER */}
                                                    <td>
                                                        <span className="trigger-badge">
                                                            {getTriggerLabel(
                                                                followUp.triggerType
                                                            )}
                                                        </span>
                                                    </td>


                                                    {/* LAST ACTIVITY */}
                                                    <td>
                                                        <span className="date-text">
                                                            {formatDate(
                                                                followUp.lastActivity
                                                            )}
                                                        </span>
                                                    </td>


                                                    {/* DUE DATE */}
                                                    <td>
                                                        <div className="due-date-cell">

                                                            <span>
                                                                {formatDate(
                                                                    followUp.dueDate
                                                                )}
                                                            </span>

                                                            <small
                                                                className={getDueClass(
                                                                    followUp.dueDate,
                                                                    followUp.status
                                                                )}
                                                            >
                                                                {getDueText(
                                                                    followUp.dueDate,
                                                                    followUp.status
                                                                )}
                                                            </small>

                                                        </div>
                                                    </td>


                                                    {/* PRIORITY */}
                                                    <td>
                                                        <span
                                                            className={`priority-badge priority-${String(
                                                                followUp.priority ||
                                                                "MEDIUM"
                                                            ).toLowerCase()}`}
                                                        >
                                                            {followUp.priority ||
                                                                "MEDIUM"}
                                                        </span>
                                                    </td>


                                                    {/* ASSIGNED */}
                                                    <td>
                                                        <span className="assigned-user">
                                                            {followUp.assignedTo ||
                                                                "Unassigned"}
                                                        </span>
                                                    </td>


                                                    {/* STATUS */}
                                                    <td>
                                                        <span
                                                            className={`status-badge status-${String(
                                                                followUp.status ||
                                                                "PENDING"
                                                            ).toLowerCase().replace(
                                                                "_",
                                                                "-"
                                                            )}`}
                                                        >
                                                            {String(
                                                                followUp.status ||
                                                                "PENDING"
                                                            )
                                                                .replaceAll(
                                                                    "_",
                                                                    " "
                                                                )}
                                                        </span>
                                                    </td>


                                                    {/* ACTIONS */}
                                                    <td>

                                                        <div className="table-actions">

                                                            {/* VIEW */}
                                                            <button
                                                                type="button"
                                                                className="table-action-btn view"
                                                                title="View"
                                                                onClick={() =>
                                                                    openViewModal(
                                                                        followUp
                                                                    )
                                                                }
                                                            >
                                                                <Eye size={15} />
                                                            </button>


                                                            {/* EDIT */}
                                                            <button
                                                                type="button"
                                                                className="table-action-btn edit"
                                                                title="Edit"
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        followUp
                                                                    )
                                                                }
                                                            >
                                                                <Edit size={15} />
                                                            </button>


                                                            {/* DELETE */}
                                                            <button
                                                                type="button"
                                                                className="table-action-btn delete"
                                                                title="Delete"
                                                                onClick={() =>
                                                                    openDeleteModal(
                                                                        followUp
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>


                                                            {/* MORE */}
                                                            <div className="more-action-wrapper">

                                                                <button
                                                                    type="button"
                                                                    className="table-action-btn more"
                                                                    title="More Options"
                                                                    onClick={() =>
                                                                        toggleMoreMenu(
                                                                            followUp._id
                                                                        )
                                                                    }
                                                                >
                                                                    <MoreVertical
                                                                        size={16}
                                                                    />
                                                                </button>


                                                                {showMoreMenu ===
                                                                    followUp._id && (
                                                                        <div className="more-action-menu">

                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    handleCallCustomer(
                                                                                        followUp
                                                                                    )
                                                                                }
                                                                            >
                                                                                <Phone
                                                                                    size={15}
                                                                                />
                                                                                Call Customer
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    openRemarksModal(
                                                                                        followUp
                                                                                    )
                                                                                }
                                                                            >
                                                                                <FileText
                                                                                    size={15}
                                                                                />
                                                                                Add Remarks
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    openScheduleModal(
                                                                                        followUp
                                                                                    )
                                                                                }
                                                                            >
                                                                                <CalendarDays
                                                                                    size={15}
                                                                                />
                                                                                Schedule Follow-up
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    openAssignModal(
                                                                                        followUp
                                                                                    )
                                                                                }
                                                                            >
                                                                                <UserCheck
                                                                                    size={15}
                                                                                />
                                                                                Assign Ownership
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    handleCloseFollowUp(
                                                                                        followUp
                                                                                    )
                                                                                }
                                                                            >
                                                                                <CheckCircle2
                                                                                    size={15}
                                                                                />
                                                                                Close Follow-up
                                                                            </button>

                                                                        </div>
                                                                    )}

                                                            </div>

                                                        </div>

                                                    </td>

                                                </tr>
                                            )
                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>


                        {/* PAGINATION */}

                        <div className="pagination-wrapper">

                            <div className="pagination-info">

                                Showing{" "}
                                {followUps.length === 0
                                    ? 0
                                    : (currentPage - 1) *
                                    PAGE_SIZE +
                                    1}{" "}
                                to{" "}
                                {Math.min(
                                    currentPage * PAGE_SIZE,
                                    followUps.length
                                )}{" "}
                                of {followUps.length} entries

                            </div>

                            <div className="pagination-controlsf">

                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                        setCurrentPage(
                                            (page) => page - 1
                                        )
                                    }
                                >
                                    <ChevronLeft size={15} />
                                </button>

                                {Array.from(
                                    {
                                        length: totalPages,
                                    },
                                    (_, index) => index + 1
                                )
                                    .slice(
                                        Math.max(0, currentPage - 2),
                                        Math.min(
                                            totalPages,
                                            currentPage + 1
                                        )
                                    )
                                    .map((page) => (
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
                                        setCurrentPage(
                                            (page) => page + 1
                                        )
                                    }
                                >
                                    <ChevronRight size={15} />
                                </button>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                RIGHT SIDEBAR
            ================================================= */}

                <div className="followup-sidebar">

                    {/* QUICK ACTIONS */}

                    <div className="followup-sidebar-card">

                        <div className="sidebar-card-header">
                            <div>
                                <h2>Quick Actions</h2>
                            </div>
                        </div>

                        <div className="quick-actions-list">

                            <button
                                type="button"
                                onClick={openNewModal}
                            >
                                <span className="quick-action-icon">
                                    <Plus size={16} />
                                </span>
                                New Follow-up
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    if (followUps.length > 0) {
                                        openViewModal(
                                            followUps[0]
                                        );
                                    } else {
                                        alert(
                                            "No follow-up available."
                                        );
                                    }
                                }}
                            >
                                <span className="quick-action-icon">
                                    <Phone size={16} />
                                </span>
                                Call Customer
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    if (followUps.length > 0) {
                                        openRemarksModal(
                                            followUps[0]
                                        );
                                    } else {
                                        alert(
                                            "No follow-up available."
                                        );
                                    }
                                }}
                            >
                                <span className="quick-action-icon">
                                    <FileText size={16} />
                                </span>
                                Add Remarks
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    if (followUps.length > 0) {
                                        openScheduleModal(
                                            followUps[0]
                                        );
                                    } else {
                                        alert(
                                            "No follow-up available."
                                        );
                                    }
                                }}
                            >
                                <span className="quick-action-icon">
                                    <CalendarDays size={16} />
                                </span>
                                Schedule Follow-up
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    if (followUps.length > 0) {
                                        openAssignModal(
                                            followUps[0]
                                        );
                                    } else {
                                        alert(
                                            "No follow-up available."
                                        );
                                    }
                                }}
                            >
                                <span className="quick-action-icon">
                                    <UserCheck size={16} />
                                </span>
                                Assign Ownership
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    if (followUps.length > 0) {
                                        handleCloseFollowUp(
                                            followUps[0]
                                        );
                                    } else {
                                        alert(
                                            "No follow-up available."
                                        );
                                    }
                                }}
                            >
                                <span className="quick-action-icon">
                                    <CheckCircle2 size={16} />
                                </span>
                                Close Follow-up
                            </button>

                        </div>

                    </div>


                    {/* STATUS OVERVIEW */}

                    <div className="followup-sidebar-card">

                        <div className="sidebar-card-header">
                            <div>
                                <h2>
                                    Follow-up Status Overview
                                </h2>
                            </div>
                        </div>

                        <div className="status-overview">

                            <div className="status-donut">

                                <div
                                    className="status-donut-ring"
                                    style={{
                                        background: `conic-gradient(
                        #1f2a78 0% ${statusPercentage(
                                            stats.pending
                                        )}%,
                        #d69e2e ${statusPercentage(
                                            stats.pending
                                        )}% ${statusPercentage(
                                            stats.pending +
                                            stats.inProgress
                                        )}%,
                        #38a169 ${statusPercentage(
                                            stats.pending +
                                            stats.inProgress
                                        )}% ${statusPercentage(
                                            stats.pending +
                                            stats.inProgress +
                                            stats.closed
                                        )}%,
                        #e53e3e ${statusPercentage(
                                            stats.pending +
                                            stats.inProgress +
                                            stats.closed
                                        )}% 100%
                        )`,
                                    }}
                                >
                                    <div className="status-donut-center">
                                        <strong>
                                            {stats.total}
                                        </strong>
                                        <span>Total</span>
                                    </div>
                                </div>

                            </div>

                            <div className="status-legend">

                                <div>
                                    <span className="legend-dot pending-dot" />
                                    <span>Pending</span>
                                    <strong>
                                        {stats.pending}
                                    </strong>
                                </div>

                                <div>
                                    <span className="legend-dot progress-dot" />
                                    <span>In Progress</span>
                                    <strong>
                                        {stats.inProgress}
                                    </strong>
                                </div>

                                <div>
                                    <span className="legend-dot closed-dot" />
                                    <span>Closed</span>
                                    <strong>
                                        {stats.closed}
                                    </strong>
                                </div>

                                <div>
                                    <span className="legend-dot overdue-dot" />
                                    <span>Overdue</span>
                                    <strong>
                                        {stats.overdue}
                                    </strong>
                                </div>

                            </div>

                        </div>

                    </div>


                    {/* TODAY'S SUMMARY */}

                    <div className="followup-sidebar-card">

                        <div className="sidebar-card-header">
                            <div>
                                <h2>
                                    Today's Follow-up Summary
                                </h2>
                            </div>
                        </div>

                        <div className="today-summary-list">

                            <div className="today-summary-item">
                                <span>Total Follow-ups</span>
                                <strong>{stats.today}</strong>
                            </div>

                            <div className="today-summary-item">
                                <span>Completed</span>
                                <strong>
                                    {
                                        followUps.filter(
                                            (item) =>
                                                item.status === "CLOSED" &&
                                                item.dueDate &&
                                                new Date(
                                                    item.dueDate
                                                ).toDateString() ===
                                                new Date().toDateString()
                                        ).length
                                    }
                                </strong>
                            </div>

                            <div className="today-summary-item">
                                <span>Pending</span>
                                <strong>
                                    {
                                        followUps.filter(
                                            (item) =>
                                                item.status === "PENDING" &&
                                                item.dueDate &&
                                                new Date(
                                                    item.dueDate
                                                ).toDateString() ===
                                                new Date().toDateString()
                                        ).length
                                    }
                                </strong>
                            </div>

                            <div className="today-summary-item">
                                <span>Overdue</span>
                                <strong>
                                    {
                                        followUps.filter(
                                            (item) =>
                                                item.status !==
                                                "CLOSED" &&
                                                item.dueDate &&
                                                new Date(
                                                    item.dueDate
                                                ) < new Date()
                                        ).length
                                    }
                                </strong>
                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* =================================================
            NEW FOLLOW-UP MODAL
        ================================================= */}

            {showNewModal && (
                <div
                    className="followup-modal-overlay"
                    onClick={closeNewModal}
                >
                    <div
                        className="followup-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="followup-modal-header">

                            <div>
                                <h2>New Follow-up</h2>
                                <p>
                                    Create a new customer follow-up.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeNewModal}
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form
                            className="followup-form"
                            onSubmit={handleCreateFollowUp}
                        >

                            <div className="form-grid">

                                <div className="form-group">
                                    <label>
                                        Customer Name *
                                    </label>

                                    <input
                                        type="text"
                                        name="customerName"
                                        value={form.customerName}
                                        onChange={(e) => /^[A-Za-z\s]*$/.test(e.target.value) && handleFormChange(e)}
                                        placeholder="Enter customer name"
                                        required
                                    />
                                </div>


                                <div className="form-group">
                                    <label>
                                        Customer Mobile
                                    </label>

                                    <input
                                        type="tel"
                                        name="customerMobile"
                                        value={form.customerMobile}
                                        onChange={(e) => /^\d{0,10}$/.test(e.target.value) && handleFormChange(e)}
                                        placeholder="Enter mobile number"
                                    />
                                </div>


                                <div className="form-group">
                                    <label>
                                        Customer ID *
                                    </label>

                                    <input
                                        type="text"
                                        name="customerId"
                                        value={form.customerId}
                                        onChange={handleFormChange}
                                        placeholder="e.g. CUS001"
                                        required
                                    />
                                </div>


                                <div className="form-group">
                                    <label>
                                        Trigger Type *
                                    </label>

                                    <select
                                        name="triggerType"
                                        value={form.triggerType}
                                        onChange={handleFormChange}
                                        required
                                    >
                                        <option value="">
                                            Select Trigger
                                        </option>

                                        {TRIGGER_OPTIONS.map(
                                            (option) => (
                                                <option
                                                    value={option.value}
                                                    key={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>


                                <div className="form-group">
                                    <label>
                                        Last Activity
                                    </label>

                                    <input
                                        type="date"
                                        name="lastActivity"
                                        value={form.lastActivity}
                                        onChange={handleFormChange}
                                    />
                                </div>


                                <div className="form-group">
                                    <label>
                                        Due Date *
                                    </label>

                                    <input
                                        type="date"
                                        name="dueDate"
                                        value={form.dueDate}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>


                                <div className="form-group">
                                    <label>Priority</label>

                                    <select
                                        name="priority"
                                        value={form.priority}
                                        onChange={handleFormChange}
                                    >
                                        {PRIORITY_OPTIONS.map(
                                            (option) => (
                                                <option
                                                    value={option.value}
                                                    key={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>


                                <div className="form-group">
                                    <label>Assigned To</label>

                                    <input
                                        type="text"
                                        name="assignedTo"
                                        value={form.assignedTo}
                                        onChange={(e) => /^[A-Za-z\s]*$/.test(e.target.value) && handleFormChange(e)}
                                        placeholder="Enter owner name"
                                    />
                                </div>


                                <div className="form-group">
                                    <label>Status</label>

                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleFormChange}
                                    >
                                        <option value="PENDING">
                                            Pending
                                        </option>

                                        <option value="IN_PROGRESS">
                                            In Progress
                                        </option>
                                    </select>
                                </div>


                                <div className="form-group full-width">
                                    <label>Remarks</label>

                                    <textarea
                                        name="remarks"
                                        value={form.remarks}
                                        onChange={handleFormChange}
                                        placeholder="Enter remarks"
                                        rows="4"
                                    />
                                </div>

                            </div>

                            <div className="followup-modal-footer">

                                <button
                                    type="button"
                                    className="modal-cancel-btn"
                                    onClick={closeNewModal}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="modal-primary-btn"
                                    disabled={actionLoading}
                                >
                                    <Plus size={16} />
                                    {actionLoading
                                        ? "Creating..."
                                        : "Create Follow-up"}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}


            {/* =================================================
            VIEW FOLLOW-UP MODAL
        ================================================= */}

            {showViewModal &&
                selectedFollowUp && (
                    <div
                        className="followup-modal-overlay"
                        onClick={closeViewModal}
                    >
                        <div
                            className="followup-modal view-followup-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="followup-modal-header">

                                <div>
                                    <h2>View Follow-up</h2>
                                    <p>
                                        Follow-up details
                                    </p>
                                </div>

                            </div>

                            <div className="view-followup-content">

                                <div className="view-customer-header">

                                    <div className="view-customer-avatar">
                                        {getInitials(
                                            selectedFollowUp.customerName
                                        )}
                                    </div>

                                    <div>
                                        <h3>
                                            {
                                                selectedFollowUp.customerName
                                            }
                                        </h3>

                                        <span>
                                            {
                                                selectedFollowUp.customerMobile ||
                                                "-"
                                            }
                                        </span>
                                    </div>

                                </div>

                                <div className="view-details-grid">

                                    <div className="view-detail-item">
                                        <span>
                                            Customer ID
                                        </span>
                                        <strong>
                                            {
                                                selectedFollowUp.customerId ||
                                                "-"
                                            }
                                        </strong>
                                    </div>

                                    <div className="view-detail-item">
                                        <span>
                                            Trigger Type
                                        </span>
                                        <strong>
                                            {getTriggerLabel(
                                                selectedFollowUp.triggerType
                                            )}
                                        </strong>
                                    </div>

                                    <div className="view-detail-item">
                                        <span>
                                            Last Activity
                                        </span>
                                        <strong>
                                            {formatDate(
                                                selectedFollowUp.lastActivity
                                            )}
                                        </strong>
                                    </div>

                                    <div className="view-detail-item">
                                        <span>Due Date</span>
                                        <strong>
                                            {formatDate(
                                                selectedFollowUp.dueDate
                                            )}
                                        </strong>
                                    </div>

                                    <div className="view-detail-item">
                                        <span>Priority</span>
                                        <strong>
                                            {selectedFollowUp.priority ||
                                                "-"}
                                        </strong>
                                    </div>

                                    <div className="view-detail-item">
                                        <span>Assigned To</span>
                                        <strong>
                                            {selectedFollowUp.assignedTo ||
                                                "Unassigned"}
                                        </strong>
                                    </div>

                                    <div className="view-detail-item">
                                        <span>Status</span>
                                        <strong>
                                            {String(
                                                selectedFollowUp.status ||
                                                "-"
                                            ).replaceAll(
                                                "_",
                                                " "
                                            )}
                                        </strong>
                                    </div>

                                    <div className="view-detail-item">
                                        <span>Scheduled Date</span>
                                        <strong>
                                            {formatDate(
                                                selectedFollowUp.scheduledDate
                                            )}
                                        </strong>
                                    </div>

                                    <div className="view-detail-item">
                                        <span>Scheduled Time</span>
                                        <strong>
                                            {
                                                selectedFollowUp.scheduledTime ||
                                                "-"
                                            }
                                        </strong>
                                    </div>

                                    <div className="view-detail-item">
                                        <span>Closed At</span>
                                        <strong>
                                            {formatDateTime(
                                                selectedFollowUp.closedAt
                                            )}
                                        </strong>
                                    </div>

                                </div>

                                <div className="view-remarks">

                                    <span>Remarks</span>

                                    <p>
                                        {selectedFollowUp.remarks ||
                                            "No remarks added."}
                                    </p>

                                </div>

                            </div>

                            <div className="followup-modal-footer">

                                <button
                                    type="button"
                                    className="modal-cancel-btn"
                                    onClick={closeViewModal}
                                >
                                    Close
                                </button>

                                <button
                                    type="button"
                                    className="modal-primary-btn"
                                    onClick={() => {
                                        closeViewModal();
                                        openEditModal(
                                            selectedFollowUp
                                        );
                                    }}
                                >
                                    <Edit size={15} />
                                    Edit Follow-up
                                </button>

                            </div>

                        </div>
                    </div>
                )}


            {/* =================================================
            EDIT FOLLOW-UP MODAL
        ================================================= */}

            {showEditModal &&
                selectedFollowUp && (
                    <div
                        className="followup-modal-overlay"
                        onClick={closeEditModal}
                    >
                        <div
                            className="followup-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="followup-modal-header">

                                <div>
                                    <h2>Edit Follow-up</h2>
                                    <p>
                                        Update follow-up information.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                >
                                    <X size={20} />
                                </button>

                            </div>

                            <form
                                className="followup-form"
                                onSubmit={handleUpdateFollowUp}
                            >

                                <div className="form-grid">

                                    <div className="form-group">
                                        <label>
                                            Customer Name *
                                        </label>

                                        <input
                                            type="text"
                                            name="customerName"
                                            value={form.customerName}
                                            onChange={(e) => /^[A-Za-z\s]*$/.test(e.target.value) && handleFormChange(e)}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Customer Mobile
                                        </label>

                                        <input
                                            type="tel"
                                            name="customerMobile"
                                            value={form.customerMobile}
                                            onChange={(e) => /^\d{0,10}$/.test(e.target.value) && handleFormChange(e)}
                                        />
                                    </div>


                                    <div className="form-group">
                                        <label>
                                            Customer ID *
                                        </label>

                                        <input
                                            type="text"
                                            name="customerId"
                                            value={form.customerId}
                                            onChange={handleFormChange}
                                            required
                                        />
                                    </div>


                                    <div className="form-group">
                                        <label>
                                            Trigger Type *
                                        </label>

                                        <select
                                            name="triggerType"
                                            value={form.triggerType}
                                            onChange={handleFormChange}
                                            required
                                        >
                                            <option value="">
                                                Select Trigger
                                            </option>

                                            {TRIGGER_OPTIONS.map(
                                                (option) => (
                                                    <option
                                                        value={option.value}
                                                        key={option.value}
                                                    >
                                                        {option.label}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>


                                    <div className="form-group">
                                        <label>
                                            Last Activity
                                        </label>

                                        <input
                                            type="date"
                                            name="lastActivity"
                                            value={form.lastActivity}
                                            onChange={handleFormChange}
                                        />
                                    </div>


                                    <div className="form-group">
                                        <label>
                                            Due Date *
                                        </label>

                                        <input
                                            type="date"
                                            name="dueDate"
                                            value={form.dueDate}
                                            onChange={handleFormChange}
                                            required
                                        />
                                    </div>


                                    <div className="form-group">
                                        <label>Priority</label>

                                        <select
                                            name="priority"
                                            value={form.priority}
                                            onChange={handleFormChange}
                                        >
                                            {PRIORITY_OPTIONS.map(
                                                (option) => (
                                                    <option
                                                        value={option.value}
                                                        key={option.value}
                                                    >
                                                        {option.label}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>


                                    <div className="form-group">
                                        <label>
                                            Assigned To
                                        </label>

                                        <input
                                            type="text"
                                            name="assignedTo"
                                            value={form.assignedTo}
                                            onChange={(e) => /^[A-Za-z\s]*$/.test(e.target.value) && handleFormChange(e)}
                                        />
                                    </div>


                                    <div className="form-group">
                                        <label>Status</label>

                                        <select
                                            name="status"
                                            value={form.status}
                                            onChange={handleFormChange}
                                        >
                                            {STATUS_OPTIONS.map(
                                                (option) => (
                                                    <option
                                                        value={option.value}
                                                        key={option.value}
                                                    >
                                                        {option.label}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>


                                    <div className="form-group full-width">
                                        <label>Remarks</label>

                                        <textarea
                                            name="remarks"
                                            value={form.remarks}
                                            onChange={handleFormChange}
                                            rows="4"
                                        />
                                    </div>

                                </div>

                                <div className="followup-modal-footer">

                                    <button
                                        type="button"
                                        className="modal-cancel-btn"
                                        onClick={closeEditModal}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="modal-primary-btn"
                                        disabled={actionLoading}
                                    >
                                        <Edit size={16} />
                                        {actionLoading
                                            ? "Updating..."
                                            : "Update Follow-up"}
                                    </button>

                                </div>

                            </form>

                        </div>
                    </div>
                )}


            {/* =================================================
            ADD REMARKS MODAL
        ================================================= */}

            {showRemarksModal &&
                selectedFollowUp && (
                    <div
                        className="followup-modal-overlay"
                        onClick={closeRemarksModal}
                    >
                        <div
                            className="followup-modal small-followup-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="followup-modal-header">

                                <div>
                                    <h2>Add Remarks</h2>
                                    <p>
                                        Add remarks for this follow-up.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeRemarksModal}
                                >
                                    <X size={20} />
                                </button>

                            </div>

                            <form
                                className="followup-form"
                                onSubmit={handleAddRemarks}
                            >

                                <div className="form-group">
                                    <label>Remarks *</label>

                                    <textarea
                                        value={remarks}
                                        onChange={(e) =>
                                            setRemarks(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter remarks"
                                        rows="6"
                                        required
                                    />
                                </div>

                                <div className="followup-modal-footer">

                                    <button
                                        type="button"
                                        className="modal-cancel-btn"
                                        onClick={closeRemarksModal}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="modal-primary-btn"
                                        disabled={actionLoading}
                                    >
                                        <FileText size={15} />
                                        {actionLoading
                                            ? "Saving..."
                                            : "Save Remarks"}
                                    </button>

                                </div>

                            </form>

                        </div>
                    </div>
                )}


            {/* =================================================
            SCHEDULE MODAL
        ================================================= */}

            {showScheduleModal &&
                selectedFollowUp && (
                    <div
                        className="followup-modal-overlay"
                        onClick={closeScheduleModal}
                    >
                        <div
                            className="followup-modal small-followup-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="followup-modal-header">

                                <div>
                                    <h2>
                                        Schedule Follow-up
                                    </h2>
                                    <p>
                                        Schedule the next follow-up.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeScheduleModal}
                                >
                                    <X size={20} />
                                </button>

                            </div>

                            <form
                                className="followup-form"
                                onSubmit={
                                    handleScheduleFollowUp
                                }
                            >

                                <div className="form-grid">

                                    <div className="form-group">
                                        <label>
                                            Scheduled Date *
                                        </label>

                                        <input
                                            type="date"
                                            value={
                                                scheduleForm.scheduledDate
                                            }
                                            onChange={(e) =>
                                                setScheduleForm(
                                                    (prev) => ({
                                                        ...prev,
                                                        scheduledDate:
                                                            e.target.value,
                                                    })
                                                )
                                            }
                                            required
                                        />
                                    </div>


                                    <div className="form-group">
                                        <label>
                                            Scheduled Time
                                        </label>

                                        <input
                                            type="time"
                                            value={
                                                scheduleForm.scheduledTime
                                            }
                                            onChange={(e) =>
                                                setScheduleForm(
                                                    (prev) => ({
                                                        ...prev,
                                                        scheduledTime:
                                                            e.target.value,
                                                    })
                                                )
                                            }
                                        />
                                    </div>

                                </div>

                                <div className="followup-modal-footer">

                                    <button
                                        type="button"
                                        className="modal-cancel-btn"
                                        onClick={
                                            closeScheduleModal
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="modal-primary-btn"
                                        disabled={actionLoading}
                                    >
                                        <CalendarDays size={15} />
                                        {actionLoading
                                            ? "Scheduling..."
                                            : "Schedule Follow-up"}
                                    </button>

                                </div>

                            </form>

                        </div>
                    </div>
                )}


            {/* =================================================
            ASSIGN OWNERSHIP MODAL
        ================================================= */}

            {showAssignModal &&
                selectedFollowUp && (
                    <div
                        className="followup-modal-overlay"
                        onClick={closeAssignModal}
                    >
                        <div
                            className="followup-modal small-followup-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="followup-modal-header">

                                <div>
                                    <h2>
                                        Assign Ownership
                                    </h2>
                                    <p>
                                        Assign this follow-up to a
                                        sales team member.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeAssignModal}
                                >
                                    <X size={20} />
                                </button>

                            </div>

                            <form
                                className="followup-form"
                                onSubmit={
                                    handleAssignOwnership
                                }
                            >

                                <div className="form-group">
                                    <label>
                                        Assigned To *
                                    </label>

                                    <input
                                        type="text"
                                        value={assignedTo}
                                        onChange={(e) =>
                                            setAssignedTo(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter owner name"
                                        required
                                    />

                                    {assignedOwners.length > 0 && (
                                        <div className="owner-suggestions">

                                            {assignedOwners.map(
                                                (owner) => (
                                                    <button
                                                        type="button"
                                                        key={owner}
                                                        onClick={() =>
                                                            setAssignedTo(
                                                                owner
                                                            )
                                                        }
                                                    >
                                                        {owner}
                                                    </button>
                                                )
                                            )}

                                        </div>
                                    )}

                                </div>

                                <div className="followup-modal-footer">

                                    <button
                                        type="button"
                                        className="modal-cancel-btn"
                                        onClick={closeAssignModal}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="modal-primary-btn"
                                        disabled={actionLoading}
                                    >
                                        <UserCheck size={15} />
                                        {actionLoading
                                            ? "Assigning..."
                                            : "Assign Follow-up"}
                                    </button>

                                </div>

                            </form>

                        </div>
                    </div>
                )}


            {/* =================================================
            DELETE CONFIRMATION
        ================================================= */}

            {showDeleteModal &&
                selectedFollowUp && (
                    <div
                        className="followup-modal-overlay"
                        onClick={closeDeleteModal}
                    >
                        <div
                            className="followup-modal delete-confirm-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="delete-confirm-icon">
                                <Trash2 size={22} />
                            </div>

                            <h2>
                                Delete Follow-up?
                            </h2>

                            <p>
                                Are you sure you want to delete the
                                follow-up for{" "}
                                <strong>
                                    {
                                        selectedFollowUp.customerName
                                    }
                                </strong>
                                ? This action cannot be undone.
                            </p>

                            <div className="followup-modal-footer">

                                <button
                                    type="button"
                                    className="modal-cancel-btn"
                                    onClick={closeDeleteModal}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="modal-delete-btn"
                                    onClick={
                                        handleDeleteFollowUp
                                    }
                                    disabled={actionLoading}
                                >
                                    <Trash2 size={15} />
                                    {actionLoading
                                        ? "Deleting..."
                                        : "Delete Follow-up"}
                                </button>

                            </div>

                        </div>
                    </div>
                )}

        </div>
    );
};

export default FollowUpManagement;