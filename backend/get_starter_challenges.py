"""
Script to retrieve detailed data for STARTER challenges
Specifically for moughitbusines@gmail.com account
Shows trades and equity progression for $5000 starter challenges
"""
import sqlite3
import json
from datetime import datetime

DB_PATH = 'instance/tradesense.db'

def get_starter_challenges(email):
    """Retrieve all STARTER plan challenges with detailed trade history"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get user
    cursor.execute('SELECT id, full_name, email FROM users WHERE email = ?', (email,))
    user_row = cursor.fetchone()
    
    if not user_row:
        print(f"❌ User not found: {email}")
        conn.close()
        return None
    
    user_id, full_name, email = user_row
    
    print("=" * 80)
    print(f"📊 STARTER CHALLENGES REPORT FOR: {full_name} ({email})")
    print("=" * 80)
    
    # Get all STARTER challenges
    cursor.execute('''
        SELECT * FROM challenges 
        WHERE user_id = ? AND plan_type = 'starter'
        ORDER BY created_at ASC
    ''', (user_id,))
    challenges = cursor.fetchall()
    
    cursor.execute('PRAGMA table_info(challenges)')
    challenge_columns = [col[1] for col in cursor.fetchall()]
    
    print(f"\n🎯 Found {len(challenges)} STARTER challenge(s) with $5,000 initial balance\n")
    
    all_data = []
    total_profit_all = 0
    
    for idx, challenge_row in enumerate(challenges, 1):
        challenge = dict(zip(challenge_columns, challenge_row))
        
        # Only process challenges with $5000 initial balance
        if challenge['initial_balance'] != 5000.0:
            continue
            
        profit = challenge['current_equity'] - challenge['initial_balance']
        profit_percent = (profit / challenge['initial_balance']) * 100
        total_profit_all += profit
        
        print(f"\n{'='*80}")
        print(f"CHALLENGE #{idx} - ID: {challenge['id']}")
        print(f"{'='*80}")
        print(f"Status: {challenge['status'].upper()}")
        print(f"Initial Balance: ${challenge['initial_balance']:,.2f}")
        print(f"Final Equity: ${challenge['current_equity']:,.2f}")
        print(f"Profit/Loss: ${profit:,.2f} ({profit_percent:+.2f}%)")
        print(f"Started: {challenge['created_at']}")
        print(f"Completed: {challenge['completed_at'] or 'Active'}")
        print(f"\n{'─'*80}")
        print(f"TRADE HISTORY:")
        print(f"{'─'*80}")
        
        # Get all trades for this challenge
        cursor.execute('''
            SELECT * FROM trades 
            WHERE challenge_id = ?
            ORDER BY timestamp ASC
        ''', (challenge['id'],))
        trades = cursor.fetchall()
        
        cursor.execute('PRAGMA table_info(trades)')
        trade_columns = [col[1] for col in cursor.fetchall()]
        
        trades_list = []
        running_equity = challenge['initial_balance']
        
        print(f"\n{'Date/Time':<20} {'Symbol':<12} {'Action':<6} {'Qty':<8} {'Price':<12} {'P/L':<12} {'Equity':<12}")
        print("─" * 100)
        
        for trade_row in trades:
            trade = dict(zip(trade_columns, trade_row))
            running_equity += trade['profit_loss']
            
            trades_list.append(trade)
            
            # Format the trade line
            timestamp = trade['timestamp'][:19] if len(trade['timestamp']) > 19 else trade['timestamp']
            symbol = trade['symbol']
            action = trade['action'].upper()
            qty = f"{trade['quantity']:.2f}"
            price = f"${trade['price']:,.2f}"
            pl = f"${trade['profit_loss']:+,.2f}"
            equity = f"${running_equity:,.2f}"
            
            # Color code for terminal (won't show in file but good for display)
            action_display = f"{'BUY' if action == 'BUY' else 'SELL':<6}"
            
            print(f"{timestamp:<20} {symbol:<12} {action_display} {qty:<8} {price:<12} {pl:<12} {equity:<12}")
        
        print(f"\n{'─'*80}")
        print(f"Total Trades: {len(trades)}")
        print(f"Final Equity: ${challenge['current_equity']:,.2f}")
        print(f"{'='*80}\n")
        
        all_data.append({
            'challenge': challenge,
            'trades': trades_list,
            'profit': profit,
            'profit_percent': profit_percent
        })
    
    print("\n" + "=" * 80)
    print("📈 OVERALL SUMMARY - STARTER CHALLENGES")
    print("=" * 80)
    print(f"Total Starter Challenges: {len(all_data)}")
    total_trades = sum(len(c['trades']) for c in all_data)
    print(f"Total Trades Across All Starter Challenges: {total_trades}")
    print(f"Total Profit/Loss (All Starter Challenges): ${total_profit_all:,.2f}")
    
    # Calculate average performance
    passed_challenges = [c for c in all_data if c['challenge']['status'] == 'passed']
    failed_challenges = [c for c in all_data if c['challenge']['status'] == 'failed']
    
    print(f"\nPassed Challenges: {len(passed_challenges)}")
    print(f"Failed Challenges: {len(failed_challenges)}")
    
    if passed_challenges:
        avg_profit_passed = sum(c['profit'] for c in passed_challenges) / len(passed_challenges)
        print(f"Average Profit (Passed): ${avg_profit_passed:,.2f}")
    
    print("=" * 80)
    
    # Save detailed report
    report = {
        'user': {
            'id': user_id,
            'full_name': full_name,
            'email': email
        },
        'starter_challenges': all_data,
        'summary': {
            'total_challenges': len(all_data),
            'total_trades': total_trades,
            'total_profit': total_profit_all,
            'passed_count': len(passed_challenges),
            'failed_count': len(failed_challenges)
        },
        'generated_at': datetime.now().isoformat()
    }
    
    filename = f'starter_challenges_report_{email.replace("@", "_")}.json'
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, default=str)
    
    print(f"\n✅ Detailed starter challenges report saved to: {filename}")
    
    conn.close()
    return report

if __name__ == '__main__':
    get_starter_challenges('moughitbusines@gmail.com')
