import { useState } from "react";
import { ArrowLeft, Mail, Smartphone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../css/superadmin/forgetpassword.css";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!identifier.trim()) {
      setError("Please enter your mobile number or email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "https://oneplussparkpaintsserver.onrender.com/api/auth/forgot-password/send-otp",
        {
          identifier: identifier.trim(),
        }
      );

      console.log("OTP response:", response.data);

      // OTP page par identifier bhejenge
      navigate("/verify-otp", {
        state: {
          identifier: identifier.trim(),
        },
      });
    } catch (error) {
      console.error("Forgot password error:", error);

      setError(
        error.response?.data?.message ||
        "Unable to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">

      {/* Left Side */}
      <div className="forgot-left">

        <div className="forgot-brand">
          <span>Oneplus</span>
          <strong>Spark</strong>
          <small>PAINTS</small>
        </div>

        <div className="forgot-left-content">
          <p>Secure Account Recovery</p>

          <h1>
            Forgot your <span>password?</span>
          </h1>

          <div className="forgot-line"></div>

          <p className="forgot-description">
            No worries! We'll help you reset your password securely.
            Enter your registered mobile number or email address to
            receive an OTP.
          </p>

          <div className="recovery-features">
            <div>
              <span className="feature-icon">
                <Smartphone size={22} />
              </span>

              <div>
                <strong>OTP Verification</strong>
                <p>Secure 6-digit verification</p>
              </div>
            </div>

            <div>
              <span className="feature-icon">
                <Mail size={22} />
              </span>

              <div>
                <strong>Email & Mobile</strong>
                <p>Multiple recovery options</p>
              </div>
            </div>
          </div>
        </div>

        <div className="forgot-version">
          Version 1.0.0
        </div>

      </div>

      {/* Right Side */}
      <div className="forgot-right">

        <div className="forgot-card">

          <div className="forgot-logo">
            <span>Oneplus</span>
            <strong>Spark</strong>
            <small>PAINTS</small>
          </div>

          <h2>Forgot Password?</h2>

          <p className="forgot-subtitle">
            Enter your registered mobile number or email address
            and we'll send you an OTP to verify your identity.
          </p>

          <form onSubmit={handleSubmit}>

            <div className="forgot-form-group">

              <label>Mobile Number or Email Address</label>

              <div className="forgot-input-wrapper">

                <Mail size={20} />

                <input
                  type="text"
                  placeholder="Enter mobile number or email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                />

              </div>

            </div>

            {error && (
              <div className="forgot-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="send-otp-button"
              disabled={loading}
            >
              {loading ? "SENDING OTP..." : "SEND OTP"}
            </button>

          </form>

          <Link to="/" className="back-login">
            <ArrowLeft size={18} />
            Back to Login
          </Link>

          <div className="forgot-security">

            <div className="security-icon">
              🔒
            </div>

            <div>
              <strong>Your information is secure</strong>

              <p>
                We'll never share your personal information.
                Your account security is our priority.
              </p>
            </div>

          </div>

          <footer className="forgot-footer">
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

export default ForgotPassword;