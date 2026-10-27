import React, { useEffect, useState } from "react";
import {
    AlertCircle,
    CheckCircle,
    Gift,
    Video,
    Image as ImageIcon,
    Lightbulb,
    Package,
    Headphones,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../css/painter/PainterVoiceDashboard.css";

const API_BASE = "https://oneplussparkpaintsserver.onrender.com";

const PainterVoiceDashboard = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        openSubmissions: 0,
        resolved: 0,
        rewardsEarned: 0,
        myVideos: 0,
    });

    const [user, setUser] = useState({
        name: "Painter",
        location: "",
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const userData = JSON.parse(
                localStorage.getItem("user") || "{}"
            );

            const painterName = userData?.name || "Painter";

            setUser({
                name: painterName,
                location:
                    userData?.city ||
                    userData?.location ||
                    "",
            });

            const feedbackResponse = await fetch(
                `${API_BASE}/api/feedback`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const feedbackData = await feedbackResponse.json();

            const allFeedbacks = feedbackData.success
                ? feedbackData.feedbacks || []
                : [];

            const myFeedbacks = allFeedbacks.filter(
                (feedback) =>
                    String(feedback.painter || "")
                        .trim()
                        .toLowerCase() ===
                    String(painterName)
                        .trim()
                        .toLowerCase()
            );

            const openSubmissions = myFeedbacks.filter(
                (feedback) =>
                    [
                        "OPEN",
                        "ASSIGNED",
                        "UNDER_REVIEW",
                    ].includes(feedback.status)
            ).length;

            const resolved = myFeedbacks.filter(
                (feedback) =>
                    feedback.status === "RESOLVED" ||
                    feedback.status === "CLOSED"
            ).length;

            const myVideos = myFeedbacks.filter(
                (feedback) => Boolean(feedback.video)
            ).length;

            let rewardsEarned = 0;

            try {
                const rewardResponse = await fetch(
                    `${API_BASE}/api/painter/reward-dashboard`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const rewardData =
                    await rewardResponse.json();

                if (rewardData.success) {
                    rewardsEarned = Number(
                        rewardData.summary?.lifetimeEarnings || 0
                    );
                }
            } catch (rewardError) {
                console.error(
                    "Reward dashboard error:",
                    rewardError
                );
            }

            setStats({
                openSubmissions,
                resolved,
                rewardsEarned,
                myVideos,
            });
        } catch (error) {
            console.error(
                "Voice dashboard fetch error:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (type) => {
        switch (type) {
            case "VIDEO":
                navigate("/painter/voice-of-painter/upload-video");
                break;

            case "IMAGE":
                navigate("/painter/voice-of-painter/upload-images");
                break;

            case "PRODUCT":
                navigate("/painter/voice-of-painter/submit-feedback");
                break;

            case "SUGGESTION":
                navigate("/painter/voice-of-painter/submit-feedback");
                break;

            case "COMPLAINT":
                navigate("/painter/complaints");
                break;

            case "SERVICE":
                navigate("/painter/voice-of-painter/submit-feedback");
                break;

            default:
                break;
        }
    };

    return (
        <div className="painter-voice-dashboard-page">
            <div className="painter-voice-dashboard-header">
                <div>
                    <h1>Voice Dashboard</h1>

                    <p>
                        Painter App
                        <span>/</span>
                        Voice of Painter
                        <span>/</span>
                        Voice Dashboard
                    </p>
                </div>
            </div>

            <div className="painter-voice-dashboard-content">
                <p className="painter-voice-dashboard-subtitle">
                    Oneplus Spark PAINTS • Painter experience
                </p>

                <div className="painter-voice-stats-grid">
                    <div className="painter-voice-stat-card">
                        <div className="painter-voice-stat-icon orange">
                            <AlertCircle size={17} />
                        </div>

                        <div>
                            <span>Open Submissions</span>
                            <strong>
                                {loading
                                    ? "..."
                                    : stats.openSubmissions}
                            </strong>
                            <small>Awaiting review</small>
                        </div>
                    </div>

                    <div className="painter-voice-stat-card">
                        <div className="painter-voice-stat-icon green">
                            <CheckCircle size={17} />
                        </div>

                        <div>
                            <span>Resolved</span>
                            <strong>
                                {loading
                                    ? "..."
                                    : stats.resolved}
                            </strong>
                            <small>This year</small>
                        </div>
                    </div>

                    <div className="painter-voice-stat-card">
                        <div className="painter-voice-stat-icon purple">
                            <Gift size={17} />
                        </div>

                        <div>
                            <span>Rewards Earned</span>
                            <strong>
                                ₹
                                {loading
                                    ? "..."
                                    : stats.rewardsEarned.toLocaleString(
                                        "en-IN"
                                    )}
                            </strong>
                            <small>From milestones</small>
                        </div>
                    </div>

                    <div className="painter-voice-stat-card">
                        <div className="painter-voice-stat-icon blue">
                            <Video size={17} />
                        </div>

                        <div>
                            <span>My Videos</span>
                            <strong>
                                {loading
                                    ? "..."
                                    : stats.myVideos}
                            </strong>
                            <small>Uploaded</small>
                        </div>
                    </div>
                </div>

                <div className="painter-voice-experience-card">
                    <h2>Share your field experience</h2>

                    <div className="painter-voice-action-grid">
                        <button
                            type="button"
                            onClick={() =>
                                handleAction("VIDEO")
                            }
                        >
                            <Video size={15} />
                            <span>Upload Site Video</span>
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                handleAction("IMAGE")
                            }
                        >
                            <ImageIcon size={15} />
                            <span>Upload Images</span>
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                handleAction("PRODUCT")
                            }
                        >
                            <Package size={15} />
                            <span>Product Feedback</span>
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                handleAction("SUGGESTION")
                            }
                        >
                            <Lightbulb size={15} />
                            <span>Suggestion</span>
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                handleAction("COMPLAINT")
                            }
                        >
                            <AlertCircle size={15} />
                            <span>Complaint</span>
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                handleAction("SERVICE")
                            }
                        >
                            <Headphones size={15} />
                            <span>Service Feedback</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PainterVoiceDashboard;