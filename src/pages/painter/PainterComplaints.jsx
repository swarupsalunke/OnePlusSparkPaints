import React, { useEffect, useState } from "react";
import "../../css/painter/PainterComplaints.css";

const PainterComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchComplaints = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                "https://oneplussparkpaintsserver.onrender.com/api/painter/voice-of-painter/complaints",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to fetch complaints."
                );
            }

            setComplaints(data.complaints || []);
        } catch (error) {
            console.error("Fetch Complaints Error:", error);
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const formatType = (type) => {
        if (!type) return "-";

        if (type === "PRODUCT_FEEDBACK") return "Product";
        if (type === "SERVICE_FEEDBACK") return "Service";
        if (type === "COMPLAINT") return "Complaint";
        if (type === "SUGGESTION") return "Suggestion";

        return type;
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
        });
    };

    const getStatusClass = (status) => {
        return `painter-complaint-status painter-complaint-status-${status?.toLowerCase()}`;
    };

    const formatStatus = (status) => {
        if (!status) return "-";

        return status
            .toLowerCase()
            .split("_")
            .map(
                (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1)
            )
            .join(" ");
    };

    return (
        <div className="painter-complaints-page">
            <div className="painter-complaints-header">
                <h1>Complaints</h1>

                <p>
                    Oneplus Spark PAINTS • Painter experience
                </p>
            </div>

            <div className="painter-complaints-card">
                <h2>Voice Complaints</h2>

                <div className="painter-complaints-table-wrapper">
                    <table className="painter-complaints-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Type</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="painter-complaints-message"
                                    >
                                        Loading complaints...
                                    </td>
                                </tr>
                            ) : complaints.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="painter-complaints-message"
                                    >
                                        No complaints found.
                                    </td>
                                </tr>
                            ) : (
                                complaints.map((complaint) => (
                                    <tr key={complaint._id}>
                                        <td>
                                            {complaint.title}
                                        </td>

                                        <td>
                                            {formatType(
                                                complaint.feedbackType
                                            )}
                                        </td>

                                        <td>
                                            {formatDate(
                                                complaint.createdAt
                                            )}
                                        </td>

                                        <td>
                                            <span
                                                className={getStatusClass(
                                                    complaint.status
                                                )}
                                            >
                                                {formatStatus(
                                                    complaint.status
                                                )}
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

export default PainterComplaints;