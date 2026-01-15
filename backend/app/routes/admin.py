"""
TradeSense AI - Admin Routes (MongoDB Version)
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models import User, Challenge, PaymentConfig
from app.extensions import mongo
from app.utils.decorators import admin_required
from bson import ObjectId
from datetime import datetime

bp = Blueprint('admin', __name__)

@bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_all_users():
    """Get all users (admin only)"""
    cursor = mongo.db.users.find().sort('created_at', -1)
    users = [User(**u).to_dict() for u in cursor]
    
    return jsonify({
        'total': len(users),
        'users': users
    }), 200

@bp.route('/challenges', methods=['GET'])
@jwt_required()
@admin_required
def get_all_challenges():
    """Get all challenges (admin only)"""
    cursor = mongo.db.challenges.find().sort('created_at', -1)
    
    challenge_list = []
    for c_doc in cursor:
        challenge = Challenge(**c_doc)
        user_doc = mongo.db.users.find_one({'_id': ObjectId(challenge.user_id)})
        
        challenge_data = challenge.to_dict()
        challenge_data['user_email'] = user_doc['email'] if user_doc else 'N/A'
        challenge_data['user_name'] = user_doc['full_name'] if user_doc else 'N/A'
        challenge_list.append(challenge_data)
    
    return jsonify({
        'total': len(challenge_list),
        'challenges': challenge_list
    }), 200

@bp.route('/challenge/<string:challenge_id>/status', methods=['PUT'])
@jwt_required()
@admin_required
def update_challenge_status(challenge_id):
    """Manually update challenge status (admin only)"""
    data = request.get_json()
    status = data.get('status')
    
    if status not in ['active', 'passed', 'failed']:
        return jsonify({'error': 'Invalid status'}), 400
    
    update_data = {'status': status}
    if status in ['passed', 'failed']:
        update_data['completed_at'] = datetime.utcnow()
    
    result = mongo.db.challenges.update_one(
        {'_id': ObjectId(challenge_id)},
        {'$set': update_data}
    )
    
    if result.matched_count == 0:
        return jsonify({'error': 'Challenge not found'}), 404
    
    updated_doc = mongo.db.challenges.find_one({'_id': ObjectId(challenge_id)})
    
    return jsonify({
        'message': 'Challenge status updated',
        'challenge': Challenge(**updated_doc).to_dict()
    }), 200

@bp.route('/payment-config', methods=['GET'])
@jwt_required()
@admin_required
def get_payment_config():
    """Get PayPal configuration (admin only)"""
    config_doc = mongo.db.payment_config.find_one()
    if not config_doc:
        return jsonify({'config': None}), 200
    
    return jsonify({'config': PaymentConfig(**config_doc).to_dict()}), 200

@bp.route('/payment-config', methods=['PUT'])
@jwt_required()
@admin_required
def update_payment_config():
    """Update PayPal configuration (admin only)"""
    data = request.get_json()
    
    update_data = {}
    if 'paypal_client_id' in data: update_data['paypal_client_id'] = data['paypal_client_id']
    if 'paypal_secret' in data: update_data['paypal_secret'] = data['paypal_secret']
    if 'is_live' in data: update_data['is_live'] = data['is_live']
    update_data['updated_at'] = datetime.utcnow()
    
    # Use upsert to create if not exists
    mongo.db.payment_config.update_one(
        {}, # Empty filter to match any (there's only one config)
        {'$set': update_data},
        upsert=True
    )
    
    updated_doc = mongo.db.payment_config.find_one()
    return jsonify({
        'message': 'Payment configuration updated',
        'config': PaymentConfig(**updated_doc).to_dict()
    }), 200

@bp.route('/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_admin_stats():
    """Get platform statistics (admin only)"""
    total_users = mongo.db.users.count_documents({})
    total_challenges = mongo.db.challenges.count_documents({})
    active_challenges = mongo.db.challenges.count_documents({'status': 'active'})
    passed_challenges = mongo.db.challenges.count_documents({'status': 'passed'})
    failed_challenges = mongo.db.challenges.count_documents({'status': 'failed'})
    
    starter_count = mongo.db.challenges.count_documents({'plan_type': 'starter'})
    pro_count = mongo.db.challenges.count_documents({'plan_type': 'pro'})
    elite_count = mongo.db.challenges.count_documents({'plan_type': 'elite'})
    
    return jsonify({
        'users': {'total': total_users},
        'challenges': {
            'total': total_challenges,
            'active': active_challenges,
            'passed': passed_challenges,
            'failed': failed_challenges
        },
        'plans': {
            'starter': starter_count,
            'pro': pro_count,
            'elite': elite_count
        }
    }), 200
