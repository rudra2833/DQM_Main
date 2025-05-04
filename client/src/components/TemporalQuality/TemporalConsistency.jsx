import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import axios from "axios";
import styled from "styled-components";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { PickList } from "primereact/picklist";
const TableWrapper = styled.div`
  max-height: 450px;
  overflow-y: auto;
  width: 50%;
  border: 1px solid #000;
  border-radius: 10px;
`;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const DataContainer = styled.div`
  margin: 20px;
  width: 50%;
  max-width: 800px;
`;

const TableHeader = styled.th`
  background-color: #f2f2f2;
  padding: 10px;
  font-weight: bold;
  text-align: left;
`;

const TableCell = styled.td`
  padding: 10px;
  border-bottom: 1px solid #ccc;
  text-align: left;
`;

const TableBodyRow = styled.tr`
  &:nth-child(even) {
    background-color: #f2f2f2;
  }
  &:hover {
    background-color: #ddd;
  }
`;

const Lab = styled.div`
  background-color: lightgreen;
  color: black;
  padding: 15px;
  font-size: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  margin-top: 20px;
  width: 300px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Table = styled.table`
  width: 50%;
  border-collapse: collapse;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

const TemporalConsistency = () => {
  const [data, setData] = useState(null);
  const [filename, setFilename] = useState("");
  const [source, setSource] = useState([]);
  const [target, setTarget] = useState([]);
  const [logData, setLogData] = useState([]);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    const formData = new FormData();
    formData.append("excelFile", selectedFile);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/generaldetails",
        formData
      );
      if (response.status === 201) {
        setFilename(response.data);
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || "File upload failed");
    }
  };

  const fetchFieldNames = async () => {
    try {
      if (filename) {
        const response = await axios.post(
          "http://localhost:3001/api/fieldnames",
          { filename }
        );
        const fieldNames = response.data.field_names.map((fieldName) => ({
          label: fieldName,
          value: fieldName,
        }));
        setSource(fieldNames);
      } else {
        console.error("No filename selected.");
      }
    } catch (error) {
      console.error("Error fetching field names:", error);
    }
  };

  const fetchProcessedDates = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3001/api/temporalquality/tempoValidity",
        {
          filename,
          attributes: target,
        }
      );
      setData(response.data.result);
      console.log(response.data.result);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const onChange = (e) => {
    const { source, target } = e;
    setTarget(target.length > 1 ? [target[target.length - 1]] : target);
  };

  const reset = () => {
    setData(null);
    setFilename("");
    setSource([]);
    setTarget([]);
  };

  // +++++++++++++++++++++++++++++++++++++++++++++++

  const saveTestData = async () => {
    try {
      let invalidPercentage = data.invalidPercentage;
      let ambiguousPercentage = data.ambiguousPercentage;
      let targett = target[0].label;

      const response = await fetch(
        "http://localhost:3001/api/temporalquality/tempoValidity/save",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename,
            targett,
            invalidPercentage,
            ambiguousPercentage,
          }),
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
        "http://localhost:3001/api/temporalquality/tempoValidity/logs",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const result = await response.json();
      console.log("Fetched logs:", result);
      setLogData(result);
    } catch (error) {
      console.error("Error fetching log data:", error);
    }
  };

  useEffect(() => {
    fetchLogData();
  }, []);

  // +++++++++++++++++++++++++++++++++++++++++++++++

  return (
    <MainContainer>
      <h3 style={{ marginTop: "10px", marginBottom: "10px" }}>
        Temporal Consistency: One Date
      </h3>
      <div
        className="alert alert-primary"
        style={{ margin: "20px 100px", textAlign: "justify" }}
      >
        <b>Definition: </b> Correctness of the order of events.
        <br />
        <b>Reference: </b>ISO 19157:2013(E) Annex D(D.5.2) - The data quality
        measures for the data quality element Temporal Consistency are provided
        in Tables D.62. (Page No. 96)
      </div>

      <input
        className="form-control uploadBtnInput"
        id="formFile"
        style={{ height: "2.5%", width: "355px" }}
        onChange={handleFileChange}
        type="file"
        name="excelFile"
      />
      <br />
      <Button onClick={fetchFieldNames}>Read Dataset</Button>

      <DataContainer>
        <PickList
          source={source}
          target={target}
          itemTemplate={(item) => item.label}
          sourceHeader="Available Attribute Headings"
          targetHeader="Data Product Specification"
          showSourceControls={false}
          showTargetControls={false}
          sourceStyle={{ height: "300px" }}
          targetStyle={{ height: "300px" }}
          onChange={onChange}
        />
      </DataContainer>

      <Button onClick={fetchProcessedDates} style={{ marginBottom: "20px" }}>
        Start Test
      </Button>

      {data && (
        <>
          <Lab>
            <strong>Invalid Percentage:</strong> {data.invalidPercentage}%
            <br />
            <strong>Ambiguous Percentage:</strong> {data.ambiguousPercentage}%
          </Lab>
          <TableWrapper>
            <center>
              <h2
                style={{
                  textAlign: "center",
                  marginBottom: "20px",
                  fontSize: "24px",
                }}
              >
                Filtered Dates
              </h2>
              <Table>
                <thead style={{ backgroundColor: "#f2f2f2" }}>
                  <tr>
                    <TableHeader>Index</TableHeader>
                    <TableHeader>Date (YYYY-MM-DD)</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {data.filterDates.map((date, index) => (
                    <TableBodyRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{date}</TableCell>
                    </TableBodyRow>
                  ))}
                </tbody>
              </Table>
              <h2
                style={{
                  textAlign: "center",
                  marginBottom: "20px",
                  fontSize: "24px",
                }}
              >
                Ambiguous Dates
              </h2>
              <Table>
                <thead style={{ backgroundColor: "#f2f2f2" }}>
                  <tr>
                    <TableHeader>Index</TableHeader>
                    <TableHeader>Date (YYYY-MM-DD)</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {data.ambiguousDates.map((date, index) => (
                    <TableBodyRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{date}</TableCell>
                    </TableBodyRow>
                  ))}
                </tbody>
              </Table>
            </center>
          </TableWrapper>
        </>
      )}

      {data && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          {/* <button
          onClick={saveTestData}
            style={{
              padding: "8px 15px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "1px solid black",
              borderRadius: "5px",
              cursor: "pointer",
              marginBottom: "30px",
            }}
          >
            Save
          </button> */}
          <Button onClick={saveTestData} style={{ marginBottom: "20px" }}>
            Save
          </Button>
        </div>
      )}

      <div className="card" style={{ width: "85%", margin: "0 auto" }}>
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
            field="tested_attribute"
            header="Tested Attribute"
            style={{ width: "20%" }}
          ></Column>

          <Column
            field="invalid_percentage"
            header="Invalid Percentage (%)"
            style={{ width: "15%" }}
          ></Column>

          <Column
            field="ambiguous_percentage"
            header="Ambiguous Percentage (%)"
            style={{ width: "15%" }}
          ></Column>
        </DataTable>
      </div>
    </MainContainer>
  );
};

export default TemporalConsistency;
