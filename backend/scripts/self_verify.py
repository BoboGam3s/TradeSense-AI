import sys
import os

# Add the parent directory to sys.path to import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db
from app.models import User

def self_verify():
    app = create_app()
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(base_dir, "instance", "tradesense.db")
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"
    
    print(f"Using DB: {app.config['SQLALCHEMY_DATABASE_URI']}")
    
    with app.app_context():
        # Target email
        email = "verify@tradesense.ai"
        
        # 1. Clean up if exists
        u = User.query.filter_by(email=email).first()
        if u:
            db.session.delete(u)
            db.session.commit()
            print(f"Cleaned up existing {email}")

        # 2. Create
        print(f"Creating {email}...")
        u = User(email=email, full_name="Verifier", plan_type="pro")
        u.set_password("verify123")
        db.session.add(u)
        db.session.commit()
        print("Commit successful")

        # 3. Verify in SAME context
        v = User.query.filter_by(email=email).first()
        if v:
            print(f"VERIFICATION SUCCESS: Found {email} in same context!")
        else:
            print(f"VERIFICATION FAILURE: Did not find {email} after commit!")

if __name__ == "__main__":
    self_verify()
