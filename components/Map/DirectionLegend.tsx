// components/Map/DirectionLegend.tsx
import React, { useState } from 'react';
import { Navigation, ArrowLeftRight, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface DirectionLegendProps {
    className?: string;
}

const DirectionLegend: React.FC<DirectionLegendProps> = ({ className = '' }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const directionExamples = [
        { bearing: 0, arrow: '→', label: 'East', description: '0° - 22.5°' },
        { bearing: 45, arrow: '↗', label: 'Northeast', description: '22.5° - 67.5°' },
        { bearing: 90, arrow: '↑', label: 'North', description: '67.5° - 112.5°' },
        { bearing: 135, arrow: '↖', label: 'Northwest', description: '112.5° - 157.5°' },
        { bearing: 180, arrow: '←', label: 'West', description: '157.5° - 202.5°' },
        { bearing: 225, arrow: '↙', label: 'Southwest', description: '202.5° - 247.5°' },
        { bearing: 270, arrow: '↓', label: 'South', description: '247.5° - 292.5°' },
        { bearing: 315, arrow: '↘', label: 'Southeast', description: '292.5° - 337.5°' },
    ];

    return (
        <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center space-x-2">
                    <Navigation className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">Direction Legend</span>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="px-3 pb-3 border-t border-gray-100">
                    {/* Bidirectional Section */}
                    <div className="mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <ArrowLeftRight className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium text-gray-900">Bidirectional Closures</span>
                        </div>
                        <div className="bg-purple-50 rounded p-2">
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl text-purple-600">⟷</span>
                                <div className="text-xs text-purple-700">
                                    <div className="font-medium">Both Directions Blocked</div>
                                    <div>Complete road closure affecting traffic in both directions</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Unidirectional Section */}
                    <div className="mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <Navigation className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-900">Unidirectional Closures</span>
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                            Direction determined by order of selected points
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {directionExamples.map((example) => (
                                <div key={example.bearing} className="bg-gray-50 rounded p-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-lg text-gray-700">{example.arrow}</span>
                                        <div className="text-xs">
                                            <div className="font-medium text-gray-900">{example.label}</div>
                                            <div className="text-gray-600">{example.description}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Usage Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <div className="flex items-start space-x-2">
                            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-blue-700">
                                <div className="font-medium mb-1">How to Use</div>
                                <ul className="space-y-1 list-disc list-inside">
                                    <li>Click points in the order traffic flows</li>
                                    <li>Check "Bidirectional" for complete closures</li>
                                    <li>Direction arrows appear on the map</li>
                                    <li>Helps navigation apps route correctly</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Examples */}
                    <div className="mt-4 space-y-2">
                        <div className="text-xs font-medium text-gray-700">Common Examples:</div>
                        <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex items-center space-x-2">
                                <span className="text-red-600">→</span>
                                <span>Construction - single lane closure</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-red-600">⟷</span>
                                <span>Emergency - complete road blockage</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-red-600">→</span>
                                <span>Accident - one direction affected</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-red-600">⟷</span>
                                <span>Event - parade or street festival</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DirectionLegend;