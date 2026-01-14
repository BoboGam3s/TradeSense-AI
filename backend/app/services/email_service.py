"""
TradeSense AI - Email Service
Handles email sending for verification, password reset, etc.
NO SMTP REQUIRED - Emails are printed to console for development
"""
import secrets
from datetime import datetime, timedelta
from flask import current_app


class EmailService:
    """Email service for development (console-based, no SMTP needed)"""
    
    @staticmethod
    def generate_token():
        """Generate a secure random token"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def send_email_to_console(to, subject, verification_url=None, reset_url=None):
        """
        Print email to console instead of sending via SMTP
        Perfect for development - no email service needed!
        """
        print("\n" + "="*80)
        print("📧 EMAIL (Development Mode - No SMTP Required)")
        print("="*80)
        print(f"To: {to}")
        print(f"Subject: {subject}")
        print("-"*80)
        
        if verification_url:
            print(f"\n🔗 VERIFICATION LINK:")
            print(f"{verification_url}")
            print(f"\n📋 Copy this link and paste it in your browser to verify your email.")
        
        if reset_url:
            print(f"\n🔗 PASSWORD RESET LINK:")
            print(f"{reset_url}")
            print(f"\n📋 Copy this link and paste it in your browser to reset your password.")
        
        print("\n" + "="*80 + "\n")
        return True
    
    @staticmethod
    def send_verification_email(user, verification_url):
        """Send email verification email (console mode)"""
        subject = f"✅ Vérifiez votre email - TradeSense AI"
        
        print(f"\n👤 User: {user.full_name}")
        print(f"📧 Email: {user.email}")
        
        return EmailService.send_email_to_console(
            to=user.email,
            subject=subject,
            verification_url=verification_url
        )
    
    @staticmethod
    def send_password_reset_email(user, reset_url):
        """Send password reset email (console mode)"""
        subject = f"🔒 Réinitialisation de mot de passe - TradeSense AI"
        
        print(f"\n👤 User: {user.full_name}")
        print(f"📧 Email: {user.email}")
        
        return EmailService.send_email_to_console(
            to=user.email,
            subject=subject,
            reset_url=reset_url
        )
