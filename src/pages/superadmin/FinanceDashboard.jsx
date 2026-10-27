import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  Calendar,
  Filter,
  RotateCcw,
  Plus,
  Download,
  Upload,
  Wallet,
  Receipt,
  TrendingUp,
  CreditCard,
  Banknote,
  Eye,
  Download as DownloadIcon,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Gift,
  Landmark,
  BarChart3,
  RefreshCw,
  Pencil,
  Trash2,
} from "lucide-react";

import "../../css/superadmin/financeDashboard.css";

const API_URL = "https://oneplussparkpaintsserver.onrender.com/api/finance";

const FinanceDashboard = () => {

  const [dashboard, setDashboard] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    outstandingReceivables: 0,
    outstandingPayables: 0,
    cashInHand: 0,
    totalInvoices: 0,
    paymentReceived: 0,
    outstandingCount: 0,
    pendingPayment: 0,
    creditBalance: 0,
    followUpCount: 0,
  });

  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // SEARCH / FILTERS


  const [search, setSearch] = useState("");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [moduleFilter, setModuleFilter] = useState("ALL");
  const [storeFilter, setStoreFilter] = useState("ALL");
  const [accountFilter, setAccountFilter] = useState("ALL");
  const [paymentModeFilter, setPaymentModeFilter] = useState("ALL");

  const [activeTab, setActiveTab] = useState("ALL");


  // PAGINATION


  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);


  const [dealers, setDealers] = useState([]);
  // MODALS


  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    transactionId: "",
    type: "",
    date: "",
    description: "",
    category: "",
    account: "",
    amount: "",
    paymentMode: "NA",
    status: "",
    invoice: "",
    vendor: "",
    assignedTo: ""
  });

  const [selectedTransaction, setSelectedTransaction] = useState(null);


  // FORM DATA


  const [incomeForm, setIncomeForm] = useState({
    date: "",
    description: "",
    category: "Product Sales",
    account: "Main Account",
    amount: "",
    paymentMode: "BANK_TRANSFER",
    invoice: "",
    vendor: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    date: "",
    description: "",
    category: "Purchase Expense",
    account: "Main Account",
    amount: "",
    paymentMode: "BANK_TRANSFER",
    vendor: "",
  });

  const [formLoading, setFormLoading] = useState(false);


  // FETCH DASHBOARD


  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard`);

      if (response.data.success) {
        setDashboard(response.data.dashboard);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data");
    }
  };


  // FETCH TRANSACTIONS


  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/transactions`);

      if (response.data.success) {
        setTransactions(response.data.transactions || []);
      }
    } catch (err) {
      console.error("Transactions fetch error:", err);
      setError("Failed to load transactions");
    }
  };
  const fetchDealers = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get("https://oneplussparkpaintsserver.onrender.com/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userList = Array.isArray(response.data.users)
        ? response.data.users
        : [];

      const dealerList = userList.filter(
        (user) =>
          String(user.role || "").toLowerCase().trim() === "dealer"
      );

      setDealers(dealerList);
    } catch (error) {
      console.error("Fetch dealers error:", error);
      setDealers([]);
    }
  };



  // INITIAL LOAD


  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      await Promise.all([
        fetchDashboard(),
        fetchTransactions(),
        fetchDealers(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);


  // REFRESH


  const refreshData = async () => {
    setLoading(true);
    setError("");

    await Promise.all([fetchDashboard(), fetchTransactions()]);

    setLoading(false);
  };


  // FORMAT CURRENCY


  const formatCurrency = (value) => {
    return `₹ ${Number(value || 0).toLocaleString("en-IN")}`;
  };

  const formatCompactCurrency = (value) => {
    const num = Number(value || 0);
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${Math.round(num / 1000)}K`;
    return `₹${num}`;
  };


  // FORMAT DATE


  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };


  // FILTER TRANSACTIONS


  const filteredTransactions = useMemo(() => {
    let data = [...transactions];

    // Search
    if (search.trim()) {
      const value = search.toLowerCase();

      data = data.filter((item) => {
        return (
          item.transactionId?.toLowerCase().includes(value) ||
          item.description?.toLowerCase().includes(value) ||
          item.category?.toLowerCase().includes(value) ||
          item.account?.toLowerCase().includes(value) ||
          item.vendor?.toLowerCase().includes(value) ||
          String(item.amount || "").includes(value)
        );
      });
    }

    // Tabs
    if (activeTab !== "ALL") {
      data = data.filter((item) => item.type === activeTab);
    }

    // Payment mode
    if (paymentModeFilter !== "ALL") {
      data = data.filter((item) => item.paymentMode === paymentModeFilter);
    }

    // Store
    if (storeFilter !== "ALL") {
      data = data.filter((item) => (item.store || "MAIN") === storeFilter);
    }

    // Account
    if (accountFilter !== "ALL") {
      data = data.filter((item) => item.account === accountFilter);
    }

    // Module / Category
    if (moduleFilter !== "ALL") {
      data = data.filter((item) => item.category === moduleFilter);
    }

    // Date From
    if (dateFrom) {
      const from = new Date(dateFrom);

      data = data.filter((item) => new Date(item.date) >= from);
    }

    // Date To
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);

      data = data.filter((item) => new Date(item.date) <= to);
    }

    return data;
  }, [
    transactions,
    search,
    activeTab,
    paymentModeFilter,
    storeFilter,
    accountFilter,
    moduleFilter,
    dateFrom,
    dateTo,
  ]);


  // PAGINATION


  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pageNumbers = useMemo(() => {
    const pages = [];
    const windowSize = 5;
    let start = Math.max(1, currentPage - Math.floor(windowSize / 2));
    let end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);


  // RESET FILTERS


  const resetFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setModuleFilter("ALL");
    setStoreFilter("ALL");
    setAccountFilter("ALL");
    setPaymentModeFilter("ALL");
    setActiveTab("ALL");
    setCurrentPage(1);
  };


  // ADD INCOME


  const handleIncomeSubmit = async (e) => {
    e.preventDefault();

    try {
      setFormLoading(true);

      const response = await axios.post(`${API_URL}/income`, incomeForm);

      if (response.data.success) {
        alert("Income added successfully");

        setShowIncomeModal(false);

        setIncomeForm({
          date: "",
          description: "",
          category: "Product Sales",
          account: "Main Account",
          amount: "",
          paymentMode: "BANK_TRANSFER",
          invoice: "",
          vendor: "",
        });

        await refreshData();
      }
    } catch (err) {
      console.error("Add income error:", err);

      alert(err.response?.data?.message || "Failed to add income");
    } finally {
      setFormLoading(false);
    }
  };


  // ADD EXPENSE


  const handleExpenseSubmit = async (e) => {
    e.preventDefault();

    try {
      setFormLoading(true);

      const response = await axios.post(`${API_URL}/expense`, expenseForm);

      if (response.data.success) {
        alert("Expense added successfully");

        setShowExpenseModal(false);

        setExpenseForm({
          date: "",
          description: "",
          category: "Purchase Expense",
          account: "Main Account",
          amount: "",
          paymentMode: "BANK_TRANSFER",
          vendor: "",
        });

        await refreshData();
      }
    } catch (err) {
      console.error("Add expense error:", err);

      alert(err.response?.data?.message || "Failed to add expense");
    } finally {
      setFormLoading(false);
    }
  };


  // VIEW TRANSACTION


  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowViewModal(true);
  };
  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);

    setEditForm({
      transactionId: transaction.transactionId || "",
      type: transaction.type || "",
      date: transaction.date
        ? new Date(transaction.date).toISOString().split("T")[0]
        : "",
      description: transaction.description || "",
      category: transaction.category || "",
      account: transaction.account || "",
      amount: transaction.amount || "",
      paymentMode: transaction.paymentMode || "NA",
      status: transaction.status || "",
      invoice: transaction.invoice || "",
      vendor: transaction.vendor || "",
      assignedTo: transaction.assignedTo?._id || transaction.assignedTo || ""
    });

    setShowEditModal(true);
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/transactions/${id}`);

      setTransactions((prev) =>
        prev.filter((transaction) => transaction._id !== id)
      );

      await fetchDashboard();
      alert("Transaction deleted successfully");
    } catch (error) {
      console.error("Delete transaction error:", error);
      alert(
        error.response?.data?.message || "Failed to delete transaction"
      );
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTransaction?._id) {
      alert("Transaction not selected");
      return;
    }

    try {
      setFormLoading(true);

      await axios.put(
        `${API_URL}/transactions/${selectedTransaction._id}`,
        {
          ...editForm,
          amount: Number(editForm.amount),
          assignedTo: editForm.assignedTo || null,
        }
      );

      alert("Transaction updated successfully");

      setShowEditModal(false);
      setSelectedTransaction(null);

      await Promise.all([fetchTransactions(), fetchDashboard()]);
    } catch (error) {
      console.error("Update transaction error:", error);
      alert(
        error.response?.data?.message || "Failed to update transaction"
      );
    } finally {
      setFormLoading(false);
    }
  };

  // QUICK ACTION


  const handleQuickAction = (action) => {
    if (action === "payment") {
      setShowIncomeModal(true);
      return;
    }

    if (action === "expense") {
      setShowExpenseModal(true);
      return;
    }

    alert(`${action} feature is not connected yet.`);
  };


  // CATEGORY BREAKDOWN (DONUTS)


  const incomeTransactions = transactions.filter((item) => item.type === "PAYMENT_RECEIVED");
  const expenseTransactions = transactions.filter((item) => item.type === "PENDING_PAYMENT");

  const incomeByCategory = {};

  incomeTransactions.forEach((item) => {
    const category = item.category || "Other Income";
    incomeByCategory[category] = (incomeByCategory[category] || 0) + Number(item.amount || 0);
  });

  const expenseByCategory = {};

  expenseTransactions.forEach((item) => {
    const category = item.category || "Other Expenses";
    expenseByCategory[category] = (expenseByCategory[category] || 0) + Number(item.amount || 0);
  });

  const incomeSources = Object.entries(incomeByCategory).sort((a, b) => b[1] - a[1]);
  const expenseSources = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]);

  const incomeTotalForDonut = incomeSources.reduce((sum, [, val]) => sum + val, 0) || 1;
  const expenseTotalForDonut = expenseSources.reduce((sum, [, val]) => sum + val, 0) || 1;

  const incomeDonutColors = ["#16a34a", "#2563eb", "#f59e0b", "#6366f1", "#ec4899", "#0891b2"];
  const expenseDonutColors = ["#ef4444", "#2563eb", "#f59e0b", "#22c55e", "#8b5cf6", "#0891b2"];

  const buildConicGradient = (sources, total, colors) => {
    if (sources.length === 0) return "#e5e7eb";

    let cursor = 0;
    const stops = sources.map(([, value], index) => {
      const start = cursor;
      const angle = (value / total) * 360;
      cursor += angle;
      const color = colors[index % colors.length];
      return `${color} ${start}deg ${cursor}deg`;
    });

    return `conic-gradient(${stops.join(", ")})`;
  };


  // LAST 7 DAYS SERIES (LINE + BAR CHARTS)


  const chartDays = useMemo(() => {
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }

    return days.map((d) => {
      const key = d.toISOString().slice(0, 10);

      const dayIncome = transactions
        .filter(
          (t) => t.type === "PAYMENT_RECEIVED" && String(t.date || "").slice(0, 10) === key
        )
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      const dayExpense = transactions
        .filter(
          (t) => t.type === "PENDING_PAYMENT" && String(t.date || "").slice(0, 10) === key
        )
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      return {
        label: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        income: dayIncome,
        expense: dayExpense,
      };
    });
  }, [transactions]);

  const chartMax = Math.max(...chartDays.map((d) => Math.max(d.income, d.expense)), 1000);

  // Line chart geometry
  const svgW = 700;
  const svgH = 230;
  const padLeft = 55;
  const padRight = 15;
  const padTop = 15;
  const padBottom = 30;
  const plotW = svgW - padLeft - padRight;
  const plotH = svgH - padTop - padBottom;

  const xScale = (i) =>
    padLeft + (chartDays.length > 1 ? (i * plotW) / (chartDays.length - 1) : plotW / 2);

  const yScale = (value) => padTop + plotH - (value / chartMax) * plotH;

  const incomePoints = chartDays.map((d, i) => `${xScale(i)},${yScale(d.income)}`).join(" ");
  const expensePoints = chartDays.map((d, i) => `${xScale(i)},${yScale(d.expense)}`).join(" ");

  const gridSteps = [0, 1, 2, 3, 4];

  const cashInflowTotal = chartDays.reduce((sum, d) => sum + d.income, 0);
  const cashOutflowTotal = chartDays.reduce((sum, d) => sum + d.expense, 0);


  // LOADING


  if (loading) {
    return (
      <div className="finance-loading">
        <RefreshCw size={25} className="loading-icon" />
        <p>Loading Finance Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="finance-dashboard">
      {/*               HEADER           */}

      <div className="finance-page-header">
        <div>
          <h1>Finance Management</h1>

          <div className="finance-breadcrumb">
            Dashboard
            <span>›</span>
            Finance Management
            <span>›</span>
            Finance Dashboard
          </div>
        </div>

        <div className="finance-header-actions">
          <button className="finance-primary-btn" onClick={() => setShowIncomeModal(true)}>
            <Plus size={17} />
            Add Income
          </button>

          <button className="finance-secondary-btn" onClick={() => setShowExpenseModal(true)}>
            <Plus size={17} />
            Add Expense
          </button>

          <button
            className="finance-secondary-btn"
            onClick={() => alert("Import feature will be connected later.")}
          >
            <Upload size={17} />
            Import
          </button>

          <button
            className="finance-secondary-btn"
            onClick={() => alert("Export Report feature will be connected later.")}
          >
            <Download size={17} />
            Export Report
          </button>
        </div>
      </div>

      {/*               ERROR           */}

      {error && <div className="finance-error">{error}</div>}

      {/*               SUMMARY CARDS           */}

      <div className="finance-summary-grid">
        <div className="finance-summary-card">
          <div className="finance-card-icon income">
            <Wallet size={22} />
          </div>

          <div>
            <span>Total Income This Month</span>
            <strong>{formatCurrency(dashboard.totalIncome)}</strong>
            <small className="positive-text">↑ Income received</small>
          </div>
        </div>

        <div className="finance-summary-card">
          <div className="finance-card-icon expense">
            <Receipt size={22} />
          </div>

          <div>
            <span>Total Expenses This Month</span>
            <strong>{formatCurrency(dashboard.totalExpenses)}</strong>
            <small className="negative-text">↑ Expenses</small>
          </div>
        </div>

        <div className="finance-summary-card">
          <div className="finance-card-icon profit">
            <TrendingUp size={22} />
          </div>

          <div>
            <span>Net Profit This Month</span>
            <strong>{formatCurrency(dashboard.netProfit)}</strong>
            <small className="positive-text">Income - Expenses</small>
          </div>
        </div>

        <div className="finance-summary-card">
          <div className="finance-card-icon receivable">
            <CreditCard size={22} />
          </div>

          <div>
            <span>Outstanding Receivables</span>
            <strong>{formatCurrency(dashboard.outstandingReceivables)}</strong>
            <small>From {dashboard.outstandingCount} transactions</small>
          </div>
        </div>

        <div className="finance-summary-card">
          <div className="finance-card-icon payable">
            <Banknote size={22} />
          </div>

          <div>
            <span>Outstanding Payables</span>
            <strong>{formatCurrency(dashboard.outstandingPayables)}</strong>
            <small>Pending payments</small>
          </div>
        </div>

        <div className="finance-summary-card">
          <div className="finance-card-icon cash">
            <Landmark size={22} />
          </div>

          <div>
            <span>Cash in Hand</span>
            <strong>{formatCurrency(dashboard.cashInHand)}</strong>
            <small>Available balance</small>
          </div>
        </div>
      </div>

      {/*               FILTER BAR           */}

      <div className="finance-filter-card">
        <div className="finance-search-box">


          <input
            type="text"
            placeholder="Search by invoice no., vendor, amount, module..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Search size={17} />

          {search && (
            <button className="search-clear-btn" onClick={() => setSearch("")} title="Clear search">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="finance-filter-row">
          <div className="finance-filter-group">
            <label>Date Range</label>

            <div className="date-range-box">
              {/* <Calendar size={16} /> */}

              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
              />

              <span>to</span>

              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="finance-filter-group">
            <label>Module</label>

            <select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Modules</option>
              <option value="Product Sales">Product Sales</option>
              <option value="Service Income">Service Income</option>
              <option value="Scheme Income">Scheme Income</option>
              <option value="Purchase Expense">Purchase Expense</option>
              <option value="Salary Expense">Salary Expense</option>
              <option value="Rent Expense">Rent Expense</option>
              <option value="Utility Expense">Utility Expense</option>
            </select>
          </div>

          <div className="finance-filter-group">
            <label>Store</label>

            <select
              value={storeFilter}
              onChange={(e) => {
                setStoreFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Stores</option>
              <option value="MAIN">Main Store</option>
            </select>
          </div>

          <div className="finance-filter-group">
            <label>Account</label>

            <select
              value={accountFilter}
              onChange={(e) => {
                setAccountFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Accounts</option>
              <option value="Main Account">Main Account</option>
            </select>
          </div>

          <div className="finance-filter-group">
            <label>Payment Mode</label>

            <select
              value={paymentModeFilter}
              onChange={(e) => {
                setPaymentModeFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All</option>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="NEFT">NEFT</option>
              <option value="RTGS">RTGS</option>
              <option value="CHEQUE">Cheque</option>
              <option value="CARD">Card</option>
            </select>
          </div>

          <button className="filters-button" onClick={() => setCurrentPage(1)}>
            <Filter size={16} />
            Filters
          </button>

          <button className="finance-reset-button" onClick={resetFilters}>
            Reset
          </button>
        </div>
      </div>

      {/*               CHARTS ROW           */}

      <div className="finance-charts-grid">
        {/* Income vs Expense */}

        <div className="finance-chart-card income-expense-card">
          <div className="chart-header">
            <div>
              <h3>Income vs Expense Overview</h3>
              <span>Last 7 days activity</span>
            </div>

            <select>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>

          <div className="line-chart-wrapper">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="line-chart-svg" preserveAspectRatio="none">
              {gridSteps.map((k) => {
                const y = padTop + (plotH * k) / 4;
                const value = Math.round(chartMax - (chartMax * k) / 4);

                return (
                  <g key={k}>
                    <line
                      x1={padLeft}
                      x2={svgW - padRight}
                      y1={y}
                      y2={y}
                      className="chart-grid-line"
                    />
                    <text x={padLeft - 8} y={y + 4} textAnchor="end" className="chart-axis-label">
                      {formatCompactCurrency(value)}
                    </text>
                  </g>
                );
              })}

              <polyline points={expensePoints} className="expense-line" fill="none" />
              <polyline points={incomePoints} className="income-line" fill="none" />

              {chartDays.map((d, i) => (
                <circle
                  key={`e-${i}`}
                  cx={xScale(i)}
                  cy={yScale(d.expense)}
                  r="3.5"
                  className="expense-dot-point"
                />
              ))}

              {chartDays.map((d, i) => (
                <circle
                  key={`i-${i}`}
                  cx={xScale(i)}
                  cy={yScale(d.income)}
                  r="3.5"
                  className="income-dot-point"
                />
              ))}

              {chartDays.map((d, i) => (
                <text
                  key={`l-${i}`}
                  x={xScale(i)}
                  y={svgH - 8}
                  textAnchor="middle"
                  className="chart-x-label"
                >
                  {d.label}
                </text>
              ))}
            </svg>
          </div>

          <div className="chart-legend">
            <span>
              <i className="legend-income" />
              Income
            </span>

            <span>
              <i className="legend-expense" />
              Expense
            </span>
          </div>
        </div>

        {/* Top Income Sources */}

        <div className="finance-chart-card">
          <div className="chart-header">
            <div>
              <h3>Top Income Sources</h3>
              <span>This Month</span>
            </div>
          </div>

          <div className="donut-section">
            <div
              className="finance-donut"
              style={{
                background: buildConicGradient(
                  incomeSources,
                  incomeTotalForDonut,
                  incomeDonutColors
                ),
              }}
            >
              <div className="donut-center">
                <strong>{formatCurrency(dashboard.totalIncome)}</strong>
                <span>Total Income</span>
              </div>
            </div>

            <div className="donut-list">
              {incomeSources.length > 0 ? (
                incomeSources.map(([category, amount], index) => (
                  <div className="donut-list-item" key={category}>
                    <div>
                      <i
                        className="income-dot"
                        style={{
                          background: incomeDonutColors[index % incomeDonutColors.length],
                        }}
                      />
                      <span>{category}</span>
                    </div>

                    <strong>
                      {formatCurrency(amount)}
                      <small>
                        {" "}
                        ({Math.round((amount / incomeTotalForDonut) * 100)}%)
                      </small>
                    </strong>
                  </div>
                ))
              ) : (
                <p className="empty-chart">No income data</p>
              )}
            </div>
          </div>
        </div>

        {/* Cash Flow */}

        <div className="finance-chart-card">
          <div className="chart-header">
            <div>
              <h3>Cash Flow</h3>
              <span>Last 7 Days</span>
            </div>

            <select>
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>

          <div className="cash-flow-summary">
            <div>
              <span>Cash Inflow</span>
              <strong className="income-text">{formatCurrency(cashInflowTotal)}</strong>
            </div>

            <div>
              <span>Cash Outflow</span>
              <strong className="expense-text">{formatCurrency(cashOutflowTotal)}</strong>
            </div>

            <div>
              <span>Net Cash Flow</span>
              <strong>{formatCurrency(cashInflowTotal - cashOutflowTotal)}</strong>
            </div>
          </div>

          <div className="cash-flow-bars">
            {chartDays.map((d, index) => (
              <div className="cash-flow-bar-col" key={index}>
                <div className="cash-bar-pair">
                  <div
                    className="cash-bar inflow"
                    style={{ height: `${Math.min((d.income / chartMax) * 100, 100)}%` }}
                  />

                  <div
                    className="cash-bar outflow"
                    style={{ height: `${Math.min((d.expense / chartMax) * 100, 100)}%` }}
                  />
                </div>

                <small>{d.label}</small>
              </div>
            ))}
          </div>

          <div className="chart-legend">
            <span>
              <i className="legend-income" />
              Inflow
            </span>

            <span>
              <i className="legend-expense" />
              Outflow
            </span>
          </div>
        </div>
      </div>

      {/*               TRACK SECTION           */}

      <div className="track-card">
        <div className="track-title">
          <h3>Track</h3>
        </div>

        <div className="track-items">
          <div className="track-item">
            <FileText size={21} />
            <div>
              <span>Invoice</span>
              <strong>{dashboard.totalInvoices}</strong>
              <small>Total Invoices</small>
            </div>
          </div>

          <div className="track-item">
            <Wallet size={21} />
            <div>
              <span>Payment Received</span>
              <strong>{dashboard.paymentReceived}</strong>
              <small>Paid Invoices</small>
            </div>
          </div>

          <div className="track-item">
            <Receipt size={21} />
            <div>
              <span>Outstanding</span>
              <strong>{dashboard.outstandingCount}</strong>
              <small>Outstanding Invoices</small>
            </div>
          </div>

          <div className="track-item">
            <CreditCard size={21} />
            <div>
              <span>Pending Payment</span>
              <strong>{dashboard.pendingPayment}</strong>
              <small>Invoices Pending</small>
            </div>
          </div>

          <div className="track-item">
            <Gift size={21} />
            <div>
              <span>Credit Balance</span>
              <strong>{formatCurrency(dashboard.creditBalance)}</strong>
              <small>Available Credit</small>
            </div>
          </div>
        </div>
      </div>

      {/*               RECENT TRANSACTIONS + EXPENSE BREAKDOWN           */}

      <div className="finance-bottom-grid">
        <div className="transactions-card">
          <div className="transactions-header">
            <h3>Recent Transactions</h3>

            <button onClick={refreshData}>
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>

          {/* TABS */}

          <div className="transaction-tabs">
            <button
              className={activeTab === "ALL" ? "active" : ""}
              onClick={() => {
                setActiveTab("ALL");
                setCurrentPage(1);
              }}
            >
              All Transactions
            </button>

            <button
              className={activeTab === "INVOICE" ? "active" : ""}
              onClick={() => {
                setActiveTab("INVOICE");
                setCurrentPage(1);
              }}
            >
              Invoice
            </button>

            <button
              className={activeTab === "PAYMENT_RECEIVED" ? "active" : ""}
              onClick={() => {
                setActiveTab("PAYMENT_RECEIVED");
                setCurrentPage(1);
              }}
            >
              Payment Received
            </button>

            <button
              className={activeTab === "OUTSTANDING" ? "active" : ""}
              onClick={() => {
                setActiveTab("OUTSTANDING");
                setCurrentPage(1);
              }}
            >
              Outstanding
            </button>

            <button
              className={activeTab === "PENDING_PAYMENT" ? "active" : ""}
              onClick={() => {
                setActiveTab("PENDING_PAYMENT");
                setCurrentPage(1);
              }}
            >
              Pending Payment
            </button>

            <button
              className={activeTab === "CREDIT_BALANCE" ? "active" : ""}
              onClick={() => {
                setActiveTab("CREDIT_BALANCE");
                setCurrentPage(1);
              }}
            >
              Credit Balance
            </button>

            <button
              className={activeTab === "FOLLOW_UP" ? "active" : ""}
              onClick={() => {
                setActiveTab("FOLLOW_UP");
                setCurrentPage(1);
              }}
            >
              Follow-up
            </button>
          </div>

          {/* TABLE */}

          <div className="finance-table-wrapper">
            <table className="finance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Transaction ID</th>
                  <th>Description</th>
                  <th>Category / Account</th>
                  <th>Amount (₹)</th>
                  <th>Payment Mode</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td>{formatDate(transaction.date)}</td>

                      <td>
                        <span
                          className={`transaction-type ${(transaction.type || "").toLowerCase()}`}
                        >
                          {(transaction.type || "-").replaceAll("_", " ")}
                        </span>
                      </td>

                      <td>{transaction.transactionId}</td>

                      <td>{transaction.description}</td>

                      <td>
                        <div className="category-account">
                          <strong>{transaction.category}</strong>
                          <small>{transaction.account}</small>
                        </div>
                      </td>

                      <td
                        className={
                          transaction.type === "PAYMENT_RECEIVED"
                            ? "amount-positive"
                            : "amount-negative"
                        }
                      >
                        {transaction.type === "PAYMENT_RECEIVED" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </td>

                      <td>{transaction.paymentMode?.replaceAll("_", " ") || "-"}</td>

                      <td>
                        <span
                          className={`status-badge ${(transaction.status || "").toLowerCase()}`}
                        >
                          {(transaction.status || "-").replaceAll("_", " ")}
                        </span>
                      </td>

                      <td>
                        <div className="table-actions">
                          <button title="View" onClick={() => handleViewTransaction(transaction)}>
                            <Eye size={16} />
                          </button>

                          <button
                            title="Download"
                            onClick={() => alert("Download feature will be connected later.")}
                          >
                            <DownloadIcon size={16} />
                          </button>

                          <button
                            title="Edit"
                            onClick={() => handleEditTransaction(transaction)}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            title="Delete"
                            onClick={() => handleDeleteTransaction(transaction._id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="no-data">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}

          <div className="pagination-row">
            <span>
              Showing{" "}
              {filteredTransactions.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of{" "}
              {filteredTransactions.length} entries
            </span>

            <div className="pagination-controlsf">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeft size={16} />
              </button>

              {pageNumbers.map((page) => (
                <button
                  key={page}
                  className={currentPage === page ? "active" : ""}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/*                 EXPENSE BREAKDOWN             */}

        <div className="expense-breakdown-card">
          <div className="chart-header">
            <div>
              <h3>Expense Breakdown</h3>
              <span>This Month</span>
            </div>
          </div>

          <div className="expense-donut-section">
            <div
              className="finance-donut expense-donut"
              style={{
                background: buildConicGradient(
                  expenseSources,
                  expenseTotalForDonut,
                  expenseDonutColors
                ),
              }}
            >
              <div className="donut-center">
                <strong>{formatCurrency(dashboard.totalExpenses)}</strong>
                <span>Total Expense</span>
              </div>
            </div>

            <div className="expense-list">
              {expenseSources.length > 0 ? (
                expenseSources.map(([category, amount], index) => (
                  <div className="expense-list-item" key={category}>
                    <span>
                      <i
                        className="expense-dot"
                        style={{
                          background: expenseDonutColors[index % expenseDonutColors.length],
                        }}
                      />
                      {category}
                    </span>

                    <strong>{formatCurrency(amount)}</strong>
                  </div>
                ))
              ) : (
                <p className="empty-chart">No expense data</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/*               QUICK ACTIONS           */}

      <div className="quick-actions-card">
        <h3>Quick Actions</h3>

        <div className="quick-actions-gridd">
          <button onClick={() => handleQuickAction("invoice")}>
            <FileText size={22} />
            <span>Create Invoice</span>
          </button>

          <button onClick={() => handleQuickAction("payment")}>
            <Gift size={22} />
            <span>Record Payment</span>
          </button>

          <button onClick={() => handleQuickAction("expense")}>
            <Receipt size={22} />
            <span>Add Expense</span>
          </button>

          <button onClick={() => handleQuickAction("receipt")}>
            <Wallet size={22} />
            <span>Record Receipt</span>
          </button>

          <button onClick={() => handleQuickAction("reports")}>
            <BarChart3 size={22} />
            <span>View Reports</span>
          </button>

          <button onClick={() => handleQuickAction("bank reconciliation")}>
            <Landmark size={22} />
            <span>Bank Reconciliation</span>
          </button>
        </div>
      </div>

      {/*               ADD INCOME MODAL           */}

      {showIncomeModal && (
        <div className="finance-modal-overlay" onClick={() => setShowIncomeModal(false)}>
          <div className="finance-modal" onClick={(e) => e.stopPropagation()}>
            <div className="finance-modal-header">
              <div>
                <h2>Add Income</h2>
                <p>Add a new income transaction</p>
              </div>
            </div>

            <form onSubmit={handleIncomeSubmit} className="finance-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Date *</label>

                  <input
                    type="date"
                    required
                    value={incomeForm.date}
                    onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Amount *</label>

                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="Enter amount"
                    value={incomeForm.amount}
                    onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description *</label>

                  <input
                    type="text"
                    required
                    placeholder="Enter description"
                    value={incomeForm.description}
                    onChange={(e) =>
                      setIncomeForm({ ...incomeForm, description: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>

                  <select
                    value={incomeForm.category}
                    onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value })}
                  >
                    <option>Product Sales</option>
                    <option>Service Income</option>
                    <option>Scheme Income</option>
                    <option>Other Income</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Account *</label>

                  <input
                    type="text"
                    required
                    value={incomeForm.account}
                    onChange={(e) => setIncomeForm({ ...incomeForm, account: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Payment Mode</label>

                  <select
                    value={incomeForm.paymentMode}
                    onChange={(e) =>
                      setIncomeForm({ ...incomeForm, paymentMode: e.target.value })
                    }
                  >
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="NEFT">NEFT</option>
                    <option value="RTGS">RTGS</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CARD">Card</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Invoice No.</label>

                  <input
                    type="text"
                    placeholder="Optional"
                    value={incomeForm.invoice}
                    onChange={(e) => setIncomeForm({ ...incomeForm, invoice: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Vendor</label>

                  <input
                    type="text"
                    placeholder="Optional"
                    value={incomeForm.vendor}
                    onChange={(e) => /^[A-Za-z\s]*$/.test(e.target.value) && setIncomeForm({ ...incomeForm, vendor: e.target.value })}
                  />
                </div>
              </div>

              <div className="finance-modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowIncomeModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="finance-primary-btn" disabled={formLoading}>
                  {formLoading ? "Saving..." : "Add Income"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/*               ADD EXPENSE MODAL           */}

      {showExpenseModal && (
        <div className="finance-modal-overlay" onClick={() => setShowExpenseModal(false)}>
          <div className="finance-modal" onClick={(e) => e.stopPropagation()}>
            <div className="finance-modal-header">
              <div>
                <h2>Add Expense</h2>
                <p>Add a new expense transaction</p>
              </div>
            </div>

            <form onSubmit={handleExpenseSubmit} className="finance-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Date *</label>

                  <input
                    type="date"
                    required
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Amount *</label>

                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="Enter amount"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description *</label>

                  <input
                    type="text"
                    required
                    placeholder="Enter description"
                    value={expenseForm.description}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, description: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>

                  <select
                    value={expenseForm.category}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, category: e.target.value })
                    }
                  >
                    <option>Purchase Expense</option>
                    <option>Salary Expense</option>
                    <option>Rent Expense</option>
                    <option>Utility Expense</option>
                    <option>Other Expenses</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Account *</label>

                  <input
                    type="text"
                    required
                    value={expenseForm.account}
                    onChange={(e) => setExpenseForm({ ...expenseForm, account: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Payment Mode</label>

                  <select
                    value={expenseForm.paymentMode}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, paymentMode: e.target.value })
                    }
                  >
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="NEFT">NEFT</option>
                    <option value="RTGS">RTGS</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CARD">Card</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Vendor</label>

                  <input
                    type="text"
                    placeholder="Vendor name"
                    value={expenseForm.vendor}
                    onChange={(e) => /^[A-Za-z\s]*$/.test(e.target.value) && setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                  />
                </div>
              </div>

              <div className="finance-modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowExpenseModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="finance-primary-btn" disabled={formLoading}>
                  {formLoading ? "Saving..." : "Add Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/*               VIEW TRANSACTION MODAL           */}

      {showViewModal && selectedTransaction && (
        <div className="finance-modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="finance-view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="finance-modal-header">
              <div>
                <h2>Transaction Details</h2>
                <p>{selectedTransaction.transactionId}</p>
              </div>
            </div>

            <div className="transaction-details">
              <div>
                <span>Transaction ID</span>
                <strong>{selectedTransaction.transactionId}</strong>
              </div>

              <div>
                <span>Date</span>
                <strong>{formatDate(selectedTransaction.date)}</strong>
              </div>

              <div>
                <span>Type</span>
                <strong>{(selectedTransaction.type || "-").replaceAll("_", " ")}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{selectedTransaction.status}</strong>
              </div>

              <div>
                <span>Description</span>
                <strong>{selectedTransaction.description}</strong>
              </div>

              <div>
                <span>Category</span>
                <strong>{selectedTransaction.category}</strong>
              </div>

              <div>
                <span>Account</span>
                <strong>{selectedTransaction.account}</strong>
              </div>

              <div>
                <span>Payment Mode</span>
                <strong>{selectedTransaction.paymentMode?.replaceAll("_", " ")}</strong>
              </div>

              <div>
                <span>Amount</span>
                <strong className="detail-amount">{formatCurrency(selectedTransaction.amount)}</strong>
              </div>

              {selectedTransaction.invoice && (
                <div>
                  <span>Invoice</span>
                  <strong>{selectedTransaction.invoice}</strong>
                </div>
              )}

              {selectedTransaction.vendor && (
                <div>
                  <span>Vendor</span>
                  <strong>{selectedTransaction.vendor}</strong>
                </div>
              )}
            </div>

            <div className="finance-modal-footer">
              <button className="cancel-btn" onClick={() => setShowViewModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedTransaction && (
        <div className="finance-modal-overlay">
          <div className="finance-modal">
            <div className="finance-modal-header">
              <h2>Edit Transaction</h2>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="form-grid">

                <div className="form-group">
                  <label>Transaction ID</label>
                  <input
                    type="text"
                    value={editForm.transactionId}
                    onChange={(e) =>
                      setEditForm({ ...editForm, transactionId: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={editForm.type}
                    onChange={(e) =>
                      setEditForm({ ...editForm, type: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="INVOICE">Invoice</option>
                    <option value="PAYMENT_RECEIVED">Payment Received</option>
                    <option value="OUTSTANDING">Outstanding</option>
                    <option value="PENDING_PAYMENT">Pending Payment</option>
                    <option value="CREDIT_BALANCE">Credit Balance</option>
                    <option value="FOLLOW_UP">Follow Up</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) =>
                      setEditForm({ ...editForm, date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Account</label>
                  <input
                    type="text"
                    value={editForm.account}
                    onChange={(e) =>
                      setEditForm({ ...editForm, account: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.amount}
                    onChange={(e) =>
                      setEditForm({ ...editForm, amount: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Payment Mode</label>
                  <select
                    value={editForm.paymentMode}
                    onChange={(e) =>
                      setEditForm({ ...editForm, paymentMode: e.target.value })
                    }
                  >
                    <option value="NA">NA</option>
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="NEFT">NEFT</option>
                    <option value="RTGS">RTGS</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CARD">Card</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="PAID">Paid</option>
                    <option value="RECEIVED">Received</option>
                    <option value="OUTSTANDING">Outstanding</option>
                    <option value="PENDING">Pending</option>
                    <option value="CREDIT">Credit</option>
                    <option value="FOLLOW_UP">Follow Up</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Invoice</label>
                  <input
                    type="text"
                    value={editForm.invoice}
                    onChange={(e) =>
                      setEditForm({ ...editForm, invoice: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Vendor</label>
                  <input
                    type="text"
                    value={editForm.vendor}
                    onChange={(e) =>
                      setEditForm({ ...editForm, vendor: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Assign Dealer</label>

                  <select
                    value={editForm.assignedTo}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        assignedTo: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Dealer</option>

                    {dealers.map((dealer) => (
                      <option key={dealer._id} value={dealer._id}>
                        {dealer.name} - {dealer.email}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="finance-modal-actions">
                <button className="finance-cancel-update-btn"
                  type="button"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>

                <button className="finance-update-btn"
                  type="submit">
                  Update Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceDashboard;