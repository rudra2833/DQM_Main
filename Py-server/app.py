from flask_cors import CORS
from flask import Flask, request, jsonify
from shapely.geometry import shape, Polygon, MultiPolygon
from shapely.strtree import STRtree
import shapely.geometry.base
import logging
import os
import zipfile
import tempfile
import shapefile  # pyshp
# from shapely.geometry import shape, Polygon, MultiPolygon
from shapely.ops import unary_union

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

logging.basicConfig(level=logging.DEBUG)

def extract_features_from_zip(zip_path):
    with tempfile.TemporaryDirectory() as tmpdir:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(tmpdir)
        shp_files = [f for f in os.listdir(tmpdir) if f.endswith('.shp')]
        if not shp_files:
            raise ValueError("No .shp file found in the zip")
        shp_path = os.path.join(tmpdir, shp_files[0])
        sf = shapefile.Reader(shp_path)
        try:
            fields = sf.fields[1:]  # skip DeletionFlag
            field_names = [field[0] for field in fields]
            features = []
            for sr in sf.shapeRecords():
                geom = sr.shape.__geo_interface__
                atr = dict(zip(field_names, sr.record))
                feature = {
                    "type": "Feature",
                    "geometry": geom,
                    "properties": atr
                }
                features.append(feature)
        finally:
            sf.close()
        return features
    
def bbox_key(g):
    return str(tuple(map(lambda x: round(x, 6), g.bounds)))


@app.route('/api/topologicalconsistency/polygonOverLap/check-overlap', methods=['POST'])
def check_overlap():
    try:
        skip_overlap = request.args.get('skipOverlap', 'false').lower() == 'true'

        # Handle input
        if request.content_type and request.content_type.startswith('multipart/form-data'):
            if 'file' not in request.files:
                return jsonify({"error": "No file part"}), 400
            file = request.files['file']
            if file.filename == '':
                return jsonify({"error": "No selected file"}), 400

            with tempfile.NamedTemporaryFile(delete=False) as tmp:
                file.save(tmp.name)
                features = extract_features_from_zip(tmp.name)
            os.unlink(tmp.name)
        elif request.content_type == 'application/json':
            features = request.get_json()
        else:
            return jsonify({"error": "Unsupported Content-Type"}), 415

        app.logger.debug(f"Received {len(features) if features else 0} features, skip_overlap={skip_overlap}")

        if not isinstance(features, list):
            return jsonify({"error": "Expected a list of GeoJSON features"}), 400

        valid_features = []
        unified_geometries = []

        # Normalize to valid geometry per feature
        for idx, feature in enumerate(features):
            geom_json = feature.get("geometry")
            if not geom_json:
                app.logger.warning(f"Feature at index {idx} missing geometry")
                continue
            try:
                geom = shape(geom_json)
                if geom.is_empty or not geom.is_valid:
                    app.logger.warning(f"Invalid geometry at index {idx}")
                    continue
                valid_features.append(feature)

                # Merge MultiPolygon into one unified shape
                if isinstance(geom, (MultiPolygon, Polygon)):
                    unified_geometries.append(unary_union(geom))
                else:
                    unified_geometries.append(geom)
            except Exception as ex:
                app.logger.warning(f"Invalid geometry at index {idx}: {ex}")
                continue

        if not valid_features:
            return jsonify({"error": "No valid geometries found"}), 400

        # Return early if skipping overlap
        if skip_overlap:
            colored_features = []
            for feature in valid_features:
                feature_copy = feature.copy()
                if "properties" not in feature_copy or feature_copy["properties"] is None:
                    feature_copy["properties"] = {}
                feature_copy["properties"]["_color"] = "yellow"
                colored_features.append(feature_copy)
            return jsonify({
                "type": "FeatureCollection",
                "features": colored_features
            })

        # Compare unified geometries (QGIS-style logic)
        feature_overlap_flags = [False] * len(unified_geometries)
        for i, geom1 in enumerate(unified_geometries):
            for j, geom2 in enumerate(unified_geometries):
                if i == j:
                    continue
                if geom1.intersects(geom2) and not geom1.touches(geom2):
                    feature_overlap_flags[i] = True
                    feature_overlap_flags[j] = True
        
        overlap_count = sum(1 for flag in feature_overlap_flags if flag)
                
        # Attach color based on overlap flag
        colored_features = []
        for idx, feature in enumerate(valid_features):
            color = "red" if feature_overlap_flags[idx] else "yellow"
            feature_copy = feature.copy()
            if "properties" not in feature_copy or feature_copy["properties"] is None:
                feature_copy["properties"] = {}
            feature_copy["properties"]["_color"] = color
            colored_features.append(feature_copy)

        return jsonify({
            "type": "FeatureCollection",
            "features": colored_features,
            "overlap_count": overlap_count 
        })

    except Exception as e:
        app.logger.error(f"Unexpected error: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5001, debug=True)
