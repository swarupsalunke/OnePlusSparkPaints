import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Download,
    Edit,
    Plus,
    Eye,
    FileSpreadsheet,
    Filter,
    MoreVertical,
    RefreshCw,
    Search,
    Trash2,
    X,
    CheckCircle2,
    WalletCards,
    FileText,
    Clock3,
} from "lucide-react";
import "../../css/superadmin/BankPaymentSheet.css";

const API_URL = "https://oneplussparkpaintsserver.onrender.com/api/bank-payments";

const BankPaymentSheet = () => {
    const [payments, setPayments] = useState([]);
    const [dashboard, setDashboard] = useState({
        totalBeneficiaries: 0,
        totalAmount: 0,
        totalTransactions: 0,
    });

    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [bankFilter, setBankFilter] = useState("");

    const [selectedIds, setSelectedIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [showFilter, setShowFilter] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    const [selectedPayment, setSelectedPayment] = useState(null);
    const [editForm, setEditForm] = useState(null);

    const [addForm, setAddForm] = useState({
        beneficiaryName: "",
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        amount: "",
        remarks: "",
    });

    const [generateForm, setGenerateForm] = useState({
        paymentDate: "",
        bankAccount: "",
        paymentType: "Reward Payment",
        remarks: "",
    });

    /* =====================================================
       GET PAYMENTS
    ===================================================== */

    const fetchPayments = async () => {
        try {
            setLoading(true);

            const response = await axios.get(API_URL);

            setPayments(response.data.payments || []);
        } catch (error) {
            console.error("Get payments error:", error);
            alert(
                error.response?.data?.message ||
                "Failed to load payment beneficiaries"
            );
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       GET DASHBOARD
    ===================================================== */

    const fetchDashboard = async () => {
        try {
            const response = await axios.get(`${API_URL}/dashboard`);

            if (response.data.dashboard) {
                setDashboard(response.data.dashboard);
            }
        } catch (error) {
            console.error("Dashboard error:", error);
        }
    };

    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {
        fetchPayments();
        fetchDashboard();
    }, []);

    /* =====================================================
       REFRESH
    ===================================================== */

    const handleRefresh = async () => {
        setSearch("");
        setBankFilter("");
        setSelectedIds([]);
        setCurrentPage(1);

        await Promise.all([
            fetchPayments(),
            fetchDashboard(),
        ]);
    };

    /* =====================================================
       FILTER DATA
    ===================================================== */

    const bankNames = useMemo(() => {
        return [
            ...new Set(
                payments
                    .map((payment) => payment.bankName)
                    .filter(Boolean)
            ),
        ];
    }, [payments]);

    const filteredPayments = useMemo(() => {
        const searchValue = search.toLowerCase().trim();

        return payments.filter((payment) => {
            const matchesSearch =
                !searchValue ||
                payment.beneficiaryName
                    ?.toLowerCase()
                    .includes(searchValue) ||
                payment.bankName
                    ?.toLowerCase()
                    .includes(searchValue) ||
                payment.accountNumber
                    ?.toLowerCase()
                    .includes(searchValue) ||
                payment.ifscCode
                    ?.toLowerCase()
                    .includes(searchValue) ||
                payment.remarks
                    ?.toLowerCase()
                    .includes(searchValue);

            const matchesBank =
                !bankFilter ||
                payment.bankName === bankFilter;

            return matchesSearch && matchesBank;
        });
    }, [payments, search, bankFilter]);

    /* =====================================================
       PAGINATION
    ===================================================== */

    const totalPages = Math.max(
        1,
        Math.ceil(filteredPayments.length / rowsPerPage)
    );

    const paginatedPayments = filteredPayments.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    /* =====================================================
       SELECTION
    ===================================================== */

    const selectedPayments = payments.filter((payment) =>
        selectedIds.includes(payment._id)
    );

    const selectedAmount = selectedPayments.reduce(
        (total, payment) =>
            total + Number(payment.amount || 0),
        0
    );

    const isAllSelected =
        paginatedPayments.length > 0 &&
        paginatedPayments.every((payment) =>
            selectedIds.includes(payment._id)
        );

    const handleSelectAll = () => {
        const currentIds = paginatedPayments.map(
            (payment) => payment._id
        );

        if (isAllSelected) {
            setSelectedIds((prev) =>
                prev.filter((id) => !currentIds.includes(id))
            );
        } else {
            setSelectedIds((prev) => [
                ...new Set([...prev, ...currentIds]),
            ]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    /* =====================================================
       ADD BENEFICIARY
    ===================================================== */

    const handleAddChange = (e) => {
        const { name, value } = e.target;
        setAddForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddBeneficiary = async () => {
        if (!addForm.beneficiaryName.trim()) {
            alert("Beneficiary Name is required");
            return;
        }
        if (!addForm.bankName.trim()) {
            alert("Bank Name is required");
            return;
        }
        if (!addForm.accountNumber.trim()) {
            alert("Account Number is required");
            return;
        }
        if (!addForm.ifscCode.trim()) {
            alert("IFSC Code is required");
            return;
        }
        if (!addForm.amount || Number(addForm.amount) <= 0) {
            alert("Valid Amount is required");
            return;
        }

        try {
            setLoading(true);

            await axios.post(API_URL, {
                beneficiaryName: addForm.beneficiaryName.trim(),
                bankName: addForm.bankName.trim(),
                accountNumber: addForm.accountNumber.trim(),
                ifscCode: addForm.ifscCode.trim(),
                amount: Number(addForm.amount),
                remarks: addForm.remarks.trim(),
            });

            setAddForm({
                beneficiaryName: "",
                bankName: "",
                accountNumber: "",
                ifscCode: "",
                amount: "",
                remarks: "",
            });

            setShowAddModal(false);
            await fetchPayments();
            await fetchDashboard();
        } catch (error) {
            console.error("Add beneficiary error:", error);
            alert(error.response?.data?.message || "Failed to add beneficiary");
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       VIEW
    ===================================================== */

    const handleView = async (payment) => {
        try {
            const response = await axios.get(
                `${API_URL}/${payment._id}`
            );

            setSelectedPayment(
                response.data.payment || payment
            );

            setShowViewModal(true);
            setShowMoreMenu(null);
        } catch (error) {
            console.error("View payment error:", error);
            alert(
                error.response?.data?.message ||
                "Failed to get payment details"
            );
        }
    };

    /* =====================================================
       EDIT
    ===================================================== */

    const handleEdit = (payment) => {
        setEditForm({
            _id: payment._id,
            beneficiaryName: payment.beneficiaryName || "",
            bankName: payment.bankName || "",
            accountNumber: payment.accountNumber || "",
            ifscCode: payment.ifscCode || "",
            amount: payment.amount || "",
            remarks: payment.remarks || "",
            paymentDate: payment.paymentDate
                ? payment.paymentDate.substring(0, 10)
                : "",
            bankAccount: payment.bankAccount || "",
            paymentType: payment.paymentType || "Reward Payment",
        });

        setShowEditModal(true);
        setShowMoreMenu(null);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;

        setEditForm((prev) => ({
            ...prev,
            [name]: name === "amount" ? Number(value) : value,
        }));
    };

    const handleUpdatePayment = async () => {
        if (!editForm) return;

        try {
            setLoading(true);

            await axios.put(
                `${API_URL}/${editForm._id}`,
                {
                    beneficiaryName: editForm.beneficiaryName,
                    bankName: editForm.bankName,
                    accountNumber: editForm.accountNumber,
                    ifscCode: editForm.ifscCode,
                    amount: editForm.amount,
                    remarks: editForm.remarks,
                    paymentDate: editForm.paymentDate,
                    bankAccount: editForm.bankAccount,
                    paymentType: editForm.paymentType,
                }
            );

            setShowEditModal(false);
            setEditForm(null);

            await fetchPayments();
            await fetchDashboard();
        } catch (error) {
            console.error("Update payment error:", error);
            alert(
                error.response?.data?.message ||
                "Failed to update beneficiary"
            );
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       DELETE
    ===================================================== */

    const handleDelete = (payment) => {
        setSelectedPayment(payment);
        setShowDeleteModal(true);
        setShowMoreMenu(null);
    };

    const confirmDelete = async () => {
        if (!selectedPayment) return;

        try {
            setLoading(true);

            await axios.delete(
                `${API_URL}/${selectedPayment._id}`
            );

            setSelectedIds((prev) =>
                prev.filter(
                    (id) => id !== selectedPayment._id
                )
            );

            setShowDeleteModal(false);
            setSelectedPayment(null);

            await fetchPayments();
            await fetchDashboard();
        } catch (error) {
            console.error("Delete payment error:", error);
            alert(
                error.response?.data?.message ||
                "Failed to delete beneficiary"
            );
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       GENERATE FORM
    ===================================================== */

    const handleGenerateChange = (e) => {
        const { name, value } = e.target;

        setGenerateForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /* =====================================================
       GENERATE EXCEL
    ===================================================== */

    const handleGenerateSheet = async () => {
        if (!generateForm.paymentDate) {
            alert("Payment Date is required");
            return;
        }

        if (!generateForm.bankAccount) {
            alert("Bank Account is required");
            return;
        }

        if (selectedIds.length === 0) {
            alert("Please select at least one beneficiary");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                `${API_URL}/generate`,
                {
                    paymentDate: generateForm.paymentDate,
                    bankAccount: generateForm.bankAccount,
                    paymentType: generateForm.paymentType,
                    remarks: generateForm.remarks,
                    paymentIds: selectedIds,
                },
                {
                    responseType: "blob",
                }
            );

            const blob = new Blob([response.data], {
                type:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;
            link.download = "bank-payment-sheet.xlsx";

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);

            setShowGenerateModal(false);
        } catch (error) {
            console.error("Generate sheet error:", error);

            if (error.response?.data instanceof Blob) {
                try {
                    const text = await error.response.data.text();
                    const data = JSON.parse(text);

                    alert(data.message || "Failed to generate sheet");
                } catch {
                    alert("Failed to generate payment sheet");
                }
            } else {
                alert(
                    error.response?.data?.message ||
                    "Failed to generate payment sheet"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       SINGLE ROW EXCEL
    ===================================================== */

    const handleSingleExcel = async (payment) => {
        try {
            setLoading(true);

            const response = await axios.post(
                `${API_URL}/generate`,
                {
                    paymentDate: payment.paymentDate
                        ? payment.paymentDate.substring(0, 10)
                        : new Date().toISOString().substring(0, 10),
                    bankAccount:
                        payment.bankAccount || "HDFC Reward Account",
                    paymentType:
                        payment.paymentType || "Reward Payment",
                    remarks: payment.remarks || "",
                    paymentIds: [payment._id],
                },
                {
                    responseType: "blob",
                }
            );

            const blob = new Blob([response.data], {
                type:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;

            link.download = `${payment.beneficiaryName}-payment.xlsx`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);

            setShowMoreMenu(null);
        } catch (error) {
            console.error("Single Excel error:", error);
            alert("Failed to download Excel file");
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       DOWNLOAD SELECTED / ALL EXCEL
    ===================================================== */

    const handleDownloadExcel = async () => {
        const ids =
            selectedIds.length > 0
                ? selectedIds
                : payments.map((payment) => payment._id);

        if (ids.length === 0) {
            alert("No beneficiaries available");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                `${API_URL}/generate`,
                {
                    paymentDate:
                        generateForm.paymentDate ||
                        new Date().toISOString().substring(0, 10),

                    bankAccount:
                        generateForm.bankAccount ||
                        "HDFC Reward Account",

                    paymentType:
                        generateForm.paymentType ||
                        "Reward Payment",

                    remarks: generateForm.remarks || "",

                    paymentIds: ids,
                },
                {
                    responseType: "blob",
                }
            );

            const blob = new Blob([response.data], {
                type:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;
            link.download = "bank-payment-sheet.xlsx";

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download Excel error:", error);
            alert("Failed to download Excel file");
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       FORMATTERS
    ===================================================== */

    const formatAmount = (amount) =>
        Number(amount || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
        });

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    /* =====================================================
       JSX
    ===================================================== */

    return (
        <div className="bank-payment-page">

            {/* ================= HEADER ================= */}

            <div className="bank-payment-header">

                <div>
                    <h1>Bank Payment Sheet</h1>

                    <p>
                        Generate bank upload file in Excel format
                        for bulk reward payment processing.
                    </p>

                    <div className="bank-payment-breadcrumb">
                        <span>Dashboard</span>
                        <ChevronRight size={14} />
                        <span>Bank Payment Sheet</span>
                        <ChevronRight size={14} />
                        <span>Generate Payment Sheet</span>
                    </div>
                </div>

                <div className="bank-payment-header-actions">

                    <button
                        className="bank-btn bank-btn-secondary"
                        onClick={() =>
                            alert("Upload history is not part of this page.")
                        }
                    >
                        <Clock3 size={16} />
                        Upload History
                    </button>

                    <button
                        className="bank-btn bank-btn-primary"
                        onClick={() =>
                            setShowGenerateModal(true)
                        }
                        disabled={loading}
                    >
                        <Download size={16} />
                        Generate Payment Sheet
                    </button>

                    <button
                        className="bank-btn bank-btn-primary"
                        onClick={() => setShowAddModal(true)}
                        disabled={loading}
                    >
                        <Plus size={16} />
                        Add Beneficiary
                    </button>

                </div>

            </div>

            {/* ================= STATS ================= */}

            <div className="bank-payment-stats">

                <div className="bank-stat-card">
                    <div className="bank-stat-icon purple">
                        <FileSpreadsheet size={22} />
                    </div>

                    <div>
                        <span>Total Beneficiaries</span>
                        <strong>
                            {dashboard.totalBeneficiaries}
                        </strong>
                        <small>This Sheet</small>
                    </div>
                </div>

                <div className="bank-stat-card">
                    <div className="bank-stat-icon green">
                        <WalletCards size={22} />
                    </div>

                    <div>
                        <span>Total Amount</span>

                        <strong>
                            ₹{formatAmount(dashboard.totalAmount)}
                        </strong>

                        <small>This Sheet</small>
                    </div>
                </div>

                <div className="bank-stat-card">
                    <div className="bank-stat-icon blue">
                        <FileText size={22} />
                    </div>

                    <div>
                        <span>Total Transactions</span>

                        <strong>
                            {dashboard.totalTransactions}
                        </strong>

                        <small>This Sheet</small>
                    </div>
                </div>

                <div className="bank-stat-card">
                    <div className="bank-stat-icon orange">
                        <CalendarDays size={22} />
                    </div>

                    <div>
                        <span>Payment Date</span>
                        <strong>16 May 2026</strong>
                        <small>Saturday</small>
                    </div>
                </div>

                <div className="bank-stat-card">
                    <div className="bank-stat-icon purple">
                        <Download size={22} />
                    </div>

                    <div>
                        <span>File Format</span>
                        <strong>Excel (.xlsx)</strong>
                        <small>Upload Ready</small>
                    </div>
                </div>

                <div className="bank-stat-card">
                    <div className="bank-stat-icon green">
                        <CheckCircle2 size={22} />
                    </div>

                    <div>
                        <span>Status</span>
                        <strong>Ready</strong>
                        <small>File Generated</small>
                    </div>
                </div>

            </div>

            {/* ================= SHEET DETAILS ================= */}

            <div className="bank-section-card">

                <div className="bank-section-title">
                    <h2>Sheet Details</h2>
                </div>

                <div className="bank-sheet-details">

                    <div className="bank-form-group">
                        <label>
                            Payment Date<span>*</span>
                        </label>

                        <div className="bank-input-icon">
                            <input
                                type="date"
                                name="paymentDate"
                                value={generateForm.paymentDate}
                                onChange={handleGenerateChange}
                            />


                        </div>
                    </div>

                    <div className="bank-form-group">
                        <label>
                            Bank Account<span>*</span>
                        </label>

                        <select
                            name="bankAccount"
                            value={generateForm.bankAccount}
                            onChange={handleGenerateChange}
                        >
                            <option value="">
                                Select Bank Account
                            </option>

                            <option value="HDFC Bank - 50200012345678">
                                HDFC Bank - 50200012345678
                            </option>

                            <option value="HDFC Reward Account">
                                HDFC Reward Account
                            </option>
                        </select>
                    </div>

                    <div className="bank-form-group">
                        <label>Payment Type</label>

                        <select
                            name="paymentType"
                            value={generateForm.paymentType}
                            onChange={handleGenerateChange}
                        >
                            <option value="Reward Payment">
                                Reward Payment
                            </option>
                        </select>
                    </div>

                    <div className="bank-form-group">
                        <label>Remarks</label>

                        <input
                            type="text"
                            name="remarks"
                            placeholder="Enter remarks (optional)"
                            value={generateForm.remarks}
                            onChange={handleGenerateChange}
                        />
                    </div>

                    <button
                        className="bank-btn bank-btn-primary bank-generate-inline"
                        onClick={handleGenerateSheet}
                        disabled={loading}
                    >
                        <Download size={16} />
                        Generate Sheet
                    </button>

                </div>

            </div>

            {/* ================= BENEFICIARY LIST ================= */}

            <div className="bank-section-card beneficiary-card">

                <div className="beneficiary-top">

                    <h2>
                        Beneficiary List ({filteredPayments.length})
                    </h2>

                    <div className="beneficiary-controls">

                        <div className="bank-search-box">
                            <Search size={17} />

                            <input
                                type="text"
                                placeholder="Search by name, mobile, customer ID..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        <button
                            className="bank-outline-btn"
                            onClick={() =>
                                setShowFilter((prev) => !prev)
                            }
                        >
                            <Filter size={16} />
                            Filters
                        </button>

                        <button
                            className="bank-outline-btn"
                            onClick={handleRefresh}
                            disabled={loading}
                        >
                            <RefreshCw size={16} />
                            Refresh
                        </button>

                        <button
                            className="bank-btn bank-btn-primary"
                            onClick={() => setShowAddModal(true)}
                            disabled={loading}
                        >
                            <Plus size={16} />
                            Add Beneficiary
                        </button>

                    </div>

                </div>

                {/* ================= FILTER ================= */}

                {showFilter && (
                    <div className="bank-filter-panel">

                        <div className="bank-form-group">

                            <label>Bank Name</label>

                            <select
                                value={bankFilter}
                                onChange={(e) => {
                                    setBankFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">
                                    All Banks
                                </option>

                                {bankNames.map((bank) => (
                                    <option
                                        key={bank}
                                        value={bank}
                                    >
                                        {bank}
                                    </option>
                                ))}
                            </select>

                        </div>

                        <button
                            className="bank-outline-btn"
                            onClick={() => {
                                setBankFilter("");
                                setSearch("");
                                setCurrentPage(1);
                            }}
                        >
                            Clear Filter
                        </button>

                    </div>
                )}

                {/* ================= TABLE ================= */}

                <div className="bank-table-wrapper">

                    <table className="bank-payment-table">

                        <thead>
                            <tr>

                                <th className="checkbox-column">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                    />
                                </th>

                                <th>#</th>

                                <th>Beneficiary Name</th>

                                <th>Bank Name</th>

                                <th>Account Number</th>

                                <th>IFSC Code</th>

                                <th>Amount (₹)</th>

                                <th>Remarks</th>

                                <th>Actions</th>

                            </tr>
                        </thead>

                        <tbody>

                            {loading && payments.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan="9"
                                        className="no-data"
                                    >
                                        Loading...
                                    </td>
                                </tr>

                            ) : paginatedPayments.length > 0 ? (

                                paginatedPayments.map(
                                    (payment, index) => (

                                        <tr key={payment._id}>

                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(
                                                        payment._id
                                                    )}
                                                    onChange={() =>
                                                        handleSelectOne(
                                                            payment._id
                                                        )
                                                    }
                                                />
                                            </td>

                                            <td>
                                                {(currentPage - 1) *
                                                    rowsPerPage +
                                                    index +
                                                    1}
                                            </td>

                                            <td className="beneficiary-name">
                                                {payment.beneficiaryName}
                                            </td>

                                            <td>
                                                {payment.bankName}
                                            </td>

                                            <td>
                                                {payment.accountNumber}
                                            </td>

                                            <td>
                                                {payment.ifscCode}
                                            </td>

                                            <td className="amount-cell">
                                                {formatAmount(
                                                    payment.amount
                                                )}
                                            </td>

                                            <td>
                                                {payment.remarks || "-"}
                                            </td>

                                            <td>

                                                <div className="table-actions">

                                                    {/* VIEW */}

                                                    <button
                                                        title="View"
                                                        onClick={() =>
                                                            handleView(payment)
                                                        }
                                                    >
                                                        <Eye size={15} />
                                                    </button>

                                                    {/* EDIT */}

                                                    <button
                                                        title="Edit"
                                                        onClick={() =>
                                                            handleEdit(payment)
                                                        }
                                                    >
                                                        <Edit size={15} />
                                                    </button>

                                                    {/* DELETE */}

                                                    <button className="delete-bankpay"
                                                        title="Delete"
                                                        onClick={() =>
                                                            handleDelete(payment)
                                                        }
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>

                                                    {/* MORE */}

                                                    <div className="more-action-wrapper">

                                                        <button
                                                            title="More"
                                                            onClick={() =>
                                                                setShowMoreMenu(
                                                                    showMoreMenu ===
                                                                        payment._id
                                                                        ? null
                                                                        : payment._id
                                                                )
                                                            }
                                                        >
                                                            <MoreVertical
                                                                size={15}
                                                            />
                                                        </button>

                                                        {showMoreMenu ===
                                                            payment._id && (

                                                                <div className="more-menu">

                                                                    <button
                                                                        onClick={() =>
                                                                            handleSingleExcel(
                                                                                payment
                                                                            )
                                                                        }
                                                                    >
                                                                        <FileSpreadsheet
                                                                            size={15}
                                                                        />

                                                                        Download Excel
                                                                    </button>

                                                                </div>

                                                            )}

                                                    </div>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )

                            ) : (

                                <tr>

                                    <td
                                        colSpan="9"
                                        className="no-data"
                                    >
                                        No beneficiaries found
                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

                {/* ================= PAGINATION ================= */}

                <div className="bank-pagination">

                    <div className="pagination-info">

                        Showing{" "}
                        {filteredPayments.length === 0
                            ? 0
                            : (currentPage - 1) *
                            rowsPerPage +
                            1}{" "}
                        to{" "}
                        {Math.min(
                            currentPage * rowsPerPage,
                            filteredPayments.length
                        )}{" "}
                        of {filteredPayments.length} entries

                    </div>

                    <div className="pagination-buttonsp">

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
                            .slice(0, 5)
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

                        {totalPages > 5 && (
                            <>
                                <span className="pagination-dots">
                                    ...
                                </span>

                                <button
                                    onClick={() =>
                                        setCurrentPage(totalPages)
                                    }
                                >
                                    {totalPages}
                                </button>
                            </>
                        )}

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

            {/* ================= BOTTOM SUMMARY ================= */}

            <div className="bank-bottom-summary">

                <div>
                    <span>Total Selected</span>
                    <strong>
                        {selectedIds.length}
                    </strong>
                </div>

                <div>
                    <span>Total Amount</span>

                    <strong>
                        ₹{formatAmount(selectedAmount)}
                    </strong>
                </div>

                <div className="bottom-summary-actions">

                    <button
                        className="bank-preview-btn"
                        onClick={() =>
                            setShowPreviewModal(true)
                        }
                    >
                        <Eye size={16} />
                        Preview Sheet
                    </button>

                    <button
                        className="bank-btn bank-btn-primary"
                        onClick={handleDownloadExcel}
                        disabled={loading}
                    >
                        <Download size={16} />
                        Download Excel
                    </button>

                </div>

            </div>

            {/* =====================================================
          ADD BENEFICIARY MODAL
      ===================================================== */}

            {showAddModal && (
                <div className="bank-modal-overlay">
                    <div className="bank-modal">
                        <div className="bank-modal-header">
                            <div>
                                <h2>Add Beneficiary</h2>
                                <p>Add beneficiary payment information.</p>
                            </div>

                            <button onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="bank-modal-body">
                            <div className="bank-modal-grid">

                                <div className="bank-form-group">
                                    <label>Beneficiary Name<span>*</span></label>
                                    <input
                                        type="text"
                                        name="beneficiaryName"
                                        placeholder="Enter beneficiary name"
                                        value={addForm.beneficiaryName}
                                        onChange={handleAddChange}
                                    />
                                </div>

                                <div className="bank-form-group">
                                    <label>Bank Name<span>*</span></label>
                                    <input
                                        type="text"
                                        name="bankName"
                                        placeholder="Enter bank name"
                                        value={addForm.bankName}
                                        onChange={handleAddChange}
                                    />
                                </div>

                                <div className="bank-form-group">
                                    <label>Account Number<span>*</span></label>
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        placeholder="Enter account number"
                                        value={addForm.accountNumber}
                                        onChange={(e) => /^\d*$/.test(e.target.value) && handleAddChange(e)}
                                    />
                                </div>

                                <div className="bank-form-group">
                                    <label>IFSC Code<span>*</span></label>
                                    <input
                                        type="text"
                                        name="ifscCode"
                                        placeholder="Enter IFSC code"
                                        value={addForm.ifscCode}
                                        onChange={(e) => {
                                            const value = e.target.value.toUpperCase();
                                            if (/^[A-Z]{0,4}0?[A-Z0-9]{0,6}$/.test(value)) {
                                                handleAddChange({ target: { name: "ifscCode", value } });
                                            }
                                        }}
                                        maxLength={11}
                                    />
                                </div>

                                <div className="bank-form-group">
                                    <label>Amount (₹)<span>*</span></label>
                                    <input
                                        type="number"
                                        name="amount"
                                        min="0"
                                        placeholder="Enter amount"
                                        value={addForm.amount}
                                        onChange={handleAddChange}
                                    />
                                </div>

                                <div className="bank-form-group">
                                    <label>Remarks</label>
                                    <input
                                        type="text"
                                        name="remarks"
                                        placeholder="Enter remarks (optional)"
                                        value={addForm.remarks}
                                        onChange={handleAddChange}
                                    />
                                </div>

                            </div>
                        </div>

                        <div className="bank-modal-footer">
                            <button
                                className="bank-outline-btn"
                                onClick={() => setShowAddModal(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="bank-btn bank-btn-primary"
                                onClick={handleAddBeneficiary}
                                disabled={loading}
                            >
                                <Plus size={16} />
                                Add Beneficiary
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================
          GENERATE PAYMENT SHEET MODAL
      ===================================================== */}

            {showGenerateModal && (

                <div className="bank-modal-overlay">

                    <div className="bank-modal">

                        <div className="bank-modal-header">

                            <div>
                                <h2>Generate Payment Sheet</h2>

                                <p>
                                    Generate bank upload file for
                                    selected beneficiaries.
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setShowGenerateModal(false)
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <div className="bank-modal-body">

                            <div className="bank-modal-grid">

                                <div className="bank-form-group">

                                    <label>
                                        Payment Date<span>*</span>
                                    </label>

                                    <input
                                        type="date"
                                        name="paymentDate"
                                        value={
                                            generateForm.paymentDate
                                        }
                                        onChange={
                                            handleGenerateChange
                                        }
                                    />

                                </div>

                                <div className="bank-form-group">

                                    <label>
                                        Bank Account<span>*</span>
                                    </label>

                                    <select
                                        name="bankAccount"
                                        value={
                                            generateForm.bankAccount
                                        }
                                        onChange={
                                            handleGenerateChange
                                        }
                                    >
                                        <option value="">
                                            Select Bank Account
                                        </option>

                                        <option value="HDFC Bank - 50200012345678">
                                            HDFC Bank -
                                            50200012345678
                                        </option>

                                        <option value="HDFC Reward Account">
                                            HDFC Reward Account
                                        </option>
                                    </select>

                                </div>

                                <div className="bank-form-group">

                                    <label>Payment Type</label>

                                    <select
                                        name="paymentType"
                                        value={
                                            generateForm.paymentType
                                        }
                                        onChange={
                                            handleGenerateChange
                                        }
                                    >
                                        <option value="Reward Payment">
                                            Reward Payment
                                        </option>
                                    </select>

                                </div>

                                <div className="bank-form-group">

                                    <label>Remarks</label>

                                    <input
                                        type="text"
                                        name="remarks"
                                        placeholder="Enter remarks (optional)"
                                        value={
                                            generateForm.remarks
                                        }
                                        onChange={
                                            handleGenerateChange
                                        }
                                    />

                                </div>

                            </div>

                            <div className="generate-summary-box">

                                <div>
                                    <span>
                                        Selected Beneficiaries
                                    </span>

                                    <strong>
                                        {selectedIds.length}
                                    </strong>
                                </div>

                                <div>
                                    <span>Total Amount</span>

                                    <strong>
                                        ₹{formatAmount(selectedAmount)}
                                    </strong>
                                </div>

                            </div>

                        </div>

                        <div className="bank-modal-footer">

                            <button
                                className="bank-outline-btn"
                                onClick={() =>
                                    setShowGenerateModal(false)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                className="bank-btn bank-btn-primary"
                                onClick={handleGenerateSheet}
                                disabled={loading}
                            >
                                <Download size={16} />
                                Generate Payment Sheet
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {/* =====================================================
          VIEW MODAL
      ===================================================== */}

            {showViewModal && selectedPayment && (

                <div className="bank-modal-overlay">

                    <div className="bank-modal small-modal">

                        <div className="bank-modal-header">

                            <div>
                                <h2>Beneficiary Details</h2>

                                <p>
                                    Complete payment beneficiary
                                    information.
                                </p>
                            </div>

                        </div>

                        <div className="bank-view-details">

                            <div>
                                <span>Beneficiary Name</span>
                                <strong>
                                    {selectedPayment.beneficiaryName}
                                </strong>
                            </div>

                            <div>
                                <span>Bank Name</span>
                                <strong>
                                    {selectedPayment.bankName}
                                </strong>
                            </div>

                            <div>
                                <span>Account Number</span>
                                <strong>
                                    {selectedPayment.accountNumber}
                                </strong>
                            </div>

                            <div>
                                <span>IFSC Code</span>
                                <strong>
                                    {selectedPayment.ifscCode}
                                </strong>
                            </div>

                            <div>
                                <span>Amount</span>
                                <strong>
                                    ₹
                                    {formatAmount(
                                        selectedPayment.amount
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Remarks</span>
                                <strong>
                                    {selectedPayment.remarks ||
                                        "-"}
                                </strong>
                            </div>

                            <div>
                                <span>Payment Date</span>
                                <strong>
                                    {formatDate(
                                        selectedPayment.paymentDate
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Bank Account</span>
                                <strong>
                                    {selectedPayment.bankAccount ||
                                        "-"}
                                </strong>
                            </div>

                            <div>
                                <span>Payment Type</span>
                                <strong>
                                    {selectedPayment.paymentType ||
                                        "-"}
                                </strong>
                            </div>

                        </div>

                        <div className="bank-modal-footer">

                            <button
                                className="bank-outline-btn"
                                onClick={() =>
                                    setShowViewModal(false)
                                }
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {/* =====================================================
          EDIT MODAL
      ===================================================== */}

            {showEditModal && editForm && (

                <div className="bank-modal-overlay">

                    <div className="bank-modal">

                        <div className="bank-modal-header">

                            <div>
                                <h2>Edit Beneficiary</h2>

                                <p>
                                    Update beneficiary payment
                                    information.
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setShowEditModal(false)
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <div className="bank-modal-body">

                            <div className="bank-modal-grid">

                                <div className="bank-form-group">
                                    <label>
                                        Beneficiary Name
                                    </label>

                                    <input
                                        type="text"
                                        name="beneficiaryName"
                                        value={
                                            editForm.beneficiaryName
                                        }
                                        onChange={handleEditChange}
                                    />
                                </div>

                                <div className="bank-form-group">
                                    <label>Bank Name</label>

                                    <input
                                        type="text"
                                        name="bankName"
                                        value={
                                            editForm.bankName
                                        }
                                        onChange={handleEditChange}
                                    />
                                </div>

                                <div className="bank-form-group">
                                    <label>
                                        Account Number
                                    </label>

                                    <input
                                        type="text"
                                        name="accountNumber"
                                        value={editForm.accountNumber}
                                        onChange={(e) => /^\d*$/.test(e.target.value) && handleEditChange(e)}
                                    />
                                </div>

                                <div className="bank-form-group">
                                    <label>IFSC Code</label>

                                    <input
                                        type="text"
                                        name="ifscCode"
                                        value={editForm.ifscCode}
                                        onChange={(e) => {
                                            const value = e.target.value.toUpperCase();
                                            if (/^[A-Z]{0,4}0?[A-Z0-9]{0,6}$/.test(value)) {
                                                handleEditChange({ target: { name: "ifscCode", value } });
                                            }
                                        }}
                                        maxLength={11}
                                    />
                                </div>

                                <div className="bank-form-group">
                                    <label>Amount (₹)</label>

                                    <input
                                        type="number"
                                        name="amount"
                                        value={editForm.amount}
                                        onChange={handleEditChange}
                                    />
                                </div>

                                <div className="bank-form-group">
                                    <label>Remarks</label>

                                    <input
                                        type="text"
                                        name="remarks"
                                        value={
                                            editForm.remarks
                                        }
                                        onChange={handleEditChange}
                                    />
                                </div>

                            </div>

                        </div>

                        <div className="bank-modal-footer">

                            <button
                                className="bank-outline-btn"
                                onClick={() =>
                                    setShowEditModal(false)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                className="bank-btn bank-btn-primary"
                                onClick={handleUpdatePayment}
                                disabled={loading}
                            >
                                <CheckCircle2 size={16} />
                                Update Beneficiary
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {/* =====================================================
          DELETE MODAL
      ===================================================== */}

            {showDeleteModal && selectedPayment && (

                <div className="bank-modal-overlay">

                    <div className="bank-modal delete-modal">

                        <div className="delete-icon">
                            <Trash2 size={24} />
                        </div>

                        <h2>Delete Beneficiary?</h2>

                        <p>
                            Are you sure you want to delete{" "}
                            <strong>
                                {selectedPayment.beneficiaryName}
                            </strong>
                            ?
                        </p>

                        <div className="bank-modal-footer">

                            <button
                                className="bank-outline-btn"
                                onClick={() =>
                                    setShowDeleteModal(false)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                className="bank-delete-btn"
                                onClick={confirmDelete}
                                disabled={loading}
                            >
                                <Trash2 size={16} />
                                Delete
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {/* =====================================================
          PREVIEW MODAL
      ===================================================== */}

            {showPreviewModal && (

                <div className="bank-modal-overlay">

                    <div className="bank-modal preview-modal">

                        <div className="bank-modal-header">

                            <div>
                                <h2>Preview Payment Sheet</h2>

                                <p>
                                    Review selected beneficiaries
                                    before downloading.
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setShowPreviewModal(false)
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <div className="preview-summary">

                            <div>
                                <span>Beneficiaries</span>

                                <strong>
                                    {selectedPayments.length > 0
                                        ? selectedPayments.length
                                        : payments.length}
                                </strong>
                            </div>

                            <div>
                                <span>Total Amount</span>

                                <strong>
                                    ₹
                                    {formatAmount(
                                        selectedPayments.length > 0
                                            ? selectedAmount
                                            : Number(
                                                dashboard.totalAmount
                                            )
                                    )}
                                </strong>
                            </div>

                        </div>

                        <div className="preview-table-wrapper">

                            <table className="bank-payment-table">

                                <thead>
                                    <tr>
                                        <th>Beneficiary Name</th>
                                        <th>Bank Name</th>
                                        <th>Account Number</th>
                                        <th>IFSC Code</th>
                                        <th>Amount (₹)</th>
                                        <th>Remarks</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {(selectedPayments.length > 0
                                        ? selectedPayments
                                        : payments
                                    ).map((payment) => (

                                        <tr key={payment._id}>

                                            <td>
                                                {payment.beneficiaryName}
                                            </td>

                                            <td>
                                                {payment.bankName}
                                            </td>

                                            <td>
                                                {payment.accountNumber}
                                            </td>

                                            <td>
                                                {payment.ifscCode}
                                            </td>

                                            <td>
                                                {formatAmount(
                                                    payment.amount
                                                )}
                                            </td>

                                            <td>
                                                {payment.remarks ||
                                                    "-"}
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                        <div className="bank-modal-footer">

                            <button
                                className="bank-outline-btn"
                                onClick={() =>
                                    setShowPreviewModal(false)
                                }
                            >
                                Close
                            </button>

                            <button
                                className="bank-btn bank-btn-primary"
                                onClick={handleDownloadExcel}
                                disabled={loading}
                            >
                                <Download size={16} />
                                Download Excel
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default BankPaymentSheet;