import React, { useEffect, useState } from "react";
import {
  Award, Bell, BookOpen, ChevronDown, ChevronLeft,
  FileText, Gift, HelpCircle, Home, LockKeyhole, MapPin,
  MessageSquare, Package, QrCode, ShoppingBag, Share2,
  Star, Target, User, UserPlus, X, BarChart3, Trophy,
} from "lucide-react";

import { useLocation } from "react-router-dom";

import "../css/painter/PainterSidebar.css";

const PainterSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  /* =====================================================
     MAIN MENU
  ===================================================== */

  const mainMenuItems = [
    {
      label: "Dashboard",
      icon: Home,
      path: "/painter/dashboard",
    },
    {
      label: "Scan & Rewards",
      icon: QrCode,
      path: "/painter/barcode-scanner",
    },
    {
      label: "Rewards",
      icon: Gift,
      path: "/painter/rewards",
    },
    {
      label: "Reward Redemption",
      icon: Gift,
      path: "/painter/redemption-dashboard",
    },
    {
      label: "Loyalty Tier",
      icon: Award,
      path: "/painter/loyalty-dashboard",
    },
    {
      label: "Schemes & Offers",
      icon: Target,
      path: "/painter/schemes-offers",
    },
    {
      label: "Notifications & Alerts",
      icon: Bell,
      path: "/painter/notification-listing",
    },
    // {
    //   label: "Products",
    //   icon: Package,
    //   path: "/painter/products",
    // },
    {
      label: "Shop",
      icon: ShoppingBag,
      path: "/painter/shop",
    },
    {
      label: "Refer & Earn",
      icon: UserPlus,
      path: "/painter/refer-earn",
    },
    {
      label: "Voice of Painter",
      icon: MessageSquare,
      path: "/painter/voice-of-painter",
    },
    {
      label: "Leads",
      icon: BookOpen,
      path: "/painter/leads",
    },
    {
      label: "Complaints",
      icon: MessageSquare,
      path: "/painter/complaints",
    },
    {
      label: "Downloads",
      icon: FileText,
      path: "/painter/download-centre",
    },
    {
      label: "Analytics",
      icon: Award,
      path: "/painter/analytics",
    },
    {
      label: "Profile",
      icon: Star,
      path: "/painter/profile",
    },
    {
      label: "Support",
      icon: HelpCircle,
      path: "/painter/contact-us",
    },
    {
  label: "Internal Chat",
  icon: MessageSquare,
  path: "/painter/internal-communication",
},
  ];

  /* =====================================================
     DASHBOARD SUBMENU
  ===================================================== */

  const dashboardItems = [
    {
      label: "Dashboard",
      icon: Home,
      path: "/painter/dashboard",
    },
    {
      label: "Quick Scan",
      icon: QrCode,
      path: "/painter/quick-scan",
    },
    {
      label: "Quick Shop",
      icon: ShoppingBag,
      path: "/painter/quick-shop",
    },
    {
      label: "Quick Rewards",
      icon: Gift,
      path: "/painter/quick-rewards",
    },
    {
      label: "Monthly Reward Summary",
      icon: Award,
      path: "/painter/monthly-reward-summary",
    },
    {
      label: "Notifications",
      icon: Bell,
      path: "/painter/notifications",
    },
  ];

  /* =====================================================
     SCAN & REWARDS SUBMENU
  ===================================================== */

  const scanRewardsItems = [
    {
      label: "Barcode Scanner",
      icon: QrCode,
      path: "/painter/barcode-scanner",
    },
    {
      label: "Manual Code Entry",
      icon: QrCode,
      path: "/painter/manual-code-entry",
    },
    {
      label: "Scan Result",
      icon: QrCode,
      path: "/painter/scan-result",
    },
    {
      label: "Invalid QR Popup",
      icon: QrCode,
      path: "/painter/invalid-qr",
    },
    {
      label: "Duplicate QR Popup",
      icon: QrCode,
      path: "/painter/duplicate-qr",
    },
    {
      label: "Scan History",
      icon: QrCode,
      path: "/painter/scan-history",
    },
    {
      label: "Product Verification",
      icon: QrCode,
      path: "/painter/product-verification",
    },
    {
      label: "Reward History",
      icon: Award,
      path: "/painter/reward-history",
    },
    {
      label: "Wallet Ledger",
      icon: FileText,
      path: "/painter/wallet-ledger",
    },
  ];

  /* =====================================================
     REWARDS & ANALYTICS SUBMENU
  ===================================================== */

  const rewardAnalyticsItems = [
    {
      label: "Reward Dashboard",
      icon: Gift,
      path: "/painter/reward-dashboard",
    },
    {
      label: "Reward Wallet",
      icon: Gift,
      path: "/painter/reward-wallet",
    },
    {
      label: "Reward Ledger",
      icon: FileText,
      path: "/painter/reward-ledger",
    },
    {
      label: "Reward Transaction History",
      icon: FileText,
      path: "/painter/reward-transaction-history",
    },
    {
      label: "Reward Analytics",
      icon: Award,
      path: "/painter/reward-analytics",
    },
    {
      label: "Scheme Performance",
      icon: Target,
      path: "/painter/scheme-performance",
    },
  ];

  const redemptionItems = [
    {
      label: "Redemption Dashboard",
      icon: Gift,
      path: "/painter/redemption-dashboard",
    },
    {
      label: "Redeem Rewards",
      icon: Gift,
      path: "/painter/redeem-rewards",
    },
    {
      label: "Redemption Request",
      icon: FileText,
      path: "/painter/redemption-request",
    },
    {
      label: "Redemption History",
      icon: FileText,
      path: "/painter/redemption-history",
    },
    {
      label: "Redemption Status",
      icon: Award,
      path: "/painter/redemption-status",
    },
  ];

  const loyaltyTierItems = [
    {
      label: "Loyalty Dashboard",
      icon: Award,
      path: "/painter/loyalty-dashboard",
    },
    {
      label: "Tier Progress",
      icon: Target,
      path: "/painter/tier-progress",
    },
    {
      label: "Tier Benefits",
      icon: Gift,
      path: "/painter/tier-benefits",
    },
  ];

  const schemesOffersItems = [
    {
      label: "Scheme Listing",
      icon: FileText,
      path: "/painter/scheme-listing",
    },
    {
      label: "Scheme Details",
      icon: FileText,
      path: "/painter/scheme-details",
    },
    {
      label: "Scheme PDF Preview",
      icon: FileText,
      path: "/painter/scheme-pdf-preview",
    },
    {
      label: "Offers Listing",
      icon: Gift,
      path: "/painter/offers-listing",
    },
    {
      label: "Offer Details",
      icon: Gift,
      path: "/painter/offer-details",
    },
  ];
  const notificationsAlertsItems = [
    {
      label: "Notification Listing",
      icon: Bell,
      path: "/painter/notification-listing",
    },
    {
      label: "Notification Details",
      icon: Bell,
      path: "/painter/notification-details",
    },
  ];

  const referralItems = [
    {
      label: "Referral Dashboard",
      icon: UserPlus,
      path: "/painter/referral-dashboard",
    },
    {
      label: "Share Referral",
      icon: UserPlus,
      path: "/painter/share-referral",
    },
    {
      label: "Referral History",
      icon: FileText,
      path: "/painter/referral-history",
    },
    {
      label: "Referral Status",
      icon: Award,
      path: "/painter/referral-status",
    },
  ];

  const downloadItems = [
    {
      label: "Category Listing",
      icon: FileText,
      path: "/painter/download-category-listing",
    },
    {
      label: "Product Listing",
      icon: Package,
      path: "/painter/download-product-listing",
    },
    {
      label: "Product Details",
      icon: FileText,
      path: "/painter/download-product-details",
    },
    {
      label: "Product Images",
      icon: Package,
      path: "/painter/download-product-images",
    },
    {
      label: "Document Preview",
      icon: FileText,
      path: "/painter/download-document-preview",
    },
  ];

  const shopItems = [
    {
      label: "Shop Dashboard",
      icon: ShoppingBag,
      path: "/painter/shop",
    },
    {
      label: "Product Listing",
      icon: Package,
      path: "/painter/shop-product-listing",
    },
    {
      label: "Product Details",
      icon: FileText,
      path: "/painter/shop-product-details",
    },
    {
      label: "Shopping Cart",
      icon: ShoppingBag,
      path: "/painter/shop-cart",
    },
    {
      label: "Submit Enquiry",
      icon: FileText,
      path: "/painter/shop-submit-enquiry",
    },
    {
      label: "Enquiry History",
      icon: FileText,
      path: "/painter/shop-enquiry-history",
    },
    {
      label: "Enquiry Details",
      icon: FileText,
      path: "/painter/shop-enquiry-details",
    },
  ];
  const voiceItems = [
    {
      label: "Voice Dashboard",
      icon: MessageSquare,
      path: "/painter/voice-of-painter",
    },
    {
      label: "Upload Video",
      icon: FileText,
      path: "/painter/voice-of-painter/upload-video",
    },
    {
      label: "Upload Images",
      icon: FileText,
      path: "/painter/voice-of-painter/upload-images"
    },
    {
      label: "Submit Feedback",
      icon: MessageSquare,
      path: "/painter/voice-of-painter/submit-feedback",
    },
    {
      label: "Complaints",
      icon: MessageSquare,
      path: "/painter/voice-of-painter/complaint",
    },
    {
      label: "Submission History",
      icon: FileText,
      path: "/painter/voice-of-painter/submission-history",
    },
  ];

  const leadItems = [
    {
      label: "Lead Listing",
      icon: BookOpen,
      path: "/painter/leads",
    },
    {
      label: "Lead Details",
      icon: FileText,
      path: "/painter/lead-details",
    },
    {
      label: "Customer Details",
      icon: UserPlus,
      path: "/painter/customer-details",
    },
    {
      label: "Lead Status",
      icon: Target,
      path: "/painter/lead-status",
    },
    {
      label: "Follow-up Notes",
      icon: FileText,
      path: "/painter/follow-up-notes",
    },
  ];

  const supportItems = [
    {
      label: "Contact Us",
      icon: HelpCircle,
      path: "/painter/contact-us",
    },
    {
      label: "WhatsApp Support",
      icon: MessageSquare,
      path: "/painter/whatsapp-support",
    },
    {
      label: "Email Support",
      icon: FileText,
      path: "/painter/email-support",
    },
  ];

  const complaintItems = [
    {
      label: "Complaint Listing",
      icon: FileText,
      path: "/painter/complaints",
    },
    {
      label: "Raise Complaint",
      icon: MessageSquare,
      path: "/painter/raise-complaint",
    },
    {
      label: "Complaint Details",
      icon: FileText,
      path: "/painter/complaint-details",
    },
    {
      label: "Complaint History",
      icon: FileText,
      path: "/painter/complaint-history",
    },
  ];

  const profileItems = [
    {
      label: "My Profile",
      icon: User,
      path: "/painter/profile",
    },
    {
      label: "Edit Profile",
      icon: User,
      path: "/painter/profile/edit",
    },
    {
      label: "Bank Details",
      icon: FileText,
      path: "/painter/profile/bank-details",
    },
    {
      label: "Address Details",
      icon: MapPin,
      path: "/painter/profile/address-details",
    },
    {
      label: "Notification Settings",
      icon: Bell,
      path: "/painter/profile/notification-settings",
    },
    {
      label: "Change Password",
      icon: LockKeyhole,
      path: "/painter/profile/change-password",
    },
    {
      label: "Share Profile",
      icon: Share2,
      path: "/painter/profile/share",
    },
    {
      label: "Profile Preview",
      icon: User,
      path: "/painter/profile/preview",
    },
  ];

  const analyticsItems = [
    {
      label: "Performance Dashboard",
      icon: Award,
      path: "/painter/analytics/performance-dashboard",
    },
    {
      label: "Monthly Performance",
      icon: BarChart3,
      path: "/painter/analytics/monthly-performance",
    },
    {
      label: "Milestone Progress",
      icon: Target,
      path: "/painter/analytics/milestone-progress",
    },
    {
      label: "Leaderboard (Future)",
      icon: Trophy,
      path: "/painter/analytics/leaderboard",
    },
  ];

  /* =====================================================
     ACTIVE ROUTES
  ===================================================== */

  const dashboardPaths = [
    "/painter/dashboard",
    ...dashboardItems.map((item) => item.path),
  ];

  const isDashboardSectionActive =
    dashboardPaths.includes(location.pathname);

  const scanRewardsPaths = scanRewardsItems.map(
    (item) => item.path
  );

  const isScanRewardsSectionActive =
    scanRewardsPaths.includes(location.pathname);

  const rewardAnalyticsPaths = rewardAnalyticsItems.map(
    (item) => item.path
  );

  const isRewardAnalyticsSectionActive =
    rewardAnalyticsPaths.includes(location.pathname);

  const redemptionPaths = redemptionItems.map(
    (item) => item.path
  );

  const isRedemptionSectionActive =
    redemptionPaths.includes(location.pathname);

  const loyaltyTierPaths = loyaltyTierItems.map(
    (item) => item.path
  );

  const isLoyaltyTierSectionActive =
    loyaltyTierPaths.includes(location.pathname);

  const schemesOffersPaths = schemesOffersItems.map((item) => item.path);
  const isSchemesOffersSectionActive = schemesOffersPaths.includes(location.pathname);

  const notificationsAlertsPaths = notificationsAlertsItems.map(
    (item) => item.path
  );

  const isNotificationsAlertsSectionActive =
    notificationsAlertsPaths.includes(location.pathname);

  const referralPaths = referralItems.map((item) => item.path);

  const isReferralSectionActive =
    referralPaths.includes(location.pathname);

  const downloadPaths = downloadItems.map((item) => item.path);

  const isDownloadSectionActive =
    downloadPaths.includes(location.pathname);

  const shopPaths = shopItems.map((item) => item.path);

  const isShopSectionActive =
    shopPaths.includes(location.pathname);

  const voicePaths = voiceItems.map((item) => item.path);
  const isVoiceSectionActive = voicePaths.includes(location.pathname);

  const leadPaths = leadItems.map((item) => item.path);
  const isLeadSectionActive = leadPaths.includes(location.pathname);

  const supportPaths = supportItems.map((item) => item.path);
  const isSupportSectionActive = supportPaths.includes(location.pathname);

  const complaintPaths = complaintItems.map((item) => item.path);
  const isComplaintSectionActive = complaintPaths.includes(location.pathname);

  const profilePaths = profileItems.map((item) => item.path);
  const isProfileSectionActive = profilePaths.includes(location.pathname);

  const analyticsPaths = analyticsItems.map((item) => item.path);

  const isAnalyticsSectionActive = analyticsPaths.includes(location.pathname);

  /* =====================================================
     DROPDOWN STATE - ONLY OPEN IF ACTIVE
  ===================================================== */
  const [dashboardOpen, setDashboardOpen] = useState(
    isDashboardSectionActive
  );

  const [scanRewardsOpen, setScanRewardsOpen] = useState(
    isScanRewardsSectionActive
  );

  const [rewardAnalyticsOpen, setRewardAnalyticsOpen] = useState(
    isRewardAnalyticsSectionActive
  );

  const [redemptionOpen, setRedemptionOpen] = useState(
    isRedemptionSectionActive
  );

  const [loyaltyTierOpen, setLoyaltyTierOpen] = useState(
    isLoyaltyTierSectionActive
  );

  const [schemesOffersOpen, setSchemesOffersOpen] = useState(
    isSchemesOffersSectionActive
  );

  const [notificationsAlertsOpen, setNotificationsAlertsOpen] =
    useState(isNotificationsAlertsSectionActive);

  const [referralOpen, setReferralOpen] = useState(
    isReferralSectionActive
  );

  const [downloadOpen, setDownloadOpen] = useState(
    isDownloadSectionActive
  );

  const [shopOpen, setShopOpen] = useState(
    isShopSectionActive
  );

  const [voiceOpen, setVoiceOpen] = useState(isVoiceSectionActive);

  const [leadOpen, setLeadOpen] = useState(isLeadSectionActive);

  const [supportOpen, setSupportOpen] = useState(isSupportSectionActive);

  const [complaintOpen, setComplaintOpen] = useState(isComplaintSectionActive);

  const [profileOpen, setProfileOpen] = useState(isProfileSectionActive);

  const [analyticsOpen, setAnalyticsOpen] = useState(isAnalyticsSectionActive);

  /* =====================================================
     KEEP DROPDOWN OPEN WHEN SUBMENU PAGE IS ACTIVE
  ===================================================== */

  useEffect(() => {
    if (isDashboardSectionActive) {
      setDashboardOpen(true);
    } else {
      setDashboardOpen(false);
    }

    if (isScanRewardsSectionActive) {
      setScanRewardsOpen(true);
    } else {
      setScanRewardsOpen(false);
    }

    if (isRewardAnalyticsSectionActive) {
      setRewardAnalyticsOpen(true);
    } else {
      setRewardAnalyticsOpen(false);
    }

    if (isRedemptionSectionActive) {
      setRedemptionOpen(true);
    } else {
      setRedemptionOpen(false);
    }

    if (isLoyaltyTierSectionActive) {
      setLoyaltyTierOpen(true);
    } else {
      setLoyaltyTierOpen(false);
    }

    if (isSchemesOffersSectionActive) {
      setSchemesOffersOpen(true);
    } else {
      setSchemesOffersOpen(false);
    }

    if (isNotificationsAlertsSectionActive) {
      setNotificationsAlertsOpen(true);
    } else {
      setNotificationsAlertsOpen(false);
    }

    if (isReferralSectionActive) {
      setReferralOpen(true);
    } else {
      setReferralOpen(false);
    }

    if (isDownloadSectionActive) {
      setDownloadOpen(true);
    } else {
      setDownloadOpen(false);
    }

    if (isShopSectionActive) {
      setShopOpen(true);
    } else {
      setShopOpen(false);
    }

    if (isVoiceSectionActive) {
      setVoiceOpen(true);
    } else {
      setVoiceOpen(false);
    }

    if (isLeadSectionActive) {
      setLeadOpen(true);
    } else {
      setLeadOpen(false);
    }

    if (isSupportSectionActive) {
      setSupportOpen(true);
    } else {
      setSupportOpen(false);
    }

    if (isComplaintSectionActive) {
      setComplaintOpen(true);
    } else {
      setComplaintOpen(false);
    }

    if (isProfileSectionActive) {
      setProfileOpen(true);
    } else {
      setProfileOpen(false);
    }

    if (isAnalyticsSectionActive) {
      setAnalyticsOpen(true);
    } else {
      setAnalyticsOpen(false);
    }
  }, [
    isDashboardSectionActive,
    isScanRewardsSectionActive,
    isRewardAnalyticsSectionActive,
    isRedemptionSectionActive,
    isLoyaltyTierSectionActive,
    isSchemesOffersSectionActive,
    isNotificationsAlertsSectionActive,
    isReferralSectionActive,
    isDownloadSectionActive,
    isShopSectionActive,
    isVoiceSectionActive,
    isLeadSectionActive,
    isSupportSectionActive,
    isComplaintSectionActive,
    isProfileSectionActive,
    isAnalyticsSectionActive,
  ]);

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  /* =====================================================
     SUBMENU NAVIGATION
  ===================================================== */

  const handleDashboardNavigation = (path) => {
    setDashboardOpen(true);
    handleNavigation(path);
  };

  const handleRewardNavigation = (path) => {
    setRewardAnalyticsOpen(true);
    handleNavigation(path);
  };

  /* =====================================================
     CLOSE MOBILE SIDEBAR
  ===================================================== */

  const handleMobileNavigation = (path) => {
    if (window.innerWidth <= 768) {
      onClose?.();
    }

    handleNavigation(path);
  };

  return (
    <>
      {/* =================================================
          OVERLAY
      ================================================= */}

      {isOpen && (
        <div
          className="painter-sidebar-overlay"
          onClick={onClose}
        />
      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`painter-sidebar ${isOpen ? "painter-sidebar-open" : ""
          }`}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="painter-sidebar-header">
          <div>
            <h2>Painter Portal</h2>
            <span>OnePlus Spark</span>
          </div>

          <button
            type="button"
            className="painter-sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* =================================================
            MENU
        ================================================= */}

        <nav className="painter-sidebar-menu">

          {/* =================================================
              DASHBOARD GROUP
          ================================================= */}

          <div className="painter-sidebar-group">

            <div className="painter-sidebar-dashboard-row">

              <button
                type="button"
                className={`painter-sidebar-item painter-sidebar-dashboard-item ${isDashboardSectionActive
                  ? "painter-sidebar-active"
                  : ""
                  }`}
                onClick={() =>
                  handleMobileNavigation(
                    "/painter/dashboard"
                  )
                }
              >
                <Home size={18} />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                className={`painter-sidebar-dropdown-btn ${isDashboardSectionActive
                  ? "painter-sidebar-dropdown-active"
                  : ""
                  }`}
                onClick={() =>
                  setDashboardOpen((prev) => !prev)
                }
                aria-label="Toggle Dashboard menu"
                aria-expanded={dashboardOpen}
              >
                <ChevronDown
                  size={17}
                  className={
                    dashboardOpen
                      ? "painter-sidebar-chevron-open"
                      : ""
                  }
                />
              </button>

            </div>

            {/* =================================================
                DASHBOARD SUBMENU
            ================================================= */}

            {dashboardOpen && (
              <div className="painter-sidebar-submenu">

                {dashboardItems.map((item) => {
                  const Icon = item.icon;

                  const isActive =
                    location.pathname === item.path;

                  return (
                    <button
                      key={item.path}
                      type="button"
                      className={`painter-sidebar-subitem ${isActive
                        ? "painter-sidebar-subitem-active"
                        : ""
                        }`}
                      onClick={() =>
                        handleDashboardNavigation(
                          item.path
                        )
                      }
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}

              </div>
            )}

          </div>

          {/* =================================================
              MAIN MENU
          ================================================= */}

          {mainMenuItems.slice(1).map((item) => {
            const Icon = item.icon;

            const isScanRewards =
              item.label === "Scan & Rewards";

            const isRewards =
              item.label === "Rewards";

            const isRedemption =
              item.label === "Reward Redemption";

            const isLoyaltyTier =
              item.label === "Loyalty Tier";

            const isSchemesOffers =
              item.label === "Schemes & Offers";

            const isNotificationsAlerts =
              item.label === "Notifications & Alerts";

            const isReferral =
              item.label === "Refer & Earn";

            const isDownloads =
              item.label === "Downloads";

            const isShop =
              item.label === "Shop";

            const isVoice =
              item.label === "Voice of Painter";

            const isLead =
              item.label === "Leads";

            const isSupport =
              item.label === "Support";

            const isComplaint =
              item.label === "Complaints";

            const isProfile =
              item.label === "Profile";

            const isAnalytics =
              item.label === "Analytics";

            const isActive = isScanRewards
              ? isScanRewardsSectionActive
              : isRewards
                ? isRewardAnalyticsSectionActive
                : isRedemption
                  ? isRedemptionSectionActive
                  : isLoyaltyTier
                    ? isLoyaltyTierSectionActive
                    : isSchemesOffers
                      ? isSchemesOffersSectionActive
                      : isNotificationsAlerts
                        ? isNotificationsAlertsSectionActive
                        : isReferral
                          ? isReferralSectionActive
                          : isDownloads
                            ? isDownloadSectionActive
                            : isShop
                              ? isShopSectionActive
                              : isVoice
                                ? isVoiceSectionActive
                                : isLead
                                  ? isLeadSectionActive
                                  : isSupport
                                    ? isSupportSectionActive
                                    : isComplaint
                                      ? isComplaintSectionActive
                                      : isProfile
                                        ? isProfileSectionActive
                                        : isAnalytics
                                          ? isAnalyticsSectionActive
                                          : location.pathname === item.path;

            /* =================================================
                SCAN & REWARDS GROUP
            ================================================= */

            if (isScanRewards) {
              return (
                <div
                  className="painter-sidebar-group"
                  key={item.path}
                >
                  <div className="painter-sidebar-dashboard-row">

                    <button
                      type="button"
                      className={`painter-sidebar-item painter-sidebar-dashboard-item ${isActive
                        ? "painter-sidebar-active"
                        : ""
                        }`}
                      onClick={() =>
                        handleMobileNavigation(
                          "/painter/barcode-scanner"
                        )
                      }
                    >
                      <Icon size={18} />
                      <span>Scan & Rewards</span>
                    </button>

                    <button
                      type="button"
                      className={`painter-sidebar-dropdown-btn ${isActive
                        ? "painter-sidebar-dropdown-active"
                        : ""
                        }`}
                      onClick={() =>
                        setScanRewardsOpen(
                          (prev) => !prev
                        )
                      }
                      aria-label="Toggle Scan & Rewards menu"
                      aria-expanded={scanRewardsOpen}
                    >
                      <ChevronDown
                        size={17}
                        className={
                          scanRewardsOpen
                            ? "painter-sidebar-chevron-open"
                            : ""
                        }
                      />
                    </button>

                  </div>

                  {scanRewardsOpen && (
                    <div className="painter-sidebar-submenu">

                      {scanRewardsItems.map(
                        (subItem) => {
                          const SubIcon =
                            subItem.icon;

                          const isSubActive =
                            location.pathname ===
                            subItem.path;

                          return (
                            <button
                              key={subItem.path}
                              type="button"
                              className={`painter-sidebar-subitem ${isSubActive
                                ? "painter-sidebar-subitem-active"
                                : ""
                                }`}
                              onClick={() =>
                                handleMobileNavigation(
                                  subItem.path
                                )
                              }
                            >
                              <SubIcon size={16} />
                              <span>
                                {subItem.label}
                              </span>
                            </button>
                          );
                        }
                      )}

                    </div>
                  )}

                </div>
              );
            }

            /* =================================================
                REWARDS GROUP
            ================================================= */

            if (isRewards) {
              return (
                <div
                  className="painter-sidebar-group"
                  key={item.path}
                >
                  <div className="painter-sidebar-dashboard-row">

                    <button
                      type="button"
                      className={`painter-sidebar-item painter-sidebar-dashboard-item ${isActive
                        ? "painter-sidebar-active"
                        : ""
                        }`}
                      onClick={() =>
                        handleMobileNavigation(
                          "/painter/reward-dashboard"
                        )
                      }
                    >
                      <Icon size={18} />
                      <span>Rewards</span>
                    </button>

                    <button
                      type="button"
                      className={`painter-sidebar-dropdown-btn ${isActive
                        ? "painter-sidebar-dropdown-active"
                        : ""
                        }`}
                      onClick={() =>
                        setRewardAnalyticsOpen(
                          (prev) => !prev
                        )
                      }
                      aria-label="Toggle Rewards menu"
                      aria-expanded={rewardAnalyticsOpen}
                    >
                      <ChevronDown
                        size={17}
                        className={
                          rewardAnalyticsOpen
                            ? "painter-sidebar-chevron-open"
                            : ""
                        }
                      />
                    </button>

                  </div>

                  {rewardAnalyticsOpen && (
                    <div className="painter-sidebar-submenu">

                      {rewardAnalyticsItems.map(
                        (subItem) => {
                          const SubIcon =
                            subItem.icon;

                          const isSubActive =
                            location.pathname ===
                            subItem.path;

                          return (
                            <button
                              key={subItem.path}
                              type="button"
                              className={`painter-sidebar-subitem ${isSubActive
                                ? "painter-sidebar-subitem-active"
                                : ""
                                }`}
                              onClick={() =>
                                handleRewardNavigation(
                                  subItem.path
                                )
                              }
                            >
                              <SubIcon size={16} />
                              <span>
                                {subItem.label}
                              </span>
                            </button>
                          );
                        }
                      )}

                    </div>
                  )}

                </div>
              );
            }

            if (isRedemption) {
              return (
                <div
                  className="painter-sidebar-group"
                  key={item.path}
                >
                  <div className="painter-sidebar-dashboard-row">
                    <button
                      type="button"
                      className={`painter-sidebar-item painter-sidebar-dashboard-item ${isRedemptionSectionActive
                        ? "painter-sidebar-active"
                        : ""
                        }`}
                      onClick={() =>
                        handleMobileNavigation(
                          "/painter/redemption-dashboard"
                        )
                      }
                    >
                      <Icon size={18} />
                      <span>Reward Redemption</span>
                    </button>

                    <button
                      type="button"
                      className={`painter-sidebar-dropdown-btn ${isRedemptionSectionActive
                        ? "painter-sidebar-dropdown-active"
                        : ""
                        }`}
                      onClick={() =>
                        setRedemptionOpen((prev) => !prev)
                      }
                      aria-label="Toggle Reward Redemption menu"
                      aria-expanded={redemptionOpen}
                    >
                      <ChevronDown
                        size={17}
                        className={
                          redemptionOpen
                            ? "painter-sidebar-chevron-open"
                            : ""
                        }
                      />
                    </button>
                  </div>

                  {redemptionOpen && (
                    <div className="painter-sidebar-submenu">
                      {redemptionItems.map((subItem) => {
                        const SubIcon = subItem.icon;

                        const isSubActive =
                          location.pathname === subItem.path;

                        return (
                          <button
                            key={subItem.path}
                            type="button"
                            className={`painter-sidebar-subitem ${isSubActive
                              ? "painter-sidebar-subitem-active"
                              : ""
                              }`}
                            onClick={() =>
                              handleMobileNavigation(subItem.path)
                            }
                          >
                            <SubIcon size={16} />
                            <span>{subItem.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            if (isLoyaltyTier) {
              return (
                <div
                  className="painter-sidebar-group"
                  key={item.path}
                >
                  <div className="painter-sidebar-dashboard-row">

                    <button
                      type="button"
                      className={`painter-sidebar-item painter-sidebar-dashboard-item ${isLoyaltyTierSectionActive
                        ? "painter-sidebar-active"
                        : ""
                        }`}
                      onClick={() =>
                        handleMobileNavigation(
                          "/painter/loyalty-dashboard"
                        )
                      }
                    >
                      <Icon size={18} />
                      <span>Loyalty Tier</span>
                    </button>

                    <button
                      type="button"
                      className={`painter-sidebar-dropdown-btn ${isLoyaltyTierSectionActive
                        ? "painter-sidebar-dropdown-active"
                        : ""
                        }`}
                      onClick={() =>
                        setLoyaltyTierOpen((prev) => !prev)
                      }
                      aria-label="Toggle Loyalty Tier menu"
                      aria-expanded={loyaltyTierOpen}
                    >
                      <ChevronDown
                        size={17}
                        className={
                          loyaltyTierOpen
                            ? "painter-sidebar-chevron-open"
                            : ""
                        }
                      />
                    </button>

                  </div>

                  {loyaltyTierOpen && (
                    <div className="painter-sidebar-submenu">

                      {loyaltyTierItems.map((subItem) => {
                        const SubIcon = subItem.icon;

                        const isSubActive =
                          location.pathname === subItem.path;

                        return (
                          <button
                            key={subItem.path}
                            type="button"
                            className={`painter-sidebar-subitem ${isSubActive
                              ? "painter-sidebar-subitem-active"
                              : ""
                              }`}
                            onClick={() =>
                              handleMobileNavigation(
                                subItem.path
                              )
                            }
                          >
                            <SubIcon size={16} />
                            <span>{subItem.label}</span>
                          </button>
                        );
                      })}

                    </div>
                  )}
                </div>
              );
            }

            if (isReferral) {
              return (
                <div
                  className="painter-sidebar-group"
                  key={item.path}
                >
                  <div className="painter-sidebar-dashboard-row">

                    <button
                      type="button"
                      className={`painter-sidebar-item painter-sidebar-dashboard-item ${isReferralSectionActive
                        ? "painter-sidebar-active"
                        : ""
                        }`}
                      onClick={() =>
                        handleMobileNavigation(
                          "/painter/referral-dashboard"
                        )
                      }
                    >
                      <Icon size={18} />
                      <span>Refer & Earn</span>
                    </button>

                    <button
                      type="button"
                      className={`painter-sidebar-dropdown-btn ${isReferralSectionActive
                        ? "painter-sidebar-dropdown-active"
                        : ""
                        }`}
                      onClick={() =>
                        setReferralOpen((prev) => !prev)
                      }
                      aria-label="Toggle Refer & Earn menu"
                      aria-expanded={referralOpen}
                    >
                      <ChevronDown
                        size={17}
                        className={
                          referralOpen
                            ? "painter-sidebar-chevron-open"
                            : ""
                        }
                      />
                    </button>

                  </div>

                  {referralOpen && (
                    <div className="painter-sidebar-submenu">

                      {referralItems.map((subItem) => {
                        const SubIcon = subItem.icon;

                        const isSubActive =
                          location.pathname === subItem.path;

                        return (
                          <button
                            key={subItem.path}
                            type="button"
                            className={`painter-sidebar-subitem ${isSubActive
                              ? "painter-sidebar-subitem-active"
                              : ""
                              }`}
                            onClick={() =>
                              handleMobileNavigation(
                                subItem.path
                              )
                            }
                          >
                            <SubIcon size={16} />
                            <span>{subItem.label}</span>
                          </button>
                        );
                      })}

                    </div>
                  )}
                </div>
              );
            }


            if (isSchemesOffers) {
              return (
                <div
                  className="painter-sidebar-group"
                  key={item.path}
                >
                  <div className="painter-sidebar-dashboard-row">

                    <button
                      type="button"
                      className={`painter-sidebar-item painter-sidebar-dashboard-item ${isSchemesOffersSectionActive
                        ? "painter-sidebar-active"
                        : ""
                        }`}
                      onClick={() =>
                        handleMobileNavigation(
                          "/painter/scheme-listing"
                        )
                      }
                    >
                      <Icon size={18} />
                      <span>Schemes & Offers</span>
                    </button>

                    <button
                      type="button"
                      className={`painter-sidebar-dropdown-btn ${isSchemesOffersSectionActive
                        ? "painter-sidebar-dropdown-active"
                        : ""
                        }`}
                      onClick={() =>
                        setSchemesOffersOpen((prev) => !prev)
                      }
                      aria-label="Toggle Schemes & Offers menu"
                      aria-expanded={schemesOffersOpen}
                    >
                      <ChevronDown
                        size={17}
                        className={
                          schemesOffersOpen
                            ? "painter-sidebar-chevron-open"
                            : ""
                        }
                      />
                    </button>

                  </div>

                  {schemesOffersOpen && (
                    <div className="painter-sidebar-submenu">

                      {schemesOffersItems.map((subItem) => {
                        const SubIcon = subItem.icon;

                        const isSubActive =
                          location.pathname === subItem.path;

                        return (
                          <button
                            key={subItem.path}
                            type="button"
                            className={`painter-sidebar-subitem ${isSubActive
                              ? "painter-sidebar-subitem-active"
                              : ""
                              }`}
                            onClick={() =>
                              handleMobileNavigation(
                                subItem.path
                              )
                            }
                          >
                            <SubIcon size={16} />
                            <span>{subItem.label}</span>
                          </button>
                        );
                      })}

                    </div>
                  )}
                </div>
              );
            }

            if (isNotificationsAlerts) {
              return (
                <div
                  className="painter-sidebar-group"
                  key={item.path}
                >
                  <div className="painter-sidebar-dashboard-row">

                    <button
                      type="button"
                      className={`painter-sidebar-item painter-sidebar-dashboard-item ${isNotificationsAlertsSectionActive
                        ? "painter-sidebar-active"
                        : ""
                        }`}
                      onClick={() =>
                        handleMobileNavigation(
                          "/painter/notification-listing"
                        )
                      }
                    >
                      <Icon size={18} />
                      <span>Notifications & Alerts</span>
                    </button>

                    <button
                      type="button"
                      className={`painter-sidebar-dropdown-btn ${isNotificationsAlertsSectionActive
                        ? "painter-sidebar-dropdown-active"
                        : ""
                        }`}
                      onClick={() =>
                        setNotificationsAlertsOpen((prev) => !prev)
                      }
                      aria-label="Toggle Notifications & Alerts menu"
                      aria-expanded={notificationsAlertsOpen}
                    >
                      <ChevronDown
                        size={17}
                        className={
                          notificationsAlertsOpen
                            ? "painter-sidebar-chevron-open"
                            : ""
                        }
                      />
                    </button>

                  </div>

                  {notificationsAlertsOpen && (
                    <div className="painter-sidebar-submenu">

                      {notificationsAlertsItems.map((subItem) => {
                        const SubIcon = subItem.icon;

                        const isSubActive =
                          location.pathname === subItem.path;

                        return (
                          <button
                            key={subItem.path}
                            type="button"
                            className={`painter-sidebar-subitem ${isSubActive
                              ? "painter-sidebar-subitem-active"
                              : ""
                              }`}
                            onClick={() =>
                              handleMobileNavigation(
                                subItem.path
                              )
                            }
                          >
                            <SubIcon size={16} />
                            <span>{subItem.label}</span>
                          </button>
                        );
                      })}

                    </div>
                  )}
                </div>
              );
            }

            if (isDownloads) {
              return (
                <div
                  className="painter-sidebar-group"
                  key={item.path}
                >
                  <div className="painter-sidebar-dashboard-row">

                    <button
                      type="button"
                      className={`painter-sidebar-item painter-sidebar-dashboard-item ${isDownloadSectionActive
                        ? "painter-sidebar-active"
                        : ""
                        }`}
                      onClick={() =>
                        handleMobileNavigation(
                          "/painter/download-category-listing"
                        )
                      }
                    >
                      <Icon size={18} />
                      <span>Downloads</span>
                    </button>

                    <button
                      type="button"
                      className={`painter-sidebar-dropdown-btn ${isDownloadSectionActive
                        ? "painter-sidebar-dropdown-active"
                        : ""
                        }`}
                      onClick={() =>
                        setDownloadOpen((prev) => !prev)
                      }
                      aria-label="Toggle Downloads menu"
                      aria-expanded={downloadOpen}
                    >
                      <ChevronDown
                        size={17}
                        className={
                          downloadOpen
                            ? "painter-sidebar-chevron-open"
                            : ""
                        }
                      />
                    </button>

                  </div>

                  {downloadOpen && (
                    <div className="painter-sidebar-submenu">

                      {downloadItems.map((subItem) => {
                        const SubIcon = subItem.icon;

                        const isSubActive =
                          location.pathname === subItem.path;

                        return (
                          <button
                            key={subItem.path}
                            type="button"
                            className={`painter-sidebar-subitem ${isSubActive
                              ? "painter-sidebar-subitem-active"
                              : ""
                              }`}
                            onClick={() =>
                              handleMobileNavigation(
                                subItem.path
                              )
                            }
                          >
                            <SubIcon size={16} />
                            <span>{subItem.label}</span>
                          </button>
                        );
                      })}

                    </div>
                  )}
                </div>
              );
            }

            if (isShop) {
              return (
                <div
                  className="painter-sidebar-group"
                  key={item.path}
                >
                  <div className="painter-sidebar-dashboard-row">

                    <button
                      type="button"
                      className={`painter-sidebar-item painter-sidebar-dashboard-item ${isShopSectionActive
                        ? "painter-sidebar-active"
                        : ""
                        }`}
                      onClick={() =>
                        handleMobileNavigation(
                          "/painter/shop"
                        )
                      }
                    >
                      <Icon size={18} />
                      <span>Shop</span>
                    </button>

                    <button
                      type="button"
                      className={`painter-sidebar-dropdown-btn ${isShopSectionActive
                        ? "painter-sidebar-dropdown-active"
                        : ""
                        }`}
                      onClick={() =>
                        setShopOpen((prev) => !prev)
                      }
                      aria-label="Toggle Shop menu"
                      aria-expanded={shopOpen}
                    >
                      <ChevronDown
                        size={17}
                        className={
                          shopOpen
                            ? "painter-sidebar-chevron-open"
                            : ""
                        }
                      />
                    </button>

                  </div>

                  {shopOpen && (
                    <div className="painter-sidebar-submenu">

                      {shopItems.map((subItem) => {
                        const SubIcon = subItem.icon;

                        const isSubActive =
                          location.pathname ===
                          subItem.path;

                        return (
                          <button
                            key={subItem.path}
                            type="button"
                            className={`painter-sidebar-subitem ${isSubActive
                              ? "painter-sidebar-subitem-active"
                              : ""
                              }`}
                            onClick={() =>
                              handleMobileNavigation(
                                subItem.path
                              )
                            }
                          >
                            <SubIcon size={16} />
                            <span>{subItem.label}</span>
                          </button>
                        );
                      })}

                    </div>
                  )}
                </div>
              );
            }

            if (isVoice) {
              return (
                <div
                  className="painter-sidebar-group"
                  key={item.path}
                >
                  <div className="painter-sidebar-dashboard-row">

                    <button
                      type="button"
                      className={`painter-sidebar-item painter-sidebar-dashboard-item ${isVoiceSectionActive
                        ? "painter-sidebar-active"
                        : ""
                        }`}
                      onClick={() =>
                        handleMobileNavigation(
                          "/painter/voice-of-painter"
                        )
                      }
                    >
                      <Icon size={18} />
                      <span>Voice of Painter</span>
                    </button>

                    <button
                      type="button"
                      className={`painter-sidebar-dropdown-btn ${isVoiceSectionActive
                        ? "painter-sidebar-dropdown-active"
                        : ""
                        }`}
                      onClick={() =>
                        setVoiceOpen((prev) => !prev)
                      }
                      aria-label="Toggle Voice of Painter menu"
                      aria-expanded={voiceOpen}
                    >
                      <ChevronDown
                        size={17}
                        className={
                          voiceOpen
                            ? "painter-sidebar-chevron-open"
                            : ""
                        }
                      />
                    </button>

                  </div>

                  {voiceOpen && (
                    <div className="painter-sidebar-submenu">

                      {voiceItems.map((subItem) => {
                        const SubIcon = subItem.icon;

                        const isSubActive =
                          location.pathname === subItem.path;

                        return (
                          <button
                            key={subItem.path}
                            type="button"
                            className={`painter-sidebar-subitem ${isSubActive
                              ? "painter-sidebar-subitem-active"
                              : ""
                              }`}
                            onClick={() =>
                              handleMobileNavigation(
                                subItem.path
                              )
                            }
                          >
                            <SubIcon size={16} />
                            <span>{subItem.label}</span>
                          </button>
                        );
                      })}

                    </div>
                  )}
                </div>
              );
            }
            if (isLead) {
              return (
                <div
                  className="painter-sidebar-group"
                  key={item.path}
                >
                  <div className="painter-sidebar-dashboard-row">

                    <button
                      type="button"
                      className={`painter-sidebar-item painter-sidebar-dashboard-item ${isLeadSectionActive
                        ? "painter-sidebar-active"
                        : ""
                        }`}
                      onClick={() =>
                        handleMobileNavigation("/painter/leads")
                      }
                    >
                      <Icon size={18} />
                      <span>Leads</span>
                    </button>

                    <button
                      type="button"
                      className={`painter-sidebar-dropdown-btn ${isLeadSectionActive
                        ? "painter-sidebar-dropdown-active"
                        : ""
                        }`}
                      onClick={() =>
                        setLeadOpen((prev) => !prev)
                      }
                      aria-label="Toggle Leads menu"
                      aria-expanded={leadOpen}
                    >
                      <ChevronDown
                        size={17}
                        className={
                          leadOpen
                            ? "painter-sidebar-chevron-open"
                            : ""
                        }
                      />
                    </button>

                  </div>

                  {leadOpen && (
                    <div className="painter-sidebar-submenu">

                      {leadItems.map((subItem) => {
                        const SubIcon = subItem.icon;

                        const isSubActive =
                          location.pathname === subItem.path;

                        return (
                          <button
                            key={subItem.path}
                            type="button"
                            className={`painter-sidebar-subitem ${isSubActive
                              ? "painter-sidebar-subitem-active"
                              : ""
                              }`}
                            onClick={() =>
                              handleMobileNavigation(
                                subItem.path
                              )
                            }
                          >
                            <SubIcon size={16} />
                            <span>{subItem.label}</span>
                          </button>
                        );
                      })}

                    </div>
                  )}
                </div>
              );
            }

            if (isSupport) {
              return (
                <div
                  className="painter-sidebar-group"
                  key={item.path}
                >
                  <div className="painter-sidebar-dashboard-row">

                    <button
                      type="button"
                      className={`painter-sidebar-item painter-sidebar-dashboard-item ${isSupportSectionActive
                        ? "painter-sidebar-active"
                        : ""
                        }`}
                      onClick={() =>
                        handleMobileNavigation("/painter/contact-us")
                      }
                    >
                      <Icon size={18} />
                      <span>Support</span>
                    </button>

                    <button
                      type="button"
                      className={`painter-sidebar-dropdown-btn ${isSupportSectionActive
                        ? "painter-sidebar-dropdown-active"
                        : ""
                        }`}
                      onClick={() =>
                        setSupportOpen((prev) => !prev)
                      }
                      aria-label="Toggle Support menu"
                      aria-expanded={supportOpen}
                    >
                      <ChevronDown
                        size={17}
                        className={
                          supportOpen
                            ? "painter-sidebar-chevron-open"
                            : ""
                        }
                      />
                    </button>

                  </div>

                  {supportOpen && (
                    <div className="painter-sidebar-submenu">

                      {supportItems.map((subItem) => {
                        const SubIcon = subItem.icon;

                        const isSubActive =
                          location.pathname === subItem.path;

                        return (
                          <button
                            key={subItem.path}
                            type="button"
                            className={`painter-sidebar-subitem ${isSubActive
                              ? "painter-sidebar-subitem-active"
                              : ""
                              }`}
                            onClick={() =>
                              handleMobileNavigation(
                                subItem.path
                              )
                            }
                          >
                            <SubIcon size={16} />
                            <span>{subItem.label}</span>
                          </button>
                        );
                      })}

                    </div>
                  )}
                </div>
              );
            }

            if (isComplaint) {
              return (
                <div className="painter-sidebar-group" key={item.path}>
                  <div className="painter-sidebar-dashboard-row">
                    <button
                      type="button"
                      className={`painter-sidebar-item painter-sidebar-dashboard-item ${isComplaintSectionActive ? "painter-sidebar-active" : ""
                        }`}
                      onClick={() => handleMobileNavigation("/painter/complaints")}
                    >
                      <Icon size={18} />
                      <span>Complaints</span>
                    </button>

                    <button
                      type="button"
                      className={`painter-sidebar-dropdown-btn ${isComplaintSectionActive
                        ? "painter-sidebar-dropdown-active"
                        : ""
                        }`}
                      onClick={() => setComplaintOpen((prev) => !prev)}
                      aria-label="Toggle Complaints menu"
                      aria-expanded={complaintOpen}
                    >
                      <ChevronDown
                        size={17}
                        className={
                          complaintOpen
                            ? "painter-sidebar-chevron-open"
                            : ""
                        }
                      />
                    </button>
                  </div>

                  {complaintOpen && (
                    <div className="painter-sidebar-submenu">
                      {complaintItems.map((subItem) => {
                        const SubIcon = subItem.icon;

                        const isSubActive =
                          location.pathname === subItem.path;

                        return (
                          <button
                            key={subItem.path}
                            type="button"
                            className={`painter-sidebar-subitem ${isSubActive
                              ? "painter-sidebar-subitem-active"
                              : ""
                              }`}
                            onClick={() =>
                              handleMobileNavigation(subItem.path)
                            }
                          >
                            <SubIcon size={16} />
                            <span>{subItem.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            if (isProfile) {
              return (
                <div className="painter-sidebar-group" key={item.path}>
                  <div className="painter-sidebar-dashboard-row">
                    <button
                      type="button"
                      className={`painter-sidebar-item painter-sidebar-dashboard-item ${isProfileSectionActive ? "painter-sidebar-active" : ""
                        }`}
                      onClick={() => handleMobileNavigation("/painter/profile")}
                    >
                      <Icon size={18} />
                      <span>Profile</span>
                    </button>

                    <button
                      type="button"
                      className={`painter-sidebar-dropdown-btn ${isProfileSectionActive
                        ? "painter-sidebar-dropdown-active"
                        : ""
                        }`}
                      onClick={() => setProfileOpen((prev) => !prev)}
                      aria-label="Toggle Profile menu"
                      aria-expanded={profileOpen}
                    >
                      <ChevronDown
                        size={17}
                        className={
                          profileOpen
                            ? "painter-sidebar-chevron-open"
                            : ""
                        }
                      />
                    </button>
                  </div>

                  {profileOpen && (
                    <div className="painter-sidebar-submenu">
                      {profileItems.map((subItem) => {
                        const SubIcon = subItem.icon;

                        const isSubActive =
                          location.pathname === subItem.path;

                        return (
                          <button
                            key={subItem.path}
                            type="button"
                            className={`painter-sidebar-subitem ${isSubActive
                              ? "painter-sidebar-subitem-active"
                              : ""
                              }`}
                            onClick={() =>
                              handleMobileNavigation(subItem.path)
                            }
                          >
                            <SubIcon size={16} />
                            <span>{subItem.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            if (isAnalytics) {
              return (
                <div className="painter-sidebar-group" key={item.path}>
                  <div className="painter-sidebar-dashboard-row">
                    <button
                      type="button"
                      className={`painter-sidebar-item painter-sidebar-dashboard-item ${isAnalyticsSectionActive ? "painter-sidebar-active" : ""
                        }`}
                      onClick={() =>
                        handleMobileNavigation("/painter/analytics/performance-dashboard")
                      }
                    >
                      <Icon size={18} />
                      <span>Analytics</span>
                    </button>

                    <button
                      type="button"
                      className={`painter-sidebar-dropdown-btn ${isAnalyticsSectionActive
                        ? "painter-sidebar-dropdown-active"
                        : ""
                        }`}
                      onClick={() => setAnalyticsOpen((prev) => !prev)}
                      aria-label="Toggle Analytics menu"
                      aria-expanded={analyticsOpen}
                    >
                      <ChevronDown
                        size={17}
                        className={
                          analyticsOpen
                            ? "painter-sidebar-chevron-open"
                            : ""
                        }
                      />
                    </button>
                  </div>

                  {analyticsOpen && (
                    <div className="painter-sidebar-submenu">
                      {analyticsItems.map((subItem) => {
                        const SubIcon = subItem.icon;

                        const isSubActive =
                          location.pathname === subItem.path;

                        return (
                          <button
                            key={subItem.path}
                            type="button"
                            className={`painter-sidebar-subitem ${isSubActive
                              ? "painter-sidebar-subitem-active"
                              : ""
                              }`}
                            onClick={() =>
                              handleMobileNavigation(subItem.path)
                            }
                          >
                            <SubIcon size={16} />
                            <span>{subItem.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            /* =================================================
                NORMAL MENU ITEM
            ================================================= */

            return (
              <button
                key={item.path}
                type="button"
                className={`painter-sidebar-item ${isActive
                  ? "painter-sidebar-main-active"
                  : ""
                  }`}
                onClick={() =>
                  handleMobileNavigation(item.path)
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}

        </nav>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="painter-sidebar-footer">
          <button
            type="button"
            className="painter-sidebar-collapse-btn"
            onClick={onClose}
          >
           <span>
  Need Help
  <br />
  WhatsApp Support
</span>
          </button>

        </div>

      </aside>
    </>
  );
};

export default PainterSidebar;