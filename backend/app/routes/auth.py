"""
TradeSense AI - Authentication Routes (MongoDB Version)
"""
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import User, Challenge
from app.extensions import mongo
from bson import ObjectId
from datetime import datetime, timedelta

bp = Blueprint('auth', __name__)


@bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    # Validation
    required_fields = ['email', 'password', 'full_name']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Check if user exists
    if mongo.db.users.find_one({'email': data['email']}):
        return jsonify({'error': 'Email already registered'}), 409
    
    # Create new user with free plan
    user = User(
        email=data['email'],
        full_name=data['full_name'],
        language=data.get('language', 'fr'),
        plan_type='free'
    )
    user.set_password(data['password'])
    
    # Generate verification token
    from app.services.email_service import EmailService
    user.verification_token = EmailService.generate_token()
    user.verification_token_expires = datetime.utcnow() + timedelta(hours=24)
    
    # Insert user to get ID
    user_data = user.to_dict_for_db()
    result = mongo.db.users.insert_one(user_data)
    user.id = str(result.inserted_id)
    
    # Auto-create a free challenge for new users
    free_challenge = Challenge(
        user_id=user.id,
        plan_type='free',
        initial_balance=500,
        current_equity=500,
        status='active',
        max_daily_loss_percent=5,
        max_total_loss_percent=10,
        profit_target_percent=5
    )
    
    mongo.db.challenges.insert_one(free_challenge.to_dict())
    
    # Send verification email
    try:
        verification_url = f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/verify-email?token={user.verification_token}"
        EmailService.send_verification_email(user, verification_url)
    except Exception as e:
        print(f"Failed to send verification email: {str(e)}")
    
    # Create access token
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'message': 'User created successfully. Please check your email to verify your account.',
        'user': user.to_dict(),
        'access_token': access_token,
        'challenge': free_challenge.to_dict()
    }), 201


@bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
    
    user_doc = mongo.db.users.find_one({'email': data['email']})
    if not user_doc:
        return jsonify({'error': 'Invalid email or password'}), 401
    
    user = User(**user_doc)
    if not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'access_token': access_token
    }), 200


@bp.route('/complete-onboarding', methods=['POST'])
@jwt_required()
def complete_onboarding():
    """Mark onboarding as completed for the current user"""
    current_user_id = get_jwt_identity()
    mongo.db.users.update_one(
        {'_id': ObjectId(current_user_id)},
        {'$set': {'has_completed_onboarding': True}}
    )
    
    user_doc = mongo.db.users.find_one({'_id': ObjectId(current_user_id)})
    user = User(**user_doc)
    
    return jsonify({
        'message': 'Onboarding completed',
        'user': user.to_dict()
    }), 200


@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user profile"""
    user_id = get_jwt_identity()
    user_doc = mongo.db.users.find_one({'_id': ObjectId(user_id)})
    
    if not user_doc:
        return jsonify({'error': 'User not found'}), 404
    
    user = User(**user_doc)
    return jsonify({'user': user.to_dict()}), 200


@bp.route('/me', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    update_data = {}
    allowed_fields = ['full_name', 'phone', 'bio', 'avatar_url', 'language']
    for field in allowed_fields:
        if field in data:
            update_data[field] = data[field]
    
    if not update_data:
        return jsonify({'error': 'No fields to update'}), 400

    result = mongo.db.users.update_one(
        {'_id': ObjectId(user_id)},
        {'$set': update_data}
    )
    
    if result.matched_count == 0:
        return jsonify({'error': 'User not found'}), 404
    
    user_doc = mongo.db.users.find_one({'_id': ObjectId(user_id)})
    user = User(**user_doc)
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict()
    }), 200


@bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    """Change user password"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('current_password') or not data.get('new_password'):
        return jsonify({'error': 'Current and new password required'}), 400
    
    user_doc = mongo.db.users.find_one({'_id': ObjectId(user_id)})
    if not user_doc:
        return jsonify({'error': 'User not found'}), 404
    
    user = User(**user_doc)
    if not user.check_password(data['current_password']):
        return jsonify({'error': 'Current password incorrect'}), 401
    
    user.set_password(data['new_password'])
    mongo.db.users.update_one(
        {'_id': ObjectId(user_id)},
        {'$set': {'password_hash': user.password_hash}}
    )
    
    return jsonify({'message': 'Password changed successfully'}), 200


