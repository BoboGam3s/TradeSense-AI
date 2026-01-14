from flask import Flask
try:
    app = Flask(__name__)
    print("Flask app created")
    from flask_cors import CORS
    CORS(app)
    print("CORS initialized")
    from flask_sqlalchemy import SQLAlchemy
    db = SQLAlchemy(app)
    print("SQLAlchemy initialized")
except Exception as e:
    import traceback
    traceback.print_exc()
