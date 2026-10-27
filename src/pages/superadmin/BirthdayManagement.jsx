import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Bell,
  Users,
  Cake,
  Send,
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Clock3,
  Globe2,
  Settings,
} from "lucide-react";
import axios from "axios";
import "../../css/superadmin/BirthdayManagement.css";

const API_URL = "https://oneplussparkpaintsserver.onrender.com/api";

const BirthdayManagement = () => {
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingBirthday, setEditingBirthday] = useState(null);
  const [viewBirthday, setViewBirthday] = useState(null);
  const [greetings, setGreetings] = useState([]);

  const [activeTab, setActiveTab] = useState("TODAY");

  const [filters, setFilters] = useState({
    date: "",
    userType: "",
    category: "",
    location: "",
    status: "",
    search: "",
  });

  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    name: "",
    userType: "DEALER",
    customType: "",
    dateOfBirth: "",
    mobileNumber: "",
    location: "",
    reminderEnabled: true,
  });

  useEffect(() => {
    fetchBirthdays();
    fetchGreetings();
  }, []);

  const fetchGreetings = async () => {
    try {
      const response = await axios.get(`${API_URL}/greetings`);
      if (response.data.success) {
        setGreetings(response.data.greetings || []);
      }
    } catch (error) {
      console.error("Get greetings error:", error);
    }
  };

  const fetchBirthdays = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/birthdays`);

      if (response.data.success) {
        setBirthdays(response.data.birthdays || []);
      }
    } catch (error) {
      console.error("Get birthdays error:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      userType: "DEALER",
      customType: "",
      dateOfBirth: "",
      mobileNumber: "",
      location: "",
      reminderEnabled: true,
    });
  };

  const handleAddBirthday = () => {
    setEditingBirthday(null);
    resetForm();
    setShowModal(true);
  };

  const handleEditBirthday = (birthday) => {
    setEditingBirthday(birthday);

    setFormData({
      name: birthday.name || "",
      userType: birthday.userType || "DEALER",
      customType: birthday.customType || "",
      dateOfBirth: birthday.dateOfBirth
        ? new Date(birthday.dateOfBirth).toISOString().split("T")[0]
        : "",
      mobileNumber: birthday.mobileNumber || "",
      location: birthday.location || "",
      reminderEnabled: birthday.reminderEnabled ?? true,
    });

    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveBirthday = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        name: formData.name,
        userType: formData.userType,
        customType:
          formData.userType === "CUSTOM" ? formData.customType : "",
        dateOfBirth: formData.dateOfBirth,
        mobileNumber: formData.mobileNumber,
        location: formData.location,
        reminderEnabled: formData.reminderEnabled,
      };

      let response;

      if (editingBirthday) {
        response = await axios.put(
          `${API_URL}/birthdays/${editingBirthday._id}`,
          payload
        );
      } else {
        response = await axios.post(`${API_URL}/birthdays`, payload);
      }

      if (response.data.success) {
        setShowModal(false);
        resetForm();
        setEditingBirthday(null);
        fetchBirthdays();
      }
    } catch (error) {
      console.error("Save birthday error:", error);
      alert(
        error.response?.data?.message || "Failed to save birthday"
      );
    }
  };

  const handleDeleteBirthday = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this birthday?"
    );

    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `${API_URL}/birthdays/${id}`
      );

      if (response.data.success) {
        fetchBirthdays();
      }
    } catch (error) {
      console.error("Delete birthday error:", error);
      alert(
        error.response?.data?.message || "Failed to delete birthday"
      );
    }
  };

  const handleSendGreeting = async (birthday) => {
    const message = `Happy Birthday ${birthday.name}! Wishing you a wonderful day and a successful year ahead.`;

    try {
      const response = await axios.post(`${API_URL}/greetings/send`, {
        birthdayId: birthday._id,
        message,
      });

      if (response.data.success) {
        alert("Greeting sent successfully");
        fetchBirthdays();
        fetchGreetings();
      }
    } catch (error) {
      console.error("Send greeting error:", error);
      alert(
        error.response?.data?.message || "Failed to send greeting"
      );
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "-";

    const dob = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();

    const monthDifference = today.getMonth() - dob.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < dob.getDate())
    ) {
      age--;
    }

    return age;
  };

  const getBirthdayDate = (dateOfBirth) => {
    if (!dateOfBirth) return "-";

    return new Date(dateOfBirth).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const getFullDate = (dateOfBirth) => {
    if (!dateOfBirth) return "-";

    return new Date(dateOfBirth).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getBirthdayDay = (dateOfBirth) => {
    if (!dateOfBirth) return null;

    const dob = new Date(dateOfBirth);
    const today = new Date();

    return {
      month: dob.getMonth(),
      day: dob.getDate(),
      year: today.getFullYear(),
    };
  };

  const isToday = (dateOfBirth) => {
    const birthday = getBirthdayDay(dateOfBirth);
    if (!birthday) return false;

    const today = new Date();

    return (
      birthday.month === today.getMonth() &&
      birthday.day === today.getDate()
    );
  };

  const isTomorrow = (dateOfBirth) => {
    const birthday = getBirthdayDay(dateOfBirth);
    if (!birthday) return false;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return (
      birthday.month === tomorrow.getMonth() &&
      birthday.day === tomorrow.getDate()
    );
  };

  const isThisWeek = (dateOfBirth) => {
    if (!dateOfBirth) return false;

    const dob = new Date(dateOfBirth);
    const today = new Date();

    const currentYearBirthday = new Date(
      today.getFullYear(),
      dob.getMonth(),
      dob.getDate()
    );

    const start = new Date(today);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    return (
      currentYearBirthday >= start &&
      currentYearBirthday <= end
    );
  };

  const isThisMonth = (dateOfBirth) => {
    if (!dateOfBirth) return false;

    const dob = new Date(dateOfBirth);
    const today = new Date();

    return dob.getMonth() === today.getMonth();
  };

  const getTabBirthdays = () => {
    switch (activeTab) {
      case "TODAY":
        return birthdays.filter((item) =>
          isToday(item.dateOfBirth)
        );

      case "TOMORROW":
        return birthdays.filter((item) =>
          isTomorrow(item.dateOfBirth)
        );

      case "THIS_WEEK":
        return birthdays.filter((item) =>
          isThisWeek(item.dateOfBirth)
        );

      case "THIS_MONTH":
        return birthdays.filter((item) =>
          isThisMonth(item.dateOfBirth)
        );

      default:
        return birthdays;
    }
  };

  const filteredBirthdays = useMemo(() => {
    let data = birthdays;

    if (filters.userType) {
      data = data.filter(
        (item) => item.userType === filters.userType
      );
    }

    if (filters.location) {
      data = data.filter((item) =>
        item.location
          ?.toLowerCase()
          .includes(filters.location.toLowerCase())
      );
    }

    if (filters.category) {
      data = data.filter((item) =>
        (item.customType || item.userType || "") === filters.category
      );
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();

      data = data.filter(
        (item) =>
          item.name?.toLowerCase().includes(search) ||
          item.mobileNumber?.includes(search) ||
          item.location?.toLowerCase().includes(search)
      );
    }

    if (filters.status) {
      if (filters.status === "SCHEDULED") {
        data = data.filter((item) => item.reminderEnabled);
      }

      if (filters.status === "DISABLED") {
        data = data.filter((item) => !item.reminderEnabled);
      }
    }

    if (filters.date) {
      data = data.filter((item) => {
        if (!item.dateOfBirth) return false;

        return (
          new Date(item.dateOfBirth).toISOString().split("T")[0] ===
          filters.date
        );
      });
    }

    return data;
  }, [birthdays, filters]);

  const totalPages = Math.ceil(
    filteredBirthdays.length / itemsPerPage
  );

  const paginatedBirthdays = filteredBirthdays.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const todayBirthdays = birthdays.filter((item) =>
    isToday(item.dateOfBirth)
  );

  const tomorrowBirthdays = birthdays.filter((item) =>
    isTomorrow(item.dateOfBirth)
  );

  const weekBirthdays = birthdays.filter((item) =>
    isThisWeek(item.dateOfBirth)
  );

  const monthBirthdays = birthdays.filter((item) =>
    isThisMonth(item.dateOfBirth)
  );

  const greetingsSent = birthdays.filter(
    (item) => item.greetingSent
  ).length;

  const remindersScheduled = birthdays.filter(
    (item) => item.reminderEnabled
  ).length;

  const resetFilters = () => {
    setFilters({
      date: "",
      userType: "",
      category: "",
      location: "",
      status: "",
      search: "",
    });

    setPage(1);
  };

  const getNextBirthdayDate = (dateOfBirth) => {
    if (!dateOfBirth) return null;

    const dob = new Date(dateOfBirth);
    const today = new Date();
    let next = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());

    if (next < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
      next = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate());
    }

    return next;
  };

  const upcomingReminders = [...birthdays]
    .filter((item) => item.reminderEnabled && item.dateOfBirth)
    .sort((a, b) => getNextBirthdayDate(a.dateOfBirth) - getNextBirthdayDate(b.dateOfBirth))
    .slice(0, 5);

  const recentGreetings = [...greetings]
    .sort((a, b) => new Date(b.sentAt || b.createdAt) - new Date(a.sentAt || a.createdAt))
    .slice(0, 4);

  const greetingTemplateCounts = [
    { label: "Dealer Birthday Wish", type: "DEALER", count: birthdays.filter((b) => b.userType === "DEALER").length },
    { label: "Painter Birthday Wish", type: "PAINTER", count: birthdays.filter((b) => b.userType === "PAINTER").length },
    { label: "Employee Birthday Wish", type: "EMPLOYEE", count: birthdays.filter((b) => b.userType === "EMPLOYEE").length },
    { label: "Custom Birthday Wish", type: "CUSTOM", count: birthdays.filter((b) => b.userType === "CUSTOM").length },
  ];

  const handleWhatsApp = (birthday) => {
    if (!birthday.mobileNumber) {
      alert("Mobile number not available");
      return;
    }

    const message = encodeURIComponent(
      `Happy Birthday ${birthday.name}! Wishing you a wonderful day and a successful year ahead.`
    );

    window.open(
      `https://wa.me/91${birthday.mobileNumber}?text=${message}`,
      "_blank"
    );
  };

  return (
    <div className="birthday-management-page">

      {/* PAGE HEADER */}

      <div className="birthday-page-header">
        <div>
          <h1>Birthday Management</h1>

          <div className="breadcrumb">
            Dashboard <span>›</span> Birthday Management{" "}
            <span>›</span> Overview
          </div>
        </div>

        <div className="birthday-header-actions">
          <button className="secondary-btn">
            <Send size={16} />
            Birthday Reports
          </button>

          <button className="secondary-btn">
            <Bell size={16} />
            Reminder Settings
          </button>

          <button
            className="primary-btn"
            onClick={handleAddBirthday}
          >
            <Plus size={17} />
            Add Custom Birthday
          </button>
        </div>
      </div>

      {/* DASHBOARD CARDS */}

      <div className="birthday-stats-grid">

        <div className="birthday-stat-card">
          <div className="stat-icon purple">
            <Cake size={24} />
          </div>

          <div>
            <span>Today's Birthdays</span>
            <strong>
              {String(todayBirthdays.length).padStart(2, "0")}
            </strong>
            <small>🎉 Wish them today!</small>
          </div>
        </div>

        <div className="birthday-stat-card">
          <div className="stat-icon green">
            <CalendarDays size={24} />
          </div>

          <div>
            <span>Tomorrow's Birthdays</span>
            <strong>
              {String(tomorrowBirthdays.length).padStart(2, "0")}
            </strong>
            <small>🎂 Wish them tomorrow!</small>
          </div>
        </div>

        <div className="birthday-stat-card">
          <div className="stat-icon orange">
            <Bell size={24} />
          </div>

          <div>
            <span>This Week (7 Days)</span>
            <strong>{weekBirthdays.length}</strong>
            <small>Upcoming birthdays</small>
          </div>
        </div>

        <div className="birthday-stat-card">
          <div className="stat-icon blue">
            <Users size={24} />
          </div>

          <div>
            <span>Total Birthdays</span>
            <strong>{birthdays.length}</strong>
            <small>All categories</small>
          </div>
        </div>

        <div className="birthday-stat-card">
          <div className="stat-icon purple">
            <Send size={24} />
          </div>

          <div>
            <span>Greetings Sent</span>
            <strong>{greetingsSent}</strong>
            <small>This month</small>
          </div>
        </div>

        <div className="birthday-stat-card">
          <div className="stat-icon red">
            <Bell size={24} />
          </div>

          <div>
            <span>Reminders Scheduled</span>
            <strong>{remindersScheduled}</strong>
            <small>1 day before at 8:00 AM</small>
          </div>
        </div>

      </div>

      {/* FILTERS */}

      <div className="birthday-filters">

        <div className="filter-group">
          <label>Date</label>

          <input
            type="date"
            value={filters.date}
            onChange={(e) => {
              setFilters({
                ...filters,
                date: e.target.value,
              });
              setPage(1);
            }}
          />
        </div>

        <div className="filter-group">
          <label>User Type</label>

          <select
            value={filters.userType}
            onChange={(e) => {
              setFilters({
                ...filters,
                userType: e.target.value,
              });
              setPage(1);
            }}
          >
            <option value="">All User Types</option>
            <option value="DEALER">Dealer</option>
            <option value="PAINTER">Painter</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Category</label>

          <select
            value={filters.category}
            onChange={(e) =>
              setFilters({
                ...filters,
                category: e.target.value,
              })
            }
          >
            <option value="">All Categories</option>
            <option value="DEALER">Dealer</option>
            <option value="PAINTER">Painter</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Location / Branch</label>

          <input
            type="text"
            placeholder="All Locations"
            value={filters.location}
            onChange={(e) => {
              setFilters({
                ...filters,
                location: e.target.value,
              });
              setPage(1);
            }}
          />
        </div>

        <div className="filter-group">
          <label>Status</label>

          <select
            value={filters.status}
            onChange={(e) => {
              setFilters({
                ...filters,
                status: e.target.value,
              });
              setPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="DISABLED">Disabled</option>
          </select>
        </div>

        <div className="filter-group search-filter">
          <label>Search</label>

          <div className="search-input">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search by name or mobile..."
              value={filters.search}
              onChange={(e) => {
                setFilters({
                  ...filters,
                  search: e.target.value,
                });
                setPage(1);
              }}
            />
          </div>
        </div>

        <button
          className="reset-filter-btn"
          onClick={resetFilters}
        >
          <RefreshCw size={16} />
          Reset
        </button>

      </div>

      {/* UPCOMING BIRTHDAYS */}

      <div className="birthday-section">

        <div className="section-header">
          <h2>Upcoming Birthdays</h2>

          <button className="view-calendar-btn">
            View Calendar
            <CalendarDays size={15} />
          </button>
        </div>

        <div className="birthday-tabs">

          <button
            className={activeTab === "TODAY" ? "active" : ""}
            onClick={() => setActiveTab("TODAY")}
          >
            Today ({todayBirthdays.length})
          </button>

          <button
            className={activeTab === "TOMORROW" ? "active" : ""}
            onClick={() => setActiveTab("TOMORROW")}
          >
            Tomorrow ({tomorrowBirthdays.length})
          </button>

          <button
            className={activeTab === "THIS_WEEK" ? "active" : ""}
            onClick={() => setActiveTab("THIS_WEEK")}
          >
            This Week ({weekBirthdays.length})
          </button>

          <button
            className={activeTab === "THIS_MONTH" ? "active" : ""}
            onClick={() => setActiveTab("THIS_MONTH")}
          >
            This Month ({monthBirthdays.length})
          </button>

        </div>

        <div className="upcoming-birthday-grid">

          {getTabBirthdays().map((birthday) => (
            <div
              className="upcoming-birthday-card"
              key={birthday._id}
            >

              <div className="birthday-avatar">
                {birthday.name?.charAt(0)?.toUpperCase()}
              </div>

              <div className="birthday-card-info">

                <h3>{birthday.name}</h3>

                <span className="user-type-badge">
                  {birthday.userType}
                </span>

                <p>
                  {birthday.customType ||
                    birthday.userType ||
                    "Birthday"}
                </p>

                <p>{birthday.location || "-"}</p>

              </div>

              <div className="birthday-card-footer">

                <span>
                  {getBirthdayDate(birthday.dateOfBirth)}
                </span>

                <span>
                  ({calculateAge(birthday.dateOfBirth)} Years)
                </span>

                <button
                  onClick={() => handleSendGreeting(birthday)}
                >
                  <MessageCircle size={14} />
                  Send Wish
                </button>

              </div>

            </div>
          ))}

          {getTabBirthdays().length === 0 && (
            <div className="empty-birthday">
              No birthdays found
            </div>
          )}

        </div>

      </div>

      {/* BIRTHDAY LIST */}

      <div className="birthday-section">

        <div className="section-header">
          <h2>Birthday List</h2>
        </div>

        <div className="birthday-table-wrapper">

          <table className="birthday-table">

            <thead>
              <tr>
                <th>Name</th>
                <th>User Type</th>
                <th>Category</th>
                <th>Mobile Number</th>
                <th>Date of Birth</th>
                <th>Birthday</th>
                <th>Age</th>
                <th>Location / Branch</th>
                <th>Reminder</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td colSpan="11">
                    Loading birthdays...
                  </td>
                </tr>
              ) : paginatedBirthdays.length === 0 ? (
                <tr>
                  <td colSpan="11">
                    No birthdays found
                  </td>
                </tr>
              ) : (
                paginatedBirthdays.map((birthday) => (
                  <tr key={birthday._id}>

                    <td>
                      <div className="table-name">
                        <div className="small-avatar">
                          {birthday.name
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </div>

                        <span>{birthday.name}</span>
                      </div>
                    </td>

                    <td>{birthday.userType}</td>

                    <td>
                      {birthday.customType ||
                        birthday.userType}
                    </td>

                    <td>{birthday.mobileNumber || "-"}</td>

                    <td>
                      {getFullDate(birthday.dateOfBirth)}
                    </td>

                    <td>
                      {getBirthdayDate(birthday.dateOfBirth)}
                    </td>

                    <td>
                      {calculateAge(birthday.dateOfBirth)}
                    </td>

                    <td>{birthday.location || "-"}</td>

                    <td>
                      {birthday.reminderEnabled
                        ? "1 Day Before"
                        : "-"}
                    </td>

                    <td>
                      <span
                        className={
                          birthday.reminderEnabled
                            ? "status-badge scheduled"
                            : "status-badge disabled"
                        }
                      >
                        {birthday.reminderEnabled
                          ? "Scheduled"
                          : "Disabled"}
                      </span>
                    </td>

                    <td>
                      <div className="table-actionsb">

                        <button
                          title="Send WhatsApp"
                          onClick={() =>
                            handleWhatsApp(birthday)
                          }
                        >
                          <MessageCircle size={15} />
                        </button>

                        <button
                          title="Send Greeting"
                          onClick={() =>
                            handleSendGreeting(birthday)
                          }
                        >
                          <Send size={15} />
                        </button>

                        <button
                          title="View"
                          onClick={() =>
                            setViewBirthday(birthday)
                          }
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          title="Edit"
                          onClick={() =>
                            handleEditBirthday(birthday)
                          }
                        >
                          <Edit size={15} />
                        </button>

                        <button
                          title="Delete"
                          onClick={() =>
                            handleDeleteBirthday(birthday._id)
                          }
                        >
                          <Trash2 size={15} />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

        {/* PAGINATION */}

        <div className="birthday-pagination">

          <span>
            Showing{" "}
            {filteredBirthdays.length === 0
              ? 0
              : (page - 1) * itemsPerPage + 1}{" "}
            to{" "}
            {Math.min(
              page * itemsPerPage,
              filteredBirthdays.length
            )}{" "}
            of {filteredBirthdays.length} entries
          </span>

          <div className="pagination-buttonsb">

            <button
              disabled={page === 1}
              onClick={() =>
                setPage((prev) => Math.max(prev - 1, 1))
              }
            >
              <ChevronLeft size={15} />
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            )
              .slice(0, 5)
              .map((number) => (
                <button
                  key={number}
                  className={page === number ? "active" : ""}
                  onClick={() => setPage(number)}
                >
                  {number}
                </button>
              ))}

            <button
              disabled={
                totalPages === 0 || page === totalPages
              }
              onClick={() =>
                setPage((prev) =>
                  Math.min(prev + 1, totalPages)
                )
              }
            >
              <ChevronRight size={15} />
            </button>

          </div>

        </div>

      </div>

      {/* ADD / EDIT MODAL */}

      {showModal && (
        <div className="birthday-modal-overlay">

          <div className="birthday-modal">

            <div className="modal-header">

              <div>
                <h2>
                  {editingBirthday
                    ? "Edit Birthday"
                    : "Add Custom Birthday"}
                </h2>

                <p>
                  Enter birthday details below
                </p>
              </div>

              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                  setEditingBirthday(null);
                }}
              >
                <X size={20} />
              </button>

            </div>

            <form onSubmit={handleSaveBirthday}>

              <div className="form-grid">

                <div className="form-group">
                  <label>Name *</label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => /^[A-Za-z\s]*$/.test(e.target.value) && handleFormChange(e)}
                    placeholder="Enter name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>User Type *</label>

                  <select
                    name="userType"
                    value={formData.userType}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="DEALER">Dealer</option>
                    <option value="PAINTER">Painter</option>
                    <option value="EMPLOYEE">Employee</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>

                {formData.userType === "CUSTOM" && (
                  <div className="form-group">
                    <label>Custom Type *</label>

                    <input
                      type="text"
                      name="customType"
                      value={formData.customType}
                      onChange={handleFormChange}
                      placeholder="Enter custom type"
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Date of Birth *</label>

                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mobile Number *</label>

                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={(e) => /^\d{0,10}$/.test(e.target.value) && handleFormChange(e)}
                    placeholder="Enter mobile number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Location / Branch *</label>

                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleFormChange}
                    placeholder="Enter location / branch"
                    required
                  />
                </div>

                <div className="form-group reminder-form-group">

                  <label>Reminder</label>

                  <label className="reminder-toggle">

                    <input
                      type="checkbox"
                      name="reminderEnabled"
                      checked={formData.reminderEnabled}
                      onChange={handleFormChange}
                    />

                    <span>
                      Enable reminder
                    </span>

                  </label>

                  <small>
                    Reminder will be sent 1 day before
                    the birthday at 8:00 AM.
                  </small>

                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                    setEditingBirthday(null);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                >
                  {editingBirthday
                    ? "Update Birthday"
                    : "Save Birthday"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* RIGHT SIDEBAR */}
      <aside className="birthday-right-sidebar">

        <div className="birthday-side-card">
          <div className="side-card-header">
            <h3>Birthday Reminders</h3>
            <button type="button" title="Reminder Settings">
              <Settings size={15} />
            </button>
          </div>

          <div className="reminder-setting-row">
            <div className="reminder-setting-icon purple">
              <Bell size={16} />
            </div>
            <div>
              <span>Reminder Timing</span>
              <strong>1 Day Before</strong>
            </div>
          </div>

          <div className="reminder-setting-row">
            <div className="reminder-setting-icon blue">
              <Clock3 size={16} />
            </div>
            <div>
              <span>Reminder Time</span>
              <strong>08:00 AM</strong>
            </div>
          </div>

          <div className="reminder-setting-row">
            <div className="reminder-setting-icon green">
              <Globe2 size={16} />
            </div>
            <div>
              <span>Timezone</span>
              <strong>Asia/Kolkata (IST)</strong>
            </div>
          </div>

          <div className="reminder-status-row">
            <span>Status</span>
            <span className="active-status">Active</span>
            <span className="reminder-status-dot" />
          </div>
        </div>

        <div className="birthday-side-card">
          <div className="side-card-header">
            <h3>Upcoming Reminders</h3>
            <button type="button">View All</button>
          </div>

          <div className="side-reminder-list">
            {upcomingReminders.length === 0 ? (
              <p className="side-empty-text">No upcoming reminders</p>
            ) : (
              upcomingReminders.map((birthday) => (
                <div className="side-reminder-item" key={birthday._id}>
                  <div className="small-avatar">
                    {birthday.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="side-reminder-info">
                    <strong>{birthday.name}</strong>
                    <span>{getBirthdayDate(birthday.dateOfBirth)}, 08:00 AM</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {upcomingReminders.length > 5 && (
            <button type="button" className="more-reminders-btn">
              + {upcomingReminders.length - 5} more reminders
            </button>
          )}
        </div>

        <div className="birthday-side-card">
          <div className="side-card-header">
            <h3>Greeting Templates</h3>
            <button type="button">View All</button>
          </div>

          <div className="template-list">
            {greetingTemplateCounts.map((template) => (
              <div className="template-item" key={template.type}>
                <span className={`template-icon ${template.type.toLowerCase()}`}>
                  <MessageCircle size={13} />
                </span>
                <span>{template.label}</span>
                <strong>{template.count}</strong>
              </div>
            ))}
          </div>

          <button type="button" className="manage-templates-btn">
            Manage Templates
          </button>
        </div>

        <div className="birthday-side-card">
          <div className="side-card-header">
            <h3>Recent Greetings Sent</h3>
            <button type="button">View All</button>
          </div>

          <div className="recent-greeting-list">
            {recentGreetings.length === 0 ? (
              <p className="side-empty-text">No greetings sent yet</p>
            ) : (
              recentGreetings.map((greeting) => (
                <div className="recent-greeting-item" key={greeting._id}>
                  <div className="small-avatar">
                    {(greeting.recipientName || greeting.birthdayId?.name)?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <strong>{greeting.recipientName || greeting.birthdayId?.name || "Unknown"}</strong>
                    <span>{new Date(greeting.sentAt || greeting.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}, {new Date(greeting.sentAt || greeting.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </aside>

      {/* VIEW MODAL */}

      {viewBirthday && (
        <div className="birthday-modal-overlay">

          <div className="birthday-modal view-modal">

            <div className="modal-header">

              <div>
                <h2>Birthday Details</h2>
              </div>

            </div>

            <div className="birthday-view-details">

              <div className="view-avatar">
                {viewBirthday.name
                  ?.charAt(0)
                  ?.toUpperCase()}
              </div>

              <h3>{viewBirthday.name}</h3>

              <span className="user-type-badge">
                {viewBirthday.userType}
              </span>

              <div className="view-detail-grid">

                <div>
                  <label>Custom Type</label>
                  <p>
                    {viewBirthday.customType || "-"}
                  </p>
                </div>

                <div>
                  <label>Date of Birth</label>
                  <p>
                    {getFullDate(viewBirthday.dateOfBirth)}
                  </p>
                </div>

                <div>
                  <label>Birthday</label>
                  <p>
                    {getBirthdayDate(
                      viewBirthday.dateOfBirth
                    )}
                  </p>
                </div>

                <div>
                  <label>Age</label>
                  <p>
                    {calculateAge(
                      viewBirthday.dateOfBirth
                    )}
                  </p>
                </div>

                <div>
                  <label>Mobile Number</label>
                  <p>
                    {viewBirthday.mobileNumber || "-"}
                  </p>
                </div>

                <div>
                  <label>Location / Branch</label>
                  <p>
                    {viewBirthday.location || "-"}
                  </p>
                </div>

                <div>
                  <label>Reminder</label>
                  <p>
                    {viewBirthday.reminderEnabled
                      ? "1 Day Before at 8:00 AM"
                      : "Disabled"}
                  </p>
                </div>

                <div>
                  <label>Greeting</label>
                  <p>
                    {viewBirthday.greetingSent
                      ? "Sent"
                      : "Not Sent"}
                  </p>
                </div>

              </div>

            </div>

            <div className="modal-footer">

              <button
                className="cancel-btn"
                onClick={() => setViewBirthday(null)}
              >
                Close
              </button>

              <button
                className="primary-btn"
                onClick={() => {
                  setViewBirthday(null);
                  handleEditBirthday(viewBirthday);
                }}
              >
                <Edit size={15} />
                Edit
              </button>

              <button
                className="primary-btn"
                onClick={() =>
                  handleSendGreeting(viewBirthday)
                }
              >
                <Send size={15} />
                Send Greeting
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default BirthdayManagement;