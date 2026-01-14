from app import create_app
from app.models import User, Challenge
import json

app = create_app()
with app.app_context():
    # Latest 5 users
    users = User.query.order_by(User.id.desc()).limit(5).all()
    user_list = []
    for u in users:
        # Check if they have a challenge
        challenge = Challenge.query.filter_by(user_id=u.id).order_by(Challenge.created_at.desc()).first()
        user_list.append({
            'id': u.id,
            'email': u.email,
            'plan_type': u.plan_type,
            'has_challenge': challenge is not None,
            'challenge_status': challenge.status if challenge else None,
            'challenge_created': str(challenge.created_at) if challenge else None
        })
    print(json.dumps(user_list, indent=2))
