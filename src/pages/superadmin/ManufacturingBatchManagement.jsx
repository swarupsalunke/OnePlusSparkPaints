import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    Plus,
    Filter,
    RotateCcw,
    Eye,
    Pencil,
    X,
    CheckCircle2,
    Clock3,
    Package,
    AlertCircle,
    ClipboardCheck,
    ChevronDown,
    Upload,
    FileText,
    Save,
    Ban,
    Search,
    Trash2,
    ChevronRight,
    ChevronLeft,
} from "lucide-react";

import "../../css/superadmin/ManufacturingManagement.css";

const API_BASE_URL = "https://oneplussparkpaintsserver.onrender.com/api/manufacturing";

const ManufacturingBatchManagement = () => {

    const [activeTab, setActiveTab] = useState("batchManagement");


    // FILTERS

    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [selectedProduct, setSelectedProduct] = useState("ALL");
    const [selectedPlant, setSelectedPlant] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);


    // DATA

    const [batches, setBatches] = useState([]);
    const [stats, setStats] = useState({
        totalBatches: 0,
        inProduction: 0,
        completed: 0,
        qcPending: 0,
        rejected: 0,
    });

    const [selectedBatch, setSelectedBatch] = useState(null);

    const [costVerification, setCostVerification] = useState(null);

    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [costLoading, setCostLoading] = useState(false);
    const [error, setError] = useState("");
    const [costError, setCostError] = useState("");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showQcModal, setShowQcModal] = useState(false);
    const [showCostModal, setShowCostModal] = useState(false);

    const [savingBatch, setSavingBatch] = useState(false);
    const [savingQc, setSavingQc] = useState(false);
    const [savingCost, setSavingCost] = useState(false);
    const [deletingBatch, setDeletingBatch] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const emptyBatchForm = {
        batchNumber: "",
        batchDate: "",
        batchName: "",
        product: "",
        plantUnit: "",
        supervisor: "",
        batchStartTime: "",
        batchEndTime: "",
        batchQuantity: "",
        batchSize: "20kg",
        customBatchSize: "",
        numberOfOperators: "",
        remarks: "",
        status: "PLANNED",
        packingDetails: [
            {
                packingSize: "20 Ltr",
                plannedQuantity: "",
                producedQuantity: "",
                labelVerified: false,
            },
            {
                packingSize: "10 Ltr",
                plannedQuantity: "",
                producedQuantity: "",
                labelVerified: false,
            },
            {
                packingSize: "4 Ltr",
                plannedQuantity: "",
                producedQuantity: "",
                labelVerified: false,
            },
            {
                packingSize: "1 Ltr",
                plannedQuantity: "",
                producedQuantity: "",
                labelVerified: false,
            },
        ],
        labelVerification: false,
        labQualityControl: {
            captureDateTime: "",
            wetPerLitre: "",
            temperature: "",
            viscosity: "",
            drawDownResult: "",
            hegmanFineness: "",
            labReport: "",
            qcRemarks: "",
            qcStatus: "PENDING",
        },
    };

    const [batchForm, setBatchForm] = useState(emptyBatchForm);


    // QC FORM

    const emptyQcForm = {
        captureDateTime: "",
        wetPerLitre: "",
        temperature: "",
        viscosity: "",
        drawDownResult: "",
        hegmanFineness: "",
        labReport: "",
        qcRemarks: "",
        qcStatus: "PENDING",
    };

    const [qcForm, setQcForm] = useState(emptyQcForm);


    // COST FORM

    const [costForm, setCostForm] = useState({
        producedQuantity: "",
        finishedQuantity: "",
        costComparison: "",
        productCostVerification: "",
        packingWiseCost: "",
        remarks: "",
    });


    // AUTH

    const getToken = () => {
        return (
            localStorage.getItem("token") ||
            localStorage.getItem("authToken") ||
            localStorage.getItem("accessToken")
        );
    };

    const authConfig = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });


    // FETCH STATS

    const fetchStats = async () => {
        try {
            setStatsLoading(true);

            const response = await axios.get(
                `${API_BASE_URL}/batches/stats`,
                authConfig()
            );

            if (response.data?.success) {
                setStats(
                    response.data.stats || {
                        totalBatches: 0,
                        inProduction: 0,
                        completed: 0,
                        qcPending: 0,
                        rejected: 0,
                    }
                );
            }
        } catch (err) {
            console.error(
                "Manufacturing batch stats error:",
                err?.response?.data || err
            );
        } finally {
            setStatsLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get(
                "https://oneplussparkpaintsserver.onrender.com/api/products",
                authConfig()
            );

            if (response.data?.success) {
                setProducts(
                    Array.isArray(response.data.products)
                        ? response.data.products
                        : []
                );
            }
        } catch (err) {
            console.error(
                "Fetch products error:",
                err?.response?.data || err
            );

            setProducts([]);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get(
                "https://oneplussparkpaintsserver.onrender.com/api/users",
                authConfig()
            );

            if (response.data?.success) {
                setUsers(
                    Array.isArray(response.data.users)
                        ? response.data.users
                        : []
                );
            }
        } catch (err) {
            console.error(
                "Fetch users error:",
                err?.response?.data || err
            );

            setUsers([]);
        }
    };


    // FETCH BATCHES

    const fetchBatches = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {};

            if (selectedStatus !== "ALL") {
                params.status = selectedStatus;
            }

            if (selectedProduct !== "ALL") {
                params.product = selectedProduct;
            }

            if (selectedPlant !== "ALL") {
                params.plantUnit = selectedPlant;
            }

            if (dateFrom) {
                params.dateFrom = dateFrom;
            }

            if (dateTo) {
                params.dateTo = dateTo;
            }

            const response = await axios.get(
                `${API_BASE_URL}/batches`,
                {
                    ...authConfig(),
                    params,
                }
            );

            if (response.data?.success) {
                setBatches(
                    Array.isArray(response.data.batches)
                        ? response.data.batches
                        : []
                );
            } else {
                setBatches([]);
                setError(
                    response.data?.message ||
                    "Failed to fetch batches"
                );
            }
        } catch (err) {
            console.error(
                "Fetch batches error:",
                err?.response?.data || err
            );

            setBatches([]);

            setError(
                err.response?.data?.message ||
                "Failed to load manufacturing batches"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchBatches();
        fetchProducts();
        fetchUsers();

    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBatches();
        }, 250);

        return () => clearTimeout(timer);
    }, [
        dateFrom,
        dateTo,
        selectedStatus,
        selectedProduct,
        selectedPlant,
    ]);


    // FILTER OPTIONS

    const productOptions = useMemo(() => {
        const values = batches
            .map((batch) => batch.product?._id)
            .filter(Boolean);

        return Array.from(new Set(values)).map(
            (id) => {
                const batch = batches.find(
                    (item) => item.product?._id === id
                );

                return {
                    value: id,
                    label:
                        batch?.product?.productName ||
                        "Product",
                };
            }
        );
    }, [batches]);

    const plantOptions = useMemo(() => {
        return Array.from(
            new Set(
                batches
                    .map((batch) => batch.plantUnit)
                    .filter(Boolean)
            )
        );
    }, [batches]);

    // Client side search on top of server side filters
    const filteredBatches = useMemo(() => {
        if (!searchQuery.trim()) return batches;

        const q = searchQuery.trim().toLowerCase();

        return batches.filter((batch) =>
            (batch.batchNumber || "")
                .toLowerCase()
                .includes(q) ||
            (batch.batchName || "")
                .toLowerCase()
                .includes(q) ||
            (batch.product?.productName || "")
                .toLowerCase()
                .includes(q)
        );
    }, [batches, searchQuery]);

    const totalPages = Math.ceil(
        filteredBatches.length / ITEMS_PER_PAGE
    );

    const startIndex =
        (currentPage - 1) * ITEMS_PER_PAGE;

    const paginatedBatches = filteredBatches.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    );


    // RESET FILTERS

    const handleResetFilters = () => {
        setDateFrom("");
        setDateTo("");
        setSelectedStatus("ALL");
        setSelectedProduct("ALL");
        setSelectedPlant("ALL");
        setSearchQuery("");
    };


    // CREATE MODAL

    const openCreateModal = () => {
        setBatchForm({
            ...emptyBatchForm,
            packingDetails:
                emptyBatchForm.packingDetails.map(
                    (item) => ({ ...item })
                ),
            labQualityControl: {
                ...emptyBatchForm.labQualityControl,
            },
        });

        setShowCreateModal(true);
    };

    const closeCreateModal = () => {
        if (savingBatch) return;
        setShowCreateModal(false);
    };


    // BATCH FORM CHANGE

    const handleBatchChange = (e) => {
        const { name, value } = e.target;

        setBatchForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePackingChange = (
        index,
        field,
        value
    ) => {
        setBatchForm((prev) => ({
            ...prev,
            packingDetails:
                prev.packingDetails.map(
                    (item, itemIndex) =>
                        itemIndex === index
                            ? {
                                ...item,
                                [field]: value,
                            }
                            : item
                ),
        }));
    };

    const handlePackingLabelChange = (
        index,
        checked
    ) => {
        setBatchForm((prev) => ({
            ...prev,
            packingDetails:
                prev.packingDetails.map(
                    (item, itemIndex) =>
                        itemIndex === index
                            ? {
                                ...item,
                                labelVerified: checked,
                            }
                            : item
                ),
        }));
    };


    // CREATE BATCH

    const handleCreateBatch = async (e) => {
        e.preventDefault();

        try {
            setSavingBatch(true);

            const payload = {
                ...batchForm,
                batchQuantity: Number(
                    batchForm.batchQuantity
                ),
                customBatchSize:
                    batchForm.batchSize === "CUSTOM"
                        ? Number(
                            batchForm.customBatchSize
                        )
                        : null,
                numberOfOperators: Number(
                    batchForm.numberOfOperators
                ),
                packingDetails:
                    batchForm.packingDetails.map(
                        (item) => ({
                            ...item,
                            plannedQuantity: Number(
                                item.plannedQuantity || 0
                            ),
                            producedQuantity: Number(
                                item.producedQuantity || 0
                            ),
                        })
                    ),
            };

            const response = await axios.post(
                `${API_BASE_URL}/batches`,
                payload,
                authConfig()
            );

            if (response.data?.success) {
                setShowCreateModal(false);

                await fetchBatches();
                await fetchStats();

                alert(
                    "Manufacturing batch created successfully"
                );
            }
        } catch (err) {
            console.error(
                "Create batch error:",
                err?.response?.data || err
            );

            alert(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Failed to create manufacturing batch"
            );
        } finally {
            setSavingBatch(false);
        }
    };


    // VIEW BATCH

    const handleViewBatch = async (batchId) => {
        try {
            setDetailsLoading(true);
            setShowViewModal(true);

            const response = await axios.get(
                `${API_BASE_URL}/batches/${batchId}`,
                authConfig()
            );

            if (response.data?.success) {
                setSelectedBatch(
                    response.data.batch
                );
            }
        } catch (err) {
            console.error(
                "View batch error:",
                err?.response?.data || err
            );

            alert(
                err.response?.data?.message ||
                "Failed to fetch batch details"
            );

            setShowViewModal(false);
        } finally {
            setDetailsLoading(false);
        }
    };

    // DELETE BATCH - FIXED

    const handleDeleteBatch = async (id) => {
        if (!window.confirm("Are you sure you want to delete this batch?")) {
            return;
        }

        try {
            setDeletingBatch(true);

            const response = await axios.delete(
                `${API_BASE_URL}/batches/${id}`,
                authConfig()
            );

            if (response.data?.success) {
                setBatches((prev) =>
                    prev.filter((batch) => batch._id !== id)
                );

                if (selectedBatch?._id === id) {
                    setSelectedBatch(null);
                }

                await fetchStats();

                alert("Manufacturing batch deleted successfully");
            } else {
                alert(
                    response.data?.message ||
                    "Failed to delete batch"
                );
            }
        } catch (err) {
            console.error(
                "Delete batch error:",
                err?.response?.data || err
            );

            const errorMsg =
                err.response?.data?.message ||
                "Failed to delete batch";

            alert(errorMsg);
        } finally {
            setDeletingBatch(false);
        }
    };


    // EDIT BATCH

    const openEditBatch = async (batchId) => {
        try {
            setDetailsLoading(true);

            const response = await axios.get(
                `${API_BASE_URL}/batches/${batchId}`,
                authConfig()
            );

            if (response.data?.success) {
                const batch =
                    response.data.batch;

                setSelectedBatch(batch);

                setBatchForm({
                    batchNumber:
                        batch.batchNumber || "",
                    batchDate: batch.batchDate
                        ? new Date(
                            batch.batchDate
                        )
                            .toISOString()
                            .slice(0, 10)
                        : "",
                    batchName:
                        batch.batchName || "",
                    product:
                        batch.product?._id ||
                        batch.product ||
                        "",
                    plantUnit:
                        batch.plantUnit || "",
                    supervisor:
                        batch.supervisor?._id ||
                        batch.supervisor ||
                        "",
                    batchStartTime:
                        batch.batchStartTime
                            ? new Date(
                                batch.batchStartTime
                            )
                                .toISOString()
                                .slice(0, 16)
                            : "",
                    batchEndTime:
                        batch.batchEndTime
                            ? new Date(
                                batch.batchEndTime
                            )
                                .toISOString()
                                .slice(0, 16)
                            : "",
                    batchQuantity:
                        batch.batchQuantity ?? "",
                    batchSize:
                        batch.batchSize || "20kg",
                    customBatchSize:
                        batch.customBatchSize ?? "",
                    numberOfOperators:
                        batch.numberOfOperators ?? "",
                    remarks:
                        batch.remarks || "",
                    status:
                        batch.status || "PLANNED",
                    packingDetails:
                        Array.isArray(
                            batch.packingDetails
                        )
                            ? batch.packingDetails.map(
                                (item) => ({
                                    packingSize:
                                        item.packingSize,
                                    plannedQuantity:
                                        item.plannedQuantity ??
                                        "",
                                    producedQuantity:
                                        item.producedQuantity ??
                                        "",
                                    labelVerified:
                                        Boolean(
                                            item.labelVerified
                                        ),
                                })
                            )
                            : emptyBatchForm.packingDetails.map(
                                (item) => ({ ...item })
                            ),
                    labelVerification:
                        Boolean(
                            batch.labelVerification
                        ),
                    labQualityControl: {
                        captureDateTime:
                            batch.labQualityControl
                                ?.captureDateTime || "",
                        wetPerLitre:
                            batch.labQualityControl
                                ?.wetPerLitre ?? "",
                        temperature:
                            batch.labQualityControl
                                ?.temperature ?? "",
                        viscosity:
                            batch.labQualityControl
                                ?.viscosity ?? "",
                        drawDownResult:
                            batch.labQualityControl
                                ?.drawDownResult || "",
                        hegmanFineness:
                            batch.labQualityControl
                                ?.hegmanFineness ?? "",
                        labReport:
                            batch.labQualityControl
                                ?.labReport || "",
                        qcRemarks:
                            batch.labQualityControl
                                ?.qcRemarks || "",
                        qcStatus:
                            batch.labQualityControl
                                ?.qcStatus || "PENDING",
                    },
                });

                setShowEditModal(true);
            }
        } catch (err) {
            console.error(
                "Edit batch load error:",
                err?.response?.data || err
            );

            alert(
                err.response?.data?.message ||
                "Failed to load batch"
            );
        } finally {
            setDetailsLoading(false);
        }
    };

    const closeEditModal = () => {
        if (savingBatch) return;
        setShowEditModal(false);
    };

    const handleUpdateBatch = async (e) => {
        e.preventDefault();

        if (!selectedBatch?._id) return;

        try {
            setSavingBatch(true);

            const payload = {
                ...batchForm,
                batchQuantity: Number(
                    batchForm.batchQuantity
                ),
                customBatchSize:
                    batchForm.batchSize === "CUSTOM"
                        ? Number(
                            batchForm.customBatchSize
                        )
                        : null,
                numberOfOperators: Number(
                    batchForm.numberOfOperators
                ),
                packingDetails:
                    batchForm.packingDetails.map(
                        (item) => ({
                            ...item,
                            plannedQuantity: Number(
                                item.plannedQuantity || 0
                            ),
                            producedQuantity: Number(
                                item.producedQuantity || 0
                            ),
                        })
                    ),
            };

            const response = await axios.put(
                `${API_BASE_URL}/batches/${selectedBatch._id}`,
                payload,
                authConfig()
            );

            if (response.data?.success) {
                setShowEditModal(false);
                await fetchBatches();
                await fetchStats();

                setSelectedBatch(response.data.batch);

                alert(
                    "Manufacturing batch updated successfully"
                );
            }
        } catch (err) {
            console.error(
                "Update batch error:",
                err?.response?.data || err
            );

            alert(
                err.response?.data?.message ||
                "Failed to update manufacturing batch"
            );
        } finally {
            setSavingBatch(false);
        }
    };


    // CLOSE BATCH


    const handleCloseBatch = async (batchId) => {
        const confirmed = window.confirm(
            "Are you sure you want to close this batch?"
        );

        if (!confirmed) return;

        try {
            const response = await axios.put(
                `${API_BASE_URL}/batches/${batchId}/close`,
                {},
                authConfig()
            );

            if (response.data?.success) {
                await fetchBatches();
                await fetchStats();

                if (
                    selectedBatch?._id === batchId
                ) {
                    setSelectedBatch(
                        response.data.batch
                    );
                }

                alert(
                    "Batch closed successfully"
                );
            }
        } catch (err) {
            console.error(
                "Close batch error:",
                err?.response?.data || err
            );

            alert(
                err.response?.data?.message ||
                "Failed to close batch"
            );
        }
    };


    // QC MODAL

    const openQcModal = (batch) => {
        setSelectedBatch(batch);

        setQcForm({
            captureDateTime:
                batch.labQualityControl
                    ?.captureDateTime || "",
            wetPerLitre:
                batch.labQualityControl
                    ?.wetPerLitre ?? "",
            temperature:
                batch.labQualityControl
                    ?.temperature ?? "",
            viscosity:
                batch.labQualityControl
                    ?.viscosity ?? "",
            drawDownResult:
                batch.labQualityControl
                    ?.drawDownResult || "",
            hegmanFineness:
                batch.labQualityControl
                    ?.hegmanFineness ?? "",
            labReport:
                batch.labQualityControl
                    ?.labReport || "",
            qcRemarks:
                batch.labQualityControl
                    ?.qcRemarks || "",
            qcStatus:
                batch.labQualityControl
                    ?.qcStatus || "PENDING",
        });

        setShowQcModal(true);
    };

    const handleQcChange = (e) => {
        const { name, value } = e.target;

        setQcForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUpdateQc = async (e) => {
        e.preventDefault();

        if (!selectedBatch?._id) return;

        try {
            setSavingQc(true);

            const response = await axios.put(
                `${API_BASE_URL}/batches/${selectedBatch._id}/qc`,
                {
                    ...qcForm,
                    wetPerLitre:
                        qcForm.wetPerLitre === ""
                            ? null
                            : Number(
                                qcForm.wetPerLitre
                            ),
                    temperature:
                        qcForm.temperature === ""
                            ? null
                            : Number(
                                qcForm.temperature
                            ),
                    viscosity:
                        qcForm.viscosity === ""
                            ? null
                            : Number(
                                qcForm.viscosity
                            ),
                    hegmanFineness:
                        qcForm.hegmanFineness === ""
                            ? null
                            : Number(
                                qcForm.hegmanFineness
                            ),
                },
                authConfig()
            );

            if (response.data?.success) {
                setShowQcModal(false);

                await fetchBatches();
                await fetchStats();

                if (selectedBatch?._id) {
                    const refreshed = await axios.get(
                        `${API_BASE_URL}/batches/${selectedBatch._id}`,
                        authConfig()
                    );

                    if (refreshed.data?.success) {
                        setSelectedBatch(
                            refreshed.data.batch
                        );
                    }
                }

                alert(
                    "Batch QC updated successfully"
                );
            }
        } catch (err) {
            console.error(
                "Update QC error:",
                err?.response?.data || err
            );

            alert(
                err.response?.data?.message ||
                "Failed to update batch QC"
            );
        } finally {
            setSavingQc(false);
        }
    };


    // COST VERIFICATION

    const fetchCostVerification = async (batchId) => {
        try {
            setCostLoading(true);
            setCostError("");

            const response = await axios.get(
                `${API_BASE_URL}/cost-verification/${batchId}`,
                authConfig()
            );

            if (response.data?.success) {
                setCostVerification(
                    response.data.verification
                );
            }
        } catch (err) {
            setCostVerification(null);

            if (
                err.response?.status !== 404
            ) {
                setCostError(
                    err.response?.data
                        ?.message ||
                    "Failed to load cost verification"
                );
            }
        } finally {
            setCostLoading(false);
        }
    };

    // Fetch cost verification whenever a batch gets selected,
    // regardless of which tab is active - both tabs show it now.
    useEffect(() => {
        if (selectedBatch?._id) {
            fetchCostVerification(selectedBatch._id);
        } else {
            setCostVerification(null);
            setCostError("");
        }
    }, [selectedBatch?._id]);

    const openCostVerification = (batch) => {
        setSelectedBatch(batch);
    };

    const handleCostChange = (e) => {
        const { name, value } = e.target;

        setCostForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const openCostEditModal = () => {
        if (!costVerification) {
            setCostForm({
                producedQuantity:
                    selectedBatch?.batchQuantity ??
                    "",
                finishedQuantity: "",
                costComparison: "",
                productCostVerification: "",
                packingWiseCost: "",
                remarks: "",
            });
        } else {
            setCostForm({
                producedQuantity:
                    costVerification.producedQuantity ??
                    "",
                finishedQuantity:
                    costVerification.finishedQuantity ??
                    "",
                costComparison:
                    costVerification.costComparison ??
                    "",
                productCostVerification:
                    costVerification.productCostVerification ??
                    "",
                packingWiseCost:
                    costVerification.packingWiseCost ??
                    "",
                remarks:
                    costVerification.remarks || "",
            });
        }

        setShowCostModal(true);
    };

    const handleSaveCostVerification =
        async (e) => {
            e.preventDefault();

            if (!selectedBatch?._id) return;

            try {
                setSavingCost(true);

                const existingId =
                    costVerification?._id;

                let response;

                const payload = {
                    product:
                        selectedBatch.product?._id ||
                        selectedBatch.product,
                    batch: selectedBatch._id,
                    batchNumber:
                        selectedBatch.batchNumber,
                    producedQuantity: Number(
                        costForm.producedQuantity
                    ),
                    finishedQuantity: Number(
                        costForm.finishedQuantity
                    ),
                    costComparison: Number(
                        costForm.costComparison
                    ),
                    productCostVerification:
                        Number(
                            costForm.productCostVerification
                        ),
                    packingWiseCost: Number(
                        costForm.packingWiseCost
                    ),
                    remarks: costForm.remarks,
                };

                if (existingId) {
                    response = await axios.put(
                        `${API_BASE_URL}/cost-verification/${selectedBatch._id}`,
                        payload,
                        authConfig()
                    );
                } else {
                    response = await axios.post(
                        `${API_BASE_URL}/cost-verification`,
                        payload,
                        authConfig()
                    );
                }

                if (response.data?.success) {
                    await fetchCostVerification(
                        selectedBatch._id
                    );

                    setShowCostModal(false);

                    alert(
                        existingId
                            ? "Cost verification updated successfully"
                            : "Cost verification created successfully"
                    );
                }
            } catch (err) {
                console.error(
                    "Save cost verification error:",
                    err?.response?.data || err
                );

                alert(
                    err.response?.data?.message ||
                    "Failed to save cost verification"
                );
            } finally {
                setSavingCost(false);
            }
        };

    const handleVerifyCost = async () => {
        if (!selectedBatch?._id) return;

        const confirmed = window.confirm(
            "Verify this batch cost?"
        );

        if (!confirmed) return;

        try {
            const response = await axios.put(
                `${API_BASE_URL}/cost-verification/${selectedBatch._id}/verify`,
                {},
                authConfig()
            );

            if (response.data?.success) {
                setCostVerification(
                    response.data.verification
                );

                alert(
                    "Batch cost verification verified successfully"
                );
            }
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Failed to verify batch cost"
            );
        }
    };

    const handleRejectCost = async () => {
        if (!selectedBatch?._id) return;

        const remarks =
            window.prompt(
                "Enter rejection remarks:"
            );

        if (remarks === null) return;

        try {
            const response = await axios.put(
                `${API_BASE_URL}/cost-verification/${selectedBatch._id}/reject`,
                { remarks },
                authConfig()
            );

            if (response.data?.success) {
                setCostVerification(
                    response.data.verification
                );

                alert(
                    "Batch cost verification rejected successfully"
                );
            }
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Failed to reject batch cost"
            );
        }
    };


    // STATUS BADGE


    const getStatusClass = (status) => {
        switch (status) {
            case "IN_PRODUCTION":
                return "manufacturing-status production";

            case "COMPLETED":
                return "manufacturing-status completed";

            case "QC_PENDING":
                return "manufacturing-status qc-pending";

            case "REJECTED":
                return "manufacturing-status rejected";

            default:
                return "manufacturing-status planned";
        }
    };

    const getCostStatusClass = (status) => {
        switch (status) {
            case "VERIFIED":
                return "manufacturing-cost-status verified";
            case "REJECTED":
                return "manufacturing-cost-status rejected";
            default:
                return "manufacturing-cost-status pending";
        }
    };


    // FORM COMPONENT


    const renderBatchForm = () => (
        <form
            className="manufacturing-modal-form"
            onSubmit={
                showEditModal
                    ? handleUpdateBatch
                    : handleCreateBatch
            }
        >
            <div className="manufacturing-form-grid">

                <div className="manufacturing-form-group">
                    <label>Batch Number *</label>
                    <input
                        type="text"
                        name="batchNumber"
                        value={batchForm.batchNumber}
                        onChange={handleBatchChange}
                        required
                        disabled={showEditModal}
                    />
                </div>

                <div className="manufacturing-form-group">
                    <label>Batch Date *</label>
                    <input
                        type="date"
                        name="batchDate"
                        value={batchForm.batchDate}
                        onChange={handleBatchChange}
                        required
                    />
                </div>

                <div className="manufacturing-form-group">
                    <label>Batch Name *</label>
                    <input
                        type="text"
                        name="batchName"
                        value={batchForm.batchName}
                        onChange={handleBatchChange}
                        required
                    />
                </div>

                <div className="manufacturing-form-group">
                    <label>Product *</label>

                    <select
                        name="product"
                        value={batchForm.product}
                        onChange={handleBatchChange}
                        required
                    >
                        <option value="">
                            Select Product
                        </option>

                        {products.map((product) => (
                            <option
                                key={product._id}
                                value={product._id}
                            >
                                {product.productName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="manufacturing-form-group">
                    <label>Plant / Unit *</label>
                    <input
                        type="text"
                        name="plantUnit"
                        value={batchForm.plantUnit}
                        onChange={handleBatchChange}
                        required
                    />
                </div>

                <div className="manufacturing-form-group">
                    <label>Batch Supervisor *</label>

                    <select
                        name="supervisor"
                        value={batchForm.supervisor}
                        onChange={handleBatchChange}
                        required
                    >
                        <option value="">
                            Select Supervisor
                        </option>

                        {users.map((user) => (
                            <option
                                key={user._id}
                                value={user._id}
                            >
                                {user.name || user.email}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="manufacturing-form-group">
                    <label>Batch Start Time</label>
                    <input
                        type="datetime-local"
                        name="batchStartTime"
                        value={batchForm.batchStartTime}
                        onChange={handleBatchChange}
                    />
                </div>

                <div className="manufacturing-form-group">
                    <label>Batch End Time</label>
                    <input
                        type="datetime-local"
                        name="batchEndTime"
                        value={batchForm.batchEndTime}
                        onChange={handleBatchChange}
                    />
                </div>

                <div className="manufacturing-form-group">
                    <label>Batch Quantity (Ltrs) *</label>
                    <input
                        type="number"
                        name="batchQuantity"
                        min="0"
                        value={batchForm.batchQuantity}
                        onChange={handleBatchChange}
                        required
                    />
                </div>

                <div className="manufacturing-form-group">
                    <label>Batch Size *</label>
                    <select
                        name="batchSize"
                        value={batchForm.batchSize}
                        onChange={handleBatchChange}
                        required
                    >
                        <option value="20kg">
                            20kg
                        </option>
                        <option value="200kg">
                            200kg
                        </option>
                        <option value="600kg">
                            600kg
                        </option>
                        <option value="1200kg">
                            1200kg
                        </option>
                        <option value="CUSTOM">
                            Custom
                        </option>
                    </select>
                </div>

                {batchForm.batchSize ===
                    "CUSTOM" && (
                        <div className="manufacturing-form-group">
                            <label>
                                Custom Batch Size
                            </label>
                            <input
                                type="number"
                                name="customBatchSize"
                                min="0"
                                value={
                                    batchForm.customBatchSize
                                }
                                onChange={
                                    handleBatchChange
                                }
                                required
                            />
                        </div>
                    )}

                <div className="manufacturing-form-group">
                    <label>
                        Number of Operators *
                    </label>
                    <input
                        type="number"
                        name="numberOfOperators"
                        min="0"
                        value={
                            batchForm.numberOfOperators
                        }
                        onChange={handleBatchChange}
                        required
                    />
                </div>

                <div className="manufacturing-form-group">
                    <label>Status</label>
                    <select
                        name="status"
                        value={batchForm.status}
                        onChange={handleBatchChange}
                    >
                        <option value="PLANNED">
                            Planned
                        </option>
                        <option value="IN_PRODUCTION">
                            In Production
                        </option>
                        <option value="QC_PENDING">
                            QC Pending
                        </option>
                        <option value="COMPLETED">
                            Completed
                        </option>
                        <option value="REJECTED">
                            Rejected
                        </option>
                    </select>
                </div>

                <div className="manufacturing-form-group full-width">
                    <label>Remarks</label>
                    <textarea
                        name="remarks"
                        value={batchForm.remarks}
                        onChange={handleBatchChange}
                        rows="3"
                    />
                </div>

            </div>

            <div className="manufacturing-form-section">
                <h3>Packing Details</h3>

                <div className="manufacturing-packing-grid">
                    {batchForm.packingDetails.map(
                        (item, index) => (
                            <div
                                className="manufacturing-packing-card"
                                key={item.packingSize}
                            >
                                <strong>
                                    {item.packingSize}
                                </strong>

                                <input
                                    type="number"
                                    placeholder="Planned"
                                    value={
                                        item.plannedQuantity
                                    }
                                    onChange={(e) =>
                                        handlePackingChange(
                                            index,
                                            "plannedQuantity",
                                            e.target.value
                                        )
                                    }
                                />

                                <input
                                    type="number"
                                    placeholder="Produced"
                                    value={
                                        item.producedQuantity
                                    }
                                    onChange={(e) =>
                                        handlePackingChange(
                                            index,
                                            "producedQuantity",
                                            e.target.value
                                        )
                                    }
                                />

                                <label className="manufacturing-check-label">
                                    <input
                                        type="checkbox"
                                        checked={
                                            item.labelVerified
                                        }
                                        onChange={(e) =>
                                            handlePackingLabelChange(
                                                index,
                                                e.target.checked
                                            )
                                        }
                                    />
                                    Label Verified
                                </label>
                            </div>
                        )
                    )}
                </div>
            </div>

            <div className="manufacturing-form-section">
                <h3>Lab Quality Control</h3>

                <div className="manufacturing-form-grid">

                    <div className="manufacturing-form-group">
                        <label>
                            Capture Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            value={
                                batchForm
                                    .labQualityControl
                                    .captureDateTime
                            }
                            onChange={(e) =>
                                setBatchForm((prev) => ({
                                    ...prev,
                                    labQualityControl: {
                                        ...prev.labQualityControl,
                                        captureDateTime:
                                            e.target.value,
                                    },
                                }))
                            }
                        />
                    </div>

                    <div className="manufacturing-form-group">
                        <label>
                            Wet per Litre
                        </label>
                        <input
                            type="number"
                            step="any"
                            value={
                                batchForm
                                    .labQualityControl
                                    .wetPerLitre
                            }
                            onChange={(e) =>
                                setBatchForm((prev) => ({
                                    ...prev,
                                    labQualityControl: {
                                        ...prev.labQualityControl,
                                        wetPerLitre:
                                            e.target.value,
                                    },
                                }))
                            }
                        />
                    </div>

                    <div className="manufacturing-form-group">
                        <label>
                            Temperature (°C)
                        </label>
                        <input
                            type="number"
                            step="any"
                            value={
                                batchForm
                                    .labQualityControl
                                    .temperature
                            }
                            onChange={(e) =>
                                setBatchForm((prev) => ({
                                    ...prev,
                                    labQualityControl: {
                                        ...prev.labQualityControl,
                                        temperature:
                                            e.target.value,
                                    },
                                }))
                            }
                        />
                    </div>

                    <div className="manufacturing-form-group">
                        <label>Viscosity (KU)</label>
                        <input
                            type="number"
                            step="any"
                            value={
                                batchForm
                                    .labQualityControl
                                    .viscosity
                            }
                            onChange={(e) =>
                                setBatchForm((prev) => ({
                                    ...prev,
                                    labQualityControl: {
                                        ...prev.labQualityControl,
                                        viscosity:
                                            e.target.value,
                                    },
                                }))
                            }
                        />
                    </div>

                    <div className="manufacturing-form-group">
                        <label>
                            Draw Down Result
                        </label>
                        <input
                            type="text"
                            value={
                                batchForm
                                    .labQualityControl
                                    .drawDownResult
                            }
                            onChange={(e) =>
                                setBatchForm((prev) => ({
                                    ...prev,
                                    labQualityControl: {
                                        ...prev.labQualityControl,
                                        drawDownResult:
                                            e.target.value,
                                    },
                                }))
                            }
                        />
                    </div>

                    <div className="manufacturing-form-group">
                        <label>
                            Hegman Fineness
                        </label>
                        <input
                            type="number"
                            step="any"
                            value={
                                batchForm
                                    .labQualityControl
                                    .hegmanFineness
                            }
                            onChange={(e) =>
                                setBatchForm((prev) => ({
                                    ...prev,
                                    labQualityControl: {
                                        ...prev.labQualityControl,
                                        hegmanFineness:
                                            e.target.value,
                                    },
                                }))
                            }
                        />
                    </div>

                    <div className="manufacturing-form-group full-width">
                        <label>
                            Upload Lab Report
                        </label>
                        <div className="manufacturing-upload-field">
                            <Upload size={15} />
                            <span>
                                {batchForm
                                    .labQualityControl
                                    .labReport ||
                                    "Upload handled by backend file flow"}
                            </span>
                        </div>
                    </div>

                    <div className="manufacturing-form-group full-width">
                        <label>QC Remarks</label>
                        <textarea
                            rows="3"
                            value={
                                batchForm
                                    .labQualityControl
                                    .qcRemarks
                            }
                            onChange={(e) =>
                                setBatchForm((prev) => ({
                                    ...prev,
                                    labQualityControl: {
                                        ...prev.labQualityControl,
                                        qcRemarks:
                                            e.target.value,
                                    },
                                }))
                            }
                        />
                    </div>

                    <div className="manufacturing-form-group">
                        <label>QC Status</label>
                        <select
                            value={
                                batchForm
                                    .labQualityControl
                                    .qcStatus
                            }
                            onChange={(e) =>
                                setBatchForm((prev) => ({
                                    ...prev,
                                    labQualityControl: {
                                        ...prev.labQualityControl,
                                        qcStatus:
                                            e.target.value,
                                    },
                                }))
                            }
                        >
                            <option value="PENDING">
                                Pending
                            </option>
                            <option value="APPROVED">
                                Approved
                            </option>
                            <option value="REJECTED">
                                Rejected
                            </option>
                        </select>
                    </div>

                </div>
            </div>

            <div className="manufacturing-modal-footer">
                <button
                    type="button"
                    className="manufacturing-secondary-btn"
                    onClick={
                        showEditModal
                            ? closeEditModal
                            : closeCreateModal
                    }
                    disabled={savingBatch}
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    className="manufacturing-primary-btn"
                    disabled={savingBatch}
                >
                    <Save size={15} />
                    {savingBatch
                        ? "Saving..."
                        : showEditModal
                            ? "Update Batch"
                            : "Create Batch"}
                </button>
            </div>
        </form>
    );


    // COST VERIFICATION SECTION (shared - used on both tabs)

    const renderCostVerificationSection = () => {
        if (!selectedBatch) return null;

        return (
            <div className="manufacturing-cost-section">

                <div className="manufacturing-card-header">
                    <div>
                        <h2>Batch Cost Verification</h2>
                        <p>{selectedBatch.batchNumber}</p>
                    </div>

                    {costVerification && (
                        <span
                            className={getCostStatusClass(
                                costVerification.approvalStatus
                            )}
                        >
                            {costVerification.approvalStatus}
                        </span>
                    )}
                </div>

                {costLoading ? (
                    <div className="manufacturing-modal-loading">
                        Loading cost verification...
                    </div>
                ) : (
                    <div className="manufacturing-cost-section-grid">

                        <div className="manufacturing-cost-left">

                            {costError && (
                                <div className="manufacturing-inline-error">
                                    {costError}
                                </div>
                            )}

                            <div className="manufacturing-kv-list">

                                <div className="manufacturing-kv-row">
                                    <span>Product</span>
                                    <strong>
                                        {selectedBatch.product
                                            ?.productName || "-"}
                                    </strong>
                                </div>

                                <div className="manufacturing-kv-row">
                                    <span>Batch Number</span>
                                    <strong>
                                        {selectedBatch.batchNumber}
                                    </strong>
                                </div>

                                <div className="manufacturing-kv-row">
                                    <span>Produced Quantity</span>
                                    <strong>
                                        {costVerification
                                            ?.producedQuantity ??
                                            selectedBatch.batchQuantity ??
                                            "-"}{" "}
                                        Ltrs
                                    </strong>
                                </div>

                                <div className="manufacturing-kv-row">
                                    <span>Finished Quantity</span>
                                    <strong>
                                        {costVerification
                                            ?.finishedQuantity ?? "-"}{" "}
                                        Ltrs
                                    </strong>
                                </div>

                                <div className="manufacturing-kv-row">
                                    <span>Cost Comparison</span>
                                    <strong>
                                        {costVerification
                                            ?.costComparison ?? "-"}
                                    </strong>
                                </div>

                                <div className="manufacturing-kv-row">
                                    <span>
                                        Product Cost Verification
                                    </span>
                                    <strong>
                                        {costVerification
                                            ?.productCostVerification ??
                                            "-"}
                                    </strong>
                                </div>

                                <div className="manufacturing-kv-row">
                                    <span>Packing-wise Cost</span>
                                    <strong>
                                        {costVerification
                                            ?.packingWiseCost ?? "-"}
                                    </strong>
                                </div>

                                <div className="manufacturing-kv-row">
                                    <span>Remarks</span>
                                    <strong>
                                        {costVerification
                                            ?.remarks || "-"}
                                    </strong>
                                </div>

                            </div>

                        </div>

                        <div className="manufacturing-cost-right">

                            <h3>Verification Details</h3>

                            {costVerification ? (
                                <div className="manufacturing-kv-list">

                                    <div className="manufacturing-kv-row">
                                        <span>Approval Status</span>
                                        <strong>
                                            {costVerification.approvalStatus}
                                        </strong>
                                    </div>

                                    <div className="manufacturing-kv-row">
                                        <span>Verified By</span>
                                        <strong>
                                            {costVerification.verifiedBy
                                                ?.name || "-"}
                                        </strong>
                                    </div>

                                    <div className="manufacturing-kv-row">
                                        <span>Verified On</span>
                                        <strong>
                                            {costVerification.verifiedOn
                                                ? new Date(
                                                    costVerification.verifiedOn
                                                ).toLocaleString("en-IN")
                                                : "-"}
                                        </strong>
                                    </div>

                                </div>
                            ) : (
                                <p className="manufacturing-muted-text">
                                    No cost verification submitted
                                    yet for this batch.
                                </p>
                            )}

                            <div className="manufacturing-cost-right-actions">

                                {costVerification ? (
                                    <>
                                        <button
                                            type="button"
                                            className="manufacturing-secondary-btn"
                                            onClick={openCostEditModal}
                                            disabled={
                                                costVerification.approvalStatus ===
                                                "VERIFIED"
                                            }
                                        >
                                            <Pencil size={14} />
                                            Edit Verification
                                        </button>

                                        {costVerification.approvalStatus ===
                                            "PENDING" && (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="manufacturing-danger-btn"
                                                        onClick={handleRejectCost}
                                                    >
                                                        <Ban size={14} />
                                                        Reject
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="manufacturing-primary-btn"
                                                        onClick={handleVerifyCost}
                                                    >
                                                        <CheckCircle2 size={14} />
                                                        Save Verification
                                                    </button>
                                                </>
                                            )}
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        className="manufacturing-primary-btn"
                                        onClick={openCostEditModal}
                                    >
                                        <Plus size={14} />
                                        Create Verification
                                    </button>
                                )}

                            </div>

                        </div>

                    </div>
                )}

            </div>
        );
    };

    return (
        <div className="manufacturing-batch-page">

            {/*            HEADER           */}

            <div className="manufacturing-page-header">

                <div>
                    <h1>
                        Manufacturing - Batch Management
                    </h1>

                    <div className="manufacturing-breadcrumb">
                        <span>Dashboard</span>
                        <span>›</span>
                        <span>Manufacturing</span>
                        <span>›</span>
                        <span>
                            Batch Management
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    className="manufacturing-primary-btn"
                    onClick={openCreateModal}
                >
                    <Plus size={16} />
                    Create Batch
                </button>

            </div>

            {/*           STATS               */}

            <div className="manufacturing-stats-grid">

                <div className="manufacturing-stat-card">
                    <div className="manufacturing-stat-icon blue">
                        <Package size={18} />
                    </div>

                    <div>
                        <span>Total Batches</span>
                        <strong>
                            {statsLoading
                                ? "..."
                                : stats.totalBatches}
                        </strong>
                    </div>
                </div>

                <div className="manufacturing-stat-card">
                    <div className="manufacturing-stat-icon orange">
                        <Clock3 size={18} />
                    </div>

                    <div>
                        <span>In Production</span>
                        <strong>
                            {statsLoading
                                ? "..."
                                : stats.inProduction}
                        </strong>
                    </div>
                </div>

                <div className="manufacturing-stat-card">
                    <div className="manufacturing-stat-icon green">
                        <CheckCircle2 size={18} />
                    </div>

                    <div>
                        <span>Completed</span>
                        <strong>
                            {statsLoading
                                ? "..."
                                : stats.completed}
                        </strong>
                    </div>
                </div>

                <div className="manufacturing-stat-card">
                    <div className="manufacturing-stat-icon purple">
                        <ClipboardCheck size={18} />
                    </div>

                    <div>
                        <span>QC Pending</span>
                        <strong>
                            {statsLoading
                                ? "..."
                                : stats.qcPending}
                        </strong>
                    </div>
                </div>

                <div className="manufacturing-stat-card">
                    <div className="manufacturing-stat-icon red">
                        <AlertCircle size={18} />
                    </div>

                    <div>
                        <span>Rejected</span>
                        <strong>
                            {statsLoading
                                ? "..."
                                : stats.rejected}
                        </strong>
                    </div>
                </div>

            </div>

            {/*          FILTER BAR       */}

            <div className="manufacturing-filter-card">

                <div className="manufacturing-date-group">
                    <label>Date Range</label>

                    <div className="manufacturing-date-inputs">
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) =>
                                setDateFrom(e.target.value)
                            }
                        />

                        <span>to</span>

                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) =>
                                setDateTo(e.target.value)
                            }
                        />
                    </div>
                </div>

                <div className="manufacturing-filter-field">
                    <label>Status</label>

                    <select
                        value={selectedStatus}
                        onChange={(e) =>
                            setSelectedStatus(e.target.value)
                        }
                    >
                        <option value="ALL">
                            All Status
                        </option>
                        <option value="PLANNED">
                            Planned
                        </option>
                        <option value="IN_PRODUCTION">
                            In Production
                        </option>
                        <option value="QC_PENDING">
                            QC Pending
                        </option>
                        <option value="COMPLETED">
                            Completed
                        </option>
                        <option value="REJECTED">
                            Rejected
                        </option>
                    </select>
                </div>

                <div className="manufacturing-filter-field">
                    <label>Product</label>

                    <select
                        value={selectedProduct}
                        onChange={(e) =>
                            setSelectedProduct(e.target.value)
                        }
                    >
                        <option value="ALL">
                            All Products
                        </option>

                        {productOptions.map(
                            (product) => (
                                <option
                                    key={product.value}
                                    value={product.value}
                                >
                                    {product.label}
                                </option>
                            )
                        )}
                    </select>
                </div>

                <div className="manufacturing-filter-field">
                    <label>Plant / Unit</label>

                    <select
                        value={selectedPlant}
                        onChange={(e) =>
                            setSelectedPlant(e.target.value)
                        }
                    >
                        <option value="ALL">
                            All Plants / Units
                        </option>

                        {plantOptions.map(
                            (plant) => (
                                <option
                                    key={plant}
                                    value={plant}
                                >
                                    {plant}
                                </option>
                            )
                        )}
                    </select>
                </div>

                <div className="manufacturing-filter-actions">

                    <button
                        type="button"
                        className="manufacturing-filter-btn"
                        onClick={fetchBatches}
                    >
                        <Filter size={15} />
                        Filters
                    </button>

                    <button
                        type="button"
                        className="manufacturing-reset-btn"
                        onClick={
                            handleResetFilters
                        }
                    >
                        <RotateCcw size={14} />
                        Reset
                    </button>

                </div>

            </div>

            {/*  TABS   */}

            <div className="manufacturing-tabs">

                <button
                    type="button"
                    className={
                        activeTab ===
                            "batchManagement"
                            ? "manufacturing-tab active"
                            : "manufacturing-tab"
                    }
                    onClick={() =>
                        setActiveTab(
                            "batchManagement"
                        )
                    }
                >
                    Batch Management
                </button>

                <button
                    type="button"
                    className={
                        activeTab ===
                            "batchCostVerification"
                            ? "manufacturing-tab active"
                            : "manufacturing-tab"
                    }
                    onClick={() =>
                        setActiveTab(
                            "batchCostVerification"
                        )
                    }
                >
                    Batch Cost Verification
                </button>

            </div>


            {/*            BATCH MANAGEMENT TAB           */}


            {activeTab ===
                "batchManagement" && (
                    <>

                        <div className="manufacturing-listing-panel">

                            <div className="manufacturing-panel-header">
                                <div>
                                    <h2>
                                        Batch Listing
                                    </h2>

                                    <p>
                                        Manage complete
                                        production batches
                                    </p>
                                </div>

                                <div className="manufacturing-panel-header-right">

                                    <div className="manufacturing-search-box">
                                        <Search size={13} />
                                        <input
                                            type="text"
                                            placeholder="Search batch..."
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <span className="manufacturing-record-count">
                                        {filteredBatches.length} batches
                                    </span>

                                </div>
                            </div>

                            <div className="manufacturing-table-wrapper">

                                <table className="manufacturing-table">

                                    <thead>
                                        <tr>
                                            <th>Batch No.</th>
                                            <th>Batch Name</th>
                                            <th>Product</th>
                                            <th>Batch Date</th>
                                            <th>Quantity (Ltrs)</th>
                                            <th>Batch Size</th>
                                            <th>Status</th>
                                            <th>Supervisor</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {loading ? (
                                            <tr>
                                                <td
                                                    colSpan="9"
                                                    className="manufacturing-empty-cell"
                                                >
                                                    Loading batches...
                                                </td>
                                            </tr>
                                        ) : error ? (
                                            <tr>
                                                <td
                                                    colSpan="9"
                                                    className="manufacturing-empty-cell"
                                                >
                                                    {error}
                                                </td>
                                            </tr>
                                        ) : filteredBatches.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="9"
                                                    className="manufacturing-empty-cell"
                                                >
                                                    No batches found.
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedBatches.map((batch) => (
                                                <tr
                                                    key={
                                                        batch._id
                                                    }
                                                    onClick={() =>
                                                        setSelectedBatch(
                                                            batch
                                                        )
                                                    }
                                                    className={
                                                        selectedBatch?._id ===
                                                            batch._id
                                                            ? "selected-row"
                                                            : ""
                                                    }
                                                >
                                                    <td>
                                                        <strong>
                                                            {
                                                                batch.batchNumber
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {
                                                            batch.batchName
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            batch.product
                                                                ?.productName ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>
                                                        {batch.batchDate
                                                            ? new Date(
                                                                batch.batchDate
                                                            ).toLocaleDateString(
                                                                "en-IN"
                                                            )
                                                            : "-"}
                                                    </td>

                                                    <td>
                                                        {Number(
                                                            batch.batchQuantity ||
                                                            0
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </td>

                                                    <td>
                                                        {batch.batchSize ===
                                                            "CUSTOM"
                                                            ? `${batch.customBatchSize}kg`
                                                            : batch.batchSize}
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={getStatusClass(
                                                                batch.status
                                                            )}
                                                        >
                                                            {batch.status}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {
                                                            batch
                                                                .supervisor
                                                                ?.name ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>
                                                        <div className="manufacturing-action-group">

                                                            <button
                                                                type="button"
                                                                className="manufacturing-icon-btn"
                                                                title="View"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    handleViewBatch(
                                                                        batch._id
                                                                    );
                                                                }}
                                                            >
                                                                <Eye
                                                                    size={16}
                                                                />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="manufacturing-icon-btn"
                                                                title="Edit"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    openEditBatch(
                                                                        batch._id
                                                                    );
                                                                }}
                                                            >
                                                                <Pencil
                                                                    size={16}
                                                                />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="manufacturing-icon-btn manufacturing-icon-btn-delete"
                                                                onClick={() => handleDeleteBatch(batch._id)}
                                                                disabled={deletingBatch}
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>

                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                            <div className="batch-pagination">
                                <span>
                                    Showing{" "}
                                    {filteredBatches.length === 0 ? 0 : startIndex + 1}{" "}
                                    to{" "}
                                    {Math.min(
                                        startIndex + ITEMS_PER_PAGE,
                                        filteredBatches.length
                                    )}{" "}
                                    of {filteredBatches.length} entries
                                </span>

                                <div className="batch-pagination-controls">
                                    <button
                                        type="button"
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
                                    ).map((page) => (
                                        <button
                                            type="button"
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
                                        type="button"
                                        disabled={
                                            currentPage === totalPages ||
                                            totalPages === 0
                                        }
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.min(totalPages, prev + 1)
                                            )
                                        }
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/*     BATCH DETAILS + LAB QC           */}

                        {selectedBatch ? (
                            <>
                                <div className="manufacturing-details-row">

                                    <div className="manufacturing-details-card">

                                        <div className="manufacturing-card-header">
                                            <div>
                                                <h2>Batch Details</h2>
                                                <span
                                                    className={getStatusClass(
                                                        selectedBatch.status
                                                    )}
                                                >
                                                    {selectedBatch.status}
                                                </span>
                                            </div>

                                            <div className="manufacturing-card-header-actions">
                                                <button
                                                    type="button"
                                                    className="manufacturing-secondary-btn"
                                                    onClick={() =>
                                                        openEditBatch(
                                                            selectedBatch._id
                                                        )
                                                    }
                                                >
                                                    <Pencil size={14} />
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="manufacturing-primary-btn"
                                                    disabled={
                                                        selectedBatch.status ===
                                                        "COMPLETED"
                                                    }
                                                    onClick={() =>
                                                        handleCloseBatch(
                                                            selectedBatch._id
                                                        )
                                                    }
                                                >
                                                    <CheckCircle2 size={14} />
                                                    Close Batch
                                                </button>
                                            </div>
                                        </div>

                                        <div className="manufacturing-detail-section">

                                            <h3>1. Batch Information</h3>

                                            <div className="manufacturing-detail-grid">

                                                <div>
                                                    <span>Batch Number</span>
                                                    <strong>
                                                        {selectedBatch.batchNumber}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Batch Date</span>
                                                    <strong>
                                                        {selectedBatch.batchDate
                                                            ? new Date(
                                                                selectedBatch.batchDate
                                                            ).toLocaleDateString(
                                                                "en-IN"
                                                            )
                                                            : "-"}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Batch Name</span>
                                                    <strong>
                                                        {selectedBatch.batchName}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Product</span>
                                                    <strong>
                                                        {selectedBatch.product
                                                            ?.productName || "-"}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Supervisor</span>
                                                    <strong>
                                                        {selectedBatch.supervisor
                                                            ?.name || "-"}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Plant / Unit</span>
                                                    <strong>
                                                        {selectedBatch.plantUnit}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Start Time</span>
                                                    <strong>
                                                        {selectedBatch.batchStartTime
                                                            ? new Date(
                                                                selectedBatch.batchStartTime
                                                            ).toLocaleString(
                                                                "en-IN"
                                                            )
                                                            : "-"}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>End Time</span>
                                                    <strong>
                                                        {selectedBatch.batchEndTime
                                                            ? new Date(
                                                                selectedBatch.batchEndTime
                                                            ).toLocaleString(
                                                                "en-IN"
                                                            )
                                                            : "-"}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Batch Quantity</span>
                                                    <strong>
                                                        {selectedBatch.batchQuantity}{" "}
                                                        Ltrs
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Batch Size</span>
                                                    <strong>
                                                        {selectedBatch.batchSize ===
                                                            "CUSTOM"
                                                            ? `${selectedBatch.customBatchSize}kg`
                                                            : selectedBatch.batchSize}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Operators</span>
                                                    <strong>
                                                        {
                                                            selectedBatch.numberOfOperators
                                                        }
                                                    </strong>
                                                </div>

                                                <div className="full-width-detail">
                                                    <span>Remarks</span>
                                                    <strong>
                                                        {selectedBatch.remarks ||
                                                            "-"}
                                                    </strong>
                                                </div>

                                            </div>

                                        </div>

                                        <div className="manufacturing-detail-section">

                                            <div className="manufacturing-section-heading">
                                                <h3>Packing Details</h3>

                                                <span>
                                                    Label:{" "}
                                                    {selectedBatch.labelVerification
                                                        ? "Verified"
                                                        : "Pending"}
                                                </span>
                                            </div>

                                            <div className="manufacturing-packing-table">

                                                {(
                                                    selectedBatch.packingDetails ||
                                                    []
                                                ).map((item) => (
                                                    <div
                                                        className="manufacturing-packing-row"
                                                        key={item.packingSize}
                                                    >
                                                        <strong>
                                                            {item.packingSize}
                                                        </strong>

                                                        <span>
                                                            Planned:{" "}
                                                            {item.plannedQuantity}
                                                        </span>

                                                        <span>
                                                            Produced:{" "}
                                                            {item.producedQuantity}
                                                        </span>

                                                        <span
                                                            className={
                                                                item.labelVerified
                                                                    ? "label-success"
                                                                    : "label-pending"
                                                            }
                                                        >
                                                            {item.labelVerified
                                                                ? "Verified"
                                                                : "Pending"}
                                                        </span>
                                                    </div>
                                                ))}

                                            </div>

                                        </div>

                                        <div className="manufacturing-detail-section">

                                            <h3>Batch Status</h3>

                                            <div className="manufacturing-detail-grid">

                                                <div>
                                                    <span>Current Status</span>
                                                    <strong>
                                                        {selectedBatch.status}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Batch Closed On</span>
                                                    <strong>
                                                        {selectedBatch.closedOn
                                                            ? new Date(
                                                                selectedBatch.closedOn
                                                            ).toLocaleString(
                                                                "en-IN"
                                                            )
                                                            : "-"}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Closed By</span>
                                                    <strong>
                                                        {selectedBatch.closedBy
                                                            ?.name || "-"}
                                                    </strong>
                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                    <div className="manufacturing-qc-card">

                                        <div className="manufacturing-card-header">
                                            <div>
                                                <h2>Lab Quality Control</h2>
                                            </div>

                                            <div className="manufacturing-card-header-actions">
                                                <span
                                                    className={
                                                        selectedBatch
                                                            .labQualityControl
                                                            ?.qcStatus ===
                                                            "APPROVED"
                                                            ? "manufacturing-cost-status verified"
                                                            : selectedBatch
                                                                .labQualityControl
                                                                ?.qcStatus ===
                                                                "REJECTED"
                                                                ? "manufacturing-cost-status rejected"
                                                                : "manufacturing-cost-status pending"
                                                    }
                                                >
                                                    {selectedBatch
                                                        .labQualityControl
                                                        ?.qcStatus || "PENDING"}
                                                </span>

                                                <button
                                                    type="button"
                                                    className="manufacturing-secondary-btn"
                                                    onClick={() =>
                                                        openQcModal(
                                                            selectedBatch
                                                        )
                                                    }
                                                >
                                                    <ClipboardCheck size={14} />
                                                    Update QC
                                                </button>
                                            </div>
                                        </div>

                                        <div className="manufacturing-detail-section">

                                            <div className="manufacturing-kv-list">

                                                <div className="manufacturing-kv-row">
                                                    <span>
                                                        Capture Date & Time
                                                    </span>
                                                    <strong>
                                                        {selectedBatch
                                                            .labQualityControl
                                                            ?.captureDateTime
                                                            ? new Date(
                                                                selectedBatch
                                                                    .labQualityControl
                                                                    .captureDateTime
                                                            ).toLocaleString(
                                                                "en-IN"
                                                            )
                                                            : "-"}
                                                    </strong>
                                                </div>

                                                <div className="manufacturing-kv-row">
                                                    <span>Wet per Litre</span>
                                                    <strong>
                                                        {selectedBatch
                                                            .labQualityControl
                                                            ?.wetPerLitre ?? "-"}
                                                    </strong>
                                                </div>

                                                <div className="manufacturing-kv-row">
                                                    <span>
                                                        Temperature (°C)
                                                    </span>
                                                    <strong>
                                                        {selectedBatch
                                                            .labQualityControl
                                                            ?.temperature ?? "-"}
                                                    </strong>
                                                </div>

                                                <div className="manufacturing-kv-row">
                                                    <span>Viscosity (KU)</span>
                                                    <strong>
                                                        {selectedBatch
                                                            .labQualityControl
                                                            ?.viscosity ?? "-"}
                                                    </strong>
                                                </div>

                                                <div className="manufacturing-kv-row">
                                                    <span>
                                                        Draw Down Result
                                                    </span>
                                                    <strong>
                                                        {selectedBatch
                                                            .labQualityControl
                                                            ?.drawDownResult ||
                                                            "-"}
                                                    </strong>
                                                </div>

                                                <div className="manufacturing-kv-row">
                                                    <span>
                                                        Hegman Fineness
                                                    </span>
                                                    <strong>
                                                        {selectedBatch
                                                            .labQualityControl
                                                            ?.hegmanFineness ??
                                                            "-"}
                                                    </strong>
                                                </div>

                                                <div className="manufacturing-kv-row">
                                                    <span>Lab Report</span>
                                                    <strong>
                                                        {selectedBatch
                                                            .labQualityControl
                                                            ?.labReport ? (
                                                            <span className="manufacturing-file-link">
                                                                <FileText
                                                                    size={13}
                                                                />
                                                                {
                                                                    selectedBatch
                                                                        .labQualityControl
                                                                        .labReport
                                                                }
                                                            </span>
                                                        ) : (
                                                            "-"
                                                        )}
                                                    </strong>
                                                </div>

                                                <div className="manufacturing-kv-row">
                                                    <span>QC Remarks</span>
                                                    <strong>
                                                        {selectedBatch
                                                            .labQualityControl
                                                            ?.qcRemarks || "-"}
                                                    </strong>
                                                </div>

                                                <div className="manufacturing-kv-row">
                                                    <span>Approved By</span>
                                                    <strong>
                                                        {selectedBatch
                                                            .labQualityControl
                                                            ?.approvedBy
                                                            ?.name || "-"}
                                                    </strong>
                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                                {renderCostVerificationSection()}
                            </>
                        ) : (
                            <div className="manufacturing-no-selection manufacturing-no-selection-standalone">
                                <Package size={28} />
                                <h3>Select a Batch</h3>
                                <p>
                                    Select a batch from the table
                                    above to view complete batch
                                    details and cost verification.
                                </p>
                            </div>
                        )}

                    </>
                )}

            {/*             COST VERIFICATION TAB           */}

            {activeTab ===
                "batchCostVerification" && (
                    <div className="manufacturing-cost-panel">

                        <div className="manufacturing-cost-layout">

                            <div className="manufacturing-cost-batch-list">

                                <h3>
                                    Batches
                                </h3>

                                {batches.length === 0 ? (
                                    <div className="manufacturing-empty-small">
                                        No batches available.
                                    </div>
                                ) : (
                                    batches.map((batch) => (
                                        <button
                                            type="button"
                                            key={batch._id}
                                            className={
                                                selectedBatch?._id ===
                                                    batch._id
                                                    ? "manufacturing-cost-batch active"
                                                    : "manufacturing-cost-batch"
                                            }
                                            onClick={() =>
                                                openCostVerification(
                                                    batch
                                                )
                                            }
                                        >
                                            <span>
                                                <strong>
                                                    {
                                                        batch.batchNumber
                                                    }
                                                </strong>

                                                <small>
                                                    {
                                                        batch.batchName
                                                    }
                                                </small>
                                            </span>

                                            <ChevronDown
                                                size={15}
                                            />
                                        </button>
                                    ))
                                )}

                            </div>

                            <div className="manufacturing-cost-details">

                                {!selectedBatch ? (
                                    <div className="manufacturing-no-selection">
                                        <ClipboardCheck
                                            size={28}
                                        />

                                        <h3>
                                            Select a Batch
                                        </h3>

                                        <p>
                                            Select a batch to view
                                            cost verification details.
                                        </p>
                                    </div>
                                ) : (
                                    renderCostVerificationSection()
                                )}

                            </div>

                        </div>

                    </div>
                )}

            {/*                CREATE / EDIT BATCH MODAL            */}

            {(showCreateModal ||
                showEditModal) && (
                    <div
                        className="manufacturing-modal-overlay"
                        onClick={
                            showEditModal
                                ? closeEditModal
                                : closeCreateModal
                        }
                    >
                        <div
                            className="manufacturing-modal large"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="manufacturing-modal-header">

                                <div>
                                    <h2>
                                        {showEditModal
                                            ? "Edit Batch"
                                            : "Create Batch"}
                                    </h2>

                                    <p>
                                        {showEditModal
                                            ? "Update production batch details"
                                            : "Create a new production batch"}
                                    </p>
                                </div>

                            </div>

                            {renderBatchForm()}

                        </div>
                    </div>
                )}

            {/*                VIEW BATCH MODAL            */}

            {showViewModal && (
                <div
                    className="manufacturing-modal-overlay"
                    onClick={() =>
                        setShowViewModal(false)
                    }
                >
                    <div
                        className="manufacturing-modal large"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="manufacturing-modal-header">

                            <div>
                                <h2>
                                    Batch Details
                                </h2>

                                <p>
                                    Complete production batch
                                    information
                                </p>
                            </div>

                        </div>

                        {detailsLoading ? (
                            <div className="manufacturing-modal-loading">
                                Loading batch details...
                            </div>
                        ) : selectedBatch ? (
                            <div className="manufacturing-view-content">

                                <div className="manufacturing-detail-section">
                                    <h3>
                                        Batch Information
                                    </h3>

                                    <div className="manufacturing-detail-grid">

                                        <div>
                                            <span>Batch Number</span>
                                            <strong>
                                                {
                                                    selectedBatch.batchNumber
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Batch Date</span>
                                            <strong>
                                                {
                                                    selectedBatch.batchDate
                                                        ? new Date(
                                                            selectedBatch.batchDate
                                                        ).toLocaleDateString(
                                                            "en-IN"
                                                        )
                                                        : "-"
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Batch Name</span>
                                            <strong>
                                                {
                                                    selectedBatch.batchName
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Product</span>
                                            <strong>
                                                {
                                                    selectedBatch
                                                        .product
                                                        ?.productName ||
                                                    "-"
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Supervisor</span>
                                            <strong>
                                                {
                                                    selectedBatch
                                                        .supervisor
                                                        ?.name ||
                                                    "-"
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Plant / Unit</span>
                                            <strong>
                                                {
                                                    selectedBatch.plantUnit
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Start Time</span>
                                            <strong>
                                                {
                                                    selectedBatch.batchStartTime
                                                        ? new Date(
                                                            selectedBatch.batchStartTime
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )
                                                        : "-"
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>End Time</span>
                                            <strong>
                                                {
                                                    selectedBatch.batchEndTime
                                                        ? new Date(
                                                            selectedBatch.batchEndTime
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )
                                                        : "-"
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Batch Quantity
                                            </span>
                                            <strong>
                                                {
                                                    selectedBatch.batchQuantity
                                                } Ltrs
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Batch Size</span>
                                            <strong>
                                                {selectedBatch.batchSize ===
                                                    "CUSTOM"
                                                    ? `${selectedBatch.customBatchSize}kg`
                                                    : selectedBatch.batchSize}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Number of Operators
                                            </span>
                                            <strong>
                                                {
                                                    selectedBatch.numberOfOperators
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Status</span>
                                            <strong>
                                                <span
                                                    className={getStatusClass(
                                                        selectedBatch.status
                                                    )}
                                                >
                                                    {
                                                        selectedBatch.status
                                                    }
                                                </span>
                                            </strong>
                                        </div>

                                        <div className="full-width-detail">
                                            <span>Remarks</span>
                                            <strong>
                                                {
                                                    selectedBatch.remarks ||
                                                    "-"
                                                }
                                            </strong>
                                        </div>

                                    </div>
                                </div>

                                <div className="manufacturing-detail-section">

                                    <h3>
                                        Packing Details
                                    </h3>

                                    <div className="manufacturing-packing-table">

                                        {(
                                            selectedBatch.packingDetails ||
                                            []
                                        ).map((item) => (
                                            <div
                                                className="manufacturing-packing-row"
                                                key={item.packingSize}
                                            >
                                                <strong>
                                                    {item.packingSize}
                                                </strong>

                                                <span>
                                                    Planned:{" "}
                                                    {
                                                        item.plannedQuantity
                                                    }
                                                </span>

                                                <span>
                                                    Produced:{" "}
                                                    {
                                                        item.producedQuantity
                                                    }
                                                </span>

                                                <span>
                                                    Label:
                                                    {" "}
                                                    {item.labelVerified
                                                        ? "Verified"
                                                        : "Pending"}
                                                </span>
                                            </div>
                                        ))}

                                    </div>

                                </div>

                                <div className="manufacturing-detail-section">

                                    <h3>
                                        Lab Quality Control
                                    </h3>

                                    <div className="manufacturing-detail-grid">

                                        <div>
                                            <span>
                                                Wet per Litre
                                            </span>
                                            <strong>
                                                {
                                                    selectedBatch
                                                        .labQualityControl
                                                        ?.wetPerLitre ??
                                                    "-"
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Temperature
                                            </span>
                                            <strong>
                                                {
                                                    selectedBatch
                                                        .labQualityControl
                                                        ?.temperature ??
                                                    "-"
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Viscosity
                                            </span>
                                            <strong>
                                                {
                                                    selectedBatch
                                                        .labQualityControl
                                                        ?.viscosity ??
                                                    "-"
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Hegman Fineness
                                            </span>
                                            <strong>
                                                {
                                                    selectedBatch
                                                        .labQualityControl
                                                        ?.hegmanFineness ??
                                                    "-"
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Draw Down Result
                                            </span>
                                            <strong>
                                                {
                                                    selectedBatch
                                                        .labQualityControl
                                                        ?.drawDownResult ||
                                                    "-"
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                QC Status
                                            </span>
                                            <strong>
                                                {
                                                    selectedBatch
                                                        .labQualityControl
                                                        ?.qcStatus ||
                                                    "-"
                                                }
                                            </strong>
                                        </div>

                                        <div className="full-width-detail">
                                            <span>
                                                Lab Report
                                            </span>
                                            <strong>
                                                {
                                                    selectedBatch
                                                        .labQualityControl
                                                        ?.labReport ||
                                                    "-"
                                                }
                                            </strong>
                                        </div>

                                        <div className="full-width-detail">
                                            <span>
                                                QC Remarks
                                            </span>
                                            <strong>
                                                {
                                                    selectedBatch
                                                        .labQualityControl
                                                        ?.qcRemarks ||
                                                    "-"
                                                }
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                                <div className="view-mb-footer">
                                <button
                                    type="button"
                                    className="view-mb-close-bottom"
                                    onClick={() =>
                                        setShowViewModal(false)
                                    }
                                >
                                    Close
                                </button>
                                </div>

                            </div>
                        ) : (
                            <div className="manufacturing-modal-loading">
                                Batch details not found.
                            </div>
                        )}

                    </div>
                </div>
            )}

            {/*      
          QC MODAL
            */}

            {showQcModal && (
                <div
                    className="manufacturing-modal-overlay"
                    onClick={() =>
                        !savingQc &&
                        setShowQcModal(false)
                    }
                >
                    <div
                        className="manufacturing-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="manufacturing-modal-header">
                            <div>
                                <h2>
                                    Lab Quality Control
                                </h2>

                                <p>
                                    Update batch QC results
                                </p>
                            </div>

                            <button
                                type="button"
                                className="manufacturing-close-btn"
                                onClick={() =>
                                    setShowQcModal(false)
                                }
                                disabled={savingQc}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            className="manufacturing-modal-form"
                            onSubmit={handleUpdateQc}
                        >

                            <div className="manufacturing-form-grid">

                                <div className="manufacturing-form-group">
                                    <label>
                                        Capture Date & Time
                                    </label>

                                    <input
                                        type="datetime-local"
                                        name="captureDateTime"
                                        value={
                                            qcForm.captureDateTime
                                        }
                                        onChange={handleQcChange}
                                    />
                                </div>

                                <div className="manufacturing-form-group">
                                    <label>
                                        Wet per Litre
                                    </label>

                                    <input
                                        type="number"
                                        step="any"
                                        name="wetPerLitre"
                                        value={
                                            qcForm.wetPerLitre
                                        }
                                        onChange={handleQcChange}
                                    />
                                </div>

                                <div className="manufacturing-form-group">
                                    <label>
                                        Temperature (°C)
                                    </label>

                                    <input
                                        type="number"
                                        step="any"
                                        name="temperature"
                                        value={
                                            qcForm.temperature
                                        }
                                        onChange={handleQcChange}
                                    />
                                </div>

                                <div className="manufacturing-form-group">
                                    <label>
                                        Viscosity (KU)
                                    </label>

                                    <input
                                        type="number"
                                        step="any"
                                        name="viscosity"
                                        value={
                                            qcForm.viscosity
                                        }
                                        onChange={handleQcChange}
                                    />
                                </div>

                                <div className="manufacturing-form-group">
                                    <label>
                                        Draw Down Result
                                    </label>

                                    <input
                                        type="text"
                                        name="drawDownResult"
                                        value={
                                            qcForm.drawDownResult
                                        }
                                        onChange={handleQcChange}
                                    />
                                </div>

                                <div className="manufacturing-form-group">
                                    <label>
                                        Hegman Fineness
                                    </label>

                                    <input
                                        type="number"
                                        step="any"
                                        name="hegmanFineness"
                                        value={
                                            qcForm.hegmanFineness
                                        }
                                        onChange={handleQcChange}
                                    />
                                </div>

                                <div className="manufacturing-form-group">
                                    <label>
                                        Lab Report
                                    </label>

                                    <div className="manufacturing-upload-field">
                                        <Upload size={15} />
                                        <span>
                                            {qcForm.labReport ||
                                                "Upload file path / report"}
                                        </span>
                                    </div>
                                </div>

                                <div className="manufacturing-form-group">
                                    <label>
                                        QC Status
                                    </label>

                                    <select
                                        name="qcStatus"
                                        value={
                                            qcForm.qcStatus
                                        }
                                        onChange={handleQcChange}
                                    >
                                        <option value="PENDING">
                                            Pending
                                        </option>

                                        <option value="APPROVED">
                                            Approved
                                        </option>

                                        <option value="REJECTED">
                                            Rejected
                                        </option>
                                    </select>
                                </div>

                                <div className="manufacturing-form-group full-width">
                                    <label>
                                        QC Remarks
                                    </label>

                                    <textarea
                                        name="qcRemarks"
                                        rows="4"
                                        value={
                                            qcForm.qcRemarks
                                        }
                                        onChange={handleQcChange}
                                    />
                                </div>

                            </div>

                            <div className="manufacturing-modal-footer">

                                <button
                                    type="button"
                                    className="manufacturing-secondary-btn"
                                    onClick={() =>
                                        setShowQcModal(false)
                                    }
                                    disabled={savingQc}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="manufacturing-primary-btn"
                                    disabled={savingQc}
                                >
                                    <Save size={14} />
                                    {savingQc
                                        ? "Saving..."
                                        : "Save QC"}
                                </button>

                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/*               COST VERIFICATION MODAL            */}

            {showCostModal && (
                <div
                    className="manufacturing-modal-overlay"
                    onClick={() =>
                        !savingCost &&
                        setShowCostModal(false)
                    }
                >
                    <div
                        className="manufacturing-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="manufacturing-modal-header">

                            <div>
                                <h2>
                                    Batch Cost Verification
                                </h2>

                                <p>
                                    {
                                        selectedBatch?.batchNumber ||
                                        ""
                                    }
                                </p>
                            </div>

                            <button
                                type="button"
                                className="manufacturing-close-btn"
                                onClick={() =>
                                    setShowCostModal(false)
                                }
                                disabled={savingCost}
                            >
                                <X size={18} />
                            </button>

                        </div>

                        <form
                            className="manufacturing-modal-form"
                            onSubmit={
                                handleSaveCostVerification
                            }
                        >

                            <div className="manufacturing-form-grid">

                                <div className="manufacturing-form-group">
                                    <label>
                                        Produced Quantity
                                    </label>
                                    <input
                                        type="number"
                                        name="producedQuantity"
                                        value={
                                            costForm.producedQuantity
                                        }
                                        onChange={
                                            handleCostChange
                                        }
                                        min="0"
                                        required
                                    />
                                </div>

                                <div className="manufacturing-form-group">
                                    <label>
                                        Finished Quantity
                                    </label>
                                    <input
                                        type="number"
                                        name="finishedQuantity"
                                        value={
                                            costForm.finishedQuantity
                                        }
                                        onChange={
                                            handleCostChange
                                        }
                                        min="0"
                                        required
                                    />
                                </div>

                                <div className="manufacturing-form-group">
                                    <label>
                                        Cost Comparison
                                    </label>
                                    <input
                                        type="number"
                                        name="costComparison"
                                        value={
                                            costForm.costComparison
                                        }
                                        onChange={
                                            handleCostChange
                                        }
                                        min="0"
                                    />
                                </div>

                                <div className="manufacturing-form-group">
                                    <label>
                                        Product Cost Verification
                                    </label>
                                    <input
                                        type="number"
                                        name="productCostVerification"
                                        value={
                                            costForm.productCostVerification
                                        }
                                        onChange={
                                            handleCostChange
                                        }
                                        min="0"
                                    />
                                </div>

                                <div className="manufacturing-form-group">
                                    <label>
                                        Packing-wise Cost
                                    </label>
                                    <input
                                        type="number"
                                        name="packingWiseCost"
                                        value={
                                            costForm.packingWiseCost
                                        }
                                        onChange={
                                            handleCostChange
                                        }
                                        min="0"
                                    />
                                </div>

                                <div className="manufacturing-form-group full-width">
                                    <label>
                                        Remarks
                                    </label>

                                    <textarea
                                        name="remarks"
                                        rows="4"
                                        value={
                                            costForm.remarks
                                        }
                                        onChange={
                                            handleCostChange
                                        }
                                    />
                                </div>

                            </div>

                            <div className="manufacturing-modal-footer">

                                <button
                                    type="button"
                                    className="manufacturing-secondary-btn"
                                    onClick={() =>
                                        setShowCostModal(false)
                                    }
                                    disabled={savingCost}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="manufacturing-primary-btn"
                                    disabled={savingCost}
                                >
                                    <Save size={14} />
                                    {savingCost
                                        ? "Saving..."
                                        : "Save Verification"}
                                </button>

                            </div>

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ManufacturingBatchManagement;