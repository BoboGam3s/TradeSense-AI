import requests
import time

BASE_URL = "http://localhost:5000/api/auth"

def test_auth():
    # 1. Test Register
    reg_data = {
        "email": f"test_{int(time.time())}@example.com",
        "password": "password123",
        "full_name": "Test User"
    }
    print(f"Testing Register with {reg_data['email']}...")
    try:
        r = requests.post(f"{BASE_URL}/register", json=reg_data)
        print(f"Register status: {r.status_code}")
        print(f"Register response: {r.json()}")
    except Exception as e:
        print(f"Register failed (server might be down): {e}")
        return

    # 2. Test Login
    login_data = {
        "email": reg_data["email"],
        "password": "password123"
    }
    print(f"Testing Login with {login_data['email']}...")
    try:
        r = requests.post(f"{BASE_URL}/login", json=login_data)
        print(f"Login status: {r.status_code}")
        print(f"Login response: {r.json().get('message')}")
    except Exception as e:
        print(f"Login failed: {e}")

    # 3. Test known test account login
    test_login = {
        "email": "starter@tradesense.ai",
        "password": "TradeSense2025!"
    }
    print("Testing Starter Account Login...")
    try:
        r = requests.post(f"{BASE_URL}/login", json=test_login)
        print(f"Starter Login status: {r.status_code}")
        print(f"Starter Login response: {r.json().get('message')}")
    except Exception as e:
        print(f"Starter Login failed: {e}")

if __name__ == "__main__":
    test_auth()
