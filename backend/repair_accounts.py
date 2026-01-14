from app import create_app
from app.models import User, Challenge
from app.extensions import db
import json

app = create_app()
with app.app_context():
    # Plan pricing for initial balance
    PLAN_CONFIG = {
        'mini_funded': 3000,
        'starter': 5000,
        'pro': 50000,
        'elite': 200000
    }
    
    repaired_users = []
    
    # Logic: If user has a paid plan_type, they MUST have an ACTIVE challenge of that type
    users = User.query.filter(User.plan_type != 'free', User.plan_type != None).all()
    for u in users:
        # Get the latest challenge
        latest_challenge = Challenge.query.filter_by(user_id=u.id).order_by(Challenge.created_at.desc()).first()
        
        # If no challenge, or latest challenge doesn't match the plan_type, or latest is NOT active
        # (Wait, if it's passed/failed, they might need to buy a new one, but if they JUST paid, it should be active)
        
        # Specific fix for User 25 if they are in this state
        if not latest_challenge or latest_challenge.plan_type != u.plan_type or latest_challenge.status != 'active':
            # Create the missing challenge
            capital = PLAN_CONFIG.get(u.plan_type, 5000)
            
            new_challenge = Challenge(
                user_id=u.id,
                plan_type=u.plan_type,
                initial_balance=capital,
                current_equity=capital,
                status='active',
                max_daily_loss_percent=5,
                max_total_loss_percent=10,
                profit_target_percent=10
            )
            db.session.add(new_challenge)
            repaired_users.append({
                'id': u.id,
                'email': u.email,
                'new_plan': u.plan_type,
                'capital': capital
            })
            print(f"Repaired user {u.email}: Added {u.plan_type} challenge")
    
    db.session.commit()
    print(f"Total repaired: {len(repaired_users)}")
    print(json.dumps(repaired_users, indent=2))
