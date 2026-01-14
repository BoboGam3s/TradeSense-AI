import sys
import os

# Add the parent directory to sys.path to import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.models import User

def test_password():
    app = create_app()
    # Force absolute path to instance folder
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(base_dir, "instance", "tradesense.db")
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"
    
    with app.app_context():
        u = User.query.filter_by(email='starter@tradesense.ai').first()
        if not u:
            print("User NOT found in app context")
            return
            
        password = "TradeSense2025!"
        is_valid = u.check_password(password)
        print(f"Password check for {u.email}: {'VALID' if is_valid else 'INVALID'}")
        
        # Also try without exclamation mark just in case
        print(f"Password check (no !) for {u.email}: {'VALID' if u.check_password('TradeSense2025') else 'INVALID'}")

if __name__ == "__main__":
    test_password()
