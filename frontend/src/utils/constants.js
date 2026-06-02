// Application constants

export const APP_NAME = 'Global Masters in Robotics & AI Tracker'
export const APP_VERSION = '1.0.0'

export const FIELDS = {
  ROBOTICS: 'robotics',
  AI: 'ai',
  BOTH: 'both'
}

export const DURATIONS = [12, 18, 24]

export const TUITION_RANGES = {
  FREE: { min: 0, max: 0, label: 'Free' },
  AFFORDABLE: { min: 1, max: 10000, label: 'Under $10k' },
  MODERATE: { min: 10001, max: 30000, label: '$10k - $30k' },
  EXPENSIVE: { min: 30001, max: 60000, label: '$30k - $60k' },
  PREMIUM: { min: 60001, max: Infinity, label: '$60k+' }
}

export const LANGUAGES = [
  'English',
  'German',
  'French',
  'Dutch',
  'Swedish',
  'Spanish',
  'Italian',
  'Korean'
]

export const COUNTRY_FLAGS = {
  'USA': '🇺🇸',
  'UK': '🇬🇧',
  'United Kingdom': '🇬🇧',
  'Switzerland': '🇨🇭',
  'Netherlands': '🇳🇱',
  'Sweden': '🇸🇪',
  'Germany': '🇩🇪',
  'Canada': '🇨🇦',
  'Singapore': '🇸🇬',
  'Australia': '🇦🇺',
  'Italy': '🇮🇹',
  'South Korea': '🇰🇷',
  'France': '🇫🇷',
  'Spain': '🇪🇸',
  'Japan': '🇯🇵',
  'China': '🇨🇳',
  'India': '🇮🇳',
  'Brazil': '🇧🇷',
  'Mexico': '🇲🇽',
  'Finland': '🇫🇮',
  'Denmark': '🇩🇰',
  'Norway': '🇳🇴',
}

export const STORAGE_KEYS = {
  FAVORITES: 'masters_tracker_favorites',
  FILTERS: 'masters_tracker_filters',
  COMPARE: 'masters_tracker_compare'
}
