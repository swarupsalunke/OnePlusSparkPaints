import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Gift, ArrowRight, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import "../../css/painter/PainterOffersListing.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com";

const PainterOffersListing = () => {
  const navigate = useNavigate();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const getOfferTypeLabel = (type) => {
    const labels = {
      CASHBACK: "Cashback Offer",
      REWARD: "Reward Scheme",
      DISCOUNT: "Discount Offer",
    };

    return labels[type] || type || "Offer";
  };

  const getImageUrl = (image) => {
    if (!image) return "";

    if (image.startsWith("http")) {
      return image;
    }

    return `${API_BASE_URL}${image}`;
  };

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${API_BASE_URL}/api/painter/offers`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data?.success) {
          setOffers(response.data.offers || []);
        } else {
          setOffers([]);
          toast.error("Failed to load offers.");
        }
      } catch (err) {
        console.error("Fetch painter offers error:", err);

        toast.error(
          err.response?.data?.message || "Failed to load offers."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  if (loading) {
    return (
      <div className="painter-offers-page">
        <div className="painter-offers-loading">
          <LoaderCircle size={24} className="painter-offers-loader" />
          <span>Loading offers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="painter-offers-page">
      <div className="painter-offers-header">
        <div>
          <h1>Offers</h1>

          <div className="painter-offers-breadcrumb">
            Dashboard
            <span>›</span>
            Offers
          </div>
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="painter-offers-empty">
          <Gift size={38} />
          <h3>No Offers Available</h3>
          <p>
            There are currently no active offers available for painters.
          </p>
        </div>
      ) : (
        <div className="painter-offers-grid">
          {offers.map((offer) => (
            <div
              className="painter-offer-card"
              key={offer._id}
            >
              <div className="painter-offer-image">
                {offer.banner ? (
                  <img
                    src={getImageUrl(offer.banner)}
                    alt={offer.schemeName || "Offer"}
                  />
                ) : (
                  <div className="painter-offer-image-placeholder">
                    <Gift size={42} />
                  </div>
                )}
              </div>

              <div className="painter-offer-content">
                <div className="painter-offer-type">
                  {getOfferTypeLabel(offer.schemeType)}
                </div>

                <h2>{offer.schemeName}</h2>

                <p>
                  {offer.description || "Offer details available."}
                </p>

                <div className="painter-offer-dates">
                  <span>
                    {offer.startDate
                      ? new Date(offer.startDate).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "-"}
                  </span>

                  <span> - </span>

                  <span>
                    {offer.endDate
                      ? new Date(offer.endDate).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "-"}
                  </span>
                </div>

                <button
                  type="button"
                  className="painter-offer-view-btn"
                  onClick={() =>
                    navigate(
                      `/painter/offer-details/${offer._id}`
                    )
                  }
                >
                  View Offer
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PainterOffersListing;
