import tensorflow as tf
import pickle
from flask import Flask, render_template, request
import requests

import numpy as np
from utils import bag_words

import nltk
# Necessary downloads
nltk.download('punkt', quiet=True)
nltk.download('wordnet', quiet=True)


app = Flask(__name__)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True


@app.route("/")
def index():
    return render_template('index.html')


@app.route("/get_response", methods=["POST"])
def get_response():
    model_path = r'./adam_model_2'
    model = tf.keras.models.load_model(model_path)
    words = pickle.load(open(f'{model_path}/words.pkl', 'rb'))
    classes = pickle.load(open(f'{model_path}/classes.pkl', 'rb'))
    sentence = request.args["msg"]

    # contact created nlp-pipeline-API to get a bag of words
    url = "https://nlp-pipeline-api.herokuapp.com/"
    payload = {
        "sentence": sentence,
        "known_words": words
    }
    response = requests.post(url, json=payload).json()
    bag = response["bag"]

    result = model.predict(np.array([bag]))[0]
    probs = {classes[i]: prob for i, prob in enumerate(result)}
    probs_top_three = {k: f"{v * 100:,.2f}%" for k, v in sorted(probs.items(), key=lambda x: x[1], reverse=True)[:3]}

    print(probs)

    return {
        "all_predictions": {k: f"{v * 100:,.2f}%" for k, v in sorted(probs.items(), key=lambda x: x[1], reverse=True)},
        "top_three_predictions": probs_top_three,
        "chatbot_response": None
    }


if __name__ == "__main__":
    app.run()
