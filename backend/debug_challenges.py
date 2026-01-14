from app import create_app
from app.models import Challenge
app = create_app()
with app.app_context():
    challenges = Challenge.query.all()
    for c in challenges:
        print(f"ID:{c.id} UID:{c.user_id} Status:{c.status} Equity:{c.current_equity}")
