import React, { useEffect, useState } from "react";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import "../../css/painter/PainterSchemePdfPreview.css";

const API_URL =
  import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com";

const PainterSchemePdfPreview = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    fetchScheme();
  }, [id]);

  const fetchScheme = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/painter/schemes/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch scheme"
        );
      }

      setScheme(data.scheme);
    } catch (error) {
      console.error(
        "Fetch scheme PDF preview error:",
        error
      );

      toast.error(
        error.message || "Failed to load scheme"
      );
    } finally {
      setLoading(false);
    }
  };

  const getPdfUrl = () => {
    if (!scheme?.pdf) {
      return "";
    }

    if (
      scheme.pdf.startsWith("http://") ||
      scheme.pdf.startsWith("https://")
    ) {
      return scheme.pdf;
    }

    return `${API_URL}${scheme.pdf}`;
  };

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/painter/schemes/${id}/download`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          data.message || "Failed to download PDF"
        );
      }

      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${scheme?.schemeName || "scheme"}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("PDF download error:", error);

      toast.error(
        error.message || "Failed to download PDF"
      );
    }
  };

  if (!id) {
    return (
      <div className="painter-pdf-preview-page">
        <div className="painter-pdf-select-message">
          <FileText size={38} />

          <h2>Please select a scheme first</h2>

          <p>
            Go to Scheme Listing and select a scheme
            to preview its PDF.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/painter/scheme-listing")
            }
          >
            Go to Scheme Listing
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="painter-pdf-preview-page">
        <div className="painter-pdf-message">
          Loading PDF preview...
        </div>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="painter-pdf-preview-page">
        <div className="painter-pdf-message">
          Scheme not found.
        </div>
      </div>
    );
  }

  const pdfUrl = getPdfUrl();

  return (
    <div className="painter-pdf-preview-page">
      {/* Header */}

      <div className="painter-pdf-preview-header">
        <button
          type="button"
          className="painter-pdf-back-btn"
          onClick={() =>
            navigate(`/painter/scheme-details/${id}`)
          }
        >
          <ArrowLeft size={17} />
          Back to Scheme Details
        </button>

        <h1>Scheme PDF Preview</h1>

        <p>
          Oneplus Spark PAINTS • Painter experience
        </p>
      </div>

      {/* Preview Card */}

      <div className="painter-pdf-preview-card">
        <h2>
          {scheme.schemeName || "Scheme PDF Preview"}
        </h2>

        {pdfUrl ? (
          <>
            <div className="painter-pdf-viewer">
              <iframe
                src={pdfUrl}
                title={`${scheme.schemeName || "Scheme"} PDF`}
              />
            </div>

            <button
              type="button"
              className="painter-pdf-download-btn"
              onClick={handleDownload}
            >
              <Download size={17} />
              Download PDF
            </button>
          </>
        ) : (
          <div className="painter-pdf-not-available">
            <FileText size={38} />

            <h3>PDF Not Available</h3>

            <p>
              PDF is not available for this scheme.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/painter/scheme-details/${id}`
                )
              }
            >
              Back to Scheme Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PainterSchemePdfPreview;