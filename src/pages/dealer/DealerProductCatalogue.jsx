import React, { useEffect, useState } from "react";
import {
    Search,
    Package,
    Eye,
    X,
    Palette,
    RefreshCw,
} from "lucide-react";
import "../../css/dealer/DealerProductCatalogue.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const SERVER_URL = API_BASE_URL || "https://oneplussparkpaintsserver.onrender.com";

const getImageUrl = (image) => {
    if (!image) return "";

    if (image.startsWith("http://") || image.startsWith("https://")) {
        return image;
    }

    return `${SERVER_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};

const DealerProductCatalogue = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubCategory, setSelectedSubCategory] = useState("");

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showShadeCard, setShowShadeCard] = useState(false);

    // Fixed categories
    const categories = [
        "Raw Material",
        "Packing Material",
        "Emulsion",
        "Primer",
        "Putty",
        "Enamel",
        "Texture",
        "Wood Finish",
        "Waterproofing",
        "Accessories",
        "Work in Progress",
    ];

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_BASE_URL}/api/products?status=ACTIVE`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch products"
                );
            }

            setProducts(data.products || data.data || []);
        } catch (error) {
            console.error("Fetch products error:", error);
            setError(error.message);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Sub categories based on selected category
    const subCategories = [
        ...new Set(
            products
                .filter(
                    (product) =>
                        selectedCategory &&
                        product.category === selectedCategory
                )
                .map((product) => product.subCategory)
                .filter(Boolean)
        ),
    ];

    // Check whether user has started searching/filtering
    const hasSearchOrCategory =
        searchTerm.trim() !== "" || selectedCategory !== "";

    // Filter products only after user searches/selects category
    const filteredProducts = products.filter((product) => {
        const search = searchTerm.toLowerCase().trim();

        const matchesSearch =
            !search ||
            product.productName?.toLowerCase().includes(search) ||
            product.sku?.toLowerCase().includes(search) ||
            product.barcode?.toLowerCase().includes(search);

        const matchesCategory =
            !selectedCategory ||
            product.category === selectedCategory;

        const matchesSubCategory =
            !selectedSubCategory ||
            product.subCategory === selectedSubCategory;

        return (
            matchesSearch &&
            matchesCategory &&
            matchesSubCategory
        );
    });

    const formatPrice = (price) => {
        if (
            price === undefined ||
            price === null ||
            price === ""
        ) {
            return "-";
        }

        return `₹${Number(price).toLocaleString("en-IN")}`;
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setSelectedSubCategory("");
    };

    const handleReset = () => {
        setSearchTerm("");
        setSelectedCategory("");
        setSelectedSubCategory("");
    };

    return (
        <div className="dealer-product-catalogue-page">
            <div className="dealer-product-catalogue-header">
                <div>
                    <h1>Product Catalogue</h1>
                    <p>
                        Explore our available products and product details.
                    </p>
                </div>

                <button
                    type="button"
                    className="dealer-product-catalogue-refresh-btn"
                    onClick={fetchProducts}
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </div>

            <div className="dealer-product-catalogue-filter-card">
                <div className="dealer-product-search-box">
                    <Search size={17} />

                    <input
                        type="text"
                        placeholder="Search product, SKU or barcode..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(e.target.value)
                        }
                    />
                </div>

                <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className="dealer-product-filter-select"
                >
                    <option value="">Select Category</option>

                    {categories.map((category) => (
                        <option
                            key={category}
                            value={category}
                        >
                            {category}
                        </option>
                    ))}
                </select>

                {/* <select
                    value={selectedSubCategory}
                    onChange={(e) =>
                        setSelectedSubCategory(e.target.value)
                    }
                    className="dealer-product-filter-select"
                    disabled={!selectedCategory}
                >
                    <option value="">
                        Select Sub Category
                    </option>

                    {subCategories.map((subCategory) => (
                        <option
                            key={subCategory}
                            value={subCategory}
                        >
                            {subCategory}
                        </option>
                    ))}
                </select> */}

                <button
                    type="button"
                    className="dealer-product-shade-btn"
                    onClick={() => setShowShadeCard(true)}
                >
                    <Palette size={17} />
                    Shade Card
                </button>

                {(searchTerm ||
                    selectedCategory ||
                    selectedSubCategory) && (
                        <button
                            type="button"
                            className="dealer-product-reset-btn"
                            onClick={handleReset}
                        >
                            Reset
                        </button>
                    )}
            </div>

            {/* Loading */}
            {loading && (
                <div className="dealer-product-catalogue-state">
                    <RefreshCw
                        size={30}
                        className="dealer-product-spinner"
                    />
                    <p>Loading products...</p>
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="dealer-product-catalogue-state dealer-product-error-state">
                    <Package size={40} />

                    <h3>Unable to Load Products</h3>

                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={fetchProducts}
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Initial State */}
            {!loading &&
                !error &&
                !hasSearchOrCategory && (
                    <div className="dealer-product-catalogue-state">
                        <Search size={42} />

                        <h3>
                            Please Select a Category or Search Item
                        </h3>

                        <p>
                            Select a category or search for a product
                            to view available products.
                        </p>
                    </div>
                )}

            {/* No Products */}
            {!loading &&
                !error &&
                hasSearchOrCategory &&
                filteredProducts.length === 0 && (
                    <div className="dealer-product-catalogue-state">
                        <Package size={42} />

                        <h3>No Products Found</h3>

                        <p>
                            No products are available for the selected
                            category or search.
                        </p>
                    </div>
                )}

            {/* Products */}
            {!loading &&
                !error &&
                hasSearchOrCategory &&
                filteredProducts.length > 0 && (
                    <div className="dealer-product-catalogue-grid">
                        {filteredProducts.map((product) => (
                            <div
                                className="dealer-product-catalogue-card"
                                key={product._id}
                            >
                                <div className="dealer-product-catalogue-image">
                                    {product.image ? (
                                        <img
                                            src={getImageUrl(
                                                product.image
                                            )}
                                            alt={
                                                product.productName
                                            }
                                        />
                                    ) : (
                                        <div className="dealer-product-image-placeholder">
                                            <Package size={42} />
                                            <span>No Image</span>
                                        </div>
                                    )}
                                </div>

                                <div className="dealer-product-catalogue-content">
                                    <span className="dealer-product-category">
                                        {product.category ||
                                            "Product"}
                                    </span>

                                    <h2>
                                        {product.productName}
                                    </h2>

                                    <p className="dealer-product-sku">
                                        SKU: {product.sku || "-"}
                                    </p>

                                    <div className="dealer-product-info-row">
                                        <div>
                                            <small>Brand</small>
                                            <strong>
                                                {product.brand ||
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <small>Packing</small>
                                            <strong>
                                                {product.packingSize ||
                                                    "-"}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="dealer-product-price-row">
                                        <div>
                                            <small>MRP</small>
                                            <strong>
                                                {formatPrice(
                                                    product.mrp
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <small>
                                                Dealer Price
                                            </small>
                                            <strong>
                                                {formatPrice(
                                                    product.discountPrice
                                                )}
                                            </strong>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="dealer-product-view-btn"
                                        onClick={() =>
                                            setSelectedProduct(
                                                product
                                            )
                                        }
                                    >
                                        <Eye size={17} />
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            {/* Product Details Modal */}
            {selectedProduct && (
                <div
                    className="dealer-product-modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setSelectedProduct(null);
                        }
                    }}
                >
                    <div className="dealer-product-modal">
                        <div className="dealer-product-modal-header">
                            <div>
                                <h2>Product Details</h2>
                                <span>
                                    {selectedProduct.productName}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedProduct(null)
                                }
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="dealer-product-modal-body">
                            <div className="dealer-product-modal-image">
                                {selectedProduct.image ? (
                                    <img
                                        src={getImageUrl(
                                            selectedProduct.image
                                        )}
                                        alt={
                                            selectedProduct.productName
                                        }
                                    />
                                ) : (
                                    <div className="dealer-product-modal-no-image">
                                        <Package size={50} />
                                        <span>
                                            No Image Available
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="dealer-product-details-grid">
                                <div>
                                    <span>Product Name</span>
                                    <strong>
                                        {selectedProduct.productName ||
                                            "-"}
                                    </strong>
                                </div>

                                <div>
                                    <span>SKU</span>
                                    <strong>
                                        {selectedProduct.sku || "-"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Barcode</span>
                                    <strong>
                                        {selectedProduct.barcode ||
                                            "-"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Category</span>
                                    <strong>
                                        {selectedProduct.category ||
                                            "-"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Sub Category</span>
                                    <strong>
                                        {selectedProduct.subCategory ||
                                            "-"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Group</span>
                                    <strong>
                                        {selectedProduct.group ||
                                            "-"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Brand</span>
                                    <strong>
                                        {selectedProduct.brand ||
                                            "-"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Packing Size</span>
                                    <strong>
                                        {selectedProduct.packingSize ||
                                            "-"}
                                    </strong>
                                </div>

                                <div>
                                    <span>MRP</span>
                                    <strong>
                                        {formatPrice(
                                            selectedProduct.mrp
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>Dealer Price</span>
                                    <strong>
                                        {formatPrice(
                                            selectedProduct.discountPrice
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>Stock Quantity</span>
                                    <strong>
                                        {selectedProduct.stockQuantity ??
                                            0}
                                    </strong>
                                </div>

                                <div>
                                    <span>Status</span>
                                    <strong>
                                        {selectedProduct.status ||
                                            "-"}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        <div className="dealer-product-modal-footer">
                            <button
                                type="button"
                                className="dealer-product-modal-close-btn"
                                onClick={() =>
                                    setSelectedProduct(null)
                                }
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Shade Card Modal */}
            {showShadeCard && (
                <div
                    className="dealer-shade-modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowShadeCard(false);
                        }
                    }}
                >
                    <div className="dealer-shade-modal">
                        <div className="dealer-shade-modal-header">
                            <div>
                                <h2>Shade Card</h2>
                                <span>Available shades</span>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowShadeCard(false)
                                }
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="dealer-shade-empty">
                            <Palette size={42} />

                            <h3>No Shade Data Found</h3>

                            <p>
                                Shade card data is not available yet.
                            </p>
                        </div>

                        <div className="dealer-shade-modal-footer">
                            <button
                                type="button"
                                onClick={() =>
                                    setShowShadeCard(false)
                                }
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DealerProductCatalogue;