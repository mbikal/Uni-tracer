import { useState, useEffect } from 'react'
import { programApi } from '../api/client'

export function LiveFeedTicker() {
  const [updates, setUpdates] = useState([])

  useEffect(() => {
    loadRecentUpdates()
    
    // Refresh every 5 minutes
    const interval = setInterval(loadRecentUpdates, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadRecentUpdates = async () => {
    try {
      // Get programs and create fake "recent updates" based on last_updated
      const data = await programApi.getPrograms({})
      
      if (data.success && data.programs.length > 0) {
        // Sort by last_updated and take recent ones
        const sorted = [...data.programs]
          .sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated))
          .slice(0, 5)
        
        const updates = sorted.map(program => {
          const date = new Date(program.last_updated)
          const hoursAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60))
          
          let timeText
          if (hoursAgo < 1) {
            timeText = 'just now'
          } else if (hoursAgo < 24) {
            timeText = `${hoursAgo}h ago`
          } else {
            const daysAgo = Math.floor(hoursAgo / 24)
            timeText = daysAgo === 1 ? 'yesterday' : `${daysAgo} days ago`
          }
          
          return {
            id: program.id,
            text: `${program.university} - ${program.program_name} updated ${timeText}`,
            isNew: hoursAgo < 24
          }
        })
        
        setUpdates(updates)
      }
    } catch (err) {
      // Silently fail - ticker is non-critical
      setUpdates([])
    } finally {
      setLoading(false)
    }
  }

  // Duplicate items for seamless loop
  const duplicatedUpdates = [...updates, ...updates]

  if (updates.length === 0) {
    return null
  }

  return (
    <div className="bg-navy-800 border-b border-navy-700 overflow-hidden">
      <div className="flex items-center">
        {/* Live indicator */}
        <div className="flex-shrink-0 px-4 py-2 bg-navy-900 flex items-center gap-2 z-10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
            LIVE
          </span>
        </div>
        
        {/* Scrolling ticker */}
        <div className="flex-1 overflow-hidden py-2">
          <div className="animate-ticker flex whitespace-nowrap">
            {duplicatedUpdates.map((update, idx) => (
              <React.Fragment key={`${update.id}-${idx}`}>
                <span className="mx-8 text-sm text-warm-gray">
                  <span className="text-cyan-400">•</span>{' '}
                  {update.text}
                  {update.isNew && (
                    <span className="ml-2 px-1.5 py-0.5 bg-cyan-400/20 text-cyan-400 text-xs rounded">
                      NEW
                    </span>
                  )}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
