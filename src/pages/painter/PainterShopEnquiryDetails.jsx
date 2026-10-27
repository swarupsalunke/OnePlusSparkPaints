import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../../css/painter/PainterShopEnquiryDetails.css";

const PainterShopEnquiryDetails = () => {
    const { id } = useParams();

    const [enquiry, setEnquiry] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEnquiryDetails = async () => {
            if (!id) {
                setEnquiry(null);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `https://oneplussparkpaintsserver.onrender.com/api/painter/shop-enquiries/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data.success) {
                    setEnquiry(response.data.enquiry);
                }
            } catch (error) {
                console.error(
                    "Enquiry details fetch error:",
                    error
                );

                setEnquiry(null);
            } finally {
                setLoading(false);
            }
        };

        fetchEnquiryDetails();
    }, [id]);

    const getEnquiryId = (enquiryId) => {
        return `ENQ-${enquiryId.slice(-4).toUpperCase()}`;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getStepStatus = (step) => {
        if (!enquiry) return "pending";

        const status = enquiry.status;

        if (status === "PENDING") {
            return step <= 2 ? "completed" : "pending";
        }

        if (status === "ACCEPTED") {
            return step <= 3 ? "completed" : "pending";
        }

        if (status === "CONVERTED_TO_ORDER") {
            return "completed";
        }

        if (status === "REJECTED") {
            return step <= 2 ? "completed" : "pending";
        }

        return "pending";
    };

    /* =====================================================
       NO ENQUIRY SELECTED
    ===================================================== */

    if (!id) {
        return (
            <div className="painter-shop-enquiry-details-page">

                <div className="painter-shop-enquiry-details-header">
                    <h1>Enquiry Details</h1>

                    <p>
                        Painter App <span>/</span> Shop{" "}
                        <span>/</span> Enquiry Details
                    </p>
                </div>

                <div className="painter-shop-enquiry-details-card">
                    <div className="painter-shop-enquiry-details-empty">
                        <h2>Please select an enquiry</h2>

                        <p>
                            Please select an enquiry from Enquiry
                            History to view its details.
                        </p>
                    </div>
                </div>

            </div>
        );
    }

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
        return (
            <div className="painter-shop-enquiry-details-page">
                <div className="painter-shop-enquiry-details-loading">
                    Loading enquiry details...
                </div>
            </div>
        );
    }

    /* =====================================================
       ENQUIRY NOT FOUND
    ===================================================== */

    if (!enquiry) {
        return (
            <div className="painter-shop-enquiry-details-page">

                <div className="painter-shop-enquiry-details-header">
                    <h1>Enquiry Details</h1>

                    <p>
                        Painter App <span>/</span> Shop{" "}
                        <span>/</span> Enquiry Details
                    </p>
                </div>

                <div className="painter-shop-enquiry-details-card">
                    <div className="painter-shop-enquiry-details-empty">
                        <h2>Enquiry not found</h2>

                        <p>
                            The selected enquiry could not be
                            found.
                        </p>
                    </div>
                </div>

            </div>
        );
    }

    /* =====================================================
       ENQUIRY DETAILS
    ===================================================== */

    return (
        <div className="painter-shop-enquiry-details-page">

            {/* HEADER */}
            <div className="painter-shop-enquiry-details-header">
                <h1>
                    Enquiry Details •{" "}
                    {getEnquiryId(enquiry._id)}
                </h1>

                <p>
                    Painter App <span>/</span> Shop{" "}
                    <span>/</span> Enquiry Details
                </p>
            </div>

            {/* DETAILS CARD */}
            <div className="painter-shop-enquiry-details-card">

                {/* DEALER */}
                <div className="painter-shop-enquiry-detail-row">
                    <span className="painter-shop-enquiry-detail-label">
                        Dealer
                    </span>

                    <span className="painter-shop-enquiry-detail-value">
                        {enquiry.preferredDealer?.name || "-"}
                    </span>
                </div>

                {/* SUBMITTED */}
                <div className="painter-shop-enquiry-detail-row">
                    <span className="painter-shop-enquiry-detail-label">
                        Submitted
                    </span>

                    <span className="painter-shop-enquiry-detail-value">
                        {formatDate(enquiry.createdAt)}
                        {" • "}
                        ₹
                        {Number(
                            enquiry.value || 0
                        ).toLocaleString("en-IN")}
                    </span>
                </div>

                {/* STATUS TRACKING */}
                <div className="painter-shop-enquiry-tracking">

                    <h2>Status</h2>

                    <div className="painter-shop-enquiry-timeline">

                        {/* STEP 1 */}
                        <div
                            className={`painter-shop-enquiry-timeline-item ${getStepStatus(1)}`}
                        >
                            <div className="painter-shop-enquiry-timeline-dot">
                                ✓
                            </div>

                            <div className="painter-shop-enquiry-timeline-content">
                                <h3>
                                    Enquiry Submitted
                                </h3>

                                <p>
                                    Your enquiry has been
                                    submitted successfully.
                                </p>
                            </div>
                        </div>

                        {/* STEP 2 */}
                        <div
                            className={`painter-shop-enquiry-timeline-item ${getStepStatus(2)}`}
                        >
                            <div className="painter-shop-enquiry-timeline-dot">
                                ✓
                            </div>

                            <div className="painter-shop-enquiry-timeline-content">
                                <h3>
                                    Dealer Reviewing
                                </h3>

                                <p>
                                    Dealer is reviewing your
                                    enquiry.
                                </p>
                            </div>
                        </div>

                        {/* STEP 3 */}
                        <div
                            className={`painter-shop-enquiry-timeline-item ${getStepStatus(3)}`}
                        >
                            <div className="painter-shop-enquiry-timeline-dot">
                                ✓
                            </div>

                            <div className="painter-shop-enquiry-timeline-content">
                                <h3>
                                    Accepted
                                </h3>

                                <p>
                                    Enquiry accepted by dealer.
                                </p>
                            </div>
                        </div>

                        {/* STEP 4 */}
                        <div
                            className={`painter-shop-enquiry-timeline-item ${getStepStatus(4)}`}
                        >
                            <div className="painter-shop-enquiry-timeline-dot">
                                ✓
                            </div>

                            <div className="painter-shop-enquiry-timeline-content">
                                <h3>
                                    Order Converted
                                </h3>

                                <p>
                                    Enquiry converted into an
                                    order.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* PRODUCTS */}
                <div className="painter-shop-enquiry-products">

                    <h2>Products</h2>

                    {enquiry.products?.map((item) => (
                        <div
                            className="painter-shop-enquiry-product-row"
                            key={item._id}
                        >
                            <span>
                                {item.product?.productName ||
                                    "Product"}
                            </span>

                            <span>
                                Qty: {item.quantity}
                            </span>
                        </div>
                    ))}

                </div>

            </div>
        </div>
    );
};

export default PainterShopEnquiryDetails;