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
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    # Register blueprints
    app.register_blueprint(auth.bp, url_prefix='/api/auth')
    app.register_blueprint(trading.bp, url_prefix='/api/trading')
    app.register_blueprint(challenge.bp, url_prefix='/api/challenge')
    app.register_blueprint(payment.bp, url_prefix='/api/payment')
    app.register_blueprint(admin.bp, url_prefix='/api/admin')
    app.register_blueprint(market.bp, url_prefix='/api/market')
    app.register_blueprint(alerts.bp, url_prefix='/api/alerts')
    app.register_blueprint(community.bp, url_prefix='/api/community')
    
    # Create database directory if it's a SQLite URL
    db_url = app.config.get('SQLALCHEMY_DATABASE_URI', '')
    if db_url and db_url.startswith('sqlite:///'):
        db_path_part = db_url.replace('sqlite:///', '')
        
        # Make absolute path
        if not os.path.isabs(db_path_part):
            # Resolve relative to the backend folder
            backend_root = os.path.abspath(os.path.join(app.root_path, '..'))
            abs_db_path = os.path.join(backend_root, db_path_part)
            app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{abs_db_path}'
            db_path_part = abs_db_path
        
        print(f"DEBUG: Using database at: {db_path_part}")
        
        # Ensure parent directory exists
        db_dir = os.path.dirname(db_path_part)
        if db_dir:
            try:
                os.makedirs(db_dir, exist_ok=True)
                # Test writability
                test_file = os.path.join(db_dir, '.write_test')
                with open(test_file, 'w') as f:
                    f.write('test')
                os.remove(test_file)
                print(f"DEBUG: Directory {db_dir} is writable")
            except Exception as e:
                print(f"ERROR: Directory {db_dir} issue: {e}")

    # Create database tables and seed admin if empty
    with app.app_context():
        try:
            db.create_all()
            print("DEBUG: Database tables created successfully")
        except Exception as e:
            print(f"ERROR: Failure during db.create_all(): {e}")
            # Fallback: try using a file in /tmp if we can't write to the project dir
            if "unable to open database file" in str(e).lower():
                tmp_db = "/tmp/tradesense.db"
                print(f"DEBUG: Attempting fallback to /tmp/tradesense.db")
                app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{tmp_db}'
                db.create_all()
                print(f"DEBUG: Fallback database created at {tmp_db}")

        # Seed admin if no users exist
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
    
    # Start background scheduler for challenge verification
    if not scheduler.running:
        scheduler.start()
        # Add job to verify challenges every 5 minutes
        from app.services.challenge_engine import verify_all_active_challenges
        scheduler.add_job(
            id='verify_challenges',
            func=verify_all_active_challenges,
            trigger='interval',
            minutes=5,
            replace_existing=True
        )
    
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
