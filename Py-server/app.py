from flask_cors import CORS
from flask import Flask, request, jsonify
import logging
from features.topologicalPolygonOverLap import feature1_routes
from features.geoSpartialCommissionCheck import feature2_routes
from features.SpartialOmissionCheck import feature3_routes
from features.SpartialCommissionCheck import feature4_routes

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})
logging.basicConfig(level=logging.DEBUG)

app.register_blueprint(feature1_routes, url_prefix='/api/topologicalconsistency')
app.register_blueprint(feature2_routes, url_prefix='/api/usecases/geoSpatialOCCheck')
app.register_blueprint(feature3_routes, url_prefix='/api/spatialOmissionCheck')
app.register_blueprint(feature4_routes, url_prefix='/api/spatialCommissionCheck')

if __name__ == "__main__":
    app.run(port=5001, debug=True)
