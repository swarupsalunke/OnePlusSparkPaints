
import React, { useEffect, useState } from "react";
import {
    UserRound,
    Camera,
    Save,
    RotateCcw,
    Mail,
    Phone,
    MapPin,
    BriefcaseBusiness,
    ShieldCheck,
    CalendarDays,
    AlertCircle,
} from "lucide-react";
import "../../css/salesExecutive/SalesProfileManagement.css";

const API_URL = `${import.meta.env.VITE_API_BASE_URL || "https://oneplussparkpaintsserver.onrender.com"}/api/sales-executive/profile`;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://oneplussparkpaintsserver.onrender.com";

const emptyProfile = {
    name: "",
    userId: "",
    email: "",
    mobile: "",
    profilePicture: "",
    dateOfBirth: "",
    gender: "",
    addressLine1: "",
    addressLine2: "",
    country: "",
    state: "",
    district: "",
    city: "",
    pinCode: "",
    role: "",
    department: "",
    reportingTo: "",
    status: "",
    lastLogin: "",
    createdAt: "",
    emergencyContact: {
        name: "",
        mobile: "",
        relation: "",
    },
};

const getProfileImageUrl = (imagePath) => {
    if (!imagePath) return "";

    if (
        imagePath.startsWith("blob:") ||
        imagePath.startsWith("data:") ||
        imagePath.startsWith("http://") ||
        imagePath.startsWith("https://")
    ) {
        return imagePath;
    }

    return `${API_BASE_URL}/${imagePath.replace(/^\/+/, "")}`;
};

