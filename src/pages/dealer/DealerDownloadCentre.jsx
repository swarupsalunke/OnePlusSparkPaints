import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Download,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  File,
  Eye,
  X,
  FolderOpen,
} from "lucide-react";
import "../../css/dealer/DealerDownloadCentre.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com";

const DOCUMENT_CATEGORIES = [
  { value: "BROCHURE", label: "Product Brochure" },
  { value: "COLOUR_PALETTE", label: "Colour Palette" },
  { value: "PRICE_LIST", label: "Price List" },
  { value: "PRODUCT_CATALOGUE", label: "Product Catalogue" },
  { value: "TECHNICAL_DATA_SHEET", label: "Technical Data Sheet" },
  { value: "WARRANTY", label: "Warranty" },
  { value: "APPLICATION_GUIDE", label: "Application Guide" },
  { value: "MARKETING_MATERIALS", label: "Marketing Material" },
  { value: "CUSTOM", label: "Custom" },
];

const getCategoryLabel = (category) => {
  const item = DOCUMENT_CATEGORIES.find(
    (item) => item.value === category
  );

  return item ? item.label : category || "Document";
};

const getFileIcon = (fileType) => {
  switch (fileType) {
    case "IMAGE":
      return <ImageIcon size={30} />;
    case "DOCUMENT":
      return <FileText size={30} />;
    case "PDF":
      return <FileText size={30} />;
    default:
      return <File size={30} />;
  }
};

