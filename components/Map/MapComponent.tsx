import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useClosures } from '@/context/ClosuresContext';
import { Closure, BoundingBox } from '@/services/api';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
    onMapClick?: (latlng: L.LatLng) => void;
    selectedLocation?: L.LatLng | null;
    isSelecting?: boolean;
}

// Component to handle map events and render closures
const MapEventHandler: React.FC<{
    onMapClick?: (latlng: L.LatLng) => void;
    isSelecting?: boolean;
}> = ({ onMapClick, isSelecting }) => {
    const map = useMap();
    const { state, fetchClosures, selectClosure } = useClosures();
    const { closures, selectedClosure } = state;
    const closureLayersRef = useRef<L.LayerGroup>(new L.LayerGroup());

    // Handle map click events
    useMapEvents({
        click: (e) => {
            if (onMapClick && isSelecting) {
                onMapClick(e.latlng);
            }
        },
        moveend: () => {
            // Fetch closures when map bounds change
            const bounds = map.getBounds();
            const bbox: BoundingBox = {
                north: bounds.getNorth(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                west: bounds.getWest(),
            };
            fetchClosures(bbox);
        },
    });

    // Update closures on map
    useEffect(() => {
        const layerGroup = closureLayersRef.current;
        layerGroup.clearLayers();

        closures.forEach((closure) => {
            let layer: L.Layer | null = null;

            if (closure.geometry.type === 'Point') {
                const [lng, lat] = closure.geometry.coordinates as number[];

                // Create custom icon based on closure status
                const icon = L.divIcon({
                    className: 'custom-closure-icon',
                    html: `
            <div class="closure-marker ${closure.status === 'active' ? 'active' : 'inactive'}">
              <div class="closure-marker-inner">⚠</div>
            </div>
          `,
                    iconSize: [30, 30],
                    iconAnchor: [15, 15],
                });

                layer = L.marker([lat, lng], { icon })
                    .bindPopup(`
            <div class="closure-popup">
              <h3 class="font-semibold text-gray-900 mb-2">${closure.description}</h3>
              <p class="text-sm text-gray-600 mb-2">Reason: ${closure.reason.replace('_', ' ')}</p>
              <p class="text-xs text-gray-500">
                ${new Date(closure.start_time).toLocaleString()} - 
                ${new Date(closure.end_time).toLocaleString()}
              </p>
              <p class="text-xs text-gray-400 mt-1">Reported by: ${closure.submitter}</p>
            </div>
          `);

            } else if (closure.geometry.type === 'LineString') {
                const coordinates = (closure.geometry.coordinates as number[][]).map(([lng, lat]) => [lat, lng] as [number, number]);

                layer = L.polyline(coordinates, {
                    color: closure.status === 'active' ? '#ef4444' : '#9ca3af',
                    weight: 6,
                    opacity: 0.8,
                }).bindPopup(`
          <div class="closure-popup">
            <h3 class="font-semibold text-gray-900 mb-2">${closure.description}</h3>
            <p class="text-sm text-gray-600 mb-2">Reason: ${closure.reason.replace('_', ' ')}</p>
            <p class="text-xs text-gray-500">
              ${new Date(closure.start_time).toLocaleString()} - 
              ${new Date(closure.end_time).toLocaleString()}
            </p>
            <p class="text-xs text-gray-400 mt-1">Reported by: ${closure.submitter}</p>
          </div>
        `);
            }

            if (layer) {
                layer.on('click', () => {
                    selectClosure(closure);
                });

                // Highlight selected closure
                if (selectedClosure?.id === closure.id) {
                    if (layer instanceof L.Marker) {
                        layer.setZIndexOffset(1000);
                    } else if (layer instanceof L.Polyline) {
                        layer.setStyle({
                            color: '#3b82f6',
                            weight: 8,
                            opacity: 1,
                        });
                    }
                }

                layerGroup.addLayer(layer);
            }
        });

        layerGroup.addTo(map);

        return () => {
            layerGroup.clearLayers();
        };
    }, [closures, selectedClosure, map, selectClosure]);

    // Focus on selected closure
    useEffect(() => {
        if (selectedClosure) {
            if (selectedClosure.geometry.type === 'Point') {
                const [lng, lat] = selectedClosure.geometry.coordinates as number[];
                map.setView([lat, lng], 16);
            } else if (selectedClosure.geometry.type === 'LineString') {
                const coordinates = (selectedClosure.geometry.coordinates as number[][])
                    .map(([lng, lat]) => [lat, lng] as [number, number]);
                const bounds = L.latLngBounds(coordinates);
                map.fitBounds(bounds, { padding: [20, 20] });
            }
        }
    }, [selectedClosure, map]);

    return null;
};

// Component to show selected location marker
const LocationMarker: React.FC<{ position: L.LatLng | null }> = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        if (position) {
            const marker = L.marker([position.lat, position.lng], {
                icon: L.divIcon({
                    className: 'selected-location-marker',
                    html: `
            <div class="location-marker">
              <div class="location-marker-inner">📍</div>
            </div>
          `,
                    iconSize: [30, 30],
                    iconAnchor: [15, 15],
                }),
            }).addTo(map);

            return () => {
                map.removeLayer(marker);
            };
        }
    }, [position, map]);

    return null;
};

const MapComponent: React.FC<MapComponentProps> = ({
    onMapClick,
    selectedLocation,
    isSelecting = false
}) => {
    const { fetchClosures } = useClosures();

    // Initial map load
    useEffect(() => {
        // Fetch closures for Chicago area initially
        const chicagoBounds: BoundingBox = {
            north: 42.0,
            south: 41.6,
            east: -87.3,
            west: -87.9,
        };
        fetchClosures(chicagoBounds);
    }, [fetchClosures]);

    return (
        <>
            <style jsx global>{`
        .closure-marker {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: bold;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 2px solid white;
        }
        
        .closure-marker.active {
          background-color: #ef4444;
          color: white;
        }
        
        .closure-marker.inactive {
          background-color: #9ca3af;
          color: white;
        }
        
        .closure-marker-inner {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .location-marker {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 2px solid white;
          animation: bounce 1s infinite;
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        .closure-popup {
          min-width: 200px;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
      `}</style>

            <MapContainer
                center={[41.8781, -87.6298]} // Chicago coordinates
                zoom={11}
                className={`h-full w-full ${isSelecting ? 'cursor-crosshair' : ''}`}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapEventHandler
                    onMapClick={onMapClick}
                    isSelecting={isSelecting}
                />

                {selectedLocation && (
                    <LocationMarker position={selectedLocation} />
                )}
            </MapContainer>
        </>
    );
};

export default MapComponent;