"""
RAG Retriever module for semantic search.
Queries ChromaDB and returns relevant program IDs with scores.
"""

import os
import sys
from typing import List, Dict, Optional, Tuple

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class RAGRetriever:
    def __init__(self, chroma_persist_dir: str, collection_name: str, embedding_model: str):
        self.chroma_persist_dir = chroma_persist_dir
        self.collection_name = collection_name
        self.embedding_model = embedding_model
        
        self.client = None
        self.collection = None
        self.embedding_func = None
        
        self._init_chroma()
    
    def _init_chroma(self):
        """Initialize ChromaDB client."""
        try:
            import chromadb
            from chromadb.utils import embedding_functions
            
            # Create client
            self.client = chromadb.PersistentClient(path=self.chroma_persist_dir)
            
            # Create embedding function
            self.embedding_func = embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name=self.embedding_model
            )
            
            # Get collection
            try:
                self.collection = self.client.get_collection(
                    name=self.collection_name,
                    embedding_function=self.embedding_func
                )
                print(f"Connected to collection: {self.collection_name}")
            except Exception as e:
                print(f"Collection not found: {e}")
                self.collection = None
                
        except Exception as e:
            print(f"Error initializing ChromaDB: {e}")
            self.client = None
            self.collection = None
    
    def is_available(self) -> bool:
        """Check if retriever is available."""
        return self.collection is not None
    
    def search(self, query: str, top_k: int = 10, 
               filter_dict: Optional[Dict] = None) -> List[Dict]:
        """
        Perform semantic search on the query.
        Returns list of dicts with program_id, score, and metadata.
        """
        if not self.collection:
            raise RuntimeError("ChromaDB not available")
        
        try:
            # Prepare where clause for filtering
            where_clause = None
            if filter_dict:
                where_clause = filter_dict
            
            # Query ChromaDB
            results = self.collection.query(
                query_texts=[query],
                n_results=top_k * 2,  # Get more to account for duplicates
                where=where_clause
            )
            
            # Process results
            program_scores = {}  # program_id -> best score
            
            if results['ids'] and results['ids'][0]:
                ids = results['ids'][0]
                distances = results['distances'][0] if results['distances'] else [0] * len(ids)
                metadatas = results['metadatas'][0] if results['metadatas'] else [None] * len(ids)
                
                for i, (chunk_id, distance, metadata) in enumerate(zip(ids, distances, metadatas)):
                    if metadata:
                        program_id = metadata.get('program_id')
                        if program_id:
                            # Convert distance to similarity score (0-1, higher is better)
                            # Cosine distance to similarity
                            score = 1 - distance
                            
                            # Keep the best score for each program
                            if program_id not in program_scores or score > program_scores[program_id]['score']:
                                program_scores[program_id] = {
                                    'program_id': program_id,
                                    'score': round(score, 4),
                                    'university': metadata.get('university'),
                                    'country': metadata.get('country'),
                                    'field': metadata.get('field')
                                }
            
            # Sort by score and take top_k
            sorted_results = sorted(
                program_scores.values(), 
                key=lambda x: x['score'], 
                reverse=True
            )[:top_k]
            
            return sorted_results
            
        except Exception as e:
            print(f"Error querying ChromaDB: {e}")
            raise
    
    def search_with_explanation(self, query: str, top_k: int = 10) -> Dict:
        """
        Perform search and return results with explanation.
        """
        results = self.search(query, top_k)
        
        # Build explanation
        explanation = self._build_explanation(query, results)
        
        return {
            'results': results,
            'explanation': explanation,
            'query': query
        }
    
    def _build_explanation(self, query: str, results: List[Dict]) -> str:
        """Build a human-readable explanation of the search results."""
        if not results:
            return "No matching programs found."
        
        parts = [f"Found {len(results)} relevant programs"]
        
        # Country breakdown
        countries = {}
        for r in results:
            country = r.get('country', 'Unknown')
            countries[country] = countries.get(country, 0) + 1
        
        if len(countries) == 1:
            parts.append(f"in {list(countries.keys())[0]}")
        else:
            country_list = ', '.join(f"{c} ({n})" for c, n in list(countries.items())[:3])
            parts.append(f"across {len(countries)} countries: {country_list}")
        
        # Field breakdown
        fields = {}
        for r in results:
            field = r.get('field', 'unknown')
            fields[field] = fields.get(field, 0) + 1
        
        if 'robotics' in fields and 'ai' in fields:
            parts.append("covering both Robotics and AI")
        elif 'robotics' in fields:
            parts.append("focused on Robotics")
        elif 'ai' in fields:
            parts.append("focused on AI")
        
        return " ".join(parts) + "."
    
    def get_program_context(self, program_id: str, max_chunks: int = 3) -> List[str]:
        """
        Get the text chunks for a specific program.
        Useful for generating detailed responses about a program.
        """
        if not self.collection:
            return []
        
        try:
            results = self.collection.get(
                where={'program_id': program_id},
                limit=max_chunks
            )
            
            if results and results['documents']:
                return results['documents']
            return []
            
        except Exception as e:
            print(f"Error fetching context for {program_id}: {e}")
            return []
    
    def get_collection_info(self) -> Dict:
        """Get information about the collection."""
        if not self.collection:
            return {'error': 'ChromaDB not available'}
        
        try:
            count = self.collection.count()
            return {
                'collection_name': self.collection_name,
                'total_documents': count,
                'embedding_model': self.embedding_model,
                'persist_directory': self.chroma_persist_dir
            }
        except Exception as e:
            return {'error': str(e)}

if __name__ == '__main__':
    # Test the retriever
    retriever = RAGRetriever(
        chroma_persist_dir='chroma_data',
        collection_name='programs_v1',
        embedding_model='sentence-transformers/all-MiniLM-L6-v2'
    )
    
    if retriever.is_available():
        print("Collection info:", retriever.get_collection_info())
        
        # Test query
        query = "affordable robotics masters in Europe"
        print(f"\nQuery: {query}")
        
        results = retriever.search(query, top_k=5)
        print(f"\nResults:")
        for r in results:
            print(f"  {r['program_id']}: score={r['score']}")
    else:
        print("Retriever not available - ChromaDB not initialized")
