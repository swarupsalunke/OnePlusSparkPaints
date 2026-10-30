import {
  Users,
  Store,
  ShoppingCart,
  Gift,
  Bell,
  BarChart3,
  RefreshCw,
  MoreHorizontal,
  CalendarDays,
  Activity,
  Database,
  Server,
  UserPlus,
  PackagePlus,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../css/superadmin/admindashboard.css";



const DEFAULT_VIEWS = [
  "statistics",
  "salesOverview",
  "orderStatus",
  "quickActions",
  "topSellingProducts",
  "topDealers",
  "recentActivity",
  "systemOverview",
  "kycOverview",
  "userStatus",
];

const DASHBOARD_VIEW_OPTIONS = [
  { key: "statistics", label: "Statistics Cards" },
  { key: "salesOverview", label: "Sales Overview" },
  { key: "orderStatus", label: "Order Status" },
  { key: "quickActions", label: "Quick Actions" },
  { key: "topSellingProducts", label: "Top Selling Products" },
  { key: "topDealers", label: "Top Dealers" },
  { key: "recentActivity", label: "Recent Activity" },
  { key: "systemOverview", label: "System Overview" },
  { key: "kycOverview", label: "KYC Overview" },
  { key: "userStatus", label: "User Status" },
];

const API_BASE_URL =
  "https://oneplussparkpaintsserver.onrender.com/api";


const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    kyc: { pending: 0, approved: 0, rejected: 0, correctionRequired: 0 },
    totalDealers: null,
    totalOrders: null,
    totalSales: null,
    totalRewards: null,
    salesOverview: [],
    orderStatus: [],
    topSellingProducts: [],
    topDealers: [],
    recentActivities: [],
    systemOverview: [],
  });


  const fetchDashboardPreferences = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API_BASE_URL}/dashboard-preferences`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        setVisibleViews(res.data.visibleViews);
        setDraftViews(res.data.visibleViews);
      }
    } catch (error) {
      console.error(
        "Dashboard preferences error:",
        error?.response?.data || error
      );
    }
  };
  const saveDashboardPreferences = async () => {
    try {
      setSavingPreferences(true);

      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${API_BASE_URL}/dashboard-preferences`,
        {
          visibleViews: draftViews,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        setVisibleViews(res.data.visibleViews);
        setDraftViews(res.data.visibleViews);
        setShowCustomizeModal(false);
      }
    } catch (error) {
      console.error(
        "Save dashboard preferences error:",
        error?.response?.data || error
      );
    } finally {
      setSavingPreferences(false);
    }
  };

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState("This Week");
  const [visibleViews, setVisibleViews] = useState(DEFAULT_VIEWS);
  const [draftViews, setDraftViews] = useState(DEFAULT_VIEWS);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const navigate = useNavigate();

  const fetchDashboardStats = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        console.error("Token not found. Please login again.");
        return;
      }

      const res = await axios.get(
        // "https://oneplussparkpaintsserver.onrender.com/api/users/stats",
        "https://oneplussparkpaintsserver.onrender.com/api/users/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        const s = res.data.stats || {};

        setStats((prev) => ({
          ...prev,
          ...s,
          kyc: { ...prev.kyc, ...(s.kyc || {}) },
          salesOverview: s.salesOverview || [],
          orderStatus: s.orderStatus || [],
          topSellingProducts: s.topSellingProducts || [],
          topDealers: s.topDealers || [],
          recentActivities: s.recentActivities || [],
          systemOverview: s.systemOverview || [],
        }));
      }
    } catch (err) {
      console.error(
        "Dashboard stats error:",
        err?.response?.data || err
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchDashboardPreferences();
  }, []);

  const isNumber = (v) => typeof v === "number" && Number.isFinite(v);
  const formatNumber = (v) => (isNumber(v) ? new Intl.NumberFormat("en-IN").format(v) : "—");
  const formatCurrency = (v) => (isNumber(v) ? `₹ ${new Intl.NumberFormat("en-IN").format(v)}` : "—");

  const statCards = useMemo(
    () => [
      { title: "Total Users", value: stats.totalUsers, subtitle: "Registered users", icon: Users, type: "number", available: true },
      { title: "Total Dealers", value: stats.totalDealers, subtitle: "Registered dealers", icon: Store, type: "number", available: isNumber(stats.totalDealers) },
      { title: "Total Orders", value: stats.totalOrders, subtitle: "Orders placed", icon: ShoppingCart, type: "number", available: isNumber(stats.totalOrders) },
      { title: "Total Sales", value: stats.totalSales, subtitle: "Total sales", icon: BarChart3, type: "currency", available: isNumber(stats.totalSales) },
      { title: "Total Rewards", value: stats.totalRewards, subtitle: "Rewards issued", icon: Gift, type: "number", available: isNumber(stats.totalRewards) },
    ],
    [stats]
  );

  const kycItems = [
    { label: "Pending", description: "Awaiting review", value: stats.kyc.pending, className: "pending" },
    { label: "Approved", description: "Verified users", value: stats.kyc.approved, className: "approved" },
    { label: "Rejected", description: "Rejected KYC", value: stats.kyc.rejected, className: "rejected" },
    { label: "Correction Required", description: "Needs correction", value: stats.kyc.correctionRequired, className: "correction" },
  ];

  const quickActions = [
    { label: "Add User", icon: UserPlus, to: "/users" },
    { label: "Add Product", icon: PackagePlus, to: "/products" },
    { label: "Add Dealer", icon: Store, to: "/users" },
    { label: "Create Order", icon: ShoppingCart, to: "/order-management" },
    // { label: "Add Scheme", icon: Gift, to: "/scheme-management" },
    { label: "Send Notification", icon: Bell },
  ];

  const orderStatusColors = ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444"];
  const periodOptions = ["Today", "This Week", "This Month", "This Quarter", "This Year"];

  const hasSalesData = stats.salesOverview.length > 0;
  const hasOrderData = stats.orderStatus.length > 0;
  const hasProducts = stats.topSellingProducts.length > 0;
  const hasDealers = stats.topDealers.length > 0;
  const hasActivities = stats.recentActivities.length > 0;
  const hasSystemData = stats.systemOverview.length > 0;

  const renderEmptyState = (message = "No data found") => (
    <div className="dashboard-empty-state">
      <div className="dashboard-empty-icon">
        <Activity size={20} />
      </div>
      <span>{message}</span>
    </div>
  );

  const renderPeriodSelect = (className) => (
    <select className={className} value={period} onChange={(e) => setPeriod(e.target.value)}>
      {periodOptions.map((opt) => (
        <option key={opt}>{opt}</option>
      ))}
    </select>
  );

  return (
    <div className="crm-dashboard">
      {/* PAGE HEADER */}
      <div className="dashboard-page-header">
        <div className="dashboard-welcome">
          <span className="dashboard-eyebrow">Welcome back,</span>
          <div className="dashboard-title-row">
            <h2>Super Admin</h2>
            <span className="admin-role-badge">Super Admin</span>
          </div>
          <p>Here&apos;s what&apos;s happening with your business today.</p>
        </div>

        <div className="dashboard-actions">
          <button
            className="dashboard-customize-btn"
            type="button"
            onClick={() => {
              setDraftViews(visibleViews);
              setShowCustomizeModal(true);
            }}
          >
            Customize Dashboard
          </button>
          <button className="dashboard-refresh-btn" onClick={() => fetchDashboardStats(true)} disabled={refreshing}>
            <RefreshCw size={15} className={refreshing ? "refresh-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <div className="dashboard-period-wrap">
            <CalendarDays size={16} />
            {renderPeriodSelect("dashboard-period")}
          </div>
        </div>
      </div>

      {visibleViews.includes("statistics") && (
        <div className="dashboard-stats-grid">
          {statCards.map((card) => {
            const Icon = card.icon;
            const value = loading || !card.available ? "—" : card.type === "currency" ? formatCurrency(card.value) : formatNumber(card.value);

            return (
              <div className="dashboard-stat-card-new" key={card.title}>
                <div className="dashboard-stat-top">
                  <div className="dashboard-stat-icon">
                    <Icon size={21} />
                  </div>
                  <button type="button" className="stat-more-btn" aria-label={`${card.title} options`}>
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                <div className="dashboard-stat-value">{value}</div>
                <div className="dashboard-stat-title">{card.title}</div>

                <div className="dashboard-stat-bottom">
                  <span className="dashboard-stat-subtitle">{card.subtitle}</span>
                  {!loading && !card.available && <span className="stat-no-data">No data</span>}
                </div>
              </div>
            );
          })}
        </div>
      )
      }

      {/* CHARTS */}
      <div className="dashboard-chart-grid">
        {visibleViews.includes("salesOverview") && (
          <div className="dashboard-panel-new">
            <div className="dashboard-panel-header">
              <div>
                <h3>Sales Overview</h3>
                <p>Sales performance for {period.toLowerCase()}</p>
              </div>
              {renderPeriodSelect("panel-period-select")}
            </div>

            <div className="sales-chart-container">
              {hasSalesData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.salesOverview}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f4" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#697386" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#697386" }} />
                    <Tooltip contentStyle={{ border: "1px solid #e8ebf0", borderRadius: "10px", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)" }} />
                    <Line type="monotone" dataKey="sales" stroke="#ff7a00" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                renderEmptyState("No sales data found")
              )}
            </div>
          </div>
        )}

        {visibleViews.includes("orderStatus") && (
          <div className="dashboard-panel-new">
            <div className="dashboard-panel-header">
              <div>
                <h3>Order Status</h3>
                <p>Current order distribution</p>
              </div>
              {renderPeriodSelect("panel-period-select")}
            </div>

            <div className="order-status-content">
              {hasOrderData ? (
                <>
                  <div className="order-donut-wrap">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={stats.orderStatus} dataKey="value" nameKey="label" innerRadius="58%" outerRadius="82%" paddingAngle={2} stroke="none">
                          {stats.orderStatus.map((entry, index) => (
                            <Cell key={`${entry.label}-${index}`} fill={entry.color || orderStatusColors[index % orderStatusColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="donut-center">
                      <strong>{formatNumber(stats.orderStatus.reduce((sum, item) => sum + (Number(item.value) || 0), 0))}</strong>
                      <span>Total Orders</span>
                    </div>
                  </div>

                  <div className="order-status-list">
                    {stats.orderStatus.map((item, index) => (
                      <div className="order-status-row" key={`${item.label}-${index}`}>
                        <div>
                          <span className="order-status-dot" style={{ background: item.color || orderStatusColors[index % orderStatusColors.length] }} />
                          <span>{item.label}</span>
                        </div>
                        <strong>{formatNumber(item.value)}</strong>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                renderEmptyState("No order status data found")
              )}
            </div>
          </div>
        )}
      </div>

      {/* QUICK ACTIONS */}
      {visibleViews.includes("quickActions") && (
        <div className="dashboard-panel-new quick-actions-panel">

          <div className="dashboard-panel-header">
            <div>
              <h3>Quick Actions</h3>
              <p>Frequently used CRM actions</p>
            </div>
          </div>

          <div className="quick-actions">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button key={action.label} className="quick-action" onClick={() => action.to && navigate(action.to)} disabled={!action.to}>
                  <span className="quick-action-icon">
                    <Icon size={18} />
                  </span>
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TABLES + ACTIVITY */}
      <div className="dashboard-lower-grid">
        {visibleViews.includes("topSellingProducts") && (
          <div className="dashboard-panel-new">
            <div className="dashboard-panel-header">
              <div>
                <h3>Top Selling Products</h3>
                <p>Products with the highest sales</p>
              </div>
              <button className="panel-view-btn" type="button">View All</button>
            </div>

            <div className="dashboard-table-wrap">
              {hasProducts ? (
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Sold Units</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topSellingProducts.map((product, index) => (
                      <tr key={product._id || product.id || index}>
                        <td>
                          <div className="table-primary">
                            {product.image ? (
                              <img src={product.image} alt={product.name || "Product"} className="product-thumb" />
                            ) : (
                              <span className="table-icon">
                                <PackagePlus size={16} />
                              </span>
                            )}
                            <span>{product.name || "—"}</span>
                          </div>
                        </td>
                        <td>{product.category || "—"}</td>
                        <td>{formatNumber(product.soldUnits)}</td>
                        <td>{formatCurrency(product.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                renderEmptyState("No product data found")
              )}
            </div>
          </div>
        )}
        {visibleViews.includes("topDealers") && (
          <div className="dashboard-panel-new">
            <div className="dashboard-panel-header">
              <div>
                <h3>Top Dealers</h3>
                <p>Dealers with the highest performance</p>
              </div>
              <button className="panel-view-btn" type="button">View All</button>
            </div>

            <div className="dashboard-table-wrap">
              {hasDealers ? (
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Dealer Name</th>
                      <th>Orders</th>
                      <th>Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topDealers.map((dealer, index) => (
                      <tr key={dealer._id || dealer.id || index}>
                        <td>
                          <div className="table-primary">
                            <span className="table-icon">
                              <Store size={16} />
                            </span>
                            <span>{dealer.name || "—"}</span>
                          </div>
                        </td>
                        <td>{formatNumber(dealer.orders)}</td>
                        <td>{formatCurrency(dealer.sales)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                renderEmptyState("No dealer data found")
              )}
            </div>
          </div>
        )}
        {visibleViews.includes("recentActivity") && (
          <div className="dashboard-panel-new">
            <div className="dashboard-panel-header">
              <div>
                <h3>Recent Activity</h3>
                <p>Latest CRM activities</p>
              </div>
            </div>

            <div className="recent-activity-list">
              {hasActivities
                ? stats.recentActivities.map((activity, index) => (
                  <div className="recent-activity-item" key={activity._id || activity.id || index}>
                    <div className="activity-icon">
                      <Activity size={16} />
                    </div>
                    <div className="activity-info">
                      <strong>{activity.title || activity.message || "Activity"}</strong>
                      <span>{activity.description || activity.by || "—"}</span>
                    </div>
                    <small>{activity.time || "—"}</small>
                  </div>
                ))
                : renderEmptyState("No recent activity found")}
            </div>
          </div>
        )}
        {visibleViews.includes("systemOverview") && (
          <div className="dashboard-panel-new">
            <div className="dashboard-panel-header">
              <div>
                <h3>System Overview</h3>
                <p>Current system health</p>
              </div>
            </div>

            <div className="system-overview">
              {hasSystemData
                ? stats.systemOverview.map((item, index) => (
                  <div className="system-overview-item" key={item.name || index}>
                    <div className="system-overview-left">
                      <span className={`system-status-dot ${item.status || "active"}`} />
                      <div>
                        <strong>{item.name || "System"}</strong>
                        <small>{item.message || item.value || "—"}</small>
                      </div>
                    </div>
                    {item.icon === "database" ? <Database size={18} /> : <Server size={18} />}
                  </div>
                ))
                : renderEmptyState("No system data found")}
            </div>
          </div>
        )}
      </div>

      {/* KYC / USER STATUS */}
      <div className="dashboard-main-grid">
        {visibleViews.includes("kycOverview") && (
          <div className="dashboard-panel-new">
            <div className="dashboard-panel-header">
              <div>
                <h3>KYC Overview</h3>
                <p>User verification status</p>
              </div>
              <button className="panel-view-btn" type="button">View All</button>
            </div>

            <div className="kyc-overview-new">
              {kycItems.map((item) => (
                <div className="kyc-status-item" key={item.label}>
                  <div className="kyc-status-left">
                    <span className={`kyc-status-dot ${item.className}`} />
                    <div>
                      <strong>{item.label}</strong>
                      <small>{item.description}</small>
                    </div>
                  </div>
                  <strong className="kyc-count">{loading ? "—" : formatNumber(item.value)}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
        {visibleViews.includes("userStatus") && (
          <div className="dashboard-panel-new">
            <div className="dashboard-panel-header">
              <div>
                <h3>User Status</h3>
                <p>Current user activity</p>
              </div>
              <button className="panel-view-btn" type="button">View All</button>
            </div>

            <div className="user-status-content">
              <div className="user-status-chart">
                <div
                  className="user-status-circle"
                  style={{
                    "--active-percent":
                      isNumber(stats.totalUsers) && stats.totalUsers > 0
                        ? `${Math.min(100, Math.max(0, (stats.activeUsers / stats.totalUsers) * 100))}%`
                        : "0%",
                  }}
                >
                  <div>
                    <strong>{loading ? "—" : formatNumber(stats.totalUsers)}</strong>
                    <span>Total Users</span>
                  </div>
                </div>
              </div>

              <div className="user-status-list">
                <div className="user-status-row">
                  <div>
                    <span className="status-dot active" />
                    <span>Active Users</span>
                  </div>
                  <strong>{loading ? "—" : formatNumber(stats.activeUsers)}</strong>
                </div>

                <div className="user-status-row">
                  <div>
                    <span className="status-dot inactive" />
                    <span>Inactive Users</span>
                  </div>
                  <strong>{loading ? "—" : formatNumber(stats.inactiveUsers)}</strong>
                </div>

                <div className="user-status-row">
                  <div>
                    <span className="status-dot blocked" />
                    <span>Blocked Users</span>
                  </div>
                  <strong>—</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {showCustomizeModal && (
        <div className="dashboard-modal-overlay">
          <div className="dashboard-customize-modal">
            <div className="dashboard-modal-header">
              <div>
                <h3>Customize Dashboard</h3>
                <p>Choose which sections you want to display.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowCustomizeModal(false)}
              >
                ×
              </button>
            </div>

            <div className="dashboard-modal-body">
              {DASHBOARD_VIEW_OPTIONS.map((view) => (
                <label key={view.key} className="dashboard-view-option">
                  <input
                    type="checkbox"
                    checked={draftViews.includes(view.key)}
                    onChange={(e) => {
                      setDraftViews((prev) =>
                        e.target.checked
                          ? [...prev, view.key]
                          : prev.filter((item) => item !== view.key)
                      );
                    }}
                  />
                  <span>{view.label}</span>
                </label>
              ))}
            </div>

            <div className="dashboard-modal-footer">
              <button
                type="button"
                onClick={() => {
                  setDraftViews(visibleViews);
                  setShowCustomizeModal(false);
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveDashboardPreferences}
                disabled={savingPreferences}
              >
                {savingPreferences ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

export default Dashboard;