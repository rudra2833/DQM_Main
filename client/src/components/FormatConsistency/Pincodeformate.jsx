import React, { useState, useEffect } from "react";
import { PickList } from "primereact/picklist";
import axios from "axios";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import VisibilityIcon from "@mui/icons-material/Visibility";
// import DownloadIcon from "@mui/icons-material/Download";
import "../Omission.css";
import { Modal, Button, Table, Spinner } from "react-bootstrap";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";

const Pincodeformate = () => {
  const [source, setSource] = useState([]);
  const [target, setTarget] = useState([]);
  const [selectedFilename, setSelectedFilename] = useState("");
  const [fetchingFieldNames, setFetchingFieldNames] = useState(false);
  const [sendingFieldNames, setSendingFieldNames] = useState(false);
  const [pincodeValidationData, setPincodeValidationData] = useState([]);

  let sendField = [];

  const onChange = (event) => {
    setSource(event.source);
    setTarget(event.target);
    // setOmissionRate(0);
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    const formData = new FormData();

    formData.append("excelFile", selectedFile);

    try {
      setFetchingFieldNames(true);
      const response = await axios.post(
        "http://localhost:3001/api/generaldetails",
        formData
      );
      console.log(response.data);
      if (response.status === 201) {
        setSelectedFilename(response.data);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert(error.response.data.message);
      }
      console.log("Error:", error);
      // alert("Format consistency requirement not matched!");
    } finally {
      setFetchingFieldNames(false);
    }
  };

  const fetchFieldNames = async () => {
    try {
      setFetchingFieldNames(true);
      if (selectedFilename) {
        console.log(selectedFilename);
        const response = await axios.post(
          "http://localhost:3001/api/fieldnames",
          { filename: selectedFilename }
        );
        console.log(response.data.field_names);
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
    } finally {
      setFetchingFieldNames(false);
    }
  };

  const sendFieldNames = async () => {
    try {
      setSendingFieldNames(true);
      if (selectedFilename) {
        target.forEach((e) => {
          sendField.push(e.value);
        });
        const response = await axios.post(
          "http://localhost:3001/api/pincodeformate/pincode-auto",
          {
            filename: selectedFilename,
            attributes: sendField,
          }
        );

        // console.log(response.data);
        // setOmissionRate(response.data.omissionRate);

        // const targetArr = [];
        // target.forEach((e) => {
        //   targetArr.push(e.value);
        // });

        // setOmission((prevOmission) => ({
        //   ...prevOmission,
        //   field_names: targetArr,
        //   file_name: selectedFilename,
        //   omission_rate: response.data.omissionRate,
        // }));

        // Set the pincode validation data
        setPincodeValidationData(response.data);
      } else {
        console.log("Please Select a file.");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setSendingFieldNames(false);
    }
    sendField = [];
  };

  const calculateAccuracy = (data) => {
    if (!data || data.length === 0) return 0;

    // Count the number of true values in the 'isvalid' property
    const trueCount = data.reduce((acc, curr) => {
      if (curr.isvalid === true) {
        return acc + 1;
      } else {
        return acc;
      }
    }, 0);

    // Calculate the accuracy percentage
    const accuracy = parseFloat((trueCount / data.length) * 100).toFixed(2);
    return {accuracy, trueCount};
  };

  // Calculate accuracy
  const temp = calculateAccuracy(pincodeValidationData);  
  const rows = {
    filename: selectedFilename,
    total: temp.trueCount + (pincodeValidationData.length - temp.trueCount),
    valid: temp.trueCount,
    invalid: pincodeValidationData.length - temp.trueCount,
    accuracy: temp.accuracy,
    errorRate: 100 - temp.accuracy,
  }

  return (
    <>
      <div>
        <h2>&nbsp;Pincode Format</h2>
        <center>
          <input
            className="form-control uploadBtnInput"
            id="formFile"
            style={{ height: "2.5%", width: "355px" }}
            onChange={handleFileChange}
            onClick={() => {
              // setOmissionRate(0);
            }}
            type="file"
          />
          <br />
          <button
            type="button"
            className="btn btn-primary"
            onClick={fetchFieldNames}
            disabled={fetchingFieldNames}
          >
            {fetchingFieldNames ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Start Test"
            )}
          </button>
        </center>

        <center>
          <div
            style={{
              marginTop: "1%",
              width: "70%",
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
            }}
          >
            <div style={{ flex: "1", marginRight: "10px" }}>
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
            </div>
          </div>
          <button
            className="btn btn-primary mt-3"
            onClick={sendFieldNames}
            disabled={target.length === 0 || sendingFieldNames}
          >
            {sendingFieldNames ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Check Validity"
            )}
          </button>
          {/* <h4>Pincode Accuracy Rate: {accuracy}%</h4> */}
          <DataTable
            value={rows ? [rows] : []} // Use rows for the table value
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
              style={{ width: "15%", border: "1px solid black" }}
              body={(rowData) => (
                <div>
                  {rowData.errorRate.toFixed(2)}%
                </div>
              )}
            ></Column>
          </DataTable>
          <div style={{ margin: "0 20px", overflowX: "auto" }}>
            <DataTable
              style={{ width: "80%", margin: "15px"}}
              value={pincodeValidationData} // Use pincodeValidationData for the table value
              paginator
              rows={5}
              rowsPerPageOptions={[5, 10, 25, 50]}
              tableStyle={{ minWidth: "5rem" }
              }
            >
              <Column
                field="pincode"
                header="Pincode"
                style={{ width: "25%" }}
              ></Column>
              <Column
                field="isvalid"
                header="IsValid"
                style={{ width: "25%" }}
              ></Column>
            </DataTable>
          </div>

        </center>
        </div>
    </>
  );
};

export default Pincodeformate;
