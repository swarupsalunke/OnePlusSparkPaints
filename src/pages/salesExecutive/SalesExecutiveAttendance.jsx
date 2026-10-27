import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Camera,
  MapPin,
  LogIn,
  LogOut,
  History,
  RefreshCw,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import "../../css/salesExecutive/SalesExecutiveAttendance.css";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = "https://oneplussparkpaintsserver.onrender.com";

const SalesExecutiveAttendance = () => {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [remarks, setRemarks] = useState("");
  const [selfie, setSelfie] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState("");

  const [cameraOpen, setCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const getToken = () => localStorage.getItem("token");

  const fetchTodayAttendance = async () => {
    try {
      const token = getToken();

      const response = await axios.get(
        `${API_BASE_URL}/api/sales-executive/attendance/today`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTodayAttendance(response.data.attendance || null);
    } catch (error) {
      console.error("Today's attendance error:", error);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const token = getToken();

      const response = await axios.get(
        `${API_BASE_URL}/api/sales-executive/attendance/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAttendanceHistory(response.data.attendance || []);
    } catch (error) {
      console.error("Attendance history error:", error);
    }
  };

  useEffect(() => {
    fetchTodayAttendance();
    fetchAttendanceHistory();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this device/browser."));
        return;
      }

      setLocationLoading(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLatitude = position.coords.latitude;
          const currentLongitude = position.coords.longitude;

          setLatitude(currentLatitude);
          setLongitude(currentLongitude);
          setLocationLoading(false);

          resolve({
            latitude: currentLatitude,
            longitude: currentLongitude,
          });
        },
        (error) => {
          setLocationLoading(false);

          let message = "Unable to get your location.";

          if (error.code === error.PERMISSION_DENIED) {
            message = "Location permission is required for attendance.";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = "Location information is unavailable.";
          } else if (error.code === error.TIMEOUT) {
            message = "Location request timed out.";
          }

          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    });
  };

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert("Camera is not supported by this browser/device.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error("Camera error:", error);
      alert("Camera permission is required for selfie capture.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraOpen(false);
  };

  const captureSelfie = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const file = new File(
          [blob],
          `attendance-selfie-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          }
        );

        setSelfie(file);
        setSelfiePreview(URL.createObjectURL(file));

        stopCamera();
      },
      "image/jpeg",
      0.9
    );
  };

  const handleCheckIn = async () => {
    if (todayAttendance) {
      alert("Attendance is already marked for today.");
      return;
    }

    if (!selfie) {
      alert("Please capture your selfie before check-in.");
      return;
    }

    try {
      setLoading(true);

      const location = await getCurrentLocation();

      const formData = new FormData();

      formData.append("latitude", location.latitude);
      formData.append("longitude", location.longitude);
      formData.append("remarks", remarks);
      formData.append("selfie", selfie);

      const token = getToken();

      const response = await axios.post(
        `${API_BASE_URL}/api/sales-executive/attendance/check-in`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);

      setRemarks("");
      setSelfie(null);

      if (selfiePreview) {
        URL.revokeObjectURL(selfiePreview);
      }

      setSelfiePreview("");

      await fetchTodayAttendance();
      await fetchAttendanceHistory();
    } catch (error) {
      console.error("Check-in error:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to check-in."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) {
      alert("Please check-in before check-out.");
      return;
    }

    if (todayAttendance.status === "CHECKED_OUT") {
      alert("You have already checked-out for today.");
      return;
    }

    try {
      setLoading(true);

      const location = await getCurrentLocation();

      const token = getToken();

      const response = await axios.post(
        `${API_BASE_URL}/api/sales-executive/attendance/check-out`,
        {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);

      await fetchTodayAttendance();
      await fetchAttendanceHistory();
    } catch (error) {
      console.error("Check-out error:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to check-out."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatDate = (value) => {
    if (!value) return "-";

    return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
      dateStyle: "medium",
    });
  };

  const isCheckedIn =
    todayAttendance?.status === "CHECKED_IN";

  const isCheckedOut =
    todayAttendance?.status === "CHECKED_OUT";

  return (
    <div className="sales-executive-attendance">
      <div className="sales-executive-attendance-header">
        <div>
          <h1>Attendance Management</h1>
          <p>Manage your daily attendance and location.</p>
        </div>

        <button
          type="button"
          className="sales-executive-attendance-refresh"
          onClick={() => {
            fetchTodayAttendance();
            fetchAttendanceHistory();
          }}
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      <div className="sales-executive-attendance-grid">
        <div className="sales-executive-attendance-card">
          <div className="sales-executive-attendance-card-header">
            <div>
              <h2>Today's Attendance</h2>
              <p>Check-in and check-out details</p>
            </div>

            {isCheckedOut ? (
              <span className="attendance-status checked-out">
                Checked Out
              </span>
            ) : isCheckedIn ? (
              <span className="attendance-status checked-in">
                Checked In
              </span>
            ) : (
              <span className="attendance-status not-marked">
                Not Marked
              </span>
            )}
          </div>

          <div className="sales-executive-attendance-details">
            <div className="attendance-detail-item">
              <Clock3 size={19} />
              <div>
                <span>Check-In</span>
                <strong>
                  {formatDateTime(todayAttendance?.checkIn?.timestamp)}
                </strong>
              </div>
            </div>

            <div className="attendance-detail-item">
              <LogOut size={19} />
              <div>
                <span>Check-Out</span>
                <strong>
                  {formatDateTime(todayAttendance?.checkOut?.timestamp)}
                </strong>
              </div>
            </div>

            <div className="attendance-detail-item">
              <MapPin size={19} />
              <div>
                <span>Check-In Location</span>
                <strong>
                  {todayAttendance?.checkIn?.latitude &&
                  todayAttendance?.checkIn?.longitude
                    ? `${todayAttendance.checkIn.latitude}, ${todayAttendance.checkIn.longitude}`
                    : "-"}
                </strong>
              </div>
            </div>

            <div className="attendance-detail-item">
              <CheckCircle2 size={19} />
              <div>
                <span>Remarks</span>
                <strong>
                  {todayAttendance?.checkIn?.remarks || "-"}
                </strong>
              </div>
            </div>
          </div>

          {todayAttendance?.checkIn?.selfie && (
            <div className="attendance-saved-selfie">
              <span>Check-In Selfie</span>

              <img
                src={`${API_BASE_URL}${todayAttendance.checkIn.selfie}`}
                alt="Attendance selfie"
              />
            </div>
          )}

          {!todayAttendance && (
            <div className="sales-executive-attendance-form">
              <div className="attendance-camera-section">
                {cameraOpen ? (
                  <div className="attendance-camera-preview">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                    />

                    <div className="attendance-camera-actions">
                      <button
                        type="button"
                        onClick={captureSelfie}
                        className="attendance-primary-button"
                      >
                        <Camera size={18} />
                        Capture Selfie
                      </button>

                      <button
                        type="button"
                        onClick={stopCamera}
                        className="attendance-secondary-button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : selfiePreview ? (
                  <div className="attendance-selfie-preview">
                    <img
                      src={selfiePreview}
                      alt="Selfie preview"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setSelfie(null);
                        URL.revokeObjectURL(selfiePreview);
                        setSelfiePreview("");
                      }}
                      className="attendance-secondary-button"
                    >
                      Retake Selfie
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="attendance-camera-button"
                  >
                    <Camera size={24} />
                    <span>Capture Selfie</span>
                    <small>Selfie is mandatory for check-in</small>
                  </button>
                )}
              </div>

              <canvas
                ref={canvasRef}
                className="attendance-hidden-canvas"
              />

              <div className="attendance-location-status">
                <MapPin size={20} />

                <div>
                  <strong>GPS Location</strong>

                  <span>
                    {latitude && longitude
                      ? `${latitude}, ${longitude}`
                      : "Location will be captured during check-in"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                >
                  {locationLoading ? "Getting..." : "Get Location"}
                </button>
              </div>

              <div className="attendance-remarks">
                <label htmlFor="attendanceRemarks">
                  Attendance Remarks
                </label>

                <textarea
                  id="attendanceRemarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter remarks"
                  rows="3"
                />
              </div>

              <button
                type="button"
                className="attendance-check-in-button"
                onClick={handleCheckIn}
                disabled={loading || !selfie}
              >
                <LogIn size={19} />
                {loading ? "Processing..." : "Check In"}
              </button>
            </div>
          )}

          {isCheckedIn && (
            <button
              type="button"
              className="attendance-check-out-button"
              onClick={handleCheckOut}
              disabled={loading}
            >
              <LogOut size={19} />
              {loading ? "Processing..." : "Check Out"}
            </button>
          )}
        </div>

        <div className="sales-executive-attendance-card">
          <div className="sales-executive-attendance-card-header">
            <div>
              <h2>Attendance History</h2>
              <p>Your previous attendance records</p>
            </div>

            <History size={20} />
          </div>

          <div className="attendance-history-list">
            {attendanceHistory.length === 0 ? (
              <div className="attendance-history-empty">
                <History size={32} />
                <p>No attendance records found.</p>
              </div>
            ) : (
              attendanceHistory.map((attendance) => (
                <div
                  className="attendance-history-item"
                  key={attendance._id}
                >
                  <div className="attendance-history-date">
                    <strong>{formatDate(attendance.date)}</strong>

                    <span
                      className={`attendance-status ${
                        attendance.status === "CHECKED_OUT"
                          ? "checked-out"
                          : "checked-in"
                      }`}
                    >
                      {attendance.status === "CHECKED_OUT"
                        ? "Checked Out"
                        : "Checked In"}
                    </span>
                  </div>

                  <div className="attendance-history-times">
                    <div>
                      <span>Check-In</span>
                      <strong>
                        {formatDateTime(
                          attendance.checkIn?.timestamp
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Check-Out</span>
                      <strong>
                        {formatDateTime(
                          attendance.checkOut?.timestamp
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="attendance-history-location">
                    <MapPin size={16} />

                    <span>
                      {attendance.checkIn?.latitude &&
                      attendance.checkIn?.longitude
                        ? `${attendance.checkIn.latitude}, ${attendance.checkIn.longitude}`
                        : "-"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesExecutiveAttendance;