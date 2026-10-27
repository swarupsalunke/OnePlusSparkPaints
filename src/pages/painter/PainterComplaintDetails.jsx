import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MessageSquare, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import "../../css/painter/PainterComplaintDetails.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://oneplussparkpaintsserver.onrender.com";

const PainterComplaintDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const complaintId =
    location.state?.complaintId || location.state?.complaint?._id;

  const [complaint, setComplaint] = useState(null);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [closeLoading, setCloseLoading] = useState(false);

  useEffect(() => {
    if (!complaintId) {
      setLoading(false);
      return;
    }

    fetchComplaintDetails();
  }, [complaintId]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/painter/complaints/${complaintId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to fetch complaint details."
        );
      }

      setComplaint(result.data);
    } catch (err) {
      console.error("Complaint details error:", err);
      toast.error(err.message || "Failed to load complaint details.");
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Open":
        return "painter-complaint-details-status-open";

      case "Under Review":
        return "painter-complaint-details-status-review";

      case "Resolved":
        return "painter-complaint-details-status-resolved";

      case "Closed":
        return "painter-complaint-details-status-closed";

      default:
        return "";
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      toast.error("Please enter a comment.");
      return;
    }

    try {
      setCommentLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/painter/complaints/${complaintId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            comment: comment.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to add comment."
        );
      }

      setComplaint(result.data);
      setComment("");

      toast.success("Comment added successfully.");
    } catch (err) {
      console.error("Add comment error:", err);
      toast.error(err.message || "Failed to add comment.");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleCloseComplaint = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to close this complaint?"
    );

    if (!confirmed) return;

    try {
      setCloseLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/painter/complaints/${complaintId}/close`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to close complaint."
        );
      }

      setComplaint(result.data);

      toast.success("Complaint closed successfully.");
    } catch (err) {
      console.error("Close complaint error:", err);
      toast.error(err.message || "Failed to close complaint.");
    } finally {
      setCloseLoading(false);
    }
  };

  /*
   * Directly opening Complaint Details from sidebar
   * without selecting any complaint.
   */
  if (!complaintId) {
    return (
      <div className="painter-complaint-details-page">
        <div className="painter-complaint-details-header">
          <div>
            <h1>Complaint Details</h1>
            <p>View and manage complaint information</p>
          </div>
        </div>

        <div className="painter-complaint-details-empty-card">
          <div className="painter-complaint-details-empty-icon">
            <MessageSquare size={28} />
          </div>

          <h2>Please select a complaint</h2>

          <p>
            Please select a complaint from Complaint Listing
            to view its details.
          </p>

          <button
            type="button"
            className="painter-complaint-details-back-btn"
            onClick={() => navigate("/painter/complaints")}
          >
            <ArrowLeft size={17} />
            Go to Complaint Listing
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="painter-complaint-details-page">
        <div className="painter-complaint-details-state">
          Loading complaint details...
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="painter-complaint-details-page">
        <div className="painter-complaint-details-state painter-complaint-details-error">
          <h2>Unable to load complaint</h2>

          <p>Complaint not found.</p>

          <button
            type="button"
            className="painter-complaint-details-back-btn"
            onClick={() => navigate("/painter/complaints")}
          >
            <ArrowLeft size={17} />
            Back to Complaint Listing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="painter-complaint-details-page">
      <div className="painter-complaint-details-header">
        <div>
          <h1>Complaint Details</h1>
          <p>View and manage complaint information</p>
        </div>
      </div>

      <div className="painter-complaint-details-card">
        <div className="painter-complaint-details-top">
          <div className="painter-complaint-details-main-info">
            <h2>
              Complaint Details • {complaint.complaintId}
            </h2>

            <div className="painter-complaint-details-type">
              {complaint.type || "-"}
            </div>

            <h3>{complaint.title || "-"}</h3>

            <p className="painter-complaint-details-meta">
              Submitted {formatDate(complaint.submittedAt)}{" "}
              <span>•</span> Priority{" "}
              {complaint.priority || "-"}
            </p>
          </div>

          <span
            className={`painter-complaint-details-status ${getStatusClass(
              complaint.status
            )}`}
          >
            {complaint.status || "-"}
          </span>
        </div>

        <div className="painter-complaint-details-description">
          <h4>Description</h4>

          <p>
            {complaint.description || "No description available."}
          </p>
        </div>

        <div className="painter-complaint-details-actions">
          <button
            type="button"
            className="painter-complaint-details-comment-btn"
            onClick={() => {
              const commentBox = document.getElementById(
                "painter-complaint-comment-box"
              );

              commentBox?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });

              commentBox?.focus();
            }}
          >
            <MessageSquare size={17} />
            Add Comment
          </button>

          {complaint.status !== "Closed" && (
            <button
              type="button"
              className="painter-complaint-details-close-btn"
              onClick={handleCloseComplaint}
              disabled={closeLoading}
            >
              <X size={17} />

              {closeLoading
                ? "Closing..."
                : "Close Complaint"}
            </button>
          )}
        </div>

        <div className="painter-complaint-comment-section">
          <h4>Add Comment</h4>

          <textarea
            id="painter-complaint-comment-box"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter your comment..."
            rows="4"
          />

          <button
            type="button"
            className="painter-complaint-comment-submit"
            onClick={handleAddComment}
            disabled={commentLoading}
          >
            {commentLoading
              ? "Adding..."
              : "Add Comment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PainterComplaintDetails;