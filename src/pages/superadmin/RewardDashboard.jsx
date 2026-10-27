import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    Search,
    Filter,
    Eye,
    Pencil,
    Plus,
    Wallet,
    Coins,
    Banknote,
    Gift,
    Clock,
    Hourglass,
    CalendarDays,
    X,
    Save,
    ArrowUpCircle,
    ArrowDownCircle,
    Download,
    Trash2,
    ChevronRight,
    ChevronLeft,
} from "lucide-react";

import "../../css/superadmin/rewardDashboard.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com";

const RewardDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [selectedTransactions, setSelectedTransactions] = useState([]);

    const [dashboardData, setDashboardData] = useState({
        summary: {
            totalPoints: 0,
            totalCash: 0,
            lifetimeEarnings: 0,
            redeemedAmount: 0,
            pendingRewards: 0,
            pointsIssued: 0,
            cashIssued: 0,
        },
        wallets: [],
        transactions: [],
    });

    const [search, setSearch] = useState("");
    const [userType, setUserType] = useState("All");
    const [selectedUser, setSelectedUser] = useState("All Users");
    const [territory, setTerritory] = useState("All Territories");
    const [status, setStatus] = useState("All Status");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [activeTab, setActiveTab] = useState("points");

    const [viewTransaction, setViewTransaction] = useState(null);
    const [editTransaction, setEditTransaction] = useState(null);

    const [showAddPointsModal, setShowAddPointsModal] = useState(false);
    const [showCashRewardModal, setShowCashRewardModal] = useState(false);

    const [rewardUsers, setRewardUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);

    const [addPointsUserType, setAddPointsUserType] = useState("DEALER");
    const [addCashUserType, setAddCashUserType] = useState("DEALER");

    const [currentPage, setCurrentPage] = useState(1);
    const TRANSACTIONS_PER_PAGE = 10;

    /* ========================= FETCH DASHBOARD ========================= */

    const fetchDashboard = async () => {
        try {
            setLoading(true);

            const response = await axios.get(`${API_BASE_URL}/api/rewards/dashboard`);

            if (response.data?.success) {
                setDashboardData({
                    summary: response.data.summary || {},
                    wallets: response.data.wallets || [],
                    transactions: response.data.transactions || [],
                });
            }
        } catch (error) {
            console.error("Reward dashboard error:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchRewardUsers = async () => {
        try {
            setUsersLoading(true);

            const token = localStorage.getItem("token");

            const response = await axios.get(
                `${API_BASE_URL}/api/users`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data?.success) {
                setRewardUsers(response.data.users || []);
            }
        } catch (error) {
            console.error(
                "Reward users fetch error:",
                error.response?.data || error.message
            );
        } finally {
            setUsersLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
        fetchRewardUsers();
    }, []);

    /* ========================= HELPERS ========================= */

    const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");

    const formatCurrency = (value) => `₹ ${Number(value || 0).toLocaleString("en-IN")}`;

    const formatDate = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getUserName = (transaction) =>
        transaction?.user?.name || transaction?.user?.fullName || "Unknown User";

    /* ========================= FILTER OPTIONS ========================= */

    const filterUsers = useMemo(() => {
        if (userType === "All") return rewardUsers;
        return rewardUsers.filter((user) => user.role === userType);
    }, [rewardUsers, userType]);

    /* ========================= FILTER TRANSACTIONS ========================= */

    const filteredTransactions = useMemo(() => {
        return dashboardData.transactions.filter((item) => {
            const name = getUserName(item).toLowerCase();
            const mobile = item.user?.mobile?.toLowerCase() || "";
            const email = item.user?.email?.toLowerCase() || "";
            const reference = item.reference?.toLowerCase() || "";
            const searchValue = search.toLowerCase().trim();

            const matchesSearch =
                !searchValue ||
                name.includes(searchValue) ||
                mobile.includes(searchValue) ||
                email.includes(searchValue) ||
                reference.includes(searchValue);

            const matchesUserType = userType === "All" || item.userType === userType;
            const matchesUser = selectedUser === "All Users" || item.user?._id === selectedUser;
            const matchesStatus = status === "All Status" || item.status === status;

            let matchesDate = true;

            if (fromDate) {
                matchesDate = matchesDate && new Date(item.createdAt) >= new Date(`${fromDate}T00:00:00`);
            }

            if (toDate) {
                matchesDate = matchesDate && new Date(item.createdAt) <= new Date(`${toDate}T23:59:59`);
            }

            // Territory filter — works automatically if backend provides it
            const matchesTerritory =
                territory === "All Territories" ||
                item.territory === territory ||
                item.user?.territory === territory;

            return (
                matchesSearch &&
                matchesUserType &&
                matchesUser &&
                matchesStatus &&
                matchesDate &&
                matchesTerritory
            );
        });
    }, [dashboardData.transactions, search, userType, selectedUser, status, territory, fromDate, toDate]);

    const totalPages = Math.ceil(
        filteredTransactions.length / TRANSACTIONS_PER_PAGE
    );

    const startIndex =
        (currentPage - 1) * TRANSACTIONS_PER_PAGE;

    const currentTransactions = filteredTransactions.slice(
        startIndex,
        startIndex + TRANSACTIONS_PER_PAGE
    );

    /* ========================= SELECT / RESET ========================= */

    const handleSelectTransaction = (id) => {
        setSelectedTransactions((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedTransactions.length === filteredTransactions.length) {
            setSelectedTransactions([]);
        } else {
            setSelectedTransactions(filteredTransactions.map((item) => item._id));
        }
    };

    const handleReset = () => {
        setSearch("");
        setUserType("All");
        setSelectedUser("All Users");
        setTerritory("All Territories");
        setStatus("All Status");
        setFromDate("");
        setToDate("");
    };

    /* ========================= TOP EARNERS / REDEEMERS ========================= */

    const topEarners = useMemo(() => {
        const map = {};

        dashboardData.transactions.forEach((item) => {
            if (!item.user?._id) return;

            const id = item.user._id;

            if (!map[id]) {
                map[id] = { id, name: getUserName(item), points: 0 };
            }

            if (item.rewardType === "POINTS" && item.transactionType === "ADD") {
                map[id].points += Number(item.points || 0);
            }
        });

        return Object.values(map).sort((a, b) => b.points - a.points).slice(0, 3);
    }, [dashboardData.transactions]);

    const topRedeemers = useMemo(() => {
        const map = {};

        dashboardData.transactions.forEach((item) => {
            if (!item.user?._id) return;

            const id = item.user._id;

            if (!map[id]) {
                map[id] = { id, name: getUserName(item), points: 0 };
            }

            if (item.rewardType === "POINTS" && item.transactionType === "DEDUCT") {
                map[id].points += Number(item.points || 0);
            }
        });

        return Object.values(map).sort((a, b) => b.points - a.points).slice(0, 3);
    }, [dashboardData.transactions]);

    /* ========================= SUMMARY ========================= */

    const summary = dashboardData.summary || {};

    const totalPoints = Number(summary.totalPoints || 0);
    const pointsIssued = Number(summary.pointsIssued || 0);

    const totalCash = Number(summary.totalCash || 0);
    const cashIssued = Number(summary.cashIssued || 0);

    const pointsRedeemed = Math.max(pointsIssued - totalPoints, 0);
    const cashRedeemed = Math.max(cashIssued - totalCash, 0);

    const pointsIssuedPercentage =
        pointsIssued > 0 ? Math.round((pointsIssued / (pointsIssued + pointsRedeemed)) * 100) : 0;
    const pointsRedeemedPercentage = 100 - pointsIssuedPercentage;

    const cashIssuedPercentage =
        cashIssued > 0 ? Math.round((cashIssued / (cashIssued + cashRedeemed)) * 100) : 0;
    const cashRedeemedPercentage = 100 - cashIssuedPercentage;

    /* ========================= EDIT TRANSACTION ========================= */

    const handleEditSave = async () => {
        if (!editTransaction?._id) return;

        try {
            setLoading(true);

            const payload = {
                userId:
                    editTransaction.userId ||
                    editTransaction.user?._id ||
                    undefined,

                userType: editTransaction.userType,

                points:
                    editTransaction.points !== undefined &&
                        editTransaction.points !== null &&
                        editTransaction.points !== ""
                        ? Number(editTransaction.points)
                        : 0,

                cashAmount:
                    editTransaction.cashAmount !== undefined &&
                        editTransaction.cashAmount !== null &&
                        editTransaction.cashAmount !== ""
                        ? Number(editTransaction.cashAmount)
                        : 0,

                status: editTransaction.status,
                description: editTransaction.description || "",
                reference: editTransaction.reference || "",
            };

            await axios.put(
                `${API_BASE_URL}/api/rewards/transactions/${editTransaction._id}`,
                payload
            );

            alert("Reward transaction updated successfully");

            setEditTransaction(null);

            await fetchDashboard();
        } catch (error) {
            console.error(
                "Update reward transaction error:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Failed to update reward transaction"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTransaction = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this reward transaction?"
        );

        if (!confirmDelete) return;

        try {
            setLoading(true);

            await axios.delete(
                `${API_BASE_URL}/api/rewards/transactions/${id}`
            );

            alert("Reward transaction deleted successfully");

            await fetchDashboard();
        } catch (error) {
            console.error(
                "Delete reward transaction error:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Failed to delete reward transaction"
            );
        } finally {
            setLoading(false);
        }
    };
    /* ========================= JSX ========================= */

    return (
        <div className="reward-dashboard-page">
            {/* TOP HEADER */}
            <div className="reward-page-header">
                <div>
                    <h2>Reward Management</h2>
                    <div className="reward-breadcrumb">
                        Dashboard <span>›</span> Reward Management <span>›</span> Reward Dashboard
                    </div>
                </div>

                <div className="reward-header-actions">
                    <button className="reward-action-btn green" onClick={() => setShowAddPointsModal(true)}>
                        <Plus size={15} />
                        Add Points
                    </button>

                    <button className="reward-action-btn blue" onClick={() => setShowCashRewardModal(true)}>
                        <Banknote size={15} />
                        Add Cash Reward
                    </button>

                    <button className="reward-action-btn">
                        <Download size={16} />
                        Export Report
                    </button>
                </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="reward-summary-grid">
                <div className="reward-summary-card">
                    <div className="reward-summary-icon green">
                        <Coins size={19} />
                    </div>
                    <div>
                        <span>Total Points in System</span>
                        <strong>{formatNumber(totalPoints)}</strong>
                        <small>Current Points</small>
                    </div>
                </div>

                <div className="reward-summary-card">
                    <div className="reward-summary-icon blue">
                        <Wallet size={19} />
                    </div>
                    <div>
                        <span>Total Cash in System</span>
                        <strong>{formatCurrency(totalCash)}</strong>
                        <small>Current Cash Balance</small>
                    </div>
                </div>

                <div className="reward-summary-card">
                    <div className="reward-summary-icon purple">
                        <Gift size={19} />
                    </div>
                    <div>
                        <span>Points Issued (This Month)</span>
                        <strong>{formatNumber(pointsIssued)}</strong>
                        <small>Points Added</small>
                    </div>
                </div>

                <div className="reward-summary-card">
                    <div className="reward-summary-icon orange">
                        <Banknote size={19} />
                    </div>
                    <div>
                        <span>Cash Issued (This Month)</span>
                        <strong>{formatCurrency(cashIssued)}</strong>
                        <small>Cash Added</small>
                    </div>
                </div>

                <div className="reward-summary-card">
                    <div className="reward-summary-icon red">
                        <ArrowDownCircle size={19} />
                    </div>
                    <div>
                        <span>Points Redeemed</span>
                        <strong>{formatNumber(pointsRedeemed)}</strong>
                        <small>Redeemed Points</small>
                    </div>
                </div>

                <div className="reward-summary-card">
                    <div className="reward-summary-icon cyan">
                        <Wallet size={19} />
                    </div>
                    <div>
                        <span>Cash Redeemed</span>
                        <strong>{formatCurrency(cashRedeemed)}</strong>
                        <small>Redeemed Cash</small>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="reward-main-layout">
                <div className="reward-main-content">
                    {/* FILTER */}
                    <div className="reward-filter-card">
                        <div className="reward-search-box">
                            <input
                                type="text"
                                placeholder="Search by name, mobile, email or ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Search size={15} />
                        </div>

                        <div className="reward-filter-field">
                            <label>User Type</label>
                            <select value={userType} onChange={(e) => setUserType(e.target.value)}>
                                <option value="All">All</option>
                                <option value="DEALER">Dealer</option>
                                <option value="PAINTER">Painter</option>
                            </select>
                        </div>

                        <div className="reward-filter-field">
                            <label>User</label>
                            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                                <option value="All Users">All Users</option>
                                {filterUsers.map((user) => (
                                    <option key={user._id} value={user._id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="reward-filter-field">
                            <label>Territory</label>
                            <select value={territory} onChange={(e) => setTerritory(e.target.value)}>
                                <option value="All Territories">All Territories</option>
                                {[...new Set(
                                    dashboardData.transactions
                                        .map((item) => item.territory || item.user?.territory)
                                        .filter(Boolean)
                                )].map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="reward-filter-field">
                            <label>Status</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="All Status">All Status</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>

                        <div className="reward-date-field">
                            <label>Date Range</label>
                            <div className="reward-date-inputs">
                                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                                <span>–</span>
                                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                            </div>
                        </div>

                        <button className="reward-filter-btn" onClick={fetchDashboard}>
                            <Filter size={14} />
                            Filters
                        </button>

                        <button className="reward-reset-btn" onClick={handleReset}>
                            Reset
                        </button>
                    </div>

                    {/* TABS */}
                    <div className="reward-tabs">
                        <button className={activeTab === "points" ? "active" : ""} onClick={() => setActiveTab("points")}>
                            Points Summary
                        </button>
                        <button className={activeTab === "cash" ? "active" : ""} onClick={() => setActiveTab("cash")}>
                            Cash Summary
                        </button>
                        <button
                            className={activeTab === "redemption" ? "active" : ""}
                            onClick={() => setActiveTab("redemption")}
                        >
                            Redemption Summary
                        </button>
                    </div>

                    {/* SMALL SUMMARY */}
                    <div className="reward-mini-summary">
                        <div>
                            <Coins size={18} />
                            <div>
                                <span>Available Points</span>
                                <strong>{formatNumber(totalPoints)}</strong>
                                <small>Total Unused Points</small>
                            </div>
                        </div>

                        <div>
                            <Clock size={18} />
                            <div>
                                <span>Pending Approval</span>
                                <strong>{formatNumber(summary.pendingRewards)}</strong>
                                <small>Points Awaiting Approval</small>
                            </div>
                        </div>

                        <div>
                            <Hourglass size={18} />
                            <div>
                                <span>Pending Redemption</span>
                                <strong>{formatNumber(summary.pendingRewards)}</strong>
                                <small>Redemption Requests</small>
                            </div>
                        </div>

                        <div>
                            <CalendarDays size={18} />
                            <div>
                                <span>Expired Points</span>
                                <strong>0</strong>
                                <small>Points Will Expire Soon</small>
                            </div>
                        </div>
                    </div>

                    {/* TRANSACTIONS TABLE */}
                    <div className="reward-table-card">
                        <div className="reward-section-title">
                            <h3>Recent Reward Transactions</h3>
                        </div>

                        <div className="reward-table-wrapper">
                            <table className="reward-table">
                                <thead>
                                    <tr>
                                        <th className="reward-checkbox-column">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    filteredTransactions.length > 0 &&
                                                    selectedTransactions.length === filteredTransactions.length
                                                }
                                                onChange={handleSelectAll}
                                            />
                                        </th>
                                        <th>Txn ID</th>
                                        <th>Date & Time</th>
                                        <th>User Details</th>
                                        <th>User Type</th>
                                        <th>Transaction Type</th>
                                        <th>Points</th>
                                        <th>Cash Amount (₹)</th>
                                        <th>Status</th>
                                        <th>Remarks</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="11" className="empty-cell">
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : filteredTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="11" className="empty-cell">
                                                No reward transactions found
                                            </td>
                                        </tr>
                                    ) : (
                                        currentTransactions.map((item) => (
                                            <tr key={item._id}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTransactions.includes(item._id)}
                                                        onChange={() => handleSelectTransaction(item._id)}
                                                    />
                                                </td>

                                                <td>
                                                    <strong>{item.transactionId || item.txnId || item._id?.slice(-8) || "-"}</strong>
                                                </td>

                                                <td>
                                                    <div className="date-cell">
                                                        {formatDate(item.createdAt)}
                                                        <small>
                                                            {item.createdAt
                                                                ? new Date(item.createdAt).toLocaleTimeString("en-IN", {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })
                                                                : "-"}
                                                        </small>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="user-cell">
                                                        <div className="user-avatar">
                                                            {getUserName(item).charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <strong>{getUserName(item)}</strong>
                                                            <small>{item.user?.mobile || item.user?.email || "-"}</small>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>{item.userType || "-"}</td>

                                                <td>
                                                    <span
                                                        className={`transaction-badge ${String(
                                                            item.transactionType || ""
                                                        ).toLowerCase()}`}
                                                    >
                                                        {item.transactionType || "-"}
                                                    </span>
                                                </td>

                                                <td>{item.points ? formatNumber(item.points) : "-"}</td>
                                                <td>{item.cashAmount ? formatCurrency(item.cashAmount) : "-"}</td>

                                                <td>
                                                    <span
                                                        className={`status-badge ${String(item.status || "").toLowerCase()}`}
                                                    >
                                                        {item.status || "-"}
                                                    </span>
                                                </td>

                                                <td>{item.description || "-"}</td>

                                                <td>
                                                    <div className="table-actions">
                                                        <button title="View" onClick={() => setViewTransaction(item)}>
                                                            <Eye size={17} />
                                                        </button>
                                                        <button
                                                            title="Edit"
                                                            onClick={() =>
                                                                setEditTransaction({
                                                                    ...item,
                                                                    editMode: Number(item.cashAmount || 0) > 0 ? "CASH" : "POINTS",
                                                                })
                                                            }
                                                        >
                                                            <Pencil size={17} />
                                                        </button>
                                                        <button
                                                            title="Delete"
                                                            onClick={() => handleDeleteTransaction(item._id)}
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

                        <div className="reward-table-footer">
                            <span>
                                Showing{" "}
                                {filteredTransactions.length === 0 ? 0 : startIndex + 1}{" "}
                                to{" "}
                                {Math.min(
                                    startIndex + TRANSACTIONS_PER_PAGE,
                                    filteredTransactions.length
                                )}{" "}
                                of {filteredTransactions.length} entries
                            </span>

                            <div className="reward-pagination">

                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                        setCurrentPage((prev) => Math.max(1, prev - 1))
                                    }
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
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.min(totalPages, prev + 1)
                                        )
                                    }
                                >
                                    <ChevronRight size={16} />
                                </button>

                            </div>
                        </div>
                    </div>

                    {/* BOTTOM SECTION */}
                    <div className="reward-bottom-grid">
                        {/* POINTS GRAPH */}
                        <div className="reward-chart-card">
                            <h3>Points Issued vs Redeemed (This Month)</h3>

                            <div className="chart-values">
                                <div>
                                    <strong>{formatNumber(pointsIssued)}</strong>
                                    <span>Issued</span>
                                </div>
                                <div>
                                    <strong>{formatNumber(pointsRedeemed)}</strong>
                                    <span>Redeemed</span>
                                </div>
                            </div>

                            <div className="progress-bar">
                                <div className="issued" style={{ width: `${pointsIssuedPercentage}%` }} />
                                <div className="redeemed" style={{ width: `${pointsRedeemedPercentage}%` }} />
                            </div>

                            <div className="chart-percentages">
                                <span>{pointsIssuedPercentage}%</span>
                                <span>{pointsRedeemedPercentage}%</span>
                            </div>
                        </div>

                        {/* CASH GRAPH */}
                        <div className="reward-chart-card">
                            <h3>Cash Issued vs Redeemed (This Month)</h3>

                            <div className="chart-values">
                                <div>
                                    <strong>{formatCurrency(cashIssued)}</strong>
                                    <span>Issued</span>
                                </div>
                                <div>
                                    <strong>{formatCurrency(cashRedeemed)}</strong>
                                    <span>Redeemed</span>
                                </div>
                            </div>

                            <div className="progress-bar">
                                <div className="issued" style={{ width: `${cashIssuedPercentage}%` }} />
                                <div className="redeemed" style={{ width: `${cashRedeemedPercentage}%` }} />
                            </div>

                            <div className="chart-percentages">
                                <span>{cashIssuedPercentage}%</span>
                                <span>{cashRedeemedPercentage}%</span>
                            </div>
                        </div>

                        {/* TOP EARNERS */}
                        <div className="top-users-card">
                            <div className="card-heading">
                                <h3>Top Earners (This Month)</h3>
                                <span>View All</span>
                            </div>

                            {topEarners.map((user, index) => (
                                <div className="top-user-row" key={user.id}>
                                    <b>{index + 1}</b>
                                    <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                                    <span>{user.name}</span>
                                    <strong>{formatNumber(user.points)} Points</strong>
                                </div>
                            ))}
                        </div>

                        {/* TOP REDEEMERS */}
                        <div className="top-users-card">
                            <div className="card-heading">
                                <h3>Top Redeemers</h3>
                                <span>View All</span>
                            </div>

                            {topRedeemers.map((user, index) => (
                                <div className="top-user-row" key={user.id}>
                                    <b>{index + 1}</b>
                                    <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                                    <span>{user.name}</span>
                                    <strong>{formatNumber(user.points)} Points</strong>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDEBAR */}
                <aside className="reward-right-sidebar">
                    {/* WALLET SUMMARY */}
                    <div className="reward-side-card">
                        <h3>Reward Wallet Summary</h3>

                        <div className="wallet-tabs">
                            <button className="active">Dealer</button>
                            <button>Painter</button>
                        </div>

                        <div className="wallet-counts">
                            <div>
                                <span>Total Dealers</span>
                                <strong>{dashboardData.wallets.filter((w) => w.userType === "DEALER").length}</strong>
                            </div>
                            <div>
                                <span>Total Painters</span>
                                <strong>{dashboardData.wallets.filter((w) => w.userType === "PAINTER").length}</strong>
                            </div>
                        </div>

                        <div className="wallet-balance">
                            <div>
                                <span>Points Balance</span>
                                <strong>{formatNumber(totalPoints)}</strong>
                            </div>
                            <div>
                                <span>Cash Balance</span>
                                <strong>{formatCurrency(totalCash)}</strong>
                            </div>
                        </div>

                        <button className="view-wallet-btn">View All Wallets</button>
                    </div>

                    {/* RECENT REDEMPTION */}
                    <div className="reward-side-card">
                        <div className="side-card-heading">
                            <h3>Recent Redemption Requests</h3>
                            <span>View All</span>
                        </div>

                        <div className="redemption-empty">No redemption requests</div>
                    </div>

                    {/* QUICK ACTIONS */}
                    <div className="reward-side-card">
                        <h3>Quick Actions</h3>

                        <div className="quick-actions-grid">
                            <button onClick={() => setShowAddPointsModal(true)}>
                                <Plus size={17} />
                                <span>Add Points</span>
                            </button>

                            <button onClick={() => setShowCashRewardModal(true)}>
                                <Banknote size={17} />
                                <span>Add Cash Reward</span>
                            </button>

                            <button>
                                <ArrowUpCircle size={17} />
                                <span>Approve Points</span>
                            </button>

                            <button>
                                <Wallet size={17} />
                                <span>Release Cash</span>
                            </button>

                            <button>
                                <Coins size={17} />
                                <span>Reward Ledger</span>
                            </button>

                            <button>
                                <Gift size={17} />
                                <span>Download Report</span>
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

            {/* VIEW MODAL */}
            {viewTransaction && (
                <div className="reward-modal-overlay" onClick={() => setViewTransaction(null)}>
                    <div className="reward-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Reward Transaction Details</h3>
                        </div>

                        <div className="modal-body">
                            <div className="detail-row">
                                <span>Transaction ID</span>
                                <strong>{viewTransaction._id}</strong>
                            </div>
                            <div className="detail-row">
                                <span>User</span>
                                <strong>{getUserName(viewTransaction)}</strong>
                            </div>
                            <div className="detail-row">
                                <span>User Type</span>
                                <strong>{viewTransaction.userType}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Reward Type</span>
                                <strong>{viewTransaction.rewardType}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Transaction Type</span>
                                <strong>{viewTransaction.transactionType}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Points</span>
                                <strong>{formatNumber(viewTransaction.points)}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Cash Amount</span>
                                <strong>{formatCurrency(viewTransaction.cashAmount)}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Status</span>
                                <strong>{viewTransaction.status}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Remark</span>
                                <strong>{viewTransaction.description || "-"}</strong>
                            </div>
                            <div className="reward-view-footer">
                                <button onClick={() => setViewTransaction(null)} className="view-reward-close-bottom">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {editTransaction && (
                <div
                    className="reward-modal-overlay"
                    onClick={() => setEditTransaction(null)}
                >
                    <div
                        className="reward-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3>Edit Reward Transaction</h3>

                            <button
                                type="button"
                                onClick={() => setEditTransaction(null)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="modal-body">

                            {/* USER TYPE */}
                            <div className="modal-field">
                                <label>User Type</label>

                                <select
                                    value={editTransaction.userType || ""}
                                    onChange={(e) =>
                                        setEditTransaction({
                                            ...editTransaction,
                                            userType: e.target.value,
                                            userId: ""
                                        })
                                    }
                                >
                                    <option value="">Select User Type</option>
                                    <option value="DEALER">Dealer</option>
                                    <option value="PAINTER">Painter</option>
                                </select>
                            </div>

                            {/* SELECT USER */}
                            <div className="modal-field">
                                <label>Select User</label>

                                <select
                                    value={
                                        editTransaction.user?._id ||
                                        editTransaction.userId ||
                                        ""
                                    }
                                    onChange={(e) =>
                                        setEditTransaction({
                                            ...editTransaction,
                                            userId: e.target.value
                                        })
                                    }
                                    disabled={usersLoading}
                                >
                                    <option value="">
                                        {usersLoading
                                            ? "Loading users..."
                                            : "Select User"}
                                    </option>

                                    {rewardUsers
                                        .filter(
                                            (user) =>
                                                user.role?.toUpperCase() ===
                                                editTransaction.userType?.toUpperCase()
                                        )
                                        .map((user) => (
                                            <option
                                                key={user._id}
                                                value={user._id}
                                            >
                                                {user.name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            {/* POINTS FIELD */}
                            {editTransaction.editMode === "POINTS" && (
                                <div className="modal-field">
                                    <label>Points</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editTransaction.points ?? ""}
                                        onChange={(e) =>
                                            setEditTransaction({
                                                ...editTransaction,
                                                points: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            )}

                            {/* CASH AMOUNT FIELD */}
                            {editTransaction.editMode === "CASH" && (
                                <div className="modal-field">
                                    <label>Cash Amount (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editTransaction.cashAmount ?? ""}
                                        onChange={(e) =>
                                            setEditTransaction({
                                                ...editTransaction,
                                                cashAmount: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            )}

                            {/* STATUS */}
                            <div className="modal-field">
                                <label>Status</label>

                                <select
                                    value={editTransaction.status || ""}
                                    onChange={(e) =>
                                        setEditTransaction({
                                            ...editTransaction,
                                            status: e.target.value
                                        })
                                    }
                                >
                                    <option value="">Select Status</option>

                                    <option value="COMPLETED">
                                        Completed
                                    </option>

                                    <option value="PENDING">
                                        Pending
                                    </option>

                                    <option value="APPROVED">
                                        Approved
                                    </option>

                                    <option value="REJECTED">
                                        Rejected
                                    </option>
                                </select>
                            </div>

                            {/* REMARK */}
                            <div className="modal-field">
                                <label>Remark</label>

                                <textarea
                                    value={editTransaction.description || ""}
                                    placeholder="Enter remark"
                                    onChange={(e) =>
                                        setEditTransaction({
                                            ...editTransaction,
                                            description: e.target.value
                                        })
                                    }
                                />
                            </div>

                        </div>

                        <div className="modal-footer">

                            <button
                                type="button"
                                className="modal-cancel-btn"
                                onClick={() => setEditTransaction(null)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="modal-save-btn"
                                onClick={handleEditSave}
                                disabled={loading}
                            >
                                <Save size={15} />

                                {loading
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {/* ADD POINTS MODAL */}
            {showAddPointsModal && (
                <div className="reward-modal-overlay">
                    <div className="reward-modal">
                        <div className="reward-modal-header">
                            <div>
                                <h3>Add Points</h3>
                                <p>Add reward points to Dealer or Painter wallet</p>
                            </div>
                        </div>

                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();

                                try {
                                    setLoading(true);

                                    const response = await axios.post(`${API_BASE_URL}/api/rewards/points/add`, {
                                        userId: e.target.user.value,
                                        userType: e.target.userType.value,
                                        points: Number(e.target.points.value),
                                        description: e.target.description.value,
                                        status: e.target.status.value,
                                        reference: e.target.reference.value,
                                    });

                                    if (response.data?.success) {
                                        alert("Points added successfully");
                                        setShowAddPointsModal(false);
                                        await fetchDashboard();
                                    }
                                } catch (error) {
                                    console.error("Add points error:", error.response?.data || error.message);
                                    alert(error.response?.data?.message || "Failed to add points");
                                } finally {
                                    setLoading(false);
                                }
                            }}
                        >
                            <div className="reward-form-group">
                                <label>User Type</label>

                                <select
                                    name="userType"
                                    value={addPointsUserType}
                                    onChange={(e) => {
                                        setAddPointsUserType(e.target.value);
                                    }}
                                    required
                                >
                                    <option value="DEALER">Dealer</option>
                                    <option value="PAINTER">Painter</option>
                                </select>
                            </div>

                            <div className="reward-form-group">
                                <label>Select User</label>

                                <select
                                    name="user"
                                    required
                                    disabled={usersLoading}
                                >
                                    <option value="">
                                        {usersLoading ? "Loading users..." : "Select User"}
                                    </option>

                                    {rewardUsers
                                        .filter((user) => user.role === addPointsUserType)
                                        .map((user) => (
                                            <option key={user._id} value={user._id}>
                                                {user.name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="reward-form-group">
                                <label>Points</label>
                                <input type="number" name="points" min="1" placeholder="Enter points" required />
                            </div>

                            <div className="reward-form-group">
                                <label>Remark</label>
                                <input type="text" name="description" placeholder="Enter remark" required />
                            </div>

                            <div className="reward-form-group">
                                <label>Status</label>
                                <select name="status" defaultValue="COMPLETED" required>
                                    <option value="PENDING">Pending</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="FAILED">Failed</option>
                                </select>
                            </div>



                            <div className="reward-modal-actions">
                                <button
                                    type="button"
                                    className="reward-cancel-btn"
                                    onClick={() => setShowAddPointsModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="reward-submit-btn" disabled={loading}>
                                    {loading ? "Adding..." : "Add Points"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ADD CASH REWARD MODAL */}
            {showCashRewardModal && (
                <div className="reward-modal-overlay">
                    <div className="reward-modal">
                        <div className="reward-modal-header">
                            <div>
                                <h3>Add Cash Reward</h3>
                                <p>Add cash reward to Dealer or Painter wallet</p>
                            </div>
                        </div>

                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();

                                try {
                                    setLoading(true);

                                    const response = await axios.post(`${API_BASE_URL}/api/rewards/cash/add`, {
                                        userId: e.target.user.value,
                                        userType: e.target.userType.value,
                                        cashAmount: Number(e.target.cashAmount.value),
                                        description: e.target.description.value,
                                        status: e.target.status.value,
                                        reference: e.target.reference.value,
                                    });

                                    if (response.data?.success) {
                                        alert("Cash reward added successfully");
                                        setShowCashRewardModal(false);
                                        await fetchDashboard();
                                    }
                                } catch (error) {
                                    console.error("Add cash reward error:", error.response?.data || error.message);
                                    alert(error.response?.data?.message || "Failed to add cash reward");
                                } finally {
                                    setLoading(false);
                                }
                            }}
                        >
                            <div className="reward-form-group">
                                <label>User Type</label>
                                <select
                                    name="userType"
                                    value={addCashUserType}
                                    onChange={(e) => setAddCashUserType(e.target.value)}
                                    required
                                >
                                    <option value="DEALER">Dealer</option>
                                    <option value="PAINTER">Painter</option>
                                </select>
                            </div>

                            <div className="reward-form-group">
                                <label>Select User</label>
                                <select name="user" required disabled={usersLoading}>
                                    <option value="">
                                        {usersLoading ? "Loading users..." : "Select User"}
                                    </option>
                                    {rewardUsers
                                        .filter((user) => user.role === addCashUserType)
                                        .map((user) => (
                                            <option key={user._id} value={user._id}>
                                                {user.name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="reward-form-group">
                                <label>Cash Amount (₹)</label>
                                <input type="number" name="cashAmount" min="1" placeholder="Enter cash amount" required />
                            </div>

                            <div className="reward-form-group">
                                <label>Remark</label>
                                <input type="text" name="description" placeholder="Enter remark" required />
                            </div>

                            <div className="reward-form-group">
                                <label>Status</label>
                                <select name="status" defaultValue="COMPLETED" required>
                                    <option value="PENDING">Pending</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="FAILED">Failed</option>
                                </select>
                            </div>



                            <div className="reward-modal-actions">
                                <button
                                    type="button"
                                    className="reward-cancel-btn"
                                    onClick={() => setShowCashRewardModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="reward-submit-btn" disabled={loading}>
                                    {loading ? "Adding..." : "Add Cash Reward"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RewardDashboard;