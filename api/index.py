import os
import sys

# The backend folder is located at the repository root.
# From api/index.py, the root is one level up.
path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(path)

from backend.app import create_app

app = create_app()

if __name__ == "__main__":
    app.run()