@bp.route('/stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    """Get user statistics"""
    user_id = get_jwt_identity()
    
    total_challenges = mongo.db.challenges.count_documents({'user_id': user_id})
    passed_challenges = mongo.db.challenges.count_documents({'user_id': user_id, 'status': 'passed'})
    failed_challenges = mongo.db.challenges.count_documents({'user_id': user_id, 'status': 'failed'})
    active_challenges = mongo.db.challenges.count_documents({'user_id': user_id, 'status': 'active'})
    
    success_rate = (passed_challenges / total_challenges * 100) if total_challenges > 0 else 0
    
    return jsonify({
        'stats': {
            'total_challenges': total_challenges,
            'passed_challenges': passed_challenges,
            'failed_challenges': failed_challenges,
            'active_challenges': active_challenges,
            'success_rate': round(success_rate, 2)
        }
    }), 200


@bp.route('/academy-progress', methods=['PUT'])
@jwt_required()
def update_academy_progress():
    """Update user academy progression"""
    user_id = get_jwt_identity()
    data = request.get_json()
    if 'progress' not in data:
        return jsonify({'error': 'Progress data required'}), 400
        
    mongo.db.users.update_one(
        {'_id': ObjectId(user_id)},
        {'$set': {'academy_progress': data['progress']}}
    )
    
    return jsonify({
        'message': 'Academy progress updated successfully'
    }), 200


@bp.route('/verify-email', methods=['POST'])
def verify_email():
    """Verify user email with token"""
    data = request.get_json()
    if not data.get('token'):
        return jsonify({'error': 'Verification token required'}), 400
    
    user_doc = mongo.db.users.find_one({'verification_token': data['token']})
    if not user_doc:
        return jsonify({'error': 'Invalid verification token'}), 404
    
    user = User(**user_doc)
    if user.verification_token_expires and user.verification_token_expires < datetime.utcnow():
        return jsonify({'error': 'Verification token expired'}), 400
    
    mongo.db.users.update_one(
        {'_id': ObjectId(user.id)},
        {'$set': {
            'email_verified': True,
            'verification_token': None,
            'verification_token_expires': None
        }}
    )
    
    return jsonify({'message': 'Email verified successfully'}), 200


@bp.route('/resend-verification', methods=['POST'])
@jwt_required()
def resend_verification():
    """Resend verification email"""
    user_id = get_jwt_identity()
    user_doc = mongo.db.users.find_one({'_id': ObjectId(user_id)})
    
    if not user_doc:
        return jsonify({'error': 'User not found'}), 404
    
    user = User(**user_doc)
    if user.email_verified:
        return jsonify({'message': 'Email already verified'}), 200
    
    from app.services.email_service import EmailService
    user.verification_token = EmailService.generate_token()
    user.verification_token_expires = datetime.utcnow() + timedelta(hours=24)
    
    mongo.db.users.update_one(
        {'_id': ObjectId(user_id)},
        {'$set': {
            'verification_token': user.verification_token,
            'verification_token_expires': user.verification_token_expires
        }}
    )
    
    try:
        verification_url = f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/verify-email?token={user.verification_token}"
        EmailService.send_verification_email(user, verification_url)
        return jsonify({'message': 'Verification email sent'}), 200
    except Exception as e:
        print(f"Failed to send verification email: {str(e)}")
        return jsonify({'error': 'Failed to send email'}), 500


@bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Request password reset"""
    data = request.get_json()
    if not data.get('email'):
        return jsonify({'error': 'Email required'}), 400
    
    user_doc = mongo.db.users.find_one({'email': data['email']})
    if not user_doc:
        return jsonify({'message': 'If that email exists, a password reset link has been sent'}), 200
    
    user = User(**user_doc)
    from app.services.email_service import EmailService
    user.reset_token = EmailService.generate_token()
    user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
    
    mongo.db.users.update_one(
        {'_id': ObjectId(user.id)},
        {'$set': {
            'reset_token': user.reset_token,
            'reset_token_expires': user.reset_token_expires
        }}
    )
    
    try:
        reset_url = f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token={user.reset_token}"
        EmailService.send_password_reset_email(user, reset_url)
    except Exception as e:
        print(f"Failed to send password reset email: {str(e)}")
    
    return jsonify({'message': 'If that email exists, a password reset link has been sent'}), 200


@bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password with token"""
    data = request.get_json()
    if not data.get('token') or not data.get('new_password'):
        return jsonify({'error': 'Token and new password required'}), 400
    
    user_doc = mongo.db.users.find_one({'reset_token': data['token']})
    if not user_doc:
        return jsonify({'error': 'Invalid or expired reset token'}), 404
    
    user = User(**user_doc)
    if user.reset_token_expires and user.reset_token_expires < datetime.utcnow():
        return jsonify({'error': 'Reset token expired'}), 400
    
    if len(data['new_password']) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    user.set_password(data['new_password'])
    mongo.db.users.update_one(
        {'_id': ObjectId(user.id)},
        {'$set': {
            'password_hash': user.password_hash,
            'reset_token': None,
            'reset_token_expires': None
        }}
    )
    
    return jsonify({'message': 'Password reset successfully'}), 200
