import { useState, useCallback } from 'react'

const DEFAULT_FILTERS = {
  country: '',
  language: '',
  tuition_max: '',
  duration: '',
  field: '',
}

export function useFilters() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  const filtersToQueryParams = useCallback(() => {
    const params = {}
    
    if (filters.country) params.country = filters.country
    if (filters.language) params.language = filters.language
    if (filters.tuition_max) params.tuition_max = parseInt(filters.tuition_max, 10)
    if (filters.duration) params.duration = parseInt(filters.duration, 10)
    if (filters.field) params.field = filters.field
    
    return params
  }, [filters])

  const activeFiltersCount = Object.values(filters).filter(v => v !== '' && v !== 0).length

  return {
    filters,
    updateFilter,
    resetFilters,
    filtersToQueryParams,
    activeFiltersCount,
  }
}
