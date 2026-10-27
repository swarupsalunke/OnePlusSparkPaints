import { useEffect, useState } from "react";
import axios from "axios";
import "../../css/superadmin/dailyCashReport.css";
import {
    Printer, Download, ReceiptText, FileText, LayoutDashboard,
    Wallet, TrendingDown, ArrowLeftRight, PiggyBank, UploadCloud, X, Trash2,
} from "lucide-react";

const initialFormData = {
    reportDate: "", reportTime: "", shift: "", branch: "", storeName: "", cashierName: "",
    openingCashBalance: "", openingOnlineBalance: "",
    cash: "", upi: "", card: "", netBanking: "", other: "",
    creditBills: [], expenses: [], advanceSalary: [],
    transferAmount: "", transferMode: "", submittedTo: "", accountName: "", referenceNo: "", transferRemarks: "",
    purchaseBills: [], documents: [], remarks: "",
};

const STORE_FIELDS = [
    { name: "reportDate", label: "Report Date", type: "date" },
    { name: "reportTime", label: "Report Time", type: "time" },
    { name: "shift", label: "Shift", type: "select", options: ["Morning", "Evening"] },
    { name: "branch", label: "Branch", type: "text", placeholder: "Enter branch" },
    { name: "storeName", label: "Store Name", type: "text", placeholder: "Enter store name" },
    { name: "cashierName", label: "Cashier Name", type: "text", placeholder: "Enter cashier name" },
];
const OPENING_FIELDS = [
    { name: "openingCashBalance", label: "Opening Cash Balance", type: "number" },
    { name: "openingOnlineBalance", label: "Opening Online Balance", type: "number" },
];
const COLLECTION_FIELDS = [
    { name: "cash", label: "Cash" }, { name: "upi", label: "UPI" }, { name: "card", label: "Card" },
    { name: "netBanking", label: "Net Banking" }, { name: "other", label: "Other" },
];
const TRANSFER_FIELDS = [
    { name: "transferAmount", label: "Transfer Amount", type: "number" },
    { name: "transferMode", label: "Transfer Mode", type: "text", placeholder: "Enter transfer mode" },
    { name: "submittedTo", label: "Submitted To", type: "text", placeholder: "Enter name" },
    { name: "accountName", label: "Account Name", type: "text", placeholder: "Enter account name" },
    { name: "referenceNo", label: "Reference No.", type: "text", placeholder: "Enter reference number" },
    { name: "transferRemarks", label: "Remarks", type: "text", placeholder: "Enter remarks" },
];

