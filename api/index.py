import os
import sys

# Add the project root to the path so we can import from backend/
# This allows us to keep the backend folder as is
path = os.path.join(os.path.dirname(__file__), '..')
sys.path.append(path)

from backend.app import create_app

app = create_app()

if __name__ == "__main__":
    app.run()
