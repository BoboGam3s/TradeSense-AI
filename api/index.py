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

# WSGI Middleware to fix Vercel path stripping and SCRIPT_NAME interference
def app(environ, start_response):
    # Vercel/AWS Lambda sometimes splits path into SCRIPT_NAME and PATH_INFO
    # e.g. SCRIPT_NAME='/api', PATH_INFO='/auth/login'
    # Flask joins these to Create the URL.
    # BUT our blueprints interpret url_prefix='/api/auth', so Flask expects matched path to contain /api.
    
    # We want Flask to see PATH_INFO='/api/auth/login' and SCRIPT_NAME='' (root routed)
    
    script_name = environ.get('SCRIPT_NAME', '')
    path_info = environ.get('PATH_INFO', '')
    
    # Reconstruct full path
    full_path = script_name + path_info
    
    # Ensure it starts with /api (if missing due to stripping)
    if not full_path.startswith('/api'):
         if not full_path.startswith('/'):
             full_path = '/' + full_path
         full_path = '/api' + full_path

    # Force Flask to route from root
    environ['SCRIPT_NAME'] = ''
    environ['PATH_INFO'] = full_path
    
    return flask_app(environ, start_response)

if __name__ == "__main__":
    flask_app.run()
