import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    Upload,
    Download,
    Eye,
    Edit,
    Trash2,
    MoreVertical,
    Plus,
    FileText,
    FileImage,
    FileSpreadsheet,
    ShieldCheck,
    BookOpen,
    Palette,
    Megaphone,
    FolderOpen,
    Users,
    UserRound,
    RefreshCw,
    Filter,
    ChevronLeft,
    ChevronRight,
    X,
    Save,
    Search,
    CheckCircle,
    Ban,
    Send,
    HardDrive,
    Activity,
    FileDown,
} from "lucide-react";
import "../../css/superadmin/DocumentManagement.css";


const API_URL = "https://oneplussparkpaintsserver.onrender.com/api/documents";

const CATEGORY_OPTIONS = [
    {
        value: "BROCHURE",
        label: "Brochure",
        icon: BookOpen,
    },
    {
        value: "COLOUR_PALETTE",
        label: "Colour Palette",
        icon: Palette,
    },
    {
        value: "PRICE_LIST",
        label: "Price List",
        icon: FileSpreadsheet,
    },
    {
        value: "PRODUCT_CATALOGUE",
        label: "Product Catalogue",
        icon: FileText,
    },
    {
        value: "TECHNICAL_DATA_SHEET",
        label: "Technical Data Sheet",
        icon: FileText,
    },
    {
        value: "WARRANTY",
        label: "Warranty",
        icon: ShieldCheck,
    },
    {
        value: "APPLICATION_GUIDE",
        label: "Application Guide",
        icon: BookOpen,
    },
    {
        value: "MARKETING_MATERIALS",
        label: "Marketing Materials",
        icon: Megaphone,
    },
    {
        value: "CUSTOM",
        label: "Custom Add",
        icon: FolderOpen,
    },
];

const ACCESS_OPTIONS = [
    {
        value: "DEALERS",
        label: "Dealers",
    },
    {
        value: "PAINTERS",
        label: "Painters",
    },
    {
        value: "SALES_TEAM",
        label: "Sales Team",
    },
];

const emptyForm = {
    documentName: "",
    category: "BROCHURE",
    customCategory: "",
    accessTo: ["DEALERS", "PAINTERS", "SALES_TEAM"],
    status: "DRAFT",
    description: "",
    document: null,
};

