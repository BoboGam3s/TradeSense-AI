"""
TradeSense AI - Flask Application Factory
"""
from flask import Flask
import os
from flask_cors import CORS
from app.config import Config
from app.extensions import db, jwt, migrate, scheduler
from app.routes import auth, trading, challenge, payment, admin, market, alerts, community
from app.models import User


def create_app(config_class=Config):
    """Create and configure the Flask application"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    # Enable CORS for all routes and origins
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
    
    
    # Register blueprints
    app.register_blueprint(auth.bp, url_prefix='/api/auth')
    app.register_blueprint(trading.bp, url_prefix='/api/trading')
    app.register_blueprint(challenge.bp, url_prefix='/api/challenge')
    app.register_blueprint(payment.bp, url_prefix='/api/payment')
    app.register_blueprint(admin.bp, url_prefix='/api/admin')
    app.register_blueprint(market.bp, url_prefix='/api/market')
    app.register_blueprint(alerts.bp, url_prefix='/api/alerts')
    app.register_blueprint(community.bp, url_prefix='/api/community')
    
    # Database Configuration & Fail-Safe Initialization
    try:
        db_url = app.config.get('SQLALCHEMY_DATABASE_URI', '')
        
        # Only handle SQLite specifically
        if db_url and db_url.startswith('sqlite:///'):
            target_db_path = None
            
            # 1. Try to use the configured path (made absolute)
            try:
                raw_path = db_url.replace('sqlite:///', '')
                if not os.path.isabs(raw_path):
                    # Default: backend/instance/tradesense.db
                    base_dir = os.path.dirname(app.root_path) # backend/
                    target_db_path = os.path.abspath(os.path.join(base_dir, raw_path))
                else:
                    target_db_path = raw_path
                    
                # Try creating directory
                db_dir = os.path.dirname(target_db_path)
                os.makedirs(db_dir, exist_ok=True)
                
                # Verify write permissions
                test_file = os.path.join(db_dir, '.write_test')
                with open(test_file, 'w') as f: f.write('ok')
                os.remove(test_file)
                
                # Apply if success
                app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{target_db_path}'
                print(f"DEBUG: Using primary database path: {target_db_path}")
                
            except Exception as e:
                print(f"WARNING: Primary database path failed ({e}). Usage fallback.")
                # 2. Fallback to system temp directory (Always writable on Render/Railway)
                import tempfile
                temp_dir = tempfile.gettempdir()
                target_db_path = os.path.join(temp_dir, 'tradesense.db')
                app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{target_db_path}'
                print(f"DEBUG: Fallback to temporary database: {target_db_path}")

    except Exception as e:
        print(f"ERROR: Critical failure in DB configuration: {e}")
        # Keep going to allow app startup

    # Create database tables and seed admin if empty (FAIL-SAFE)
    with app.app_context():
        try:
            # Try to create tables
            db.create_all()
            print("DEBUG: Database tables created/verified successfully")
            
            # Seed admin if no users exist
            try:
                if User.query.count() == 0:
                    print("Database is empty. Seeding admin user...")
                    admin_user = User(
                        email='admin@tradesense.ai',
                        full_name='Admin User',
                        role='admin',
                        language='fr'
                    )
                    admin_user.set_password('admin123')
                    db.session.add(admin_user)
                    db.session.commit()
                    print("Admin user created: admin@tradesense.ai / admin123")
            except Exception as e_seed:
                print(f"WARNING: Could not seed admin user: {e_seed}")
                
        except Exception as e:
            print(f"ERROR: Database initialization failed: {e}")
            print("CRITICAL: Application starting WITHOUT database connection to prevent crash.")
    
    # Start background scheduler for challenge verification
    # if not scheduler.running:
    #     try:
    #         scheduler.start()
    #         # Add job to verify challenges every 5 minutes
    #         from app.services.challenge_engine import verify_all_active_challenges
    #         scheduler.add_job(
    #             id='verify_challenges',
    #             func=verify_all_active_challenges,
    #             trigger='interval',
    #             minutes=5,
    #             replace_existing=True
    #         )
    #     except Exception as e:
    #         print(f"WARNING: Scheduler failed to start: {e}")
    
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'message': 'TradeSense AI is running'}
    
    @app.errorhandler(Exception)
    def handle_exception(e):
        # Pass through HTTP errors
        from werkzeug.exceptions import HTTPException
        if isinstance(e, HTTPException):
            return e
        
        # Log non-HTTP exceptions
        import traceback
        print(f"FATAL ERROR: {str(e)}")
        traceback.print_exc()
        return {"error": "Internal Server Error", "details": str(e)}, 500
    
    return app
