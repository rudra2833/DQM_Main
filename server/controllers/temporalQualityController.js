const temporalQualityServices = require('../services/temporalQualityServices');
const pool = require("../database/connection"); // Ensure the correct path

exports.temporalVal = async (req, res, next) =>{
    try {
        const result = await temporalQualityServices.temporalVal(req.body);
        console.log(result);
        // res.json("hello");
        res.status(200).json({result});
      } catch (err) {
        console.error(err);
        next(err);
      }
};
exports.tempoConistency = async (req, res, next) =>{
    try {
        const result = await temporalQualityServices.tempoConistency(req.body.filename,req.body.attributes);
        // console.log(result);
        res.status(200).json({result});
      } catch (err) {
        console.error(err);
        next(err);
      }
};
exports.tempoValidity = async (req, res, next) =>{
    try {
        const result = await temporalQualityServices.tempoValidity(req.body.filename,req.body.attributes);
        // console.log(result);
        res.status(200).json({result});
      } catch (err) {
        console.error(err);
        next(err);
      }
};






exports.tempoStartend = async (req, res, next) =>{
    try {
        const result = await temporalQualityServices.tempoStartend(req.body.filename,req.body.attributes);
        // console.log(result);
        res.status(200).json({result});
      } catch (err) {
        console.error(err);
        next(err);
      }
};










exports.getLogs = async (req, res) => {
  try {
      const { rows } = await pool.query(`
          SELECT * FROM temporal_consistency_logs
          ORDER BY tested_date DESC
      `);
      console.log("Fetched logs:", rows);
      res.json(rows);
  } catch (err) {
      console.error("Error fetching logs:", err);
      res.status(500).send("Server error");
  }
}





exports.saveLogs = async (req, res) => {
  try {
      const { filename, targett, invalidPercentage, ambiguousPercentage } = req.body;

      // console.log("Saving logs:", filename, errorCount, errorRate);
      const { rows } = await pool.query(`
          INSERT INTO temporal_consistency_logs (file_name, tested_attribute, invalid_percentage, ambiguous_percentage)
          VALUES ($1, $2, $3, $4)
`, [filename, targett, invalidPercentage, ambiguousPercentage]);

      console.log("Log saved:", rows);

      res.json("Data saved successfully");
  } catch (err) {
      console.error("Error saving logs:", err);
      res.status(500).send("Server error");
  }
};





exports.twoDategetLogs = async (req, res) => {
  try {
      const { rows } = await pool.query(`
          SELECT * FROM temporal_consistency_twodate_logs
          ORDER BY tested_date DESC
      `);
      console.log("Fetched logs:", rows);
      res.json(rows);
  } catch (err) {
      console.error("Error fetching logs:", err);
      res.status(500).send("Server error");
  }
}







exports.twoDatesaveLogs = async (req, res) => {
  try {
      const { filename, targett, targett2, invalidPercentage } = req.body;

      // console.log("Saving logs:", filename, errorCount, errorRate);
      const { rows } = await pool.query(`
          INSERT INTO temporal_consistency_twodate_logs (file_name, tested_attribute1, tested_attribute2, invalid_percentage)
          VALUES ($1, $2, $3, $4)
`, [filename, targett, targett2, invalidPercentage]);

      console.log("Log saved:", rows);

      res.json("Data saved successfully");
  } catch (err) {
      console.error("Error saving logs:", err);
      res.status(500).send("Server error");
  }
};