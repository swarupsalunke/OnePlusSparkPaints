import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { Toaster } from "sonner";

import Login from "./pages/superadmin/Login";
import ForgotPassword from "./pages/superadmin/ForgotPassword";
import OTPVerification from "./pages/superadmin/OTPVerification";
import ResetPassword from "./pages/superadmin/ResetPassword";

// superadmin
import Dashboard from "./pages/superadmin/Dashboard";
import DashboardLayout from "./layouts/DashboardLayout";
import UserManagement from "./pages/superadmin/UserManagement";
import AddUser from "./pages/superadmin/AddUser";
import ProductManagement from "./pages/superadmin/ProductManagement";
import PriceManagement from "./pages/superadmin/PriceManagement";
import DailyCashReport from "./pages/superadmin/DailyCashReport";
import OrderManagement from "./pages/superadmin/OrderManagement";
import LeadManagement from "./pages/superadmin/LeadManagement";
import QRManagement from "./pages/superadmin/QRManagement";
import RewardDashboard from "./pages/superadmin/RewardDashboard";
import SchemeManagement from "./pages/superadmin/SchemeManagement";
import FinanceDashboard from "./pages/superadmin/FinanceDashboard";
import Reports from "./pages/superadmin/Reports";
import SystemSettings from "./pages/superadmin/SystemSettings";
import ManufacturingBatchManagement from "./pages/superadmin/ManufacturingBatchManagement";
import InventoryManagement from "./pages/superadmin/InventoryManagement";
import DispatchManagement from "./pages/superadmin/DispatchOverview";
import InboundMaterialManagement from "./pages/superadmin/InboundMaterialOverview";
import EmployeeHRManagement from "./pages/superadmin/EmployeeHRManagement";
import CommissionManagement from "./pages/superadmin/CommissionManagement";
import NotificationManagement from "./pages/superadmin/NotificationManagement";
import DocumentManagement from "./pages/superadmin/DocumentManagement";
import BirthdayManagement from "./pages/superadmin/BirthdayManagement";
import FeedbackManagement from "./pages/superadmin/VoiceOfPainter";
import LoyaltyTierManagement from "./pages/superadmin/LoyaltyTierManagement";
import FollowUpManagement from "./pages/superadmin/FollowUpManagement";
import SalesVisitPlanning from "./pages/superadmin/SalesVisitPlanning";
import BankPaymentSheet from "./pages/superadmin/BankPaymentSheet";
import ApprovalWorkflow from "./pages/superadmin/ApprovalWorkflow";
import Directory from "./pages/superadmin/Directory";
import SocialMediaActivities from "./pages/superadmin/SocialMediaActivities";
import HelpSupport from "./pages/superadmin/HelpSupport";
import SupplierVendorManagement from "./pages/superadmin/SupplierVendorManagement";
import InternalCommunication from "./pages/superadmin/InternalCommunication";

