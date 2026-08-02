import os
from dotenv import load_dotenv
from src.app import create_app


load_dotenv()

app = create_app()

if __name__ == "__main__":
    app.run(
        debug=os.environ.get("FLASK_DEBUG", "false") == "true",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 8000))
    )