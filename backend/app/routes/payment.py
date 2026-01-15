"""
TradeSense AI - Payment Routes (MongoDB Version)
"""
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, Challenge
from app.extensions import mongo
from bson import ObjectId

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
    """Mock payment and create challenge in MongoDB"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    plan_type = data.get('plan_type')
    if not plan_type or plan_type not in PLAN_PRICING:
        return jsonify({'error': 'Invalid plan type'}), 400
    
    # 1. Update user's plan in DB
    mongo.db.users.update_one(
        {'_id': ObjectId(user_id)},
        {'$set': {'plan_type': plan_type}}
    )
    
    # 2. Create new challenge
    plan_config = PLAN_PRICING[plan_type]
    challenge = Challenge(
        user_id=user_id,
        plan_type=plan_type,
        initial_balance=plan_config['initial_balance'],
        current_equity=plan_config['initial_balance'],
        status='active',
        max_daily_loss_percent=current_app.config.get('MAX_DAILY_LOSS_PERCENT', 5),
        max_total_loss_percent=current_app.config.get('MAX_TOTAL_LOSS_PERCENT', 10),
        profit_target_percent=plan_config['profit_target']
    )
    
    challenge_data = challenge.to_dict()
    if 'id' in challenge_data: del challenge_data['id']
    challenge_data['created_at'] = datetime.utcnow()
    
    result = mongo.db.challenges.insert_one(challenge_data)
    challenge.id = str(result.inserted_id)
    
    return jsonify({
        'message': 'Payment successful',
        'plan': plan_config,
        'challenge': challenge.to_dict()
    }), 201

from datetime import datetime

@bp.route('/paypal/capture-order', methods=['POST'])
@jwt_required()
def capture_paypal_order():
    """Capture PayPal order and create challenge"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    order_id = data.get('orderID')
    plan_type = data.get('plan_type', 'starter')
    
    # Update user
    mongo.db.users.update_one(
        {'_id': ObjectId(user_id)},
        {'$set': {'plan_type': plan_type}}
    )
    
    # Create challenge
    plan_config = PLAN_PRICING[plan_type]
    challenge = Challenge(
        user_id=user_id,
        plan_type=plan_type,
        initial_balance=plan_config['initial_balance'],
        current_equity=plan_config['initial_balance'],
        status='active',
        max_daily_loss_percent=current_app.config.get('MAX_DAILY_LOSS_PERCENT', 5),
        max_total_loss_percent=current_app.config.get('MAX_TOTAL_LOSS_PERCENT', 10),
        profit_target_percent=plan_config['profit_target']
    )
    
    challenge_data = challenge.to_dict()
    if 'id' in challenge_data: del challenge_data['id']
    challenge_data['created_at'] = datetime.utcnow()
    
    result = mongo.db.challenges.insert_one(challenge_data)
    challenge.id = str(result.inserted_id)
    
    return jsonify({
        'message': 'Paiement PayPal capturé',
        'orderID': order_id,
        'challenge': challenge.to_dict()
    }), 201
