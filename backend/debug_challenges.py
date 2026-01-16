import os
from app import create_app
from app.extensions import mongo

app = create_app()

with app.app_context():
    print("--- Listing All Challenges ---")
    challenges = list(mongo.db.challenges.find())
    print(f"Total Challenges Found: {len(challenges)}")
    for c in challenges:
        print(f"User ID: {c.get('user_id')}")
        print(f"Status: {c.get('status')}")
        print(f"Equity: {c.get('current_equity')}")
        print(f"Initial: {c.get('initial_balance')}")
        print("---")
