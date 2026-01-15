"""
Script to add test data for leaderboard (classement)
Creates demo users with different profit percentages
"""
from app import create_app
from app.extensions import db
from app.models import User, Challenge
from datetime import datetime

app = create_app()

with app.app_context():
    print("Creating test users with various performance levels...")
    
    # Create test users with different profit levels
    test_users = [
        {'name': 'Ahmed El Fassi', 'email': 'ahmed@test.com', 'profit': 25.5, 'plan': 'pro'},
        {'name': 'Fatima Zahra', 'email': 'fatima@test.com', 'profit': 18.3, 'plan': 'elite'},
        {'name': 'Youssef Benjelloun', 'email': 'youssef@test.com', 'profit': 15.2, 'plan': 'starter'},
        {'name': 'Samira Idrissi', 'email': 'samira@test.com', 'profit': 12.7, 'plan': 'pro'},
        {'name': 'Hassan Alaoui', 'email': 'hassan@test.com', 'profit': 9.8, 'plan': 'starter'},
        {'name': 'Nadia Benani', 'email': 'nadia@test.com', 'profit': 7.4, 'plan': 'elite'},
        {'name': 'Omar Tazi', 'email': 'omar@test.com', 'profit': 5.1, 'plan': 'pro'},
        {'name': 'Laila Chraibi', 'email': 'laila@test.com', 'profit': -2.3, 'plan': 'starter'},
    ]
    
    created_count = 0
    
    for user_data in test_users:
        # Check if user already exists
        existing_user = User.query.filter_by(email=user_data['email']).first()
        
        if existing_user:
            print(f"Skipping {user_data['name']} - already exists")
            continue
        
        # Create user
        user = User(
            email=user_data['email'],
            full_name=user_data['name'],
            plan_type=user_data['plan'],
            language='fr'
        )
        user.set_password('test123')
        db.session.add(user)
        db.session.flush()  # Get user ID
        
        # Create challenge with profit
        plan_balances = {
            'starter': 5000,
            'pro': 50000,
            'elite': 200000
        }
        
        initial_balance = plan_balances.get(user_data['plan'], 5000)
        profit_amount = initial_balance * (user_data['profit'] / 100)
        current_equity = initial_balance + profit_amount
        
        challenge = Challenge(
            user_id=user.id,
            plan_type=user_data['plan'],
            initial_balance=initial_balance,
            current_equity=current_equity,
            status='active',
            max_daily_loss_percent=5,
            max_total_loss_percent=10,
            profit_target_percent=10
        )
        db.session.add(challenge)
        created_count += 1
        
        print(f"✓ Created {user_data['name']} ({user_data['plan']}) - {user_data['profit']}% profit")
    
    db.session.commit()
    print(f"\n✅ Created {created_count} new test users and challenges for leaderboard!")
    print("You can now check the leaderboard (classement) page to see the data.")
