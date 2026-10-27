import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Check, X, Phone, User, Package, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import "../../css/painter/PainterLeadDetails.css";

const PainterLeadDetails = () => {
  const location = useLocation();

  const selectedLeadId = location.state?.leadId;

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLead = async () => {
    if (!selectedLeadId) {
      setLead(null);
      return;
    }

    try {
      setLoading(true);

      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com";

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/painter/leads/${selectedLeadId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setLead(data.lead);
      } else {
        setLead(null);
        toast.error(data.message || "Failed to fetch lead details");
      }
    } catch (error) {
      console.error("Failed to fetch lead:", error);
      setLead(null);
      toast.error(error.message || "Failed to fetch lead details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [selectedLeadId]);

  const handleStatusChange = async (status) => {
    if (!lead?._id) return;

    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com";

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/painter/leads/${lead._id}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setLead(data.lead);
        toast.success(
          status === "Accepted"
            ? "Lead accepted successfully"
            : "Lead rejected successfully"
        );
      } else {
        toast.error(data.message || "Failed to update lead status");
      }
    } catch (error) {
      console.error("Failed to update lead status:", error);
      toast.error(error.message || "Failed to update lead status");
    }
  };

  if (!selectedLeadId) {
    return (
      <div className="painter-lead-details-page">
        <div className="painter-lead-details-header">
          <h1>Lead Details</h1>
          <p>Oneplus Spark PAINTS • Painter experience</p>
        </div>

        <div className="painter-lead-details-card">
          <div className="painter-lead-details-empty">
            Please select a lead from Lead Listing
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="painter-lead-details-page">
        <div className="painter-lead-details-loading">
          Loading lead details...
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="painter-lead-details-page">
        <div className="painter-lead-details-header">
          <h1>Lead Details</h1>
          <p>Oneplus Spark PAINTS • Painter experience</p>
        </div>

        <div className="painter-lead-details-card">
          <div className="painter-lead-details-empty">
            Lead details not found
          </div>
        </div>
      </div>
    );
  }

  const customer = lead.customer || {};

  return (
    <div className="painter-lead-details-page">
      <div className="painter-lead-details-header">
        <h1>Lead Details</h1>
        <p>Oneplus Spark PAINTS • Painter experience</p>
      </div>

      <div className="painter-lead-details-card">
        <h2>Lead Details • {lead.leadId}</h2>

        <div className="painter-lead-details-summary">
          <div className="painter-lead-summary-box">
            <div className="painter-lead-summary-icon">
              <User size={15} />
            </div>

            <div>
              <span>Customer</span>
              <strong>{lead.customerName || customer.name || "-"}</strong>
              <small>{customer.city || lead.area || "-"}</small>
            </div>
          </div>

          <div className="painter-lead-summary-box">
            <div className="painter-lead-summary-icon">
              <Package size={15} />
            </div>

            <div>
              <span>Interest</span>
              <strong>{customer.productInterest || "-"}</strong>
              <small>
                Estimated ₹
                {Number(customer.estimatedBusiness || 0).toLocaleString(
                  "en-IN"
                )}
              </small>
            </div>
          </div>

          <div className="painter-lead-summary-box">
            <div className="painter-lead-summary-icon">
              <ClipboardList size={15} />
            </div>

            <div>
              <span>Lead Status</span>
              <strong>{lead.status || "-"}</strong>
              <small>Due today</small>
            </div>
          </div>
        </div>

        <div className="painter-lead-contact">
          <h3>Contact</h3>
          <p>{customer.mobile || "-"}</p>
        </div>

        <div className="painter-lead-details-actions">
          <a
            className="painter-lead-call-btn"
            href={customer.mobile ? `tel:${customer.mobile}` : undefined}
          >
            <Phone size={15} />
            Call Customer
          </a>

          <button
            type="button"
            className="painter-lead-action-btn"
            onClick={() => handleStatusChange("Accepted")}
          >
            <Check size={15} />
            Accept Lead
          </button>

          <button
            type="button"
            className="painter-lead-action-btn"
            onClick={() => handleStatusChange("Rejected")}
          >
            <X size={15} />
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default PainterLeadDetails;