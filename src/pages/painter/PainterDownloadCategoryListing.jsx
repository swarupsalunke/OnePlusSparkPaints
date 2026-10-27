import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    FileText,
    Palette,
    FileSpreadsheet,
    BookOpen,
    ShieldCheck,
    Megaphone,
    Download,
    Search,
} from "lucide-react";
import { toast } from "sonner";

import "../../css/painter/PainterDownloadCategoryListing.css";

const API_URL = "https://oneplussparkpaintsserver.onrender.com/api/painter/documents/categories";

const CATEGORY_ICONS = {
    BROCHURE: BookOpen,
    COLOUR_PALETTE: Palette,
    PRICE_LIST: FileSpreadsheet,
    PRODUCT_CATALOGUE: FileText,
    TECHNICAL_DATA_SHEET: FileText,
    SAFETY_DATA_SHEET: ShieldCheck,
    WARRANTY: ShieldCheck,
    APPLICATION_GUIDE: BookOpen,
    MARKETING_MATERIALS: Megaphone,
};

const CATEGORY_LABELS = {
    BROCHURE: "Product Brochure",
    COLOUR_PALETTE: "Colour Palette",
    PRICE_LIST: "Price List",
    PRODUCT_CATALOGUE: "Product Catalogue",
    TECHNICAL_DATA_SHEET: "Technical Data Sheet",
    SAFETY_DATA_SHEET: "Safety Data Sheet",
    WARRANTY: "Warranty",
    APPLICATION_GUIDE: "Application Guide",
    MARKETING_MATERIALS: "Marketing Material",
};

const PainterDownloadCategoryListing = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchCategories = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const response = await axios.get(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data?.success) {
                setCategories(response.data.categories || []);
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error(
                "Fetch painter document categories error:",
                error
            );

            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDownload = async (document) => {
        if (!document?._id) return;

        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(
                `https://oneplussparkpaintsserver.onrender.com/api/documents/${document._id}/download`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    responseType: "blob",
                }
            );

            const blob = new Blob([response.data]);

            const url = window.URL.createObjectURL(blob);

            const link = window.document.createElement("a");

            link.href = url;
            link.download =
                document.fileName ||
                document.documentName ||
                "document";

            window.document.body.appendChild(link);

            link.click();

            window.document.body.removeChild(link);

            window.URL.revokeObjectURL(url);

            await fetchCategories();
        } catch (error) {
            console.error("Download document error:", error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to download document."
            );
        }
    };

    const filteredCategories = categories.filter((category) =>
        category.label
            ?.toLowerCase()
            .includes(search.toLowerCase())
    );

    const allCategories = Object.keys(CATEGORY_LABELS).map(
        (categoryValue) => {
            const existingCategory = categories.find(
                (item) => item.value === categoryValue
            );

            return {
                value: categoryValue,
                label:
                    existingCategory?.label ||
                    CATEGORY_LABELS[categoryValue],
                documents: existingCategory?.documents || [],
            };
        }
    );

    const searchedCategories = allCategories.filter((category) =>
        category.label
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div className="painter-download-category-page">
            <div className="painter-download-category-header">
                <div>
                    <h1>Download Centre</h1>

                    <p>
                        Access product documents and resources
                    </p>
                </div>
            </div>

            <div className="painter-download-category-search">
                <Search size={18} />

                <input
                    type="text"
                    placeholder="Search document categories..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="painter-download-category-loading">
                    Loading categories...
                </div>
            ) : (
                <div className="painter-download-category-grid">
                    {searchedCategories.map((category) => {
                        const Icon =
                            CATEGORY_ICONS[category.value] ||
                            FileText;

                        return (
                            <div
                                className="painter-download-category-card"
                                key={category.value}
                            >
                                <div className="painter-download-category-icon">
                                    <Icon size={25} />
                                </div>

                                <div className="painter-download-category-content">
                                    <h3>{category.label}</h3>

                                    <p>
                                        {category.documents.length}{" "}
                                        {category.documents.length === 1
                                            ? "document"
                                            : "documents"}{" "}
                                        available
                                    </p>
                                </div>

                                {category.documents.length > 0 && (
                                    <div className="painter-download-category-documents">
                                        {category.documents.map(
                                            (document) => (
                                                <div
                                                    className="painter-download-category-document"
                                                    key={document._id}
                                                >
                                                    <div>
                                                        <strong>
                                                            {
                                                                document.documentName
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                document.fileType
                                                            }
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        title="Download"
                                                        onClick={() =>
                                                            handleDownload(
                                                                document
                                                            )
                                                        }
                                                    >
                                                        <Download
                                                            size={16}
                                                        />
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading &&
                searchedCategories.length === 0 && (
                    <div className="painter-download-category-empty">
                        No document categories found.
                    </div>
                )}
        </div>
    );
};

export default PainterDownloadCategoryListing;