import {
    Search,
    Plus,
    Upload,
    Download,
    Eye,
    Pencil,
    MoreVertical,
    Users,
    UserCheck,
    UserX,
    UserPlus,
    Filter,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import "../../css/superadmin/usermanagement.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserManagement = () => {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = (10);

    const [search, setSearch] = useState("");
    const [role, setRole] = useState("All Roles");
    const [status, setStatus] = useState("All Status");
    const [department, setDepartment] = useState("All Departments");

    const [showViewUser, setShowViewUser] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);

    const [deletingUser, setDeletingUser] = useState(false);
    const [kycActionLoading, setKycActionLoading] = useState(false);

    const [selectedUsers, setSelectedUsers] = useState([]);


    const departmentOptions = [
        "Administration",
        "Management",
        "Sales",
        "Finance",
        "Store",
        "Inventory",
        "Dealer Management",
        "Painter Management",
        "Support",
        "HR",
        "Manufacturing",
        "Dispatch Management"
    ];


    // ==========================================
    // FETCH USERS
    // ==========================================

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);

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
                setUsers(response.data.users || []);
            }
        } catch (error) {
            console.error("Users fetch error:", error);

            alert(
                error.response?.data?.message ||
                "Failed to load users"
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // FILTER
    // ==========================================

    const filteredUsers = users.filter((user) => {
        const searchValue = search.toLowerCase();

        const matchesSearch =
            user.name?.toLowerCase().includes(searchValue) ||
            user.email?.toLowerCase().includes(searchValue) ||
            user.mobile?.toLowerCase().includes(searchValue) ||
            user.role?.toLowerCase().includes(searchValue);

        const matchesRole =
            role === "All Roles" ||
            user.role === role;

        const matchesStatus =
            status === "All Status" ||
            user.status === status;

        const matchesDepartment =
            department === "All Departments" ||
            (user.department || getDepartment(user.role)) === department;

        return (
            matchesSearch &&
            matchesRole &&
            matchesStatus &&
            matchesDepartment
        );
    });

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, role, status, department]);

    // ==========================================
    // STATS
    // ==========================================

    const totalUsers = users.length;

    const activeUsers = users.filter(
        (user) => user.status === "ACTIVE"
    ).length;

    const inactiveUsers = users.filter(
        (user) => user.status === "INACTIVE"
    ).length;

    const blockedUsers = users.filter(
        (user) => user.status === "BLOCKED"
    ).length;

    const newUsers = users.filter((user) => {
        if (!user.createdAt) return false;

        const createdDate = new Date(user.createdAt);
        const now = new Date();

        return (
            createdDate.getMonth() === now.getMonth() &&
            createdDate.getFullYear() === now.getFullYear()
        );
    }).length;

    // ==========================================
    // RESET FILTER
    // ==========================================

    const handleReset = () => {
        setSearch("");
        setRole("All Roles");
        setStatus("All Status");
        setDepartment("All Departments");
        setSelectedUsers([]);
    };

    // ==========================================
    // INITIALS
    // ==========================================

    const getProfileImageUrl = (imagePath) => {
        if (!imagePath) return "";

        if (
            imagePath.startsWith("http://") ||
            imagePath.startsWith("https://")
        ) {
            return imagePath;
        }

        return `https://oneplussparkpaintsserver.onrender.com/${imagePath.replace(/^\/+/, "")}`;
    };

    const getInitials = (name = "") => {
        return name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    // ==========================================
    // ROLE CLASS
    // ==========================================

    const getRoleClass = (userRole) => {
        switch (userRole) {
            case "SUPER_ADMIN":
                return "role-super-admin";

            case "DIRECTOR":
                return "role-director";

            case "MANAGER":
                return "role-manager";

            case "SALES_EXECUTIVE":
                return "role-sales";

            case "ACCOUNTANT":
                return "role-accountant";

            case "STORE_CASHIER":
                return "role-cashier";

            case "DEALER":
                return "role-dealer";

            case "PAINTER":
                return "role-painter";

            default:
                return "role-default";
        }
    };

    // ==========================================
    // STATUS CLASS
    // ==========================================

    const getStatusClass = (userStatus) => {
        switch (userStatus) {
            case "ACTIVE":
                return "status-active";

            case "INACTIVE":
                return "status-inactive";

            case "BLOCKED":
                return "status-blocked";

            case "PENDING":
                return "status-pending";

            default:
                return "status-inactive";
        }
    };

    // ==========================================
    // VIEW USER
    // ==========================================

    const handleViewUser = async (userId) => {
        try {
            setViewLoading(true);
            setShowViewUser(true);
            setSelectedUser(null);

            const token = localStorage.getItem("token");

            const response = await axios.get(
                `https://oneplussparkpaintsserver.onrender.com/api/users/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setSelectedUser(response.data.user);
            }
        } catch (error) {
            console.error("Get user error:", error);

            alert(
                error.response?.data?.message ||
                "Failed to load user details"
            );

            setShowViewUser(false);
        } finally {
            setViewLoading(false);
        }
    };


    const handleRegistrationReview = async (user, status) => {
        if (!user?.isRegistrationRequest || !user?._id) {
            alert("Invalid registration request.");
            return;
        }

        if (status === "APPROVED" && user.registrationStatus !== "KYC_VERIFIED") {
            alert("Pehle KYC verify karo.");
            return;
        }

        let adminRemarks = "";

        if (status === "REJECTED" || status === "CORRECTION_REQUIRED") {
            adminRemarks = window.prompt(
                status === "REJECTED"
                    ? "Enter rejection reason:"
                    : "Enter correction remarks:"
            );

            if (!adminRemarks?.trim()) return;
        } else {
            adminRemarks = window.prompt(
                "Enter admin remarks (optional):",
                ""
            ) ?? null;

            if (adminRemarks === null) return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to change registration status to ${status.replaceAll("_", " ")}?`
        );

        if (!confirmed) return;

        try {
            setKycActionLoading(true);

            const token = localStorage.getItem("token");
            const registrationType = user.registrationType;

            const endpoint =
                registrationType === "DEALER"
                    ? `https://oneplussparkpaintsserver.onrender.com/api/superadmin/dealer-registrations/${user._id}/review`
                    : `https://oneplussparkpaintsserver.onrender.com/api/superadmin/painter-registrations/${user._id}/review`;

            const response = await axios.patch(
                endpoint,
                { status, adminRemarks: adminRemarks.trim() },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data.success) {
                alert(`Registration ${status.replaceAll("_", " ").toLowerCase()} successfully.`);
                await fetchUsers();

                const updatedUserResponse = await axios.get(
                    `https://oneplussparkpaintsserver.onrender.com/api/users/${user._id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (updatedUserResponse.data.success) {
                    setSelectedUser(updatedUserResponse.data.user);
                }
            }
        } catch (error) {
            console.error("Registration review error:", error);
            alert(
                error.response?.data?.message ||
                "Failed to update registration status."
            );
        } finally {
            setKycActionLoading(false);
        }
    };


    // ==========================================
    // EDIT USER
    // ==========================================
    // Old edit modal removed.
    // Now open the full AddUser page in edit mode.

    const handleEditUser = (userId) => {
        navigate(`/users/edit/${userId}`);
    };

    // ==========================================
    // DELETE USER
    // ==========================================

    const handleDeleteUser = async (userId, userName) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${userName}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingUser(true);

            const token = localStorage.getItem("token");

            const response = await axios.delete(
                `https://oneplussparkpaintsserver.onrender.com/api/users/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                alert("User deleted successfully");

                setSelectedUsers((prev) =>
                    prev.filter((id) => id !== userId)
                );

                await fetchUsers();
            }
        } catch (error) {
            console.error("Delete user error:", error);

            alert(
                error.response?.data?.message ||
                "Failed to delete user"
            );
        } finally {
            setDeletingUser(false);
        }
    };

    // ==========================================
    // KYC APPROVE
    // ==========================================

    const handleKycApprove = async (userId) => {
        if (selectedUser?.kycStatus !== "PENDING") {
            alert("Only pending KYC can be approved.");
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to approve this KYC?"
        );

        if (!confirmed) return;

        try {
            setKycActionLoading(true);

            const token = localStorage.getItem("token");

            const response = await axios.put(
                `https://oneplussparkpaintsserver.onrender.com/api/users/${userId}/kyc/approve`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                alert("KYC approved successfully.");

                await fetchUsers();

                const userResponse = await axios.get(
                    `https://oneplussparkpaintsserver.onrender.com/api/users/${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (userResponse.data.success) {
                    setSelectedUser(userResponse.data.user);
                }
            }
        } catch (error) {
            console.error("Approve KYC error:", error);

            alert(
                error.response?.data?.message ||
                "Failed to approve KYC."
            );
        } finally {
            setKycActionLoading(false);
        }
    };

    // ==========================================
    // KYC REJECT
    // ==========================================

    const handleKycReject = async (userId) => {
        if (selectedUser?.kycStatus !== "PENDING") {
            alert("Only pending KYC can be rejected.");
            return;
        }

        const remarks = window.prompt(
            "Enter rejection reason:"
        );

        if (!remarks || !remarks.trim()) {
            alert("Rejection reason is required.");
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to reject this KYC?"
        );

        if (!confirmed) return;

        try {
            setKycActionLoading(true);

            const token = localStorage.getItem("token");

            const response = await axios.put(
                `https://oneplussparkpaintsserver.onrender.com/api/users/${userId}/kyc/reject`,
                {
                    remarks: remarks.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                alert("KYC rejected successfully.");

                await fetchUsers();

                const userResponse = await axios.get(
                    `https://oneplussparkpaintsserver.onrender.com/api/users/${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (userResponse.data.success) {
                    setSelectedUser(userResponse.data.user);
                }
            }
        } catch (error) {
            console.error("Reject KYC error:", error);

            alert(
                error.response?.data?.message ||
                "Failed to reject KYC."
            );
        } finally {
            setKycActionLoading(false);
        }
    };

    // ==========================================
    // KYC CORRECTION
    // ==========================================

    const handleKycCorrection = async (userId) => {
        if (selectedUser?.kycStatus !== "PENDING") {
            alert(
                "Only pending KYC can be sent for correction."
            );
            return;
        }

        const remarks = window.prompt(
            "Enter correction remarks:"
        );

        if (!remarks || !remarks.trim()) {
            alert("Correction remarks are required.");
            return;
        }

        const confirmed = window.confirm(
            "Request correction for this KYC?"
        );

        if (!confirmed) return;

        try {
            setKycActionLoading(true);

            const token = localStorage.getItem("token");

            const response = await axios.put(
                `https://oneplussparkpaintsserver.onrender.com/api/users/${userId}/kyc/correction`,
                {
                    remarks: remarks.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                alert(
                    "KYC correction requested successfully."
                );

                await fetchUsers();

                const userResponse = await axios.get(
                    `https://oneplussparkpaintsserver.onrender.com/api/users/${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (userResponse.data.success) {
                    setSelectedUser(userResponse.data.user);
                }
            }
        } catch (error) {
            console.error(
                "KYC correction error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to request KYC correction."
            );
        } finally {
            setKycActionLoading(false);
        }
    };

    // ==========================================
    // SELECT ALL
    // ==========================================

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedUsers(
                filteredUsers.map((user) => user._id)
            );
        } else {
            setSelectedUsers([]);
        }
    };

    // ==========================================
    // SELECT SINGLE USER
    // ==========================================

    const handleSelectUser = (userId, checked) => {
        if (checked) {
            setSelectedUsers((prev) => [
                ...prev,
                userId,
            ]);
        } else {
            setSelectedUsers((prev) =>
                prev.filter((id) => id !== userId)
            );
        }
    };

    // ==========================================
    // ADD USER
    // ==========================================

    const handleAddUser = () => {
        navigate("/users/add");
    };

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="user-management-page">

            {/* ================= PAGE HEADER ================= */}

            <div className="users-page-header">

                <div>
                    <h2>User Management</h2>

                    <div className="users-breadcrumb">
                        Dashboard
                        <span>›</span>
                        User Management
                    </div>
                </div>

                <div className="users-header-actions">

                    <button className="users-secondary-btn">
                        <Upload size={16} />
                        Import
                    </button>

                    <button className="users-secondary-btn">
                        <Download size={16} />
                        Export
                    </button>

                    <button
                        className="users-primary-btn"
                        onClick={handleAddUser}
                    >
                        <Plus size={18} />
                        Add User
                    </button>

                </div>

            </div>

            {/* ================= STAT CARDS ================= */}

            <div className="users-stat-grid">

                <div className="users-stat-card">

                    <div className="users-stat-icon orange">
                        <Users size={21} />
                    </div>

                    <span>Total Users</span>

                    <strong>{totalUsers}</strong>

                    <small>
                        Registered users
                    </small>

                </div>

                <div className="users-stat-card">

                    <div className="users-stat-icon purple">
                        <UserCheck size={21} />
                    </div>

                    <span>Active Users</span>

                    <strong>{activeUsers}</strong>

                    <small>
                        Currently active
                    </small>

                </div>

                <div className="users-stat-card">

                    <div className="users-stat-icon blue">
                        <UserX size={21} />
                    </div>

                    <span>Inactive Users</span>

                    <strong>{inactiveUsers}</strong>

                    <small>
                        Currently inactive
                    </small>

                </div>

                <div className="users-stat-card">

                    <div className="users-stat-icon green">
                        <UserPlus size={21} />
                    </div>

                    <span>New Users</span>

                    <strong>{newUsers}</strong>

                    <small>
                        This month
                    </small>

                </div>

                <div className="users-stat-card">

                    <div className="users-stat-icon yellow">
                        <UserX size={21} />
                    </div>

                    <span>Blocked Users</span>

                    <strong>{blockedUsers}</strong>

                    <small>
                        Blocked accounts
                    </small>

                </div>

            </div>

            {/* ================= TABLE CARD ================= */}

            <div className="users-table-card">

                {/* FILTER BAR */}

                <div className="users-filter-bar">

                    <div className="users-search-box">

                        <Search size={17} />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search by name, email, mobile or role..."
                        />

                    </div>

                    {/* ROLE */}

                    <div className="users-filter">

                        <label>Role</label>

                        <select
                            value={role}
                            onChange={(e) =>
                                setRole(e.target.value)
                            }
                        >
                            <option>All Roles</option>
                            <option>SUPER_ADMIN</option>
                            <option>DIRECTOR</option>
                            <option>MANAGER</option>
                            <option>SALES_EXECUTIVE</option>
                            <option>ACCOUNTANT</option>
                            <option>STORE_CASHIER</option>
                            <option>DEALER</option>
                            <option>PAINTER</option>
                        </select>

                    </div>

                    {/* DEPARTMENT */}


                    <div className="users-filter">
                        <label>Department</label>

                        <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        >
                            <option value="All Departments">
                                All Departments
                            </option>

                            {departmentOptions.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>


                    {/* STATUS */}

                    <div className="users-filter">

                        <label>Status</label>

                        <select
                            value={status}
                            onChange={(e) =>
                                setStatus(e.target.value)
                            }
                        >
                            <option>
                                All Status
                            </option>

                            <option>ACTIVE</option>
                            <option>INACTIVE</option>
                            <option>PENDING</option>
                            <option>BLOCKED</option>

                        </select>

                    </div>

                    {/* MORE FILTER */}

                    <button
                        type="button"
                        className="more-filter-btn"
                    >
                        <Filter size={16} />
                        More Filters
                    </button>

                    {/* RESET */}

                    <button
                        type="button"
                        className="reset-filter-btn"
                        onClick={handleReset}
                    >
                        Reset
                    </button>

                </div>

                {/* ================= TABLE ================= */}

                <div className="users-table-wrapper">

                    <table className="users-table">

                        <thead>

                            <tr>

                                <th>

                                    <input
                                        type="checkbox"
                                        checked={
                                            filteredUsers.length > 0 &&
                                            selectedUsers.length ===
                                            filteredUsers.length
                                        }
                                        onChange={handleSelectAll}
                                    />

                                </th>

                                <th>User Details</th>
                                <th>Role</th>
                                <th>Department</th>
                                <th>Mobile Number</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Last Login</th>
                                <th>Action</th>

                            </tr>

                        </thead>

                        <tbody>

                            {loading ? (

                                <tr>

                                    <td
                                        colSpan="9"
                                        className="users-loading"
                                    >
                                        Loading users...
                                    </td>

                                </tr>

                            ) : filteredUsers.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="9"
                                        className="users-empty"
                                    >
                                        No users found
                                    </td>

                                </tr>

                            ) : (

                                paginatedUsers.map((user) => (

                                    <tr key={user._id}>

                                        {/* CHECKBOX */}

                                        <td>

                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(
                                                    user._id
                                                )}
                                                onChange={(e) =>
                                                    handleSelectUser(
                                                        user._id,
                                                        e.target.checked
                                                    )
                                                }
                                            />

                                        </td>

                                        {/* USER */}

                                        <td>

                                            <div className="table-user">

                                                <div className="table-user-avatar">
                                                    {user.profilePicture ? (
                                                        <img
                                                            src={getProfileImageUrl(user.profilePicture)}
                                                            alt={user.name}
                                                        />
                                                    ) : (
                                                        getInitials(user.name)
                                                    )}
                                                </div>

                                                <div className="table-user-info">

                                                    <strong>
                                                        {user.name}
                                                    </strong>

                                                    <small>
                                                        {user._id?.slice(-8)}
                                                    </small>

                                                </div>

                                            </div>

                                        </td>

                                        {/* ROLE */}

                                        <td>

                                            <span
                                                className={`user-role-badge ${getRoleClass(
                                                    user.role
                                                )}`}
                                            >
                                                {user.role?.replaceAll(
                                                    "_",
                                                    " "
                                                )}
                                            </span>

                                        </td>

                                        {/* DEPARTMENT */}

                                        <td>

                                            <span className="table-text">
                                                {user.department || getDepartment(user.role)}
                                            </span>

                                        </td>

                                        {/* MOBILE */}

                                        <td>

                                            <span className="table-text">
                                                {user.mobile || "-"}
                                            </span>

                                        </td>

                                        {/* EMAIL */}

                                        <td>

                                            <span className="table-text email-text">
                                                {user.email || "-"}
                                            </span>

                                        </td>

                                        {/* STATUS */}

                                        <td>

                                            <span
                                                className={`user-status-badge ${getStatusClass(
                                                    user.status
                                                )}`}
                                            >
                                                {user.status}
                                            </span>

                                        </td>

                                        {/* LAST LOGIN */}

                                        <td>

                                            <div className="last-login">

                                                {user.lastLogin ? (

                                                    <>

                                                        <strong>
                                                            {new Date(
                                                                user.lastLogin
                                                            ).toLocaleDateString(
                                                                "en-IN"
                                                            )}
                                                        </strong>

                                                        <small>
                                                            {new Date(
                                                                user.lastLogin
                                                            ).toLocaleTimeString(
                                                                "en-IN",
                                                                {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                }
                                                            )}
                                                        </small>

                                                    </>

                                                ) : (

                                                    <span>-</span>

                                                )}

                                            </div>

                                        </td>

                                        {/* ACTION */}

                                        <td>

                                            <div className="user-table-actions">

                                                {/* VIEW */}

                                                <button
                                                    className="user-action-view"
                                                    title="View User"
                                                    onClick={() =>
                                                        handleViewUser(
                                                            user._id
                                                        )
                                                    }
                                                >
                                                    <Eye size={17} />
                                                </button>

                                                {/* EDIT */}


                                                {!user.isRegistrationRequest && (
                                                    <button
                                                        className="user-action-edit"
                                                        title="Edit User"
                                                        onClick={() => handleEditUser(user._id)}
                                                    >
                                                        <Pencil size={17} />
                                                    </button>
                                                )}


                                                {/* DELETE */}


                                                {!user.isRegistrationRequest && (
                                                    <button
                                                        className="user-action-delete"
                                                        title="Delete User"
                                                        onClick={() =>
                                                            handleDeleteUser(user._id, user.name)
                                                        }
                                                        disabled={deletingUser}
                                                    >
                                                        <UserX size={17} />
                                                    </button>
                                                )}


                                                {/* MORE */}

                                                <button title="More">
                                                    <MoreVertical
                                                        size={16}
                                                    />
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

                {/* ================= FOOTER ================= */}

                <div className="users-table-footer">

                    <span>
                        Showing{" "}
                        {filteredUsers.length === 0
                            ? 0
                            : startIndex + 1}
                        {"–"}
                        {Math.min(endIndex, filteredUsers.length)} of{" "}
                        {filteredUsers.length} entries
                    </span>

                    <div className="users-pagination">

                        <button
                            disabled={currentPage === 1}
                            onClick={() =>
                                setCurrentPage((prev) => prev - 1)
                            }
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {Array.from(
                            { length: totalPages },
                            (_, index) => index + 1
                        ).map((page) => (
                            <button
                                key={page}
                                className={
                                    currentPage === page ? "active" : ""
                                }
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() =>
                                setCurrentPage((prev) => prev + 1)
                            }
                        >
                            <ChevronRight size={16} />
                        </button>

                    </div>

                </div>

            </div>

            {/* ================= VIEW USER MODAL ================= */}

            {showViewUser && (

                <div
                    className="view-user-modal-overlay"
                    onClick={() =>
                        setShowViewUser(false)
                    }
                >

                    <div
                        className="view-user-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* HEADER */}

                        <div className="view-user-modal-header">

                            <div>

                                <h3>
                                    User Details
                                </h3>

                                <p>
                                    Complete user information
                                </p>

                            </div>
                        </div>

                        {viewLoading ? (

                            <div className="view-user-loading">
                                Loading user details...
                            </div>

                        ) : selectedUser ? (

                            <div className="view-user-content">

                                {/* PROFILE */}

                                <div className="view-user-profile">

                                    <div className="view-user-avatar">

                                        {selectedUser.profilePicture ? (

                                            <img
                                                src={getProfileImageUrl(selectedUser.profilePicture)}
                                                alt={selectedUser.name}
                                            />

                                        ) : (

                                            selectedUser.name
                                                ?.split(" ")
                                                .map(
                                                    (word) =>
                                                        word[0]
                                                )
                                                .join("")
                                                .slice(0, 2)
                                                .toUpperCase()

                                        )}

                                    </div>

                                    <div>

                                        <h2>
                                            {selectedUser.name}
                                        </h2>

                                        <p>
                                            {selectedUser.email}
                                        </p>

                                        <span className="view-user-role">
                                            {selectedUser.role?.replaceAll(
                                                "_",
                                                " "
                                            )}
                                        </span>

                                    </div>

                                </div>

                                {/* BASIC INFORMATION */}

                                <div className="view-user-section">

                                    <h4>
                                        Basic Information
                                    </h4>

                                    <div className="view-user-grid">

                                        <div>
                                            <label>
                                                Full Name
                                            </label>

                                            <strong>
                                                {selectedUser.name ||
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <label>
                                                Email
                                            </label>

                                            <strong>
                                                {selectedUser.email ||
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <label>
                                                Mobile
                                            </label>

                                            <strong>
                                                {selectedUser.mobile ||
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <label>
                                                Role
                                            </label>

                                            <strong>
                                                {selectedUser.role?.replaceAll(
                                                    "_",
                                                    " "
                                                ) || "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <label>
                                                Status
                                            </label>

                                            <strong
                                                className={`view-status ${selectedUser.status?.toLowerCase()}`}
                                            >
                                                {selectedUser.status ||
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <label>
                                                KYC Status
                                            </label>

                                            <strong
                                                className={`view-kyc ${selectedUser.kycStatus
                                                    ?.toLowerCase()
                                                    .replaceAll(
                                                        "_",
                                                        "-"
                                                    )}`}
                                            >
                                                {selectedUser.kycStatus?.replaceAll(
                                                    "_",
                                                    " "
                                                ) || "-"}
                                            </strong>
                                        </div>

                                    </div>

                                </div>

                                {/* ADDRESS */}

                                <div className="view-user-section">

                                    <h4>
                                        Address Information
                                    </h4>

                                    <div className="view-user-grid">

                                        <div>
                                            <label>
                                                Address
                                            </label>

                                            <strong>
                                                {selectedUser.address ||
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <label>
                                                State
                                            </label>

                                            <strong>
                                                {selectedUser.state ||
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <label>
                                                District
                                            </label>

                                            <strong>
                                                {selectedUser.district ||
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <label>
                                                City
                                            </label>

                                            <strong>
                                                {selectedUser.city ||
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <label>
                                                PIN Code
                                            </label>

                                            <strong>
                                                {selectedUser.pinCode ||
                                                    "-"}
                                            </strong>
                                        </div>

                                    </div>

                                </div>

                                {/* KYC */}

                                <div className="view-user-section">

                                    <h4>
                                        KYC Information
                                    </h4>

                                    <div className="view-user-grid">

                                        <div>
                                            <label>
                                                Aadhaar Number
                                            </label>

                                            <strong>
                                                {selectedUser.kyc
                                                    ?.aadhaarNumber ||
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <label>
                                                PAN Number
                                            </label>

                                            <strong>
                                                {selectedUser.kyc
                                                    ?.panNumber ||
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <label>
                                                Bank Account
                                            </label>

                                            <strong>
                                                {selectedUser.kyc
                                                    ?.bankAccountNumber ||
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <label>
                                                IFSC Code
                                            </label>

                                            <strong>
                                                {selectedUser.kyc
                                                    ?.ifscCode ||
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <label>
                                                GST Number
                                            </label>

                                            <strong>
                                                {selectedUser.kyc
                                                    ?.gstNumber ||
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <label>
                                                Shop Act Licence
                                            </label>

                                            <strong>
                                                {selectedUser.kyc
                                                    ?.shopActLicenceNumber ||
                                                    "-"}
                                            </strong>
                                        </div>

                                    </div>

                                    {selectedUser?.kycStatus ===
                                        "PENDING" && (

                                            <div className="kyc-action-buttons">

                                                <button
                                                    type="button"
                                                    className="kyc-approve-btn"
                                                    disabled={
                                                        kycActionLoading
                                                    }
                                                    onClick={() =>
                                                        handleKycApprove(
                                                            selectedUser._id
                                                        )
                                                    }
                                                >
                                                    Approve KYC
                                                </button>

                                                <button
                                                    type="button"
                                                    className="kyc-reject-btn"
                                                    disabled={
                                                        kycActionLoading
                                                    }
                                                    onClick={() =>
                                                        handleKycReject(
                                                            selectedUser._id
                                                        )
                                                    }
                                                >
                                                    Reject KYC
                                                </button>

                                                <button
                                                    type="button"
                                                    className="kyc-correction-btn"
                                                    disabled={
                                                        kycActionLoading
                                                    }
                                                    onClick={() =>
                                                        handleKycCorrection(
                                                            selectedUser._id
                                                        )
                                                    }
                                                >
                                                    Request Correction
                                                </button>

                                            </div>

                                        )}

                                </div>


                                {selectedUser?.isRegistrationRequest && (
                                    <div className="view-user-section">
                                        <h4>Registration & KYC Documents</h4>

                                        <div className="view-user-grid">
                                            <div>
                                                <label>Registration ID</label>
                                                <strong>{selectedUser.registrationId || selectedUser.userId || "-"}</strong>
                                            </div>

                                            <div>
                                                <label>Registration Type</label>
                                                <strong>{selectedUser.registrationType || "-"}</strong>
                                            </div>

                                            <div>
                                                <label>Registration Status</label>
                                                <strong>{(selectedUser.registrationStatus || selectedUser.status || "-").replaceAll("_", " ")}</strong>
                                            </div>

                                            {(
                                                selectedUser.registrationType === "DEALER"
                                                    ? [
                                                        ["GST Certificate", selectedUser.gstCertificate],
                                                        ["PAN Card", selectedUser.panCard],
                                                        ["Aadhaar", selectedUser.aadhaar],
                                                        ["Shop Photograph", selectedUser.shopPhotograph],
                                                        ["Business Licence", selectedUser.businessLicence],
                                                        ["Cancelled Cheque", selectedUser.cancelledCheque],
                                                        ["Bank Passbook", selectedUser.bankPassbook],
                                                    ]
                                                    : [
                                                        ["Aadhaar", selectedUser.aadhaar],
                                                        ["PAN Card", selectedUser.panCard],
                                                        ["Profile Photo", selectedUser.profilePhoto],
                                                        ["Passbook", selectedUser.passbook],
                                                        ["Cancelled Cheque", selectedUser.cancelledCheque],
                                                    ]
                                            ).map(([label, filePath]) => (
                                                <div className="document-section" key={label}>
                                                    <label>{label}</label>
                                                    {filePath ? (
                                                        <a
                                                            href={`https://oneplussparkpaintsserver.onrender.com/${String(filePath).replace(/^\/+/, "")}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            View Document
                                                        </a>
                                                    ) : (
                                                        <strong>Not uploaded</strong>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="kyc-action-buttons">
                                            {selectedUser.registrationStatus === "PENDING" && (
                                                <button
                                                    type="button"
                                                    className="kyc-approve-btn"
                                                    disabled={kycActionLoading}
                                                    onClick={() => handleRegistrationReview(selectedUser, "KYC_VERIFIED")}
                                                >
                                                    Verify KYC
                                                </button>
                                            )}

                                            {selectedUser.registrationStatus === "KYC_VERIFIED" && (
                                                <button
                                                    type="button"
                                                    className="kyc-approve-btn"
                                                    disabled={kycActionLoading}
                                                    onClick={() => handleRegistrationReview(selectedUser, "APPROVED")}
                                                >
                                                    Approve Registration
                                                </button>
                                            )}

                                            {["PENDING", "KYC_VERIFIED"].includes(selectedUser.registrationStatus) && (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="kyc-reject-btn"
                                                        disabled={kycActionLoading}
                                                        onClick={() => handleRegistrationReview(selectedUser, "REJECTED")}
                                                    >
                                                        Reject
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="kyc-correction-btn"
                                                        disabled={kycActionLoading}
                                                        onClick={() => handleRegistrationReview(selectedUser, "CORRECTION_REQUIRED")}
                                                    >
                                                        Request Correction
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}


                                {/* EMERGENCY CONTACT */}

                                <div className="view-user-section">

                                    <h4>
                                        Emergency Contact
                                    </h4>

                                    <div className="view-user-grid">

                                        <div>
                                            <label>
                                                Name
                                            </label>

                                            <strong>
                                                {selectedUser.kyc
                                                    ?.emergencyContact
                                                    ?.name ||
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <label>
                                                Mobile
                                            </label>

                                            <strong>
                                                {selectedUser.kyc
                                                    ?.emergencyContact
                                                    ?.mobile ||
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <label>
                                                Relation
                                            </label>

                                            <strong>
                                                {selectedUser.kyc
                                                    ?.emergencyContact
                                                    ?.relation ||
                                                    "-"}
                                            </strong>
                                        </div>

                                    </div>

                                </div>

                                {/* FOOTER */}

                                <div className="view-user-footer">

                                    <button className="view-user-close-bottom"
                                        onClick={() =>
                                            setShowViewUser(false)
                                        }
                                    >
                                        Close
                                    </button>

                                </div>

                            </div>

                        ) : null}

                    </div>

                </div>

            )}

        </div>
    );
};

// ==========================================
// DEPARTMENT
// ==========================================

const getDepartment = (role) => {
    switch (role) {
        case "SUPER_ADMIN":
            return "Administration";

        case "DIRECTOR":
            return "Management";

        case "MANAGER":
            return "Sales";

        case "SALES_EXECUTIVE":
            return "Sales";

        case "ACCOUNTANT":
            return "Finance";

        case "STORE_CASHIER":
            return "Store";

        case "DEALER":
            return "Dealer Management";

        case "PAINTER":
            return "Painter Management";

        default:
            return "-";
    }
};

export default UserManagement;