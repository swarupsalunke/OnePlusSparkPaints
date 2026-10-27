import React, { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, CheckCircle2, Download } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import "../../css/painter/PainterSchemeDetails.css";

const API_URL = import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com";

const PainterSchemeDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    fetchSchemeDetails();
  }, [id]);

  const fetchSchemeDetails = async () => {
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
          data.message || "Failed to fetch scheme details"
        );
      }

      setScheme(data.scheme);
    } catch (error) {
      console.error("Fetch scheme details error:", error);

      toast.error(
        error.message || "Failed to load scheme details"
      );
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (banner) => {
    if (!banner) return "";

    if (banner.startsWith("http")) {
      return banner;
    }

    return `${API_URL}${banner}`;
  };

  const formatDate = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getApplicableText = (applicableTo) => {
    if (applicableTo === "PAINTERS") {
      return "Painters";
    }

    if (applicableTo === "BOTH") {
      return "Painters & Dealers";
    }

    return applicableTo || "--";
  };

  const handleDownloadPdf = () => {
    navigate(`/painter/scheme-pdf-preview/${scheme._id}`);
  };

  /* ================================
     NO SCHEME SELECTED
  ================================= */

  if (!id) {
    return (
      <div className="painter-scheme-details-page">
        <div className="painter-scheme-select-message">
          <h2>Please select a scheme first</h2>

          <p>
            Go to Scheme Listing and select a scheme
            to view its details.
          </p>

          <button
            type="button"
            onClick={() => navigate("/painter/scheme-listing")}
          >
            Go to Scheme Listing
          </button>
        </div>
      </div>
    );
  }

  /* ================================
     LOADING
  ================================= */

  if (loading) {
    return (
      <div className="painter-scheme-details-page">
        <div className="painter-scheme-details-message">
          Loading scheme details...
        </div>
      </div>
    );
  }

  /* ================================
     SCHEME NOT FOUND
  ================================= */

  if (!scheme) {
    return (
      <div className="painter-scheme-details-page">
        <div className="painter-scheme-details-message">
          Scheme not found.
        </div>
      </div>
    );
  }

  return (
    <div className="painter-scheme-details-page">

      {/* Header */}
      <div className="painter-scheme-details-header">

        <button
          type="button"
          className="painter-scheme-back-btn"
          onClick={() => navigate("/painter/scheme-listing")}
        >
          <ArrowLeft size={17} />
          Back to Schemes
        </button>

        <div className="painter-scheme-details-title">

          <h1>{scheme.schemeName}</h1>

          <span
            className={`painter-scheme-status ${scheme.status?.toLowerCase()}`}
          >
            <CheckCircle2 size={14} />
            {scheme.status}
          </span>

        </div>

        <p>
          {scheme.description || "No description available"}
        </p>

      </div>

      {/* Main Content */}
      <div className="painter-scheme-details-layout">

        {/* LEFT */}
        <div className="painter-scheme-details-left">

          {/* Banner */}
          <div className="painter-scheme-details-banner">

            {scheme.banner ? (
              <img
                src={getImageUrl(scheme.banner)}
                alt={scheme.schemeName}
              />
            ) : (
              <div className="painter-scheme-details-banner-placeholder">
                SCHEME
              </div>
            )}

          </div>

          {/* Scheme Information */}
          <div className="painter-scheme-info-card">

            <h2>Scheme Information</h2>

            <div className="painter-scheme-info-grid">

              <div className="painter-scheme-info-item">
                <span>Scheme ID</span>
                <strong>
                  {scheme.schemeId || "--"}
                </strong>
              </div>

              <div className="painter-scheme-info-item">
                <span>Scheme Type</span>
                <strong>
                  {scheme.schemeType || "--"}
                </strong>
              </div>

              <div className="painter-scheme-info-item">
                <span>Eligibility</span>
                <strong>
                  {getApplicableText(scheme.applicableTo)}
                </strong>
              </div>

              <div className="painter-scheme-info-item">
                <span>Status</span>
                <strong>
                  {scheme.status || "--"}
                </strong>
              </div>

            </div>

          </div>

          {/* Terms */}
          <div className="painter-scheme-terms-card">

            <h2>Terms & Conditions</h2>

            <p>
              {scheme.termsAndConditions ||
                "No terms and conditions available."}
            </p>

          </div>

        </div>

        {/* RIGHT */}
        <div className="painter-scheme-details-right">

          {/* Validity */}
          <div className="painter-scheme-validity-card">

            <h2>Scheme Validity</h2>

            <div className="painter-scheme-date-row">

              <div className="painter-scheme-date-icon">
                <CalendarDays size={18} />
              </div>

              <div>
                <span>Start Date</span>

                <strong>
                  {formatDate(scheme.startDate)}
                </strong>
              </div>

            </div>

            <div className="painter-scheme-date-row">

              <div className="painter-scheme-date-icon">
                <CalendarDays size={18} />
              </div>

              <div>
                <span>End Date</span>

                <strong>
                  {formatDate(scheme.endDate)}
                </strong>
              </div>

            </div>

          </div>

          {/* Target & Reward */}
          <div className="painter-scheme-target-card">

            <h2>Target & Reward</h2>

            <div className="painter-scheme-target-empty">

              <strong>--</strong>

              <span>
                Target and reward details are not available.
              </span>

            </div>

          </div>

          {/* PDF */}
          <div className="painter-scheme-pdf-card">

            <h2>Scheme PDF</h2>

            {scheme.pdf ? (
              <button
                type="button"
                className="painter-scheme-download-btn"
                onClick={handleDownloadPdf}
              >
                <Download size={17} />
                Download Scheme PDF
              </button>
            ) : (
              <div className="painter-scheme-no-pdf">
                Scheme PDF not available
              </div>
            )}

          </div>

          {/* Start Earning */}
          <button
            type="button"
            className="painter-scheme-start-btn"
          >
            Start Earning
          </button>

        </div>

      </div>

    </div>
  );
};

export default PainterSchemeDetails;