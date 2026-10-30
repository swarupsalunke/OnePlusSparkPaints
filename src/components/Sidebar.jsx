import { useState } from "react";
import {
  LayoutDashboard,
  UsersRound,
  Package,
  Tag,
  Store,
  ShoppingCart,
  ClipboardList,
  QrCode,
  Gift,
  Factory,
  Settings,
  Headphones,
  Phone,
  ChevronRight,
  ChevronDown,
  FileText,
  Wallet,
  FileBarChart,
  Boxes,
  Truck,
  PackageCheck,
  Users,
  WalletCards,
  Bell,
  MessageSquare,
  Cake,
  Award,
  Map,
  FileSpreadsheet,
  FileCheck,
  Contact,
  Share2,
  Menu,
  X,
  House,
  MoreHorizontal,

} from "lucide-react";

import { NavLink, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import "../css/superadmin/sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [schemeOpen, setSchemeOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [systemSettingsOpen, setSystemSettingsOpen] = useState(false);
  const [manufacturingOpen, setManufacturingOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [inboundOpen, setInboundOpen] = useState(false);
  const [hrOpen, setHrOpen] = useState(false);
  const [commissionOpen, setCommissionOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [birthdayOpen, setBirthdayOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [loyaltyTierOpen, setLoyaltyTierOpen] = useState(false);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [salesVisitOpen, setSalesVisitOpen] = useState(false);
  const [bankPaymentOpen, setBankPaymentOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [socialMediaOpen, setSocialMediaOpen] = useState(false);

  const mobilePageTitles = {
    "/dashboard": "Dashboard",
    "/users": "User Management",
    "/products": "Product Management",
    "/prices": "Price Management",
    "/daily-cash-report": "Daily Reports",
    "/order-management": "Order Management",
    "/leads": "Lead Management",
    "/qr-management": "QR Management",
    "/reward-dashboard": "Rewards Management",
    "/scheme-management": "Scheme Management",
    "/finance-dashboard": "Finance Management",
    "/reports": "Reports Management",
    "/manufacturing-batch-management": "Manufacturing",
    "/inventory-management": "Inventory Management",
    "/dispatch-management": "Dispatch Management",
    "/inbound-material-management": "Inbound Material Management",
    "/employee-hr-management": "Employee HR Management",
    "/commission-management": "Commission Management",
    "/document-management": "Downloads & Documents",
    "/birthday-management": "Birthday Management",
    "/feedback-management": "Feedback Management",
    "/follow-up-management": "Follow-up Management",
    "/bank-payment-sheet": "Bank Payment Sheet",
    "/approval-workflow": "Approval Workflow",
    "/directory": "Directory",
    "/social-media-activities": "Marketing",
    "/loyalty-tier-management": "Loyalty Tier Management",
    "/sales-visit-planning": "Sales Visit Planning",
    "/notification-management": "Notification & Subscription",
    "/system-settings": "System Settings",
    "/supplier-vendor-management": "Supplier & Vendor Management",
  };

  const currentPageTitle =
    mobilePageTitles[location.pathname] || "Dashboard";

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* ================= MOBILE HEADER ================= */}
      <header className="mobile-sidebar-header">
        <button
          type="button"
          className="mobile-header-menu-btn"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={21} />
        </button>

        <div className="mobile-header-title">
          <strong>{currentPageTitle}</strong>
          <span>OneplusSpark</span>
        </div>

        <div className="mobile-header-brand">OS</div>
      </header>

      {/* ================= MOBILE OVERLAY ================= */}
      {mobileMenuOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      <aside
        className={`dashboard-sidebar ${mobileMenuOpen ? "mobile-sidebar-open" : ""
          }`}
      >

        {/* ================= MOBILE DRAWER CLOSE ================= */}
        <button
          type="button"
          className="mobile-sidebar-close"
          onClick={closeMobileMenu}
          aria-label="Close navigation menu"
        >
          <X size={20} />
        </button>

        {/* ================= LOGO ================= */}
        <div className="dashboard-logo">
          <span>Oneplus</span>
          <strong>Spark</strong>
          <small>PAINTS</small>
        </div>


        {/* ================= MAIN MENU ================= */}
        <nav
          className="dashboard-nav"
          onClick={(event) => {
            if (event.target.closest("a")) {
              closeMobileMenu();
            }
          }}
        >

          {/* Dashboard */}
          <NavLink
            to="/dashboard"
            className="dashboard-nav-item"
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </NavLink>


          {/* User Management */}
          <NavLink
            to="/users"
            className="dashboard-nav-item"
          >
            <UsersRound size={19} />
            <span>User Management</span>
          </NavLink>


          {/* Product Management */}
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <Package size={19} />
            <span>Product Management</span>
          </NavLink>


          {/* Price Management */}
          <NavLink
            to="/prices"
            className="dashboard-nav-item"
          >
            <Tag size={19} />
            <span>Price Management</span>
          </NavLink>

          <NavLink
            to="/daily-cash-report"
            className="dashboard-nav-item"
          >
            <Store size={19} />
            <span>Store Management</span>
          </NavLink>

          <NavLink
            to="/order-management"
            className="dashboard-nav-item"
          >
            <ShoppingCart size={19} />
            <span>Order Management</span>
          </NavLink>


          {/* Lead Management */}
          <NavLink
            to="/leads"
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <ClipboardList size={19} />
            <span>Lead Management</span>
          </NavLink>


          {/* QR Management */}
          <NavLink
            to="/qr-management"
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <QrCode size={19} />
            <span>QR Management</span>
          </NavLink>


          {/* Rewards Management */}
          <NavLink
            to="/reward-dashboard"
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <Gift size={19} />
            <span>Rewards Management</span>
          </NavLink>

          {/* Scheme Management */}
          <NavLink
            to="/scheme-management"
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <Gift size={19} />
            <span>Scheme Management</span>
          </NavLink>
          {/* Finance Management */}
          <NavLink
            to="/finance-dashboard"
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <Wallet size={19} />
            <span>Finance Management</span>
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <FileBarChart size={19} />
            <span>Reports Management</span>
          </NavLink>

          <NavLink
            to="/manufacturing-batch-management"
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <Factory size={19} />
            <span>Manufacturing</span>
          </NavLink>

          <NavLink
            to="/inventory-management"
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <Boxes size={19} />
            <span>Inventory Management</span>
          </NavLink>


          <NavLink
            to="/dispatch-management"
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <Truck size={19} />
            <span>Dispatch Management</span>
          </NavLink>

          <NavLink
            to="/inbound-material-management"
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <PackageCheck size={19} />
            <span>Inbound Material Management</span>
          </NavLink>

          <NavLink
            to="/supplier-vendor-management"
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <Store size={19} />
            <span>Supplier & Vendor Management</span>
          </NavLink>

          <NavLink
            to="/employee-hr-management"
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <Users size={19} />
            <span>Employee HR Management</span>
          </NavLink>

          <NavLink
            to="/commission-management"
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <WalletCards size={19} />
            <span>Commission Management</span>
          </NavLink>

          <NavLink
            to="/document-management"
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <FileText size={19} />
            <span>Downloads & Documents</span>
          </NavLink>

          <NavLink
            to="/birthday-management"
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <Cake size={19} />
            <span>Birthday Management</span>
          </NavLink>

          <NavLink
            to="/feedback-management"
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <MessageSquare size={19} />
            <span>Feedback Management</span>
          </NavLink>

          <NavLink
            to="/follow-up-management"
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <Users size={19} />
            <span>Follow-up Management</span>
          </NavLink>


          <NavLink
            to="/bank-payment-sheet"
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <Wallet size={19} />
            <span>Bank Payment Sheet</span>
          </NavLink>

          <NavLink
            to="/approval-workflow"
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <FileCheck size={19} />
            <span>Approval Workflow</span>
          </NavLink>

          <NavLink
            to="/directory"
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <Users size={19} />
            <span>Directory</span>
          </NavLink>


          <NavLink
            to="/social-media-activities"
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <Share2 size={19} />
            <span>Marketing</span>
          </NavLink>

          <NavLink
            to="/loyalty-tier-management"
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <Award size={19} />
            <span>Loyalty Tier Management</span>
          </NavLink>

          <NavLink
            to="/sales-visit-planning"
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <Map size={19} />
            <span>Sales Visit Planning</span>
          </NavLink>

          <NavLink
            to="/notification-management"
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <Bell size={19} />
            <span>Notification & Subscription</span>
          </NavLink>

          {/* <NavLink
            to="/system-settings"
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <Settings size={19} />
            <span>System Settings</span>
          </NavLink> */}

        </nav>


        {/* ================= HELP & SUPPORT ================= */}
        <div className="dashboard-sidebar-bottom">
          <Link to="/help-support" className="support-box">
            <div className="support-title">
              <Headphones size={18} />
              <strong>Help & Support</strong>
            </div>

            <p>support@oneplusspark.com</p>

            <div className="support-phone">
              <Phone size={16} />
              <span>+91 12345 67890</span>
            </div>
          </Link>
        </div>


        {/* ================= VERSION ================= */}
        <div className="sidebar-version">
          Version 1.0.0
        </div>

      </aside>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `mobile-bottom-nav-item ${isActive ? "active" : ""}`
          }
        >
          <House size={19} />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) =>
            `mobile-bottom-nav-item ${isActive ? "active" : ""}`
          }
        >
          <Package size={19} />
          <span>Products</span>
        </NavLink>

        <NavLink
          to="/order-management"
          className={({ isActive }) =>
            `mobile-bottom-nav-item ${isActive ? "active" : ""}`
          }
        >
          <ShoppingCart size={19} />
          <span>Orders</span>
        </NavLink>

        <button
          type="button"
          className="mobile-bottom-nav-item mobile-more-btn"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open more navigation options"
        >
          <MoreHorizontal size={20} />
          <span>More</span>
        </button>
      </nav>
    </>
  );
};

export default Sidebar;