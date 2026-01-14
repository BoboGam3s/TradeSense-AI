import yfinance as yf
import time

symbols = ['AAPL', 'TSLA', 'BTC-USD', 'ETH-USD', 'IAM', 'ATW']
for sym in symbols:
    print(f"Testing {sym}...")
    start = time.time()
    try:
        t = yf.Ticker(sym)
        # Try fast_info
        print(f"  Fast info: {t.fast_info.get('last_price', 'N/A')}")
        # Try history
        h = t.history(period="1d", interval="1m")
        print(f"  History size: {len(h)}")
    except Exception as e:
        print(f"  Error: {e}")
    print(f"  Done in {time.time() - start:.2f}s")
