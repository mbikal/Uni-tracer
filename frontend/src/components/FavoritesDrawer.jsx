// React import not needed in React 18 with JSX transform
import { X, Heart, ExternalLink, Trash2 } from 'lucide-react'

const COUNTRY_FLAGS = {
  'USA': '🇺🇸', 'UK': '🇬🇧', 'Switzerland': '🇨🇭', 'Netherlands': '🇳🇱',
  'Sweden': '🇸🇪', 'Germany': '🇩🇪', 'Canada': '🇨🇦', 'Singapore': '🇸🇬',
  'Australia': '🇦🇺', 'Italy': '🇮🇹', 'South Korea': '🇰🇷',
}

export function FavoritesDrawer({ favorites, onClose, onRemove }) {
  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-navy-800 border-l border-navy-700 shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-navy-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-400 fill-current" />
            </div>
            <div>
              <h2 className="font-bold text-warm-white">Favorites</h2>
              <p className="text-xs text-navy-600 data-mono">
                {favorites.length} saved
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
        <div className="p-6 overflow-y-auto h-[calc(100%-88px)] scrollbar-thin">
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-navy-700 mx-auto mb-4" />
              <p className="text-warm-gray mb-2">No favorites yet</p>
              <p className="text-sm text-navy-600">
                Click the heart icon on programs to save them here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {favorites.map((program) => (
                <div
                  key={program.id}
                  className="card-gradient rounded-lg p-4 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {COUNTRY_FLAGS[program.country] || '🌍'}
                      </span>
                      <span className="text-xs font-medium text-cyan-400 data-mono">
                        {program.country}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => onRemove(program.id)}
                      className="p-1.5 rounded text-navy-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h3 className="font-semibold text-warm-white text-sm mb-1">
                    {program.program_name}
                  </h3>
                  <p className="text-xs text-warm-gray mb-3">
                    {program.university}
                  </p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-navy-700/50">
                    <span className="data-mono text-xs text-cyan-400">
                      {program.tuition_usd === 0 
                        ? 'Free' 
                        : program.tuition_usd 
                          ? `$${program.tuition_usd.toLocaleString()}`
                          : 'N/A'
                      }
                    </span>
                    
                    <a
                      href={program.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs link-cyan"
                    >
                      Visit
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
