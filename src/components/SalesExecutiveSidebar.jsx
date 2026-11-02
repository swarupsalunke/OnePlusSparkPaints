import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardCheck,
  LogOut,
  X,
  Map,
  Users,
  ShoppingCart,
  History,
  CreditCard,
  UserPlus,
  MessageSquare,
  Package,
  Target,
  BarChart,
  Download,
  Activity,
  CalendarDays,
} from "lucide-react";
import "../css/salesExecutive/SalesExecutiveSidebar.css";

const SalesExecutiveSidebar = ({
  activeMenu,
  isOpen,
  onMenuClick,
  onClose,
}) => {
  const menuItems = [
    { label: "Dashboard", path: "/sales-executive/dashboard", icon: LayoutDashboard },
    { label: "Attendance", path: "/sales-executive/attendance", icon: ClipboardCheck },
    { label: "Beat Plan", path: "/sales-executive/beat-plan", icon: Map },
    { label: "Lead Management", path: "/sales-executive/leads", icon: Users },
    { label: "Order Booking", path: "/sales-executive/order-booking", icon: ShoppingCart },
    { label: "Order History", path: "/sales-executive/order-history", icon: History },
    { label: "Collection Management", path: "/sales-executive/collection-management", icon: CreditCard },
    { label: "Dealer Registration", path: "/sales-executive/dealer-registration", icon: UserPlus },
    { label: "Painter Registration", path: "/sales-executive/painter-registration", icon: UserPlus },
    { label: "Complaint Management", path: "/sales-executive/complaint-management", icon: MessageSquare },
    { label: "Product Catalogue", path: "/sales-executive/product-catalogue", icon: Package },
    { label: "Target Management", path: "/sales-executive/target-management", icon: Target },
    { label: "Reports", path: "/sales-executive/reports", icon: BarChart },
    { label: "Download Centre", path: "/sales-executive/download-centre", icon: Download },
    { label: "Analytics Dashboard", path: "/sales-executive/analytics-dashboard", icon: Activity },
    { label: "Follow Up Management", path: "/sales-executive/follow-up-management", icon: CalendarDays },
    { label: "Profile Management", path: "/sales-executive/profile-management", icon: Users },
    { label: "Internal Chat", icon: MessageSquare, path: "/sales-executive/internal-communication" },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="sales-executive-sidebar-overlay active"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sales-executive-sidebar ${
          isOpen ? "sales-executive-sidebar-open" : ""
        }`}
      >
        <div className="sales-executive-sidebar-header">
          <div className="sales-executive-sidebar-logo">
            <span>Oneplus</span>
            <strong>Spark</strong>
            <small>PAINTS</small>
          </div>

          <button
            type="button"
            className="sales-executive-sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sales-executive-sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/sales-executive/dashboard"}
                className={({ isActive }) =>
                  `sales-executive-sidebar-item ${
                    isActive ? "sales-executive-sidebar-item-active" : ""
                  }`
                }
                onClick={onMenuClick}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* <button
            type="button"
            className="sales-executive-sidebar-item sales-executive-sidebar-logout"
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button> */}
        </nav>

        <div className="sales-executive-sidebar-bottom">
          <div className="sales-executive-sidebar-support">
            <strong>Help &amp; Support</strong>
            <p>support@oneplusspark.com</p>
            <span>+91 12345 67890</span>
          </div>
          <div className="sales-executive-sidebar-version">
            Version 1.0.0
          </div>
        </div>
      </aside>
    </>
  );
};

export default SalesExecutiveSidebar;
