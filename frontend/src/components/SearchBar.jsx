import React, { useState, useCallback } from 'react'
import { Search, Loader2, Sparkles } from 'lucide-react'

export function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(null)

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    if (query.trim() && !loading) {
      onSearch(query.trim())
    }
  }, [query, loading, onSearch])

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for programs: 'affordable AI masters in Europe with scholarship'"
          className="w-full input-dark pl-12 pr-32 py-4 text-base"
          disabled={loading}
        />
        
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
        </div>
        
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Search</span>
            </>
          )}
        </button>
      </div>
      
      <p className="mt-2 text-xs text-navy-600">
        Try: "robotics in Germany under $10k" or "AI masters with scholarships in USA"
      </p>
    </form>
  )
}
