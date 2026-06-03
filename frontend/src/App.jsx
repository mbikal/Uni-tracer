import { useState, useEffect } from 'react'
import { SearchBar } from './components/SearchBar'
import { FilterPanel } from './components/FilterPanel'
import { ProgramCard } from './components/ProgramCard'
import { FavoritesDrawer } from './components/FavoritesDrawer'
import { CompareTable } from './components/CompareTable'
import { LiveFeedTicker } from './components/LiveFeedTicker'
import { ProgramDetailModal } from './components/ProgramDetailModal'
import { useFavorites } from './hooks/useFavorites'
import { useFilters } from './hooks/useFilters'
// Use JSON client for static hosting (GitHub Pages)
// Switch to './api/client' if using backend API
import { programApi } from './api/jsonClient'
import { Loader2, Database, Globe, Heart, GitCompare, Sparkles } from 'lucide-react'

function App() {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({ total_programs: 0, total_countries: 0 })
  const [searchResults, setSearchResults] = useState(null)
  const [generatedSummary, setGeneratedSummary] = useState('')
  
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites()
  const { filters, updateFilter, resetFilters, filtersToQueryParams } = useFilters()
  
  const [compareList, setCompareList] = useState([])
  const [showCompare, setShowCompare] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState(null)

  // Load initial programs
  useEffect(() => {
    loadPrograms()
    loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reload when filters change
  useEffect(() => {
    loadPrograms()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const loadPrograms = async () => {
    try {
      setLoading(true)
      setError(null)
      setSearchResults(null)
      setGeneratedSummary('')
      
      const params = filtersToQueryParams()
      const data = await programApi.getPrograms(params)
      
      if (data.success) {
        setPrograms(data.programs)
      } else {
        setError(data.error || 'Failed to load programs')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await programApi.getStats()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (err) {
      console.error('Failed to load stats')
    }
  }

  const handleSearch = async (query) => {
    try {
      setSearchLoading(true)
      setError(null)
      
      const data = await programApi.search(query)
      
      if (data.success) {
        setSearchResults(data.results)
        setGeneratedSummary(data.generated_summary || '')
        setPrograms(data.results) // Show search results as programs
      } else {
        setError(data.error || 'Search failed')
      }
    } catch (err) {
      setError('Search failed - please try again')
    } finally {
      setSearchLoading(false)
    }
  }

  const toggleCompare = (programId) => {
    setCompareList(prev => {
      if (prev.includes(programId)) {
        return prev.filter(id => id !== programId)
      }
      if (prev.length >= 4) {
        return prev // Max 4
      }
      return [...prev, programId]
    })
  }

  const isInCompare = (programId) => compareList.includes(programId)

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Live Feed Ticker */}
      <LiveFeedTicker />
      
      {/* Header */}
      <header className="border-b border-navy-700 bg-navy-800/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-navy-900" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-warm-white">
                  Masters Tracker
                </h1>
                <p className="text-xs text-cyan-400 data-mono">
                  Robotics & AI Programs
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span className="data-mono text-warm-gray">
                    {stats.total_programs}+ programs
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="data-mono text-warm-gray">
                    {stats.total_countries} countries
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFavorites(true)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:inline">Favorites</span>
                  {favorites.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-cyan-400 text-navy-900 text-xs font-bold rounded-full">
                      {favorites.length}
                    </span>
                  )}
                </button>
                
                {compareList.length > 0 && (
                  <button
                    onClick={() => setShowCompare(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <GitCompare className="w-4 h-4" />
                    Compare ({compareList.length})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <SearchBar 
            onSearch={handleSearch} 
            loading={searchLoading}
          />
          
          {generatedSummary && (
            <div className="mt-4 p-4 card-gradient rounded-lg">
              <p className="text-warm-gray text-sm">
                <span className="text-cyan-400 font-semibold">AI Summary:</span>{' '}
                {generatedSummary}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterPanel 
              filters={filters}
              onFilterChange={updateFilter}
              onReset={resetFilters}
            />
          </aside>

          {/* Programs Grid */}
          <div className="flex-1">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <FilterPanel 
                filters={filters}
                onFilterChange={updateFilter}
                onReset={resetFilters}
                isMobile={true}
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-400 mb-4">{error}</p>
                <button onClick={loadPrograms} className="btn-primary">
                  Try Again
                </button>
              </div>
            ) : programs.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-warm-gray mb-4">No programs found matching your criteria</p>
                <button onClick={resetFilters} className="btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-warm-gray text-sm">
                    Showing <span className="text-cyan-400 font-semibold">{programs.length}</span> programs
                    {searchResults && (
                      <span className="ml-2 text-cyan-400">(search results)</span>
                    )}
                  </p>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {programs.map((program, index) => (
                    <ProgramCard
                      key={program.id}
                      program={program}
                      index={index}
                      isFavorite={isFavorite(program.id)}
                      isInCompare={isInCompare(program.id)}
                      onToggleFavorite={() => 
                        isFavorite(program.id) 
                          ? removeFavorite(program.id)
                          : addFavorite(program)
                      }
                      onToggleCompare={() => toggleCompare(program.id)}
                      onClick={() => setSelectedProgram(program)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Favorites Drawer */}
      {showFavorites && (
        <FavoritesDrawer
          favorites={favorites}
          onClose={() => setShowFavorites(false)}
          onRemove={removeFavorite}
        />
      )}

      {/* Compare Modal */}
      {showCompare && (
        <CompareTable
          programIds={compareList}
          onClose={() => setShowCompare(false)}
          onRemove={toggleCompare}
        />
      )}

      {/* Program Detail Modal with Scholarship & Roadmap */}
      {selectedProgram && (
        <ProgramDetailModal
          program={selectedProgram}
          onClose={() => setSelectedProgram(null)}
        />
      )}
    </div>
  )
}

export default App
