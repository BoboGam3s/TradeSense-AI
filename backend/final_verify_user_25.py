from app import create_app
from app.models import User, Challenge
import json

app = create_app()
with app.app_context():
    u = User.query.get(25)
    c = Challenge.query.filter_by(user_id=25).order_by(Challenge.created_at.desc()).first()
    
    print(json.dumps({
        'user': {
            'email': u.email,
            'plan_type': u.plan_type
        },
        'challenge': c.to_dict() if c else None
    }, indent=2))
