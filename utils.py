import pickle

import numpy as np
from typing import List


# Save this to a pickle file cus not enough space on heroku
nltk_POS_lemmatizer = pickle.load(open('nltk_POS_lemmatizer.pkl', 'rb'))


def bag_words(sentence, known_words):
    bag = [0] * len(known_words)

    word_pattern = nltk_POS_lemmatizer(sentence)

    for new_word in word_pattern:
        for i, word in enumerate(known_words):
            if new_word == word:
                bag[i] = 1

    return np.array(bag)
