"use client"
import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useClosures } from '@/context/ClosuresContext';
import { Closure, BoundingBox, calculateBearing, getDirectionArrow, interpolateLinePoints } from '@/services/api';
import { Navigation, ArrowLeftRight, Info, ChevronDown, ChevronUp } from 'lucide-react';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
    onMapClick?: (latlng: L.LatLng) => void;
    selectedPoints?: L.LatLng[];
    isSelecting?: boolean;
    onClearPoints?: () => void;
    onFinishSelection?: () => void;
}

// Helper function to safely extract coordinates
function extractCoordinates(closure: Closure): { points: [number, number][], isValid: boolean } {
    try {
        if (!closure.geometry || !closure.geometry.coordinates) {
            console.warn('Invalid geometry for closure:', closure.id);
            return { points: [], isValid: false };
        }

        if (closure.geometry.type === 'Point') {
            // Handle Point geometry - could be [lng, lat] or [[lng, lat]]
            let lng: number, lat: number;

            if (Array.isArray(closure.geometry.coordinates[0])) {
                // Format: [[lng, lat]]
                [lng, lat] = closure.geometry.coordinates[0] as number[];
            } else {
                // Format: [lng, lat]
                [lng, lat] = closure.geometry.coordinates as unknown as number[];
            }

            if (typeof lng !== 'number' || typeof lat !== 'number') {
                console.warn('Invalid Point coordinates for closure:', closure.id, closure.geometry.coordinates);
                return { points: [], isValid: false };
            }

            return { points: [[lat, lng]], isValid: true };

        } else if (closure.geometry.type === 'LineString') {
            // Handle LineString geometry - should be [[lng, lat], [lng, lat], ...]
            const coordinates = closure.geometry.coordinates;

            if (!Array.isArray(coordinates) || coordinates.length === 0) {
                console.warn('Invalid LineString coordinates for closure:', closure.id);
                return { points: [], isValid: false };
            }

            const points: [number, number][] = [];

            for (const coord of coordinates) {
                if (!Array.isArray(coord) || coord.length < 2) {
                    console.warn('Invalid coordinate pair in LineString:', coord);
                    continue;
                }

                const [lng, lat] = coord;
                if (typeof lng !== 'number' || typeof lat !== 'number') {
                    console.warn('Invalid coordinate values:', lng, lat);
                    continue;
                }

                points.push([lat, lng]);
            }

            return { points, isValid: points.length > 0 };
        }

        console.warn('Unsupported geometry type:', closure.geometry.type);
        return { points: [], isValid: false };

    } catch (error) {
        console.error('Error extracting coordinates for closure:', closure.id, error);
        return { points: [], isValid: false };
    }
}

