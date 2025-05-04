import React, { useState, useEffect } from "react";
import MapComponent from "./MapComponent";
import * as XLSX from "xlsx";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const LgdLatLong = () => {
  const [data, setData] = useState([]);
  const [correctedData, setCorrectedData] = useState([]);

  const [validated, setValidated] = useState(false);
  const [presentErrors, setPresentErrors] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [errorRate, setErrorRate] = useState(0);

  const [correctionPressed, setCorrectionPressed] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null); // New state to store file

  const [logData, setLogData] = useState([]);

  const mergeLastColumn = (data, correctedData) => {
    if (!Array.isArray(data) || data.length === 0) {
      alert("No data available to merge.");
      return data; // Return original data if it's invalid
    }

    if (!Array.isArray(correctedData) || correctedData.length === 0) {
      alert("No corrected data available to merge.");
      return data; // Return original data if correctedData is invalid
    }

    const updatedData = data.map((row, index) => {
      if (correctedData[index]) {
        const correctedRow = correctedData[index];
        const correctedKeys = Object.keys(correctedRow);
        const lastKey = correctedKeys[correctedKeys.length - 1]; // Get the last column name
        return { ...row, [lastKey]: correctedRow[lastKey] }; // Merge the last column
      }
      return row; // If no corresponding correctedData, keep the original row
    });

    return updatedData; // Return the updated data
  };

  useEffect(() => {
    console.log("Corrected data updated:", correctedData);
  }, [correctedData]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setData(jsonData);
      setValidated(false);
      setCorrectedData([]); // Reset corrected data on new upload
    };
    reader.readAsBinaryString(selectedFile);
  };

  const validateData = async () => {
    const response = await fetch(
      "http://localhost:3001/api/usecases/lgdlat-lon/validate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      }
    );
    const result = await response.json();

    if (result.errorCount > 0) {
      // alert(`Data validation completed with ${result.errorCount} errors.`);

      setValidated(true);
      setPresentErrors(true);
      setErrorCount(result.errorCount);
      setErrorRate(result.errorRate);

      // Set corrected data first
      setCorrectedData(result.corrected);

      // Merge corrected data with original data
      const mergedData = mergeLastColumn(data, result.corrected);
      console.log("Merged Data:", mergedData);

      // Log the merged data to the console
      console.log("Merged Data:", mergedData);

      // Update the state with merged data
      setData(mergedData);
    } else {
      alert("No errors found in the data.");
    }
  };

  const correctData = async () => {
    setCorrectionPressed(true); // Mark that user pressed Correct button
    console.log("Correcting data...");
  };

  // +++++++++++++++++++++++++++++++++++++++++++++++

  const saveTestData = async () => {
    try {
      let filename = selectedFile.name;
      const response = await fetch(
        "http://localhost:3001/api/usecases/lgdlat-lon/save",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename, errorCount, errorRate }),
        }
      );
  
      if (response.ok) {
        console.log("Data saved successfully");
        await fetchLogData(); // now this will trigger immediately after save
      } else {
        console.log("Error saving data:", await response.text());
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };
  

  const fetchLogData = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/usecases/lgdlat-lon/logs",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const result = await response.json();
      setLogData(result);
    } catch (error) {
      console.error("Error fetching log data:", error);
    }
  };

  useEffect(() => {
    fetchLogData();
  }, []);

  // +++++++++++++++++++++++++++++++++++++++++++++++

  const downloadCorrectedData = () => {
    const worksheet = XLSX.utils.json_to_sheet(correctedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Corrected Data");
    XLSX.writeFile(workbook, "Corrected_Data.xlsx");
  };

  return (
    <div>
      <h2 style={{ textAlign: "center", marginTop: "2%", marginBottom: "2%" }}>
        Geospatial Data Correction Using Administrative Boundaries
      </h2>
      <div className="alert alert-primary" style={{ margin: "20px 100px" }}>
        <li>
          <b>Geospatial Data Validation:</b> Upload your geospatial data
          containing coordinates to validate and correct them based on
          administrative boundaries.
        </li>
        <li>
          <b>Boundary Check:</b> It checks whether the uploaded coordinates lie
          within the specified village boundaries and makes corrections if
          necessary.
        </li>
        <li>
          <b>Bihar-Specific Data:</b> The tool is currently designed and tested
          for geospatial data related to Bihar, India.
        </li>
        <li>
          <b>Simple Execution:</b> Upload your dataset, review the results, run
          the code to apply corrections to your geospatial data points and
          download the possible corrected data.
        </li>
      </div>
      <br />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px",
            marginTop: "10px",
            marginBottom: "1.5%",
            border: "2px solid #ccc",
            borderRadius: "10px",
            backgroundColor: "#fff",
          }}
        >
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            style={{
              padding: "5px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              backgroundColor: "#f9f9f9",
            }}
          />

          <button
            onClick={handleFileUpload}
            style={{
              padding: "8px 15px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "1px solid black",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Upload
          </button>

          <button
            onClick={validateData}
            disabled={!data.length}
            style={{
              padding: "8px 15px",
              backgroundColor: data.length ? "#ffc107" : "#ccc",
              color: "#fff",
              border: "1px solid black",
              borderRadius: "5px",
              cursor: data.length ? "pointer" : "not-allowed",
            }}
          >
            Validate
          </button>

          {validated && (
            <button
              onClick={correctData}
              style={{
                padding: "8px 15px",
                backgroundColor: "#28a745",
                color: "#fff",
                border: "1px solid black",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Correct Data
            </button>
          )}

          {Array.isArray(correctedData) &&
            correctedData.length > 0 &&
            correctionPressed && (
              <button
                onClick={downloadCorrectedData}
                style={{
                  padding: "8px 15px",
                  backgroundColor: "#17a2b8",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Download Corrected Data
              </button>
            )}
        </div>
      </div>

      <div
        style={{
          margin: "0 auto",
          border: "1px solid #ccc",
          borderRadius: "10px",
          width: "90%",
        }}
      >
        {/* Map */}
        <MapComponent
          data={data}
          correctedData={correctedData}
          validated={validated}
          corrected={correctionPressed}
        />
      </div>

      {/* Container for Map and Bottom Sections */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Bottom Overlay Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "10px",
          }}
        >
          {/* Validation Summary Section */}
          {validated && presentErrors && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "20px",
                padding: "20px",
                border: "1px solid #ccc",
                borderRadius: "10px",
                backgroundColor: "#f9f9f9",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                width: "1100px",
                maxWidth: "1400px",
                marginLeft: "5%",
                marginRight: "auto",
                marginBottom: "20px",
              }}
            >
              {/* Pre-Validation */}
              <div
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "10px",
                }}
              >
                <h3 style={{ color: "#444", marginBottom: "10px" }}>
                  🔍 Pre-Validation
                </h3>
                <p>
                  <strong>Total Data:</strong> {data.length}
                </p>
                <p>
                  <strong>Error Count:</strong> {errorCount}
                </p>
                <p>
                  <strong>Error Rate:</strong> {errorRate}%
                </p>
              </div>

              {/* Arrow - only shown after correction */}
              {correctionPressed && (
                <div
                  style={{
                    padding: "0 20px",
                    fontSize: "30px",
                    color: "#666",
                  }}
                >
                  ➡️
                </div>
              )}

              {/* Post-Validation - only shown after correction */}
              {correctionPressed && (
                <div
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "10px",
                  }}
                >
                  <h3 style={{ color: "#2e7d32", marginBottom: "10px" }}>
                    ✅ Post-Validation (Corrected)
                  </h3>
                  <p>
                    <strong>Total Data:</strong> {data.length}
                  </p>
                  <p>
                    <strong>Error Count:</strong> 0
                  </p>
                  <p>
                    <strong>Error Rate:</strong> 0%
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Legend (Bottom Right) */}
          <div
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              width: "fit-content",
              marginTop: "20px",
              marginBottom: "7%",
              marginRight: "5%",
              marginLeft: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "5px",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: "blue",
                  marginRight: "10px",
                  borderRadius: "50%",
                }}
              ></div>
              <span>Blue Pin: "Points of Interest"</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "5px",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: "red",
                  marginRight: "10px",
                  borderRadius: "50%",
                }}
              ></div>
              <span>Red Pin: "Error Points"</span>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: "green",
                  marginRight: "10px",
                  borderRadius: "50%",
                }}
              ></div>
              <span>Green Pin: "Validated and Corrected Points"</span>
            </div>
          </div>
        </div>
      </div>

      {/* Log Data Table */}
      {correctionPressed && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <button
            onClick={saveTestData}
            style={{
              padding: "8px 15px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "1px solid black",
              borderRadius: "5px",
              cursor: "pointer",
              marginBottom: "2%",
            }}
          >
            Save
          </button>
        </div>
      )}

      <div className="card" style={{ width: "85%" , margin: "0 auto" }}>
        <DataTable
          value={logData}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25, 50]}
          tableStyle={{ minWidth: "5rem" }}
        >
          <Column
            field="file_name"
            header="Name of File"
            style={{ width: "25%" }}
          ></Column>

          <Column
            field="tested_date"
            header="Tested Date"
            style={{ width: "20%" }}
          ></Column>
          <Column
            field="total_tuples"
            header="Total Tuples"
            style={{ width: "15%" }}
          ></Column>
          <Column
            field="test_result_percent"
            header="Test Result (%)"
            style={{ width: "15%" }}
          ></Column>
        </DataTable>
      </div>
    </div>
  );
};

