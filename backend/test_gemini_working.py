import os
from dotenv import load_dotenv
import google.generativeai as genai
import sys

load_dotenv()

api_key = os.getenv('GOOGLE_API_KEY')
print(f"API Key: '{api_key[:10]}...' (length: {len(api_key) if api_key else 0})")

if not api_key or api_key.strip() == '':
    print("ERROR: No valid API key!")
    sys.exit(1)

# Clean the key
api_key = api_key.strip()
genai.configure(api_key=api_key)

# Try each model
models = ['gemini-pro', 'gemini-1.5-flash', 'gemini-1.5-pro']
working_model = None

for model_name in models:
    try:
        print(f"\n=== Testing {model_name} ===")
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Respond with only the word: SUCCESS")
        result_text = response.text.strip()
        print(f"SUCCESS! Model {model_name} works!")
        print(f"Response: {result_text}")
        working_model = model_name
        break
    except Exception as e:
        print(f"FAILED: {model_name}")
        print(f"Error: {type(e).__name__}: {str(e)[:200]}")

if working_model:
    print(f"\n\n✓✓✓ USE THIS MODEL: {working_model} ✓✓✓")
else:
    print("\n\n✗✗✗ NO MODELS WORK ✗✗✗")
    sys.exit(1)
