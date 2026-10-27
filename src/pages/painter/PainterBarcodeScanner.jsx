import React, { useState } from "react";
import {
  ScanLine,
  Camera,
  Keyboard,
  History,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import "../../css/painter/PainterBarcodeScanner.css";

const API_URL = import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com";

const PainterBarcodeScanner = () => {
  const navigate = useNavigate();

  const [scanCode, setScanCode] = useState("");
  const [loading, setLoading] = useState(false);

  const scanOptions = [
    {
      number: "1",
      title: "Camera Flash",
      description: "Enable torch for low light",
      icon: Camera,
    },
    {
      number: "2",
      title: "Manual Code",
      description: "Enter 6-digit code",
      icon: Keyboard,
      action: () => navigate("/painter/manual-code-entry"),
    },
    {
      number: "3",
      title: "Scan History",
      description: "Review previous scans",
      icon: History,
      action: () => navigate("/painter/scan-history"),
    },
    {
      number: "4",
      title: "Fraud Protection",
      description: "Duplicate & fake QR checks",
      icon: ShieldCheck,
    },
  ];

  const handleCaptureVerify = async () => {
    if (!scanCode.trim()) {
      toast.error("Please enter or scan a barcode.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/painter/barcode-scan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            scanCode: scanCode.trim(),
            scanType: "BARCODE",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to verify barcode"
        );
      }

      if (data.scanStatus === "VALID") {
        navigate("/painter/scan-result", {
          state: data,
        });
      } else if (data.scanStatus === "DUPLICATE") {
        navigate("/painter/duplicate-qr", {
          state: data,
        });
      } else {
        navigate("/painter/invalid-qr", {
          state: data,
        });
      }
    } catch (err) {
      console.error("Barcode verification error:", err);
      toast.error(err.message || "Failed to verify barcode");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="painter-barcode-scanner-page">
      {/* Page Header */}
      <div className="painter-barcode-scanner-header">
        <div>
          <h1>Barcode Scanner</h1>
          <p>Oneplus Spark PAINTS • Painter experience</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="painter-barcode-scanner-content">
        {/* Scanner Card */}
        <div className="painter-barcode-scanner-card">
          <h2>Barcode Scanner</h2>

          <div className="painter-barcode-scan-area">
            <div className="painter-barcode-lines">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>

            <input
              type="text"
              value={scanCode}
              onChange={(e) => {
                setScanCode(e.target.value);
              }}
              placeholder="Scan barcode"
              className="painter-barcode-input"
            />
          </div>

          <button
            type="button"
            className="painter-barcode-capture-btn"
            onClick={handleCaptureVerify}
            disabled={loading}
          >
            <ScanLine size={15} />

            <span>
              {loading
                ? "Verifying..."
                : "Capture & Verify"}
            </span>
          </button>
        </div>

        {/* Scan Options */}
        <div className="painter-barcode-options-card">
          <h2>Scan Options</h2>

          <div className="painter-barcode-options-list">
            {scanOptions.map((option) => {
              const Icon = option.icon;

              return (
                <button
                  type="button"
                  className="painter-barcode-option-item"
                  key={option.number}
                  onClick={option.action}
                  disabled={!option.action}
                >
                  <div className="painter-barcode-option-number">
                    {option.number}
                  </div>

                  <div className="painter-barcode-option-content">
                    <div className="painter-barcode-option-title">
                      <Icon size={16} />
                      <span>{option.title}</span>
                    </div>

                    <p>{option.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PainterBarcodeScanner;