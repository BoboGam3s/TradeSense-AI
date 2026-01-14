from app import create_app
from app.models import Trade, Challenge

app = create_app()
with app.app_context():
    challenges = Challenge.query.filter_by(user_id=25).all()
    for c in challenges:
        trades = Trade.query.filter_by(challenge_id=c.id).all()
        for t in trades:
            if t.timestamp is None:
                print(f"Trade {t.id} (Challenge {c.id}) has NULL timestamp")
            else:
                print(f"Trade {t.id} (Challenge {c.id}) has timestamp: {t.timestamp}")
