import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'masters_tracker_favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState([])
  const [initialized, setInitialized] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setFavorites(JSON.parse(stored))
      }
    } catch (err) {
      console.error('Failed to load favorites:', err)
    }
    setInitialized(true)
  }, [])

  // Save to localStorage whenever favorites change
  useEffect(() => {
    if (initialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
      } catch (err) {
        console.error('Failed to save favorites:', err)
      }
    }
  }, [favorites, initialized])

  const addFavorite = useCallback((program) => {
    setFavorites(prev => {
      // Avoid duplicates
      if (prev.some(f => f.id === program.id)) {
        return prev
      }
      return [...prev, program]
    })
  }, [])

  const removeFavorite = useCallback((programId) => {
    setFavorites(prev => prev.filter(f => f.id !== programId))
  }, [])

  const isFavorite = useCallback((programId) => {
    return favorites.some(f => f.id === programId)
  }, [favorites])

  const clearFavorites = useCallback(() => {
    setFavorites([])
  }, [])

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    clearFavorites,
  }
}