// painter
import PainterDashboard from "./pages/painter/PainterDashboard";
import PainterLayout from "./layouts/PainterLayout";
import PainterQuickScan from "./pages/painter/PainterQuickScan";
import PainterQuickShop from "./pages/painter/PainterQuickShop";
import PainterQuickRewards from "./pages/painter/PainterQuickRewards";
import PainterNotifications from "./pages/painter/PainterMonthlyRewardSummary.jsx";
import PainterNotificationCentre from "./pages/painter/PainterNotificationCentre";
import PainterBarcodeScanner from "./pages/painter/PainterBarcodeScanner";
import PainterManualCodeEntry from "./pages/painter/PainterManualCodeEntry";
import PainterScanResult from "./pages/painter/PainterScanResult";
import PainterInvalidQR from "./pages/painter/PainterInvalidQR";
import PainterDuplicateQR from "./pages/painter/PainterDuplicateQR";
import PainterScanHistory from "./pages/painter/PainterScanHistory";
import PainterProductVerification from "./pages/painter/PainterProductVerification";
import PainterRewardHistory from "./pages/painter/PainterRewardHistory";
import PainterWalletLedger from "./pages/painter/PainterWalletLedger";
import PainterRewardDashboard from "./pages/painter/PainterRewardDashboard";
import PainterRewardWallet from "./pages/painter/PainterRewardWallet";
import PainterRewardLedger from "./pages/painter/PainterRewardLedger";
import PainterRewardTransactionHistory from "./pages/painter/PainterRewardTransactionHistory";
import PainterRewardAnalytics from "./pages/painter/PainterRewardAnalytics";
import PainterSchemePerformance from "./pages/painter/PainterSchemePerformance";
import PainterRedemptionDashboard from "./pages/painter/PainterRedemptionDashboard.jsx";
import PainterRedeemRewards from "./pages/painter/PainterRedeemRewards";
import PainterRedemptionRequest from "./pages/painter/PainterRedemptionRequest";
import PainterRedemptionHistory from "./pages/painter/PainterRedemptionHistory";
import PainterRedemptionStatus from "./pages/painter/PainterRedemptionStatus";
import PainterLoyaltyDashboard from "./pages/painter/PainterLoyaltyDashboard";
import PainterTierProgress from "./pages/painter/PainterTierProgress";
import PainterTierBenefits from "./pages/painter/PainterTierBenefits";
import PainterSchemeListing from "./pages/painter/PainterSchemeListing";
import PainterSchemeDetails from "./pages/painter/PainterSchemeDetails";
import PainterSchemePdfPreview from "./pages/painter/PainterSchemePdfPreview";
import PainterOffersListing from "./pages/painter/PainterOffersListing";
import PainterOfferDetails from "./pages/painter/PainterOfferDetails";
import PainterNotificationListing from "./pages/painter/PainterNotificationListing";
import PainterNotificationDetails from "./pages/painter/PainterNotificationDetails";
import PainterReferralDashboard from "./pages/painter/PainterReferralDashboard";
import PainterShareReferral from "./pages/painter/PainterShareReferral";
import PainterReferralHistory from "./pages/painter/PainterReferralHistory";
import PainterReferralStatus from "./pages/painter/PainterReferralStatus";
import PainterDownloadCategoryListing from "./pages/painter/PainterDownloadCategoryListing";
import PainterDownloadProductListing from "./pages/painter/PainterDownloadProductListing";
import PainterDownloadProductDetails from "./pages/painter/PainterDownloadProductDetails";
import PainterDownloadProductImages from "./pages/painter/PainterDownloadProductImages";
import PainterDownloadDocumentPreview from "./pages/painter/PainterDownloadDocumentPreview";
import PainterShopDashboard from "./pages/painter/PainterShopDashboard";
import PainterShopProductListing from "./pages/painter/PainterShopProductListing";
import PainterShopProductDetails from "./pages/painter/PainterShopProductDetails";
import PainterShopCart from "./pages/painter/PainterShopCart";
import PainterShopSubmitEnquiry from "./pages/painter/PainterShopSubmitEnquiry";
import PainterShopEnquiryHistory from "./pages/painter/PainterShopEnquiryHistory";
import PainterShopEnquiryDetails from "./pages/painter/PainterShopEnquiryDetails";
import PainterVoiceDashboard from "./pages/painter/PainterVoiceDashboard";
import PainterVoiceUploadVideo from "./pages/painter/PainterVoiceUploadVideo";
import PainterVoiceUploadImages from "./pages/painter/PainterVoiceUploadImages";
import PainterSubmitFeedback from "./pages/painter/PainterSubmitFeedback";
import PainterComplaints from "./pages/painter/PainterComplaints";
import PainterSubmissionHistory from "./pages/painter/PainterSubmissionHistory";
import PainterCustomerDetails from "./pages/painter/PainterCustomerDetails";
import PainterLeadListing from "./pages/painter/PainterLeadListing";
import PainterLeadDetails from "./pages/painter/PainterLeadDetails";
import PainterLeadStatus from "./pages/painter/PainterLeadStatus";
import PainterFollowUpNotes from "./pages/painter/PainterFollowUpNotes";
import PainterContactUs from "./pages/painter/PainterContactUs";
import PainterWhatsAppSupport from "./pages/painter/PainterWhatsAppSupport";
import PainterEmailSupport from "./pages/painter/PainterEmailSupport";
import PainterComplaintListing from "./pages/painter/PainterComplaintListing";
import PainterRaiseComplaint from "./pages/painter/PainterRaiseComplaint";
import PainterComplaintDetails from "./pages/painter/PainterComplaintDetails";
import PainterComplaintHistory from "./pages/painter/PainterComplaintHistory";
import PainterMyProfile from "./pages/painter/PainterMyProfile";
import PainterEditProfile from "./pages/painter/PainterEditProfile";
import PainterBankDetails from "./pages/painter/PainterBankDetails";
import PainterAddressDetails from "./pages/painter/PainterAddressDetails";
import PainterNotificationSettings from "./pages/painter/PainterNotificationSettings";
import PainterChangePassword from "./pages/painter/PainterChangePassword";
import PainterShareProfile from "./pages/painter/PainterShareProfile";
import PainterProfilePreview from "./pages/painter/PainterProfilePreview";
import PainterPerformanceDashboard from "./pages/painter/PainterPerformanceDashboard";
import PainterMonthlyPerformance from "./pages/painter/PainterMonthlyPerformance";
import PainterMilestoneProgress from "./pages/painter/PainterMilestoneProgress";
import PainterLeaderboard from "./pages/painter/PainterLeaderboard";

