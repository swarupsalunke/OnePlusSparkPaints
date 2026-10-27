import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import "../../css/painter/PainterSubmitFeedback.css";

const PainterSubmitFeedback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const fileInputRef = useRef(null);

    const typeFromUrl = searchParams.get("type");

    const initialFeedbackType = [
        "PRODUCT_FEEDBACK",
        "SUGGESTION",
        "COMPLAINT",
        "SERVICE_FEEDBACK",
    ].includes(typeFromUrl)
        ? typeFromUrl
        : "PRODUCT_FEEDBACK";

    const [feedbackType, setFeedbackType] = useState(
        initialFeedbackType
    );

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const handleAttachmentChange = (e) => {
        const files = Array.from(e.target.files || []);

        if (files.length === 0) return;

        const validFiles = files.filter((file) => {
            const extension = file.name
                .split(".")
                .pop()
                .toLowerCase();

            return [
                "jpg",
                "jpeg",
                "png",
                "webp",
                "mp4",
                "mov",
            ].includes(extension);
        });

        if (validFiles.length !== files.length) {
            toast.error(
                "Only JPG, JPEG, PNG, WEBP, MP4 and MOV files are allowed."
            );
        }

        const oversizedFiles = validFiles.filter(
            (file) => file.size > 50 * 1024 * 1024
        );

        if (oversizedFiles.length > 0) {
            toast.error("Each attachment must be less than 50 MB.");
        }

        const finalFiles = validFiles.filter(
            (file) => file.size <= 50 * 1024 * 1024
        );

        setAttachments((prev) => {
            const combined = [...prev, ...finalFiles];

            if (combined.length > 10) {
                toast.error("Maximum 10 attachments can be uploaded.");
                return combined.slice(0, 10);
            }

            return combined;
        });

        e.target.value = "";
    };

    const handleSubmit = async () => {
        if (!feedbackType) {
            toast.error("Please select feedback type.");
            return;
        }

        if (!title.trim()) {
            toast.error("Please enter title.");
            return;
        }

        try {
            setSubmitting(true);

            const token = localStorage.getItem("token");

            if (!token) {
                toast.error("Please login again.");
                return;
            }

            const formData = new FormData();

            formData.append("feedbackType", feedbackType);
            formData.append("title", title.trim());
            formData.append("description", description.trim());

            attachments.forEach((file) => {
                formData.append("attachments", file);
            });

            const response = await fetch(
                "https://oneplussparkpaintsserver.onrender.com/api/painter/feedback",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to submit feedback."
                );
            }

            toast.success("Feedback submitted successfully.");

            setTitle("");
            setDescription("");
            setAttachments([]);

            navigate("/painter/voice-of-painter");
        } catch (error) {
            console.error("Submit Feedback Error:", error);

            toast.error(
                error.message || "Failed to submit feedback."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const getAttachmentText = () => {
        if (attachments.length === 0) {
            return "No attachments selected";
        }

        const imageCount = attachments.filter((file) =>
            file.type.startsWith("image/")
        ).length;

        const videoCount = attachments.filter((file) =>
            file.type.startsWith("video/")
        ).length;

        const parts = [];

        if (imageCount > 0) {
            parts.push(
                `${imageCount} image${
                    imageCount > 1 ? "s" : ""
                }`
            );
        }

        if (videoCount > 0) {
            parts.push(
                `${videoCount} video${
                    videoCount > 1 ? "s" : ""
                }`
            );
        }

        return parts.join(" • ");
    };

    return (
        <div className="painter-submit-feedback-page">
            <div className="painter-submit-feedback-header">
                <h1>Submit Feedback</h1>

                <p>
                    Painter App
                    <span>/</span>
                    Voice of Painter
                    <span>/</span>
                    Submit Feedback
                </p>
            </div>

            <div className="painter-submit-feedback-content">
                <p className="painter-submit-feedback-subtitle">
                    Oneplus Spark PAINTS • Painter experience
                </p>

                <div className="painter-submit-feedback-card">
                    <h2>Submit Feedback</h2>

                    <div className="painter-submit-feedback-field">
                        <label>
                            Feedback Type <span>*</span>
                        </label>

                        <select
                            value={feedbackType}
                            onChange={(e) =>
                                setFeedbackType(e.target.value)
                            }
                        >
                            <option value="PRODUCT_FEEDBACK">
                                Product Feedback
                            </option>

                            <option value="SUGGESTION">
                                Suggestion
                            </option>

                            <option value="COMPLAINT">
                                Complaint
                            </option>

                            <option value="SERVICE_FEEDBACK">
                                Service Feedback
                            </option>
                        </select>
                    </div>

                    <div className="painter-submit-feedback-field">
                        <label>
                            Title <span>*</span>
                        </label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) =>
                                setTitle(e.target.value)
                            }
                            placeholder="Enter feedback title"
                        />
                    </div>

                    <div className="painter-submit-feedback-field">
                        <label>Description</label>

                        <textarea
                            value={description}
                            onChange={(e) =>
                                setDescription(e.target.value)
                            }
                            placeholder="Optional details..."
                            rows="3"
                        />
                    </div>

                    <div className="painter-submit-feedback-field">
                        <label>Attachments</label>

                        <div
                            className="painter-submit-feedback-attachment-box"
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                        >
                            <Upload size={17} />

                            <span>
                                {getAttachmentText()}
                            </span>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            hidden
                            multiple
                            accept=".jpg,.jpeg,.png,.webp,.mp4,.mov,image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                            onChange={handleAttachmentChange}
                        />

                        {attachments.length > 0 && (
                            <div className="painter-submit-feedback-file-list">
                                {attachments.map(
                                    (file, index) => (
                                        <div
                                            key={`${file.name}-${index}`}
                                            className="painter-submit-feedback-file-item"
                                        >
                                            <span>
                                                {file.name}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setAttachments(
                                                        (prev) =>
                                                            prev.filter(
                                                                (_, i) =>
                                                                    i !==
                                                                    index
                                                            )
                                                    )
                                                }
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        className="painter-submit-feedback-btn"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting
                            ? "Submitting..."
                            : "Submit Feedback"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PainterSubmitFeedback;