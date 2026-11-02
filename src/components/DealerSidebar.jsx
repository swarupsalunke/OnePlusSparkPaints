import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  PackageCheck,
  Gift,
  Award,
  Tag,
  Package,
  Download,
  Users,
  Wallet,
  BarChart3,
  UserPlus,
  Bell,
  MessageSquareWarning,
  UserCircle,
  X,
  MessageSquare,
} from "lucide-react";
import "../css/dealer/DealerSidebar.css";

const DealerSidebar = ({
  activeMenu = "Dashboard",
  onMenuClick,
  isOpen = false,
  onClose,
}) => {
  const navigate = useNavigate();

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Product Ordering", icon: ShoppingCart },
    { label: "Order History & Tracking", icon: PackageCheck },
    { label: "Rewards & Redemption", icon: Gift },
    { label: "Loyalty Tier", icon: Award },
    { label: "Schemes & Offers", icon: Tag },
    { label: "Product Catalogue", icon: Package },
    { label: "Download Center", icon: Download },
    { label: "Painter Enquiries", icon: Users },
    { label: "Payment & Outstanding", icon: Wallet },
    { label: "Purchase Analytics", icon: BarChart3 },
    { label: "Refer & Earn", icon: UserPlus },
    { label: "Notification", icon: Bell },
    { label: "Complaint Management", icon: MessageSquareWarning },
    { label: "Profile & Support", icon: UserCircle },
    { label: "Contact Support", icon: MessageSquareWarning },
    { label: "Internal Chat", icon: MessageSquare },
  ];

  const handleMenuClick = (label) => {
    onMenuClick?.(label);

    if (label === "Dashboard") {
      navigate("/dealer/dashboard");
    }

    if (label === "Product Ordering") {
      navigate("/dealer/product-ordering");
    }

    if (label === "Order History & Tracking") {
      navigate("/dealer/order-history");
    }

    if (label === "Rewards & Redemption") {
      navigate("/dealer/reward-wallet");
    }

    if (label === "Loyalty Tier") {
      navigate("/dealer/loyalty-tier");
    }

    if (label === "Schemes & Offers") {
      navigate("/dealer/schemes");
    }

    if (label === "Product Catalogue") {
      navigate("/dealer/product-catalogue");
    }

    if (label === "Download Center") {
      navigate("/dealer/download-centre");
    }

    if (label === "Painter Enquiries") {
      navigate("/dealer/painter-enquiries");
    }

    if (label === "Payment & Outstanding") {
      navigate("/dealer/payment-outstanding");
    }

    if (label === "Purchase Analytics") {
      navigate("/dealer/purchase-analytics");
    }

    if (label === "Refer & Earn") {
      navigate("/dealer/refer-earn");
    }

    if (label === "Notification") {
      navigate("/dealer/notifications");
    }

    if (label === "Complaint Management") {
      navigate("/dealer/complaints");
    }

    if (label === "Profile & Support") {
      navigate("/dealer/profile");
    }

    if (label === "Contact Support") {
      navigate("/dealer/contact-support");
    }

    if (label === "Internal Chat") {
      navigate("/dealer/internal-communication");
    }

    onClose?.();
  };

  return (
    <>
      <div
        className={`dealer-sidebar-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
      />

      <aside className={`dealer-sidebar ${isOpen ? "open" : ""}`}>
        <div className="dealer-sidebar-header">
          <div>
            <h2>Dealer Portal</h2>
            <span>OnePlus Spark</span>
          </div>

          <button
            type="button"
            className="dealer-sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={21} />
          </button>
        </div>

        <div className="dealer-sidebar-menu-wrapper">
          <nav className="dealer-sidebar-menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.label;

              return (
                <button
                  type="button"
                  key={item.label}
                  className={`dealer-sidebar-menu-item ${isActive ? "active" : ""
                    }`}
                  onClick={() => handleMenuClick(item.label)}
                >
                  <div className="dealer-sidebar-menu-left">
                    <Icon size={19} strokeWidth={1.8} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default DealerSidebar;