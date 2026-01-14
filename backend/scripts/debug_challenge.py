import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import User, Challenge

app = create_app()

with app.app_context():
    # Try to find the admin user first
    print("Searching for 'Moughit'...")
    users = User.query.filter(User.full_name.ilike('%Moughit%')).all()
    for u in users:
        print(f"FOUND USER -> ID: {u.id} | Email: {u.email} | Name: {u.full_name}")
        chals = Challenge.query.filter_by(user_id=u.id).all()
        for c in chals:
             print(f"  CHALLENGE -> ID: {c.id} | Status: {c.status} | Equity: {c.current_equity}")

    print("\nSearching for 200k balance...")
    chals_200 = Challenge.query.filter(Challenge.current_equity == 200000).all()
    for c in chals_200:
        print(f"FOUND 200k -> Challenge ID: {c.id} | User ID: {c.user_id} | Status: {c.status}")
