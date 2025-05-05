import React, { useState } from "react";
import axios from "axios";

const ImageUplaodSpatialCommission = ({ onCompare }) => {
  const [original, setOriginal] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCompare = async () => {
    if (!original || !error) {
      alert("Please upload both images");
      return;
    }

    const formData = new FormData();
    formData.append("original", original);
    formData.append("error", error);

    setIsLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5001/api/spatialCommissionCheck/compare",
        formData
      );
      onCompare(res.data);
    } catch (err) {
      alert("Error comparing images");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "40px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            flex: "1 1 300px",
            border: "1px solid black",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          <div
            style={{
              fontWeight: "600",
              fontSize: "1rem",
              marginBottom: "8px",
              color: "#1F2937",
            }}
          >
            Reference Image
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setOriginal(e.target.files[0])}
          />
        </div>

        <div
          style={{
            flex: "1 1 300px",
            border: "1px solid black",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          <div
            style={{
              fontWeight: "600",
              fontSize: "1rem",
              marginBottom: "8px",
              color: "#1F2937",
            }}
          >
            Measured Image
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setError(e.target.files[0])}
          />
        </div>
      </div>

      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
      >
        <button
          onClick={handleCompare}
          disabled={isLoading}
          style={{
            padding: "10px 24px",
            // fontSize: '1rem',
            // fontWeight: '600',
            borderRadius: "6px",
            color: "#FFFFFF",
            backgroundColor: isLoading ? "#9CA3AF" : "#3B82F6",
            cursor: isLoading ? "not-allowed" : "pointer",
            border: "none",
            transition: "background-color 0.3s",
          }}
        >
          {isLoading ? "Assessing..." : "Assess"}
        </button>
      </div>
    </>
  );
};

export default ImageUplaodSpatialCommission;