const formatDate = (date) => {
    if (!date) return "-";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) return "-";

    return value.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 KB";

    const units = ["Bytes", "KB", "MB", "GB"];

    const index = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${(bytes / Math.pow(1024, index)).toFixed(
        index === 0 ? 0 : 2
    )} ${units[index]}`;
};

const getCategoryLabel = (category, customCategory = "") => {
    if (category === "CUSTOM") {
        return customCategory || "Custom Add";
    }

    const found = CATEGORY_OPTIONS.find(
        (item) => item.value === category
    );

    return found ? found.label : category || "-";
};

const getFileType = (fileType, fileName = "") => {
    if (fileType) return fileType;

    const extension = fileName.split(".").pop();

    return extension ? extension.toUpperCase() : "OTHER";
};

const getAccessLabel = (accessTo = []) => {
    if (!Array.isArray(accessTo) || !accessTo.length) {
        return "-";
    }

    return accessTo
        .map(
            (item) =>
                ACCESS_OPTIONS.find((option) => option.value === item)
                    ?.label || item
        )
        .join(", ");
};

const getStatusLabel = (status) => {
    switch (status) {
        case "PUBLISHED":
            return "Published";
        case "DISABLED":
            return "Disabled";
        case "DRAFT":
        default:
            return "Draft";
    }
};

const DocumentManagement = () => {
    const [documents, setDocuments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [selectedDocument, setSelectedDocument] = useState(null);

    const [form, setForm] = useState(emptyForm);

    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [accessFilter, setAccessFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [openMenuId, setOpenMenuId] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // =====================================================
    // FETCH DOCUMENTS
    // =====================================================

    const fetchDocuments = async () => {
        try {
            setLoading(true);

            const response = await axios.get(API_URL);

            if (response.data?.success) {
                setDocuments(response.data.documents || []);
            } else {
                setDocuments([]);
            }
        } catch (error) {
            console.error("Fetch documents error:", error);

            alert(
                error?.response?.data?.message ||
                "Failed to fetch documents."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    // =====================================================
    // FILTERED DOCUMENTS
    // =====================================================

    const filteredDocuments = useMemo(() => {
        let result = [...documents];

        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();

            result = result.filter((item) => {
                const name = item?.documentName?.toLowerCase() || "";
                const fileName = item?.fileName?.toLowerCase() || "";
                const category = getCategoryLabel(
                    item?.category,
                    item?.customCategory
                ).toLowerCase();

                return (
                    name.includes(search) ||
                    fileName.includes(search) ||
                    category.includes(search)
                );
            });
        }

        if (categoryFilter !== "ALL") {
            result = result.filter(
                (item) => item?.category === categoryFilter
            );
        }

        if (typeFilter !== "ALL") {
            result = result.filter(
                (item) =>
                    getFileType(item?.fileType, item?.fileName) ===
                    typeFilter
            );
        }

        if (accessFilter !== "ALL") {
            result = result.filter((item) =>
                Array.isArray(item?.accessTo)
                    ? item.accessTo.includes(accessFilter)
                    : false
            );
        }

        if (statusFilter !== "ALL") {
            result = result.filter(
                (item) => item?.status === statusFilter
            );
        }

        return result;
    }, [
        documents,
        searchTerm,
        categoryFilter,
        typeFilter,
        accessFilter,
        statusFilter,
    ]);

    // =====================================================
    // PAGINATION
    // =====================================================

    const totalPages = Math.max(
        1,
        Math.ceil(filteredDocuments.length / itemsPerPage)
    );

    const paginatedDocuments = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;

        return filteredDocuments.slice(
            startIndex,
            startIndex + itemsPerPage
        );
    }, [filteredDocuments, currentPage, itemsPerPage]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    // =====================================================
    // STATISTICS
    // =====================================================

    const totalDocuments = documents.length;

    const totalDownloads = documents.reduce(
        (total, item) => total + Number(item?.downloadCount || 0),
        0
    );

    const activeCategories = new Set(
        documents
            .filter((item) => item?.status !== "DISABLED")
            .map((item) => item?.category)
    ).size;

    const recentlyUploaded = documents.filter((item) => {
        if (!item?.createdAt) return false;

        const created = new Date(item.createdAt).getTime();

        const sevenDaysAgo =
            Date.now() - 7 * 24 * 60 * 60 * 1000;

        return created >= sevenDaysAgo;
    }).length;

    const totalStorage = documents.reduce(
        (total, item) => total + Number(item?.fileSize || 0),
        0
    );

    const uniqueUsers = new Set(
        documents.flatMap((item) =>
            Array.isArray(item?.accessTo) ? item.accessTo : []
        )
    ).size;

    // =====================================================
    // CATEGORY COUNT
    // =====================================================

    const getCategoryCount = (category) => {
        return documents.filter(
            (item) => item?.category === category
        ).length;
    };

    // =====================================================
    // FORM HANDLERS
    // =====================================================

    const handleFormChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null;

        setForm((prev) => ({
            ...prev,
            document: file,
        }));
    };

    const handleAccessChange = (value) => {
        setForm((prev) => {
            const exists = prev.accessTo.includes(value);

            return {
                ...prev,
                accessTo: exists
                    ? prev.accessTo.filter((item) => item !== value)
                    : [...prev.accessTo, value],
            };
        });
    };

    // =====================================================
    // OPEN UPLOAD
    // =====================================================

    const openUploadModal = () => {
        setForm(emptyForm);
        setSelectedDocument(null);
        setShowUploadModal(true);
    };

    const closeUploadModal = () => {
        if (saving) return;

        setShowUploadModal(false);
        setForm(emptyForm);
    };

    // =====================================================
    // UPLOAD DOCUMENT
    // =====================================================

    const handleUploadDocument = async (e) => {
        e.preventDefault();

        if (!form.documentName.trim()) {
            alert("Please enter document name.");
            return;
        }

        if (!form.category) {
            alert("Please select document category.");
            return;
        }

        if (
            form.category === "CUSTOM" &&
            !form.customCategory.trim()
        ) {
            alert("Please enter custom category name.");
            return;
        }

        if (!form.document) {
            alert("Please select a document file.");
            return;
        }

        if (!form.accessTo.length) {
            alert("Please select at least one access type.");
            return;
        }

        try {
            setSaving(true);

            const formData = new FormData();

            formData.append("document", form.document);
            formData.append("documentName", form.documentName);
            formData.append("category", form.category);
            formData.append(
                "customCategory",
                form.category === "CUSTOM"
                    ? form.customCategory
                    : ""
            );
            formData.append(
                "accessTo",
                JSON.stringify(form.accessTo)
            );
            formData.append("status", form.status);
            formData.append("description", form.description);

            const response = await axios.post(API_URL, formData);

            if (response.data?.success) {
                alert("Document uploaded successfully.");

                setShowUploadModal(false);
                setForm(emptyForm);

                await fetchDocuments();
            }
        } catch (error) {
            console.error("Upload document error:", error);

            alert(
                error?.response?.data?.message ||
                "Failed to upload document."
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // VIEW DOCUMENT
    // =====================================================

    const handleView = (document) => {
        setSelectedDocument(document);
        setOpenMenuId(null);
        setShowViewModal(true);
    };

    // =====================================================
    // EDIT DOCUMENT
    // =====================================================

    const openEditModal = (document) => {
        setSelectedDocument(document);

        setForm({
            documentName: document?.documentName || "",
            category: document?.category || "BROCHURE",
            customCategory: document?.customCategory || "",
            accessTo: Array.isArray(document?.accessTo)
                ? document.accessTo
                : [],
            status: document?.status || "DRAFT",
            description: document?.description || "",
            document: null,
        });

        setShowViewModal(false);
        setShowEditModal(true);
        setOpenMenuId(null);
    };

    const closeEditModal = () => {
        if (saving) return;

        setShowEditModal(false);
        setSelectedDocument(null);
        setForm(emptyForm);
    };

    // =====================================================
    // UPDATE DOCUMENT
    // =====================================================

    const handleUpdateDocument = async (e) => {
        e.preventDefault();

        if (!selectedDocument?._id) return;

        if (!form.documentName.trim()) {
            alert("Please enter document name.");
            return;
        }

        if (
            form.category === "CUSTOM" &&
            !form.customCategory.trim()
        ) {
            alert("Please enter custom category name.");
            return;
        }

        if (!form.accessTo.length) {
            alert("Please select at least one access type.");
            return;
        }

        try {
            setSaving(true);

            const updateData = {
                documentName: form.documentName,
                category: form.category,
                customCategory:
                    form.category === "CUSTOM"
                        ? form.customCategory
                        : "",
                accessTo: form.accessTo,
                status: form.status,
                description: form.description,
            };

            const response = await axios.put(
                `${API_URL}/${selectedDocument._id}`,
                updateData
            );

            if (response.data?.success) {
                alert("Document updated successfully.");

                setShowEditModal(false);
                setSelectedDocument(null);
                setForm(emptyForm);

                await fetchDocuments();
            }
        } catch (error) {
            console.error("Update document error:", error);

            alert(
                error?.response?.data?.message ||
                "Failed to update document."
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // DOWNLOAD DOCUMENT
    // =====================================================

    const handleDownload = async (document) => {
        if (!document?._id) return;

        try {
            setOpenMenuId(null);

            const response = await axios.get(
                `${API_URL}/${document._id}/download`,
                {
                    responseType: "blob",
                }
            );

            const blob = new Blob([response.data]);

            const url = window.URL.createObjectURL(blob);

            const link = window.document.createElement("a");

            link.href = url;
            link.download =
                document.fileName || document.documentName || "document";

            window.document.body.appendChild(link);

            link.click();

            window.document.body.removeChild(link);

            window.URL.revokeObjectURL(url);

            await fetchDocuments();
        } catch (error) {
            console.error("Download document error:", error);

            alert(
                error?.response?.data?.message ||
                "Failed to download document."
            );
        }
    };

    // =====================================================
    // PUBLISH DOCUMENT
    // =====================================================

    const handlePublish = async (document) => {
        if (!document?._id) return;

        const confirmed = window.confirm(
            `Publish "${document.documentName}"?`
        );

        if (!confirmed) return;

        try {
            setOpenMenuId(null);

            const response = await axios.put(
                `${API_URL}/${document._id}/publish`
            );

            if (response.data?.success) {
                alert("Document published successfully.");
                await fetchDocuments();
            }
        } catch (error) {
            console.error("Publish document error:", error);

            alert(
                error?.response?.data?.message ||
                "Failed to publish document."
            );
        }
    };

    // =====================================================
    // DISABLE DOCUMENT
    // =====================================================

    const handleDisable = async (document) => {
        if (!document?._id) return;

        const confirmed = window.confirm(
            `Disable "${document.documentName}"?`
        );

        if (!confirmed) return;

        try {
            setOpenMenuId(null);

            const response = await axios.put(
                `${API_URL}/${document._id}/disable`
            );

            if (response.data?.success) {
                alert("Document disabled successfully.");
                await fetchDocuments();
            }
        } catch (error) {
            console.error("Disable document error:", error);

            alert(
                error?.response?.data?.message ||
                "Failed to disable document."
            );
        }
    };

    // =====================================================
    // DELETE DOCUMENT
    // =====================================================

    const handleDelete = async (document) => {
        if (!document?._id) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete "${document.documentName}"?`
        );

        if (!confirmed) return;

        try {
            setOpenMenuId(null);

            const response = await axios.delete(
                `${API_URL}/${document._id}`
            );

            if (response.data?.success) {
                alert("Document deleted successfully.");
                await fetchDocuments();
            }
        } catch (error) {
            console.error("Delete document error:", error);

            alert(
                error?.response?.data?.message ||
                "Failed to delete document."
            );
        }
    };

    // =====================================================
    // RESET FILTERS
    // =====================================================

    const resetFilters = () => {
        setSearchTerm("");
        setCategoryFilter("ALL");
        setTypeFilter("ALL");
        setAccessFilter("ALL");
        setStatusFilter("ALL");
        setCurrentPage(1);
    };

    // =====================================================
    // CATEGORY CLICK
    // =====================================================

    const handleCategoryClick = (category) => {
        setCategoryFilter(category);
        setCurrentPage(1);
    };

    // =====================================================
    // DOWNLOAD REPORT
    // =====================================================

    const downloadReport = () => {
        if (!filteredDocuments.length) {
            alert("No document data available.");
            return;
        }

        const headers = [
            "Document Name",
            "Category",
            "Type",
            "Access To",
            "File Size",
            "Downloads",
            "Status",
            "Uploaded Date",
        ];

        const rows = filteredDocuments.map((item) => [
            item?.documentName || "",
            getCategoryLabel(
                item?.category,
                item?.customCategory
            ),
            getFileType(item?.fileType, item?.fileName),
            getAccessLabel(item?.accessTo),
            formatFileSize(item?.fileSize),
            item?.downloadCount || 0,
            getStatusLabel(item?.status),
            formatDate(item?.createdAt),
        ]);

        const csv = [headers, ...rows]
            .map((row) =>
                row
                    .map(
                        (cell) =>
                            `"${String(cell).replace(/"/g, '""')}"`
                    )
                    .join(",")
            )
            .join("\n");

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;",
        });

        const url = window.URL.createObjectURL(blob);

        const link = window.document.createElement("a");

        link.href = url;
        link.download = "document-management-report.csv";

        window.document.body.appendChild(link);

        link.click();

        window.document.body.removeChild(link);

        window.URL.revokeObjectURL(url);
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="document-management-page">
            {/* =================================================
          PAGE HEADER
      ================================================= */}

            <div className="document-page-header">
                <div>
                    <h1>Downloads & Document Management</h1>

                    <div className="document-breadcrumb">
                        <span>Dashboard</span>
                        <span>›</span>
                        <span>Downloads & Document Management</span>
                        <span>›</span>
                        <span>Overview</span>
                    </div>
                </div>

                <div className="document-header-actions">
                    <button
                        className="secondary-btn"
                        onClick={openUploadModal}
                    >
                        <Upload size={17} />
                        Upload Document
                    </button>

                    <button
                        className="primary-btn"
                        onClick={downloadReport}
                    >
                        <Download size={17} />
                        Download Reports
                    </button>
                </div>
            </div>

            {/* =================================================
          STATISTICS
      ================================================= */}

            <div className="document-stat-grid">
                <div className="document-stat-card">
                    <div className="stat-icon blue">
                        <FileText size={23} />
                    </div>

                    <div>
                        <span>Total Documents</span>
                        <strong>{totalDocuments}</strong>
                        <small>Current total documents</small>
                    </div>
                </div>

                <div className="document-stat-card">
                    <div className="stat-icon green">
                        <Download size={23} />
                    </div>

                    <div>
                        <span>Total Downloads</span>
                        <strong>{totalDownloads.toLocaleString()}</strong>
                        <small>All document downloads</small>
                    </div>
                </div>

                <div className="document-stat-card">
                    <div className="stat-icon orange">
                        <Users size={23} />
                    </div>

                    <div>
                        <span>Unique Users</span>
                        <strong>{uniqueUsers}</strong>
                        <small>Access groups assigned</small>
                    </div>
                </div>

                <div className="document-stat-card">
                    <div className="stat-icon purple">
                        <FolderOpen size={23} />
                    </div>

                    <div>
                        <span>Active Categories</span>
                        <strong>{activeCategories}</strong>
                        <small>Categories currently used</small>
                    </div>
                </div>

                <div className="document-stat-card">
                    <div className="stat-icon cyan">
                        <Upload size={23} />
                    </div>

                    <div>
                        <span>Recently Uploaded</span>
                        <strong>{recentlyUploaded}</strong>
                        <small>Uploaded in last 7 days</small>
                    </div>
                </div>

                <div className="document-stat-card">
                    <div className="stat-icon red">
                        <HardDrive size={23} />
                    </div>

                    <div>
                        <span>Storage Used</span>
                        <strong>{formatFileSize(totalStorage)}</strong>
                        <small>Total uploaded file size</small>
                    </div>
                </div>
            </div>

            {/* =================================================
          FILTERS
      ================================================= */}

            <div className="document-filter-section">
                <div className="document-filter-group">
                    <label>Category</label>

                    <select
                        value={categoryFilter}
                        onChange={(e) => {
                            setCategoryFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="ALL">All Categories</option>

                        {CATEGORY_OPTIONS.map((item) => (
                            <option
                                key={item.value}
                                value={item.value}
                            >
                                {item.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="document-filter-group">
                    <label>Document Type</label>

                    <select
                        value={typeFilter}
                        onChange={(e) => {
                            setTypeFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="ALL">All Types</option>
                        <option value="PDF">PDF</option>
                        <option value="IMAGE">Image</option>
                        <option value="DOCUMENT">Document</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>

                <div className="document-filter-group">
                    <label>User Type</label>

                    <select
                        value={accessFilter}
                        onChange={(e) => {
                            setAccessFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="ALL">All User Types</option>
                        <option value="DEALERS">Dealers</option>
                        <option value="PAINTERS">Painters</option>
                        <option value="SALES_TEAM">Sales Team</option>
                    </select>
                </div>

                <div className="document-filter-group">
                    <label>Status</label>

                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="ALL">All Status</option>
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="DISABLED">Disabled</option>
                    </select>
                </div>

                <div className="document-search-box">
                    <label>Search</label>

                    <div className="document-search-input">
                        <Search size={17} />

                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>

                <button
                    className="filter-btn"
                    onClick={resetFilters}
                    title="Reset Filters"
                >
                    <RefreshCw size={17} />
                    Reset
                </button>
            </div>

            {/* =================================================
          MAIN CONTENT
      ================================================= */}

            <div className="document-main-layout">
                <div className="document-main-content">
                    {/* =============================================
              CATEGORY CARDS
          ============================================= */}

                    <div className="document-section">
                        <div className="section-title-row">
                            <h2>Document Categories</h2>

                            {categoryFilter !== "ALL" && (
                                <button
                                    className="clear-category-btn"
                                    onClick={() => {
                                        setCategoryFilter("ALL");
                                        setCurrentPage(1);
                                    }}
                                >
                                    Clear Category
                                </button>
                            )}
                        </div>

                        <div className="document-category-grid">
                            {CATEGORY_OPTIONS.map((category) => {
                                const Icon = category.icon;

                                const count = getCategoryCount(
                                    category.value
                                );

                                const active =
                                    categoryFilter === category.value;

                                return (
                                    <button
                                        key={category.value}
                                        className={`document-category-card ${active ? "active" : ""
                                            }`}
                                        onClick={() =>
                                            handleCategoryClick(category.value)
                                        }
                                    >
                                        <div className="category-card-icon">
                                            <Icon size={21} />
                                        </div>

                                        <span>{category.label}</span>

                                        <small>
                                            {count}{" "}
                                            {count === 1
                                                ? "Document"
                                                : "Documents"}
                                        </small>
                                    </button>
                                );
                            })}

                            <button
                                className="document-category-card add-category"
                                onClick={openUploadModal}
                            >
                                <div className="category-card-icon">
                                    <Plus size={22} />
                                </div>

                                <span>Custom Add</span>

                                <small>Add Document</small>
                            </button>
                        </div>
                    </div>

                    {/* =============================================
              TABLE
          ============================================= */}

                    <div className="document-section">
                        <div className="section-title-row">
                            <div>
                                <h2>Recently Uploaded Documents</h2>

                                <span className="result-count">
                                    {filteredDocuments.length} documents found
                                </span>
                            </div>
                        </div>

                        <div className="document-table-wrapper">
                            <table className="document-table">
                                <thead>
                                    <tr>
                                        <th>Document Name</th>
                                        <th>Category</th>
                                        <th>Type</th>
                                        <th>User Type</th>
                                        <th>Uploaded By</th>
                                        <th>Upload Date</th>
                                        <th>File Size</th>
                                        <th>Downloads</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan="10"
                                                className="table-empty-state"
                                            >
                                                Loading documents...
                                            </td>
                                        </tr>
                                    ) : paginatedDocuments.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="10"
                                                className="table-empty-state"
                                            >
                                                No documents found.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedDocuments.map((item) => (
                                            <tr key={item._id}>
                                                <td>
                                                    <div className="document-name-cell">
                                                        <div className="document-file-icon">
                                                            <FileText size={17} />
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {item.documentName}
                                                            </strong>

                                                            <small>
                                                                {item.fileName}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="category-badge">
                                                        {getCategoryLabel(
                                                            item.category,
                                                            item.customCategory
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="file-type-text">
                                                        {getFileType(
                                                            item.fileType,
                                                            item.fileName
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="access-badge-wrapper">
                                                        {Array.isArray(item.accessTo) &&
                                                            item.accessTo.map((access) => (
                                                                <span
                                                                    key={access}
                                                                    className="access-badge"
                                                                >
                                                                    {ACCESS_OPTIONS.find(
                                                                        (option) =>
                                                                            option.value ===
                                                                            access
                                                                    )?.label || access}
                                                                </span>
                                                            ))}
                                                    </div>
                                                </td>

                                                <td>Admin</td>

                                                <td>
                                                    {formatDate(item.createdAt)}
                                                </td>

                                                <td>
                                                    {formatFileSize(item.fileSize)}
                                                </td>

                                                <td>
                                                    <strong>
                                                        {Number(
                                                            item.downloadCount || 0
                                                        ).toLocaleString()}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`status-badge ${String(
                                                            item.status || "DRAFT"
                                                        ).toLowerCase()}`}
                                                    >
                                                        {getStatusLabel(item.status)}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="document-actions">
                                                        {/* VIEW */}
                                                        <button
                                                            className="table-action-btns"
                                                            title="View"
                                                            onClick={() =>
                                                                handleView(item)
                                                            }
                                                        >
                                                            <Eye size={16} />
                                                        </button>

                                                        {/* DOWNLOAD */}
                                                        <button
                                                            className="table-action-btns"
                                                            title="Download"
                                                            onClick={() =>
                                                                handleDownload(item)
                                                            }
                                                        >
                                                            <Download size={16} />
                                                        </button>

                                                        <button
                                                            className="delete-menu-item"
                                                            onClick={() =>
                                                                handleDelete(item)
                                                            }
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>

                                                        {/* MORE */}
                                                        <div className="more-action-wrappers">
                                                            <button
                                                                className="table-action-btns"
                                                                title="More"
                                                                onClick={() =>
                                                                    setOpenMenuId(
                                                                        openMenuId === item._id
                                                                            ? null
                                                                            : item._id
                                                                    )
                                                                }
                                                            >
                                                                <MoreVertical size={16} />
                                                            </button>

                                                            {openMenuId === item._id && (
                                                                <div className="more-action-menus">
                                                                    {(item.status ===
                                                                        "DRAFT" ||
                                                                        item.status ===
                                                                        "DISABLED") && (
                                                                            <button
                                                                                onClick={() =>
                                                                                    handlePublish(item)
                                                                                }
                                                                            >
                                                                                <Send size={15} />
                                                                                Publish
                                                                            </button>
                                                                        )}

                                                                    {item.status ===
                                                                        "PUBLISHED" && (
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleDisable(item)
                                                                                }
                                                                            >
                                                                                <Ban size={15} />
                                                                                Disable
                                                                            </button>
                                                                        )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}

                        <div className="document-pagination">
                            <span>
                                Showing{" "}
                                {filteredDocuments.length === 0
                                    ? 0
                                    : (currentPage - 1) *
                                    itemsPerPage +
                                    1}{" "}
                                to{" "}
                                {Math.min(
                                    currentPage * itemsPerPage,
                                    filteredDocuments.length
                                )}{" "}
                                of {filteredDocuments.length} entries
                            </span>

                            <div className="pagination-controlsd">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.max(1, prev - 1)
                                        )
                                    }
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                {Array.from(
                                    { length: totalPages },
                                    (_, index) => index + 1
                                )
                                    .slice(
                                        Math.max(0, currentPage - 3),
                                        Math.min(totalPages, currentPage + 2)
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
                                    disabled={currentPage === totalPages}
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
                </div>

                {/* =================================================
            RIGHT SIDEBAR
        ================================================= */}

                <aside className="document-sidebar">
                    {/* WHO CAN DOWNLOAD */}

                    <div className="sidebar-card">
                        <h3>Who Can Download</h3>

                        <div className="download-role-item">
                            <div className="role-icon">
                                <Users size={18} />
                            </div>

                            <div>
                                <strong>Dealers</strong>
                                <p>
                                    Can download products, schemes,
                                    price lists and related documents.
                                </p>
                            </div>
                        </div>

                        <div className="download-role-item">
                            <div className="role-icon">
                                <UserRound size={18} />
                            </div>

                            <div>
                                <strong>Sales Team</strong>
                                <p>
                                    Can download marketing and sales
                                    related documents.
                                </p>
                            </div>
                        </div>

                        <div className="download-role-item">
                            <div className="role-icon">
                                <UserRound size={18} />
                            </div>

                            <div>
                                <strong>Painters</strong>
                                <p>
                                    Can download technical sheets,
                                    application guides and palettes.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* QUICK ACTIONS */}

                    <div className="sidebar-card">
                        <h3>Quick Actions</h3>

                        <button
                            className="quick-action-item"
                            onClick={openUploadModal}
                        >
                            <Upload size={17} />

                            <div>
                                <strong>Upload Document</strong>
                                <span>Upload new documents</span>
                            </div>
                        </button>

                        <button
                            className="quick-action-item"
                            onClick={() => {
                                setCategoryFilter("CUSTOM");
                                setCurrentPage(1);
                            }}
                        >
                            <Plus size={17} />

                            <div>
                                <strong>Create New Category</strong>
                                <span>Add custom document category</span>
                            </div>
                        </button>

                        <button
                            className="quick-action-item"
                            onClick={openUploadModal}
                        >
                            <FileDown size={17} />

                            <div>
                                <strong>Bulk Upload</strong>
                                <span>Upload documents</span>
                            </div>
                        </button>

                        <button
                            className="quick-action-item"
                            onClick={() => {
                                setCategoryFilter("ALL");
                                setStatusFilter("ALL");
                                setSearchTerm("");
                                setCurrentPage(1);
                            }}
                        >
                            <FolderOpen size={17} />

                            <div>
                                <strong>Manage Categories</strong>
                                <span>View document categories</span>
                            </div>
                        </button>

                        <button
                            className="quick-action-item"
                            onClick={downloadReport}
                        >
                            <Download size={17} />

                            <div>
                                <strong>Download Logs</strong>
                                <span>View download activities</span>
                            </div>
                        </button>
                    </div>

                    {/* STORAGE OVERVIEW */}

                    <div className="sidebar-card">
                        <h3>Storage Overview</h3>

                        <div className="storage-overview">
                            <div className="storage-circle">
                                <HardDrive size={27} />

                                <strong>
                                    {formatFileSize(totalStorage)}
                                </strong>

                                <span>Used</span>
                            </div>

                            <div className="storage-info">
                                <div>
                                    <span>
                                        <i className="storage-dot documents"></i>
                                        Documents
                                    </span>

                                    <strong>
                                        {formatFileSize(totalStorage)}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        <i className="storage-dot free"></i>
                                        Free Space
                                    </span>

                                    <strong>Available</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RECENT ACTIVITY */}

                    <div className="sidebar-card">
                        <div className="sidebar-title-row">
                            <h3>Recent Activity</h3>

                            <button
                                onClick={fetchDocuments}
                                title="Refresh"
                            >
                                <RefreshCw size={15} />
                            </button>
                        </div>

                        {documents.slice(0, 5).map((item) => (
                            <div
                                className="recent-activity-item"
                                key={item._id}
                            >
                                <div className="activity-icon">
                                    <Activity size={15} />
                                </div>

                                <div>
                                    <strong>
                                        {item.documentName}
                                    </strong>

                                    <span>
                                        {formatDate(item.createdAt)}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {!documents.length && (
                            <p className="no-activity">
                                No recent activity.
                            </p>
                        )}
                    </div>
                </aside>
            </div>

            {/* =====================================================
          UPLOAD MODAL
      ===================================================== */}

            {showUploadModal && (
                <div className="document-modal-overlay">
                    <div className="document-modal">
                        <div className="document-modal-header">
                            <div>
                                <h2>Upload Document</h2>
                                <p>
                                    Add a new document to the download
                                    centre
                                </p>
                            </div>

                            <button
                                onClick={closeUploadModal}
                                disabled={saving}
                            >
                                <X size={21} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleUploadDocument}
                            className="document-form"
                        >
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>
                                        Document Name <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="documentName"
                                        value={form.documentName}
                                        onChange={handleFormChange}
                                        placeholder="Enter document name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Category <span>*</span>
                                    </label>

                                    <select
                                        name="category"
                                        value={form.category}
                                        onChange={handleFormChange}
                                    >
                                        {CATEGORY_OPTIONS.map((item) => (
                                            <option
                                                key={item.value}
                                                value={item.value}
                                            >
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {form.category === "CUSTOM" && (
                                    <div className="form-group">
                                        <label>
                                            Custom Category <span>*</span>
                                        </label>

                                        <input
                                            type="text"
                                            name="customCategory"
                                            value={form.customCategory}
                                            onChange={handleFormChange}
                                            placeholder="Enter custom category"
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>
                                        Document File <span>*</span>
                                    </label>

                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                                    />

                                    {form.document && (
                                        <small className="selected-file">
                                            Selected: {form.document.name}
                                        </small>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>
                                        Status <span>*</span>
                                    </label>

                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleFormChange}
                                    >
                                        <option value="DRAFT">Draft</option>
                                        <option value="PUBLISHED">
                                            Published
                                        </option>
                                        <option value="DISABLED">
                                            Disabled
                                        </option>
                                    </select>
                                </div>

                                <div className="form-group form-group-full">
                                    <label>
                                        Access To <span>*</span>
                                    </label>

                                    <div className="access-checkbox-grid">
                                        {ACCESS_OPTIONS.map((option) => (
                                            <label
                                                className="access-checkbox"
                                                key={option.value}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={form.accessTo.includes(
                                                        option.value
                                                    )}
                                                    onChange={() =>
                                                        handleAccessChange(
                                                            option.value
                                                        )
                                                    }
                                                />

                                                <span>{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group form-group-full">
                                    <label>Description</label>

                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleFormChange}
                                        placeholder="Enter document description"
                                        rows="4"
                                    />
                                </div>
                            </div>

                            <div className="document-modal-footer">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={closeUploadModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={saving}
                                >
                                    <Upload size={17} />

                                    {saving
                                        ? "Uploading..."
                                        : "Upload Document"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =====================================================
          VIEW MODAL
      ===================================================== */}

            {showViewModal && selectedDocument && (
                <div className="document-modal-overlay">
                    <div className="document-modal view-document-modal">
                        <div className="document-modal-header">
                            <div>
                                <h2>Document Details</h2>
                                <p>
                                    View document information and status
                                </p>
                            </div>
                        </div>

                        <div className="document-details-grid">
                            <div className="detail-item">
                                <span>Document Name</span>
                                <strong>
                                    {selectedDocument.documentName}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Category</span>
                                <strong>
                                    {getCategoryLabel(
                                        selectedDocument.category,
                                        selectedDocument.customCategory
                                    )}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>File Name</span>
                                <strong>
                                    {selectedDocument.fileName}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>File Type</span>
                                <strong>
                                    {getFileType(
                                        selectedDocument.fileType,
                                        selectedDocument.fileName
                                    )}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>File Size</span>
                                <strong>
                                    {formatFileSize(
                                        selectedDocument.fileSize
                                    )}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Downloads</span>
                                <strong>
                                    {selectedDocument.downloadCount || 0}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Status</span>

                                <strong>
                                    <span
                                        className={`status-badge ${String(
                                            selectedDocument.status
                                        ).toLowerCase()}`}
                                    >
                                        {getStatusLabel(
                                            selectedDocument.status
                                        )}
                                    </span>
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Uploaded Date</span>
                                <strong>
                                    {formatDate(
                                        selectedDocument.createdAt
                                    )}
                                </strong>
                            </div>

                            <div className="detail-item detail-full">
                                <span>Access To</span>
                                <strong>
                                    {getAccessLabel(
                                        selectedDocument.accessTo
                                    )}
                                </strong>
                            </div>

                            <div className="detail-item detail-full">
                                <span>Description</span>

                                <p>
                                    {selectedDocument.description ||
                                        "No description available."}
                                </p>
                            </div>
                        </div>

                        <div className="document-modal-footer">
                            <button
                                className="cancel-btn"
                                onClick={() =>
                                    handleDownload(selectedDocument)
                                }
                            >
                                <Download size={17} />
                                Download
                            </button>

                            <button
                                className="primary-btn"
                                onClick={() =>
                                    openEditModal(selectedDocument)
                                }
                            >
                                <Edit size={17} />
                                Edit
                            </button>
                            <button className="cancel-btn"
                                onClick={() => {
                                    setShowViewModal(false);
                                    setSelectedDocument(null);
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================
          EDIT MODAL
      ===================================================== */}

            {showEditModal && selectedDocument && (
                <div className="document-modal-overlay">
                    <div className="document-modal">
                        <div className="document-modal-header">
                            <div>
                                <h2>Edit Document</h2>
                                <p>
                                    Update document information
                                </p>
                            </div>

                            <button
                                onClick={closeEditModal}
                                disabled={saving}
                            >
                                <X size={21} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleUpdateDocument}
                            className="document-form"
                        >
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>
                                        Document Name <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="documentName"
                                        value={form.documentName}
                                        onChange={handleFormChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Category <span>*</span>
                                    </label>

                                    <select
                                        name="category"
                                        value={form.category}
                                        onChange={handleFormChange}
                                    >
                                        {CATEGORY_OPTIONS.map((item) => (
                                            <option
                                                key={item.value}
                                                value={item.value}
                                            >
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {form.category === "CUSTOM" && (
                                    <div className="form-group">
                                        <label>
                                            Custom Category <span>*</span>
                                        </label>

                                        <input
                                            type="text"
                                            name="customCategory"
                                            value={form.customCategory}
                                            onChange={handleFormChange}
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>
                                        Status <span>*</span>
                                    </label>

                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleFormChange}
                                    >
                                        <option value="DRAFT">Draft</option>
                                        <option value="PUBLISHED">
                                            Published
                                        </option>
                                        <option value="DISABLED">
                                            Disabled
                                        </option>
                                    </select>
                                </div>

                                <div className="form-group form-group-full">
                                    <label>
                                        Access To <span>*</span>
                                    </label>

                                    <div className="access-checkbox-grid">
                                        {ACCESS_OPTIONS.map((option) => (
                                            <label
                                                className="access-checkbox"
                                                key={option.value}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={form.accessTo.includes(
                                                        option.value
                                                    )}
                                                    onChange={() =>
                                                        handleAccessChange(
                                                            option.value
                                                        )
                                                    }
                                                />

                                                <span>{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group form-group-full">
                                    <label>Description</label>

                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleFormChange}
                                        rows="4"
                                    />
                                </div>

                                <div className="form-group form-group-full">
                                    <label>Replace File</label>

                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                                    />

                                    <small>
                                        Leave empty to keep the existing file.
                                    </small>
                                </div>
                            </div>

                            <div className="document-modal-footer">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={closeEditModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={saving}
                                >
                                    <Save size={17} />

                                    {saving
                                        ? "Updating..."
                                        : "Update Document"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentManagement;