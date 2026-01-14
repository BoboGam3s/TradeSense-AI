import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import User, Challenge

app = create_app()

with app.app_context():
    print("--- CONCISE MAP ---")
    
    # 1. Admin
    admin = User.query.filter_by(email='admin@tradesense.ai').first()
    if admin: print(f"ADMIN: ID={admin.id} | {admin.full_name}")
    else: print("ADMIN: Not found")

    # 2. Moughit
    moughit = User.query.filter(User.full_name.ilike('%Moughit%')).first()
    if moughit: print(f"MOUGHIT: ID={moughit.id} | {moughit.full_name}")
    else: print("MOUGHIT: Not found")

    # 3. Challenge 32
    c32 = Challenge.query.get(32)
    if c32: print(f"CHAL 32: OwnerID={c32.user_id} | Status={c32.status} | Equity={c32.current_equity}")
    else: print("CHAL 32: Not found")

    # 4. Check Challenges for Admin
    if admin:
        chals = Challenge.query.filter_by(user_id=admin.id).all()
        print(f"ADMIN CHALS: {[f'{c.id}:{c.status}' for c in chals]}")

    # 5. Check Challenges for Moughit
    if moughit:
         chals = Challenge.query.filter_by(user_id=moughit.id).all()
         print(f"MOUGHIT CHALS: {[f'{c.id}:{c.status}' for c in chals]}")
