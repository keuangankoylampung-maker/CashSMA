/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';

interface MyMapProps {
  latitude: number;
  longitude: number;
  officeLatitude: number;
  officeLongitude: number;
  radiusMeter: number;
  officeName: string;
}

declare global {
  interface Window {
    L: any;
  }
}

export default function MyMap({
  latitude,
  longitude,
  officeLatitude,
  officeLongitude,
  radiusMeter,
  officeName,
}: MyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const officeMarkerRef = useRef<any>(null);
  const geofenceCircleRef = useRef<any>(null);
  
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Load Leaflet dynamically to bypass bundle and version mismatch issues
  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    const cssId = 'leaflet-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }

    const jsScript = document.createElement('script');
    jsScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    jsScript.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    jsScript.crossOrigin = 'anonymous';
    jsScript.onload = () => {
      setLeafletLoaded(true);
    };
    jsScript.onerror = () => {
      setLoadError(true);
    };
    document.body.appendChild(jsScript);

    return () => {
      // Keep leaflet loaded globally to prevent consecutive reloads
    };
  }, []);

  // Initialize and update the map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;

    const L = window.L;
    if (!L) return;

    // Check if map already initialized
    if (!mapInstanceRef.current) {
      // Initialize map centered between office and user
      const midLat = (latitude + officeLatitude) / 2;
      const midLon = (longitude + officeLongitude) / 2;

      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([midLat, midLon], 15);

      // Add elegant map tile
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Custom Icon definition
    const userIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-7 h-7 bg-blue-500 border-4 border-white rounded-full shadow-lg flex items-center justify-center animate-pulse"><div class="w-2.5 h-2.5 bg-white rounded-full"></div></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const officeIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-8 h-8 bg-emerald-600 border-4 border-white rounded-lg shadow-lg flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Update or create User Marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([latitude, longitude]);
    } else {
      userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
        .addTo(map)
        .bindPopup('<b>Lokasi Anda</b><br/>Sedang melakukan absensi')
        .openPopup();
    }

    // Update or create Office Marker
    if (officeMarkerRef.current) {
      officeMarkerRef.current.setLatLng([officeLatitude, officeLongitude]);
    } else {
      officeMarkerRef.current = L.marker([officeLatitude, officeLongitude], { icon: officeIcon })
        .addTo(map)
        .bindPopup(`<b>${officeName}</b><br/>Area Geofence`);
    }

    // Update or create Geofence Circle
    if (geofenceCircleRef.current) {
      geofenceCircleRef.current.setLatLng([officeLatitude, officeLongitude]);
      geofenceCircleRef.current.setRadius(radiusMeter);
    } else {
      geofenceCircleRef.current = L.circle([officeLatitude, officeLongitude], {
        color: '#10b981', // emerald-500
        fillColor: '#34d399', // emerald-400
        fillOpacity: 0.15,
        radius: radiusMeter,
        weight: 2,
        dashArray: '5, 8'
      }).addTo(map);
    }

    // Fit bounds gracefully to contain both points
    try {
      const bounds = L.latLngBounds([
        [latitude, longitude],
        [officeLatitude, officeLongitude]
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } catch (e) {
      console.warn('Map boundary fit failure: ', e);
    }

    // Handle container resize immediately
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [leafletLoaded, latitude, longitude, officeLatitude, officeLongitude, radiusMeter, officeName]);

  return (
    <div className="w-full h-full relative" id="map-root-container">
      {loadError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-red-500 text-sm font-medium z-10 p-4 text-center">
          Gagal memuat peta Leaflet. Cek koneksi internet Anda atau buka di tab baru.
        </div>
      )}
      {!leafletLoaded && !loadError && (
        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-xs flex flex-col items-center justify-center z-10 gap-2">
          <div className="w-8 h-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
          <span className="text-xs font-medium text-slate-500">Memuat Peta Geofence...</span>
        </div>
      )}
      <div 
        ref={mapContainerRef} 
        id="leaflet-map-element"
        className="w-full h-full rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      />
    </div>
  );
}
