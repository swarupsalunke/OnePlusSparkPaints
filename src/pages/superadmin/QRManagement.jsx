import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  QrCode,
  Upload,
  Download,
  Plus,
  Search,
  Filter,
  RotateCcw,
  Eye,
  Pencil,
  MoreVertical,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Package,
  ScanLine,
  ShieldAlert,
  CircleCheck,
  CircleX,
  Clock3,
  Ban,
  FileWarning,
  Printer,
  FileText,
  RefreshCw,
  Trash2,
} from "lucide-react";
import "../../css/superadmin/QRCodeManagement.css";

const API_BASE = "https://oneplussparkpaintsserver.onrender.com/api";

const QR_STATUS = [
  "Unused",
  "Used",
  "Expired",
  "Blocked",
  "Invalid / Duplicate",
];

const QR_TYPES = ["QR", "Barcode"];

const emptyForm = {
  qrCode: "",
  qrType: "QR",
  product: "",
  batchNo: "",
  dealer: "",
  painter: "",
  points: "",
  expiryDate: "",
  status: "Unused",
};

const formatDate = (date) => {
  if (!date) return "-";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "-";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusClass = (status) => {
  switch (status) {
    case "Unused":
      return "qr-status unused";

    case "Used":
      return "qr-status used";

    case "Expired":
      return "qr-status expired";

    case "Blocked":
      return "qr-status blocked";

    case "Invalid":
    case "Duplicate":
    case "Invalid / Duplicate":
      return "qr-status invalid";

    default:
      return "qr-status";
  }
};

const getProductName = (qr) => {
  return qr?.product?.productName || qr?.product?.name || "-";
};

const getDealerName = (qr) => {
  return qr?.dealer?.name || "-";
};

const getPainterName = (qr) => {
  return qr?.painter?.name || "-";
};

const QRManagement = () => {
  const token = localStorage.getItem("token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };


  // DATA


  const [qrs, setQrs] = useState([]);
  const [products, setProducts] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [painters, setPainters] = useState([]);
  const [scanHistory, setScanHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);


  // FILTERS (live - applied instantly, no extra "apply" step)


  const [searchInput, setSearchInput] = useState("");

  const [filterDraft, setFilterDraft] = useState({
    product: "",
    batch: "",
    status: "",
    qrType: "",
    startDate: "",
    endDate: "",
  });


  // UI


  const [activeTab, setActiveTab] = useState("All QR Codes");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedQR, setSelectedQR] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQR, setEditingQR] = useState(null);

  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const [openActionId, setOpenActionId] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  const fileInputRef = useRef(null);
  const actionMenuRef = useRef(null);


  // FETCH QR LIST


  const fetchQrs = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_BASE}/qr`, authConfig);

      setQrs(response.data?.qrs || []);
    } catch (error) {
      console.error("Fetch QR error:", error);

      alert(
        error.response?.data?.message ||
        "Failed to fetch QR / Barcode list"
      );
    } finally {
      setLoading(false);
    }
  };


  // FETCH PRODUCTS


  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/products`,
        authConfig
      );

      setProducts(response.data?.products || []);
    } catch (error) {
      console.error("Fetch products error:", error);
    }
  };


  // FETCH DEALERS


  const fetchDealers = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/users`,
        {
          ...authConfig,
          params: {
            role: "DEALER",
          },
        }
      );

      setDealers(response.data?.users || []);
    } catch (error) {
      console.error("Fetch dealers error:", error);
    }
  };


  // FETCH PAINTERS


  const fetchPainters = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/users`,
        {
          ...authConfig,
          params: {
            role: "PAINTER",
          },
        }
      );

      setPainters(response.data?.users || []);
    } catch (error) {
      console.error("Fetch painters error:", error);
    }
  };


  // FETCH SCAN HISTORY


  const fetchScanHistory = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/qr/scan-history`,
        authConfig
      );

      setScanHistory(response.data?.history || []);
    } catch (error) {
      console.error("Fetch scan history error:", error);
    }
  };


  // INITIAL LOAD


  useEffect(() => {
    fetchQrs();
    fetchProducts();
    fetchDealers();
    fetchPainters();
    fetchScanHistory();
  }, []);


  // CLOSE "MORE" ACTION MENU ON OUTSIDE CLICK


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openActionId &&
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target)
      ) {
        setOpenActionId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [openActionId]);


  // UNIQUE BATCHES


  const batches = useMemo(() => {
    return [
      ...new Set(
        qrs
          .map((qr) => qr.batchNo)
          .filter(Boolean)
      ),
    ];
  }, [qrs]);

  const filteredQrs = useMemo(() => {
    const searchValue = searchInput.toLowerCase().trim();

    return qrs.filter((qr) => {
      // SEARCH

      const matchesSearch =
        !searchValue ||
        qr.qrCode?.toLowerCase().includes(searchValue) ||
        qr.batchNo?.toLowerCase().includes(searchValue) ||
        getProductName(qr)?.toLowerCase().includes(searchValue) ||
        getDealerName(qr)?.toLowerCase().includes(searchValue) ||
        getPainterName(qr)?.toLowerCase().includes(searchValue);

      // PRODUCT

      const matchesProduct =
        !filterDraft.product ||
        qr.product?._id === filterDraft.product;

      // BATCH

      const matchesBatch =
        !filterDraft.batch || qr.batchNo === filterDraft.batch;

      // STATUS

      const matchesStatus =
        !filterDraft.status ||
        qr.status === filterDraft.status ||
        (filterDraft.status === "Invalid / Duplicate" &&
          (qr.status === "Invalid" || qr.status === "Duplicate"));

      // TYPE

      const matchesType =
        !filterDraft.qrType || qr.qrType === filterDraft.qrType;

      // DATE

      const generatedDate = qr.generatedOn
        ? new Date(qr.generatedOn)
        : null;

      const matchesStartDate =
        !filterDraft.startDate ||
        (generatedDate &&
          generatedDate >=
          new Date(`${filterDraft.startDate}T00:00:00`));

      const matchesEndDate =
        !filterDraft.endDate ||
        (generatedDate &&
          generatedDate <=
          new Date(`${filterDraft.endDate}T23:59:59`));

      // TAB

      let matchesTab = true;

      if (activeTab === "Unused") {
        matchesTab = qr.status === "Unused";
      }

      if (activeTab === "Used") {
        matchesTab = qr.status === "Used";
      }

      if (activeTab === "Expired") {
        matchesTab = qr.status === "Expired";
      }

      if (activeTab === "Blocked") {
        matchesTab = qr.status === "Blocked";
      }

      if (activeTab === "Invalid / Duplicate") {
        matchesTab =
          qr.status === "Invalid" || qr.status === "Duplicate";
      }

      return (
        matchesSearch &&
        matchesProduct &&
        matchesBatch &&
        matchesStatus &&
        matchesType &&
        matchesStartDate &&
        matchesEndDate &&
        matchesTab
      );
    });
  }, [qrs, searchInput, filterDraft, activeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchInput, filterDraft, activeTab]);


  // RESET FILTER


  const handleResetFilters = () => {
    setSearchInput("");

    setFilterDraft({
      product: "",
      batch: "",
      status: "",
      qrType: "",
      startDate: "",
      endDate: "",
    });

    setActiveTab("All QR Codes");
    setCurrentPage(1);
  };


  // STATUS COUNTS


  const statusCounts = useMemo(() => {
    const counts = {
      total: qrs.length,
      unused: 0,
      used: 0,
      expired: 0,
      blocked: 0,
      invalid: 0,
    };

    qrs.forEach((qr) => {
      switch (qr.status) {
        case "Unused":
          counts.unused++;
          break;

        case "Used":
          counts.used++;
          break;

        case "Expired":
          counts.expired++;
          break;

        case "Blocked":
          counts.blocked++;
          break;

        case "Invalid":
        case "Duplicate":
          counts.invalid++;
          break;

        default:
          break;
      }
    });

    return counts;
  }, [qrs]);


  // STATUS PERCENTAGE


  const getPercentage = (value) => {
    if (!statusCounts.total) return "0";

    return (
      (value / statusCounts.total) *
      100
    ).toFixed(2);
  };

  const donutStyle = useMemo(() => {
    const total = statusCounts.total || 1;

    const unused =
      (statusCounts.unused / total) * 100;

    const used =
      (statusCounts.used / total) * 100;

    const expired =
      (statusCounts.expired / total) * 100;

    const blocked =
      (statusCounts.blocked / total) * 100;

    const invalid =
      (statusCounts.invalid / total) * 100;

    const unusedEnd = unused;

    const usedEnd = unusedEnd + used;

    const expiredEnd = usedEnd + expired;

    const blockedEnd = expiredEnd + blocked;

    const invalidEnd = blockedEnd + invalid;

    return {
      background: `conic-gradient(
        #34c759 0% ${unusedEnd}%,
        #1683ff ${unusedEnd}% ${usedEnd}%,
        #ff9f43 ${usedEnd}% ${expiredEnd}%,
        #ff4d4f ${expiredEnd}% ${blockedEnd}%,
        #8b5cf6 ${blockedEnd}% ${invalidEnd}%,
        #e9edf3 ${invalidEnd}% 100%
      )`,
    };
  }, [statusCounts]);


  // PAGINATION


  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredQrs.length / pageSize
    )
  );

  const startIndex =
    (currentPage - 1) * pageSize;

  const currentQrs = filteredQrs.slice(
    startIndex,
    startIndex + pageSize
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);


  // VIEW QR


  const handleViewQR = async (qr) => {
    setSelectedQR(qr);
    setShowViewModal(true);

    try {
      const response = await axios.get(
        `${API_BASE}/qr/${qr._id}`,
        authConfig
      );

      setSelectedQR(response.data?.qr || qr);
    } catch (error) {
      console.error("View QR error:", error);
    }
  };


  // EDIT QR


  const handleEditQR = (qr) => {
    setEditingQR(qr);

    setFormData({
      qrCode: qr.qrCode || "",
      qrType: qr.qrType || "QR",
      product: qr.product?._id || "",
      batchNo: qr.batchNo || "",
      dealer: qr.dealer?._id || "",
      painter: qr.painter?._id || "",
      points:
        qr.points !== undefined
          ? String(qr.points)
          : "",
      expiryDate: qr.expiryDate
        ? new Date(qr.expiryDate)
          .toISOString()
          .split("T")[0]
        : "",
      status: qr.status || "Unused",
    });

    setShowEditModal(true);
    setOpenActionId(null);
  };


  // FORM CHANGE


  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // UPDATE QR


  const handleUpdateQR = async (e) => {
    e.preventDefault();

    if (!editingQR?._id) return;

    if (!formData.qrCode.trim()) {
      alert("Please enter QR / Barcode number");
      return;
    }

    if (!formData.product) {
      alert("Please select product");
      return;
    }

    if (!formData.dealer) {
      alert("Please select dealer");
      return;
    }

    if (!formData.painter) {
      alert("Please select painter");
      return;
    }

    try {
      setSaving(true);

      const selectedProduct = products.find(
        (p) => p._id === formData.product
      );
      const selectedDealer = dealers.find(
        (d) => d._id === formData.dealer
      );
      const selectedPainter = painters.find(
        (p) => p._id === formData.painter
      );

      const payload = {
        qrCode: formData.qrCode.trim(),
        qrType: formData.qrType,
        product: formData.product,
        batchNo: formData.batchNo.trim(),
        dealer: formData.dealer,
        painter: formData.painter,
        points: Number(formData.points) || 0,
        expiryDate: formData.expiryDate,
        status: formData.status,
      };

      let updatedFromApi = null;

      try {
        const response = await axios.put(
          `${API_BASE}/qr/${editingQR._id}`,
          payload,
          authConfig
        );

        updatedFromApi = response.data?.qr || null;
      } catch (apiError) {
        console.error("Update QR API error:", apiError);
        alert(
          apiError.response?.data?.message ||
          "Failed to update QR / Barcode on the server"
        );
        setSaving(false);
        return;
      }

      // Optimistic / local update so the table & modals refresh
      // immediately regardless of API outcome.
      setQrs((prev) =>
        prev.map((qr) => {
          if (qr._id !== editingQR._id) return qr;

          return (
            updatedFromApi || {
              ...qr,
              qrCode: payload.qrCode,
              qrType: payload.qrType,
              product: selectedProduct || qr.product,
              batchNo: payload.batchNo,
              dealer: selectedDealer || qr.dealer,
              painter: selectedPainter || qr.painter,
              points: payload.points,
              expiryDate: payload.expiryDate,
              status: payload.status,
            }
          );
        })
      );

      alert("QR / Barcode updated successfully");

      setShowEditModal(false);
      setEditingQR(null);
      setFormData(emptyForm);
    } catch (error) {
      console.error("Update QR error:", error);

      alert(
        error.response?.data?.message ||
        "Failed to update QR / Barcode"
      );
    } finally {
      setSaving(false);
    }
  };


  // DELETE QR


  const handleDeleteQR = async (id) => {
    setOpenActionId(null);

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this QR / Barcode?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE}/qr/${id}`, authConfig);

      alert("QR / Barcode deleted successfully");

      setQrs((prev) => prev.filter((qr) => qr._id !== id));
    } catch (error) {
      console.error("Delete QR error:", error);

      alert(
        error.response?.data?.message ||
        "Failed to delete QR / Barcode"
      );
    }
  };


  // GENERATE FORM


  const openGenerateModal = () => {
    setEditingQR(null);

    setFormData({
      ...emptyForm,
      qrType: "QR",
      status: "Unused",
    });

    setShowGenerateModal(true);
  };


  // CREATE QR


  const handleCreateQR = async (e) => {
    e.preventDefault();

    if (!formData.qrCode.trim()) {
      alert("Please enter QR / Barcode number");
      return;
    }

    if (!formData.product) {
      alert("Please select product");
      return;
    }

    if (!formData.batchNo.trim()) {
      alert("Please enter batch number");
      return;
    }

    if (!formData.dealer) {
      alert("Please select dealer");
      return;
    }

    if (!formData.painter) {
      alert("Please select painter");
      return;
    }

    if (
      formData.points === "" ||
      Number(formData.points) < 0
    ) {
      alert("Please enter valid points");
      return;
    }

    if (!formData.expiryDate) {
      alert("Please select expiry date");
      return;
    }

    const duplicate = qrs.find(
      (qr) =>
        qr.qrCode.trim().toLowerCase() ===
        formData.qrCode.trim().toLowerCase()
    );

    if (duplicate) {
      alert("A QR / Barcode with this number already exists");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        qrCode: formData.qrCode.trim(),
        qrType: formData.qrType,
        product: formData.product,
        batchNo: formData.batchNo.trim(),
        dealer: formData.dealer,
        painter: formData.painter,
        points: Number(formData.points),
        expiryDate: formData.expiryDate,
      };

      const response = await axios.post(
        `${API_BASE}/qr`,
        payload,
        authConfig
      );

      const created = response.data?.qr;

      if (created) {
        setQrs((prev) => [created, ...prev]);
      } else {
        // Server didn't echo back the created record - just
        // refresh the list from the API instead.
        await fetchQrs();
      }

      alert("QR / Barcode generated successfully");

      setShowGenerateModal(false);
      setFormData(emptyForm);
      setCurrentPage(1);
    } catch (error) {
      console.error("Create QR error:", error);

      alert(
        error.response?.data?.message ||
        "Failed to generate QR / Barcode"
      );
    } finally {
      setSaving(false);
    }
  };


  // EXPORT


  const handleExport = () => {
    if (!filteredQrs.length) {
      alert("No QR data available to export");
      return;
    }

    const headers = [
      "QR Code",
      "QR Type",
      "Product",
      "Batch No",
      "Dealer",
      "Painter",
      "Points",
      "Status",
      "Generated On",
      "Expiry Date",
    ];

    const rows = filteredQrs.map((qr) => [
      qr.qrCode || "",
      qr.qrType || "",
      getProductName(qr),
      qr.batchNo || "",
      getDealerName(qr),
      getPainterName(qr),
      qr.points ?? "",
      qr.status || "",
      formatDateTime(qr.generatedOn),
      formatDate(qr.expiryDate),
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "qr-code-management.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };


  // IMPORT


  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    alert(
      `${file.name} selected. Import processing is not available in the current backend.`
    );

    e.target.value = "";
  };


  // TOP PRODUCTS BY SCANS


  const topProducts = useMemo(() => {
    const map = {};

    scanHistory.forEach((scan) => {
      const productId =
        scan.product?._id ||
        scan.product;

      const productName =
        scan.product?.productName ||
        "Unknown Product";

      if (!productId) return;

      if (!map[productId]) {
        map[productId] = {
          id: productId,
          name: productName,
          scans: 0,
        };
      }

      map[productId].scans += 1;
    });

    return Object.values(map)
      .sort(
        (a, b) =>
          b.scans - a.scans
      )
      .slice(0, 5);
  }, [scanHistory]);


  // SCAN SUMMARY


  const scanSummary = useMemo(() => {
    return {
      total: scanHistory.length,

      valid: scanHistory.filter(
        (item) =>
          item.scanStatus === "Valid"
      ).length,

      invalid: scanHistory.filter(
        (item) =>
          item.scanStatus === "Invalid"
      ).length,

      duplicate: scanHistory.filter(
        (item) =>
          item.scanStatus === "Duplicate"
      ).length,

      fraud: scanHistory.filter(
        (item) =>
          item.scanStatus === "Fraud"
      ).length,
    };
  }, [scanHistory]);


  // TABS


  const tabs = [
    "All QR Codes",
    "Unused",
    "Used",
    "Expired",
    "Blocked",
    "Invalid / Duplicate",
  ];


  // RENDER


  return (
    <div className="qr-management-page">

      {/*               HEADER           */}

      <div className="qr-page-header">

        <div>
          <h1>QR Code Management</h1>

          <div className="qr-breadcrumb">
            <span>Dashboard</span>
            <span>›</span>
            <span>QR Code Management</span>
            <span>›</span>
            <strong>QR Codes List</strong>
          </div>
        </div>

        <div className="qr-header-actions">

          <button
            className="qr-primary-btn"
            onClick={openGenerateModal}
          >
            <Plus size={15} />
            Generate QR Codes
          </button>

          <button
            className="qr-outline-btn"
            onClick={handleImportClick}
          >
            <Upload size={15} />
            Import QR Codes
          </button>

          <button
            className="qr-outline-btn"
            onClick={handleExport}
          >
            <Download size={15} />
            Export
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            hidden
            onChange={handleImportFile}
          />

        </div>
      </div>

      {/*               STAT CARDS            */}

      <div className="qr-stat-grid">

        <div className="qr-stat-card total">
          <div className="qr-stat-icon">
            <QrCode size={20} />
          </div>

          <div>
            <span>Total QR Codes</span>
            <strong>
              {statusCounts.total.toLocaleString()}
            </strong>
            <small>
              All generated QR codes
            </small>
          </div>
        </div>

        <div className="qr-stat-card unused">
          <div className="qr-stat-icon">
            <Package size={20} />
          </div>

          <div>
            <span>Unused</span>
            <strong>
              {statusCounts.unused.toLocaleString()}
            </strong>
            <small>
              {getPercentage(
                statusCounts.unused
              )}% of total
            </small>
          </div>
        </div>

        <div className="qr-stat-card used">
          <div className="qr-stat-icon">
            <ScanLine size={20} />
          </div>

          <div>
            <span>Used</span>
            <strong>
              {statusCounts.used.toLocaleString()}
            </strong>
            <small>
              {getPercentage(
                statusCounts.used
              )}% of total
            </small>
          </div>
        </div>

        <div className="qr-stat-card expired">
          <div className="qr-stat-icon">
            <Clock3 size={20} />
          </div>

          <div>
            <span>Expired</span>
            <strong>
              {statusCounts.expired.toLocaleString()}
            </strong>
            <small>
              {getPercentage(
                statusCounts.expired
              )}% of total
            </small>
          </div>
        </div>

        <div className="qr-stat-card blocked">
          <div className="qr-stat-icon">
            <Ban size={20} />
          </div>

          <div>
            <span>Blocked</span>
            <strong>
              {statusCounts.blocked.toLocaleString()}
            </strong>
            <small>
              {getPercentage(
                statusCounts.blocked
              )}% of total
            </small>
          </div>
        </div>

        <div className="qr-stat-card invalid">
          <div className="qr-stat-icon">
            <ShieldAlert size={20} />
          </div>

          <div>
            <span>Invalid / Duplicate</span>
            <strong>
              {statusCounts.invalid.toLocaleString()}
            </strong>
            <small>
              Invalid / duplicate scans
            </small>
          </div>
        </div>

      </div>

      {/*                FILTER + RIGHT OVERVIEW AREA            */}

      <div className="qr-main-grid">

        {/* LEFT MAIN */}

        <div className="qr-left-content">

          {/* FILTER CARD */}

          <div className="qr-filter-card">

            <div className="qr-search-box">

              <input
                type="text"
                placeholder="Search by QR code / product / batch..."
                value={searchInput}
                onChange={(e) =>
                  setSearchInput(e.target.value)
                }
              />
              <Search size={16} />

              {searchInput && (
                <button
                  type="button"
                  className="qr-search-clear"
                  onClick={() => setSearchInput("")}
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="qr-filter-field">
              <label>Product</label>

              <select
                value={filterDraft.product}
                onChange={(e) =>
                  setFilterDraft((prev) => ({
                    ...prev,
                    product: e.target.value,
                  }))
                }
              >
                <option value="">
                  All Products
                </option>

                {products.map((product) => (
                  <option
                    key={product._id}
                    value={product._id}
                  >
                    {product.productName}
                  </option>
                ))}
              </select>
            </div>

            <div className="qr-filter-field">
              <label>Batch</label>

              <select
                value={filterDraft.batch}
                onChange={(e) =>
                  setFilterDraft((prev) => ({
                    ...prev,
                    batch: e.target.value,
                  }))
                }
              >
                <option value="">
                  All Batches
                </option>

                {batches.map((batch) => (
                  <option
                    key={batch}
                    value={batch}
                  >
                    {batch}
                  </option>
                ))}
              </select>
            </div>

            <div className="qr-filter-field">
              <label>QR Status</label>

              <select
                value={filterDraft.status}
                onChange={(e) =>
                  setFilterDraft((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
              >
                <option value="">
                  All Status
                </option>

                {QR_STATUS.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="qr-filter-field">
              <label>QR Type</label>

              <select
                value={filterDraft.qrType}
                onChange={(e) =>
                  setFilterDraft((prev) => ({
                    ...prev,
                    qrType: e.target.value,
                  }))
                }
              >
                <option value="">
                  All Types
                </option>

                {QR_TYPES.map((type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="qr-date-field">
              <label>Date Range</label>

              <div className="qr-date-wrapper">

                <input
                  type="date"
                  value={filterDraft.startDate}
                  onChange={(e) =>
                    setFilterDraft((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                />

                <span>−</span>

                <input
                  type="date"
                  value={filterDraft.endDate}
                  onChange={(e) =>
                    setFilterDraft((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                />

              </div>
            </div>

            <button
              className="qr-filter-btn"
              onClick={() => setCurrentPage(1)}
            >
              <Filter size={16} />
              Filters
            </button>

            <button
              className="qr-reset-btn"
              onClick={handleResetFilters}
            >
              Reset
            </button>

          </div>

          {/*                  TABS               */}

          <div className="qr-tabs">

            {tabs.map((tab) => (
              <button
                key={tab}
                className={
                  activeTab === tab
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
              >
                {tab}
              </button>
            ))}

          </div>

          {/*                   TABLE               */}

          <div className="qr-table-card">

            <div className="qr-table-wrapper">

              <table className="qr-table">

                <thead>
                  <tr>
                    <th>
                      <input type="checkbox" />
                    </th>

                    <th>QR Code</th>
                    <th>Product</th>
                    <th>Batch No.</th>
                    <th>Dealer / Shop</th>
                    <th>Painter</th>
                    <th>Points</th>
                    <th>Status</th>
                    <th>Generated On</th>
                    <th>Expiry Date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {loading ? (
                    <tr>
                      <td
                        colSpan="11"
                        className="qr-empty-cell"
                      >
                        <RefreshCw
                          size={20}
                          className="qr-spin"
                        />
                        Loading QR codes...
                      </td>
                    </tr>
                  ) : currentQrs.length === 0 ? (
                    <tr>
                      <td
                        colSpan="11"
                        className="qr-empty-cell"
                      >
                        No QR / Barcode found
                      </td>
                    </tr>
                  ) : (
                    currentQrs.map((qr) => (
                      <tr key={qr._id}>

                        <td>
                          <input type="checkbox" />
                        </td>

                        <td>
                          <div className="qr-code-cell">

                            <div className="fake-qr">
                              <QrCode size={28} />
                            </div>

                            <div>
                              <strong>
                                {qr.qrCode}
                              </strong>

                              <small>
                                Type: {qr.qrType}
                              </small>
                            </div>

                          </div>
                        </td>

                        <td>
                          <div className="qr-product-cell">
                            <strong>
                              {getProductName(qr)}
                            </strong>

                            <small>
                              {qr.product?.sku ||
                                "-"}
                            </small>
                          </div>
                        </td>

                        <td>
                          <strong>
                            {qr.batchNo || "-"}
                          </strong>

                          <small className="qr-sub-text">
                            {formatDate(
                              qr.generatedOn
                            )}
                          </small>
                        </td>

                        <td>
                          <strong>
                            {getDealerName(qr)}
                          </strong>

                          <small className="qr-sub-text">
                            {qr.dealer?.city ||
                              qr.dealer?.district ||
                              "-"}
                          </small>
                        </td>

                        <td>
                          <strong>
                            {getPainterName(qr)}
                          </strong>

                          <small className="qr-sub-text">
                            {qr.painter?.mobile ||
                              "-"}
                          </small>
                        </td>

                        <td>
                          <strong>
                            {qr.points ?? 0}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={getStatusClass(
                              qr.status
                            )}
                          >
                            {qr.status}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {formatDateTime(
                              qr.generatedOn
                            )}
                          </strong>
                        </td>

                        <td>
                          <strong
                            className={
                              qr.status ===
                                "Expired"
                                ? "qr-expired-date"
                                : ""
                            }
                          >
                            {formatDate(
                              qr.expiryDate
                            )}
                          </strong>
                        </td>

                        <td>

                          <div className="qr-action-cell">

                            <button
                              className="qr-icon-btn"
                              title="View QR"
                              onClick={() =>
                                handleViewQR(qr)
                              }
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              className="qr-icon-btn"
                              title="Edit QR"
                              onClick={() =>
                                handleEditQR(qr)
                              }
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              className="qr-icon-btn qr-icon-btn-delete"
                              title="More"
                              onClick={() =>
                                handleDeleteQR(
                                  openActionId ===
                                    qr._id
                                    ? null
                                    : qr._id
                                )
                              }
                            >
                              <Trash2
                                size={17}
                              />
                            </button>
                          </div>

                        </td>

                      </tr>
                    ))
                  )}

                </tbody>

              </table>

            </div>

            {/*                     PAGINATION                 */}

            <div className="qr-pagination">

              <span>
                Showing{" "}
                {filteredQrs.length === 0
                  ? 0
                  : startIndex + 1}{" "}
                to{" "}
                {Math.min(
                  startIndex +
                  pageSize,
                  filteredQrs.length
                )}{" "}
                of{" "}
                {filteredQrs.length.toLocaleString()}{" "}
                entries
              </span>

              <div className="qr-pagination-controls">

                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage(
                      (prev) =>
                        Math.max(
                          1,
                          prev - 1
                        )
                    )
                  }
                >
                  <ChevronLeft size={15} />
                </button>

                {Array.from(
                  {
                    length: Math.min(
                      totalPages,
                      5
                    ),
                  },
                  (_, index) => {
                    const windowStart = Math.max(
                      1,
                      Math.min(
                        currentPage - 2,
                        totalPages - 4
                      )
                    );

                    return windowStart + index;
                  }
                )
                  .filter(
                    (page) =>
                      page >= 1 && page <= totalPages
                  )
                  .map((page) => (
                    <button
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
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (prev) =>
                        Math.min(
                          totalPages,
                          prev + 1
                        )
                    )
                  }
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

          </div>

        </div>

        {/*                  RIGHT SIDEBAR              */}

        <aside className="qr-right-sidebar">

          {/*                   QR STATUS OVERVIEW               */}

          <div className="qr-side-card">

            <div className="qr-side-card-header">
              <h3>QR Status Overview</h3>
            </div>

            <div className="qr-donut-area">

              <div
                className="qr-donut"
                style={donutStyle}
              >
                <div className="qr-donut-center">
                  <strong>
                    {statusCounts.total.toLocaleString()}
                  </strong>

                  <span>
                    Total QR Codes
                  </span>
                </div>
              </div>

              <div className="qr-donut-legend">

                <div>
                  <i className="dot unused" />
                  <span>Unused</span>
                  <strong>
                    {statusCounts.unused.toLocaleString()}
                  </strong>
                </div>

                <div>
                  <i className="dot used" />
                  <span>Used</span>
                  <strong>
                    {statusCounts.used.toLocaleString()}
                  </strong>
                </div>

                <div>
                  <i className="dot expired" />
                  <span>Expired</span>
                  <strong>
                    {statusCounts.expired.toLocaleString()}
                  </strong>
                </div>

                <div>
                  <i className="dot blocked" />
                  <span>Blocked</span>
                  <strong>
                    {statusCounts.blocked.toLocaleString()}
                  </strong>
                </div>

                <div>
                  <i className="dot invalid" />
                  <span>Invalid / Duplicate</span>
                  <strong>
                    {statusCounts.invalid.toLocaleString()}
                  </strong>
                </div>

              </div>

            </div>

          </div>

          {/*                   SCAN SUMMARY             */}

          <div className="qr-side-card">

            <div className="qr-side-card-header">
              <h3>
                Scan Summary (This Month)
              </h3>
            </div>

            <div className="qr-scan-summary-grid">

              <div>
                <div className="scan-summary-icon total">
                  <QrCode size={16} />
                </div>

                <span>Total Scans</span>

                <strong>
                  {scanSummary.total.toLocaleString()}
                </strong>
              </div>

              <div>
                <div className="scan-summary-icon valid">
                  <CircleCheck size={16} />
                </div>

                <span>Valid Scans</span>

                <strong>
                  {scanSummary.valid.toLocaleString()}
                </strong>
              </div>

              <div>
                <div className="scan-summary-icon invalid">
                  <FileWarning size={16} />
                </div>

                <span>Invalid Scans</span>

                <strong>
                  {scanSummary.invalid.toLocaleString()}
                </strong>
              </div>

              <div>
                <div className="scan-summary-icon duplicate">
                  <CircleX size={16} />
                </div>

                <span>Duplicate Scans</span>

                <strong>
                  {scanSummary.duplicate.toLocaleString()}
                </strong>
              </div>

            </div>

          </div>

          {/*                   TOP PRODUCTS               */}

          <div className="qr-side-card">

            <div className="qr-side-card-header">

              <h3>
                Top Products by Scans
              </h3>

            </div>

            <div className="qr-top-products">

              {topProducts.length === 0 ? (
                <div className="qr-side-empty">
                  No scan data available
                </div>
              ) : (
                topProducts.map(
                  (product, index) => (
                    <div
                      className="qr-top-product"
                      key={product.id}
                    >

                      <span className="rank">
                        {index + 1}
                      </span>

                      <div className="product-mini-icon">
                        <Package size={16} />
                      </div>

                      <strong>
                        {product.name}
                      </strong>

                      <span>
                        {product.scans} scans
                      </span>

                    </div>
                  )
                )
              )}

            </div>

          </div>

          {/*                   QUICK ACTIONS               */}

          <div className="qr-side-card">

            <div className="qr-side-card-header">
              <h3>Quick Actions</h3>
            </div>

            <div className="qr-quick-actions">

              <button
                onClick={openGenerateModal}
              >
                <span>
                  <QrCode size={16} />
                </span>

                <div>
                  <strong>
                    Generate QR Codes
                  </strong>

                  <small>
                    Create new QR / Barcode
                  </small>
                </div>
              </button>

              <button
                onClick={handleImportClick}
              >
                <span>
                  <Upload size={16} />
                </span>

                <div>
                  <strong>
                    Import QR Codes
                  </strong>

                  <small>
                    Import QR data
                  </small>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab(
                    "Invalid / Duplicate"
                  );

                  setCurrentPage(1);
                }}
              >
                <span>
                  <ShieldAlert size={16} />
                </span>

                <div>
                  <strong>
                    Invalid Scan Report
                  </strong>

                  <small>
                    View invalid / duplicate
                  </small>
                </div>
              </button>

            </div>

          </div>

        </aside>
      </div>

      {/*                VIEW MODAL            */}

      {showViewModal &&
        selectedQR && (
          <div
            className="qr-modal-overlay"
            onClick={() =>
              setShowViewModal(false)
            }
          >
            <div
              className="qr-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="qr-modal-header">

                <div>
                  <h2>QR Code Details</h2>
                  <p>
                    Complete QR / Barcode
                    information
                  </p>
                </div>
              </div>

              <div className="qr-view-content">

                <div className="qr-view-code">
                  <QrCode size={90} />

                  <strong>
                    {selectedQR.qrCode}
                  </strong>

                  <span
                    className={getStatusClass(
                      selectedQR.status
                    )}
                  >
                    {selectedQR.status}
                  </span>
                </div>

                <div className="qr-detail-grid">

                  <div>
                    <label>QR Type</label>
                    <strong>
                      {selectedQR.qrType}
                    </strong>
                  </div>

                  <div>
                    <label>Batch No.</label>
                    <strong>
                      {selectedQR.batchNo}
                    </strong>
                  </div>

                  <div>
                    <label>Product</label>
                    <strong>
                      {getProductName(
                        selectedQR
                      )}
                    </strong>
                  </div>

                  <div>
                    <label>SKU</label>
                    <strong>
                      {selectedQR.product?.sku ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <label>Dealer / Shop</label>
                    <strong>
                      {getDealerName(
                        selectedQR
                      )}
                    </strong>
                  </div>

                  <div>
                    <label>Painter</label>
                    <strong>
                      {getPainterName(
                        selectedQR
                      )}
                    </strong>
                  </div>

                  <div>
                    <label>Points</label>
                    <strong>
                      {selectedQR.points}
                    </strong>
                  </div>

                  <div>
                    <label>Generated On</label>
                    <strong>
                      {formatDateTime(
                        selectedQR.generatedOn
                      )}
                    </strong>
                  </div>

                  <div>
                    <label>Expiry Date</label>
                    <strong>
                      {formatDate(
                        selectedQR.expiryDate
                      )}
                    </strong>
                  </div>

                  <div>
                    <label>QR ID</label>
                    <strong>
                      {selectedQR._id}
                    </strong>
                  </div>

                </div>

              </div>

              <div className="qr-modal-footer">


                <button
                  className="qr-close-btn"
                  onClick={() =>
                    setShowViewModal(false)
                  }
                >
                  Close
                </button>

              </div>

            </div>
          </div>
        )}

      {/*               GENERATE MODAL            */}

      {showGenerateModal && (
        <div
          className="qr-modal-overlay"
          onClick={() =>
            setShowGenerateModal(false)
          }
        >
          <div
            className="qr-modal qr-form-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="qr-modal-header">

              <div>
                <h2>Generate QR / Barcode</h2>
                <p>
                  Create a new QR / Barcode
                </p>
              </div>

            </div>

            <form
              onSubmit={handleCreateQR}
            >

              <div className="qr-form-grid">

                <div className="qr-form-field">
                  <label>
                    QR / Barcode Number *
                  </label>

                  <input
                    name="qrCode"
                    value={formData.qrCode}
                    onChange={handleFormChange}
                    placeholder="QR-2026-000003"
                  />
                </div>

                <div className="qr-form-field">
                  <label>QR Type *</label>

                  <select
                    name="qrType"
                    value={formData.qrType}
                    onChange={handleFormChange}
                  >
                    {QR_TYPES.map(
                      (type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="qr-form-field">
                  <label>Product *</label>

                  <select
                    name="product"
                    value={formData.product}
                    onChange={handleFormChange}
                  >
                    <option value="">
                      Select Product
                    </option>

                    {products.map(
                      (product) => (
                        <option
                          key={product._id}
                          value={product._id}
                        >
                          {product.productName}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="qr-form-field">
                  <label>Batch No. *</label>

                  <input
                    name="batchNo"
                    value={formData.batchNo}
                    onChange={handleFormChange}
                    placeholder="BATCH-001"
                  />
                </div>

                <div className="qr-form-field">
                  <label>Dealer / Shop *</label>

                  <select
                    name="dealer"
                    value={formData.dealer}
                    onChange={handleFormChange}
                  >
                    <option value="">
                      Select Dealer
                    </option>

                    {dealers.map(
                      (dealer) => (
                        <option
                          key={dealer._id}
                          value={dealer._id}
                        >
                          {dealer.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="qr-form-field">
                  <label>Painter *</label>

                  <select
                    name="painter"
                    value={formData.painter}
                    onChange={handleFormChange}
                  >
                    <option value="">
                      Select Painter
                    </option>

                    {painters.map(
                      (painter) => (
                        <option
                          key={painter._id}
                          value={painter._id}
                        >
                          {painter.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="qr-form-field">
                  <label>Points *</label>

                  <input
                    type="number"
                    name="points"
                    value={formData.points}
                    onChange={handleFormChange}
                    placeholder="10"
                    min="0"
                  />
                </div>

                <div className="qr-form-field">
                  <label>Expiry Date *</label>

                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleFormChange}
                  />
                </div>

              </div>

              <div className="qr-modal-footer">

                <button
                  type="button"
                  className="qr-cancel-btn"
                  onClick={() =>
                    setShowGenerateModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="qr-primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Generating..."
                    : "Generate QR"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/*                EDIT MODAL            */}

      {showEditModal && editingQR && (
        <div
          className="qr-modal-overlay"
          onClick={() =>
            setShowEditModal(false)
          }
        >
          <div
            className="qr-modal qr-form-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="qr-modal-header">

              <div>
                <h2>Edit QR / Barcode</h2>
                <p>
                  Update QR / Barcode details
                </p>
              </div>

              <button
                onClick={() =>
                  setShowEditModal(false)
                }
              >
                <X size={18} />
              </button>

            </div>

            <form
              onSubmit={handleUpdateQR}
            >

              <div className="qr-form-grid">

                <div className="qr-form-field">
                  <label>
                    QR / Barcode Number
                  </label>

                  <input
                    name="qrCode"
                    value={formData.qrCode}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="qr-form-field">
                  <label>QR Type</label>

                  <select
                    name="qrType"
                    value={formData.qrType}
                    onChange={handleFormChange}
                  >
                    {QR_TYPES.map(
                      (type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="qr-form-field">
                  <label>Product</label>

                  <select
                    name="product"
                    value={formData.product}
                    onChange={handleFormChange}
                  >
                    <option value="">
                      Select Product
                    </option>

                    {products.map(
                      (product) => (
                        <option
                          key={product._id}
                          value={product._id}
                        >
                          {product.productName}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="qr-form-field">
                  <label>Batch No.</label>

                  <input
                    name="batchNo"
                    value={formData.batchNo}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="qr-form-field">
                  <label>Dealer / Shop</label>

                  <select
                    name="dealer"
                    value={formData.dealer}
                    onChange={handleFormChange}
                  >
                    <option value="">
                      Select Dealer
                    </option>

                    {dealers.map(
                      (dealer) => (
                        <option
                          key={dealer._id}
                          value={dealer._id}
                        >
                          {dealer.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="qr-form-field">
                  <label>Painter</label>

                  <select
                    name="painter"
                    value={formData.painter}
                    onChange={handleFormChange}
                  >
                    <option value="">
                      Select Painter
                    </option>

                    {painters.map(
                      (painter) => (
                        <option
                          key={painter._id}
                          value={painter._id}
                        >
                          {painter.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="qr-form-field">
                  <label>Points</label>

                  <input
                    type="number"
                    min="0"
                    name="points"
                    value={formData.points}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="qr-form-field">
                  <label>Expiry Date</label>

                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="qr-form-field">
                  <label>Status</label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                  >
                    <option value="Unused">
                      Unused
                    </option>

                    <option value="Used">
                      Used
                    </option>

                    <option value="Expired">
                      Expired
                    </option>

                    <option value="Blocked">
                      Blocked
                    </option>
                  </select>
                </div>

              </div>

              <div className="qr-modal-footer">

                <button
                  type="button"
                  className="qr-cancel-btn"
                  onClick={() =>
                    setShowEditModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="qr-primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Updating..."
                    : "Update QR"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default QRManagement;