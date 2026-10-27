import React, { useEffect, useState } from "react";
import { Bell, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import "../../css/painter/PainterrewardNotifications.css";

const API_URL = import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com";

const PainterNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/painter/notifications`,
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
          data.message || "Failed to fetch notifications"
        );
      }

      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(
        "Fetch painter notifications error:",
        err
      );

      toast.error(
        err.message || "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="painter-notifications-page">
      {/* Page Header */}
      <div className="painter-notifications-page-header">
        <div>
          <h1>Monthly Reward Summary</h1>
          <p>Oneplus Spark PAINTS • Painter experience</p>
        </div>

        <button
          type="button"
          className="painter-notifications-refresh-btn"
          onClick={fetchNotifications}
          title="Refresh notifications"
          aria-label="Refresh notifications"
          disabled={loading}
        >
          <RefreshCw
            size={18}
            className={loading ? "painter-spin" : ""}
          />
        </button>
      </div>

      {/* Notifications Card */}
      <div className="painter-notifications-card">
        <div className="painter-notifications-card-header">
          <div className="painter-notifications-title">
            <div className="painter-notifications-title-icon">
              <Bell size={20} />
            </div>

            <div>
              <h2>Notifications</h2>
              <p>Your latest updates and alerts</p>
            </div>
          </div>
        </div>

        <div className="painter-notifications-list">
          {loading ? (
            <div className="painter-notifications-empty">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="painter-notifications-empty">
              No notifications found
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                className="painter-notification-item"
                key={notification._id}
              >
                <div className="painter-notification-icon">
                  <Bell size={18} />
                </div>

                <div className="painter-notification-content">
                  <h3>
                    {notification.title || "-"}
                  </h3>

                  <p>
                    {notification.message || "-"}
                  </p>
                </div>

                <div className="painter-notification-date">
                  <span>
                    {formatDate(notification.sentOn)}
                  </span>

                  <small>
                    {formatTime(notification.sentOn)}
                  </small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PainterNotifications;