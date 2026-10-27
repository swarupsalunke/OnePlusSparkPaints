import React, { useEffect, useRef, useState } from "react";
import {
  Camera,
  QrCode,
  ScanLine,
  X,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";
import "../../css/painter/PainterQuickScan.css";

const PainterQuickScan = () => {
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);

  const scannerRef = useRef(null);
  const scannerRunningRef = useRef(false);
  const processingScanRef = useRef(false);

  const API_URL =
    import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com/api";

  // ==========================================
  // SUBMIT SCAN TO BACKEND
  // ==========================================

  const submitScan = async (scanCode, scanType) => {
    if (!scanCode || processingScanRef.current) {
      return;
    }

    try {
      processingScanRef.current = true;
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
            scanType,
          }),
        }
      );

      const data = await response.json();

      if (data.scanStatus === "VALID") {
        toast.success("Product scanned successfully.");

        setManualCode("");
        setShowManualInput(false);

        await stopCamera();
      } else if (data.scanStatus === "DUPLICATE") {
        toast.error(
          data.message || "This code has already been scanned."
        );

        await stopCamera();
      } else if (data.scanStatus === "INVALID") {
        toast.error(
          data.message ||
            "Invalid barcode. Product could not be verified."
        );
      } else {
        toast.error(
          data.message || "Failed to process scan."
        );
      }
    } catch (error) {
      console.error("Scan submission error:", error);

      toast.error("Unable to connect to server.");

      await stopCamera();
    } finally {
      setLoading(false);
      processingScanRef.current = false;
    }
  };

  // ==========================================
  // QR / BARCODE DETECTED
  // ==========================================

  const handleScanSuccess = async (
    decodedText,
    decodedResult
  ) => {
    if (
      !decodedText ||
      processingScanRef.current
    ) {
      return;
    }

    let scanType = "BARCODE";

    const detectedFormat =
      decodedResult?.result?.format?.format;

    if (
      detectedFormat ===
      Html5QrcodeSupportedFormats.QR_CODE
    ) {
      scanType = "QR";
    }

    await submitScan(
      decodedText,
      scanType
    );
  };

  // ==========================================
  // CAMERA ERROR CALLBACK
  // ==========================================

  const handleScanError = () => {
    // Scanner continuously calls this while
    // no code is detected, so don't show errors here.
  };

  // ==========================================
  // START CAMERA
  // ==========================================

  const startCamera = async () => {
    if (scannerRunningRef.current) {
      return;
    }

    try {
      setCameraLoading(true);

      const scannerId =
        "painter-quick-scan-reader";

      const scanner = new Html5Qrcode(
        scannerId
      );

      scannerRef.current = scanner;

      const formatsToSupport = [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.CODE_93,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.ITF,
      ];

      const config = {
        fps: 10,
        qrbox: {
          width: 250,
          height: 180,
        },
        aspectRatio: 1.777778,
        formatsToSupport,
        rememberLastUsedCamera: true,
      };

      await scanner.start(
        {
          facingMode: "environment",
        },
        config,
        handleScanSuccess,
        handleScanError
      );

      scannerRunningRef.current = true;
      setCameraActive(true);

      toast.info(
        "Camera is ready. Align the QR / barcode inside the frame."
      );
    } catch (error) {
      console.error(
        "Camera start error:",
        error
      );

      scannerRef.current = null;
      scannerRunningRef.current = false;
      setCameraActive(false);

      let errorMessage =
        "Unable to open camera.";

      if (
        error?.message
          ?.toLowerCase()
          .includes("permission")
      ) {
        errorMessage =
          "Camera permission denied. Please allow camera access in your browser.";
      } else if (
        error?.message
          ?.toLowerCase()
          .includes("not found")
      ) {
        errorMessage =
          "No camera found on this device.";
      }

      toast.error(errorMessage);
    } finally {
      setCameraLoading(false);
    }
  };

  // ==========================================
  // STOP CAMERA
  // ==========================================

  const stopCamera = async () => {
    const scanner = scannerRef.current;

    if (!scanner) {
      setCameraActive(false);
      scannerRunningRef.current = false;
      return;
    }

    try {
      if (scannerRunningRef.current) {
        await scanner.stop();
      }

      scanner.clear();
    } catch (error) {
      console.error(
        "Camera stop error:",
        error
      );
    } finally {
      scannerRef.current = null;
      scannerRunningRef.current = false;
      setCameraActive(false);
    }
  };

  // ==========================================
  // TOGGLE CAMERA
  // ==========================================

  const handleCameraToggle = async () => {
    if (cameraActive) {
      await stopCamera();

      toast.info("Camera scanner closed.");
    } else {
      await startCamera();
    }
  };

  // ==========================================
  // MANUAL CODE SUBMIT
  // ==========================================

  const handleManualSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(manualCode)) {
      toast.error(
        "Please enter a valid 6-digit code."
      );
      return;
    }

    await submitScan(
      manualCode,
      "BARCODE"
    );
  };

  // ==========================================
  // CLEANUP CAMERA
  // ==========================================

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current = null;
            scannerRunningRef.current = false;
          });
      }
    };
  }, []);

  return (
    <div className="painter-quick-scan">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="painter-quick-scan-header">
        <div>
          <h1>Quick Scan</h1>

          <p>
            Oneplus Spark PAINTS • Painter experience
          </p>
        </div>
      </div>

      {/* ==========================================
          SCAN CARD
      ========================================== */}

      <div className="painter-quick-scan-card">

        <div className="painter-scan-title">
          <h2>Scan Product</h2>

          <p>
            Align the QR / barcode inside the frame
          </p>
        </div>

        {/* ==========================================
            CAMERA / SCANNER
        ========================================== */}

        <div
          className={`painter-scan-frame ${
            cameraActive
              ? "camera-active"
              : ""
          }`}
        >
          {!cameraActive && (
            <div className="painter-scan-placeholder">
              <ScanLine size={34} />

              <span>
                QR / BARCODE
              </span>

              <small>
                Open camera to start scanning
              </small>
            </div>
          )}

          <div
            id="painter-quick-scan-reader"
            className="painter-camera-reader"
          />

          {cameraActive && (
            <div className="painter-scanner-overlay">
              <div className="painter-scanner-corners" />

              <span>
                Scan QR / Barcode
              </span>
            </div>
          )}
        </div>

        {/* ==========================================
            CAMERA BUTTON
        ========================================== */}

        <button
          type="button"
          className={`painter-open-camera-btn ${
            cameraActive
              ? "camera-open"
              : ""
          }`}
          onClick={handleCameraToggle}
          disabled={
            cameraLoading || loading
          }
        >
          {cameraActive ? (
            <>
              <X size={17} />
              <span>Close Camera</span>
            </>
          ) : cameraLoading ? (
            <>
              <RefreshCw
                size={17}
                className="painter-spin"
              />
              <span>
                Opening Camera...
              </span>
            </>
          ) : (
            <>
              <Camera size={17} />
              <span>
                Open Camera
              </span>
            </>
          )}
        </button>

        {/* ==========================================
            MANUAL CODE BUTTON
        ========================================== */}

        <button
          type="button"
          className="painter-manual-code-btn"
          onClick={() => {
            setShowManualInput(
              (prev) => !prev
            );
          }}
          disabled={loading}
        >
          {showManualInput
            ? "Hide Manual Code"
            : "Manual 6-digit code"}
        </button>

        {/* ==========================================
            MANUAL INPUT
        ========================================== */}

        {showManualInput && (
          <form
            className="painter-manual-code-form"
            onSubmit={handleManualSubmit}
          >
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit code"
              value={manualCode}
              disabled={loading}
              onChange={(e) =>
                setManualCode(
                  e.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
            />

            <button
              type="submit"
              disabled={
                loading ||
                manualCode.length !== 6
              }
            >
              {loading
                ? "Scanning..."
                : "Scan Code"}
            </button>
          </form>
        )}

      </div>

      {/* ==========================================
          MOBILE CAMERA NOTE
      ========================================== */}

      <div className="painter-camera-note">
        <Camera size={14} />

        <span>
          For the best experience, allow camera
          permission and use the rear camera on
          mobile.
        </span>
      </div>

      {/* ==========================================
          FOOTER
      ========================================== */}

      <div className="painter-quick-scan-footer">
        © Oneplus Spark PAINTS • Painter Mobile App UI
      </div>

    </div>
  );
};

export default PainterQuickScan;