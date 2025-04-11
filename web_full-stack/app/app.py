from flask import Flask, render_template, request  

app = Flask(__name__)  

@app.route("/")  
def home():
    return render_template("form.html")  

@app.route("/greet", methods=["POST"])  
def greet():
    username = request.form["username"]  # Получаем данные из формы
    return f"Привет, {username}!"  # Возвращаем ответ

if __name__ == "__main__":
    app.run(debug=True)