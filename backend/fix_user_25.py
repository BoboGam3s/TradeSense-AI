from app import create_app
from app.models import User, Challenge
from app.extensions import db

app = create_app()
with app.app_context():
    u = User.query.get(25)
    if u:
        u.plan_type = 'pro'
        # Create a pro challenge
        c = Challenge(
            user_id=25,
            plan_type='pro',
            initial_balance=50000.0,
            current_equity=50000.0,
            status='active',
            max_daily_loss_percent=5.0,
            max_total_loss_percent=10.0,
            profit_target_percent=10.0
        )
        db.session.add(c)
        db.session.commit()
        print("Success: Fixed User 25")
    else:
        print("Error: User 25 not found")
