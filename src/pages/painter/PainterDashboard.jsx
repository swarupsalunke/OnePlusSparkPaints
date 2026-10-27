import React, { useEffect, useMemo, useState } from "react";
import {
  Award,
  Bell,
  Gift,
  QrCode,
  ShoppingBag,
  Star,
} from "lucide-react";
import "../../css/painter/PainterDashboard.css";

const PainterDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    painter: null,
    summary: {
      totalRewardPoints: 0,
      totalCashRewards: 0,
      pendingRewards: 0,
      productScans: 0,
    },
    latestReward: null,
    monthlyRewardSummary: [],
    activeSchemes: [],
  });

  const [loading, setLoading] = useState(false);

  const API_URL =
    import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com";

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/painter/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Painter dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const {
    painter,
    summary,
    latestReward,
    monthlyRewardSummary,
    activeSchemes,
  } = dashboardData;

  const currentMonthReward = useMemo(() => {
    if (!monthlyRewardSummary?.length) {
      return 0;
    }

    const currentMonth = monthlyRewardSummary.find(
      (item) => item.current
    );

    return currentMonth?.points || 0;
  }, [monthlyRewardSummary]);

  const maxMonthlyPoints = useMemo(() => {
    if (!monthlyRewardSummary?.length) {
      return 0;
    }

    return Math.max(
      ...monthlyRewardSummary.map(
        (item) => Number(item.points) || 0
      ),
      0
    );
  }, [monthlyRewardSummary]);

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="painter-dashboard">

      {/* ==========================================
          PAGE HEADER
      ========================================== */}

      <div className="painter-dashboard-header">
        <div>
          <h1>Painter Dashboard / Home</h1>
          <p>
            Oneplus Spark PAINTS • Painter experience
          </p>
        </div>

        <button
          type="button"
          className="painter-notification-btn"
          title="Notifications"
        >
          <Bell size={18} />
        </button>
      </div>

      {/* ==========================================
          SUMMARY CARDS
      ========================================== */}

      <div className="painter-summary-grid">

        {/* Reward Points */}
        <div className="painter-summary-card">
          <div className="painter-summary-top">
            <div className="painter-summary-icon reward-icon">
              <Star size={17} />
            </div>

            <span className="painter-summary-label">
              Reward Points
            </span>
          </div>

          <strong className="painter-summary-value">
            {Number(
              summary?.totalRewardPoints || 0
            ).toLocaleString()}
          </strong>

          <small className="painter-summary-positive">
            {currentMonthReward > 0
              ? `+ ${currentMonthReward} this month`
              : "-"}
          </small>
        </div>

        {/* Cash Rewards */}
        <div className="painter-summary-card">
          <div className="painter-summary-top">
            <div className="painter-summary-icon cash-icon">
              <Gift size={17} />
            </div>

            <span className="painter-summary-label">
              Cash Rewards
            </span>
          </div>

          <strong className="painter-summary-value">
            ₹
            {Number(
              summary?.totalCashRewards || 0
            ).toLocaleString()}
          </strong>

          <small className="painter-summary-positive">
            -
          </small>
        </div>

        {/* Pending Rewards */}
        <div className="painter-summary-card">
          <div className="painter-summary-top">
            <div className="painter-summary-icon pending-icon">
              <Award size={17} />
            </div>

            <span className="painter-summary-label">
              Pending Rewards
            </span>
          </div>

          <strong className="painter-summary-value">
            {Number(
              summary?.pendingRewards || 0
            ).toLocaleString()}
          </strong>

          <small className="painter-summary-muted">
            {summary?.pendingRewards > 0
              ? "Under verification"
              : "-"}
          </small>
        </div>

        {/* Product Scans */}
        <div className="painter-summary-card">
          <div className="painter-summary-top">
            <div className="painter-summary-icon scan-icon">
              <QrCode size={17} />
            </div>

            <span className="painter-summary-label">
              Product Scans
            </span>
          </div>

          <strong className="painter-summary-value">
            {Number(
              summary?.productScans || 0
            ).toLocaleString()}
          </strong>

          <small className="painter-summary-positive">
            -
          </small>
        </div>

      </div>

      {/* ==========================================
          MIDDLE SECTION
      ========================================== */}

      <div className="painter-dashboard-middle">

        {/* Quick Actions */}
        <section className="painter-dashboard-card painter-quick-card">

          <h2>Quick Actions</h2>

          <div className="painter-quick-actions">

            <button
              type="button"
              className="painter-quick-action active"
            >
              <QrCode size={16} />
              <span>Scan Product</span>
            </button>

            <button
              type="button"
              className="painter-quick-action"
            >
              <ShoppingBag size={16} />
              <span>Shop Products</span>
            </button>

            <button
              type="button"
              className="painter-quick-action"
            >
              <Star size={16} />
              <span>My Rewards</span>
            </button>

          </div>

          {/* Loyalty Tier */}
          <div className="painter-loyalty-row">

            <span className="painter-loyalty-label">
              Current Loyalty Tier
            </span>

            <span className="painter-loyalty-badge">
              {painter?.loyaltyTier || "-"}
            </span>

            <strong className="painter-loyalty-progress">
              {painter?.loyaltyProgress
                ? `${painter.loyaltyProgress}% to ${
                    painter.nextTier || "-"
                  }`
                : "-"}
            </strong>

          </div>

        </section>

        {/* Latest Reward */}
        <section className="painter-dashboard-card painter-latest-card">

          <h2>Latest Reward Earned</h2>

          {latestReward ? (
            <>
              <div className="painter-latest-points">
                {latestReward.rewardType === "POINTS"
                  ? `+${Number(
                      latestReward.points || 0
                    ).toLocaleString()} Points`
                  : `₹${Number(
                      latestReward.cashAmount || 0
                    ).toLocaleString()}`}
              </div>

              <p className="painter-latest-description">
                {latestReward.description || "-"}
              </p>

              {latestReward.reference && (
                <span className="painter-latest-reference">
                  Reference: {latestReward.reference}
                </span>
              )}

              <button
                type="button"
                className="painter-view-reward-btn"
              >
                View Reward
              </button>
            </>
          ) : (
            <div className="painter-empty-state">
              No reward data available
            </div>
          )}

        </section>

      </div>

      {/* ==========================================
          BOTTOM SECTION
      ========================================== */}

      <div className="painter-dashboard-bottom">

        {/* ==========================================
            MONTHLY REWARD SUMMARY
        ========================================== */}

        <section className="painter-dashboard-card painter-monthly-card">

          <div className="painter-section-heading">
            <h2>Monthly Reward Summary</h2>

            {maxMonthlyPoints > 0 && (
              <span className="painter-chart-max">
                {maxMonthlyPoints}
              </span>
            )}
          </div>

          {monthlyRewardSummary?.length > 0 ? (
            <div className="painter-chart">

              {monthlyRewardSummary.map((item) => {
                const points =
                  Number(item.points) || 0;

                const percentage =
                  Number(item.percentage) || 0;

                return (
                  <div
                    className="painter-chart-column"
                    key={`${item.month}-${item.year}`}
                  >
                    <div className="painter-chart-bar-wrapper">

                      {points > 0 && (
                        <span className="painter-chart-value">
                          {points}
                        </span>
                      )}

                      <div
                        className={`painter-chart-bar ${
                          item.current
                            ? "current"
                            : ""
                        }`}
                        style={{
                          height: `${
                            points > 0
                              ? Math.max(percentage, 4)
                              : 0
                          }%`,
                        }}
                        title={`${item.month}: ${points} points`}
                      />

                    </div>

                    <span className="painter-chart-month">
                      {item.month}
                    </span>
                  </div>
                );
              })}

            </div>
          ) : (
            <div className="painter-empty-state">
              No monthly reward data available
            </div>
          )}

        </section>

        {/* ==========================================
            ACTIVE SCHEMES
        ========================================== */}

        <section className="painter-dashboard-card painter-schemes-card">

          <h2>Active Schemes</h2>

          {activeSchemes?.length > 0 ? (
            <div className="painter-scheme-list">

              {activeSchemes.map((scheme) => (
                <div
                  className="painter-scheme-item"
                  key={
                    scheme._id ||
                    scheme.schemeId
                  }
                >

                  <div className="painter-scheme-header">

                    <strong>
                      {scheme.schemeName || "-"}
                    </strong>

                    <span>
                      {scheme.schemeType || "-"}
                    </span>

                  </div>

                  <p>
                    {scheme.description ||
                      "No description available"}
                  </p>

                  <div className="painter-scheme-dates">

                    <span>
                      Start:{" "}
                      {formatDate(
                        scheme.startDate
                      )}
                    </span>

                    <span>
                      End:{" "}
                      {formatDate(
                        scheme.endDate
                      )}
                    </span>

                  </div>

                  <div className="painter-scheme-footer">

                    <span>
                      Applicable:{" "}
                      {scheme.applicableTo || "-"}
                    </span>

                    <span className="painter-scheme-status">
                      Active
                    </span>

                  </div>

                </div>
              ))}

            </div>
          ) : (
            <div className="painter-empty-state">
              No active schemes available
            </div>
          )}

        </section>

      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="painter-dashboard-loading">
          Loading dashboard...
        </div>
      )}

    </div>
  );
};

export default PainterDashboard;