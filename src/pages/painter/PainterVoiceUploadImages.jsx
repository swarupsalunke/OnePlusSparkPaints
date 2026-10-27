import React, { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import "../../css/painter/PainterVoiceUploadImages.css";

const PainterVoiceUploadImages = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [title, setTitle] = useState("Site completion images");
    const [images, setImages] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleImageSelect = (files) => {
        if (!files || files.length === 0) return;

        const selectedFiles = Array.from(files);

        const validImages = [];
        const invalidFiles = [];

        selectedFiles.forEach((file) => {
            const extension = file.name
                .split(".")
                .pop()
                .toLowerCase();

            if (
                !["jpg", "jpeg", "png", "webp"].includes(extension)
            ) {
                invalidFiles.push(
                    `${file.name} - unsupported format`
                );
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                invalidFiles.push(
                    `${file.name} - exceeds 10 MB`
                );
                return;
            }

            validImages.push(file);
        });

        if (invalidFiles.length > 0) {
            toast.error(
                `Some images were not added:\n\n${invalidFiles.join(
                    "\n"
                )}`
            );
        }

        setImages((prev) => {
            const combined = [...prev, ...validImages];

            if (combined.length > 10) {
                toast.error("Maximum 10 images can be uploaded.");
                return combined.slice(0, 10);
            }

            return combined;
        });
    };

    const handleFileChange = (e) => {
        handleImageSelect(e.target.files);
        e.target.value = "";
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);

        handleImageSelect(e.dataTransfer.files);
    };

    const removeImage = (index) => {
        setImages((prev) =>
            prev.filter((_, i) => i !== index)
        );
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.error("Please enter image title.");
            return;
        }

        if (images.length === 0) {
            toast.error("Please choose at least one image.");
            return;
        }

        try {
            setUploading(true);

            const token = localStorage.getItem("token");

            const formData = new FormData();

            formData.append("title", title.trim());

            images.forEach((image) => {
                formData.append("images", image);
            });

            const response = await fetch(
                "https://oneplussparkpaintsserver.onrender.com/api/painter/voice-images",
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
                    data.message ||
                    "Failed to upload images."
                );
            }

            toast.success("Images uploaded successfully.");

            setImages([]);
            setTitle("Site completion images");

            navigate("/painter/voice-of-painter");
        } catch (error) {
            console.error(
                "Painter voice images upload error:",
                error
            );

            toast.error(
                error.message ||
                "Failed to upload images."
            );
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="painter-voice-upload-images-page">
            <div className="painter-voice-upload-images-header">
                <h1>Upload Images</h1>

                <p>
                    Painter App
                    <span>/</span>
                    Voice of Painter
                    <span>/</span>
                    Upload Images
                </p>
            </div>

            <div className="painter-voice-upload-images-content">
                <p className="painter-voice-upload-images-subtitle">
                    Oneplus Spark PAINTS • Painter experience
                </p>

                <div className="painter-voice-upload-images-card">
                    <h2>Upload Images</h2>

                    <div
                        className={`painter-voice-images-dropzone ${
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
                            Drag & drop images here
                        </strong>

                        <span>
                            JPG / JPEG / PNG / WEBP • Max 10 MB
                            per image
                        </span>

                        <small>
                            Maximum 10 images
                        </small>
                    </div>

                    {images.length > 0 && (
                        <div className="painter-voice-image-preview-grid">
                            {images.map((image, index) => (
                                <div
                                    className="painter-voice-image-preview-item"
                                    key={`${image.name}-${index}`}
                                >
                                    <img
                                        src={URL.createObjectURL(
                                            image
                                        )}
                                        alt={image.name}
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeImage(index)
                                        }
                                        title="Remove image"
                                    >
                                        <X size={14} />
                                    </button>

                                    <span>
                                        {image.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="painter-voice-images-title-field">
                        <label>
                            Title <span>*</span>
                        </label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) =>
                                setTitle(e.target.value)
                            }
                            placeholder="Enter image title"
                        />
                    </div>

                    <div className="painter-voice-images-actions">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                            multiple
                            hidden
                            onChange={handleFileChange}
                        />

                        <button
                            type="button"
                            className="painter-voice-choose-images-btn"
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                        >
                            <Upload size={15} />
                            Choose Images
                        </button>

                        <button
                            type="button"
                            className="painter-voice-submit-images-btn"
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

export default PainterVoiceUploadImages;