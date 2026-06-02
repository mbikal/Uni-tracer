"""
Embedding module for RAG pipeline.
Chunks program text and stores embeddings in ChromaDB.
"""

import os
import sys
import json
from typing import List, Dict
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.models import ProgramRepository

class ProgramEmbedder:
    def __init__(self, chroma_persist_dir: str, collection_name: str, embedding_model: str):
        self.chroma_persist_dir = chroma_persist_dir
        self.collection_name = collection_name
        self.embedding_model = embedding_model
        self.chunk_size = 300  # tokens
        self.chunk_overlap = 50  # tokens
        
        # Initialize ChromaDB
        self._init_chroma()
    
    def _init_chroma(self):
        """Initialize ChromaDB client and collection."""
        try:
            import chromadb
            from chromadb.utils import embedding_functions
            
            # Ensure directory exists
            os.makedirs(self.chroma_persist_dir, exist_ok=True)
            
            # Create client
            self.client = chromadb.PersistentClient(path=self.chroma_persist_dir)
            
            # Create embedding function
            self.embedding_func = embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name=self.embedding_model
            )
            
            # Get or create collection
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                embedding_function=self.embedding_func,
                metadata={"hnsw:space": "cosine"}
            )
            
            print(f"ChromaDB initialized at {self.chroma_persist_dir}")
            print(f"Collection: {self.collection_name}")
            
        except Exception as e:
            print(f"Error initializing ChromaDB: {e}")
            self.client = None
            self.collection = None
    
    def is_available(self) -> bool:
        """Check if ChromaDB is available."""
        return self.collection is not None
    
    def chunk_text(self, text: str, chunk_size: int = None, overlap: int = None) -> List[str]:
        """Split text into overlapping chunks."""
        chunk_size = chunk_size or self.chunk_size
        overlap = overlap or self.chunk_overlap
        
        if not text:
            return []
        
        words = text.split()
        chunks = []
        
        i = 0
        while i < len(words):
            chunk = words[i:i + chunk_size]
            chunks.append(' '.join(chunk))
            i += chunk_size - overlap
        
        return chunks
    
    def prepare_program_text(self, program) -> str:
        """Prepare program text for embedding."""
        parts = [
            f"University: {program.university}",
            f"Program: {program.program_name}",
            f"Country: {program.country}",
            f"City: {program.city or 'N/A'}",
            f"Field: {program.field}",
            f"Language: {program.language or 'N/A'}",
        ]
        
        if program.tuition_usd:
            parts.append(f"Tuition: ${program.tuition_usd:,} USD per year")
        
        if program.duration_months:
            parts.append(f"Duration: {program.duration_months} months")
        
        if program.description_snippet:
            parts.append(f"Description: {program.description_snippet}")
        
        if program.full_description:
            parts.append(f"Full Description: {program.full_description}")
        
        if program.application_deadline:
            parts.append(f"Application Deadline: {program.application_deadline}")
        
        if program.entry_requirements:
            parts.append(f"Entry Requirements: {program.entry_requirements}")
        
        return '\n'.join(parts)
    
    def embed_program(self, program):
        """Embed a single program."""
        if not self.collection:
            print(f"Cannot embed {program.id}: ChromaDB not available")
            return False
        
        try:
            # Prepare text
            text = self.prepare_program_text(program)
            
            # Chunk the text
            chunks = self.chunk_text(text)
            
            if not chunks:
                print(f"No text chunks generated for {program.id}")
                return False
            
            # Prepare metadata and IDs for each chunk
            ids = []
            documents = []
            metadatas = []
            
            for i, chunk in enumerate(chunks):
                chunk_id = f"{program.id}_chunk_{i}"
                ids.append(chunk_id)
                documents.append(chunk)
                metadatas.append({
                    'program_id': program.id,
                    'university': program.university,
                    'country': program.country,
                    'field': program.field,
                    'chunk_index': i,
                    'total_chunks': len(chunks)
                })
            
            # Upsert to ChromaDB
            self.collection.upsert(
                ids=ids,
                documents=documents,
                metadatas=metadatas
            )
            
            print(f"  ✓ Embedded {program.id} ({len(chunks)} chunks)")
            return True
            
        except Exception as e:
            print(f"  ✗ Failed to embed {program.id}: {e}")
            return False
    
    def embed_programs(self, programs: List):
        """Embed multiple programs."""
        if not self.collection:
            print("ChromaDB not available, skipping embedding")
            return 0
        
        success_count = 0
        print(f"Embedding {len(programs)} programs...")
        
        for program in programs:
            if self.embed_program(program):
                success_count += 1
        
        print(f"\nSuccessfully embedded {success_count}/{len(programs)} programs")
        return success_count
    
    def get_collection_stats(self) -> Dict:
        """Get statistics about the collection."""
        if not self.collection:
            return {'error': 'ChromaDB not available'}
        
        try:
            count = self.collection.count()
            return {
                'total_chunks': count,
                'collection_name': self.collection_name,
                'embedding_model': self.embedding_model
            }
        except Exception as e:
            return {'error': str(e)}

def run_embedder(chroma_persist_dir: str, collection_name: str, embedding_model: str, db_path: str):
    """Run the embedder on all programs in the database."""
    # Load programs from database
    repo = ProgramRepository(db_path)
    programs = repo.filter_programs(limit=1000)  # Get all programs
    
    # Create embedder
    embedder = ProgramEmbedder(chroma_persist_dir, collection_name, embedding_model)
    
    # Embed all programs
    count = embedder.embed_programs(programs)
    
    # Print stats
    stats = embedder.get_collection_stats()
    print(f"\nCollection stats: {stats}")
    
    return count

if __name__ == '__main__':
    import sys
    
    db_path = sys.argv[1] if len(sys.argv) > 1 else 'backend/db/programs.db'
    chroma_dir = sys.argv[2] if len(sys.argv) > 2 else 'chroma_data'
    
    run_embedder(
        chroma_persist_dir=chroma_dir,
        collection_name='programs_v1',
        embedding_model='sentence-transformers/all-MiniLM-L6-v2',
        db_path=db_path
    )
