import { useState } from "react";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../css/superadmin/resetpassword.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const resetToken = location.state?.resetToken || "";

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!resetToken) {
      setError(
        "Password reset session has expired. Please request a new OTP."
      );
      return;
    }

    if (!formData.newPassword || !formData.confirmPassword) {
      setError("Please enter both password fields.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Same validation as backend
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(formData.newPassword)) {
      setError(
        "Password must contain at least 8 characters, one uppercase letter, one number and one special character."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "https://oneplussparkpaintsserver.onrender.com/api/auth/forgot-password/reset",
        {
          resetToken,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }
      );

      console.log("Reset password response:", response.data);

      // Password reset successful
      navigate("/", {
        state: {
          message:
            "Password reset successfully. Please login with your new password.",
        },
      });
    } catch (error) {
      console.error("Reset password error:", error);

      setError(
        error.response?.data?.message ||
        "Unable to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) {
    return (
      <div className="reset-session-page">
        <div>
          <h2>Session Expired</h2>

          <p>
            Please go back and request a new OTP.
          </p>

          <Link to="/forgot-password">
            Request New OTP
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-page">

      {/* LEFT SIDE */}

      <div className="reset-left">

        <div className="reset-brand">
          <span>Oneplus</span>
          <strong>Spark</strong>
          <small>PAINTS</small>
        </div>

        <div className="reset-left-content">

          <p className="reset-small-title">
            Account Security
          </p>

          <h1>
            Create a new <span>password</span>
          </h1>

          <div className="reset-line"></div>

          <p>
            Your identity has been verified successfully.
            Create a strong new password to secure your
            Oneplus Spark CRM account.
          </p>

          <div className="reset-security-card">

            <ShieldCheck size={28} />

            <div>
              <strong>Secure Password Reset</strong>

              <span>
                Your new password will be encrypted and
                securely stored.
              </span>
            </div>

          </div>

        </div>

        <div className="reset-version">
          Version 1.0.0
        </div>

      </div>

      {/* RIGHT SIDE */}

      <div className="reset-right">

        <div className="reset-card">

          <div className="reset-logo">
            <span>Oneplus</span>
            <strong>Spark</strong>
            <small>PAINTS</small>
          </div>

          <h2>Reset Password</h2>

          <p className="reset-subtitle">
            Create a new password for your account.
          </p>

          <form onSubmit={handleSubmit}>

            {/* New Password */}

            <div className="reset-form-group">

              <label>New Password</label>

              <div className="reset-input-wrapper">

                <Lock size={20} />

                <input
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  name="newPassword"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="reset-password-toggle"
                  onClick={() =>
                    setShowNewPassword(
                      !showNewPassword
                    )
                  }
                >
                  {showNewPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>

              </div>

            </div>

            {/* Confirm Password */}

            <div className="reset-form-group">

              <label>Confirm New Password</label>

              <div className="reset-input-wrapper">

                <Lock size={20} />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="reset-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>

              </div>

            </div>

            {/* Password Rules */}

            <div className="password-rules">

              <p>Password must contain:</p>

              <span>
                ✓ Minimum 8 characters
              </span>

              <span>
                ✓ At least one uppercase letter
              </span>

              <span>
                ✓ At least one number
              </span>

              <span>
                ✓ At least one special character
              </span>

            </div>

            {error && (
              <div className="reset-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="reset-button"
              disabled={loading}
            >
              {loading
                ? "RESETTING..."
                : "RESET PASSWORD"}
            </button>

          </form>

          <Link
            to="/"
            className="reset-back-login"
          >
            Back to Login
          </Link>

          <div className="reset-help">

            <ShieldCheck size={20} />

            <div>
              <strong>Your password is secure</strong>

              <p>
                Passwords are encrypted before being
                stored in the system.
              </p>
            </div>

          </div>

          <footer className="reset-footer">
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

export default ResetPassword;