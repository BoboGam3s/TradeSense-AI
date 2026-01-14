"""
TradeSense AI - Seed Data Script
Populates the database with test data for development
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app
from app.extensions import db
from app.models import User, Challenge, Trade
from datetime import datetime, timedelta
import random

def seed_database():
    """Seed the database with test data"""
    
    app = create_app()
    
    with app.app_context():
        # Clear existing data
        print("Clearing existing data...")
        Trade.query.delete()
        Challenge.query.delete()
        User.query.delete()
        db.session.commit()
        
        print("Creating users...")
        
        # Create admin user
        admin = User(
            email='admin@tradesense.ai',
            full_name='Admin User',
            role='admin',
            language='fr'
        )
        admin.set_password('admin123')
        db.session.add(admin)
        
        # Create test users
        users = []
        user_names = [
            'Mohammed Alami',
            'Sara Bennis',
            'Youssef Tazi',
            'Fatima Benjelloun',
            'Amine Cherkaoui',
            'Laila Mansouri',
            'Karim El Idrissi',
            'Nadia Zahra',
            'Omar Fassi',
            'Samia Kadiri'
        ]
        
        for i, name in enumerate(user_names):
            user = User(
                email=f'user{i+1}@test.com',
                full_name=name,
                role='user',
                plan_type=random.choice(['starter', 'pro', 'elite']),
                language=random.choice(['fr', 'en', 'ar'])
            )
            user.set_password('password123')
            users.append(user)
            db.session.add(user)
        
        db.session.commit()
        print(f"Created {len(users) + 1} users (1 admin + {len(users)} regular users)")
        
        # Create challenges
        print("Creating challenges...")
        
        challenges = []
        symbols = ['AAPL', 'TSLA', 'BTC-USD', 'ETH-USD', 'IAM', 'ATW']
        
        for i, user in enumerate(users):
            # Determine challenge status
            if i < 5:
                status = 'active'
            elif i < 8:
                status = 'passed'
            else:
                status = 'failed'
            
            # Create challenge
            initial_balance = 5000.0
            
            # Calculate equity based on status
            if status == 'active':
                equity = initial_balance + random.uniform(-300, 800)
            elif status == 'passed':
                equity = initial_balance + random.uniform(500, 1000)  # 10%+ profit
            else:  # failed
                equity = initial_balance - random.uniform(500, 600)  # >10% loss
            
            challenge = Challenge(
                user_id=user.id,
                plan_type=user.plan_type,
                initial_balance=initial_balance,
                current_equity=equity,
                status=status,
                max_daily_loss_percent=5.0,
                max_total_loss_percent=10.0,
                profit_target_percent=10.0,
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30))
            )
            
            if status in ['passed', 'failed']:
                challenge.completed_at = datetime.utcnow() - timedelta(days=random.randint(0, 5))
            
            challenges.append(challenge)
            db.session.add(challenge)
        
        db.session.commit()
        print(f"Created {len(challenges)} challenges")
        
        # Create trades
        print("Creating trades...")
        
        total_trades = 0
        for challenge in challenges:
            # Number of trades based on status
            if challenge.status == 'active':
                num_trades = random.randint(5, 20)
            elif challenge.status == 'passed':
                num_trades = random.randint(15, 40)
            else:
                num_trades = random.randint(10, 30)
            
            running_equity = challenge.initial_balance
            
            for j in range(num_trades):
                symbol = random.choice(symbols)
                
                # Generate realistic prices
                base_prices = {
                    'AAPL': 180.0,
                    'TSLA': 250.0,
                    'BTC-USD': 43000.0,
                    'ETH-USD': 2300.0,
                    'IAM': 102.5,
                    'ATW': 445.8
                }
                
                price = base_prices.get(symbol, 100.0) * random.uniform(0.95, 1.05)
                quantity = random.uniform(0.1, 5.0)
                action = random.choice(['buy', 'sell'])
                
                # Calculate profit/loss
                trade_value = price * quantity
                
                if action == 'buy':
                    profit_loss = -trade_value * random.uniform(0, 0.02)  # Small loss on buy
                else:
                    profit_loss = trade_value * random.uniform(-0.02, 0.03)  # Potential profit on sell
                
                running_equity += profit_loss
                
                trade = Trade(
                    challenge_id=challenge.id,
                    symbol=symbol,
                    action=action,
                    quantity=quantity,
                    price=price,
                    profit_loss=profit_loss,
                    timestamp=challenge.created_at + timedelta(
                        hours=random.randint(1, 24 * 30)
                    )
                )
                
                db.session.add(trade)
                total_trades += 1
            
            # Update challenge equity to match trades
            challenge.current_equity = running_equity
        
        db.session.commit()
        print(f"Created {total_trades} trades")
        
        # Print summary
        print("\n" + "="*50)
        print("SEED DATA SUMMARY")
        print("="*50)
        print(f"Total Users: {len(users) + 1}")
        print(f"  - Admin: admin@tradesense.ai (password: admin123)")
        print(f"  - Regular Users: {len(users)} (password: password123)")
        print(f"\nTotal Challenges: {len(challenges)}")
        print(f"  - Active: {len([c for c in challenges if c.status == 'active'])}")
        print(f"  - Passed: {len([c for c in challenges if c.status == 'passed'])}")
        print(f"  - Failed: {len([c for c in challenges if c.status == 'failed'])}")
        print(f"\nTotal Trades: {total_trades}")
        print("="*50)
        print("\nDatabase seeded successfully! ✅")
        print("\nYou can now:")
        print("1. Login as admin: admin@tradesense.ai / admin123")
        print("2. Login as user: user1@test.com / password123")
        print("3. View the leaderboard at /api/challenge/leaderboard")


if __name__ == '__main__':
    print("Starting database seeding...")
    seed_database()
