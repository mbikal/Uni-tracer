from flask import Blueprint, request, jsonify, current_app
from functools import wraps
import os
import sys
import threading

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

refresh_bp = Blueprint('refresh', __name__)

# Global flag to track if refresh is running
_refresh_lock = threading.Lock()
_refresh_in_progress = False

def require_refresh_secret(f):
    """Decorator to require secret key for refresh endpoint."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        secret_header = request.headers.get('X-Refresh-Secret')
        expected_secret = current_app.config.get('REFRESH_SECRET')
        
        if not secret_header or secret_header != expected_secret:
            return jsonify({
                'success': False,
                'error': 'Unauthorized'
            }), 401
        
        return f(*args, **kwargs)
    return decorated_function

def run_refresh_pipeline(app_config):
    """Run the full refresh pipeline in background."""
    global _refresh_in_progress
    
    try:
        # Import here to avoid circular imports
        from rag.scraper import run_scraper
        from rag.embedder import run_embedder
        
        # Run scraper
        current_app.logger.info("Starting data refresh pipeline...")
        programs_updated = run_scraper(
            db_path=app_config['DB_PATH'],
            rag_data_dir=os.path.join(os.path.dirname(app_config['DB_PATH']), '..', 'rag_data')
        )
        
        # Run embedder
        run_embedder(
            chroma_persist_dir=app_config['CHROMA_PERSIST_DIR'],
            collection_name=app_config['COLLECTION_NAME'],
            embedding_model=app_config['EMBEDDING_MODEL'],
            db_path=app_config['DB_PATH']
        )
        
        current_app.logger.info(f"Refresh pipeline completed. Updated {programs_updated} programs.")
        return programs_updated
        
    except Exception as e:
        current_app.logger.error(f"Refresh pipeline failed: {e}")
        raise
    finally:
        with _refresh_lock:
            _refresh_in_progress = False

@refresh_bp.route('/refresh', methods=['POST'])
@require_refresh_secret
def trigger_refresh():
    """Trigger the data refresh pipeline."""
    global _refresh_in_progress
    
    try:
        with _refresh_lock:
            if _refresh_in_progress:
                return jsonify({
                    'success': False,
                    'error': 'Refresh already in progress'
                }), 409
            
            _refresh_in_progress = True
        
        # Get sync/async preference
        data = request.get_json() or {}
        async_mode = data.get('async', True)
        
        if async_mode:
            # Start background thread
            thread = threading.Thread(
                target=run_refresh_pipeline,
                args=(current_app.config,)
            )
            thread.daemon = True
            thread.start()
            
            return jsonify({
                'success': True,
                'status': 'started',
                'message': 'Data refresh started in background'
            })
        else:
            # Run synchronously (for testing/CI)
            programs_updated = run_refresh_pipeline(current_app.config)
            
            return jsonify({
                'success': True,
                'status': 'completed',
                'programs_updated': programs_updated
            })
    
    except Exception as e:
        current_app.logger.error(f'Error triggering refresh: {str(e)}')
        with _refresh_lock:
            _refresh_in_progress = False
        return jsonify({
            'success': False,
            'error': 'Failed to trigger refresh'
        }), 500

@refresh_bp.route('/refresh/status', methods=['GET'])
def refresh_status():
    """Check if a refresh is currently running."""
    with _refresh_lock:
        in_progress = _refresh_in_progress
    
    return jsonify({
        'success': True,
        'refresh_in_progress': in_progress
    })
