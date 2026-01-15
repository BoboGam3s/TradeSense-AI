import requests
import json
import sys

def test_backend():
    print("--- TradeSense AI Production Tester ---\n")
    
    # 1. Ask for URL
    base_url = input("Entrez l'URL de votre backend Railway (ex: https://xxx.up.railway.app): ").strip()
    
    # Remove trailing slash and /api if present to standardize
    if base_url.endswith('/'):
        base_url = base_url[:-1]
    if base_url.endswith('/api'):
        base_url = base_url[:-4]
        
    api_url = f"{base_url}/api"
    print(f"\nTesting against: {api_url}")
    
    # 2. Test Health
    print("\n[1/3] Testing Health Check...")
    try:
        r = requests.get(f"{api_url}/health", timeout=10)
        print(f"Status Code: {r.status_code}")
        print(f"Response: {r.text}")
        if r.status_code == 200:
            print("✅ Backend is ONLINE and reachable!")
        else:
            print("❌ Backend is reachable but returned error.")
    except Exception as e:
        print(f"❌ CONNECTION FAILED: {str(e)}")
        print("💡 Vérifiez l'URL et que le service Railway est actif.")
        return

    # 3. Test Admin Login
    print("\n[2/3] Testing Admin Login (admin@tradesense.ai)...")
    try:
        login_data = {
            "email": "admin@tradesense.ai",
            "password": "admin123"
        }
        r = requests.post(f"{api_url}/auth/login", json=login_data)
        print(f"Status Code: {r.status_code}")
        if r.status_code == 200:
            print("✅ Login SUCCESSFUL!")
            token = r.json().get('access_token')
            print(f"Token received: {token[:10]}...")
        else:
            print(f"❌ Login FAILED: {r.text}")
    except Exception as e:
        print(f"❌ Login Request Failed: {str(e)}")

    # 4. Test Registration
    print("\n[3/3] Testing New User Registration...")
    import random
    rand_id = random.randint(1000, 9999)
    new_user = {
        "email": f"test_user_{rand_id}@example.com",
        "password": "password123",
        "full_name": "Test User",
        "language": "en"
    }
    
    try:
        r = requests.post(f"{api_url}/auth/register", json=new_user)
        print(f"Status Code: {r.status_code}")
        if r.status_code == 201:
            print("✅ Registration SUCCESSFUL!")
            print(f"User created: {new_user['email']}")
        elif r.status_code == 409:
            print("⚠️ User already exists (This is technically a success, means DB is readable).")
        else:
            print(f"❌ Registration FAILED: {r.text}")
    except Exception as e:
        print(f"❌ Registration Request Failed: {str(e)}")

    print("\n--- End of Test ---")

if __name__ == "__main__":
    try:
        test_backend()
    except KeyboardInterrupt:
        print("\nTest cancelled.")
    input("\nAppuyez sur Entrée pour quitter...")
