import React, { useState } from "react";
import ImageUplaodSpatialOmission from "./ImageUplaodSpatialOmission";
import ResultDisplaySpatialOmission from "./ResultDisplaySpatialOmission";

const OmissionSpatialCheck = () => {
  const [results, setResults] = useState(null);

  const handleResults = (data) => {
    setResults(data);
  };

  const containerStyle = {
    minHeight: "100vh",
    // backgroundColor: '#f3f4f6', // Tailwind's gray-100
    padding: "0 1.5rem 1.5rem 1.5rem",
  };

  const wrapperStyle = {
    maxWidth: "90%", // Tailwind's max-w-8xl
    margin: "0 auto",
  };

  const cardStyle = {
    backgroundColor: "#ffffff",
    padding: "1.5rem",
    borderRadius: "0.5rem",
    // boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    // marginBottom: '1.5rem',
  };

  const titleStyle = {
    fontSize: "3rem", // Tailwind's text-5xl
    fontWeight: "bold",
    color: "#1f2937", // Tailwind's gray-800
    marginBottom: "0.5rem",
  };

  const subtitleStyle = {
    fontSize: "1.875rem", // Tailwind's text-3xl
    color: "#4b5563", // Tailwind's gray-600
  };

  return (
    <div style={containerStyle}>
      <div style={wrapperStyle}>
        <h2 style={{ textAlign: "center", marginTop: "20px" }}>
          Omission For Spatial Data
        </h2>
        {/* <h2 style={{ textAlign: "center", marginBottom: "2%" }}>
        Upload two maps to compare their symbols and detect differences
        </h2> */}
        <div className="alert alert-primary" style={{ margin: "20px 100px" }}>
          <li>Upload two maps to compare spatial features and symbols.</li>
          <li>
            Detect missing elements in the test map that exist in the reference
            map and highlights omissions to ensure spatial completeness.
          </li>
          <li>
            Calculates omission rate based on ISO 19157:2013(E) standards.
          </li>
          <li>Visual overlay displays omitted features for easy review.</li>
        </div>
        <br />

        <div style={cardStyle}>
          <ImageUplaodSpatialOmission onCompare={handleResults} />
        </div>

        {results && (
          <div style={cardStyle}>
            <ResultDisplaySpatialOmission results={results} />
          </div>
        )}
      </div>
    </div>
  );
};

export default OmissionSpatialCheck;
