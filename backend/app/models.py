"""
TradeSense AI - Database Models (MongoDB Atlas Version)
"""
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId

class User:
    """User doc for authentication and profile"""
    def __init__(self, **kwargs):
        self.id = str(kwargs.get('_id')) if kwargs.get('_id') else kwargs.get('id')
        self.email = kwargs.get('email')
        self.password_hash = kwargs.get('password_hash')
        self.full_name = kwargs.get('full_name')
        self.phone = kwargs.get('phone')
        self.bio = kwargs.get('bio')
        self.avatar_url = kwargs.get('avatar_url')
        self.role = kwargs.get('role', 'user')
        self.plan_type = kwargs.get('plan_type')
        self.language = kwargs.get('language', 'fr')
        self.academy_progress = kwargs.get('academy_progress', {})
        self.has_completed_onboarding = kwargs.get('has_completed_onboarding', False)
        
        # Email Verification
        self.email_verified = kwargs.get('email_verified', False)
        self.verification_token = kwargs.get('verification_token')
        self.verification_token_expires = kwargs.get('verification_token_expires')
        
        # Password Reset
        self.reset_token = kwargs.get('reset_token')
        self.reset_token_expires = kwargs.get('reset_token_expires')
        
        self.created_at = kwargs.get('created_at', datetime.utcnow())

    def set_password(self, password):
        """Hash and set user password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verify password against hash"""
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        """Convert to dict for API responses"""
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
            'has_completed_onboarding': self.has_completed_onboarding,
            'email_verified': self.email_verified,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at
        }

    def to_dict_for_db(self):
        """Convert to dict for MongoDB insertion"""
        data = self.to_dict()
        if 'id' in data:
            del data['id']
        data['password_hash'] = self.password_hash
        data['verification_token'] = self.verification_token
        data['verification_token_expires'] = self.verification_token_expires
        data['reset_token'] = self.reset_token
        data['reset_token_expires'] = self.reset_token_expires
        return data

class Challenge:
    """Trading challenge doc"""
    def __init__(self, **kwargs):
        self.id = str(kwargs.get('_id')) if kwargs.get('_id') else kwargs.get('id')
        self.user_id = str(kwargs.get('user_id'))
        self.plan_type = kwargs.get('plan_type', 'starter')
        self.initial_balance = kwargs.get('initial_balance', 5000.0)
        self.current_equity = kwargs.get('current_equity', 5000.0)
        self.status = kwargs.get('status', 'active')
        self.max_daily_loss_percent = kwargs.get('max_daily_loss_percent', 5.0)
        self.max_total_loss_percent = kwargs.get('max_total_loss_percent', 10.0)
        self.profit_target_percent = kwargs.get('profit_target_percent', 10.0)
        self.created_at = kwargs.get('created_at', datetime.utcnow())
        self.completed_at = kwargs.get('completed_at')
        self.failure_reason = kwargs.get('failure_reason')

    def calculate_profit_percent(self):
        if self.initial_balance == 0:
            return 0
        return ((self.current_equity - self.initial_balance) / self.initial_balance) * 100
    
    def calculate_total_profit(self):
        return self.current_equity - self.initial_balance

    def to_dict(self):
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
            'failure_reason': self.failure_reason,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at,
            'completed_at': self.completed_at.isoformat() if isinstance(self.completed_at, datetime) else self.completed_at
        }

class Trade:
    """Trade execution doc"""
    def __init__(self, **kwargs):
        self.id = str(kwargs.get('_id')) if kwargs.get('_id') else kwargs.get('id')
        self.challenge_id = str(kwargs.get('challenge_id'))
        self.symbol = kwargs.get('symbol')
        self.action = kwargs.get('action')
        self.quantity = kwargs.get('quantity')
        self.price = kwargs.get('price')
        self.profit_loss = kwargs.get('profit_loss', 0.0)
        self.is_open = kwargs.get('is_open', True)
        self.close_price = kwargs.get('close_price')
        self.notes = kwargs.get('notes')
        self.tags = kwargs.get('tags', [])
        self.screenshot_url = kwargs.get('screenshot_url')
        self.timestamp = kwargs.get('timestamp', datetime.utcnow())

    def to_dict(self):
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
            'tags': self.tags if isinstance(self.tags, list) else (self.tags.split(',') if self.tags else []),
            'screenshot_url': self.screenshot_url,
            'timestamp': self.timestamp.isoformat() if isinstance(self.timestamp, datetime) else self.timestamp
        }

class PaymentConfig:
    """PayPal configuration storage (MongoDB)"""
    def __init__(self, **kwargs):
        self.id = str(kwargs.get('_id')) if kwargs.get('_id') else kwargs.get('id')
        self.paypal_client_id = kwargs.get('paypal_client_id')
        self.paypal_secret = kwargs.get('paypal_secret')
        self.is_live = kwargs.get('is_live', False)
        self.updated_at = kwargs.get('updated_at', datetime.utcnow())

    def to_dict(self):
        return {
            'id': self.id,
            'paypal_client_id': self.paypal_client_id,
            'paypal_secret': '***' if self.paypal_secret else None,
            'is_live': self.is_live,
            'updated_at': self.updated_at.isoformat() if isinstance(self.updated_at, datetime) else self.updated_at
        }

class PriceAlert:
    """Price alert doc"""
    def __init__(self, **kwargs):
        self.id = str(kwargs.get('_id')) if kwargs.get('_id') else kwargs.get('id')
        self.user_id = str(kwargs.get('user_id'))
        self.symbol = kwargs.get('symbol')
        self.target_price = kwargs.get('target_price')
        self.condition = kwargs.get('condition') # 'ABOVE' or 'BELOW'
        self.is_active = kwargs.get('is_active', True)
        self.created_at = kwargs.get('created_at', datetime.utcnow())

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'symbol': self.symbol,
            'target_price': self.target_price,
            'condition': self.condition,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at
        }