// Dealer
import DealerLayout from "./layouts/DealerLayout";
import DealerDashboard from "./pages/dealer/DealerDashboard";
import DealerProductOrdering from "./pages/dealer/DealerProductOrdering";
import DealerProductDetails from "./pages/dealer/DealerProductDetails";
import DealerShoppingCart from "./pages/dealer/DealerShoppingCart";
import DealerOrderHistory from "./pages/dealer/DealerOrderHistory";
import DealerOrderDetails from "./pages/dealer/DealerOrderDetails";
import DealerRewardWallet from "./pages/dealer/DealerRewardWallet";
import DealerRewardRedemption from "./pages/dealer/DealerRewardRedemption";
import DealerRedemptionHistory from "./pages/dealer/DealerRedemptionHistory";
import DealerRedemptionDetails from "./pages/dealer/DealerRedemptionDetails";
import DealerLoyaltyTier from "./pages/dealer/DealerLoyaltyTier";
import DealerSchemes from "./pages/dealer/DealerSchemes";
import DealerOffers from "./pages/dealer/DealerOffers";
import DealerProductCatalogue from "./pages/dealer/DealerProductCatalogue";
import DealerDownloadCentre from "./pages/dealer/DealerDownloadCentre";
import DealerPainterEnquiries from "./pages/dealer/DealerPainterEnquiries";
import DealerPaymentOutstanding from "./pages/dealer/DealerPaymentOutstanding";
import DealerPurchaseAnalytics from "./pages/dealer/DealerPurchaseAnalytics";
import DealerReferEarn from "./pages/dealer/DealerReferEarn";
import DealerNotifications from "./pages/dealer/DealerNotifications";
import DealerComplaintManagement from "./pages/dealer/DealerComplaintManagement";
import DealerProfileManagement from "./pages/dealer/DealerProfileManagement";
import DealerContactSupport from "./pages/dealer/DealerContactSupport";

// Sales Executive
import SalesExecutiveLayout from "./layouts/SalesExecutiveLayout";
import SalesExecutiveDashboard from "./pages/salesExecutive/SalesExecutiveDashboard";
import SalesExecutiveAttendance from "./pages/salesExecutive/SalesExecutiveAttendance";
import SalesExecutiveBeatPlan from "./pages/salesExecutive/SalesExecutiveBeatPlan";
import SalesExecutiveLeadManagement from "./pages/salesExecutive/SalesExecutiveLeadManagement";
import SalesExecutiveOrderBooking from "./pages/salesExecutive/SalesExecutiveOrderBooking";
import SalesExecutiveOrderHistory from "./pages/salesExecutive/SalesExecutiveOrderHistory";
import SalesExecutiveCollectionManagement from "./pages/salesExecutive/SalesExecutiveCollectionManagement";
import SalesExecutiveDealerRegistration from "./pages/salesExecutive/SalesExecutiveDealerRegistration";
import SalesExecutivePainterRegistration from "./pages/salesExecutive/SalesExecutivePainterRegistration";
import SalesExecutiveComplaint from "./pages/salesExecutive/SalesExecutiveComplaint";
import ProductCatalogue from "./pages/salesExecutive/ProductCatalogue";
import TargetManagement from "./pages/salesExecutive/TargetManagement";
import SalesExecutiveReports from "./pages/salesExecutive/Reports";
import DownloadCentre from "./pages/salesExecutive/DownloadCentre";
import AnalyticsDashboard from "./pages/salesExecutive/AnalyticsDashboard";
import SalesFollowUpManagement from "./pages/salesExecutive/FollowUpManagement";
import SalesProfileManagement from "./pages/salesExecutive/SalesProfileManagement";




