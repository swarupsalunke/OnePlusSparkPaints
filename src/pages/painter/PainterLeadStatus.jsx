import React, { useEffect, useState } from "react";
import "../../css/painter/PainterLeadStatus.css";

const PainterLeadStatus = () => {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com";

  const fetchLeads = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/painter/leads`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

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

  const fetchLeadDetails = async (leadId) => {
    if (!leadId) {
      setLead(null);
      return;
    }

    try {
      setLoadingDetails(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/painter/leads/${leadId}`,
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
      }
    } catch (error) {
      console.error("Failed to fetch lead details:", error);
      setLead(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleLeadSelect = (e) => {
    const leadId = e.target.value;

    setSelectedLeadId(leadId);
    fetchLeadDetails(leadId);
  };

  const filteredLeads = leads.filter((item) => {
    const customerName = (
      item.customerName ||
      item.customer?.name ||
      ""
    ).toLowerCase();

    const area = (
      item.area ||
      item.customer?.city ||
      ""
    ).toLowerCase();

    const status = (item.status || "").toLowerCase();

    const searchValue = search.toLowerCase().trim();

    return (
      customerName.includes(searchValue) ||
      area.includes(searchValue) ||
      status.includes(searchValue)
    );
  });

  const timelineStatuses = [
    "Assigned",
    "Accepted",
    "In Progress",
    "Completed",
  ];

  const getStatusDate = (status) => {
    const history = lead?.statusHistory || [];

    const historyItem = history.find(
      (item) => item.status === status
    );

    if (!historyItem?.date) {
      return "Pending";
    }

    return new Date(historyItem.date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isCompletedStatus = (status) => {
    const history = lead?.statusHistory || [];

    return history.some((item) => item.status === status);
  };

  return (
    <div className="painter-lead-status-page">
      <div className="painter-lead-status-header">
        <h1>Lead Status</h1>
        <p>Oneplus Spark PAINTS • Painter experience</p>
      </div>

      <div className="painter-lead-status-card">
        <h2>Lead Status</h2>

        <div className="painter-lead-status-search-section">
          <label>Search Lead</label>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, area or status"
          />
        </div>

        <div className="painter-lead-status-select-section">
          <label>Select Lead</label>

          <select
            value={selectedLeadId}
            onChange={handleLeadSelect}
            disabled={loading}
          >
            <option value="">
              {loading ? "Loading leads..." : "Select a lead"}
            </option>

            {filteredLeads.map((item) => (
              <option key={item._id} value={item._id}>
                {item.customerName || item.customer?.name || "-"} •{" "}
                {item.area || item.customer?.city || "-"} •{" "}
                {item.status || "-"}
              </option>
            ))}
          </select>
        </div>

        {!loading && filteredLeads.length === 0 && (
          <div className="painter-lead-status-no-results">
            No leads found
          </div>
        )}

        {!selectedLeadId && !loading && filteredLeads.length > 0 && (
          <div className="painter-lead-status-select-message">
            Please select a lead to view status
          </div>
        )}

        {loadingDetails && (
          <div className="painter-lead-status-loading">
            Loading lead status...
          </div>
        )}

        {lead && !loadingDetails && (
          <>
            <div className="painter-lead-status-selected-info">
              <div>
                <span>Customer</span>
                <strong>{lead.customerName || "-"}</strong>
              </div>

              <div>
                <span>Area</span>
                <strong>{lead.area || "-"}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{lead.status || "-"}</strong>
              </div>
            </div>

            <div className="painter-lead-status-timeline">
              {timelineStatuses.map((status, index) => {
                const completed = isCompletedStatus(status);

                return (
                  <React.Fragment key={status}>
                    <div
                      className={`painter-lead-status-step ${
                        completed ? "completed" : "pending"
                      }`}
                    >
                      <div className="painter-lead-status-dot"></div>

                      <strong>{status}</strong>

                      <span>
                        {completed
                          ? getStatusDate(status)
                          : "Pending"}
                      </span>
                    </div>

                    {index < timelineStatuses.length - 1 && (
                      <div
                        className={`painter-lead-status-line ${
                          isCompletedStatus(
                            timelineStatuses[index + 1]
                          )
                            ? "completed"
                            : ""
                        }`}
                      ></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="painter-lead-current-status">
              Current: {lead.status}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PainterLeadStatus;