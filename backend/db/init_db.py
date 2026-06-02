import sqlite3
import os

def init_db(db_path):
    """Initialize the SQLite database with required tables."""
    # Ensure directory exists
    db_dir = os.path.dirname(db_path)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create programs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS programs (
            id TEXT PRIMARY KEY,
            university TEXT NOT NULL,
            program_name TEXT NOT NULL,
            country TEXT NOT NULL,
            city TEXT,
            language TEXT,
            tuition_usd INTEGER,
            duration_months INTEGER,
            field TEXT CHECK(field IN ('robotics', 'ai', 'both')),
            url TEXT NOT NULL,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            description_snippet TEXT,
            application_deadline TEXT,
            entry_requirements TEXT,
            full_description TEXT,
            contact_email TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create index for faster queries
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_country ON programs(country)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_field ON programs(field)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_tuition ON programs(tuition_usd)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_last_updated ON programs(last_updated)')
    
    # Create search_logs table for analytics
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS search_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            query TEXT,
            filters TEXT,
            results_count INTEGER,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create seed data if table is empty
    cursor.execute('SELECT COUNT(*) FROM programs')
    if cursor.fetchone()[0] == 0:
        seed_data = get_seed_programs()
        cursor.executemany('''
            INSERT INTO programs 
            (id, university, program_name, country, city, language, tuition_usd, 
             duration_months, field, url, description_snippet, application_deadline)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', seed_data)
    
    conn.commit()
    conn.close()
    print(f"Database initialized at: {db_path}")

def get_seed_programs():
    """Return seed data for initial database population."""
    return [
        ('prog_001', 'MIT', 'MSc in Robotics', 'USA', 'Cambridge, MA', 'English', 55000, 24, 'robotics', 
         'https://meche.mit.edu/', 'Leading robotics program with focus on autonomous systems.', '2024-12-15'),
        ('prog_002', 'Stanford University', 'MS in Computer Science - AI Track', 'USA', 'Stanford, CA', 'English', 60000, 24, 'ai',
         'https://cs.stanford.edu/', 'Premier AI program with research in machine learning and robotics.', '2024-12-01'),
        ('prog_003', 'Carnegie Mellon University', 'MS in Robotics', 'USA', 'Pittsburgh, PA', 'English', 50000, 24, 'robotics',
         'https://www.ri.cmu.edu/', 'World-renowned robotics institute with interdisciplinary approach.', '2025-01-15'),
        ('prog_004', 'ETH Zurich', 'MSc in Robotics, Systems and Control', 'Switzerland', 'Zurich', 'English', 1500, 24, 'robotics',
         'https://rsc.ethz.ch/', 'Elite European program with strong industry connections.', '2024-12-20'),
        ('prog_005', 'TU Delft', 'MSc in Robotics', 'Netherlands', 'Delft', 'English', 2000, 24, 'robotics',
         'https://www.tudelft.nl/', 'Top Dutch technical university with robotics specialization.', '2025-01-31'),
        ('prog_006', 'Imperial College London', 'MSc in Artificial Intelligence', 'UK', 'London', 'English', 35000, 12, 'ai',
         'https://www.imperial.ac.uk/', 'One-year intensive AI masters from leading UK institution.', '2024-11-30'),
        ('prog_007', 'University of Edinburgh', 'MSc in Artificial Intelligence', 'UK', 'Edinburgh', 'English', 28000, 12, 'ai',
         'https://www.ed.ac.uk/', 'Historic AI program with strong theoretical foundations.', '2025-03-31'),
        ('prog_008', 'KTH Royal Institute', 'MSc in Systems, Control and Robotics', 'Sweden', 'Stockholm', 'English', 0, 24, 'robotics',
         'https://www.kth.se/', 'No tuition for EU students. Strong control theory focus.', '2025-01-15'),
        ('prog_009', 'EPFL', 'MSc in Robotics', 'Switzerland', 'Lausanne', 'English', 1500, 24, 'robotics',
         'https://www.epfl.ch/', 'Top-tier Swiss technical university with robotics excellence.', '2024-12-15'),
        ('prog_010', 'NUS Singapore', 'MSc in Robotics', 'Singapore', 'Singapore', 'English', 45000, 12, 'robotics',
         'https://www.nus.edu.sg/', 'Leading Asian program with industry partnerships.', '2025-02-28'),
    ]
