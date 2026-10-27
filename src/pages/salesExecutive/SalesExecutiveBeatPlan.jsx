import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  CalendarDays,
  MapPin,
  Navigation,
  Clock,
  User,
  Route,
  X,
  Camera,
  LocateFixed,
  Play,
  Save,
} from "lucide-react";
import "../../css/salesExecutive/SalesExecutiveBeatPlan.css";

const API_BASE_URL = "https://oneplussparkpaintsserver.onrender.com";

const SalesExecutiveBeatPlan = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const photoInputRef = useRef(null);

  const [visitForm, setVisitForm] = useState({
    visitStatus: "PLANNED",
    meetingNotes: "",
    followUpDate: "",
    productDiscussion: "",
    orderBooking: "",
    collectionEntry: "",
    complaintRegistration: "",
    remarks: "",
    latitude: null,
    longitude: null,
  });

  const today = new Date().toISOString().split("T")[0];

  const fetchTodayBeatPlan = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/sales-visits`);

      if (response.data.success) {
        const todayVisits = (response.data.visits || [])
          .filter(
            (visit) =>
              visit.assignedTo &&
              new Date(visit.visitDate).toISOString().split("T")[0] === today
          )
          .sort((a, b) =>
            (a.visitTime || "").localeCompare(b.visitTime || "")
          );

        setVisits(todayVisits);
      }
    } catch (error) {
      console.error("Today's Beat Plan error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayBeatPlan();
  }, []);

  const getStatusLabel = (status) => {
    const statusMap = {
      PLANNED: "Planned",
      IN_PROGRESS: "In Progress",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
      MISSED: "Missed",
      RESCHEDULED: "Rescheduled",
    };
    return statusMap[status] || status;
  };

  const handleNavigation = (visit) => {
    const latitude = visit.location?.latitude;
    const longitude = visit.location?.longitude;

    if (
      latitude === null ||
      latitude === undefined ||
      longitude === null ||
      longitude === undefined
    ) {
      alert("Visit location is not available.");
      return;
    }

    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
      "_blank"
    );
  };

  const formatDateForInput = (date) => {
    if (!date) return "";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "";
    return parsedDate.toISOString().split("T")[0];
  };

  const openVisitDetails = (visit) => {
    setSelectedVisit(visit);
    setPhotoPreview(
      visit.visitPhoto ? `${API_BASE_URL}${visit.visitPhoto}` : ""
    );

    setVisitForm({
      visitStatus: visit.visitStatus || "PLANNED",
      meetingNotes: visit.meetingNotes || "",
      followUpDate: formatDateForInput(visit.followUpDate),
      productDiscussion: visit.productDiscussion || "",
      orderBooking: visit.orderBooking || "",
      collectionEntry: visit.collectionEntry || "",
      complaintRegistration: visit.complaintRegistration || "",
      remarks: visit.remarks || "",
      latitude:
        visit.gpsTracking?.lastLatitude ??
        visit.location?.latitude ??
        null,
      longitude:
        visit.gpsTracking?.lastLongitude ??
        visit.location?.longitude ??
        null,
    });
  };

  const closeVisitDetails = () => {
    if (saving) return;
    setSelectedVisit(null);
    setPhotoPreview("");
    setVisitForm({
      visitStatus: "PLANNED",
      meetingNotes: "",
      followUpDate: "",
      productDiscussion: "",
      orderBooking: "",
      collectionEntry: "",
      complaintRegistration: "",
      remarks: "",
      latitude: null,
      longitude: null,
    });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setVisitForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const captureGPS = () => {
    if (!navigator.geolocation) {
      alert("GPS is not supported by this browser.");
      return;
    }

    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setVisitForm((previous) => ({
          ...previous,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setGpsLoading(false);
      },
      (error) => {
        console.error("GPS error:", error);
        setGpsLoading(false);
        alert("Unable to capture GPS location. Please allow location access.");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      event.target.value = "";
      return;
    }

    setPhotoPreview(URL.createObjectURL(file));
  };

  const startVisit = async () => {
    if (!selectedVisit) return;

    try {
      setSaving(true);

      await axios.put(
        `${API_BASE_URL}/api/sales-visits/${selectedVisit._id}/status`,
        { visitStatus: "IN_PROGRESS" }
      );

      setVisitForm((previous) => ({
        ...previous,
        visitStatus: "IN_PROGRESS",
      }));

      setSelectedVisit((previous) => ({
        ...previous,
        visitStatus: "IN_PROGRESS",
      }));

      setVisits((previous) =>
        previous.map((visit) =>
          visit._id === selectedVisit._id
            ? { ...visit, visitStatus: "IN_PROGRESS" }
            : visit
        )
      );
    } catch (error) {
      console.error("Start visit error:", error);
      alert(error.response?.data?.message || "Unable to start visit.");
    } finally {
      setSaving(false);
    }
  };

  const saveVisitDetails = async () => {
    if (!selectedVisit) return;

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("visitStatus", visitForm.visitStatus);
      formData.append("meetingNotes", visitForm.meetingNotes);
      formData.append("followUpDate", visitForm.followUpDate);
      formData.append("productDiscussion", visitForm.productDiscussion);
      formData.append("orderBooking", visitForm.orderBooking);
      formData.append("collectionEntry", visitForm.collectionEntry);
      formData.append(
        "complaintRegistration",
        visitForm.complaintRegistration
      );
      formData.append("remarks", visitForm.remarks);

      if (
        visitForm.latitude !== null &&
        visitForm.longitude !== null
      ) {
        formData.append("latitude", visitForm.latitude);
        formData.append("longitude", visitForm.longitude);
      }

      const photoFile = photoInputRef.current?.files?.[0];
      if (photoFile) {
        formData.append("visitPhoto", photoFile);
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/sales-visits/${selectedVisit._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        const updatedVisit = response.data.visit;

        setSelectedVisit(updatedVisit);

        setVisits((previous) =>
          previous.map((visit) =>
            visit._id === updatedVisit._id ? updatedVisit : visit
          )
        );

        if (updatedVisit.visitPhoto) {
          setPhotoPreview(`${API_BASE_URL}${updatedVisit.visitPhoto}`);
        }

        alert("Visit details saved successfully.");
      }
    } catch (error) {
      console.error("Save visit details error:", error);
      alert(
        error.response?.data?.message || "Unable to save visit details."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sales-executive-beat-plan">
      <div className="sales-executive-beat-plan-header">
        <div>
          <h1>Today's Beat Plan</h1>
          <p>View your today's assigned dealer and painter visits.</p>
        </div>

        <div className="sales-executive-beat-plan-date">
          <CalendarDays size={18} />
          <span>
            {new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="sales-executive-beat-plan-empty">
          Loading today's beat plan...
        </div>
      ) : visits.length === 0 ? (
        <div className="sales-executive-beat-plan-empty">
          <CalendarDays size={40} />
          <h3>No visits planned for today</h3>
          <p>No visits are currently assigned to you.</p>
        </div>
      ) : (
        <div className="sales-executive-beat-plan-list">
          {visits.map((visit, index) => (
            <div
              className="sales-executive-beat-plan-card"
              key={visit._id}
            >
              <div className="sales-executive-beat-plan-sequence">
                {index + 1}
              </div>

              <div className="sales-executive-beat-plan-info">
                <div className="sales-executive-beat-plan-top">
                  <span
                    className={`sales-executive-beat-plan-type ${
                      visit.visitType === "PAINTER" ? "painter" : "dealer"
                    }`}
                  >
                    {visit.visitType === "PAINTER"
                      ? "Painter"
                      : visit.visitType === "RETAILER"
                      ? "Retailer"
                      : "Dealer"}
                  </span>

                  <span
                    className={`sales-executive-beat-plan-status ${visit.visitStatus?.toLowerCase()}`}
                  >
                    {getStatusLabel(visit.visitStatus)}
                  </span>
                </div>

                <h3>{visit.customerName}</h3>

                <div className="sales-executive-beat-plan-details">
                  <span>
                    <Clock size={15} />
                    {visit.visitTime || "-"}
                  </span>

                  <span>
                    <MapPin size={15} />
                    {visit.territory || "-"}
                  </span>

                  <span>
                    <Route size={15} />
                    {visit.beat || "-"}
                  </span>

                  <span>
                    <User size={15} />
                    {visit.assignedTo || "-"}
                  </span>
                </div>

                <div className="sales-executive-beat-plan-route">
                  <strong>Route:</strong> {visit.route || "Not assigned"}
                </div>
              </div>

              <div className="sales-executive-beat-plan-actions">
                <button
                  type="button"
                  className="sales-executive-beat-plan-details-button"
                  onClick={() => openVisitDetails(visit)}
                >
                  View Details
                </button>

                <button
                  type="button"
                  className="sales-executive-beat-plan-navigation"
                  onClick={() => handleNavigation(visit)}
                >
                  <Navigation size={17} />
                  Navigate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedVisit && (
        <div
          className="sales-executive-beat-plan-modal-overlay"
          onClick={closeVisitDetails}
        >
          <div
            className="sales-executive-beat-plan-modal sales-executive-beat-plan-visit-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sales-executive-beat-plan-modal-header">
              <div>
                <h2>Visit Details</h2>
                <p>{selectedVisit.customerName}</p>
              </div>

              <button
                type="button"
                className="sales-executive-beat-plan-modal-close"
                onClick={closeVisitDetails}
              >
                <X size={20} />
              </button>
            </div>

            <div className="sales-executive-beat-plan-modal-content">
              <div className="sales-executive-beat-plan-detail-row">
                <span>Visit Type</span>
                <strong>
                  {selectedVisit.visitType === "PAINTER"
                    ? "Painter"
                    : selectedVisit.visitType === "RETAILER"
                    ? "Retailer"
                    : "Dealer"}
                </strong>
              </div>

              <div className="sales-executive-beat-plan-detail-row">
                <span>Customer Name</span>
                <strong>{selectedVisit.customerName || "-"}</strong>
              </div>

              <div className="sales-executive-beat-plan-detail-row">
                <span>Customer ID</span>
                <strong>{selectedVisit.customerId || "-"}</strong>
              </div>

              <div className="sales-executive-beat-plan-detail-row">
                <span>Customer Mobile</span>
                <strong>{selectedVisit.customerMobile || "-"}</strong>
              </div>

              <div className="sales-executive-beat-plan-detail-row">
                <span>Territory</span>
                <strong>{selectedVisit.territory || "-"}</strong>
              </div>

              <div className="sales-executive-beat-plan-detail-row">
                <span>Beat</span>
                <strong>{selectedVisit.beat || "-"}</strong>
              </div>

              <div className="sales-executive-beat-plan-detail-row">
                <span>Route</span>
                <strong>{selectedVisit.route || "-"}</strong>
              </div>

              <div className="sales-executive-beat-plan-detail-row">
                <span>Visit Date</span>
                <strong>
                  {selectedVisit.visitDate
                    ? new Date(selectedVisit.visitDate).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "-"}
                </strong>
              </div>

              <div className="sales-executive-beat-plan-detail-row">
                <span>Visit Time</span>
                <strong>{selectedVisit.visitTime || "-"}</strong>
              </div>

              <div className="sales-executive-beat-plan-detail-row">
                <span>Assigned To</span>
                <strong>{selectedVisit.assignedTo || "-"}</strong>
              </div>

              <div className="sales-executive-beat-plan-detail-row">
                <span>Status</span>
                <strong>{getStatusLabel(visitForm.visitStatus)}</strong>
              </div>

              <div className="sales-executive-beat-plan-during-visit">
                <div className="sales-executive-beat-plan-section-title">
                  <h3>During Visit</h3>
                  <p>Update visit activity and customer meeting details.</p>
                </div>

                {visitForm.visitStatus === "PLANNED" && (
                  <button
                    type="button"
                    className="sales-executive-beat-plan-start-button"
                    onClick={startVisit}
                    disabled={saving}
                  >
                    <Play size={17} />
                    {saving ? "Starting..." : "Start Visit"}
                  </button>
                )}

                <div className="sales-executive-beat-plan-form-grid">
                  <div className="sales-executive-beat-plan-form-group">
                    <label>Visit Status</label>
                    <select
                      name="visitStatus"
                      value={visitForm.visitStatus}
                      onChange={handleFormChange}
                    >
                      <option value="PLANNED">Planned</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div className="sales-executive-beat-plan-form-group">
                    <label>Follow-up Date</label>
                    <input
                      type="date"
                      name="followUpDate"
                      value={visitForm.followUpDate}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="sales-executive-beat-plan-form-group full-width">
                    <label>Meeting Notes</label>
                    <textarea
                      name="meetingNotes"
                      value={visitForm.meetingNotes}
                      onChange={handleFormChange}
                      placeholder="Enter meeting notes"
                      rows="3"
                    />
                  </div>

                  <div className="sales-executive-beat-plan-form-group full-width">
                    <label>Product Discussion</label>
                    <textarea
                      name="productDiscussion"
                      value={visitForm.productDiscussion}
                      onChange={handleFormChange}
                      placeholder="Enter products discussed"
                      rows="3"
                    />
                  </div>

                  <div className="sales-executive-beat-plan-form-group full-width">
                    <label>Order Booking</label>
                    <textarea
                      name="orderBooking"
                      value={visitForm.orderBooking}
                      onChange={handleFormChange}
                      placeholder="Enter order booking details"
                      rows="3"
                    />
                  </div>

                  <div className="sales-executive-beat-plan-form-group full-width">
                    <label>Collection Entry</label>
                    <textarea
                      name="collectionEntry"
                      value={visitForm.collectionEntry}
                      onChange={handleFormChange}
                      placeholder="Enter collection details"
                      rows="3"
                    />
                  </div>

                  <div className="sales-executive-beat-plan-form-group full-width">
                    <label>Complaint Registration</label>
                    <textarea
                      name="complaintRegistration"
                      value={visitForm.complaintRegistration}
                      onChange={handleFormChange}
                      placeholder="Enter complaint details"
                      rows="3"
                    />
                  </div>

                  <div className="sales-executive-beat-plan-form-group full-width">
                    <label>Remarks</label>
                    <textarea
                      name="remarks"
                      value={visitForm.remarks}
                      onChange={handleFormChange}
                      placeholder="Enter visit remarks"
                      rows="3"
                    />
                  </div>
                </div>

                <div className="sales-executive-beat-plan-gps-section">
                  <div className="sales-executive-beat-plan-gps-header">
                    <div>
                      <h4>GPS Capture</h4>
                      <p>
                        {visitForm.latitude !== null &&
                        visitForm.longitude !== null
                          ? `${visitForm.latitude}, ${visitForm.longitude}`
                          : "Location not captured"}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="sales-executive-beat-plan-gps-button"
                      onClick={captureGPS}
                      disabled={gpsLoading}
                    >
                      <LocateFixed size={17} />
                      {gpsLoading ? "Capturing..." : "Capture GPS"}
                    </button>
                  </div>
                </div>

                <div className="sales-executive-beat-plan-photo-section">
                  <div className="sales-executive-beat-plan-photo-header">
                    <div>
                      <h4>Photo Capture</h4>
                      <p>Capture or upload visit photo.</p>
                    </div>

                    <button
                      type="button"
                      className="sales-executive-beat-plan-photo-button"
                      onClick={() => photoInputRef.current?.click()}
                    >
                      <Camera size={17} />
                      Capture Photo
                    </button>

                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoChange}
                      hidden
                    />
                  </div>

                  {photoPreview && (
                    <div className="sales-executive-beat-plan-photo-preview">
                      <img src={photoPreview} alt="Visit" />
                    </div>
                  )}
                </div>

                <div className="sales-executive-beat-plan-modal-actions">
                  <button
                    type="button"
                    className="sales-executive-beat-plan-navigation"
                    onClick={() => handleNavigation(selectedVisit)}
                  >
                    <Navigation size={17} />
                    Navigate
                  </button>

                  <button
                    type="button"
                    className="sales-executive-beat-plan-save-button"
                    onClick={saveVisitDetails}
                    disabled={saving}
                  >
                    <Save size={17} />
                    {saving ? "Saving..." : "Save Visit Details"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesExecutiveBeatPlan;
