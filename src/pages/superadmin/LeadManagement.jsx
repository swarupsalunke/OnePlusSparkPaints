import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
    Search,
    SlidersHorizontal,
    RotateCcw,
    Eye,
    Pencil,
    Trash2,
    Download,
    Upload,
    Plus,
    UsersRound,
    UserPlus,
    UserCheck,
    UserRoundCheck,
    UserRoundX,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    X,
    FileText,
    UserRoundCog,
    Phone,
    Filter
} from "lucide-react";

import "../../css/superadmin/leadManagement.css";

const LeadManagement = () => {

    // STATES
    const [leads, setLeads] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [leadSource, setLeadSource] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [territory, setTerritory] = useState("");

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const leadsPerPage = 10;

    const fileInputRef = useRef(null);
    const [selectedLeads, setSelectedLeads] = useState([]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [editingLead, setEditingLead] = useState(null);

    const [formData, setFormData] = useState({
        leadName: "",
        companyName: "",
        mobile: "",
        leadSource: "Referral",
        status: "New",
        assignedTo: "",
        territory: "",
    });


    // CONSTANTS
    const leadStatuses = [
        "New",
        "Follow-up",
        "Qualified",
        "Proposal Shared",
        "Converted",
        "Lost",
    ];

    const leadSources = [
        "Referral",
        "Walk-in",
        "Website",
        "Social Media",
        "Cold Call",
        "Trade Show",
    ];


    // FETCH LEADS
    const fetchLeads = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get("https://oneplussparkpaintsserver.onrender.com/api/leads", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLeads(response.data.leads || []);
        } catch (error) {
            console.error("Fetch leads error:", error);
        } finally {
            setLoading(false);
        }
    };


    // FETCH USERS
    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("https://oneplussparkpaintsserver.onrender.com/api/users", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const userData = response.data.users || response.data.data || [];
            setUsers(userData);
        } catch (error) {
            console.error("Fetch users error:", error);
        }
    };


    // INITIAL LOAD
    useEffect(() => {
        fetchLeads();
        fetchUsers();
    }, []);


    // SALES EXECUTIVES
    const salesExecutives = useMemo(
        () => users.filter((user) => user.role === "SALES_EXECUTIVE"),
        [users]
    );


    // TERRITORIES
    const territories = useMemo(() => {
        const values = leads.map((lead) => lead.territory).filter(Boolean);
        return [...new Set(values)];
    }, [leads]);


    // FILTER LEADS
    const filteredLeads = useMemo(() => {
        return leads.filter((lead) => {
            const searchValue = search.toLowerCase().trim();

            const matchesSearch =
                !searchValue ||
                lead.leadNumber?.toLowerCase().includes(searchValue) ||
                lead.leadName?.toLowerCase().includes(searchValue) ||
                lead.companyName?.toLowerCase().includes(searchValue) ||
                lead.mobile?.toLowerCase().includes(searchValue);

            const matchesStatus = !status || lead.status === status;
            const matchesSource = !leadSource || lead.leadSource === leadSource;

            const matchesAssigned =
                !assignedTo ||
                String(lead.assignedTo?._id || lead.assignedTo) === String(assignedTo);

            const matchesTerritory = !territory || lead.territory === territory;

            const createdDate = new Date(lead.createdOn || lead.createdAt);

            const matchesStartDate =
                !startDate || createdDate >= new Date(`${startDate}T00:00:00`);

            const matchesEndDate =
                !endDate || createdDate <= new Date(`${endDate}T23:59:59`);

            return (
                matchesSearch &&
                matchesStatus &&
                matchesSource &&
                matchesAssigned &&
                matchesTerritory &&
                matchesStartDate &&
                matchesEndDate
            );
        });
    }, [leads, search, status, leadSource, assignedTo, territory, startDate, endDate]);


    // PAGINATION
    const totalPages = Math.max(1, Math.ceil(filteredLeads.length / leadsPerPage));
    const startIndex = (currentPage - 1) * leadsPerPage;
    const currentLeads = filteredLeads.slice(startIndex, startIndex + leadsPerPage);

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [currentPage, totalPages]);


    // STATS
    const totalLeads = leads.length;
    const newLeads = leads.filter((lead) => lead.status === "New").length;
    const qualifiedLeads = leads.filter((lead) => lead.status === "Qualified").length;
    const convertedLeads = leads.filter((lead) => lead.status === "Converted").length;
    const lostLeads = leads.filter((lead) => lead.status === "Lost").length;


    // PIPELINE DATA

    const pipelineData = leadStatuses.map((item) => ({
        label: item,
        count: leads.filter((lead) => lead.status === item).length,
    }));


    // LEAD SOURCE DATA
    const sourceData = leadSources.map((source) => ({
        label: source,
        count: leads.filter((lead) => lead.leadSource === source).length,
    }));


    // TOP PERFORMERS //
    const topPerformers = useMemo(() => {
        const performanceMap = {};

        leads.forEach((lead) => {
            const id = lead.assignedTo?._id || lead.assignedTo;
            if (!id) return;

            if (!performanceMap[id]) {
                performanceMap[id] = {
                    id,
                    name: lead.assignedTo?.name || "Sales Executive",
                    converted: 0,
                    total: 0,
                };
            }

            performanceMap[id].total += 1;
            if (lead.status === "Converted") performanceMap[id].converted += 1;
        });

        return Object.values(performanceMap)
            .sort((a, b) => b.converted - a.converted)
            .slice(0, 3);
    }, [leads]);


    // STATUS / SOURCE CLASS
    const getStatusClass = (value) => {
        switch (value) {
            case "New":
                return "lead-status new";
            case "Follow-up":
                return "lead-status follow-up";
            case "Qualified":
                return "lead-status qualified";
            case "Proposal Shared":
                return "lead-status proposal";
            case "Converted":
                return "lead-status converted";
            case "Lost":
                return "lead-status lost";
            default:
                return "lead-status";
        }
    };

    const getSourceClass = (value) => {
        switch (value) {
            case "Referral":
                return "lead-source referral";
            case "Walk-in":
                return "lead-source walkin";
            case "Website":
                return "lead-source website";
            case "Social Media":
                return "lead-source social";
            case "Cold Call":
                return "lead-source cold";
            case "Trade Show":
                return "lead-source trade";
            default:
                return "lead-source";
        }
    };


    // RESET FILTERS  //
    const handleReset = () => {
        setSearch("");
        setStatus("");
        setLeadSource("");
        setAssignedTo("");
        setTerritory("");
        setStartDate("");
        setEndDate("");
        setCurrentPage(1);
        setSelectedLeads([]);
    };

    // SELECT ALL / SELECT SINGLE  //
    const allCurrentSelected =
        currentLeads.length > 0 &&
        currentLeads.every((lead) => selectedLeads.includes(lead._id));

    const handleSelectAll = (checked) => {
        if (checked) {
            const ids = currentLeads.map((lead) => lead._id);
            setSelectedLeads((prev) => [...new Set([...prev, ...ids])]);
        } else {
            const currentIds = currentLeads.map((lead) => lead._id);
            setSelectedLeads((prev) => prev.filter((id) => !currentIds.includes(id)));
        }
    };

    const handleSelectLead = (id, checked) => {
        if (checked) {
            setSelectedLeads((prev) => [...prev, id]);
        } else {
            setSelectedLeads((prev) => prev.filter((item) => item !== id));
        }
    };


    // DELETE LEAD  //
    const handleDelete = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this lead?");
        if (!confirmed) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`https://oneplussparkpaintsserver.onrender.com/api/leads/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Lead deleted successfully");
            fetchLeads();
        } catch (error) {
            console.error("Delete lead error:", error);
            alert(error.response?.data?.message || "Failed to delete lead");
        }
    };


    // ADD / EDIT MODAL  //
    const openAddModal = () => {
        setEditingLead(null);
        setFormData({
            leadName: "",
            companyName: "",
            mobile: "",
            leadSource: "Referral",
            status: "New",
            assignedTo: "",
            territory: "",
        });
        setShowAddModal(true);
    };

    const openEditModal = (lead) => {
        setEditingLead(lead);
        setFormData({
            leadName: lead.leadName || "",
            companyName: lead.companyName || "",
            mobile: lead.mobile || "",
            leadSource: lead.leadSource || "Referral",
            status: lead.status || "New",
            assignedTo: lead.assignedTo?._id || lead.assignedTo || "",
            territory: lead.territory || "",
        });
        setShowAddModal(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // CREATE / UPDATE LEAD //
    const handleSubmitLead = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            if (editingLead) {
                await axios.put(
                    `https://oneplussparkpaintsserver.onrender.com/api/leads/${editingLead._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                alert("Lead updated successfully");
            } else {
                await axios.post("https://oneplussparkpaintsserver.onrender.com/api/leads", formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert("Lead created successfully");
            }

            setShowAddModal(false);
            setEditingLead(null);
            fetchLeads();
        } catch (error) {
            console.error("Save lead error:", error);
            alert(error.response?.data?.message || "Failed to save lead");
        }
    };

    // VIEW LEAD  //
    const handleViewLead = (lead) => {
        setSelectedLead(lead);
        setShowViewModal(true);
    };


    // EXPORT CSV

    const handleExport = () => {
        if (!filteredLeads.length) {
            alert("No leads available to export");
            return;
        }

        const headers = [
            "Lead ID",
            "Lead Name",
            "Company",
            "Mobile",
            "Lead Source",
            "Status",
            "Assigned To",
            "Territory",
            "Created On",
        ];

        const rows = filteredLeads.map((lead) => [
            lead.leadNumber || "",
            lead.leadName || "",
            lead.companyName || "",
            lead.mobile || "",
            lead.leadSource || "",
            lead.status || "",
            lead.assignedTo?.name || getSalesExecutiveName(lead.assignedTo),
            lead.territory || "",
            formatDate(lead.createdOn || lead.createdAt),
        ]);

        const csv = [headers, ...rows]
            .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
            .join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "lead-management.csv";
        link.click();

        URL.revokeObjectURL(url);
    };


    // IMPORT //

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        alert(`${file.name} selected. Import processing can be connected to the backend later.`);
        e.target.value = "";
    };


    // HELPERS //
    const getSalesExecutiveName = (assigned) => {
        if (assigned && typeof assigned === "object") {
            return assigned.name || "N/A";
        }

        const user = users.find((item) => String(item._id) === String(assigned));
        return user?.name || "N/A";
    };

    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatCreatedDateTime = (date) => {
        if (!date) return { date: "N/A", time: "" };

        const value = new Date(date);

        return {
            date: value.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }),
            time: value.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };
    };


    // RENDER

    return (
        <div className="lead-management-page">
            {/* PAGE HEADER */}
            <div className="lead-management-header">
                <div>
                    <h1>Lead Management</h1>
                    <p>
                        Dashboard
                        <span>›</span>
                        Lead Management
                        <span>›</span>
                        All Leads
                    </p>
                </div>

                <div className="lead-header-actions">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        hidden
                        onChange={handleFileImport}
                    />

                    <button type="button" className="lead-secondary-btn" onClick={handleImportClick}>
                        <Upload size={16} />
                        Import Leads
                    </button>

                    <button type="button" className="lead-secondary-btn" onClick={handleExport}>
                        <Download size={16} />
                        Export
                    </button>

                    <button type="button" className="lead-primary-btn" onClick={openAddModal}>
                        <Plus size={17} />
                        Add Lead
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="lead-dashboard-content">
                <div className="lead-main-content">
                    {/* STATS */}
                    <div className="lead-stats-grid">
                        <div className="lead-stat-card">
                            <div className="lead-stat-icon blue">
                                <UsersRound size={20} />
                            </div>
                            <div>
                                <span>Total Leads</span>
                                <strong>{totalLeads.toLocaleString("en-IN")}</strong>
                                <small className="positive">↑ 18.6% vs last month</small>
                            </div>
                        </div>

                        <div className="lead-stat-card">
                            <div className="lead-stat-icon green">
                                <UserPlus size={20} />
                            </div>
                            <div>
                                <span>New Leads</span>
                                <strong>{newLeads.toLocaleString("en-IN")}</strong>
                                <small className="positive">↑ 12.4% vs last month</small>
                            </div>
                        </div>

                        <div className="lead-stat-card">
                            <div className="lead-stat-icon orange">
                                <UserCheck size={20} />
                            </div>
                            <div>
                                <span>Qualified Leads</span>
                                <strong>{qualifiedLeads.toLocaleString("en-IN")}</strong>
                                <small className="positive">↑ 8.3% vs last month</small>
                            </div>
                        </div>

                        <div className="lead-stat-card">
                            <div className="lead-stat-icon purple">
                                <UserRoundCheck size={20} />
                            </div>
                            <div>
                                <span>Converted Leads</span>
                                <strong>{convertedLeads.toLocaleString("en-IN")}</strong>
                                <small className="positive">↑ 15.7% vs last month</small>
                            </div>
                        </div>

                        <div className="lead-stat-card">
                            <div className="lead-stat-icon red">
                                <UserRoundX size={20} />
                            </div>
                            <div>
                                <span>Lost Leads</span>
                                <strong>{lostLeads.toLocaleString("en-IN")}</strong>
                                <small className="negative">↓ 6.2% vs last month</small>
                            </div>
                        </div>
                    </div>

                    {/* SEARCH + FILTERS */}
                    <div className="lead-filter-card">
                        <div className="lead-search-box">

                            <input
                                type="text"
                                placeholder="Search leads..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                            <Search size={17} />
                        </div>

                        <div className="lead-filter-field">
                            <label>Lead Status</label>
                            <select
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">All Status</option>
                                {leadStatuses.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="lead-filter-field">
                            <label>Lead Source</label>
                            <select
                                value={leadSource}
                                onChange={(e) => {
                                    setLeadSource(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">All Sources</option>
                                {leadSources.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="lead-filter-field">
                            <label>Assigned To</label>
                            <select
                                value={assignedTo}
                                onChange={(e) => {
                                    setAssignedTo(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">All Executives</option>
                                {salesExecutives.map((user) => (
                                    <option key={user._id} value={user._id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="lead-filter-field">
                            <label>Territory</label>
                            <select
                                value={territory}
                                onChange={(e) => {
                                    setTerritory(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">All Territories</option>
                                {territories.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="lead-date-field">
                            <label>Date Range</label>
                            <div className="lead-date-inputs">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                                <span>-</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => {
                                        setEndDate(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </div>

                        <button type="button" className="lead-filter-btn">
                            <Filter size={16} />
                            Filter
                        </button>

                        <button type="button" className="lead-reset-btn" onClick={handleReset}>

                            Reset
                        </button>
                    </div>

                    {/* PIPELINE OVERVIEW */}
                    <div className="lead-pipeline-overview">
                        <div className="section-title">Lead Pipeline Overview</div>

                        <div className="pipeline-flow">
                            {pipelineData.map((item, index) => (
                                <div className="pipeline-flow-item" key={item.label}>
                                    <div className="pipeline-icon">
                                        {index === 0 && <UserPlus size={18} />}
                                        {index === 1 && <RotateCcw size={18} />}
                                        {index === 2 && <UserCheck size={18} />}
                                        {index === 3 && <FileText size={18} />}
                                        {index === 4 && <UserRoundCheck size={18} />}
                                        {index === 5 && <UserRoundX size={18} />}
                                    </div>

                                    <div className="pipeline-info">
                                        <strong>{item.count}</strong>
                                        <span>{item.label}</span>
                                    </div>

                                    {index < pipelineData.length - 1 && (
                                        <ArrowRight className="pipeline-arrow" size={19} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="lead-table-card">
                        <div className="lead-table-wrapper">
                            <table className="lead-table">
                                <thead>
                                    <tr>
                                        <th className="checkbox-column">
                                            <input
                                                type="checkbox"
                                                checked={allCurrentSelected}
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                            />
                                        </th>
                                        <th>Lead ID</th>
                                        <th>Lead Name</th>
                                        <th>Company / Shop</th>
                                        <th>Mobile</th>
                                        <th>Lead Source</th>
                                        <th>Status</th>
                                        <th>Assigned To</th>
                                        <th>Territory</th>
                                        <th>Created On</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="11" className="lead-empty">
                                                Loading leads...
                                            </td>
                                        </tr>
                                    ) : currentLeads.length === 0 ? (
                                        <tr>
                                            <td colSpan="11" className="lead-empty">
                                                No leads found
                                            </td>
                                        </tr>
                                    ) : (
                                        currentLeads.map((lead) => {
                                            const created = formatCreatedDateTime(lead.createdOn || lead.createdAt);
                                            const executiveName =
                                                lead.assignedTo?.name || getSalesExecutiveName(lead.assignedTo);

                                            return (
                                                <tr key={lead._id}>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedLeads.includes(lead._id)}
                                                            onChange={(e) => handleSelectLead(lead._id, e.target.checked)}
                                                        />
                                                    </td>

                                                    <td>
                                                        <strong className="lead-number">{lead.leadNumber}</strong>
                                                    </td>

                                                    <td>
                                                        <div className="lead-name-cell">
                                                            <span className="lead-avatar">
                                                                {lead.leadName?.charAt(0)?.toUpperCase() || "L"}
                                                            </span>
                                                            <strong>{lead.leadName}</strong>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <div className="lead-company-cell">
                                                            <strong>{lead.companyName || "N/A"}</strong>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span className="lead-mobile">{lead.mobile || "N/A"}</span>
                                                    </td>

                                                    <td>
                                                        <span className={getSourceClass(lead.leadSource)}>
                                                            {lead.leadSource}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span className={getStatusClass(lead.status)}>{lead.status}</span>
                                                    </td>

                                                    <td>
                                                        <div className="assigned-user-cell">
                                                            <span className="assigned-avatar">
                                                                {executiveName?.charAt(0)?.toUpperCase() || "S"}
                                                            </span>
                                                            <span>{executiveName}</span>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span>{lead.territory || "N/A"}</span>
                                                    </td>

                                                    <td>
                                                        <div className="created-date-cell">
                                                            <strong>{created.date}</strong>
                                                            <span>{created.time}</span>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <div className="lead-actions">
                                                            <button
                                                                type="button"
                                                                className="lead-action"
                                                                title="View Lead"
                                                                onClick={() => handleViewLead(lead)}
                                                            >
                                                                <Eye size={17} />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="lead-action"
                                                                title="Edit Lead"
                                                                onClick={() => openEditModal(lead)}
                                                            >
                                                                <Pencil size={17} />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="lead-action delete"
                                                                title="Delete Lead"
                                                                onClick={() => handleDelete(lead._id)}
                                                            >
                                                                <Trash2 size={17} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* TABLE FOOTER */}
                        <div className="lead-table-footer">
                            <span>
                                Showing {filteredLeads.length === 0 ? 0 : startIndex + 1} to{" "}
                                {Math.min(startIndex + leadsPerPage, filteredLeads.length)} of{" "}
                                {filteredLeads.length} entries
                            </span>

                            <div className="lead-pagination">
                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                {Array.from({ length: Math.min(totalPages, 3) }, (_, index) => {
                                    const page = index + 1;
                                    return (
                                        <button
                                            type="button"
                                            key={page}
                                            className={currentPage === page ? "active" : ""}
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}

                                {totalPages > 3 && <span>...</span>}

                                <button
                                    type="button"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDEBAR */}
                <aside className="lead-right-sidebar">
                    {/* LEAD PIPELINE */}
                    <div className="lead-side-card">
                        <div className="side-card-title">Lead Pipeline</div>

                        <div className="lead-funnel-chart">
                            {pipelineData.map((item, index) => (
                                <div key={item.label} className={`funnel-level funnel-${index + 1}`}>
                                    {item.count}
                                </div>
                            ))}
                        </div>

                        <div className="funnel-legend">
                            {pipelineData.map((item, index) => (
                                <div key={item.label}>
                                    <span className={`legend-dot legend-${index + 1}`} />
                                    <span>{item.label}</span>
                                    <strong>{item.count}</strong>
                                </div>
                            ))}
                        </div>

                        <div className="funnel-total">
                            <span>Total Leads</span>
                            <strong>{totalLeads}</strong>
                        </div>
                    </div>

                    {/* LEAD SOURCE */}
                    <div className="lead-side-card">
                        <div className="side-card-title">Lead Source</div>

                        <div className="source-chart-area">
                            <div
                                className="lead-donut"
                                style={{ background: createDonutGradient(sourceData) }}
                            >
                                <div className="donut-center">
                                    <strong>{totalLeads}</strong>
                                    <span>Total Leads</span>
                                </div>
                            </div>

                            <div className="source-legend">
                                {sourceData.map((item, index) => (
                                    <div key={item.label}>
                                        <span className={`legend-dot source-dot-${index + 1}`} />
                                        <span>{item.label}</span>
                                        <strong>{item.count}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* QUICK ACTIONS */}
                    <div className="lead-side-card">
                        <div className="side-card-title">Quick Actions</div>

                        <div className="quick-actions-grid">
                            <button type="button" onClick={openAddModal}>
                                <UserPlus size={16} />
                                Add Lead
                            </button>

                            <button type="button" onClick={handleImportClick}>
                                <Upload size={16} />
                                Import Leads
                            </button>

                            <button type="button">
                                <UserRoundCog size={16} />
                                Lead Assignment
                            </button>

                            <button type="button">
                                <Phone size={16} />
                                Follow-up
                            </button>

                            <button type="button">
                                <UserRoundCheck size={16} />
                                Lead Conversion
                            </button>

                            <button type="button" onClick={handleExport}>
                                <FileText size={16} />
                                Lead Report
                            </button>
                        </div>
                    </div>

                    {/* TOP PERFORMERS */}
                    <div className="lead-side-card">
                        <div className="side-card-heading-row">
                            <div className="side-card-title">Top Performers (This Month)</div>
                            <button type="button" className="view-all-btn">
                                View All
                            </button>
                        </div>

                        <div className="top-performers-list">
                            {topPerformers.length === 0 ? (
                                <div className="no-performers">No performance data</div>
                            ) : (
                                topPerformers.map((performer) => (
                                    <div className="performer-item" key={performer.id}>
                                        <span className="performer-avatar">
                                            {performer.name?.charAt(0)?.toUpperCase() || "S"}
                                        </span>
                                        <div>
                                            <strong>{performer.name}</strong>
                                            <span>Converted {performer.converted} Leads</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </aside>
            </div>

            {/* ADD / EDIT LEAD MODAL */}
            {showAddModal && (
                <div className="lead-modal-overlay">
                    <div className="lead-modal">
                        <div className="lead-modal-header">
                            <div>
                                <h2>{editingLead ? "Edit Lead" : "Add New Lead"}</h2>
                                <p>{editingLead ? "Update lead information." : ""}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitLead}>
                            <div className="lead-form-grid">
                                <div className="lead-form-group">
                                    <label>Lead Name</label>
                                    <input
                                        type="text"
                                        name="leadName"
                                        placeholder="Enter lead name"
                                        value={formData.leadName}
                                        onChange={(e) => /^[A-Za-z\s]*$/.test(e.target.value) && handleFormChange(e)}
                                        required
                                    />
                                </div>

                                <div className="lead-form-group">
                                    <label>Company / Shop</label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        placeholder="Enter company or shop"
                                        value={formData.companyName}
                                        onChange={handleFormChange}
                                    />
                                </div>

                                <div className="lead-form-group">
                                    <label>Mobile</label>
                                    <input
                                        type="tel"
                                        name="mobile"
                                        placeholder="Enter mobile number"
                                        value={formData.mobile}
                                        onChange={(e) => /^\d{0,10}$/.test(e.target.value) && handleFormChange(e)}
                                        required
                                    />
                                </div>

                                <div className="lead-form-group">
                                    <label>Lead Source</label>
                                    <select name="leadSource" value={formData.leadSource} onChange={handleFormChange}>
                                        {leadSources.map((source) => (
                                            <option key={source} value={source}>
                                                {source}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="lead-form-group">
                                    <label>Status</label>
                                    <select name="status" value={formData.status} onChange={handleFormChange}>
                                        {leadStatuses.map((item) => (
                                            <option key={item} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="lead-form-group">
                                    <label>Assigned To</label>
                                    <select name="assignedTo" value={formData.assignedTo} onChange={handleFormChange}>
                                        <option value="">Select Sales Executive</option>
                                        {salesExecutives.map((user) => (
                                            <option key={user._id} value={user._id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="lead-form-group">
                                    <label>Territory</label>
                                    <input
                                        type="text"
                                        name="territory"
                                        placeholder="Enter territory"
                                        value={formData.territory}
                                        onChange={handleFormChange}
                                    />
                                </div>
                            </div>

                            <div className="lead-modal-footer">
                                <button
                                    type="button"
                                    className="lead-cancel-btn"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Cancel
                                </button>

                                <button type="submit" className="lead-save-btn">
                                    {editingLead ? "Update Lead" : "Create Lead"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* VIEW LEAD MODAL */}
            {showViewModal && selectedLead && (
                <div className="lead-modal-overlay">
                    <div className="lead-view-modal">
                        <div className="lead-modal-header">
                            <div>
                                <h2>Lead Details</h2>
                                <p>{selectedLead.leadNumber}</p>
                            </div>
                        </div>

                        <div className="lead-view-content">
                            <div className="lead-view-item">
                                <span>Lead Name</span>
                                <strong>{selectedLead.leadName}</strong>
                            </div>

                            <div className="lead-view-item">
                                <span>Company / Shop</span>
                                <strong>{selectedLead.companyName || "N/A"}</strong>
                            </div>

                            <div className="lead-view-item">
                                <span>Mobile</span>
                                <strong>{selectedLead.mobile || "N/A"}</strong>
                            </div>

                            <div className="lead-view-item">
                                <span>Lead Source</span>
                                <span className={getSourceClass(selectedLead.leadSource)}>
                                    {selectedLead.leadSource}
                                </span>
                            </div>

                            <div className="lead-view-item">
                                <span>Status</span>
                                <span className={getStatusClass(selectedLead.status)}>
                                    {selectedLead.status}
                                </span>
                            </div>

                            <div className="lead-view-item">
                                <span>Assigned To</span>
                                <strong>
                                    {selectedLead.assignedTo?.name ||
                                        getSalesExecutiveName(selectedLead.assignedTo)}
                                </strong>
                            </div>

                            <div className="lead-view-item">
                                <span>Territory</span>
                                <strong>{selectedLead.territory || "N/A"}</strong>
                            </div>

                            <div className="lead-view-item">
                                <span>Created On</span>
                                <strong>{formatDate(selectedLead.createdOn || selectedLead.createdAt)}</strong>
                            </div>
                        </div>

                        <div className="lead-modal-footer">
                            <button
                                type="button"
                                className="lead-close-btn"
                                onClick={() => setShowViewModal(false)}
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

//      DONUT GRADIENT   //     
const createDonutGradient = (sourceData) => {
    const total = sourceData.reduce((sum, item) => sum + item.count, 0);

    if (!total) {
        return "conic-gradient(#e8edf3 0deg 360deg)";
    }

    const colors = ["#4b9ce8", "#22b573", "#8b5cf6", "#f59e0b", "#ef4444", "#94a3b8"];

    let current = 0;

    const segments = sourceData.map((item, index) => {
        const degree = (item.count / total) * 360;
        const start = current;
        current += degree;
        return `${colors[index]} ${start}deg ${current}deg`;
    });

    return `conic-gradient(${segments.join(", ")})`;
};

export default LeadManagement;