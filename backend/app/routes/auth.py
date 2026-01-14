"""
TradeSense AI - Authentication Routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import User, Challenge
from app.extensions import db
from flask import current_app

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
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    # Create new user with free plan
    user = User(
        email=data['email'],
        full_name=data['full_name'],
        language=data.get('language', 'fr'),
        plan_type='free'  # Auto-assign free plan
    )
    user.set_password(data['password'])
    
    # Generate verification token
    from datetime import datetime, timedelta
    from app.services.email_service import EmailService
    user.verification_token = EmailService.generate_token()
    user.verification_token_expires = datetime.utcnow() + timedelta(hours=24)
    
    db.session.add(user)
    db.session.flush()  # Get user ID before creating challenge
    
    # Auto-create a free challenge for new users
    free_challenge = Challenge(
        user_id=user.id,
        plan_type='free',
        initial_balance=500,  # Free plan has 500$ capital
        current_equity=500,
        status='active',
        max_daily_loss_percent=5,
        max_total_loss_percent=10,
        profit_target_percent=5  # 5% profit target for free plan
    )
    
    db.session.add(free_challenge)
    db.session.commit()
    
    # Send verification email (optional - doesn't block registration)
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
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
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
    from flask import current_app
    import logging
    
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    user.has_completed_onboarding = True
    db.session.commit()
    
    return jsonify({
        'message': 'Onboarding completed',
        'user': user.to_dict()
    }), 200


@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user profile"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'user': user.to_dict()}), 200


@bp.route('/me', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    # Update allowed fields
    if 'full_name' in data:
        user.full_name = data['full_name']
    if 'phone' in data:
        user.phone = data['phone']
    if 'bio' in data:
        user.bio = data['bio']
    if 'avatar_url' in data:
        user.avatar_url = data['avatar_url']
    if 'language' in data:
        user.language = data['language']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict()
    }), 200


@bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    """Change user password"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    if not data.get('current_password') or not data.get('new_password'):
        return jsonify({'error': 'Current and new password required'}), 400
    
    # Verify current password
    if not user.check_password(data['current_password']):
        return jsonify({'error': 'Current password incorrect'}), 401
    
    # Update password
    user.set_password(data['new_password'])
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'}), 200


@bp.route('/stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    """Get user statistics"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Calculate stats from challenges
    total_challenges = Challenge.query.filter_by(user_id=user_id).count()
    passed_challenges = Challenge.query.filter_by(user_id=user_id, status='passed').count()
    failed_challenges = Challenge.query.filter_by(user_id=user_id, status='failed').count()
    active_challenges = Challenge.query.filter_by(user_id=user_id, status='active').count()
    
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
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    if 'progress' not in data:
        return jsonify({'error': 'Progress data required'}), 400
        
    user.academy_progress = data['progress']
    db.session.commit()
    
    return jsonify({
        'message': 'Academy progress updated successfully',
        'progress': user.academy_progress
    }), 200


@bp.route('/verify-email', methods=['POST'])
def verify_email():
    """Verify user email with token"""
    data = request.get_json()
    
    if not data.get('token'):
        return jsonify({'error': 'Verification token required'}), 400
    
    user = User.query.filter_by(verification_token=data['token']).first()
    
    if not user:
        return jsonify({'error': 'Invalid verification token'}), 404
    
    # Check if token is expired
    from datetime import datetime
    if user.verification_token_expires and user.verification_token_expires < datetime.utcnow():
        return jsonify({'error': 'Verification token expired'}), 400
    
    # Verify user
    user.email_verified = True
    user.verification_token = None
    user.verification_token_expires = None
    db.session.commit()
    
    return jsonify({'message': 'Email verified successfully'}), 200


@bp.route('/resend-verification', methods=['POST'])
@jwt_required()
def resend_verification():
    """Resend verification email"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.email_verified:
        return jsonify({'message': 'Email already verified'}), 200
    
    # Generate new token
    from datetime import datetime, timedelta
    from app.services.email_service import EmailService
    user.verification_token = EmailService.generate_token()
    user.verification_token_expires = datetime.utcnow() + timedelta(hours=24)
    db.session.commit()
    
    # Send email
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
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user:
        # Don't reveal if email exists or not (security best practice)
        return jsonify({'message': 'If that email exists, a password reset link has been sent'}), 200
    
    # Generate reset token
    from datetime import datetime, timedelta
    from app.services.email_service import EmailService
    user.reset_token = EmailService.generate_token()
    user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)  # 1 hour expiry
    db.session.commit()
    
    # Send reset email (console mode)
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
    
    # Find user with this reset token
    user = User.query.filter_by(reset_token=data['token']).first()
    
    if not user:
        return jsonify({'error': 'Invalid or expired reset token'}), 404
    
    # Check if token is expired
    from datetime import datetime
    if user.reset_token_expires and user.reset_token_expires < datetime.utcnow():
        return jsonify({'error': 'Reset token expired'}), 400
    
    # Validate password length
    if len(data['new_password']) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    # Reset password
    user.set_password(data['new_password'])
    user.reset_token = None
    user.reset_token_expires = None
    db.session.commit()
    
    return jsonify({'message': 'Password reset successfully'}), 200
