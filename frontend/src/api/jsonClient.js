/**
 * JSON-based API Client
 * Fetches data from static JSON file for GitHub Pages hosting
 * No backend server required!
 */

// Embedded fallback data - ensures app always works
const EMBEDDED_DATA = {
  "metadata": {
    "version": "1.0.0",
    "last_updated": "2024-06-02T20:00:00Z",
    "total_programs": 8,
    "total_countries": 6,
    "data_source": "Embedded Fallback"
  },
  "programs": [
    {"id":"prog_001","university":"MIT","program_name":"MSc in Robotics","country":"USA","city":"Cambridge, MA","language":"English","tuition_usd":55000,"duration_months":24,"field":"robotics","url":"https://meche.mit.edu/","description_snippet":"Leading robotics program with focus on autonomous systems.","scholarship_available":true,"tags":["robotics","autonomous systems"]},
    {"id":"prog_002","university":"Stanford","program_name":"MS in Computer Science - AI","country":"USA","city":"Stanford, CA","language":"English","tuition_usd":60000,"duration_months":24,"field":"ai","url":"https://cs.stanford.edu/","description_snippet":"Premier AI program with cutting-edge research.","scholarship_available":true,"tags":["ai","machine learning"]},
    {"id":"prog_003","university":"Carnegie Mellon","program_name":"MS in Robotics","country":"USA","city":"Pittsburgh, PA","language":"English","tuition_usd":50000,"duration_months":24,"field":"robotics","url":"https://www.ri.cmu.edu/","description_snippet":"World-renowned Robotics Institute.","scholarship_available":true,"tags":["robotics","research"]},
    {"id":"prog_004","university":"Imperial College London","program_name":"MSc in Artificial Intelligence","country":"UK","city":"London","language":"English","tuition_usd":35000,"duration_months":12,"field":"ai","url":"https://www.imperial.ac.uk/","description_snippet":"One-year intensive AI masters from leading UK institution.","scholarship_available":false,"tags":["ai","one-year","uk"]},
    {"id":"prog_005","university":"University of Edinburgh","program_name":"MSc in Artificial Intelligence","country":"UK","city":"Edinburgh","language":"English","tuition_usd":28000,"duration_months":12,"field":"ai","url":"https://www.ed.ac.uk/","description_snippet":"Historic AI program with strong theoretical foundations.","scholarship_available":true,"tags":["ai","uk","research"]},
    {"id":"prog_006","university":"KTH Royal Institute","program_name":"MSc in Systems, Control and Robotics","country":"Sweden","city":"Stockholm","language":"English","tuition_usd":0,"duration_months":24,"field":"robotics","url":"https://www.kth.se/","description_snippet":"No tuition for EU students. Strong control theory focus.","scholarship_available":true,"tags":["robotics","free tuition","europe"]},
    {"id":"prog_007","university":"TU Munich","program_name":"MSc in Robotics, Cognition, Intelligence","country":"Germany","city":"Munich","language":"English","tuition_usd":0,"duration_months":24,"field":"both","url":"https://www.tum.de/","description_snippet":"Elite German technical university. No tuition for all students.","scholarship_available":true,"tags":["robotics","ai","free tuition"]},
    {"id":"prog_008","university":"Politecnico di Milano","program_name":"MSc in Automation and Control","country":"Italy","city":"Milan","language":"English","tuition_usd":4000,"duration_months":24,"field":"robotics","url":"https://www.polimi.it/","description_snippet":"Top Italian technical university with automation focus.","scholarship_available":true,"tags":["robotics","affordable","italy"]}
  ],
  "countries": ["Germany","Italy","Spain","Sweden","UK","USA"],
  "fields": ["robotics","ai","both"],
  "languages": ["English"],
  "stats": {"avg_tuition":29000,"median_duration":24,"scholarship_rate":0.75,"robotics_programs":5,"ai_programs":3,"hybrid_programs":1}
}

// Try multiple paths for different deployment scenarios
const DATA_URLS = [
  '/data/programs.json',           // Vite public folder (dev & production)
  './data/programs.json',          // Relative path
  'data/programs.json',            // No leading slash
]

let cachedData = null
let lastFetch = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

async function fetchData() {
  const now = Date.now()
  
  // Return cached data if fresh
  if (cachedData && (now - lastFetch) < CACHE_DURATION) {
    return cachedData
  }
  
  // Try each URL until one works
  for (const url of DATA_URLS) {
    try {
      console.log(`Trying to fetch from: ${url}`)
      const response = await fetch(url)
      
      if (!response.ok) {
        console.warn(`Failed: ${url} - HTTP ${response.status}`)
        continue
      }
      
      const text = await response.text()
      
      // Check if response is actually JSON
      if (!text.trim().startsWith('{')) {
        console.warn(`Failed: ${url} - Not valid JSON (starts with: ${text.slice(0, 50)})`)
        continue
      }
      
      try {
        const data = JSON.parse(text)
        console.log(`✅ Successfully loaded data from: ${url}`)
        cachedData = data
        lastFetch = now
        return data
      } catch (parseError) {
        console.error(`JSON parse error from ${url}:`, parseError)
        continue
      }
    } catch (error) {
      console.warn(`Failed to fetch ${url}:`, error.message)
      // Continue to next URL
    }
  }
  
  // All fetches failed, use embedded data as fallback
  console.warn('⚠️ All data fetches failed, using embedded fallback data')
  cachedData = EMBEDDED_DATA
  lastFetch = now
  return EMBEDDED_DATA
}

export const programApi = {
  // Get all programs with optional filtering
  getPrograms: async (filters = {}) => {
    const data = await fetchData()
    let programs = data.programs
    
    // Apply filters
    if (filters.country) {
      programs = programs.filter(p => p.country === filters.country)
    }
    
    if (filters.language) {
      programs = programs.filter(p => p.language === filters.language)
    }
    
    if (filters.tuition_max) {
      programs = programs.filter(p => 
        p.tuition_usd === null || p.tuition_usd <= filters.tuition_max
      )
    }
    
    if (filters.duration) {
      programs = programs.filter(p => p.duration_months === filters.duration)
    }
    
    if (filters.field && filters.field !== 'both') {
      programs = programs.filter(p => 
        p.field === filters.field || p.field === 'both'
      )
    }
    
    return {
      success: true,
      count: programs.length,
      programs: programs
    }
  },

  // Get single program
  getProgram: async (id) => {
    const data = await fetchData()
    const program = data.programs.find(p => p.id === id)
    
    if (!program) {
      return { success: false, error: 'Program not found' }
    }
    
    return { success: true, program }
  },

  // Semantic-like search (client-side filtering with scoring)
  search: async (query, topK = 10) => {
    const data = await fetchData()
    const queryLower = query.toLowerCase()
    const queryTerms = queryLower.split(/\s+/)
    
    // Score each program
    const scored = data.programs.map(program => {
      let score = 0
      const text = `${program.university} ${program.program_name} ${program.description_snippet} ${program.country} ${program.tags?.join(' ') || ''}`.toLowerCase()
      
      // Exact phrase match
      if (text.includes(queryLower)) {
        score += 10
      }
      
      // Individual term matches
      queryTerms.forEach(term => {
        if (text.includes(term)) score += 2
      })
      
      // Keyword bonuses
      if (queryLower.includes('free') && program.tuition_usd === 0) score += 15
      if (queryLower.includes('affordable') && program.tuition_usd && program.tuition_usd < 10000) score += 10
      if (queryLower.includes('europe') && ['Switzerland', 'Netherlands', 'Sweden', 'Germany', 'Italy', 'UK'].includes(program.country)) score += 5
      if (queryLower.includes('robotics') && program.field === 'robotics') score += 8
      if (queryLower.includes('ai') && program.field === 'ai') score += 8
      
      return { ...program, relevance_score: score }
    })
    
    // Sort by score and take top results
    const results = scored
      .filter(p => p.relevance_score > 0)
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, topK)
    
    // Generate summary
    const summary = generateSearchSummary(query, results)
    
    return {
      success: true,
      query,
      results,
      generated_summary: summary,
      search_type: 'keyword'
    }
  },

  // Compare programs
  compare: async (ids) => {
    const data = await fetchData()
    const programs = data.programs.filter(p => ids.includes(p.id))
    
    if (programs.length < 2) {
      return { success: false, error: 'Programs not found' }
    }
    
    // Build comparison structure
    const comparison = buildComparison(programs)
    
    return { success: true, comparison }
  },

  // Get countries list
  getCountries: async () => {
    const data = await fetchData()
    return {
      success: true,
      countries: data.countries
    }
  },

  // Get stats
  getStats: async () => {
    const data = await fetchData()
    return {
      success: true,
      stats: {
        total_programs: data.metadata.total_programs,
        total_countries: data.metadata.total_countries,
        last_updated: data.metadata.last_updated,
        ...data.stats
      }
    }
  }
}

