import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx"; // Import XLSX library
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
// import { Modal, Button } from 'react-bootstrap';
import { Modal, Button, Table } from "react-bootstrap";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { FixedSizeList as List } from "react-window";
import styled from "styled-components";

const MainContainer = styled.div`
  padding: 40px;
`;

const DataContainer = styled.div`
  margin-top: 42px;
`;

const TableRow = ({ index, style, data }) => {
  const row = data[index];
  return (
    <div
      style={{
        ...style,
        display: "flex",
        borderBottom: "1px solid #ccc",
        padding: "0 10px",
        alignItems: "center",
        backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white",
      }}
    >
      {Object.keys(row).map((key) => (
        <div
          key={key}
          style={{
            flex: 1,
            padding: "10px",
            borderRight: "1px solid #ddd",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={row[key]}
        >
          {row[key]}
        </div>
      ))}
    </div>
  );
};

const YourComponent = () => {
  const [jsonData, setJsonData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    const formData = new FormData();
    formData.append("excelFile", selectedFile);
    formData.append("fileName", selectedFile.name); // Add file name to form data
    try {
      const response = await axios.post(
        "http://localhost:3001/api/generaldetails/dateformat",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
 
      setJsonData(response.data.data);
      const rows = {
        filename: selectedFile.name,
        total: response.data.count + response.data.t,
        valid: response.data.count,
        invalid: response.data.t,
        accuracy: response.data.accuracy,
        errorRate: 100 - response.data.accuracy,
      }
      setTableData([rows]);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(jsonData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "data");
    XLSX.writeFile(wb, "data.xlsx");
  };

  return (
    <>
      <MainContainer>
        <center>
          <h2>Date Format</h2>
          <input
            className="form-control uploadBtnInput"
            id="formFile"
            style={{ height: "2.5%", width: "355px" }}
            onChange={handleFileChange}
            type="file"
            name="excelFile"
          />

          <DataTable
            value={tableData}
            style={{ width: "90%", margin: "15px" }}>
            <Column
              field="filename"
              header="Name of File"
              style={{ width: "25%", border: "1px solid black" }}
            ></Column>
            <Column
              field="total"
              header="Total Count"
              style={{ width: "15%", border: "1px solid black" }}
            ></Column>
            <Column
              field="valid"
              header="Valid Count"
              style={{ width: "15%", border: "1px solid black" }}
            ></Column>
            <Column
              field="invalid"
              header="Invalid Count"
              style={{ width: "15%", border: "1px solid black" }}
            ></Column>
            <Column
              field="accuracy"
              header="Accuracy Rate"
              style={{ width: "15%", border: "1px solid black" }}
              body={(rowData) => (
                <div>
                  {rowData.accuracy}%
                </div>
              )}
            ></Column>
            <Column
              field="errorRate"
              header="Error Rate"
              style={{ width: "25%", border: "1px solid black" }}
              body={(rowData) => (
                <div>
                  {rowData.errorRate}%
                </div>
              )}
            ></Column>
          </DataTable>
        </center>

        <div className="mt-4">
          {/* <p>Accuracy: {accuracy.toFixed(2)}%</p> */}
          <center>

            {jsonData.length !== 0 && (
              <>
              <h2 className="text-lg font-bold mb-2">JSON Data</h2>
                <DataContainer style={{ marginTop: "20px", alignItems: "center" }}>
                  <h4>Filter Table</h4>
                  <List
                    style={{ border: "1px solid #ccc", borderRadius: "5px" }}
                    height={450}
                    itemCount={jsonData.length}
                    itemSize={50}
                    width={800}
                    itemData={jsonData}
                  >
                    {TableRow}
                  </List>
                </DataContainer>
              </>
            )}
            {jsonData.length !== 0 && (
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                style={{ backgroundColor: "blue", marginTop: "20px", marginBottom: "20px" }}
                onClick={downloadExcel}
              >
                Download Excel
              </button>
            )}
          </center>
        </div>
      </MainContainer>
    </>
  );
};

export default YourComponent;

// git commit -m "Front end fixing, .env creating, fullstarting added"