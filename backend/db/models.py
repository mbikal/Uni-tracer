import sqlite3
from dataclasses import dataclass
from typing import Optional, List, Dict, Any
import json

@dataclass
class Program:
    id: str
    university: str
    program_name: str
    country: str
    city: Optional[str]
    language: Optional[str]
    tuition_usd: Optional[int]
    duration_months: Optional[int]
    field: str
    url: str
    last_updated: str
    description_snippet: Optional[str]
    application_deadline: Optional[str]
    entry_requirements: Optional[str]
    full_description: Optional[str]
    contact_email: Optional[str]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'university': self.university,
            'program_name': self.program_name,
            'country': self.country,
            'city': self.city,
            'language': self.language,
            'tuition_usd': self.tuition_usd,
            'duration_months': self.duration_months,
            'field': self.field,
            'url': self.url,
            'last_updated': self.last_updated,
            'description_snippet': self.description_snippet,
            'application_deadline': self.application_deadline,
            'entry_requirements': self.entry_requirements,
            'full_description': self.full_description,
            'contact_email': self.contact_email
        }
    
    @classmethod
    def from_row(cls, row: sqlite3.Row) -> 'Program':
        return cls(
            id=row['id'],
            university=row['university'],
            program_name=row['program_name'],
            country=row['country'],
            city=row['city'],
            language=row['language'],
            tuition_usd=row['tuition_usd'],
            duration_months=row['duration_months'],
            field=row['field'],
            url=row['url'],
            last_updated=row['last_updated'],
            description_snippet=row['description_snippet'],
            application_deadline=row['application_deadline'],
            entry_requirements=row['entry_requirements'],
            full_description=row['full_description'],
            contact_email=row['contact_email']
        )

class ProgramRepository:
    def __init__(self, db_path: str):
        self.db_path = db_path
    
    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def get_by_id(self, program_id: str) -> Optional[Program]:
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM programs WHERE id = ?', (program_id,))
        row = cursor.fetchone()
        conn.close()
        return Program.from_row(row) if row else None
    
    def get_by_ids(self, program_ids: List[str]) -> List[Program]:
        if not program_ids:
            return []
        
        placeholders = ','.join('?' * len(program_ids))
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute(f'SELECT * FROM programs WHERE id IN ({placeholders})', program_ids)
        rows = cursor.fetchall()
        conn.close()
        return [Program.from_row(row) for row in rows]
    
    def filter_programs(
        self,
        country: Optional[str] = None,
        language: Optional[str] = None,
        tuition_max: Optional[int] = None,
        duration: Optional[int] = None,
        field: Optional[str] = None,
        limit: int = 50
    ) -> List[Program]:
        conn = self._get_connection()
        cursor = conn.cursor()
        
        query = 'SELECT * FROM programs WHERE 1=1'
        params = []
        
        if country:
            query += ' AND country = ?'
            params.append(country)
        
        if language:
            query += ' AND language = ?'
            params.append(language)
        
        if tuition_max is not None:
            query += ' AND (tuition_usd <= ? OR tuition_usd IS NULL)'
            params.append(tuition_max)
        
        if duration:
            query += ' AND duration_months = ?'
            params.append(duration)
        
        if field and field != 'both':
            query += ' AND (field = ? OR field = "both")'
            params.append(field)
        
        query += f' ORDER BY university LIMIT ?'
        params.append(limit)
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()
        return [Program.from_row(row) for row in rows]
    
    def get_all_countries(self) -> List[str]:
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT DISTINCT country FROM programs ORDER BY country')
        countries = [row[0] for row in cursor.fetchall()]
        conn.close()
        return countries
    
    def get_stats(self) -> Dict[str, Any]:
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM programs')
        total = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(DISTINCT country) FROM programs')
        countries = cursor.fetchone()[0]
        
        cursor.execute('SELECT MAX(last_updated) FROM programs')
        last_updated = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'total_programs': total,
            'total_countries': countries,
            'last_updated': last_updated
        }
    
    def upsert_program(self, program: Program):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO programs 
            (id, university, program_name, country, city, language, tuition_usd, 
             duration_months, field, url, last_updated, description_snippet, 
             application_deadline, entry_requirements, full_description, contact_email)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            program.id, program.university, program.program_name, program.country,
            program.city, program.language, program.tuition_usd, program.duration_months,
            program.field, program.url, program.last_updated, program.description_snippet,
            program.application_deadline, program.entry_requirements, 
            program.full_description, program.contact_email
        ))
        
        conn.commit()
        conn.close()
    
    def log_search(self, query: str, filters: Dict[str, Any], results_count: int):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO search_logs (query, filters, results_count)
            VALUES (?, ?, ?)
        ''', (query, json.dumps(filters), results_count))
        
        conn.commit()
        conn.close()
