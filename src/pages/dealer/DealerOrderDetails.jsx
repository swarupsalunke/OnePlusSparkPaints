import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Package,
  Truck,
  XCircle,
  MapPin,
  Clock,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import "../../css/dealer/DealerOrderDetails.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com";

const SERVER_URL = API_BASE_URL;

const DealerOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_BASE_URL}/api/dealer/orders/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrder(response.data.order);
    } catch (error) {
      console.error("Fetch order details error:", error);

      setError(
        error.response?.data?.message || "Failed to load order details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      setCancelling(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${API_BASE_URL}/api/dealer/orders/${id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrder(response.data.order);
    } catch (error) {
      console.error("Cancel order error:", error);

      setError(
        error.response?.data?.message || "Failed to cancel order"
      );
    } finally {
      setCancelling(false);
    }
  };

  const getStatusClass = (status) => {
    return status?.toLowerCase().replace(/\s+/g, "-") || "";
  };

  const trackingSteps = [
    "Submitted",
    "Under Review",
    "Approved",
    "Processing",
    "Dispatched",
    "Delivered",
  ];

  const getTrackingDate = (status) => {
    const tracking = order?.trackingHistory?.find(
      (item) => item.status === status
    );

    return tracking?.date;
  };

  if (loading) {
    return (
      <div className="dealer-order-details-page">
        <div className="dealer-order-details-message">
          Loading order details...
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="dealer-order-details-page">
        <button
          type="button"
          className="dealer-order-details-back-btn"
          onClick={() => navigate("/dealer/order-history")}
        >
          <ArrowLeft size={18} />
          Back to Orders
        </button>

        <div className="dealer-order-details-message dealer-order-details-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="dealer-order-details-page">
      <div className="dealer-order-details-header">
        <div>
          <button
            type="button"
            className="dealer-order-details-back-btn"
            onClick={() => navigate("/dealer/order-history")}
          >
            <ArrowLeft size={18} />
            Back to Orders
          </button>

          <h1>Order Details</h1>
          <p>View complete information about your order</p>
        </div>

        <div className="dealer-order-details-header-actions">
          <button
            type="button"
            className="dealer-order-track-btn"
            onClick={() => setTrackingOpen(true)}
          >
            <Truck size={17} />
            Track Order
          </button>

          {order.status !== "Cancelled" &&
            order.status !== "Delivered" && (
              <button
                type="button"
                className="dealer-order-cancel-btn"
                onClick={handleCancelOrder}
                disabled={cancelling}
              >
                <XCircle size={17} />
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            )}
        </div>
      </div>

      {error && (
        <div className="dealer-order-details-inline-error">
          {error}
        </div>
      )}

      <div className="dealer-order-details-summary">
        <div>
          <span>Order ID</span>
          <strong>{order.orderId}</strong>
        </div>

        <div>
          <span>Order Date</span>
          <strong>{formatDate(order.createdAt)}</strong>
        </div>

        <div>
          <span>Total Items</span>
          <strong>{order.items?.length || 0}</strong>
        </div>

        <div>
          <span>Total Amount</span>
          <strong>₹{order.totalAmount}</strong>
        </div>

        <div>
          <span>Status</span>
          <strong
            className={`dealer-order-details-status ${getStatusClass(
              order.status
            )}`}
          >
            {order.status}
          </strong>
        </div>
      </div>

      <section className="dealer-order-details-section">
        <div className="dealer-order-details-section-header">
          <div>
            <h2>Ordered Products</h2>
            <p>Products included in this order</p>
          </div>
        </div>

        <div className="dealer-order-details-products">
          {order.items?.map((item, index) => {
            const product = item.product;

            return (
              <div
                className="dealer-order-details-product"
                key={`${item.product?._id || item.sku}-${index}`}
              >
                <div className="dealer-order-details-product-image">
                  {product?.image ? (
                    <img
                      src={`${SERVER_URL}${product.image}`}
                      alt={item.productName}
                    />
                  ) : (
                    <Package size={42} />
                  )}
                </div>

                <div className="dealer-order-details-product-info">
                  <span>{product?.category || "-"}</span>

                  <h3>{item.productName}</h3>

                  <p>SKU: {item.sku || "-"}</p>

                  <p>
                    Packing: {product?.packingSize || "-"}
                  </p>
                </div>

                <div className="dealer-order-details-product-quantity">
                  <span>Quantity</span>
                  <strong>{item.quantity}</strong>
                </div>

                <div className="dealer-order-details-product-price">
                  <span>Price</span>
                  <strong>₹{item.price}</strong>
                </div>

                <div className="dealer-order-details-product-total">
                  <span>Total</span>
                  <strong>₹{item.total}</strong>
                </div>
              </div>
            );
          })}
        </div>

        <div className="dealer-order-details-total">
          <span>Order Total</span>
          <strong>₹{order.totalAmount}</strong>
        </div>
      </section>

      <section className="dealer-order-details-section">
        <div className="dealer-order-details-section-header">
          <div>
            <h2>Order Information</h2>
            <p>Order status and timeline information</p>
          </div>
        </div>

        <div className="dealer-order-details-info-grid">
          <div>
            <Clock size={18} />
            <div>
              <span>Created At</span>
              <strong>{formatDateTime(order.createdAt)}</strong>
            </div>
          </div>

          <div>
            <MapPin size={18} />
            <div>
              <span>Last Updated</span>
              <strong>{formatDateTime(order.updatedAt)}</strong>
            </div>
          </div>

          <div>
            <Truck size={18} />
            <div>
              <span>Current Status</span>
              <strong>{order.status}</strong>
            </div>
          </div>
        </div>
      </section>

      {trackingOpen && (
        <div
          className="dealer-order-tracking-overlay"
          onClick={() => setTrackingOpen(false)}
        >
          <div
            className="dealer-order-tracking-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dealer-order-tracking-header">
              <div>
                <h2>Order Tracking</h2>
                <p>{order.orderId}</p>
              </div>

              <button
                type="button"
                onClick={() => setTrackingOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="dealer-order-tracking-timeline">
              {order.status === "Cancelled" ? (
                <>
                  {order.trackingHistory?.map((item, index) => (
                    <div
                      className="dealer-order-tracking-step completed"
                      key={`${item.status}-${index}`}
                    >
                      <div className="dealer-order-tracking-icon">
                        <Package size={16} />
                      </div>

                      <div className="dealer-order-tracking-content">
                        <strong>{item.status}</strong>
                        <span>{formatDateTime(item.date)}</span>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                trackingSteps.map((step, index) => {
                  const stepDate = getTrackingDate(step);
                  const isCompleted = Boolean(stepDate);

                  return (
                    <div
                      className={`dealer-order-tracking-step ${
                        isCompleted ? "completed" : ""
                      }`}
                      key={step}
                    >
                      <div className="dealer-order-tracking-icon">
                        {isCompleted ? (
                          <Package size={16} />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>

                      <div className="dealer-order-tracking-content">
                        <strong>{step}</strong>

                        <span>
                          {stepDate
                            ? formatDateTime(stepDate)
                            : "Pending"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealerOrderDetails;