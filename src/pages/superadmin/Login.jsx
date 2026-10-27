
import { useState } from "react";
import { loginUser } from "../../services/authService";
import {
  Eye,
  EyeOff,
  User,
  Lock,
  ShieldCheck,
  Smartphone,
  Paintbrush,
  Store,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "../../css/superadmin/login.css";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(formData);

      console.log("Login response:", data);

      // Validate selected role against the authenticated user's role.
      const userRole = data.user?.role;
      const roleMap = {
        ADMIN: ["SUPER_ADMIN", "ADMIN"],
        PAINTER: ["PAINTER"],
        DEALER: ["DEALER"],
        SALES_EXECUTIVE: ["SALES_EXECUTIVE"],
      };

      if (
        selectedRole &&
        !roleMap[selectedRole]?.includes(userRole)
      ) {
        setError("Selected role does not match this account.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (userRole === "PAINTER") {
        navigate("/painter/dashboard");
      } else if (userRole === "DEALER") {
        navigate("/dealer/dashboard");
      } else if (userRole === "SALES_EXECUTIVE") {
        navigate("/sales-executive/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);

      const message =
        error.response?.data?.message ||
        "Unable to login. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const roleCredentials = {
    ADMIN: {
      email: "admin@oneplusspark.com",
      password: "YOUR_ADMIN_PASSWORD",
    },
    PAINTER: {
      email: "PAINTER_EMAIL",
      password: "PAINTER_PASSWORD",
    },
    DEALER: {
      email: "DEALER_EMAIL",
      password: "DEALER_PASSWORD",
    },
    SALES_EXECUTIVE: {
      email: "SALES_EMAIL",
      password: "SALES_PASSWORD",
    },
  };

  const roles = [
    { value: "ADMIN", label: "Admin", Icon: ShieldCheck },
    { value: "PAINTER", label: "Painter", Icon: Paintbrush },
    { value: "DEALER", label: "Dealer", Icon: Store },
    {
      value: "SALES_EXECUTIVE",
      label: "Sales Executive",
      Icon: Smartphone,
    },
  ];

  return (
    <div className="auth-page">
      {/* Left Side */}
      <div className="auth-left">
        <div className="brand-logo">
          <span>Oneplus</span>
          <strong>Spark</strong>
          <small>PAINTS</small>
        </div>

        <div className="welcome-content">
          <p className="welcome-small">Welcome to</p>

          <h1>
            <span>Oneplus Spark</span> CRM
          </h1>

          <p className="welcome-description">
            Manage your entire business from a single platform
          </p>

          <div className="feature-grid">
            <div>▥ Sales Management</div>
            <div>▥ Manufacturing</div>
            <div>◔ Reports &amp; Analytics</div>
            <div>♧ Dealer Management</div>
            <div>▣ Inventory Management</div>
            <div>◈ Schemes &amp; Offers</div>
            <div>Painter Rewards</div>
            <div>₹ Finance &amp; Accounts</div>
            <div>♙ Lead Management</div>
          </div>
        </div>

        <div className="product-preview">
          <div className="dashboard-placeholder">
            <span>Oneplus Spark</span>
            <h3>CRM Dashboard</h3>

            <div className="mini-cards">
              <div>
                ₹12,45,000
                <br />
                <small>Total Sales</small>
              </div>

              <div>
                156
                <br />
                <small>Total Orders</small>
              </div>

              <div>
                28
                <br />
                <small>New Dealers</small>
              </div>
            </div>

            <div className="mini-chart">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>

          <div className="paint-can">
            <span>Oneplus</span>
            <strong>Spark</strong>
            <small>PAINTS</small>
            <b>PREMIUM</b>
            <p>EXTERIOR EMULSION</p>
          </div>
        </div>

        <div className="auth-left-footer">Version 1.0.0</div>
      </div>

      {/* Right Side */}
      <div className="auth-right">
        <div className="login-card">
          <div className="login-logo">
            <span>Oneplus</span>
            <strong>Spark</strong>
            <small>PAINTS</small>
          </div>

          <h2>Welcome Back!</h2>

          <p className="login-subtitles">
            Sign in to continue to your CRM Dashboard.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-groups">
              <label htmlFor="login-email">Username / Email</label>

              <div className="input-wrappers">
                <User size={20} />

                <input
                  id="login-email"
                  type="email"
                  name="email"
                  placeholder="Enter username or email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-groups">
              <label htmlFor="login-password">Password</label>

              <div className="input-wrappers">
                <Lock size={20} />

                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="login-options">
              <label className="remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember Me</span>
              </label>

              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            {/* Login Error */}
            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "LOGGING IN..." : "LOGIN"}
            </button>
          </form>

          {/* OR Divider */}
          <div className="or-divider">
            <span></span>
            <p>OR</p>
            <span></span>
          </div>

          {/* Selectable User Roles */}
          <div className="role-access">
            <p className="role-access-title">SELECT USER ROLE</p>

            <div className="role-access-list">
              {roles.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  className={`role-access-item ${selectedRole === value ? "selected" : ""
                    }`}
                  onClick={() => {
                    setSelectedRole(value);
                    setError("");

                    const credentials = roleCredentials[value];

                    setFormData({
                      email: credentials.email,
                      password: credentials.password,
                    });
                  }}
                  aria-pressed={selectedRole === value}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Security Features */}
          <div className="security-features">
            <div className="security-item">
              <ShieldCheck />
              <div>
                <strong>Secure Login</strong>
                <span>Your data is safe</span>
              </div>
            </div>

            <div className="security-item">
              <Smartphone />
              <div>
                <strong>OTP Authentication</strong>
                <span>Extra layer of security</span>
              </div>
            </div>

            <div className="security-item">
              <Lock />
              <div>
                <strong>SSL Protected</strong>
                <span>256-bit encryption</span>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="help-box">
            <div>
              <strong>Need help?</strong>
              <span>Contact Administrator</span>
            </div>

            <div>
              <strong>support@oneplussparkpaints.com</strong>
              <span>+91 12345 67890</span>
            </div>
          </div>

          <footer>
            © 2026 Oneplus Spark Paints. All rights reserved.
            <br />
            <span>Privacy Policy</span>
            <span>Terms &amp; Conditions</span>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;
