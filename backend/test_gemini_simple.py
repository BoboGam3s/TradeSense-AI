import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv('GOOGLE_API_KEY')
print(f"API Key found: {bool(api_key)}")

if not api_key:
    print("ERROR: No API key!")
    exit(1)

genai.configure(api_key=api_key)

# Try each model
models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro']
for model_name in models:
    try:
        print(f"\nTrying {model_name}...")
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Say 'Hello' in one word")
        print(f"✓ {model_name} WORKS: {response.text}")
        break
    except Exception as e:
        print(f"✗ {model_name} FAILED: {e}")
