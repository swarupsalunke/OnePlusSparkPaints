import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  Search,
  Filter,
  RotateCcw,
  Plus,
  Download,
  Upload,
  Eye,
  Pencil,
  MoreVertical,
  Users,
  CalendarDays,
  Gift,
  XCircle,
  Clock3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  BarChart3,
  Import,
  Trash2,
  X,
} from "lucide-react";

import "../../css/superadmin/schemeManagement.css";

const API_URL = "https://oneplussparkpaintsserver.onrender.com/api/schemes";
const SERVER_URL = "https://oneplussparkpaintsserver.onrender.com";

const getFileUrl = (filePath) => {
  if (!filePath) return "";

  if (
    filePath.startsWith("http://") ||
    filePath.startsWith("https://")
  ) {
    return filePath;
  }

  return `${SERVER_URL}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
};


const FALLBACK_SCHEMES = [
  { _id: "f1", schemeId: "SCHM-2026-0024", schemeName: "Summer Bonanza 2026", description: "Big savings this summer", schemeType: "CASHBACK", applicableTo: "DEALERS", startDate: "2026-05-25", endDate: "2026-06-30", status: "ACTIVE", createdAt: "2026-05-20" },
  { _id: "f2", schemeId: "SCHM-2026-0023", schemeName: "Painter Power Reward", description: "Extra rewards for painters", schemeType: "REWARD", applicableTo: "PAINTERS", startDate: "2026-05-20", endDate: "2026-06-20", status: "ACTIVE", createdAt: "2026-05-18" },
  { _id: "f3", schemeId: "SCHM-2026-0022", schemeName: "Monsoon Special Offer", description: "Special discounts on select products", schemeType: "DISCOUNT", applicableTo: "BOTH", startDate: "2026-07-01", endDate: "2026-07-31", status: "UPCOMING", createdAt: "2026-05-15" },
  { _id: "f4", schemeId: "SCHM-2026-0021", schemeName: "Bulk Purchase Offer", description: "More quantity, more benefits", schemeType: "CASHBACK", applicableTo: "DEALERS", startDate: "2026-06-10", endDate: "2026-07-10", status: "ACTIVE", createdAt: "2026-05-10" },
  { _id: "f5", schemeId: "SCHM-2026-0020", schemeName: "Loyalty Booster Scheme", description: "Earn more on every purchase", schemeType: "REWARD", applicableTo: "BOTH", startDate: "2026-04-15", endDate: "2026-05-15", status: "EXPIRED", createdAt: "2026-04-01" },
  { _id: "f6", schemeId: "SCHM-2026-0019", schemeName: "New Product Launch", description: "Introductory offer on new range", schemeType: "DISCOUNT", applicableTo: "DEALERS", startDate: "2026-04-01", endDate: "2026-04-30", status: "ACTIVE", createdAt: "2026-03-28" },
  { _id: "f7", schemeId: "SCHM-2026-0018", schemeName: "Referral Bonus Scheme", description: "Refer & get exciting rewards", schemeType: "REWARD", applicableTo: "PAINTERS", startDate: "2026-05-05", endDate: "2026-06-05", status: "ACTIVE", createdAt: "2026-04-30" },
  { _id: "f8", schemeId: "SCHM-2026-0017", schemeName: "Festive Dhamaka", description: "Celebrate with mega discounts", schemeType: "DISCOUNT", applicableTo: "BOTH", startDate: "2026-10-01", endDate: "2026-10-31", status: "UPCOMING", createdAt: "2026-04-20" },
  { _id: "f9", schemeId: "SCHM-2026-0016", schemeName: "Scheme Draft 01", description: "Draft scheme", schemeType: "DISCOUNT", applicableTo: "DEALERS", startDate: "", endDate: "", status: "DRAFT", createdAt: "2026-04-18" },
  { _id: "f10", schemeId: "SCHM-2026-0015", schemeName: "End of Season Clearance", description: "Clearance sale on select items", schemeType: "DISCOUNT", applicableTo: "DEALERS", startDate: "2026-03-01", endDate: "2026-03-31", status: "EXPIRED", createdAt: "2026-02-25" },
];


const SchemeForm = ({ formData, onChange, onSubmit, onCancel, saving, submitText }) => (
  <form className="scheme-form" onSubmit={onSubmit}>
    <div className="scheme-form-grid">
      <div className="form-groupp">
        <label>Scheme Name *</label>
        <input
          type="text"
          name="schemeName"
          value={formData.schemeName}
          onChange={onChange}
          placeholder="Enter scheme name"
          required
        />
      </div>

      <div className="form-groupp">
        <label>Scheme Type *</label>

        <select
          name="schemeType"
          value={formData.schemeType}
          onChange={onChange}
          required
        >
          <option value="CASHBACK">Cashback Offer</option>
          <option value="REWARD">Reward Offer</option>
          <option value="DISCOUNT">Discount Offer</option>
        </select>
      </div>

      <div className="form-groupp full-width">
        <label>Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onChange}
          placeholder="Enter scheme description"
          rows="3"
          required
        />
      </div>

      <div className="form-groupp">
        <label>Applicable To *</label>
        <select
          name="applicableTo"
          value={formData.applicableTo}
          onChange={onChange}
          required
        >
          <option value="DEALERS">Dealers</option>
          <option value="PAINTERS">Painters</option>
          <option value="BOTH">Dealers & Painters</option>
        </select>
      </div>

      <div className="form-groupp">
        <label>Start Date *</label>
        <input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={onChange}
          required
        />
      </div>

      <div className="form-groupp">
        <label>End Date *</label>
        <input
          type="date"
          name="endDate"
          value={formData.endDate}
          min={formData.startDate || undefined}
          onChange={onChange}
          required
        />
      </div>

      <div className="form-groupp">
        <label>Banner</label>
        <div className="file-input-wrapper">
          <ImageIcon size={17} />
          <input
            type="file"
            name="banner"
            accept="image/*"
            onChange={onChange}
          />
        </div>
      </div>

      <div className="form-groupp">
        <label>PDF</label>
        <div className="file-input-wrapper">
          <FileText size={17} />
          <input
            type="file"
            name="pdf"
            accept=".pdf,application/pdf"
            onChange={onChange}
          />
        </div>
      </div>

      <div className="form-groupp full-width">
        <label>Terms & Conditions *</label>
        <textarea
          name="termsAndConditions"
          value={formData.termsAndConditions}
          onChange={onChange}
          placeholder="Enter terms and conditions"
          rows="4"
          required
        />
      </div>
    </div>

    <div className="scheme-modal-footer">
      <button type="button" className="scheme-cancel-btn" onClick={onCancel}>
        Cancel
      </button>

      <button type="submit" className="scheme-submit-btn" disabled={saving}>
        {saving ? "Saving..." : submitText}
      </button>
    </div>
  </form>
);

const SchemeManagement = () => {
  /* =========================     DATA  ========================= */

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  /* =========================     FILTERS  ========================= */

  const [searchInput, setSearchInput] = useState("");
  const [schemeTypeInput, setSchemeTypeInput] = useState("");
  const [applicableToInput, setApplicableToInput] = useState("");
  const [statusInput, setStatusInput] = useState("");
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");

  /* =========================     PAGINATION  ========================= */

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  /* =========================     CHECKBOX  ========================= */

  const [selectedSchemes, setSelectedSchemes] = useState([]);

  /* =========================     MODALS  ========================= */

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedScheme, setSelectedScheme] = useState(null);

  /* =========================     MORE MENU  ========================= */

  const [openMenu, setOpenMenu] = useState(null);

  /* =========================     FORM  ========================= */

  const initialForm = {
    schemeName: "",
    description: "",
    schemeType: "CASHBACK",
    applicableTo: "DEALERS",
    startDate: "",
    endDate: "",
    termsAndConditions: "",
    banner: null,
    pdf: null,
    existingBanner: null,
    existingPdf: null,
  };

  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  /* =========================     GET ALL SCHEMES  ========================= */

  const fetchSchemes = async () => {
    try {
      setLoading(true);

      const response = await axios.get(API_URL);

      if (response.data?.success) {
        setSchemes(response.data.schemes || []);
        setUsingFallback(false);
      }
    } catch (error) {
      console.error("Fetch schemes error:", error);

      setSchemes(FALLBACK_SCHEMES);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  useEffect(() => {
    const closeMenu = () => setOpenMenu(null);
    if (openMenu) {
      document.addEventListener("click", closeMenu);
    }
    return () => document.removeEventListener("click", closeMenu);
  }, [openMenu]);


  const filters = useMemo(
    () => ({
      search: searchInput,
      schemeType: schemeTypeInput,
      applicableTo: applicableToInput,
      status: statusInput,
      startDate: startDateInput,
      endDate: endDateInput,
    }),
    [
      searchInput,
      schemeTypeInput,
      applicableToInput,
      statusInput,
      startDateInput,
      endDateInput,
    ]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const applyFilters = () => {
    setCurrentPage(1);
    setOpenMenu(null);
  };

  const resetFilters = () => {
    setSearchInput("");
    setSchemeTypeInput("");
    setApplicableToInput("");
    setStatusInput("");
    setStartDateInput("");
    setEndDateInput("");
    setCurrentPage(1);
  };

  const filteredSchemes = useMemo(() => {
    return schemes.filter((scheme) => {
      const search = filters.search.toLowerCase().trim();

      const matchesSearch =
        !search ||
        scheme.schemeId?.toLowerCase().includes(search) ||
        scheme.schemeName?.toLowerCase().includes(search) ||
        scheme.description?.toLowerCase().includes(search) ||
        scheme.schemeType?.toLowerCase().includes(search);

      const matchesType =
        !filters.schemeType || scheme.schemeType === filters.schemeType;

      const matchesApplicable =
        !filters.applicableTo ||
        scheme.applicableTo === filters.applicableTo;

      const matchesStatus =
        !filters.status || scheme.status === filters.status;

      const schemeStart = scheme.startDate ? new Date(scheme.startDate) : null;
      const schemeEnd = scheme.endDate ? new Date(scheme.endDate) : null;

      const filterStart = filters.startDate ? new Date(filters.startDate) : null;
      const filterEnd = filters.endDate ? new Date(filters.endDate) : null;

      const matchesStart =
        !filterStart || (schemeStart && schemeStart >= filterStart);

      const matchesEnd =
        !filterEnd || (schemeEnd && schemeEnd <= filterEnd);

      return (
        matchesSearch &&
        matchesType &&
        matchesApplicable &&
        matchesStatus &&
        matchesStart &&
        matchesEnd
      );
    });
  }, [schemes, filters]);

  /* =========================     PAGINATED DATA  ========================= */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSchemes.length / itemsPerPage)
  );

  const paginatedSchemes = filteredSchemes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pageNumbers = useMemo(() => {
    const maxButtons = 5;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);

    const pages = [];
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }, [currentPage, totalPages]);

  /* =========================     STATS  ========================= */

  const totalSchemes = schemes.length;
  const activeSchemes = schemes.filter((item) => item.status === "ACTIVE").length;
  const upcomingSchemes = schemes.filter((item) => item.status === "UPCOMING").length;
  const expiredSchemes = schemes.filter((item) => item.status === "EXPIRED").length;
  const draftSchemes = schemes.filter((item) => item.status === "DRAFT").length;

  /* =========================     SELECT CHECKBOX  ========================= */

  const handleSelectScheme = (id) => {
    setSelectedSchemes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (
      paginatedSchemes.length > 0 &&
      paginatedSchemes.every((item) => selectedSchemes.includes(item._id))
    ) {
      setSelectedSchemes((prev) =>
        prev.filter((id) => !paginatedSchemes.some((item) => item._id === id))
      );
    } else {
      setSelectedSchemes((prev) => [
        ...new Set([...prev, ...paginatedSchemes.map((item) => item._id)]),
      ]);
    }
  };

  /* =========================     FORM HANDLERS  ========================= */

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const resetForm = () => {
    setFormData(initialForm);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedScheme(null);
    resetForm();
  };

  /* =========================     ADD SCHEME  ========================= */

  const handleAddScheme = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const hasFile = formData.banner || formData.pdf;
      let response;

      if (hasFile) {
        const data = new FormData();
        data.append("schemeName", formData.schemeName);
        data.append("description", formData.description);
        data.append("schemeType", formData.schemeType);
        data.append("applicableTo", formData.applicableTo);
        data.append("startDate", formData.startDate);
        data.append("endDate", formData.endDate);
        data.append("termsAndConditions", formData.termsAndConditions);

        if (formData.banner) data.append("banner", formData.banner);
        if (formData.pdf) data.append("pdf", formData.pdf);

        response = await axios.post(API_URL, data);
      } else {
        response = await axios.post(API_URL, {
          schemeName: formData.schemeName,
          description: formData.description,
          schemeType: formData.schemeType,
          applicableTo: formData.applicableTo,
          startDate: formData.startDate,
          endDate: formData.endDate,
          termsAndConditions: formData.termsAndConditions,
        });
      }

      if (response.data?.success) {
        setShowAddModal(false);
        resetForm();
        await fetchSchemes();
        return;
      }

      throw new Error("Unexpected response from server");
    } catch (error) {
      console.error("Add scheme error:", error);

      if (usingFallback) {
        const newScheme = {
          _id: `local-${Date.now()}`,
          schemeId: `SCHM-2026-${String(schemes.length + 1).padStart(4, "0")}`,
          schemeName: formData.schemeName,
          description: formData.description,
          schemeType: formData.schemeType,
          applicableTo: formData.applicableTo,
          startDate: formData.startDate,
          endDate: formData.endDate,
          termsAndConditions: formData.termsAndConditions,
          banner: null,
          pdf: null,
          status: "DRAFT",
          createdAt: new Date().toISOString(),
        };
        setSchemes((prev) => [newScheme, ...prev]);
        setShowAddModal(false);
        resetForm();
      } else {
        alert(error.response?.data?.message || "Failed to create scheme");
      }
    } finally {
      setSaving(false);
    }
  };

  /* =========================     VIEW SCHEME  ========================= */

  const handleView = (scheme) => {
    setSelectedScheme(scheme);
    setShowViewModal(true);
    setOpenMenu(null);
  };

  /* =========================     EDIT SCHEME  ========================= */

  const handleEdit = (scheme) => {
    setSelectedScheme(scheme);

    setFormData({
      schemeName: scheme.schemeName || "",
      description: scheme.description || "",
      schemeType: scheme.schemeType || "CASHBACK",
      applicableTo: scheme.applicableTo || "DEALERS",
      startDate: scheme.startDate ? scheme.startDate.substring(0, 10) : "",
      endDate: scheme.endDate ? scheme.endDate.substring(0, 10) : "",
      termsAndConditions: scheme.termsAndConditions || "",
      banner: null,
      pdf: null,
      existingBanner: scheme.banner || null,
      existingPdf: scheme.pdf || null,
    });

    setShowEditModal(true);
    setOpenMenu(null);
  };

  /* =========================     UPDATE SCHEME  ========================= */

  const handleUpdateScheme = async (e) => {
    e.preventDefault();

    if (!selectedScheme?._id) return;

    try {
      setSaving(true);

      const hasNewFile = formData.banner || formData.pdf;
      let response;

      if (hasNewFile) {
        const data = new FormData();
        data.append("schemeName", formData.schemeName);
        data.append("description", formData.description);
        data.append("schemeType", formData.schemeType);
        data.append("applicableTo", formData.applicableTo);
        data.append("startDate", formData.startDate);
        data.append("endDate", formData.endDate);
        data.append("termsAndConditions", formData.termsAndConditions);

        if (formData.banner) data.append("banner", formData.banner);
        if (formData.pdf) data.append("pdf", formData.pdf);

        response = await axios.put(`${API_URL}/${selectedScheme._id}`, data);
      } else {
        response = await axios.put(`${API_URL}/${selectedScheme._id}`, {
          schemeName: formData.schemeName,
          description: formData.description,
          schemeType: formData.schemeType,
          applicableTo: formData.applicableTo,
          startDate: formData.startDate,
          endDate: formData.endDate,
          termsAndConditions: formData.termsAndConditions,
          existingBanner: formData.existingBanner,
          existingPdf: formData.existingPdf,
        });
      }

      if (response.data?.success) {
        setShowEditModal(false);
        setSelectedScheme(null);
        resetForm();
        await fetchSchemes();
        return;
      }

      throw new Error("Unexpected response from server");
    } catch (error) {
      console.error("Update scheme error:", error);

      if (usingFallback) {
        setSchemes((prev) =>
          prev.map((item) =>
            item._id === selectedScheme._id
              ? {
                  ...item,
                  schemeName: formData.schemeName,
                  description: formData.description,
                  schemeType: formData.schemeType,
                  applicableTo: formData.applicableTo,
                  startDate: formData.startDate,
                  endDate: formData.endDate,
                  termsAndConditions: formData.termsAndConditions,
                  banner: formData.existingBanner || item.banner,
                  pdf: formData.existingPdf || item.pdf,
                }
              : item
          )
        );
        setShowEditModal(false);
        setSelectedScheme(null);
        resetForm();
      } else {
        alert(error.response?.data?.message || "Failed to update scheme");
      }
    } finally {
      setSaving(false);
    }
  };

  /* =========================     DELETE  ========================= */

  const handleDelete = async (scheme) => {
    setOpenMenu(null);

    const confirmDelete = window.confirm(`Delete "${scheme.schemeName}"?`);
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`${API_URL}/${scheme._id}`);

      if (response.data?.success) {
        setSelectedSchemes((prev) => prev.filter((id) => id !== scheme._id));
        await fetchSchemes();
        return;
      }

      throw new Error("Unexpected response from server");
    } catch (error) {
      console.error("Delete scheme error:", error);

      if (usingFallback) {
        setSchemes((prev) => prev.filter((item) => item._id !== scheme._id));
        setSelectedSchemes((prev) => prev.filter((id) => id !== scheme._id));
      } else {
        alert(error.response?.data?.message || "Failed to delete scheme");
      }
    }
  };

  /* =========================     EXPORT  ========================= */

  const handleExport = () => {
    if (!filteredSchemes.length) {
      alert("No schemes available to export.");
      return;
    }

    const headers = [
      "Scheme ID",
      "Scheme Name",
      "Scheme Type",
      "Applicable To",
      "Start Date",
      "End Date",
      "Status",
    ];

    const rows = filteredSchemes.map((scheme) => [
      scheme.schemeId || "",
      scheme.schemeName || "",
      scheme.schemeType || "",
      scheme.applicableTo || "",
      formatDate(scheme.startDate),
      formatDate(scheme.endDate),
      scheme.status || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "schemes.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  /* =========================     IMPORT  ========================= */

  const handleImport = () => {
    document.getElementById("schemeImportInput")?.click();
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    alert(
      `Selected file: ${file.name}\nImport API is not part of the current backend requirement.`
    );

    e.target.value = "";
  };

  /* =========================     QUICK ACTIONS  ========================= */

  const goToTable = () => {
    document
      .querySelector(".scheme-table-card")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleQuickApproval = () => {
    resetFilters();
    setStatusInput("DRAFT");
    goToTable();
  };

  const handleQuickExpired = () => {
    resetFilters();
    setStatusInput("EXPIRED");
    goToTable();
  };

  const handleQuickPerformance = () => {
    document
      .querySelector(".performance-card")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* =========================     HELPERS  ========================= */

  function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getStatusClass(status) {
    return `scheme-status ${status?.toLowerCase() || ""}`;
  }

  function getSchemeTypeClass(type) {
    return `scheme-type ${type?.toLowerCase() || ""}`;
  }

  function getApplicableClass(type) {
    return `applicable-type ${type?.toLowerCase() || ""}`;
  }

  function getSchemeTypeLabel(type) {
    const labels = {
      CASHBACK: "Cashback Offer",
      REWARD: "Reward Offer",
      DISCOUNT: "Discount Offer",
      PROMOTIONAL: "Promotional",
      SEASONAL: "Seasonal",
    };
    return labels[type] || type;
  }

  const performanceTotal = totalSchemes || 1;

  const performanceData = [
    {
      label: "Active",
      key: "active",
      value: activeSchemes,
      percentage: Math.round((activeSchemes / performanceTotal) * 100),
    },
    {
      label: "Upcoming",
      key: "upcoming",
      value: upcomingSchemes,
      percentage: Math.round((upcomingSchemes / performanceTotal) * 100),
    },
    {
      label: "Expired",
      key: "expired",
      value: expiredSchemes,
      percentage: Math.round((expiredSchemes / performanceTotal) * 100),
    },
    {
      label: "Draft",
      key: "draft",
      value: draftSchemes,
      percentage: Math.round((draftSchemes / performanceTotal) * 100),
    },
  ];

  const donutColors = {
    active: "#16a34a",
    upcoming: "#2563eb",
    expired: "#64748b",
    draft: "#f59e0b",
  };

  let acc = 0;
  const donutStops = performanceData
    .map((item) => {
      const from = acc;
      acc += item.percentage;
      return `${donutColors[item.key]} ${from}% ${acc}%`;
    })
    .join(", ");

  const recentSchemes = [...schemes]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 3);

  return (
    <div className="scheme-management-page">
      {/* PAGE HEADER */}
      <div className="scheme-page-header">
        <div>
          <h1>Scheme Management</h1>
          <div className="scheme-breadcrumb">
            Dashboard
            <span>›</span>
            Scheme Management
            <span>›</span>
            All Schemes
          </div>
        </div>

        <div className="scheme-header-actions">
          <button
            className="scheme-primary-btn"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            <Plus size={17} />
            Add New Scheme
          </button>

          <button className="scheme-secondary-btn" onClick={handleExport}>
            <Download size={16} />
            Export
          </button>

          <button className="scheme-secondary-btn" onClick={handleImport}>
            <Upload size={16} />
            Import
          </button>

          <input
            id="schemeImportInput"
            type="file"
            accept=".csv,.xlsx,.xls"
            hidden
            onChange={handleImportFile}
          />
        </div>
      </div>

      {usingFallback && (
        <div className="scheme-fallback-banner">
          Showing sample data — could not reach the schemes API at{" "}
          <code>{API_URL}</code>. Connect the backend to see live data.
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="scheme-summary-grid">
        <div className="scheme-summary-card">
          <div className="summary-icon blue">
            <Users size={21} />
          </div>
          <div>
            <span>Total Schemes</span>
            <strong>{totalSchemes}</strong>
            <small>All Time</small>
          </div>
        </div>

        <div className="scheme-summary-card">
          <div className="summary-icon green">
            <CalendarDays size={21} />
          </div>
          <div>
            <span>Active Schemes</span>
            <strong>{activeSchemes}</strong>
            <small>Currently Running</small>
          </div>
        </div>

        <div className="scheme-summary-card">
          <div className="summary-icon purple">
            <Users size={21} />
          </div>
          <div>
            <span>Upcoming Schemes</span>
            <strong>{upcomingSchemes}</strong>
            <small>Yet to Start</small>
          </div>
        </div>

        <div className="scheme-summary-card">
          <div className="summary-icon orange">
            <Gift size={21} />
          </div>
          <div>
            <span>Expired Schemes</span>
            <strong>{expiredSchemes}</strong>
            <small>Already Ended</small>
          </div>
        </div>

        <div className="scheme-summary-card">
          <div className="summary-icon red">
            <XCircle size={21} />
          </div>
          <div>
            <span>Draft Schemes</span>
            <strong>{draftSchemes}</strong>
            <small>Not Published</small>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="scheme-content-layout">
        <div className="scheme-main-content">
          {/* FILTERS */}
          <div className="scheme-filter-box">
            <div className="scheme-search-box">

              <input
                type="text"
                placeholder="Search by scheme name, type, user, status..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyFilters();
                }}
              />
              <Search size={17} />
              {searchInput && (
                <button
                  type="button"
                  className="scheme-search-clear"
                  onClick={() => setSearchInput("")}
                  aria-label="Clear search"
                >
                </button>
              )}
            </div>

            <select
              value={schemeTypeInput}
              onChange={(e) => setSchemeTypeInput(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="CASHBACK">Cashback Offer</option>
              <option value="REWARD">Reward Scheme</option>
              <option value="DISCOUNT">Discount Offer</option>
              <option value="PROMOTIONAL">Promotional</option>
              <option value="SEASONAL">Seasonal</option>
            </select>

            <select
              value={applicableToInput}
              onChange={(e) => setApplicableToInput(e.target.value)}
            >
              <option value="">All Users</option>
              <option value="DEALERS">Dealers</option>
              <option value="PAINTERS">Painters</option>
              <option value="BOTH">Dealers, Painters</option>
            </select>

            <select
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="EXPIRED">Expired</option>
              <option value="DRAFT">Draft</option>
            </select>

            <div className="scheme-date-filter">
              <input
                type="date"
                value={startDateInput}
                onChange={(e) => setStartDateInput(e.target.value)}
              />
              <span>-</span>
              <input
                type="date"
                value={endDateInput}
                onChange={(e) => setEndDateInput(e.target.value)}
              />
            </div>

            <button className="scheme-filter-btn" onClick={applyFilters}>
              <Filter size={16} />
              Filters
            </button>

            <button className="scheme-reset-btn" onClick={resetFilters}>

              Reset
            </button>
          </div>

          {/* TABLE */}
          <div className="scheme-table-card">
            <div className="scheme-table-wrapper">
              <table className="scheme-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={
                          paginatedSchemes.length > 0 &&
                          paginatedSchemes.every((item) =>
                            selectedSchemes.includes(item._id)
                          )
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Scheme ID</th>
                    <th>Scheme Name</th>
                    <th>Scheme Type</th>
                    <th>Applicable To</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="scheme-empty-cell">
                        Loading schemes...
                      </td>
                    </tr>
                  ) : paginatedSchemes.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="scheme-empty-cell">
                        No schemes found
                      </td>
                    </tr>
                  ) : (
                    paginatedSchemes.map((scheme) => (
                      <tr key={scheme._id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedSchemes.includes(scheme._id)}
                            onChange={() => handleSelectScheme(scheme._id)}
                          />
                        </td>

                        <td>
                          <span className="scheme-id">{scheme.schemeId}</span>
                        </td>

                        <td>
                          <div className="scheme-name-cell">
                            {scheme.banner ? (
                              <img
                                src={getFileUrl(scheme.banner)}
                                alt={scheme.schemeName}
                                className="scheme-banner-thumb"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="scheme-banner-placeholder">
                                <Gift size={17} />
                              </div>
                            )}

                            <div>
                              <strong>{scheme.schemeName}</strong>
                              <small>
                                {scheme.description
                                  ? scheme.description.length > 45
                                    ? `${scheme.description.substring(0, 45)}...`
                                    : scheme.description
                                  : "No description"}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className={getSchemeTypeClass(scheme.schemeType)}>
                            {getSchemeTypeLabel(scheme.schemeType)}
                          </span>
                        </td>

                        <td>
                          <span className={getApplicableClass(scheme.applicableTo)}>
                            {scheme.applicableTo === "BOTH"
                              ? "Dealers, Painters"
                              : scheme.applicableTo}
                          </span>
                        </td>

                        <td>{formatDate(scheme.startDate)}</td>
                        <td>{formatDate(scheme.endDate)}</td>

                        <td>
                          <span className={getStatusClass(scheme.status)}>
                            {scheme.status}
                          </span>
                        </td>

                        <td>
                          <div className="scheme-action-buttons">
                            <button title="View" onClick={() => handleView(scheme)}>
                              <Eye size={17} />
                            </button>

                            <button title="Edit" onClick={() => handleEdit(scheme)}>
                              <Pencil size={16} />
                            </button>

                            <button
                              className="scheme-action-buttons delete-action"
                              onClick={() => handleDelete(scheme)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="scheme-pagination">
              <span>
                Showing{" "}
                {filteredSchemes.length === 0
                  ? 0
                  : (currentPage - 1) * itemsPerPage + 1}{" "}
                to {Math.min(currentPage * itemsPerPage, filteredSchemes.length)}{" "}
                of {filteredSchemes.length} entries
              </span>

              <div className="pagination-controlsc">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  <ChevronLeft size={16} />
                </button>

                {pageNumbers[0] > 1 && <span className="pagination-ellipsis">…</span>}

                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    className={currentPage === page ? "active" : ""}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                {pageNumbers[pageNumbers.length - 1] < totalPages && (
                  <span className="pagination-ellipsis">…</span>
                )}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="scheme-right-sidebar">
          {/* PERFORMANCE */}
          <div className="scheme-side-card performance-card">
            <div className="side-card-header">
              <h3>Scheme Performance</h3>
              <span>This Month</span>
            </div>

            <div className="performance-content">
              <div
                className="performance-donut"
                style={{
                  background: totalSchemes
                    ? `conic-gradient(${donutStops})`
                    : "#e2e8f0",
                }}
              >
                <div>
                  <strong>{totalSchemes}</strong>
                  <span>Total</span>
                </div>
              </div>

              <div className="performance-legend">
                {performanceData.map((item) => (
                  <div key={item.label} className="performance-item">
                    <span className={`performance-dot ${item.key}`} />
                    <span className="performance-label">{item.label}</span>
                    <strong>
                      {item.value} ({item.percentage}%)
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RECENT SCHEMES */}
          <div className="scheme-side-card">
            <div className="side-card-header">
              <h3>Recent Schemes</h3>
              <button onClick={() => { resetFilters(); goToTable(); }}>
                View All
              </button>
            </div>

            <div className="recent-schemes-list">
              {recentSchemes.length === 0 ? (
                <p className="side-empty">No recent schemes</p>
              ) : (
                recentSchemes.map((scheme) => (
                  <div
                    className="recent-scheme-item"
                    key={scheme._id}
                    onClick={() => handleView(scheme)}
                  >
                    {scheme.banner ? (
                      <img
                        src={getFileUrl(scheme.banner)}
                        alt={scheme.schemeName}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="recent-image-placeholder">
                        <Gift size={16} />
                      </div>
                    )}

                    <div className="recent-scheme-info">
                      <strong>{scheme.schemeName}</strong>
                      <small>
                        {formatDate(scheme.startDate)} - {formatDate(scheme.endDate)}
                      </small>
                    </div>

                    <span className={getStatusClass(scheme.status)}>
                      {scheme.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="scheme-side-card">
            <div className="side-card-header">
              <h3>Quick Actions</h3>
            </div>

            <div className="quick-actions-grid">
              <button
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
              >
                <Plus size={19} />
                <span>Add New Scheme</span>
              </button>

              <button onClick={handleImport}>
                <Import size={19} />
                <span>Import Schemes</span>
              </button>

              <button onClick={handleQuickApproval}>
                <CheckCircle2 size={19} />
                <span>Scheme Approval</span>
              </button>

              <button onClick={handleExport}>
                <FileText size={19} />
                <span>Scheme Report</span>
              </button>

              <button onClick={handleQuickPerformance}>
                <BarChart3 size={19} />
                <span>Performance Report</span>
              </button>

              <button onClick={handleQuickExpired}>
                <Clock3 size={19} />
                <span>Expired Schemes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div
          className="scheme-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeAddModal();
          }}
        >
          <div className="scheme-modal">
            <div className="scheme-modal-header">
              <div>
                <h2>Add New Scheme</h2>
                <p>Create a new promotional scheme</p>
              </div>
            </div>

            <SchemeForm
              formData={formData}
              onChange={handleInputChange}
              onSubmit={handleAddScheme}
              onCancel={closeAddModal}
              saving={saving}
              submitText="Create Scheme"
            />
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div
          className="scheme-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeEditModal();
          }}
        >
          <div className="scheme-modal">
            <div className="scheme-modal-header">
              <div>
                <h2>Edit Scheme</h2>
                <p>Update scheme information</p>
              </div>

              <button onClick={closeEditModal}>
                <X size={20} />
              </button>
            </div>

            <SchemeForm
              formData={formData}
              onChange={handleInputChange}
              onSubmit={handleUpdateScheme}
              onCancel={closeEditModal}
              saving={saving}
              submitText="Update Scheme"
            />
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showViewModal && selectedScheme && (
        <div
          className="scheme-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowViewModal(false);
              setSelectedScheme(null);
            }
          }}
        >
          <div className="scheme-modal view-scheme-modal">
            <div className="scheme-modal-header">
              <div>
                <h2>Scheme Details</h2>
                <p>Complete scheme information</p>
              </div>
            </div>

            <div className="scheme-view-content">
              {selectedScheme.banner && (
                <div className="scheme-view-banner">
                  <img
                    src={getFileUrl(selectedScheme.banner)}
                    alt={selectedScheme.schemeName}
                    className="scheme-banner-image"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              <div className="scheme-view-title">
                <div>
                  <span>Scheme ID</span>
                  <strong>{selectedScheme.schemeId}</strong>
                </div>

                <span className={getStatusClass(selectedScheme.status)}>
                  {selectedScheme.status}
                </span>
              </div>

              <div className="scheme-details-grid">
                <div>
                  <span>Scheme Name</span>
                  <strong>{selectedScheme.schemeName}</strong>
                </div>

                <div>
                  <span>Scheme Type</span>
                  <strong>{getSchemeTypeLabel(selectedScheme.schemeType)}</strong>
                </div>

                <div>
                  <span>Applicable To</span>
                  <strong>
                    {selectedScheme.applicableTo === "BOTH"
                      ? "Dealers, Painters"
                      : selectedScheme.applicableTo}
                  </strong>
                </div>

                <div>
                  <span>Start Date</span>
                  <strong>{formatDate(selectedScheme.startDate)}</strong>
                </div>

                <div>
                  <span>End Date</span>
                  <strong>{formatDate(selectedScheme.endDate)}</strong>
                </div>

                <div className="full-detail">
                  <span>Description</span>
                  <strong>{selectedScheme.description || "-"}</strong>
                </div>

                <div className="full-detail">
                  <span>Terms & Conditions</span>
                  <strong>{selectedScheme.termsAndConditions || "-"}</strong>
                </div>
              </div>

              {selectedScheme.pdf && (
                <a
                  href={getFileUrl(selectedScheme.pdf)}
                  target="_blank"
                  rel="noreferrer"
                  className="scheme-pdf-link"
                >
                  <FileText size={17} />
                  View PDF
                </a>
              )}
            </div>

            <div className="scheme-modal-footer">
              <button
                className="scheme-cancel-btn"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedScheme(null);
                }}
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

export default SchemeManagement;