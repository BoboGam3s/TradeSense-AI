from app import create_app
from app.models import Challenge, User
import json

app = create_app()
with app.app_context():
    challenges = Challenge.query.order_by(Challenge.created_at.desc()).limit(20).all()
    results = []
    for c in challenges:
        user = User.query.get(c.user_id)
        results.append({
            'id': c.id,
            'user_id': c.user_id,
            'email': user.email if user else 'Unknown',
            'plan_type': c.plan_type,
            'status': c.status,
            'created_at': str(c.created_at)
        })
    with open('challenges_debug.json', 'w') as f:
        json.dump(results, f, indent=2)
    print("Done. Saved to challenges_debug.json")
