
import { useEffect, useState } from "react";
import {
    Target,
    TrendingUp,
    IndianRupee,
    Users,
    UserRound,
    Package,
    Activity,
    CalendarDays,
    Award,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Clock3,
    LoaderCircle,
    Trophy,
} from "lucide-react";

import "../../css/salesExecutive/TargetManagement.css";

const API_BASE_URL = "https://oneplussparkpaintsserver.onrender.com";

const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    "";

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(amount || 0));

const formatNumber = (value) =>
    new Intl.NumberFormat("en-IN").format(Number(value || 0));

const periodLabels = {
    MONTHLY: "Monthly Target",
    QUARTERLY: "Quarterly Target",
    ANNUAL: "Annual Target",
};

const getPeriodDescription = (item) => {
    if (item.periodType === "MONTHLY") {
        return new Date(item.year, (item.month || 1) - 1).toLocaleDateString(
            "en-IN",
            { month: "long", year: "numeric" }
        );
    }

    if (item.periodType === "QUARTERLY") {
        return `Q${item.quarter} · ${item.year}`;
    }

    return `Financial period · ${item.year}`;
};

function MetricCard({ icon: Icon, label, value, description, accent, unavailable }) {
    return (
        <article className="tm-metric-card">
            <div className={`tm-metric-icon ${accent || ""}`}>
                <Icon size={21} />
            </div>
            <div className="tm-metric-label">{label}</div>
            <div className={`tm-metric-value ${unavailable ? "tm-muted-value" : ""}`}>
                {value}
            </div>
            <p className="tm-metric-description">{description}</p>
        </article>
    );
}

