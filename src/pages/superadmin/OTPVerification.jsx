import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../css/superadmin/otpverification.css";

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const identifier = location.state?.identifier || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(45);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");

  const inputRefs = useRef([]);

  // Countdown
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // OTP input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);

    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Backspace
  const handleKeyDown = (index, e) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Paste OTP
  const handlePaste = (e) => {
    e.preventDefault();

    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedData) return;

    const newOtp = ["", "", "", "", "", ""];

    pastedData.split("").forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);

    inputRefs.current[nextIndex]?.focus();
  };

  // Verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();

    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    if (!identifier) {
      setError("Session expired. Please request OTP again.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(
        "https://oneplussparkpaintsserver.onrender.com/api/auth/forgot-password/verify-otp",
        {
          identifier,
          otp: otpValue,
        }
      );

      console.log("OTP verification:", response.data);

      navigate("/reset-password", {
        state: {
          resetToken: response.data.resetToken,
        },
      });
    } catch (error) {
      console.error("OTP verification error:", error);

      setError(
        error.response?.data?.message ||
        "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (timer > 0 || !identifier) return;

    try {
      setResending(true);
      setError("");

      await axios.post(
        "https://oneplussparkpaintsserver.onrender.com/api/auth/forgot-password/send-otp",
        {
          identifier,
        }
      );

      setOtp(["", "", "", "", "", ""]);
      setTimer(45);

      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error("Resend OTP error:", error);

      setError(
        error.response?.data?.message ||
        "Unable to resend OTP."
      );
    } finally {
      setResending(false);
    }
  };

  // If user directly opens /verify-otp
  if (!identifier) {
    return (
      <div className="otp-page">
        <div className="otp-error-page">
          <h2>Session Expired</h2>

          <p>
            Please go back and request a new OTP.
          </p>

          <Link to="/forgot-password">
            Back to Forgot Password
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="otp-page">

      {/* LEFT SIDE */}

      <div className="otp-left">

        <div className="otp-brand">
          <span>Oneplus</span>
          <strong>Spark</strong>
          <small>PAINTS</small>
        </div>

        <div className="otp-left-content">

          <p className="otp-small-title">
            Secure Verification
          </p>

          <h1>
            Verify your <span>identity</span>
          </h1>

          <div className="otp-line"></div>

          <p>
            We've sent a 6-digit verification code to your
            registered mobile number or email address.
          </p>

          <div className="otp-security-card">
            <ShieldCheck size={28} />

            <div>
              <strong>Secure OTP Verification</strong>

              <span>
                Your verification code is valid for 10 minutes.
              </span>
            </div>
          </div>

        </div>

        <div className="otp-version">
          Version 1.0.0
        </div>

      </div>

      {/* RIGHT SIDE */}

      <div className="otp-right">

        <div className="otp-card">

          <div className="otp-logo">
            <span>Oneplus</span>
            <strong>Spark</strong>
            <small>PAINTS</small>
          </div>

          <h2>Enter Verification Code</h2>

          <p className="otp-subtitle">
            Enter the 6-digit OTP sent to
          </p>

          <p className="otp-identifier">
            {identifier}
          </p>

          <button
            type="button"
            className="change-identifier"
            onClick={() => navigate("/forgot-password")}
          >
            Change
          </button>

          <form onSubmit={handleVerify}>

            <div
              className="otp-inputs"
              onPaste={handlePaste}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) =>
                    handleOtpChange(index, e.target.value)
                  }
                  onKeyDown={(e) =>
                    handleKeyDown(index, e)
                  }
                  autoComplete={
                    index === 0 ? "one-time-code" : "off"
                  }
                />
              ))}
            </div>

            {error && (
              <div className="otp-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="verify-button"
              disabled={loading}
            >
              {loading
                ? "VERIFYING..."
                : "VERIFY OTP"}
            </button>

          </form>

          <div className="resend-section">

            <p>Didn't receive the OTP?</p>

            {timer > 0 ? (
              <span>
                Resend OTP in{" "}
                <strong>
                  00:{String(timer).padStart(2, "0")}
                </strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
              >
                {resending
                  ? "SENDING..."
                  : "RESEND OTP"}
              </button>
            )}

          </div>

          <Link
            to="/"
            className="otp-back-login"
          >
            <ArrowLeft size={18} />
            Back to Login
          </Link>

          <div className="otp-help">
            <strong>Didn't receive the code?</strong>

            <p>
              Check your spam folder or make sure your
              registered mobile number/email is correct.
            </p>
          </div>

          <footer className="otp-footer">
            © 2026 Oneplus Spark Paints. All rights reserved.
            <br />

            <span>Privacy Policy</span>
            <span>Terms & Conditions</span>
          </footer>

        </div>

      </div>

    </div>
  );
};

export default OTPVerification;