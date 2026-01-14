from app import create_app
from app.models import Challenge
import json

app = create_app()
with app.app_context():
    challenges = Challenge.query.order_by(Challenge.created_at.desc()).limit(10).all()
    results = []
    for c in challenges:
        results.append({
            'id': c.id,
            'user_id': c.user_id,
            'plan_type': c.plan_type,
            'status': c.status,
            'created_at': str(c.created_at)
        })
    print(json.dumps(results, indent=2))
