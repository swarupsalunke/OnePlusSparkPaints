
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  RefreshCw,
  Eye,
  X,
  Upload,
  MapPin,
  FileText,
  Store,
  UserRound,
  CheckCircle,
} from "lucide-react";
import "../../css/salesExecutive/SalesExecutiveDealerReg.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://oneplussparkpaintsserver.onrender.com";
const API_URL = `${API_BASE_URL}/api/sales-executive/dealer-registrations`;

const INITIAL_FORM = {
  dealerName: "",
  businessName: "",
  mobile: "",
  email: "",
  address: "",
  city: "",
  district: "",
  state: "",
  pinCode: "",
  gstNumber: "",
  panNumber: "",
  businessCategory: "",
  shopType: "",
  latitude: "",
  longitude: "",
  googleMapLocation: "",
};

const DOCUMENT_FIELDS = [
  { name: "gstCertificate", label: "GST Certificate", required: true },
  { name: "panCard", label: "PAN Card", required: true },
  { name: "aadhaar", label: "Aadhaar", required: true },
  { name: "shopPhotograph", label: "Shop Photograph", required: true },
  { name: "businessLicence", label: "Business Licence", required: false },
  { name: "cancelledCheque", label: "Cancelled Cheque", required: true },
  { name: "bankPassbook", label: "Bank Passbook", required: true },
];

const REGISTRATION_STATUSES = [
  "PENDING",
  "KYC_VERIFIED",
  "APPROVED",
  "REJECTED",
  "CORRECTION_REQUIRED",
];

const getToken = () => localStorage.getItem("token");

