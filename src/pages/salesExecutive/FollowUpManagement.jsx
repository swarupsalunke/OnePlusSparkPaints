import React, { useEffect, useMemo, useState } from "react";
import {
    Search,
    Plus,
    CalendarDays,
    Clock,
    Users,
    UserRound,
    Phone,
    ClipboardList,
    CheckCircle2,
    RotateCcw,
    Pencil,
    Trash2,
    X,
    MessageSquare,
    Filter,
    CalendarClock,
} from "lucide-react";

import "../../css/salesExecutive/FollowUpManagement.css";
const API_URL = `${import.meta.env.VITE_API_BASE_URL || "https://oneplussparkpaintsserver.onrender.com"}/api/sales-executive/follow-ups`;

const initialForm = {
    customerType: "Dealer",
    customerName: "",
    phone: "",
    reason: "Order",
    followUpDate: "",
    followUpTime: "",
    notes: "",
    status: "Pending",
    nextFollowUpDate: "",
};

const FollowUpManagement = () => {
    const [followUps, setFollowUps] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");
    const [dateFilter, setDateFilter] = useState("All");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(initialForm);
    const [formError, setFormError] = useState("");
    const [selectedFollowUp, setSelectedFollowUp] = useState(null);

    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState("");
    const [saving, setSaving] = useState(false);

    const today = new Date().toLocaleDateString("en-CA");

    const stats = useMemo(() => {
        const todayItems = followUps.filter(
            (item) => item.followUpDate === today
        );

        return [
            {
                label: "Today's Follow-ups",
                value: todayItems.filter((item) => item.status !== "Completed").length,
                icon: CalendarDays,
                color: "orange",
            },
            {
                label: "Pending",
                value: followUps.filter((item) => item.status === "Pending").length,
                icon: Clock,
                color: "blue",
            },
            {
                label: "Completed",
                value: followUps.filter((item) => item.status === "Completed").length,
                icon: CheckCircle2,
                color: "green",
            },
            {
                label: "Overdue",
                value: followUps.filter(
                    (item) =>
                        item.followUpDate < today && item.status !== "Completed"
                ).length,
                icon: CalendarClock,
                color: "red",
            },
        ];
    }, [followUps, today]);

    const filteredFollowUps = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return followUps
            .filter((item) => {
                const matchesSearch =
                    !query ||
                    item.customerName.toLowerCase().includes(query) ||
                    item.phone.includes(query) ||
                    item.reason.toLowerCase().includes(query);

                const matchesStatus =
                    statusFilter === "All" || item.status === statusFilter;

                const matchesType =
                    typeFilter === "All" || item.customerType === typeFilter;

                const isOverdue =
                    item.followUpDate < today && item.status !== "Completed";

                const matchesDate =
                    dateFilter === "All" ||
                    (dateFilter === "Today" &&
                        item.followUpDate === today &&
                        item.status !== "Completed") ||
                    (dateFilter === "Upcoming" &&
                        item.followUpDate > today &&
                        item.status !== "Completed") ||
                    (dateFilter === "Overdue" && isOverdue);

                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesType &&
                    matchesDate
                );
            })
            .sort((a, b) => {
                if (a.status === "Completed" && b.status !== "Completed") return 1;
                if (b.status === "Completed" && a.status !== "Completed") return -1;
                return a.followUpDate.localeCompare(b.followUpDate);
            });
    }, [
        followUps,
        searchTerm,
        statusFilter,
        typeFilter,
        dateFilter,
        today,
    ]);

    const openCreateForm = () => {
        setEditingId(null);
        setFormData(initialForm);
        setFormError("");
        setShowForm(true);
    };

    const openEditForm = (item) => {
        setEditingId(item._id);
        setFormData({
            customerType: item.customerType,
            customerName: item.customerName,
            phone: item.phone,
            reason: item.reason,
            followUpDate: item.followUpDate,
            followUpTime: item.followUpTime,
            notes: item.notes,
            status: item.status,
            nextFollowUpDate: item.nextFollowUpDate || "",
        });
        setFormError("");
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData(initialForm);
        setFormError("");
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({ ...previous, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError("");

        if (!formData.customerName.trim()) {
            setFormError("Please enter the customer name.");
            return;
        }

        if (!formData.followUpDate || !formData.followUpTime) {
            setFormError("Please select the follow-up date and time.");
            return;
        }

        if (formData.status === "Rescheduled" && !formData.nextFollowUpDate) {
            setFormError("Please select the next follow-up date.");
            return;
        }

        if (
            formData.nextFollowUpDate &&
            formData.nextFollowUpDate < formData.followUpDate
        ) {
            setFormError("Next follow-up date cannot be earlier than the current follow-up date.");
            return;
        }

        try {
            setSaving(true);

            const response = await fetch(
                editingId ? `${API_URL}/${editingId}` : API_URL,
                {
                    method: editingId ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...formData,
                        customerName: formData.customerName.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to save follow-up");
            }

            await fetchFollowUps();
            closeForm();
        } catch (error) {
            setFormError(error.message || "Unable to save follow-up");
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (item, status) => {
        try {
            const response = await fetch(`${API_URL}/${item._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status,
                    nextFollowUpDate: status === "Rescheduled" ? item.nextFollowUpDate : "",
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update status");
            }

            await fetchFollowUps();

            if (selectedFollowUp?._id === item._id) {
                setSelectedFollowUp(data.followUp);
            }
        } catch (error) {
            setApiError(error.message || "Unable to update status");
        }
    };

    const deleteFollowUp = async (id) => {
        if (!window.confirm("Are you sure you want to delete this follow-up?")) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete follow-up");
            }

            setFollowUps((previous) => previous.filter((item) => item._id !== id));

            if (selectedFollowUp?._id === id) {
                setSelectedFollowUp(null);
            }
        } catch (error) {
            setApiError(error.message || "Unable to delete follow-up");
        }
    };

    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (time) => {
        if (!time) return "—";

        const [hours, minutes] = time.split(":");
        const date = new Date();
        date.setHours(Number(hours), Number(minutes), 0, 0);

        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const fetchFollowUps = async () => {
        try {
            setApiError("");
            const response = await fetch(API_URL);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch follow-ups");
            }

            setFollowUps(data.followUps || []);
        } catch (error) {
            setApiError(error.message || "Unable to load follow-ups");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFollowUps();
    }, []);

    const getStatusClass = (status) => status.toLowerCase().replace(/\s+/g, "-");

    return (
        <div className="followup-page">
            <div className="followup-header">
                <div>
                    <h1>Follow-up Management</h1>
                    <p>
                        Schedule customer interactions and keep track of pending follow-ups.
                    </p>
                </div>

                <button
                    type="button"
                    className="followup-primary-btn"
                    onClick={openCreateForm}
                >
                    <Plus size={18} />
                    Add Follow-up
                </button>
            </div>

            <div className="followup-stats-grid">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <article
                            className={`followup-stat-card ${stat.color}`}
                            key={stat.label}
                        >
                            <div className="followup-stat-top">
                                <div className="followup-icon-box">
                                    <Icon size={21} />
                                </div>
                            </div>
                            <p>{stat.label}</p>
                            <h2>{stat.value}</h2>
                        </article>
                    );
                })}
            </div>


            <section className="followup-content-card">
                <div className="followup-section-header">
                    <div>
                        <h2>Follow-up Records</h2>
                        <p>View and manage your customer follow-up activities.</p>
                    </div>
                    <span className="followup-record-count">
                        {filteredFollowUps.length} records
                    </span>
                </div>

                <div className="followup-toolbar">
                    <div className="followup-search">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search customer, phone or reason..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                    </div>

                    <div className="followup-filter">
                        <Filter size={16} />
                        <select
                            aria-label="Filter by status"
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Rescheduled">Rescheduled</option>
                        </select>
                    </div>

                    <select
                        className="followup-select-filter"
                        aria-label="Filter by customer type"
                        value={typeFilter}
                        onChange={(event) => setTypeFilter(event.target.value)}
                    >
                        <option value="All">All Customers</option>
                        <option value="Dealer">Dealer</option>
                        <option value="Painter">Painter</option>
                        <option value="Lead">Lead</option>
                    </select>

                    <select
                        className="followup-select-filter"
                        aria-label="Filter by date"
                        value={dateFilter}
                        onChange={(event) => setDateFilter(event.target.value)}
                    >
                        <option value="All">All Dates</option>
                        <option value="Today">Today</option>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                </div>

                {apiError && (
                    <p className="followup-form-error" role="alert">
                        {apiError}
                    </p>
                )}

                {loading ? (
                    <div className="followup-empty-state">
                        <p>Loading follow-ups...</p>
                    </div>
                ) : filteredFollowUps.length === 0 ? (
                    <div className="followup-empty-state">
                        <div className="followup-empty-icon">
                            <CalendarClock size={30} />
                        </div>

                        <h3>
                            {apiError
                                ? "Unable to load follow-ups"
                                : "No follow-ups found"}
                        </h3>

                        <p>
                            {apiError
                                ? "Check your backend server and API configuration, then refresh the page."
                                : followUps.length === 0
                                    ? "Create your first follow-up to start tracking customer interactions."
                                    : "No records match your current search or filters."}
                        </p>

                        {!apiError && followUps.length === 0 && (
                            <button
                                type="button"
                                className="followup-primary-btn"
                                onClick={openCreateForm}
                            >
                                <Plus size={17} />
                                Create Follow-up
                            </button>
                        )}

                        {apiError && (
                            <button
                                type="button"
                                className="followup-primary-btn"
                                onClick={fetchFollowUps}
                            >
                                <RotateCcw size={17} />
                                Retry
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="followup-table-wrapper">
                        <table className="followup-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Reason</th>
                                    <th>Follow-up Date</th>
                                    <th>Status</th>
                                    <th>Next Follow-up</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredFollowUps.map((item) => (
                                    <tr key={item._id}>
                                        <td>
                                            <div className="followup-customer-cell">
                                                <div className="followup-avatar">
                                                    {item.customerType === "Dealer" ? (
                                                        <Users size={18} />
                                                    ) : item.customerType === "Painter" ? (
                                                        <UserRound size={18} />
                                                    ) : (
                                                        <ClipboardList size={18} />
                                                    )}
                                                </div>

                                                <div>
                                                    <strong>{item.customerName}</strong>
                                                    <span>{item.customerType}</span>

                                                    {item.phone && (
                                                        <small>
                                                            <Phone size={12} />
                                                            {item.phone}
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td>{item.reason}</td>

                                        <td>
                                            <div className="followup-date-cell">
                                                <strong>
                                                    {formatDate(item.followUpDate)}
                                                </strong>
                                                <span>
                                                    <Clock size={12} />
                                                    {formatTime(item.followUpTime)}
                                                </span>
                                            </div>
                                        </td>

                                        <td>
                                            <span
                                                className={`followup-status ${getStatusClass(item.status)}`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>

                                        <td>{formatDate(item.nextFollowUpDate)}</td>

                                        <td>
                                            <div className="followup-actions">
                                                <button
                                                    type="button"
                                                    title="View details"
                                                    aria-label="View follow-up details"
                                                    onClick={() => setSelectedFollowUp(item)}
                                                >
                                                    <MessageSquare size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    title="Edit follow-up"
                                                    aria-label="Edit follow-up"
                                                    onClick={() => openEditForm(item)}
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                {item.status !== "Completed" && (
                                                    <button
                                                        type="button"
                                                        title="Mark completed"
                                                        aria-label="Mark completed"
                                                        onClick={() =>
                                                            updateStatus(item, "Completed")
                                                        }
                                                    >
                                                        <CheckCircle2 size={16} />
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    className="delete"
                                                    title="Delete follow-up"
                                                    aria-label="Delete follow-up"
                                                    onClick={() => deleteFollowUp(item._id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>


            {showForm && (
                <div
                    className="followup-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeForm();
                    }}
                >
                    <section
                        className="followup-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="followup-modal-title"
                    >
                        <div className="followup-modal-header">
                            <div>
                                <h2 id="followup-modal-title">
                                    {editingId ? "Edit Follow-up" : "Add Follow-up"}
                                </h2>
                                <p>Enter the customer and scheduling details below.</p>
                            </div>
                            <button
                                type="button"
                                className="followup-modal-close"
                                onClick={closeForm}
                                aria-label="Close form"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="followup-form-grid">
                                <label>
                                    Customer Type <span>*</span>
                                    <select
                                        name="customerType"
                                        value={formData.customerType}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="Dealer">Dealer</option>
                                        <option value="Painter">Painter</option>
                                        <option value="Lead">Lead</option>
                                    </select>
                                </label>

                                <label>
                                    Customer Name <span>*</span>
                                    <input
                                        name="customerName"
                                        value={formData.customerName}
                                        onChange={handleInputChange}
                                        placeholder="Enter customer name"
                                        required
                                    />
                                </label>

                                <label>
                                    Contact Number
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="Enter phone number"
                                        maxLength={15}
                                    />
                                </label>

                                <label>
                                    Follow-up Reason <span>*</span>
                                    <select
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="Order">Order</option>
                                        <option value="Payment">Payment</option>
                                        <option value="Product">Product</option>
                                        <option value="Registration">Registration</option>
                                        <option value="Complaint">Complaint</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </label>

                                <label>
                                    Follow-up Date <span>*</span>
                                    <input
                                        type="date"
                                        name="followUpDate"
                                        value={formData.followUpDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </label>

                                <label>
                                    Follow-up Time <span>*</span>
                                    <input
                                        type="time"
                                        name="followUpTime"
                                        value={formData.followUpTime}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </label>

                                <label>
                                    Status
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Rescheduled">Rescheduled</option>
                                    </select>
                                </label>

                                <label>
                                    Next Follow-up Date
                                    <input
                                        type="date"
                                        name="nextFollowUpDate"
                                        value={formData.nextFollowUpDate}
                                        onChange={handleInputChange}
                                        min={formData.followUpDate || undefined}
                                    />
                                </label>

                                <label className="followup-full-width">
                                    Notes / Previous Interaction
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        placeholder="Enter discussion notes, customer response or next action..."
                                        rows={4}
                                    />
                                </label>
                            </div>

                            {formError && (
                                <p className="followup-form-error" role="alert">
                                    {formError}
                                </p>
                            )}

                            <div className="followup-form-actions">
                                <button
                                    type="button"
                                    className="followup-cancel-btn"
                                    onClick={closeForm}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="followup-primary-btn">
                                    {editingId ? "Save Changes" : "Create Follow-up"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            {selectedFollowUp && (
                <div
                    className="followup-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedFollowUp(null);
                        }
                    }}
                >
                    <section
                        className="followup-modal followup-details-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="followup-details-title"
                    >
                        <div className="followup-modal-header">
                            <div>
                                <h2 id="followup-details-title">Follow-up Details</h2>
                                <p>Customer interaction information</p>
                            </div>
                            <button
                                type="button"
                                className="followup-modal-close"
                                onClick={() => setSelectedFollowUp(null)}
                                aria-label="Close details"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="followup-details-grid">
                            <div>
                                <span>Customer Name</span>
                                <strong>{selectedFollowUp.customerName}</strong>
                            </div>
                            <div>
                                <span>Customer Type</span>
                                <strong>{selectedFollowUp.customerType}</strong>
                            </div>
                            <div>
                                <span>Contact Number</span>
                                <strong>{selectedFollowUp.phone || "—"}</strong>
                            </div>
                            <div>
                                <span>Reason</span>
                                <strong>{selectedFollowUp.reason}</strong>
                            </div>
                            <div>
                                <span>Follow-up Date</span>
                                <strong>{formatDate(selectedFollowUp.followUpDate)}</strong>
                            </div>
                            <div>
                                <span>Follow-up Time</span>
                                <strong>{formatTime(selectedFollowUp.followUpTime)}</strong>
                            </div>
                            <div>
                                <span>Status</span>
                                <strong>{selectedFollowUp.status}</strong>
                            </div>
                            <div>
                                <span>Next Follow-up</span>
                                <strong>{formatDate(selectedFollowUp.nextFollowUpDate)}</strong>
                            </div>
                            <div className="followup-details-notes">
                                <span>Notes / Previous Interaction</span>
                                <p>{selectedFollowUp.notes || "No notes added."}</p>
                            </div>
                        </div>

                        <div className="followup-form-actions">
                            <button
                                type="button"
                                className="followup-cancel-btn"
                                onClick={() => setSelectedFollowUp(null)}
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                className="followup-primary-btn"
                                onClick={() => {
                                    const item = selectedFollowUp;
                                    setSelectedFollowUp(null);
                                    openEditForm(item);
                                }}
                            >
                                <Pencil size={16} />
                                Edit Follow-up
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

export default FollowUpManagement;
