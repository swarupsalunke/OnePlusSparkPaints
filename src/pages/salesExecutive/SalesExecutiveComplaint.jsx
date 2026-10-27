
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  History,
  ImagePlus,
  LoaderCircle,
  MessageSquare,
  Send,
  UserRound,
  Users,
  Package,
  Wrench,
  X,
} from "lucide-react";
import "../../css/salesExecutive/SalesExecutiveComplaint.css";


const API_BASE_URL = "https://oneplussparkpaintsserver.onrender.com";


const CATEGORIES = [
  { label: "Painter", value: "PAINTER", icon: UserRound },
  { label: "Dealer", value: "DEALER", icon: Users },
  { label: "Products", value: "PRODUCT", icon: Package },
  { label: "Services", value: "SERVICE", icon: Wrench },
];

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

const STATUS_LABELS = {
  NEW: "New",
  ASSIGNED: "Assigned",
  UNDER_REVIEW: "Under Review",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    ""
  );
}

function getEntityName(item, type) {
  if (type === "PRODUCT") {
    return item.productName || item.name || item.title || item.sku || "Product";
  }

  return item.name || item.fullName || item.userName || item.mobile || "Unnamed";
}

function getEntityId(item) {
  return item._id || item.id || "";
}

function getEntityDetails(item, type) {
  if (type === "PAINTER") {
    return [item.mobile, item.city].filter(Boolean).join(" • ");
  }

  if (type === "DEALER") {
    return [item.mobile, item.email].filter(Boolean).join(" • ");
  }

  if (type === "PRODUCT") {
    return [item.productCode, item.category].filter(Boolean).join(" • ");
  }

  return "";
}

