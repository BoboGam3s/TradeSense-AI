"""
TradeSense AI - Application Entry Point
"""
from app import create_app

app = create_app()

if __name__ == '__main__':
    # Server will reload and recreate DB if missing
    app.run(debug=True, host='0.0.0.0', port=5000)
