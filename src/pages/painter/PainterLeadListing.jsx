import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/painter/PainterLeadListing.css";

const PainterLeadListing = () => {
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      setLoading(true);

      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com";

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/painter/leads`,
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
        setLeads(data.leads || []);
      } else {
        setLeads([]);
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleLeadSelect = (lead) => {
    navigate("/painter/lead-details", {
      state: {
        leadId: lead._id,
      },
    });
  };

  return (
    <div className="painter-lead-listing-page">
      <div className="painter-lead-listing-header">
        <h1>Lead Listing</h1>
        <p>Oneplus Spark PAINTS • Painter experience</p>
      </div>

      <div className="painter-lead-listing-card">
        <h2>Lead Listing</h2>

        <div className="painter-lead-table-wrapper">
          <table className="painter-lead-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Customer</th>
                <th>Area</th>
                <th>Last Activity</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="painter-lead-table-message">
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="5" className="painter-lead-table-message">
                    No leads found
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead._id}
                    className="painter-lead-table-row"
                    onClick={() => handleLeadSelect(lead)}
                  >
                    <td className="painter-lead-id">
                      {lead.leadId}
                    </td>

                    <td>
                      {lead.customerName ||
                        lead.customer?.name ||
                        "-"}
                    </td>

                    <td>
                      {lead.area ||
                        lead.customer?.city ||
                        "-"}
                    </td>

                    <td>
                      {formatDate(lead.lastActivity)}
                    </td>

                    <td>
                      <span
                        className={`painter-lead-status painter-lead-status-${lead.status
                          ?.toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {lead.status || "-"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PainterLeadListing;