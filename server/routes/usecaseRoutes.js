const express = require("express");
 const router = express.Router();
 // const conceptualConsistencyController = require("../controllers/conceptualConsistencyController");
 const LgdLatLongController = require("../controllers/Lgd_lat-longController");
 
 const multer = require("multer");
 
 const upload = multer({ dest: "uploads/" });
 
 // // Route for Latitude-Longitude & State Validation
 // router.post("/lat-lon-state/upload", upload.single("file"), conceptualConsistencyController.validateLatLonState);
 
 // // Route for State & District Validation
 // router.post("/state-district/upload", upload.single("file"), conceptualConsistencyController.validateStateDistrict);
 
 // // Route for Pincode & District Validation
 // router.post("/pincode-district/upload", upload.single("file"), conceptualConsistencyController.validatePincodeDistrict);
 
 //for validation of Lgd Lat Long
 router.post("/lgdlat-lon/validate", LgdLatLongController.validateLgdLatLong);
 
 //for fetching the logs the log data
 router.get("/lgdlat-lon/logs", LgdLatLongController.getLogs);
 
 //for saving the log data
 router.post("/lgdlat-lon/save", LgdLatLongController.saveLogs);
 module.exports = router;