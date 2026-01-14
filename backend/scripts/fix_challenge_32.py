import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import Challenge, User

app = create_app()

with app.app_context():
    print(" detailed check for Challenge 32...")
    c = Challenge.query.get(32)
    if c:
        print(f"FOUND Challenge 32 -> User: {c.user_id}, Status: {c.status}, Balance: {c.current_equity}")
        if c.status != 'active':
            print("Status is NOT active. Fixing...")
            c.status = 'active'
            db.session.commit()
            print("FIXED: Challenge 32 is now active.")
        else:
            print("Challenge 32 is ALREADY active. Checking User...")
            u = User.query.get(c.user_id)
            print(f"Owner: {u.full_name} ({u.email})")
            
            # Check if there are duplicate active challenges?
            actives = Challenge.query.filter_by(user_id=c.user_id, status='active').all()
            print(f"User has {len(actives)} active challenges.")
    else:
        print("Challenge 32 not found.")
