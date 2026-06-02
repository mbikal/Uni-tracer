"""
Seed list of universities and their program pages for scraping.
Each entry contains the university name, country, and URL to scrape.
"""

UNIVERSITY_SEEDS = [
    {
        "name": "MIT",
        "country": "USA",
        "city": "Cambridge, MA",
        "programs_page_url": "https://meche.mit.edu/",
        "type": "robotics",
        "notes": "Leading robotics program with MechE department"
    },
    {
        "name": "Stanford University",
        "country": "USA", 
        "city": "Stanford, CA",
        "programs_page_url": "https://cs.stanford.edu/",
        "type": "ai",
        "notes": "Premier AI program, CS department"
    },
    {
        "name": "Carnegie Mellon University",
        "country": "USA",
        "city": "Pittsburgh, PA", 
        "programs_page_url": "https://www.ri.cmu.edu/",
        "type": "robotics",
        "notes": "World-renowned Robotics Institute"
    },
    {
        "name": "ETH Zurich",
        "country": "Switzerland",
        "city": "Zurich",
        "programs_page_url": "https://rsc.ethz.ch/",
        "type": "robotics",
        "notes": "MSc Robotics, Systems and Control"
    },
    {
        "name": "TU Delft",
        "country": "Netherlands",
        "city": "Delft",
        "programs_page_url": "https://www.tudelft.nl/",
        "type": "robotics",
        "notes": "Top Dutch technical university"
    },
    {
        "name": "Imperial College London",
        "country": "UK",
        "city": "London",
        "programs_page_url": "https://www.imperial.ac.uk/",
        "type": "ai",
        "notes": "Leading UK institution"
    },
    {
        "name": "University of Edinburgh",
        "country": "UK",
        "city": "Edinburgh",
        "programs_page_url": "https://www.ed.ac.uk/",
        "type": "ai",
        "notes": "Historic AI program"
    },
    {
        "name": "KTH Royal Institute of Technology",
        "country": "Sweden",
        "city": "Stockholm",
        "programs_page_url": "https://www.kth.se/",
        "type": "robotics",
        "notes": "Systems, Control and Robotics MSc"
    },
    {
        "name": "EPFL",
        "country": "Switzerland",
        "city": "Lausanne",
        "programs_page_url": "https://www.epfl.ch/",
        "type": "robotics",
        "notes": "Swiss Federal Institute of Technology"
    },
    {
        "name": "National University of Singapore",
        "country": "Singapore",
        "city": "Singapore",
        "programs_page_url": "https://www.nus.edu.sg/",
        "type": "robotics",
        "notes": "Leading Asian program"
    },
    {
        "name": "University of Toronto",
        "country": "Canada",
        "city": "Toronto",
        "programs_page_url": "https://www.utoronto.ca/",
        "type": "ai",
        "notes": "Vector Institute affiliation"
    },
    {
        "name": "Technical University of Munich",
        "country": "Germany",
        "city": "Munich",
        "programs_page_url": "https://www.tum.de/",
        "type": "both",
        "notes": "Elite German technical university"
    },
    {
        "name": "Politecnico di Milano",
        "country": "Italy",
        "city": "Milan",
        "programs_page_url": "https://www.polimi.it/",
        "type": "robotics",
        "notes": "Top Italian technical university"
    },
    {
        "name": "KAIST",
        "country": "South Korea",
        "city": "Daejeon",
        "programs_page_url": "https://www.kaist.ac.kr/",
        "type": "ai",
        "notes": "Korea Advanced Institute of Science and Technology"
    },
    {
        "name": "University of Melbourne",
        "country": "Australia",
        "city": "Melbourne",
        "programs_page_url": "https://www.unimelb.edu.au/",
        "type": "ai",
        "notes": "Leading Australian university"
    }
]

# Currency conversion rates to USD (approximate)
FX_RATES = {
    "USD": 1.0,
    "EUR": 1.09,
    "GBP": 1.27,
    "CHF": 1.14,
    "SEK": 0.095,
    "NOK": 0.093,
    "DKK": 0.146,
    "SGD": 0.75,
    "CAD": 0.74,
    "AUD": 0.66,
    "JPY": 0.0067,
    "KRW": 0.00076
}

def get_seeds_by_country(country: str = None):
    """Get seeds filtered by country."""
    if country:
        return [s for s in UNIVERSITY_SEEDS if s['country'].lower() == country.lower()]
    return UNIVERSITY_SEEDS

def get_seeds_by_type(type_filter: str = None):
    """Get seeds filtered by type (robotics, ai, both)."""
    if type_filter:
        return [s for s in UNIVERSITY_SEEDS if s['type'] == type_filter or s['type'] == 'both']
    return UNIVERSITY_SEEDS
