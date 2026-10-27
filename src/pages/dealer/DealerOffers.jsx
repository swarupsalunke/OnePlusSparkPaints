import React, { useEffect, useState } from "react";
import { CalendarDays, Download, Eye, FileText, RefreshCw, Tag, ArrowLeft, } from "lucide-react";
import "../../css/dealer/DealerOffers.css";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com";

const SERVER_URL = API_BASE_URL;

const getFileUrl = (filePath) => {
    if (!filePath) return "";

    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
        return filePath;
    }

    return `${SERVER_URL}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
};

const DealerOffers = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedOffer, setSelectedOffer] = useState(null);

    const fetchOffers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_BASE_URL}/api/schemes?status=ACTIVE`);
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to fetch offers");
            }

            const dealerOffers = (result.schemes || []).filter(
                (scheme) =>
                    (scheme.applicableTo === "DEALERS" ||
                        scheme.applicableTo === "BOTH") &&
                    ["CASHBACK", "REWARD", "DISCOUNT"].includes(scheme.schemeType)
            );

            setOffers(dealerOffers);
        } catch (err) {
            setError(err.message || "Failed to load offers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getOfferTypeLabel = (type) => {
        const labels = {
            CASHBACK: "Cashback Offer",
            REWARD: "Reward Offer",
            DISCOUNT: "Discount Offer",
        };

        return labels[type] || type;
    };

    const downloadPdf = async (pdf, offerName) => {
        try {
            const response = await fetch(getFileUrl(pdf));

            if (!response.ok) {
                throw new Error("PDF download failed");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `${offerName || "offer"}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Offer PDF download error:", error);
            window.open(getFileUrl(pdf), "_blank");
        }
    };

    if (loading) {
        return (
            <div className="dealer-offers-page">
                <div className="dealer-offers-loading">
                    <RefreshCw size={28} className="dealer-offers-spinner" />
                    <p>Loading offers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dealer-offers-page">
            <div className="dealer-offers-header">
                <div>
                    <h1>Offers</h1>
                    <p>Explore active offers available for you.</p>
                </div>

                <div className="dealer-offers-header-actions">
                    <button
                        className="dealer-offers-back-btn"
                        onClick={() => window.location.href = "/dealer/schemes"}
                    >
                        <ArrowLeft size={17} />
                        Back
                    </button>

                    <button
                        className="dealer-offers-refresh-btn"
                        onClick={fetchOffers}
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div className="dealer-offers-error">
                    <p>{error}</p>
                    <button onClick={fetchOffers}>Try Again</button>
                </div>
            )}

            {!error && offers.length === 0 && (
                <div className="dealer-offers-empty">
                    <Tag size={40} />
                    <h3>No Active Offers</h3>
                    <p>There are currently no active offers available.</p>
                </div>
            )}

            {!error && offers.length > 0 && (
                <div className="dealer-offers-grid">
                    {offers.map((offer) => (
                        <div className="dealer-offer-card" key={offer._id}>
                            <div className="dealer-offer-banner">
                                {offer.banner ? (
                                    <img
                                        src={getFileUrl(offer.banner)}
                                        alt={offer.schemeName}
                                    />
                                ) : (
                                    <div className="dealer-offer-banner-placeholder">
                                        <Tag size={38} />
                                    </div>
                                )}

                                <span className="dealer-offer-status">
                                    {offer.status}
                                </span>
                            </div>

                            <div className="dealer-offer-content">
                                <div className="dealer-offer-top">
                                    <span className="dealer-offer-type">
                                        {getOfferTypeLabel(offer.schemeType)}
                                    </span>

                                    <span className="dealer-offer-id">
                                        {offer.schemeId}
                                    </span>
                                </div>

                                <h2>{offer.schemeName}</h2>

                                <p className="dealer-offer-description">
                                    {offer.description || "No description available."}
                                </p>

                                <div className="dealer-offer-dates">
                                    <div>
                                        <CalendarDays size={16} />
                                        <span>
                                            <small>Valid From</small>
                                            {formatDate(offer.startDate)}
                                        </span>
                                    </div>

                                    <div>
                                        <CalendarDays size={16} />
                                        <span>
                                            <small>Valid Till</small>
                                            {formatDate(offer.endDate)}
                                        </span>
                                    </div>
                                </div>

                                <div className="dealer-offer-actions">
                                    <button
                                        className="dealer-offer-view-btn"
                                        onClick={() => setSelectedOffer(offer)}
                                    >
                                        <Eye size={16} />
                                        View Details
                                    </button>

                                    {offer.pdf && (
                                        <button
                                            className="dealer-offer-download-btn"
                                            onClick={() =>
                                                downloadPdf(offer.pdf, offer.schemeName)
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

            {selectedOffer && (
                <div
                    className="dealer-offer-modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setSelectedOffer(null);
                        }
                    }}
                >
                    <div className="dealer-offer-modal">
                        <div className="dealer-offer-modal-header">
                            <div>
                                <h2>{selectedOffer.schemeName}</h2>
                                <span>{selectedOffer.schemeId}</span>
                            </div>

                            <button onClick={() => setSelectedOffer(null)}>×</button>
                        </div>

                        {selectedOffer.banner && (
                            <img
                                className="dealer-offer-modal-banner"
                                src={getFileUrl(selectedOffer.banner)}
                                alt={selectedOffer.schemeName}
                            />
                        )}

                        <div className="dealer-offer-details">
                            <div>
                                <span>Offer Type</span>
                                <strong>
                                    {getOfferTypeLabel(selectedOffer.schemeType)}
                                </strong>
                            </div>

                            <div>
                                <span>Applicable To</span>
                                <strong>
                                    {selectedOffer.applicableTo === "BOTH"
                                        ? "Dealers & Painters"
                                        : selectedOffer.applicableTo}
                                </strong>
                            </div>

                            <div>
                                <span>Valid From</span>
                                <strong>{formatDate(selectedOffer.startDate)}</strong>
                            </div>

                            <div>
                                <span>Valid Till</span>
                                <strong>{formatDate(selectedOffer.endDate)}</strong>
                            </div>

                            <div className="dealer-offer-full-detail">
                                <span>Description</span>
                                <p>{selectedOffer.description || "-"}</p>
                            </div>

                            <div className="dealer-offer-full-detail">
                                <span>Terms & Conditions</span>
                                <p>
                                    {selectedOffer.termsAndConditions || "-"}
                                </p>
                            </div>
                        </div>

                        <div className="dealer-offer-modal-footer">
                            {selectedOffer.pdf && (
                                <button
                                    className="dealer-offer-download-btn"
                                    onClick={() =>
                                        downloadPdf(
                                            selectedOffer.pdf,
                                            selectedOffer.schemeName
                                        )
                                    }
                                >
                                    <Download size={16} />
                                    Download PDF
                                </button>
                            )}

                            <button
                                className="dealer-offer-close-btn"
                                onClick={() => setSelectedOffer(null)}
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

export default DealerOffers;