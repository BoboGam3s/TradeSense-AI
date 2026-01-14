import flask
import flask_sqlalchemy
import sqlalchemy
import flask_cors
print(f"Flask: {flask.__version__}")
try:
    print(f"Flask-SQLAlchemy: {flask_sqlalchemy.__version__}")
except:
    print("Flask-SQLAlchemy: version access failed")
print(f"SQLAlchemy: {sqlalchemy.__version__}")
print(f"Flask-CORS: {flask_cors.__version__}")