export default LgdLatLong;

// import React, { useState, useEffect } from "react";
// import MapComponent from "./MapComponent";
// import * as XLSX from "xlsx";

// const LgdLatLong = () => {
//   const [data, setData] = useState([]);
//   const [correctedData, setCorrectedData] = useState([]);
//   const [validated, setValidated] = useState(false);
//   const [presentErrors, setPresentErrors] = useState(false);
//   const [errorCount, setErrorCount] = useState(0);
//   const [errorRate, setErrorRate] = useState(0);
//   const [correctionPressed, setCorrectionPressed] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);

//   const mergeLastColumn = (data, correctedData) => {
//     if (!Array.isArray(data) || data.length === 0) return data;
//     if (!Array.isArray(correctedData) || correctedData.length === 0) return data;

//     return data.map((row, index) => {
//       if (correctedData[index]) {
//         const correctedRow = correctedData[index];
//         const lastKey = Object.keys(correctedRow).slice(-1)[0];
//         return { ...row, [lastKey]: correctedRow[lastKey] };
//       }
//       return row;
//     });
//   };

//   useEffect(() => {
//     console.log("Corrected data updated:", correctedData);
//   }, [correctedData]);

//   const handleFileChange = (event) => setSelectedFile(event.target.files[0]);

//   const handleFileUpload = () => {
//     if (!selectedFile) return alert("Please select a file first.");
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const workbook = XLSX.read(e.target.result, { type: "binary" });
//       const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
//       setData(jsonData);
//       setValidated(false);
//       setCorrectedData([]);
//     };
//     reader.readAsBinaryString(selectedFile);
//   };

