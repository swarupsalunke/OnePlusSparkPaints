import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import "../../css/painter/PainterShopSubmitEnquiry.css";

const PainterShopSubmitEnquiry = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [dealer, setDealer] = useState("");
    const [dealers, setDealers] = useState([]);
    const [remarks, setRemarks] = useState("");
    const [loadingDealers, setLoadingDealers] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const items = location.state?.cartItems || [];

        setCartItems(items);

        if (items.length > 0) {
            const totalQuantity = items.reduce(
                (total, item) =>
                    total + (Number(item.quantity) || 0),
                0
            );

            setQuantity(totalQuantity);
        }
    }, [location.state]);

    useEffect(() => {
        const fetchDealers = async () => {
            try {
                setLoadingDealers(true);

                const token = localStorage.getItem("token");

                const response = await axios.get(
                    "https://oneplussparkpaintsserver.onrender.com/api/painter/dealers",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data.success) {
                    setDealers(response.data.dealers || []);
                }
            } catch (error) {
                console.error("Dealers fetch error:", error);

                toast.error(
                    error.response?.data?.message ||
                    "Failed to load dealers"
                );
            } finally {
                setLoadingDealers(false);
            }
        };

        fetchDealers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!dealer) {
            return;
        }

        if (!cartItems.length) {
            return;
        }

        try {
            setSubmitting(true);

            const token = localStorage.getItem("token");

            const products = cartItems.map((item) => ({
                product:
                    item.product?._id ||
                    item.product,
                quantity:
                    Number(item.quantity) || 1,
            }));

            const response = await axios.post(
                "https://oneplussparkpaintsserver.onrender.com/api/painter/shop-enquiries",
                {
                    products,
                    preferredDealer: dealer,
                    remarks,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data.success) {
                toast.success(
                    "Shop enquiry submitted successfully"
                );

                navigate("/painter/shop");
            }
        } catch (error) {
            console.error(
                "Submit shop enquiry error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to submit shop enquiry"
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="painter-shop-submit-enquiry-page">

            {/* HEADER */}
            <div className="painter-shop-submit-enquiry-header">
                <h1>Submit Enquiry</h1>

                <p>
                    Oneplus Spark PAINTS • Painter experience
                </p>
            </div>

            {/* FORM CARD */}
            <div className="painter-shop-submit-enquiry-card">

                <h2>Submit Enquiry</h2>

                <form onSubmit={handleSubmit}>

                    {/* SELECTED PRODUCTS */}
                    <div className="painter-shop-submit-enquiry-field">

                        <label>
                            Selected Products <span>*</span>
                        </label>

                        <input
                            type="text"
                            value={`${cartItems.length} ${
                                cartItems.length === 1
                                    ? "product"
                                    : "products"
                            }`}
                            readOnly
                        />

                    </div>

                    {/* QUANTITY + DEALER */}
                    <div className="painter-shop-submit-enquiry-row">

                        {/* QUANTITY */}
                        <div className="painter-shop-submit-enquiry-field">

                            <label>
                                Quantity <span>*</span>
                            </label>

                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) =>
                                    setQuantity(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        {/* DEALER */}
                        <div className="painter-shop-submit-enquiry-field">

                            <label>
                                Preferred Dealer <span>*</span>
                            </label>

                            <select
                                value={dealer}
                                onChange={(e) =>
                                    setDealer(
                                        e.target.value
                                    )
                                }
                                required
                            >
                                <option value="">
                                    {loadingDealers
                                        ? "Loading dealers..."
                                        : "Select dealer"}
                                </option>

                                {dealers.map((dealer) => (
                                    <option
                                        key={dealer._id}
                                        value={dealer._id}
                                    >
                                        {dealer.name}
                                    </option>
                                ))}
                            </select>

                        </div>

                    </div>

                    {/* REMARKS */}
                    <div className="painter-shop-submit-enquiry-field">

                        <label>
                            Remarks
                        </label>

                        <input
                            type="text"
                            placeholder="Need delivery information"
                            value={remarks}
                            onChange={(e) =>
                                setRemarks(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                    {/* SUBMIT */}
                    <button
                        type="submit"
                        className="painter-shop-submit-enquiry-btn"
                        disabled={submitting}
                    >
                        {submitting
                            ? "Submitting..."
                            : "Submit Enquiry"}
                    </button>

                </form>

            </div>
        </div>
    );
};

export default PainterShopSubmitEnquiry;