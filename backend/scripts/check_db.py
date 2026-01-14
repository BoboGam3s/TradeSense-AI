import sys
import os

# Add the parent directory to sys.path to import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.models import User

def check_users():
    app = create_app()
    with app.app_context():
        users = User.query.all()
        print(f"Total users found: {len(users)}")
        for u in users:
            print(f"- {u.email} (Plan: {u.plan_type})")

if __name__ == "__main__":
    check_users()
