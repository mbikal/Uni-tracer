#!/usr/bin/env python3
"""
RAG Scraper - Fetches program data and saves to JSON for static hosting.
This script runs via GitHub Actions to update the data file.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from rag.seeds import UNIVERSITY_SEEDS
from rag.scraper import ProgramScraper

def scrape_and_save():
    """Scrape programs and save to JSON."""
    print("🤖 Starting RAG scraper...")
    
    # Scrape programs
    scraper = ProgramScraper()
    programs = scraper.scrape_all(UNIVERSITY_SEEDS)
    
    # Convert to dict format
    programs_data = []
    for prog in programs:
        programs_data.append({
            "id": prog.id,
            "university": prog.university,
            "program_name": prog.program_name,
            "country": prog.country,
            "city": prog.city,
            "language": prog.language or "English",
            "tuition_usd": prog.tuition_usd,
            "duration_months": prog.duration_months,
            "field": prog.field,
            "url": prog.url,
            "last_updated": prog.last_updated,
            "description_snippet": prog.description_snippet,
            "application_deadline": prog.application_deadline,
            "entry_requirements": prog.entry_requirements,
            "scholarship_available": prog.tuition_usd == 0 or (prog.tuition_usd and prog.tuition_usd < 10000),
            "tags": generate_tags(prog)
        })
    
    # Calculate stats
    countries = list(set(p.country for p in programs))
    tuitions = [p.tuition_usd for p in programs if p.tuition_usd]
    avg_tuition = sum(tuitions) / len(tuitions) if tuitions else 0
    
    # Build final data structure
    data = {
        "metadata": {
            "version": "1.0.0",
            "last_updated": datetime.now().isoformat(),
            "total_programs": len(programs_data),
            "total_countries": len(countries),
            "data_source": "RAG Pipeline - University Web Scraping"
        },
        "programs": programs_data,
        "countries": countries,
        "fields": ["robotics", "ai", "both"],
        "languages": list(set(p.language for p in programs if p.language)),
        "stats": {
            "avg_tuition": round(avg_tuition),
            "median_duration": 24,
            "scholarship_rate": sum(1 for p in programs if p.tuition_usd == 0 or (p.tuition_usd and p.tuition_usd < 10000)) / len(programs) if programs else 0,
            "robotics_programs": sum(1 for p in programs if p.field in ["robotics", "both"]),
            "ai_programs": sum(1 for p in programs if p.field in ["ai", "both"]),
            "hybrid_programs": sum(1 for p in programs if p.field == "both")
        }
    }
    
    # Save to data directory
    data_dir = Path(__file__).parent.parent / 'data'
    data_dir.mkdir(exist_ok=True)
    
    output_file = data_dir / 'programs.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Saved {len(programs_data)} programs to {output_file}")
    print(f"📊 Countries: {len(countries)}, Avg tuition: ${avg_tuition:,.0f}")
    
    return len(programs_data)

def generate_tags(program):
    """Generate search tags based on program attributes."""
    tags = []
    
    if program.tuition_usd == 0:
        tags.append("free tuition")
    elif program.tuition_usd and program.tuition_usd < 5000:
        tags.append("affordable")
    
    if program.duration_months == 12:
        tags.append("one-year")
    elif program.duration_months == 24:
        tags.append("two-year")
    
    if program.country in ["Germany", "Sweden", "Norway"]:
        tags.append("EU opportunities")
    
    if program.field == "robotics":
        tags.append("robotics")
    elif program.field == "ai":
        tags.append("artificial intelligence")
    else:
        tags.append("both fields")
    
    return tags

def update_json_from_seed():
    """Update JSON from seed data (fallback when scraping fails)."""
    print("📦 Generating JSON from seed data...")
    
    from db.init_db import get_seed_programs
    
    seed_data = get_seed_programs()
    programs_data = []
    
    for row in seed_data:
        prog_id, university, program_name, country, city, language, tuition, duration, field, url, desc, deadline = row
        programs_data.append({
            "id": prog_id,
            "university": university,
            "program_name": program_name,
            "country": country,
            "city": city,
            "language": language,
            "tuition_usd": tuition,
            "duration_months": duration,
            "field": field,
            "url": url,
            "last_updated": datetime.now().isoformat(),
            "description_snippet": desc,
            "application_deadline": deadline,
            "entry_requirements": None,
            "scholarship_available": tuition == 0 or (tuition and tuition < 10000),
            "tags": generate_tags_from_seed(tuition, duration, field, country)
        })
    
    countries = list(set(p["country"] for p in programs_data))
    tuitions = [p["tuition_usd"] for p in programs_data if p["tuition_usd"]]
    avg_tuition = sum(tuitions) / len(tuitions) if tuitions else 0
    
    data = {
        "metadata": {
            "version": "1.0.0",
            "last_updated": datetime.now().isoformat(),
            "total_programs": len(programs_data),
            "total_countries": len(countries),
            "data_source": "Seed Data (Manual Curation)"
        },
        "programs": programs_data,
        "countries": countries,
        "fields": ["robotics", "ai", "both"],
        "languages": ["English"],
        "stats": {
            "avg_tuition": round(avg_tuition),
            "median_duration": 24,
            "scholarship_rate": sum(1 for p in programs_data if p["scholarship_available"]) / len(programs_data) if programs_data else 0,
            "robotics_programs": sum(1 for p in programs_data if p["field"] in ["robotics", "both"]),
            "ai_programs": sum(1 for p in programs_data if p["field"] in ["ai", "both"]),
            "hybrid_programs": sum(1 for p in programs_data if p["field"] == "both")
        }
    }
    
    data_dir = Path(__file__).parent.parent / 'data'
    data_dir.mkdir(exist_ok=True)
    
    output_file = data_dir / 'programs.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Saved {len(programs_data)} programs from seed data to {output_file}")
    return len(programs_data)

def generate_tags_from_seed(tuition, duration, field, country):
    """Generate tags from seed data."""
    tags = []
    if tuition == 0:
        tags.append("free tuition")
    elif tuition and tuition < 5000:
        tags.append("affordable")
    if duration == 12:
        tags.append("one-year")
    elif duration == 24:
        tags.append("two-year")
    if field == "robotics":
        tags.append("robotics")
    elif field == "ai":
        tags.append("artificial intelligence")
    else:
        tags.append("both fields")
    return tags

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Scrape programs and save to JSON')
    parser.add_argument('--seed', action='store_true', help='Use seed data instead of scraping')
    args = parser.parse_args()
    
    if args.seed:
        update_json_from_seed()
    else:
        try:
            scrape_and_save()
        except Exception as e:
            print(f"⚠️ Scraping failed: {e}")
            print("Falling back to seed data...")
            update_json_from_seed()