const getAuthHeaders = () => ({
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const formatStatus = (status) =>
  String(status || "PENDING")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());

const SalesExecutiveDealerRegistration = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [documents, setDocuments] = useState({});

  const fetchRegistrations = async () => {
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to fetch registrations");
      }

      setRegistrations(data.registrations || []);
    } catch (error) {
      toast.error(error.message || "Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleDocumentChange = (event) => {
    const { name, files } = event.target;
    const file = files?.[0];

    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error(`${file.name} exceeds the 10 MB limit`);
      event.target.value = "";
      return;
    }

    const allowedExtensions = [
      "pdf",
      "jpg",
      "jpeg",
      "png",
      "webp",
      "doc",
      "docx",
    ];

    const extension = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      toast.error("Select a supported document or image file");
      event.target.value = "";
      return;
    }

    setDocuments((previous) => ({
      ...previous,
      [name]: file,
    }));
  };

  const openAddForm = () => {
    setForm({ ...INITIAL_FORM });
    setDocuments({});
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setForm({ ...INITIAL_FORM });
    setDocuments({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    const requiredDocuments = DOCUMENT_FIELDS.filter(
      (document) => document.required
    );

    const missingDocuments = requiredDocuments.filter(
      (document) => !documents[document.name]
    );

    if (missingDocuments.length > 0) {
      toast.error(
        `Please upload: ${missingDocuments.map((item) => item.label).join(", ")}`
      );
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value !== "") {
          formData.append(key, value);
        }
      });

      DOCUMENT_FIELDS.forEach(({ name }) => {
        if (documents[name]) {
          formData.append(name, documents[name]);
        }
      });

      const response = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to submit registration");
      }

      toast.success("Dealer registration submitted successfully");

      setShowForm(false);
      setForm({ ...INITIAL_FORM });
      setDocuments({});

      await fetchRegistrations();
    } catch (error) {
      toast.error(error.message || "Failed to submit registration");
    } finally {
      setSaving(false);
    }
  };

  const filteredRegistrations = registrations.filter((registration) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      !searchText ||
      [
        registration.registrationId,
        registration.dealerName,
        registration.businessName,
        registration.mobile,
        registration.email,
        registration.city,
      ].some((value) =>
        String(value || "").toLowerCase().includes(searchText)
      );

    const matchesStatus =
      statusFilter === "All" || registration.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusClass = (status) =>
    `dealer-registration-status dealer-registration-status-${String(
      status || "PENDING"
    ).toLowerCase().replaceAll("_", "-")}`;

  const totalApproved = registrations.filter(
    (item) => item.status === "APPROVED"
  ).length;

  const totalPending = registrations.filter(
    (item) => item.status === "PENDING"
  ).length;

  const totalInReview = registrations.filter((item) =>
    ["KYC_VERIFIED", "CORRECTION_REQUIRED"].includes(item.status)
  ).length;

  return (
    <div className="dealer-registration-page">
      <div className="dealer-registration-header">
        <div>
          <h1>Dealer Registration</h1>
          <p>Register new dealers and track their verification status.</p>
        </div>

        <button
          type="button"
          className="dealer-registration-primary-btn"
          onClick={openAddForm}
        >
          <Plus size={18} />
          New Registration
        </button>
      </div>

      <div className="dealer-registration-stats">
        <div className="dealer-registration-stat-card">
          <div>
            <span>Total Registrations</span>
            <strong>{registrations.length}</strong>
          </div>
          <Store size={23} />
        </div>

        <div className="dealer-registration-stat-card">
          <div>
            <span>Pending</span>
            <strong>{totalPending}</strong>
          </div>
          <FileText size={23} />
        </div>

        <div className="dealer-registration-stat-card">
          <div>
            <span>In Review</span>
            <strong>{totalInReview}</strong>
          </div>
          <UserRound size={23} />
        </div>

        <div className="dealer-registration-stat-card">
          <div>
            <span>Approved</span>
            <strong>{totalApproved}</strong>
          </div>
          <CheckCircle size={23} />
        </div>
      </div>

      <div className="dealer-registration-list-card">
        <div className="dealer-registration-list-heading">
          <div>
            <h2>Registration History</h2>
            <p>{filteredRegistrations.length} registration(s) found</p>
          </div>

          <button
            type="button"
            className="dealer-registration-refresh-btn"
            onClick={fetchRegistrations}
            disabled={loading}
            title="Refresh registrations"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="dealer-registration-filters">
          <div className="dealer-registration-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search dealer, business, mobile..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by registration status"
          >
            <option value="All">All Statuses</option>
            {REGISTRATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="dealer-registration-message">
            Loading registrations...
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="dealer-registration-empty">
            <Store size={36} />
            <h3>No registrations found</h3>
            <p>
              {registrations.length === 0
                ? "Create your first dealer registration."
                : "Try changing your search or status filter."}
            </p>
            {registrations.length === 0 && (
              <button
                type="button"
                className="dealer-registration-primary-btn"
                onClick={openAddForm}
              >
                <Plus size={17} />
                New Registration
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="dealer-registration-table-wrap">
              <table className="dealer-registration-table">
                <thead>
                  <tr>
                    <th>Registration ID</th>
                    <th>Dealer / Business</th>
                    <th>Contact</th>
                    <th>City</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRegistrations.map((registration) => (
                    <tr key={registration._id}>
                      <td>{registration.registrationId}</td>
                      <td>
                        <div className="dealer-registration-name-cell">
                          <strong>{registration.dealerName}</strong>
                          <span>{registration.businessName}</span>
                        </div>
                      </td>
                      <td>
                        <div className="dealer-registration-name-cell">
                          <span>{registration.mobile}</span>
                          <span>{registration.email}</span>
                        </div>
                      </td>
                      <td>{registration.city}</td>
                      <td>
                        <span className={getStatusClass(registration.status)}>
                          {formatStatus(registration.status)}
                        </span>
                      </td>
                      <td>{formatDate(registration.createdAt)}</td>
                      <td>
                        <button
                          type="button"
                          className="dealer-registration-action-btn"
                          title="View registration"
                          onClick={() => setSelectedRegistration(registration)}
                        >
                          <Eye size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="dealer-registration-mobile-list">
              {filteredRegistrations.map((registration) => (
                <div
                  className="dealer-registration-mobile-card"
                  key={registration._id}
                >
                  <div>
                    <strong>{registration.dealerName}</strong>
                    <span>{registration.businessName}</span>
                    <span>{registration.registrationId}</span>
                  </div>

                  <span className={getStatusClass(registration.status)}>
                    {formatStatus(registration.status)}
                  </span>

                  <div className="dealer-registration-mobile-info">
                    <span>{registration.mobile}</span>
                    <span>{registration.city}</span>
                    <span>{formatDate(registration.createdAt)}</span>
                  </div>

                  <button
                    type="button"
                    className="dealer-registration-secondary-btn"
                    onClick={() => setSelectedRegistration(registration)}
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showForm && (
        <div
          className="dealer-registration-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <div
            className="dealer-registration-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dealer-registration-form-title"
          >
            <div className="dealer-registration-modal-header">
              <div>
                <h2 id="dealer-registration-form-title">
                  New Dealer Registration
                </h2>
                <p>Enter business details and upload KYC documents.</p>
              </div>

              <button
                type="button"
                className="dealer-registration-close-btn"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close form"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="dealer-registration-form-body">
                <div className="dealer-registration-section-title">
                  <UserRound size={19} />
                  <h3>Business Details</h3>
                </div>

                <div className="dealer-registration-form-grid">
                  <label>
                    Dealer Name *
                    <input
                      name="dealerName"
                      value={form.dealerName}
                      onChange={handleFormChange}
                      required
                      maxLength={100}
                      placeholder="Enter dealer name"
                    />
                  </label>

                  <label>
                    Business Name *
                    <input
                      name="businessName"
                      value={form.businessName}
                      onChange={handleFormChange}
                      required
                      maxLength={150}
                      placeholder="Enter business name"
                    />
                  </label>

                  <label>
                    Mobile Number *
                    <input
                      type="tel"
                      name="mobile"
                      value={form.mobile}
                      onChange={handleFormChange}
                      required
                      pattern="[0-9]{10}"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                    />
                  </label>

                  <label>
                    Email *
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleFormChange}
                      required
                      maxLength={150}
                      placeholder="dealer@example.com"
                    />
                  </label>

                  <label className="dealer-registration-field-full">
                    Complete Address *
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleFormChange}
                      required
                      maxLength={500}
                      rows={2}
                      placeholder="Enter complete business address"
                    />
                  </label>

                  <label>
                    City *
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleFormChange}
                      required
                      placeholder="Enter city"
                    />
                  </label>

                  <label>
                    District *
                    <input
                      name="district"
                      value={form.district}
                      onChange={handleFormChange}
                      required
                      placeholder="Enter district"
                    />
                  </label>

                  <label>
                    State *
                    <input
                      name="state"
                      value={form.state}
                      onChange={handleFormChange}
                      required
                      placeholder="Enter state"
                    />
                  </label>

                  <label>
                    PIN Code *
                    <input
                      name="pinCode"
                      value={form.pinCode}
                      onChange={handleFormChange}
                      required
                      pattern="[0-9]{6}"
                      maxLength={6}
                      placeholder="6-digit PIN code"
                    />
                  </label>
                </div>

                <div className="dealer-registration-section-title">
                  <Store size={19} />
                  <h3>Business Information</h3>
                </div>

                <div className="dealer-registration-form-grid">
                  <label>
                    GST Number
                    <input
                      name="gstNumber"
                      value={form.gstNumber}
                      onChange={handleFormChange}
                      maxLength={15}
                      placeholder="Enter GST number"
                    />
                  </label>

                  <label>
                    PAN Number
                    <input
                      name="panNumber"
                      value={form.panNumber}
                      onChange={handleFormChange}
                      maxLength={10}
                      placeholder="Enter PAN number"
                    />
                  </label>

                  <label>
                    Business Category *
                    <select
                      name="businessCategory"
                      value={form.businessCategory}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Select category</option>
                      <option value="Paint Dealer">Paint Dealer</option>
                      <option value="Distributor">Distributor</option>
                      <option value="Wholesaler">Wholesaler</option>
                      <option value="Retailer">Retailer</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>

                  <label>
                    Shop Type *
                    <select
                      name="shopType"
                      value={form.shopType}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Select shop type</option>
                      <option value="Retail">Retail</option>
                      <option value="Wholesale">Wholesale</option>
                      <option value="Both">Both</option>
                    </select>
                  </label>
                </div>

                <div className="dealer-registration-section-title">
                  <Upload size={19} />
                  <h3>KYC Documents</h3>
                </div>

                <div className="dealer-registration-documents">
                  {DOCUMENT_FIELDS.map((document) => (
                    <label
                      className="dealer-registration-document-field"
                      key={document.name}
                    >
                      <span>
                        {document.label}
                        {document.required ? " *" : " (Optional)"}
                      </span>

                      <input
                        type="file"
                        name={document.name}
                        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                        required={document.required}
                        onChange={handleDocumentChange}
                      />

                      {documents[document.name] && (
                        <small>
                          Selected: {documents[document.name].name}
                        </small>
                      )}
                    </label>
                  ))}
                </div>

                <div className="dealer-registration-section-title">
                  <MapPin size={19} />
                  <h3>Location Details</h3>
                </div>

                <div className="dealer-registration-form-grid">
                  <label>
                    Latitude
                    <input
                      type="number"
                      name="latitude"
                      value={form.latitude}
                      onChange={handleFormChange}
                      min="-90"
                      max="90"
                      step="any"
                      placeholder="e.g. 18.5204"
                    />
                  </label>

                  <label>
                    Longitude
                    <input
                      type="number"
                      name="longitude"
                      value={form.longitude}
                      onChange={handleFormChange}
                      min="-180"
                      max="180"
                      step="any"
                      placeholder="e.g. 73.8567"
                    />
                  </label>

                  <label className="dealer-registration-field-full">
                    Google Maps Location
                    <input
                      type="url"
                      name="googleMapLocation"
                      value={form.googleMapLocation}
                      onChange={handleFormChange}
                      placeholder="Paste Google Maps link"
                    />
                  </label>
                </div>
              </div>

              <div className="dealer-registration-form-footer">
                <button
                  type="button"
                  className="dealer-registration-secondary-btn"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="dealer-registration-primary-btn"
                  disabled={saving}
                >
                  {saving ? "Submitting..." : "Submit Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedRegistration && (
        <div
          className="dealer-registration-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRegistration(null);
            }
          }}
        >
          <div
            className="dealer-registration-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dealer-registration-details-title"
          >
            <div className="dealer-registration-modal-header">
              <div>
                <h2 id="dealer-registration-details-title">
                  Registration Details
                </h2>
                <p>{selectedRegistration.registrationId}</p>
              </div>

              <button
                type="button"
                className="dealer-registration-close-btn"
                onClick={() => setSelectedRegistration(null)}
                aria-label="Close details"
              >
                <X size={21} />
              </button>
            </div>

            <div className="dealer-registration-details">
              <span className={getStatusClass(selectedRegistration.status)}>
                {formatStatus(selectedRegistration.status)}
              </span>

              <h3>Business Details</h3>
              <p><strong>Dealer:</strong> {selectedRegistration.dealerName}</p>
              <p><strong>Business:</strong> {selectedRegistration.businessName}</p>
              <p><strong>Mobile:</strong> {selectedRegistration.mobile}</p>
              <p><strong>Email:</strong> {selectedRegistration.email}</p>
              <p><strong>Address:</strong> {selectedRegistration.address}</p>
              <p>
                <strong>Location:</strong>{" "}
                {[selectedRegistration.city, selectedRegistration.district, selectedRegistration.state, selectedRegistration.pinCode]
                  .filter(Boolean)
                  .join(", ")}
              </p>

              <h3>Business Information</h3>
              <p><strong>GST:</strong> {selectedRegistration.gstNumber || "—"}</p>
              <p><strong>PAN:</strong> {selectedRegistration.panNumber || "—"}</p>
              <p><strong>Category:</strong> {selectedRegistration.businessCategory}</p>
              <p><strong>Shop Type:</strong> {selectedRegistration.shopType}</p>

              <h3>KYC Documents</h3>

              {DOCUMENT_FIELDS.map((document) => {
                const filePath = selectedRegistration[document.name];

                return (
                  <p key={document.name}>
                    <strong>{document.label}:</strong>{" "}
                    {filePath ? (
                      <a
                        href={`${API_BASE_URL}${filePath}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Document
                      </a>
                    ) : (
                      "Not uploaded"
                    )}
                  </p>
                );
              })}

              <h3>Location</h3>
              <p>
                <strong>GPS:</strong>{" "}
                {selectedRegistration.gpsCoordinates?.latitude ?? "—"},{" "}
                {selectedRegistration.gpsCoordinates?.longitude ?? "—"}
              </p>

              {selectedRegistration.googleMapLocation && (
                <p>
                  <a
                    href={selectedRegistration.googleMapLocation}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Google Maps
                  </a>
                </p>
              )}

              <h3>Review Information</h3>
              <p><strong>Admin Remarks:</strong> {selectedRegistration.adminRemarks || "No remarks"}</p>
              <p><strong>Submitted:</strong> {formatDate(selectedRegistration.createdAt)}</p>
              <p><strong>Reviewed:</strong> {formatDate(selectedRegistration.reviewedAt)}</p>
            </div>

            <div className="dealer-registration-form-footer">
              <button
                type="button"
                className="dealer-registration-secondary-btn"
                onClick={() => setSelectedRegistration(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesExecutiveDealerRegistration;
