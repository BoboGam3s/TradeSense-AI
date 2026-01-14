import sys
import os
sys.path.append(os.getcwd())
from app import create_app, db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        # Use raw SQL to bypass model issues for now
        result = db.session.execute(text("SELECT email FROM users LIMIT 1")).fetchone()
        if result:
            print(f"Health Check Passed: Found user {result[0]}")
        else:
            print("Health Check Passed: DB connected but empty")
    except Exception as e:
        print(f"Health Check Failed: {e}")
