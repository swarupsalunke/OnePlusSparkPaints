import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import "../../css/painter/PainterWalletLedger.css";

const API_URL = import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com";

const PainterWalletLedger = () => {
  const [summary, setSummary] = useState({
    currentPoints: 0,
    cashBalance: 0,
    lifetimeEarned: 0,
    redeemed: 0,
  });

  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWalletLedger = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/painter/wallet-ledger`,
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
          data.message || "Failed to fetch wallet ledger"
        );
      }

      setSummary(
        data.summary || {
          currentPoints: 0,
          cashBalance: 0,
          lifetimeEarned: 0,
          redeemed: 0,
        }
      );

      setLedger(data.ledger || []);
    } catch (err) {
      console.error("Wallet ledger error:", err);
      toast.error(
        err.message || "Failed to fetch wallet ledger"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletLedger();
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
    <div className="painter-wallet-ledger-page">
      <div className="painter-wallet-ledger-header">
        <div>
          <h1>Wallet Ledger</h1>
          <p>Oneplus Spark PAINTS • Painter experience</p>
        </div>
      </div>

      {loading ? (
        <div className="painter-wallet-ledger-state">
          Loading wallet ledger...
        </div>
      ) : (
        <>
          <div className="painter-wallet-ledger-summary">
            <div className="painter-wallet-ledger-summary-card">
              <span>Current Points</span>
              <strong>{summary.currentPoints}</strong>
            </div>

            <div className="painter-wallet-ledger-summary-card">
              <span>Cash Balance</span>
              <strong>₹{summary.cashBalance}</strong>
            </div>

            <div className="painter-wallet-ledger-summary-card">
              <span>Lifetime Earned</span>
              <strong>{summary.lifetimeEarned}</strong>
            </div>

            <div className="painter-wallet-ledger-summary-card">
              <span>Redeemed</span>
              <strong>{summary.redeemed}</strong>
            </div>
          </div>

          <div className="painter-wallet-ledger-card">
            <div className="painter-wallet-ledger-card-header">
              <div>
                <h2>Wallet Ledger</h2>
                <p>Track your points and cash transactions</p>
              </div>
            </div>

            {ledger.length === 0 ? (
              <div className="painter-wallet-ledger-state">
                No wallet transactions available.
              </div>
            ) : (
              <div className="painter-wallet-ledger-table-wrapper">
                <table className="painter-wallet-ledger-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Points</th>
                      <th>Cash</th>
                      <th>Balance</th>
                    </tr>
                  </thead>

                  <tbody>
                    {ledger.map((item) => (
                      <tr key={item.id}>
                        <td>{formatDate(item.date)}</td>

                        <td>{item.description || "-"}</td>

                        <td
                          className={
                            item.points > 0
                              ? "painter-wallet-ledger-positive"
                              : item.points < 0
                              ? "painter-wallet-ledger-negative"
                              : ""
                          }
                        >
                          {item.points > 0
                            ? `+${item.points}`
                            : item.points || "-"}
                        </td>

                        <td
                          className={
                            item.cash > 0
                              ? "painter-wallet-ledger-positive"
                              : item.cash < 0
                              ? "painter-wallet-ledger-negative"
                              : ""
                          }
                        >
                          {item.cash > 0
                            ? `+₹${item.cash}`
                            : item.cash < 0
                            ? `-₹${Math.abs(item.cash)}`
                            : "-"}
                        </td>

                        <td>{item.balance ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PainterWalletLedger;