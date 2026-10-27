import React, { useEffect, useState } from "react";
import { History, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import "../../css/painter/PainterScanHistory.css";

const API_URL = import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com";

const PainterScanHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchScanHistory = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/painter/scan-history`,
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
          data.message || "Failed to fetch scan history"
        );
      }

      setHistory(data.history || []);
    } catch (err) {
      console.error("Scan history error:", err);
      toast.error(
        err.message || "Failed to fetch scan history"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScanHistory();
  }, []);

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "-";

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="painter-scan-history-page">
      <div className="painter-scan-history-header">
        <div>
          <h1>Scan History</h1>
          <p>Oneplus Spark PAINTS • Painter experience</p>
        </div>

        <button
          type="button"
          className="painter-scan-history-refresh-btn"
          onClick={fetchScanHistory}
          disabled={loading}
          title="Refresh"
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="painter-scan-history-card">
        <div className="painter-scan-history-title">
          <History size={18} />
          <h2>Previous Scans</h2>
        </div>

        <div className="painter-scan-history-table-wrapper">
          <table className="painter-scan-history-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Product</th>
                <th>Code</th>
                <th>Reward</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="painter-scan-history-empty"
                  >
                    Loading scan history...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="painter-scan-history-empty"
                  >
                    No scan history available.
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {formatDateTime(item.dateTime)}
                    </td>

                    <td>
                      {item.product || "-"}
                    </td>

                    <td>
                      {item.code || "-"}
                    </td>

                    <td>
                      {item.reward ?? 0}
                    </td>

                    <td>
                      <span
                        className={`painter-scan-history-status painter-scan-history-status-${String(
                          item.status || ""
                        ).toLowerCase()}`}
                      >
                        {item.status || "-"}
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

export default PainterScanHistory;