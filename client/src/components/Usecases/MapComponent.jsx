// import React, { useEffect, useMemo } from "react";
// import { MapContainer, TileLayer, useMap } from "react-leaflet";
// import L from "leaflet";
// import "./plugins/leaflet.canvas-markers";
// import "leaflet/dist/leaflet.css";

// const normalIcon = new L.Icon({
//   iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
//   iconSize: [20, 20],
//   iconAnchor: [10, 10],
// });

// const errorIcon = new L.Icon({
//   iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
//   iconSize: [20, 20],
//   iconAnchor: [10, 10],
// });

// const correctedIcon = new L.Icon({
//   iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
//   iconSize: [20, 20],
//   iconAnchor: [10, 10],
// });
// const CanvasMarkers = ({ data = [], correctedData = [], validated, correctionPressed }) => {
//   const map = useMap();

//   const markers = useMemo(() => {
//     if (correctionPressed) {
//       // Show all corrected data as green markers
//       return correctedData.map((point) =>
//         L.marker([point.Latitude, point.Longitude], { icon: correctedIcon })
//       );
//     }

//     // If not corrected, use validation results
//     return data.map((point) => {
//       let lat = point.Latitude;
//       let lng = point.Longitude;
//       let icon = normalIcon;

//       if (point.changed === "Yes") {
//         icon = errorIcon;
//       } else if (point.changed === "No") {
//         icon = normalIcon;
//       }

//       return L.marker([lat, lng], { icon });
//     });
//   }, [data, correctedData, correctionPressed]);

//   useEffect(() => {
//     let canvasLayer = new L.CanvasIconLayer({ padding: 0.3, zIndex: 500 });
//     canvasLayer.addTo(map);
//     canvasLayer.addMarkers(markers);
  
//     const redraw = () => {
//       if (canvasLayer) {
//         map.removeLayer(canvasLayer);
//       }
//       canvasLayer = new L.CanvasIconLayer({ padding: 0.3, zIndex: 500 });
//       canvasLayer.addTo(map);
//       canvasLayer.addMarkers(markers);
//     };
  
//     map.on("zoomend", redraw);
//     map.on("moveend", redraw);
  
//     return () => {
//       if (canvasLayer) {
//         map.removeLayer(canvasLayer);
//       }
//       map.off("zoomend", redraw);
//       map.off("moveend", redraw);
//     };
//   }, [map, markers]);
  
  

//   return null;
// };


// const MapComponent = ({ data = [], correctedData = [], validated, correctionPressed }) => {

//   return (
//     <MapContainer
//       center={[22.9734, 78.6569]}
//       zoom={5}
//       style={{ height: "500px", width: "100%" }}
//       preferCanvas={true}
//     >
//       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//       <CanvasMarkers
//   data={data}
//   correctedData={correctedData}
//   validated={validated}
//   correctionPressed={correctionPressed}
// />

//     </MapContainer>
//   );
// };

// export default MapComponent;













































// // new fixed markers
// import React from "react";
// import { MapContainer, TileLayer, Marker } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";

// const normalIcon = new L.Icon({
//   iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
//   iconSize: [20, 20],
//   iconAnchor: [10, 10],
// });

// const errorIcon = new L.Icon({
//   iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
//   iconSize: [20, 20],
//   iconAnchor: [10, 10],
// });

// const correctedIcon = new L.Icon({
//   iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
//   iconSize: [20, 20],
//   iconAnchor: [10, 10],
// });

// const MapComponent = ({ data = [], correctedData = [], validated, corrected }) => {
//   const getMarkerIcon = (point) => {
//     const matched = correctedData.find((cp) => cp.LGD_Code === point.LGD_Code);

//     if (matched?.changed === "Yes") {
//       return corrected ? correctedIcon : errorIcon;
//     }
//     return normalIcon;
//   };

//   const getLatLng = (point) => {
//     const matched = correctedData.find((cp) => cp.LGD_Code === point.LGD_Code);

//     if (matched?.changed === "Yes" && corrected) {
//       return [matched.Latitude, matched.Longitude];
//     }
//     return [point.Latitude, point.Longitude];
//   };

//   return (
//     <MapContainer
//       center={[22.9734, 78.6569]}
//       zoom={6}
//       style={{ height: "500px", width: "100%" }}
//     >
//       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

//       {data.map((point, idx) => (
//         <Marker
//           key={idx}
//           position={getLatLng(point)}
//           icon={getMarkerIcon(point)}
//         />
//       ))}
//     </MapContainer>
//   );
// };

// export default MapComponent;

import React from "react";
import { MapContainer, TileLayer, Marker , Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const normalIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const errorIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const correctedIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const MapComponent = ({ data = [], correctedData = [], validated, corrected }) => {
  const getMarkerIcon = (point) => {
    if (corrected) {
      return correctedIcon; // 🟢 Green after correction
    }

    if (validated) {
      return point.Corrected === "Yes" ? errorIcon : normalIcon; // 🔴 Red for "Yes", 🔵 Blue for "No"
    }

    return normalIcon; // 🔵 Default before validation
  };

  const getLatLng = (point) => {
    if (corrected) {
      const matched = correctedData.find(cp => cp.Fps_Id === point.Fps_Id);
      if (matched) {
        return [matched.Latitude, matched.Longitude]; // Corrected position
      }
    }

    return [point.Latitude, point.Longitude]; // Original position
  };

  return (
    <MapContainer
    center={[25.0961, 85.3131]}

      zoom={6}
      style={{ height: "600px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {data.map((point, idx) => (
        <Marker
        key={idx}
        position={getLatLng(point)}
        icon={getMarkerIcon(point)}
      >
        <Popup>
          <div>
            <strong>Fps_Id:</strong> {point.Fps_Id}<br />
            <strong>Village:</strong> {point.Village_Na}<br />
            <strong>Latitude:</strong> {getLatLng(point)[0]}<br />
            <strong>Longitude:</strong> {getLatLng(point)[1]}<br />
            {validated && (!corrected) && <><strong>Correct:</strong> {point.Corrected === "Yes" ? "No" : "Yes" }</>}
            {validated && corrected && <><strong>Correct:</strong> {"Yes"}</>}
          </div>
        </Popup>
      </Marker>
      ))}
    </MapContainer>
  );
};


export default MapComponent;