const App = () => {
  return (
    <BrowserRouter>

      <Routes>

        {/* AUTH PAGES */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* DASHBOARD */}
        <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
        <Route path="/users" element={<DashboardLayout><UserManagement /></DashboardLayout>} />
        <Route path="/users/add" element={<DashboardLayout><AddUser /></DashboardLayout>} />
        <Route path="/users/edit/:id" element={<DashboardLayout><AddUser /></DashboardLayout>} />
        <Route path="/products" element={<DashboardLayout><ProductManagement /></DashboardLayout>} />
        <Route path="/prices" element={<DashboardLayout><PriceManagement /></DashboardLayout>} />
        <Route path="/daily-cash-report" element={<DashboardLayout><DailyCashReport /></DashboardLayout>} />
        <Route path="/order-management" element={<DashboardLayout><OrderManagement /></DashboardLayout>} />
        <Route path="/leads" element={<DashboardLayout><LeadManagement /></DashboardLayout>} />
        <Route path="/qr-management" element={<DashboardLayout><QRManagement /></DashboardLayout>} />
        <Route path="/reward-dashboard" element={<DashboardLayout><RewardDashboard /></DashboardLayout>} />
        <Route path="/scheme-management" element={<DashboardLayout><SchemeManagement /></DashboardLayout>} />
        <Route path="/finance-dashboard" element={<DashboardLayout><FinanceDashboard /></DashboardLayout>} />
        <Route path="/reports" element={<DashboardLayout><Reports /></DashboardLayout>} />
        <Route path="/system-settings" element={<DashboardLayout><SystemSettings /></DashboardLayout>} />
        <Route path="/manufacturing-batch-management" element={<DashboardLayout><ManufacturingBatchManagement /></DashboardLayout>} />
        <Route path="/inventory-management" element={<DashboardLayout><InventoryManagement /></DashboardLayout>} />
        <Route path="/dispatch-management" element={<DashboardLayout><DispatchManagement /></DashboardLayout>} />
        <Route path="/inbound-material-management" element={<DashboardLayout><InboundMaterialManagement /></DashboardLayout>} />
        <Route path="/employee-hr-management" element={<DashboardLayout><EmployeeHRManagement /></DashboardLayout>} />
        <Route path="/commission-management" element={<DashboardLayout><CommissionManagement /></DashboardLayout>} />
        <Route path="/notification-management" element={<DashboardLayout><NotificationManagement /></DashboardLayout>} />
        <Route path="/document-management" element={<DashboardLayout><DocumentManagement /></DashboardLayout>} />
        <Route path="/birthday-management" element={<DashboardLayout><BirthdayManagement /></DashboardLayout>} />
        <Route path="/feedback-management" element={<DashboardLayout><FeedbackManagement /></DashboardLayout>} />
        <Route path="/loyalty-tier-management" element={<DashboardLayout><LoyaltyTierManagement /></DashboardLayout>} />
        <Route path="/follow-up-management" element={<DashboardLayout><FollowUpManagement /></DashboardLayout>} />
        <Route path="/sales-visit-planning" element={<DashboardLayout><SalesVisitPlanning /></DashboardLayout>} />
        <Route path="/bank-payment-sheet" element={<DashboardLayout><BankPaymentSheet /></DashboardLayout>} />
        <Route path="/approval-workflow" element={<DashboardLayout><ApprovalWorkflow /></DashboardLayout>} />
        <Route path="/directory" element={<DashboardLayout><Directory /></DashboardLayout>} />
        <Route path="/social-media-activities" element={<DashboardLayout><SocialMediaActivities /></DashboardLayout>} />
        <Route path="/help-support" element={<DashboardLayout><HelpSupport /></DashboardLayout>} />
        <Route path="/supplier-vendor-management" element={<DashboardLayout><SupplierVendorManagement /></DashboardLayout>} />
        <Route path="/internal-communication" element={<DashboardLayout><InternalCommunication /></DashboardLayout>}/>

        {/* painter */}

        <Route path="/painter/dashboard" element={<PainterLayout><PainterDashboard /></PainterLayout>} />
        <Route path="/painter/quick-scan" element={<PainterLayout><PainterQuickScan /></PainterLayout>} />
        <Route path="/painter/quick-shop" element={<PainterLayout><PainterQuickShop /></PainterLayout>} />
        <Route path="/painter/quick-rewards" element={<PainterLayout><PainterQuickRewards /></PainterLayout>} />
        <Route path="/painter/monthly-reward-summary" element={<PainterLayout><PainterNotifications /></PainterLayout>} />
        <Route path="/painter/notifications" element={<PainterLayout><PainterNotificationCentre /></PainterLayout>} />
        <Route path="/painter/barcode-scanner" element={<PainterLayout><PainterBarcodeScanner /></PainterLayout>} />
        <Route path="/painter/manual-code-entry" element={<PainterLayout><PainterManualCodeEntry /></PainterLayout>} />
        <Route path="/painter/scan-result" element={<PainterLayout><PainterScanResult /></PainterLayout>} />
        <Route path="/painter/invalid-qr" element={<PainterLayout><PainterInvalidQR /></PainterLayout>} />
        <Route path="/painter/duplicate-qr" element={<PainterLayout><PainterDuplicateQR /></PainterLayout>} />
        <Route path="/painter/scan-history" element={<PainterLayout><PainterScanHistory /></PainterLayout>} />
        <Route path="/painter/product-verification" element={<PainterLayout><PainterProductVerification /></PainterLayout>} />
        <Route path="/painter/reward-history" element={<PainterLayout><PainterRewardHistory /></PainterLayout>} />
        <Route path="/painter/wallet-ledger" element={<PainterLayout><PainterWalletLedger /></PainterLayout>} />
        <Route path="/painter/reward-dashboard" element={<PainterLayout><PainterRewardDashboard /></PainterLayout>} />
        <Route path="/painter/reward-wallet" element={<PainterLayout><PainterRewardWallet /></PainterLayout>} />
        <Route path="/painter/reward-ledger" element={<PainterLayout><PainterRewardLedger /></PainterLayout>} />
        <Route path="/painter/reward-transaction-history" element={<PainterLayout><PainterRewardTransactionHistory /></PainterLayout>} />
        <Route path="/painter/reward-analytics" element={<PainterLayout><PainterRewardAnalytics /></PainterLayout>} />
        <Route path="/painter/scheme-performance" element={<PainterLayout><PainterSchemePerformance /></PainterLayout>} />
        <Route path="/painter/redemption-dashboard" element={<PainterLayout><PainterRedemptionDashboard /></PainterLayout>} />
        <Route path="/painter/redeem-rewards" element={<PainterLayout><PainterRedeemRewards /></PainterLayout>} />
        <Route path="/painter/redemption-request" element={<PainterLayout><PainterRedemptionRequest /></PainterLayout>} />
        <Route path="/painter/redemption-history" element={<PainterLayout><PainterRedemptionHistory /></PainterLayout>} />
        <Route path="/painter/redemption-status" element={<PainterLayout><PainterRedemptionStatus /></PainterLayout>} />
        <Route path="/painter/loyalty-dashboard" element={<PainterLayout><PainterLoyaltyDashboard /></PainterLayout>} />
        <Route path="/painter/tier-progress" element={<PainterLayout><PainterTierProgress /></PainterLayout>} />
        <Route path="/painter/tier-benefits" element={<PainterLayout><PainterTierBenefits /></PainterLayout>} />
        <Route path="/painter/scheme-listing" element={<PainterLayout><PainterSchemeListing /></PainterLayout>} />
        <Route path="/painter/scheme-details" element={<PainterLayout><PainterSchemeDetails /></PainterLayout>} />
        <Route path="/painter/scheme-details/:id" element={<PainterLayout><PainterSchemeDetails /></PainterLayout>} />
        <Route path="/painter/scheme-pdf-preview" element={<PainterLayout><PainterSchemePdfPreview /></PainterLayout>} />
        <Route path="/painter/scheme-pdf-preview/:id" element={<PainterLayout><PainterSchemePdfPreview /></PainterLayout>} />
        <Route path="/painter/offers-listing" element={<PainterLayout><PainterOffersListing /></PainterLayout>} />
        <Route path="/painter/offer-details" element={<PainterLayout><PainterOfferDetails /></PainterLayout>} />
        <Route path="/painter/offer-details/:id" element={<PainterLayout><PainterOfferDetails /></PainterLayout>} />
        <Route path="/painter/notification-listing" element={<PainterLayout><PainterNotificationListing /></PainterLayout>} />
        <Route path="/painter/notification-details" element={<PainterLayout><PainterNotificationDetails /></PainterLayout>} />
        <Route path="/painter/notification-details/:id" element={<PainterLayout><PainterNotificationDetails /></PainterLayout>} />
        <Route path="/painter/referral-dashboard" element={<PainterLayout><PainterReferralDashboard /></PainterLayout>} />
        <Route path="/painter/share-referral" element={<PainterLayout><PainterShareReferral /></PainterLayout>} />
        <Route path="/painter/referral-history" element={<PainterLayout><PainterReferralHistory /></PainterLayout>} />
        <Route path="/painter/referral-status" element={<PainterLayout><PainterReferralStatus /></PainterLayout>} />
        <Route path="/painter/download-category-listing" element={<PainterLayout><PainterDownloadCategoryListing /></PainterLayout>} />
        <Route path="/painter/download-product-listing" element={<PainterLayout><PainterDownloadProductListing /></PainterLayout>} />
        <Route path="/painter/download-product-details" element={<PainterLayout><PainterDownloadProductDetails /></PainterLayout>} />
        <Route path="/painter/download-product-details/:id" element={<PainterLayout><PainterDownloadProductDetails /></PainterLayout>} />
        <Route path="/painter/download-product-images" element={<PainterLayout><PainterDownloadProductImages /></PainterLayout>} />
        <Route path="/painter/download-document-preview" element={<PainterLayout><PainterDownloadDocumentPreview /></PainterLayout>} />
        <Route path="/painter/shop" element={<PainterLayout><PainterShopDashboard /></PainterLayout>} />
        <Route path="/painter/shop-product-listing" element={<PainterLayout><PainterShopProductListing /></PainterLayout>} />
        <Route path="/painter/shop-product-details" element={<PainterLayout><PainterShopProductDetails /></PainterLayout>} />
        <Route path="/painter/shop-product-details/:id" element={<PainterLayout><PainterShopProductDetails /></PainterLayout>} />
        <Route path="/painter/shop-cart" element={<PainterLayout><PainterShopCart /></PainterLayout>} />
        <Route path="/painter/shop-submit-enquiry" element={<PainterLayout><PainterShopSubmitEnquiry /></PainterLayout>} />
        <Route path="/painter/shop-enquiry-history" element={<PainterLayout><PainterShopEnquiryHistory /></PainterLayout>} />
        <Route path="/painter/shop-enquiry-details/:id" element={<PainterLayout><PainterShopEnquiryDetails /></PainterLayout>} />
        <Route path="/painter/shop-enquiry-details" element={<PainterLayout><PainterShopEnquiryDetails /></PainterLayout>} />
        <Route path="/painter/voice-of-painter" element={<PainterLayout><PainterVoiceDashboard /></PainterLayout>} />
        <Route path="/painter/voice-of-painter/upload-video" element={<PainterLayout><PainterVoiceUploadVideo /></PainterLayout>} />
        <Route path="/painter/voice-of-painter/upload-images" element={<PainterLayout><PainterVoiceUploadImages /></PainterLayout>} />
        <Route path="/painter/voice-of-painter/submit-feedback" element={<PainterLayout><PainterSubmitFeedback /></PainterLayout>} />
        <Route path="/painter/voice-of-painter/complaint" element={<PainterLayout><PainterComplaints /></PainterLayout>} />
        <Route path="/painter/voice-of-painter/submission-history" element={<PainterLayout><PainterSubmissionHistory /></PainterLayout>} />
        <Route path="/painter/customer-details" element={<PainterLayout><PainterCustomerDetails /></PainterLayout>} />
        <Route path="/painter/leads" element={<PainterLayout><PainterLeadListing /></PainterLayout>} />
        <Route path="/painter/lead-details" element={<PainterLayout><PainterLeadDetails /></PainterLayout>} />
        <Route path="/painter/lead-status" element={<PainterLayout><PainterLeadStatus /></PainterLayout>} />
        <Route path="/painter/follow-up-notes" element={<PainterLayout><PainterFollowUpNotes /></PainterLayout>} />
        <Route path="/painter/contact-us" element={<PainterLayout><PainterContactUs /></PainterLayout>} />
        <Route path="/painter/whatsapp-support" element={<PainterLayout><PainterWhatsAppSupport /></PainterLayout>} />
        <Route path="/painter/email-support" element={<PainterLayout><PainterEmailSupport /></PainterLayout>} />
        <Route path="/painter/complaints" element={<PainterLayout><PainterComplaintListing /></PainterLayout>} />
        <Route path="/painter/raise-complaint" element={<PainterLayout><PainterRaiseComplaint /></PainterLayout>} />
        <Route path="/painter/complaint-details" element={<PainterLayout><PainterComplaintDetails /></PainterLayout>} />
        <Route path="/painter/complaint-history" element={<PainterLayout><PainterComplaintHistory /></PainterLayout>} />
        <Route path="/painter/profile" element={<PainterLayout><PainterMyProfile /></PainterLayout>} />
        <Route path="/painter/profile/edit" element={<PainterLayout><PainterEditProfile /></PainterLayout>} />
        <Route path="/painter/profile/bank-details" element={<PainterLayout><PainterBankDetails /></PainterLayout>} />
        <Route path="/painter/profile/address-details" element={<PainterLayout><PainterAddressDetails /></PainterLayout>} />
        <Route path="/painter/profile/notification-settings" element={<PainterLayout><PainterNotificationSettings /></PainterLayout>} />
        <Route path="/painter/profile/change-password" element={<PainterLayout><PainterChangePassword /></PainterLayout>} />
        <Route path="/painter/profile/share" element={<PainterLayout><PainterShareProfile /></PainterLayout>} />
        <Route path="/painter/profile/preview" element={<PainterLayout><PainterProfilePreview /></PainterLayout>} />
        <Route path="/painter/analytics/performance-dashboard" element={<PainterLayout><PainterPerformanceDashboard /></PainterLayout>} />
        <Route path="/painter/analytics/monthly-performance" element={<PainterLayout><PainterMonthlyPerformance /></PainterLayout>} />
        <Route path="/painter/analytics/milestone-progress" element={<PainterLayout><PainterMilestoneProgress /></PainterLayout>} />
        <Route path="/painter/analytics/leaderboard" element={<PainterLayout><PainterLeaderboard /></PainterLayout>} />


        {/* Dealer */}
        <Route path="/dealer/dashboard" element={<DealerLayout><DealerDashboard /></DealerLayout>} />
        <Route path="/dealer/dashboard" element={<DealerLayout><DealerDashboard /></DealerLayout>} />
        <Route path="/dealer/product-ordering" element={<DealerLayout><DealerProductOrdering /></DealerLayout>} />
        <Route path="/dealer/product-ordering/:id" element={<DealerLayout><DealerProductDetails /></DealerLayout>} />
        <Route path="/dealer/shopping-cart" element={<DealerLayout><DealerShoppingCart /></DealerLayout>} />
        <Route path="/dealer/order-history" element={<DealerLayout><DealerOrderHistory /></DealerLayout>} />
        <Route path="/dealer/order-history/:id" element={<DealerLayout><DealerOrderDetails /></DealerLayout>} />
        <Route path="/dealer/reward-wallet" element={<DealerLayout><DealerRewardWallet /></DealerLayout>} />
        <Route path="/dealer/reward-redemption" element={<DealerLayout><DealerRewardRedemption /></DealerLayout>} />
        <Route path="/dealer/reward-redemption-history" element={<DealerLayout><DealerRedemptionHistory /></DealerLayout>} />
        <Route path="/dealer/reward-redemption-history/:id" element={<DealerLayout><DealerRedemptionDetails /></DealerLayout>} />
        <Route path="/dealer/loyalty-tier" element={<DealerLayout><DealerLoyaltyTier /></DealerLayout>} />
        <Route path="/dealer/schemes" element={<DealerLayout><DealerSchemes /></DealerLayout>} />
        <Route path="/dealer/offers" element={<DealerLayout><DealerOffers /></DealerLayout>} />
        <Route path="/dealer/product-catalogue" element={<DealerLayout><DealerProductCatalogue /></DealerLayout>} />
        <Route path="/dealer/download-centre" element={<DealerLayout><DealerDownloadCentre /></DealerLayout>} />
        <Route path="/dealer/painter-enquiries" element={<DealerLayout><DealerPainterEnquiries /></DealerLayout>} />
        <Route path="/dealer/payment-outstanding" element={<DealerLayout><DealerPaymentOutstanding /></DealerLayout>} />
        <Route path="/dealer/purchase-analytics" element={<DealerLayout><DealerPurchaseAnalytics /></DealerLayout>} />
        <Route path="/dealer/refer-earn" element={<DealerLayout><DealerReferEarn /></DealerLayout>} />
        <Route path="/dealer/notifications" element={<DealerLayout><DealerNotifications /></DealerLayout>} />
        <Route path="/dealer/complaints" element={<DealerLayout><DealerComplaintManagement /></DealerLayout>} />
        <Route path="/dealer/profile" element={<DealerLayout><DealerProfileManagement /></DealerLayout>} />
        <Route path="/dealer/contact-support" element={<DealerLayout><DealerContactSupport /></DealerLayout>} />


        {/* Sales Executive */}
        <Route path="/sales-executive/dashboard" element={<SalesExecutiveLayout><SalesExecutiveDashboard /></SalesExecutiveLayout>} />
        <Route path="/sales-executive/attendance" element={<SalesExecutiveLayout><SalesExecutiveAttendance /></SalesExecutiveLayout>} />
        <Route path="/sales-executive/beat-plan" element={<SalesExecutiveLayout><SalesExecutiveBeatPlan /></SalesExecutiveLayout>} />
        <Route path="/sales-executive/leads" element={<SalesExecutiveLayout><SalesExecutiveLeadManagement /></SalesExecutiveLayout>} />
        <Route path="/sales-executive/order-booking" element={<SalesExecutiveLayout><SalesExecutiveOrderBooking /></SalesExecutiveLayout>} />
        <Route path="/sales-executive/order-history" element={<SalesExecutiveLayout><SalesExecutiveOrderHistory /></SalesExecutiveLayout>} />
        <Route path="/sales-executive/collection-management" element={<SalesExecutiveLayout><SalesExecutiveCollectionManagement /></SalesExecutiveLayout>} />
        <Route path="/sales-executive/dealer-registration" element={<SalesExecutiveLayout><SalesExecutiveDealerRegistration /></SalesExecutiveLayout>} />
        <Route path="/sales-executive/painter-registration" element={<SalesExecutiveLayout><SalesExecutivePainterRegistration /></SalesExecutiveLayout>} />
        <Route path="/sales-executive/complaint-management" element={<SalesExecutiveLayout><SalesExecutiveComplaint /></SalesExecutiveLayout>} />
        <Route path="/sales-executive/product-catalogue" element={<SalesExecutiveLayout><ProductCatalogue /></SalesExecutiveLayout>} />
        <Route path="/sales-executive/target-management" element={<SalesExecutiveLayout><TargetManagement /></SalesExecutiveLayout>} />
        <Route path="/sales-executive/reports" element={<SalesExecutiveLayout><SalesExecutiveReports /></SalesExecutiveLayout>} />
        <Route path="/sales-executive/download-centre" element={<SalesExecutiveLayout><DownloadCentre /></SalesExecutiveLayout>}/>
        <Route path="/sales-executive/analytics-dashboard" element={<SalesExecutiveLayout><AnalyticsDashboard /></SalesExecutiveLayout>} />
        <Route path="/sales-executive/follow-up-management" element={<SalesExecutiveLayout><SalesFollowUpManagement /></SalesExecutiveLayout>} />
        <Route path="/sales-executive/profile-management" element={<SalesExecutiveLayout><SalesProfileManagement /></SalesExecutiveLayout>} />



      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>

  );
};

export default App;

// import "../../css/salesExecutive/ProductCatalogue.css";