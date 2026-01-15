"""
TradeSense AI - Challenge Engine
Core logic for verifying challenge rules and managing trader progress
"""
from datetime import datetime, timedelta
from app.extensions import db
from app.models import Challenge, Trade
from flask import current_app


class ChallengeEngine:
    """Engine to verify and enforce challenge rules"""
    
    @classmethod
    def verify_challenge_rules(cls, challenge_id):
        """
        Verify all rules for a specific challenge
        Returns: dict with {status, reason, action_taken}
        """
        challenge = Challenge.query.get(challenge_id)
        
        if not challenge:
            return {'status': 'error', 'reason': 'Challenge not found'}
        
        # Skip if challenge is already completed
        if challenge.status != 'active':
            return {'status': 'skipped', 'reason': f'Challenge status is {challenge.status}'}
        
        # Get configuration
        max_daily_loss = challenge.max_daily_loss_percent
        max_total_loss = challenge.max_total_loss_percent
        profit_target = challenge.profit_target_percent
        
        # Rule 1: Check Daily Loss (DISABLED for simple challenges, explicitly requested)
        # Only enforce if plan is 'funded' (assuming 'funded' plan exists or simply disable for all for now)
        if challenge.plan_type == 'funded':
             daily_check = cls._check_daily_loss(challenge, max_daily_loss)
             if daily_check['violated']:
                 challenge.status = 'failed'
                 challenge.failure_reason = f'Daily loss limit exceeded ({daily_check["loss_percent"]:.2f}%)'
                 challenge.completed_at = datetime.utcnow()
                 db.session.commit()
                 return {
                     'status': 'failed',
                     'reason': f'Daily loss limit exceeded ({daily_check["loss_percent"]:.2f}%)',
                     'action_taken': 'Challenge marked as FAILED (Funded Account)'
                 }
        
        # Rule 2: Check Total Loss
        total_loss_check = cls._check_total_loss(challenge, max_total_loss)
        
        # Stricter Enforcement (User Request):
        # Fail if equity hits ZERO (Blown) OR if total loss limit is exceeded
        is_blown = challenge.current_equity <= 1.0
        limit_violated = total_loss_check['violated']
        
        # Enforce for all paid plans. Free plan is more lenient but still fails if blown.
        should_fail_total = limit_violated if challenge.plan_type != 'free' else is_blown
        
        if should_fail_total:
            challenge.status = 'failed'
            
            reason = f'Account blown' if is_blown else f'Total loss limit exceeded ({total_loss_check["loss_percent"]:.2f}%)'
            if challenge.plan_type != 'free' and not is_blown:
                reason += f" (Limit: {max_total_loss}%)"
            
            challenge.failure_reason = reason
            challenge.completed_at = datetime.utcnow()
            db.session.commit()
            
            return {
                'status': 'failed',
                'reason': reason,
                'action_taken': 'Challenge marked as FAILED - New subscription required'
            }
        
        # Rule 3: Check Profit Target
        profit_check = cls._check_profit_target(challenge, profit_target)
        if profit_check['achieved']:
            challenge.status = 'passed'
            challenge.completed_at = datetime.utcnow()
            db.session.commit()
            return {
                'status': 'passed',
                'reason': f'Profit target achieved ({profit_check["profit_percent"]:.2f}%)',
                'action_taken': 'Challenge marked as PASSED - Funded!'
            }
        
        return {
            'status': 'active',
            'reason': 'All rules passed, challenge still active',
            'current_equity': challenge.current_equity,
            'profit_percent': challenge.calculate_profit_percent()
        }
    
    @classmethod
    def _check_daily_loss(cls, challenge, max_daily_loss_percent):
        """Check if daily loss limit is violated"""
        # Get today's start time (00:00:00)
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Get equity at start of day (from yesterday's last trade or initial)
        yesterday_end = today_start - timedelta(seconds=1)
        
        last_trade_yesterday = Trade.query.filter(
            Trade.challenge_id == challenge.id,
            Trade.timestamp <= yesterday_end
        ).order_by(Trade.timestamp.desc()).first()
        
        if last_trade_yesterday:
            # Calculate equity after that trade
            start_of_day_equity = cls._calculate_equity_at_trade(challenge, last_trade_yesterday.id)
        else:
            # No trades yesterday, use initial balance
            start_of_day_equity = challenge.initial_balance
        
        # BROKERAGE FIX: current_equity is now CASH. 
        # We need NLV (Cash + Market Value) for rules.
        current_nlv = cls._calculate_current_nlv(challenge)
        
        if start_of_day_equity == 0:
            return {'violated': False, 'loss_percent': 0}
        
        daily_loss_percent = ((start_of_day_equity - current_nlv) / start_of_day_equity) * 100
        
        return {
            'violated': daily_loss_percent > max_daily_loss_percent,
            'loss_percent': daily_loss_percent,
            'start_of_day_equity': start_of_day_equity,
            'current_equity': current_nlv # Use NLV for rules
        }
    
    @classmethod
    def _check_total_loss(cls, challenge, max_total_loss_percent):
        """Check if total loss limit is violated"""
        initial = challenge.initial_balance
        current_nlv = cls._calculate_current_nlv(challenge)
        
        if initial == 0:
            return {'violated': False, 'loss_percent': 0}
        
        total_loss_percent = ((initial - current_nlv) / initial) * 100
        
        return {
            'violated': total_loss_percent > max_total_loss_percent,
            'loss_percent': total_loss_percent,
            'initial_balance': initial,
            'current_equity': current_nlv
        }
    
    @classmethod
    def _check_profit_target(cls, challenge, profit_target_percent):
        """Check if profit target is achieved"""
        profit_percent = challenge.calculate_profit_percent()
        
        return {
            'achieved': profit_percent >= profit_target_percent,
            'profit_percent': profit_percent,
            'target': profit_target_percent
        }
    
    @classmethod
    def _calculate_equity_at_trade(cls, challenge, trade_id):
        """Calculate equity after a specific trade"""
        # Get all trades up to and including this trade
        trades = Trade.query.filter(
            Trade.challenge_id == challenge.id,
            Trade.id <= trade_id
        ).order_by(Trade.timestamp.asc()).all()
        
        equity = challenge.initial_balance
        for trade in trades:
            equity += trade.profit_loss
        
        return equity
    
    @classmethod
    def _calculate_current_nlv(cls, challenge):
        """Calculate Net Liquidation Value (Cash + Floating P/L of Open Orders)"""
        cash = challenge.current_equity
        
        # Get all independent open orders
        open_trades = Trade.query.filter_by(challenge_id=challenge.id, is_open=True).all()
            
        floating_pl = 0
        from app.services.market_data import MarketDataService
        for t in open_trades:
            price_data = MarketDataService.get_realtime_price(t.symbol)
            if price_data:
                current_price = price_data['price']
                # Long: (Current - Entry) * Qty | Short: (Entry - Current) * Qty
                if t.action == 'buy':
                    floating_pl += (current_price - t.price) * t.quantity
                else:
                    floating_pl += (t.price - current_price) * t.quantity
                    
        return cash + floating_pl

    @classmethod
    def recalculate_challenge_equity(cls, challenge_id):
        # ... logic to sync cash from trades if needed ...
        return None


def verify_all_active_challenges():
    """
    Background task to verify all active challenges
    This function is called periodically by the scheduler
    """
    from app import create_app
    app = create_app()
    
    with app.app_context():
        print(f"[{datetime.utcnow()}] Running challenge verification...")
        
        try:
            active_challenges = Challenge.query.filter_by(status='active').all()
        except Exception as e:
            print(f"  ⚠️  Error fetching active challenges: {str(e)}")
            return {'status': 'error', 'message': str(e)}
            
        results = {
            'verified': 0,
            'failed': 0,
            'passed': 0,
            'errors': 0
        }
        
        for challenge in active_challenges:
            try:
                result = ChallengeEngine.verify_challenge_rules(challenge.id)
                results['verified'] += 1
                
                if result['status'] == 'failed':
                    results['failed'] += 1
                    print(f"  ❌ Challenge {challenge.id} FAILED: {result['reason']}")
                elif result['status'] == 'passed':
                    results['passed'] += 1
                    print(f"  ✅ Challenge {challenge.id} PASSED: {result['reason']}")
                
            except Exception as e:
                results['errors'] += 1
                print(f"  ⚠️  Error verifying challenge {challenge.id}: {str(e)}")
        
        print(f"  Verified: {results['verified']}, Failed: {results['failed']}, Passed: {results['passed']}, Errors: {results['errors']}")
        
        return results