// Create custom arrow icon based on bearing
function createArrowIcon(bearing: number, isBidirectional: boolean = false, color: string = '#ef4444'): L.DivIcon {
    const arrow = isBidirectional ? '⟷' : getDirectionArrow(bearing);
    const rotation = isBidirectional ? 0 : bearing;

    return L.divIcon({
        className: 'custom-arrow-icon',
        html: `
            <div class="arrow-container" style="transform: rotate(${rotation}deg);">
                <div class="arrow-marker" style="color: ${color}; background: white; border: 2px solid ${color};">
                    ${arrow}
                </div>
            </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
}

// Create direction arrows for LineString
function createDirectionArrows(closure: Closure, coordinates: [number, number][]): L.Marker[] {
    const arrows: L.Marker[] = [];

    if (coordinates.length < 2) return arrows;

    const color = getClosureColor(closure);
    const isBidirectional = closure.is_bidirectional || false;

    // Convert coordinates back to lng/lat for interpolation
    const lngLatCoords = coordinates.map(([lat, lng]) => [lng, lat]);

    // Get interpolated points for arrow placement (3-5 arrows depending on line length)
    const numArrows = Math.min(5, Math.max(3, Math.floor(coordinates.length / 2)));
    const arrowPoints = interpolateLinePoints(lngLatCoords, numArrows);

    arrowPoints.forEach((point, index) => {
        const [lng, lat] = point;

        // Calculate bearing for this segment
        let bearing = 0;
        if (index < lngLatCoords.length - 1) {
            const nextIndex = Math.min(index + 1, lngLatCoords.length - 1);
            const [lng1, lat1] = lngLatCoords[index] || point;
            const [lng2, lat2] = lngLatCoords[nextIndex] || point;
            bearing = calculateBearing(lat1, lng1, lat2, lng2);
        } else if (lngLatCoords.length >= 2) {
            // Use bearing from previous segment for last arrow
            const [lng1, lat1] = lngLatCoords[lngLatCoords.length - 2];
            const [lng2, lat2] = lngLatCoords[lngLatCoords.length - 1];
            bearing = calculateBearing(lat1, lng1, lat2, lng2);
        }

        const arrowIcon = createArrowIcon(bearing, isBidirectional, color);
        const marker = L.marker([lat, lng], { icon: arrowIcon });

        // Add tooltip with direction info
        const directionText = isBidirectional
            ? 'Bidirectional closure'
            : `Direction: ${Math.round(bearing)}° (${getCompassDirection(bearing)})`;

        marker.bindTooltip(directionText, {
            permanent: false,
            direction: 'top',
            className: 'arrow-tooltip'
        });

        arrows.push(marker);
    });

    return arrows;
}

// Direction Legend Component
const DirectionLegend: React.FC<{ className?: string }> = ({ className = '' }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const directionExamples = [
        { bearing: 0, arrow: '↑', label: 'North' },
        { bearing: 45, arrow: '↗', label: 'NE' },
        { bearing: 90, arrow: '→', label: 'East' },
        { bearing: 135, arrow: '↘', label: 'SE' },
        { bearing: 180, arrow: '↓', label: 'South' },
        { bearing: 225, arrow: '↙', label: 'SW' },
        { bearing: 270, arrow: '←', label: 'West' },
        { bearing: 315, arrow: '↖', label: 'NW' },
    ];

    return (
        <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center space-x-2">
                    <Navigation className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">Directions</span>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
            </button>

            {isExpanded && (
                <div className="px-3 pb-3 border-t border-gray-100">
                    <div className="mb-3">
                        <div className="flex items-center space-x-2 mb-2">
                            <ArrowLeftRight className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium">Bidirectional</span>
                        </div>
                        <div className="bg-purple-50 rounded p-2 flex items-center space-x-2">
                            <span className="text-xl text-purple-600">⟷</span>
                            <span className="text-xs text-purple-700">Both directions blocked</span>
                        </div>
                    </div>

                    <div className="mb-3">
                        <div className="flex items-center space-x-2 mb-2">
                            <Navigation className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium">Unidirectional</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                            {directionExamples.map((example) => (
                                <div key={example.bearing} className="bg-gray-50 rounded p-1 text-center">
                                    <div className="text-sm text-gray-700">{example.arrow}</div>
                                    <div className="text-xs text-gray-600">{example.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <div className="flex items-start space-x-2">
                            <Info className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-blue-700">
                                <div className="font-medium mb-1">Usage</div>
                                <div>Direction is determined by the order you select points on the map.</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Get compass direction from bearing
function getCompassDirection(bearing: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
}

// Component to handle map events and render closures
const MapEventHandler: React.FC<{
    onMapClick?: (latlng: L.LatLng) => void;
    isSelecting?: boolean;
    selectedPoints?: L.LatLng[];
}> = ({ onMapClick, isSelecting, selectedPoints = [] }) => {
    const map = useMap();
    const { state, fetchClosures, selectClosure } = useClosures();
    const { closures, selectedClosure } = state;
    const closureLayersRef = useRef<L.LayerGroup>(new L.LayerGroup());
    const selectionLayersRef = useRef<L.LayerGroup>(new L.LayerGroup());

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

    // Update selection visualization
    useEffect(() => {
        const layerGroup = selectionLayersRef.current;
        layerGroup.clearLayers();

        if (selectedPoints.length > 0) {
            // Add markers for each selected point
            selectedPoints.forEach((point, index) => {
                const marker = L.circleMarker([point.lat, point.lng], {
                    radius: 8,
                    fillColor: '#3b82f6',
                    color: '#ffffff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8,
                }).bindTooltip(`Point ${index + 1}`, { permanent: false });

                layerGroup.addLayer(marker);
            });

            // Add connecting line if more than one point
            if (selectedPoints.length > 1) {
                const latlngs = selectedPoints.map(point => [point.lat, point.lng] as [number, number]);
                const polyline = L.polyline(latlngs, {
                    color: '#3b82f6',
                    weight: 4,
                    opacity: 0.7,
                    dashArray: '10, 5',
                });

                layerGroup.addLayer(polyline);

                // Add preview arrows for selection
                if (selectedPoints.length >= 2) {
                    const previewArrows = createPreviewArrows(selectedPoints);
                    previewArrows.forEach(arrow => layerGroup.addLayer(arrow));
                }
            }
        }

        layerGroup.addTo(map);

        return () => {
            layerGroup.clearLayers();
        };
    }, [selectedPoints, map]);

    // Update closures on map
    useEffect(() => {
        const layerGroup = closureLayersRef.current;
        layerGroup.clearLayers();

        closures.forEach((closure) => {
            const { points, isValid } = extractCoordinates(closure);

            if (!isValid || points.length === 0) {
                console.warn('Skipping closure with invalid coordinates:', closure.id);
                return;
            }

            let layer: L.Layer | null = null;

            if (closure.geometry.type === 'Point') {
                const [lat, lng] = points[0];

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
                    .bindPopup(createClosurePopup(closure));

            } else if (closure.geometry.type === 'LineString') {
                layer = L.polyline(points, {
                    color: getClosureColor(closure),
                    weight: 6,
                    opacity: 0.8,
                }).bindPopup(createClosurePopup(closure));

                // Add direction arrows to the layer group
                const arrows = createDirectionArrows(closure, points);
                arrows.forEach(arrow => {
                    arrow.on('click', () => {
                        selectClosure(closure);
                    });
                    layerGroup.addLayer(arrow);
                });
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
            const { points, isValid } = extractCoordinates(selectedClosure);

            if (!isValid || points.length === 0) {
                console.warn('Cannot focus on closure with invalid coordinates:', selectedClosure.id);
                return;
            }

            if (selectedClosure.geometry.type === 'Point') {
                const [lat, lng] = points[0];
                map.setView([lat, lng], 16);
            } else if (selectedClosure.geometry.type === 'LineString') {
                const bounds = L.latLngBounds(points);
                map.fitBounds(bounds, { padding: [20, 20] });
            }
        }
    }, [selectedClosure, map]);

    return null;
};

// Create preview arrows for point selection
function createPreviewArrows(selectedPoints: L.LatLng[]): L.Marker[] {
    const arrows: L.Marker[] = [];

    if (selectedPoints.length < 2) return arrows;

    // Calculate bearing between consecutive points
    for (let i = 0; i < selectedPoints.length - 1; i++) {
        const point1 = selectedPoints[i];
        const point2 = selectedPoints[i + 1];

        const bearing = calculateBearing(point1.lat, point1.lng, point2.lat, point2.lng);

        // Place arrow at midpoint
        const midLat = (point1.lat + point2.lat) / 2;
        const midLng = (point1.lng + point2.lng) / 2;

        const arrowIcon = createArrowIcon(bearing, false, '#3b82f6');
        const marker = L.marker([midLat, midLng], { icon: arrowIcon });

        marker.bindTooltip(`Preview: ${Math.round(bearing)}° ${getCompassDirection(bearing)}`, {
            permanent: false,
            direction: 'top',
            className: 'preview-arrow-tooltip'
        });

        arrows.push(marker);
    }

    return arrows;
}

// Helper functions
function getClosureColor(closure: Closure): string {
    switch (closure.status) {
        case 'active':
            return '#ef4444'; // red
        case 'inactive':
            return '#6b7280'; // gray
        case 'expired':
            return '#9ca3af'; // light gray
        default:
            return '#6b7280';
    }
}

function createClosurePopup(closure: Closure): string {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getDurationText = (hours: number) => {
        if (hours < 1) return `${Math.round(hours * 60)} minutes`;
        if (hours < 24) return `${Math.round(hours)} hours`;
        return `${Math.round(hours / 24)} days`;
    };

    const directionInfo = closure.geometry.type === 'LineString'
        ? `<div><strong>Direction:</strong> ${closure.is_bidirectional ? 'Bidirectional ⟷' : 'Unidirectional →'}</div>`
        : '';

    return `
        <div class="closure-popup">
            <h3 class="font-semibold text-gray-900 mb-2">${closure.description}</h3>
            <div class="space-y-1 text-sm">
                <div><strong>Type:</strong> ${closure.closure_type.replace('_', ' ')}</div>
                <div><strong>Status:</strong> <span class="capitalize ${closure.status === 'active' ? 'text-red-600' :
            closure.status === 'expired' ? 'text-gray-600' : 'text-blue-600'
        }">${closure.status}</span></div>
                <div><strong>Source:</strong> ${closure.source}</div>
                <div><strong>Duration:</strong> ${getDurationText(closure.duration_hours)}</div>
                <div><strong>Confidence:</strong> ${closure.confidence_level}/10</div>
                ${directionInfo}
                <div class="text-xs text-gray-500 mt-2">
                    <div><strong>Start:</strong> ${formatDate(closure.start_time)}</div>
                    <div><strong>End:</strong> ${formatDate(closure.end_time)}</div>
                </div>
                ${closure.openlr_code ? `
                    <div class="text-xs text-blue-600 mt-2">
                        <strong>OpenLR:</strong> ${closure.openlr_code}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

const MapComponent: React.FC<MapComponentProps> = ({
    onMapClick,
    selectedPoints = [],
    isSelecting = false,
    onClearPoints,
    onFinishSelection
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

                .arrow-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                }
                
                .arrow-marker {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    font-size: 12px;
                    font-weight: bold;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
                }

                .custom-arrow-icon {
                    background: none !important;
                    border: none !important;
                }

                .arrow-tooltip {
                    background-color: rgba(0, 0, 0, 0.8) !important;
                    color: white !important;
                    border: none !important;
                    border-radius: 4px !important;
                    font-size: 11px !important;
                    padding: 4px 8px !important;
                }

                .preview-arrow-tooltip {
                    background-color: rgba(59, 130, 246, 0.9) !important;
                    color: white !important;
                    border: none !important;
                    border-radius: 4px !important;
                    font-size: 11px !important;
                    padding: 4px 8px !important;
                }
                
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                
                .closure-popup {
                    min-width: 250px;
                    max-width: 300px;
                }
                
                .leaflet-popup-content-wrapper {
                    border-radius: 8px;
                }

                .leaflet-container {
                    cursor: ${isSelecting ? 'crosshair' : 'grab'};
                }

                .leaflet-container.leaflet-dragging {
                    cursor: ${isSelecting ? 'crosshair' : 'grabbing'};
                }
            `}</style>

            <MapContainer
                center={[41.8781, -87.6298]} // Chicago coordinates
                zoom={11}
                className="h-full w-full"
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapEventHandler
                    onMapClick={onMapClick}
                    isSelecting={isSelecting}
                    selectedPoints={selectedPoints}
                />
            </MapContainer>

            {/* Direction Legend */}
            <div className="absolute top-4 right-4 z-30 max-w-xs">
                <DirectionLegend />
            </div>

            {/* Selection Controls */}
            {isSelecting && selectedPoints.length > 0 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-600">
                            <span className="font-medium">{selectedPoints.length}</span> points selected
                        </div>
                        {selectedPoints.length >= 2 && (
                            <div className="text-xs text-green-600 font-medium flex items-center space-x-1">
                                <span>✓ Ready for LineString</span>
                                <span className="text-blue-600">→</span>
                            </div>
                        )}
                        <div className="flex space-x-2">
                            <button
                                onClick={onClearPoints}
                                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                                Clear
                            </button>
                            <button
                                onClick={onFinishSelection}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MapComponent;