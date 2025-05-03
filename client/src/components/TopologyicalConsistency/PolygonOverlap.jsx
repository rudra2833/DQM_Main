import React, { useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as turf from "@turf/turf";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const FitBounds = ({ features }) => {
  const map = useMap();

  React.useEffect(() => {
    if (!features || features.length === 0) return;

    try {
      const featureCollection = {
        type: "FeatureCollection",
        features: features,
      };
      const bbox = turf.bbox(featureCollection);
      const bounds = [
        [bbox[1], bbox[0]],
        [bbox[3], bbox[2]],
      ];
      map.fitBounds(bounds);
    } catch (error) {
      console.error("Error fitting bounds:", error);
    }
  }, [features, map]);

  return null;
};

const PolygonOverlap = () => {
  const [mapData, setMapData] = useState(null);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [features, setFeatures] = useState(null);
  const [overlapCount, setOverlapCount] = useState(0);
  const [tableData, setTableData] = useState([]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setSelectedFile(file.name);
    setMapData(null);
    setError("");

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Call backend with skipOverlap=true to get all features colored yellow
      const res = await axios.post(
        "http://localhost:5001/api/topologicalconsistency/polygonOverLap/check-overlap?skipOverlap=true",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setFeatures(res.data.features);
      setMapData(res.data);
      console.log("Received features:", res.data);
      setError("");
    } catch (err) {
      console.error("Error loading features:", err);
      setFeatures(null);
      setMapData(null);
      setError("Failed to load features.");
    }
  };

  const handleCheckOverlap = async () => {
    if (!features) {
      setError("Please upload a file first.");
      return;
    }

    try {
      // Send features to backend without skipOverlap to get overlaps
      const res = await axios.post(
        "http://localhost:5001/api/topologicalconsistency/polygonOverLap/check-overlap",
        features,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log(res.data)
      setMapData(res.data);
      setOverlapCount(res.data.overlap_count);

      const row = {
        selectedFilename: selectedFile,
        total: res.data.features.length,
        overlapCount: res.data.overlap_count,
        ErrorRate: ((res.data.overlap_count/res.data.features.length)*100).toFixed(2) + '%'
      };
      setTableData([row]);
      
      setError("");
    } catch (err) {
      console.error("Overlap check failed:", err);
      setMapData(null);
      setError("Overlap check failed.");
    }
  };

  const onEachFeature = (feature, layer) => {
    const color = feature.properties?._color || "blue";
    layer.setStyle({ color, weight: 2, fillOpacity: 0.5 });

    let popupContent = "<b>Properties:</b><br/>";
    for (const key in feature.properties) {
      if (key !== "_color") {
        popupContent += `${key}: ${feature.properties[key]}<br/>`;
      }
    }
    layer.bindPopup(popupContent);
  };

  const renderFeatures = (features) => {
    if (!features) return null;
    return features.flatMap((feature, index) => {
      const style = {
        color: feature.properties?._color || "blue",
        weight: 2,
        fillOpacity: 0.5,
      };

      if (feature.geometry?.type === "MultiPolygon") {
        const flattened = turf.flatten(feature);
        return flattened.features.map((f, i) => (
          <GeoJSON
            key={`${index}-${i}`}
            data={f}
            style={style}
            onEachFeature={onEachFeature}
          />
        ));
      }

      return (
        <GeoJSON
          key={index}
          data={feature}
          style={style}
          onEachFeature={onEachFeature}
        />
      );
    });
  };

  return (
    <div>
      <h1 style={{ textAlign: "center", marginTop: "2%", marginBottom: "2%" }}>
        Polygon Boundary Overlap Check
      </h1>
      <div className="alert alert-primary" style={{margin: "20px 100px", }}>
          <b>Definition: </b> Ensures the correctness of spatial relationships between polygons, such as  non-overlapping boundaries is explicitly encoded in the dataset.
          <br />
          <b>Formula: </b> (Count of Overlap Count / Total Counts) * 100
          <br />
          <b>Reference: </b>ISO 19157:2013(E) Annex D(D.3.4) - The data quality measures for the data quality element Topological Consistency are provided in Tables D.22 to D.28. (Page No. 62)

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
            accept=".zip"
            onChange={handleFileChange}
            style={{
              padding: "5px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              backgroundColor: "#f9f9f9",
            }}
          />

          <button
            onClick={handleCheckOverlap}
            style={{
              padding: "8px 15px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "1px solid black",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Check Overlap
          </button>
        </div>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div
        style={{
          margin: "0 auto",
          border: "1px solid #ccc",
          borderRadius: "10px",
          width: "90%",
        }}
      >
        <MapContainer
          center={[23.0225, 72.5714]}
          zoom={6}
          style={{ height: "500px" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution=""
          />

          {mapData && renderFeatures(mapData.features)}

          {mapData && <FitBounds features={mapData.features} />}
        </MapContainer>
      </div>

      {/* Legend (Bottom Right) */}
      <div
        style={{
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "5px",
          width: "fit-content",
          marginTop: "20px",
          marginBottom: "3%",
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
              backgroundColor: "yellow",
              marginRight: "10px",
              borderRadius: "50%",
              border: "1px solid black",
            }}
          ></div>
          <span>Yellow Polygon: "Points of Interest"</span>
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
              border: "1px solid black",
            }}
          ></div>
          <span>Red Polygon: "Error Points"</span>
        </div>
      </div>

      <div className="card" style={{ width: "85%", margin: "0 auto" }}>
        {/* <h4>Ommission Rate: {omissionRate.toFixed(2)}%</h4> */}
        <DataTable value={tableData} style={{ width: "90%", margin: "20px" }}>
          <Column
            field="selectedFilename"
            header="Name of File"
            style={{ width: "25%", border: "1px solid black" }}
          ></Column>
          <Column
            field="total"
            header="Total Count"
            style={{ width: "25%", border: "1px solid black" }}
          ></Column>
          <Column
            field="overlapCount"
            header="Overlap Count"
            style={{ width: "25%", border: "1px solid black" }}
          ></Column>
          <Column
            field="ErrorRate"
            header="Error Rate"
            style={{ width: "25%", border: "1px solid black" }}
          ></Column>
        </DataTable>
      </div>
    </div>
  );
};

export default PolygonOverlap;
