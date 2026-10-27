import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../css/painter/PainterShopEnquiryHistory.css";

const PainterShopEnquiryHistory = () => {
    const navigate = useNavigate();

    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEnquiries = async () => {
            try {
                setLoading(true);

                const token = localStorage.getItem("token");

                const response = await axios.get(
                    "https://oneplussparkpaintsserver.onrender.com/api/painter/shop-enquiries",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data.success) {
                    setEnquiries(response.data.enquiries || []);
                }
            } catch (error) {
                console.error(
                    "Enquiry history fetch error:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchEnquiries();
    }, []);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getEnquiryId = (id) => {
        return `ENQ-${id.slice(-4).toUpperCase()}`;
    };

    const getProductNames = (products) => {
        return products
            .map((item) => item.product?.productName)
            .filter(Boolean)
            .join(", ");
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "PENDING":
                return "New";

            case "ACCEPTED":
                return "Accepted";

            case "REJECTED":
                return "Rejected";

            case "CONVERTED_TO_ORDER":
                return "Converted";

            default:
                return status;
        }
    };

    const handleEnquiryClick = (enquiryId) => {
        navigate(
            `/painter/shop-enquiry-details/${enquiryId}`
        );
    };

    return (
        <div className="painter-shop-enquiry-history-page">

            {/* HEADER */}
            <div className="painter-shop-enquiry-history-header">
                <h1>Enquiry History</h1>

                <p>
                    Painter App <span>/</span> Shop{" "}
                    <span>/</span> Enquiry History
                </p>
            </div>

            {/* TABLE CARD */}
            <div className="painter-shop-enquiry-history-card">

                <div className="painter-shop-enquiry-history-card-header">
                    <h2>Enquiry History</h2>
                </div>

                {loading ? (
                    <div className="painter-shop-enquiry-history-loading">
                        Loading enquiries...
                    </div>
                ) : enquiries.length === 0 ? (
                    <div className="painter-shop-enquiry-history-empty">
                        No enquiries found.
                    </div>
                ) : (
                    <div className="painter-shop-enquiry-history-table-wrapper">
                        <table className="painter-shop-enquiry-history-table">
                            <thead>
                                <tr>
                                    <th>Enquiry ID</th>
                                    <th>Date</th>
                                    <th>Products</th>
                                    <th>Value</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {enquiries.map((enquiry) => (
                                    <tr
                                        key={enquiry._id}
                                        onClick={() =>
                                            handleEnquiryClick(
                                                enquiry._id
                                            )
                                        }
                                        className="painter-shop-enquiry-history-clickable-row"
                                    >
                                        <td>
                                            {getEnquiryId(
                                                enquiry._id
                                            )}
                                        </td>

                                        <td>
                                            {formatDate(
                                                enquiry.createdAt
                                            )}
                                        </td>

                                        <td>
                                            {getProductNames(
                                                enquiry.products
                                            )}
                                        </td>

                                        <td>
                                            ₹
                                            {Number(
                                                enquiry.value || 0
                                            ).toLocaleString(
                                                "en-IN"
                                            )}
                                        </td>

                                        <td>
                                            <span
                                                className={`painter-shop-enquiry-status painter-shop-enquiry-status-${enquiry.status.toLowerCase()}`}
                                            >
                                                {getStatusLabel(
                                                    enquiry.status
                                                )}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
        </div>
    );
};

export default PainterShopEnquiryHistory;