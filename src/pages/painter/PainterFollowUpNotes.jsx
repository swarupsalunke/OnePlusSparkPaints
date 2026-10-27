import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import "../../css/painter/PainterFollowUpNotes.css";

const PainterFollowUpNotes = () => {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [note, setNote] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const customerName = (
      lead.customerName ||
      lead.customer?.name ||
      ""
    ).toLowerCase();

    const area = (
      lead.area ||
      lead.customer?.city ||
      ""
    ).toLowerCase();

    const status = (lead.status || "").toLowerCase();

    const searchValue = search.toLowerCase().trim();

    return (
      customerName.includes(searchValue) ||
      area.includes(searchValue) ||
      status.includes(searchValue)
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedLeadId) {
      toast.error("Please select a lead");
      return;
    }

    if (!note.trim()) {
      toast.error("Please enter follow-up notes");
      return;
    }

    if (!followUpDate || !followUpTime) {
      toast.error("Please select follow-up date and time");
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");

      const nextFollowUp = `${followUpDate}T${followUpTime}`;

      const response = await fetch(
        `${API_BASE_URL}/api/painter/follow-ups`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lead: selectedLeadId,
            note: note.trim(),
            nextFollowUp,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Follow-up saved successfully");

        setSelectedLeadId("");
        setSearch("");
        setNote("");
        setFollowUpDate("");
        setFollowUpTime("");
      } else {
        toast.error(data.message || "Failed to save follow-up");
      }
    } catch (error) {
      console.error("Failed to save follow-up:", error);
      toast.error("Failed to save follow-up");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="painter-follow-up-page">
      <div className="painter-follow-up-header">
        <h1>Follow-up Notes</h1>
        <p>Oneplus Spark PAINTS • Painter experience</p>
      </div>

      <div className="painter-follow-up-card">
        <h2>Follow-up Notes</h2>

        <form
          className="painter-follow-up-form"
          onSubmit={handleSubmit}
        >
          <div className="painter-follow-up-search-field">
            <label>Search Lead</label>

            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedLeadId("");
              }}
              placeholder="Search by customer name, area or status"
            />
          </div>

          <div className="painter-follow-up-field">
            <label>Lead</label>

            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              disabled={loading}
              required
            >
              <option value="">
                {loading ? "Loading leads..." : "Select a lead"}
              </option>

              {filteredLeads.map((lead) => (
                <option key={lead._id} value={lead._id}>
                  {lead.customerName || lead.customer?.name || "-"} •{" "}
                  {lead.area || lead.customer?.city || "-"} •{" "}
                  {lead.status || "-"}
                </option>
              ))}
            </select>
          </div>

          <div className="painter-follow-up-field">
            <label>Notes</label>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter follow-up notes..."
              rows="5"
              required
            ></textarea>
          </div>

          <div className="painter-follow-up-field">
            <label>Next Follow-up</label>

            <div className="painter-follow-up-date-time">
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                required
              />

              <input
                type="time"
                value={followUpTime}
                onChange={(e) => setFollowUpTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="painter-follow-up-submit">
            <button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Follow-up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PainterFollowUpNotes;