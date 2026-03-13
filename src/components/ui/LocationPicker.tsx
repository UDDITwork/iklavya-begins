'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapPin, Loader2 } from 'lucide-react'

interface LocationData {
  city: string
  state: string
  formattedAddress: string
}

interface LocationPickerProps {
  value: string
  onChange: (location: LocationData) => void
  error?: string
}

declare global {
  interface Window {
    google: typeof google
    initGooglePlaces?: () => void
  }
}

let scriptLoaded = false
let scriptLoading = false
const callbacks: (() => void)[] = []

function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve) => {
    if (scriptLoaded && window.google?.maps?.places) {
      resolve()
      return
    }

    callbacks.push(resolve)

    if (scriptLoading) return

    scriptLoading = true
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set')
      return
    }

    window.initGooglePlaces = () => {
      scriptLoaded = true
      callbacks.forEach((cb) => cb())
      callbacks.length = 0
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGooglePlaces`
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  })
}

export default function LocationPicker({ value, onChange, error }: LocationPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [loading, setLoading] = useState(true)

  const handlePlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace()
    if (!place?.address_components) return

    let city = ''
    let state = ''

    for (const component of place.address_components) {
      if (component.types.includes('locality')) {
        city = component.long_name
      }
      if (component.types.includes('administrative_area_level_1')) {
        state = component.long_name
      }
      // Fallback for city
      if (!city && component.types.includes('sublocality_level_1')) {
        city = component.long_name
      }
    }

    onChange({
      city,
      state,
      formattedAddress: place.formatted_address || '',
    })
  }, [onChange])

  useEffect(() => {
    let mounted = true

    loadGoogleMapsScript().then(() => {
      if (!mounted || !inputRef.current) return

      setLoading(false)

      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['(cities)'],
        componentRestrictions: { country: 'in' },
        fields: ['address_components', 'formatted_address'],
      })

      autocompleteRef.current.addListener('place_changed', handlePlaceChanged)
    })

    return () => {
      mounted = false
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [handlePlaceChanged])

  const inputClass =
    'w-full pl-10 pr-4 py-3 min-h-[44px] rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all duration-200 text-sm'

  return (
    <div>
      <label htmlFor="location" className="block text-xs font-medium text-gray-700 mb-1.5">
        City / Location
      </label>
      <div className="relative">
        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          id="location"
          type="text"
          defaultValue={value}
          placeholder={loading ? 'Loading...' : 'Start typing your city...'}
          disabled={loading}
          className={inputClass}
          autoComplete="off"
        />
        {loading && (
          <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
