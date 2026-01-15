"""
TradeSense AI - Flask Application Factory
"""
from flask import Flask
import os
from flask_cors import CORS
from app.config import Config
from app.extensions import db, jwt, migrate, scheduler
from app.routes import auth, trading, challenge, payment, admin, market, alerts, community


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
    if db_url.startswith('sqlite:///'):
        db_path = db_url.replace('sqlite:///', '')
        # Handle instance folder or subdirectories
        db_dir = os.path.dirname(db_path)
        if db_dir and not os.path.exists(db_dir):
            try:
                os.makedirs(db_dir, exist_ok=True)
                print(f"Created database directory: {db_dir}")
            except Exception as e:
                print(f"Warning: Could not create database directory {db_dir}: {e}")

    # Create database tables
    with app.app_context():
        db.create_all()
    
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
