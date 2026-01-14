"""
TradeSense AI - Admin Routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models import User, Challenge, PaymentConfig
from app.extensions import db
from app.utils.decorators import admin_required

bp = Blueprint('admin', __name__)


@bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_all_users():
    """Get all users (admin only)"""
    users = User.query.order_by(User.created_at.desc()).all()
    
    return jsonify({
        'total': len(users),
        'users': [u.to_dict() for u in users]
    }), 200


@bp.route('/challenges', methods=['GET'])
@jwt_required()
@admin_required
def get_all_challenges():
    """Get all challenges (admin only)"""
    challenges = Challenge.query.order_by(Challenge.created_at.desc()).all()
    
    challenge_list = []
    for c in challenges:
        user = User.query.get(c.user_id)
        challenge_data = c.to_dict()
        challenge_data['user_email'] = user.email if user else 'N/A'
        challenge_data['user_name'] = user.full_name if user else 'N/A'
        challenge_list.append(challenge_data)
    
    return jsonify({
        'total': len(challenges),
        'challenges': challenge_list
    }), 200


@bp.route('/challenge/<int:challenge_id>/status', methods=['PUT'])
@jwt_required()
@admin_required
def update_challenge_status(challenge_id):
    """Manually update challenge status (admin only)"""
    data = request.get_json()
    
    if 'status' not in data:
        return jsonify({'error': 'Status required'}), 400
    
    if data['status'] not in ['active', 'passed', 'failed']:
        return jsonify({'error': 'Invalid status'}), 400
    
    challenge = Challenge.query.get(challenge_id)
    
    if not challenge:
        return jsonify({'error': 'Challenge not found'}), 404
    
    old_status = challenge.status
    challenge.status = data['status']
    
    if data['status'] in ['passed', 'failed']:
        from datetime import datetime
        challenge.completed_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'message': 'Challenge status updated',
        'challenge_id': challenge_id,
        'old_status': old_status,
        'new_status': challenge.status,
        'challenge': challenge.to_dict()
    }), 200


@bp.route('/payment-config', methods=['GET'])
@jwt_required()
@admin_required
def get_payment_config():
    """Get PayPal configuration (admin only)"""
    config = PaymentConfig.query.first()
    
    if not config:
        return jsonify({'config': None}), 200
    
    return jsonify({'config': config.to_dict()}), 200


@bp.route('/payment-config', methods=['PUT'])
@jwt_required()
@admin_required
def update_payment_config():
    """Update PayPal configuration (admin only)"""
    data = request.get_json()
    
    config = PaymentConfig.query.first()
    
    if not config:
        config = PaymentConfig()
        db.session.add(config)
    
    if 'paypal_client_id' in data:
        config.paypal_client_id = data['paypal_client_id']
    
    if 'paypal_secret' in data:
        config.paypal_secret = data['paypal_secret']
    
    if 'is_live' in data:
        config.is_live = data['is_live']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Payment configuration updated',
        'config': config.to_dict()
    }), 200


@bp.route('/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_admin_stats():
    """Get platform statistics (admin only)"""
    total_users = User.query.count()
    total_challenges = Challenge.query.count()
    active_challenges = Challenge.query.filter_by(status='active').count()
    passed_challenges = Challenge.query.filter_by(status='passed').count()
    failed_challenges = Challenge.query.filter_by(status='failed').count()
    
    # Count by plan type
    starter_count = Challenge.query.filter_by(plan_type='starter').count()
    pro_count = Challenge.query.filter_by(plan_type='pro').count()
    elite_count = Challenge.query.filter_by(plan_type='elite').count()
    
    return jsonify({
        'users': {
            'total': total_users
        },
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