function TargetCard({ item }) {
    const achievement = Math.max(0, Number(item.achievementPercent || 0));
    const progress = Math.min(achievement, 100);
    const hasTarget = Boolean(item.targetAssigned && item.targetAmount > 0);

    return (
        <article className="tm-target-card">
            <div className="tm-target-card-top">
                <div className="tm-target-icon">
                    <Target size={21} />
                </div>
                <span className="tm-period-badge">
                    {item.periodType}
                </span>
            </div>

            <h3>{periodLabels[item.periodType] || item.periodType}</h3>
            <p className="tm-period-description">{getPeriodDescription(item)}</p>

            <div className="tm-target-amount">
                {formatCurrency(item.targetAmount)}
            </div>

            <div className="tm-progress-heading">
                <span>Achievement</span>
                <strong>{achievement.toFixed(1)}%</strong>
            </div>

            <div
                className="tm-progress-track"
                role="progressbar"
                aria-label={`${periodLabels[item.periodType]} achievement`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
            >
                <div
                    className={`tm-progress-fill ${achievement >= 100 ? "tm-progress-complete" : ""}`}
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="tm-target-stats">
                <div>
                    <span>Achieved</span>
                    <strong>{formatCurrency(item.achievedAmount)}</strong>
                </div>
                <div>
                    <span>Remaining</span>
                    <strong>{formatCurrency(item.remainingAmount)}</strong>
                </div>
            </div>

            <div className="tm-target-footer">
                {hasTarget ? (
                    <>
                        <span className="tm-status-dot" />
                        Target assigned
                    </>
                ) : (
                    <>
                        <Clock3 size={15} />
                        Target not assigned
                    </>
                )}
            </div>
        </article>
    );
}

export default function TargetManagement() {
    const [dashboard, setDashboard] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchDashboard = async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        setError("");

        try {
            const headers = {
                Authorization: `Bearer ${getToken()}`,
            };

            const [dashboardResponse, leaderboardResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/api/sales-executive/targets/dashboard`, {
                    headers,
                }),
                fetch(`${API_BASE_URL}/api/sales-executive/targets/leaderboard`, {
                    headers,
                }),
            ]);

            const dashboardData = await dashboardResponse.json();
            const leaderboardData = await leaderboardResponse.json();

            if (!dashboardResponse.ok || !dashboardData.success) {
                throw new Error(
                    dashboardData.message || "Failed to load target dashboard."
                );
            }

            setDashboard(dashboardData);
            setLeaderboard(
                leaderboardResponse.ok && leaderboardData.success
                    ? leaderboardData.leaderboard || []
                    : []
            );
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.message || "Unable to load target management data.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const periods = dashboard?.dashboard || [];
    const monthly = periods.find((item) => item.periodType === "MONTHLY");
    const quarterly = periods.find((item) => item.periodType === "QUARTERLY");
    const annual = periods.find((item) => item.periodType === "ANNUAL");

    const incentivePeriod = monthly;
    const incentiveEligible = Boolean(incentivePeriod?.incentiveEligible);

    const indicators = [
        {
            label: "Sales Value",
            value: formatCurrency(dashboard?.performanceIndicators?.salesValue),
            description: "Delivered orders this month",
            icon: IndianRupee,
            accent: "tm-icon-blue",
        },
        {
            label: "Collections",
            value: "—",
            description: "Collection API not connected",
            icon: TrendingUp,
            accent: "tm-icon-green",
            unavailable: true,
        },
        {
            label: "New Dealers",
            value: "—",
            description: "Dealer registration data pending",
            icon: Users,
            accent: "tm-icon-purple",
            unavailable: true,
        },
        {
            label: "New Painters",
            value: "—",
            description: "Painter registration data pending",
            icon: UserRound,
            accent: "tm-icon-orange",
            unavailable: true,
        },
        {
            label: "Product Volume",
            value: formatNumber(dashboard?.performanceIndicators?.productVolume),
            description: "Units in delivered orders",
            icon: Package,
            accent: "tm-icon-cyan",
        },
        {
            label: "Active Customers",
            value: "—",
            description: "Customer activity data pending",
            icon: Activity,
            accent: "tm-icon-green",
            unavailable: true,
        },
        {
            label: "Visit Compliance",
            value: "—",
            description: "Visit tracking API not connected",
            icon: CalendarDays,
            accent: "tm-icon-orange",
            unavailable: true,
        },
    ];

    if (loading) {
        return (
            <div className="tm-page">
                <div className="tm-loading">
                    <LoaderCircle className="tm-spin" size={34} />
                    <p>Loading target management...</p>
                </div>
            </div>
        );
    }

    if (error && !dashboard) {
        return (
            <div className="tm-page">
                <div className="tm-error-state">
                    <AlertCircle size={36} />
                    <h2>Unable to load dashboard</h2>
                    <p>{error}</p>
                    <button type="button" onClick={() => fetchDashboard()}>
                        <RefreshCw size={17} />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="tm-page">
            <header className="tm-header">
                <div className="tm-header-copy">
                    <h1>Target Management</h1>
                    <p>Track your targets, sales achievements and performance.</p>
                </div>

                <button
                    type="button"
                    className="tm-refresh-btn"
                    onClick={() => fetchDashboard(true)}
                    disabled={refreshing}
                >
                    <RefreshCw size={17} className={refreshing ? "tm-spin" : ""} />
                    {refreshing ? "Refreshing..." : "Refresh"}
                </button>
            </header>

            {error && (
                <div className="tm-inline-error" role="alert">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            <div className="tm-period-strip">
                <div className="tm-period-strip-icon">
                    <CalendarDays size={19} />
                </div>
                <div>
                    <strong>
                        {new Date(
                            dashboard?.period?.year || new Date().getFullYear(),
                            (dashboard?.period?.month || new Date().getMonth() + 1) - 1
                        ).toLocaleDateString("en-IN", {
                            month: "long",
                            year: "numeric",
                        })}
                    </strong>
                    <span>Current performance period</span>
                </div>
                <div className="tm-update-time">
                    {lastUpdated
                        ? `Updated ${lastUpdated.toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}`
                        : "Live data"}
                </div>
            </div>

            <section className="tm-section">
                <div className="tm-section-heading">
                    <div>
                        <h2>Target Overview</h2>
                        <p>Compare your targets with delivered sales.</p>
                    </div>
                </div>

                <div className="tm-target-grid">
                    {periods.map((item) => (
                        <TargetCard key={item.periodType} item={item} />
                    ))}
                </div>
            </section>

            <section className="tm-section">
                <div className="tm-section-heading">
                    <div>
                        <h2>Incentive Eligibility</h2>
                        <p>Based on the monthly achievement threshold.</p>
                    </div>
                </div>

                <div className={`tm-incentive-card ${incentiveEligible ? "tm-incentive-success" : ""}`}>
                    <div className="tm-incentive-icon">
                        {incentiveEligible ? (
                            <CheckCircle2 size={26} />
                        ) : (
                            <Award size={26} />
                        )}
                    </div>

                    <div className="tm-incentive-copy">
                        <span className="tm-incentive-label">Monthly Incentive</span>
                        <h3>
                            {!incentivePeriod?.targetAssigned
                                ? "Target not assigned"
                                : incentiveEligible
                                    ? "Eligibility threshold achieved"
                                    : "Not eligible yet"}
                        </h3>
                        <p>
                            {incentivePeriod?.targetAssigned
                                ? `Required achievement: ${incentivePeriod.incentiveTargetPercent}% · Current achievement: ${Number(incentivePeriod.achievementPercent || 0).toFixed(1)}%`
                                : "Your manager needs to assign a monthly target first."}
                        </p>
                    </div>

                    <span className={`tm-incentive-status ${incentiveEligible ? "is-eligible" : ""}`}>
                        {incentiveEligible ? "Eligible" : "Pending"}
                    </span>
                </div>
                <p className="tm-disclaimer">
                    Eligibility is based on the configured achievement threshold. Actual incentive payout rules are not connected yet.
                </p>
            </section>

            <section className="tm-section">
                <div className="tm-section-heading">
                    <div>
                        <h2>Performance Indicators</h2>
                        <p>Your sales and field activity summary.</p>
                    </div>
                </div>

                <div className="tm-metric-grid">
                    {indicators.map((item) => (
                        <MetricCard key={item.label} {...item} />
                    ))}
                </div>
            </section>

            <section className="tm-section tm-leaderboard-section">
                <div className="tm-section-heading">
                    <div>
                        <h2>Leaderboard</h2>
                        <p>Monthly ranking by delivered sales achievement.</p>
                    </div>
                    <div className="tm-leaderboard-period">
                        <Trophy size={16} />
                        {dashboard?.period?.month
                            ? new Date(
                                dashboard.period.year,
                                dashboard.period.month - 1
                            ).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
                            : "Current month"}
                    </div>
                </div>

                {leaderboard.length === 0 ? (
                    <div className="tm-empty-leaderboard">
                        <Trophy size={31} />
                        <h3>No leaderboard data</h3>
                        <p>Monthly target assignments are needed to show rankings.</p>
                    </div>
                ) : (
                    <div className="tm-table-wrap">
                        <table className="tm-leaderboard-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Sales Executive</th>
                                    <th>Target</th>
                                    <th>Achieved</th>
                                    <th>Achievement</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((person, index) => {
                                    const percentage = Number(person.achievementPercent || 0);
                                    const isCurrentUser =
                                        person.salesExecutive?._id ===
                                        dashboard?.salesExecutive?._id;

                                    return (
                                        <tr key={person.salesExecutive?._id || index}>
                                            <td>
                                                <span className={`tm-rank ${index < 3 ? "tm-rank-top" : ""}`}>
                                                    {String(index + 1).padStart(2, "0")}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="tm-person-cell">
                                                    <span className="tm-avatar">
                                                        {(person.salesExecutive?.name || "S")
                                                            .trim()
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </span>
                                                    <div>
                                                        <strong>
                                                            {person.salesExecutive?.name || "Sales Executive"}
                                                            {isCurrentUser && <span className="tm-you-label">You</span>}
                                                        </strong>
                                                        <span>
                                                            {person.salesExecutive?.userId ||
                                                                person.salesExecutive?.email ||
                                                                "—"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{formatCurrency(person.targetAmount)}</td>
                                            <td>{formatCurrency(person.achievedAmount)}</td>
                                            <td>
                                                <div className="tm-leader-progress">
                                                    <strong>{percentage.toFixed(1)}%</strong>
                                                    <div className="tm-progress-track">
                                                        <div
                                                            className="tm-progress-fill"
                                                            style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
