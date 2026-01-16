import os
import sys

# When Vercel builds from the 'frontend' Root Directory,
# it includes files outside if the setting is enabled.
# The 'backend' folder is located at the repository root.
# From frontend/api/index.py, the root is two levels up.
path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(path)

# Verify if backend exists for debugging
if not os.path.exists(os.path.join(path, 'backend')):
    print(f"CRITICAL: Backend folder not found at {path}")

from backend.app import create_app

app = create_app()

if __name__ == "__main__":
    app.run()