const SalesProfileManagement = () => {
    const [profile, setProfile] = useState(emptyProfile);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [previewImage, setPreviewImage] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);

    const getToken = () =>
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
                throw new Error("Please log in again to access your profile.");
            }

            const response = await fetch(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to load profile.");
            }

            const user = data.profile || {};

            setProfile({
                ...emptyProfile,
                ...user,
                dateOfBirth: user.dateOfBirth
                    ? new Date(user.dateOfBirth).toISOString().slice(0, 10)
                    : "",
                emergencyContact: {
                    ...emptyProfile.emergencyContact,
                    ...(user.kyc?.emergencyContact || {}),
                },
            });

            setPreviewImage(getProfileImageUrl(user.profilePicture || ""));
            setSelectedImage(null);
        } catch (err) {
            setError(err.message || "Unable to load profile.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();

        return () => {
            // Preview URLs are temporary browser URLs.
        };
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setProfile((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };

    const handleEmergencyChange = (event) => {
        const { name, value } = event.target;

        setProfile((previous) => ({
            ...previous,
            emergencyContact: {
                ...previous.emergencyContact,
                [name]: value,
            },
        }));

        setError("");
        setSuccess("");
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image.");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5 MB.");
            event.target.value = "";
            return;
        }

        if (previewImage.startsWith("blob:")) {
            URL.revokeObjectURL(previewImage);
        }

        setSelectedImage(file);
        setPreviewImage(URL.createObjectURL(file));
        setError("");
        setSuccess("");
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!profile.name.trim()) {
            setError("Full name is required.");
            return;
        }

        if (!profile.mobile.trim()) {
            setError("Mobile number is required.");
            return;
        }

        try {
            setSaving(true);

            const token = getToken();

            if (!token) {
                throw new Error("Please log in again.");
            }

            const formData = new FormData();

            formData.append("name", profile.name.trim());
            formData.append("mobile", profile.mobile.trim());
            formData.append("dateOfBirth", profile.dateOfBirth || "");
            formData.append("gender", profile.gender || "");
            formData.append("addressLine1", profile.addressLine1 || "");
            formData.append("addressLine2", profile.addressLine2 || "");
            formData.append("country", profile.country || "");
            formData.append("state", profile.state || "");
            formData.append("district", profile.district || "");
            formData.append("city", profile.city || "");
            formData.append("pinCode", profile.pinCode || "");

            formData.append(
                "emergencyContact",
                JSON.stringify(profile.emergencyContact || {})
            );

            if (selectedImage) {
                formData.append("profilePicture", selectedImage);
            }

            const response = await fetch(API_URL, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to save profile.");
            }

            const updatedUser = data.profile || {};

            setProfile((previous) => ({
                ...previous,
                ...updatedUser,
                dateOfBirth: updatedUser.dateOfBirth
                    ? new Date(updatedUser.dateOfBirth).toISOString().slice(0, 10)
                    : "",
                emergencyContact: {
                    ...previous.emergencyContact,
                    ...(updatedUser.kyc?.emergencyContact || {}),
                },
            }));

            setPreviewImage(
                getProfileImageUrl(updatedUser.profilePicture || "")
            );
            setSelectedImage(null);
            setSuccess("Profile updated successfully.");
        } catch (err) {
            setError(err.message || "Unable to save profile.");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (previewImage.startsWith("blob:")) {
            URL.revokeObjectURL(previewImage);
        }

        setSelectedImage(null);
        fetchProfile();
    };

    const formatDate = (value) => {
        if (!value) return "Not available";

        return new Date(value).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="sales-profile-page">
                <div className="sales-profile-message">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="sales-profile-page">
            <div className="sales-profile-header">
                <div>
                    <h1>Profile Management</h1>
                    <p>View and manage your personal and professional information.</p>
                </div>
            </div>

            {error && (
                <div className="sales-profile-alert error" role="alert">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="sales-profile-alert success" role="status">
                    <ShieldCheck size={18} />
                    <span>{success}</span>
                </div>
            )}

            <form onSubmit={handleSave}>
                <section className="sales-profile-card sales-profile-overview">
                    <div className="sales-profile-avatar">
                        {previewImage ? (
                            <img
                                src={previewImage}
                                alt="Profile"
                                onError={() => {
                                    setPreviewImage("");
                                    setError(
                                        "Profile image could not be loaded. Please check the saved image path and backend uploads folder."
                                    );
                                }}
                            />
                        ) : (
                            <UserRound size={42} />
                        )}

                        <label
                            className="sales-profile-camera"
                            title="Choose profile picture"
                        >
                            <Camera size={17} />
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp"
                                onChange={handleImageChange}
                            />
                        </label>
                    </div>

                    <div className="sales-profile-identity">
                        <h2>{profile.name || "Sales Executive"}</h2>
                        <p>{profile.role || "SALES_EXECUTIVE"}</p>

                        <div className="sales-profile-tags">
                            <span>{profile.userId || "Employee ID unavailable"}</span>
                            <span
                                className={`sales-profile-status ${(profile.status || "").toLowerCase()}`}
                            >
                                {profile.status || "Status unavailable"}
                            </span>
                        </div>

                        <small>
                            {selectedImage
                                ? `${selectedImage.name} selected`
                                : ""}
                        </small>
                    </div>

                    <div className="sales-profile-joined">
                        <CalendarDays size={17} />
                        <div>
                            <span>Joined On</span>
                            <strong>{formatDate(profile.createdAt)}</strong>
                        </div>
                    </div>
                </section>

                <section className="sales-profile-card">
                    <div className="sales-profile-section-heading">
                        <div className="sales-profile-heading-icon">
                            <UserRound size={20} />
                        </div>
                        <div>
                            <h2>Personal Information</h2>
                            <p>Update your basic contact information.</p>
                        </div>
                    </div>

                    <div className="sales-profile-grid">
                        <label className="sales-profile-field">
                            Full Name *
                            <input
                                name="name"
                                value={profile.name}
                                onChange={handleChange}
                                placeholder="Enter full name"
                                required
                            />
                        </label>

                        <label className="sales-profile-field">
                            Employee ID
                            <input value={profile.userId} readOnly />
                        </label>

                        <label className="sales-profile-field">
                            Email Address
                            <div className="sales-profile-input-icon">
                                <Mail size={17} />
                                <input value={profile.email} readOnly />
                            </div>
                        </label>

                        <label className="sales-profile-field">
                            Mobile Number *
                            <div className="sales-profile-input-icon">
                                <Phone size={17} />
                                <input
                                    type="tel"
                                    name="mobile"
                                    value={profile.mobile}
                                    onChange={handleChange}
                                    maxLength={15}
                                    required
                                />
                            </div>
                        </label>

                        <label className="sales-profile-field">
                            Date of Birth
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={profile.dateOfBirth}
                                onChange={handleChange}
                            />
                        </label>

                        <label className="sales-profile-field">
                            Gender
                            <select
                                name="gender"
                                value={profile.gender}
                                onChange={handleChange}
                            >
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </label>
                    </div>
                </section>

                <section className="sales-profile-card">
                    <div className="sales-profile-section-heading">
                        <div className="sales-profile-heading-icon">
                            <MapPin size={20} />
                        </div>
                        <div>
                            <h2>Address Information</h2>
                            <p>Maintain your current residential address.</p>
                        </div>
                    </div>

                    <div className="sales-profile-grid">
                        <label className="sales-profile-field">
                            Address Line 1
                            <input
                                name="addressLine1"
                                value={profile.addressLine1}
                                onChange={handleChange}
                                placeholder="House number, street"
                            />
                        </label>

                        <label className="sales-profile-field">
                            Address Line 2
                            <input
                                name="addressLine2"
                                value={profile.addressLine2}
                                onChange={handleChange}
                                placeholder="Landmark, area"
                            />
                        </label>

                        <label className="sales-profile-field">
                            Country
                            <input name="country" value={profile.country} onChange={handleChange} />
                        </label>

                        <label className="sales-profile-field">
                            State
                            <input name="state" value={profile.state} onChange={handleChange} />
                        </label>

                        <label className="sales-profile-field">
                            District
                            <input name="district" value={profile.district} onChange={handleChange} />
                        </label>

                        <label className="sales-profile-field">
                            City
                            <input name="city" value={profile.city} onChange={handleChange} />
                        </label>

                        <label className="sales-profile-field">
                            PIN Code
                            <input
                                name="pinCode"
                                value={profile.pinCode}
                                onChange={handleChange}
                                maxLength={10}
                            />
                        </label>
                    </div>
                </section>

                <section className="sales-profile-card">
                    <div className="sales-profile-section-heading">
                        <div className="sales-profile-heading-icon">
                            <BriefcaseBusiness size={20} />
                        </div>
                        <div>
                            <h2>Professional Information</h2>
                            <p>Company-assigned information is read-only.</p>
                        </div>
                    </div>

                    <div className="sales-profile-grid">
                        <label className="sales-profile-field">
                            Designation
                            <input value={profile.role} readOnly />
                        </label>

                        <label className="sales-profile-field">
                            Department
                            <input value={profile.department || ""} readOnly />
                        </label>

                        <label className="sales-profile-field">
                            Reporting To
                            <input
                                value={
                                    typeof profile.reportingTo === "object"
                                        ? profile.reportingTo?.name || ""
                                        : profile.reportingTo || ""
                                }
                                readOnly
                            />
                        </label>

                        <label className="sales-profile-field">
                            Account Status
                            <input value={profile.status} readOnly />
                        </label>
                    </div>
                </section>

                <section className="sales-profile-card">
                    <div className="sales-profile-section-heading">
                        <div className="sales-profile-heading-icon">
                            <Phone size={20} />
                        </div>
                        <div>
                            <h2>Emergency Contact</h2>
                            <p>Contact information for emergencies.</p>
                        </div>
                    </div>

                    <div className="sales-profile-grid">
                        <label className="sales-profile-field">
                            Contact Name
                            <input
                                name="name"
                                value={profile.emergencyContact.name}
                                onChange={handleEmergencyChange}
                                placeholder="Enter contact name"
                            />
                        </label>

                        <label className="sales-profile-field">
                            Contact Number
                            <input
                                type="tel"
                                name="mobile"
                                value={profile.emergencyContact.mobile}
                                onChange={handleEmergencyChange}
                                placeholder="Enter contact number"
                                maxLength={15}
                            />
                        </label>

                        <label className="sales-profile-field">
                            Relationship
                            <input
                                name="relation"
                                value={profile.emergencyContact.relation}
                                onChange={handleEmergencyChange}
                                placeholder="e.g. Parent, Spouse"
                            />
                        </label>
                    </div>
                </section>

                <div className="sales-profile-actions">
                    <button
                        type="button"
                        className="sales-profile-reset-btn"
                        onClick={handleReset}
                        disabled={saving}
                    >
                        <RotateCcw size={17} />
                        Reset
                    </button>

                    <button
                        type="submit"
                        className="sales-profile-save-btn"
                        disabled={saving}
                    >
                        <Save size={17} />
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>

            <div className="sales-profile-card sales-profile-security-note">
                <ShieldCheck size={20} />
                <div>
                    <h3>Account Security</h3>
                    <p>
                        Your login credentials, role and employee ID cannot be
                        changed from this form.
                    </p>
                    <span>Last Login: {formatDate(profile.lastLogin)}</span>
                </div>
            </div>
        </div>
    );
};

export default SalesProfileManagement;
