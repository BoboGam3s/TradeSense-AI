"""
TradeSense AI - Challenge Engine (MongoDB Version)
Core logic for verifying challenge rules and managing trader progress
"""
from datetime import datetime, timedelta
from app.extensions import mongo
from app.models import Challenge, Trade
from bson import ObjectId
from flask import current_app

class ChallengeEngine:
    """Engine to verify and enforce challenge rules"""
    
    @classmethod
    def verify_challenge_rules(cls, challenge_id):
        """
        Verify all rules for a specific challenge
        """
        challenge_doc = mongo.db.challenges.find_one({'_id': ObjectId(challenge_id)})
        
        if not challenge_doc:
            return {'status': 'error', 'reason': 'Challenge not found'}
        
        challenge = Challenge(**challenge_doc)
        
        if challenge.status != 'active':
            return {'status': 'skipped', 'reason': f'Challenge status is {challenge.status}'}
        
        max_daily_loss = challenge.max_daily_loss_percent
        max_total_loss = challenge.max_total_loss_percent
        profit_target = challenge.profit_target_percent
        
        # Rule 1: Check Daily Loss (Funded only)
        if challenge.plan_type == 'funded':
             daily_check = cls._check_daily_loss(challenge, max_daily_loss)
             if daily_check['violated']:
                 cls._mark_failed(challenge.id, f'Daily loss limit exceeded ({daily_check["loss_percent"]:.2f}%)')
                 return {
                     'status': 'failed',
                     'reason': f'Daily loss limit exceeded ({daily_check["loss_percent"]:.2f}%)'
                 }
        
        # Rule 2: Check Total Loss
        total_loss_check = cls._check_total_loss(challenge, max_total_loss)
        is_blown = challenge.current_equity <= 1.0
        limit_violated = total_loss_check['violated']
        
        should_fail_total = limit_violated if challenge.plan_type != 'free' else is_blown
        
        if should_fail_total:
            reason = f'Account blown' if is_blown else f'Total loss limit exceeded ({total_loss_check["loss_percent"]:.2f}%)'
            cls._mark_failed(challenge.id, reason)
            return {'status': 'failed', 'reason': reason}
        
        # Rule 3: Check Profit Target
        profit_check = cls._check_profit_target(challenge, profit_target)
        if profit_check['achieved']:
            cls._mark_passed(challenge.id, f'Profit target achieved ({profit_check["profit_percent"]:.2f}%)')
            return {'status': 'passed', 'reason': f'Profit target achieved'}
        
        return {
            'status': 'active',
            'current_equity': challenge.current_equity
        }

    @classmethod
    def _mark_failed(cls, challenge_id, reason):
        mongo.db.challenges.update_one(
            {'_id': ObjectId(challenge_id)},
            {'$set': {
                'status': 'failed',
                'failure_reason': reason,
                'completed_at': datetime.utcnow()
            }}
        )

    @classmethod
    def _mark_passed(cls, challenge_id, reason):
        mongo.db.challenges.update_one(
            {'_id': ObjectId(challenge_id)},
            {'$set': {
                'status': 'passed',
                'completed_at': datetime.utcnow()
            }}
        )

    @classmethod
    def _check_daily_loss(cls, challenge, max_daily_loss_percent):
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        yesterday_end = today_start - timedelta(seconds=1)
        
        last_trade_yesterday = mongo.db.trades.find_one(
            {'challenge_id': challenge.id, 'timestamp': {'$lte': yesterday_end}},
            sort=[('timestamp', -1)]
        )
        
        if last_trade_yesterday:
            start_of_day_equity = cls._calculate_equity_at_trade(challenge, last_trade_yesterday['_id'])
        else:
            start_of_day_equity = challenge.initial_balance
        
        current_nlv = cls._calculate_current_nlv(challenge)
        
        if start_of_day_equity <= 0:
            return {'violated': False, 'loss_percent': 0}
        
        daily_loss_percent = ((start_of_day_equity - current_nlv) / start_of_day_equity) * 100
        return {
            'violated': daily_loss_percent > max_daily_loss_percent,
            'loss_percent': daily_loss_percent
        }

    @classmethod
    def _check_total_loss(cls, challenge, max_total_loss_percent):
        initial = challenge.initial_balance
        current_nlv = cls._calculate_current_nlv(challenge)
        if initial <= 0: return {'violated': False, 'loss_percent': 0}
        total_loss_percent = ((initial - current_nlv) / initial) * 100
        return {
            'violated': total_loss_percent > max_total_loss_percent,
            'loss_percent': total_loss_percent
        }

    @classmethod
    def _check_profit_target(cls, challenge, profit_target_percent):
        profit_percent = challenge.calculate_profit_percent()
        return {
            'achieved': profit_percent >= profit_target_percent,
            'profit_percent': profit_percent
        }

    @classmethod
    def _calculate_equity_at_trade(cls, challenge, trade_oid):
        # In Mongo, we can compare ObjectIds for temporal order if they are created sequentially,
        # but better to use timestamp or a sequence if available.
        # Here we'll use timestamp of the target trade.
        target_trade = mongo.db.trades.find_one({'_id': ObjectId(trade_oid)})
        if not target_trade: return challenge.initial_balance
        
        trades_cursor = mongo.db.trades.find({
            'challenge_id': challenge.id,
            'timestamp': {'$lte': target_trade['timestamp']}
        })
        
        equity = challenge.initial_balance
        for t in trades_cursor:
            equity += t.get('profit_loss', 0)
        return equity

    @classmethod
    def _calculate_current_nlv(cls, challenge):
        cash = challenge.current_equity
        open_trades_cursor = mongo.db.trades.find({'challenge_id': challenge.id, 'is_open': True})
        
        floating_pl = 0
        from app.services.market_data import MarketDataService
        for t_doc in open_trades_cursor:
            price_data = MarketDataService.get_realtime_price(t_doc['symbol'])
            if price_data:
                curr_p = price_data['price']
                if t_doc['action'] == 'buy':
                    floating_pl += (curr_p - t_doc['price']) * t_doc['quantity']
                else:
                    floating_pl += (t_doc['price'] - curr_p) * t_doc['quantity']
        return cash + floating_pl


def verify_all_active_challenges():
    """Background task for all active challenges"""
    from app import create_app
    app = create_app()
    with app.app_context():
        active_cursor = mongo.db.challenges.find({'status': 'active'})
        for challenge_doc in active_cursor:
            try:
                ChallengeEngine.verify_challenge_rules(str(challenge_doc['_id']))
            except Exception as e:
                print(f"Error verifying {challenge_doc['_id']}: {e}")
