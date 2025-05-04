import React, { useState } from 'react';
import State from './StateThematicClassfication';
import RailwayZones from './RailwayZonesThematicClassification';


const FormatConsist = () => {
  const [selectedFormat, setSelectedFormat] = useState('Select the option');

  const handleFormatChange = (event) => {
    setSelectedFormat(event.target.value);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <select
        value={selectedFormat}
        onChange={handleFormatChange}
        style={{
          padding: '10px',
          backgroundColor: '#f7f7f7',
          color: '#333',
          border: '1px solid #ccc',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          outline: 'none',
        }}
      >

        <option value="Select the option">Select the option</option>
        <option value="State">State</option>

        <option value="Railway">Railway Zones </option>
      </select>

      {selectedFormat === "State" && <State />}
      {selectedFormat === "Railway" && <RailwayZones />}

      {selectedFormat === "Select the option" && (
        <div className="alert alert-primary" style={{ margin: "20px 100px", textAlign: "justify" }}>
          <b>Definition: </b> Comparison of the classes assigned to features or their attributes to a universe of discourse (e.g. ground truth or reference data).
          <br />
          <b>Reference: </b>ISO 19157:2013(E) Annex D(D.6.1) - The data quality measures for the data quality element Classification Correctness are provided in Tables D.63 to D.67. (Page No. 97)
        </div>
      )}
    </div>
  )
}

export default FormatConsist;