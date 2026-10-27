import { useEffect, useState } from "react";
import {
  Users,
  Store,
  Palette,
  UserRound,
  FolderOpen,
  SlidersHorizontal,
  Search,
  RefreshCw,
  FileDown,
  Pencil,
  Trash2,
  X,
  Save,
  Eye,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import "../../css/superadmin/Directory.css";

const API_URL = "https://oneplussparkpaintsserver.onrender.com/api/contacts";

const Directory = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [city, setCity] = useState("All Cities");
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [status, setStatus] = useState("All Status");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewContact, setViewContact] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    city: "",
    category: "",
    keywords: "",
    status: "ACTIVE",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // ==========================================
  // FETCH CONTACTS
  // ==========================================

  const fetchContacts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (category !== "All Categories") {
        params.append("category", category);
      }

      if (city !== "All Cities") {
        params.append("city", city);
      }

      if (status !== "All Status") {
        params.append("status", status);
      }

      params.append("sortBy", sortBy);
      params.append("order", order);

      const token = getToken();

      const response = await fetch(
        `${API_URL}?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setContacts(data.contacts || []);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Fetch contacts error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [search, category, city, status, sortBy, order]);

  // ==========================================
  // FORM HANDLER
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // OPEN ADD FORM
  // ==========================================

  const handleAddContact = () => {
    setEditingId(null);

    setFormData({
      name: "",
      mobile: "",
      city: "",
      category: "",
      keywords: "",
      status: "ACTIVE",
    });

    setShowModal(true);
  };

  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  const handleView = (contact) => {
    setViewContact(contact);
    setShowViewModal(true);
  };

  const handleEdit = (contact) => {
    setEditingId(contact._id);

    setFormData({
      name: contact.name || "",
      mobile: contact.mobile || "",
      city: contact.city || "",
      category: contact.category || "",
      keywords: Array.isArray(contact.keywords)
        ? contact.keywords.join(", ")
        : "",
      status: contact.status || "ACTIVE",
    });

    setShowModal(true);
  };

  // ==========================================
  // SAVE / UPDATE CONTACT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.mobile.trim() ||
      !formData.category
    ) {
      alert("Name, mobile number and category are required");
      return;
    }

    try {
      const token = getToken();

      const payload = {
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        city: formData.city.trim(),
        category: formData.category,
        keywords: formData.keywords
          .split(",")
          .map((keyword) => keyword.trim())
          .filter(Boolean),
        status: formData.status,
      };

      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Something went wrong");
        return;
      }

      alert(
        editingId
          ? "Contact updated successfully"
          : "Contact created successfully"
      );

      setShowModal(false);
      setEditingId(null);

      setFormData({
        name: "",
        mobile: "",
        city: "",
        category: "",
        keywords: "",
        status: "ACTIVE",
      });

      fetchContacts();
    } catch (error) {
      console.error("Save contact error:", error);
      alert("Unable to save contact");
    }
  };

  // ==========================================
  // DELETE CONTACT
  // ==========================================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this contact?"
    );

    if (!confirmDelete) return;

    try {
      const token = getToken();

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Failed to delete contact");
        return;
      }

      alert("Contact deleted successfully");

      fetchContacts();
    } catch (error) {
      console.error("Delete contact error:", error);
      alert("Unable to delete contact");
    }
  };

  // ==========================================
  // RESET FILTERS
  // ==========================================

  const handleReset = () => {
    setSearch("");
    setCategory("All Categories");
    setCity("All Cities");
    setSortBy("name");
    setOrder("asc");
    setStatus("All Status");
    setCurrentPage(1);
  };

  // ==========================================
  // UNIQUE CITIES
  // ==========================================

  const cities = [
    ...new Set(
      contacts
        .map((contact) => contact.city)
        .filter(Boolean)
    ),
  ];

  // ==========================================
  // STATISTICS
  // ==========================================

  const totalContacts = contacts.length;

  const dealerCount = contacts.filter(
    (contact) =>
      contact.category?.toLowerCase() === "dealer"
  ).length;

  const painterCount = contacts.filter(
    (contact) =>
      contact.category?.toLowerCase() === "painter"
  ).length;

  const employeeCount = contacts.filter(
    (contact) =>
      contact.category?.toLowerCase() === "employee"
  ).length;

  const othersCount = contacts.filter(
    (contact) =>
      !["dealer", "painter", "employee"].includes(
        contact.category?.toLowerCase()
      )
  ).length;

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages = Math.ceil(
    contacts.length / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const paginatedContacts = contacts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="directory-page">

      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="directory-header">

        <div>
          <h1>Directory</h1>

          <p>
            All contacts organized by categories.
            You can search, filter and sort to find
            contacts easily.
          </p>

          <div className="directory-breadcrumb">
            Dashboard <span>›</span> Directory
          </div>
        </div>

        <button
          className="add-contact-btn"
          onClick={handleAddContact}
        >
          <Plus size={18} /> Add New Contact
        </button>

      </div>

      {/* ======================================
          STATISTICS
      ====================================== */}

      <div className="directory-stats">

        <div className="directory-stat-card">
          <div className="stat-icon"><Users size={22} /></div>
          <div>
            <span>Total Contacts</span>
            <strong>{totalContacts}</strong>
            <small>All Categories</small>
          </div>
        </div>

        <div className="directory-stat-card">
          <div className="stat-icon"><Store size={22} /></div>
          <div>
            <span>Dealers</span>
            <strong>{dealerCount}</strong>
            <small>Dealers</small>
          </div>
        </div>

        <div className="directory-stat-card">
          <div className="stat-icon"><Palette size={22} /></div>
          <div>
            <span>Painters</span>
            <strong>{painterCount}</strong>
            <small>Painters</small>
          </div>
        </div>

        <div className="directory-stat-card">
          <div className="stat-icon"><UserRound size={22} /></div>
          <div>
            <span>Employees</span>
            <strong>{employeeCount}</strong>
            <small>Employees</small>
          </div>
        </div>

        <div className="directory-stat-card">
          <div className="stat-icon"><FolderOpen size={22} /></div>
          <div>
            <span>Others / Custom</span>
            <strong>{othersCount}</strong>
            <small>Other Categories</small>
          </div>
        </div>

      </div>

      {/* ======================================
          FILTERS
      ====================================== */}

      <div className="directory-filter-card">

        <div className="filter-title">
          <SlidersHorizontal size={19} />
          <h2>Filters</h2>
        </div>

        <div className="directory-filters">

          <div className="directory-filter-group search-group">
            <label>Search</label>

            <input
              type="text"
              placeholder="Search by name, mobile number, city, category or keywords..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="directory-filter-group">
            <label>Category</label>

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option>All Categories</option>
              <option>Dealer</option>
              <option>Painter</option>
              <option>Employee</option>
              <option>Others</option>
            </select>
          </div>

          <div className="directory-filter-group">
            <label>City</label>

            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option>All Cities</option>

              {cities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="directory-filter-group">
            <label>Sort By</label>

            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [field, direction] =
                  e.target.value.split("-");

                setSortBy(field);
                setOrder(direction);
              }}
            >
              <option value="name-asc">
                Name (A → Z)
              </option>

              <option value="name-desc">
                Name (Z → A)
              </option>

              <option value="mobile-asc">
                Mobile Number
              </option>

              <option value="city-asc">
                City
              </option>

              <option value="category-asc">
                Category
              </option>
            </select>
          </div>

          <div className="directory-filter-group">
            <label>Status</label>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option>All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <button
            className="reset-filter-btn"
            onClick={handleReset}
          >
            <RefreshCw size={16} /> Reset
          </button>

        </div>

        <div className="active-filters">
          <span>Active Filters:</span>

          <span className="filter-tag">
            Category: {category}
          </span>

          <span className="filter-tag">
            City: {city}
          </span>

          <span className="filter-tag">
            Status: {status}
          </span>
        </div>

      </div>

      {/* ======================================
          CONTACT TABLE
      ====================================== */}

      <div className="directory-table-card">

        <div className="directory-table-header">

          <h2>
            Contact List ({contacts.length})
          </h2>

          <button className="export-btn">
            <FileDown size={17} /> Export
          </button>

        </div>

        <div className="directory-table-wrapper">

          <table className="directory-table">

            <thead>
              <tr>
                <th>
                  <input type="checkbox" />
                </th>

                <th>Name</th>
                <th>Mobile Number</th>
                <th>City</th>
                <th>Category</th>
                <th>Keywords</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td colSpan="8">
                    Loading contacts...
                  </td>
                </tr>
              ) : paginatedContacts.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    No contacts found
                  </td>
                </tr>
              ) : (
                paginatedContacts.map((contact) => (
                  <tr key={contact._id}>

                    <td>
                      <input type="checkbox" />
                    </td>

                    <td>
                      <div className="contact-name">
                        <div className="contact-avatar">
                          {contact.name
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </div>

                        <span>{contact.name}</span>
                      </div>
                    </td>

                    <td>
                      {contact.mobile}
                    </td>

                    <td>
                      {contact.city || "-"}
                    </td>

                    <td>
                      <span
                        className={`category-badge category-${contact.category
                          ?.toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {contact.category}
                      </span>
                    </td>

                    <td>
                      <div className="keyword-list">
                        {contact.keywords?.map(
                          (keyword, index) => (
                            <span key={index}>
                              {keyword}
                              {index <
                                contact.keywords.length - 1
                                ? ", "
                                : ""}
                            </span>
                          )
                        )}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${contact.status === "ACTIVE"
                          ? "status-active"
                          : "status-inactive"
                          }`}
                      >
                        {contact.status === "ACTIVE"
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <div className="contact-actions">

                        <button
                          onClick={() =>
                            handleView(contact)
                          }
                          title="View"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() =>
                            handleEdit(contact)
                          }
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(contact._id)
                          }
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

        {/* ====================================
            PAGINATION
        ==================================== */}

        <div className="directory-pagination">

          <span>
            Showing{" "}
            {contacts.length === 0
              ? 0
              : startIndex + 1}{" "}
            to{" "}
            {Math.min(
              startIndex + itemsPerPage,
              contacts.length
            )}{" "}
            of {contacts.length} entries
          </span>

          <div className="pagination-controlsd">

            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.max(prev - 1, 1)
                )
              }
              aria-label="Previous page"
            >
              <ChevronLeft size={17} />
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            )
              .slice(0, 5)
              .map((page) => (
                <button
                  key={page}
                  className={
                    currentPage === page
                      ? "active-page"
                      : ""
                  }
                  onClick={() =>
                    setCurrentPage(page)
                  }
                >
                  {page}
                </button>
              ))}

            <button
              disabled={
                currentPage === totalPages ||
                totalPages === 0
              }
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, totalPages)
                )
              }
              aria-label="Next page"
            >
              <ChevronRight size={17} />
            </button>

          </div>

        </div>

      </div>

      {/* ======================================
          VIEW CONTACT MODAL
      ====================================== */}

      {showViewModal && viewContact && (
        <div
          className="directory-modal-overlay"
          onClick={() => setShowViewModal(false)}
        >
          <div
            className="directory-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="directory-modal-header">
              <div>
                <h2>Contact Details</h2>
                <p>Contact information</p>
              </div>
            </div>

            <div className="contact-form">
              <div className="form-field">
                <label>Name</label>
                <input type="text" value={viewContact.name || ""} readOnly />
              </div>

              <div className="form-field">
                <label>Mobile Number</label>
                <input type="text" value={viewContact.mobile || ""} readOnly />
              </div>

              <div className="form-field">
                <label>City</label>
                <input type="text" value={viewContact.city || ""} readOnly />
              </div>

              <div className="form-field">
                <label>Category</label>
                <input type="text" value={viewContact.category || ""} readOnly />
              </div>

              <div className="form-field">
                <label>Keywords</label>
                <input
                  type="text"
                  value={
                    Array.isArray(viewContact.keywords)
                      ? viewContact.keywords.join(", ")
                      : ""
                  }
                  readOnly
                />
              </div>

              <div className="form-field">
                <label>Status</label>
                <input
                  type="text"
                  value={
                    viewContact.status === "ACTIVE"
                      ? "Active"
                      : "Inactive"
                  }
                  readOnly
                />
              </div>

              <div className="contact-form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowViewModal(false)}
                >

                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================
          ADD / EDIT CONTACT MODAL
      ====================================== */}

      {showModal && (
        <div
          className="directory-modal-overlay"
          onClick={() => setShowModal(false)}
        >

          <div
            className="directory-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="directory-modal-header">

              <div>
                <h2>
                  {editingId
                    ? "Edit Contact"
                    : "Add New Contact"}
                </h2>

                <p>
                  Enter contact details below
                </p>
              </div>

              <button
                className="modal-close-btn"
                onClick={() =>
                  setShowModal(false)
                }
                aria-label="Close"
              >
                <X size={20} />
              </button>

            </div>

            <form
              className="contact-form"
              onSubmit={handleSubmit}
            >

              <div className="form-field">
                <label>
                  Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={(e) => /^[A-Za-z\s]*$/.test(e.target.value) && handleChange(e)}
                  required
                />

              </div>

              <div className="form-field">
                <label>
                  Mobile Number <span>*</span>
                </label>

                <input
                  type="text"
                  name="mobile"
                  placeholder="Enter mobile number"
                  value={formData.mobile}
                  onChange={(e) => /^\d{0,10}$/.test(e.target.value) && handleChange(e)}
                  required
                />

              </div>

              <div className="form-field">
                <label>City</label>

                <input
                  type="text"
                  name="city"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={(e) => /^[A-Za-z\s]*$/.test(e.target.value) && handleChange(e)}
                />

              </div>

              <div className="form-field">

                <label>
                  Category <span>*</span>
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select category
                  </option>

                  <option value="Dealer">
                    Dealer
                  </option>

                  <option value="Painter">
                    Painter
                  </option>

                  <option value="Employee">
                    Employee
                  </option>

                  <option value="Others">
                    Others / Custom
                  </option>
                </select>

              </div>

              <div className="form-field">

                <label>Keywords</label>

                <input
                  type="text"
                  name="keywords"
                  placeholder="Enter keywords separated by comma"
                  value={formData.keywords}
                  onChange={handleChange}
                />

              </div>

              <div className="form-field">

                <label>Status</label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="ACTIVE">
                    Active
                  </option>

                  <option value="INACTIVE">
                    Inactive
                  </option>
                </select>

              </div>

              <div className="contact-form-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-contact-btn"
                >
                  <Save size={16} />
                  {editingId
                    ? "Update Contact"
                    : "Save Contact"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default Directory;