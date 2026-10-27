import React, { useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import "../../css/painter/PainterManualCodeEntry.css";

const API_URL = import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com";

const PainterManualCodeEntry = () => {
  const navigate = useNavigate();

  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      toast.error("Please enter the 6-digit code.");
      return;
    }

    if (!/^\d{6}$/.test(verificationCode.trim())) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/painter/manual-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            verificationCode: verificationCode.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to verify code"
        );
      }

      if (data.verificationStatus === "VALID") {
        navigate("/painter/scan-result", {
          state: data,
        });
      } else if (
        data.verificationStatus === "DUPLICATE"
      ) {
        navigate("/painter/duplicate-qr", {
          state: data,
        });
      } else {
        navigate("/painter/invalid-qr", {
          state: data,
        });
      }
    } catch (err) {
      console.error("Manual code verification error:", err);
      toast.error(
        err.message || "Failed to verify code"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="painter-manual-code-page">
      {/* Header */}
      <div className="painter-manual-code-header">
        <div>
          <h1>Manual Code Entry</h1>
          <p>
            Oneplus Spark PAINTS • Painter experience
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="painter-manual-code-card">
        <div className="painter-manual-code-icon">
          <CheckCircle2 size={20} />
        </div>

        <h2>Enter Verification Code</h2>

        <p className="painter-manual-code-description">
          Enter the 6-digit code printed on the product
          label.
        </p>

        <div className="painter-manual-code-input-group">
          <label htmlFor="verificationCode">
            Verification Code
          </label>

          <input
            id="verificationCode"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={verificationCode}
            onChange={(e) => {
              const value = e.target.value.replace(
                /\D/g,
                ""
              );

              setVerificationCode(value);
            }}
            placeholder="Enter 6-digit code"
          />
        </div>

        <button
          type="button"
          className="painter-manual-code-verify-btn"
          onClick={handleVerifyCode}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify Code"}
        </button>

        <button
          type="button"
          className="painter-manual-code-back-btn"
          onClick={() =>
            navigate("/painter/barcode-scanner")
          }
        >
          <ArrowLeft size={15} />
          <span>Back to Scanner</span>
        </button>
      </div>

      {/* Security Info */}
      <div className="painter-manual-code-security">
        <div className="painter-manual-code-security-icon">
          <CheckCircle2 size={16} />
        </div>

        <div>
          <h3>Fraud Protection Active</h3>
          <p>
            Codes are verified against Oneplus Spark
            PAINTS records.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PainterManualCodeEntry;