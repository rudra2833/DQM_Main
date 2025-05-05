import React, { useState } from "react";

import NonSpatialOmission from './NonSpatialOmission';
import OmissionSpatialCheck from './SpatialOmission';

const OmissionMain = () => {
  const [nonSpatial, setNonSpatial] = useState(1);
  const [spatialCheck, setSpatialCheck] = useState(0);

  return (
    <>
      <center style={{ marginTop: "20px",  fontSize: "13px"  }}>
        <button
          onClick={() => {
            setNonSpatial(1);
            setSpatialCheck(0);
          }}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            marginRight: "20px",
            backgroundColor: nonSpatial === 1 ? "#4CAF50" : "#ddd",
            color: nonSpatial === 1 ? "#fff" : "#000",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          For Non-Spatial Data
        </button>

        <button
          onClick={() => {
            setSpatialCheck(1);
            setNonSpatial(0);
          }}
          style={{
            padding: "10px 20px",
            marginRight: "20px",
            backgroundColor: spatialCheck === 1 ? "#4CAF50" : "#ddd",
            color: spatialCheck === 1 ? "#fff" : "#000",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          For Spatial Data
        </button>
      </center>

      {nonSpatial === 1 && <NonSpatialOmission />}
      {spatialCheck === 1 && <OmissionSpatialCheck />}
    </>
  );
};

export default OmissionMain;
