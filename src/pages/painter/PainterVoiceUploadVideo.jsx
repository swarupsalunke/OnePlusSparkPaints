import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import "../../css/painter/PainterVoiceUploadVideo.css";

const PainterVoiceUploadVideo = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [title, setTitle] = useState("Site completion video");
    const [video, setVideo] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleVideoSelect = (file) => {
        if (!file) return;

        const extension = file.name
            .split(".")
            .pop()
            .toLowerCase();

        if (!["mp4", "mov"].includes(extension)) {
            toast.error("Only MP4 and MOV videos are allowed.");
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            toast.error("Video size must be 50 MB or less.");
            return;
        }

        setVideo(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];

        handleVideoSelect(file);

        e.target.value = "";
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];

        handleVideoSelect(file);
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.error("Please enter video title.");
            return;
        }

        if (!video) {
            toast.error("Please choose a video.");
            return;
        }

        try {
            setUploading(true);

            const token = localStorage.getItem("token");

            const formData = new FormData();

            formData.append("title", title.trim());
            formData.append("video", video);

            const response = await fetch(
                "https://oneplussparkpaintsserver.onrender.com/api/painter/voice-video",
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
                    data.message || "Failed to upload video."
                );
            }

            toast.success("Video uploaded successfully.");

            setVideo(null);
            setTitle("Site completion video");

            navigate("/painter/voice-of-painter");
        } catch (error) {
            console.error(
                "Painter voice video upload error:",
                error
            );

            toast.error(
                error.message || "Failed to upload video."
            );
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="painter-voice-upload-video-page">
            <div className="painter-voice-upload-video-header">
                <h1>Upload Video</h1>

                <p>
                    Painter App
                    <span>/</span>
                    Voice of Painter
                    <span>/</span>
                    Upload Video
                </p>
            </div>

            <div className="painter-voice-upload-video-content">
                <p className="painter-voice-upload-video-subtitle">
                    Oneplus Spark PAINTS • Painter experience
                </p>

                <div className="painter-voice-upload-video-card">
                    <h2>Upload Video</h2>

                    <div
                        className={`painter-voice-video-dropzone ${
                            dragActive ? "drag-active" : ""
                        }`}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragActive(true);
                        }}
                        onDragLeave={() =>
                            setDragActive(false)
                        }
                        onDrop={handleDrop}
                    >
                        <Upload size={20} />

                        <strong>
                            {video
                                ? video.name
                                : "Drag & drop video here"}
                        </strong>

                        <span>
                            MP4 / MOV • Max 50 MB
                        </span>
                    </div>

                    <div className="painter-voice-video-title-field">
                        <label>
                            Title <span>*</span>
                        </label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) =>
                                setTitle(e.target.value)
                            }
                            placeholder="Enter video title"
                        />
                    </div>

                    <div className="painter-voice-video-actions">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".mp4,.mov,video/mp4,video/quicktime"
                            hidden
                            onChange={handleFileChange}
                        />

                        <button
                            type="button"
                            className="painter-voice-choose-video-btn"
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                        >
                            <Upload size={15} />
                            Choose Video
                        </button>

                        <button
                            type="button"
                            className="painter-voice-submit-video-btn"
                            onClick={handleSubmit}
                            disabled={uploading}
                        >
                            {uploading
                                ? "Uploading..."
                                : "Upload & Submit"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PainterVoiceUploadVideo;