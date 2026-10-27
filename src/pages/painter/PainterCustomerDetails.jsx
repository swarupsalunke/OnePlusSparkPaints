import React, { useState } from "react";
import { toast } from "sonner";
import "../../css/painter/PainterCustomerDetails.css";

const PainterCustomerDetails = () => {
  const [customer, setCustomer] = useState({
    name: "",
    mobile: "",
    city: "",
    productInterest: "",
    estimatedBusiness: "",
    source: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com";

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/painter/customers`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: customer.name,
            mobile: customer.mobile,
            city: customer.city,
            productInterest: customer.productInterest,
            estimatedBusiness: Number(customer.estimatedBusiness),
            source: customer.source,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Customer details submitted successfully");

        setCustomer({
          name: "",
          mobile: "",
          city: "",
          productInterest: "",
          estimatedBusiness: "",
          source: "",
        });
      } else {
        toast.error(
          data.message || "Failed to submit customer details"
        );
      }
    } catch (error) {
      console.error("Failed to submit customer:", error);
      toast.error("Failed to submit customer details");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="painter-customer-details-page">
      <div className="painter-customer-details-header">
        <h1>Customer Details</h1>
        <p>Oneplus Spark PAINTS • Painter experience</p>
      </div>

      <div className="painter-customer-details-card">
        <h2>Customer Details</h2>

        <form
          className="painter-customer-details-form"
          onSubmit={handleSubmit}
        >
          <div className="painter-customer-detail-field">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={customer.name}
              onChange={handleChange}
              placeholder="Enter customer name"
              required
            />
          </div>

          <div className="painter-customer-detail-field">
            <label>Mobile</label>
            <input
              type="text"
              name="mobile"
              value={customer.mobile}
              onChange={handleChange}
              placeholder="Enter mobile number"
              required
            />
          </div>

          <div className="painter-customer-detail-field">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={customer.city}
              onChange={handleChange}
              placeholder="Enter city"
              required
            />
          </div>

          <div className="painter-customer-detail-field">
            <label>Product Interest</label>
            <input
              type="text"
              name="productInterest"
              value={customer.productInterest}
              onChange={handleChange}
              placeholder="Enter product interest"
              required
            />
          </div>

          <div className="painter-customer-detail-field">
            <label>Estimated Business</label>
            <input
              type="number"
              name="estimatedBusiness"
              value={customer.estimatedBusiness}
              onChange={handleChange}
              placeholder="Enter estimated business"
              min="0"
              required
            />
          </div>

          <div className="painter-customer-detail-field">
            <label>Source</label>
            <input
              type="text"
              name="source"
              value={customer.source}
              onChange={handleChange}
              placeholder="Enter source"
              required
            />
          </div>

          <div className="painter-customer-details-submit">
            <button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PainterCustomerDetails;