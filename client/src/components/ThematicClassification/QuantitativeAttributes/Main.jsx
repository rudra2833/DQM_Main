import React, { useState } from "react";

import AccuracyInteger from "./AccuracyInteger";
import AccuracyDecimal from "./AccuracyDecimal";
import UserDefined from "../UserDefined";
const FormatConsist = () => {
  const [Integer, setInteger] = useState(0);
  const [decimal, setDecimal] = useState(1);
  const [number, setNumber] = useState(0);

  return (
    <>
      <center>
        <button
          onClick={() => {
            setNumber(0);
            setDecimal(1);
            setInteger(0);
          }}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            marginRight: "20px",
            backgroundColor: decimal === 1 ? "#4CAF50" : "#ddd",
            color: decimal === 1 ? "#fff" : "#000",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Decimal
        </button>

        <button
          onClick={() => {
            setNumber(0);
            setDecimal(0);
            setInteger(1);
          }}
          style={{
            padding: "10px 20px",
            marginRight: "20px",
            backgroundColor: Integer === 1 ? "#4CAF50" : "#ddd",
            color: Integer === 1 ? "#fff" : "#000",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Integer
        </button>
      </center>
      <div
        className="alert alert-primary"
        style={{ margin: "20px 100px", textAlign: "justify" }}
      >
        <b>Definition: </b> closeness of the value of a quantitative attribute
        to a value accepted as or known to be true.
        <br />
        <b>Reference: </b>ISO 19157:2013(E) Annex D(D.6.3) - The data quality
        measures for the data quality element Quantitative Attribute Accuracy
        are provided in Tables D.71 to D.76. (Page No. 102)
      </div>
      {decimal === 1 && <AccuracyDecimal />}
      {Integer === 1 && <AccuracyInteger />}
    </>
  );
};

export default FormatConsist;
