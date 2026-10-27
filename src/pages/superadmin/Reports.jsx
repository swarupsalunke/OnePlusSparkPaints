import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  FileText,
  CalendarDays,
  Download,
  Eye,
  MoreVertical,
  Pencil,
  Pause,
  Play,
  Trash2,
  X,
  RotateCcw,
  Filter,
  BarChart3,
  IndianRupee,
  Package,
  Gift,
  Users,
  UserRound,
  FileDown,
  Plus,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import "../../css/superadmin/reports.css";

const API_BASE_URL = "https://oneplussparkpaintsserver.onrender.com/api/reports";
const REPORT_SERVER_URL = "https://oneplussparkpaintsserver.onrender.com";

const Reports = () => {

  const [dashboard, setDashboard] = useState({
    totalReports: 0,
    generatedThisMonth: 0,
    scheduledReports: 0,
    downloadedThisMonth: 0,
  });

  const [reports, setReports] = useState([]);
  const [scheduledReports, setScheduledReports] = useState([]);
  // const [selectedReport, setSelectedReport] = useState(null);
  // const [showViewModal, setShowViewModal] = useState(false);

  const [showAddReportModal, setShowAddReportModal] = useState(false);
  const [reportFile, setReportFile] = useState(null);
  const reportFileInputRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [scheduledCurrentPage, setScheduledCurrentPage] = useState(1);
  const SCHEDULED_ITEMS_PER_PAGE = 10;

  const [addReportForm, setAddReportForm] = useState({
    reportName: "",
    category: "",
    reportType: "",
    format: "PDF",
    startDate: "",
    endDate: "",
  });

  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    category: "",
    reportType: "",
    startDate: "",
    endDate: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [showEditReportModal, setShowEditReportModal] = useState(false);
  const [editReport, setEditReport] = useState({
    reportName: "",
    category: "",
    reportType: "",
    generatedBy: "",
    format: "PDF",
  });

  const [selectedScheduled, setSelectedScheduled] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [showAddScheduledModal, setShowAddScheduledModal] =
    useState(false);

  const [scheduleForm, setScheduleForm] = useState({
    reportName: "",
    category: "",
    schedule: "",
    nextRun: "",
    format: "PDF",
    recipients: "",
    status: "ACTIVE",
  });

  const [editForm, setEditForm] = useState({
    reportName: "",
    category: "",
    schedule: "",
    nextRun: "",
    format: "",
    recipients: "",
    status: "ACTIVE",
  });


  // FETCH DASHBOARD


  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard`);

      if (response.data.success) {
        setDashboard(response.data.dashboard);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };


  // FETCH REPORTS


  const fetchReports = async () => {
    try {
      setLoading(true);

      const response = await axios.get(API_BASE_URL);

      if (response.data.success) {
        setReports(response.data.reports || []);
      }
    } catch (error) {
      console.error("Reports fetch error:", error);
    } finally {
      setLoading(false);
    }
  };


  // FETCH SCHEDULED REPORTS


  const fetchScheduledReports = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/scheduled/list`
      );

      if (response.data.success) {
        setScheduledReports(response.data.scheduledReports || []);
      }
    } catch (error) {
      console.error("Scheduled reports fetch error:", error);
    }
  };

  const scheduledTotalPages = Math.ceil(
    scheduledReports.length / SCHEDULED_ITEMS_PER_PAGE
  );

  const scheduledStartIndex =
    (scheduledCurrentPage - 1) * SCHEDULED_ITEMS_PER_PAGE;

  const paginatedScheduledReports = scheduledReports.slice(
    scheduledStartIndex,
    scheduledStartIndex + SCHEDULED_ITEMS_PER_PAGE
  );
  // INITIAL LOAD


  useEffect(() => {
    fetchDashboard();
    fetchReports();
    fetchScheduledReports();
  }, []);


  // REPORT CATEGORIES


  const categoryData = useMemo(() => {
    const categories = [
      {
        key: "SALES",
        title: "Sales Reports",
        description:
          "Reports related to sales, orders, revenue and performance.",
        icon: BarChart3,
        className: "sales",
      },
      {
        key: "FINANCE",
        title: "Finance Reports",
        description:
          "Financial transactions, payments, invoices and expenses.",
        icon: IndianRupee,
        className: "finance",
      },
      {
        key: "INVENTORY",
        title: "Inventory Reports",
        description:
          "Stock levels, stock movement and inventory analysis.",
        icon: Package,
        className: "inventory",
      },
      {
        key: "SCHEME_REWARDS",
        title: "Scheme & Rewards Reports",
        description:
          "Schemes, rewards, redemptions and performance.",
        icon: Gift,
        className: "scheme",
      },
      {
        key: "CUSTOMER",
        title: "Customer Reports",
        description:
          "Customer orders, purchase history and engagement.",
        icon: Users,
        className: "customer",
      },
      {
        key: "USER_ACTIVITY",
        title: "User & Activity Reports",
        description:
          "User activities, logins and system activities.",
        icon: UserRound,
        className: "activity",
      },
    ];

    return categories.map((category) => ({
      ...category,
      count: reports.filter(
        (report) => report.category === category.key
      ).length,
    }));
  }, [reports]);


  // UNIQUE REPORT TYPES


  const reportTypes = useMemo(() => {
    return [...new Set(reports.map((report) => report.reportType))]
      .filter(Boolean)
      .sort();
  }, [reports]);


  // FILTER REPORTS


  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesCategory =
        !filters.category ||
        report.category === filters.category;

      const matchesType =
        !filters.reportType ||
        report.reportType === filters.reportType;

      let matchesDate = true;

      if (filters.startDate || filters.endDate) {
        const generatedDate = new Date(report.generatedOn);

        if (filters.startDate) {
          const start = new Date(filters.startDate);
          start.setHours(0, 0, 0, 0);

          if (generatedDate < start) {
            matchesDate = false;
          }
        }

        if (filters.endDate) {
          const end = new Date(filters.endDate);
          end.setHours(23, 59, 59, 999);

          if (generatedDate > end) {
            matchesDate = false;
          }
        }
      }

      return (
        matchesCategory &&
        matchesType &&
        matchesDate
      );
    });
  }, [reports, filters]);

  const totalPages = Math.ceil(
    filteredReports.length / ITEMS_PER_PAGE
  );

  const startIndex =
    (currentPage - 1) * ITEMS_PER_PAGE;

  const paginatedReports = filteredReports.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );


  // RESET FILTERS


  const handleReset = () => {
    setFilters({
      category: "",
      reportType: "",
      startDate: "",
      endDate: "",
    });

    setShowFilters(false);
  };


  // VIEW REPORT


  const handleViewReport = async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/${id}`
      );

      if (response.data.success) {
        setSelectedReport(response.data.report);
        setShowViewModal(true);
      }
    } catch (error) {
      console.error("View report error:", error);
      alert("Unable to load report.");
    }
  };

  // ================= ADD REPORT =================

  const handleAddReportChange = (e) => {
    const { name, value } = e.target;

    setAddReportForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "format" && reportFile) {
      const extension = reportFile.name
        .substring(reportFile.name.lastIndexOf("."))
        .toLowerCase();

      const allowedExtensions = {
        PDF: [".pdf"],
        EXCEL: [".xlsx", ".xls"],
        CSV: [".csv"],
      };

      if (!allowedExtensions[value]?.includes(extension)) {
        setReportFile(null);
        if (reportFileInputRef.current) {
          reportFileInputRef.current.value = "";
        }
      }
    }
  };
  const handleCreateScheduled = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        reportName: scheduleForm.reportName,
        category: scheduleForm.category,
        schedule: scheduleForm.schedule,
        nextRun: scheduleForm.nextRun
          ? new Date(scheduleForm.nextRun).toISOString()
          : null,
        format: scheduleForm.format,
        recipients: scheduleForm.recipients
          .split(",")
          .map((email) => email.trim())
          .filter(Boolean),
        status: scheduleForm.status,
      };

      const response = await axios.post(
        `${API_BASE_URL}/scheduled`,
        payload
      );

      if (response.data.success) {
        setShowAddScheduledModal(false);

        setScheduleForm({
          reportName: "",
          category: "",
          schedule: "",
          nextRun: "",
          format: "PDF",
          recipients: "",
          status: "ACTIVE",
        });

        fetchScheduledReports();
        fetchDashboard();
      }
    } catch (error) {
      console.error(
        "Create scheduled report error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Unable to create scheduled report."
      );
    }
  };

  const handleReportFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setReportFile(null);
      return;
    }

    const allowedExtensions = {
      PDF: [".pdf"],
      EXCEL: [".xlsx", ".xls"],
      CSV: [".csv"],
    };

    const extension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!allowedExtensions[addReportForm.format]?.includes(extension)) {
      alert(`Please select a ${addReportForm.format} file.`);
      e.target.value = "";
      setReportFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be 10 MB or less.");
      e.target.value = "";
      setReportFile(null);
      return;
    }

    setReportFile(file);
  };

  const openAddReportModal = () => {
    setAddReportForm({
      reportName: "",
      category: "",
      reportType: "",
      format: "PDF",
      startDate: "",
      endDate: "",
    });
    setReportFile(null);

    if (reportFileInputRef.current) {
      reportFileInputRef.current.value = "";
    }

    setShowAddReportModal(true);
  };

  const closeAddReportModal = () => {
    setShowAddReportModal(false);
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();

    if (!addReportForm.reportName.trim()) {
      alert("Please enter report name.");
      return;
    }

    if (!addReportForm.category) {
      alert("Please select report category.");
      return;
    }

    if (!addReportForm.reportType.trim()) {
      alert("Please enter report type.");
      return;
    }

    if (!reportFile) {
      alert("Please upload the report file.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("reportName", addReportForm.reportName.trim());
      formData.append("category", addReportForm.category);
      formData.append("reportType", addReportForm.reportType.trim());
      formData.append("format", addReportForm.format);
      formData.append("startDate", addReportForm.startDate || "");
      formData.append("endDate", addReportForm.endDate || "");
      formData.append("generatedBy", "Admin");
      formData.append("reportFile", reportFile);

      const response = await axios.post(API_BASE_URL, formData);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Unable to create report."
        );
      }

      setShowAddReportModal(false);

      setAddReportForm({
        reportName: "",
        category: "",
        reportType: "",
        format: "PDF",
        startDate: "",
        endDate: "",
      });
      setReportFile(null);
      if (reportFileInputRef.current) {
        reportFileInputRef.current.value = "";
      }

      await Promise.all([
        fetchDashboard(),
        fetchReports(),
        fetchScheduledReports(),
      ]);

      alert("Report created successfully.");
    } catch (error) {
      console.error("Create report error:", error);

      alert(
        error.response?.data?.message ||
        error.message ||
        "Unable to create report."
      );
    } finally {
      setLoading(false);
    }
  };


  // ================= EDIT REPORT =================

  const handleEditReportChange = (e) => {
    const { name, value } = e.target;
    setEditReport((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this report?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`https://oneplussparkpaintsserver.onrender.com/api/reports/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete report");
      }

      // Remove deleted report from current table
      setReports((prevReports) =>
        prevReports.filter((report) => report._id !== id)
      );

      // Refresh dashboard count
      fetchDashboard();

      alert("Report deleted successfully");
    } catch (error) {
      console.error("Delete report error:", error);
      alert(error.message || "Failed to delete report");
    }
  };

  const openEditReportModal = (report) => {
    setSelectedReport(report);
    setEditReport({
      reportName: report.reportName || "",
      category: report.category || "",
      reportType: report.reportType || "",
      generatedBy: report.generatedBy || "Admin",
      format: report.format || "PDF",
    });
    setShowEditReportModal(true);
  };

  const closeEditReportModal = () => {
    setShowEditReportModal(false);
    setSelectedReport(null);
  };

  const handleUpdateReport = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    if (!editReport.reportName.trim()) { alert("Please enter report name."); return; }
    if (!editReport.category) { alert("Please select report category."); return; }
    if (!editReport.reportType.trim()) { alert("Please enter report type."); return; }

    try {
      setLoading(true);
      const payload = {
        reportName: editReport.reportName.trim(),
        category: editReport.category,
        reportType: editReport.reportType.trim(),
        generatedBy: editReport.generatedBy.trim() || "Admin",
        format: editReport.format,
      };

      const response = await axios.put(`${API_BASE_URL}/${selectedReport._id}`, payload);

      if (!response.data.success) {
        throw new Error(response.data.message || "Unable to update report.");
      }

      setShowEditReportModal(false);
      setSelectedReport(null);
      await Promise.all([fetchDashboard(), fetchReports()]);
      alert("Report updated successfully.");
    } catch (error) {
      console.error("Update report error:", error);
      alert(error.response?.data?.message || error.message || "Unable to update report.");
    } finally {
      setLoading(false);
    }
  };


  // DOWNLOAD REPORT


  const handleDownloadReport = async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/${id}/download`
      );

      if (response.data.success) {
        setReports((prev) =>
          prev.map((report) =>
            report._id === id
              ? { ...report, downloaded: true }
              : report
          )
        );

        fetchDashboard();
      }
    } catch (error) {
      console.error("Download report error:", error);
      alert("Unable to download report.");
    }
  };


  // EDIT SCHEDULED REPORT
  // =========================
  // ADD SCHEDULED REPORT
  // =========================

  const handleAddScheduledReport = () => {
    setScheduleForm({
      reportName: "",
      category: "",
      schedule: "",
      nextRun: "",
      format: "PDF",
      recipients: "",
      status: "ACTIVE",
    });

    setShowAddScheduledModal(true);
  };

  const handleEditScheduled = (scheduledReport) => {
    setSelectedScheduled(scheduledReport);

    setEditForm({
      reportName: scheduledReport.reportName || "",
      category: scheduledReport.category || "",
      schedule: scheduledReport.schedule || "",
      nextRun: scheduledReport.nextRun
        ? scheduledReport.nextRun.substring(0, 16)
        : "",
      format: scheduledReport.format || "PDF",
      recipients:
        scheduledReport.recipients?.join(", ") || "",
      status: scheduledReport.status || "ACTIVE",
    });

    setShowEditModal(true);
  };


  // UPDATE SCHEDULED REPORT


  const handleUpdateScheduled = async (e) => {
    e.preventDefault();

    if (!selectedScheduled) return;

    try {
      const payload = {
        reportName: editForm.reportName,
        category: editForm.category,
        schedule: editForm.schedule,
        nextRun: editForm.nextRun
          ? new Date(editForm.nextRun).toISOString()
          : null,
        format: editForm.format,
        recipients: editForm.recipients
          .split(",")
          .map((email) => email.trim())
          .filter(Boolean),
        status: editForm.status,
      };

      const response = await axios.put(
        `${API_BASE_URL}/scheduled/${selectedScheduled._id}`,
        payload
      );

      if (response.data.success) {
        setShowEditModal(false);
        setSelectedScheduled(null);

        fetchScheduledReports();
        fetchDashboard();
      }
    } catch (error) {
      console.error("Update scheduled report error:", error);
      alert("Unable to update scheduled report.");
    }
  };


  // PAUSE / RESUME


  const handleToggleScheduled = async (scheduledReport) => {
    try {
      const newStatus =
        scheduledReport.status === "ACTIVE"
          ? "PAUSED"
          : "ACTIVE";

      const payload = {
        reportName: scheduledReport.reportName,
        category: scheduledReport.category,
        schedule: scheduledReport.schedule,
        nextRun: scheduledReport.nextRun,
        format: scheduledReport.format,
        recipients: scheduledReport.recipients,
        status: newStatus,
      };

      const response = await axios.put(
        `${API_BASE_URL}/scheduled/${scheduledReport._id}`,
        payload
      );

      if (response.data.success) {
        fetchScheduledReports();
        fetchDashboard();
      }
    } catch (error) {
      console.error("Toggle scheduled report error:", error);
      alert("Unable to update report status.");
    }
  };


  // DELETE SCHEDULED REPORT


  const handleDeleteScheduled = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this scheduled report?"
    );

    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/scheduled/${id}`
      );

      if (response.data.success) {
        fetchScheduledReports();
        fetchDashboard();
      }
    } catch (error) {
      console.error("Delete scheduled report error:", error);
      alert("Unable to delete scheduled report.");
    }
  };


  // EXPORT DATA


  const handleExportData = () => {
    if (!filteredReports.length) {
      alert("No report data available to export.");
      return;
    }

    const headers = [
      "Report Name",
      "Category",
      "Report Type",
      "Generated On",
      "Generated By",
      "Format",
    ];

    const rows = filteredReports.map((report) => [
      report.reportName || "",
      report.category || "",
      report.reportType || "",
      report.generatedOn
        ? new Date(report.generatedOn).toLocaleString("en-IN")
        : "",
      report.generatedBy || "",
      report.format || "",
    ]);

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "reports.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  };


  // FORMAT DATE


  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  // OPEN UPLOADED REPORT FILE

  const handleOpenReportFile = (report) => {
    if (!report?.filePath) {
      alert("Report file is not available.");
      return;
    }

    const fileUrl = report.filePath.startsWith("http")
      ? report.filePath
      : `${REPORT_SERVER_URL}/${report.filePath.replace(/^\/+/, "")}`;

    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  // JSX


  return (
    <div className="reports-page">

      {/* ================= HEADER ================= */}

      <div className="reports-header">

        <div>
          <h1>Reports</h1>

          <div className="reports-breadcrumb">
            <span>Dashboard</span>
            <span>›</span>
            <span>Reports</span>
            <span>›</span>
            <span>All Reports</span>
          </div>
        </div>

        <button
          className="export-data-btn"
          onClick={handleExportData}
        >
          <Download size={16} />
          Export Data
        </button>

        <button
          className="export-data-btn"
          onClick={openAddReportModal}
        >
          <Plus size={17} />
          Add Report
        </button>

        <button
          type="button"
          className="export-data-btn"
          onClick={handleAddScheduledReport}
        >
          <Plus size={16} />
          Add Schedule Report
        </button>

      </div>

      {/* ================= KPI CARDS ================= */}

      <div className="reports-kpi-grid">

        <div className="report-kpi-card">

          <div className="kpi-icon blue">
            <FileText size={22} />
          </div>

          <div>
            <p>Total Reports</p>
            <h2>{dashboard.totalReports}</h2>
            <span>All Time</span>
          </div>

        </div>

        <div className="report-kpi-card">

          <div className="kpi-icon green">
            <CalendarDays size={22} />
          </div>

          <div>
            <p>Generated This Month</p>
            <h2>{dashboard.generatedThisMonth}</h2>
            <span>
              {new Date().toLocaleString("en-IN", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

        </div>

        <div className="report-kpi-card">

          <div className="kpi-icon orange">
            <FileText size={22} />
          </div>

          <div>
            <p>Scheduled Reports</p>
            <h2>{dashboard.scheduledReports}</h2>
            <span>Active</span>
          </div>

        </div>

        <div className="report-kpi-card">

          <div className="kpi-icon purple">
            <FileDown size={22} />
          </div>

          <div>
            <p>Downloaded This Month</p>
            <h2>{dashboard.downloadedThisMonth}</h2>
            <span>
              {new Date().toLocaleString("en-IN", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

        </div>

      </div>

      {/* ================= FILTERS ================= */}

      <div className="reports-filter-section">

        <div className="report-filter-group">

          <label>Report Category</label>

          <select
            value={filters.category}
            onChange={(e) =>
              setFilters({
                ...filters,
                category: e.target.value,
              })
            }
          >
            <option value="">All Categories</option>

            {categoryData.map((category) => (
              <option
                key={category.key}
                value={category.key}
              >
                {category.title}
              </option>
            ))}
          </select>

        </div>

        <div className="report-filter-group">

          <label>Report Type</label>

          <select
            value={filters.reportType}
            onChange={(e) =>
              setFilters({
                ...filters,
                reportType: e.target.value,
              })
            }
          >
            <option value="">All Types</option>

            {reportTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

        </div>

        <div className="report-filter-group date-range-group">

          <label>Date Range</label>

          <div className="date-range-inputs">

            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  startDate: e.target.value,
                })
              }
            />

            <span>-</span>

            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  endDate: e.target.value,
                })
              }
            />

          </div>

        </div>

        <div className="report-filter-actions">

          <button
            className={`filter-btn ${showFilters ? "active" : ""
              }`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filters
          </button>

          <button
            className="reset-btn"
            onClick={handleReset}
          >
            <RotateCcw size={16} />
            Reset
          </button>

        </div>

      </div>

      {/* ================= MAIN CONTENT ================= */}

      <div className="reports-main-grid">

        {/* ================= CATEGORY ================= */}

        <section className="reports-category-section">

          <div className="section-title">
            <h3>Reports by Category</h3>
          </div>

          <div className="category-card-grid">

            {categoryData.map((category) => {

              const Icon = category.icon;

              return (
                <div
                  className="category-report-card"
                  key={category.key}
                >

                  <div
                    className={`category-icon ${category.className}`}
                  >
                    <Icon size={22} />
                  </div>

                  <div className="category-card-content">

                    <h4>{category.title}</h4>

                    <p>{category.description}</p>

                    <strong>
                      {category.count} Reports
                    </strong>

                  </div>

                </div>
              );
            })}

          </div>

        </section>

        {/* ================= RECENT REPORTS ================= */}

        <section className="recent-reports-section">

          <div className="section-header">

            <h3>Recent Reports</h3>

            <button
              className="view-all-btn"
              onClick={fetchReports}
            >
              View All
            </button>

          </div>

          <div className="reports-table-wrapper">

            <table className="reports-table">

              <thead>
                <tr>
                  <th>Report Name</th>
                  <th>Category</th>
                  <th>Generated On</th>
                  <th>Generated By</th>
                  <th>Format</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {loading ? (

                  <tr>
                    <td
                      colSpan="6"
                      className="table-loading"
                    >
                      Loading reports...
                    </td>
                  </tr>

                ) : filteredReports.length === 0 ? (

                  <tr>
                    <td
                      colSpan="6"
                      className="table-empty"
                    >
                      No reports found
                    </td>
                  </tr>

                ) : (

                  paginatedReports.map((report) => (

                    <tr key={report._id}>

                      <td>
                        <span className="report-name">
                          {report.reportName}
                        </span>
                      </td>

                      <td>
                        {report.category}
                      </td>

                      <td>
                        {formatDate(report.generatedOn)}
                      </td>

                      <td>
                        {report.generatedBy}
                      </td>

                      <td>
                        {report.format === "PDF" ? (
                          <button
                            type="button"
                            className="format-badge pdf pdf-clickable"
                            onClick={() => handleOpenReportFile(report)}
                            title="Open PDF"
                          >
                            {report.format}
                          </button>
                        ) : (
                          <span
                            className={`format-badge ${report.format?.toLowerCase()}`}
                          >
                            {report.format}
                          </span>
                        )}
                      </td>

                      <td>

                        <div className="report-actions">

                          <button
                            title="View"
                            onClick={() =>
                              handleViewReport(
                                report._id
                              )
                            }
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            title="Download"
                            onClick={() =>
                              handleDownloadReport(
                                report._id
                              )
                            }
                          >
                            <Download size={16} />
                          </button>

                          <button
                            title="Edit"
                            onClick={() => openEditReportModal(report)}
                          >
                            <Pencil size={16} />
                          </button>


                          <button className="report-delete"
                            type="button"
                            title="Delete Report"
                            onClick={() => handleDelete(report._id)}
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
          <div className="pagination-row">
            <span>
              Showing{" "}
              {filteredReports.length === 0 ? 0 : startIndex + 1} to{" "}
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredReports.length)} of{" "}
              {filteredReports.length} entries
            </span>

            <div className="pagination-controlsr">
              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((prev) => Math.max(1, prev - 1))
                }
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    className={currentPage === page ? "active" : ""}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              )}

              <button
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

        </section>



      </div>



      {/* ================= SCHEDULED REPORTS ================= */}

      <section className="scheduled-reports-section">

        <div className="section-header">

          <h3>Scheduled Reports</h3>

          <button
            className="view-all-btn"
            onClick={fetchScheduledReports}
          >
            View All
          </button>

        </div>

        <div className="reports-table-wrapper">

          <table className="scheduled-table">

            <thead>

              <tr>
                <th>Report Name</th>
                <th>Category</th>
                <th>Schedule</th>
                <th>Next Run</th>
                <th>Format</th>
                <th>Recipients</th>
                <th>Status</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {scheduledReports.length === 0 ? (

                <tr>
                  <td
                    colSpan="8"
                    className="table-empty"
                  >
                    No scheduled reports found
                  </td>
                </tr>

              ) : (

                paginatedScheduledReports.map((report) => (

                  <tr key={report._id}>

                    <td>
                      {report.reportName}
                    </td>

                    <td>
                      {report.category}
                    </td>

                    <td>
                      {report.schedule}
                    </td>

                    <td>
                      {formatDate(report.nextRun)}
                    </td>

                    <td>
                      <span
                        className={`format-badge ${report.format?.toLowerCase()
                          }`}
                      >
                        {report.format}
                      </span>
                    </td>

                    <td>
                      <div className="recipient-list">
                        {report.recipients?.join(", ")}
                      </div>
                    </td>

                    <td>

                      <span
                        className={`status-badge ${report.status?.toLowerCase()
                          }`}
                      >
                        {report.status}
                      </span>

                    </td>

                    <td>

                      <div className="scheduled-actions">

                        <button
                          title="Edit"
                          onClick={() =>
                            handleEditScheduled(report)
                          }
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          title={
                            report.status === "ACTIVE"
                              ? "Pause"
                              : "Resume"
                          }
                          onClick={() =>
                            handleToggleScheduled(
                              report
                            )
                          }
                        >
                          {report.status === "ACTIVE" ? (
                            <Pause size={16} />
                          ) : (
                            <Play size={16} />
                          )}
                        </button>

                        <button className="report-delete"
                          title="Delete"
                          onClick={() =>
                            handleDeleteScheduled(
                              report._id
                            )
                          }
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

        <div className="scheduled-pagination">
          <span>
            Showing{" "}
            {scheduledReports.length === 0
              ? 0
              : scheduledStartIndex + 1}{" "}
            to{" "}
            {Math.min(
              scheduledStartIndex + SCHEDULED_ITEMS_PER_PAGE,
              scheduledReports.length
            )}{" "}
            of {scheduledReports.length} entries
          </span>

          <div className="scheduled-pagination-controls">
            <button
              disabled={scheduledCurrentPage === 1}
              onClick={() =>
                setScheduledCurrentPage((prev) =>
                  Math.max(1, prev - 1)
                )
              }
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from(
              { length: scheduledTotalPages },
              (_, index) => index + 1
            ).map((page) => (
              <button
                key={page}
                className={
                  scheduledCurrentPage === page
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setScheduledCurrentPage(page)
                }
              >
                {page}
              </button>
            ))}

            <button
              disabled={
                scheduledCurrentPage === scheduledTotalPages ||
                scheduledTotalPages === 0
              }
              onClick={() =>
                setScheduledCurrentPage((prev) =>
                  Math.min(
                    scheduledTotalPages,
                    prev + 1
                  )
                )
              }
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </section>

      {/* ================= ADD REPORT MODAL ================= */}

      {showAddReportModal && (
        <div
          className="report-modal-overlay"
          onClick={closeAddReportModal}
        >
          <div
            className="report-modal add-report-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="modal-header">

              <div>
                <h3>Add New Report</h3>
                <p>Create and generate a new report</p>
              </div>

              <button
                type="button"
                onClick={closeAddReportModal}
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={handleCreateReport}
              className="add-report-form"
            >

              <div className="add-report-form-grid">

                {/* REPORT NAME */}
                <div className="form-group full-width">
                  <label>Report Name *</label>

                  <input
                    type="text"
                    name="reportName"
                    value={addReportForm.reportName}
                    onChange={handleAddReportChange}
                    placeholder="Enter report name"
                    required
                  />
                </div>


                {/* CATEGORY */}
                <div className="form-group">

                  <label>Report Category *</label>

                  <select
                    name="category"
                    value={addReportForm.category}
                    onChange={handleAddReportChange}
                    required
                  >
                    <option value="">
                      Select Category
                    </option>

                    {categoryData.map((category) => (
                      <option
                        key={category.key}
                        value={category.key}
                      >
                        {category.title}
                      </option>
                    ))}
                  </select>

                </div>


                {/* REPORT TYPE */}
                <div className="form-group">

                  <label>Report Type *</label>

                  <input
                    type="text"
                    name="reportType"
                    value={addReportForm.reportType}
                    onChange={handleAddReportChange}
                    placeholder="e.g. Monthly Sales"
                    required
                  />

                </div>


                {/* START DATE */}
                <div className="form-group">

                  <label>Start Date</label>

                  <input
                    type="date"
                    name="startDate"
                    value={addReportForm.startDate}
                    onChange={handleAddReportChange}
                  />

                </div>


                {/* END DATE */}
                <div className="form-group">

                  <label>End Date</label>

                  <input
                    type="date"
                    name="endDate"
                    value={addReportForm.endDate}
                    onChange={handleAddReportChange}
                  />

                </div>


                {/* REPORT FILE */}
                <div className="form-group full-width">

                  <label>Upload Report File *</label>

                  <div className="report-file-upload">
                    <input
                      ref={reportFileInputRef}
                      id="reportFile"
                      type="file"
                      accept={
                        addReportForm.format === "PDF"
                          ? ".pdf"
                          : addReportForm.format === "EXCEL"
                            ? ".xlsx,.xls"
                            : ".csv"
                      }
                      onChange={handleReportFileChange}
                      required
                    />

                    <label
                      htmlFor="reportFile"
                      className="report-file-upload-btn"
                    >
                      <Upload size={16} />
                      Choose File
                    </label>

                    <span className="report-file-name">
                      {reportFile?.name || "No file selected"}
                    </span>
                  </div>

                  <small className="report-file-help">
                    {addReportForm.format === "PDF"
                      ? "PDF file only"
                      : addReportForm.format === "EXCEL"
                        ? "Excel file only (.xlsx or .xls)"
                        : "CSV file only"} — Maximum 10 MB
                  </small>

                </div>

                {/* FORMAT */}
                <div className="form-group">

                  <label>Report Format *</label>

                  <select
                    name="format"
                    value={addReportForm.format}
                    onChange={handleAddReportChange}
                    required
                  >
                    <option value="PDF">PDF</option>
                    <option value="EXCEL">Excel</option>
                    <option value="CSV">CSV</option>
                  </select>

                </div>

              </div>


              <div className="add-report-info">
                <FileText size={17} />

                <span>
                  The report will be generated and added to Recent Reports.
                </span>
              </div>


              <div className="modal-footer">

                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={closeAddReportModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="modal-save-btn"
                  disabled={loading}
                >
                  <Plus size={16} />
                  {loading ? "Creating..." : "Create Report"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= EDIT REPORT MODAL ================= */}

      {showEditReportModal && selectedReport && (
        <div
          className="report-modal-overlay"
          onClick={closeEditReportModal}
        >
          <div
            className="report-modal edit-report-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3>Edit Report</h3>
                <p>Update report details</p>
              </div>
              <button type="button" onClick={closeEditReportModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateReport} className="add-report-form">
              <div className="add-report-form-grid">
                <div className="form-group full-width">
                  <label>Report Name *</label>
                  <input type="text" name="reportName" value={editReport.reportName} onChange={handleEditReportChange} placeholder="Enter report name" required />
                </div>

                <div className="form-group">
                  <label>Report Category *</label>
                  <select name="category" value={editReport.category} onChange={handleEditReportChange} required>
                    <option value="">Select Category</option>
                    {categoryData.map((category) => (
                      <option key={category.key} value={category.key}>{category.title}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Report Type *</label>
                  <input type="text" name="reportType" value={editReport.reportType} onChange={handleEditReportChange} placeholder="e.g. Monthly Sales" required />
                </div>

                <div className="form-group">
                  <label>Generated By *</label>
                  <input type="text" name="generatedBy" value={editReport.generatedBy} onChange={handleEditReportChange} placeholder="Enter generated by" required />
                </div>

                <div className="form-group">
                  <label>Report Format *</label>
                  <select name="format" value={editReport.format} onChange={handleEditReportChange} required>
                    <option value="PDF">PDF</option>
                    <option value="EXCEL">Excel</option>
                    <option value="CSV">CSV</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="modal-close-btn" onClick={closeEditReportModal}>Cancel</button>
                <button type="submit" className="modal-save-btn" disabled={loading}>
                  <Pencil size={16} />
                  {loading ? "Updating..." : "Update Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ================= VIEW REPORT MODAL ================= */}

      {showViewModal && selectedReport && (

        <div
          className="report-modal-overlay"
          onClick={() => setShowViewModal(false)}
        >

          <div
            className="report-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="modal-header">

              <div>
                <h3>Report Details</h3>
                <p>{selectedReport.reportName}</p>
              </div>
            </div>

            <div className="report-details">

              <div className="detail-item">
                <label>Report Name</label>
                <span>
                  {selectedReport.reportName}
                </span>
              </div>

              <div className="detail-item">
                <label>Category</label>
                <span>
                  {selectedReport.category}
                </span>
              </div>

              <div className="detail-item">
                <label>Report Type</label>
                <span>
                  {selectedReport.reportType}
                </span>
              </div>

              <div className="detail-item">
                <label>Generated By</label>
                <span>
                  {selectedReport.generatedBy}
                </span>
              </div>

              <div className="detail-item">
                <label>Format</label>
                <span>
                  {selectedReport.format}
                </span>
              </div>

              <div className="detail-item">
                <label>Generated On</label>
                <span>
                  {formatDate(
                    selectedReport.generatedOn
                  )}
                </span>
              </div>

              <div className="detail-item">
                <label>Downloaded</label>
                <span>
                  {selectedReport.downloaded
                    ? "Yes"
                    : "No"}
                </span>
              </div>

            </div>

            <div className="modal-footer">

              <button
                className="modal-close-btn"
                onClick={() =>
                  setShowViewModal(false)
                }
              >
                Close
              </button>

              <button
                className="modal-download-btn"
                onClick={() => {
                  handleDownloadReport(
                    selectedReport._id
                  );

                  setShowViewModal(false);
                }}
              >
                <Download size={16} />
                Download
              </button>

            </div>

          </div>

        </div>

      )}

      {/* ================= EDIT SCHEDULED MODAL ================= */}

      {showEditModal && selectedScheduled && (

        <div
          className="report-modal-overlay"
          onClick={() => setShowEditModal(false)}
        >

          <div
            className="report-modal scheduled-edit-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="modal-header">

              <div>
                <h3>Edit Scheduled Report</h3>
                <p>
                  Update scheduled report details
                </p>
              </div>

              <button
                onClick={() =>
                  setShowEditModal(false)
                }
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={handleUpdateScheduled}
              className="scheduled-edit-form"
            >

              <div className="form-group">

                <label>Report Name</label>

                <input
                  type="text"
                  value={editForm.reportName}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      reportName: e.target.value,
                    })
                  }
                  required
                />

              </div>

              <div className="form-group">

                <label>Category</label>

                <select
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      category: e.target.value,
                    })
                  }
                  required
                >
                  <option value="SALES">
                    SALES
                  </option>

                  <option value="FINANCE">
                    FINANCE
                  </option>

                  <option value="INVENTORY">
                    INVENTORY
                  </option>

                  <option value="SCHEME_REWARDS">
                    SCHEME & REWARDS
                  </option>

                  <option value="CUSTOMER">
                    CUSTOMER
                  </option>

                  <option value="USER_ACTIVITY">
                    USER & ACTIVITY
                  </option>
                </select>

              </div>

              <div className="form-group">

                <label>Schedule</label>

                <input
                  type="text"
                  value={editForm.schedule}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      schedule: e.target.value,
                    })
                  }
                  required
                />

              </div>

              <div className="form-group">

                <label>Next Run</label>

                <input
                  type="datetime-local"
                  value={editForm.nextRun}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      nextRun: e.target.value,
                    })
                  }
                  required
                />

              </div>

              <div className="form-group">

                <label>Format</label>

                <select
                  value={editForm.format}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      format: e.target.value,
                    })
                  }
                >
                  <option value="PDF">PDF</option>
                  <option value="EXCEL">Excel</option>
                  <option value="CSV">CSV</option>
                </select>

              </div>

              <div className="form-group">

                <label>Recipients</label>

                <input
                  type="text"
                  value={editForm.recipients}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      recipients: e.target.value,
                    })
                  }
                  placeholder="email1@example.com, email2@example.com"
                  required
                />

              </div>

              <div className="form-group">

                <label>Status</label>

                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="ACTIVE">
                    ACTIVE
                  </option>

                  <option value="PAUSED">
                    PAUSED
                  </option>
                </select>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() =>
                    setShowEditModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="modal-save-btn"
                >
                  Save Changes
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ================= ADD SCHEDULED REPORT MODAL ================= */}

      {showAddScheduledModal && (
        <div
          className="report-modal-overlay"
          onClick={() => setShowAddScheduledModal(false)}
        >
          <div
            className="report-modal scheduled-edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3>Add Schedule Report</h3>
                <p>
                  Create a new scheduled report
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAddScheduledModal(false)
                }
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleCreateScheduled}
              className="scheduled-edit-form"
            >
              <div className="form-group">
                <label>Report Name</label>

                <input
                  type="text"
                  value={scheduleForm.reportName}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      reportName: e.target.value,
                    })
                  }
                  placeholder="Enter report name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>

                <select
                  value={scheduleForm.category}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      category: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">
                    Select Category
                  </option>

                  <option value="SALES">
                    SALES
                  </option>

                  <option value="FINANCE">
                    FINANCE
                  </option>

                  <option value="INVENTORY">
                    INVENTORY
                  </option>

                  <option value="SCHEME_REWARDS">
                    SCHEME & REWARDS
                  </option>

                  <option value="CUSTOMER">
                    CUSTOMER
                  </option>

                  <option value="USER_ACTIVITY">
                    USER & ACTIVITY
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Schedule</label>

                <input
                  type="text"
                  value={scheduleForm.schedule}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      schedule: e.target.value,
                    })
                  }
                  placeholder="e.g. Daily at 09:00 AM"
                  required
                />
              </div>

              <div className="form-group">
                <label>Next Run</label>

                <input
                  type="datetime-local"
                  value={scheduleForm.nextRun}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      nextRun: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Format</label>

                <select
                  value={scheduleForm.format}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      format: e.target.value,
                    })
                  }
                >
                  <option value="PDF">
                    PDF
                  </option>

                  <option value="EXCEL">
                    Excel
                  </option>

                  <option value="CSV">
                    CSV
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Recipients</label>

                <input
                  type="text"
                  value={scheduleForm.recipients}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      recipients: e.target.value,
                    })
                  }
                  placeholder="email1@example.com, email2@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Status</label>

                <select
                  value={scheduleForm.status}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="ACTIVE">
                    ACTIVE
                  </option>

                  <option value="PAUSED">
                    PAUSED
                  </option>
                </select>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() =>
                    setShowAddScheduledModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="modal-save-btn"
                >
                  Add Schedule Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;