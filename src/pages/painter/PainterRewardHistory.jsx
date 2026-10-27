import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import "../../css/painter/PainterRewardHistory.css";

const API_URL = import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com";

const PainterRewardHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRewardHistory = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/painter/reward-history`,
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
          data.message || "Failed to fetch reward history"
        );
      }

      setHistory(data.history || []);
    } catch (err) {
      console.error("Reward history error:", err);
      toast.error(
        err.message || "Failed to fetch reward history"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewardHistory();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="painter-reward-history-page">
      <div className="painter-reward-history-header">
        <div>
          <h1>Reward History</h1>
          <p>Oneplus Spark PAINTS • Painter experience</p>
        </div>
      </div>

      <div className="painter-reward-history-card">
        <div className="painter-reward-history-card-header">
          <div>
            <h2>Reward History</h2>
            <p>View your earned reward history</p>
          </div>
        </div>

        {loading ? (
          <div className="painter-reward-history-state">
            Loading reward history...
          </div>
        ) : history.length === 0 ? (
          <div className="painter-reward-history-state">
            No reward history available.
          </div>
        ) : (
          <div className="painter-reward-history-table-wrapper">
            <table className="painter-reward-history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.date)}</td>
                    <td>{item.product || "-"}</td>
                    <td>{item.type || "-"}</td>
                    <td>
                      {item.type === "CASH"
                        ? `₹${item.value ?? 0}`
                        : `${item.value ?? 0} Points`}
                    </td>
                    <td>
                      <span
                        className={`painter-reward-history-status ${String(
                          item.status || ""
                        ).toLowerCase()}`}
                      >
                        {item.status || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PainterRewardHistory;