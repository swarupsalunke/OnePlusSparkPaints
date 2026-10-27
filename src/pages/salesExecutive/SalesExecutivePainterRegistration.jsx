
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  RefreshCw,
  Eye,
  X,
  Upload,
  UserRound,
  FileText,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import "../../css/salesExecutive/SalesExecutivePainterReg.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://oneplussparkpaintsserver.onrender.com";

const API_URL = `${API_BASE_URL}/api/sales-executive/painter-registrations`;

const initialForm = {
  name: "",
  mobile: "",
  email: "",
  address: "",
  city: "",
  serviceableArea: "",
  experience: "",
  specialization: "",
  bankAccountNumber: "",
  ifscCode: "",
};

const documentFields = [
  { name: "aadhaar", label: "Aadhaar Document", required: true },
  { name: "panCard", label: "PAN Card", required: false },
  { name: "profilePhoto", label: "Profile Photo", required: true },
  { name: "passbook", label: "Bank Passbook", required: false },
  { name: "cancelledCheque", label: "Cancelled Cheque", required: false },
];

const statusLabels = {
  PENDING: "Pending",
  KYC_VERIFIED: "KYC Verified",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CORRECTION_REQUIRED: "Correction Required",
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getDocumentUrl = (path) => {
  if (!path) return "";

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

const SalesExecutivePainterRegistration = () => {
  const [form, setForm] = useState(initialForm);
  const [documents, setDocuments] = useState({});
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  const token = localStorage.getItem("token");

  const fetchRegistrations = async () => {
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to fetch painter registrations."
        );
      }

      setRegistrations(
        Array.isArray(result.data) ? result.data : []
      );
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleDocumentChange = (event) => {
    const { name, files } = event.target;
    const file = files?.[0];

    if (!file) return;

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
      toast.error("Please upload a PDF, image or supported document.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Each document must be smaller than 10 MB.");
      event.target.value = "";
      return;
    }

    setDocuments((previous) => ({
      ...previous,
      [name]: file,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setDocuments({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error("Please log in again.");
      return;
    }

    if (!documents.aadhaar || !documents.profilePhoto) {
      toast.error("Please upload Aadhaar and Profile Photo.");
      return;
    }

    if (!documents.passbook && !documents.cancelledCheque) {
      toast.error("Please upload either Passbook or Cancelled Cheque.");
      return;
    }

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    Object.entries(documents).forEach(([key, file]) => {
      if (file) {
        formData.append(key, file);
      }
    });

    setSubmitting(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to submit painter registration."
        );
      }

      toast.success(
        result.message || "Painter registration submitted successfully."
      );

      resetForm();
      setShowForm(false);
      await fetchRegistrations();
    } catch (error) {
      toast.error(error.message || "Failed to submit registration.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRegistrations = registrations.filter((registration) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      [
        registration.registrationId,
        registration.name,
        registration.mobile,
        registration.email,
        registration.city,
        registration.serviceableArea,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

    const matchesStatus =
      statusFilter === "ALL" || registration.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getCount = (status) =>
    registrations.filter((registration) => registration.status === status)
      .length;

  const openDetails = async (registration) => {
    setSelectedRegistration(registration);

    try {
      const response = await fetch(`${API_URL}/${registration._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch registration details.");
      }

      setSelectedRegistration(result.data);
    } catch (error) {
      toast.error(error.message || "Failed to load registration details.");
    }
  };

  const renderDocumentLink = (label, path) => (
    <div className="painter-document-item" key={label}>
      <div className="painter-document-info">
        <FileText size={18} />
        <span>{label}</span>
      </div>

      {path ? (
        <a
          href={getDocumentUrl(path)}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Document
        </a>
      ) : (
        <span className="painter-document-missing">Not uploaded</span>
      )}
    </div>
  );

  return (
    <div className="painter-registration-page">
      <div className="painter-registration-header">
        <div>
          <h1>Painter Registration</h1>
          <p>Register painters and manage submitted registrations.</p>
        </div>

        <button
          type="button"
          className="painter-primary-btn"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus size={18} />
          Add Painter
        </button>
      </div>

      <div className="painter-registration-stats">
        <div className="painter-stat-card">
          <span>Total Registrations</span>
          <strong>{registrations.length}</strong>
          <UserRound size={22} />
        </div>

        <div className="painter-stat-card">
          <span>Pending</span>
          <strong>{getCount("PENDING")}</strong>
          <Clock size={22} />
        </div>

        <div className="painter-stat-card">
          <span>KYC Verified</span>
          <strong>{getCount("KYC_VERIFIED")}</strong>
          <FileText size={22} />
        </div>

        <div className="painter-stat-card">
          <span>Approved</span>
          <strong>{getCount("APPROVED")}</strong>
          <CheckCircle size={22} />
        </div>

        <div className="painter-stat-card">
          <span>Rejected</span>
          <strong>{getCount("REJECTED")}</strong>
          <XCircle size={22} />
        </div>
      </div>

      <div className="painter-registration-list-card">
        <div className="painter-list-header">
          <div>
            <h2>Submitted Registrations</h2>
            <p>View the status and details of registered painters.</p>
          </div>

          <button
            type="button"
            className="painter-secondary-btn"
            onClick={fetchRegistrations}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="painter-registration-filters">
          <div className="painter-search-box">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search name, mobile, city..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by registration status"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="KYC_VERIFIED">KYC Verified</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CORRECTION_REQUIRED">Correction Required</option>
          </select>
        </div>

        {loading ? (
          <div className="painter-empty-state">Loading registrations...</div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="painter-empty-state">
            No painter registrations found.
          </div>
        ) : (
          <>
            <div className="painter-registration-table-wrapper">
              <table className="painter-registration-table">
                <thead>
                  <tr>
                    <th>Registration ID</th>
                    <th>Painter</th>
                    <th>Mobile</th>
                    <th>City</th>
                    <th>Serviceable Area</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRegistrations.map((registration) => (
                    <tr key={registration._id}>
                      <td>{registration.registrationId || "-"}</td>
                      <td>{registration.name}</td>
                      <td>{registration.mobile}</td>
                      <td>{registration.city}</td>
                      <td>{registration.serviceableArea}</td>
                      <td>{formatDate(registration.createdAt)}</td>
                      <td>
                        <span
                          className={`painter-status-badge ${(
                            registration.status || "PENDING"
                          ).toLowerCase().replaceAll("_", "-")}`}
                        >
                          {statusLabels[registration.status] ||
                            registration.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="painter-view-btn"
                          onClick={() => openDetails(registration)}
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="painter-registration-mobile-list">
              {filteredRegistrations.map((registration) => (
                <div
                  className="painter-registration-mobile-card"
                  key={registration._id}
                >
                  <div className="painter-mobile-card-header">
                    <div>
                      <strong>{registration.name}</strong>
                      <span>{registration.registrationId}</span>
                    </div>

                    <span
                      className={`painter-status-badge ${(
                        registration.status || "PENDING"
                      ).toLowerCase().replaceAll("_", "-")}`}
                    >
                      {statusLabels[registration.status] ||
                        registration.status}
                    </span>
                  </div>

                  <p>
                    <strong>Mobile:</strong> {registration.mobile}
                  </p>
                  <p>
                    <strong>City:</strong> {registration.city}
                  </p>
                  <p>
                    <strong>Service Area:</strong>{" "}
                    {registration.serviceableArea}
                  </p>
                  <p>
                    <strong>Date:</strong> {formatDate(registration.createdAt)}
                  </p>

                  <button
                    type="button"
                    className="painter-view-btn"
                    onClick={() => openDetails(registration)}
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
        <div className="painter-modal-overlay">
          <div
            className="painter-modal painter-registration-form-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="painter-form-title"
          >
            <div className="painter-modal-header">
              <div>
                <h2 id="painter-form-title">Register New Painter</h2>
                <p>Enter painter details and upload required documents.</p>
              </div>

              <button
                type="button"
                className="painter-icon-btn"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                aria-label="Close registration form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="painter-form-section">
                <h3>
                  <UserRound size={18} />
                  Painter Details
                </h3>

                <div className="painter-form-grid">
                  <label>
                    Painter Name *
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      maxLength={100}
                      placeholder="Enter full name"
                    />
                  </label>

                  <label>
                    Mobile Number *
                    <input
                      name="mobile"
                      type="tel"
                      value={form.mobile}
                      onChange={handleChange}
                      required
                      maxLength={15}
                      placeholder="Enter mobile number"
                    />
                  </label>

                  <label>
                    Email (Optional)
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                    />
                  </label>

                  <label>
                    Experience (Years) *
                    <input
                      name="experience"
                      type="number"
                      min="0"
                      step="1"
                      value={form.experience}
                      onChange={handleChange}
                      required
                      placeholder="Enter years of experience"
                    />
                  </label>

                  <label className="painter-form-full">
                    Address *
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      required
                      rows={3}
                      placeholder="Enter complete address"
                    />
                  </label>

                  <label>
                    City *
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                      placeholder="Enter city"
                    />
                  </label>

                  <label>
                    Serviceable Area *
                    <input
                      name="serviceableArea"
                      value={form.serviceableArea}
                      onChange={handleChange}
                      required
                      placeholder="Enter areas served"
                    />
                  </label>

                  <label className="painter-form-full">
                    Specialization *
                    <input
                      name="specialization"
                      value={form.specialization}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Interior, Exterior, Texture Painting"
                    />
                  </label>
                </div>
              </div>

              <div className="painter-form-section">
                <h3>
                  <FileText size={18} />
                  Bank Details
                </h3>

                <div className="painter-form-grid">
                  <label>
                    Bank Account Number *
                    <input
                      name="bankAccountNumber"
                      value={form.bankAccountNumber}
                      onChange={handleChange}
                      required
                      maxLength={34}
                      placeholder="Enter bank account number"
                    />
                  </label>

                  <label>
                    IFSC Code *
                    <input
                      name="ifscCode"
                      value={form.ifscCode}
                      onChange={handleChange}
                      required
                      maxLength={11}
                      style={{ textTransform: "uppercase" }}
                      placeholder="Enter IFSC code"
                    />
                  </label>
                </div>
              </div>

              <div className="painter-form-section">
                <h3>
                  <Upload size={18} />
                  Documents
                </h3>

                <p className="painter-form-help">
                  Maximum 10 MB per file. Upload PDF, JPG, PNG, WEBP, DOC or
                  DOCX. Aadhaar and Profile Photo are required. Passbook or
                  Cancelled Cheque is required.
                </p>

                <div className="painter-document-upload-grid">
                  {documentFields.map((document) => (
                    <label
                      className="painter-upload-field"
                      key={document.name}
                    >
                      <span>
                        {document.label}
                        {document.required ? " *" : " (Optional)"}
                      </span>

                      <div className="painter-upload-control">
                        <Upload size={18} />
                        <input
                          type="file"
                          name={document.name}
                          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                          onChange={handleDocumentChange}
                          required={document.required}
                        />
                      </div>

                      <small>
                        {documents[document.name]
                          ? documents[document.name].name
                          : "No file selected"}
                      </small>
                    </label>
                  ))}
                </div>
              </div>

              <div className="painter-modal-footer">
                <button
                  type="button"
                  className="painter-secondary-btn"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="painter-primary-btn"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedRegistration && (
        <div className="painter-modal-overlay">
          <div
            className="painter-modal painter-registration-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="painter-details-title"
          >
            <div className="painter-modal-header">
              <div>
                <h2 id="painter-details-title">Painter Registration Details</h2>
                <p>{selectedRegistration.registrationId}</p>
              </div>

              <button
                type="button"
                className="painter-icon-btn"
                onClick={() => setSelectedRegistration(null)}
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="painter-details-content">
              <div className="painter-details-status">
                <span>Status</span>
                <span
                  className={`painter-status-badge ${(
                    selectedRegistration.status || "PENDING"
                  ).toLowerCase().replaceAll("_", "-")}`}
                >
                  {statusLabels[selectedRegistration.status] ||
                    selectedRegistration.status}
                </span>
              </div>

              <div className="painter-details-grid">
                <div>
                  <span>Painter Name</span>
                  <strong>{selectedRegistration.name || "-"}</strong>
                </div>

                <div>
                  <span>Mobile Number</span>
                  <strong>{selectedRegistration.mobile || "-"}</strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>{selectedRegistration.email || "-"}</strong>
                </div>

                <div>
                  <span>City</span>
                  <strong>{selectedRegistration.city || "-"}</strong>
                </div>

                <div>
                  <span>Serviceable Area</span>
                  <strong>{selectedRegistration.serviceableArea || "-"}</strong>
                </div>

                <div>
                  <span>Experience</span>
                  <strong>
                    {selectedRegistration.experience ?? "-"} years
                  </strong>
                </div>

                <div>
                  <span>Specialization</span>
                  <strong>{selectedRegistration.specialization || "-"}</strong>
                </div>

                <div>
                  <span>Registration Date</span>
                  <strong>{formatDate(selectedRegistration.createdAt)}</strong>
                </div>

                <div>
                  <span>Bank Account Number</span>
                  <strong>
                    {selectedRegistration.bankAccountNumber || "-"}
                  </strong>
                </div>

                <div>
                  <span>IFSC Code</span>
                  <strong>{selectedRegistration.ifscCode || "-"}</strong>
                </div>

                <div className="painter-details-full">
                  <span>Address</span>
                  <strong>{selectedRegistration.address || "-"}</strong>
                </div>
              </div>

              <div className="painter-details-documents">
                <h3>
                  <FileText size={18} />
                  Submitted Documents
                </h3>

                {renderDocumentLink(
                  "Aadhaar",
                  selectedRegistration.aadhaar
                )}
                {renderDocumentLink(
                  "PAN Card",
                  selectedRegistration.panCard
                )}
                {renderDocumentLink(
                  "Profile Photo",
                  selectedRegistration.profilePhoto
                )}
                {renderDocumentLink(
                  "Bank Passbook",
                  selectedRegistration.passbook
                )}
                {renderDocumentLink(
                  "Cancelled Cheque",
                  selectedRegistration.cancelledCheque
                )}
              </div>

              {selectedRegistration.adminRemarks && (
                <div className="painter-admin-remarks">
                  <strong>Review Remarks</strong>
                  <p>{selectedRegistration.adminRemarks}</p>
                </div>
              )}

              {selectedRegistration.salesExecutive && (
                <div className="painter-submitted-by">
                  <MapPin size={16} />
                  <span>
                    Submitted by:{" "}
                    {selectedRegistration.salesExecutive.name || "-"}
                  </span>
                </div>
              )}
            </div>

            <div className="painter-modal-footer">
              <button
                type="button"
                className="painter-secondary-btn"
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

export default SalesExecutivePainterRegistration;
