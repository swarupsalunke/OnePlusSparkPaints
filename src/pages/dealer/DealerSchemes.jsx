import React, { useEffect, useState } from "react";
import { CalendarDays, Download, Eye, FileText, RefreshCw, ArrowRight, } from "lucide-react";
import "../../css/dealer/DealerSchemes.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const SERVER_URL = API_BASE_URL || "https://oneplussparkpaintsserver.onrender.com";

const getFileUrl = (filePath) => {
    if (!filePath) return "";

    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
        return filePath;
    }

    return `${SERVER_URL}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
};

const DealerSchemes = () => {
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedScheme, setSelectedScheme] = useState(null);

    const fetchSchemes = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_BASE_URL}/api/schemes?status=ACTIVE`);
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to fetch schemes");
            }

            const dealerSchemes = (result.schemes || []).filter(
                (scheme) =>
                    scheme.applicableTo === "DEALERS" ||
                    scheme.applicableTo === "BOTH"
            );

            setSchemes(dealerSchemes);
        } catch (err) {
            setError(err.message || "Failed to load schemes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchemes();
    }, []);

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getSchemeTypeLabel = (type) => {
        const labels = {
            CASHBACK: "Cashback Offer",
            REWARD: "Reward Offer",
            DISCOUNT: "Discount Offer",
        };

        return labels[type] || type;
    };

    const downloadPdf = async (pdf, schemeName) => {
        try {
            const response = await fetch(getFileUrl(pdf));

            if (!response.ok) {
                throw new Error("PDF download failed");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `${schemeName || "scheme"}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("PDF download error:", error);
            window.open(getFileUrl(pdf), "_blank");
        }
    };

    if (loading) {
        return (
            <div className="dealer-schemes-page">
                <div className="dealer-schemes-loading">
                    <RefreshCw size={28} className="dealer-schemes-spinner" />
                    <p>Loading schemes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dealer-schemes-page">
            <div className="dealer-schemes-header">
                <div>
                    <h1>Schemes</h1>
                    <p>Explore active schemes available for you.</p>
                </div>

                <div className="dealer-schemes-header-actions">
                    <button className="dealer-schemes-refresh-btn" onClick={fetchSchemes}><RefreshCw size={17} /> Refresh</button>
                    <button className="dealer-schemes-offer-btn" onClick={() => window.location.href = "/dealer/offers"}><span>Offers</span><ArrowRight size={17} /></button>
                </div>
            </div>

            {error && (
                <div className="dealer-schemes-error">
                    <p>{error}</p>
                    <button onClick={fetchSchemes}>Try Again</button>
                </div>
            )}

            {!error && schemes.length === 0 && (
                <div className="dealer-schemes-empty">
                    <FileText size={40} />
                    <h3>No Active Schemes</h3>
                    <p>There are currently no active schemes available.</p>
                </div>
            )}

            {!error && schemes.length > 0 && (
                <div className="dealer-schemes-grid">
                    {schemes.map((scheme) => (
                        <div className="dealer-scheme-card" key={scheme._id}>
                            <div className="dealer-scheme-banner">
                                {scheme.banner ? (
                                    <img
                                        src={getFileUrl(scheme.banner)}
                                        alt={scheme.schemeName}
                                    />
                                ) : (
                                    <div className="dealer-scheme-banner-placeholder">
                                        <FileText size={38} />
                                    </div>
                                )}

                                <span className="dealer-scheme-status">
                                    {scheme.status}
                                </span>
                            </div>

                            <div className="dealer-scheme-content">
                                <div className="dealer-scheme-top">
                                    <span className="dealer-scheme-type">
                                        {getSchemeTypeLabel(scheme.schemeType)}
                                    </span>

                                    <span className="dealer-scheme-id">
                                        {scheme.schemeId}
                                    </span>
                                </div>

                                <h2>{scheme.schemeName}</h2>

                                <p className="dealer-scheme-description">
                                    {scheme.description || "No description available."}
                                </p>

                                <div className="dealer-scheme-dates">
                                    <div>
                                        <CalendarDays size={16} />
                                        <span>
                                            <small>Start Date</small>
                                            {formatDate(scheme.startDate)}
                                        </span>
                                    </div>

                                    <div>
                                        <CalendarDays size={16} />
                                        <span>
                                            <small>End Date</small>
                                            {formatDate(scheme.endDate)}
                                        </span>
                                    </div>
                                </div>

                                <div className="dealer-scheme-actions">
                                    <button
                                        className="dealer-scheme-view-btn"
                                        onClick={() => setSelectedScheme(scheme)}
                                    >
                                        <Eye size={16} />
                                        View Details
                                    </button>

                                    {scheme.pdf && (
                                        <button
                                            className="dealer-scheme-download-btn"
                                            onClick={() =>
                                                downloadPdf(scheme.pdf, scheme.schemeName)
                                            }
                                        >
                                            <Download size={16} />
                                            Download PDF
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedScheme && (
                <div
                    className="dealer-scheme-modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setSelectedScheme(null);
                        }
                    }}
                >
                    <div className="dealer-scheme-modal">
                        <div className="dealer-scheme-modal-header">
                            <div>
                                <h2>{selectedScheme.schemeName}</h2>
                                <span>{selectedScheme.schemeId}</span>
                            </div>

                            <button onClick={() => setSelectedScheme(null)}>×</button>
                        </div>

                        {selectedScheme.banner && (
                            <img
                                className="dealer-scheme-modal-banner"
                                src={getFileUrl(selectedScheme.banner)}
                                alt={selectedScheme.schemeName}
                            />
                        )}

                        <div className="dealer-scheme-details">
                            <div>
                                <span>Scheme Type</span>
                                <strong>
                                    {getSchemeTypeLabel(selectedScheme.schemeType)}
                                </strong>
                            </div>

                            <div>
                                <span>Applicable To</span>
                                <strong>
                                    {selectedScheme.applicableTo === "BOTH"
                                        ? "Dealers & Painters"
                                        : selectedScheme.applicableTo}
                                </strong>
                            </div>

                            <div>
                                <span>Start Date</span>
                                <strong>{formatDate(selectedScheme.startDate)}</strong>
                            </div>

                            <div>
                                <span>End Date</span>
                                <strong>{formatDate(selectedScheme.endDate)}</strong>
                            </div>

                            <div className="dealer-scheme-full-detail">
                                <span>Description</span>
                                <p>{selectedScheme.description || "-"}</p>
                            </div>

                            <div className="dealer-scheme-full-detail">
                                <span>Terms & Conditions</span>
                                <p>{selectedScheme.termsAndConditions || "-"}</p>
                            </div>
                        </div>

                        <div className="dealer-scheme-modal-footer">
                            {selectedScheme.pdf && (
                                <button
                                    className="dealer-scheme-download-btn"
                                    onClick={() =>
                                        downloadPdf(
                                            selectedScheme.pdf,
                                            selectedScheme.schemeName
                                        )
                                    }
                                >
                                    <Download size={16} />
                                    Download Scheme PDF
                                </button>
                            )}

                            <button
                                className="dealer-scheme-close-btn"
                                onClick={() => setSelectedScheme(null)}
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

export default DealerSchemes;