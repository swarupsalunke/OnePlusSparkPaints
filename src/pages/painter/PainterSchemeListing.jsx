import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import "../../css/painter/PainterSchemeListing.css";

const API_URL = import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com";

const PainterSchemeListing = () => {
  const navigate = useNavigate();

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/painter/schemes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch schemes");
      }

      setSchemes(data.schemes || []);
    } catch (error) {
      console.error("Fetch painter schemes error:", error);

      toast.error(
        error.message || "Failed to load schemes"
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

  const handleViewDetails = (schemeId) => {
    navigate(`/painter/scheme-details/${schemeId}`);
  };

  return (
    <div className="painter-scheme-listing">

      <div className="painter-scheme-page-header">
        <h1>Scheme Listing</h1>
        <p>Oneplus Spark PAINTS • Painter experience</p>
      </div>

      {loading && (
        <div className="painter-scheme-message">
          Loading schemes...
        </div>
      )}

      {!loading && schemes.length === 0 && (
        <div className="painter-scheme-message">
          No active schemes available.
        </div>
      )}

      {!loading && schemes.length > 0 && (
        <div className="painter-scheme-grid">

          {schemes.map((scheme) => (
            <div
              className="painter-scheme-card"
              key={scheme._id}
            >

              <div className="painter-scheme-banner">
                {scheme.banner ? (
                  <img
                    src={getImageUrl(scheme.banner)}
                    alt={scheme.schemeName || "Scheme"}
                  />
                ) : (
                  <div className="painter-scheme-banner-placeholder">
                    <span>SCHEME</span>
                  </div>
                )}
              </div>

              <div className="painter-scheme-content">

                <h3>{scheme.schemeName}</h3>

                <p className="painter-scheme-description">
                  {scheme.description || "No description available"}
                </p>

                <div className="painter-scheme-achievement">

                  <div className="painter-scheme-achievement-header">
                    <span>Achievement</span>
                    <span>--</span>
                  </div>

                  <div className="painter-scheme-progress">
                    <div className="painter-scheme-progress-fill"></div>
                  </div>

                </div>

                <button
                  type="button"
                  className="painter-scheme-view-btn"
                  onClick={() => handleViewDetails(scheme._id)}
                >
                  View Details
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
};

export default PainterSchemeListing;