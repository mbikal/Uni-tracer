import React, { useState, useEffect } from 'react'
import { X, GitCompare, Loader2, ExternalLink, Check, AlertCircle } from 'lucide-react'
import { programApi } from '../api/client'

const COUNTRY_FLAGS = {
  'USA': '🇺🇸', 'UK': '🇬🇧', 'Switzerland': '🇨🇭', 'Netherlands': '🇳🇱',
  'Sweden': '🇸🇪', 'Germany': '🇩🇪', 'Canada': '🇨🇦', 'Singapore': '🇸🇬',
  'Australia': '🇦🇺', 'Italy': '🇮🇹', 'South Korea': '🇰🇷',
}

export function CompareTable({ programIds, onClose, onRemove }) {
  const [comparison, setComparison] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadComparison()
  }, [programIds])

  const loadComparison = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await programApi.compare(programIds)
      
      if (data.success) {
        setComparison(data.comparison)
      } else {
        setError(data.error || 'Failed to load comparison')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const formatValue = (row, program) => {
    const value = program[row.key]
    
    if (value === null || value === undefined) {
      return <span className="text-navy-600">—</span>
    }
    
    switch (row.type) {
      case 'currency':
        return value === 0 ? (
          <span className="text-green-400 font-semibold">Free</span>
        ) : (
          <span className="data-mono">${value.toLocaleString()}</span>
        )
      
      case 'duration':
        const years = value / 12
        return (
          <span className="data-mono">
            {years === 1 ? '1 year' : `${years} years`}
          </span>
        )
      
      case 'link':
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="link-cyan inline-flex items-center gap-1"
          >
            Visit <ExternalLink className="w-3 h-3" />
          </a>
        )
      
      default:
        return <span>{value}</span>
    }
  }

  const isHighlighted = (row, program) => {
    return row.highlight_best === program.id
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute inset-4 md:inset-8 lg:inset-16 bg-navy-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-navy-700 bg-navy-800/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-400/20 flex items-center justify-center">
              <GitCompare className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="font-bold text-warm-white">Compare Programs</h2>
              <p className="text-xs text-navy-600 data-mono">
                Side-by-side comparison
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-navy-700 text-warm-gray hover:text-warm-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 scrollbar-thin">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
              <p className="text-red-400 mb-4">{error}</p>
              <button onClick={loadComparison} className="btn-primary">
                Try Again
              </button>
            </div>
          ) : comparison && (
            <>
              {/* Summary */}
              {comparison.summary && (
                <div className="mb-6 p-4 card-gradient rounded-lg">
                  <p className="text-sm text-warm-gray">
                    <span className="text-cyan-400 font-semibold">Summary:</span>{' '}
                    {comparison.summary}
                  </p>
                </div>
              )}

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-4 text-xs font-semibold text-cyan-400 uppercase tracking-wider bg-navy-900/50 sticky left-0 z-10">
                        Attribute
                      </th>
                      {comparison.programs.map((program) => (
                        <th 
                          key={program.id} 
                          className="p-4 text-left min-w-[200px] bg-navy-900/50"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">
                                  {COUNTRY_FLAGS[program.country] || '🌍'}
                                </span>
                                <span className="text-xs text-navy-600 data-mono">
                                  {program.country}
                                </span>
                              </div>
                              <h3 className="font-semibold text-warm-white text-sm leading-tight">
                                {program.university}
                              </h3>
                            </div>
                            <button
                              onClick={() => onRemove(program.id)}
                              className="p-1 text-navy-600 hover:text-red-400 transition-colors"
                              title="Remove from comparison"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.rows.map((row, idx) => (
                      <tr 
                        key={row.key} 
                        className={idx % 2 === 0 ? 'bg-navy-800/30' : ''}
                      >
                        <td className="p-4 text-sm font-medium text-warm-gray sticky left-0 z-10 bg-navy-900/90">
                          {row.label}
                        </td>
                        {comparison.programs.map((program) => (
                          <td 
                            key={`${program.id}-${row.key}`}
                            className={`p-4 ${
                              isHighlighted(row, program) 
                                ? 'bg-green-500/10 border-l-2 border-green-500' 
                                : ''
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {formatValue(row, program)}
                              {isHighlighted(row, program) && (
                                <Check className="w-4 h-4 text-green-400" />
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="mt-6 flex items-center gap-2 text-xs text-navy-600">
                <div className="w-4 h-4 bg-green-500/10 border-l-2 border-green-500" />
                <span>Indicates best value in category</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
