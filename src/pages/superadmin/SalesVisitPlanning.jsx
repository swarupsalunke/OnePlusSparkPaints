import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Users,
  Map,
  Route as RouteIcon,
  CalendarDays,
  Store,
  Palette,
  UserRoundCheck,
  CircleCheck,
  MapPin,
  History,
  Phone,
  Navigation,
  MoreVertical,
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
} from "lucide-react";
import "../../css/superadmin/salesVisitPlanning.css";

const API_BASE_URL = "https://oneplussparkpaintsserver.onrender.com/api/sales-visits";

const initialVisitForm = {
  visitType: "DEALER",
  customerName: "",
  customerId: "",
  customerMobile: "",
  territory: "",
  beat: "",
  route: "",
  visitDate: "",
  visitTime: "",
  assignedTo: "",
  latitude: "",
  longitude: "",
  visitStatus: "PLANNED",
  remarks: "",
};

const initialBeatForm = {
  beatName: "",
  territory: "",
  assignedTo: "",
  customers: "",
  status: "ACTIVE",
};

const initialTerritoryForm = {
  territoryName: "",
  area: "",
  assignedTo: "",
  status: "ACTIVE",
};

const initialRouteForm = {
  routeName: "",
  territory: "",
  beat: "",
  assignedTo: "",
  routeDetails: "",
  status: "ACTIVE",
};

const getDateOnly = (date) => {
  if (!date) return "";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return "";

  return d.toISOString().split("T")[0];
};

