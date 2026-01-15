"""
TradeSense AI - Payment Routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, Challenge
from app.extensions import db
from flask import current_app

bp = Blueprint('payment', __name__)


# Plan pricing configuration
PLAN_PRICING = {
    'free': {'price': 0, 'name': 'Essai Démo', 'currency': 'DH', 'initial_balance': 500, 'profit_target': 5},
    'mini_funded': {'price': 600, 'name': 'Mini Funded', 'currency': 'DH', 'initial_balance': 3000, 'profit_target': 10},
    'starter': {'price': 200, 'name': 'Starter Trader', 'currency': 'DH', 'initial_balance': 5000, 'profit_target': 10},
    'pro': {'price': 500, 'name': 'Pro Trader', 'currency': 'DH', 'initial_balance': 50000, 'profit_target': 10},
    'elite': {'price': 1000, 'name': 'Elite Institutional', 'currency': 'DH', 'initial_balance': 200000, 'profit_target': 10}
}


@bp.route('/plans', methods=['GET'])
def get_plans():
    """Get available plans"""
    return jsonify({'plans': PLAN_PRICING}), 200


@bp.route('/mock-payment', methods=['POST'])
@jwt_required()
def mock_payment():
    """
    Mock payment endpoint for development
    Simulates payment and creates a challenge
    """
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if 'plan_type' not in data:
        return jsonify({'error': 'Plan type required'}), 400
    
    plan_type = data['plan_type']
    
    if plan_type not in PLAN_PRICING:
        return jsonify({'error': 'Invalid plan type'}), 400
    
    # Validate payment-specific fields
    payment_method = data.get('payment_method', 'card')
    
    # Only validate card expiry for card payments
    if payment_method == 'card':
        billing_info = data.get('billing_info', {})
        card_expiry = billing_info.get('card_expiry')
        
        # Only validate if expiry is provided
        if card_expiry:
            from app.utils.validators import validate_expiry_date
            is_valid, error_msg = validate_expiry_date(card_expiry)
            if not is_valid:
                return jsonify({
                    'error': f'Erreur de carte: {error_msg}',
                    'details': 'Veuillez vérifier la date d\'expiration de votre carte'
                }), 400
    
    user = User.query.get(user_id)
    
    # Simulate payment processing delay
    import time
    time.sleep(1)
    
    # Update user's plan
    user.plan_type = plan_type
    
    # Create a new challenge with plan-specific configuration
    plan_config = PLAN_PRICING[plan_type]
    initial_balance = plan_config.get('initial_balance', 5000)
    profit_target = plan_config.get('profit_target', 10)
    
    challenge = Challenge(
        user_id=user_id,
        plan_type=plan_type,
        initial_balance=initial_balance,
        current_equity=initial_balance,
        status='active',
        max_daily_loss_percent=current_app.config.get('MAX_DAILY_LOSS_PERCENT', 5),
        max_total_loss_percent=current_app.config.get('MAX_TOTAL_LOSS_PERCENT', 10),
        profit_target_percent=profit_target
    )
    
    db.session.add(challenge)
    db.session.commit()
    
    return jsonify({
        'message': 'Payment successful (MOCK)',
        'plan': PLAN_PRICING[plan_type],
        'challenge': challenge.to_dict()
    }), 201


@bp.route('/paypal/create-order', methods=['POST'])
@jwt_required()
def create_paypal_order():
    """Create PayPal order"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if 'plan_type' not in data:
        return jsonify({'error': 'Plan type required'}), 400
    
    plan_type = data['plan_type']
    if plan_type not in PLAN_PRICING:
        return jsonify({'error': 'Invalid plan type'}), 400
        
    plan = PLAN_PRICING[plan_type]
    
    # In a real app, you would use paypalrestsdk or requests to talk to PayPal API
    # For now, we return the info needed by the frontend to create the order via the SDK
    # or simulate the order ID if using a mock flow.
    # To be truly "functional", the frontend will use the PayPal JS SDK.
    
    return jsonify({
        'plan_name': plan['name'],
        'amount': plan['price'],
        'currency': 'USD' if plan['currency'] != 'DH' else 'USD', # PayPal doesn't support MAD easily
        'status': 'ready'
    }), 200


@bp.route('/paypal/capture-order', methods=['POST'])
@jwt_required()
def capture_paypal_order():
    """Capture PayPal payment and create challenge"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if 'orderID' not in data:
        return jsonify({'error': 'Order ID required'}), 400
        
    order_id = data['orderID']
    plan_type = data.get('plan_type', 'starter')
    
    # 1. Verify payment with PayPal (In real app)
    # 2. If valid, create challenge (Same logic as mock_payment)
    user = User.query.get(user_id)
    user.plan_type = plan_type
    
    plan_config = PLAN_PRICING[plan_type]
    initial_balance = plan_config.get('initial_balance', 5000)
    profit_target = plan_config.get('profit_target', 10)
    
    challenge = Challenge(
        user_id=user_id,
        plan_type=plan_type,
        initial_balance=initial_balance,
        current_equity=initial_balance,
        status='active',
        max_daily_loss_percent=current_app.config.get('MAX_DAILY_LOSS_PERCENT', 5),
        max_total_loss_percent=current_app.config.get('MAX_TOTAL_LOSS_PERCENT', 10),
        profit_target_percent=profit_target
    )
    
    db.session.add(challenge)
    db.session.commit()
    
    return jsonify({
        'message': 'Paiement PayPal capturé et défi activé',
        'orderID': order_id,
        'challenge': challenge.to_dict()
    }), 201
