from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import numpy as np
import joblib
import os
import logging
from datetime import datetime

# =========================================================
# LOGGING
# =========================================================
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =========================================================
# PATH SETUP
# =========================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

TEMPLATE_DIR = os.path.join(BASE_DIR, "templates")
STATIC_DIR = os.path.join(BASE_DIR, "static")

# =========================================================
# FLASK APP
# =========================================================
app = Flask(
    __name__,
    template_folder=TEMPLATE_DIR,
    static_folder=STATIC_DIR
)

CORS(app)

# =========================================================
# LOAD MODEL FILES
# =========================================================
MODEL_LOADED = False

try:
    model_path = os.path.join(BASE_DIR, "model.pkl")
    pca_path = os.path.join(BASE_DIR, "pca.pkl")
    scaler_path = os.path.join(BASE_DIR, "scaler.pkl")
    feature_path = os.path.join(BASE_DIR, "feature_names.pkl")
    imputer_path = os.path.join(BASE_DIR, "imputer_vals.pkl")

    print("Checking model files...\n")

    model = joblib.load(model_path)
    pca = joblib.load(pca_path)
    scaler = joblib.load(scaler_path)
    feature_names = joblib.load(feature_path)
    imputer_vals = joblib.load(imputer_path)

    MODEL_LOADED = True

    logger.info("✅ ML model pipeline loaded successfully")

except Exception as e:
    MODEL_LOADED = False

    print("\n========== MODEL LOAD ERROR ==========")
    print(type(e))
    print(str(e))
    print("======================================\n")

    logger.exception("❌ Failed to load model")

# =========================================================
# HISTORY
# =========================================================
prediction_history = []

# =========================================================
# USER FEATURES
# =========================================================
USER_FEATURES = [
    "BeatStat_HR_N",
    "BeatStat_CI_vc",
    "BeatStat_CI_mean",
    "BeatStat_mBP_var",
    "dBPS_LF_HF_dBP_min",
    "HRS_RRI_LF_min",
    "BeatStat_mBP_mean",
    "HRS_RRI_HFnu_max",
    "BeatStat_HR_mean",
    "HRS_RRI_LF_HF_max",
]

# =========================================================
# ROUTES
# =========================================================

# HOME PAGE
@app.route("/")
def home():
    return render_template("index.html")

# DEVELOPER PAGE
@app.route("/developer")
def developer():
    return render_template("developer.html")

# HEALTH API
@app.route("/api/health")
def health():
    return jsonify({
        "status": "online",
        "model_loaded": MODEL_LOADED,
        "timestamp": datetime.now().isoformat()
    })

# FEATURES API
@app.route("/api/features")
def features():
    return jsonify({
        "features": USER_FEATURES
    })

# =========================================================
# PREDICTION API
# =========================================================
@app.route("/api/predict", methods=["POST"])
def predict():

    if not MODEL_LOADED:
        return jsonify({
            "error": "Model not loaded"
        }), 500

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No data provided"
            }), 400

        # Start with default imputer values
        full_input = np.array(imputer_vals, dtype=float)

        # Replace with user values
        for feat in USER_FEATURES:

            if feat in feature_names:

                idx = feature_names.index(feat)

                value = data.get(feat)

                if value is not None:
                    full_input[idx] = float(value)

        # Reshape
        X = full_input.reshape(1, -1)

        # Scaling
        X_scaled = scaler.transform(X)

        # PCA
        X_pca = pca.transform(X_scaled)

        # Prediction
        prediction = int(model.predict(X_pca)[0])

        probabilities = model.predict_proba(X_pca)[0]

        risk_prob = float(probabilities[1]) * 100
        healthy_prob = float(probabilities[0]) * 100

        # Risk Level
        if risk_prob < 30:
            risk_level = "Low"

        elif risk_prob < 60:
            risk_level = "Moderate"

        elif risk_prob < 80:
            risk_level = "High"

        else:
            risk_level = "Critical"

        result = {
            "prediction": prediction,
            "label": (
                "Heart Disease Detected"
                if prediction == 1
                else "No Heart Disease"
            ),
            "risk_probability": round(risk_prob, 2),
            "healthy_probability": round(healthy_prob, 2),
            "risk_level": risk_level,
            "timestamp": datetime.now().isoformat()
        }

        # Save history
        prediction_history.append(result)

        return jsonify(result)

    except Exception as e:
        logger.error(f"Prediction Error: {e}")

        return jsonify({
            "error": str(e)
        }), 500

# =========================================================
# HISTORY API
# =========================================================
@app.route("/api/history")
def history():
    return jsonify(prediction_history)

# =========================================================
# RUN SERVER
# =========================================================
if __name__ == "__main__":

    print("\n==============================")
    print(" HeartAI Flask Server Started ")
    print("==============================\n")

    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )