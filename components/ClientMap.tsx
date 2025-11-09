'use client'

import dynamic from 'next/dynamic'

const Map = dynamic(() => import('@/components/Map'), { ssr: false })

interface ClientMapProps {
  events: any[];
  center: [number, number];
  zoom: number;
  height: string;
}

export default function ClientMap({ events, center, zoom, height }: ClientMapProps) {
  return (
    <Map
      events={events}
      center={center}
      zoom={zoom}
      height={height}
    />
  )
}
