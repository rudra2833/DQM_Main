// const poolForLgdLatLong = require("../database/connection"); // Ensure the correct path
const Fuse = require("fuse.js");
const { Pool } = require('pg');

const pool = new Pool({
    host: "localhost",
    port: "5432",
    user: "postgres",
    password: "Rap@&2806",
    database: "FPS_Bihar",
});

pool.connect((err) => {
    if (err) {
        console.error('Database connection error:', err.stack);
    } else {
        console.log('Lgd_LatLong Database connected.');
    }
});

exports.validateLgdLatLong = async (req, res) => {
    try {
        console.log("Validation request received");

        const { data } = req.body;
        const { rows: villageListRaw } = await pool.query(`
                SELECT * from corrected_bihar
            `);

        // 2. Normalize names and rename taluka to tehsil in app logic
        const villageList = villageListRaw
            .filter(v => v.village_name?.trim() && v.district_name?.trim() && v.taluka?.trim())
            .map(v => ({
                district_name: v.district_name.trim().toLowerCase(),
                tehsil: v.taluka.trim().toLowerCase(), // rename 'taluka' as 'tehsil' in logic
                village_name: v.village_name.trim().toLowerCase(),
                lg_vi_code: v.lg_vi_code,
            }));

        // 3. Creating the fuse
        const fuse = new Fuse(villageList, {
            keys: ["district_name", "tehsil", "village_name"],
            threshold: 0.3,
            includeScore: true,
            ignoreLocation: true,
            minMatchCharLength: 5,
        });

        const correctedData = [];
        const noMatach = [];

        // parsing in the user data
        for (const row of data) {

            //importing the data wrt the columns
            const inputDistrict = row.District_N?.trim().toLowerCase();
            const inputTehsil = row.Tehsil_Nam?.trim().toLowerCase(); // from uploaded data
            const inputVillage = row.Village_Na?.trim().toLowerCase();

            // checking the missing fields
            if (!inputDistrict || !inputTehsil || !inputVillage) {
                console.warn("Missing fields in row:", row);
                continue;
            }

            let matchedLgViCode = null;

            // All matches on district, tehsil, village for exact match
            const allMatches = villageList.filter(v =>
                v.district_name === inputDistrict &&
                v.tehsil === inputTehsil &&
                v.village_name === inputVillage
            );

            console.log("row: ", row)
            console.log("AllMatches: ", allMatches)

            if (allMatches.length > 0) {

                console.log("Match Length:", allMatches.length)

                let flag = 0;
                for (let j = 0; j < allMatches.length; j++) {

                    console.log("Checking for: ", allMatches[j].lg_vi_code);

                    // fetching the boundary of the lgvicode
                    const { rows: geomRows } = await pool.query(`
                            SELECT ST_AsGeoJSON(geom) AS geom 
                            FROM village_boundaries 
                            WHERE lg_vi_code = $1 
                            LIMIT 1
                        `, [allMatches[j].lg_vi_code]);
                    if (!geomRows.length) {
                        console.warn(`No boundary found for LGD Code: ${matchedLgViCode}`);
                        continue;
                    }

                    // checking if the point lies inside the boundary
                    const { rows: pointCheck } = await pool.query(`
                            SELECT ST_Contains(
                                ST_GeomFromGeoJSON($1),
                                ST_SetSRID(ST_Point($2, $3), 4326)
                            ) AS inside
                        `, [geomRows[0].geom, row.Longitude, row.Latitude]);

                    const isInside = pointCheck[0]?.inside;

                    if (isInside) {
                        console.log(`Point inside boundary: ${row.Village_Na} → ${allMatches[j].village_name}`);
                        correctedData.push({
                            ...row,
                            Corrected: "NA",
                        });
                        flag = 1;
                        break;
                    } else {
                        continue;
                    }

                }

                if (flag === 1) {
                    // console.log(`Point inside boundary: ${row.Village_Na}`);
                    continue;
                }
                else {
                    const { rows: centerRows } = await pool.query(`
                        SELECT 
                            ST_Y(geom) AS latitude, 
                            ST_X(geom) AS longitude, 
                            vilnam_soi 
                        FROM village_points 
                        WHERE lg_vi_code = $1 
                        LIMIT 1
                    `, [allMatches[0].lg_vi_code]);

                    if (!centerRows.length) {
                        console.warn(`No center point for LGD Code: ${allMatches[0].lg_vi_code}`);
                        continue;
                    }

                    correctedData.push({
                        ...row,
                        Latitude: centerRows[0].latitude,
                        Longitude: centerRows[0].longitude,
                        Corrected: "Yes",
                    });
                }
            }


            // else {
            //     noMatach.push({
            //         ...row,
            //     });
            // }







            // // Fallback to fuzzy match
            // const search = fuse.search({
            //     district_name: inputDistrict,
            //     tehsil: inputTehsil,
            //     village_name: inputVillage
            // });

            // if (!search.length) {
            //     console.warn(`No fuzzy match for: ${row.District_N}, ${row.Tehsil_Nam}, ${row.Village_Na}`);
            //     continue;
            // }

            // const bestMatch = search[0].item;
            // matchedLgViCode = bestMatch.lg_vi_code;
            // matchedVillageName = bestMatch.village_name;
            // console.log(`Fuzzy match: "${row.Village_Na}" → "${matchedVillageName}"`);



            // // Get boundary geom from matched lg_vi_code
            // const { rows: geomRows } = await client.query(`
            //     SELECT ST_AsGeoJSON(geom) AS geom 
            //     FROM village_boundaries 
            //     WHERE lg_vi_code = $1 
            //     LIMIT 1
            // `, [matchedLgViCode]);

            // if (!geomRows.length) {
            //     console.warn(`No boundary found for LGD Code: ${matchedLgViCode}`);
            //     continue;
            // }

            // const { rows: pointCheck } = await client.query(`
            //     SELECT ST_Contains(
            //         ST_GeomFromGeoJSON($1),
            //         ST_SetSRID(ST_Point($2, $3), 4326)
            //     ) AS inside
            // `, [geomRows[0].geom, row.Longitude, row.Latitude]);

            // const isInside = pointCheck[0]?.inside;

            // if (isInside) {
            //     correctedData.push({
            //         ...row,
            //         changed: "No",
            //     });
            // } else {
            //     console.log(`Outside boundary: ${row.Village_Na} → ${matchedVillageName}`);

            //     const { rows: centerRows } = await client.query(`
            //         SELECT 
            //             ST_Y(geom) AS latitude, 
            //             ST_X(geom) AS longitude, 
            //             vilnam_soi 
            //         FROM village_points 
            //         WHERE lg_vi_code = $1 
            //         LIMIT 1
            //     `, [matchedLgViCode]);

            //     if (!centerRows.length) {
            //         console.warn(`No center point for LGD Code: ${matchedLgViCode}`);
            //         continue;
            //     }

            //     correctedData.push({
            //         ...row,
            //         Latitude: centerRows[0].latitude,
            //         Longitude: centerRows[0].longitude,
            //         Suggested_Village: matchedVillageName,
            //         Suggested_lg_vi_code: matchedLgViCode,
            //         changed: "Yes",
            //     });
            // }
        }
        console.log("*****************************************************************************")
        console.log("Corrected Data:", correctedData);
        console.log("Corrected Data length:", correctedData.length);

        // console.log("No Match Data length:", noMatach.length);

        console.log("Validation completed");
        res.json({
            corrected: correctedData,
            errorCount: correctedData.filter(r => r.Corrected === "Yes").length,
            errorRate: ((correctedData.filter(r => r.Corrected === "Yes").length / data.length) * 100).toFixed(2),
        });

    } catch (err) {
        console.error("Error during validation:", err);
        res.status(500).send("Server error");
    }

};


exports.getLogs = async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT * FROM lgd_lat_long_logs
            ORDER BY tested_date DESC
        `);
        console.log("Fetched logs:", rows);
        res.json(rows);
    } catch (err) {
        console.error("Error fetching logs:", err);
        res.status(500).send("Server error");
    }
};

exports.saveLogs = async (req, res) => {
    try {
        const { filename, errorCount, errorRate } = req.body;

        // console.log("Saving logs:", filename, errorCount, errorRate);
        const { rows } = await pool.query(`
  INSERT INTO lgd_lat_long_logs (file_name, total_tuples, test_result_percent)
  VALUES ($1, $2, $3)
`, [filename, errorCount, errorRate]);

        console.log("Log saved:", rows);

        res.json("Data saved successfully");
    } catch (err) {
        console.error("Error saving logs:", err);
        res.status(500).send("Server error");
    }
};