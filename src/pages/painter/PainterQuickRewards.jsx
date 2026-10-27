import React, { useEffect, useState } from "react";
import { Gift, IndianRupee, Clock, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import "../../css/painter/PainterQuickRewards.css";

const API_URL = import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com/api";

const PainterQuickRewards = () => {
  const [summary, setSummary] = useState({
    availablePoints: 0,
    cashRewards: 0,
    pendingRewards: 0,
  });

  const [recentRewards, setRecentRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRewards = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/painter/rewards`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch rewards");
      }

      setSummary({
        availablePoints: data.summary?.availablePoints || 0,
        cashRewards: data.summary?.cashRewards || 0,
        pendingRewards: data.summary?.pendingRewards || 0,
      });

      setRecentRewards(data.recentRewards || []);
    } catch (err) {
      console.error("Fetch painter rewards error:", err);
      toast.error(err.message || "Failed to load rewards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getRewardValue = (reward) => {
    if (reward.rewardType === "POINTS") {
      return `${reward.points || 0} Points`;
    }

    if (reward.rewardType === "CASH") {
      return `₹${reward.cashAmount || 0}`;
    }

    return "-";
  };

  return (
    <div className="painter-quick-rewards">
      <div className="painter-quick-rewards-header">
        <div>
          <h1>Quick Rewards</h1>
          <p>View your rewards and redemption balance</p>
        </div>

        <button
          type="button"
          className="painter-rewards-redeem-btn"
        >
          <Gift size={17} />
          Redeem Rewards
        </button>
      </div>

      <div className="painter-rewards-summary">
        <div className="painter-reward-summary-card">
          <div className="painter-reward-summary-icon">
            <Gift size={21} />
          </div>

          <div>
            <span>Available Points</span>
            <strong>
              {loading ? "-" : summary.availablePoints}
            </strong>
          </div>
        </div>

        <div className="painter-reward-summary-card">
          <div className="painter-reward-summary-icon">
            <IndianRupee size={21} />
          </div>

          <div>
            <span>Cash Rewards</span>
            <strong>
              {loading ? "-" : `₹${summary.cashRewards}`}
            </strong>
          </div>
        </div>

        <div className="painter-reward-summary-card">
          <div className="painter-reward-summary-icon">
            <Clock size={21} />
          </div>

          <div>
            <span>Pending</span>
            <strong>
              {loading ? "-" : summary.pendingRewards}
            </strong>
          </div>
        </div>
      </div>

      <div className="painter-recent-rewards-card">
        <div className="painter-recent-rewards-header">
          <div>
            <h2>Recent Rewards</h2>
            <p>Your latest reward transactions</p>
          </div>

          <button
            type="button"
            className="painter-rewards-refresh-btn"
            onClick={fetchRewards}
            title="Refresh rewards"
            aria-label="Refresh rewards"
            disabled={loading}
          >
            <RotateCcw
              size={17}
              className={loading ? "painter-spin" : ""}
            />
          </button>
        </div>

        <div className="painter-rewards-table-wrapper">
          <table className="painter-rewards-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Reward</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="painter-rewards-empty">
                    Loading rewards...
                  </td>
                </tr>
              ) : recentRewards.length === 0 ? (
                <tr>
                  <td colSpan="4" className="painter-rewards-empty">
                    No recent rewards found
                  </td>
                </tr>
              ) : (
                recentRewards.map((reward) => (
                  <tr key={reward._id}>
                    <td>{formatDate(reward.createdAt)}</td>

                    <td>
                      {reward.description || "-"}
                    </td>

                    <td>
                      {getRewardValue(reward)}
                    </td>

                    <td>
                      <span
                        className={`painter-reward-status painter-reward-status-${(
                          reward.status || "PENDING"
                        ).toLowerCase()}`}
                      >
                        {reward.status || "PENDING"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PainterQuickRewards;