const formatDate = (date) => {
  if (!date) return "-";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusLabel = (status) => {
  const map = {
    PLANNED: "Planned",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  return map[status] || status || "-";
};

const getTypeLabel = (type) => {
  return type === "PAINTER" ? "Painter" : "Dealer";
};

function SalesVisitPlanning() {
  const [dashboard, setDashboard] = useState({
    totalVisits: 0,
    plannedVisits: 0,
    inProgressVisits: 0,
    completedVisits: 0,
    cancelledVisits: 0,
    todayVisits: 0,
    activeBeats: 0,
    activeTerritories: 0,
    activeRoutes: 0,
  });

  const [visits, setVisits] = useState([]);
  const [beats, setBeats] = useState([]);
  const [territories, setTerritories] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [salesExecutives, setSalesExecutives] = useState([]);

  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    territory: "",
    beat: "",
    visitType: "",
    visitStatus: "",
    assignedTo: "",
    search: "",
  });

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showBeatModal, setShowBeatModal] = useState(false);
  const [showTerritoryModal, setShowTerritoryModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const [editingVisit, setEditingVisit] = useState(null);
  const [editingBeat, setEditingBeat] = useState(null);
  const [editingTerritory, setEditingTerritory] = useState(null);
  const [editingRoute, setEditingRoute] = useState(null);

  const [selectedVisit, setSelectedVisit] = useState(null);

  const [visitForm, setVisitForm] = useState(initialVisitForm);
  const [beatForm, setBeatForm] = useState(initialBeatForm);
  const [territoryForm, setTerritoryForm] = useState(
    initialTerritoryForm
  );
  const [routeForm, setRouteForm] = useState(initialRouteForm);

  const [assignForm, setAssignForm] = useState({
    route: "",
    assignedTo: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [openActionId, setOpenActionId] = useState(null);

  // =====================================================
  // FETCH DATA
  // =====================================================

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/dashboard`
      );

      if (response.data.success) {
        setDashboard(response.data.dashboard);
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    }
  };

  const fetchVisits = async () => {
    try {
      const response = await axios.get(API_BASE_URL);

      if (response.data.success) {
        setVisits(response.data.visits || []);
      }
    } catch (error) {
      console.error("Visits error:", error);
    }
  };

  const fetchBeats = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/beats`
      );

      if (response.data.success) {
        setBeats(response.data.beats || []);
      }
    } catch (error) {
      console.error("Beats error:", error);
    }
  };

  const fetchTerritories = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/territories`
      );

      if (response.data.success) {
        setTerritories(response.data.territories || []);
      }
    } catch (error) {
      console.error("Territories error:", error);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/routes`
      );

      if (response.data.success) {
        setRoutes(response.data.routes || []);
      }
    } catch (error) {
      console.error("Routes error:", error);
    }
  };

  const fetchSalesExecutives = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "https://oneplussparkpaintsserver.onrender.com/api/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSalesExecutives(
          (response.data.users || []).filter(
            (user) =>
              user.role === "SALES_EXECUTIVE" &&
              user.status === "ACTIVE"
          )
        );
      }
    } catch (error) {
      console.error("Sales Executives error:", error);
    }
  };

  const loadAllData = async () => {
    setLoading(true);

    await Promise.all([
      fetchDashboard(),
      fetchVisits(),
      fetchBeats(),
      fetchTerritories(),
      fetchRoutes(),
      fetchSalesExecutives(),
    ]);

    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // =====================================================
  // FILTER DATA
  // =====================================================

  const filteredVisits = useMemo(() => {
    return visits.filter((visit) => {
      const search = filters.search.trim().toLowerCase();

      const matchesSearch =
        !search ||
        visit.customerName?.toLowerCase().includes(search) ||
        visit.customerMobile?.toLowerCase().includes(search) ||
        visit.customerId?.toLowerCase().includes(search) ||
        visit.beat?.toLowerCase().includes(search) ||
        visit.territory?.toLowerCase().includes(search);

      const visitDate = getDateOnly(visit.visitDate);

      const matchesFrom =
        !filters.dateFrom ||
        visitDate >= filters.dateFrom;

      const matchesTo =
        !filters.dateTo ||
        visitDate <= filters.dateTo;

      const matchesTerritory =
        !filters.territory ||
        visit.territory === filters.territory;

      const matchesBeat =
        !filters.beat ||
        visit.beat === filters.beat;

      const matchesType =
        !filters.visitType ||
        visit.visitType === filters.visitType;

      const matchesStatus =
        !filters.visitStatus ||
        visit.visitStatus === filters.visitStatus;

      const matchesAssigned =
        !filters.assignedTo ||
        visit.assignedTo === filters.assignedTo;

      return (
        matchesSearch &&
        matchesFrom &&
        matchesTo &&
        matchesTerritory &&
        matchesBeat &&
        matchesType &&
        matchesStatus &&
        matchesAssigned
      );
    });
  }, [visits, filters]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredVisits.length / pageSize)
  );

  const paginatedVisits = filteredVisits.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // =====================================================
  // FILTER RESET
  // =====================================================

  const resetFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      territory: "",
      beat: "",
      visitType: "",
      visitStatus: "",
      assignedTo: "",
      search: "",
    });

    setCurrentPage(1);
  };

  // =====================================================
  // VISIT FORM
  // =====================================================

  const openCreateVisit = () => {
    setEditingVisit(null);

    setVisitForm({
      ...initialVisitForm,
      visitDate: new Date().toISOString().split("T")[0],
    });

    setShowVisitModal(true);
  };

  const openEditVisit = (visit) => {
    setEditingVisit(visit);

    setVisitForm({
      visitType: visit.visitType || "DEALER",
      customerName: visit.customerName || "",
      customerId: visit.customerId || "",
      customerMobile: visit.customerMobile || "",
      territory: visit.territory || "",
      beat: visit.beat || "",
      route: visit.route || "",
      visitDate: getDateOnly(visit.visitDate),
      visitTime: visit.visitTime || "",
      assignedTo: visit.assignedTo || "",
      latitude: visit.location?.latitude ?? "",
      longitude: visit.location?.longitude ?? "",
      visitStatus: visit.visitStatus || "PLANNED",
      remarks: visit.remarks || "",
    });

    setShowViewModal(false);
    setShowVisitModal(true);
  };

  const handleVisitChange = (e) => {
    const { name, value } = e.target;

    setVisitForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVisitSubmit = async (e) => {
    e.preventDefault();

    if (!visitForm.customerName.trim()) {
      alert("Please enter customer name.");
      return;
    }

    if (!visitForm.visitDate) {
      alert("Please select visit date.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        visitType: visitForm.visitType,
        customerName: visitForm.customerName.trim(),
        customerId: visitForm.customerId.trim(),
        customerMobile: visitForm.customerMobile.trim(),
        territory: visitForm.territory,
        beat: visitForm.beat,
        route: visitForm.route,
        visitDate: visitForm.visitDate,
        visitTime: visitForm.visitTime,
        assignedTo: visitForm.assignedTo.trim(),
        location: {
          latitude:
            visitForm.latitude === ""
              ? null
              : Number(visitForm.latitude),
          longitude:
            visitForm.longitude === ""
              ? null
              : Number(visitForm.longitude),
        },
        visitStatus: visitForm.visitStatus,
        remarks: visitForm.remarks.trim(),
      };

      if (editingVisit) {
        await axios.put(
          `${API_BASE_URL}/${editingVisit._id}`,
          payload
        );

        alert("Visit updated successfully.");
      } else {
        await axios.post(API_BASE_URL, payload);

        alert("Visit created successfully.");
      }

      setShowVisitModal(false);
      setEditingVisit(null);
      setVisitForm(initialVisitForm);

      await Promise.all([
        fetchDashboard(),
        fetchVisits(),
      ]);
    } catch (error) {
      console.error("Save visit error:", error);

      alert(
        error.response?.data?.message ||
        "Unable to save visit."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // VIEW VISIT
  // =====================================================

  const handleViewVisit = async (visit) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/${visit._id}`
      );

      if (response.data.success) {
        setSelectedVisit(response.data.visit);
        setShowViewModal(true);
      }
    } catch (error) {
      console.error("View visit error:", error);

      alert(
        error.response?.data?.message ||
        "Unable to fetch visit."
      );
    }

    setOpenActionId(null);
  };

  // =====================================================
  // DELETE VISIT
  // =====================================================

  const handleDeleteVisit = async (visit) => {
    const confirmed = window.confirm(
      `Delete visit for "${visit.customerName}"?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await axios.delete(
        `${API_BASE_URL}/${visit._id}`
      );

      alert("Visit deleted successfully.");

      await Promise.all([
        fetchDashboard(),
        fetchVisits(),
      ]);
    } catch (error) {
      console.error("Delete visit error:", error);

      alert(
        error.response?.data?.message ||
        "Unable to delete visit."
      );
    } finally {
      setLoading(false);
      setOpenActionId(null);
    }
  };

  // =====================================================
  // STATUS UPDATE
  // =====================================================

  const updateVisitStatus = async (
    visit,
    visitStatus
  ) => {
    try {
      setLoading(true);

      await axios.patch(
        `${API_BASE_URL}/${visit._id}/status`,
        {
          visitStatus,
        }
      );

      await Promise.all([
        fetchDashboard(),
        fetchVisits(),
      ]);
    } catch (error) {
      console.error(
        "Update visit status error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Unable to update visit status."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GPS
  // =====================================================

  const handleGPSUpdate = async (visit) => {
    if (!navigator.geolocation) {
      alert(
        "GPS is not supported by this browser."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          setLoading(true);

          await axios.patch(
            `${API_BASE_URL}/${visit._id}/gps`,
            {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }
          );

          alert("GPS location updated successfully.");

          await fetchVisits();
        } catch (error) {
          console.error(
            "GPS update error:",
            error
          );

          alert(
            error.response?.data?.message ||
            "Unable to update GPS location."
          );
        } finally {
          setLoading(false);
        }
      },
      () => {
        alert(
          "Unable to get your current location. Please allow GPS permission."
        );
      }
    );

    setOpenActionId(null);
  };

  // =====================================================
  // CALL CUSTOMER
  // =====================================================

  const handleCallCustomer = (visit) => {
    if (!visit.customerMobile) {
      alert("Customer mobile number not available.");
      return;
    }

    window.location.href = `tel:${visit.customerMobile}`;
  };

  // =====================================================
  // NAVIGATION
  // =====================================================

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

  // =====================================================
  // BEAT
  // =====================================================

  const openCreateBeat = () => {
    setEditingBeat(null);
    setBeatForm(initialBeatForm);
    setShowBeatModal(true);
  };

  const openEditBeat = (beat) => {
    setEditingBeat(beat);

    setBeatForm({
      beatName: beat.beatName || "",
      territory: beat.territory || "",
      assignedTo: beat.assignedTo || "",
      customers: (beat.customers || []).join(", "),
      status: beat.status || "ACTIVE",
    });

    setShowBeatModal(true);
  };

  const handleBeatSubmit = async (e) => {
    e.preventDefault();

    if (!beatForm.beatName.trim()) {
      alert("Please enter beat name.");
      return;
    }

    if (!beatForm.territory.trim()) {
      alert("Please enter territory.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        beatName: beatForm.beatName.trim(),
        territory: beatForm.territory.trim(),
        assignedTo: beatForm.assignedTo.trim(),
        customers: beatForm.customers
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        status: beatForm.status,
      };

      if (editingBeat) {
        await axios.put(
          `${API_BASE_URL}/beats/${editingBeat._id}`,
          payload
        );

        alert("Beat updated successfully.");
      } else {
        await axios.post(
          `${API_BASE_URL}/beats`,
          payload
        );

        alert("Beat created successfully.");
      }

      setShowBeatModal(false);
      setEditingBeat(null);
      setBeatForm(initialBeatForm);

      await Promise.all([
        fetchBeats(),
        fetchDashboard(),
      ]);
    } catch (error) {
      console.error("Beat save error:", error);

      alert(
        error.response?.data?.message ||
        "Unable to save beat."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBeat = async (beat) => {
    if (
      !window.confirm(
        `Delete beat "${beat.beatName}"?`
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      await axios.delete(
        `${API_BASE_URL}/beats/${beat._id}`
      );

      alert("Beat deleted successfully.");

      await Promise.all([
        fetchBeats(),
        fetchDashboard(),
      ]);
    } catch (error) {
      console.error("Delete beat error:", error);

      alert(
        error.response?.data?.message ||
        "Unable to delete beat."
      );
    }
  };

  // =====================================================
  // TERRITORY
  // =====================================================

  const openCreateTerritory = () => {
    setEditingTerritory(null);
    setTerritoryForm(initialTerritoryForm);
    setShowTerritoryModal(true);
  };

  const openEditTerritory = (territory) => {
    setEditingTerritory(territory);

    setTerritoryForm({
      territoryName: territory.territoryName || "",
      area: territory.area || "",
      assignedTo: territory.assignedTo || "",
      status: territory.status || "ACTIVE",
    });

    setShowTerritoryModal(true);
  };

  const handleTerritorySubmit = async (e) => {
    e.preventDefault();

    if (!territoryForm.territoryName.trim()) {
      alert("Please enter territory name.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        territoryName:
          territoryForm.territoryName.trim(),
        area: territoryForm.area.trim(),
        assignedTo: territoryForm.assignedTo.trim(),
        status: territoryForm.status,
      };

      if (editingTerritory) {
        await axios.put(
          `${API_BASE_URL}/territories/${editingTerritory._id}`,
          payload
        );

        alert("Territory updated successfully.");
      } else {
        await axios.post(
          `${API_BASE_URL}/territories`,
          payload
        );

        alert("Territory created successfully.");
      }

      setShowTerritoryModal(false);
      setEditingTerritory(null);
      setTerritoryForm(initialTerritoryForm);

      await Promise.all([
        fetchTerritories(),
        fetchDashboard(),
      ]);
    } catch (error) {
      console.error(
        "Territory save error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Unable to save territory."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTerritory = async (
    territory
  ) => {
    if (
      !window.confirm(
        `Delete territory "${territory.territoryName}"?`
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      await axios.delete(
        `${API_BASE_URL}/territories/${territory._id}`
      );

      alert("Territory deleted successfully.");

      await Promise.all([
        fetchTerritories(),
        fetchDashboard(),
      ]);
    } catch (error) {
      console.error(
        "Delete territory error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Unable to delete territory."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // ROUTE
  // =====================================================

  const openCreateRoute = () => {
    setEditingRoute(null);
    setRouteForm(initialRouteForm);
    setShowRouteModal(true);
  };

  const openEditRoute = (route) => {
    setEditingRoute(route);

    setRouteForm({
      routeName: route.routeName || "",
      territory: route.territory || "",
      beat: route.beat || "",
      assignedTo: route.assignedTo || "",
      routeDetails: route.routeDetails || "",
      status: route.status || "ACTIVE",
    });

    setShowRouteModal(true);
  };

  const handleRouteSubmit = async (e) => {
    e.preventDefault();

    if (!routeForm.routeName.trim()) {
      alert("Please enter route name.");
      return;
    }

    if (!routeForm.territory.trim()) {
      alert("Please select territory.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        routeName: routeForm.routeName.trim(),
        territory: routeForm.territory,
        beat: routeForm.beat,
        assignedTo: routeForm.assignedTo.trim(),
        routeDetails:
          routeForm.routeDetails.trim(),
        status: routeForm.status,
      };

      if (editingRoute) {
        await axios.put(
          `${API_BASE_URL}/routes/${editingRoute._id}`,
          payload
        );

        alert("Route updated successfully.");
      } else {
        await axios.post(
          `${API_BASE_URL}/routes`,
          payload
        );

        alert("Route created successfully.");
      }

      setShowRouteModal(false);
      setEditingRoute(null);
      setRouteForm(initialRouteForm);

      await Promise.all([
        fetchRoutes(),
        fetchDashboard(),
      ]);
    } catch (error) {
      console.error("Route save error:", error);

      alert(
        error.response?.data?.message ||
        "Unable to save route."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoute = async (route) => {
    if (
      !window.confirm(
        `Delete route "${route.routeName}"?`
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      await axios.delete(
        `${API_BASE_URL}/routes/${route._id}`
      );

      alert("Route deleted successfully.");

      await Promise.all([
        fetchRoutes(),
        fetchDashboard(),
      ]);
    } catch (error) {
      console.error(
        "Delete route error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Unable to delete route."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // ASSIGN ROUTE
  // =====================================================

  const openAssignRoute = (visit = null) => {
    if (visit) {
      setSelectedVisit(visit);

      setAssignForm({
        route: visit.route || "",
        assignedTo: visit.assignedTo || "",
      });
    } else {
      setSelectedVisit(null);

      setAssignForm({
        route: "",
        assignedTo: "",
      });
    }

    setShowAssignModal(true);
  };

  const handleAssignRoute = async (e) => {
    e.preventDefault();

    if (!selectedVisit) {
      alert("Please select a visit first.");
      return;
    }

    try {
      setLoading(true);

      await axios.put(
        `${API_BASE_URL}/${selectedVisit._id}`,
        {
          route: assignForm.route,
          assignedTo: assignForm.assignedTo,
        }
      );

      alert("Route assigned successfully.");

      setShowAssignModal(false);

      await fetchVisits();
    } catch (error) {
      console.error(
        "Assign route error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Unable to assign route."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CALENDAR
  // =====================================================

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(
      year,
      month,
      1
    ).getDay();

    const daysInMonth = new Date(
      year,
      month + 1,
      0
    ).getDate();

    const previousMonthDays = new Date(
      year,
      month,
      0
    ).getDate();

    const cells = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({
        day: previousMonthDays - i,
        current: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({
        day,
        current: true,
      });
    }

    while (cells.length < 42) {
      cells.push({
        day: cells.length - daysInMonth - firstDay + 1,
        current: false,
      });
    }

    return cells;
  }, [currentMonth]);

  const handleCalendarDate = (day) => {
    const year = currentMonth.getFullYear();
    const month = String(
      currentMonth.getMonth() + 1
    ).padStart(2, "0");

    const date = `${year}-${month}-${String(
      day
    ).padStart(2, "0")}`;

    setSelectedDate(date);

    setFilters((prev) => ({
      ...prev,
      dateFrom: date,
      dateTo: date,
    }));

    setCurrentPage(1);
  };

  const monthTitle = currentMonth.toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );

  // =====================================================
  // SUMMARY
  // =====================================================

  const todayString = new Date()
    .toISOString()
    .split("T")[0];

  const todayVisits = visits.filter(
    (visit) =>
      getDateOnly(visit.visitDate) === todayString
  );

  const completedToday = todayVisits.filter(
    (visit) =>
      visit.visitStatus === "COMPLETED"
  ).length;

  const pendingToday = todayVisits.filter(
    (visit) =>
      visit.visitStatus === "PLANNED" ||
      visit.visitStatus === "IN_PROGRESS"
  ).length;

  const cancelledToday = todayVisits.filter(
    (visit) =>
      visit.visitStatus === "CANCELLED"
  ).length;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="sales-visit-page">

      {/* PAGE HEADER */}
      <div className="sales-visit-header">
        <div>
          <h1>
            Sales Visit Planning & Beat Management
          </h1>

          <p>
            Plan beats, routes and visits to maximize
            sales productivity and improve field force
            efficiency.
          </p>

          <div className="sales-visit-breadcrumb">
            Dashboard
            <span>›</span>
            Sales Visit Planning
            <span>›</span>
            Overview
          </div>
        </div>

        <div className="sales-visit-header-actions">
          <button
            className="primary-action-btn"
            onClick={openCreateVisit}
          >
            <Plus size={17} />
            New Visit
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="sales-visit-stats">

        <StatCard
          icon={<Users />}
          title="Total Beats"
          value={dashboard.activeBeats}
          subtitle="Active Beats"
        />

        <StatCard
          icon={<Map />}
          title="Total Territories"
          value={dashboard.activeTerritories}
          subtitle="Assigned Territories"
        />

        <StatCard
          icon={<CalendarDays />}
          title="Today's Visits"
          value={dashboard.todayVisits}
          subtitle="Planned Visits"
        />

        <StatCard
          icon={<CircleCheck />}
          title="Completed Visits"
          value={dashboard.completedVisits}
          subtitle="Completed"
        />

        <StatCard
          icon={<Clock />}
          title="Pending Visits"
          value={dashboard.plannedVisits}
          subtitle="Pending"
        />

        <StatCard
          icon={<Users />}
          title="Active Field Users"
          value="-"
          subtitle="Field users"
        />

      </div>

      {/* FEATURE CARDS */}
      <div className="sales-visit-feature-grid">

        <FeatureCard
          icon={<Map />}
          title="Beat Planning"
          text="Plan beats"
          onClick={openCreateBeat}
        />

        <FeatureCard
          icon={<RouteIcon />}
          title="Route Planning"
          text="Optimize routes"
          onClick={openCreateRoute}
        />

        <FeatureCard
          icon={<Map />}
          title="Territory Mapping"
          text="Manage territories"
          onClick={openCreateTerritory}
        />

        <FeatureCard
          icon={<CalendarDays />}
          title="Visit Scheduling"
          text="Schedule visits"
          onClick={openCreateVisit}
        />

        <FeatureCard
          icon={<Store />}
          title="Dealer Visits"
          text="Manage dealers"
          onClick={() => {
            setFilters((prev) => ({
              ...prev,
              visitType: "DEALER",
            }));
            setCurrentPage(1);
          }}
        />

        <FeatureCard
          icon={<Palette />}
          title="Painter Visits"
          text="Manage painters"
          onClick={() => {
            setFilters((prev) => ({
              ...prev,
              visitType: "PAINTER",
            }));
            setCurrentPage(1);
          }}
        />

        <FeatureCard
          icon={<UserRoundCheck />}
          title="Daily Assignment"
          text="Assign routes"
          onClick={() => openAssignRoute()}
        />

        <FeatureCard
          icon={<CircleCheck />}
          title="Visit Status"
          text="Track visits"
          onClick={() => {
            setFilters((prev) => ({
              ...prev,
              visitStatus: "",
            }));
            setCurrentPage(1);
          }}
        />

        <FeatureCard
          icon={<MapPin />}
          title="GPS Tracking"
          text="Live tracking"
          onClick={() => {
            const firstVisit = filteredVisits[0];

            if (firstVisit) {
              handleGPSUpdate(firstVisit);
            } else {
              alert("No visit available for GPS tracking.");
            }
          }}
        />

        <FeatureCard
          icon={<History />}
          title="Visit History"
          text="View history"
          onClick={() => {
            setFilters((prev) => ({
              ...prev,
              visitStatus: "COMPLETED",
            }));
            setCurrentPage(1);
          }}
        />

      </div>

      {/* CONTENT AREA */}
      <div className="sales-visit-content-grid">

        <div className="sales-visit-main">

          {/* FILTERS */}
          <div className="sales-visit-filter-card">

            <div className="filter-title">
              <Filter size={17} />
              Filters
            </div>

            <div className="filter-grid">

              <div className="filter-field">
                <label>Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      dateFrom: e.target.value,
                    }));
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="filter-field">
                <label>Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      dateTo: e.target.value,
                    }));
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="filter-field">
                <label>Territory</label>
                <select
                  value={filters.territory}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      territory: e.target.value,
                    }));
                    setCurrentPage(1);
                  }}
                >
                  <option value="">
                    All Territories
                  </option>

                  {territories.map((territory) => (
                    <option
                      key={territory._id}
                      value={territory.territoryName}
                    >
                      {territory.territoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-field">
                <label>Beat</label>
                <select
                  value={filters.beat}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      beat: e.target.value,
                    }));
                    setCurrentPage(1);
                  }}
                >
                  <option value="">
                    All Beats
                  </option>

                  {beats.map((beat) => (
                    <option
                      key={beat._id}
                      value={beat.beatName}
                    >
                      {beat.beatName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-field">
                <label>Visit Type</label>
                <select
                  value={filters.visitType}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      visitType: e.target.value,
                    }));
                    setCurrentPage(1);
                  }}
                >
                  <option value="">
                    All Types
                  </option>
                  <option value="DEALER">
                    Dealer
                  </option>
                  <option value="PAINTER">
                    Painter
                  </option>
                </select>
              </div>

              <div className="filter-field">
                <label>Visit Status</label>
                <select
                  value={filters.visitStatus}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      visitStatus: e.target.value,
                    }));
                    setCurrentPage(1);
                  }}
                >
                  <option value="">
                    All Status
                  </option>
                  <option value="PLANNED">
                    Planned
                  </option>
                  <option value="IN_PROGRESS">
                    In Progress
                  </option>
                  <option value="COMPLETED">
                    Completed
                  </option>
                  <option value="CANCELLED">
                    Cancelled
                  </option>
                </select>
              </div>

              <div className="filter-field">
                <label>Assigned To</label>
                <input
                  type="text"
                  placeholder="All Users"
                  value={filters.assignedTo}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      assignedTo: e.target.value,
                    }));
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="filter-field search-field">
                <label>Search</label>

                <div className="search-input">
                  <Search size={16} />

                  <input
                    type="text"
                    placeholder="Search by name, mobile, customer ID..."
                    value={filters.search}
                    onChange={(e) => {
                      setFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }));
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              <button
                className="reset-filter-btn"
                onClick={resetFilters}
              >
                <RotateCcw size={16} />
                Reset
              </button>

            </div>
          </div>

          {/* SUMMARY + METRICS */}
          <div className="summary-metrics-grid">

            <div className="today-summary-card">

              <h3>Today's Visit Summary</h3>

              <div className="summary-body">

                <div className="summary-circle">
                  <strong>
                    {todayVisits.length}
                  </strong>
                  <span>Total Visits</span>
                </div>

                <div className="summary-list">

                  <SummaryItem
                    label="Completed"
                    value={completedToday}
                    type="completed"
                  />

                  <SummaryItem
                    label="Pending"
                    value={pendingToday}
                    type="pending"
                  />

                  <SummaryItem
                    label="Not Started"
                    value={
                      todayVisits.filter(
                        (v) =>
                          v.visitStatus === "PLANNED"
                      ).length
                    }
                    type="notstarted"
                  />

                  <SummaryItem
                    label="Cancelled"
                    value={cancelledToday}
                    type="cancelled"
                  />

                </div>

              </div>

            </div>

            <div className="visit-metrics-card">

              <MetricItem
                icon={<MapPin />}
                label="Total Distance"
                value="-"
              />

              <MetricItem
                icon={<Clock />}
                label="Estimated Time"
                value="-"
              />

              <MetricItem
                icon={<Clock />}
                label="Actual Time"
                value="-"
              />

              <MetricItem
                icon={<Clock />}
                label="Avg. Visit Time"
                value="-"
              />

              <MetricItem
                icon={<CalendarDays />}
                label="Planned Visits"
                value={dashboard.plannedVisits}
              />

              <MetricItem
                icon={<CheckCircle2 />}
                label="Completed Visits"
                value={dashboard.completedVisits}
              />

              <MetricItem
                icon={<Clock />}
                label="Pending Visits"
                value={dashboard.plannedVisits}
              />

            </div>

          </div>

          {/* VISIT TABLE */}
          <div className="visit-table-card">

            <div className="table-header">

              <div>
                <h3>Today's Visit Plan</h3>
                <span>
                  {filteredVisits.length} visits
                </span>
              </div>

              <button
                className="table-add-btn"
                onClick={openCreateVisit}
              >
                <Plus size={16} />
                Schedule Visit
              </button>

            </div>

            <div className="table-responsive">

              <table>

                <thead>
                  <tr>
                    <th>#</th>
                    <th>Visit ID</th>
                    <th>Type</th>
                    <th>Name</th>
                    <th>Beat / Route</th>
                    <th>Location</th>
                    <th>Scheduled Time</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {paginatedVisits.length === 0 ? (
                    <tr>
                      <td
                        colSpan="10"
                        className="empty-table"
                      >
                        No visits found.
                      </td>
                    </tr>
                  ) : (
                    paginatedVisits.map(
                      (visit, index) => (
                        <tr key={visit._id}>

                          <td>
                            {(currentPage - 1) *
                              pageSize +
                              index +
                              1}
                          </td>

                          <td>
                            <strong className="visit-id">
                              VIS-
                              {String(
                                (currentPage - 1) *
                                pageSize +
                                index +
                                1
                              ).padStart(4, "0")}
                            </strong>
                          </td>

                          <td>
                            <span
                              className={`type-badge ${visit.visitType ===
                                "PAINTER"
                                ? "painter"
                                : "dealer"
                                }`}
                            >
                              {getTypeLabel(
                                visit.visitType
                              )}
                            </span>
                          </td>

                          <td>
                            <div className="customer-name-cell">
                              <strong>
                                {visit.customerName}
                              </strong>

                              <small>
                                {visit.customerId ||
                                  "-"}
                              </small>
                            </div>
                          </td>

                          <td>
                            <div className="beat-route-cell">
                              <strong>
                                {visit.beat || "-"}
                              </strong>

                              <small>
                                {visit.route || "-"}
                              </small>
                            </div>
                          </td>

                          <td>
                            <div className="location-cell">
                              <MapPin size={14} />
                              <span>
                                {visit.territory ||
                                  "Location"}
                              </span>
                            </div>
                          </td>

                          <td>
                            <div className="schedule-cell">
                              <strong>
                                {visit.visitTime ||
                                  "-"}
                              </strong>

                              <small>
                                {formatDate(
                                  visit.visitDate
                                )}
                              </small>
                            </div>
                          </td>

                          <td>
                            <select
                              className={`status-select status-${visit.visitStatus?.toLowerCase()}`}
                              value={
                                visit.visitStatus
                              }
                              onChange={(e) =>
                                updateVisitStatus(
                                  visit,
                                  e.target.value
                                )
                              }
                            >
                              <option value="PLANNED">
                                Planned
                              </option>

                              <option value="IN_PROGRESS">
                                In Progress
                              </option>

                              <option value="COMPLETED">
                                Completed
                              </option>

                              <option value="CANCELLED">
                                Cancelled
                              </option>
                            </select>
                          </td>

                          <td>
                            <div className="assigned-cell">
                              <Users size={14} />
                              <span>
                                {visit.assignedTo ||
                                  "-"}
                              </span>
                            </div>
                          </td>

                          <td>

                            <div className="table-actions">

                              <button
                                title="Call Customer"
                                onClick={() =>
                                  handleCallCustomer(
                                    visit
                                  )
                                }
                              >
                                <Phone size={15} />
                              </button>

                              <button
                                title="Navigate"
                                onClick={() =>
                                  handleNavigation(
                                    visit
                                  )
                                }
                              >
                                <Navigation
                                  size={15}
                                />
                              </button>

                              <div className="more-action-wrapper">

                                <button
                                  title="More Options"
                                  onClick={() =>
                                    setOpenActionId(
                                      openActionId ===
                                        visit._id
                                        ? null
                                        : visit._id
                                    )
                                  }
                                >
                                  <MoreVertical
                                    size={16}
                                  />
                                </button>

                                {openActionId ===
                                  visit._id && (
                                    <div className="more-menu">

                                      <button
                                        onClick={() =>
                                          handleViewVisit(
                                            visit
                                          )
                                        }
                                      >
                                        <Eye size={15} />
                                        View
                                      </button>

                                      <button
                                        onClick={() =>
                                          openEditVisit(
                                            visit
                                          )
                                        }
                                      >
                                        <Pencil
                                          size={15}
                                        />
                                        Edit
                                      </button>

                                      <button
                                        onClick={() =>
                                          openAssignRoute(
                                            visit
                                          )
                                        }
                                      >
                                        <RouteIcon
                                          size={15}
                                        />
                                        Assign Route
                                      </button>

                                      <button
                                        onClick={() =>
                                          handleGPSUpdate(
                                            visit
                                          )
                                        }
                                      >
                                        <MapPin
                                          size={15}
                                        />
                                        GPS Tracking
                                      </button>

                                      <button
                                        className="danger-option"
                                        onClick={() =>
                                          handleDeleteVisit(
                                            visit
                                          )
                                        }
                                      >
                                        <Trash2
                                          size={15}
                                        />
                                        Delete
                                      </button>

                                    </div>
                                  )}

                              </div>

                            </div>

                          </td>

                        </tr>
                      )
                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* PAGINATION */}
            <div className="table-pagination">

              <span>
                Showing{" "}
                {filteredVisits.length === 0
                  ? 0
                  : (currentPage - 1) *
                  pageSize +
                  1}{" "}
                to{" "}
                {Math.min(
                  currentPage * pageSize,
                  filteredVisits.length
                )}{" "}
                of {filteredVisits.length} entries
              </span>

              <div className="pagination-controlsv">

                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage(
                      (prev) => prev - 1
                    )
                  }
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) => index + 1
                )
                  .slice(0, 5)
                  .map((page) => (
                    <button
                      key={page}
                      className={
                        currentPage === page
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setCurrentPage(page)
                      }
                    >
                      {page}
                    </button>
                  ))}

                <button
                  disabled={
                    currentPage === totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (prev) => prev + 1
                    )
                  }
                >
                  <ChevronRight size={16} />
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="sales-visit-sidebar">

          {/* CALENDAR */}
          <div className="sidebar-card calendar-card">

            <div className="sidebar-card-header">
              <h3>Visit Calendar</h3>

              <div className="calendar-navigation">

                <button
                  onClick={() =>
                    setCurrentMonth(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() - 1,
                        1
                      )
                    )
                  }
                >
                  <ChevronLeft size={15} />
                </button>

                <strong>{monthTitle}</strong>

                <button
                  onClick={() =>
                    setCurrentMonth(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() + 1,
                        1
                      )
                    )
                  }
                >
                  <ChevronRight size={15} />
                </button>

              </div>
            </div>

            <div className="calendar-weekdays">
              {[
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
              ].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            <div className="calendar-grid">

              {calendarDays.map(
                (item, index) => {
                  const date = `${currentMonth.getFullYear()}-${String(
                    currentMonth.getMonth() + 1
                  ).padStart(2, "0")}-${String(
                    item.day
                  ).padStart(2, "0")}`;

                  const hasVisit =
                    visits.some(
                      (visit) =>
                        getDateOnly(
                          visit.visitDate
                        ) === date
                    );

                  return (
                    <button
                      key={`${item.day}-${index}`}
                      className={`
                        calendar-day
                        ${!item.current
                          ? "muted"
                          : ""
                        }
                        ${selectedDate === date
                          ? "selected"
                          : ""
                        }
                        ${hasVisit
                          ? "has-visit"
                          : ""
                        }
                      `}
                      onClick={() =>
                        item.current &&
                        handleCalendarDate(
                          item.day
                        )
                      }
                    >
                      {item.day}
                    </button>
                  );
                }
              )}

            </div>

          </div>

          {/* FIELD FORCE */}
          <div className="sidebar-card">

            <div className="sidebar-card-header">
              <h3>Field Force Live Tracking</h3>

              <button
                className="text-link"
                onClick={() => {
                  const firstVisit =
                    filteredVisits[0];

                  if (firstVisit) {
                    handleGPSUpdate(
                      firstVisit
                    );
                  } else {
                    alert(
                      "No visit available for GPS tracking."
                    );
                  }
                }}
              >
                Update GPS
              </button>
            </div>

            {filteredVisits.length === 0 ? (
              <div className="sidebar-empty">
                <MapPin size={20} />
                <span>No field visit available</span>
              </div>
            ) : (
              <div className="field-force-list">

                {filteredVisits
                  .slice(0, 4)
                  .map((visit) => (
                    <div
                      className="field-force-item"
                      key={visit._id}
                    >

                      <div className="field-user-icon">
                        <Users size={17} />
                      </div>

                      <div className="field-user-info">
                        <strong>
                          {visit.assignedTo ||
                            "Unassigned"}
                        </strong>

                        <small>
                          {visit.beat ||
                            "No Beat"}
                        </small>
                      </div>

                      <span
                        className={`field-status ${visit.visitStatus ===
                          "COMPLETED"
                          ? "completed"
                          : visit.visitStatus ===
                            "CANCELLED"
                            ? "offline"
                            : "route"
                          }`}
                      >
                        {getStatusLabel(
                          visit.visitStatus
                        )}
                      </span>

                    </div>
                  ))}

              </div>
            )}

          </div>

          {/* QUICK ACTIONS */}
          <div className="sidebar-card">

            <div className="sidebar-card-header">
              <h3>Quick Actions</h3>
            </div>

            <div className="quick-actions-grid">

              <button onClick={openCreateBeat}>
                <Map size={17} />
                Plan New Beat
              </button>

              <button onClick={openCreateRoute}>
                <RouteIcon size={17} />
                Plan Route
              </button>

              <button onClick={openCreateVisit}>
                <CalendarDays size={17} />
                Schedule Visit
              </button>

              <button
                onClick={() => openAssignRoute()}
              >
                <UserRoundCheck size={17} />
                Assign Route
              </button>

              <button
                onClick={() => {
                  setFilters((prev) => ({
                    ...prev,
                    dateFrom: "",
                    dateTo: "",
                  }));

                  setCurrentPage(1);

                  document
                    .querySelector(
                      ".visit-table-card"
                    )
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }}
              >
                <ClipboardList size={17} />
                View All Visits
              </button>

              <button
                onClick={() =>
                  setShowReportModal(true)
                }
              >
                <History size={17} />
                Visit Reports
              </button>

            </div>

          </div>

        </aside>

      </div>

      {/* =====================================================
          VISIT MODAL
      ===================================================== */}

      {showVisitModal && (
        <Modal
          title={
            editingVisit
              ? "Edit Visit"
              : "Schedule New Visit"
          }
          onClose={() => {
            setShowVisitModal(false);
            setEditingVisit(null);
          }}
        >

          <form
            className="modal-form"
            onSubmit={handleVisitSubmit}
          >

            <div className="form-grid">

              <FormField label="Visit Type">
                <select
                  name="visitType"
                  value={visitForm.visitType}
                  onChange={handleVisitChange}
                >
                  <option value="DEALER">
                    Dealer
                  </option>
                  <option value="PAINTER">
                    Painter
                  </option>
                </select>
              </FormField>

              <FormField label="Customer Name">
                <input
                  name="customerName"
                  value={visitForm.customerName}
                  onChange={(e) => /^[A-Za-z\s]*$/.test(e.target.value) && handleVisitChange(e)}
                  placeholder="Enter customer name"
                  required
                />
              </FormField>

              <FormField label="Customer ID">
                <input
                  name="customerId"
                  value={visitForm.customerId}
                  onChange={handleVisitChange}
                  placeholder="Enter customer ID"
                />
              </FormField>

              <FormField label="Customer Mobile">
                <input
                  name="customerMobile"
                  value={visitForm.customerMobile}
                  onChange={(e) => /^\d{0,10}$/.test(e.target.value) && handleVisitChange(e)}
                  placeholder="Enter mobile number"
                />
              </FormField>

              <FormField label="Territory">
                <select
                  name="territory"
                  value={visitForm.territory}
                  onChange={handleVisitChange}
                >
                  <option value="">
                    Select Territory
                  </option>

                  {territories.map((territory) => (
                    <option
                      key={territory._id}
                      value={
                        territory.territoryName
                      }
                    >
                      {territory.territoryName}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Beat">
                <select
                  name="beat"
                  value={visitForm.beat}
                  onChange={handleVisitChange}
                >
                  <option value="">
                    Select Beat
                  </option>

                  {beats.map((beat) => (
                    <option
                      key={beat._id}
                      value={beat.beatName}
                    >
                      {beat.beatName}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Route">
                <select
                  name="route"
                  value={visitForm.route}
                  onChange={handleVisitChange}
                >
                  <option value="">
                    Select Route
                  </option>

                  {routes.map((route) => (
                    <option
                      key={route._id}
                      value={route.routeName}
                    >
                      {route.routeName}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Visit Date">
                <input
                  type="date"
                  name="visitDate"
                  value={visitForm.visitDate}
                  onChange={handleVisitChange}
                  required
                />
              </FormField>

              <FormField label="Visit Time">
                <input
                  type="time"
                  name="visitTime"
                  value={
                    visitForm.visitTime
                      ?.includes(":")
                      ? visitForm.visitTime
                      : ""
                  }
                  onChange={handleVisitChange}
                />
              </FormField>

              <FormField label="Assigned To">
                <select
                  name="assignedTo"
                  value={visitForm.assignedTo}
                  onChange={handleVisitChange}
                >
                  <option value="">Select Sales Executive</option>

                  {salesExecutives.map((user) => (
                    <option key={user._id} value={user.name}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Visit Status">
                <select
                  name="visitStatus"
                  value={visitForm.visitStatus}
                  onChange={handleVisitChange}
                >
                  <option value="PLANNED">
                    Planned
                  </option>
                  <option value="IN_PROGRESS">
                    In Progress
                  </option>
                  <option value="COMPLETED">
                    Completed
                  </option>
                  <option value="CANCELLED">
                    Cancelled
                  </option>
                </select>
              </FormField>

              <FormField label="Latitude">
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={visitForm.latitude}
                  onChange={handleVisitChange}
                  placeholder="18.5204"
                />
              </FormField>

              <FormField label="Longitude">
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={visitForm.longitude}
                  onChange={handleVisitChange}
                  placeholder="73.8567"
                />
              </FormField>

            </div>

            <FormField label="Remarks">
              <textarea
                name="remarks"
                value={visitForm.remarks}
                onChange={handleVisitChange}
                placeholder="Enter remarks"
                rows="3"
              />
            </FormField>

            <ModalActions
              onCancel={() =>
                setShowVisitModal(false)
              }
              submitText={
                editingVisit
                  ? "Update Visit"
                  : "Schedule Visit"
              }
            />

          </form>

        </Modal>
      )}

      {/* =====================================================
          BEAT MODAL
      ===================================================== */}

      {showBeatModal && (
        <Modal
          title={
            editingBeat
              ? "Edit Beat"
              : "Plan New Beat"
          }
          onClose={() =>
            setShowBeatModal(false)
          }
        >

          <form
            className="modal-form"
            onSubmit={handleBeatSubmit}
          >

            <div className="form-grid">

              <FormField label="Beat Name">
                <input
                  value={beatForm.beatName}
                  onChange={(e) =>
                    setBeatForm((prev) => ({
                      ...prev,
                      beatName: e.target.value,
                    }))
                  }
                  placeholder="Enter beat name"
                  required
                />
              </FormField>

              <FormField label="Territory">
                <input
                  value={beatForm.territory}
                  onChange={(e) =>
                    setBeatForm((prev) => ({
                      ...prev,
                      territory: e.target.value,
                    }))
                  }
                  placeholder="Enter territory"
                  required
                />
              </FormField>

              <FormField label="Assigned To">
                <input
                  value={beatForm.assignedTo}
                  onChange={(e) =>
                    setBeatForm((prev) => ({
                      ...prev,
                      assignedTo: e.target.value,
                    }))
                  }
                  placeholder="Sales user"
                />
              </FormField>

              <FormField label="Status">
                <select
                  value={beatForm.status}
                  onChange={(e) =>
                    setBeatForm((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                >
                  <option value="ACTIVE">
                    Active
                  </option>
                  <option value="INACTIVE">
                    Inactive
                  </option>
                </select>
              </FormField>

            </div>

            <FormField label="Customers">
              <input
                value={beatForm.customers}
                onChange={(e) =>
                  setBeatForm((prev) => ({
                    ...prev,
                    customers: e.target.value,
                  }))
                }
                placeholder="CUS001, CUS002, CUS003"
              />
            </FormField>

            <ModalActions
              onCancel={() =>
                setShowBeatModal(false)
              }
              submitText={
                editingBeat
                  ? "Update Beat"
                  : "Create Beat"
              }
            />

          </form>

        </Modal>
      )}

      {/* =====================================================
          TERRITORY MODAL
      ===================================================== */}

      {showTerritoryModal && (
        <Modal
          title={
            editingTerritory
              ? "Edit Territory"
              : "Plan Territory"
          }
          onClose={() =>
            setShowTerritoryModal(false)
          }
        >

          <form
            className="modal-form"
            onSubmit={handleTerritorySubmit}
          >

            <div className="form-grid">

              <FormField label="Territory Name">
                <input
                  value={
                    territoryForm.territoryName
                  }
                  onChange={(e) =>
                    setTerritoryForm((prev) => ({
                      ...prev,
                      territoryName:
                        e.target.value,
                    }))
                  }
                  placeholder="Enter territory name"
                  required
                />
              </FormField>

              <FormField label="Area">
                <input
                  value={territoryForm.area}
                  onChange={(e) =>
                    setTerritoryForm((prev) => ({
                      ...prev,
                      area: e.target.value,
                    }))
                  }
                  placeholder="Enter area"
                />
              </FormField>

              <FormField label="Assigned To">
                <input
                  value={
                    territoryForm.assignedTo
                  }
                  onChange={(e) =>
                    setTerritoryForm((prev) => ({
                      ...prev,
                      assignedTo:
                        e.target.value,
                    }))
                  }
                  placeholder="Sales user"
                />
              </FormField>

              <FormField label="Status">
                <select
                  value={territoryForm.status}
                  onChange={(e) =>
                    setTerritoryForm((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                >
                  <option value="ACTIVE">
                    Active
                  </option>
                  <option value="INACTIVE">
                    Inactive
                  </option>
                </select>
              </FormField>

            </div>

            <ModalActions
              onCancel={() =>
                setShowTerritoryModal(false)
              }
              submitText={
                editingTerritory
                  ? "Update Territory"
                  : "Create Territory"
              }
            />

          </form>

        </Modal>
      )}

      {/* =====================================================
          ROUTE MODAL
      ===================================================== */}

      {showRouteModal && (
        <Modal
          title={
            editingRoute
              ? "Edit Route"
              : "Plan New Route"
          }
          onClose={() =>
            setShowRouteModal(false)
          }
        >

          <form
            className="modal-form"
            onSubmit={handleRouteSubmit}
          >

            <div className="form-grid">

              <FormField label="Route Name">
                <input
                  value={routeForm.routeName}
                  onChange={(e) =>
                    setRouteForm((prev) => ({
                      ...prev,
                      routeName: e.target.value,
                    }))
                  }
                  placeholder="Enter route name"
                  required
                />
              </FormField>

              <FormField label="Territory">
                <select
                  value={routeForm.territory}
                  onChange={(e) =>
                    setRouteForm((prev) => ({
                      ...prev,
                      territory: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="">
                    Select Territory
                  </option>

                  {territories.map((territory) => (
                    <option
                      key={territory._id}
                      value={
                        territory.territoryName
                      }
                    >
                      {territory.territoryName}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Beat">
                <select
                  value={routeForm.beat}
                  onChange={(e) =>
                    setRouteForm((prev) => ({
                      ...prev,
                      beat: e.target.value,
                    }))
                  }
                >
                  <option value="">
                    Select Beat
                  </option>

                  {beats.map((beat) => (
                    <option
                      key={beat._id}
                      value={beat.beatName}
                    >
                      {beat.beatName}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Assigned To">
                <input
                  value={routeForm.assignedTo}
                  onChange={(e) =>
                    setRouteForm((prev) => ({
                      ...prev,
                      assignedTo:
                        e.target.value,
                    }))
                  }
                  placeholder="Sales user"
                />
              </FormField>

              <FormField label="Status">
                <select
                  value={routeForm.status}
                  onChange={(e) =>
                    setRouteForm((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                >
                  <option value="ACTIVE">
                    Active
                  </option>
                  <option value="INACTIVE">
                    Inactive
                  </option>
                </select>
              </FormField>

            </div>

            <FormField label="Route Details">
              <textarea
                value={routeForm.routeDetails}
                onChange={(e) =>
                  setRouteForm((prev) => ({
                    ...prev,
                    routeDetails: e.target.value,
                  }))
                }
                placeholder="Enter route details"
                rows="3"
              />
            </FormField>

            <ModalActions
              onCancel={() =>
                setShowRouteModal(false)
              }
              submitText={
                editingRoute
                  ? "Update Route"
                  : "Create Route"
              }
            />

          </form>

        </Modal>
      )}

      {/* =====================================================
          VIEW VISIT MODAL
      ===================================================== */}

      {showViewModal && selectedVisit && (
        <Modal
          title="Visit Details"
          onClose={() =>
            setShowViewModal(false)
          }
        >

          <div className="view-details-grid">

            <DetailItem
              label="Visit Type"
              value={getTypeLabel(
                selectedVisit.visitType
              )}
            />

            <DetailItem
              label="Customer Name"
              value={selectedVisit.customerName}
            />

            <DetailItem
              label="Customer ID"
              value={selectedVisit.customerId}
            />

            <DetailItem
              label="Customer Mobile"
              value={
                selectedVisit.customerMobile
              }
            />

            <DetailItem
              label="Territory"
              value={selectedVisit.territory}
            />

            <DetailItem
              label="Beat"
              value={selectedVisit.beat}
            />

            <DetailItem
              label="Route"
              value={selectedVisit.route}
            />

            <DetailItem
              label="Visit Date"
              value={formatDate(
                selectedVisit.visitDate
              )}
            />

            <DetailItem
              label="Visit Time"
              value={selectedVisit.visitTime}
            />

            <DetailItem
              label="Assigned To"
              value={selectedVisit.assignedTo}
            />

            <DetailItem
              label="Status"
              value={getStatusLabel(
                selectedVisit.visitStatus
              )}
            />

            <DetailItem
              label="Latitude"
              value={
                selectedVisit.location?.latitude
              }
            />

            <DetailItem
              label="Longitude"
              value={
                selectedVisit.location?.longitude
              }
            />

          </div>

          <div className="view-remarks">
            <strong>Remarks</strong>
            <p>
              {selectedVisit.remarks ||
                "No remarks"}
            </p>
          </div>

          <div className="modal-footer">

            <button
              className="secondary-btn"
              onClick={() =>
                setShowViewModal(false)
              }
            >
              Close
            </button>

            <button
              className="primary-btn"
              onClick={() =>
                openEditVisit(selectedVisit)
              }
            >
              <Pencil size={15} />
              Edit Visit
            </button>

          </div>

        </Modal>
      )}

      {/* =====================================================
          ASSIGN ROUTE MODAL
      ===================================================== */}

      {showAssignModal && (
        <Modal
          title="Assign Route"
          onClose={() =>
            setShowAssignModal(false)
          }
        >

          <form
            className="modal-form"
            onSubmit={handleAssignRoute}
          >

            {!selectedVisit && (
              <div className="assign-help">
                Select a visit from the table's
                More Options menu to assign a route.
              </div>
            )}

            {selectedVisit && (
              <>
                <div className="selected-visit-info">
                  <strong>
                    {selectedVisit.customerName}
                  </strong>

                  <span>
                    {selectedVisit.customerId ||
                      "-"}
                  </span>
                </div>

                <FormField label="Route">
                  <select
                    value={assignForm.route}
                    onChange={(e) =>
                      setAssignForm((prev) => ({
                        ...prev,
                        route: e.target.value,
                      }))
                    }
                  >
                    <option value="">
                      Select Route
                    </option>

                    {routes.map((route) => (
                      <option
                        key={route._id}
                        value={route.routeName}
                      >
                        {route.routeName}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Assigned To">
                  <input
                    value={assignForm.assignedTo}
                    onChange={(e) =>
                      setAssignForm((prev) => ({
                        ...prev,
                        assignedTo:
                          e.target.value,
                      }))
                    }
                    placeholder="Sales user"
                  />
                </FormField>
              </>
            )}

            <ModalActions
              onCancel={() =>
                setShowAssignModal(false)
              }
              submitText="Assign Route"
            />

          </form>

        </Modal>
      )}

      {/* =====================================================
          VISIT REPORT MODAL
      ===================================================== */}

      {showReportModal && (
        <Modal
          title="Visit Reports"
          onClose={() =>
            setShowReportModal(false)
          }
        >

          <div className="report-summary-grid">

            <div>
              <span>Total Visits</span>
              <strong>{visits.length}</strong>
            </div>

            <div>
              <span>Planned</span>
              <strong>
                {
                  visits.filter(
                    (v) =>
                      v.visitStatus ===
                      "PLANNED"
                  ).length
                }
              </strong>
            </div>

            <div>
              <span>In Progress</span>
              <strong>
                {
                  visits.filter(
                    (v) =>
                      v.visitStatus ===
                      "IN_PROGRESS"
                  ).length
                }
              </strong>
            </div>

            <div>
              <span>Completed</span>
              <strong>
                {
                  visits.filter(
                    (v) =>
                      v.visitStatus ===
                      "COMPLETED"
                  ).length
                }
              </strong>
            </div>

            <div>
              <span>Cancelled</span>
              <strong>
                {
                  visits.filter(
                    (v) =>
                      v.visitStatus ===
                      "CANCELLED"
                  ).length
                }
              </strong>
            </div>

          </div>

          <div className="report-info">
            Report summary is based on the visits
            currently available in the system.
          </div>

          <div className="modal-footer">

            <button
              className="secondary-btn"
              onClick={() =>
                setShowReportModal(false)
              }
            >
              Close
            </button>

          </div>

        </Modal>
      )}

      {loading && (
        <div className="sales-visit-loading">
          Processing...
        </div>
      )}

    </div>
  );
}


// =====================================================
// REUSABLE COMPONENTS
// =====================================================

function StatCard({
  icon,
  title,
  value,
  subtitle,
}) {
  return (
    <div className="stat-card">

      <div className="stat-icon">
        {icon}
      </div>

      <div className="stat-content">
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{subtitle}</small>
      </div>

    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
  onClick,
}) {
  return (
    <button
      className="feature-card"
      onClick={onClick}
    >
      <div className="feature-icon">
        {icon}
      </div>

      <strong>{title}</strong>
      <span>{text}</span>
    </button>
  );
}

function SummaryItem({
  label,
  value,
  type,
}) {
  return (
    <div className="summary-item">

      <span
        className={`summary-dot ${type}`}
      />

      <span>{label}</span>

      <strong>{value}</strong>

    </div>
  );
}

function MetricItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="metric-item">

      <div className="metric-icon">
        {icon}
      </div>

      <span>{label}</span>

      <strong>{value}</strong>

    </div>
  );
}

function FormField({
  label,
  children,
}) {
  return (
    <div className="form-field">
      <label>{label}</label>
      {children}
    </div>
  );
}

function DetailItem({
  label,
  value,
}) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>
        {value === null ||
          value === undefined ||
          value === ""
          ? "-"
          : value}
      </strong>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}) {
  return (
    <div
      className="sales-modal-overlay"
      onMouseDown={(e) => {
        if (
          e.target === e.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="sales-modal">

        <div className="sales-modal-header">

          <h2>{title}</h2>

        </div>

        <div className="sales-modal-body">
          {children}
        </div>

      </div>
    </div>
  );
}

function ModalActions({
  onCancel,
  submitText,
}) {
  return (
    <div className="modal-footer">

      <button
        type="button"
        className="secondary-btn"
        onClick={onCancel}
      >
        Cancel
      </button>

      <button
        type="submit"
        className="primary-btn"
      >
        <Plus size={15} />
        {submitText}
      </button>

    </div>
  );
}

export default SalesVisitPlanning;