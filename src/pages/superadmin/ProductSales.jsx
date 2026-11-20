import { useState } from "react";
import "../../css/superadmin/productsales.css";

const ProductSales = () => {
    const [loadingSales, setLoadingSales] = useState(false);
    const [apiSalesData, setApiSalesData] = useState([]);

    const fetchProductSales = async () => {
        try {
            setLoadingSales(true);

            const response = await fetch(
                "http://localhost:5000/api/product-sales"
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to fetch product sales"
                );
            }

            setApiSalesData(
                Array.isArray(result.data) ? result.data : []
            );

            console.log("Product Sales API Data:", result.data);

        } catch (error) {
            console.error("Product Sales API Error:", error);
            alert(error.message || "Unable to connect to backend");

        } finally {
            setLoadingSales(false);
        }
    };

    const formatDate = (date) => {
        if (!date || String(date).length !== 8) {
            return "-";
        }

        const value = String(date);

        return `${value.slice(6, 8)}/${value.slice(4, 6)}/${value.slice(0, 4)}`;
    };

    return (
        <div className="product-sales-page">

            <div className="product-sales-import-section">

                <div className="product-sales-import-header">
                    <div>
                        <h3>Product Sales</h3>
                        <p>Fetch sales voucher data directly from Tally</p>
                    </div>

                    <button
                        type="button"
                        className="product-sales-upload-btn"
                        onClick={fetchProductSales}
                        disabled={loadingSales}
                    >
                        {loadingSales ? "Fetching..." : "Fetch Sales Data"}
                    </button>
                </div>

            </div>

            {apiSalesData.length > 0 && (
                <div className="product-sales-details">

                    <div className="product-sales-details-header">
                        <h3>Sales Voucher Details</h3>
                        <span>
                            {apiSalesData.length} Voucher(s)
                        </span>
                    </div>

                    {apiSalesData.map((voucher, index) => (

                        <div
                            className="product-sales-voucher"
                            key={voucher.voucherNumber || index}
                        >

                            <div className="product-sales-summary">

                                <div>
                                    <label>Voucher Number</label>
                                    <strong>
                                        {voucher.voucherNumber || "-"}
                                    </strong>
                                </div>

                                <div>
                                    <label>Voucher Type</label>
                                    <strong>
                                        {voucher.voucherType || "-"}
                                    </strong>
                                </div>

                                <div>
                                    <label>Date</label>
                                    <strong>
                                        {formatDate(voucher.date)}
                                    </strong>
                                </div>

                                <div>
                                    <label>Party Name</label>
                                    <strong>
                                        {voucher.partyName || "-"}
                                    </strong>
                                </div>

                                <div>
                                    <label>Party GSTIN</label>
                                    <strong>
                                        {voucher.partyGSTIN || "-"}
                                    </strong>
                                </div>

                                <div>
                                    <label>Company GSTIN</label>
                                    <strong>
                                        {voucher.companyGSTIN || "-"}
                                    </strong>
                                </div>

                            </div>

                            <h4>Ledger Entries</h4>

                            <div className="product-sales-table-wrapper">

                                <table className="product-sales-table">

                                    <thead>
                                        <tr>
                                            <th>Sr. No.</th>
                                            <th>Ledger Name</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {Array.isArray(voucher.ledgerEntries) &&
                                            voucher.ledgerEntries.map(
                                                (ledger, ledgerIndex) => (
                                                    <tr key={ledgerIndex}>
                                                        <td>
                                                            {ledgerIndex + 1}
                                                        </td>

                                                        <td>
                                                            {ledger.ledgerName || "-"}
                                                        </td>

                                                        <td>
                                                            ₹{Number(
                                                                ledger.amount || 0
                                                            ).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                )
                                            )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    ))}

                </div>
            )}

        </div>
    );
};

export default ProductSales;
