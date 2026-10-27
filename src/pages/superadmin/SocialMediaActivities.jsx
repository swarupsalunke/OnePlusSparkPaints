import React, { useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Eye,
    FileText,
    Filter,
    Heart,
    MessageCircle,
    Pencil,
    Plus,
    Search,
    Send,
    Trash2,
    X,
    MoreHorizontal,
    CircleAlert,
    RotateCcw,
    BarChart3,
    Share2,
} from "lucide-react";
import "../../css/superadmin/SocialMediaActivities.css";

const API_URL = "https://oneplussparkpaintsserver.onrender.com/api/social-media";
const SERVER_URL = "https://oneplussparkpaintsserver.onrender.com";

const platforms = [
    "Facebook",
    "Instagram",
    "LinkedIn",
    "YouTube",
    "X",
    "WhatsApp",
    "Others",
];

const statuses = [
    "Scheduled",
    "Published",
    "In Progress",
    "Failed",
    "Cancelled",
];

const postTypes = [
    "Promotional",
    "Educational",
    "Informational",
    "Testimonial",
    "Announcement",
];

const emptyForm = {
    title: "",
    content: "",
    platform: "Facebook",
    campaign: "",
    postType: "Promotional",
    scheduledDateTime: "",
    postedDateTime: "",
    status: "Scheduled",
    engagement: {
        views: 0,
        likes: 0,
        comments: 0,
    },
    isPaidCampaign: false,
    paidCampaignDetails: {
        budget: 0,
        startDate: "",
        endDate: "",
    },
    image: null,
};

const getToken = () => localStorage.getItem("token");

const getImageUrl = (image) => {
    if (!image) return "";
    if (image.startsWith("http")) return image;
    return `${SERVER_URL}${image}`;
};

const formatDate = (date) => {
    if (!date) return "-";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) return "-";

    return value.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatDateTime = (date) => {
    if (!date) return "-";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) return "-";

    return (
        <>
            <span>{formatDate(date)}</span>
            <small>
                {value.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </small>
        </>
    );
};

const toInputDateTime = (date) => {
    if (!date) return "";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) return "";

    const offset = value.getTimezoneOffset();
    const localDate = new Date(value.getTime() - offset * 60000);

    return localDate.toISOString().slice(0, 16);
};

const platformIcon = (platform) => {
    switch (platform) {
        case "Facebook":
            return <Share2 size={17} />;

        case "Instagram":
            return <Share2 size={17} />;

        case "LinkedIn":
            return <Share2 size={17} />;

        case "YouTube":
            return <Send size={17} />;

        case "X":
            return <X size={17} />;

        case "WhatsApp":
            return <MessageCircle size={17} />;

        default:
            return <MoreHorizontal size={17} />;
    }
};

const platformClass = (platform) => {
    return `platform-icon ${platform?.toLowerCase().replace(/\s+/g, "-")}`;
};

const statusClass = (status) => {
    switch (status) {
        case "Published":
            return "status-published";
        case "Scheduled":
            return "status-scheduled";
        case "In Progress":
            return "status-progress";
        case "Failed":
            return "status-failed";
        case "Cancelled":
            return "status-cancelled";
        default:
            return "";
    }
};

export default function SocialMediaActivities() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [platformFilter, setPlatformFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [campaignFilter, setCampaignFilter] = useState("");
    const [postTypeFilter, setPostTypeFilter] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");

    const [showForm, setShowForm] = useState(false);
    const [showView, setShowView] = useState(false);

    const [editingPost, setEditingPost] = useState(null);
    const [viewPost, setViewPost] = useState(null);

    const [form, setForm] = useState(emptyForm);
    const [selectedImage, setSelectedImage] = useState(null);
    const [saving, setSaving] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [calendarDate, setCalendarDate] = useState(new Date());

    // =====================================================
    // FETCH POSTS
    // =====================================================

    const fetchPosts = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();

            if (search.trim()) params.append("search", search.trim());
            if (platformFilter) params.append("platform", platformFilter);
            if (statusFilter) params.append("status", statusFilter);
            if (campaignFilter) params.append("campaign", campaignFilter);
            if (postTypeFilter) params.append("postType", postTypeFilter);

            params.append("sortBy", sortBy);
            params.append("order", sortOrder);

            const response = await fetch(`${API_URL}?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to fetch posts");
            }

            setPosts(result.data || []);
        } catch (error) {
            console.error("Get social media posts error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [
        search,
        platformFilter,
        statusFilter,
        campaignFilter,
        postTypeFilter,
        sortBy,
        sortOrder,
    ]);

    // =====================================================
    // RESET FILTERS
    // =====================================================

    const resetFilters = () => {
        setSearch("");
        setPlatformFilter("");
        setStatusFilter("");
        setCampaignFilter("");
        setPostTypeFilter("");
        setSortBy("createdAt");
        setSortOrder("desc");
        setCurrentPage(1);
    };

    // =====================================================
    // STATS
    // =====================================================

    const stats = useMemo(() => {
        return {
            total: posts.length,
            scheduled: posts.filter((p) => p.status === "Scheduled").length,
            published: posts.filter((p) => p.status === "Published").length,
            progress: posts.filter((p) => p.status === "In Progress").length,
            failedCancelled: posts.filter(
                (p) => p.status === "Failed" || p.status === "Cancelled"
            ).length,
        };
    }, [posts]);

    // =====================================================
    // PLATFORM SUMMARY
    // =====================================================

    const platformSummary = useMemo(() => {
        return platforms.map((platform) => ({
            platform,
            count: posts.filter((p) => p.platform === platform).length,
        }));
    }, [posts]);

    // =====================================================
    // CAMPAIGNS
    // =====================================================

    const campaigns = useMemo(() => {
        const values = posts
            .map((post) => post.campaign)
            .filter(Boolean);

        return [...new Set(values)];
    }, [posts]);

    // =====================================================
    // PAGINATION
    // =====================================================

    const totalPages = Math.max(
        1,
        Math.ceil(posts.length / itemsPerPage)
    );

    const paginatedPosts = posts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // =====================================================
    // FORM HANDLERS
    // =====================================================

    const handleFormChange = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleEngagementChange = (field, value) => {
        setForm((prev) => ({
            ...prev,
            engagement: {
                ...prev.engagement,
                [field]: Number(value) || 0,
            },
        }));
    };

    const handlePaidDetailsChange = (field, value) => {
        setForm((prev) => ({
            ...prev,
            paidCampaignDetails: {
                ...prev.paidCampaignDetails,
                [field]: value,
            },
        }));
    };

    const openCreateModal = () => {
        setEditingPost(null);
        setForm(emptyForm);
        setSelectedImage(null);
        setShowForm(true);
    };

    const openEditModal = (post) => {
        setEditingPost(post);

        setForm({
            title: post.title || "",
            content: post.content || "",
            platform: post.platform || "Facebook",
            campaign: post.campaign || "",
            postType: post.postType || "Promotional",
            scheduledDateTime: toInputDateTime(post.scheduledDateTime),
            postedDateTime: toInputDateTime(post.postedDateTime),
            status: post.status || "Scheduled",
            engagement: {
                views: post.engagement?.views || 0,
                likes: post.engagement?.likes || 0,
                comments: post.engagement?.comments || 0,
            },
            isPaidCampaign: post.isPaidCampaign || false,
            paidCampaignDetails: {
                budget: post.paidCampaignDetails?.budget || 0,
                startDate: toInputDateTime(
                    post.paidCampaignDetails?.startDate
                ).slice(0, 10),
                endDate: toInputDateTime(
                    post.paidCampaignDetails?.endDate
                ).slice(0, 10),
            },
            image: null,
        });

        setSelectedImage(null);
        setShowForm(true);
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        setSelectedImage(file);
    };

    // =====================================================
    // CREATE / UPDATE
    // =====================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);

            const formData = new FormData();

            formData.append("title", form.title);
            formData.append("content", form.content);
            formData.append("platform", form.platform);
            formData.append("campaign", form.campaign);
            formData.append("postType", form.postType);
            formData.append(
                "scheduledDateTime",
                form.scheduledDateTime || ""
            );
            formData.append(
                "postedDateTime",
                form.postedDateTime || ""
            );
            formData.append("status", form.status);

            formData.append(
                "engagement",
                JSON.stringify(form.engagement)
            );

            formData.append(
                "isPaidCampaign",
                String(form.isPaidCampaign)
            );

            formData.append(
                "paidCampaignDetails",
                JSON.stringify({
                    budget: Number(form.paidCampaignDetails.budget) || 0,
                    startDate:
                        form.paidCampaignDetails.startDate || null,
                    endDate:
                        form.paidCampaignDetails.endDate || null,
                })
            );

            if (selectedImage) {
                formData.append("image", selectedImage);
            }

            const url = editingPost
                ? `${API_URL}/${editingPost._id}`
                : API_URL;

            const response = await fetch(url, {
                method: editingPost ? "PUT" : "POST",
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to save post"
                );
            }

            setShowForm(false);
            setEditingPost(null);
            setSelectedImage(null);
            setForm(emptyForm);

            await fetchPosts();
        } catch (error) {
            console.error("Save post error:", error);
            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // VIEW
    // =====================================================

    const handleView = (post) => {
        setViewPost(post);
        setShowView(true);
    };

    // =====================================================
    // DELETE
    // =====================================================

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this post?"
        );

        if (!confirmed) return;

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to delete post"
                );
            }

            await fetchPosts();
        } catch (error) {
            console.error("Delete post error:", error);
            alert(error.message);
        }
    };

    // =====================================================
    // CALENDAR
    // =====================================================

    const calendarYear = calendarDate.getFullYear();
    const calendarMonth = calendarDate.getMonth();

    const firstDay = new Date(
        calendarYear,
        calendarMonth,
        1
    ).getDay();

    const daysInMonth = new Date(
        calendarYear,
        calendarMonth + 1,
        0
    ).getDate();

    const calendarCells = [];

    for (let i = 0; i < firstDay; i++) {
        calendarCells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        calendarCells.push(day);
    }

    const postsOnDay = (day) => {
        return posts.filter((post) => {
            if (!post.scheduledDateTime) return false;

            const date = new Date(post.scheduledDateTime);

            return (
                date.getFullYear() === calendarYear &&
                date.getMonth() === calendarMonth &&
                date.getDate() === day
            );
        });
    };

    const previousMonth = () => {
        setCalendarDate(
            new Date(calendarYear, calendarMonth - 1, 1)
        );
    };

    const nextMonth = () => {
        setCalendarDate(
            new Date(calendarYear, calendarMonth + 1, 1)
        );
    };

    // =====================================================
    // TOP PERFORMING
    // =====================================================

    const topPerformingPosts = useMemo(() => {
        return [...posts]
            .sort(
                (a, b) =>
                    (b.engagement?.views || 0) -
                    (a.engagement?.views || 0)
            )
            .slice(0, 5);
    }, [posts]);

    // =====================================================
    // STATUS OVERVIEW
    // =====================================================

    const statusOverview = useMemo(() => {
        return statuses.map((status) => ({
            status,
            count: posts.filter((p) => p.status === status).length,
        }));
    }, [posts]);

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="social-media-page">

            {/* HEADER */}

            <div className="page-header">
                <div>
                    <h1>Social Media Activities</h1>

                    <p>
                        Plan, schedule, publish and track all your social
                        media posts in one place.
                    </p>

                    <div className="breadcrumb">
                        Dashboard
                        <span>›</span>
                        Marketing
                        <span>›</span>
                        <strong>Social Media Activities</strong>
                    </div>
                </div>

                <div className="header-actions">
                    <button className="secondary-btn">
                        <CalendarDays size={16} />
                        Calendar View
                    </button>

                    <button className="secondary-btn">
                        <BarChart3 size={16} />
                        Analytics
                    </button>

                    <button
                        className="primary-btn"
                        onClick={openCreateModal}
                    >
                        <Plus size={17} />
                        Create New Post
                    </button>
                </div>
            </div>

            {/* STATS */}

            <div className="stats-grid">

                <div className="stat-card">
                    <div className="stat-icon purple">
                        <FileText size={23} />
                    </div>

                    <div>
                        <span>Total Posts</span>
                        <strong>{stats.total}</strong>
                        <small>All Time</small>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green">
                        <CalendarDays size={23} />
                    </div>

                    <div>
                        <span>Scheduled</span>
                        <strong>{stats.scheduled}</strong>
                        <small>Upcoming Posts</small>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon blue">
                        <Send size={23} />
                    </div>

                    <div>
                        <span>Published</span>
                        <strong>{stats.published}</strong>
                        <small>This Month</small>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orange">
                        <Clock3 size={23} />
                    </div>

                    <div>
                        <span>In Progress</span>
                        <strong>{stats.progress}</strong>
                        <small>Currently Scheduled</small>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon red">
                        <CircleAlert size={23} />
                    </div>

                    <div>
                        <span>Failed / Cancelled</span>
                        <strong>{stats.failedCancelled}</strong>
                        <small>This Month</small>
                    </div>
                </div>

            </div>

            {/* FILTERS */}

            <div className="filter-box">

                <div className="filter-item">
                    <label>Platform</label>

                    <select
                        value={platformFilter}
                        onChange={(e) =>
                            setPlatformFilter(e.target.value)
                        }
                    >
                        <option value="">All Platforms</option>

                        {platforms.map((platform) => (
                            <option key={platform} value={platform}>
                                {platform}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-item">
                    <label>Status</label>

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(e.target.value)
                        }
                    >
                        <option value="">All Status</option>

                        {statuses.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-item">
                    <label>Campaign</label>

                    <select
                        value={campaignFilter}
                        onChange={(e) =>
                            setCampaignFilter(e.target.value)
                        }
                    >
                        <option value="">All Campaigns</option>

                        {campaigns.map((campaign) => (
                            <option key={campaign} value={campaign}>
                                {campaign}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-item">
                    <label>Post Type</label>

                    <select
                        value={postTypeFilter}
                        onChange={(e) =>
                            setPostTypeFilter(e.target.value)
                        }
                    >
                        <option value="">All Types</option>

                        {postTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-search">
                    <label>Search</label>

                    <div className="search-input">
                        <input
                            type="text"
                            placeholder="Search by post, content, hashtag..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                        />

                        <Search size={17} />
                    </div>
                </div>

                <button
                    className="filter-btn"
                    onClick={() => setCurrentPage(1)}
                >
                    <Filter size={16} />
                    Filters
                </button>

                <button
                    className="reset-filter-btn"
                    onClick={resetFilters}
                    title="Reset Filters"
                >
                    <RotateCcw size={16} />
                </button>

            </div>

            {/* PLATFORM SUMMARY */}

            <div className="platform-summary">

                {platformSummary.map((item) => (
                    <div
                        className="platform-card"
                        key={item.platform}
                    >
                        <div
                            className={platformClass(item.platform)}
                        >
                            {platformIcon(item.platform)}
                        </div>

                        <div>
                            <span>{item.platform}</span>
                            <strong>{item.count}</strong>
                            <small>Posts</small>
                        </div>
                    </div>
                ))}

            </div>

            {/* MAIN CONTENT */}

            <div className="social-main-grid">

                {/* TABLE */}

                <div className="posts-section">

                    <div className="section-title">
                        <div>
                            <h2>
                                Scheduled & Published Posts
                                <span>({posts.length})</span>
                            </h2>
                        </div>

                        <div className="table-sort">
                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [field, order] =
                                        e.target.value.split("-");

                                    setSortBy(field);
                                    setSortOrder(order);
                                }}
                            >
                                <option value="createdAt-desc">
                                    Latest
                                </option>

                                <option value="scheduledDateTime-asc">
                                    Scheduled Date
                                </option>

                                <option value="title-asc">
                                    Name A-Z
                                </option>
                            </select>
                        </div>
                    </div>

                    <div className="table-wrapper">

                        <table className="posts-table">

                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Post / Content</th>
                                    <th>Platform</th>
                                    <th>Campaign</th>
                                    <th>Scheduled Date & Time</th>
                                    <th>Status</th>
                                    <th>Posted Date & Time</th>
                                    <th>Engagement</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="9"
                                            className="empty-row"
                                        >
                                            Loading posts...
                                        </td>
                                    </tr>
                                ) : paginatedPosts.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="9"
                                            className="empty-row"
                                        >
                                            No social media posts found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedPosts.map((post, index) => (
                                        <tr key={post._id}>

                                            <td>
                                                {(currentPage - 1) *
                                                    itemsPerPage +
                                                    index +
                                                    1}
                                            </td>

                                            <td>
                                                <div className="post-content-cell">

                                                    <div className="post-image">

                                                        {post.image ? (
                                                            <img
                                                                src={getImageUrl(
                                                                    post.image
                                                                )}
                                                                alt={post.title}
                                                            />
                                                        ) : (
                                                            <FileText size={20} />
                                                        )}

                                                    </div>

                                                    <div className="post-text">
                                                        <strong>
                                                            {post.title}
                                                        </strong>

                                                        <span>
                                                            {post.content
                                                                ? post.content.length >
                                                                    42
                                                                    ? `${post.content.slice(
                                                                        0,
                                                                        42
                                                                    )}...`
                                                                    : post.content
                                                                : "-"}
                                                        </span>
                                                    </div>

                                                </div>
                                            </td>

                                            <td>
                                                <div
                                                    className="table-platform"
                                                >
                                                    <span
                                                        className={platformClass(
                                                            post.platform
                                                        )}
                                                    >
                                                        {platformIcon(
                                                            post.platform
                                                        )}
                                                    </span>

                                                    <span>
                                                        {post.platform}
                                                    </span>
                                                </div>
                                            </td>

                                            <td>
                                                {post.campaign || "-"}
                                            </td>

                                            <td>
                                                <div className="date-cell">
                                                    {formatDateTime(
                                                        post.scheduledDateTime
                                                    )}
                                                </div>
                                            </td>

                                            <td>
                                                <span
                                                    className={`status-badge ${statusClass(
                                                        post.status
                                                    )}`}
                                                >
                                                    {post.status}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="date-cell">
                                                    {formatDateTime(
                                                        post.postedDateTime
                                                    )}
                                                </div>
                                            </td>

                                            <td>

                                                {post.status === "Published" ? (
                                                    <div className="engagement">

                                                        <span>
                                                            <Eye size={13} />
                                                            {post.engagement?.views ||
                                                                0}
                                                        </span>

                                                        <span>
                                                            <Heart size={13} />
                                                            {post.engagement?.likes ||
                                                                0}
                                                        </span>

                                                        <span>
                                                            <MessageCircle
                                                                size={13}
                                                            />
                                                            {post.engagement
                                                                ?.comments || 0}
                                                        </span>

                                                    </div>
                                                ) : (
                                                    <span className="dash">
                                                        -
                                                    </span>
                                                )}

                                            </td>

                                            <td>

                                                <div className="action-buttons">

                                                    <button
                                                        className="icon-action view"
                                                        title="View"
                                                        onClick={() =>
                                                            handleView(post)
                                                        }
                                                    >
                                                        <Eye size={15} />
                                                    </button>

                                                    <button
                                                        className="icon-action edit"
                                                        title="Edit"
                                                        onClick={() =>
                                                            openEditModal(post)
                                                        }
                                                    >
                                                        <Pencil size={15} />
                                                    </button>

                                                    <button
                                                        className="icon-action delete"
                                                        title="Delete"
                                                        onClick={() =>
                                                            handleDelete(post._id)
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

                    <div className="pagination">

                        <span>
                            Showing{" "}
                            {posts.length === 0
                                ? 0
                                : (currentPage - 1) *
                                itemsPerPage +
                                1}{" "}
                            to{" "}
                            {Math.min(
                                currentPage * itemsPerPage,
                                posts.length
                            )}{" "}
                            of {posts.length} entries
                        </span>

                        <div className="pagination-buttonsm">

                            <button
                                disabled={currentPage === 1}
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.max(1, prev - 1)
                                    )
                                }
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {Array.from(
                                { length: totalPages },
                                (_, index) => index + 1
                            )
                                .slice(
                                    0,
                                    Math.min(totalPages, 5)
                                )
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
                                    setCurrentPage((prev) =>
                                        Math.min(
                                            totalPages,
                                            prev + 1
                                        )
                                    )
                                }
                            >
                                <ChevronRight size={16} />
                            </button>

                        </div>

                    </div>

                </div>

                {/* RIGHT SIDE */}

                <div className="right-sidebar">

                    {/* CALENDAR */}

                    <div className="side-card calendar-card">

                        <h3>Post Calendar</h3>

                        <div className="calendar-header">

                            <button onClick={previousMonth}>
                                <ChevronLeft size={15} />
                            </button>

                            <strong>
                                {calendarDate.toLocaleDateString(
                                    "en-US",
                                    {
                                        month: "long",
                                        year: "numeric",
                                    }
                                )}
                            </strong>

                            <button onClick={nextMonth}>
                                <ChevronRight size={15} />
                            </button>

                        </div>

                        <div className="calendar-week">
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

                            {calendarCells.map((day, index) => {
                                const dayPosts = day
                                    ? postsOnDay(day)
                                    : [];

                                return (
                                    <div
                                        key={index}
                                        className={`calendar-day ${dayPosts.length
                                            ? "has-post"
                                            : ""
                                            }`}
                                        onClick={() => {
                                            if (dayPosts.length) {
                                                handleView(dayPosts[0]);
                                            }
                                        }}
                                    >
                                        {day}

                                        {dayPosts.length > 0 && (
                                            <span className="calendar-dot">
                                                {dayPosts.length}
                                            </span>
                                        )}

                                    </div>
                                );
                            })}

                        </div>

                    </div>

                    {/* STATUS OVERVIEW */}

                    <div className="side-card">

                        <h3>Post Status Overview</h3>

                        <div className="status-overview">

                            <div className="donut-chart">
                                <div>
                                    <strong>
                                        {posts.length}
                                    </strong>
                                    <span>Total Posts</span>
                                </div>
                            </div>

                            <div className="status-list">

                                {statusOverview.map((item) => {
                                    const percentage =
                                        posts.length > 0
                                            ? (
                                                (item.count /
                                                    posts.length) *
                                                100
                                            ).toFixed(1)
                                            : "0.0";

                                    return (
                                        <div
                                            className="status-list-item"
                                            key={item.status}
                                        >
                                            <span
                                                className={`status-dot ${statusClass(
                                                    item.status
                                                )}`}
                                            />

                                            <span>
                                                {item.status}
                                            </span>

                                            <strong>
                                                {item.count}
                                            </strong>

                                            <small>
                                                ({percentage}%)
                                            </small>
                                        </div>
                                    );
                                })}

                            </div>

                        </div>

                    </div>

                    {/* TOP PERFORMING */}

                    <div className="side-card">

                        <div className="side-card-heading">
                            <h3>Top Performing Posts</h3>
                        </div>

                        <div className="top-posts">

                            {topPerformingPosts.length === 0 ? (
                                <p className="no-top-posts">
                                    No posts available.
                                </p>
                            ) : (
                                topPerformingPosts.map(
                                    (post, index) => (
                                        <div
                                            className="top-post"
                                            key={post._id}
                                        >

                                            <div className="top-post-image">

                                                {post.image ? (
                                                    <img
                                                        src={getImageUrl(
                                                            post.image
                                                        )}
                                                        alt={post.title}
                                                    />
                                                ) : (
                                                    <FileText size={17} />
                                                )}

                                            </div>

                                            <div className="top-post-info">

                                                <strong>
                                                    {post.title}
                                                </strong>

                                                <span>
                                                    {post.platform} •{" "}
                                                    {formatDate(
                                                        post.scheduledDateTime
                                                    )}
                                                </span>

                                            </div>

                                            <div className="top-post-views">
                                                <Eye size={14} />
                                                {post.engagement?.views ||
                                                    0}
                                            </div>

                                        </div>
                                    )
                                )
                            )}

                        </div>

                        <button className="view-all-btn">
                            View All
                        </button>

                    </div>

                </div>

            </div>

            {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

            {showForm && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowForm(false)}
                >

                    <div
                        className="post-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="modal-header">

                            <div>
                                <h2>
                                    {editingPost
                                        ? "Edit Social Media Post"
                                        : "Create New Post"}
                                </h2>

                                <p>
                                    Add post details and schedule
                                    your social media activity.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowForm(false)}
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="post-form"
                        >

                            <div className="form-grid">

                                <div className="form-group full">
                                    <label>
                                        Post Title *
                                    </label>

                                    <input
                                        type="text"
                                        required
                                        value={form.title}
                                        onChange={(e) =>
                                            handleFormChange(
                                                "title",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter post title"
                                    />
                                </div>

                                <div className="form-group full">
                                    <label>Content</label>

                                    <textarea
                                        value={form.content}
                                        onChange={(e) =>
                                            handleFormChange(
                                                "content",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter post content..."
                                        rows="4"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Platform *</label>

                                    <select
                                        required
                                        value={form.platform}
                                        onChange={(e) =>
                                            handleFormChange(
                                                "platform",
                                                e.target.value
                                            )
                                        }
                                    >
                                        {platforms.map(
                                            (platform) => (
                                                <option
                                                    key={platform}
                                                    value={platform}
                                                >
                                                    {platform}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Campaign</label>

                                    <input
                                        type="text"
                                        value={form.campaign}
                                        onChange={(e) =>
                                            handleFormChange(
                                                "campaign",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Campaign name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Post Type</label>

                                    <select
                                        value={form.postType}
                                        onChange={(e) =>
                                            handleFormChange(
                                                "postType",
                                                e.target.value
                                            )
                                        }
                                    >
                                        {postTypes.map((type) => (
                                            <option
                                                key={type}
                                                value={type}
                                            >
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Status</label>

                                    <select
                                        value={form.status}
                                        onChange={(e) =>
                                            handleFormChange(
                                                "status",
                                                e.target.value
                                            )
                                        }
                                    >
                                        {statuses.map((status) => (
                                            <option
                                                key={status}
                                                value={status}
                                            >
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>
                                        Scheduled Date & Time
                                    </label>

                                    <input
                                        type="datetime-local"
                                        value={
                                            form.scheduledDateTime
                                        }
                                        onChange={(e) =>
                                            handleFormChange(
                                                "scheduledDateTime",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Posted Date & Time
                                    </label>

                                    <input
                                        type="datetime-local"
                                        value={form.postedDateTime}
                                        onChange={(e) =>
                                            handleFormChange(
                                                "postedDateTime",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="form-group full">
                                    <label>
                                        Post / Poster Image
                                    </label>

                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.webp"
                                        onChange={handleImageChange}
                                    />

                                    {selectedImage && (
                                        <small className="selected-file">
                                            {selectedImage.name}
                                        </small>
                                    )}

                                    {!selectedImage &&
                                        editingPost?.image && (
                                            <small className="selected-file">
                                                Existing image will remain
                                                unless a new image is
                                                selected.
                                            </small>
                                        )}
                                </div>

                                <div className="form-section-title full">
                                    Engagement
                                </div>

                                <div className="form-group">
                                    <label>Views</label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={form.engagement.views}
                                        onChange={(e) =>
                                            handleEngagementChange(
                                                "views",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Likes</label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={form.engagement.likes}
                                        onChange={(e) =>
                                            handleEngagementChange(
                                                "likes",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Comments</label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            form.engagement.comments
                                        }
                                        onChange={(e) =>
                                            handleEngagementChange(
                                                "comments",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="paid-campaign-row full">

                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={
                                                form.isPaidCampaign
                                            }
                                            onChange={(e) =>
                                                handleFormChange(
                                                    "isPaidCampaign",
                                                    e.target.checked
                                                )
                                            }
                                        />

                                        Paid Campaign
                                    </label>

                                </div>

                                {form.isPaidCampaign && (
                                    <>
                                        <div className="form-group">
                                            <label>
                                                Campaign Budget
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                value={
                                                    form
                                                        .paidCampaignDetails
                                                        .budget
                                                }
                                                onChange={(e) =>
                                                    handlePaidDetailsChange(
                                                        "budget",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                Campaign Start Date
                                            </label>

                                            <input
                                                type="date"
                                                value={
                                                    form
                                                        .paidCampaignDetails
                                                        .startDate
                                                }
                                                onChange={(e) =>
                                                    handlePaidDetailsChange(
                                                        "startDate",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                Campaign End Date
                                            </label>

                                            <input
                                                type="date"
                                                value={
                                                    form
                                                        .paidCampaignDetails
                                                        .endDate
                                                }
                                                onChange={(e) =>
                                                    handlePaidDetailsChange(
                                                        "endDate",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </>
                                )}

                            </div>

                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() =>
                                        setShowForm(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingPost
                                            ? "Update Post"
                                            : "Create Post"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* =====================================================
          VIEW MODAL
      ===================================================== */}

            {showView && viewPost && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowView(false)}
                >

                    <div
                        className="view-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="modal-header">

                            <div>
                                <h2>{viewPost.title}</h2>

                                <p>
                                    Social Media Post Details
                                </p>
                            </div>

                        </div>

                        <div className="view-content">

                            {viewPost.image && (
                                <div className="view-image">
                                    <img
                                        src={getImageUrl(
                                            viewPost.image
                                        )}
                                        alt={viewPost.title}
                                    />
                                </div>
                            )}

                            <div className="view-grid">

                                <div>
                                    <label>Platform</label>
                                    <strong>
                                        {viewPost.platform}
                                    </strong>
                                </div>

                                <div>
                                    <label>Status</label>
                                    <span
                                        className={`status-badge ${statusClass(
                                            viewPost.status
                                        )}`}
                                    >
                                        {viewPost.status}
                                    </span>
                                </div>

                                <div>
                                    <label>Campaign</label>
                                    <strong>
                                        {viewPost.campaign || "-"}
                                    </strong>
                                </div>

                                <div>
                                    <label>Post Type</label>
                                    <strong>
                                        {viewPost.postType || "-"}
                                    </strong>
                                </div>

                                <div>
                                    <label>
                                        Scheduled Date
                                    </label>
                                    <strong>
                                        {formatDateTime(
                                            viewPost.scheduledDateTime
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <label>Posted Date</label>
                                    <strong>
                                        {formatDateTime(
                                            viewPost.postedDateTime
                                        )}
                                    </strong>
                                </div>

                            </div>

                            <div className="view-description">

                                <label>Content</label>

                                <p>
                                    {viewPost.content || "-"}
                                </p>

                            </div>

                            <div className="view-engagement">

                                <div>
                                    <Eye size={17} />
                                    <span>
                                        {viewPost.engagement?.views ||
                                            0}
                                    </span>
                                    Views
                                </div>

                                <div>
                                    <Heart size={17} />
                                    <span>
                                        {viewPost.engagement?.likes ||
                                            0}
                                    </span>
                                    Likes
                                </div>

                                <div>
                                    <MessageCircle size={17} />
                                    <span>
                                        {viewPost.engagement
                                            ?.comments || 0}
                                    </span>
                                    Comments
                                </div>

                            </div>
                        </div>

                        <div className="view-sm-footer">
                            <button
                                className="view-sm-close-bottom"
                                onClick={() => setShowView(false)}
                            >
                                Close
                            </button>
                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}