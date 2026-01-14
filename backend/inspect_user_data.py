from app import create_app
from app.models import Challenge
import json

app = create_app()
with app.app_context():
    challenges = Challenge.query.filter_by(user_id=25).all()
    for c in challenges:
        print(f"ID: {c.id}")
        print(f"  Plan: {c.plan_type}")
        print(f"  Balance: {c.initial_balance}")
        print(f"  Equity: {c.current_equity}")
        print(f"  Status: {c.status}")
        try:
            print(f"  to_dict(): OK")
            c.to_dict()
        except Exception as e:
            print(f"  to_dict(): FAILED with {type(e).__name__}: {e}")
