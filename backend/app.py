import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS

# Add the backend directory to the path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from config import config
from db.init_db import init_db
from routes.programs import programs_bp
from routes.search import search_bp
from routes.compare import compare_bp
from routes.refresh import refresh_bp

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    
    # Enable CORS
    CORS(app, 
         origins=app.config['CORS_ORIGINS'],
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization', 'X-Refresh-Secret'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
    
    # Initialize database
    with app.app_context():
        init_db(app.config['DB_PATH'])
    
    # Register blueprints
    app.register_blueprint(programs_bp, url_prefix='/api')
    app.register_blueprint(search_bp, url_prefix='/api')
    app.register_blueprint(compare_bp, url_prefix='/api')
    app.register_blueprint(refresh_bp, url_prefix='/api')
    
    @app.route('/health')
    def health_check():
        return jsonify({'status': 'healthy', 'service': 'masters-tracker-api'})
    
    @app.route('/')
    def index():
        return jsonify({
            'name': 'Global Masters in Robotics & AI Tracker API',
            'version': '1.0.0',
            'endpoints': [
                '/api/programs',
                '/api/search',
                '/api/compare',
                '/api/refresh',
                '/health'
            ]
        })
    
    return app

if __name__ == '__main__':
    env = os.environ.get('FLASK_ENV', 'development')
    app = create_app(env)
    app.run(host='0.0.0.0', port=5001, debug=app.config.get('DEBUG', True))
