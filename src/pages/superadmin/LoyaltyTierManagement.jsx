import React, { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Search,
    Filter,
    RefreshCw,
    Edit,
    Trash2,
    Eye,
    X,
    Check,
    ChevronDown,
    Award,
    Users,
    TrendingUp,
    Gift,
    Star,
    ShieldCheck,
    Crown,
    Download,
    SlidersHorizontal,
    History,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import "../../css/superadmin/loyaltyTierManagement.css";


const API_URL = "https://oneplussparkpaintsserver.onrender.com/api/loyalty-tiers";

const initialForm = {
    tierName: "",
    level: "",
    tierType: "STANDARD",
    applicableTo: [],
    minPurchase: 0,
    rewardPointsMultiplier: 1,
    cashbackPercentage: 0,

    benefits: {
        higherRewardPoints: false,
        exclusiveSchemes: false,
        cashbackOffers: false,
        earlyProductLaunchAccess: false,
        premiumSupport: false,
        birthdaySpecialPoints: 0,
        anniversaryBonus: 0,
    },

    qualificationRules: {
        minAnnualPurchase: 0,
        otherConditions: "",
    },

    status: "ACTIVE",
    description: "",
};

const customerTypes = ["DEALER", "PAINTER", "RETAILER"];

const tierTypes = [
    "STANDARD",
    "PREMIUM",
    "VIP",
    "CUSTOM",
];

const statusOptions = ["ACTIVE", "INACTIVE"];

const LoyaltyTierManagement = () => {
    const [tiers, setTiers] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [customerFilter, setCustomerFilter] = useState("ALL");

    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    const [editingTier, setEditingTier] = useState(null);
    const [viewingTier, setViewingTier] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 10;

    const [form, setForm] = useState(initialForm);

    // =====================================================
    // FETCH ALL TIERS
    // =====================================================

    const fetchTiers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(API_URL);
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to fetch loyalty tiers");
            }

            setTiers(data.tiers || []);
        } catch (err) {
            setError(err.message || "Failed to load loyalty tiers");
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // FETCH STATS
    // =====================================================

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_URL}/stats`);
            const data = await response.json();

            if (response.ok && data.success) {
                setStats(
                    data.stats || {
                        total: 0,
                        active: 0,
                        inactive: 0,
                    }
                );
            }
        } catch (err) {
            console.error("Stats error:", err);
        }
    };

    useEffect(() => {
        fetchTiers();
        fetchStats();
    }, []);

    // =====================================================
    // REFRESH
    // =====================================================

    const refreshData = async () => {
        await Promise.all([fetchTiers(), fetchStats()]);
    };

    // =====================================================
    // FILTERED TIERS
    // =====================================================

    const filteredTiers = useMemo(() => {
        return tiers.filter((tier) => {
            const searchValue = search.trim().toLowerCase();

            const matchesSearch =
                !searchValue ||
                tier.tierName?.toLowerCase().includes(searchValue) ||
                tier.tierType?.toLowerCase().includes(searchValue) ||
                tier.description?.toLowerCase().includes(searchValue);

            const matchesStatus =
                statusFilter === "ALL" ||
                tier.status === statusFilter;

            const matchesType =
                typeFilter === "ALL" ||
                tier.tierType === typeFilter;

            const matchesCustomer =
                customerFilter === "ALL" ||
                tier.applicableTo?.includes(customerFilter);

            return (
                matchesSearch &&
                matchesStatus &&
                matchesType &&
                matchesCustomer
            );
        });
    }, [
        tiers,
        search,
        statusFilter,
        typeFilter,
        customerFilter,
    ]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredTiers.length / PAGE_SIZE)
    );

    const paginatedTiers = filteredTiers.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    // =====================================================
    // FORM HELPERS
    // =====================================================

    const resetForm = () => {
        setForm(initialForm);
        setEditingTier(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
        setError("");
        setSuccess("");
    };

    const openEditModal = (tier) => {
        setEditingTier(tier);

        setForm({
            tierName: tier.tierName || "",
            level: tier.level ?? "",
            tierType: tier.tierType || "STANDARD",
            applicableTo: tier.applicableTo || [],
            minPurchase: tier.minPurchase ?? 0,
            rewardPointsMultiplier:
                tier.rewardPointsMultiplier ?? 1,
            cashbackPercentage:
                tier.cashbackPercentage ?? 0,

            benefits: {
                higherRewardPoints:
                    tier.benefits?.higherRewardPoints || false,
                exclusiveSchemes:
                    tier.benefits?.exclusiveSchemes || false,
                cashbackOffers:
                    tier.benefits?.cashbackOffers || false,
                earlyProductLaunchAccess:
                    tier.benefits?.earlyProductLaunchAccess || false,
                premiumSupport:
                    tier.benefits?.premiumSupport || false,
                birthdaySpecialPoints:
                    tier.benefits?.birthdaySpecialPoints || 0,
                anniversaryBonus:
                    tier.benefits?.anniversaryBonus || 0,
            },

            qualificationRules: {
                minAnnualPurchase:
                    tier.qualificationRules?.minAnnualPurchase || 0,
                otherConditions:
                    tier.qualificationRules?.otherConditions || "",
            },

            status: tier.status || "ACTIVE",
            description: tier.description || "",
        });

        setShowModal(true);
        setError("");
        setSuccess("");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleBenefitChange = (name, value) => {
        setForm((prev) => ({
            ...prev,
            benefits: {
                ...prev.benefits,
                [name]: value,
            },
        }));
    };

    const handleRuleChange = (name, value) => {
        setForm((prev) => ({
            ...prev,
            qualificationRules: {
                ...prev.qualificationRules,
                [name]: value,
            },
        }));
    };

    const handleCustomerTypeChange = (type) => {
        setForm((prev) => {
            const exists = prev.applicableTo.includes(type);

            return {
                ...prev,
                applicableTo: exists
                    ? prev.applicableTo.filter((item) => item !== type)
                    : [...prev.applicableTo, type],
            };
        });
    };

    // =====================================================
    // CREATE / UPDATE
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.tierName.trim()) {
            setError("Tier name is required");
            return;
        }

        if (!form.level) {
            setError("Level is required");
            return;
        }

        if (form.applicableTo.length === 0) {
            setError("Select at least one applicable customer type");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                tierName: form.tierName.trim(),
                level: Number(form.level),
                tierType: form.tierType,
                applicableTo: form.applicableTo,

                minPurchase: Number(form.minPurchase) || 0,
                rewardPointsMultiplier:
                    Number(form.rewardPointsMultiplier) || 1,
                cashbackPercentage:
                    Number(form.cashbackPercentage) || 0,

                benefits: {
                    ...form.benefits,
                    birthdaySpecialPoints:
                        Number(form.benefits.birthdaySpecialPoints) || 0,
                    anniversaryBonus:
                        Number(form.benefits.anniversaryBonus) || 0,
                },

                qualificationRules: {
                    minAnnualPurchase:
                        Number(
                            form.qualificationRules.minAnnualPurchase
                        ) || 0,
                    otherConditions:
                        form.qualificationRules.otherConditions || "",
                },

                status: form.status,
                description: form.description || "",
            };

            const url = editingTier
                ? `${API_URL}/${editingTier._id}`
                : API_URL;

            const method = editingTier ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Failed to save loyalty tier"
                );
            }

            setSuccess(
                editingTier
                    ? "Loyalty tier updated successfully"
                    : "Loyalty tier created successfully"
            );

            setShowModal(false);
            resetForm();

            await refreshData();
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // DELETE
    // =====================================================

    const handleDelete = async (tier) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${tier.tierName}"?`
        );

        if (!confirmed) return;

        try {
            setError("");
            setSuccess("");

            const response = await fetch(
                `${API_URL}/${tier._id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Failed to delete loyalty tier"
                );
            }

            setSuccess("Loyalty tier deleted successfully");

            await refreshData();
        } catch (err) {
            setError(err.message || "Failed to delete loyalty tier");
        }
    };

    // =====================================================
    // STATUS
    // =====================================================

    const handleStatusChange = async (tier) => {
        const newStatus =
            tier.status === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        try {
            setError("");
            setSuccess("");

            const response = await fetch(
                `${API_URL}/${tier._id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        status: newStatus,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Failed to update status"
                );
            }

            setSuccess(
                `Tier ${newStatus.toLowerCase()} successfully`
            );

            await refreshData();
        } catch (err) {
            setError(
                err.message || "Failed to update tier status"
            );
        }
    };

    // =====================================================
    // VIEW
    // =====================================================

    const openViewModal = (tier) => {
        setViewingTier(tier);
        setShowViewModal(true);
    };

    // =====================================================
    // RESET FILTERS
    // =====================================================

    const resetFilters = () => {
        setSearch("");
        setStatusFilter("ALL");
        setTypeFilter("ALL");
        setCustomerFilter("ALL");
    };

    // =====================================================
    // BENEFITS COUNT
    // =====================================================

    const getBenefitsCount = (tier) => {
        if (!tier.benefits) return 0;

        const booleanBenefits = [
            "higherRewardPoints",
            "exclusiveSchemes",
            "cashbackOffers",
            "earlyProductLaunchAccess",
            "premiumSupport",
        ];

        return booleanBenefits.filter(
            (key) => tier.benefits[key]
        ).length;
    };

    return (
        <div className="loyalty-tier-page">

            {/* =================================================
          HEADER
      ================================================= */}

            <div className="loyalty-page-header">
                <div>
                    <h1>Loyalty Tier Management</h1>
                    <p>
                        Configure customer loyalty tiers, benefits and
                        qualification rules.
                    </p>
                </div>

                <div className="header-actions">
                    <button
                        className="btn-secondary"
                        onClick={refreshData}
                        disabled={loading}
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>

                    <button
                        className="btn-primary"
                        onClick={openAddModal}
                    >
                        <Plus size={18} />
                        Add New Tier
                    </button>
                </div>
            </div>

            {/* =================================================
          STATS
      ================================================= */}

            <div className="loyalty-stats-grid">

                <div className="loyalty-stat-card">
                    <div className="stat-icon">
                        <Award size={22} />
                    </div>

                    <div>
                        <span>Total Tiers</span>
                        <strong>{stats.total ?? tiers.length}</strong>
                    </div>
                </div>

                <div className="loyalty-stat-card">
                    <div className="stat-icon">
                        <Check size={22} />
                    </div>

                    <div>
                        <span>Active Tiers</span>
                        <strong>{stats.active ?? 0}</strong>
                    </div>
                </div>

                <div className="loyalty-stat-card">
                    <div className="stat-icon">
                        <ShieldCheck size={22} />
                    </div>

                    <div>
                        <span>Inactive Tiers</span>
                        <strong>{stats.inactive ?? 0}</strong>
                    </div>
                </div>

                <div className="loyalty-stat-card">
                    <div className="stat-icon">
                        <Users size={22} />
                    </div>

                    <div>
                        <span>Customer Types</span>
                        <strong>3</strong>
                    </div>
                </div>

            </div>

            {/* =================================================
          FILTERS
      ================================================= */}

            <div className="loyalty-filter-card">

                {/* <div className="filter-title">
                    <Filter size={18} />
                    <span>Filters</span>
                </div> */}

                <div className="loyalty-filter-row">

                    <div className="search-box">
                        <Search size={17} />

                        <input
                            type="text"
                            placeholder="Search tier..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />
                    </div>

                    <div className="select-box">
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                        >
                            <option value="ALL">All Status</option>

                            {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>

                        <ChevronDown size={16} />
                    </div>

                    <div className="select-box">
                        <select
                            value={typeFilter}
                            onChange={(e) =>
                                setTypeFilter(e.target.value)
                            }
                        >
                            <option value="ALL">All Tier Types</option>

                            {tierTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>

                        <ChevronDown size={16} />
                    </div>

                    <div className="select-box">
                        <select
                            value={customerFilter}
                            onChange={(e) =>
                                setCustomerFilter(e.target.value)
                            }
                        >
                            <option value="ALL">
                                All Customer Types
                            </option>

                            {customerTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>

                        <ChevronDown size={16} />
                    </div>

                    <button
                        className="reset-filter-btnn"
                        onClick={resetFilters}
                    >
                        Reset
                    </button>

                </div>
            </div>

            {/* =================================================
          TIER TABLE
      ================================================= */}

            <div className="loyalty-table-card">

                <div className="section-header">
                    <div>
                        <h2>Loyalty Tiers</h2>
                        <p>
                            {filteredTiers.length} tier
                            {filteredTiers.length !== 1 ? "s" : ""} found
                        </p>
                    </div>

                    <button
                        className="small-add-btn"
                        onClick={openAddModal}
                    >
                        <Plus size={16} />
                        Add Tier
                    </button>
                </div>

                {loading ? (
                    <div className="table-loading">
                        <RefreshCw className="loading-icon" size={25} />
                        <span>Loading loyalty tiers...</span>
                    </div>
                ) : filteredTiers.length === 0 ? (
                    <div className="empty-state">
                        <Award size={42} />
                        <h3>No Loyalty Tiers Found</h3>
                        <p>
                            Add your first loyalty tier to get started.
                        </p>

                        <button
                            className="btn-primary"
                            onClick={openAddModal}
                        >
                            <Plus size={17} />
                            Add New Tier
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="table-wrapper">

                            <table className="loyalty-table">

                                <thead>
                                    <tr>
                                        <th>Tier</th>
                                        <th>Level</th>
                                        <th>Type</th>
                                        <th>Applicable To</th>
                                        <th>Min. Purchase</th>
                                        <th>Reward Multiplier</th>
                                        <th>Cashback</th>
                                        <th>Benefits</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {paginatedTiers.map((tier) => (
                                        <tr key={tier._id}>

                                            <td>
                                                <div className="tier-name-cell">
                                                    <div className="tier-avatar">
                                                        {tier.level === 1 ? (
                                                            <Award size={19} />
                                                        ) : tier.level === 2 ? (
                                                            <Star size={19} />
                                                        ) : (
                                                            <Crown size={19} />
                                                        )}
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {tier.tierName}
                                                        </strong>

                                                        {tier.description && (
                                                            <small>
                                                                {tier.description}
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <span className="level-badge">
                                                    Level {tier.level}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="type-badge">
                                                    {tier.tierType}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="customer-tags">
                                                    {(tier.applicableTo || []).map(
                                                        (type) => (
                                                            <span key={type}>
                                                                {type}
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            </td>

                                            <td>
                                                ₹
                                                {Number(
                                                    tier.minPurchase || 0
                                                ).toLocaleString("en-IN")}
                                            </td>

                                            <td>
                                                <strong>
                                                    {tier.rewardPointsMultiplier}x
                                                </strong>
                                            </td>

                                            <td>
                                                <strong>
                                                    {tier.cashbackPercentage}%
                                                </strong>
                                            </td>

                                            <td>
                                                <span className="benefit-count">
                                                    <Gift size={14} />
                                                    {getBenefitsCount(tier)}
                                                </span>
                                            </td>

                                            <td>
                                                <button
                                                    className={`status-toggle ${tier.status === "ACTIVE"
                                                        ? "active"
                                                        : "inactive"
                                                        }`}
                                                    onClick={() =>
                                                        handleStatusChange(tier)
                                                    }
                                                >
                                                    <span />
                                                    {tier.status}
                                                </button>
                                            </td>

                                            <td>
                                                <div className="action-buttons">

                                                    <button
                                                        className="icon-btn view"
                                                        title="View"
                                                        onClick={() =>
                                                            openViewModal(tier)
                                                        }
                                                    >
                                                        <Eye size={17} />
                                                    </button>

                                                    <button
                                                        className="icon-btn edit"
                                                        title="Edit"
                                                        onClick={() =>
                                                            openEditModal(tier)
                                                        }
                                                    >
                                                        <Edit size={17} />
                                                    </button>

                                                    <button
                                                        className="icon-btn delete"
                                                        title="Delete"
                                                        onClick={() =>
                                                            handleDelete(tier)
                                                        }
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>

                                                </div>
                                            </td>

                                        </tr>
                                    ))}

                                </tbody>

                            </table>
                        </div>

                        <div className="loyalty-pagination">
                            <span>
                                Showing{" "}
                                {filteredTiers.length === 0
                                    ? 0
                                    : (currentPage - 1) * PAGE_SIZE + 1}{" "}
                                to{" "}
                                {Math.min(
                                    currentPage * PAGE_SIZE,
                                    filteredTiers.length
                                )}{" "}
                                of {filteredTiers.length} entries
                            </span>

                            <div className="loyalty-pagination-controls">
                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                        setCurrentPage((page) => page - 1)
                                    }
                                >
                                    <ChevronLeft size={15} />
                                </button>

                                {Array.from(
                                    { length: totalPages },
                                    (_, index) => index + 1
                                ).map((page) => (
                                    <button
                                        type="button"
                                        key={page}
                                        className={currentPage === page ? "active" : ""}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    disabled={currentPage === totalPages}
                                    onClick={() =>
                                        setCurrentPage((page) => page + 1)
                                    }
                                >
                                    <ChevronRight size={15} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* =================================================
          BOTTOM CONTENT - FIGMA LAYOUT
      ================================================= */}

            <div className="loyalty-main-layout">

                {/* LEFT CONTENT */}
                <div className="loyalty-left-content">

                    {/* TIER BENEFITS COMPARISON */}
                    <div className="tier-benefits-comparison-card">

                        <div className="section-header">
                            <div>
                                <h2>Tier Benefits Comparison</h2>
                                <p>Compare configured benefits across loyalty tiers</p>
                            </div>
                        </div>

                        <div className="comparison-table-wrapper">
                            {tiers.length === 0 ? (
                                <div className="summary-empty">
                                    No tiers configured
                                </div>
                            ) : (
                                <table className="comparison-table">

                                    <thead>
                                        <tr>
                                            <th>Benefits / Features</th>

                                            {tiers
                                                .slice()
                                                .sort(
                                                    (a, b) =>
                                                        Number(a.level || 0) -
                                                        Number(b.level || 0)
                                                )
                                                .map((tier) => (
                                                    <th key={tier._id}>
                                                        <div className="comparison-tier-header">
                                                            <span className="comparison-tier-icon">
                                                                {tier.level === 1 ? (
                                                                    <Award size={16} />
                                                                ) : tier.level === 2 ? (
                                                                    <Star size={16} />
                                                                ) : (
                                                                    <Crown size={16} />
                                                                )}
                                                            </span>
                                                            <span>{tier.tierName}</span>
                                                        </div>
                                                    </th>
                                                ))}
                                        </tr>
                                    </thead>

                                    <tbody>

                                        <tr>
                                            <td>Reward Points Multiplier</td>
                                            {tiers
                                                .slice()
                                                .sort(
                                                    (a, b) =>
                                                        Number(a.level || 0) -
                                                        Number(b.level || 0)
                                                )
                                                .map((tier) => (
                                                    <td key={tier._id}>
                                                        <strong>
                                                            {tier.rewardPointsMultiplier ?? 1}x
                                                        </strong>
                                                    </td>
                                                ))}
                                        </tr>

                                        <tr>
                                            <td>Cashback</td>
                                            {tiers
                                                .slice()
                                                .sort(
                                                    (a, b) =>
                                                        Number(a.level || 0) -
                                                        Number(b.level || 0)
                                                )
                                                .map((tier) => (
                                                    <td key={tier._id}>
                                                        <strong>
                                                            {tier.cashbackPercentage ?? 0}%
                                                        </strong>
                                                    </td>
                                                ))}
                                        </tr>

                                        {[
                                            ["exclusiveSchemes", "Exclusive Schemes"],
                                            ["earlyProductLaunchAccess", "Early Product Launch Access"],
                                            ["premiumSupport", "Premium Support"],
                                        ].map(([key, label]) => (
                                            <tr key={key}>
                                                <td>{label}</td>

                                                {tiers
                                                    .slice()
                                                    .sort(
                                                        (a, b) =>
                                                            Number(a.level || 0) -
                                                            Number(b.level || 0)
                                                    )
                                                    .map((tier) => (
                                                        <td key={tier._id}>
                                                            {tier.benefits?.[key] ? (
                                                                <span className="comparison-check">
                                                                    ✓
                                                                </span>
                                                            ) : (
                                                                <span className="comparison-cross">
                                                                    ×
                                                                </span>
                                                            )}
                                                        </td>
                                                    ))}
                                            </tr>
                                        ))}

                                        <tr>
                                            <td>Birthday Special Points</td>
                                            {tiers
                                                .slice()
                                                .sort(
                                                    (a, b) =>
                                                        Number(a.level || 0) -
                                                        Number(b.level || 0)
                                                )
                                                .map((tier) => (
                                                    <td key={tier._id}>
                                                        {Number(
                                                            tier.benefits?.birthdaySpecialPoints || 0
                                                        )}{" "}
                                                        Pts
                                                    </td>
                                                ))}
                                        </tr>

                                        <tr>
                                            <td>Anniversary Bonus</td>
                                            {tiers
                                                .slice()
                                                .sort(
                                                    (a, b) =>
                                                        Number(a.level || 0) -
                                                        Number(b.level || 0)
                                                )
                                                .map((tier) => (
                                                    <td key={tier._id}>
                                                        {Number(
                                                            tier.benefits?.anniversaryBonus || 0
                                                        )}{" "}
                                                        Pts
                                                    </td>
                                                ))}
                                        </tr>

                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>


                    {/* TIER QUALIFICATION RULES */}
                    <div className="tier-qualification-card">

                        <div className="section-header">
                            <div>
                                <h2>Tier Qualification Rules (Summary)</h2>
                                <p>Configured qualification rules for each tier</p>
                            </div>
                        </div>

                        <div className="qualification-summary-list">

                            {tiers
                                .slice()
                                .sort(
                                    (a, b) =>
                                        Number(a.level || 0) -
                                        Number(b.level || 0)
                                )
                                .map((tier, index) => (
                                    <div
                                        className="qualification-summary-item"
                                        key={tier._id}
                                    >

                                        <div className="qualification-number">
                                            {index + 1}
                                        </div>

                                        <div className="qualification-content">

                                            <div className="qualification-title">
                                                <strong>
                                                    Level {tier.level} - {tier.tierName}
                                                </strong>
                                            </div>

                                            <div className="qualification-box">

                                                <div>
                                                    <span>Min. Annual Purchase</span>
                                                    <strong>
                                                        ₹
                                                        {Number(
                                                            tier.qualificationRules
                                                                ?.minAnnualPurchase || 0
                                                        ).toLocaleString("en-IN")}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Other Conditions</span>
                                                    <strong>
                                                        {tier.qualificationRules
                                                            ?.otherConditions ||
                                                            "No additional conditions"}
                                                    </strong>
                                                </div>

                                            </div>

                                        </div>

                                    </div>
                                ))}

                            {tiers.length === 0 && (
                                <div className="summary-empty">
                                    No qualification rules configured
                                </div>
                            )}

                        </div>

                        <div className="qualification-footer">
                            <button
                                className="btn-secondary"
                                onClick={openAddModal}
                            >
                                <SlidersHorizontal size={16} />
                                Configure Tier Rules
                            </button>
                        </div>

                    </div>

                </div>


                {/* RIGHT SIDEBAR */}
                <div className="loyalty-right-sidebar">

                    {/* TIER BENEFITS OVERVIEW */}
                    <div className="benefits-card">

                        <div className="section-header">
                            <div>
                                <h2>Tier Benefits Overview</h2>
                                <p>Benefits available in loyalty programme</p>
                            </div>
                        </div>

                        <div className="benefit-list">

                            {[
                                {
                                    icon: TrendingUp,
                                    title: "Higher Reward Points",
                                    description: "Earn more points on every purchase",
                                    key: "higherRewardPoints",
                                },
                                {
                                    icon: Gift,
                                    title: "Exclusive Schemes",
                                    description: "Access to member-only schemes",
                                    key: "exclusiveSchemes",
                                },
                                {
                                    icon: Star,
                                    title: "Cashback Offers",
                                    description: "Higher cashback on eligible purchases",
                                    key: "cashbackOffers",
                                },
                                {
                                    icon: Crown,
                                    title: "Early Product Launch Access",
                                    description: "Be the first to try new products",
                                    key: "earlyProductLaunchAccess",
                                },
                                {
                                    icon: ShieldCheck,
                                    title: "Premium Support",
                                    description: "Priority support and faster resolution",
                                    key: "premiumSupport",
                                },
                            ].map((benefit) => {
                                const Icon = benefit.icon;

                                const configured = tiers.some(
                                    (tier) => tier.benefits?.[benefit.key]
                                );

                                return (
                                    <div
                                        className="benefit-overview-item"
                                        key={benefit.key}
                                    >
                                        <div className="benefit-icon">
                                            <Icon size={16} />
                                        </div>

                                        <div className="benefit-overview-content">
                                            <strong>{benefit.title}</strong>
                                            <span>{benefit.description}</span>
                                        </div>

                                        <span
                                            className={
                                                configured
                                                    ? "benefit-configured"
                                                    : "benefit-not-configured"
                                            }
                                        >
                                            {configured ? "✓" : "—"}
                                        </span>
                                    </div>
                                );
                            })}

                        </div>
                    </div>


                    {/* QUICK ACTIONS */}
                    <div className="quick-actions-card">

                        <div className="section-header">
                            <div>
                                <h2>Quick Actions</h2>
                                <p>Manage loyalty tiers quickly</p>
                            </div>
                        </div>

                        <div className="quick-actions-list">

                            <button
                                className="quick-action-item"
                                onClick={openAddModal}
                            >
                                <div className="quick-action-icon">
                                    <Plus size={17} />
                                </div>

                                <div>
                                    <strong>Add New Tier</strong>
                                    <span>Create a new loyalty tier</span>
                                </div>
                            </button>


                            <button
                                className="quick-action-item"
                                onClick={openAddModal}
                            >
                                <div className="quick-action-icon">
                                    <SlidersHorizontal size={17} />
                                </div>

                                <div>
                                    <strong>Configure Tier Rules</strong>
                                    <span>Set rules for tier qualification</span>
                                </div>
                            </button>


                            <button
                                className="quick-action-item"
                                onClick={() => {
                                    if (tiers.length > 0) {
                                        openViewModal(
                                            tiers
                                                .slice()
                                                .sort(
                                                    (a, b) =>
                                                        Number(a.level || 0) -
                                                        Number(b.level || 0)
                                                )[0]
                                        );
                                    } else {
                                        setError("No tier history is available");
                                    }
                                }}
                            >
                                <div className="quick-action-icon">
                                    <History size={17} />
                                </div>

                                <div>
                                    <strong>View Tier History</strong>
                                    <span>View configured tier details</span>
                                </div>
                            </button>


                            <button
                                className="quick-action-item"
                                onClick={() => {
                                    const rows = tiers.map((tier) =>
                                        [
                                            tier.tierName,
                                            tier.level,
                                            tier.tierType,
                                            (tier.applicableTo || []).join(" / "),
                                            tier.minPurchase || 0,
                                            tier.rewardPointsMultiplier || 1,
                                            tier.cashbackPercentage || 0,
                                            tier.status,
                                        ]
                                            .map((value) =>
                                                `"${String(value).replace(/"/g, '""')}"`
                                            )
                                            .join(",")
                                    );

                                    const csv = [
                                        "Tier Name,Level,Tier Type,Applicable To,Minimum Purchase,Reward Multiplier,Cashback,Status",
                                        ...rows,
                                    ].join("\n");

                                    const blob = new Blob([csv], {
                                        type: "text/csv;charset=utf-8;",
                                    });

                                    const url =
                                        URL.createObjectURL(blob);

                                    const link =
                                        document.createElement("a");

                                    link.href = url;
                                    link.download =
                                        "loyalty-tier-report.csv";

                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();

                                    URL.revokeObjectURL(url);
                                }}
                            >
                                <div className="quick-action-icon">
                                    <Download size={17} />
                                </div>

                                <div>
                                    <strong>Download Tier Report</strong>
                                    <span>Download loyalty tier report</span>
                                </div>
                            </button>

                        </div>
                    </div>


                    {/* TODAY'S SUMMARY */}
                    <div className="todays-summary-card">

                        <div className="section-header">
                            <div>
                                <h2>Today's Summary</h2>
                            </div>
                        </div>

                        <div className="today-summary-list">

                            <div className="today-summary-row">
                                <span>New Customers Added</span>
                                <strong>—</strong>
                            </div>

                            <div className="today-summary-row">
                                <span>Upgraded to Higher Tier</span>
                                <strong>—</strong>
                            </div>

                            <div className="today-summary-row">
                                <span>Downgraded Customers</span>
                                <strong>—</strong>
                            </div>

                            <div className="today-summary-row">
                                <span>Reward Points Redeemed</span>
                                <strong>—</strong>
                            </div>

                        </div>

                        <div className="today-summary-note">
                            Customer activity data is not provided by the current
                            loyalty-tier API.
                        </div>

                    </div>

                </div>

            </div>

            {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

            {showModal && (
                <div
                    className="loyalty-modal-overlay"
                    onClick={() => {
                        setShowModal(false);
                        resetForm();
                    }}
                >

                    <div
                        className="loyalty-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="modal-header">
                            <div>
                                <h2>
                                    {editingTier
                                        ? "Edit Loyalty Tier"
                                        : "Add New Loyalty Tier"}
                                </h2>

                                <p>
                                    Configure tier rules and benefits.
                                </p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="modal-body">

                                {/* BASIC DETAILS */}

                                <div className="form-section">
                                    <h3>Basic Details</h3>

                                    <div className="form-grid">

                                        <div className="form-group">
                                            <label>
                                                Tier Name *
                                            </label>

                                            <input
                                                name="tierName"
                                                value={form.tierName}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Silver"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                Level *
                                            </label>

                                            <input
                                                type="number"
                                                min="1"
                                                name="level"
                                                value={form.level}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 1"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                Tier Type
                                            </label>

                                            <select
                                                name="tierType"
                                                value={form.tierType}
                                                onChange={handleInputChange}
                                            >
                                                {tierTypes.map((type) => (
                                                    <option
                                                        key={type}
                                                        value={type}
                                                    >
                                                        {type}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                Status
                                            </label>

                                            <select
                                                name="status"
                                                value={form.status}
                                                onChange={handleInputChange}
                                            >
                                                {statusOptions.map(
                                                    (status) => (
                                                        <option
                                                            key={status}
                                                            value={status}
                                                        >
                                                            {status}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>

                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Description
                                        </label>

                                        <textarea
                                            name="description"
                                            value={form.description}
                                            onChange={handleInputChange}
                                            placeholder="Enter tier description..."
                                            rows="3"
                                        />
                                    </div>
                                </div>

                                {/* APPLICABLE TO */}

                                <div className="form-section">
                                    <h3>Applicable To</h3>

                                    <div className="checkbox-card-grid">

                                        {customerTypes.map((type) => (
                                            <label
                                                className={`checkbox-card ${form.applicableTo.includes(
                                                    type
                                                )
                                                    ? "selected"
                                                    : ""
                                                    }`}
                                                key={type}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={form.applicableTo.includes(
                                                        type
                                                    )}
                                                    onChange={() =>
                                                        handleCustomerTypeChange(
                                                            type
                                                        )
                                                    }
                                                />

                                                <span className="custom-checkbox">
                                                    {form.applicableTo.includes(
                                                        type
                                                    ) && <Check size={14} />}
                                                </span>

                                                <span>{type}</span>
                                            </label>
                                        ))}

                                    </div>
                                </div>

                                {/* REWARD SETTINGS */}

                                <div className="form-section">
                                    <h3>Reward Settings</h3>

                                    <div className="form-grid">

                                        <div className="form-group">
                                            <label>
                                                Minimum Purchase
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                name="minPurchase"
                                                value={form.minPurchase}
                                                onChange={handleInputChange}
                                                placeholder="0"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                Reward Points Multiplier
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                name="rewardPointsMultiplier"
                                                value={
                                                    form.rewardPointsMultiplier
                                                }
                                                onChange={handleInputChange}
                                                placeholder="1"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                Cashback Percentage
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                name="cashbackPercentage"
                                                value={
                                                    form.cashbackPercentage
                                                }
                                                onChange={handleInputChange}
                                                placeholder="0"
                                            />
                                        </div>

                                    </div>
                                </div>

                                {/* BENEFITS */}

                                <div className="form-section">
                                    <h3>Tier Benefits</h3>

                                    <div className="benefits-form-grid">

                                        {[
                                            [
                                                "higherRewardPoints",
                                                "Higher Reward Points",
                                            ],
                                            [
                                                "exclusiveSchemes",
                                                "Exclusive Schemes",
                                            ],
                                            [
                                                "cashbackOffers",
                                                "Cashback Offers",
                                            ],
                                            [
                                                "earlyProductLaunchAccess",
                                                "Early Product Launch Access",
                                            ],
                                            [
                                                "premiumSupport",
                                                "Premium Support",
                                            ],
                                        ].map(([key, label]) => (
                                            <label
                                                className={`benefit-checkbox ${form.benefits[key]
                                                    ? "checked"
                                                    : ""
                                                    }`}
                                                key={key}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        form.benefits[key]
                                                    }
                                                    onChange={(e) =>
                                                        handleBenefitChange(
                                                            key,
                                                            e.target.checked
                                                        )
                                                    }
                                                />

                                                <span className="custom-checkbox">
                                                    {form.benefits[key] && (
                                                        <Check size={14} />
                                                    )}
                                                </span>

                                                <span>{label}</span>
                                            </label>
                                        ))}

                                    </div>

                                    <div className="form-grid benefit-number-grid">

                                        <div className="form-group">
                                            <label>
                                                Birthday Special Points
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                value={
                                                    form.benefits
                                                        .birthdaySpecialPoints
                                                }
                                                onChange={(e) =>
                                                    handleBenefitChange(
                                                        "birthdaySpecialPoints",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                Anniversary Bonus
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                value={
                                                    form.benefits
                                                        .anniversaryBonus
                                                }
                                                onChange={(e) =>
                                                    handleBenefitChange(
                                                        "anniversaryBonus",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                    </div>
                                </div>

                                {/* QUALIFICATION RULES */}

                                <div className="form-section">
                                    <h3>Qualification Rules</h3>

                                    <div className="form-grid">

                                        <div className="form-group">
                                            <label>
                                                Minimum Annual Purchase
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                value={
                                                    form.qualificationRules
                                                        .minAnnualPurchase
                                                }
                                                onChange={(e) =>
                                                    handleRuleChange(
                                                        "minAnnualPurchase",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Other Conditions
                                        </label>

                                        <textarea
                                            rows="3"
                                            value={
                                                form.qualificationRules
                                                    .otherConditions
                                            }
                                            onChange={(e) =>
                                                handleRuleChange(
                                                    "otherConditions",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter any additional qualification conditions..."
                                        />
                                    </div>
                                </div>

                            </div>

                            <div className="modal-lt-footer">

                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <RefreshCw
                                                size={16}
                                                className="loading-icon"
                                            />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={17} />
                                            {editingTier
                                                ? "Update Tier"
                                                : "Create Tier"}
                                        </>
                                    )}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}

            {/* =================================================
          VIEW MODAL
      ================================================= */}

            {showViewModal && viewingTier && (
                <div
                    className="loyalty-modal-overlay"
                    onClick={() =>
                        setShowViewModal(false)
                    }
                >

                    <div
                        className="loyalty-modal view-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="modal-header">

                            <div>
                                <h2>
                                    {viewingTier.tierName}
                                </h2>

                                <p>
                                    Loyalty tier details
                                </p>
                            </div>

                        </div>

                        <div className="modal-body">

                            <div className="view-summary-grid">

                                <div>
                                    <span>Level</span>
                                    <strong>
                                        {viewingTier.level}
                                    </strong>
                                </div>

                                <div>
                                    <span>Tier Type</span>
                                    <strong>
                                        {viewingTier.tierType}
                                    </strong>
                                </div>

                                <div>
                                    <span>Status</span>
                                    <strong>
                                        {viewingTier.status}
                                    </strong>
                                </div>

                                <div>
                                    <span>Reward Multiplier</span>
                                    <strong>
                                        {viewingTier.rewardPointsMultiplier}x
                                    </strong>
                                </div>

                                <div>
                                    <span>Cashback</span>
                                    <strong>
                                        {viewingTier.cashbackPercentage}%
                                    </strong>
                                </div>

                                <div>
                                    <span>Minimum Purchase</span>
                                    <strong>
                                        ₹
                                        {Number(
                                            viewingTier.minPurchase || 0
                                        ).toLocaleString("en-IN")}
                                    </strong>
                                </div>

                            </div>

                            <div className="view-section">
                                <h3>Applicable To</h3>

                                <div className="customer-tags large">
                                    {(viewingTier.applicableTo || []).map(
                                        (type) => (
                                            <span key={type}>
                                                {type}
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>

                            <div className="view-section">
                                <h3>Benefits</h3>

                                <div className="view-benefits-grid">

                                    {[
                                        [
                                            "higherRewardPoints",
                                            "Higher Reward Points",
                                        ],
                                        [
                                            "exclusiveSchemes",
                                            "Exclusive Schemes",
                                        ],
                                        [
                                            "cashbackOffers",
                                            "Cashback Offers",
                                        ],
                                        [
                                            "earlyProductLaunchAccess",
                                            "Early Product Launch Access",
                                        ],
                                        [
                                            "premiumSupport",
                                            "Premium Support",
                                        ],
                                    ].map(([key, label]) => (
                                        <div
                                            className={`view-benefit ${viewingTier.benefits?.[
                                                key
                                            ]
                                                ? "enabled"
                                                : "disabled"
                                                }`}
                                            key={key}
                                        >
                                            {viewingTier.benefits?.[
                                                key
                                            ] ? (
                                                <Check size={16} />
                                            ) : (
                                                <X size={16} />
                                            )}

                                            <span>{label}</span>
                                        </div>
                                    ))}

                                </div>
                            </div>

                            <div className="view-section">
                                <h3>Qualification Rules</h3>

                                <div className="qualification-box">
                                    <div>
                                        <span>
                                            Minimum Annual Purchase
                                        </span>

                                        <strong>
                                            ₹
                                            {Number(
                                                viewingTier
                                                    .qualificationRules
                                                    ?.minAnnualPurchase || 0
                                            ).toLocaleString("en-IN")}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Other Conditions
                                        </span>

                                        <strong>
                                            {viewingTier
                                                .qualificationRules
                                                ?.otherConditions ||
                                                "No additional conditions"}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            {viewingTier.description && (
                                <div className="view-section">
                                    <h3>Description</h3>
                                    <p className="view-description">
                                        {viewingTier.description}
                                    </p>
                                </div>
                            )}

                        </div>

                        <div className="modal-lt-footer">

                            <button
                                className="btn-secondary"
                                onClick={() =>
                                    setShowViewModal(false)
                                }
                            >
                                Close
                            </button>

                            <button
                                className="btn-primary"
                                onClick={() => {
                                    setShowViewModal(false);
                                    openEditModal(viewingTier);
                                }}
                            >
                                <Edit size={16} />
                                Edit Tier
                            </button>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default LoyaltyTierManagement;