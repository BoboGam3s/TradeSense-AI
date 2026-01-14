from app import create_app
from app.models import Challenge, Trade
app = create_app()
with app.app_context():
    challenges = Challenge.query.filter_by(user_id=13).all()
    for c in challenges:
        trades = Trade.query.filter_by(challenge_id=c.id).all()
        print(f"ID:{c.id} Status:{c.status} Equity:{c.current_equity} Trades:{len(trades)}")
        for t in trades[:5]:
            print(f"  Trade: {t.symbol} {t.action} {t.quantity} @ {t.price} PL:{t.profit_loss}")
