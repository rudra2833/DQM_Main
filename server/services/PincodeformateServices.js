const path = require("path");
const fs = require("fs");
const countNull = require("../utils/countNull");
const db = require("../database/connection");
const fileChanges = require("../utils/fileModification");

const pincodeServices = {
  async pincodeAuto(filename, attributes) {
    const filePath = path.join(__dirname, "..", "uploads", filename);
    const rawData = fs.readFileSync(filePath);
    const data = JSON.parse(rawData);

    // Function to extract specific properties from each object
    const extractProperties = (dataArray) => {
      return dataArray.map((item) => ({
        state: item.state || "",
        district: item.district || "",
        city: item.city !== "NULL" ? item.city : "",
        pincode: item.pincode || "",
      }));
    };

    // Step 1: Fetch all valid pincodes from DB
    const result = await db.query("SELECT DISTINCT pincode FROM public.pincodedistrict");

    // Step 2: Convert result rows to a Set of pincodes for fast lookup
    const validPincodes = new Set(result.rows.map(row => String(row.pincode)));

    // Step 3: Replace regex-based validation with DB lookup
    function isValidPincode(pincode) {
      return validPincodes.has(String(pincode));
    }


    // Extracted array of objects with specific properties
    const extractedData = extractProperties(data);

    // Function to validate pincodes and return the required array of objects
    function validatePincodes(extractedData) {
      return extractedData.map((item) => ({
        pincode: String(item.pincode),
        isvalid: isValidPincode(String(item.pincode))
      }));
    }

    // Validate pincodes in the extracted data array
    const validatedData = validatePincodes(extractedData);

    console.log(validatedData);

    return validatedData; // Return the validated data
  },

  async getPincodeLogs() {
    try {
      const result = await db.query("SELECT * FROM pincode_logs");
      return result.rows;
    } catch (err) {
      console.error("Error fetching logs:", err);
      throw new Error("Internal Server Error");
    }
  },

  async createNewPincodeLog(logData) {
    await fileChanges(logData.file_name, logData.field_names);
    try {
      await db.query(
        "INSERT INTO  pincode_logs (file_name,accuracy,created_at) VALUES ($1,$2,now())",
        [logData.file_name, logData.created_at]
      );
    } catch (error) {
      console.error("Error creating log entry:", error);
      throw new Error("Internal Server Error");
    }
  },
};

module.exports = pincodeServices;