function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SalesExecutiveComplaint() {
  const [category, setCategory] = useState("PAINTER");
  const [priority, setPriority] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("");
  const [entities, setEntities] = useState([]);
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loadingEntities, setLoadingEntities] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isService = category === "SERVICE";

  useEffect(() => {
    setSelectedEntity("");
    setEntities([]);
    setError("");

    if (category !== "SERVICE") {
      fetchEntities(category);
    }
  }, [category]);

  async function fetchEntities(type) {
    setLoadingEntities(true);

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Please login again. Authentication token not found.");
      }

      /*
       * IMPORTANT:
       * Update these URLs if your project uses different list APIs.
       * Painter list must return PainterProfile documents with _id.
       */
      const endpoints = {
        PAINTER: `${API_BASE_URL}/api/sales-executive/painters`,
        DEALER: `${API_BASE_URL}/api/users`,
        PRODUCT: `${API_BASE_URL}/api/products`,
      };

      const response = await fetch(endpoints[type], {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Unable to fetch ${type.toLowerCase()} list.`);
      }

      const list = Array.isArray(data)
        ? data
        : data.painters ||
          data.painterProfiles ||
          data.dealers ||
          data.products ||
          data.users ||
          data.data ||
          [];

      const filteredList =
        type === "DEALER"
          ? list.filter((item) => item.role === "DEALER")
          : list;

      setEntities(filteredList);
    } catch (err) {
      setEntities([]);
      setError(err.message || "Unable to load the list.");
    } finally {
      setLoadingEntities(false);
    }
  }

  async function fetchComplaintHistory() {
    setLoadingHistory(true);
    setError("");

    try {
      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/api/sales-executive/complaints`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load complaint history.");
      }

      setComplaints(data.complaints || []);
    } catch (err) {
      setError(err.message || "Unable to load complaint history.");
    } finally {
      setLoadingHistory(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!isService && !selectedEntity) {
      setError(`Please select a ${category.toLowerCase()}.`);
      return;
    }

    if (!description.trim()) {
      setError("Please enter the complaint description.");
      return;
    }

    if (images.length > 10 || documents.length > 10) {
      setError("You can upload a maximum of 10 images and 10 documents.");
      return;
    }

    const formData = new FormData();

    formData.append("complaintType", category);
    formData.append("priority", priority);
    formData.append("description", description.trim());

    if (category === "PAINTER") {
      formData.append("painter", selectedEntity);
    }

    if (category === "DEALER") {
      formData.append("dealer", selectedEntity);
    }

    if (category === "PRODUCT") {
      formData.append("product", selectedEntity);
    }

    images.forEach((file) => formData.append("images", file));
    documents.forEach((file) => formData.append("documents", file));

    setSubmitting(true);

    try {
      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/api/sales-executive/complaints`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit complaint.");
      }

      setSuccess(data.message || "Complaint submitted successfully.");
      setDescription("");
      setPriority("MEDIUM");
      setSelectedEntity("");
      setImages([]);
      setDocuments([]);

      const imageInput = document.getElementById("complaint-images");
      const documentInput = document.getElementById("complaint-documents");

      if (imageInput) imageInput.value = "";
      if (documentInput) documentInput.value = "";

      if (showHistory) {
        await fetchComplaintHistory();
      }
    } catch (err) {
      setError(err.message || "Failed to submit complaint.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleFiles(event, type) {
    const selectedFiles = Array.from(event.target.files || []);
    const maxSize = 10 * 1024 * 1024;

    const invalidFile = selectedFiles.find((file) => file.size > maxSize);

    if (invalidFile) {
      setError(`${invalidFile.name} exceeds the 10 MB file limit.`);
      event.target.value = "";
      return;
    }

    if (type === "images") {
      if (selectedFiles.some((file) => !file.type.startsWith("image/"))) {
        setError("Please select image files only.");
        event.target.value = "";
        return;
      }

      setImages((previous) => {
        const combined = [...previous, ...selectedFiles];

        if (combined.length > 10) {
          setError("You can upload a maximum of 10 images.");
          return previous;
        }

        return combined;
      });
    } else {
      setDocuments((previous) => {
        const combined = [...previous, ...selectedFiles];

        if (combined.length > 10) {
          setError("You can upload a maximum of 10 documents.");
          return previous;
        }

        return combined;
      });
    }

    setError("");
    event.target.value = "";
  }

  function removeFile(type, index) {
    if (type === "images") {
      setImages((previous) => previous.filter((_, i) => i !== index));
    } else {
      setDocuments((previous) => previous.filter((_, i) => i !== index));
    }
  }

  async function openHistory() {
    setShowHistory(true);
    await fetchComplaintHistory();
  }

  function openForm() {
    setShowHistory(false);
    setError("");
    setSuccess("");
  }

  return (
    <div className="se-complaint-page">
      <div className="se-complaint-header">
        <div>
          <h1>Complaint Management</h1>
          <p>Submit and track your complaints from one place.</p>
        </div>

        <button
          type="button"
          className={`se-complaint-history-btn ${showHistory ? "active" : ""}`}
          onClick={showHistory ? openForm : openHistory}
        >
          {showHistory ? <ArrowLeft size={18} /> : <History size={18} />}
          {showHistory ? "Back to Complaint" : "Complaint History"}
        </button>
      </div>

      {error && (
        <div className="se-complaint-alert error" role="alert">
          <AlertCircle size={19} />
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
            <X size={17} />
          </button>
        </div>
      )}

      {success && !showHistory && (
        <div className="se-complaint-alert success" role="status">
          <CheckCircle2 size={19} />
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess("")} aria-label="Dismiss success">
            <X size={17} />
          </button>
        </div>
      )}

      {showHistory ? (
        <section className="se-complaint-card">
          <div className="se-complaint-card-heading">
            <div className="se-complaint-heading-icon">
              <History size={20} />
            </div>
            <div>
              <h2>Complaint History</h2>
              <p>Track the status of your submitted complaints.</p>
            </div>
            <button
              type="button"
              className="se-complaint-refresh-btn"
              onClick={fetchComplaintHistory}
              disabled={loadingHistory}
            >
              {loadingHistory ? (
                <LoaderCircle className="se-complaint-spinner" size={17} />
              ) : (
                "Refresh"
              )}
            </button>
          </div>

          {loadingHistory ? (
            <div className="se-complaint-loading">
              <LoaderCircle className="se-complaint-spinner" size={28} />
              <span>Loading complaints...</span>
            </div>
          ) : complaints.length === 0 ? (
            <div className="se-complaint-empty">
              <MessageSquare size={34} />
              <h3>No complaints found</h3>
              <p>Your submitted complaints will appear here.</p>
              <button type="button" onClick={openForm}>
                Submit Complaint
              </button>
            </div>
          ) : (
            <div className="se-complaint-table-wrapper">
              <table className="se-complaint-table">
                <thead>
                  <tr>
                    <th>Complaint ID</th>
                    <th>Category</th>
                    <th>Related To</th>
                    <th>Priority</th>
                    <th>Description</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Submitted On</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((complaint) => {
                    const type = complaint.complaintType;
                    const entity =
                      type === "PAINTER"
                        ? complaint.painter
                        : type === "DEALER"
                          ? complaint.dealer
                          : type === "PRODUCT"
                            ? complaint.product
                            : null;

                    return (
                      <tr key={complaint._id}>
                        <td className="se-complaint-id">
                          {complaint.complaintId || "—"}
                        </td>
                        <td>
                          {CATEGORIES.find((item) => item.value === type)?.label ||
                            type}
                        </td>
                        <td>{entity ? getEntityName(entity, type) : type === "SERVICE" ? "Service" : "—"}</td>
                        <td>
                          <span className={`se-complaint-priority ${String(complaint.priority || "MEDIUM").toLowerCase()}`}>
                            {complaint.priority || "MEDIUM"}
                          </span>
                        </td>
                        <td className="se-complaint-description-cell">
                          {complaint.description || "—"}
                        </td>
                        <td>{complaint.assignedDepartment || "Not assigned"}</td>
                        <td>
                          <span className={`se-complaint-status ${String(complaint.status || "NEW").toLowerCase().replaceAll("_", "-")}`}>
                            {STATUS_LABELS[complaint.status] || complaint.status || "New"}
                          </span>
                        </td>
                        <td>{formatDate(complaint.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : (
        <form className="se-complaint-form" onSubmit={handleSubmit}>
          <section className="se-complaint-card">
            <div className="se-complaint-card-heading">
              <div className="se-complaint-heading-icon">
                <MessageSquare size={20} />
              </div>
              <div>
                <h2>Create New Complaint</h2>
                <p>Select a category and provide the complaint details.</p>
              </div>
            </div>

            <div className="se-complaint-field">
              <label className="se-complaint-label">
                Complaint Category <span>*</span>
              </label>

              <div className="se-complaint-category-grid">
                {CATEGORIES.map((item) => {
                  const Icon = item.icon;
                  const active = category === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      className={`se-complaint-category ${active ? "active" : ""}`}
                      onClick={() => setCategory(item.value)}
                    >
                      <span className="se-complaint-category-icon">
                        <Icon size={22} />
                      </span>
                      <span>{item.label}</span>
                      <span className="se-complaint-category-check">
                        {active && <CheckCircle2 size={17} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {!isService && (
              <div className="se-complaint-field">
                <label className="se-complaint-label" htmlFor="complaint-entity">
                  Select {category === "PRODUCT" ? "Product" : category.charAt(0) + category.slice(1).toLowerCase()}
                  <span>*</span>
                </label>

                {loadingEntities ? (
                  <div className="se-complaint-inline-loading">
                    <LoaderCircle className="se-complaint-spinner" size={19} />
                    Loading {category.toLowerCase()} list...
                  </div>
                ) : (
                  <>
                    <select
                      id="complaint-entity"
                      className="se-complaint-select"
                      value={selectedEntity}
                      onChange={(event) => setSelectedEntity(event.target.value)}
                      required
                    >
                      <option value="">Select {category.toLowerCase()}</option>
                      {entities.map((item) => (
                        <option key={getEntityId(item)} value={getEntityId(item)}>
                          {getEntityName(item, category)}
                          {getEntityDetails(item, category)
                            ? ` — ${getEntityDetails(item, category)}`
                            : ""}
                        </option>
                      ))}
                    </select>

                    {!entities.length && (
                      <p className="se-complaint-field-help">
                        No records found. Verify the list API endpoint and response format.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </section>

          <section className="se-complaint-card">
            <div className="se-complaint-card-heading">
              <div className="se-complaint-heading-icon">
                <AlertCircle size={20} />
              </div>
              <div>
                <h2>Complaint Details</h2>
                <p>Describe the issue and choose its priority.</p>
              </div>
            </div>

            <div className="se-complaint-field">
              <label className="se-complaint-label">
                Priority <span>*</span>
              </label>

              <div className="se-complaint-priority-grid">
                {PRIORITIES.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={`se-complaint-priority-option ${item.toLowerCase()} ${priority === item ? "active" : ""}`}
                    onClick={() => setPriority(item)}
                  >
                    <span className="se-complaint-priority-dot" />
                    {item.charAt(0) + item.slice(1).toLowerCase()}
                    {priority === item && <CheckCircle2 size={17} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="se-complaint-field">
              <label className="se-complaint-label" htmlFor="complaint-description">
                Description <span>*</span>
              </label>
              <textarea
                id="complaint-description"
                className="se-complaint-textarea"
                rows={5}
                placeholder="Explain the complaint in detail..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={3000}
                required
              />
              <div className="se-complaint-character-count">
                {description.length}/3000 characters
              </div>
            </div>
          </section>

          <section className="se-complaint-card">
            <div className="se-complaint-card-heading">
              <div className="se-complaint-heading-icon">
                <FileText size={20} />
              </div>
              <div>
                <h2>Attachments</h2>
                <p>Attach supporting images and documents if needed.</p>
              </div>
            </div>

            <div className="se-complaint-upload-grid">
              <div className="se-complaint-upload-box">
                <label htmlFor="complaint-images" className="se-complaint-upload-label">
                  <ImagePlus size={25} />
                  <strong>Upload Images</strong>
                  <span>JPG, PNG, WEBP · Max 10 MB each</span>
                  <span className="se-complaint-browse">Browse Images</span>
                </label>
                <input
                  id="complaint-images"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(event) => handleFiles(event, "images")}
                />

                {images.length > 0 && (
                  <div className="se-complaint-file-list">
                    {images.map((file, index) => (
                      <div className="se-complaint-file-item" key={`${file.name}-${index}`}>
                        <ImagePlus size={16} />
                        <span title={file.name}>{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile("images", index)}
                          aria-label={`Remove ${file.name}`}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="se-complaint-upload-box">
                <label htmlFor="complaint-documents" className="se-complaint-upload-label">
                  <FileText size={25} />
                  <strong>Upload Documents</strong>
                  <span>PDF, DOC, DOCX and supported files · Max 10 MB each</span>
                  <span className="se-complaint-browse">Browse Documents</span>
                </label>
                <input
                  id="complaint-documents"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.mp3,.wav,.mp4,.mov,.avi"
                  multiple
                  onChange={(event) => handleFiles(event, "documents")}
                />

                {documents.length > 0 && (
                  <div className="se-complaint-file-list">
                    {documents.map((file, index) => (
                      <div className="se-complaint-file-item" key={`${file.name}-${index}`}>
                        <FileText size={16} />
                        <span title={file.name}>{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile("documents", index)}
                          aria-label={`Remove ${file.name}`}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="se-complaint-form-footer">
            <p>
              <Clock size={16} />
              Your complaint will be sent to the Admin for review.
            </p>

            <button
              type="submit"
              className="se-complaint-submit-btn"
              disabled={submitting || (!isService && loadingEntities)}
            >
              {submitting ? (
                <>
                  <LoaderCircle className="se-complaint-spinner" size={18} />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Complaint
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
