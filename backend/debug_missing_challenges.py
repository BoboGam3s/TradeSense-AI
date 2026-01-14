from app import create_app
from app.models import User, Challenge
import json

app = create_app()
with app.app_context():
    # Find users with a paid plan but no recorded challenge
    users = User.query.filter(User.plan_type != 'free', User.plan_type != None).all()
    results = []
    for u in users:
        challenge = Challenge.query.filter_by(user_id=u.id).first()
        if not challenge:
            results.append({
                'id': u.id,
                'email': u.email,
                'plan_type': u.plan_type,
                'created_at': str(u.created_at)
            })
    
    # Also check if they have a 'free' challenge instead
    # (Maybe the plan was updated but a new challenge wasn't created)
    users_with_only_free_challenge = []
    for u in users:
        challenges = Challenge.query.filter_by(user_id=u.id).all()
        if challenges and all(c.plan_type == 'free' for c in challenges):
             users_with_only_free_challenge.append({
                'id': u.id,
                'email': u.email,
                'plan_type': u.plan_type,
                'current_challenges': [c.plan_type for c in challenges]
            })

    print(json.dumps({
        'missing_challenge': results,
        'only_free_challenge': users_with_only_free_challenge
    }, indent=2))
