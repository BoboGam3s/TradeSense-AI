import os
import sys

# The backend folder is located at the repository root.
# From api/index.py, the root is one level up.
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
backend_path = os.path.join(root_path, 'backend')

# Add both paths to ensure imports work correctly
# 'backend.app' needs root_path
# 'app.config' needs backend_path
sys.path.append(root_path)
sys.path.append(backend_path)

from backend.app import create_app

# Create the specific Flask app
flask_app = create_app()

# WSGI Middleware to fix Vercel path stripping
# Vercel often strips the '/api' prefix from the path when routing to a serverless function.
# Since our Flask blueprints are registered with url_prefix='/api/...', we need to restore it.
def app(environ, start_response):
    path_info = environ.get('PATH_INFO', '')
    
    # Debug logging (visible in Vercel logs)
    # print(f"DEBUG: Incoming Path: {path_info}", file=sys.stderr)
    
    # If the path doesn't start with /api, pretend it does
    # strict_slashes=False in Flask might handle trailing slashes, but we treat prefix here.
    if not path_info.startswith('/api'):
        # Ensure we don't accidentally create //api if path is empty
        if not path_info.startswith('/'):
            path_info = '/' + path_info
        
        environ['PATH_INFO'] = '/api' + path_info
        # print(f"DEBUG: Rewritten Path: {environ['PATH_INFO']}", file=sys.stderr)

    return flask_app(environ, start_response)

if __name__ == "__main__":
    flask_app.run()
