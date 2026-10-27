import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import "../../css/painter/PainterProductVerification.css";

const API_URL = import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com";

const PainterProductVerification = () => {
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchVerification = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const historyResponse = await fetch(
        `${API_URL}/api/painter/scan-history`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const historyData = await historyResponse.json();

      if (!historyResponse.ok) {
        throw new Error(
          historyData.message || "Failed to fetch scan history"
        );
      }

      const latestScan = historyData.history?.[0];

      if (!latestScan?.code) {
        throw new Error(
          "No scan record available for verification"
        );
      }

      const verificationResponse = await fetch(
        `${API_URL}/api/painter/product-verification/${latestScan.code}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const verificationData = await verificationResponse.json();

      if (!verificationResponse.ok) {
        throw new Error(
          verificationData.message || "Failed to verify product"
        );
      }

      setVerification(
        verificationData.verification || null
      );
    } catch (err) {
      console.error("Product verification error:", err);
      toast.error(
        err.message || "Failed to verify product"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerification();
  }, []);

  const renderCheckStatus = (value) => {
    if (value === null || value === undefined) {
      return (
        <span className="painter-product-verification-check-na">
          N/A
        </span>
      );
    }

    if (value === "Passed" || value === "Clear") {
      return (
        <span className="painter-product-verification-status success">
          <CheckCircle2 size={15} />
          {value}
        </span>
      );
    }

    if (value === "Failed" || value === "Duplicate") {
      return (
        <span className="painter-product-verification-status failed">
          <XCircle size={15} />
          {value}
        </span>
      );
    }

    return (
      <span className="painter-product-verification-status">
        {value}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="painter-product-verification-page">
        <div className="painter-product-verification-header">
          <div>
            <h1>Product Verification</h1>
            <p>Oneplus Spark PAINTS • Painter experience</p>
          </div>
        </div>

        <div className="painter-product-verification-loading">
          Verifying product...
        </div>
      </div>
    );
  }

  const product = verification?.product;
  const batch = verification?.batch;
  const checks = verification?.checks || {};

  return (
    <div className="painter-product-verification-page">
      <div className="painter-product-verification-header">
        <div>
          <h1>Product Verification</h1>
          <p>Oneplus Spark PAINTS • Painter experience</p>
        </div>
      </div>

      <div className="painter-product-verification-card">
        <div className="painter-product-verification-title">
          <div className="painter-product-verification-title-icon">
            <ShieldCheck size={21} />
          </div>

          <div>
            <h2>Product Verification</h2>
            <p>Verify product authenticity and details</p>
          </div>
        </div>

        <div className="painter-product-verification-details">
          <div className="painter-product-verification-detail">
            <span>Product</span>
            <strong>{product?.productName || "-"}</strong>
          </div>

          <div className="painter-product-verification-detail">
            <span>Batch</span>
            <strong>{batch?.batchNumber || "-"}</strong>
          </div>

          <div className="painter-product-verification-detail">
            <span>Reward</span>
            <strong>
              {verification?.rewardPoints ?? 0} Points
            </strong>
          </div>
        </div>

        <div className="painter-product-verification-checks">
          <h3>Verification Checks</h3>

          <div className="painter-product-verification-check-item">
            <div>
              <span>QR Authenticity</span>
              <small>Product barcode verification</small>
            </div>

            {renderCheckStatus(checks.qrAuthenticity)}
          </div>

          <div className="painter-product-verification-check-item">
            <div>
              <span>Duplicate Scan</span>
              <small>Previous scan verification</small>
            </div>

            {renderCheckStatus(checks.duplicateScan)}
          </div>

          <div className="painter-product-verification-check-item">
            <div>
              <span>Expiry Validation</span>
              <small>Product expiry verification</small>
            </div>

            {renderCheckStatus(checks.expiryValidation)}
          </div>

          <div className="painter-product-verification-check-item">
            <div>
              <span>Device Risk</span>
              <small>Device risk verification</small>
            </div>

            {renderCheckStatus(checks.deviceRisk)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PainterProductVerification;