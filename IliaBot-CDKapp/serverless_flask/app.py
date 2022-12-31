from flask import Blueprint, render_template, redirect, request

app = Blueprint(
    "IliaBotApp",
    __name__,
    template_folder="./templates",
    static_folder="./styles",
)

