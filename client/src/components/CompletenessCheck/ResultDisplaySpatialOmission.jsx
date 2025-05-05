import React from "react";
import * as XLSX from "xlsx";

const ResultDisplaySpatialOmission = ({ results }) => {
  // Convert hex image data back to bytes
  const hexToBytes = (hex) => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  };

  // Create image URLs from the hex data
  const referenceImageData = results.reference_image
    ? URL.createObjectURL(
      new Blob([hexToBytes(results.reference_image)], {
        type: "image/jpeg",
      })
    )
    : null;

  const measuredImageData = results.measured_image
    ? URL.createObjectURL(
      new Blob([hexToBytes(results.measured_image)], {
        type: "image/jpeg",
      })
    )
    : null;

  const originalCounts = results.original_counts || {};
  const errorCounts = results.error_counts || {};

  const symbolLabels = Array.from(
    new Set([...Object.keys(originalCounts), ...Object.keys(errorCounts)])
  );

  const totalOriginal = Object.values(originalCounts).reduce(
    (sum, val) => sum + val,
    0
  );

  const omissionDetails = symbolLabels
    .map((label) => {
      const omissionCount =
        (originalCounts[label] || 0) - (errorCounts[label] || 0);
      return omissionCount > 0 ? { label, count: omissionCount } : null;
    })
    .filter(Boolean);

  const omissionSymbols = omissionDetails.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const omissionRate =
    totalOriginal > 0
      ? ((omissionSymbols / totalOriginal) * 100).toFixed(2)
      : "0.00";

  const handleSave = () => {
    if (referenceImageData) {
      const link = document.createElement("a");
      link.href = referenceImageData;
      link.download = "reference_image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // Save the measured image
    if (measuredImageData) {
      const link = document.createElement("a");
      link.href = measuredImageData;
      link.download = "measured_image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // Prepare Excel data (unchanged from your original code)
    const tableData = symbolLabels.map((label) => ({
      "Symbol Name": label,
      "Reference Image Count": originalCounts[label] || 0,
      "User Image Count": errorCounts[label] || 0,
      "Omission Count": (originalCounts[label] || 0) > (errorCounts[label] || 0)
        ? (originalCounts[label] || 0) - (errorCounts[label] || 0)
        : 0,
    }));


    tableData.push({
      "Symbol Name": "Total",
      "Reference Image Count": totalOriginal,
      "User Image Count": Object.values(errorCounts).reduce((sum, val) => sum + val, 0),
      "Omission Count": omissionSymbols,
    });

    tableData.push({});
    tableData.push({ "Symbol Name": "Omission Rate (%)", "Reference Image Count": omissionRate });

    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

    XLSX.writeFile(workbook, "results.xlsx");
  };

  return (<div style={{ marginBottom: "2rem" }}>
    <div style={{ backgroundColor: "white", padding: "1rem", borderRadius: "8px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>Images</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div style={{ overflow: "auto" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: "500", marginBottom: "0.5rem" }}>Reference Image</h3>
          {referenceImageData ? (
            <img
              src={referenceImageData}
              alt="Reference image"
              style={{ maxWidth: "100%", height: "auto", border: "1px solid #E5E7EB", borderRadius: "8px" }}
            />
          ) : (
            <p style={{ color: "#6B7280" }}>No reference image available</p>
          )}
        </div>
        <div style={{ overflow: "auto" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: "500", marginBottom: "0.5rem" }}>Measured Image</h3>
          {measuredImageData ? (
            <img
              src={measuredImageData}
              alt="Measured image"
              style={{ maxWidth: "100%", height: "auto", border: "1px solid #E5E7EB", borderRadius: "8px" }}
            />
          ) : (
            <p style={{ color: "#6B7280" }}>No measured image available</p>
          )}
        </div>
      </div>
    </div>

    <div style={{ backgroundColor: "white", padding: "1rem", borderRadius: "8px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>Assessment Summary</h2>
      {results.differences.length === 0 ? (
        <p style={{ color: "#16A34A" }}>No omissions found ✅</p>
      ) : (
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div style={{ padding: "1rem", backgroundColor: "#FEE2E2", borderRadius: "8px" }}>
              <p style={{ fontSize: "1.125rem", fontWeight: "700", color: "#B91C1C" }}>Omission Rate</p>
              <p style={{ fontSize: "1rem", fontWeight: "600", color: "#4B5563" }}>{omissionRate}% omission</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div style={{ padding: "1rem", backgroundColor: "#FEE2E2", borderRadius: "8px", border: "1px solid #FCA5A5" }}>
                <p style={{ fontSize: "1.125rem", fontWeight: "600", color: "#B91C1C" }}>Omission Symbols</p>
                <p style={{ fontSize: "0.875rem", color: "#6B7280", marginBottom: "0.5rem" }}>
                  Total {omissionSymbols} Symbols missing from the Reference Image
                </p>
                {omissionDetails.length > 0 && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <p style={{ fontWeight: "500", color: "#B91C1C" }}>Missing Symbols:</p>
                    <ul style={{ listStyleType: "disc", paddingLeft: "1.25rem", fontSize: "0.875rem" }}>
                      {omissionDetails.map((item, index) => (
                        <li key={index}>
                          {item.label}: {item.count} missing
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    <div style={{ backgroundColor: "white", padding: "1rem", borderRadius: "8px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>Symbol Counts</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ minWidth: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#F9FAFB" }}>
            <tr>
              <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.875rem", fontWeight: "500", color: "#6B7280", textTransform: "uppercase" }}>
                Symbol Name
              </th>
              <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.875rem", fontWeight: "500", color: "#6B7280", textTransform: "uppercase", textAlign: "center" }}>
                Reference Image Count
              </th>
              <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.875rem", fontWeight: "500", color: "#6B7280", textTransform: "uppercase", textAlign: "center" }}>
                User Image Count
              </th>
              <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.875rem", fontWeight: "500", color: "#6B7280", textTransform: "uppercase", textAlign: "center" }}>
                Omission Count
              </th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: "white", borderBottom: "1px solid #E5E7EB" }}>
            {symbolLabels.map((label) => {
              const original = originalCounts[label] || 0;
              const error = errorCounts[label] || 0;
              const omission = original > error ? original - error : 0;
              return (
                <tr key={label}>
                  <td style={{ padding: "1rem", fontWeight: "500" }}>
                    {label}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    {original}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    {error}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center", color: "#DC2626" }}>
                    {omission}
                  </td>
                </tr>
              );
            })}
            <tr style={{ backgroundColor: '#f7fafc', fontWeight: '600' }}>
              <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>Total</td>
              <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', textAlign: 'center' }}>{totalOriginal}</td>
              <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', textAlign: 'center' }}>
                {Object.values(errorCounts).reduce((sum, val) => sum + val, 0)}
              </td>
              <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', textAlign: 'center', color: '#b91c1c' }}>
                {omissionSymbols}
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <button
        onClick={handleSave}
        style={{ backgroundColor: '#3B82F6', color: "white", padding: "0.5rem 1.5rem", borderRadius: "0.375rem", cursor: "pointer", transition: "background-color 0.2s", margin: "1%" }}
      >
        Download Results
      </button>
    </div>
  </div>
  )
};

export default ResultDisplaySpatialOmission;
