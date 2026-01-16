import os
import sys

# The backend folder is located at the repository root.
# From api/index.py, the root is one level up.
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
backend_path = os.path.join(root_path, 'backend')

# Add both paths to ensure imports work correctly
sys.path.append(root_path)
sys.path.append(backend_path)

from backend.app import create_app

# Create the specific Flask app
flask_app = create_app()

# WSGI Wrapper for Vercel
def app(environ, start_response):
    # Debug logging
    print(f"DEBUG: Vercel Entry - Method: {environ.get('REQUEST_METHOD')} Path: {environ.get('PATH_INFO')}", file=sys.stderr)
    return flask_app(environ, start_response)

if __name__ == "__main__":
    flask_app.run()
