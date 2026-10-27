import React, { useEffect, useState } from "react";
import { Eye, Mail, Phone, UserRound } from "lucide-react";
import "../../css/dealer/DealerPainterEnquiries.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com";

const DealerPainterEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/dealer/painter-enquiries`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch enquiries"
        );
      }

      setEnquiries(data.enquiries || []);
    } catch (error) {
      console.error("Fetch painter enquiries error:", error);
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING":
        return "New";

      case "ACCEPTED":
        return "Accepted";

      case "REJECTED":
        return "Rejected";

      case "CONVERTED_TO_ORDER":
        return "Converted";

      default:
        return status || "New";
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedEnquiry?._id) return;

    try {
      setUpdatingStatus(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/dealer/painter-enquiries/${selectedEnquiry._id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update enquiry status"
        );
      }

      setSelectedEnquiry((prev) => ({
        ...prev,
        status: newStatus,
      }));

      setEnquiries((prev) =>
        prev.map((item) =>
          item._id === selectedEnquiry._id
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Update enquiry status error:",
        error
      );

      alert(
        error.message ||
          "Failed to update enquiry status"
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="dealer-painter-enquiries">
      <div className="dealer-painter-enquiries-header">
        <div>
          <h1>Painter Enquiries</h1>
          <p>View enquiries received from painters.</p>
        </div>
      </div>

      {loading ? (
        <div className="dealer-painter-enquiries-empty">
          <p>Loading enquiries...</p>
        </div>
      ) : enquiries.length === 0 ? (
        <div className="dealer-painter-enquiries-empty">
          <UserRound size={42} />

          <h3>No Painter Enquiries Found</h3>

          <p>
            No enquiries have been received from painters yet.
          </p>
        </div>
      ) : (
        <div className="dealer-painter-enquiries-table-wrapper">
          <table className="dealer-painter-enquiries-table">
            <thead>
              <tr>
                <th>Painter</th>
                <th>Contact</th>
                <th>Products</th>
                <th>Quantity</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {enquiries.map((enquiry) => {
                const totalQuantity = (
                  enquiry.products || []
                ).reduce(
                  (total, item) =>
                    total + Number(item.quantity || 0),
                  0
                );

                return (
                  <tr key={enquiry._id}>
                    <td>
                      <div className="dealer-painter-info">
                        <div className="dealer-painter-image">
                          {enquiry.painter?.profileImage ? (
                            <img
                              src={
                                enquiry.painter.profileImage
                              }
                              alt={
                                enquiry.painter?.name ||
                                "Painter"
                              }
                            />
                          ) : (
                            <UserRound size={20} />
                          )}
                        </div>

                        <div>
                          <strong>
                            {enquiry.painter?.name ||
                              "N/A"}
                          </strong>

                          <span>
                            {enquiry.painter?.city ||
                              "N/A"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="dealer-contact-info">
                        {enquiry.painter?.mobile && (
                          <span>
                            <Phone size={14} />
                            {enquiry.painter.mobile}
                          </span>
                        )}

                        {enquiry.painter?.email && (
                          <span>
                            <Mail size={14} />
                            {enquiry.painter.email}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="dealer-product-list">
                        {(enquiry.products || []).map(
                          (item, index) => (
                            <span key={index}>
                              {item.product?.productName ||
                                "Product"}
                            </span>
                          )
                        )}
                      </div>
                    </td>

                    <td>{totalQuantity}</td>

                    <td>
                      {formatDate(enquiry.createdAt)}
                    </td>

                    <td>
                      <span
                        className={`dealer-enquiry-status status-${enquiry.status?.toLowerCase()}`}
                      >
                        {getStatusLabel(
                          enquiry.status
                        )}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="dealer-view-enquiry-btn"
                        onClick={() =>
                          setSelectedEnquiry(enquiry)
                        }
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedEnquiry && (
        <div
          className="dealer-enquiry-modal-overlay"
          onClick={() =>
            setSelectedEnquiry(null)
          }
        >
          <div
            className="dealer-enquiry-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="dealer-enquiry-modal-header">
              <div>
                <span>Painter Enquiry</span>

                <h2>Enquiry Details</h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedEnquiry(null)
                }
              >
                ×
              </button>
            </div>

            <div className="dealer-enquiry-modal-body">
              <div className="dealer-enquiry-painter-profile">
                <div className="dealer-enquiry-profile-image">
                  {selectedEnquiry.painter
                    ?.profileImage ? (
                    <img
                      src={
                        selectedEnquiry.painter
                          .profileImage
                      }
                      alt={
                        selectedEnquiry.painter?.name ||
                        "Painter"
                      }
                    />
                  ) : (
                    <UserRound size={30} />
                  )}
                </div>

                <div>
                  <h3>
                    {selectedEnquiry.painter?.name ||
                      "N/A"}
                  </h3>

                  <p>
                    {selectedEnquiry.painter?.tier ||
                      "Painter"}
                  </p>
                </div>
              </div>

              <div className="dealer-enquiry-details-grid">
                <div>
                  <span>Mobile</span>

                  <strong>
                    {selectedEnquiry.painter?.mobile ||
                      "N/A"}
                  </strong>
                </div>

                <div>
                  <span>Email</span>

                  <strong>
                    {selectedEnquiry.painter?.email ||
                      "N/A"}
                  </strong>
                </div>

                <div>
                  <span>City</span>

                  <strong>
                    {selectedEnquiry.painter?.city ||
                      "N/A"}
                  </strong>
                </div>

                <div>
                  <span>Serviceable Area</span>

                  <strong>
                    {selectedEnquiry.painter
                      ?.serviceableArea || "N/A"}
                  </strong>
                </div>

                <div>
                  <span>Enquiry Date</span>

                  <strong>
                    {formatDate(
                      selectedEnquiry.createdAt
                    )}
                  </strong>
                </div>

                <div>
                  <span>Status</span>

                  <select
                    className="dealer-enquiry-status-select"
                    value={
                      selectedEnquiry.status ||
                      "PENDING"
                    }
                    onChange={(e) =>
                      handleStatusChange(
                        e.target.value
                      )
                    }
                    disabled={updatingStatus}
                  >
                    <option value="PENDING">
                      New
                    </option>

                    <option value="ACCEPTED">
                      Accepted
                    </option>

                    <option value="REJECTED">
                      Rejected
                    </option>

                    <option value="CONVERTED_TO_ORDER">
                      Converted
                    </option>
                  </select>
                </div>
              </div>

              {updatingStatus && (
                <div className="dealer-enquiry-status-updating">
                  Updating status...
                </div>
              )}

              <div className="dealer-enquiry-products">
                <h3>Product Details</h3>

                {(selectedEnquiry.products || []).map(
                  (item, index) => (
                    <div
                      className="dealer-enquiry-product-row"
                      key={index}
                    >
                      <div>
                        <strong>
                          {item.product?.productName ||
                            "Product"}
                        </strong>

                        {item.product?.sku && (
                          <span>
                            SKU: {item.product.sku}
                          </span>
                        )}
                      </div>

                      <strong>
                        Qty: {item.quantity}
                      </strong>
                    </div>
                  )
                )}
              </div>

              {selectedEnquiry.remarks && (
                <div className="dealer-enquiry-remarks">
                  <h3>Remarks</h3>

                  <p>
                    {selectedEnquiry.remarks}
                  </p>
                </div>
              )}
            </div>

            <div className="dealer-enquiry-modal-footer">
              <button
                type="button"
                onClick={() =>
                  setSelectedEnquiry(null)
                }
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

export default DealerPainterEnquiries;