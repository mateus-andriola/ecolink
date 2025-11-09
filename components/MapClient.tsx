'use client';

import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

interface MapClientProps {
  events: any[];
  center: [number, number];
  zoom: number;
  height: string;
}

export default function MapClient({ events, center, zoom, height }: MapClientProps) {
  return (
    <Map
      events={events}
      center={center}
      zoom={zoom}
      height={height}
    />
  );
}