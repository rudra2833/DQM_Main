import React, { useState } from "react";
import ImageUploadSpatialCommission from "./ImageUplaodSpatialCommission";
import ResultDisplaySpatialCommission from "./ResultDisplaySpatialCommission";
const CommissionSpatialCheck = () => {
  const [results, setResults] = useState(null);

  const handleResults = (data) => {
    setResults(data);
  };

  const containerStyle = {
    minHeight: "100vh",
    padding: "0 1.5rem 1.5rem 1.5rem",
  };

  const wrapperStyle = {
    maxWidth: "90%",
    margin: "0 auto",
  };

  const cardStyle = {
    backgroundColor: "#ffffff",
    padding: "1.5rem",
    borderRadius: "0.5rem",
    // marginBottom: "1.5rem",
  };

  const titleStyle = {
    fontSize: "3rem",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "0.5rem",
  };

  const subtitleStyle = {
    fontSize: "1.875rem",
    color: "#4b5563",
  };

  return (
    <div style={containerStyle}>
      <div style={wrapperStyle}>
        <h2 style={{ textAlign: "center", marginTop: "20px" }}>
          Commission For Spatial Data
        </h2>

        <div className="alert alert-primary" style={{ margin: "20px 100px" }}>
          <li>Upload two maps to compare spatial features and symbols.</li>
          <li>
            Detect missing elements in the test map that exist in the reference
            map and highlights Commission to ensure spatial completeness.
          </li>
          <li>
            Calculates Commission rate based on ISO 19157:2013(E) standards.
          </li>
          <li>Visual overlay displays Extra features for easy review.</li>
        </div>
        <br />

        <div style={cardStyle}>
          <ImageUploadSpatialCommission onCompare={handleResults} />
        </div>

        {results && (
          <div style={cardStyle}>
            <ResultDisplaySpatialCommission results={results} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CommissionSpatialCheck;
