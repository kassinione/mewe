from flask import Blueprint, render_template

main = Blueprint("main", __name__)  # имя и модуль

@main.route("/")
def index():
    return render_template("index.html", title="mewe")