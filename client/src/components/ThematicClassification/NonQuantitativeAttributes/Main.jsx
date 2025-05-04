import React, { useState } from 'react';
import StationCode from './StationCodeNonQuantitative';
import RailwayZones from './RailwayZonesNonQuantitative';


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
        <option value="StationCode">Station Code </option>
        
        <option value="Railway">Railway Zones </option>
      </select>

      {selectedFormat === "StationCode" && <StationCode />}
      {selectedFormat === "Railway" && <RailwayZones />}
      
      {selectedFormat === "Select the option" && (
        <div className="alert alert-primary" style={{ margin: "20px 100px", textAlign: "justify" }}>
          <b>Definition: </b> Measure of whether a non-quantitative attribute is correct or incorrect.
          <br />
          <b>Reference: </b>ISO 19157:2013(E) Annex D(D.6.2) - The data quality measures for the data quality element Non-Quantitative Attribute Correctness are provided in Tables D.68 to D.70. (Page No. 101)
        </div>
      )}
    </div>
  )
}

export default FormatConsist;