import { useEffect, useState } from "react";
import axios from "axios";
import {
    Eye,
    Pencil,
    Trash2,
    MoreVertical,
    Package,
    PackageCheck,
    PackageX,
    AlertTriangle,
    PackageMinus,
    Filter,
    ChevronRight,
    Upload,
    Download,
    Search,
    ChevronLeft,
} from "lucide-react";
import "../../css/superadmin/productmanagement.css";


const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState({
        totalProducts: 0,
        activeProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        inactiveProducts: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [topConsumedItems, setTopConsumedItems] = useState([]);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    const [editingProduct, setEditingProduct] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editLoading, setEditLoading] = useState(false);

    const [showAddModal, setShowAddModal] = useState(false);
    const [addLoading, setAddLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubCategory, setSelectedSubCategory] = useState("");
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [newProduct, setNewProduct] = useState({
        productName: "",
        sku: "",
        barcode: "",
        category: "",
        group: "",
        brand: "",
        packingSize: "",
        mrp: "",
        discountPrice: "",
        stockQuantity: "",
        status: "ACTIVE",
    });
    const [newProductImage, setNewProductImage] = useState(null);
    const [newProductImagePreview, setNewProductImagePreview] = useState(null);

    const [editProductImage, setEditProductImage] = useState(null);
    const [editProductImagePreview, setEditProductImagePreview] = useState(null);

    const API_URL = "https://oneplussparkpaintsserver.onrender.com/api/products";
    const SERVER_URL = "https://oneplussparkpaintsserver.onrender.com";

    //     =
    // FETCH PRODUCTS
    //     =

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setProducts(response.data.products || []);
        } catch (error) {
            console.error("Fetch products error:", error);
            setError("Failed to load products");
        }
    };

    //     =
    // FETCH PRODUCT STATS
    //     =

    const fetchProductStats = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(`${API_URL}/stats`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setStats(
                response.data.stats || {
                    totalProducts: 0,
                    activeProducts: 0,
                    lowStockProducts: 0,
                    outOfStockProducts: 0,
                    inactiveProducts: 0,
                }
            );
        } catch (error) {
            console.error("Fetch product stats error:", error);
        }
    };

    const handleViewProduct = async (id) => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(`${API_URL}/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setSelectedProduct(response.data.product);
            setShowViewModal(true);
        } catch (error) {
            console.error("View product error:", error);
        }
    };

    const handleEditProduct = async (id) => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(`${API_URL}/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setEditingProduct(response.data.product);
            setEditProductImage(null);
            setEditProductImagePreview(null);
            setShowEditModal(true);
        } catch (error) {
            console.error("Edit product fetch error:", error);
        }
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();

        try {
            setEditLoading(true);

            const token = localStorage.getItem("token");

            const formData = new FormData();

            // Add product fields
            Object.entries(editingProduct).forEach(([key, value]) => {
                if (key !== 'image' && value !== null && value !== undefined) {
                    formData.append(key, value);
                }
            });

            // Add new image if selected
            if (editProductImage) {
                formData.append("image", editProductImage);
            }

            await axios.put(
                `${API_URL}/${editingProduct._id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            setShowEditModal(false);
            setEditingProduct(null);
            setEditProductImage(null);
            setEditProductImagePreview(null);

            await fetchProducts();
            await fetchProductStats();

        } catch (error) {
            console.error("Update product error:", error);
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("token");

            await axios.delete(`${API_URL}/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Refresh product list
            await fetchProducts();

            // Refresh stats
            await fetchProductStats();

        } catch (error) {
            console.error("Delete product error:", error);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();

        try {
            setAddLoading(true);

            const token = localStorage.getItem("token");

            const formData = new FormData();

            Object.entries(newProduct).forEach(
                ([key, value]) => {
                    formData.append(key, value);
                }
            );

            if (newProductImage) {
                formData.append(
                    "image",
                    newProductImage
                );
            }

            await axios.post(
                API_URL,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            setShowAddModal(false);

            setNewProduct({
                productName: "",
                sku: "",
                barcode: "",
                category: "",
                group: "",
                brand: "",
                packingSize: "",
                mrp: "",
                discountPrice: "",
                stockQuantity: "",
                status: "ACTIVE",
            });

            setNewProductImage(null);
            setNewProductImagePreview(null);

            await fetchProducts();
            await fetchProductStats();

        } catch (error) {
            console.error(
                "Add product error:",
                error
            );
        } finally {
            setAddLoading(false);
        }
    };

    const handleNewProductImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewProductImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewProductImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditProductImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditProductImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditProductImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

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

        const matchesBrand =
            !selectedBrand ||
            product.brand === selectedBrand;

        const matchesStatus =
            !selectedStatus ||
            product.status === selectedStatus;

        return (
            matchesSearch &&
            matchesCategory &&
            matchesSubCategory &&
            matchesBrand &&
            matchesStatus
        );
    });

    const totalPages = Math.ceil(
        filteredProducts.length / itemsPerPage
    );

    const startIndex = (currentPage - 1) * itemsPerPage;

    const endIndex = startIndex + itemsPerPage;

    const paginatedProducts = filteredProducts.slice(
        startIndex,
        endIndex
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [
        searchTerm,
        selectedCategory,
        selectedSubCategory,
        selectedBrand,
        selectedStatus
    ]);
    //     =
    // INITIAL LOAD
    //     =

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            await Promise.all([
                fetchProducts(),
                fetchProductStats(),
            ]);

            setLoading(false);
        };

        loadData();
    }, []);

    return (
        <div className="product-management-page">

            {/* PAGE HEADER */}
            <div className="product-page-header">
                <div>
                    <h2>Product Management</h2>
                    <div className="users-breadcrumb">
                        Dashboard
                        <span>›</span>
                        Product Management
                    </div>
                </div>

                <div className="product-header-actions">
                    <button className="users-secondary-btn">
                        <Upload size={16} />
                        Import
                    </button>

                    <button className="users-secondary-btn">
                        <Download size={16} />
                        Export
                    </button>


                    <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                    >
                        + Add Product
                    </button>
                </div>
            </div>


            {/* =============== PRODUCT STATS================= */}

            <div className="product-stats-grid">

                {/* Total Products */}
                <div className="product-stat-card">
                    <div className="product-stat-icon total-products-icon">
                        <Package size={22} />
                    </div>

                    <span>Total Products</span>

                    <strong>{stats.totalProducts}</strong>

                    <small>All registered products</small>
                </div>


                {/* Active Products */}
                <div className="product-stat-card">
                    <div className="product-stat-icon active-products-icon">
                        <PackageCheck size={22} />
                    </div>

                    <span>Active Products</span>

                    <strong>{stats.activeProducts}</strong>

                    <small>Currently active</small>
                </div>


                {/* Low Stock */}
                <div className="product-stat-card">
                    <div className="product-stat-icon low-stock-icon">
                        <AlertTriangle size={22} />
                    </div>

                    <span>Low Stock</span>

                    <strong>{stats.lowStockProducts}</strong>

                    <small>Products running low</small>
                </div>


                {/* Out of Stock */}
                <div className="product-stat-card">
                    <div className="product-stat-icon out-stock-icon">
                        <PackageX size={22} />
                    </div>

                    <span>Out of Stock</span>

                    <strong>{stats.outOfStockProducts}</strong>

                    <small>Currently unavailable</small>
                </div>


                {/* Inactive Products */}
                <div className="product-stat-card">
                    <div className="product-stat-icon inactive-products-icon">
                        <PackageMinus size={22} />
                    </div>

                    <span>Inactive Products</span>

                    <strong>{stats.inactiveProducts}</strong>

                    <small>Currently inactive</small>
                </div>

            </div>



            {/* PRODUCT CONTENT */}
            <div className="product-content-card">

                <div className="product-content-header">
                    <h2>Products</h2>

                    <div className="product-search-filter">

                        {/* Search */}

                        <div className="product-search-box">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by product name, SKU or barcode..."
                            />
                            <Search size={16} className="product-search-icon" />
                        </div>



                        {/* Category */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            <option value="Raw Material">Raw Material</option>
                            <option value="Packing Material">Packing Material</option>
                            <option value="Emulsion">Emulsion</option>
                            <option value="Primer">Primer</option>
                            <option value="Putty">Putty</option>
                            <option value="Enamel">Enamel</option>
                            <option value="Texture">Texture</option>
                            <option value="Wood Finish">Wood Finish</option>
                            <option value="Waterproofing">Waterproofing</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Work in Progress">Work in Progress</option>
                        </select>

                        {/* Sub Category */}
                        <select
                            value={selectedSubCategory}
                            onChange={(e) => setSelectedSubCategory(e.target.value)}
                        >
                            <option value="">All Sub Categories</option>
                        </select>

                        {/* Brand */}
                        <select
                            value={selectedBrand}
                            onChange={(e) => setSelectedBrand(e.target.value)}
                        >
                            <option value="">All Brands</option>
                            <option value="Oneplus Spark">Oneplus Spark</option>
                        </select>

                        {/* Status */}
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>

                        {/* More Filters */}
                        <button
                            type="button"
                            className="product-filter-btn"
                        >
                            <Filter size={16} />
                            More Filters
                        </button>

                        {/* Reset */}
                        <button
                            type="button"
                            className="product-reset-btn"
                            onClick={() => {
                                setSearchTerm("");
                                setSelectedCategory("");
                                setSelectedSubCategory("");
                                setSelectedBrand("");
                                setSelectedStatus("");
                            }}
                        >
                            Reset
                        </button>

                    </div>
                </div>


                {/* TABLE */}
                {loading ? (
                    <div className="product-loading">
                        Loading products...
                    </div>
                ) : error ? (
                    <div className="product-error">
                        {error}
                    </div>
                ) : (
                    <div className="product-table-wrapper">
                        <table className="product-table">
                            <thead>
                                <tr>
                                    <th className="checkbox-column">
                                        <input
                                            type="checkbox"
                                            checked={
                                                filteredProducts.length > 0 &&
                                                selectedProducts.length === filteredProducts.length
                                            }
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedProducts(
                                                        filteredProducts.map((product) => product._id)
                                                    );
                                                } else {
                                                    setSelectedProducts([]);
                                                }
                                            }}
                                        />
                                    </th>
                                    <th>Image</th>
                                    <th>Product Details</th>
                                    <th>SKU / Barcode</th>
                                    <th>Category</th>
                                    <th>Brand</th>
                                    <th>Packing Size</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredProducts.length === 0 ?
                                    (
                                        <tr>
                                            <td colSpan="11">
                                                No products found
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedProducts.map((product) => (
                                            <tr key={product._id}>

                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedProducts.includes(product._id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedProducts((prev) => [
                                                                    ...prev,
                                                                    product._id
                                                                ]);
                                                            } else {
                                                                setSelectedProducts((prev) =>
                                                                    prev.filter((id) => id !== product._id)
                                                                );
                                                            }
                                                        }}
                                                    />
                                                </td>

                                                <td>
                                                    {product.image ? (
                                                        <img
                                                            src={`${SERVER_URL}${product.image}`}
                                                            alt={product.productName}
                                                            className="product-table-image"
                                                        />
                                                    ) : (
                                                        <div className="product-table-image-placeholder">
                                                            No Image
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="product-name-cell">
                                                    {product.productName}
                                                </td>

                                                <td>
                                                    <div className="product-barcode-cell">{product.sku}</div>
                                                    <small>
                                                        {product.barcode || "-"}
                                                    </small>
                                                </td>

                                                <td>
                                                    {product.category}
                                                </td>

                                                <td>
                                                    {product.brand}
                                                </td>

                                                <td>
                                                    {product.packingSize}
                                                </td>

                                                <td>
                                                    ₹{product.mrp}
                                                </td>

                                                <td>
                                                    {product.stockQuantity}
                                                </td>

                                                <td>
                                                    {product.status}
                                                </td>

                                                <td className="product-action-cell">
                                                    <button
                                                        type="button"
                                                        className="product-action-btn"
                                                        title="View Product"
                                                        onClick={() => handleViewProduct(product._id)}
                                                    >
                                                        <Eye size={17} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="product-action-btn"
                                                        title="Edit Product"
                                                        onClick={() => handleEditProduct(product._id)}
                                                    >
                                                        <Pencil size={17} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="product-action-btn delete-action"
                                                        title="Delete Product"
                                                        onClick={() => handleDeleteProduct(product._id)}
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="product-action-btn"
                                                        title="More"
                                                    >
                                                        <MoreVertical size={19} />
                                                    </button>
                                                </td>

                                            </tr>
                                        ))
                                    )}
                            </tbody>
                        </table>
                    </div>
                )}


                <div className="product-table-footer">

                    <span>
                        Showing{" "}
                        {filteredProducts.length === 0 ? 0 : startIndex + 1}
                        {"–"}
                        {Math.min(endIndex, filteredProducts.length)} of{" "}
                        {filteredProducts.length} entries
                    </span>

                    <div className="product-pagination">

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
                            disabled={
                                currentPage === totalPages ||
                                totalPages === 0
                            }
                            onClick={() =>
                                setCurrentPage((prev) => prev + 1)
                            }
                        >
                            <ChevronRight size={16} />
                        </button>

                    </div>

                </div>

            </div>

            {/* ============ VIEW MODAL ============ */}
            {showViewModal && selectedProduct && (
                <div className="product-modal-overlay">
                    <div className="product-view-modal">

                        <div className="product-modal-header">
                            <h2>Product Details</h2>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowViewModal(false);
                                    setSelectedProduct(null);
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div className="product-details-grid">

                            <div className="product-view-image-section">
                                <label>Product Image</label>

                                {selectedProduct.image ? (
                                    <img
                                        src={`${SERVER_URL}${selectedProduct.image}`}
                                        alt={selectedProduct.productName}
                                        className="product-view-image"
                                    />
                                ) : (
                                    <div className="product-view-no-image">
                                        No Image Available
                                    </div>
                                )}
                            </div>

                            <div>
                                <label>Product Name</label>
                                <strong>{selectedProduct.productName || "-"}</strong>
                            </div>

                            <div>
                                <label>SKU</label>
                                <strong>{selectedProduct.sku || "-"}</strong>
                            </div>

                            <div>
                                <label>Barcode</label>
                                <strong>{selectedProduct.barcode || "-"}</strong>
                            </div>

                            <div>
                                <label>Category</label>
                                <strong>{selectedProduct.category || "-"}</strong>
                            </div>

                            <div>
                                <label>Brand</label>
                                <strong>{selectedProduct.brand || "-"}</strong>
                            </div>

                            <div>
                                <label>Group</label>
                                <strong>{selectedProduct.group || "-"}</strong>
                            </div>

                            <div>
                                <label>Packing Size</label>
                                <strong>{selectedProduct.packingSize || "-"}</strong>
                            </div>

                            <div>
                                <label>MRP</label>
                                <strong>₹{selectedProduct.mrp || 0}</strong>
                            </div>

                            <div>
                                <label>Discount Price</label>
                                <strong>₹{selectedProduct.discountPrice || 0}</strong>
                            </div>

                            <div>
                                <label>Stock Quantity</label>
                                <strong>{selectedProduct.stockQuantity || 0}</strong>
                            </div>

                            <div>
                                <label>Status</label>
                                <strong>{selectedProduct.status || "-"}</strong>
                            </div>

                        </div>

                        <div className="product-modal-footer">
                            <button
                                className="product-modal-close-btn"
                                type="button"
                                onClick={() => {
                                    setShowViewModal(false);
                                    setSelectedProduct(null);
                                }}
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* ============ EDIT MODAL ============ */}
            {showEditModal && editingProduct && (
                <div className="product-modal-overlay">
                    <div className="product-view-modal">

                        <div className="product-modal-header">
                            <h2>Edit Product</h2>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingProduct(null);
                                    setEditProductImage(null);
                                    setEditProductImagePreview(null);
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleUpdateProduct}>

                            <div className="product-edit-grid">

                                <div className="product-image-upload-section">
                                    <label>Product Image</label>

                                    {editProductImagePreview ? (
                                        <div className="product-edit-image-preview">
                                            <img src={editProductImagePreview} alt="Preview" />
                                            <small className="product-new-image-label">New Image</small>
                                        </div>
                                    ) : editingProduct.image ? (
                                        <div className="product-edit-image-preview">
                                            <img
                                                src={`${SERVER_URL}${editingProduct.image}`}
                                                alt={editingProduct.productName}
                                            />
                                            <small className="product-current-image-label">Current Image</small>
                                        </div>
                                    ) : (
                                        <div className="product-no-image-placeholder">
                                            No Image
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        onChange={handleEditProductImageChange}
                                        className="product-file-input"
                                    />

                                    {editProductImage && (
                                        <small className="product-selected-image-name">
                                            Selected: {editProductImage.name}
                                        </small>
                                    )}
                                </div>

                                <div>
                                    <label>Product Name</label>
                                    <input
                                        type="text"
                                        value={editingProduct.productName || ""}
                                        onChange={(e) =>
                                            setEditingProduct({
                                                ...editingProduct,
                                                productName: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label>SKU</label>
                                    <input
                                        type="text"
                                        value={editingProduct.sku || ""}
                                        onChange={(e) =>
                                            setEditingProduct({
                                                ...editingProduct,
                                                sku: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Barcode</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={editingProduct.barcode || ""}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, "");

                                            if (value.length <= 6) {
                                                setEditingProduct({
                                                    ...editingProduct,
                                                    barcode: value,
                                                });
                                            }
                                        }}
                                        pattern="\d{6}"
                                        title="Barcode must be exactly 6 digits"
                                    />
                                </div>

                                <div>
                                    <label>Category</label>
                                    <select
                                        value={editingProduct.category || ""}
                                        onChange={(e) =>
                                            setEditingProduct({
                                                ...editingProduct,
                                                category: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Raw Material">Raw Material</option>
                                        <option value="Packing Material">Packing Material</option>
                                        <option value="Emulsion">Emulsion</option>
                                        <option value="Primer">Primer</option>
                                        <option value="Putty">Putty</option>
                                        <option value="Enamel">Enamel</option>
                                        <option value="Texture">Texture</option>
                                        <option value="Wood Finish">Wood Finish</option>
                                        <option value="Waterproofing">Waterproofing</option>
                                        <option value="Accessories">Accessories</option>
                                        <option value="Work in Progress">Work in Progress</option>
                                    </select>
                                </div>

                                <div>
                                    <label>Group</label>

                                    <select
                                        value={editingProduct.group || ""}
                                        onChange={(e) =>
                                            setEditingProduct({
                                                ...editingProduct,
                                                group: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="">Select Group</option>

                                        <option value="Paints">
                                            Paints
                                        </option>

                                        <option value="Primers">
                                            Primers
                                        </option>

                                        <option value="Putty & Fillers">
                                            Putty & Fillers
                                        </option>

                                        <option value="Thinners">
                                            Thinners
                                        </option>

                                        <option value="Others">
                                            Others
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label>Brand</label>
                                    <input
                                        type="text"
                                        value={editingProduct.brand || ""}
                                        onChange={(e) =>
                                            setEditingProduct({
                                                ...editingProduct,
                                                brand: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Packing Size</label>
                                    <input
                                        type="text"
                                        value={editingProduct.packingSize || ""}
                                        onChange={(e) =>
                                            setEditingProduct({
                                                ...editingProduct,
                                                packingSize: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label>MRP</label>
                                    <input
                                        type="number"
                                        value={editingProduct.mrp || ""}
                                        onChange={(e) =>
                                            setEditingProduct({
                                                ...editingProduct,
                                                mrp: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Discount Price</label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editingProduct.discountPrice || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            if (/^\d*(\.\d{0,2})?$/.test(value)) {
                                                setEditingProduct({
                                                    ...editingProduct,
                                                    discountPrice: value,
                                                });
                                            }
                                        }}
                                    />
                                </div>

                                <div>
                                    <label>Stock Quantity</label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={editingProduct.stockQuantity || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            if (/^\d*$/.test(value)) {
                                                setEditingProduct({
                                                    ...editingProduct,
                                                    stockQuantity: value,
                                                });
                                            }
                                        }}
                                    />
                                </div>

                                <div>
                                    <label>Status</label>
                                    <select
                                        value={editingProduct.status || "ACTIVE"}
                                        onChange={(e) =>
                                            setEditingProduct({
                                                ...editingProduct,
                                                status: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="INACTIVE">INACTIVE</option>
                                    </select>
                                </div>

                            </div>

                            <div className="product-modal-footer">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingProduct(null);
                                        setEditProductImage(null);
                                        setEditProductImagePreview(null);
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={editLoading}
                                    className="save-product-btn"
                                >
                                    {editLoading ? "Updating..." : "Update Product"}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}

            {/* ============ ADD MODAL ============ */}
            {showAddModal && (
                <div className="product-modal-overlay">
                    <div className="product-view-modal">

                        <div className="product-modal-header">
                            <h2>Add Product</h2>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddModal(false);
                                    setNewProductImage(null);
                                    setNewProductImagePreview(null);
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleAddProduct}>

                            <div className="product-edit-grid">

                                <div className="product-image-upload-section">
                                    <label>Product Image</label>

                                    {newProductImagePreview ? (
                                        <div className="product-edit-image-preview">
                                            <img src={newProductImagePreview} alt="Preview" />
                                        </div>
                                    ) : (
                                        <div className="product-no-image-placeholder">
                                            No Image Selected
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        onChange={handleNewProductImageChange}
                                        className="product-file-input"
                                    />

                                    {newProductImage && (
                                        <small className="product-selected-image-name">
                                            Selected: {newProductImage.name}
                                        </small>
                                    )}
                                </div>

                                <div>
                                    <label>Product Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newProduct.productName}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                productName: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label>SKU</label>
                                    <input
                                        type="text"
                                        required
                                        value={newProduct.sku}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                sku: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Barcode</label>
                                    <input
                                        type="text"
                                        value={newProduct.barcode}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                barcode: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Category</label>
                                    <select
                                        required
                                        value={newProduct.category}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                category: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Raw Material">Raw Material</option>
                                        <option value="Packing Material">Packing Material</option>
                                        <option value="Emulsion">Emulsion</option>
                                        <option value="Primer">Primer</option>
                                        <option value="Putty">Putty</option>
                                        <option value="Enamel">Enamel</option>
                                        <option value="Texture">Texture</option>
                                        <option value="Wood Finish">Wood Finish</option>
                                        <option value="Waterproofing">Waterproofing</option>
                                        <option value="Accessories">Accessories</option>
                                        <option value="Work in Progress">Work in Progress</option>
                                    </select>
                                </div>

                                <div>
                                    <label>Brand</label>
                                    <input
                                        type="text"
                                        required
                                        value={newProduct.brand}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                brand: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Group</label>

                                    <select
                                        required
                                        value={newProduct.group}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                group: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="">
                                            Select Group
                                        </option>

                                        <option value="Paints">
                                            Paints
                                        </option>

                                        <option value="Primers">
                                            Primers
                                        </option>

                                        <option value="Putty & Fillers">
                                            Putty & Fillers
                                        </option>

                                        <option value="Thinners">
                                            Thinners
                                        </option>

                                        <option value="Others">
                                            Others
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label>Packing Size</label>
                                    <input
                                        type="text"
                                        value={newProduct.packingSize}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                packingSize: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label>MRP</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={newProduct.mrp}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                mrp: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Discount Price</label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={newProduct.discountPrice}
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            if (/^\d*(\.\d{0,2})?$/.test(value)) {
                                                setNewProduct({
                                                    ...newProduct,
                                                    discountPrice: value,
                                                });
                                            }
                                        }}
                                    />
                                </div>

                                <div>
                                    <label>Stock Quantity</label>

                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="1"
                                        value={newProduct.stockQuantity}
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            if (/^\d*$/.test(value)) {
                                                setNewProduct({
                                                    ...newProduct,
                                                    stockQuantity: value,
                                                });
                                            }
                                        }}
                                    />
                                </div>

                                <div>
                                    <label>Status</label>
                                    <select
                                        value={newProduct.status}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                status: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="INACTIVE">INACTIVE</option>
                                    </select>
                                </div>

                            </div>

                            <div className="product-modal-footer">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setNewProductImage(null);
                                        setNewProductImagePreview(null);
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-product-btn"
                                    disabled={addLoading}
                                >
                                    {addLoading ? "Adding..." : "Add Product"}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}

        </div>
    );
};

export default ProductManagement;