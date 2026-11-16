import React, { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Search,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    Upload,
    Download,
    SlidersHorizontal,
    RotateCcw,
    Eye,
    Pencil,
    Trash2,
    Users,
    UserCheck,
    CalendarCheck,
    UserPlus,
    UserX,
    UserRoundPlus,
    ClipboardCheck,
    WalletCards,
    Award,
    FileWarning,
    Cake,
    X,
    Save,
    Clock3,
    AlertCircle,
    BadgeCheck,
} from "lucide-react";

import "../../css/superadmin/EmployeeHRManagement.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const EMPLOYEE_API = `${API_BASE_URL}/api/hr/employees`;
const LEAVE_API = `${API_BASE_URL}/api/leaves`;
const ATTENDANCE_API = `${API_BASE_URL}/api/hr/attendance`;

const PAGE_SIZE = 10;

const emptyEmployeeForm = {
    name: "",
    department: "",
    designation: "",
    email: "",
    mobile: "",
    location: "",
    employmentType: "PERMANENT",
    status: "ACTIVE",
    joiningDate: "",
};

// Fixed color palette used consistently across the department donut + legend
const DEPARTMENT_COLORS = [
    "#2563eb",
    "#16a34a",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
    "#ef4444",
    "#94a3b8",
];

const EmployeeHRManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [leaves, setLeaves] = useState([]);

    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [attendanceLoading, setAttendanceLoading] = useState(false);

    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [savingAttendance, setSavingAttendance] = useState(false);

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const [attendanceForm, setAttendanceForm] = useState({
        employee: "",
        date: getTodayDate(),
        status: "PRESENT",
        checkIn: "",
        checkOut: "",
        remarks: "",
    });

    const [attendanceError, setAttendanceError] = useState("");

    const [loading, setLoading] = useState(true);
    const [leaveLoading, setLeaveLoading] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    /* Add / Edit modal share one form */
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
    const [editingEmployeeId, setEditingEmployeeId] = useState(null);
    const [savingEmployee, setSavingEmployee] = useState(false);

    const [employeeForm, setEmployeeForm] = useState(emptyEmployeeForm);
    const [formError, setFormError] = useState("");

    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [designationFilter, setDesignationFilter] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [employmentTypeFilter, setEmploymentTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);

    /* Delete confirmation */
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deletingEmployee, setDeletingEmployee] = useState(false);

    /* =========================================================
       FETCH EMPLOYEES
    ========================================================= */

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(EMPLOYEE_API);
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to fetch employees");
            }

            setEmployees(data.employees || []);
        } catch (err) {
            console.error("Fetch employees error:", err);
            setError(err.message || "Failed to load employees");
        } finally {
            setLoading(false);
        }
    };

    /* =========================================================
       FETCH LEAVES
    ========================================================= */

    const fetchLeaves = async () => {
        try {
            setLeaveLoading(true);

            const response = await fetch(LEAVE_API);
            const data = await response.json();

            if (response.ok && data.success) {
                setLeaves(data.leaves || []);
            }
        } catch (err) {
            console.error("Fetch leaves error:", err);
        } finally {
            setLeaveLoading(false);
        }
    };

    const fetchAttendance = async (date = getTodayDate()) => {
        try {
            setAttendanceLoading(true);

            const response = await fetch(
                `${ATTENDANCE_API}?date=${date}`
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to fetch attendance");
            }

            setAttendanceRecords(data.data || []);
        } catch (err) {
            console.error("Fetch attendance error:", err);
            setError(err.message || "Failed to load attendance");
        } finally {
            setAttendanceLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
        fetchLeaves();
        fetchAttendance();
    }, []);

    /* =========================================================
       SUCCESS MESSAGE
    ========================================================= */

    useEffect(() => {
        if (!successMessage) return;

        const timer = setTimeout(() => {
            setSuccessMessage("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [successMessage]);

    /* =========================================================
       FILTER OPTIONS
    ========================================================= */

    const departments = useMemo(() => {
        return [...new Set(employees.map((item) => item.department).filter(Boolean))].sort();
    }, [employees]);

    const designations = useMemo(() => {
        return [...new Set(employees.map((item) => item.designation).filter(Boolean))].sort();
    }, [employees]);

    const locations = useMemo(() => {
        return [...new Set(employees.map((item) => item.location).filter(Boolean))].sort();
    }, [employees]);

    /* =========================================================
       FILTER EMPLOYEES
    ========================================================= */

    const filteredEmployees = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        return employees.filter((employee) => {
            const matchesSearch =
                !searchValue ||
                employee.employeeId?.toLowerCase().includes(searchValue) ||
                employee.name?.toLowerCase().includes(searchValue) ||
                employee.email?.toLowerCase().includes(searchValue) ||
                employee.mobile?.toLowerCase().includes(searchValue) ||
                employee.department?.toLowerCase().includes(searchValue) ||
                employee.designation?.toLowerCase().includes(searchValue);

            const matchesDepartment = !departmentFilter || employee.department === departmentFilter;
            const matchesDesignation = !designationFilter || employee.designation === designationFilter;
            const matchesLocation = !locationFilter || employee.location === locationFilter;
            const matchesEmploymentType =
                !employmentTypeFilter || employee.employmentType === employmentTypeFilter;
            const matchesStatus = !statusFilter || employee.status === statusFilter;

            return (
                matchesSearch &&
                matchesDepartment &&
                matchesDesignation &&
                matchesLocation &&
                matchesEmploymentType &&
                matchesStatus
            );
        });
    }, [
        employees,
        search,
        departmentFilter,
        designationFilter,
        locationFilter,
        employmentTypeFilter,
        statusFilter,
    ]);

    /* =========================================================
       PAGINATION
    ========================================================= */

    const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE));

    const paginatedEmployees = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredEmployees.slice(start, start + PAGE_SIZE);
    }, [filteredEmployees, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, departmentFilter, designationFilter, locationFilter, employmentTypeFilter, statusFilter]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    /* =========================================================
       STATISTICS
    ========================================================= */

    const statistics = useMemo(() => {
        const total = employees.length;
        const active = employees.filter((item) => item.status === "ACTIVE").length;
        const onLeave = employees.filter((item) => item.status === "ON_LEAVE").length;
        const resigned = employees.filter((item) => item.status === "RESIGNED").length;

        const now = new Date();

        const newJoiners = employees.filter((employee) => {
            if (!employee.joiningDate) return false;
            const joiningDate = new Date(employee.joiningDate);
            return (
                joiningDate.getMonth() === now.getMonth() &&
                joiningDate.getFullYear() === now.getFullYear()
            );
        }).length;

        return { total, active, onLeave, resigned, newJoiners };
    }, [employees]);

    /* =========================================================
       DEPARTMENT CHART DATA (fully dynamic — real counts + real angles)
    ========================================================= */

    const departmentData = useMemo(() => {
        const counts = {};

        employees.forEach((employee) => {
            const department = employee.department?.trim() || "Others";
            counts[department] = (counts[department] || 0) + 1;
        });

        const sorted = Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        // Keep top 6 departments, collapse the rest into "Others" so the
        // donut + legend never run out of colors and always sum to 100%.
        const top = sorted.slice(0, 6);
        const rest = sorted.slice(6);
        const restCount = rest.reduce((sum, item) => sum + item.count, 0);

        const combined = restCount > 0 ? [...top, { name: "Others", count: restCount }] : top;

        const total = employees.length;

        let cursor = 0;
        return combined.map((item, index) => {
            const percentage = total ? (item.count / total) * 100 : 0;
            const startDeg = cursor;
            const sweepDeg = total ? (item.count / total) * 360 : 0;
            cursor += sweepDeg;

            return {
                name: item.name,
                count: item.count,
                percentage: percentage.toFixed(1),
                color: DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length],
                startDeg,
                endDeg: cursor,
            };
        });
    }, [employees]);

    const departmentDonutStyle = useMemo(() => {
        if (!departmentData.length) {
            return { background: "#eef2f7" };
        }

        const stops = departmentData
            .map((item) => `${item.color} ${item.startDeg}deg ${item.endDeg}deg`)
            .join(", ");

        return { background: `conic-gradient(${stops})` };
    }, [departmentData]);

    /* =========================================================
       DESIGNATION CHART DATA
    ========================================================= */

    const designationData = useMemo(() => {
        const counts = {};

        employees.forEach((employee) => {
            const designation = employee.designation?.trim() || "Others";
            counts[designation] = (counts[designation] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([name, count]) => ({
                name,
                count,
                percentage: employees.length ? ((count / employees.length) * 100).toFixed(1) : "0.0",
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);
    }, [employees]);

    /* =========================================================
       EMPLOYMENT TYPE DATA
    ========================================================= */

    const employmentTypeData = useMemo(() => {
        const permanent = employees.filter((item) => item.employmentType === "PERMANENT").length;
        const contractual = employees.filter((item) => item.employmentType === "CONTRACTUAL").length;
        const temporary = employees.filter((item) => item.employmentType === "TEMPORARY").length;

        return { permanent, contractual, temporary };
    }, [employees]);

    /* =========================================================
       LEAVE SUMMARY
    ========================================================= */

    const leaveSummary = useMemo(() => {
        const now = new Date();

        const thisMonthLeaves = leaves.filter((leave) => {
            const date = new Date(leave.createdAt || leave.startDate);
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        });

        return {
            total: thisMonthLeaves.length,
            approved: thisMonthLeaves.filter((item) => item.status === "APPROVED").length,
            pending: thisMonthLeaves.filter((item) => item.status === "PENDING").length,
            rejected: thisMonthLeaves.filter((item) => item.status === "REJECTED").length,
        };
    }, [leaves]);

    /* =========================================================
       ATTENDANCE SUMMARY
       Attendance API is not included in the provided backend,
       therefore real attendance numbers cannot be calculated.
    ========================================================= */

    const attendanceSummary = {
        total: employees.length,
        present: attendanceRecords.filter(
            (item) => ["PRESENT", "HALF_DAY"].includes(item.status)
        ).length,
        absent: attendanceRecords.filter(
            (item) => item.status === "ABSENT"
        ).length,
        onLeave: statistics.onLeave,
    };

    /* =========================================================
       UPCOMING BIRTHDAYS
       Employee model does not currently contain DOB,
       so this remains empty until DOB is available.
    ========================================================= */

    const upcomingBirthdays = [];

    /* =========================================================
       UPCOMING ANNIVERSARIES
    ========================================================= */

    const upcomingAnniversaries = useMemo(() => {
        const today = new Date();

        return employees
            .filter((employee) => employee.joiningDate)
            .map((employee) => {
                const joiningDate = new Date(employee.joiningDate);
                const years = today.getFullYear() - joiningDate.getFullYear();

                let anniversaryDate = new Date(today.getFullYear(), joiningDate.getMonth(), joiningDate.getDate());

                if (anniversaryDate < today) {
                    anniversaryDate = new Date(today.getFullYear() + 1, joiningDate.getMonth(), joiningDate.getDate());
                }

                return { ...employee, years: Math.max(years, 0), anniversaryDate };
            })
            .filter((employee) => {
                const difference = employee.anniversaryDate.getTime() - today.getTime();
                const days = difference / (1000 * 60 * 60 * 24);
                return days >= 0 && days <= 60;
            })
            .sort((a, b) => a.anniversaryDate.getTime() - b.anniversaryDate.getTime())
            .slice(0, 4);
    }, [employees]);

    /* =========================================================
       HELPERS
    ========================================================= */

    const formatDate = (date) => {
        if (!date) return "-";
        const parsed = new Date(date);
        if (Number.isNaN(parsed.getTime())) return "-";
        return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    };

    const formatShortDate = (date) => {
        if (!date) return "-";
        const parsed = new Date(date);
        if (Number.isNaN(parsed.getTime())) return "-";
        return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "ACTIVE":
                return "status-active";
            case "INACTIVE":
                return "status-inactive";
            case "ON_LEAVE":
                return "status-leave";
            case "RESIGNED":
                return "status-resigned";
            default:
                return "status-inactive";
        }
    };

    const formatStatus = (status) => {
        if (!status) return "-";
        return status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
    };

    const formatEmploymentType = (type) => {
        if (!type) return "-";
        return type.charAt(0) + type.slice(1).toLowerCase();
    };

    /* =========================================================
       FORM INPUT HANDLER (shared by Add + Edit)
    ========================================================= */

    const handleEmployeeInput = (event) => {
        const { name, value } = event.target;

        setEmployeeForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        if (formError) {
            setFormError("");
        }
    };

    /* =========================================================
       ADD EMPLOYEE
    ========================================================= */

    const openAddEmployeeModal = () => {
        setModalMode("add");
        setEditingEmployeeId(null);
        setEmployeeForm(emptyEmployeeForm);
        setFormError("");
        setShowEmployeeModal(true);
    };

    /* =========================================================
       EDIT EMPLOYEE
    ========================================================= */

    const openEditEmployeeModal = (employee) => {
        setModalMode("edit");
        setEditingEmployeeId(employee._id);
        setEmployeeForm({
            name: employee.name || "",
            department: employee.department || "",
            designation: employee.designation || "",
            email: employee.email || "",
            mobile: employee.mobile || "",
            location: employee.location || "",
            employmentType: employee.employmentType || "PERMANENT",
            status: employee.status || "ACTIVE",
            joiningDate: employee.joiningDate ? employee.joiningDate.substring(0, 10) : "",
        });
        setFormError("");
        setShowEmployeeModal(true);
    };

    const closeEmployeeModal = () => {
        if (savingEmployee) return;

        setShowEmployeeModal(false);
        setEmployeeForm(emptyEmployeeForm);
        setFormError("");
        setModalMode("add");
        setEditingEmployeeId(null);
    };

    const handleSubmitEmployee = async (event) => {
        event.preventDefault();

        if (!employeeForm.name.trim()) {
            setFormError("Employee name is required.");
            return;
        }

        if (!employeeForm.email.trim()) {
            setFormError("Email is required.");
            return;
        }

        if (!employeeForm.mobile.trim()) {
            setFormError("Mobile number is required.");
            return;
        }

        const payload = {
            name: employeeForm.name.trim(),
            department: employeeForm.department.trim(),
            designation: employeeForm.designation.trim(),
            email: employeeForm.email.trim(),
            mobile: employeeForm.mobile.trim(),
            location: employeeForm.location.trim(),
            employmentType: employeeForm.employmentType,
            status: employeeForm.status,
            joiningDate: employeeForm.joiningDate || null,
        };

        const isEdit = modalMode === "edit" && editingEmployeeId;

        try {
            setSavingEmployee(true);
            setFormError("");

            const response = await fetch(
                isEdit ? `${EMPLOYEE_API}/${editingEmployeeId}` : EMPLOYEE_API,
                {
                    method: isEdit ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || `Failed to ${isEdit ? "update" : "create"} employee`);
            }

            setShowEmployeeModal(false);
            setEmployeeForm(emptyEmployeeForm);
            setModalMode("add");
            setEditingEmployeeId(null);

            setSuccessMessage(data.message || `Employee ${isEdit ? "updated" : "created"} successfully`);

            await fetchEmployees();
        } catch (err) {
            console.error(`${isEdit ? "Update" : "Create"} employee error:`, err);
            setFormError(err.message || `Failed to ${isEdit ? "update" : "create"} employee`);
        } finally {
            setSavingEmployee(false);
        }
    };

    /* =========================================================
       VIEW EMPLOYEE
    ========================================================= */

    const handleViewEmployee = (employee) => {
        setSelectedEmployee(employee);
        setShowEmployeeDetails(true);
    };

    /* =========================================================
       DELETE EMPLOYEE
    ========================================================= */

    const openDeleteConfirm = (employee) => {
        setDeleteTarget(employee);
    };

    const closeDeleteConfirm = () => {
        if (deletingEmployee) return;
        setDeleteTarget(null);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            setDeletingEmployee(true);
            setError("");

            const response = await fetch(`${EMPLOYEE_API}/${deleteTarget._id}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to delete employee");
            }

            setSuccessMessage(data.message || "Employee deleted successfully");
            setDeleteTarget(null);

            // Keep pagination sane if we just deleted the last row on a page
            setEmployees((previous) => previous.filter((item) => item._id !== deleteTarget._id));
        } catch (err) {
            console.error("Delete employee error:", err);
            setError(err.message || "Failed to delete employee");
        } finally {
            setDeletingEmployee(false);
        }
    };

    /* =========================================================
       RESET FILTERS
    ========================================================= */

    const resetFilters = () => {
        setSearch("");
        setDepartmentFilter("");
        setDesignationFilter("");
        setLocationFilter("");
        setEmploymentTypeFilter("");
        setStatusFilter("");
        setCurrentPage(1);
    };

    /* =========================================================
       PAGINATION LABELS
    ========================================================= */

    const startEntry = filteredEmployees.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const endEntry = Math.min(currentPage * PAGE_SIZE, filteredEmployees.length);

    /* =========================================================
       EXPORT EMPLOYEES
    ========================================================= */

    const handleExport = () => {
        if (!employees.length) return;

        const headers = [
            "Employee ID",
            "Name",
            "Department",
            "Designation",
            "Email",
            "Mobile",
            "Location",
            "Employment Type",
            "Status",
            "Joining Date",
        ];

        const rows = employees.map((employee) => [
            employee.employeeId || "",
            employee.name || "",
            employee.department || "",
            employee.designation || "",
            employee.email || "",
            employee.mobile || "",
            employee.location || "",
            employee.employmentType || "",
            employee.status || "",
            employee.joiningDate ? formatDate(employee.joiningDate) : "",
        ]);

        const csvContent = [headers, ...rows]
            .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "employees.csv";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    /* =========================================================
       IMPORT EMPLOYEES
       Backend currently has no bulk-import endpoint.
       This button is kept as UI only.
    ========================================================= */

    const handleImport = () => {
        alert("Bulk employee import API is not available in the current backend.");
    };

    const openAttendanceModal = () => {
        const activeEmployee = employees.find(
            (employee) => employee.status === "ACTIVE"
        );

        setAttendanceForm({
            employee: activeEmployee?._id || "",
            date: getTodayDate(),
            status: "PRESENT",
            checkIn: "",
            checkOut: "",
            remarks: "",
        });

        setAttendanceError("");
        setShowAttendanceModal(true);
    };

    const handleAttendanceInput = (event) => {
        const { name, value } = event.target;

        setAttendanceForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setAttendanceError("");
    };

    const handleSubmitAttendance = async (event) => {
        event.preventDefault();

        if (!attendanceForm.employee) {
            setAttendanceError("Please select an employee.");
            return;
        }

        if (!attendanceForm.date) {
            setAttendanceError("Please select attendance date.");
            return;
        }

        try {
            setSavingAttendance(true);
            setAttendanceError("");

            const response = await fetch(ATTENDANCE_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(attendanceForm),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to save attendance");
            }

            setShowAttendanceModal(false);

            setSuccessMessage(
                data.message || "Attendance saved successfully"
            );

            await fetchAttendance(attendanceForm.date);
        } catch (err) {
            console.error("Save attendance error:", err);
            setAttendanceError(err.message || "Failed to save attendance");
        } finally {
            setSavingAttendance(false);
        }
    };


    /* =========================================================
       QUICK ACTIONS
    ========================================================= */

    const handleQuickAction = (action) => {
        if (action === "add") {
            openAddEmployeeModal();
            return;
        }

        if (action === "leave") {
            document.getElementById("leave-summary-section")?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
            return;
        }

        if (action === "attendance") {
            openAttendanceModal();
            return;
        }

        alert(`${action} module is not connected to the provided backend yet.`);
    };

    return (
        <div className="employee-hr-page">
            <main className="hr-main-content">
                {/* =========         PAGE HEADER        =========== */}

                <section className="page-heading-row">
                    <div>
                        <h1>Employee HR Management</h1>

                        <div className="breadcrumb">
                            <span>Dashboard</span>
                            <ChevronRight size={13} />
                            <span>Employee HR Management</span>
                            <ChevronRight size={13} />
                            <strong>Overview</strong>
                        </div>
                    </div>

                    <div className="heading-actions">
                        <button className="secondary-action-button" type="button" onClick={handleImport}>
                            <Upload size={16} />
                            Import Employees
                        </button>

                        <button className="secondary-action-button" type="button" onClick={handleExport}>
                            <Download size={16} />
                            Export
                        </button>

                        <button className="primary-action-button" type="button" onClick={openAddEmployeeModal}>
                            <Plus size={17} />
                            Add Employee
                            <ChevronDown size={15} />
                        </button>
                    </div>
                </section>

                {/* ===================================================
            SUCCESS / ERROR
        =================================================== */}

                {successMessage && (
                    <div className="alert-message success-alert">
                        <BadgeCheck size={18} />
                        <span>{successMessage}</span>
                        <button type="button" onClick={() => setSuccessMessage("")}>
                            <X size={16} />
                        </button>
                    </div>
                )}

                {error && (
                    <div className="alert-message error-alert">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                        <button type="button" onClick={() => setError("")}>
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* ===================================================
            STATISTICS CARDS
        =================================================== */}

                <section className="statistics-grid">
                    <div className="stat-card">
                        <div className="stat-icon blue-icon">
                            <Users size={21} />
                        </div>
                        <div className="stat-content">
                            <span>Total Employees</span>
                            <strong>{statistics.total}</strong>
                            <small className="positive-change">Current total</small>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon green-icon">
                            <UserCheck size={21} />
                        </div>
                        <div className="stat-content">
                            <span>Active Employees</span>
                            <strong>{statistics.active}</strong>
                            <small className="positive-change">Active workforce</small>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon orange-icon">
                            <CalendarCheck size={21} />
                        </div>
                        <div className="stat-content">
                            <span>On Leave Today</span>
                            <strong>{statistics.onLeave}</strong>
                            <small className="positive-change">Based on employee status</small>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon cyan-icon">
                            <ClipboardCheck size={21} />
                        </div>
                        <div className="stat-content">
                            <span>Presentees Today</span>
                            <strong>{attendanceSummary.present ?? "-"}</strong>
                            <small className="muted-change">Today's attendance records</small>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon purple-icon">
                            <UserPlus size={21} />
                        </div>
                        <div className="stat-content">
                            <span>New Joiners (This Month)</span>
                            <strong>{statistics.newJoiners}</strong>
                            <small className="positive-change">From joining dates</small>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon red-icon">
                            <UserX size={21} />
                        </div>
                        <div className="stat-content">
                            <span>Resignations (This Month)</span>
                            <strong>{statistics.resigned}</strong>
                            <small className="negative-change">Current resigned employees</small>
                        </div>
                    </div>
                </section>

                {/* ===================================================
            FILTER SECTION
        =================================================== */}

                <section className="filter-panel">
                    <div className="filter-field">
                        <label>Department</label>
                        <div className="select-wrapper">
                            <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
                                <option value="">All Departments</option>
                                {departments.map((department) => (
                                    <option key={department} value={department}>
                                        {department}
                                    </option>
                                ))}
                            </select>
                            {/* <ChevronDown size={15} /> */}
                        </div>
                    </div>

                    <div className="filter-field">
                        <label>Designation</label>
                        <div className="select-wrapper">
                            <select value={designationFilter} onChange={(event) => setDesignationFilter(event.target.value)}>
                                <option value="">All Designations</option>
                                {designations.map((designation) => (
                                    <option key={designation} value={designation}>
                                        {designation}
                                    </option>
                                ))}
                            </select>
                            {/* <ChevronDown size={15} /> */}
                        </div>
                    </div>

                    <div className="filter-field">
                        <label>Location</label>
                        <div className="select-wrapper">
                            <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
                                <option value="">All Locations</option>
                                {locations.map((location) => (
                                    <option key={location} value={location}>
                                        {location}
                                    </option>
                                ))}
                            </select>
                            {/* <ChevronDown size={15} /> */}
                        </div>
                    </div>

                    <div className="filter-field">
                        <label>Employment Type</label>
                        <div className="select-wrapper">
                            <select
                                value={employmentTypeFilter}
                                onChange={(event) => setEmploymentTypeFilter(event.target.value)}
                            >
                                <option value="">All Types</option>
                                <option value="PERMANENT">Permanent</option>
                                <option value="CONTRACTUAL">Contractual</option>
                                <option value="TEMPORARY">Temporary</option>
                            </select>
                            {/* <ChevronDown size={15} /> */}
                        </div>
                    </div>

                    <div className="filter-field">
                        <label>Status</label>
                        <div className="select-wrapper">
                            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                                <option value="">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="ON_LEAVE">On Leave</option>
                                <option value="RESIGNED">Resigned</option>
                            </select>
                            {/* <ChevronDown size={15} /> */}
                        </div>
                    </div>

                    <div className="filter-search-field">
                        <label>Search Employee</label>
                        <div className="filter-search-box">
                            <input
                                type="text"
                                placeholder="Search by name, email, ID..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                            <Search size={17} />
                        </div>
                    </div>

                    <button
                        className="filter-button"
                        type="button"
                        onClick={() => {
                            document.getElementById("employee-table")?.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                            });
                        }}
                    >
                        <SlidersHorizontal size={17} />
                        Filters
                    </button>

                    <button className="reset-filter-button" type="button" onClick={resetFilters} title="Reset filters">
                        <RotateCcw size={17} />
                    </button>
                </section>

                {/* ===================================================
            ANALYTICS + QUICK ACTIONS
        =================================================== */}

                <section className="dashboard-upper-grid">
                    {/* DEPARTMENT CHART — fully dynamic */}

                    <div className="dashboard-card department-chart-card">
                        <div className="card-headings">
                            <h3>Employees by Department</h3>
                        </div>

                        <div className="department-chart-layout">
                            <div className="donut-chart department-donut" style={departmentDonutStyle}>
                                <div className="donut-center">
                                    <strong>{employees.length}</strong>
                                    <span>Total</span>
                                </div>
                            </div>

                            <div className="chart-legend">
                                {departmentData.length > 0 ? (
                                    departmentData.map((item) => (
                                        <div className="legend-row" key={item.name}>
                                            <span className="legend-dot" style={{ background: item.color }} />
                                            <span className="legend-name">{item.name}</span>
                                            <strong>{item.count}</strong>
                                            <small>({item.percentage}%)</small>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-chart-text">No employee data available</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* DESIGNATION CHART */}

                    <div className="dashboard-card designation-chart-card">
                        <div className="card-headings">
                            <h3>Employees by Designation</h3>
                        </div>

                        <div className="designation-bars">
                            {designationData.length > 0 ? (
                                designationData.map((item) => {
                                    const maxCount = designationData[0]?.count || 1;
                                    const width = (item.count / maxCount) * 100;

                                    return (
                                        <div className="designation-row" key={item.name}>
                                            <span className="designation-name">{item.name}</span>
                                            <div className="designation-bar-track">
                                                <div className="designation-bar-fill" style={{ width: `${width}%` }} />
                                            </div>
                                            <strong>{item.count}</strong>
                                            <small>({item.percentage}%)</small>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="empty-chart-text">No designation data available</div>
                            )}
                        </div>
                    </div>

                    {/* EMPLOYMENT TYPE */}

                    <div className="dashboard-card employment-chart-card">
                        <div className="card-headings">
                            <h3>Employment Type</h3>
                        </div>

                        <div className="employment-chart-layout">
                            <div
                                className="donut-chart employment-donut"
                                style={{
                                    "--permanent":
                                        employees.length > 0
                                            ? `${(employmentTypeData.permanent / employees.length) * 360}deg`
                                            : "0deg",
                                    "--contractual":
                                        employees.length > 0
                                            ? `${(employmentTypeData.contractual / employees.length) * 360}deg`
                                            : "0deg",
                                    "--temporary":
                                        employees.length > 0
                                            ? `${(employmentTypeData.temporary / employees.length) * 360}deg`
                                            : "0deg",
                                }}
                            >
                                <div className="donut-center">
                                    <strong>{employees.length}</strong>
                                    <span>Total</span>
                                </div>
                            </div>

                            <div className="employment-legend">
                                <div className="employment-legend-row">
                                    <span className="employment-dot permanent-dot" />
                                    <span>Permanent</span>
                                    <strong>{employmentTypeData.permanent}</strong>
                                </div>

                                <div className="employment-legend-row">
                                    <span className="employment-dot contractual-dot" />
                                    <span>Contractual</span>
                                    <strong>{employmentTypeData.contractual}</strong>
                                </div>

                                <div className="employment-legend-row">
                                    <span className="employment-dot temporary-dot" />
                                    <span>Temporary</span>
                                    <strong>{employmentTypeData.temporary}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* QUICK ACTIONS */}

                    <div className="dashboard-card quick-actions-cards">
                        <div className="card-headings">
                            <h3>Quick Actions</h3>
                        </div>

                        <div className="quick-actions-lists">
                            <button type="button" className="quick-action-items" onClick={() => handleQuickAction("add")}>
                                <span className="quick-action-icons">
                                    <UserRoundPlus size={18} />
                                </span>
                                <span className="quick-action-text">
                                    <strong>Add Employee</strong>
                                    <small>Create a new employee profile</small>
                                </span>
                                <ChevronRight size={15} />
                            </button>

                            <button type="button" className="quick-action-items" onClick={() => handleQuickAction("attendance")}>
                                <span className="quick-action-icons">
                                    <ClipboardCheck size={18} />
                                </span>
                                <span className="quick-action-text">
                                    <strong>Mark Attendance</strong>
                                    <small>Mark today's attendance</small>
                                </span>
                                <ChevronRight size={15} />
                            </button>

                            <button type="button" className="quick-action-items" onClick={() => handleQuickAction("leave")}>
                                <span className="quick-action-icons">
                                    <CalendarCheck size={18} />
                                </span>
                                <span className="quick-action-text">
                                    <strong>Apply Leave</strong>
                                    <small>Apply for leave</small>
                                </span>
                                <ChevronRight size={15} />
                            </button>

                            <button type="button" className="quick-action-items" onClick={() => handleQuickAction("payroll")}>
                                <span className="quick-action-icons">
                                    <WalletCards size={18} />
                                </span>
                                <span className="quick-action-text">
                                    <strong>Payroll Process</strong>
                                    <small>Run payroll for this month</small>
                                </span>
                                <ChevronRight size={15} />
                            </button>

                            <button type="button" className="quick-action-items" onClick={() => handleQuickAction("performance")}>
                                <span className="quick-action-icons">
                                    <Award size={18} />
                                </span>
                                <span className="quick-action-text">
                                    <strong>Performance Review</strong>
                                    <small>Conduct performance review</small>
                                </span>
                                <ChevronRight size={15} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* ===================================================
            TABLE + ATTENDANCE SIDE
        =================================================== */}

                <section className="table-side-grid">
                    {/* RECENT EMPLOYEES */}

                    <div className="dashboard-card recent-employees-card" id="employee-table">
                        <div className="table-card-headings">
                            <div>
                                <h3>Recent Employees</h3>
                                <span>Latest employees added to the system</span>
                            </div>

                            <button
                                type="button"
                                className="view-all-button"
                                onClick={() => {
                                    resetFilters();
                                    document.getElementById("employee-table")?.scrollIntoView({ behavior: "smooth" });
                                }}
                            >
                                View All
                            </button>
                        </div>

                        <div className="employee-table-wrapper">
                            <table className="employee-table">
                                <thead>
                                    <tr>
                                        <th>Employee ID</th>
                                        <th>Name</th>
                                        <th>Department</th>
                                        <th>Designation</th>
                                        <th>Email</th>
                                        <th>Mobile</th>
                                        <th>Status</th>
                                        <th>Joining Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="9" className="table-loading">
                                                Loading employees...
                                            </td>
                                        </tr>
                                    ) : paginatedEmployees.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="table-empty">
                                                No employees found.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedEmployees.map((employee) => (
                                            <tr key={employee._id}>
                                                <td>
                                                    <span className="employee-id">{employee.employeeId || "-"}</span>
                                                </td>

                                                <td>
                                                    <div className="employee-name-cell">
                                                        <div className="employee-avatar">
                                                            {employee.name?.charAt(0)?.toUpperCase() || "E"}
                                                        </div>
                                                        <strong>{employee.name}</strong>
                                                    </div>
                                                </td>

                                                <td>{employee.department || "-"}</td>
                                                <td>{employee.designation || "-"}</td>
                                                <td>{employee.email || "-"}</td>
                                                <td>{employee.mobile || "-"}</td>

                                                <td>
                                                    <span className={`employee-status ${getStatusClass(employee.status)}`}>
                                                        {formatStatus(employee.status)}
                                                    </span>
                                                </td>

                                                <td>{formatDate(employee.joiningDate)}</td>

                                                <td>
                                                    <div className="table-actionse">
                                                        <button
                                                            type="button"
                                                            className="table-action-button"
                                                            title="View employee"
                                                            onClick={() => handleViewEmployee(employee)}
                                                        >
                                                            <Eye size={16} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="table-action-button"
                                                            title="Edit employee"
                                                            onClick={() => openEditEmployeeModal(employee)}
                                                        >
                                                            <Pencil size={16} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="table-action-button delete-action-button"
                                                            title="Delete employee"
                                                            onClick={() => openDeleteConfirm(employee)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* TABLE PAGINATION */}

                        <div className="table-paginatione">
                            <span>
                                Showing {startEntry} to {endEntry} of {filteredEmployees.length} entries
                            </span>

                            <div className="pagination-controlse">
                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((page) => page - 1)}
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1).map((page) => (
                                    <button
                                        key={page}
                                        type="button"
                                        className={currentPage === page ? "active-page" : ""}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((page) => page + 1)}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* TODAY ATTENDANCE */}

                    <div className="dashboard-card attendance-card">
                        <div className="card-headings">
                            <h3>Today's Attendance Summary</h3>
                        </div>

                        <div className="attendance-total">
                            <span>Total Employees</span>
                            <strong>{attendanceSummary.total}</strong>
                        </div>

                        <div className="attendance-note">
                            {attendanceLoading
                                ? "Loading attendance..."
                                : "Attendance records updated from the database."}
                        </div>

                        <div className="attendance-list">
                            <div className="attendance-row">
                                <span>
                                    <i className="attendance-dot present-dot" />
                                    Present
                                </span>
                                <strong>{attendanceSummary.present ?? "-"}</strong>
                            </div>

                            <div className="attendance-row">
                                <span>
                                    <i className="attendance-dot absent-dot" />
                                    Absent
                                </span>
                                <strong>{attendanceSummary.absent ?? "-"}</strong>
                            </div>

                            <div className="attendance-row">
                                <span>
                                    <i className="attendance-dot leave-dot" />
                                    On Leave
                                </span>
                                <strong>{attendanceSummary.onLeave}</strong>
                            </div>
                        </div>

                        <div className="attendance-note">
                            Attendance data will appear when the Attendance API is connected.
                        </div>
                    </div>
                </section>

                {/* ===================================================
            LOWER DASHBOARD GRID
        =================================================== */}

                <section className="lower-dashboard-grid">
                    {/* LEAVE SUMMARY */}

                    <div className="dashboard-card leave-summary-card" id="leave-summary-section">
                        <div className="card-headings">
                            <h3>Leave Summary (This Month)</h3>
                            <button
                                type="button"
                                className="small-link-button"
                                onClick={() =>
                                    document.getElementById("leave-summary-section")?.scrollIntoView({ behavior: "smooth" })
                                }
                            >
                                View Leave Management
                                <ChevronRight size={14} />
                            </button>
                        </div>

                        <div className="leave-summary-grid">
                            <div className="leave-summary-item total-leave">
                                <div className="leave-summary-icon">
                                    <Users size={17} />
                                </div>
                                <span>Total Leaves</span>
                                <strong>{leaveSummary.total}</strong>
                            </div>

                            <div className="leave-summary-item approved-leave">
                                <div className="leave-summary-icon">
                                    <BadgeCheck size={17} />
                                </div>
                                <span>Approved</span>
                                <strong>{leaveSummary.approved}</strong>
                                <small>
                                    {leaveSummary.total
                                        ? `${((leaveSummary.approved / leaveSummary.total) * 100).toFixed(1)}%`
                                        : "0%"}
                                </small>
                            </div>

                            <div className="leave-summary-item pending-leave">
                                <div className="leave-summary-icon">
                                    <Clock3 size={17} />
                                </div>
                                <span>Pending</span>
                                <strong>{leaveSummary.pending}</strong>
                                <small>
                                    {leaveSummary.total
                                        ? `${((leaveSummary.pending / leaveSummary.total) * 100).toFixed(1)}%`
                                        : "0%"}
                                </small>
                            </div>

                            <div className="leave-summary-item rejected-leave">
                                <div className="leave-summary-icon">
                                    <X size={17} />
                                </div>
                                <span>Rejected</span>
                                <strong>{leaveSummary.rejected}</strong>
                                <small>
                                    {leaveSummary.total
                                        ? `${((leaveSummary.rejected / leaveSummary.total) * 100).toFixed(1)}%`
                                        : "0%"}
                                </small>
                            </div>
                        </div>
                    </div>

                    {/* DOCUMENT EXPIRY */}

                    <div className="dashboard-card document-alert-card">
                        <div className="card-headings">
                            <h3>Document Expiry Alerts</h3>
                            <button type="button" className="small-link-button">
                                View All
                            </button>
                        </div>

                        <div className="empty-dashboard-content">
                            <div className="empty-content-icon">
                                <FileWarning size={20} />
                            </div>
                            <strong>Document data unavailable</strong>
                            <span>Documents are not part of the current Employee backend model.</span>
                        </div>
                    </div>

                    {/* WORK ANNIVERSARIES */}

                    <div className="dashboard-card anniversary-card">
                        <div className="card-headings">
                            <h3>Upcoming Work Anniversaries</h3>
                            <button type="button" className="small-link-button">
                                View All
                            </button>
                        </div>

                        <div className="anniversary-list">
                            {upcomingAnniversaries.length > 0 ? (
                                upcomingAnniversaries.map((employee) => (
                                    <div className="anniversary-row" key={employee._id}>
                                        <div className="mini-avatar">{employee.name?.charAt(0)?.toUpperCase()}</div>

                                        <div className="anniversary-info">
                                            <strong>{employee.name}</strong>
                                            <span>{employee.designation || "Employee"}</span>
                                        </div>

                                        <strong className="anniversary-years">
                                            {employee.years} {employee.years === 1 ? "Year" : "Years"}
                                        </strong>

                                        <span className="anniversary-date">{formatShortDate(employee.anniversaryDate)}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-small-state">No upcoming anniversaries.</div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ==========           BIRTHDAYS            ======= */}

                {/* <section className="birthday-section">
                    <div className="dashboard-card birthdays-card">
                        <div className="card-headings">
                            <h3>Upcoming Birthdays</h3>
                            <button type="button" className="small-link-button">
                                View All
                            </button>
                        </div>

                        {upcomingBirthdays.length > 0 ? (
                            <div className="birthday-list">
                                {upcomingBirthdays.map((employee) => (
                                    <div className="birthday-row" key={employee._id}>
                                        <div className="birthday-avatar">{employee.name?.charAt(0)?.toUpperCase()}</div>

                                        <div className="birthday-info">
                                            <strong>{employee.name}</strong>
                                            <span>{employee.designation || "Employee"}</span>
                                        </div>

                                        <span className="birthday-date">{formatShortDate(employee.dateOfBirth)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="birthday-empty">
                                <div className="birthday-empty-icon">
                                    <Cake size={22} />
                                </div>

                                <div>
                                    <strong>Birthday information unavailable</strong>
                                    <span>Date of birth is not available in the current Employee model.</span>
                                </div>
                            </div>
                        )}
                    </div>
                </section> */}
            </main>


            {/* MARK ATTENDANCE MODAL */}

            {showAttendanceModal && (
                <div
                    className="modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !savingAttendance) {
                            setShowAttendanceModal(false);
                        }
                    }}
                >
                    <div className="employee-modal">
                        <div className="modal-header">
                            <div>
                                <h2>Mark Attendance</h2>
                                <p>Record employee daily attendance</p>
                            </div>

                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={() => setShowAttendanceModal(false)}
                                disabled={savingAttendance}
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <form
                            className="employee-form"
                            onSubmit={handleSubmitAttendance}
                        >
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Employee <span>*</span></label>
                                    <div className="form-select-wrapper">
                                        <select
                                            name="employee"
                                            value={attendanceForm.employee}
                                            onChange={handleAttendanceInput}
                                        >
                                            <option value="">Select Employee</option>

                                            {employees
                                                .filter((employee) => employee.status === "ACTIVE")
                                                .map((employee) => (
                                                    <option
                                                        key={employee._id}
                                                        value={employee._id}
                                                    >
                                                        {employee.employeeId} - {employee.name}
                                                    </option>
                                                ))}
                                        </select>
                                        <ChevronDown size={16} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Date <span>*</span></label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={attendanceForm.date}
                                        onChange={handleAttendanceInput}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Attendance Status <span>*</span></label>
                                    <div className="form-select-wrapper">
                                        <select
                                            name="status"
                                            value={attendanceForm.status}
                                            onChange={handleAttendanceInput}
                                        >
                                            <option value="PRESENT">Present</option>
                                            <option value="ABSENT">Absent</option>
                                            <option value="HALF_DAY">Half Day</option>
                                        </select>
                                        <ChevronDown size={16} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Check In</label>
                                    <input
                                        type="time"
                                        name="checkIn"
                                        value={attendanceForm.checkIn}
                                        onChange={handleAttendanceInput}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Check Out</label>
                                    <input
                                        type="time"
                                        name="checkOut"
                                        value={attendanceForm.checkOut}
                                        onChange={handleAttendanceInput}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Remarks</label>
                                    <input
                                        type="text"
                                        name="remarks"
                                        value={attendanceForm.remarks}
                                        onChange={handleAttendanceInput}
                                        placeholder="Enter remarks"
                                    />
                                </div>
                            </div>

                            {attendanceError && (
                                <div className="form-error">
                                    <AlertCircle size={17} />
                                    <span>{attendanceError}</span>
                                </div>
                            )}

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => setShowAttendanceModal(false)}
                                    disabled={savingAttendance}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-employee-button"
                                    disabled={savingAttendance}
                                >
                                    {savingAttendance ? (
                                        <>
                                            <span className="button-spinner" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={17} />
                                            Save Attendance
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {/* =====================================================
          ADD / EDIT EMPLOYEE MODAL (shared)
      ===================================================== */}

            {showEmployeeModal && (
                <div
                    className="modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeEmployeeModal();
                        }
                    }}
                >
                    <div className="employee-modal">
                        <div className="modal-header">
                            <div>
                                <h2>{modalMode === "edit" ? "Edit Employee" : "Add Employee"}</h2>
                                <p>
                                    {modalMode === "edit"
                                        ? "Update this employee's profile"
                                        : "Create a new employee profile"}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={closeEmployeeModal}
                                disabled={savingEmployee}
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <form className="employee-form" onSubmit={handleSubmitEmployee}>
                            <div className="form-section-title">
                                <Users size={17} />
                                <span>Employee Information</span>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>
                                        Employee Name
                                        <span>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={employeeForm.name}
                                        onChange={(e) => /^[A-Za-z\s]*$/.test(e.target.value) && handleEmployeeInput(e)}
                                        placeholder="Enter employee name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Email
                                        <span>*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={employeeForm.email}
                                        onChange={handleEmployeeInput}
                                        placeholder="Enter email address"
                                        pattern="[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Mobile
                                        <span>*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="mobile"
                                        value={employeeForm.mobile}
                                        onChange={(e) => /^\d{0,10}$/.test(e.target.value) && handleEmployeeInput(e)}
                                        placeholder="Enter mobile number"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Department</label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={employeeForm.department}
                                        onChange={(e) => /^[A-Za-z\s]*$/.test(e.target.value) && handleEmployeeInput(e)}
                                        placeholder="e.g. Production"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Designation</label>
                                    <input
                                        type="text"
                                        name="designation"
                                        value={employeeForm.designation}
                                        onChange={(e) => /^[A-Za-z\s]*$/.test(e.target.value) && handleEmployeeInput(e)}
                                        placeholder="e.g. Manager"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={employeeForm.location}
                                        onChange={handleEmployeeInput}
                                        placeholder="Enter location"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Employment Type</label>
                                    <div className="form-select-wrapper">
                                        <select name="employmentType" value={employeeForm.employmentType} onChange={handleEmployeeInput}>
                                            <option value="PERMANENT">Permanent</option>
                                            <option value="CONTRACTUAL">Contractual</option>
                                            <option value="TEMPORARY">Temporary</option>
                                        </select>
                                        <ChevronDown size={16} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Status</label>
                                    <div className="form-select-wrapper">
                                        <select name="status" value={employeeForm.status} onChange={handleEmployeeInput}>
                                            <option value="ACTIVE">Active</option>
                                            <option value="INACTIVE">Inactive</option>
                                            <option value="ON_LEAVE">On Leave</option>
                                            <option value="RESIGNED">Resigned</option>
                                        </select>
                                        <ChevronDown size={16} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Joining Date</label>
                                    <input
                                        type="date"
                                        name="joiningDate"
                                        value={employeeForm.joiningDate}
                                        onChange={handleEmployeeInput}
                                    />
                                </div>
                            </div>

                            {formError && (
                                <div className="form-error">
                                    <AlertCircle size={17} />
                                    <span>{formError}</span>
                                </div>
                            )}

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={closeEmployeeModal}
                                    disabled={savingEmployee}
                                >
                                    Cancel
                                </button>

                                <button type="submit" className="save-employee-button" disabled={savingEmployee}>
                                    {savingEmployee ? (
                                        <>
                                            <span className="button-spinner" />
                                            {modalMode === "edit" ? "Updating..." : "Saving..."}
                                        </>
                                    ) : (
                                        <>
                                            <Save size={17} />
                                            {modalMode === "edit" ? "Update Employee" : "Add Employee"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =====================================================
          EMPLOYEE DETAILS MODAL (View)
      ===================================================== */}

            {showEmployeeDetails && selectedEmployee && (
                <div
                    className="modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setShowEmployeeDetails(false);
                        }
                    }}
                >
                    <div className="employee-details-modal">
                        <div className="modal-header">
                            <div>
                                <h2>Employee Details</h2>
                                <p>Employee profile information</p>
                            </div>
                        </div>

                        <div className="employee-profile-header">
                            <div className="large-employee-avatar">{selectedEmployee.name?.charAt(0)?.toUpperCase()}</div>

                            <div>
                                <h3>{selectedEmployee.name}</h3>
                                <p>{selectedEmployee.designation || "Employee"}</p>
                                <span className={`employee-status ${getStatusClass(selectedEmployee.status)}`}>
                                    {formatStatus(selectedEmployee.status)}
                                </span>
                            </div>
                        </div>

                        <div className="details-grid">
                            <div className="details-item">
                                <span>Employee ID</span>
                                <strong>{selectedEmployee.employeeId || "-"}</strong>
                            </div>

                            <div className="details-item">
                                <span>Department</span>
                                <strong>{selectedEmployee.department || "-"}</strong>
                            </div>

                            <div className="details-item">
                                <span>Designation</span>
                                <strong>{selectedEmployee.designation || "-"}</strong>
                            </div>

                            <div className="details-item">
                                <span>Email</span>
                                <strong>{selectedEmployee.email || "-"}</strong>
                            </div>

                            <div className="details-item">
                                <span>Mobile</span>
                                <strong>{selectedEmployee.mobile || "-"}</strong>
                            </div>

                            <div className="details-item">
                                <span>Location</span>
                                <strong>{selectedEmployee.location || "-"}</strong>
                            </div>

                            <div className="details-item">
                                <span>Employment Type</span>
                                <strong>{formatEmploymentType(selectedEmployee.employmentType)}</strong>
                            </div>

                            <div className="details-item">
                                <span>Joining Date</span>
                                <strong>{formatDate(selectedEmployee.joiningDate)}</strong>
                            </div>
                        </div>

                        <div className="details-footer">

                            <button type="button" className="close-emp-btn" onClick={() => setShowEmployeeDetails(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================
          DELETE CONFIRMATION MODAL
      ===================================================== */}

            {deleteTarget && (
                <div
                    className="modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeDeleteConfirm();
                        }
                    }}
                >
                    <div className="delete-confirm-modal">
                        <div className="delete-confirm-icon">
                            <Trash2 size={22} />
                        </div>

                        <h3>Delete this employee?</h3>

                        <p>
                            This will permanently remove <strong>{deleteTarget.name}</strong>
                            {deleteTarget.employeeId ? ` (${deleteTarget.employeeId})` : ""} from the system. This action
                            cannot be undone.
                        </p>

                        <div className="delete-confirm-footer">
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={closeDeleteConfirm}
                                disabled={deletingEmployee}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="confirm-delete-button"
                                onClick={handleConfirmDelete}
                                disabled={deletingEmployee}
                            >
                                {deletingEmployee ? (
                                    <>
                                        <span className="button-spinner" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        Delete Employee
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeHRManagement;