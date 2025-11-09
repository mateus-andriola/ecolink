'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface MapProps {
  events: Array<{
    id: string
    title: string
    location: string
    latitude: number
    longitude: number
    date: Date
  }>
  center?: [number, number]
  zoom?: number
  height?: string
  onMarkerClick?: (eventId: string) => void
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  
  return null
}

export default function Map({ 
  events, 
  center = [0, 0], 
  zoom = 2,
  height = '500px',
  onMarkerClick 
}: MapProps) {
  return (
    <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <MapUpdater center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {events.map((event) => (
          <Marker
            key={event.id}
            position={[event.latitude, event.longitude]}
            eventHandlers={{
              click: () => onMarkerClick?.(event.id),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-sm">{event.title}</h3>
                <p className="text-xs text-gray-600">{event.location}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(event.date).toLocaleDateString()}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
