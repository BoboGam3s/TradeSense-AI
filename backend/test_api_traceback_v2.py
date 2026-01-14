from app import create_app
from flask_jwt_extended import create_access_token
import json
import traceback

app = create_app()

@app.errorhandler(Exception)
def handle_exception(e):
    tb = traceback.format_exc()
    with open('api_error_traceback.txt', 'w') as f:
        f.write(tb)
    return {
        "error": str(e),
        "traceback": tb
    }, 500

with app.app_context():
    token = create_access_token(identity='25')
    client = app.test_client()
    headers = {'Authorization': f'Bearer {token}'}
    response = client.get('/api/trading/portfolio', headers=headers)
    print(f"Status Code: {response.status_code}")