const formatFileSize = (size) => {
  if (!size || size <= 0) return "N/A";

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const DealerDownloadCentre = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch documents");
      }

      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocuments = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return documents.filter((document) => {
      const isPublished = document.status === "PUBLISHED";

      const isDealerAllowed =
        Array.isArray(document.accessTo) &&
        document.accessTo.includes("DEALERS");

      const categoryMatch = selectedCategory
        ? document.category === selectedCategory
        : true;

      const searchMatch = search
        ? document.documentName?.toLowerCase().includes(search) ||
          document.description?.toLowerCase().includes(search) ||
          getCategoryLabel(document.category)
            .toLowerCase()
            .includes(search)
        : true;

      return (
        isPublished &&
        isDealerAllowed &&
        categoryMatch &&
        searchMatch
      );
    });
  }, [documents, selectedCategory, searchTerm]);

  const handleDownload = async (document) => {
    try {
      setDownloadingId(document._id);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/documents/${document._id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Download failed");
      }

      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");

      link.href = blobUrl;
      link.download = document.fileName || document.documentName;

      window.document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);

      fetchDocuments();
    } catch (error) {
      console.error("Download error:", error);
      alert(error.message || "Unable to download document");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory((current) =>
      current === category ? "" : category
    );
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSearchTerm("");
  };

  const hasFilter =
    selectedCategory !== "" || searchTerm.trim() !== "";

  return (
    <div className="dealer-download-centre">
      <div className="dealer-download-header">
        <div>
          <h1>Download Centre</h1>
          <p>
            Access and download available product and business documents.
          </p>
        </div>
      </div>

      <div className="dealer-download-search">
        <Search size={20} />

        <input
          type="text"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {searchTerm && (
          <button
            type="button"
            className="dealer-download-clear-search"
            onClick={() => setSearchTerm("")}
          >
            <X size={18} />
          </button>
        )}
      </div>

      <section className="dealer-document-categories">
        <div className="dealer-download-section-header">
          <div>
            <h2>Document Categories</h2>
            <p>Select a category to view available documents.</p>
          </div>

          {hasFilter && (
            <button
              type="button"
              className="dealer-download-clear-btn"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="dealer-category-grid">
          {DOCUMENT_CATEGORIES.map((category) => (
            <button
              type="button"
              key={category.value}
              className={`dealer-category-card ${
                selectedCategory === category.value ? "active" : ""
              }`}
              onClick={() => handleCategoryClick(category.value)}
            >
              <div className="dealer-category-icon">
                <FolderOpen size={24} />
              </div>

              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </section>

      {hasFilter && (
        <section className="dealer-documents-section">
          <div className="dealer-download-section-header">
            <div>
              <h2>
                {selectedCategory
                  ? getCategoryLabel(selectedCategory)
                  : "Documents"}
              </h2>

              <p>
                {filteredDocuments.length} document
                {filteredDocuments.length !== 1 ? "s" : ""} available
              </p>
            </div>
          </div>

          {loading ? (
            <div className="dealer-download-empty">
              <p>Loading documents...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="dealer-download-empty">
              <FileText size={42} />
              <h3>No Documents Found</h3>
              <p>
                No published documents are available for the selected
                category or search.
              </p>
            </div>
          ) : (
            <div className="dealer-document-grid">
              {filteredDocuments.map((document) => (
                <div
                  className="dealer-document-card"
                  key={document._id}
                >
                  <div className="dealer-document-top">
                    <div className="dealer-document-file-icon">
                      {getFileIcon(document.fileType)}
                    </div>

                    <span className="dealer-document-type">
                      {document.fileType || "FILE"}
                    </span>
                  </div>

                  <div className="dealer-document-content">
                    <span className="dealer-document-category">
                      {getCategoryLabel(document.category)}
                    </span>

                    <h3>{document.documentName}</h3>

                    <p>
                      {document.description ||
                        "No description available."}
                    </p>

                    <div className="dealer-document-meta">
                      <span>
                        {formatFileSize(document.fileSize)}
                      </span>

                      <span>
                        {formatDate(
                          document.publishedAt || document.createdAt
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="dealer-document-actions">
                    <button
                      type="button"
                      className="dealer-document-view-btn"
                      onClick={() => setSelectedDocument(document)}
                    >
                      <Eye size={17} />
                      View Details
                    </button>

                    <button
                      type="button"
                      className="dealer-document-download-btn"
                      onClick={() => handleDownload(document)}
                      disabled={downloadingId === document._id}
                    >
                      <Download size={17} />

                      {downloadingId === document._id
                        ? "Downloading..."
                        : "Download"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {!hasFilter && !loading && (
        <div className="dealer-download-initial">
          <FolderOpen size={48} />
          <h3>Please Select a Category or Search Item</h3>
          <p>
            Select a document category above or search for a document
            to view available downloads.
          </p>
        </div>
      )}

      {selectedDocument && (
        <div
          className="dealer-document-modal-overlay"
          onClick={() => setSelectedDocument(null)}
        >
          <div
            className="dealer-document-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dealer-document-modal-header">
              <div>
                <span>Document Details</span>
                <h2>{selectedDocument.documentName}</h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDocument(null)}
              >
                <X size={22} />
              </button>
            </div>

            <div className="dealer-document-modal-body">
              <div className="dealer-detail-row">
                <span>Category</span>
                <strong>
                  {getCategoryLabel(selectedDocument.category)}
                </strong>
              </div>

              <div className="dealer-detail-row">
                <span>File Name</span>
                <strong>
                  {selectedDocument.fileName || "N/A"}
                </strong>
              </div>

              <div className="dealer-detail-row">
                <span>File Type</span>
                <strong>
                  {selectedDocument.fileType || "N/A"}
                </strong>
              </div>

              <div className="dealer-detail-row">
                <span>File Size</span>
                <strong>
                  {formatFileSize(selectedDocument.fileSize)}
                </strong>
              </div>

              <div className="dealer-detail-row">
                <span>Published Date</span>
                <strong>
                  {formatDate(
                    selectedDocument.publishedAt ||
                      selectedDocument.createdAt
                  )}
                </strong>
              </div>

              <div className="dealer-document-description">
                <span>Description</span>
                <p>
                  {selectedDocument.description ||
                    "No description available."}
                </p>
              </div>
            </div>

            <div className="dealer-document-modal-footer">
              <button
                type="button"
                className="dealer-document-close-btn"
                onClick={() => setSelectedDocument(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="dealer-document-download-btn"
                onClick={() => handleDownload(selectedDocument)}
                disabled={downloadingId === selectedDocument._id}
              >
                <Download size={17} />
                {downloadingId === selectedDocument._id
                  ? "Downloading..."
                  : "Download"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealerDownloadCentre;