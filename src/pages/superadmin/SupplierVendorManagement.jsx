
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  PlusCircle,
  Package,
  Building2,
  Phone,
  MapPin,
  FileText,
} from "lucide-react";
import "../../css/superadmin/SupplierVendorManagement.css";

const API_BASE_URL = "https://oneplussparkpaintsserver.onrender.com/api";

const SupplierVendorManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    supplierCompanyName: "",
    contactPersonName: "",
    mobileNo: "",
    mobileNo2: "",
    gstNo: "",
    paymentTerms: "",
    address: "",
    pincode: "",
    state: "",
    items: [{ itemName: "", gstTax: "" }],
  };

  const [formData, setFormData] = useState(initialForm);

  const getToken = () => localStorage.getItem("token");

  const getHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  });

  // FETCH SUPPLIERS
  const fetchSuppliers = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_BASE_URL}/suppliers-vendors`,
        { headers: getHeaders() }
      );

      setSuppliers(response.data.suppliers || []);
    } catch (error) {
      console.error("Fetch Suppliers Error:", error);
      alert(
        error.response?.data?.message ||
        "Failed to fetch suppliers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ITEM CHANGE
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];

    updatedItems[index][field] = value;

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  // ADD ITEM
  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { itemName: "", gstTax: "" }],
    }));
  };

  // REMOVE ITEM
  const removeItem = (index) => {
    if (formData.items.length === 1) {
      alert("At least one item is required");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // OPEN ADD MODAL
  const handleAddSupplier = () => {
    setEditingId(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  // OPEN EDIT MODAL
  const handleEditSupplier = (supplier) => {
    setEditingId(supplier._id);

    setFormData({
      supplierCompanyName: supplier.supplierCompanyName || "",
      contactPersonName: supplier.contactPersonName || "",
      mobileNo: supplier.mobileNo || "",
      mobileNo2: supplier.mobileNo2 || "",
      gstNo: supplier.gstNo || "",
      paymentTerms: supplier.paymentTerms || "",
      address: supplier.address || "",
      pincode: supplier.pincode || "",
      state: supplier.state || "",
      items: supplier.items?.length
        ? supplier.items.map((item) => ({
            itemName: item.itemName,
            gstTax: item.gstTax,
          }))
        : [{ itemName: "", gstTax: "" }],
    });

    setShowModal(true);
  };

  // SAVE SUPPLIER
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      items: formData.items
        .filter((item) => item.itemName.trim() !== "")
        .map((item) => ({
          itemName: item.itemName.trim(),
          gstTax: Number(item.gstTax),
        })),
    };

    if (payload.items.some((item) => !Number.isFinite(item.gstTax))) {
      alert("Please enter a valid GST percentage for every item");
      return;
    }

    try {
      if (editingId) {
        await axios.put(
          `${API_BASE_URL}/suppliers-vendors/${editingId}`,
          payload,
          { headers: getHeaders() }
        );

        alert("Supplier updated successfully");
      } else {
        await axios.post(
          `${API_BASE_URL}/suppliers-vendors`,
          payload,
          { headers: getHeaders() }
        );

        alert("Supplier created successfully");
      }

      setShowModal(false);
      setFormData(initialForm);
      setEditingId(null);
      fetchSuppliers();
    } catch (error) {
      console.error("Save Supplier Error:", error);
      alert(
        error.response?.data?.message ||
        "Failed to save supplier"
      );
    }
  };

  // DELETE SUPPLIER
  const handleDeleteSupplier = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this supplier?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/suppliers-vendors/${id}`,
        { headers: getHeaders() }
      );

      alert("Supplier deleted successfully");
      fetchSuppliers();
    } catch (error) {
      console.error("Delete Supplier Error:", error);
      alert(
        error.response?.data?.message ||
        "Failed to delete supplier"
      );
    }
  };

  // VIEW DETAILS
  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailsModal(true);
  };

  // SEARCH
  const filteredSuppliers = suppliers.filter((supplier) => {
    const search = searchTerm.toLowerCase();

    return (
      supplier.supplierCompanyName?.toLowerCase().includes(search) ||
      supplier.contactPersonName?.toLowerCase().includes(search) ||
      supplier.mobileNo?.includes(search) ||
      supplier.gstNo?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="supplier-vendor-page">

      {/* HEADER */}
      <div className="supplier-page-header">
        <div>
          <h2>Supplier & Vendor Management</h2>
          <p>Manage supplier details, payment terms and GST items</p>
        </div>

        <button
          className="supplier-add-btn"
          onClick={handleAddSupplier}
        >
          <Plus size={18} />
          Add Supplier
        </button>
      </div>

      {/* SUMMARY */}
      <div className="supplier-summary-grid">
        <div className="supplier-summary-card">
          <div className="supplier-summary-icon">
            <Building2 size={22} />
          </div>
          <div>
            <span>Total Suppliers</span>
            <h3>{suppliers.length}</h3>
          </div>
        </div>

        <div className="supplier-summary-card">
          <div className="supplier-summary-icon">
            <Package size={22} />
          </div>
          <div>
            <span>Total Items</span>
            <h3>
              {suppliers.reduce(
                (total, supplier) =>
                  total + (supplier.items?.length || 0),
                0
              )}
            </h3>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="supplier-table-section">

        <div className="supplier-table-header">
          <h3>Supplier List</h3>

          <div className="supplier-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="supplier-table-wrapper">
          <table className="supplier-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Contact Person</th>
                <th>Mobile No.</th>
                <th>GST No.</th>
                <th>Payment Terms</th>
                <th>Items</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="supplier-empty">
                    Loading suppliers...
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="supplier-empty">
                    No suppliers found
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier._id}>
                    <td className="supplier-company-cell">
                      {supplier.supplierCompanyName}
                    </td>

                    <td>{supplier.contactPersonName}</td>

                    <td>{supplier.mobileNo}</td>

                    <td>{supplier.gstNo || "-"}</td>

                    <td>{supplier.paymentTerms}</td>

                    <td>
                      <span className="supplier-item-count">
                        {supplier.items?.length || 0} Items
                      </span>
                    </td>

                    <td>
                      <div className="supplier-action-buttons">
                        <button
                          title="View"
                          onClick={() => handleViewSupplier(supplier)}
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          title="Edit"
                          onClick={() => handleEditSupplier(supplier)}
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          title="Delete"
                          className="supplier-delete-action"
                          onClick={() =>
                            handleDeleteSupplier(supplier._id)
                          }
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="supplier-modal-overlay">
          <div className="supplier-modal">

            <div className="supplier-modal-header">
              <div>
                <h3>
                  {editingId ? "Edit Supplier" : "Add New Supplier"}
                </h3>
                <p>Enter supplier company and contact information</p>
              </div>

              <button
                type="button"
                className="supplier-close-btn"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="supplier-form-grid">

                <div className="supplier-form-group">
                  <label>Supplier Company Name *</label>
                  <input
                    type="text"
                    name="supplierCompanyName"
                    value={formData.supplierCompanyName}
                    onChange={handleChange}
                    placeholder="Enter company name"
                    required
                  />
                </div>

                <div className="supplier-form-group">
                  <label>Contact Person Name *</label>
                  <input
                    type="text"
                    name="contactPersonName"
                    value={formData.contactPersonName}
                    onChange={handleChange}
                    placeholder="Enter contact person"
                    required
                  />
                </div>

                <div className="supplier-form-group">
                  <label>Mobile No. *</label>
                  <input
                    type="tel"
                    name="mobileNo"
                    value={formData.mobileNo}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                    required
                  />
                </div>

                <div className="supplier-form-group">
                  <label>Mobile No. 2</label>
                  <input
                    type="tel"
                    name="mobileNo2"
                    value={formData.mobileNo2}
                    onChange={handleChange}
                    placeholder="Enter alternate mobile"
                  />
                </div>

                <div className="supplier-form-group">
                  <label>GST No.</label>
                  <input
                    type="text"
                    name="gstNo"
                    value={formData.gstNo}
                    onChange={handleChange}
                    placeholder="Enter GST number"
                  />
                </div>

                <div className="supplier-form-group">
                  <label>Payment Terms *</label>
                  <input
                    type="text"
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleChange}
                    placeholder="e.g. 30 Days"
                    required
                  />
                </div>

                <div className="supplier-form-group supplier-full-width">
                  <label>Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter complete address"
                    required
                    rows="2"
                  />
                </div>

                <div className="supplier-form-group">
                  <label>Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Enter pincode"
                    required
                  />
                </div>

                <div className="supplier-form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    required
                  />
                </div>

              </div>

              {/* ITEMS */}
              <div className="supplier-items-section">
                <div className="supplier-items-header">
                  <div>
                    <h4>Item Name with GST Tax</h4>
                    <p>Add supplier items and their GST percentage</p>
                  </div>

                  <button
                    type="button"
                    className="supplier-add-item-btn"
                    onClick={addItem}
                  >
                    <PlusCircle size={16} />
                    Add Item
                  </button>
                </div>

                {formData.items.map((item, index) => (
                  <div className="supplier-item-row" key={index}>
                    <div className="supplier-form-group">
                      <label>Item Name</label>
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "itemName",
                            e.target.value
                          )
                        }
                        placeholder="Enter item name"
                      />
                    </div>

                    <div className="supplier-form-group">
                      <label>GST Tax (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={item.gstTax}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "gstTax",
                            e.target.value
                          )
                        }
                        placeholder="Enter GST %"
                      />
                    </div>

                    <button
                      type="button"
                      className="supplier-remove-item-btn"
                      onClick={() => removeItem(index)}
                      title="Remove Item"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="supplier-modal-footer">
                <button
                  type="button"
                  className="supplier-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="supplier-save-btn"
                >
                  {editingId ? "Update Supplier" : "Save Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {showDetailsModal && selectedSupplier && (
        <div className="supplier-modal-overlay">
          <div className="supplier-details-modal">

            <div className="supplier-modal-header">
              <div>
                <h3>Supplier Details</h3>
                <p>{selectedSupplier.supplierCompanyName}</p>
              </div>

              <button
                className="supplier-close-btn"
                onClick={() => setShowDetailsModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="supplier-details-grid">
              <div>
                <span>Contact Person</span>
                <strong>{selectedSupplier.contactPersonName}</strong>
              </div>

              <div>
                <span>Mobile No.</span>
                <strong>{selectedSupplier.mobileNo}</strong>
              </div>

              <div>
                <span>Mobile No. 2</span>
                <strong>{selectedSupplier.mobileNo2 || "-"}</strong>
              </div>

              <div>
                <span>GST No.</span>
                <strong>{selectedSupplier.gstNo || "-"}</strong>
              </div>

              <div>
                <span>Payment Terms</span>
                <strong>{selectedSupplier.paymentTerms}</strong>
              </div>

              <div>
                <span>State</span>
                <strong>{selectedSupplier.state}</strong>
              </div>

              <div>
                <span>Pincode</span>
                <strong>{selectedSupplier.pincode}</strong>
              </div>

              <div className="supplier-detail-full">
                <span>Address</span>
                <strong>{selectedSupplier.address}</strong>
              </div>
            </div>

            <div className="supplier-details-items">
              <h4>Supplier Items</h4>

              <table className="supplier-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>GST Tax (%)</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedSupplier.items?.length ? (
                    selectedSupplier.items.map((item) => (
                      <tr key={item._id}>
                        <td>{item.itemName}</td>
                        <td>{item.gstTax}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2">No items added</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="supplier-modal-footer">
              <button
                className="supplier-cancel-btn"
                onClick={() => setShowDetailsModal(false)}
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

export default SupplierVendorManagement;
