"""
TradeSense AI - Database Models
"""
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db


class User(db.Model):
    """User model for authentication and profile"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=True)  # Phone number
    bio = db.Column(db.Text, nullable=True)  # Short biography
    avatar_url = db.Column(db.String(255), nullable=True)  # Avatar image URL
    role = db.Column(db.String(20), default='user')  # 'user' or 'admin'
    plan_type = db.Column(db.String(20), nullable=True)  # 'free', 'starter', 'pro', 'elite'
    language = db.Column(db.String(5), default='fr')  # 'fr', 'en', 'ar'
    academy_progress = db.Column(db.JSON, nullable=True)  # Store progression as JSON
    
    # Email Verification
    email_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(100), nullable=True)
    verification_token_expires = db.Column(db.DateTime, nullable=True)
    
    # Password Reset
    reset_token = db.Column(db.String(100), nullable=True)
    reset_token_expires = db.Column(db.DateTime, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    challenges = db.relationship('Challenge', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set user password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verify password against hash"""
        return check_password_hash(self.password_hash, password)
    
    # Onboarding
    has_completed_onboarding = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<User {self.email}>'
    
    def to_dict(self):
        """Convert user to dictionary"""
        return {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'phone': self.phone,
            'bio': self.bio,
            'avatar_url': self.avatar_url,
            'role': self.role,
            'plan_type': self.plan_type,
            'language': self.language,
            'academy_progress': self.academy_progress,
            'email_verified': self.email_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Challenge(db.Model):
    """Trading challenge model"""
    __tablename__ = 'challenges'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    plan_type = db.Column(db.String(20), nullable=False)  # 'starter', 'pro', 'elite'
    initial_balance = db.Column(db.Float, default=5000.0)
    current_equity = db.Column(db.Float, default=5000.0)
    status = db.Column(db.String(20), default='active')  # 'active', 'passed', 'failed'
    max_daily_loss_percent = db.Column(db.Float, default=5.0)
    max_total_loss_percent = db.Column(db.Float, default=10.0)
    profit_target_percent = db.Column(db.Float, default=10.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    trades = db.relationship('Trade', backref='challenge', lazy=True, cascade='all, delete-orphan')
    
    def calculate_profit_percent(self):
        """Calculate profit/loss percentage"""
        if self.initial_balance == 0:
            return 0
        return ((self.current_equity - self.initial_balance) / self.initial_balance) * 100
    
    def calculate_total_profit(self):
        """Calculate total profit/loss in dollars"""
        return self.current_equity - self.initial_balance
    
    def to_dict(self):
        """Convert challenge to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'plan_type': self.plan_type,
            'initial_balance': self.initial_balance,
            'current_equity': self.current_equity,
            'status': self.status,
            'profit_percent': round(self.calculate_profit_percent(), 2),
            'total_profit': round(self.calculate_total_profit(), 2),
            'max_daily_loss_percent': self.max_daily_loss_percent,
            'max_total_loss_percent': self.max_total_loss_percent,
            'profit_target_percent': self.profit_target_percent,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }


class Trade(db.Model):
    """Trade execution model"""
    __tablename__ = 'trades'
    
    id = db.Column(db.Integer, primary_key=True)
    challenge_id = db.Column(db.Integer, db.ForeignKey('challenges.id'), nullable=False)
    symbol = db.Column(db.String(20), nullable=False)  # 'AAPL', 'BTC-USD', 'IAM', etc.
    action = db.Column(db.String(10), nullable=False)  # 'buy' or 'sell'
    quantity = db.Column(db.Float, nullable=False)
    price = db.Column(db.Float, nullable=False)
    profit_loss = db.Column(db.Float, default=0.0)
    
    # MT4 LOGIC: Independent orders
    is_open = db.Column(db.Boolean, default=True)
    close_price = db.Column(db.Float, nullable=True)
    
    # Trading Journal Fields
    notes = db.Column(db.Text, nullable=True)
    tags = db.Column(db.String(255), nullable=True)  # Comma-separated tags
    screenshot_url = db.Column(db.String(255), nullable=True)
    
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        """Convert trade to dictionary"""
        return {
            'id': self.id,
            'challenge_id': self.challenge_id,
            'symbol': self.symbol,
            'action': self.action,
            'quantity': self.quantity,
            'price': self.price,
            'profit_loss': round(self.profit_loss, 2),
            'is_open': self.is_open,
            'close_price': self.close_price,
            'notes': self.notes,
            'tags': self.tags.split(',') if self.tags else [],
            'screenshot_url': self.screenshot_url,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }


class PaymentConfig(db.Model):
    """PayPal configuration storage (admin panel)"""
    __tablename__ = 'payment_config'
    
    id = db.Column(db.Integer, primary_key=True)
    paypal_client_id = db.Column(db.String(255), nullable=True)
    paypal_secret = db.Column(db.String(255), nullable=True)
    is_live = db.Column(db.Boolean, default=False)  # False = sandbox, True = production
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert config to dictionary (hide secret)"""
        return {
            'id': self.id,
            'paypal_client_id': self.paypal_client_id,
            'paypal_secret': '***' if self.paypal_secret else None,
            'is_live': self.is_live,
            'updated_at': self.updated_at.isoformat()
        }

class PriceAlert(db.Model):
    __tablename__ = 'price_alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    symbol = db.Column(db.String(20), nullable=False)
    target_price = db.Column(db.Float, nullable=False)
    condition = db.Column(db.String(10), nullable=False) # 'ABOVE' or 'BELOW'
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'symbol': self.symbol,
            'target_price': self.target_price,
            'condition': self.condition,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }
