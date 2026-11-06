import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../../css/superadmin/dailyCashReport.css";
import {
    Printer, ReceiptText, Wallet, TrendingDown, ArrowLeftRight,
    PiggyBank, Trash2, CalendarDays, CheckCircle2, XCircle,
} from "lucide-react";

const API_URL = "https://oneplussparkpaintsserver.onrender.com/api/daily-cash-reports";
const PAYMENT_MODES = ["CASH", "UPI", "CARD", "NET_BANKING", "OTHER"];
const money = (value) => `₹ ${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const emptyForm = () => ({
    reportDate: new Date().toISOString().slice(0, 10), reportTime: "", shift: "", branch: "", storeName: "", cashierName: "",
    openingCashBalance: "", collections: { cash: "", upi: "", card: "", netBanking: "", other: "" },
    receipts: [], creditBills: [], expenses: [], advanceSalary: [], cashTransfersIn: [], cashTransfersOut: [], purchaseBills: [], salesReturns: [], documents: [], remarks: "",
});
const emptyReceipt = () => ({ classification: "TODAY'S SALE", customerName: "", receiptNo: "", referenceNo: "", invoiceNo: "", amount: "", paymentMode: "CASH", destinationAccount: "", remarks: "" });

export default function DailyCashReport() {
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [recentReports, setRecentReports] = useState([]);
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [user, setUser] = useState({});
    const [uploadingFiles, setUploadingFiles] = useState({
        expense: false,
        purchase: false,
        supporting: false,
    });
    const [receipt, setReceipt] = useState(emptyReceipt());
    const [creditBill, setCreditBill] = useState({ customerName: "", invoiceNo: "", amount: "" });
    const [expense, setExpense] = useState({ expenseHead: "", payee: "", amount: "", paymentMode: "CASH", paymentAccount: "", billAttachment: "", remarks: "" });
    const [advance, setAdvance] = useState({ employeeName: "", amount: "", paymentMode: "CASH", paymentAccount: "", reason: "" });
    const [transferIn, setTransferIn] = useState({ from: "", amount: "", referenceNo: "", remarks: "" });
    const [transferOut, setTransferOut] = useState({ to: "", amount: "", referenceNo: "", remarks: "" });
    const [purchase, setPurchase] = useState({ vendorName: "", billNo: "", amount: "", paymentStatus: "CASH_PAID", paidAmount: "", paymentMode: "CASH", attachment: "" });
    const [salesReturn, setSalesReturn] = useState({ returnNo: "", invoiceNo: "", customerName: "", amount: "", refundMode: "CASH", referenceNo: "", remarks: "" });

    const token = () => localStorage.getItem("token");
    const isApprover = ["SUPER_ADMIN", "DIRECTOR"].includes(user.role);
    const headers = { Authorization: `Bearer ${token()}` };
    const uploadReportFile = async (file, category) => {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("category", category);

        const { data } = await axios.post(
            `${API_URL}/upload`,
            formData,
            { headers }
        );

        const handleExpenseBillUpload = async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";

            if (!file) return;

            try {
                setUploadingFiles((prev) => ({ ...prev, expense: true }));

                const uploaded = await uploadReportFile(file, "expense-bill");

                setExpense((prev) => ({
                    ...prev,
                    billAttachment: uploaded.fileUrl,
                }));

                alert("Expense bill uploaded successfully.");
            } catch (error) {
                alert(error.response?.data?.message || error.message);
            } finally {
                setUploadingFiles((prev) => ({ ...prev, expense: false }));
            }
        };

        const handlePurchaseBillUpload = async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";

            if (!file) return;

            try {
                setUploadingFiles((prev) => ({ ...prev, purchase: true }));

                const uploaded = await uploadReportFile(file, "purchase-bill");

                setPurchase((prev) => ({
                    ...prev,
                    attachment: uploaded.fileUrl,
                }));

                alert("Purchase bill uploaded successfully.");
            } catch (error) {
                alert(error.response?.data?.message || error.message);
            } finally {
                setUploadingFiles((prev) => ({ ...prev, purchase: false }));
            }
        };

        const handleSupportingDocumentUpload = async (e) => {
            const files = Array.from(e.target.files || []);
            e.target.value = "";

            if (!files.length) return;

            try {
                setUploadingFiles((prev) => ({ ...prev, supporting: true }));

                for (const file of files) {
                    const uploaded = await uploadReportFile(
                        file,
                        "supporting-document"
                    );

                    setForm((prev) => ({
                        ...prev,
                        documents: [
                            ...prev.documents,
                            {
                                fileName: uploaded.fileName,
                                fileUrl: uploaded.fileUrl,
                            },
                        ],
                    }));
                }

                alert("Supporting documents uploaded successfully.");
            } catch (error) {
                alert(error.response?.data?.message || error.message);
            } finally {
                setUploadingFiles((prev) => ({ ...prev, supporting: false }));
            }
        };

        if (!data?.success || !data?.file?.fileUrl) {
            throw new Error(data?.message || "File upload failed");
        }

        return data.file;
    };
    const today = new Date().toLocaleDateString("en-CA");

    const loadReports = async () => {
        try {
            setSummaryLoading(true);
            const { data } = await axios.get(API_URL, { headers });
            const reports = data?.reports || [];
            const todayReport = reports.filter((item) => String(item.reportDate).slice(0, 10) === today).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
            setReport(todayReport || null);
            setRecentReports(reports.filter((item) => String(item.reportDate).slice(0, 10) < today).sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate)).slice(0, 5));
        } catch (error) {
            console.error("Daily cash report fetch error:", error);
            setReport(null);
            setRecentReports([]);
        } finally { setSummaryLoading(false); }
    };

    useEffect(() => {
        try { setUser(JSON.parse(localStorage.getItem("user") || "{}")); } catch { setUser({}); }
        loadReports();
    }, []);

    const updateForm = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));
    const updateCollection = (name, value) => setForm((prev) => ({ ...prev, collections: { ...prev.collections, [name]: value } }));
    const addItem = (key, item, setter, reset) => {
        const requiredByList = {
            receipts: ["amount", "paymentMode"], creditBills: ["customerName", "invoiceNo", "amount"],
            expenses: ["expenseHead", "payee", "amount", "paymentMode"],
            advanceSalary: ["employeeName", "amount", "reason", "paymentMode"],
            cashTransfersIn: ["from", "amount"], cashTransfersOut: ["to", "amount"],
            purchaseBills: ["vendorName", "billNo", "amount", "paymentStatus"],
            salesReturns: ["returnNo", "customerName", "amount", "refundMode"],
        };
        const missingRequired = !item || (requiredByList[key] || ["amount"]).some((name) => String(item[name] ?? "").trim() === "");
        const missingPartialPaidAmount = key === "purchaseBills" && item?.paymentStatus === "PARTIAL" && String(item.paidAmount ?? "").trim() === "";
        if (missingRequired || missingPartialPaidAmount) {
            alert("Please fill the required fields."); return;
        }
        setForm((prev) => ({ ...prev, [key]: [...prev[key], { ...item, amount: Number(item.amount || 0), ...(item.paidAmount !== undefined ? { paidAmount: Number(item.paidAmount || 0) } : {}) }] }));
        setter(reset());
    };
    const removeItem = (key, index) => setForm((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));

    const totals = useMemo(() => {
        const receipts = form.receipts.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const collections = Object.values(form.collections).reduce((sum, item) => sum + Number(item || 0), 0);
        const cashReceipts = form.receipts.length ? form.receipts.filter((item) => item.paymentMode === "CASH").reduce((sum, item) => sum + Number(item.amount || 0), 0) : Number(form.collections.cash || 0);
        const expensesCash = form.expenses.filter((item) => item.paymentMode === "CASH").reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const advanceCash = form.advanceSalary.filter((item) => item.paymentMode === "CASH").reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const purchaseCash = form.purchaseBills.reduce((sum, item) => sum + (item.paymentStatus === "CREDIT" ? 0 : item.paymentMode === "CASH" ? Number(item.paidAmount ?? item.amount ?? 0) : 0), 0);
        const transfersIn = form.cashTransfersIn.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const transfersOut = form.cashTransfersOut.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const returnsCash = form.salesReturns.filter((item) => item.refundMode === "CASH").reduce((sum, item) => sum + Number(item.amount || 0), 0);
        return {
            receipts: form.receipts.length ? receipts : collections, cashReceipts, expensesCash, advanceCash, purchaseCash, transfersIn, transfersOut, returnsCash,
            closing: Number(form.openingCashBalance || 0) + cashReceipts + transfersIn - expensesCash - advanceCash - purchaseCash - transfersOut - returnsCash
        };
    }, [form]);

    const submitReport = async (event, status = "SUBMITTED") => {
        event?.preventDefault();
        if (
            uploadingFiles.expense ||
            uploadingFiles.purchase ||
            uploadingFiles.supporting
        ) {
            alert("Please wait until all documents finish uploading.");
            return;
        }
        if (!form.reportDate || !form.branch || !form.storeName || !form.cashierName) { alert("Please fill Report Date, Branch, Store Name and Cashier Name."); return; }
        try {
            setLoading(true);
            const payload = { ...form, openingCashBalance: Number(form.openingCashBalance || 0), collections: Object.fromEntries(Object.entries(form.collections).map(([key, value]) => [key, Number(value || 0)])), status };
            const { data } = await axios.post(API_URL, payload, { headers });
            alert(status === "DRAFT" ? "Daily cash report saved as draft." : "Daily cash report submitted successfully.");
            setForm(emptyForm());
            await loadReports();
            if (data?.report) setReport(data.report);
        } catch (error) {
            console.error("Create daily cash report error:", error);
            alert(error.response?.data?.message || "Failed to save daily cash report.");
        } finally { setLoading(false); }
    };

    const runApproval = async (path, successMessage, needsReason = false) => {
        if (!report?._id) return;
        const body = needsReason ? { rejectionReason: window.prompt("Enter rejection reason:") || "" } : {};
        if (needsReason && !body.rejectionReason.trim()) return;
        try {
            await axios.post(`${API_URL}/${report._id}/${path}`, body, { headers });
            alert(successMessage);
            await loadReports();
        } catch (error) { alert(error.response?.data?.message || "Action failed."); }
    };

    const field = (label, name, value, onChange, type = "text", required = false) => (
        <label className="daily-field" key={name}><span>{label}</span><input type={type} name={name} value={value ?? ""} onChange={onChange} required={required} min={type === "number" ? "0" : undefined} /></label>
    );
    const selectField = (label, value, onChange, options) => <label className="daily-field" key={label}><span>{label}</span><select value={value} onChange={onChange}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
    const section = (title, subtitle, children) => <section className="daily-card"><div className="daily-card-header"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div></div>{children}</section>;
    const listRows = (key, items, render) => items.length > 0 && <div className="daily-dynamic-list">{items.map((item, index) => <div className="daily-dynamic-row" key={`${key}-${index}`}>{render(item)}<button type="button" aria-label="Remove" onClick={() => removeItem(key, index)}><Trash2 size={15} /></button></div>)}</div>;

    const reportTotals = report || {};
    const statusLabel = (value) => String(value || "NOT SET").replaceAll("_", " ");

    return <div className="daily-cash-page">
        <div className="daily-cash-header"><div><h1>Daily Cash Report</h1><p>Create and submit the daily cash report</p></div><div className="daily-cash-actions">
            <button
                type="button"
                className="daily-btn secondary"
                disabled={loading || Object.values(uploadingFiles).some(Boolean)}
                onClick={(e) => submitReport(e, "DRAFT")}
            >
                Save Draft
            </button>
            <button
                type="submit"
                form="daily-cash-form"
                className="daily-btn primary"
                disabled={loading || Object.values(uploadingFiles).some(Boolean)}
            >
                {loading ? "Saving..." : "Submit Report"}
            </button>
            <button type="button" className="daily-btn icon-btn" onClick={() => window.print()}><Printer size={15} /> Print</button>
        </div></div>

        <section className="daily-card stats-row">
            {[{ label: "Opening Cash", value: reportTotals.openingCashBalance, icon: <Wallet size={18} /> }, { label: "Cash Receipts", value: reportTotals.totalCashReceipts, icon: <ReceiptText size={18} /> }, { label: "Cash Expenses", value: reportTotals.totalCashExpenses, icon: <TrendingDown size={18} /> }, { label: "Transfers In / Out", value: `${money(reportTotals.totalCashTransfersIn)} / ${money(reportTotals.totalCashTransfersOut)}`, icon: <ArrowLeftRight size={18} /> }, { label: "Closing Cash", value: reportTotals.closingBalance, icon: <PiggyBank size={18} /> }].map((item) => <div className="stat-item" key={item.label}><div className="stat-icon">{item.icon}</div><div className="stat-text"><span>{item.label}</span><strong>{typeof item.value === "string" && item.value.includes("/") ? item.value : money(item.value)}</strong></div></div>)}
        </section>

        <form id="daily-cash-form" onSubmit={(e) => submitReport(e)}>
            <div className="daily-cash-layout"><div className="daily-cash-main">
                {section("Store Information", "Enter report and store details", <div className="daily-form-grid">
                    {field("Report Date", "reportDate", form.reportDate, (e) => updateForm("reportDate", e.target.value), "date", true)}
                    {field("Report Time", "reportTime", form.reportTime, (e) => updateForm("reportTime", e.target.value), "time")}
                    {selectField("Shift", form.shift, (e) => updateForm("shift", e.target.value), [{ value: "", label: "Select Shift" }, { value: "Morning", label: "Morning" }, { value: "Evening", label: "Evening" }])}
                    {field("Branch", "branch", form.branch, (e) => updateForm("branch", e.target.value), "text", true)}
                    {field("Store Name", "storeName", form.storeName, (e) => updateForm("storeName", e.target.value), "text", true)}
                    {field("Cashier Name", "cashierName", form.cashierName, (e) => updateForm("cashierName", e.target.value), "text", true)}
                </div>)}

                {section("Opening Cash Balance", "Opening cash is carried forward from the previous approved report when available", <div className="daily-form-grid">
                    {field("Opening Cash Balance", "openingCashBalance", form.openingCashBalance, (e) => updateForm("openingCashBalance", e.target.value), "number")}
                    <div className="daily-opening-note">The backend determines whether this is a manual opening balance requiring approval or a previous approved closing balance.</div>
                </div>)}

                {section("Collections / Receipts", "Add individual receipts with their classification and payment mode", <>
                    <div className="daily-form-grid">
                        {selectField("Classification", receipt.classification, (e) => setReceipt({ ...receipt, classification: e.target.value }), [{ value: "TODAY'S SALE", label: "Today's Sale" }, { value: "OLD_RECOVERY", label: "Old Recovery" }, { value: "CUSTOMER_ADVANCE", label: "Customer Advance" }])}
                        {field("Customer Name", "customerName", receipt.customerName, (e) => setReceipt({ ...receipt, customerName: e.target.value }))}
                        {field("Receipt No.", "receiptNo", receipt.receiptNo, (e) => setReceipt({ ...receipt, receiptNo: e.target.value }))}
                        {field("Invoice No.", "invoiceNo", receipt.invoiceNo, (e) => setReceipt({ ...receipt, invoiceNo: e.target.value }))}
                        {field("Reference No.", "referenceNo", receipt.referenceNo, (e) => setReceipt({ ...receipt, referenceNo: e.target.value }))}
                        {field("Amount", "amount", receipt.amount, (e) => setReceipt({ ...receipt, amount: e.target.value }), "number")}
                        {selectField("Payment Mode", receipt.paymentMode, (e) => setReceipt({ ...receipt, paymentMode: e.target.value }), PAYMENT_MODES.map((v) => ({ value: v, label: v.replaceAll("_", " ") })))}
                        {field("Destination Account", "destinationAccount", receipt.destinationAccount, (e) => setReceipt({ ...receipt, destinationAccount: e.target.value }))}
                        {field("Remarks", "remarks", receipt.remarks, (e) => setReceipt({ ...receipt, remarks: e.target.value }))}
                    </div>
                    <button type="button" className="daily-add-btn" onClick={() => addItem("receipts", receipt, setReceipt, emptyReceipt)}>+ Add Receipt</button>
                    {listRows("receipts", form.receipts, (item) => <span>{item.classification} · {item.customerName || "Customer"} · {item.paymentMode} · {money(item.amount)}</span>)}
                    <div className="daily-total-box"><span>Total Receipts</span><strong>{money(totals.receipts)}</strong></div>
                    <details className="daily-collection-summary"><summary>Enter collection totals instead (without individual receipt rows)</summary><div className="daily-form-grid">{Object.entries({ cash: "Cash", upi: "UPI", card: "Card", netBanking: "Net Banking", other: "Other" }).map(([key, label]) => field(label, key, form.collections[key], (e) => updateCollection(key, e.target.value), "number"))}</div></details>
                </>)}

                {section("Credit Bills", "Record unpaid customer invoices", <>
                    <div className="daily-form-grid">{field("Customer Name", "customerName", creditBill.customerName, (e) => setCreditBill({ ...creditBill, customerName: e.target.value }))}{field("Invoice No.", "invoiceNo", creditBill.invoiceNo, (e) => setCreditBill({ ...creditBill, invoiceNo: e.target.value }))}{field("Amount", "amount", creditBill.amount, (e) => setCreditBill({ ...creditBill, amount: e.target.value }), "number")}</div>
                    <button type="button" className="daily-add-btn" onClick={() => addItem("creditBills", creditBill, setCreditBill, () => ({ customerName: "", invoiceNo: "", amount: "" }))}>+ Add Credit Bill</button>
                    {listRows("creditBills", form.creditBills, (item) => <span>{item.customerName} · Invoice {item.invoiceNo} · {money(item.amount)}</span>)}
                </>)}

                {section("Expenses", "Cash and digital expenses are classified separately", <>
                    <div className="daily-form-grid">{field("Expense Head", "expenseHead", expense.expenseHead, (e) => setExpense({ ...expense, expenseHead: e.target.value }))}{field("Payee", "payee", expense.payee, (e) => setExpense({ ...expense, payee: e.target.value }))}{field("Amount", "amount", expense.amount, (e) => setExpense({ ...expense, amount: e.target.value }), "number")}{selectField("Payment Mode", expense.paymentMode, (e) => setExpense({ ...expense, paymentMode: e.target.value }), PAYMENT_MODES.map((v) => ({ value: v, label: v.replaceAll("_", " ") })))}{field("Payment Account", "paymentAccount", expense.paymentAccount, (e) => setExpense({ ...expense, paymentAccount: e.target.value }))}<label className="daily-field">
                        <span>Expense Bill Attachment</span>
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            onChange={handleExpenseBillUpload}
                            disabled={uploadingFiles.expense}
                        />
                        {uploadingFiles.expense && <small>Uploading...</small>}
                        {expense.billAttachment && (
                            <a href={expense.billAttachment} target="_blank" rel="noreferrer">
                                View Uploaded Bill
                            </a>
                        )}
                    </label>{field("Remarks", "remarks", expense.remarks, (e) => setExpense({ ...expense, remarks: e.target.value }))}</div>
                    <button type="button" className="daily-add-btn" onClick={() => addItem("expenses", expense, setExpense, () => ({ expenseHead: "", payee: "", amount: "", paymentMode: "CASH", paymentAccount: "", billAttachment: "", remarks: "" }))}>+ Add Expense</button>
                    {listRows("expenses", form.expenses, (item) => <span>{item.expenseHead} · {item.payee} · {item.paymentMode} · {money(item.amount)}</span>)}
                </>)}

                {section("Advance Salary", "Record employee advances and payment mode", <>
                    <div className="daily-form-grid">{field("Employee Name", "employeeName", advance.employeeName, (e) => setAdvance({ ...advance, employeeName: e.target.value }))}{field("Amount", "amount", advance.amount, (e) => setAdvance({ ...advance, amount: e.target.value }), "number")}{selectField("Payment Mode", advance.paymentMode, (e) => setAdvance({ ...advance, paymentMode: e.target.value }), PAYMENT_MODES.map((v) => ({ value: v, label: v.replaceAll("_", " ") })))}{field("Payment Account", "paymentAccount", advance.paymentAccount, (e) => setAdvance({ ...advance, paymentAccount: e.target.value }))}{field("Reason", "reason", advance.reason, (e) => setAdvance({ ...advance, reason: e.target.value }))}</div>
                    <button type="button" className="daily-add-btn" onClick={() => addItem("advanceSalary", advance, setAdvance, () => ({ employeeName: "", amount: "", paymentMode: "CASH", paymentAccount: "", reason: "" }))}>+ Add Advance Salary</button>
                    {listRows("advanceSalary", form.advanceSalary, (item) => <span>{item.employeeName} · {item.paymentMode} · {money(item.amount)} · {item.reason}</span>)}
                </>)}

                <div className="daily-cash-row-3">
                    {section("Cash Transfers In", "Cash received from another location or account", <>
                        <div className="daily-form-grid">{field("Received From", "from", transferIn.from, (e) => setTransferIn({ ...transferIn, from: e.target.value }))}{field("Amount", "amount", transferIn.amount, (e) => setTransferIn({ ...transferIn, amount: e.target.value }), "number")}{field("Reference No.", "referenceNo", transferIn.referenceNo, (e) => setTransferIn({ ...transferIn, referenceNo: e.target.value }))}{field("Remarks", "remarks", transferIn.remarks, (e) => setTransferIn({ ...transferIn, remarks: e.target.value }))}</div>
                        <button type="button" className="daily-add-btn" onClick={() => addItem("cashTransfersIn", transferIn, setTransferIn, () => ({ from: "", amount: "", referenceNo: "", remarks: "" }))}>+ Add Transfer In</button>
                        {listRows("cashTransfersIn", form.cashTransfersIn, (item) => <span>{item.from} · {money(item.amount)}</span>)}
                    </>)}
                    {section("Cash Transfers Out", "Cash sent to another location or account", <>
                        <div className="daily-form-grid">{field("Transferred To", "to", transferOut.to, (e) => setTransferOut({ ...transferOut, to: e.target.value }))}{field("Amount", "amount", transferOut.amount, (e) => setTransferOut({ ...transferOut, amount: e.target.value }), "number")}{field("Reference No.", "referenceNo", transferOut.referenceNo, (e) => setTransferOut({ ...transferOut, referenceNo: e.target.value }))}{field("Remarks", "remarks", transferOut.remarks, (e) => setTransferOut({ ...transferOut, remarks: e.target.value }))}</div>
                        <button type="button" className="daily-add-btn" onClick={() => addItem("cashTransfersOut", transferOut, setTransferOut, () => ({ to: "", amount: "", referenceNo: "", remarks: "" }))}>+ Add Transfer Out</button>
                        {listRows("cashTransfersOut", form.cashTransfersOut, (item) => <span>{item.to} · {money(item.amount)}</span>)}
                    </>)}
                </div>

                {section("Purchase Bills", "Select whether each purchase is cash paid, credit or partial", <>
                    <div className="daily-form-grid">{field("Vendor Name", "vendorName", purchase.vendorName, (e) => setPurchase({ ...purchase, vendorName: e.target.value }))}{field("Bill No.", "billNo", purchase.billNo, (e) => setPurchase({ ...purchase, billNo: e.target.value }))}{field("Bill Amount", "amount", purchase.amount, (e) => setPurchase({ ...purchase, amount: e.target.value }), "number")}{selectField("Payment Status", purchase.paymentStatus, (e) => setPurchase({ ...purchase, paymentStatus: e.target.value }), [{ value: "CASH_PAID", label: "Cash Paid" }, { value: "CREDIT", label: "Credit" }, { value: "PARTIAL", label: "Partial" }])}{field("Paid Amount", "paidAmount", purchase.paidAmount, (e) => setPurchase({ ...purchase, paidAmount: e.target.value },), "number")}{selectField("Payment Mode", purchase.paymentMode, (e) => setPurchase({ ...purchase, paymentMode: e.target.value }), PAYMENT_MODES.map((v) => ({ value: v, label: v.replaceAll("_", " ") })))}<label className="daily-field">
                        <span>Purchase Bill Attachment</span>
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            onChange={handlePurchaseBillUpload}
                            disabled={uploadingFiles.purchase}
                        />
                        {uploadingFiles.purchase && <small>Uploading...</small>}
                        {purchase.attachment && (
                            <a href={purchase.attachment} target="_blank" rel="noreferrer">
                                View Uploaded Bill
                            </a>
                        )}
                    </label></div>
                    <button type="button" className="daily-add-btn" onClick={() => addItem("purchaseBills", purchase, setPurchase, () => ({ vendorName: "", billNo: "", amount: "", paymentStatus: "CASH_PAID", paidAmount: "", paymentMode: "CASH", attachment: "" }))}>+ Add Purchase Bill</button>
                    {listRows("purchaseBills", form.purchaseBills, (item) => <span>{item.vendorName} · {item.paymentStatus} · Paid {money(item.paidAmount ?? item.amount)}</span>)}
                </>)}

                {section("Sales Returns", "Record customer refunds and their payment mode", <>
                    <div className="daily-form-grid">{field("Return No.", "returnNo", salesReturn.returnNo, (e) => setSalesReturn({ ...salesReturn, returnNo: e.target.value }))}{field("Invoice No.", "invoiceNo", salesReturn.invoiceNo, (e) => setSalesReturn({ ...salesReturn, invoiceNo: e.target.value }))}{field("Customer Name", "customerName", salesReturn.customerName, (e) => setSalesReturn({ ...salesReturn, customerName: e.target.value }))}{field("Amount", "amount", salesReturn.amount, (e) => setSalesReturn({ ...salesReturn, amount: e.target.value }), "number")}{selectField("Refund Mode", salesReturn.refundMode, (e) => setSalesReturn({ ...salesReturn, refundMode: e.target.value }), PAYMENT_MODES.map((v) => ({ value: v, label: v.replaceAll("_", " ") })))}{field("Reference No.", "referenceNo", salesReturn.referenceNo, (e) => setSalesReturn({ ...salesReturn, referenceNo: e.target.value }))}{field("Remarks", "remarks", salesReturn.remarks, (e) => setSalesReturn({ ...salesReturn, remarks: e.target.value }))}</div>
                    <button type="button" className="daily-add-btn" onClick={() => addItem("salesReturns", salesReturn, setSalesReturn, () => ({ returnNo: "", invoiceNo: "", customerName: "", amount: "", refundMode: "CASH", referenceNo: "", remarks: "" }))}>+ Add Sales Return</button>
                    {listRows("salesReturns", form.salesReturns, (item) => <span>{item.returnNo} · {item.customerName} · {item.refundMode} · {money(item.amount)}</span>)}
                </>)}

                {section("Closing Cash Summary", "Cash only; digital receipts and payments are settled separately", <div className="closing-summary-list">
                    {[["Opening Cash", Number(form.openingCashBalance || 0)], ["+ Cash Receipts", totals.cashReceipts], ["+ Cash Transfers In", totals.transfersIn], ["− Cash Expenses", -totals.expensesCash], ["− Cash Advance Salary", -totals.advanceCash], ["− Cash Purchase Payments", -totals.purchaseCash], ["− Cash Transfers Out", -totals.transfersOut], ["− Cash Sales Returns", -totals.returnsCash]].map(([label, amount]) => <div className="closing-summary-row" key={label}><span>{label}</span><strong>{money(amount)}</strong></div>)}
                    <div className="closing-summary-divider" /><div className="closing-summary-row total"><span>Expected Closing Cash</span><strong>{money(totals.closing)}</strong></div>
                </div>)}

                {section("Supporting Documents", "Upload additional report documents", <>
                    <div className="daily-form-grid">
                        <label className="daily-field">
                            <span>Upload Supporting Documents</span>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                                multiple
                                onChange={handleSupportingDocumentUpload}
                                disabled={uploadingFiles.supporting}
                            />
                            {uploadingFiles.supporting && <small>Uploading...</small>}
                        </label>
                    </div>

                    {form.documents.length > 0 && (
                        <div className="daily-dynamic-list">
                            {form.documents.map((doc, index) => (
                                <div className="daily-dynamic-row" key={index}>
                                    <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                                        {doc.fileName}
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => removeItem("documents", index)}
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </>)}

                {section("Remarks", "Additional information for this report", <textarea className="daily-remarks" value={form.remarks} onChange={(e) => updateForm("remarks", e.target.value)} rows={4} placeholder="Enter remarks..." />)}

                {section("Remarks", "Additional information for this report", <textarea className="daily-remarks" value={form.remarks} onChange={(e) => updateForm("remarks", e.target.value)} rows={4} placeholder="Enter remarks..." />)}
                <div className="daily-bottom-actions"><button type="button" className="daily-btn secondary" onClick={() => setForm(emptyForm())}>Clear Form</button><button type="submit" className="daily-btn primary" disabled={loading || Object.values(uploadingFiles).some(Boolean)}>{loading ? "Submitting..." : "Submit Report"}</button></div>
            </div>

                <aside className="daily-cash-sidebar">
                    <section className="daily-summary-card"><h2>Today's Report Status</h2>{summaryLoading ? <p>Loading...</p> : !report ? <p>No report submitted for today.</p> : <>
                        <div className="summary-item"><span>Report Status</span><strong>{statusLabel(report.status)}</strong></div>
                        <div className="summary-item"><span>Opening Balance Status</span><strong>{statusLabel(report.openingBalanceStatus)}</strong></div>
                        <div className="summary-item"><span>Opening Cash</span><strong>{money(report.openingCashBalance)}</strong></div>
                        <div className="summary-item"><span>Cash Receipts</span><strong>{money(report.totalCashReceipts)}</strong></div>
                        <div className="summary-item"><span>Digital Receipts</span><strong>{money(report.totalDigitalReceipts)}</strong></div>
                        <div className="summary-item"><span>Cash Expenses</span><strong>{money(report.totalCashExpenses)}</strong></div>
                        <div className="summary-item closing"><span>Closing Cash</span><strong>{money(report.closingBalance)}</strong></div>
                        {isApprover && <div className="daily-approval-actions">
                            {report.openingBalanceSource === "MANUAL" && report.openingBalanceStatus === "PENDING" && <><button type="button" onClick={() => runApproval("opening-balance/approve", "Opening balance approved.")}><CheckCircle2 size={14} /> Approve Opening</button><button type="button" className="reject" onClick={() => runApproval("opening-balance/reject", "Opening balance rejected.", true)}><XCircle size={14} /> Reject Opening</button></>}
                            {report.status === "SUBMITTED" && ["APPROVED", "NOT_REQUIRED"].includes(report.openingBalanceStatus) && <><button type="button" onClick={() => runApproval("approve", "Daily cash report approved.")}><CheckCircle2 size={14} /> Approve Report</button><button type="button" className="reject" onClick={() => runApproval("reject", "Daily cash report rejected.", true)}><XCircle size={14} /> Reject Report</button></>}
                        </div>}
                    </>}</section>
                    <section className="daily-card recent-reports-card"><div className="daily-card-header"><div><h2>Recent Daily Reports</h2></div></div>{recentReports.length ? <div className="recent-reports-list">{recentReports.map((item) => <div className="recent-report-item" key={item._id}><div className="recent-report-icon"><CalendarDays size={15} /></div><div className="recent-report-info"><div className="recent-report-date">{new Date(item.reportDate).toLocaleDateString("en-IN")}</div><div className="recent-report-cashier">{item.cashierName || "—"}</div><div className={`recent-report-status ${(item.status || "").toLowerCase()}`}>{statusLabel(item.status)}</div></div><div className="recent-report-amount">{money(item.closingBalance)}</div></div>)}</div> : <div className="recent-reports-empty">{summaryLoading ? "Loading reports..." : "No recent daily reports"}</div>}</section>
                    <section className="daily-summary-card"><h2>Cash Calculation</h2><div className="summary-item"><span>Cash receipts</span><strong>{money(totals.cashReceipts)}</strong></div><div className="summary-item"><span>Digital receipts</span><strong>{money(Math.max(0, totals.receipts - totals.cashReceipts))}</strong></div><div className="summary-item"><span>Cash transfers in</span><strong>{money(totals.transfersIn)}</strong></div><div className="summary-item expense"><span>Cash outflows</span><strong>{money(totals.expensesCash + totals.advanceCash + totals.purchaseCash + totals.transfersOut + totals.returnsCash)}</strong></div><div className="summary-item closing"><span>Expected closing</span><strong>{money(totals.closing)}</strong></div></section>
                </aside></div>
        </form>
    </div>;
}
