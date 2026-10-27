import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Plus,
  Upload,
  Download,
  FileText,
  Eye,
  Pencil,
  Trash2,
  X,
  RotateCcw,
  Filter,
  Truck,
  PackageCheck,
  Clock3,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Save,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import "../../css/superadmin/dispatchOverview.css";

const API_BASE_URL = "https://oneplussparkpaintsserver.onrender.com/api";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "DISPATCHED", label: "Dispatched" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CLOSED", label: "Closed" },
];

const EMPTY_FORM = {
  customer: "",
  invoice: "",
  route: "",
  destination: "",
  quantity: "",
  unit: "Ltr",
  driver: "",
  vehicle: "",
  transportMode: "Road",
  transporter: "",
  dispatchTeam: "",
  status: "PENDING",
  remarks: "",
  dispatchDate: "",
};

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-IN");

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusLabel = (status) =>
  STATUS_OPTIONS.find((item) => item.value === status)?.label ||
  status ||
  "-";

const escapeCsv = (value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const DispatchManagement = () => {
  const [dispatches, setDispatches] = useState([]);
  const [stats, setStats] = useState({
    totalDispatches: 0,
    pending: 0,
    dispatched: 0,
    delivered: 0,
    closed: 0,
    totalQuantity: 0,
  });
  const [overview, setOverview] = useState({
    statusData: [],
    trendData: [],
    transporterData: [],
    recentDispatches: [],
  });
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState({
    pendingDispatches: [],
    deliveredWithoutPOD: [],
  });
  const [monthlyStats, setMonthlyStats] = useState([]);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedWarehouse, setSelectedWarehouse] = useState("ALL");
  const [selectedTransporter, setSelectedTransporter] = useState("ALL");

  const [dispatchCurrentPage, setDispatchCurrentPage] = useState(1);
  const DISPATCHES_PER_PAGE = 10;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [modal, setModal] = useState(null);
  const [selectedDispatch, setSelectedDispatch] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [files, setFiles] = useState({
    pod: null,
    vehiclePhotos: [],
    invoiceUpload: null,
    deliveryChallan: null,
    acknowledgement: null,
  });

  const [podDispatchId, setPodDispatchId] = useState("");
  const [podFile, setPodFile] = useState(null);
  const [statusSaving, setStatusSaving] = useState(false);

  const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken");

  const authConfig = () => ({
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const apiError = (error, fallback) =>
    error?.response?.data?.message || error?.message || fallback;

  const fetchDashboard = async (override = {}) => {
    try {
      setLoading(true);
      setError("");

      const params = {
        status:
          override.status ??
          (selectedStatus !== "ALL" ? selectedStatus : undefined),
        dateFrom:
          override.dateFrom ?? (dateFrom || undefined),
        dateTo:
          override.dateTo ?? (dateTo || undefined),
        transporter:
          override.transporter ??
          (selectedTransporter !== "ALL"
            ? selectedTransporter
            : undefined),
      };

      const [list, statsRes, overviewRes, summaryRes, alertsRes, monthlyRes] =
        await Promise.all([
          axios.get(`${API_BASE_URL}/dispatch`, {
            ...authConfig(),
            params,
          }),
          axios.get(`${API_BASE_URL}/dispatch/stats`, authConfig()),
          axios.get(`${API_BASE_URL}/dispatch/overview`, authConfig()),
          axios.get(`${API_BASE_URL}/dispatch/summary`, authConfig()),
          axios.get(`${API_BASE_URL}/dispatch/alerts`, authConfig()),
          axios.get(`${API_BASE_URL}/dispatch/monthly-stats`, authConfig()),
        ]);

      if (list.data?.success) {
        setDispatches(Array.isArray(list.data.dispatches) ? list.data.dispatches : []);
      }
      if (statsRes.data?.success) {
        setStats((prev) => ({ ...prev, ...(statsRes.data.stats || {}) }));
      }
      if (overviewRes.data?.success) {
        setOverview(overviewRes.data.overview || {});
      }
      if (summaryRes.data?.success) {
        setSummary(summaryRes.data.summary || null);
      }
      if (alertsRes.data?.success) {
        setAlerts(
          alertsRes.data.alerts || {
            pendingDispatches: [],
            deliveredWithoutPOD: [],
          }
        );
      }
      if (monthlyRes.data?.success) {
        setMonthlyStats(
          Array.isArray(monthlyRes.data.monthlyStats)
            ? monthlyRes.data.monthlyStats
            : []
        );
      }
    } catch (err) {
      console.error("Dispatch dashboard error:", err?.response?.data || err);
      setError(apiError(err, "Failed to load dispatch dashboard"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const transporterOptions = useMemo(() => {
    const set = new Set();
    (overview.transporterData || []).forEach((item) => {
      if (item?._id) set.add(item._id);
    });
    dispatches.forEach((item) => {
      if (item?.transporter) set.add(item.transporter);
    });
    return Array.from(set);
  }, [overview.transporterData, dispatches]);

  const warehouseOptions = useMemo(() => {
    const set = new Set();
    dispatches.forEach((item) => {
      if (item?.warehouse) set.add(item.warehouse);
    });
    return Array.from(set);
  }, [dispatches]);

  const totalStatusCount = useMemo(
    () =>
      (overview.statusData || []).reduce(
        (sum, item) => sum + Number(item?.count || 0),
        0
      ),
    [overview.statusData]
  );

  const statusChartGradient = useMemo(() => {
    const items = (overview.statusData || []).filter(
      (item) => Number(item?.count || 0) > 0
    );
    if (!items.length || totalStatusCount <= 0) return "#e2e8f0";

    const colors = {
      DELIVERED: "#16a34a",
      DISPATCHED: "#2563eb",
      PENDING: "#f59e0b",
      CLOSED: "#7c3aed",
    };

    let degree = 0;
    return `conic-gradient(${items
      .map((item) => {
        const next = degree + (Number(item.count) / totalStatusCount) * 360;
        const part = `${colors[item._id] || "#94a3b8"} ${degree}deg ${next}deg`;
        degree = next;
        return part;
      })
      .join(", ")})`;
  }, [overview.statusData, totalStatusCount]);

  const trendPoints = useMemo(() => {
    const rows = [...(overview.trendData || [])].sort(
      (a, b) =>
        Number(a?._id?.year || 0) - Number(b?._id?.year || 0) ||
        Number(a?._id?.month || 0) - Number(b?._id?.month || 0)
    );
    if (!rows.length) return null;

    const values = rows.map((row) => Number(row.quantity || 0));
    const max = Math.max(...values, 1);
    const width = 420;
    const height = 170;
    const points = rows.map((row, index) => ({
      x: rows.length === 1 ? 210 : (index / (rows.length - 1)) * width,
      y: height - (Number(row.quantity || 0) / max) * 145,
      label: `${row?._id?.month || "-"}/${row?._id?.year || ""}`,
      value: Number(row.quantity || 0),
    }));
    return { points, max };
  }, [overview.trendData]);

  const filteredDispatches = useMemo(() => {
    if (selectedWarehouse === "ALL") return dispatches;
    return dispatches.filter((item) => item.warehouse === selectedWarehouse);
  }, [dispatches, selectedWarehouse]);

  const dispatchTotalPages = Math.ceil(
    filteredDispatches.length / DISPATCHES_PER_PAGE
  );

  const dispatchStartIndex =
    (dispatchCurrentPage - 1) * DISPATCHES_PER_PAGE;

  const paginatedDispatches = filteredDispatches.slice(
    dispatchStartIndex,
    dispatchStartIndex + DISPATCHES_PER_PAGE
  );

  const monthQuantity = monthlyStats.reduce(
    (sum, row) => sum + Number(row.quantity || 0),
    0
  );

  const quantityForStatus = (status) =>
    (overview.statusData || []).reduce(
      (sum, row) =>
        row?._id === status ? sum + Number(row.quantity || 0) : sum,
      0
    );

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFiles({
      pod: null,
      vehiclePhotos: [],
      invoiceUpload: null,
      deliveryChallan: null,
      acknowledgement: null,
    });
    setModal("CREATE");
  };

  const openEdit = (item) => {
    setSelectedDispatch(item);
    setForm({
      customer: item.customer || "",
      invoice: item.invoice || "",
      route: item.route || "",
      destination: item.destination || "",
      quantity: item.quantity ?? "",
      unit: item.unit || "Ltr",
      driver: item.driver || "",
      vehicle: item.vehicle || "",
      transportMode: item.transportMode || "Road",
      transporter: item.transporter || "",
      dispatchTeam: Array.isArray(item.dispatchTeam)
        ? item.dispatchTeam.join(", ")
        : item.dispatchTeam || "",
      status: item.status || "PENDING",
      remarks: item.remarks || "",
      dispatchDate: item.dispatchDate
        ? new Date(item.dispatchDate).toISOString().slice(0, 16)
        : "",
    });
    setFiles({
      pod: null,
      vehiclePhotos: [],
      invoiceUpload: null,
      deliveryChallan: null,
      acknowledgement: null,
    });
    setModal("EDIT");
  };

  const openView = (item) => {
    setSelectedDispatch(item);
    setModal("VIEW");
  };

  const closeModal = () => {
    if (saving || statusSaving) return;
    setModal(null);
    setSelectedDispatch(null);
  };

  const changeForm = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const buildFormData = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        fd.append(key, value);
      }
    });

    if (files.pod) fd.append("pod", files.pod);
    files.vehiclePhotos.forEach((file) => fd.append("vehiclePhotos", file));
    if (files.invoiceUpload) fd.append("invoiceUpload", files.invoiceUpload);
    if (files.deliveryChallan) fd.append("deliveryChallan", files.deliveryChallan);
    if (files.acknowledgement) fd.append("acknowledgement", files.acknowledgement);
    return fd;
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axios.post(`${API_BASE_URL}/dispatch`, buildFormData(), {
        headers: {
          ...authConfig().headers,
          "Content-Type": "multipart/form-data",
        },
      });
      closeModal();
      await fetchDashboard();
    } catch (err) {
      console.error("Create dispatch error:", err?.response?.data || err);
      alert(apiError(err, "Failed to create dispatch"));
    } finally {
      setSaving(false);
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!selectedDispatch?._id) return;

    try {
      setSaving(true);
      await axios.put(
        `${API_BASE_URL}/dispatch/${selectedDispatch._id}`,
        buildFormData(),
        {
          headers: {
            ...authConfig().headers,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      closeModal();
      await fetchDashboard();
    } catch (err) {
      console.error("Update dispatch error:", err?.response?.data || err);
      alert(apiError(err, "Failed to update dispatch"));
    } finally {
      setSaving(false);
    }
  };

  const deleteDispatch = async (item) => {
    if (!window.confirm(`Delete ${item.dispatchNumber}?`)) return;

    try {
      setSaving(true);
      await axios.delete(`${API_BASE_URL}/dispatch/${item._id}`, authConfig());
      if (selectedDispatch?._id === item._id) closeModal();
      await fetchDashboard();
    } catch (err) {
      console.error("Delete dispatch error:", err?.response?.data || err);
      alert(apiError(err, "Failed to delete dispatch"));
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (item, status) => {
    try {
      setStatusSaving(true);
      const response = await axios.patch(
        `${API_BASE_URL}/dispatch/${item._id}/status`,
        { status },
        authConfig()
      );
      if (response.data?.success) {
        setSelectedDispatch(response.data.dispatch);
        await fetchDashboard();
      }
    } catch (err) {
      console.error("Status update error:", err?.response?.data || err);
      alert(apiError(err, "Failed to update status"));
    } finally {
      setStatusSaving(false);
    }
  };

  const uploadPOD = async (e) => {
    e.preventDefault();
    if (!podDispatchId || !podFile) {
      alert("Please select a dispatch and a POD file");
      return;
    }

    const fd = new FormData();
    fd.append("pod", podFile);

    try {
      setSaving(true);
      await axios.put(`${API_BASE_URL}/dispatch/${podDispatchId}`, fd, {
        headers: {
          ...authConfig().headers,
          "Content-Type": "multipart/form-data",
        },
      });
      closeModal();
      setPodDispatchId("");
      setPodFile(null);
      await fetchDashboard();
    } catch (err) {
      console.error("POD upload error:", err?.response?.data || err);
      alert(apiError(err, "Failed to upload POD"));
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = () => {
    const rows = [
      [
        "Dispatch No.",
        "Dispatch Date",
        "Invoice",
        "Customer",
        "Destination",
        "Transporter",
        "Vehicle No.",
        "Quantity",
        "Unit",
        "Status",
        "POD",
      ],
      ...filteredDispatches.map((item) => [
        item.dispatchNumber,
        formatDateTime(item.dispatchDate),
        item.invoice,
        item.customer,
        item.destination,
        item.transporter,
        item.vehicle,
        item.quantity,
        item.unit,
        statusLabel(item.status),
        item.pod ? "Uploaded" : "Pending",
      ]),
    ];

    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dispatch-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const parseCsvLine = (line) => {
    const values = [];
    let current = "";
    let quoted = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === "," && !quoted) {
        values.push(current);
        current = "";
      } else {
        current += char;
      }
    }

    values.push(current);
    return values;
  };

  const importCsv = (file) => {
    if (!file) return;
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const lines = String(event.target?.result || "")
          .split(/\r?\n/)
          .filter(Boolean);

        if (lines.length < 2) throw new Error("CSV has no data rows");

        const headers = parseCsvLine(lines[0]);
        let count = 0;

        for (const line of lines.slice(1)) {
          const values = parseCsvLine(line);
          const row = {};
          headers.forEach((header, index) => {
            row[String(header || "").trim()] = values[index] ?? "";
          });

          if (!row.Customer || !row.Invoice || !row.Quantity) continue;

          const status = String(row.Status || "PENDING")
            .trim()
            .toUpperCase();

          if (!STATUS_OPTIONS.some((item) => item.value === status)) {
            continue;
          }

          await axios.post(
            `${API_BASE_URL}/dispatch`,
            {
              customer: row.Customer,
              invoice: row.Invoice,
              route: row.Route || "",
              destination: row.Destination || "",
              quantity: Number(row.Quantity),
              unit: row.Unit || "Ltr",
              driver: row.Driver || "",
              vehicle: row.Vehicle || row["Vehicle No."] || "",
              transportMode: row["Transport Mode"] || "Road",
              transporter: row.Transporter || "",
              dispatchTeam: row["Dispatch Team"] || "",
              status,
              remarks: row.Remarks || "",
            },
            authConfig()
          );

          count += 1;
        }

        await fetchDashboard();
        alert(`${count} dispatch record(s) imported successfully`);
      } catch (err) {
        console.error("Import dispatch error:", err?.response?.data || err);
        alert(apiError(err, "Failed to import dispatch CSV"));
      }
    };

    reader.readAsText(file);
  };

  const renderStatusBadge = (status) => (
    <span className={`dispatch-status-badge status-${String(status || "").toLowerCase()}`}>
      {statusLabel(status)}
    </span>
  );

  return (
    <div className="dispatch-management-page">
      <div className="dispatch-page-header">
        <div>
          <h1>Dispatch Management</h1>
          <div className="dispatch-breadcrumb">
            <span>Dashboard</span>
            <span>›</span>
            <span>Dispatch Management</span>
            <span>›</span>
            <span>Overview</span>
          </div>
        </div>

        <div className="dispatch-header-actions">
          <label className="dispatch-secondary-btn">
            <Upload size={15} />
            Import Dispatch
            <input
              type="file"
              accept=".csv,text/csv"
              hidden
              onChange={(e) => {
                importCsv(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>

          <button type="button" className="dispatch-secondary-btn" onClick={exportCsv}>
            <Download size={15} />
            Export
          </button>

          <button type="button" className="dispatch-primary-btn" onClick={openCreate}>
            <Plus size={16} />
            Add Dispatch
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {error && <div className="dispatch-page-error">{error}</div>}

      {/* STATS */}
      <div className="dispatch-stats-grid">
        <div className="dispatch-stat-card"><div className="dispatch-stat-icon blue"><Truck size={19} /></div><div><span>Total Dispatches</span><strong>{loading ? "..." : formatNumber(stats.totalDispatches)}</strong><small>Current records</small></div></div>
        <div className="dispatch-stat-card"><div className="dispatch-stat-icon orange"><PackageCheck size={19} /></div><div><span>Dispatched Qty (MT/Ltrs)</span><strong>{loading ? "..." : formatNumber(stats.totalQuantity)}</strong><small>Total dispatched quantity</small></div></div>
        <div className="dispatch-stat-card"><div className="dispatch-stat-icon blue"><Truck size={19} /></div><div><span>In Transit</span><strong>{formatNumber(overview.statusData?.find((x) => x._id === "IN_TRANSIT")?.count || 0)}</strong><small>Not currently in backend enum</small></div></div>
        <div className="dispatch-stat-card"><div className="dispatch-stat-icon green"><CheckCircle2 size={19} /></div><div><span>Delivered</span><strong>{loading ? "..." : formatNumber(stats.delivered)}</strong><small>Delivered dispatches</small></div></div>
        <div className="dispatch-stat-card"><div className="dispatch-stat-icon amber"><Clock3 size={19} /></div><div><span>Pending</span><strong>{loading ? "..." : formatNumber(stats.pending)}</strong><small>Pending dispatches</small></div></div>
        <div className="dispatch-stat-card"><div className="dispatch-stat-icon red"><XCircle size={19} /></div><div><span>Cancelled</span><strong>{formatNumber(overview.statusData?.find((x) => x._id === "CANCELLED")?.count || 0)}</strong><small>Not currently in backend enum</small></div></div>
      </div>

      {/* FILTERS */}
      <div className="dispatch-filter-card">
        {/* <div className="dispatch-filter-field"><label>Date Range</label><div className="dispatch-date-range"><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /><span>to</span><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></div></div> */}
        <div className="dispatch-filter-field"><label>From Date</label><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></div>
        <div className="dispatch-filter-field"><label>To Date</label><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></div>
        <div className="dispatch-filter-field"><label>Status</label><select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}><option value="ALL">All Status</option>{STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
        <div className="dispatch-filter-field"><label>Warehouse</label><select value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(e.target.value)}><option value="ALL">All Warehouses</option>{warehouseOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
        <div className="dispatch-filter-field"><label>Transporter</label><select value={selectedTransporter} onChange={(e) => setSelectedTransporter(e.target.value)}><option value="ALL">All Transporters</option>{transporterOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
        <div className="dispatch-filter-actions"><button type="button" className="dispatch-filter-btn" onClick={() => fetchDashboard()}><Filter size={15} />Filters</button><button type="button" className="dispatch-reset-btn" onClick={() => { setDateFrom(""); setDateTo(""); setSelectedStatus("ALL"); setSelectedWarehouse("ALL"); setSelectedTransporter("ALL"); setTimeout(() => fetchDashboard({ status: undefined, dateFrom: undefined, dateTo: undefined, transporter: undefined }), 0); }}><RotateCcw size={14} />Reset</button></div>
      </div>

      {/* CHARTS */}
      <div className="dispatch-analytics-grid">
        <div className="dispatch-panel">
          <div className="dispatch-panel-header"><div><h2>Dispatch Status</h2><p>Status-wise dispatch distribution</p></div></div>
          <div className="dispatch-status-chart">
            <div className="dispatch-donut" style={{ background: statusChartGradient }}><div><strong>{formatNumber(totalStatusCount)}</strong><span>Total Dispatches</span></div></div>
            <div className="dispatch-status-legend">
              {(overview.statusData || []).length === 0 ? <div className="dispatch-empty-small">No status data.</div> : overview.statusData.map((item) => { const count = Number(item.count || 0); const percent = totalStatusCount ? ((count / totalStatusCount) * 100).toFixed(1) : "0.0"; return <div key={item._id} className="dispatch-status-row"><span><i className={`dispatch-legend-dot status-${String(item._id).toLowerCase()}`} />{statusLabel(item._id)}</span><strong>{formatNumber(count)} ({percent}%)</strong></div>; })}
            </div>
          </div>
        </div>

        <div className="dispatch-panel">
          <div className="dispatch-panel-header"><div><h2>Dispatch Trend (MT/Ltrs)</h2><p>Monthly dispatch quantity</p></div></div>
          <div className="dispatch-trend-chart">
            {!trendPoints ? <div className="dispatch-empty-small">No trend data.</div> : <><svg viewBox="0 0 420 190" className="dispatch-line-chart" preserveAspectRatio="none"><line x1="0" y1="170" x2="420" y2="170" stroke="#e2e8f0" /><line x1="0" y1="85" x2="420" y2="85" stroke="#eef2f7" /><line x1="0" y1="10" x2="420" y2="10" stroke="#eef2f7" /><polyline points={trendPoints.points.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#f97316" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />{trendPoints.points.map((p) => <circle key={`${p.label}-${p.x}`} cx={p.x} cy={p.y} r="4" fill="#f97316" />)}</svg><div className="dispatch-trend-labels">{trendPoints.points.map((p) => <span key={p.label}>{p.label}</span>)}</div></>}
          </div>
        </div>

        <div className="dispatch-panel">
          <div className="dispatch-panel-header"><div><h2>Top Transporters (MT/Ltrs)</h2><p>Highest dispatched quantities</p></div></div>
          <div className="dispatch-transporter-list">
            {(overview.transporterData || []).length === 0 ? <div className="dispatch-empty-small">No transporter data.</div> : overview.transporterData.map((item, index) => <div className="dispatch-transporter-row" key={item._id}><div><span className="dispatch-rank">{index + 1}</span><strong>{item._id}</strong></div><span>{formatNumber(item.quantity)}</span></div>)}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="dispatch-main-grid">
        <div>
          <div className="dispatch-panel">
            <div className="dispatch-panel-header"><div><h2>Recent Dispatches</h2><p>Latest outbound dispatch records</p></div><span className="dispatch-record-count">{filteredDispatches.length} records</span></div>
            <div className="dispatch-table-wrapper">
              <table className="dispatch-table">
                <thead><tr><th>Dispatch No.</th><th>Dispatch Date</th><th>Order / Invoice No.</th><th>Customer / Party</th><th>Destination</th><th>Transporter</th><th>Vehicle No.</th><th>Qty (MT/Ltrs)</th><th>Status</th><th>POD</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredDispatches.length === 0 ? <tr><td colSpan="11" className="dispatch-empty-cell">No dispatch records found.</td></tr> : paginatedDispatches.map((item) => <tr key={item._id}>
                    <td><strong>{item.dispatchNumber}</strong></td>
                    <td>{formatDateTime(item.dispatchDate)}</td>
                    <td>{item.invoice || "-"}</td>
                    <td>{item.customer || "-"}</td>
                    <td>{item.destination || "-"}</td>
                    <td>{item.transporter || "-"}</td>
                    <td>{item.vehicle || "-"}</td>
                    <td>{formatNumber(item.quantity)} {item.unit || ""}</td>
                    <td>{renderStatusBadge(item.status)}</td>
                    <td>{item.pod ? <span className="dispatch-pod-ready"><CheckCircle2 size={14} />Yes</span> : <span className="dispatch-pod-pending">—</span>}</td>
                    <td><div className="dispatch-action-group"><button type="button" className="dispatch-icon-btn" title="View" onClick={() => openView(item)}><Eye size={15} /></button><button type="button" className="dispatch-icon-btn" title="Edit" onClick={() => openEdit(item)}><Pencil size={15} /></button><button type="button" className="dispatch-icon-btn danger" title="Delete" onClick={() => deleteDispatch(item)}><Trash2 size={15} /></button></div></td>
                  </tr>)}
                </tbody>
              </table>
            </div>
            <div className="dispatch-pagination">
              <span>
                Showing{" "}
                {filteredDispatches.length === 0
                  ? 0
                  : dispatchStartIndex + 1}{" "}
                to{" "}
                {Math.min(
                  dispatchStartIndex + DISPATCHES_PER_PAGE,
                  filteredDispatches.length
                )}{" "}
                of {filteredDispatches.length} entries
              </span>

              <div className="dispatch-pagination-controls">
                <button
                  type="button"
                  disabled={dispatchCurrentPage === 1}
                  onClick={() =>
                    setDispatchCurrentPage((prev) =>
                      Math.max(1, prev - 1)
                    )
                  }
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from(
                  { length: dispatchTotalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    type="button"
                    key={page}
                    className={
                      dispatchCurrentPage === page ? "active" : ""
                    }
                    onClick={() => setDispatchCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={
                    dispatchCurrentPage === dispatchTotalPages ||
                    dispatchTotalPages === 0
                  }
                  onClick={() =>
                    setDispatchCurrentPage((prev) =>
                      Math.min(dispatchTotalPages, prev + 1)
                    )
                  }
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="dispatch-monthly-grid">
            <div className="dispatch-monthly-card"><div className="dispatch-stat-icon blue"><Truck size={18} /></div><div><span>Total Dispatched (This Month)</span><strong>{formatNumber(monthQuantity)}</strong><small>MT/Ltrs</small></div></div>
            <div className="dispatch-monthly-card"><div className="dispatch-stat-icon green"><CheckCircle2 size={18} /></div><div><span>Total Delivered (This Month)</span><strong>{formatNumber(quantityForStatus("DELIVERED"))}</strong><small>MT/Ltrs</small></div></div>
            <div className="dispatch-monthly-card"><div className="dispatch-stat-icon blue"><Truck size={18} /></div><div><span>Total In Transit (This Month)</span><strong>{formatNumber(quantityForStatus("IN_TRANSIT"))}</strong><small>MT/Ltrs</small></div></div>
            <div className="dispatch-monthly-card"><div className="dispatch-stat-icon amber"><Clock3 size={18} /></div><div><span>Total Pending (This Month)</span><strong>{formatNumber(quantityForStatus("PENDING"))}</strong><small>MT/Ltrs</small></div></div>
            <div className="dispatch-monthly-card"><div className="dispatch-stat-icon green"><PackageCheck size={18} /></div><div><span>POD Uploaded</span><strong>{formatNumber(filteredDispatches.filter((item) => Boolean(item.pod)).length)}</strong><small>Records with POD</small></div></div>
          </div>
        </div>

        <div>
          <div className="dispatch-panel">
            <div className="dispatch-panel-header"><div><h2>Quick Actions</h2><p>Common dispatch operations</p></div></div>
            <div className="dispatch-quick-actions">
              <button type="button" onClick={openCreate}><Plus size={16} /><span><strong>Add Dispatch</strong><small>Create new dispatch entry</small></span><span>›</span></button>
              <button type="button" onClick={() => { setPodDispatchId(""); setPodFile(null); setModal("POD"); }}><Upload size={16} /><span><strong>POD Upload</strong><small>Upload Proof of Delivery</small></span><span>›</span></button>
              <button type="button" onClick={() => { if (!filteredDispatches.length) return alert("No dispatch record available"); setSelectedDispatch(filteredDispatches[0]); setModal("TIMELINE"); }}><Clock3 size={16} /><span><strong>Dispatch Timeline</strong><small>Track dispatch journey</small></span><span>›</span></button>
              <button type="button" onClick={() => setModal("REPORTS")}><FileText size={16} /><span><strong>Dispatch Reports</strong><small>View dispatch reports</small></span><span>›</span></button>
            </div>
          </div>

          <div className="dispatch-panel">
            <div className="dispatch-panel-header"><div><h2>Dispatch Summary</h2></div></div>
            <div className="dispatch-summary-list">
              <div><span>Total Dispatches</span><strong>{formatNumber(summary?.totalDispatches ?? stats.totalDispatches)}</strong></div>
              <div><span>Total Qty (MT/Ltrs)</span><strong>{formatNumber(summary?.totalQuantity ?? stats.totalQuantity)}</strong></div>
              <div><span>Delivered Qty</span><strong>{formatNumber(quantityForStatus("DELIVERED"))}</strong></div>
              <div><span>In Transit Qty</span><strong>{formatNumber(quantityForStatus("IN_TRANSIT"))}</strong></div>
              <div><span>Pending Qty</span><strong>{formatNumber(quantityForStatus("PENDING"))}</strong></div>
              <div><span>Closed Qty</span><strong>{formatNumber(quantityForStatus("CLOSED"))}</strong></div>
            </div>
          </div>

          <div className="dispatch-panel">
            <div className="dispatch-panel-header"><div><h2>Live Alerts</h2><p>Current dispatch attention items</p></div><button type="button" className="dispatch-link-btn" onClick={() => { if (!(alerts.pendingDispatches?.length || alerts.deliveredWithoutPOD?.length)) alert("No live alerts."); }} >View All</button></div>
            <div className="dispatch-alert-list">
              {(alerts.pendingDispatches || []).slice(0, 3).map((item) => <button type="button" key={`pending-${item._id}`} className="dispatch-alert-row" onClick={() => openView(item)}><Clock3 size={16} /><span>Dispatch {item.dispatchNumber} is pending</span></button>)}
              {(alerts.deliveredWithoutPOD || []).slice(0, 3).map((item) => <button type="button" key={`pod-${item._id}`} className="dispatch-alert-row" onClick={() => openView(item)}><Upload size={16} /><span>POD pending for {item.dispatchNumber}</span></button>)}
              {!(alerts.pendingDispatches?.length || alerts.deliveredWithoutPOD?.length) && <div className="dispatch-empty-small">No live alerts.</div>}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT */}
      {(modal === "CREATE" || modal === "EDIT") && (
        <div className="dispatch-modal-overlay" onClick={closeModal}>
          <div className="dispatch-modal large" onClick={(e) => e.stopPropagation()}>
            <div className="dispatch-modal-header"><div><h2>{modal === "CREATE" ? "Add Dispatch" : "Edit Dispatch"}</h2><p>{modal === "CREATE" ? "Create a new outbound dispatch entry." : "Update dispatch details and documents."}</p></div></div>
            <form className="dispatch-modal-form" onSubmit={modal === "CREATE" ? submitCreate : submitEdit}>
              <div className="dispatch-form-grid">
                <div className="dispatch-form-group"><label>Customer *</label><input name="customer" value={form.customer} onChange={(e) => /^[A-Za-z\s]*$/.test(e.target.value) && changeForm(e)} required /></div>                <div className="dispatch-form-group"><label>Invoice *</label><input name="invoice" value={form.invoice} onChange={changeForm} required /></div>
                <div className="dispatch-form-group"><label>Route</label><input name="route" value={form.route} onChange={changeForm} /></div>
                <div className="dispatch-form-group"><label>Destination</label><input name="destination" value={form.destination} onChange={changeForm} /></div>
                <div className="dispatch-form-group"><label>Quantity *</label><input type="number" min="0" step="any" name="quantity" value={form.quantity} onChange={changeForm} required /></div>
                <div className="dispatch-form-group"><label>Unit *</label><select name="unit" value={form.unit} onChange={changeForm}><option value="Ltr">Ltr</option><option value="MT">MT</option><option value="Kg">Kg</option><option value="Nos">Nos</option></select></div>
                <div className="dispatch-form-group"><label>Driver</label><input name="driver" value={form.driver} onChange={changeForm} /></div>
                <div className="dispatch-form-group"><label>Vehicle</label><input name="vehicle" value={form.vehicle} onChange={changeForm} /></div>
                <div className="dispatch-form-group"><label>Transport Mode</label><select name="transportMode" value={form.transportMode} onChange={changeForm}><option value="Road">Road</option><option value="Rail">Rail</option><option value="Courier">Courier</option><option value="Air">Air</option></select></div>
                <div className="dispatch-form-group"><label>Transporter</label><input name="transporter" value={form.transporter} onChange={changeForm} /></div>
                <div className="dispatch-form-group"><label>Dispatch Team</label><input name="dispatchTeam" value={form.dispatchTeam} onChange={changeForm} /></div>
                <div className="dispatch-form-group"><label>Status</label><select name="status" value={form.status} onChange={changeForm}>{STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
                <div className="dispatch-form-group"><label>Dispatch Date</label><input type="datetime-local" name="dispatchDate" value={form.dispatchDate} onChange={changeForm} /></div>
                <div className="dispatch-form-group"><label>POD</label><input type="file" accept=".pdf,image/*" onChange={(e) => setFiles((p) => ({ ...p, pod: e.target.files?.[0] || null }))} /></div>
                <div className="dispatch-form-group"><label>Vehicle Photos</label><input type="file" accept="image/*" multiple onChange={(e) => setFiles((p) => ({ ...p, vehiclePhotos: Array.from(e.target.files || []) }))} /></div>
                <div className="dispatch-form-group"><label>Invoice Upload</label><input type="file" accept=".pdf,image/*" onChange={(e) => setFiles((p) => ({ ...p, invoiceUpload: e.target.files?.[0] || null }))} /></div>
                <div className="dispatch-form-group"><label>Delivery Challan</label><input type="file" accept=".pdf,image/*" onChange={(e) => setFiles((p) => ({ ...p, deliveryChallan: e.target.files?.[0] || null }))} /></div>
                <div className="dispatch-form-group"><label>Acknowledgement</label><input type="file" accept=".pdf,image/*" onChange={(e) => setFiles((p) => ({ ...p, acknowledgement: e.target.files?.[0] || null }))} /></div>
                <div className="dispatch-form-group full-width"><label>Remarks</label><textarea name="remarks" rows="3" value={form.remarks} onChange={changeForm} /></div>
              </div>
              <div className="dispatch-modal-footer"><button type="button" className="dispatch-secondary-btn" onClick={closeModal} disabled={saving}>Cancel</button><button type="submit" className="dispatch-primary-btn" disabled={saving}><Save size={15} />{saving ? "Saving..." : modal === "CREATE" ? "Create Dispatch" : "Update Dispatch"}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW */}
      {modal === "VIEW" && selectedDispatch && (
        <div className="dispatch-modal-overlay" onClick={closeModal}>
          <div className="dispatch-modal large" onClick={(e) => e.stopPropagation()}>
            <div className="dispatch-modal-header"><div><h2>Dispatch Details</h2><p>{selectedDispatch.dispatchNumber}</p></div></div>
            <div className="dispatch-detail-grid">
              <div><span>Customer</span><strong>{selectedDispatch.customer || "-"}</strong></div>
              <div><span>Invoice</span><strong>{selectedDispatch.invoice || "-"}</strong></div>
              <div><span>Route</span><strong>{selectedDispatch.route || "-"}</strong></div>
              <div><span>Destination</span><strong>{selectedDispatch.destination || "-"}</strong></div>
              <div><span>Quantity</span><strong>{formatNumber(selectedDispatch.quantity)} {selectedDispatch.unit || ""}</strong></div>
              <div><span>Driver</span><strong>{selectedDispatch.driver || "-"}</strong></div>
              <div><span>Vehicle</span><strong>{selectedDispatch.vehicle || "-"}</strong></div>
              <div><span>Transport Mode</span><strong>{selectedDispatch.transportMode || "-"}</strong></div>
              <div><span>Transporter</span><strong>{selectedDispatch.transporter || "-"}</strong></div>
              <div><span>Dispatch Team</span><strong>{Array.isArray(selectedDispatch.dispatchTeam) ? selectedDispatch.dispatchTeam.join(", ") : selectedDispatch.dispatchTeam || "-"}</strong></div>
              <div><span>Status</span><div>{renderStatusBadge(selectedDispatch.status)}</div></div>
              <div><span>Dispatch Date</span><strong>{formatDateTime(selectedDispatch.dispatchDate)}</strong></div>
              <div><span>POD</span><strong>{selectedDispatch.pod ? "Uploaded" : "Not uploaded"}</strong></div>
              <div><span>Invoice Upload</span><strong>{selectedDispatch.invoiceUpload ? "Uploaded" : "Not uploaded"}</strong></div>
              <div><span>Delivery Challan</span><strong>{selectedDispatch.deliveryChallan ? "Uploaded" : "Not uploaded"}</strong></div>
              <div><span>Acknowledgement</span><strong>{selectedDispatch.acknowledgement ? "Uploaded" : "Not uploaded"}</strong></div>
              <div><span>Vehicle Photos</span><strong>{selectedDispatch.vehiclePhotos?.length || 0}</strong></div>
              <div className="dispatch-detail-wide"><span>Remarks</span><strong>{selectedDispatch.remarks || "-"}</strong></div>
            </div>
            <div className="dispatch-status-controls"><span>Update Status</span>{STATUS_OPTIONS.map((item) => <button key={item.value} type="button" className={selectedDispatch.status === item.value ? "dispatch-status-btn active" : "dispatch-status-btn"} disabled={statusSaving || selectedDispatch.status === item.value} onClick={() => changeStatus(selectedDispatch, item.value)}>{item.label}</button>)}<button type="button" className="dispatch-secondary-btn" onClick={() => openEdit(selectedDispatch)}><Pencil size={14} />Edit</button><button type="button" className="dispatch-danger-btn" onClick={() => deleteDispatch(selectedDispatch)}><Trash2 size={14} />Delete</button></div>
            <div className="view-do-footer">
              <button type="button" className="view-do-footer-bottom" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* POD */}
      {modal === "POD" && (
        <div className="dispatch-modal-overlay" onClick={closeModal}>
          <div className="dispatch-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dispatch-modal-header"><div><h2>POD Upload</h2><p>Upload Proof of Delivery.</p></div><button type="button" className="dispatch-close-btn" onClick={closeModal}><X size={18} /></button></div>
            <form className="dispatch-modal-form" onSubmit={uploadPOD}>
              <div className="dispatch-form-grid">
                <div className="dispatch-form-group"><label>Dispatch *</label><select value={podDispatchId} onChange={(e) => setPodDispatchId(e.target.value)} required><option value="">Select Dispatch</option>{dispatches.map((item) => <option key={item._id} value={item._id}>{item.dispatchNumber} - {item.customer}</option>)}</select></div>
                <div className="dispatch-form-group"><label>POD File *</label><input type="file" accept=".pdf,image/*" onChange={(e) => setPodFile(e.target.files?.[0] || null)} required /></div>
              </div>
              <div className="dispatch-modal-footer"><button type="button" className="dispatch-secondary-btn" onClick={closeModal}>Cancel</button><button type="submit" className="dispatch-primary-btn" disabled={saving}><Upload size={15} />{saving ? "Uploading..." : "Upload POD"}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* TIMELINE */}
      {modal === "TIMELINE" && selectedDispatch && (
        <div className="dispatch-modal-overlay" onClick={closeModal}>
          <div className="dispatch-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dispatch-modal-header"><div><h2>Dispatch Timeline</h2><p>{selectedDispatch.dispatchNumber}</p></div><button type="button" className="dispatch-close-btn" onClick={closeModal}><X size={18} /></button></div>
            <div className="dispatch-timeline">{STATUS_OPTIONS.map((step, index) => { const current = STATUS_OPTIONS.findIndex((item) => item.value === selectedDispatch.status); const done = index <= current; return <div key={step.value} className={done ? "dispatch-timeline-item complete" : "dispatch-timeline-item"}><div className="dispatch-timeline-dot">{step.value === "PENDING" ? <Clock3 size={16} /> : step.value === "DELIVERED" ? <CheckCircle2 size={16} /> : step.value === "CLOSED" ? <PackageCheck size={16} /> : <Truck size={16} />}</div><div><strong>{step.label}</strong><span>{done ? "Completed / reached" : "Pending"}</span></div></div>; })}</div>
          </div>
        </div>
      )}

      {/* REPORTS */}
      {modal === "REPORTS" && (
        <div className="dispatch-modal-overlay" onClick={closeModal}>
          <div className="dispatch-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dispatch-modal-header"><div><h2>Dispatch Reports</h2><p>Current dashboard data.</p></div><button type="button" className="dispatch-close-btn" onClick={closeModal}><X size={18} /></button></div>
            <div className="dispatch-report-summary"><div><span>Total Dispatches</span><strong>{formatNumber(stats.totalDispatches)}</strong></div><div><span>Total Quantity</span><strong>{formatNumber(stats.totalQuantity)}</strong></div><div><span>Delivered</span><strong>{formatNumber(stats.delivered)}</strong></div><div><span>Pending</span><strong>{formatNumber(stats.pending)}</strong></div></div>
            <div className="dispatch-modal-footer"><button type="button" className="dispatch-secondary-btn" onClick={closeModal}>Close</button><button type="button" className="dispatch-primary-btn" onClick={exportCsv}><Download size={15} />Export CSV</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatchManagement;