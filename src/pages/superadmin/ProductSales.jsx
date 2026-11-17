import { useState } from "react";
import { Upload } from "lucide-react";
import "../../css/superadmin/productsales.css";

const ProductSales = () => {

    // PRODUCT SALES JSON IMPORT
    const [productSalesData, setProductSalesData] = useState(null);
    const [productSalesFile, setProductSalesFile] = useState("");
    const [productSalesError, setProductSalesError] = useState("");

    // PRODUCT SALES XML IMPORT
    const [productSalesXMLData, setProductSalesXMLData] = useState(null);
    const [productSalesXMLFile, setProductSalesXMLFile] = useState("");
    const [productSalesXMLError, setProductSalesXMLError] = useState("");

    const handleProductSalesJSON = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setProductSalesError("");
        setProductSalesData(null);
        setProductSalesFile("");

        try {
            const fileText = await file.text();
            const parsedData = JSON.parse(fileText.replace(/^\\uFEFF/, ""));

            if (!Array.isArray(parsedData.tallymessage)) {
                throw new Error("Invalid Tally JSON file format");
            }

            setProductSalesData(parsedData);
            setProductSalesFile(file.name);
            console.log("Product Sales JSON Data:", parsedData);
        } catch (error) {
            console.error("JSON Read Error:", error);
            setProductSalesError(error.message || "Unable to read JSON file");
        }

        e.target.value = "";
    };

    // READ PRODUCT SALES XML FILE
    const handleProductSalesXML = async (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setProductSalesXMLError("");
        setProductSalesXMLData(null);
        setProductSalesXMLFile("");

        try {
            const fileText = await file.text();

            // Remove invalid XML character references
            const cleanedXML = fileText.replace(
                /&#(?:0*[0-8]|0*1[1-2]|0*1[4-9]|0*2[0-9]|0*3[01]);/gi,
                ""
            );

            const parser = new DOMParser();

            const xmlDoc = parser.parseFromString(
                cleanedXML,
                "application/xml"
            );

            // Check XML parsing error
            if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
                throw new Error("Invalid XML file format");
            }

            // Get Voucher
            const voucher = xmlDoc.getElementsByTagName("VOUCHER")[0];

            if (!voucher) {
                throw new Error("No Tally Voucher found in XML file");
            }

            // Get XML tag value
            const getValue = (parent, tag) => {
                return parent.getElementsByTagName(tag)[0]?.textContent?.trim() || "";
            };

            // Get Ledger Entries
            const ledgerNodes = voucher.getElementsByTagName(
                "LEDGERENTRIES.LIST"
            );

            const ledgerEntries = Array.from(ledgerNodes).map((ledger) => ({
                ledgername: getValue(ledger, "LEDGERNAME"),
                amount: getValue(ledger, "AMOUNT"),
                hsn: getValue(ledger, "GSTHSNNAME"),
                description: getValue(ledger, "GSTHSNDESCRIPTION"),
                supplyType: getValue(ledger, "GSTOVRDNTYPEOFSUPPLY"),
            }));

            // Get Inventory Entries
            const inventoryNodes = voucher.getElementsByTagName(
                "ALLINVENTORYENTRIES.LIST"
            );

            const inventoryEntries = Array.from(inventoryNodes)
                .map((item) => ({
                    productName: getValue(item, "STOCKITEMNAME"),
                    quantity: getValue(item, "ACTUALQTY"),
                    rate: getValue(item, "RATE"),
                    amount: getValue(item, "AMOUNT"),
                }))
                .filter((item) => item.productName);

            const parsedVoucher = {
                voucherNumber: getValue(voucher, "VOUCHERNUMBER"),
                voucherType: getValue(voucher, "VOUCHERTYPENAME"),
                date: getValue(voucher, "DATE"),
                partyName: getValue(voucher, "PARTYNAME"),
                partyGSTIN: getValue(voucher, "PARTYGSTIN"),
                ledgerEntries,
                inventoryEntries,
            };

            setProductSalesXMLData(parsedVoucher);
            setProductSalesXMLFile(file.name);

            console.log("Product Sales XML Data:", parsedVoucher);

        } catch (error) {
            console.error("XML Read Error:", error);

            setProductSalesXMLError(
                error.message || "Unable to read XML file"
            );
        }

        e.target.value = "";
    };

    return (
        <div className="product-sales-page">
            <div className="product-sales-import-section">
                <div className="product-sales-import-header">
                    <div>
                        <h3>Product Sales</h3>
                        <p>Fetch sales voucher data from Tally JSON file</p>
                    </div>

                    <label className="product-sales-upload-btn">
                        <Upload size={17} />
                        Select JSON File
                        <input
                            type="file"
                            accept=".json,application/json"
                            onChange={handleProductSalesJSON}
                            hidden
                        />
                    </label>

                    <label className="product-sales-upload-btn product-sales-xml-btn">
                        <Upload size={17} />
                        Select XML File

                        <input
                            type="file"
                            accept=".xml,application/xml,text/xml"
                            onChange={handleProductSalesXML}
                            hidden
                        />
                    </label>
                </div>

                {productSalesFile && (
                    <p className="product-sales-file-name">
                        Selected File: {productSalesFile}
                    </p>
                )}

                {productSalesError && (
                    <p className="product-sales-error">{productSalesError}</p>
                )}
            </div>

            {productSalesData?.tallymessage?.length > 0 && (
                <div className="product-sales-details">
                    <div className="product-sales-details-header">
                        <h3>Sales Voucher Details</h3>
                        <span>{productSalesData.tallymessage.length} Voucher(s)</span>
                    </div>

                    {productSalesData.tallymessage.map((voucher, index) => (
                        <div className="product-sales-voucher" key={index}>
                            <div className="product-sales-summary">
                                <div>
                                    <label>Voucher Number</label>
                                    <strong>{voucher.vouchernumber || "-"}</strong>
                                </div>
                                <div>
                                    <label>Voucher Type</label>
                                    <strong>{voucher.metadata?.vchtype || "-"}</strong>
                                </div>
                                <div>
                                    <label>Date</label>
                                    <strong>
                                        {voucher.date
                                            ? `${voucher.date.slice(6, 8)}/${voucher.date.slice(4, 6)}/${voucher.date.slice(0, 4)}`
                                            : "-"}
                                    </strong>
                                </div>
                                <div>
                                    <label>Party Name</label>
                                    <strong>{voucher.partyname || "-"}</strong>
                                </div>
                                <div>
                                    <label>Party GSTIN</label>
                                    <strong>{voucher.partygstin || "-"}</strong>
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
                                        {(Array.isArray(voucher.ledgerentries)
                                            ? voucher.ledgerentries
                                            : []
                                        ).map((ledger, ledgerIndex) => (
                                            <tr key={ledgerIndex}>
                                                <td>{ledgerIndex + 1}</td>
                                                <td>{ledger.ledgername || "-"}</td>
                                                <td>₹{ledger.amount ?? "0.00"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* PRODUCT SALES XML DETAILS */}
            {productSalesXMLData && (
                <div className="product-sales-details">
                    <div className="product-sales-details-header">
                        <h3>XML Sales Voucher Details</h3>
                        <span>1 Voucher</span>
                    </div>

                    <div className="product-sales-voucher">
                        <div className="product-sales-summary">
                            <div>
                                <label>Voucher Number</label>
                                <strong>{productSalesXMLData.voucherNumber || "-"}</strong>
                            </div>

                            <div>
                                <label>Voucher Type</label>
                                <strong>{productSalesXMLData.voucherType || "-"}</strong>
                            </div>

                            <div>
                                <label>Date</label>
                                <strong>
                                    {productSalesXMLData.date
                                        ? `${productSalesXMLData.date.slice(6, 8)}/${productSalesXMLData.date.slice(4, 6)}/${productSalesXMLData.date.slice(0, 4)}`
                                        : "-"}
                                </strong>
                            </div>

                            <div>
                                <label>Party Name</label>
                                <strong>{productSalesXMLData.partyName || "-"}</strong>
                            </div>

                            <div>
                                <label>Party GSTIN</label>
                                <strong>{productSalesXMLData.partyGSTIN || "-"}</strong>
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
                                    {productSalesXMLData.ledgerEntries.map((ledger, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{ledger.ledgername || "-"}</td>
                                            <td>₹{ledger.amount || "0.00"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <h4 style={{ marginTop: "20px" }}>Product / Inventory Entries</h4>

                        {productSalesXMLData.inventoryEntries.length > 0 ? (
                            <div className="product-sales-table-wrapper">
                                <table className="product-sales-table">
                                    <thead>
                                        <tr>
                                            <th>Sr. No.</th>
                                            <th>Product Name</th>
                                            <th>Quantity</th>
                                            <th>Rate</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {productSalesXMLData.inventoryEntries.map((item, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.productName}</td>
                                                <td>{item.quantity || "-"}</td>
                                                <td>{item.rate || "-"}</td>
                                                <td>₹{item.amount || "0.00"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>No product / inventory entries found in this voucher.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductSales;
