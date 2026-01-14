import sys
import os
from datetime import datetime
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import User, Challenge

app = create_app()

with app.app_context():
    user = User.query.filter_by(email='admin@tradesense.ai').first()
    if not user:
        print("User not found")
        sys.exit(1)
        
    print(f"Checking challenges for {user.email}...")
    
    # helper to print
    def print_c(c):
        print(f"ID: {c.id}, Status: {c.status}, Equity: {c.current_equity}")

    # Find the most recent challenge
    challenge = Challenge.query.filter_by(user_id=user.id).order_by(Challenge.created_at.desc()).first()
    
    if challenge:
        print("Found existing challenge:")
        print_c(challenge)
        
        # Reset it
        challenge.status = 'active'
        challenge.current_equity = 100000.0 # Reset to 100k
        challenge.initial_balance = 100000.0
        challenge.start_date = datetime.utcnow()
        challenge.end_date = None
        db.session.commit()
        print("RESET challenge to ACTIVE with $100k balance.")
    else:
        print("No challenge found. Creating new one...")
        new_challenge = Challenge(
            user_id=user.id,
            plan_type='pro',
            initial_balance=100000.0,
            current_equity=100000.0,
            status='active',
            start_date=datetime.utcnow(),
            profit_target=10000.0, # 10%
            max_daily_loss=5000.0, # 5%
            max_total_loss=10000.0 # 10%
        )
        db.session.add(new_challenge)
        db.session.commit()
        print("CREATED new ACTIVE challenge with $100k balance.")
