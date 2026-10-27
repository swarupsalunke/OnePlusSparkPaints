import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import "../../css/painter/PainterTierBenefits.css";

const API_URL = import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com";

const benefitLabels = {
  higherRewardPoints: "Higher Reward Points",
  exclusiveSchemes: "Exclusive Schemes",
  cashbackOffers: "Cashback Offers",
  earlyProductLaunchAccess: "Early Product Launch Access",
  premiumSupport: "Premium Support",
};

const PainterTierBenefits = () => {
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTierBenefits = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_URL}/api/painter/tier-benefits`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch tier benefits"
          );
        }

        setBenefits(data.benefits || []);
      } catch (err) {
        console.error("Tier Benefits Error:", err);

        toast.error(
          err.message || "Failed to load tier benefits"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTierBenefits();
  }, []);

  if (loading) {
    return (
      <div className="painter-tier-benefits-page">
        <div className="painter-tier-benefits-state">
          Loading tier benefits...
        </div>
      </div>
    );
  }

  return (
    <div className="painter-tier-benefits-page">

      {/* Page Header */}
      <div className="painter-tier-benefits-header">
        <h1>Tier Benefits</h1>

        <p>
          Oneplus Spark PAINTS
          <span>•</span>
          Painter experience
        </p>
      </div>

      {/* Benefits Card */}
      <div className="painter-tier-benefits-card">

        <h2>Tier Benefits</h2>

        <div className="painter-tier-benefits-grid">
          {benefits.map((item) => (
            <div
              className="painter-tier-benefit-item"
              key={item.benefit}
            >
              <div
                className={`painter-tier-benefit-icon ${
                  item.available
                    ? "available"
                    : "unavailable"
                }`}
              >
                {item.available && <Check size={17} />}
              </div>

              <div className="painter-tier-benefit-content">
                <h3>
                  {benefitLabels[item.benefit] ||
                    item.benefit}
                </h3>

                <p>
                  {item.available
                    ? `Available at ${
                        item.availableFromTier || "-"
                      } & above`
                    : "Not currently available"}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default PainterTierBenefits;