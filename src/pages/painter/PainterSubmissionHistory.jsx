import React, { useEffect, useState } from "react";
import "../../css/painter/PainterSubmissionHistory.css";

const PainterSubmissionHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                "https://oneplussparkpaintsserver.onrender.com/api/painter/voice-history",
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
                    data.message || "Failed to fetch submission history."
                );
            }

            setHistory(data.history || []);
        } catch (error) {
            console.error(
                "Fetch Submission History Error:",
                error
            );

            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
        });
    };

    const formatType = (type) => {
        if (!type) return "-";

        const typeMap = {
            PRODUCT_FEEDBACK: "Product",
            SERVICE_FEEDBACK: "Service",
            COMPLAINT: "Complaint",
            SUGGESTION: "Suggestion",
            Video: "Video",
            Images: "Images",
        };

        return typeMap[type] || type;
    };

    const formatStatus = (status) => {
        if (!status) return "-";

        return status
            .toLowerCase()
            .split("_")
            .map(
                (word) =>
                    word.charAt(0).toUpperCase() +
                    word.slice(1)
            )
            .join(" ");
    };

    const getStatusClass = (status) => {
        return `painter-history-status painter-history-status-${status?.toLowerCase()}`;
    };

    return (
        <div className="painter-submission-history-page">
            <div className="painter-submission-history-header">
                <h1>Submission History</h1>

                <p>
                    Oneplus Spark PAINTS • Painter experience
                </p>
            </div>

            <div className="painter-submission-history-card">
                <div className="painter-submission-history-table-wrapper">
                    <table className="painter-submission-history-table">
                        <thead>
                            <tr>
                                <th>Submission</th>
                                <th>Type</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Reward</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="painter-history-message"
                                    >
                                        Loading submission history...
                                    </td>
                                </tr>
                            ) : history.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="painter-history-message"
                                    >
                                        No submission history found.
                                    </td>
                                </tr>
                            ) : (
                                history.map((item) => (
                                    <tr key={item._id}>
                                        <td>
                                            {item.submission}
                                        </td>

                                        <td>
                                            {formatType(item.type)}
                                        </td>

                                        <td>
                                            {formatDate(item.date)}
                                        </td>

                                        <td>
                                            <span
                                                className={getStatusClass(
                                                    item.status
                                                )}
                                            >
                                                {formatStatus(
                                                    item.status
                                                )}
                                            </span>
                                        </td>

                                        <td>
                                            {item.reward !== null &&
                                            item.reward !== undefined
                                                ? item.reward
                                                : "—"}
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

export default PainterSubmissionHistory;