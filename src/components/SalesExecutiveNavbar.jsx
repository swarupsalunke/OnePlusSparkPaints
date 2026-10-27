
import React, { useEffect, useState } from "react";
import { Menu, Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../css/salesExecutive/SalesExecutiveNavbar.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://oneplussparkpaintsserver.onrender.com"
).replace(/\/+$/, "");

const SalesExecutiveNavbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "",
    profilePicture: "",
  });
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken") ||
          localStorage.getItem("authToken");

        if (!token) return;

        const response = await fetch(
          `${API_BASE_URL}/api/sales-executive/profile-management`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Profile API failed: ${response.status}`);
        }

        const result = await response.json();
        const user = result.profile || {};

        setProfile({
          name: user.name || user.fullName || "Sales Executive",
          profilePicture: user.profilePicture || "",
        });

        setImageError(false);
      } catch (error) {
        console.error("Navbar profile fetch error:", error);
      }
    };

    fetchProfile();
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";

    if (/^(https?:\/\/|data:|blob:)/i.test(imagePath)) {
      return imagePath;
    }

    return `${API_BASE_URL}/${imagePath.replace(/^\/+/, "")}`;
  };

  return (
    <header className="sales-executive-navbar">
      <button
        type="button"
        className="sales-executive-menu-btn"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      <div className="sales-executive-navbar-title">
        Sales Executive
      </div>

      <div className="sales-executive-navbar-actions">
        <button
          type="button"
          className="sales-executive-navbar-icon"
          aria-label="Notifications"
        >
          <Bell size={20} />
        </button>

        <button
          type="button"
          className="sales-executive-navbar-profile"
          onClick={() => navigate("/sales-executive/profile")}
          title="Open profile"
          aria-label="Open profile"
        >
          {profile.profilePicture && !imageError ? (
            <img
              src={getImageUrl(profile.profilePicture)}
              alt={profile.name}
              onError={() => setImageError(true)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          ) : (
            <User size={20} />
          )}
        </button>

        <span className="sales-executive-navbar-user-name">
          {profile.name || "Sales Executive"}
        </span>
      </div>
    </header>
  );
};

export default SalesExecutiveNavbar;
