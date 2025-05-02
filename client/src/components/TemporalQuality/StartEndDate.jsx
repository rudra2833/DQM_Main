import React, { useState, useEffect } from "react";
import { Button } from 'react-bootstrap';
import axios from 'axios';
import styled from 'styled-components';


import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { PickList } from "primereact/picklist";
const TableWrapper = styled.div`
  max-height: 450px;
  overflow-y: auto;
  width: 70%;
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
  width: 70%;
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
  width: 70%;
  border-collapse: collapse;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

const TemporalConsistency = () => {
  const [data, setData] = useState(null);
  const [filename, setFilename] = useState("");
  const [attributes, setAttributes] = useState([]);
  const [source, setSource] = useState([]);
  const [target, setTarget] = useState([]);
  const [incorrect, setIncorrect] = useState([]);
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
      alert(error.response?.data?.message || 'File upload failed');
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
        "http://localhost:3001/api/temporalquality/tempoStartEnd",
        {
          filename,
          attributes: target,
        }
      );
      setData(response.data.result.combinedDates2);
      setIncorrect(response.data.result.count)
    console.log(response.data.result)
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const onChange = (e) => {
    const { source, target } = e;
    setTarget(target.length > 2 ? [target[target.length - 2]] : target);
  };

  const reset = () => {
    setData(null);
    setFilename("");
    setAttributes([]);
    setSource([]);
    setTarget([]);
  };




    // +++++++++++++++++++++++++++++++++++++++++++++++
  
    const saveTestData = async () => {
      try {
        let invalidPercentage = incorrect
        let targett = target[0].label;
        let targett2 = target[1].label;
  
        const response = await fetch(
          "http://localhost:3001/api/temporalquality/tempoStartEnd/save",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename,
              targett,
              targett2,
              invalidPercentage,
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
          "http://localhost:3001/api/temporalquality/tempoStartEnd/logs",
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
        Start-End Date Consistency
      </h3>

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
            <strong>valid Percentage:</strong> {incorrect}%
          
          </Lab>
          <TableWrapper>
            <center>
         
              
              <h2 style={{ textAlign: "center", marginBottom: "20px", fontSize: "24px" }}>
                Ambiguous Dates
              </h2>
              <Table>
                <thead style={{ backgroundColor: "#f2f2f2" }}>
                  <tr>
                    <TableHeader>Index</TableHeader>
                    <TableHeader>Start Date (YYYY-MM-DD)</TableHeader>
                    <TableHeader>End Date (YYYY-MM-DD)</TableHeader>
                    <TableHeader>Valid</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((date, index) => (
                    <TableBodyRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{date.date1}</TableCell>
                      <TableCell>{date.date2}</TableCell>
                      <TableCell>{date.valid}</TableCell>
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
                  field="tested_attribute1"
                  header="Tested Attribute 1"
                  style={{ width: "20%" }}
                ></Column>
      
                <Column
                  field="tested_attribute2"
                  header="Tested Attribute 2"
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