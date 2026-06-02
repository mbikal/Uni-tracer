"""
Web scraper for university program pages.
Uses BeautifulSoup for static pages and can fallback to Playwright for JS-heavy sites.
"""

import os
import re
import json
import httpx
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time
import sys

# Add parent directory to path for importing db models
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.models import Program, ProgramRepository
from rag.seeds import UNIVERSITY_SEEDS, FX_RATES

class ProgramScraper:
    def __init__(self, user_agent: str = None, timeout: int = 30):
        self.user_agent = user_agent or 'MastersTrackerBot/1.0 (Academic Research Project)'
        self.timeout = timeout
        self.headers = {'User-Agent': self.user_agent}
        self.results = []
    
    def fetch_page(self, url: str) -> Optional[str]:
        """Fetch page content using httpx."""
        try:
            with httpx.Client(timeout=self.timeout, headers=self.headers, follow_redirects=True) as client:
                response = client.get(url)
                response.raise_for_status()
                return response.text
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None
    
    def parse_program_page(self, html: str, seed: Dict) -> Optional[Program]:
        """Parse a program page and extract relevant information."""
        soup = BeautifulSoup(html, 'html.parser')
        
        # Generate program ID
        uni_slug = seed['name'].lower().replace(' ', '_').replace(',', '').replace('.', '')
        prog_id = f"prog_{uni_slug[:20]}"
        
        # Try to extract program name from page title or headings
        program_name = self._extract_program_name(soup, seed)
        
        # Extract description
        description = self._extract_description(soup)
        
        # Extract tuition
        tuition = self._extract_tuition(soup, seed)
        
        # Extract duration
        duration = self._extract_duration(soup)
        
        # Extract language
        language = self._extract_language(soup)
        
        # Extract deadline
        deadline = self._extract_deadline(soup)
        
        # Create program object
        program = Program(
            id=prog_id,
            university=seed['name'],
            program_name=program_name,
            country=seed['country'],
            city=seed.get('city'),
            language=language,
            tuition_usd=tuition,
            duration_months=duration,
            field=seed.get('type', 'both'),
            url=seed['programs_page_url'],
            last_updated=datetime.now().isoformat(),
            description_snippet=description[:300] if description else None,
            application_deadline=deadline,
            entry_requirements=None,
            full_description=description,
            contact_email=None
        )
        
        return program
    
    def _extract_program_name(self, soup: BeautifulSoup, seed: Dict) -> str:
        """Extract program name from page."""
        # Try title
        title = soup.find('title')
        if title:
            title_text = title.get_text(strip=True)
            # Clean up common suffixes
            title_text = re.sub(r'\s*\|\s*.*$', '', title_text)  # Remove after |
            title_text = re.sub(r'\s+-\s+.*$', '', title_text)   # Remove after -
            if title_text and len(title_text) > 10:
                return title_text
        
        # Try h1
        h1 = soup.find('h1')
        if h1:
            return h1.get_text(strip=True)
        
        # Default based on type
        if seed.get('type') == 'robotics':
            return f"MSc in Robotics - {seed['name']}"
        elif seed.get('type') == 'ai':
            return f"MSc in Artificial Intelligence - {seed['name']}"
        else:
            return f"MSc in Robotics & AI - {seed['name']}"
    
    def _extract_description(self, soup: BeautifulSoup) -> str:
        """Extract program description from page."""
        # Try meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc:
            return meta_desc.get('content', '')
        
        # Try meta og:description
        og_desc = soup.find('meta', property='og:description')
        if og_desc:
            return og_desc.get('content', '')
        
        # Try first few paragraphs
        paragraphs = soup.find_all('p', limit=3)
        text = ' '.join(p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True)) > 50)
        return text[:500] if text else "Program description not available"
    
    def _extract_tuition(self, soup: BeautifulSoup, seed: Dict) -> Optional[int]:
        """Extract tuition information from page."""
        text = soup.get_text()
        
        # Look for tuition patterns
        tuition_patterns = [
            r'(?:tuition|fees|cost).*?\$?([\d,]+)\s*(?:USD|\$)?',
            r'\$([\d,]+)\s*(?:per year|annually|yearly)',
            r'(?:annual|yearly).*?\$?([\d,]+)',
        ]
        
        for pattern in tuition_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    tuition_str = match.group(1).replace(',', '')
                    tuition = int(tuition_str)
                    # Sanity check - tuition should be reasonable
                    if 1000 <= tuition <= 200000:
                        return tuition
                except (ValueError, IndexError):
                    continue
        
        # Use seed-based defaults if no tuition found
        defaults = {
            'Switzerland': 1500,
            'Sweden': 0,
            'Norway': 0,
            'Germany': 0
        }
        return defaults.get(seed['country'])
    
    def _extract_duration(self, soup: BeautifulSoup) -> Optional[int]:
        """Extract program duration from page."""
        text = soup.get_text()
        
        # Look for duration patterns
        patterns = [
            r'(\d+)\s*(?:month|months)',
            r'(one|two|three|four)\s*year',
            r'(1|2)-year',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                value = match.group(1).lower()
                if value == 'one' or value == '1':
                    return 12
                elif value == 'two' or value == '2':
                    return 24
                elif value == 'three' or value == '3':
                    return 36
                elif value == 'four' or value == '4':
                    return 48
                else:
                    try:
                        return int(value)
                    except ValueError:
                        continue
        
        # Default to 24 months (2 years)
        return 24
    
    def _extract_language(self, soup: BeautifulSoup) -> str:
        """Extract language of instruction from page."""
        text = soup.get_text()
        
        if re.search(r'\bEnglish\b', text, re.IGNORECASE):
            return 'English'
        elif re.search(r'\bGerman\b', text, re.IGNORECASE):
            return 'German'
        elif re.search(r'\bFrench\b', text, re.IGNORECASE):
            return 'French'
        elif re.search(r'\bSpanish\b', text, re.IGNORECASE):
            return 'Spanish'
        
        return 'English'  # Default assumption for top programs
    
    def _extract_deadline(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract application deadline from page."""
        text = soup.get_text()
        
        # Look for deadline patterns
        deadline_patterns = [
            r'deadline[:\s]*(\w+\s+\d{1,2}(?:,\s+\d{4})?)',
            r'apply by[:\s]*(\w+\s+\d{1,2})',
            r'applications? close[:\s]*(\w+\s+\d{1,2})',
        ]
        
        for pattern in deadline_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return None
    
    def scrape_all(self, seeds: List[Dict] = None) -> List[Program]:
        """Scrape all seeds."""
        seeds = seeds or UNIVERSITY_SEEDS
        programs = []
        
        print(f"Starting scrape of {len(seeds)} universities...")
        
        for seed in seeds:
            print(f"Scraping {seed['name']}...")
            
            html = self.fetch_page(seed['programs_page_url'])
            if html:
                program = self.parse_program_page(html, seed)
                if program:
                    programs.append(program)
                    print(f"  ✓ Found: {program.program_name}")
                else:
                    print(f"  ✗ Failed to parse")
            else:
                print(f"  ✗ Failed to fetch")
            
            # Be polite - add delay between requests
            time.sleep(1)
        
        print(f"\nScraped {len(programs)} programs successfully")
        return programs

def run_scraper(db_path: str, rag_data_dir: str = None) -> int:
    """Run the scraper and save results to database."""
    scraper = ProgramScraper()
    programs = scraper.scrape_all()
    
    # Save to database
    repo = ProgramRepository(db_path)
    for program in programs:
        repo.upsert_program(program)
    
    # Also save to JSON for RAG pipeline
    if rag_data_dir:
        os.makedirs(rag_data_dir, exist_ok=True)
        json_path = os.path.join(rag_data_dir, 'scraped_programs.json')
        with open(json_path, 'w') as f:
            json.dump([p.to_dict() for p in programs], f, indent=2)
        print(f"Saved to {json_path}")
    
    return len(programs)

if __name__ == '__main__':
    # For testing
    import sys
    db_path = sys.argv[1] if len(sys.argv) > 1 else 'backend/db/programs.db'
    count = run_scraper(db_path)
    print(f"Updated {count} programs")
