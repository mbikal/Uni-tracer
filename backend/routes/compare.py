from flask import Blueprint, request, jsonify, current_app
from db.models import ProgramRepository

compare_bp = Blueprint('compare', __name__)

@compare_bp.route('/compare', methods=['POST'])
def compare_programs():
    """Compare multiple programs side-by-side."""
    try:
        data = request.get_json()
        if not data or 'ids' not in data:
            return jsonify({
                'success': False,
                'error': 'Program IDs are required'
            }), 400
        
        program_ids = data['ids']
        
        # Validate input
        if not isinstance(program_ids, list):
            return jsonify({
                'success': False,
                'error': 'ids must be a list'
            }), 400
        
        if len(program_ids) < 2:
            return jsonify({
                'success': False,
                'error': 'At least 2 programs are required for comparison'
            }), 400
        
        if len(program_ids) > 4:
            return jsonify({
                'success': False,
                'error': 'Maximum 4 programs can be compared at once'
            }), 400
        
        # Fetch programs
        repo = ProgramRepository(current_app.config['DB_PATH'])
        programs = repo.get_by_ids(program_ids)
        
        if len(programs) < len(program_ids):
            found_ids = {p.id for p in programs}
            missing = set(program_ids) - found_ids
            return jsonify({
                'success': False,
                'error': f'Programs not found: {", ".join(missing)}'
            }), 404
        
        # Build comparison structure
        comparison = build_comparison(programs)
        
        return jsonify({
            'success': True,
            'comparison': comparison
        })
    
    except Exception as e:
        current_app.logger.error(f'Error comparing programs: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Comparison failed'
        }), 500

def build_comparison(programs):
    """Build structured comparison data with highlighting."""
    program_dicts = [p.to_dict() for p in programs]
    
    # Calculate highlights (best value in each category)
    highlights = {}
    
    # Lowest tuition
    tuitions = [(i, p.get('tuition_usd')) for i, p in enumerate(program_dicts) if p.get('tuition_usd')]
    if tuitions:
        min_tuition_idx = min(tuitions, key=lambda x: x[1])[0]
        highlights['tuition_usd'] = program_dicts[min_tuition_idx]['id']
    
    # Shortest duration
    durations = [(i, p.get('duration_months')) for i, p in enumerate(program_dicts) if p.get('duration_months')]
    if durations:
        min_duration_idx = min(durations, key=lambda x: x[1])[0]
        highlights['duration_months'] = program_dicts[min_duration_idx]['id']
    
    # Build comparison table
    comparison_table = {
        'programs': program_dicts,
        'rows': [
            {
                'label': 'University',
                'key': 'university',
                'type': 'text'
            },
            {
                'label': 'Program',
                'key': 'program_name',
                'type': 'text'
            },
            {
                'label': 'Country',
                'key': 'country',
                'type': 'text'
            },
            {
                'label': 'City',
                'key': 'city',
                'type': 'text'
            },
            {
                'label': 'Annual Tuition (USD)',
                'key': 'tuition_usd',
                'type': 'currency',
                'highlight_best': highlights.get('tuition_usd')
            },
            {
                'label': 'Duration',
                'key': 'duration_months',
                'type': 'duration',
                'highlight_best': highlights.get('duration_months')
            },
            {
                'label': 'Language',
                'key': 'language',
                'type': 'text'
            },
            {
                'label': 'Field',
                'key': 'field',
                'type': 'text'
            },
            {
                'label': 'Application Deadline',
                'key': 'application_deadline',
                'type': 'date'
            },
            {
                'label': 'Description',
                'key': 'description_snippet',
                'type': 'text'
            },
            {
                'label': 'Website',
                'key': 'url',
                'type': 'link'
            }
        ],
        'highlights': highlights,
        'summary': generate_comparison_summary(program_dicts, highlights)
    }
    
    return comparison_table

def generate_comparison_summary(programs, highlights):
    """Generate a summary of the comparison."""
    if not programs:
        return ""
    
    parts = []
    
    # Tuition analysis
    tuitions = [p.get('tuition_usd') for p in programs if p.get('tuition_usd')]
    if tuitions:
        min_tuition = min(tuitions)
        max_tuition = max(tuitions)
        tuition_range = max_tuition - min_tuition
        
        if tuition_range > 20000:
            parts.append(f"Significant tuition variation (${min_tuition:,} - ${max_tuition:,})")
        elif min_tuition == 0:
            parts.append("Free tuition option available")
        elif min_tuition < 5000:
            parts.append("Affordable options available")
    
    # Duration analysis
    durations = set(p.get('duration_months') for p in programs if p.get('duration_months'))
    if len(durations) == 1:
        parts.append(f"All programs are {list(durations)[0]} months")
    else:
        parts.append(f"Duration varies: {min(durations)}-{max(durations)} months")
    
    # Countries
    countries = set(p.get('country') for p in programs)
    if len(countries) == 1:
        parts.append(f"All located in {list(countries)[0]}")
    else:
        parts.append(f"Spread across {len(countries)} countries")
    
    return " | ".join(parts) if parts else "Compare the programs below"
