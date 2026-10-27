import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import "../../css/painter/PainterOfferDetails.css";

const API_URL =
  import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com";

const PainterOfferDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    fetchOfferDetails();
  }, [id]);

  const fetchOfferDetails = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/painter/offers/${id}`,
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
          data.message || "Failed to fetch offer details"
        );
      }

      setOffer(data.offer);
    } catch (error) {
      console.error("Fetch offer details error:", error);

      toast.error(
        error.message || "Failed to load offer details"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getOfferTypeLabel = (type) => {
    const labels = {
      CASHBACK: "Cashback Offer",
      REWARD: "Reward Scheme",
      DISCOUNT: "Discount Offer",
    };

    return labels[type] || type || "Offer";
  };

  const getTerms = (terms) => {
    if (!terms) {
      return [];
    }

    return terms
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  if (!id) {
    return (
      <div className="painter-offer-details-page">
        <div className="painter-offer-message">
          <h2>Please select an offer first</h2>

          <p>
            Go to Offers Listing and select an offer
            to view its details.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/painter/offers-listing")
            }
          >
            Go to Offers Listing
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="painter-offer-details-page">
        <div className="painter-offer-message">
          Loading offer details...
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="painter-offer-details-page">
        <div className="painter-offer-message">
          Offer not found.
        </div>
      </div>
    );
  }

  const terms = getTerms(offer.termsAndConditions);

  return (
    <div className="painter-offer-details-page">

      {/* PAGE HEADER */}
      <div className="painter-offer-page-header">
        <div>
          <h1>Offer Details</h1>

          <div className="painter-offer-breadcrumb">
            Painter App
            <span>/</span>
            Schemes & Offers
            <span>/</span>
            Offer Details
          </div>
        </div>
      </div>

      {/* CONTENT CARD */}
      <div className="painter-offer-details-card">

        {/* OFFER HERO */}
        <div className="painter-offer-hero">

          <h2>
            {offer.schemeName}
          </h2>

          <strong>
            {offer.description ||
              "No offer description available"}
          </strong>

          <div className="painter-offer-valid-text">
            Valid until {formatDate(offer.endDate)}
          </div>

        </div>

        {/* OFFER DETAILS */}
        <div className="painter-offer-content-section">

          <div className="painter-offer-information">

            <h2>Offer Details</h2>

            <div className="painter-offer-type-row">
              <span>Offer Type</span>
              <strong>
                {getOfferTypeLabel(
                  offer.schemeType
                )}
              </strong>
            </div>

            <div className="painter-offer-date-row">
              <CalendarDays size={17} />

              <div>
                <span>Offer Validity</span>

                <strong>
                  {formatDate(offer.startDate)}
                  {" - "}
                  {formatDate(offer.endDate)}
                </strong>
              </div>
            </div>

            <div className="painter-offer-terms">

              {terms.length > 0 ? (
                terms.map((term, index) => (
                  <p key={index}>
                    • {term}
                  </p>
                ))
              ) : (
                <p>
                  • No additional offer details available.
                </p>
              )}

            </div>

          </div>

          {/* CTA */}
          <div className="painter-offer-action">

            <button
              type="button"
              className="painter-offer-claim-btn"
            >
              Claim / View Products
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default PainterOfferDetails;