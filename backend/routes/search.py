from flask import Blueprint, request, jsonify, current_app
from db.models import ProgramRepository
import os
import sys

# Add parent directory to path for importing rag modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from rag.retriever import RAGRetriever
    RAG_AVAILABLE = True
except ImportError:
    RAG_AVAILABLE = False

search_bp = Blueprint('search', __name__)

def get_retriever():
    """Get or create RAG retriever instance."""
    if not hasattr(current_app, '_retriever'):
        if RAG_AVAILABLE:
            try:
                current_app._retriever = RAGRetriever(
                    chroma_persist_dir=current_app.config['CHROMA_PERSIST_DIR'],
                    collection_name=current_app.config['COLLECTION_NAME'],
                    embedding_model=current_app.config['EMBEDDING_MODEL']
                )
            except Exception as e:
                current_app.logger.error(f'Failed to initialize RAG retriever: {e}')
                current_app._retriever = None
        else:
            current_app._retriever = None
    return current_app._retriever

@search_bp.route('/search', methods=['POST'])
def semantic_search():
    """Perform semantic search using RAG."""
    try:
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({
                'success': False,
                'error': 'Query is required'
            }), 400
        
        query = data['query'].strip()
        top_k = data.get('top_k', 10)
        
        if not query:
            return jsonify({
                'success': False,
                'error': 'Query cannot be empty'
            }), 400
        
        retriever = get_retriever()
        repo = ProgramRepository(current_app.config['DB_PATH'])
        
        # If RAG is available, use semantic search
        if retriever and retriever.is_available():
            try:
                results = retriever.search(query, top_k=top_k)
                
                # Hydrate with full program data
                program_ids = [r['program_id'] for r in results]
                programs = repo.get_by_ids(program_ids)
                
                # Add relevance scores
                program_dict = {p.id: p for p in programs}
                enriched_results = []
                
                for result in results:
                    if result['program_id'] in program_dict:
                        prog = program_dict[result['program_id']].to_dict()
                        prog['relevance_score'] = result['score']
                        enriched_results.append(prog)
                
                # Log the search
                repo.log_search(query, {'semantic': True}, len(enriched_results))
                
                # Generate summary (placeholder - could use LLM)
                summary = generate_summary(query, enriched_results)
                
                return jsonify({
                    'success': True,
                    'query': query,
                    'results': enriched_results,
                    'generated_summary': summary,
                    'search_type': 'semantic'
                })
            
            except Exception as e:
                current_app.logger.error(f'RAG search failed, falling back to keyword: {e}')
        
        # Fallback to keyword search
        results = keyword_search_fallback(query, repo, top_k)
        repo.log_search(query, {'semantic': False}, len(results))
        
        return jsonify({
            'success': True,
            'query': query,
            'results': results,
            'generated_summary': generate_summary(query, results),
            'search_type': 'keyword'
        })
    
    except Exception as e:
        current_app.logger.error(f'Error in search: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Search failed'
        }), 500

def keyword_search_fallback(query: str, repo: ProgramRepository, top_k: int):
    """Fallback keyword search when RAG is unavailable."""
    # Get all programs and filter by keyword matching
    all_programs = repo.filter_programs(limit=1000)
    
    query_lower = query.lower()
    query_terms = set(query_lower.split())
    
    scored_results = []
    for program in all_programs:
        score = 0
        text_to_search = f"{program.university} {program.program_name} {program.description_snippet or ''} {program.country}"
        text_lower = text_to_search.lower()
        
        # Count matching terms
        for term in query_terms:
            if term in text_lower:
                score += 1
        
        # Bonus for exact phrase match
        if query_lower in text_lower:
            score += 5
        
        if score > 0:
            prog_dict = program.to_dict()
            prog_dict['relevance_score'] = score
            scored_results.append(prog_dict)
    
    # Sort by score descending
    scored_results.sort(key=lambda x: x['relevance_score'], reverse=True)
    return scored_results[:top_k]

def generate_summary(query: str, results: list) -> str:
    """Generate a simple summary of search results."""
    if not results:
        return "No matching programs found. Try adjusting your search terms."
    
    countries = set(r['country'] for r in results)
    fields = set(r.get('field', 'unknown') for r in results)
    avg_tuition = sum(r.get('tuition_usd', 0) or 0 for r in results) / len(results) if results else 0
    
    summary_parts = [
        f"Found {len(results)} programs",
    ]
    
    if len(countries) == 1:
        summary_parts.append(f"in {list(countries)[0]}")
    else:
        summary_parts.append(f"across {len(countries)} countries")
    
    if 'robotics' in fields and 'ai' in fields:
        summary_parts.append("covering both Robotics and AI")
    elif 'robotics' in fields:
        summary_parts.append("focused on Robotics")
    elif 'ai' in fields:
        summary_parts.append("focused on AI")
    
    if avg_tuition > 0:
        if avg_tuition < 5000:
            summary_parts.append("with affordable tuition options")
        elif avg_tuition > 40000:
            summary_parts.append("from premium institutions")
    
    return " ".join(summary_parts) + "."
