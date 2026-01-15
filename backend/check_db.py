from app import create_app
from app.models import User, Challenge

app = create_app()
with app.app_context():
    users = User.query.all()
    challenges = Challenge.query.all()
    print(f"Total Users: {len(users)}")
    print(f"Total Challenges: {len(challenges)}")
    for c in challenges:
        print(f"Challenge ID: {c.id}, User ID: {c.user_id}, Status: {c.status}")