//   const validateData = async () => {
//     const response = await fetch("http://localhost:3001/api/usecases/lgdlat-lon/validate", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ data }),
//     });
//     const result = await response.json();

//     if (result.errorCount > 0) {
//       setValidated(true);
//       setPresentErrors(true);
//       setErrorCount(result.errorCount);
//       setErrorRate(result.errorRate);
//       setCorrectedData(result.corrected);
//       const mergedData = mergeLastColumn(data, result.corrected);
//       setData(mergedData);
//     } else {
//       alert("No errors found in the data.");
//     }
//   };

//   const correctData = async () => {
//     setCorrectionPressed(true);
//     console.log("Correcting data...");
//   };

//   const downloadCorrectedData = () => {
//     const worksheet = XLSX.utils.json_to_sheet(correctedData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Corrected Data");
//     XLSX.writeFile(workbook, "Corrected_Data.xlsx");
//   };

//   return (
//     <div>
//       <div style={{ display: "flex", justifyContent: "center", gap: "10px", margin: "10px 0" }}>
//         <input type="file" accept=".xlsx" onChange={handleFileChange} style={{ padding: "5px", border: "1px solid #ccc", borderRadius: "5px", backgroundColor: "#f9f9f9" }} />
//         <button onClick={handleFileUpload} style={{ padding: "8px 15px", backgroundColor: "#007bff", color: "#fff", border: "1px solid black", borderRadius: "5px" }}>Upload</button>
//         <button onClick={validateData} disabled={!data.length} style={{ padding: "8px 15px", backgroundColor: data.length ? "#ffc107" : "#ccc", color: "#fff", border: "1px solid black", borderRadius: "5px" }}>Validate</button>
//         {validated && (
//           <button onClick={correctData} style={{ padding: "8px 15px", backgroundColor: "#28a745", color: "#fff", border: "1px solid black", borderRadius: "5px" }}>Correct Data</button>
//         )}
//         {Array.isArray(correctedData) && correctedData.length > 0 && correctionPressed && (
//           <button onClick={downloadCorrectedData} style={{ padding: "8px 15px", backgroundColor: "#17a2b8", color: "#fff", border: "none", borderRadius: "5px" }}>Download Corrected Data</button>
//         )}
//       </div>