const DailyCashReport = () => {
    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(false);
    const [todaysReport, setTodaysReport] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [recentReports, setRecentReports] = useState([]);
    const [recentReportsLoading, setRecentReportsLoading] = useState(false);

    const [creditBill, setCreditBill] = useState({ customerName: "", billNo: "", amount: "" });
    const [expense, setExpense] = useState({ expenseType: "", description: "", amount: "" });
    const [advanceSalary, setAdvanceSalary] = useState({ employeeName: "", amount: "", reason: "" });
    const [purchaseBill, setPurchaseBill] = useState({ vendorName: "", billNo: "", amount: "", attachment: null });

    const totalOnlineCollection =
        Number(formData.upi || 0) + Number(formData.card || 0) + Number(formData.netBanking || 0) + Number(formData.other || 0);

    // ---------- fetch helpers ----------
    const todayString = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    };

    const fetchTodaysReport = async () => {
        try {
            setSummaryLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get("https://oneplussparkpaintsserver.onrender.com/api/daily-cash-reports", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const reports = response.data?.reports || [];
            const today = todayString();
            const todayReport = reports
                .filter((r) => String(r.reportDate).split("T")[0] === today)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
            setTodaysReport(todayReport || null);
        } catch (error) {
            console.error("Fetch today's report error:", error);
            setTodaysReport(null);
        } finally {
            setSummaryLoading(false);
        }
    };

    const fetchRecentReports = async () => {
        try {
            setRecentReportsLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get("https://oneplussparkpaintsserver.onrender.com/api/daily-cash-reports", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const reports = response.data?.reports || [];
            const today = todayString();
            const previousReports = reports
                .filter((r) => String(r.reportDate).split("T")[0] < today)
                .sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate))
                .slice(0, 5);
            setRecentReports(previousReports);
        } catch (error) {
            console.error("Fetch recent reports error:", error);
            setRecentReports([]);
        } finally {
            setRecentReportsLoading(false);
        }
    };

    useEffect(() => {
        fetchTodaysReport();
        fetchRecentReports();
    }, []);

    // ---------- generic input change ----------
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "cashierName" && !/^[A-Za-z\s]*$/.test(value)) {
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // ---------- credit bills ----------
    const handleCreditBillChange = (e) => {
        const { name, value } = e.target;
        setCreditBill((prev) => ({ ...prev, [name]: value }));
    };

    const addCreditBill = () => {
        if (!creditBill.customerName || !creditBill.billNo || !creditBill.amount) {
            alert("Please fill all credit bill fields");
            return;
        }
        setFormData((prev) => ({
            ...prev,
            creditBills: [...prev.creditBills, { ...creditBill, amount: Number(creditBill.amount) }],
        }));
        setCreditBill({ customerName: "", billNo: "", amount: "" });
    };

    const removeCreditBill = (index) => {
        if (!window.confirm("Are you sure you want to remove this credit bill?")) return;
        setFormData((prev) => ({ ...prev, creditBills: prev.creditBills.filter((_, i) => i !== index) }));
    };

    // ---------- expenses ----------
    const handleExpenseChange = (e) => {
        const { name, value } = e.target;
        setExpense((prev) => ({ ...prev, [name]: value }));
    };

    const addExpense = () => {
        if (!expense.expenseType || !expense.description || !expense.amount) {
            alert("Please fill all expense fields");
            return;
        }
        setFormData((prev) => ({
            ...prev,
            expenses: [...prev.expenses, { ...expense, amount: Number(expense.amount) }],
        }));
        setExpense({ expenseType: "", description: "", amount: "" });
    };

    const removeExpense = (index) => {
        if (!window.confirm("Are you sure you want to remove this expense?")) return;
        setFormData((prev) => ({ ...prev, expenses: prev.expenses.filter((_, i) => i !== index) }));
    };

    // ---------- advance salary ----------
    const handleAdvanceSalaryChange = (e) => {
        const { name, value } = e.target;
        setAdvanceSalary((prev) => ({ ...prev, [name]: value }));
    };

    const addAdvanceSalary = () => {
        if (!advanceSalary.employeeName || !advanceSalary.amount || !advanceSalary.reason) {
            alert("Please fill all advance salary fields");
            return;
        }
        setFormData((prev) => ({
            ...prev,
            advanceSalary: [...prev.advanceSalary, { ...advanceSalary, amount: Number(advanceSalary.amount) }],
        }));
        setAdvanceSalary({ employeeName: "", amount: "", reason: "" });
    };

    const removeAdvanceSalary = (index) => {
        if (!window.confirm("Are you sure you want to remove this advance salary?")) return;
        setFormData((prev) => ({ ...prev, advanceSalary: prev.advanceSalary.filter((_, i) => i !== index) }));
    };

    // ---------- purchase bills ----------
    const handlePurchaseBillChange = (e) => {
        const { name, value, files } = e.target;
        setPurchaseBill((prev) => ({ ...prev, [name]: files ? files[0] : value }));
    };

    const addPurchaseBill = () => {
        if (!purchaseBill.vendorName || !purchaseBill.billNo || !purchaseBill.amount) {
            alert("Please fill Vendor Name, Bill No. and Amount");
            return;
        }
        setFormData((prev) => ({
            ...prev,
            purchaseBills: [
                ...prev.purchaseBills,
                {
                    vendorName: purchaseBill.vendorName,
                    billNo: purchaseBill.billNo,
                    amount: Number(purchaseBill.amount),
                    attachment: purchaseBill.attachment ? purchaseBill.attachment.name : "",
                },
            ],
        }));
        setPurchaseBill({ vendorName: "", billNo: "", amount: "", attachment: null });
    };

    const removePurchaseBill = (index) => {
        if (!window.confirm("Are you sure you want to remove this purchase bill?")) return;
        setFormData((prev) => ({ ...prev, purchaseBills: prev.purchaseBills.filter((_, i) => i !== index) }));
    };

    // ---------- documents ----------
    const handleDocumentUpload = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setFormData((prev) => ({
            ...prev,
            documents: [...prev.documents, ...files.map((f) => ({ name: f.name, size: f.size }))],
        }));
        e.target.value = "";
    };

    const removeDocument = (index) => {
        setFormData((prev) => ({ ...prev, documents: prev.documents.filter((_, i) => i !== index) }));
    };

    // ---------- calculations ----------
    const totalReceipt =
        Number(formData.cash || 0) + Number(formData.upi || 0) + Number(formData.card || 0) +
        Number(formData.netBanking || 0) + Number(formData.other || 0);

    const totalExpenses = formData.expenses.reduce((t, i) => t + Number(i.amount || 0), 0);
    const totalAdvanceSalary = formData.advanceSalary.reduce((t, i) => t + Number(i.amount || 0), 0);
    const totalPurchaseAmount = formData.purchaseBills.reduce((t, i) => t + Number(i.amount || 0), 0);
    const totalCreditBills = formData.creditBills.reduce((t, i) => t + Number(i.amount || 0), 0);

    const closingBalance =
        Number(formData.openingCashBalance || 0) + Number(formData.cash || 0) -
        totalExpenses - totalAdvanceSalary - Number(formData.transferAmount || 0);

    const summaryOpeningBalance = Number(todaysReport?.openingCashBalance || 0);
    const summaryCashCollection = Number(todaysReport?.collections?.cash || 0);
    const summaryOnlineCollection =
        Number(todaysReport?.collections?.upi || 0) + Number(todaysReport?.collections?.card || 0) +
        Number(todaysReport?.collections?.netBanking || 0) + Number(todaysReport?.collections?.other || 0);
    const summaryTotalReceipt = Number(todaysReport?.totalReceipt || 0);
    const summaryTotalExpenses = Number(todaysReport?.totalExpenses || 0);
    const summaryAdvanceSalary = Number(todaysReport?.totalAdvanceSalary || 0);
    const summaryOfficeTransfer = Number(todaysReport?.officeTransfer?.transferAmount || 0);
    const summaryClosingBalance = Number(todaysReport?.closingBalance || 0);

    // Top stat strip (mirrors the numbers already computed above)
    const statCards = [
        { key: "opening", label: "Opening Balance", value: summaryOpeningBalance, icon: <Wallet size={18} />, tone: "blue" },
        { key: "receipt", label: "Total Receipt", value: summaryTotalReceipt, icon: <ReceiptText size={18} />, tone: "green" },
        { key: "expenses", label: "Total Expenses", value: summaryTotalExpenses, icon: <TrendingDown size={18} />, tone: "orange" },
        { key: "transfer", label: "Office Transfer", value: summaryOfficeTransfer, icon: <ArrowLeftRight size={18} />, tone: "purple" },
        { key: "closing", label: "Closing Balance", value: summaryClosingBalance, icon: <PiggyBank size={18} />, tone: "teal" },
    ];

    // ---------- submit ----------
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = {
                reportDate: formData.reportDate,
                reportTime: formData.reportTime,
                shift: formData.shift,
                branch: formData.branch,
                storeName: formData.storeName,
                cashierName: formData.cashierName,
                openingCashBalance: Number(formData.openingCashBalance || 0),
                openingOnlineBalance: Number(formData.openingOnlineBalance || 0),
                collections: {
                    cash: Number(formData.cash || 0),
                    upi: Number(formData.upi || 0),
                    card: Number(formData.card || 0),
                    netBanking: Number(formData.netBanking || 0),
                    other: Number(formData.other || 0),
                },
                totalReceipt,
                creditBills: formData.creditBills,
                expenses: formData.expenses,
                totalExpenses,
                advanceSalary: formData.advanceSalary,
                totalAdvanceSalary,
                officeTransfer: {
                    transferAmount: Number(formData.transferAmount || 0),
                    transferMode: formData.transferMode,
                    submittedTo: formData.submittedTo,
                    accountName: formData.accountName,
                    referenceNo: formData.referenceNo,
                    remarks: formData.transferRemarks,
                },
                purchaseBills: formData.purchaseBills,
                totalPurchaseAmount,
                closingBalance,
                documents: formData.documents,
                remarks: formData.remarks,
            };

            const token = localStorage.getItem("token");
            const response = await axios.post("https://oneplussparkpaintsserver.onrender.com/api/daily-cash-reports", payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("Daily cash report created:", response.data);
            alert("Daily cash report created successfully");

            setFormData(initialFormData);
            await fetchTodaysReport();
            await fetchRecentReports();
        } catch (error) {
            console.error("Create daily cash report error:", error);
            alert(error.response?.data?.message || "Failed to create daily cash report");
        } finally {
            setLoading(false);
        }
    };

    // ---------- shared field renderer ----------
    const renderField = (f) => (
        <div className="daily-field" key={f.name}>
            <label>{f.label}</label>
            {f.type === "select" ? (
                <select name={f.name} value={formData[f.name]} onChange={handleChange} required>
                    <option value="">Select {f.label}</option>
                    {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
            ) : (
                <input
                    type={f.type || "number"}
                    min={f.type === "number" || !f.type ? "0" : undefined}
                    name={f.name}
                    value={formData[f.name]}
                    onChange={handleChange}
                    placeholder={f.placeholder ?? "₹ 0.00"}
                    required={f.required}
                />
            )}
        </div>
    );

    return (
        <div className="daily-cash-page">

            {/* Header */}
            <div className="daily-cash-header">
                <div>
                    <h1>Add Daily Cash Report</h1>
                    <p>Create and submit today's daily cash report</p>
                </div>

                <div className="daily-cash-actions">
                    <button type="button" className="daily-btn secondary">Save Draft</button>
                    <button type="submit" form="daily-cash-form" className="daily-btn primary" disabled={loading}>
                        {loading ? "Submitting..." : "Submit"}
                    </button>
                    <button type="button" className="daily-btn icon-btn" onClick={() => window.print()}>
                        <Printer size={15} /> Print
                    </button>
                    <button type="button" className="daily-btn icon-btn">
                        <Download size={15} /> Download PDF
                    </button>
                    <button type="button" className="daily-btn secondary">Cancel</button>
                </div>
            </div>

            <form id="daily-cash-form" onSubmit={handleSubmit}>

                {/* Stat strip */}
                <section className="daily-card stats-row">
                    {statCards.map((s) => (
                        <div className={`stat-item tone-${s.tone}`} key={s.key}>
                            <div className="stat-icon">{s.icon}</div>
                            <div className="stat-text">
                                <span>{s.label}</span>
                                <strong>₹ {Number(s.value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
                            </div>
                        </div>
                    ))}
                </section>

                <div className="daily-cash-layout">
                    <div className="daily-cash-main">

                        {/* Store info */}
                        <section className="daily-card">
                            <div className="daily-card-header">
                                <div>
                                    <h2>Store Information</h2>
                                    <p>Enter daily report information</p>
                                </div>
                                <span className="status-badge">Draft</span>
                            </div>
                            <div className="daily-form-grid">
                                {STORE_FIELDS.map(renderField)}
                            </div>
                        </section>

                        {/* Opening / Collections / Credit Bills */}
                        <div className="daily-cash-row-3">

                            <section className="daily-card">
                                <div className="daily-card-header">
                                    <div><h2>Opening Balance</h2><p>Balance for the day</p></div>
                                </div>
                                <div className="daily-form-grid one-col">
                                    {OPENING_FIELDS.map(renderField)}
                                </div>
                            </section>

                            <section className="daily-card">
                                <div className="daily-card-header">
                                    <div><h2>Collections / Receipts</h2><p>Today's collection details</p></div>
                                </div>
                                <div className="daily-form-grid one-col">
                                    {COLLECTION_FIELDS.map(renderField)}
                                </div>
                                <div className="daily-total-box inline">
                                    <span>Total Receipt</span>
                                    <strong>₹ {totalReceipt.toFixed(2)}</strong>
                                </div>
                            </section>

                            <section className="daily-card">
                                <div className="daily-card-header">
                                    <div><h2>Credit Bills</h2><p>Add credit bill details</p></div>
                                    <span>₹{totalCreditBills.toFixed(2)}</span>
                                </div>

                                <div className="credit-bill-form">
                                    <input type="text" name="customerName" placeholder="Customer Name" value={creditBill.customerName} onChange={(e) => /^[A-Za-z\s]*$/.test(e.target.value) && handleCreditBillChange(e)} />
                                    <input type="text" name="billNo" placeholder="Bill No." value={creditBill.billNo} onChange={handleCreditBillChange} />
                                    <input type="number" name="amount" placeholder="Amount" value={creditBill.amount} onChange={handleCreditBillChange} />
                                    <button type="button" onClick={addCreditBill}>+ Add</button>
                                </div>

                                {formData.creditBills.length > 0 && (
                                    <div className="credit-bill-list">
                                        {formData.creditBills.map((bill, i) => (
                                            <div className="credit-bill-row" key={i}>
                                                <span>{bill.customerName}</span>
                                                <span>{bill.billNo}</span>
                                                <span>₹{Number(bill.amount).toFixed(2)}</span>
                                                <button type="button" onClick={() => removeCreditBill(i)}><Trash2 size={19} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Expenses / Advance Salary / Office Transfer */}
                        <div className="daily-cash-row-3">

                            <section className="daily-card">
                                <div className="daily-card-header">
                                    <div><h2>Expenses</h2><p>Add expense details</p></div>
                                    <span>₹{totalExpenses.toFixed(2)}</span>
                                </div>
                                <div className="expense-form">
                                    <input type="text" name="expenseType" placeholder="Expense Type" value={expense.expenseType} onChange={handleExpenseChange} />
                                    <input type="text" name="description" placeholder="Description" value={expense.description} onChange={handleExpenseChange} />
                                    <input type="number" name="amount" placeholder="Amount" value={expense.amount} onChange={handleExpenseChange} />
                                    <button type="button" onClick={addExpense}>+ Add</button>
                                </div>
                                {formData.expenses.length > 0 && (
                                    <div className="expense-list">
                                        {formData.expenses.map((item, i) => (
                                            <div className="expense-row" key={i}>
                                                <span>{item.expenseType}</span>
                                                <span>{item.description}</span>
                                                <span>₹{Number(item.amount).toFixed(2)}</span>
                                                <button type="button" onClick={() => removeExpense(i)}><Trash2 size={19} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section className="daily-card">
                                <div className="daily-card-header">
                                    <div><h2>Advance Salary</h2><p>Add advance salary details</p></div>
                                    <span>₹{totalAdvanceSalary.toFixed(2)}</span>
                                </div>
                                <div className="advance-salary-form">
                                    <input type="text" name="employeeName" placeholder="Employee Name" value={advanceSalary.employeeName} onChange={(e) => /^[A-Za-z\s]*$/.test(e.target.value) && handleAdvanceSalaryChange(e)} />                                    <input type="number" name="amount" placeholder="Amount" value={advanceSalary.amount} onChange={handleAdvanceSalaryChange} />
                                    <input type="text" name="reason" placeholder="Reason" value={advanceSalary.reason} onChange={handleAdvanceSalaryChange} />
                                    <button type="button" onClick={addAdvanceSalary}>+ Add</button>
                                </div>
                                {formData.advanceSalary.length > 0 && (
                                    <div className="advance-salary-list">
                                        {formData.advanceSalary.map((item, i) => (
                                            <div className="advance-salary-row" key={i}>
                                                <span>{item.employeeName}</span>
                                                <span>₹{Number(item.amount).toFixed(2)}</span>
                                                <span>{item.reason}</span>
                                                <button type="button" onClick={() => removeAdvanceSalary(i)}><Trash2 size={19} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section className="daily-card">
                                <div className="daily-card-header">
                                    <div><h2>Office Transfer</h2><p>Balance transfer details</p></div>
                                </div>
                                <div className="daily-form-grid one-col">
                                    {TRANSFER_FIELDS.map(renderField)}
                                </div>
                            </section>
                        </div>

                        {/* Purchase Bills / Closing Summary / Upload Documents */}
                        <div className="daily-cash-row-3">

                            <section className="daily-card">
                                <div className="daily-card-header">
                                    <div><h2>Purchase Bills</h2><p>Add purchase bill details</p></div>
                                    <span>₹{totalPurchaseAmount.toFixed(2)}</span>
                                </div>
                                <div className="purchase-bill-form">
                                    <input type="text" name="vendorName" placeholder="Vendor Name" value={purchaseBill.vendorName} onChange={(e) => /^[A-Za-z\s]*$/.test(e.target.value) && handlePurchaseBillChange(e)} />                                    <input type="text" name="billNo" placeholder="Bill No." value={purchaseBill.billNo} onChange={handlePurchaseBillChange} />
                                    <input type="number" name="amount" placeholder="Amount" value={purchaseBill.amount} onChange={handlePurchaseBillChange} />
                                    <label className="purchase-attachment">
                                        <input type="file" name="attachment" onChange={handlePurchaseBillChange} />
                                        <span>{purchaseBill.attachment ? purchaseBill.attachment.name : "Attachment"}</span>
                                    </label>
                                    <button type="button" onClick={addPurchaseBill}>+ Add</button>
                                </div>
                                {formData.purchaseBills.length > 0 && (
                                    <div className="purchase-bill-list">
                                        {formData.purchaseBills.map((bill, i) => (
                                            <div className="purchase-bill-row" key={i}>
                                                <span>{bill.vendorName}</span>
                                                <span>{bill.billNo}</span>
                                                <span>₹{Number(bill.amount).toFixed(2)}</span>
                                                <span>{bill.attachment || "No attachment"}</span>
                                                <button type="button" onClick={() => removePurchaseBill(i)}><Trash2 size={19} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section className="daily-card closing-summary-card">
                                <div className="daily-card-header">
                                    <div><h2>Closing Balance Summary</h2></div>
                                </div>
                                <div className="closing-summary-list">
                                    <div className="closing-summary-row">
                                        <span>Opening Balance (Cash)</span>
                                        <strong>₹{Number(formData.openingCashBalance || 0).toLocaleString()}</strong>
                                    </div>
                                    <div className="closing-summary-row plus">
                                        <span>+ Cash Collection</span>
                                        <strong>₹{Number(formData.cash || 0).toLocaleString()}</strong>
                                    </div>
                                    <div className="closing-summary-row minus">
                                        <span>- Total Expenses</span>
                                        <strong>₹{totalExpenses.toLocaleString()}</strong>
                                    </div>
                                    <div className="closing-summary-row minus">
                                        <span>- Advance Salary</span>
                                        <strong>₹{totalAdvanceSalary.toLocaleString()}</strong>
                                    </div>
                                    <div className="closing-summary-row minus">
                                        <span>- Office Transfer</span>
                                        <strong>₹{Number(formData.transferAmount || 0).toLocaleString()}</strong>
                                    </div>
                                    <div className="closing-summary-divider" />
                                    <div className="closing-summary-row total">
                                        <span>= Closing Balance</span>
                                        <strong>₹{closingBalance.toLocaleString()}</strong>
                                    </div>
                                </div>
                            </section>

                            <section className="daily-card">
                                <div className="daily-card-header">
                                    <div><h2>Upload Documents</h2><p>Attach receipts or supporting files</p></div>
                                </div>
                                <label className="upload-dropzone">
                                    <input type="file" multiple onChange={handleDocumentUpload} />
                                    <UploadCloud size={20} />
                                    <span>Drag & drop files here or</span>
                                    <span className="upload-browse">Browse Files</span>
                                </label>
                                {formData.documents.length > 0 && (
                                    <div className="upload-file-list">
                                        {formData.documents.map((doc, i) => (
                                            <div className="upload-file-chip" key={i}>
                                                <FileText size={13} />
                                                <span>{doc.name}</span>
                                                <button type="button" onClick={() => removeDocument(i)}><X size={12} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Remarks */}
                        <section className="daily-card">
                            <div className="daily-card-header">
                                <div><h2>Remarks</h2><p>Add additional information</p></div>
                            </div>
                            <div className="daily-field">
                                <textarea name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Enter remarks..." rows="4" />
                            </div>
                        </section>

                    </div>

                    {/* Sidebar */}
                    <div className="daily-cash-sidebar">

                        <section className="daily-summary-card">
                            <h2>Today's Summary</h2>
                            {summaryLoading ? (
                                <p>Loading summary...</p>
                            ) : !todaysReport ? (
                                <p>No report submitted for today yet.</p>
                            ) : (
                                <>
                                    <div className="summary-item"><span>Opening Balance</span><strong>₹ {summaryOpeningBalance.toLocaleString()}</strong></div>
                                    <div className="summary-item"><span>Total Cash Collection</span><strong>₹ {summaryCashCollection.toLocaleString()}</strong></div>
                                    <div className="summary-item"><span>Total Online Collection</span><strong>₹ {summaryOnlineCollection.toLocaleString()}</strong></div>
                                    <div className="summary-item"><span>Total Receipt</span><strong>₹ {summaryTotalReceipt.toLocaleString()}</strong></div>
                                    <div className="summary-divider" />
                                    <div className="summary-item expense"><span>Total Expenses</span><strong>₹ {summaryTotalExpenses.toLocaleString()}</strong></div>
                                    <div className="summary-item expense"><span>Advance Salary</span><strong>₹ {summaryAdvanceSalary.toLocaleString()}</strong></div>
                                    <div className="summary-item expense"><span>Office Transfer</span><strong>₹ {summaryOfficeTransfer.toLocaleString()}</strong></div>
                                    <div className="summary-divider" />
                                    <div className="summary-item closing"><span>Closing Balance</span><strong>₹ {summaryClosingBalance.toLocaleString()}</strong></div>
                                </>
                            )}
                        </section>

                        <section className="daily-card recent-reports-card">
                            <div className="daily-card-header recent-reports-header">
                                <div><h2>Recent Daily Reports</h2></div>
                                <button type="button" className="view-all-btn">View All</button>
                            </div>

                            {recentReportsLoading ? (
                                <div className="recent-reports-empty">Loading reports...</div>
                            ) : recentReports.length === 0 ? (
                                <div className="recent-reports-empty">No recent daily reports</div>
                            ) : (
                                <div className="recent-reports-list">
                                    {recentReports.map((report) => {
                                        const formattedDate = new Date(report.reportDate).toLocaleDateString("en-GB", {
                                            day: "2-digit", month: "short", year: "numeric",
                                        });
                                        const totalAmount = Number(report.totalReceipt || 0);
                                        const status = report.status || "Submitted";

                                        return (
                                            <div className="recent-report-item" key={report._id}>
                                                <div className="recent-report-icon">📅</div>
                                                <div className="recent-report-info">
                                                    <div className="recent-report-date">{formattedDate}</div>
                                                    <div className="recent-report-cashier">{report.cashierName || "—"}</div>
                                                </div>
                                                <div className={`recent-report-status ${status.toLowerCase()}`}>{status}</div>
                                                <div className="recent-report-amount">
                                                    ₹ {totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        <section className="daily-card quick-actions-card">
                            <div className="daily-card-header"><div><h2>Quick Actions</h2></div></div>
                            <div className="quick-actions-grid">
                                <button type="button" className="quick-action-item" onClick={() => window.print()}>
                                    <div className="quick-action-icon"><Printer size={22} /></div>
                                    <span>Print Report</span>
                                </button>
                                <button type="button" className="quick-action-item">
                                    <div className="quick-action-icon"><ReceiptText size={22} /></div>
                                    <span>Cash Summary</span>
                                </button>
                                <button type="button" className="quick-action-item">
                                    <div className="quick-action-icon"><FileText size={22} /></div>
                                    <span>Monthly Report</span>
                                </button>
                                <button type="button" className="quick-action-item">
                                    <div className="quick-action-icon"><LayoutDashboard size={22} /></div>
                                    <span>Store Dashboard</span>
                                </button>
                            </div>
                        </section>

                    </div>
                </div>

                {/* Bottom actions */}
                <div className="daily-bottom-actions">
                    <button type="button" className="daily-btn secondary">Cancel</button>
                    <button type="submit" className="daily-btn primary" disabled={loading}>
                        {loading ? "Submitting..." : "Submit Report"}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default DailyCashReport;