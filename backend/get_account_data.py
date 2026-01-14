"""
Script to retrieve trading data for account moughitbusines@gmail.com
"""
import sqlite3
import json
from datetime import datetime

DB_PATH = 'instance/tradesense.db'

def get_account_data(email):
    """Retrieve all account data for the specified email"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get user data
    cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
    user_row = cursor.fetchone()
    
    if not user_row:
        print(f"❌ User not found: {email}")
        conn.close()
        return None
    
    # Get column names
    cursor.execute('PRAGMA table_info(users)')
    user_columns = [col[1] for col in cursor.fetchall()]
    
    user_data = dict(zip(user_columns, user_row))
    user_id = user_data['id']
    
    print("=" * 80)
    print(f"📊 ACCOUNT DATA FOR: {email}")
    print("=" * 80)
    print(f"\n👤 USER INFORMATION:")
    print(f"  ID: {user_data['id']}")
    print(f"  Full Name: {user_data['full_name']}")
    print(f"  Email: {user_data['email']}")
    print(f"  Phone: {user_data['phone']}")
    print(f"  Plan Type: {user_data['plan_type']}")
    print(f"  Role: {user_data['role']}")
    print(f"  Created At: {user_data['created_at']}")
    
    # Get challenges
    cursor.execute('SELECT * FROM challenges WHERE user_id = ?', (user_id,))
    challenges = cursor.fetchall()
    
    cursor.execute('PRAGMA table_info(challenges)')
    challenge_columns = [col[1] for col in cursor.fetchall()]
    
    print(f"\n💰 CHALLENGES: {len(challenges)} found")
    print("-" * 80)
    
    total_profit = 0
    all_trades = []
    
    for idx, challenge_row in enumerate(challenges, 1):
        challenge = dict(zip(challenge_columns, challenge_row))
        profit = challenge['current_equity'] - challenge['initial_balance']
        profit_percent = (profit / challenge['initial_balance']) * 100 if challenge['initial_balance'] > 0 else 0
        total_profit += profit
        
        print(f"\nChallenge #{idx}:")
        print(f"  Challenge ID: {challenge['id']}")
        print(f"  Plan Type: {challenge['plan_type']}")
        print(f"  Status: {challenge['status']}")
        print(f"  Initial Balance: ${challenge['initial_balance']:,.2f}")
        print(f"  Current Equity: ${challenge['current_equity']:,.2f}")
        print(f"  Profit/Loss: ${profit:,.2f} ({profit_percent:+.2f}%)")
        print(f"  Created: {challenge['created_at']}")
        if challenge['completed_at']:
            print(f"  Completed: {challenge['completed_at']}")
        
        # Get trades for this challenge
        cursor.execute('SELECT * FROM trades WHERE challenge_id = ?', (challenge['id'],))
        trades = cursor.fetchall()
        
        cursor.execute('PRAGMA table_info(trades)')
        trade_columns = [col[1] for col in cursor.fetchall()]
        
        print(f"  Trades: {len(trades)}")
        
        for trade_row in trades:
            trade = dict(zip(trade_columns, trade_row))
            all_trades.append(trade)
            print(f"    - {trade['action'].upper()} {trade['quantity']} {trade['symbol']} @ ${trade['price']} | P/L: ${trade['profit_loss']:+.2f} | {trade['timestamp']}")
    
    print("\n" + "=" * 80)
    print(f"💵 TOTAL SUMMARY:")
    print(f"  Total Challenges: {len(challenges)}")
    print(f"  Total Trades: {len(all_trades)}")
    print(f"  Total Profit/Loss: ${total_profit:,.2f}")
    print("=" * 80)
    
    # Save to JSON file
    report = {
        'user': user_data,
        'challenges': [dict(zip(challenge_columns, ch)) for ch in challenges],
        'trades': all_trades,
        'summary': {
            'total_challenges': len(challenges),
            'total_trades': len(all_trades),
            'total_profit': total_profit
        },
        'generated_at': datetime.now().isoformat()
    }
    
    filename = f'account_report_{email.replace("@", "_")}.json'
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, default=str)
    
    print(f"\n✅ Full report saved to: {filename}")
    
    conn.close()
    return report

if __name__ == '__main__':
    get_account_data('moughitbusines@gmail.com')
