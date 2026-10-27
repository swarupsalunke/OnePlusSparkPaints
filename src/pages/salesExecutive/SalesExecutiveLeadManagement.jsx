
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  Users,
  IndianRupee,
  MapPin,
  Phone,
  RefreshCw,
} from "lucide-react";
import "../../css/salesExecutive/SalesExecutiveLeadManagement.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://oneplussparkpaintsserver.onrender.com";
const API_URL = `${API_BASE_URL}/api/sales-executive/leads`;

const INITIAL_FORM = {
  customerName: "",
  contactDetails: "",
  businessType: "",
  address: "",
  city: "",
  state: "",
  pinCode: "",
  productInterest: "",
  estimatedBusiness: "",
  source: "",
  remarks: "",
  status: "New",
};

const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Shared",
  "Converted",
  "Lost",
  "Hold",
];

const getToken = () => localStorage.getItem("token");

const SalesExecutiveLeadManagement = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [editingLeadId, setEditingLeadId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const requestHeaders = () => ({
    "Content-Type": "application/json",
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  });

  const PRODUCT_API_URL = `${API_BASE_URL}/api/products`;

  const fetchProducts = async () => {
    setProductsLoading(true);

    try {
      const response = await fetch(PRODUCT_API_URL, {
        headers: requestHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load products");
      }

      setProducts(data.products || []);
    } catch (error) {
      toast.error(error.message || "Failed to load products");
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchLeads = async () => {
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        headers: requestHeaders(),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to fetch leads");
      }

      setLeads(data.leads || []);
    } catch (error) {
      toast.error(error.message || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchProducts();

  }, []);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const openAddForm = () => {
    setEditingLeadId(null);
    setForm({ ...INITIAL_FORM });
    setShowForm(true);
  };

  const openEditForm = (lead) => {
    setEditingLeadId(lead._id);
    setForm({
      customerName: lead.customerName || "",
      contactDetails: lead.contactDetails || "",
      businessType: lead.businessType || "",
      address: lead.address || "",
      productInterest: lead.productInterest || "",
      estimatedBusiness: String(lead.estimatedBusiness ?? ""),
      source: lead.source || "",
      remarks: lead.remarks || "",
      status: lead.status || "New",
      city: lead.city || "",
      state: lead.state || "",
      pinCode: lead.pinCode || "",
    });
    setShowDetails(false);
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditingLeadId(null);
    setForm({ ...INITIAL_FORM });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    setSaving(true);

    try {
      const payload = {
        ...form,
        estimatedBusiness: Number(form.estimatedBusiness),
      };

      const response = await fetch(
        editingLeadId ? `${API_URL}/${editingLeadId}` : API_URL,
        {
          method: editingLeadId ? "PUT" : "POST",
          headers: requestHeaders(),
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save lead");
      }

      toast.success(
        editingLeadId
          ? "Lead updated successfully"
          : "Lead added successfully"
      );

      setShowForm(false);
      setEditingLeadId(null);
      setForm({ ...INITIAL_FORM });
      await fetchLeads();
    } catch (error) {
      toast.error(error.message || "Failed to save lead");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (lead, newStatus) => {
    if (lead.status === newStatus) return;

    try {
      const response = await fetch(`${API_URL}/${lead._id}`, {
        method: "PUT",
        headers: requestHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update status");
      }

      setLeads((previous) =>
        previous.map((item) =>
          item._id === lead._id ? data.lead : item
        )
      );

      if (selectedLead?._id === lead._id) {
        setSelectedLead(data.lead);
      }

      toast.success("Lead status updated");
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleDelete = async (lead) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the lead for ${lead.customerName}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${lead._id}`, {
        method: "DELETE",
        headers: requestHeaders(),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete lead");
      }

      setLeads((previous) =>
        previous.filter((item) => item._id !== lead._id)
      );

      if (selectedLead?._id === lead._id) {
        setSelectedLead(null);
        setShowDetails(false);
      }

      toast.success("Lead deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete lead");
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      !searchText ||
      [
        lead.customerName,
        lead.contactDetails,
        lead.businessType,
        lead.address,
        lead.productInterest,
        lead.source,
      ].some((value) =>
        String(value || "").toLowerCase().includes(searchText)
      );

    const matchesStatus =
      statusFilter === "All" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatAmount = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      : "—";

  const getStatusClass = (status) =>
    `se-lead-status se-lead-status-${String(status || "New")
      .toLowerCase()
      .replace(/\s+/g, "-")}`;

  return (
    <div className="se-lead-page">
      <div className="se-lead-header">
        <div>
          <h1>Lead Management</h1>
          <p>Manage your customer leads and follow-ups.</p>
        </div>

        <button className="se-lead-primary-btn" onClick={openAddForm}>
          <Plus size={18} />
          <span>Add Lead</span>
        </button>
      </div>

      <div className="se-lead-stats">
        <div className="se-lead-stat-card">
          <div className="se-lead-stat-icon se-lead-icon-blue">
            <Users size={21} />
          </div>
          <div>
            <span>Total Leads</span>
            <strong>{leads.length}</strong>
          </div>
        </div>

        <div className="se-lead-stat-card">
          <div className="se-lead-stat-icon se-lead-icon-green">
            <Users size={21} />
          </div>
          <div>
            <span>Qualified Leads</span>
            <strong>
              {leads.filter((lead) => lead.status === "Qualified").length}
            </strong>
          </div>
        </div>

        <div className="se-lead-stat-card">
          <div className="se-lead-stat-icon se-lead-icon-purple">
            <IndianRupee size={21} />
          </div>
          <div>
            <span>Estimated Business</span>
            <strong>
              {formatAmount(
                leads.reduce(
                  (total, lead) =>
                    total + Number(lead.estimatedBusiness || 0),
                  0
                )
              )}
            </strong>
          </div>
        </div>
      </div>

      <div className="se-lead-list-card">
        <div className="se-lead-list-heading">
          <div>
            <h2>All Leads</h2>
            <p>{filteredLeads.length} lead(s) found</p>
          </div>

          <button
            className="se-lead-refresh-btn"
            onClick={fetchLeads}
            disabled={loading}
            title="Refresh leads"
          >
            <RefreshCw size={17} className={loading ? "se-lead-spinning" : ""} />
          </button>
        </div>

        <div className="se-lead-filters">
          <div className="se-lead-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search customer, phone, product..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="se-lead-filter-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter leads by status"
          >
            <option value="All">All Statuses</option>
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="se-lead-message">Loading leads...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="se-lead-empty">
            <Users size={36} />
            <h3>No leads found</h3>
            <p>
              {leads.length === 0
                ? "Add your first lead to get started."
                : "Try changing your search or status filter."}
            </p>
            {leads.length === 0 && (
              <button className="se-lead-primary-btn" onClick={openAddForm}>
                <Plus size={18} />
                Add Lead
              </button>
            )}
          </div>
        ) : (
          <div className="se-lead-table-wrap">
            <table className="se-lead-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Product Interest</th>
                  <th>Estimated Business</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead._id}>
                    <td>
                      <div className="se-lead-customer-cell">
                        <strong>{lead.customerName}</strong>
                        <span>{lead.businessType}</span>
                      </div>
                    </td>
                    <td>{lead.contactDetails}</td>
                    <td>{lead.productInterest}</td>
                    <td className="se-lead-amount">
                      {formatAmount(lead.estimatedBusiness)}
                    </td>
                    <td>
                      <select
                        className={getStatusClass(lead.status)}
                        value={lead.status}
                        onChange={(event) =>
                          handleStatusChange(lead, event.target.value)
                        }
                        aria-label={`Status for ${lead.customerName}`}
                      >
                        {LEAD_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{formatDate(lead.createdAt)}</td>
                    <td>
                      <div className="se-lead-actions">
                        <button
                          className="se-lead-action-btn"
                          title="View details"
                          aria-label="View lead details"
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowDetails(true);
                          }}
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          className="se-lead-action-btn"
                          title="Edit lead"
                          aria-label="Edit lead"
                          onClick={() => openEditForm(lead)}
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          className="se-lead-action-btn se-lead-delete-btn"
                          title="Delete lead"
                          aria-label="Delete lead"
                          onClick={() => handleDelete(lead)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredLeads.length > 0 && (
          <div className="se-lead-mobile-list">
            {filteredLeads.map((lead) => (
              <div className="se-lead-mobile-card" key={lead._id}>
                <div className="se-lead-mobile-top">
                  <div>
                    <h3>{lead.customerName}</h3>
                    <span>{lead.businessType}</span>
                  </div>
                  <select
                    className={getStatusClass(lead.status)}
                    value={lead.status}
                    onChange={(event) =>
                      handleStatusChange(lead, event.target.value)
                    }
                    aria-label={`Status for ${lead.customerName}`}
                  >
                    {LEAD_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="se-lead-mobile-info">
                  <span>
                    <Phone size={15} />
                    {lead.contactDetails}
                  </span>
                  <span>
                    <MapPin size={15} />
                    {lead.address || "No address"}
                  </span>
                </div>

                <div className="se-lead-mobile-product">
                  <span>Product</span>
                  <strong>{lead.productInterest}</strong>
                </div>

                <div className="se-lead-mobile-bottom">
                  <div>
                    <span>Estimated Business</span>
                    <strong>{formatAmount(lead.estimatedBusiness)}</strong>
                  </div>
                  <div className="se-lead-actions">
                    <button
                      className="se-lead-action-btn"
                      aria-label="View lead details"
                      onClick={() => {
                        setSelectedLead(lead);
                        setShowDetails(true);
                      }}
                    >
                      <Eye size={17} />
                    </button>
                    <button
                      className="se-lead-action-btn"
                      aria-label="Edit lead"
                      onClick={() => openEditForm(lead)}
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      className="se-lead-action-btn se-lead-delete-btn"
                      aria-label="Delete lead"
                      onClick={() => handleDelete(lead)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div
          className="se-lead-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <div
            className="se-lead-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="se-lead-form-title"
          >
            <div className="se-lead-modal-header">
              <div>
                <h2 id="se-lead-form-title">
                  {editingLeadId ? "Edit Lead" : "Add New Lead"}
                </h2>
                <p>Enter the customer and business information.</p>
              </div>
              <button
                className="se-lead-close-btn"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close form"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="se-lead-form-grid">
                <label className="se-lead-field">
                  Customer Name *
                  <input
                    name="customerName"
                    value={form.customerName}
                    onChange={handleFormChange}
                    placeholder="Enter customer name"
                    required
                    maxLength={100}
                  />
                </label>

                <label className="se-lead-field">
                  Contact Details *
                  <input
                    name="contactDetails"
                    value={form.contactDetails}
                    onChange={handleFormChange}
                    placeholder="Enter contact number"
                    required
                    maxLength={30}
                  />
                </label>

                <label className="se-lead-field">
                  Business Type *
                  <select
                    name="businessType"
                    value={form.businessType}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select Business Type</option>
                    <option value="Dealer">Dealer</option>
                    <option value="Painter">Painter</option>
                    <option value="Channel Partner">Channel Partner</option>
                    <option value="End User">End User</option>
                  </select>
                </label>

                <label className="se-lead-field">
                  Product Interest *
                  <select
                    name="productInterest"
                    value={form.productInterest}
                    onChange={handleFormChange}
                    required
                    disabled={productsLoading}
                  >
                    <option value="">
                      {productsLoading ? "Loading products..." : "Select Product"}
                    </option>

                    {products.map((product) => (
                      <option
                        key={product._id}
                        value={product.productName}
                      >
                        {product.productName}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="se-lead-field se-lead-field-full">
                  Address *
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleFormChange}
                    placeholder="Enter street, building or area"
                    rows={2}
                    required
                    maxLength={500}
                  />
                </label>

                <label className="se-lead-field">
                  City
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleFormChange}
                    placeholder="Enter city"
                  />
                </label>

                <label className="se-lead-field">
                  State
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleFormChange}
                    placeholder="Enter state"
                  />
                </label>

                <label className="se-lead-field">
                  Pin Code
                  <input
                    name="pinCode"
                    value={form.pinCode}
                    onChange={handleFormChange}
                    placeholder="Enter pin code"
                    inputMode="numeric"
                    maxLength={6}
                  />
                </label>

                <label className="se-lead-field">
                  Estimated Business (₹) *
                  <input
                    type="number"
                    name="estimatedBusiness"
                    value={form.estimatedBusiness}
                    onChange={handleFormChange}
                    placeholder="Enter estimated amount"
                    min="0"
                    step="1"
                    required
                  />
                </label>

                <label className="se-lead-field">
                  Source *
                  <input
                    name="source"
                    value={form.source}
                    onChange={handleFormChange}
                    placeholder="e.g. Referral, Walk-in"
                    required
                    maxLength={100}
                  />
                </label>

                <label className="se-lead-field se-lead-field-full">
                  Remarks
                  <textarea
                    name="remarks"
                    value={form.remarks}
                    onChange={handleFormChange}
                    placeholder="Enter remarks"
                    rows={3}
                    maxLength={1000}
                  />
                </label>

                {editingLeadId && (
                  <label className="se-lead-field se-lead-field-full">
                    Lead Status
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleFormChange}
                    >
                      {LEAD_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              <div className="se-lead-form-footer">
                <button
                  type="button"
                  className="se-lead-secondary-btn"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="se-lead-primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingLeadId
                      ? "Update Lead"
                      : "Save Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetails && selectedLead && (
        <div
          className="se-lead-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowDetails(false);
            }
          }}
        >
          <div
            className="se-lead-modal se-lead-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="se-lead-details-title"
          >
            <div className="se-lead-modal-header">
              <div>
                <h2 id="se-lead-details-title">Lead Details</h2>
                <p>Customer and lead information.</p>
              </div>
              <button
                className="se-lead-close-btn"
                onClick={() => setShowDetails(false)}
                aria-label="Close details"
              >
                <X size={21} />
              </button>
            </div>

            <div className="se-lead-detail-status">
              <span className={getStatusClass(selectedLead.status)}>
                {selectedLead.status}
              </span>
              <span>Created {formatDate(selectedLead.createdAt)}</span>
            </div>

            <div className="se-lead-details-grid">
              <div>
                <span>Customer Name</span>
                <strong>{selectedLead.customerName}</strong>
              </div>
              <div>
                <span>Contact Details</span>
                <strong>{selectedLead.contactDetails}</strong>
              </div>
              <div>
                <span>Business Type</span>
                <strong>{selectedLead.businessType}</strong>
              </div>
              <div>
                <span>Product Interest</span>
                <strong>{selectedLead.productInterest}</strong>
              </div>
              <div>
                <span>Estimated Business</span>
                <strong>
                  {formatAmount(selectedLead.estimatedBusiness)}
                </strong>
              </div>
              <div>
                <span>Source</span>
                <strong>{selectedLead.source}</strong>
              </div>
              <div className="se-lead-detail-full">
                <span>Address</span>
                <strong>{selectedLead.address}</strong>
              </div>
              <div className="se-lead-detail-full">
                <span>Remarks</span>
                <strong>{selectedLead.remarks || "No remarks added"}</strong>
              </div>
            </div>

            <div className="se-lead-form-footer">
              <button
                className="se-lead-secondary-btn"
                onClick={() => setShowDetails(false)}
              >
                Close
              </button>
              <button
                className="se-lead-primary-btn"
                onClick={() => openEditForm(selectedLead)}
              >
                <Pencil size={16} />
                Edit Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesExecutiveLeadManagement;
