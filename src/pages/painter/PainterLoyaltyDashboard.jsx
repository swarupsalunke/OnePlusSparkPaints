import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import "../../css/painter/PainterLoyaltyDashboard.css";

const API_URL = import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com";

const PainterLoyaltyDashboard = () => {
  const navigate = useNavigate();

  const [loyalty, setLoyalty] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoyaltyDashboard = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_URL}/api/painter/loyalty-dashboard`,
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
            data.message || "Failed to fetch loyalty dashboard"
          );
        }

        setLoyalty(data.loyalty || null);
        setTiers(data.tiers || []);
      } catch (err) {
        console.error("Loyalty Dashboard Error:", err);

        toast.error(
          err.message || "Failed to load loyalty dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLoyaltyDashboard();
  }, []);

  const currentTierName = loyalty?.currentTier || "-";

  const achievementPercentage = Math.min(
    100,
    Math.max(0, loyalty?.achievementPercentage || 0)
  );

  // Figma requires these three fixed tiers
  const tierNames = ["Silver", "Gold", "Platinum"];

  const getTierData = (tierName) => {
    return tiers.find(
      (tier) =>
        tier.tierName?.toLowerCase() === tierName.toLowerCase()
    );
  };

  if (loading) {
    return (
      <div className="painter-loyalty-dashboard">
        <div className="painter-loyalty-state">
          Loading loyalty dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="painter-loyalty-dashboard">

      {/* Page Header */}
      <div className="painter-loyalty-header">
        <h1>Loyalty Dashboard</h1>

        <p>
          Oneplus Spark PAINTS <span>•</span> Painter experience
        </p>
      </div>

      {/* Main Dashboard */}
      <div className="painter-loyalty-content">

        {/* Current Tier Card */}
        <div className="painter-current-tier-card">

          <div className="painter-current-tier-label">
            Current Tier
          </div>

          <h2>
            {currentTierName}
          </h2>

          {loyalty?.nextTier &&
          loyalty.nextTier !== "-" ? (
            <div className="painter-tier-progress-text">
              {achievementPercentage}% toward{" "}
              <strong>{loyalty.nextTier}</strong>
            </div>
          ) : (
            <div className="painter-tier-progress-text">
              Current tier achieved
            </div>
          )}

          {/* Progress Bar */}
          <div className="painter-tier-progress-bar">
            <div
              className="painter-tier-progress-fill"
              style={{
                width: `${achievementPercentage}%`,
              }}
            />
          </div>

          {/* Points */}
          <div className="painter-tier-points-text">
            {loyalty?.currentPoints ?? 0} /{" "}
            {loyalty?.nextTierTarget || "-"} points
          </div>

          {/* View Benefits */}
          <button
            type="button"
            className="painter-view-benefits-btn"
            onClick={() =>
              navigate("/painter/tier-benefits")
            }
          >
            View Tier Benefits
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Tier Overview */}
        <div className="painter-tier-overview-card">

          <div className="painter-tier-overview-header">
            <h2>Tier Overview</h2>
          </div>

          <div className="painter-tier-list">

            {tierNames.map((tierName, index) => {
              const tier = getTierData(tierName);

              const isCurrent =
                tierName.toLowerCase() ===
                currentTierName.toLowerCase();

              return (
                <div
                  className={`painter-tier-item ${
                    isCurrent
                      ? "painter-tier-item-active"
                      : ""
                  }`}
                  key={tierName}
                >

                  {/* Number */}
                  <div className="painter-tier-number">
                    {index + 1}
                  </div>

                  {/* Tier Details */}
                  <div className="painter-tier-info">

                    <h3>
                      {tierName}
                    </h3>

                    <span className="painter-tier-range">
                      {tier
                        ? tier.minPurchase ?? "-"
                        : "-"}
                    </span>

                    <p>
                      {tier
                        ? tier.tierType === "PREMIUM"
                          ? "Premium rewards"
                          : "Standard rewards"
                        : "-"}
                    </p>

                  </div>

                </div>
              );
            })}

          </div>
        </div>

      </div>
    </div>
  );
};

export default PainterLoyaltyDashboard;