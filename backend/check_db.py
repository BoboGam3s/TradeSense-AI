import sys
import os
sys.path.append(os.getcwd())
from app import create_app, db
from app.models import User, Challenge

app = create_app()
with app.app_context():
    print("Checking Database...")
    try:
        user_count = User.query.count()
        print(f"User count: {user_count}")
        if user_count > 0:
            users = User.query.all()
            for u in users:
                print(f"  - {u.email} ({u.role})")
        else:
            print("  No users found!")
            
        challenge_count = Challenge.query.count()
        print(f"Challenge count: {challenge_count}")
    except Exception as e:
        print(f"Error checking database: {e}")
