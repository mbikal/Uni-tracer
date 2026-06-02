import React, { useState, useEffect } from 'react'
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import { programApi } from '../api/client'

const COUNTRIES = [
  'USA', 'UK', 'Switzerland', 'Netherlands', 'Sweden', 
  'Germany', 'Canada', 'Singapore', 'Australia', 'Italy', 'South Korea'
]

const LANGUAGES = ['English', 'German', 'French', 'Dutch', 'Swedish']

const FIELDS = [
  { value: '', label: 'All Fields' },
  { value: 'robotics', label: 'Robotics' },
  { value: 'ai', label: 'AI' },
  { value: 'both', label: 'Robotics & AI' }
]

const DURATIONS = [
  { value: '', label: 'Any Duration' },
  { value: '12', label: '12 months' },
  { value: '18', label: '18 months' },
  { value: '24', label: '24 months' }
]

export function FilterPanel({ filters, onFilterChange, onReset, isMobile = false }) {
  const [expanded, setExpanded] = useState(!isMobile)

  const handleReset = () => {
    onReset()
  }

  const FilterSection = ({ title, children }) => (
    <div className="mb-6">
      <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3">
        {title}
      </h4>
      {children}
    </div>
  )

  const content = (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-warm-white">Filters</span>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-navy-600 hover:text-cyan-400 transition-colors"
        >
          Reset all
        </button>
      </div>

      <FilterSection title="Field of Study">
        <div className="flex flex-wrap gap-2">
          {FIELDS.map((field) => (
            <button
              key={field.value}
              onClick={() => onFilterChange('field', field.value)}
              className={`pill-toggle ${filters.field === field.value ? 'active' : ''}`}
            >
              {field.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Country">
        <select
          value={filters.country}
          onChange={(e) => onFilterChange('country', e.target.value)}
          className="w-full input-dark text-sm"
        >
          <option value="">All Countries</option>
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </FilterSection>

      <FilterSection title="Language">
        <select
          value={filters.language}
          onChange={(e) => onFilterChange('language', e.target.value)}
          className="w-full input-dark text-sm"
        >
          <option value="">Any Language</option>
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </FilterSection>

      <FilterSection title="Duration">
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map((duration) => (
            <button
              key={duration.value}
              onClick={() => onFilterChange('duration', duration.value)}
              className={`pill-toggle ${filters.duration === duration.value ? 'active' : ''}`}
            >
              {duration.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Max Tuition (USD/year)">
        <input
          type="range"
          min="0"
          max="60000"
          step="1000"
          value={filters.tuition_max || 0}
          onChange={(e) => onFilterChange('tuition_max', e.target.value)}
          className="w-full h-2 bg-navy-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
        <div className="flex justify-between mt-2 text-xs text-navy-600">
          <span>$0</span>
          <span className="text-cyan-400 font-semibold">
            ${(filters.tuition_max || 0).toLocaleString()}
          </span>
          <span>$60k</span>
        </div>
      </FilterSection>
    </>
  )

  if (isMobile) {
    return (
      <div className="lg:hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-4 bg-navy-800 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-warm-white">Filters</span>
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-warm-gray" />
          ) : (
            <ChevronDown className="w-4 h-4 text-warm-gray" />
          )}
        </button>
        
        {expanded && (
          <div className="mt-2 p-4 bg-navy-800 rounded-lg border border-navy-700">
            {content}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="sticky top-24">
      <div className="p-6 bg-navy-800/50 backdrop-blur-sm rounded-xl border border-navy-700">
        {content}
      </div>
    </div>
  )
}
