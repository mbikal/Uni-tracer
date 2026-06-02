import React from 'react'
import { Heart, ExternalLink, GitCompare, Clock, DollarSign, MapPin, Globe, Bot, Brain } from 'lucide-react'

const COUNTRY_FLAGS = {
  'USA': '🇺🇸',
  'UK': '🇬🇧',
  'Switzerland': '🇨🇭',
  'Netherlands': '🇳🇱',
  'Sweden': '🇸🇪',
  'Germany': '🇩🇪',
  'Canada': '🇨🇦',
  'Singapore': '🇸🇬',
  'Australia': '🇦🇺',
  'Italy': '🇮🇹',
  'South Korea': '🇰🇷',
}

export function ProgramCard({ 
  program, 
  index, 
  isFavorite, 
  isInCompare,
  onToggleFavorite, 
  onToggleCompare 
}) {
  const flag = COUNTRY_FLAGS[program.country] || '🌍'
  
  const getFieldIcon = () => {
    if (program.field === 'robotics') return <Bot className="w-4 h-4" />
    if (program.field === 'ai') return <Brain className="w-4 h-4" />
    return <Bot className="w-4 h-4" />
  }

  const getFieldLabel = () => {
    if (program.field === 'robotics') return 'Robotics'
    if (program.field === 'ai') return 'AI'
    return 'Robotics & AI'
  }

  const formatTuition = (tuition) => {
    if (!tuition && tuition !== 0) return 'Tuition info unavailable'
    if (tuition === 0) return 'Free tuition'
    return `$${tuition.toLocaleString()}/year`
  }

  const formatDuration = (months) => {
    if (!months) return 'Duration unknown'
    if (months === 12) return '1 year'
    if (months % 12 === 0) return `${months / 12} years`
    return `${months} months`
  }

  return (
    <div 
      className="card-gradient rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl" role="img" aria-label={program.country}>
              {flag}
            </span>
            <span className="text-xs font-medium text-cyan-400 data-mono">
              {program.country}
            </span>
          </div>
          <h3 className="font-bold text-warm-white text-lg leading-tight mb-1">
            {program.program_name}
          </h3>
          <p className="text-sm text-warm-gray">
            {program.university}
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 ml-2">
          <button
            onClick={onToggleFavorite}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isFavorite 
                ? 'bg-red-500/20 text-red-400' 
                : 'bg-navy-700 text-warm-gray hover:text-red-400'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={onToggleCompare}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isInCompare 
                ? 'bg-cyan-400/20 text-cyan-400' 
                : 'bg-navy-700 text-warm-gray hover:text-cyan-400'
            }`}
            title={isInCompare ? 'Remove from comparison' : 'Add to comparison'}
          >
            <GitCompare className={`w-4 h-4 ${isInCompare ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-warm-gray mb-4 line-clamp-2">
        {program.description_snippet || 'No description available'}
      </p>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-navy-700 rounded text-xs text-warm-gray data-mono">
          {getFieldIcon()}
          {getFieldLabel()}
        </span>
        
        {program.language && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-navy-700 rounded text-xs text-warm-gray data-mono">
            <Globe className="w-3 h-3" />
            {program.language}
          </span>
        )}
        
        {program.city && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-navy-700 rounded text-xs text-warm-gray data-mono">
            <MapPin className="w-3 h-3" />
            {program.city}
          </span>
        )}
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 mb-4 pt-4 border-t border-navy-700/50">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-cyan-400" />
          <span className={`data-mono text-sm ${
            program.tuition_usd === 0 
              ? 'text-green-400' 
              : program.tuition_usd && program.tuition_usd < 10000 
                ? 'text-warm-white' 
                : 'text-warm-white'
          }`}>
            {formatTuition(program.tuition_usd)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span className="data-mono text-sm text-warm-white">
            {formatDuration(program.duration_months)}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-navy-700/50">
        <span className="text-xs text-navy-600 data-mono">
          Updated: {new Date(program.last_updated).toLocaleDateString()}
        </span>
        
        <a
          href={program.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm link-cyan"
        >
          Visit Website
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}
