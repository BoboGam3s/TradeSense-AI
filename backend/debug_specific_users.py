from app import create_app
from app.models import User, Challenge
import json

app = create_app()
with app.app_context():
    # Check User 13
    u13 = User.query.get(13)
    u13_data = None
    if u13:
        challenges = Challenge.query.filter_by(user_id=13).all()
        u13_data = {
            'id': u13.id,
            'email': u13.email,
            'plan_type': u13.plan_type,
            'challenge_count': len(challenges),
            'latest_challenge_status': challenges[-1].status if challenges else None
        }
    
    # Check User 25
    u25 = User.query.get(25)
    u25_data = None
    if u25:
        challenges = Challenge.query.filter_by(user_id=25).all()
        u25_data = {
            'id': u25.id,
            'email': u25.email,
            'plan_type': u25.plan_type,
            'challenge_count': len(challenges),
            'latest_challenge_status': challenges[-1].status if challenges else None
        }
        
    print(json.dumps({
        'user_13': u13_data,
        'user_25': u25_data
    }, indent=2))
