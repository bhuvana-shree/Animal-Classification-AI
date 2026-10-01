from flask import Flask, render_template, request, jsonify
from PIL import Image
import io
import os

app = Flask(__name__)

# The classifier is loaded lazily so the web page can start cleanly.
classifier = None

def get_classifier():
    global classifier
    if classifier is None:
        from transformers import pipeline
        classifier = pipeline(
            "image-classification",
            model="google/vit-base-patch16-224"
        )
    return classifier

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "Please select an image."}), 400

    file = request.files["image"]
    if not file.filename:
        return jsonify({"error": "Please select an image."}), 400

    try:
        image = Image.open(io.BytesIO(file.read())).convert("RGB")
        results = get_classifier()(image, top_k=5)

        predictions = [
            {
                "label": item["label"],
                "confidence": round(float(item["score"]) * 100, 2)
            }
            for item in results
        ]

        return jsonify({"predictions": predictions})

    except Exception as exc:
        return jsonify({
            "error": "Classification failed. Make sure the required packages and model are available.",
            "details": str(exc)
        }), 500

if __name__ == "__main__":
    app.run(debug=True)
