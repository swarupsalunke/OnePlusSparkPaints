import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Save,
  Settings,
  Globe,
  Monitor,
  List,
  UploadCloud,
  ShieldCheck,
  Clock,
  SlidersHorizontal,
  CheckCircle2,
  X,
  Image as ImageIcon,
} from "lucide-react";

import "../../css/superadmin/generalSettings.css";

const API_URL = "https://oneplussparkpaintsserver.onrender.com/api/system-settings";

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    systemName: "",
    systemLogo: "",
    defaultDashboard: "",
    dateFormat: "",
    timeFormat: "",
    currency: "",
    timezone: "",
    language: "",
    numberFormat: "",
    enableDarkMode: false,
    compactSidebar: false,
    showBreadcrumbs: true,
    enableAnimations: true,
    showFooter: true,
    showQuickActions: true,
    defaultItemsPerPage: 10,
    maxFileSize: 10,
    allowedFileTypes: "",
    storageDisk: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [logoPreview, setLogoPreview] = useState("");


  // GET SETTINGS


  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL);

      if (response.data.success) {
        const data = response.data.settings;

        setSettings({
          systemName: data.systemName || "",
          systemLogo: data.systemLogo || "",
          defaultDashboard:
            data.defaultDashboard || "Admin Dashboard",
          dateFormat: data.dateFormat || "DD MMM YYYY",
          timeFormat:
            data.timeFormat || "12 Hour (AM/PM)",
          currency:
            data.currency || "Indian Rupee (₹)",
          timezone:
            data.timezone ||
            "(GMT+05:30) Asia/Kolkata",
          language: data.language || "English",
          numberFormat:
            data.numberFormat || "1,23,456.78",
          enableDarkMode:
            data.enableDarkMode ?? false,
          compactSidebar:
            data.compactSidebar ?? false,
          showBreadcrumbs:
            data.showBreadcrumbs ?? true,
          enableAnimations:
            data.enableAnimations ?? true,
          showFooter:
            data.showFooter ?? true,
          showQuickActions:
            data.showQuickActions ?? true,
          defaultItemsPerPage:
            data.defaultItemsPerPage ?? 10,
          maxFileSize:
            data.maxFileSize ?? 10,
          allowedFileTypes:
            data.allowedFileTypes ||
            "jpg, jpeg, png, pdf, doc, xls, xlsx",
          storageDisk:
            data.storageDisk || "Local Storage",
        });

        setLogoPreview(data.systemLogo || "");
      }
    } catch (err) {
      console.error(
        "Get system settings error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Failed to load system settings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);


  // INPUT CHANGE


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : value,
    }));

    setMessage("");
    setError("");
  };


  // SAVE CHANGES


  const handleSaveChanges = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const payload = {
        ...settings,
        defaultItemsPerPage: Number(
          settings.defaultItemsPerPage
        ),
        maxFileSize: Number(settings.maxFileSize),
      };

      const response = await axios.put(
        API_URL,
        payload
      );

      if (response.data.success) {
        const updated =
          response.data.settings;

        setSettings({
          systemName: updated.systemName || "",
          systemLogo: updated.systemLogo || "",
          defaultDashboard:
            updated.defaultDashboard ||
            "Admin Dashboard",
          dateFormat:
            updated.dateFormat ||
            "DD MMM YYYY",
          timeFormat:
            updated.timeFormat ||
            "12 Hour (AM/PM)",
          currency:
            updated.currency ||
            "Indian Rupee (₹)",
          timezone:
            updated.timezone ||
            "(GMT+05:30) Asia/Kolkata",
          language:
            updated.language || "English",
          numberFormat:
            updated.numberFormat ||
            "1,23,456.78",
          enableDarkMode:
            updated.enableDarkMode ?? false,
          compactSidebar:
            updated.compactSidebar ?? false,
          showBreadcrumbs:
            updated.showBreadcrumbs ?? true,
          enableAnimations:
            updated.enableAnimations ?? true,
          showFooter:
            updated.showFooter ?? true,
          showQuickActions:
            updated.showQuickActions ?? true,
          defaultItemsPerPage:
            updated.defaultItemsPerPage ?? 10,
          maxFileSize:
            updated.maxFileSize ?? 10,
          allowedFileTypes:
            updated.allowedFileTypes || "",
          storageDisk:
            updated.storageDisk ||
            "Local Storage",
        });

        setLogoPreview(
          updated.systemLogo || ""
        );

        setMessage(
          "System settings updated successfully."
        );
      }
    } catch (err) {
      console.error(
        "Update system settings error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Failed to save system settings."
      );
    } finally {
      setSaving(false);
    }
  };


  // CHANGE LOGO


  const handleChangeLogo = () => {
    alert(
      "Logo upload will be connected with the file upload backend."
    );
  };


  // LOADING


  if (loading) {
    return (
      <div className="system-settings-loading">
        <div className="system-settings-loader" />
        <p>Loading system settings...</p>
      </div>
    );
  }

  return (
    <div className="system-settings-page">

      {/* ================          PAGE HEADE         ================ */}

      <div className="system-settings-header">

        <div>
          <h1>General System Settings</h1>

          <div className="system-settings-breadcrumb">
            <span>Dashboard</span>
            <span>›</span>
            <span>System Settings</span>
            <span>›</span>
            <span>General Settings</span>
          </div>

          <p className="system-settings-description">
            Manage and configure general settings that
            control the overall system behavior.
          </p>
        </div>

        <button
          type="button"
          className="system-save-btn"
          onClick={handleSaveChanges}
          disabled={saving}
        >
          <Save size={16} />

          {saving
            ? "Saving..."
            : "Save Changes"}
        </button>

      </div>

      {/* =====================================          MESSAGES      ====================================== */}

      {message && (
        <div className="system-success-message">
          <CheckCircle2 size={16} />
          <span>{message}</span>

          <button
            type="button"
            onClick={() => setMessage("")}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {error && (
        <div className="system-error-message">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* =====================================          SETTINGS CONTENT      ====================================== */}

      <form
        className="system-settings-layout"
        onSubmit={handleSaveChanges}
      >

        {/* ===================================            LEFT SETTINGS MENU        ==================================== */}

        <aside className="system-settings-sidebar">

          <div className="system-settings-sidebar-title">
            General Settings
          </div>

          <button
            type="button"
            className="system-settings-menu-item active"
          >
            <Settings size={17} />
            <span>Basic Settings</span>
          </button>

          <button
            type="button"
            className="system-settings-menu-item"
          >
            <Globe size={17} />
            <span>Locale Settings</span>
          </button>

          <button
            type="button"
            className="system-settings-menu-item"
          >
            <Monitor size={17} />
            <span>Display Settings</span>
          </button>

          <button
            type="button"
            className="system-settings-menu-item"
          >
            <List size={17} />
            <span>Items Per Page</span>
          </button>

          <button
            type="button"
            className="system-settings-menu-item"
          >
            <UploadCloud size={17} />
            <span>File Upload Settings</span>
          </button>

          <button
            type="button"
            className="system-settings-menu-item"
          >
            <ShieldCheck size={17} />
            <span>Security Settings</span>
          </button>

          <button
            type="button"
            className="system-settings-menu-item"
          >
            <Clock size={17} />
            <span>Session Settings</span>
          </button>

          <button
            type="button"
            className="system-settings-menu-item"
          >
            <SlidersHorizontal size={17} />
            <span>System Preferences</span>
          </button>

        </aside>

        {/* ===================================            RIGHT CONTENT        ==================================== */}

        <main className="system-settings-content">

          {/* =================================              1. BASIC SETTINGS          ================================== */}

          <section className="settings-section">

            <h2>1. Basic Settings</h2>

            <div className="settings-grid">

              {/* System Name */}

              <div className="setting-field">
                <label>
                  System Name
                </label>

                <input
                  type="text"
                  name="systemName"
                  value={settings.systemName}
                  onChange={handleChange}
                />

                <small>
                  Enter the name of your system
                </small>
              </div>

              {/* System Logo */}

              <div className="setting-field">

                <label>
                  System Logo
                </label>

                <div className="system-logo-wrapper">

                  <div className="system-logo-preview">

                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="System Logo"
                      />
                    ) : (
                      <div className="default-logo-preview">
                        <span>Oneplus</span>
                        <strong>Spark</strong>
                        <b>*</b>
                      </div>
                    )}

                  </div>

                  <button
                    type="button"
                    className="change-logo-btn"
                    onClick={handleChangeLogo}
                  >
                    Change Logo
                  </button>

                </div>

                <small>
                  Recommended size: 200 x 50 px
                </small>

              </div>

              {/* Default Dashboard */}

              <div className="setting-field">

                <label>
                  Default Dashboard
                </label>

                <select
                  name="defaultDashboard"
                  value={
                    settings.defaultDashboard
                  }
                  onChange={handleChange}
                >
                  <option>
                    Admin Dashboard
                  </option>

                  <option>
                    Sales Dashboard
                  </option>

                  <option>
                    Finance Dashboard
                  </option>
                </select>

                <small>
                  Select default dashboard
                </small>

              </div>

              {/* Date Format */}

              <div className="setting-field">

                <label>
                  Date Format
                </label>

                <select
                  name="dateFormat"
                  value={settings.dateFormat}
                  onChange={handleChange}
                >
                  <option>
                    DD MMM YYYY
                  </option>

                  <option>
                    DD/MM/YYYY
                  </option>

                  <option>
                    MM/DD/YYYY
                  </option>

                  <option>
                    YYYY-MM-DD
                  </option>
                </select>

                <small>
                  Select the date format
                </small>

              </div>

              {/* Time Format */}

              <div className="setting-field">

                <label>
                  Time Format
                </label>

                <select
                  name="timeFormat"
                  value={settings.timeFormat}
                  onChange={handleChange}
                >
                  <option>
                    12 Hour (AM/PM)
                  </option>

                  <option>
                    24 Hour
                  </option>
                </select>

                <small>
                  Select the time format
                </small>

              </div>

              {/* Currency */}

              <div className="setting-field">

                <label>
                  Currency
                </label>

                <select
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                >
                  <option>
                    Indian Rupee (₹)
                  </option>

                  <option>
                    US Dollar ($)
                  </option>

                  <option>
                    Euro (€)
                  </option>
                </select>

                <small>
                  Select the default currency
                </small>

              </div>

            </div>
          </section>

          {/* =================================              2. LOCALE SETTINGS          ================================== */}

          <section className="settings-section">

            <h2>2. Locale Settings</h2>

            <div className="settings-grid">

              {/* Timezone */}

              <div className="setting-field">

                <label>
                  Timezone
                </label>

                <select
                  name="timezone"
                  value={settings.timezone}
                  onChange={handleChange}
                >
                  <option>
                    (GMT+05:30) Asia/Kolkata
                  </option>

                  <option>
                    (GMT+00:00) UTC
                  </option>

                  <option>
                    (GMT+01:00) Europe/London
                  </option>
                </select>

                <small>
                  Select the system timezone
                </small>

              </div>

              {/* Language */}

              <div className="setting-field">

                <label>
                  Language
                </label>

                <select
                  name="language"
                  value={settings.language}
                  onChange={handleChange}
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Marathi</option>
                </select>

                <small>
                  Select the system language
                </small>

              </div>

              {/* Number Format */}

              <div className="setting-field">

                <label>
                  Number Format
                </label>

                <select
                  name="numberFormat"
                  value={
                    settings.numberFormat
                  }
                  onChange={handleChange}
                >
                  <option>
                    1,23,456.78
                  </option>

                  <option>
                    123,456.78
                  </option>

                  <option>
                    1.23.456,78
                  </option>
                </select>

                <small>
                  Select the number format
                </small>

              </div>

            </div>
          </section>

          {/* =================================              3. DISPLAY SETTINGS          ================================== */}

          <section className="settings-section">

            <h2>3. Display Settings</h2>

            <div className="display-settings-grid">

              {/* Dark Mode */}

              <div className="toggle-setting">

                <div>
                  <strong>
                    Enable Dark Mode
                  </strong>

                  <small>
                    Allow users to switch between
                    light and dark mode
                  </small>
                </div>

                <label className="switch">

                  <input
                    type="checkbox"
                    name="enableDarkMode"
                    checked={
                      settings.enableDarkMode
                    }
                    onChange={handleChange}
                  />

                  <span className="slider" />

                </label>

              </div>

              {/* Breadcrumbs */}

              <div className="toggle-setting">

                <div>
                  <strong>
                    Show Breadcrumbs
                  </strong>

                  <small>
                    Show page breadcrumbs in the
                    header
                  </small>
                </div>

                <label className="switch">

                  <input
                    type="checkbox"
                    name="showBreadcrumbs"
                    checked={
                      settings.showBreadcrumbs
                    }
                    onChange={handleChange}
                  />

                  <span className="slider" />

                </label>

              </div>

              {/* Footer */}

              <div className="toggle-setting">

                <div>
                  <strong>
                    Show Footer
                  </strong>

                  <small>
                    Display footer in all pages
                  </small>
                </div>

                <label className="switch">

                  <input
                    type="checkbox"
                    name="showFooter"
                    checked={
                      settings.showFooter
                    }
                    onChange={handleChange}
                  />

                  <span className="slider" />

                </label>

              </div>

              {/* Compact Sidebar */}

              <div className="toggle-setting">

                <div>
                  <strong>
                    Compact Sidebar
                  </strong>

                  <small>
                    Reduce sidebar width
                  </small>
                </div>

                <label className="switch">

                  <input
                    type="checkbox"
                    name="compactSidebar"
                    checked={
                      settings.compactSidebar
                    }
                    onChange={handleChange}
                  />

                  <span className="slider" />

                </label>

              </div>

              {/* Animations */}

              <div className="toggle-setting">

                <div>
                  <strong>
                    Enable Animations
                  </strong>

                  <small>
                    Enable page transition animations
                  </small>
                </div>

                <label className="switch">

                  <input
                    type="checkbox"
                    name="enableAnimations"
                    checked={
                      settings.enableAnimations
                    }
                    onChange={handleChange}
                  />

                  <span className="slider" />

                </label>

              </div>

              {/* Quick Actions */}

              <div className="toggle-setting">

                <div>
                  <strong>
                    Show Quick Actions
                  </strong>

                  <small>
                    Display quick action panel on
                    dashboard
                  </small>
                </div>

                <label className="switch">

                  <input
                    type="checkbox"
                    name="showQuickActions"
                    checked={
                      settings.showQuickActions
                    }
                    onChange={handleChange}
                  />

                  <span className="slider" />

                </label>

              </div>

            </div>
          </section>

          {/* =================================              4. ITEMS PER PAGE          ================================== */}

          <section className="settings-section">

            <h2>4. Items Per Page</h2>

            <div className="settings-grid single-column">

              <div className="setting-field">

                <label>
                  Default Items Per Page
                </label>

                <select
                  name="defaultItemsPerPage"
                  value={
                    settings.defaultItemsPerPage
                  }
                  onChange={handleChange}
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>

                <small>
                  Select how many items to display
                  per page in tables
                </small>

              </div>

            </div>
          </section>

          {/* =================================              5. FILE UPLOAD SETTINGS          ================================== */}

          <section className="settings-section">

            <h2>5. File Upload Settings</h2>

            <div className="settings-grid">

              {/* Max File Size */}

              <div className="setting-field">

                <label>
                  Max File Size (MB)
                </label>

                <input
                  type="number"
                  name="maxFileSize"
                  min="1"
                  value={settings.maxFileSize}
                  onChange={handleChange}
                />

                <small>
                  Maximum file size allowed for upload
                </small>

              </div>

              {/* Allowed Types */}

              <div className="setting-field">

                <label>
                  Allowed File Types
                </label>

                <input
                  type="text"
                  name="allowedFileTypes"
                  value={
                    settings.allowedFileTypes
                  }
                  onChange={handleChange}
                  placeholder="jpg, jpeg, png, pdf..."
                />

                <small>
                  Enter allowed file extensions
                  (comma separated)
                </small>

              </div>

              {/* Storage Disk */}

              <div className="setting-field">

                <label>
                  Storage Disk
                </label>

                <select
                  name="storageDisk"
                  value={settings.storageDisk}
                  onChange={handleChange}
                >
                  <option>
                    Local Storage
                  </option>

                  <option>
                    Cloud Storage
                  </option>
                </select>

                <small>
                  Select the storage disk for
                  uploaded files
                </small>

              </div>

            </div>
          </section>

          {/* =================================              BOTTOM INFO          ================================== */}

          <div className="settings-info-box">
            <div className="settings-info-icon">
              <ImageIcon size={15} />
            </div>

            <span>
              Don't forget to click on Save Changes
              button to apply the changes.
            </span>
          </div>

        </main>
      </form>
    </div>
  );
};

export default SystemSettings;