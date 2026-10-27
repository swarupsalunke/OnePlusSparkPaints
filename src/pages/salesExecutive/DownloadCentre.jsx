import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    Search,
    Download,
    FileText,
    FileImage,
    BookOpen,
    Palette,
    Tag,
    FolderOpen,
    RefreshCw,
    File,
} from "lucide-react";
import "../../css/salesExecutive/DownloadCentre.css";

const API_BASE_URL = "https://oneplussparkpaintsserver.onrender.com";


const CATEGORIES = [
    { value: "ALL", label: "All Documents", icon: FolderOpen },
    { value: "BROCHURE", label: "Product Brochures", icon: BookOpen },
    { value: "COLOUR_PALETTE", label: "Colour Palette", icon: Palette },
    { value: "PRODUCT_CATALOGUE", label: "Product Catalogue", icon: FileText },
    { value: "PRICE_LIST", label: "Price List", icon: Tag },
    {
        value: "TECHNICAL_DATA_SHEET",
        label: "Technical Data Sheets",
        icon: FileText,
    },
    {
        value: "MARKETING_MATERIALS",
        label: "Marketing Materials",
        icon: BookOpen,
    },
    { value: "CUSTOM", label: "Other Documents", icon: File },
];

const getCategoryLabel = (document) => {
    if (document.category === "CUSTOM" && document.customCategory) {
        return document.customCategory;
    }

    return (
        CATEGORIES.find((item) => item.value === document.category)?.label ||
        document.category?.replaceAll("_", " ") ||
        "Document"
    );
};

const formatFileSize = (bytes = 0) => {
    if (!bytes) return "Size unavailable";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const DownloadCentre = () => {
    const [documents, setDocuments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState(null);
    const [error, setError] = useState("");

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                `${API_BASE_URL}/api/documents/sales-executive`
            );

            setDocuments(response.data.documents || []);
        } catch (err) {
            console.error("Fetch documents error:", err);
            setError(
                err.response?.data?.message ||
                "Unable to load documents. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const filteredDocuments = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return documents.filter((document) => {
            const matchesCategory =
                selectedCategory === "ALL" ||
                document.category === selectedCategory;

            const matchesSearch =
                !query ||
                document.documentName?.toLowerCase().includes(query) ||
                document.description?.toLowerCase().includes(query) ||
                getCategoryLabel(document).toLowerCase().includes(query);

            return matchesCategory && matchesSearch;
        });
    }, [documents, searchTerm, selectedCategory]);

    const handleDownload = async (document) => {
        try {
            setDownloadingId(document._id);

            const response = await axios.get(
                `${API_BASE_URL}/api/documents/${document._id}/download`,
                { responseType: "blob" }
            );

            const blobUrl = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const link = window.document.createElement("a");
            link.href = blobUrl;
            link.download = document.fileName || `${document.documentName}.pdf`;
            window.document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error("Download document error:", err);
            setError(
                "Download failed. Please check your access or try again."
            );
        } finally {
            setDownloadingId(null);
        }
    };

    const getFileIcon = (fileType) => {
        if (fileType === "IMAGE") return FileImage;
        if (fileType === "PDF") return FileText;
        return File;
    };

    return (
        <div className="download-centre-page">
            <div className="dc-page-header">
                <div>
                    
                    <h1>Download Centre</h1>
                    <p>
                        Access product documents, price lists and marketing resources.
                    </p>
                </div>

                <button
                    type="button"
                    className="dc-refresh-btn"
                    onClick={fetchDocuments}
                    disabled={loading}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            <div className="dc-summary-card">
                <div className="dc-summary-icon">
                    <FolderOpen size={25} />
                </div>
                <div>
                    <span>Available Documents</span>
                    <strong>{documents.length}</strong>
                </div>
            </div>

            <div className="dc-toolbar">
                <div className="dc-search-box">
                    <Search size={19} />
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />
                </div>

                <select
                    className="dc-category-select"
                    value={selectedCategory}
                    onChange={(event) => setSelectedCategory(event.target.value)}
                    aria-label="Filter documents by category"
                >
                    {CATEGORIES.map((category) => (
                        <option key={category.value} value={category.value}>
                            {category.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="dc-category-list">
                {CATEGORIES.map((category) => {
                    const CategoryIcon = category.icon;

                    return (
                        <button
                            type="button"
                            key={category.value}
                            className={`dc-category-chip ${selectedCategory === category.value ? "active" : ""
                                }`}
                            onClick={() => setSelectedCategory(category.value)}
                        >
                            <CategoryIcon size={16} />
                            <span>{category.label}</span>
                        </button>
                    );
                })}
            </div>

            {error && (
                <div className="dc-error-message" role="alert">
                    <span>{error}</span>
                    <button type="button" onClick={() => setError("")}>
                        Dismiss
                    </button>
                </div>
            )}

            {loading ? (
                <div className="dc-state-card">
                    <div className="dc-loader" />
                    <p>Loading documents...</p>
                </div>
            ) : filteredDocuments.length === 0 ? (
                <div className="dc-state-card">
                    <div className="dc-empty-icon">
                        <FolderOpen size={30} />
                    </div>
                    <h3>No documents found</h3>
                    <p>
                        {documents.length === 0
                            ? "Published documents for the Sales Team will appear here."
                            : "Try another search term or select a different category."}
                    </p>
                </div>
            ) : (
                <div className="dc-document-grid">
                    {filteredDocuments.map((document) => {
                        const FileIcon = getFileIcon(document.fileType);

                        return (
                            <article className="dc-document-card" key={document._id}>
                                <div className="dc-document-top">
                                    <div className="dc-file-icon">
                                        <FileIcon size={24} />
                                    </div>
                                    <span className="dc-file-type">
                                        {document.fileType || "FILE"}
                                    </span>
                                </div>

                                <span className="dc-document-category">
                                    {getCategoryLabel(document)}
                                </span>

                                <h3 title={document.documentName}>
                                    {document.documentName}
                                </h3>

                                <p className="dc-document-description">
                                    {document.description || "No description available."}
                                </p>

                                <div className="dc-document-meta">
                                    <span>{formatFileSize(document.fileSize)}</span>
                                    <span>{formatDate(document.publishedAt)}</span>
                                </div>

                                <button
                                    type="button"
                                    className="dc-download-btn"
                                    onClick={() => handleDownload(document)}
                                    disabled={downloadingId === document._id}
                                >
                                    <Download size={17} />
                                    {downloadingId === document._id
                                        ? "Downloading..."
                                        : "Download"}
                                </button>
                            </article>
                        );
                    })}
                </div>
            )}

            {!loading && filteredDocuments.length > 0 && (
                <div className="dc-results-footer">
                    Showing {filteredDocuments.length} of {documents.length} documents
                </div>
            )}
        </div>
    );
};

export default DownloadCentre;
