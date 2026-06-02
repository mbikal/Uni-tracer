from flask import Blueprint, request, jsonify, current_app
from db.models import ProgramRepository

programs_bp = Blueprint('programs', __name__)

@programs_bp.route('/programs', methods=['GET'])
def get_programs():
    """Get programs with optional filtering."""
    try:
        # Parse query parameters
        country = request.args.get('country')
        language = request.args.get('language')
        tuition_max = request.args.get('tuition_max', type=int)
        duration = request.args.get('duration', type=int)
        field = request.args.get('field')  # 'robotics', 'ai', or 'both'
        
        repo = ProgramRepository(current_app.config['DB_PATH'])
        programs = repo.filter_programs(
            country=country,
            language=language,
            tuition_max=tuition_max,
            duration=duration,
            field=field,
            limit=current_app.config.get('MAX_PROGRAMS_PER_PAGE', 50)
        )
        
        return jsonify({
            'success': True,
            'count': len(programs),
            'programs': [p.to_dict() for p in programs]
        })
    
    except Exception as e:
        current_app.logger.error(f'Error fetching programs: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to fetch programs'
        }), 500

@programs_bp.route('/programs/<program_id>', methods=['GET'])
def get_program(program_id):
    """Get a single program by ID."""
    try:
        repo = ProgramRepository(current_app.config['DB_PATH'])
        program = repo.get_by_id(program_id)
        
        if not program:
            return jsonify({
                'success': False,
                'error': 'Program not found'
            }), 404
        
        return jsonify({
            'success': True,
            'program': program.to_dict()
        })
    
    except Exception as e:
        current_app.logger.error(f'Error fetching program {program_id}: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to fetch program'
        }), 500

@programs_bp.route('/countries', methods=['GET'])
def get_countries():
    """Get list of all countries with programs."""
    try:
        repo = ProgramRepository(current_app.config['DB_PATH'])
        countries = repo.get_all_countries()
        
        return jsonify({
            'success': True,
            'countries': countries
        })
    
    except Exception as e:
        current_app.logger.error(f'Error fetching countries: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to fetch countries'
        }), 500

@programs_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get database statistics."""
    try:
        repo = ProgramRepository(current_app.config['DB_PATH'])
        stats = repo.get_stats()
        
        return jsonify({
            'success': True,
            'stats': stats
        })
    
    except Exception as e:
        current_app.logger.error(f'Error fetching stats: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to fetch statistics'
        }), 500
