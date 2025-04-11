from flask import Flask, render_template, request  

app = Flask(__name__)   

@app.route("/")  
def home():
    return render_template("form.html")  

@app.route("/my_events")  
def my_events():
    return render_template("my_events.html")

@app.route("/create_event")  
def create_event():
    return render_template("create_event.html")

"""
Когда вы указываете methods=["POST"] в декораторе @app.route, 
вы ограничиваете маршрут только запросами с методом POST. 
Это значит, что обработчик greet будет вызван только тогда, 
когда клиент отправит POST-запрос на URL /greet.
@app.route("/greet", methods=["POST"])  
def greet():
    username = request.form["username"]  # Получаем данные из формы
    return f"Привет, {username}!"  # Возвращаем ответ
"""
if __name__ == "__main__":
    app.run(debug=True)