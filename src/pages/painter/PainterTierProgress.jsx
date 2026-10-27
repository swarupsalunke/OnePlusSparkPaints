import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import "../../css/painter/PainterTierProgress.css";

const API_URL = import.meta.env.VITE_API_URL || "https://oneplussparkpaintsserver.onrender.com";

const PainterTierProgress = () => {
  const [progress, setProgress] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTierProgress = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_URL}/api/painter/tier-progress`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch tier progress"
          );
        }

        setProgress(data.progress || null);
        setMilestones(data.milestones || []);
      } catch (err) {
        console.error("Tier Progress Error:", err);

        toast.error(
          err.message || "Failed to load tier progress"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTierProgress();
  }, []);

  const achievementPercentage = Math.min(
    100,
    Math.max(0, progress?.achievementPercentage || 0)
  );

  if (loading) {
    return (
      <div className="painter-tier-progress-page">
        <div className="painter-tier-progress-state">
          Loading tier progress...
        </div>
      </div>
    );
  }

  return (
    <div className="painter-tier-progress-page">

      {/* Header */}
      <div className="painter-tier-progress-header">
        <h1>Tier Progress</h1>

        <p>
          Oneplus Spark PAINTS
          <span>•</span>
          Painter experience
        </p>
      </div>

      {/* Progress Card */}
      <div className="painter-tier-progress-main-card">

        <h2>
          Progress to{" "}
          <span>
            {progress?.nextTier || "-"}
          </span>
        </h2>

        <div className="painter-tier-progress-stats">

          <div className="painter-tier-progress-stat">
            <span>Current Tier</span>
            <strong>
              {progress?.currentTier || "-"}
            </strong>
          </div>

          <div className="painter-tier-progress-stat">
            <span>Current Points</span>
            <strong>
              {progress?.currentPoints ?? 0}
            </strong>
          </div>

          <div className="painter-tier-progress-stat">
            <span>Next Tier</span>
            <strong>
              {progress?.nextTier || "-"}
            </strong>
          </div>

          <div className="painter-tier-progress-stat">
            <span>Achievement</span>
            <strong>
              {achievementPercentage}%
            </strong>
          </div>

        </div>

        {/* Main Progress */}
        <div className="painter-tier-progress-track">
          <div
            className="painter-tier-progress-fill"
            style={{
              width: `${achievementPercentage}%`,
            }}
          />
        </div>

        <div className="painter-tier-progress-bottom">
          <span>
            {progress?.currentPoints ?? 0} points
          </span>

          <span>
            {progress?.nextTierTarget || "-"} points
          </span>
        </div>

      </div>

      {/* Tier Milestones */}
      <div className="painter-tier-milestones-card">

        <div className="painter-tier-milestones-header">
          <h2>Tier Milestones</h2>

          <p>
            Track your progress across loyalty tiers
          </p>
        </div>

        <div className="painter-tier-milestones-list">

          {milestones.length > 0 ? (
            milestones.map((milestone, index) => {

              const percentage = Math.min(
                100,
                Math.max(
                  0,
                  milestone.percentage || 0
                )
              );

              return (
                <div
                  className="painter-tier-milestone"
                  key={`${milestone.tier}-${index}`}
                >

                  <div className="painter-tier-milestone-top">

                    <div className="painter-tier-milestone-name">
                      <div className="painter-tier-milestone-number">
                        {index + 1}
                      </div>

                      <div>
                        <h3>
                          {milestone.tier || "-"}
                        </h3>

                        <span>
                          Level {milestone.level || index + 1}
                        </span>
                      </div>
                    </div>

                    <strong>
                      {percentage}%
                    </strong>

                  </div>

                  <div className="painter-tier-milestone-track">
                    <div
                      className="painter-tier-milestone-fill"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                </div>
              );
            })
          ) : (
            <div className="painter-tier-milestone-empty">
              No tier milestones available.
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default PainterTierProgress;