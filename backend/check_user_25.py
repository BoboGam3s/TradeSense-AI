from app import create_app
from app.models import User
import json

app = create_app()
with app.app_context():
    u = User.query.get(25)
    if u:
        print(json.dumps({
            'id': u.id,
            'email': u.email,
            'plan_type': u.plan_type
        }, indent=2))
    else:
        print("User 25 not found")