//       <div style={{ margin: "0 auto", border: "1px solid #ccc", borderRadius: "10px", width: "90%" }}>
//         <MapComponent data={data} correctedData={correctedData} validated={validated} corrected={correctionPressed} />
//       </div>

//       {/* Bottom Section aligned with map */}
//       <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
//         {validated && presentErrors && (
//           <div style={{ display: "flex", justifyContent: "space-between", padding: "20px", border: "1px solid #ccc", borderRadius: "10px", backgroundColor: "#f9f9f9", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", width: "90%" }}>
//             <div style={{ flex: 1, textAlign: "center" }}>
//               <h3 style={{ color: "#444" }}>🔍 Pre-Validation</h3>
//               <p><strong>Total Data:</strong> {data.length}</p>
//               <p><strong>Error Count:</strong> {errorCount}</p>
//               <p><strong>Error Rate:</strong> {errorRate}%</p>
//             </div>
//             {correctionPressed && <div style={{ padding: "0 20px", fontSize: "30px", color: "#666" }}>➡️</div>}
//             {correctionPressed && (
//               <div style={{ flex: 1, textAlign: "center" }}>
//                 <h3 style={{ color: "#2e7d32" }}>✅ Post-Validation (Corrected)</h3>
//                 <p><strong>Total Data:</strong> {data.length}</p>
//                 <p><strong>Error Count:</strong> 0</p>
//                 <p><strong>Error Rate:</strong> 0%</p>
//               </div>
//             )}
//             <div style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "5px", marginLeft: "20px", height: "fit-content" }}>
//               <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
//                 <div style={{ width: "20px", height: "20px", backgroundColor: "blue", marginRight: "10px", borderRadius: "50%" }}></div>
//                 <span>Blue Pin: "Points of Interest"</span>
//               </div>
//               <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
//                 <div style={{ width: "20px", height: "20px", backgroundColor: "red", marginRight: "10px", borderRadius: "50%" }}></div>
//                 <span>Red Pin: "Error Points"</span>
//               </div>
//               <div style={{ display: "flex", alignItems: "center" }}>
//                 <div style={{ width: "20px", height: "20px", backgroundColor: "green", marginRight: "10px", borderRadius: "50%" }}></div>
//                 <span>Green Pin: "Validated and Corrected Points"</span>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default LgdLatLong;
