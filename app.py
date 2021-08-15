import tensorflow as tf
# from model.nlp_pipelines import nltk_POS_lemmatizer
import pickle
import numpy as np

from flask import Flask, redirect, render_template, request, session
from flask_session import Session

import nltk
from nltk.corpus import wordnet
from nltk.stem import WordNetLemmatizer

# Necessary downloads
nltk.download('punkt', quiet=True)
nltk.download('wordnet', quiet=True)

from typing import List


app = Flask(__name__)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True


@app.route("/")
def index():
    return render_template('index.html')


@app.route("/get_response", methods=["POST"])
def get_response():
    model_path = r'adam_model_2'
    model = tf.keras.models.load_model(model_path)
    words = pickle.load(open(f'{model_path}/words.pkl', 'rb'))
    classes = pickle.load(open(f'{model_path}/classes.pkl', 'rb'))

    sentence = request.args["msg"]
    bag = bag_words(sentence, words)

    result = model.predict(np.array([bag]))[0]
    probs = {classes[i]: prob for i, prob in enumerate(result)}
    probs_top_three = {k: f"{v * 100:,.2f}%" for k, v in sorted(probs.items(), key=lambda x: x[1], reverse=True)[:3]}

    print(probs)

    return {
        "all_predictions": {k: f"{v * 100:,.2f}%" for k, v in sorted(probs.items(), key=lambda x: x[1], reverse=True)},
        "top_three_predictions": probs_top_three,
        "chatbot_response": None
    }


def bag_words(sentence, known_words):
    bag = [0] * len(known_words)

    word_pattern = nltk_POS_lemmatizer(sentence)

    for new_word in word_pattern:
        for i, word in enumerate(known_words):
            if new_word == word:
                bag[i] = 1

    return np.array(bag)


def nltk_POS_lemmatizer(sentence: str) -> List[str]:
    tag_dict = {
        "J": wordnet.ADJ,
        "N": wordnet.NOUN,
        "V": wordnet.VERB,
        "R": wordnet.ADV
    }
    lemmatizer = WordNetLemmatizer()
    tokens = nltk.word_tokenize(sentence)
    token_tag_pairs = nltk.pos_tag(tokens)

    return [lemmatizer.lemmatize(token[0], tag_dict.get(token[1][0], wordnet.NOUN)).lower() 
            for token in token_tag_pairs if token[0] not in "?!,."]



if __name__ == "__main__":
    app.run()