function generateSearchSummary(query, results) {
  if (results.length === 0) {
    return "No matching programs found. Try different search terms."
  }
  
  const countries = [...new Set(results.map(r => r.country))]
  const fields = [...new Set(results.map(r => r.field))]
  const avgTuition = results.reduce((sum, r) => sum + (r.tuition_usd || 0), 0) / results.length
  
  let parts = [`Found ${results.length} programs`]
  
  if (countries.length === 1) {
    parts.push(`in ${countries[0]}`)
  } else {
    parts.push(`across ${countries.length} countries`)
  }
  
  if (fields.includes('robotics') && fields.includes('ai')) {
    parts.push("covering both Robotics and AI")
  } else if (fields.includes('robotics')) {
    parts.push("focused on Robotics")
  } else if (fields.includes('ai')) {
    parts.push("focused on AI")
  }
  
  if (avgTuition < 5000) {
    parts.push("with affordable tuition options")
  }
  
  return parts.join(" ") + "."
}

function buildComparison(programs) {
  const rows = [
    { label: 'University', key: 'university', type: 'text' },
    { label: 'Program', key: 'program_name', type: 'text' },
    { label: 'Country', key: 'country', type: 'text' },
    { label: 'City', key: 'city', type: 'text' },
    { label: 'Annual Tuition (USD)', key: 'tuition_usd', type: 'currency' },
    { label: 'Duration', key: 'duration_months', type: 'duration' },
    { label: 'Language', key: 'language', type: 'text' },
    { label: 'Field', key: 'field', type: 'text' },
    { label: 'Application Deadline', key: 'application_deadline', type: 'date' },
    { label: 'Description', key: 'description_snippet', type: 'text' },
    { label: 'Website', key: 'url', type: 'link' }
  ]
  
  // Calculate highlights
  const highlights = {}
  
  const tuitions = programs.map((p, i) => ({ i, val: p.tuition_usd })).filter(x => x.val !== null)
  if (tuitions.length > 0) {
    const minIdx = tuitions.reduce((min, x) => x.val < min.val ? x : min)
    highlights.tuition_usd = programs[minIdx.i].id
  }
  
  const durations = programs.map((p, i) => ({ i, val: p.duration_months })).filter(x => x.val !== null)
  if (durations.length > 0) {
    const minIdx = durations.reduce((min, x) => x.val < min.val ? x : min)
    highlights.duration_months = programs[minIdx.i].id
  }
  
  return {
    programs,
    rows,
    highlights,
    summary: generateComparisonSummary(programs)
  }
}

function generateComparisonSummary(programs) {
  const parts = []
  
  const tuitions = programs.map(p => p.tuition_usd).filter(t => t !== null)
  if (tuitions.length > 0) {
    const min = Math.min(...tuitions)
    const max = Math.max(...tuitions)
    if (max - min > 20000) {
      parts.push(`Tuition range: $${min.toLocaleString()} - $${max.toLocaleString()}`)
    } else if (min === 0) {
      parts.push("Free tuition option available")
    }
  }
  
  const durations = [...new Set(programs.map(p => p.duration_months).filter(d => d))]
  if (durations.length === 1) {
    parts.push(`All ${durations[0]}-month programs`)
  }
  
  const countries = [...new Set(programs.map(p => p.country))]
  if (countries.length === 1) {
    parts.push(`All in ${countries[0]}`)
  }
  
  return parts.join(" | ") || "Compare the programs below"
}

export default programApi
