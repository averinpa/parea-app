import React, { useRef, useState } from 'react'
import { Keyboard, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import MapView, { Marker } from 'react-native-maps'
import { CITY_CENTERS } from '../feed-constants'

export function LocationPicker({ apiKey, initialCity, initialLocation, initialCoords, insets, onClose, onConfirm }: {
  apiKey: string; initialCity?: string | null; initialLocation: string;
  initialCoords: { lat: number; lng: number } | null; insets: any;
  onClose: () => void; onConfirm: (desc: string, lat: number, lng: number) => void
}) {
  const startCenter = initialCoords || (initialCity && CITY_CENTERS[initialCity]) || CITY_CENTERS.Limassol
  const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number }>(startCenter)
  const [pinAddress, setPinAddress] = useState<string>(initialLocation || '')
  const [resolving, setResolving] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mapRef = useRef<MapView | null>(null)

  const animateMapTo = (lat: number, lng: number) => {
    mapRef.current?.animateToRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 400)
  }

  const reverseGeocode = async (lat: number, lng: number) => {
    setResolving(true)
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=en`
      const res = await fetch(url)
      const json = await res.json()
      if (json.status === 'OK' && json.results?.[0]) setPinAddress(json.results[0].formatted_address)
      else setPinAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
    } catch {
      setPinAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
    } finally { setResolving(false) }
  }

  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate
    setPinCoords({ lat: latitude, lng: longitude })
    reverseGeocode(latitude, longitude)
    setResults([])
  }

  const search = (text: string) => {
    setQuery(text)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (text.length < 2) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${apiKey}&language=en`
        const res = await fetch(url)
        const json = await res.json()
        if (json.status === 'OK') setResults(json.predictions); else setResults([])
      } catch { setResults([]) }
    }, 350)
  }

  const pickSuggestion = async (place: any) => {
    setQuery(place.description)
    setResults([])
    Keyboard.dismiss()
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&key=${apiKey}&fields=geometry,formatted_address,name`
      const res = await fetch(url)
      const json = await res.json()
      const loc = json.result?.geometry?.location
      const name = json.result?.name
      const addr = json.result?.formatted_address
      // Prepend the place name if it isn't already in the address (e.g. "Klok Café, Anexartisias 12, ...")
      let full = addr || place.description
      if (name && full && !full.toLowerCase().startsWith(name.toLowerCase())) {
        full = `${name}, ${full}`
      } else if (name && !full) {
        full = name
      }
      if (loc) {
        setPinCoords({ lat: loc.lat, lng: loc.lng })
        setPinAddress(full)
        animateMapTo(loc.lat, loc.lng)
      }
    } catch {}
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: insets.top + 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
        <TouchableOpacity onPress={onClose} style={{ marginRight: 12 }}>
          <Feather name="x" size={22} color="#475569" />
        </TouchableOpacity>
        <Text style={{ fontSize: 17, fontFamily: 'ClashDisplay-Bold', color: '#1E1B4B' }}>Pick a location</Text>
      </View>

      {/* Map */}
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={{ latitude: startCenter.lat, longitude: startCenter.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
          onPress={handleMapPress}
        >
          <Marker
            coordinate={{ latitude: pinCoords.lat, longitude: pinCoords.lng }}
            draggable
            onDragEnd={handleMapPress}
          />
        </MapView>

        {/* Search overlay */}
        <View style={{ position: 'absolute', top: 12, left: 12, right: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, height: 44, gap: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
            <Feather name="search" size={16} color="#94A3B8" />
            <TextInput
              value={query}
              onChangeText={search}
              placeholder="Search a place or address..."
              placeholderTextColor="#94A3B8"
              style={{ flex: 1, fontSize: 14, fontFamily: 'Outfit-Medium', color: '#1E1B4B' }}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => { setQuery(''); setResults([]) }}>
                <Feather name="x-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
          {results.length > 0 && (
            <View style={{ marginTop: 6, backgroundColor: '#fff', borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, maxHeight: 240 }}>
              <ScrollView keyboardShouldPersistTaps="handled">
                {results.slice(0, 6).map((r: any) => (
                  <TouchableOpacity key={r.place_id} onPress={() => pickSuggestion(r)} activeOpacity={0.7}
                    style={{ paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                    <Text style={{ fontSize: 13, fontFamily: 'Outfit-SemiBold', color: '#1E1B4B' }} numberOfLines={1}>{r.structured_formatting?.main_text || r.description}</Text>
                    {!!r.structured_formatting?.secondary_text && (
                      <Text style={{ fontSize: 11, fontFamily: 'Outfit-Regular', color: '#94A3B8', marginTop: 2 }} numberOfLines={1}>{r.structured_formatting.secondary_text}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Bottom address + confirm */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 11, fontFamily: 'Outfit-Medium', color: '#94A3B8', marginBottom: 4 }}>Selected location</Text>
        <Text style={{ fontSize: 14, fontFamily: 'Outfit-SemiBold', color: '#1E1B4B', marginBottom: 12, minHeight: 20 }} numberOfLines={2}>
          {resolving ? 'Loading address…' : (pinAddress || 'Tap the map or search above')}
        </Text>
        <TouchableOpacity
          disabled={!pinAddress}
          onPress={() => onConfirm(pinAddress, pinCoords.lat, pinCoords.lng)}
          style={{ backgroundColor: pinAddress ? '#6366F1' : '#CBD5E1', borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'ClashDisplay-Semibold' }}>Use this location</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
