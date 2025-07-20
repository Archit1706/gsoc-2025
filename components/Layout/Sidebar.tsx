"use client"
import React from 'react';
import { Calendar, Clock, MapPin, User, AlertCircle, Zap, Building2, Navigation, ArrowLeftRight } from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { useClosures } from '@/context/ClosuresContext';
import { Closure, getDirectionArrow, calculateBearing } from '@/services/api';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { state, selectClosure } = useClosures();
    const { closures, selectedClosure, loading, isAuthenticated } = state;

    const getClosureStatus = (closure: Closure): 'active' | 'upcoming' | 'expired' => {
        const now = new Date();
        const startTime = new Date(closure.start_time);
        const endTime = new Date(closure.end_time);

        if (isBefore(now, startTime)) return 'upcoming';
        if (isAfter(now, endTime)) return 'expired';
        return 'active';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'upcoming':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'expired':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getConfidenceColor = (level: number) => {
        if (level >= 8) return 'text-green-600';
        if (level >= 6) return 'text-blue-600';
        if (level >= 4) return 'text-yellow-600';
        return 'text-red-600';
    };

    const formatDuration = (hours: number) => {
        if (hours < 1) return `${Math.round(hours * 60)}m`;
        if (hours < 24) return `${Math.round(hours)}h`;
        return `${Math.round(hours / 24)}d`;
    };

    // Get direction information for LineString closures
    const getDirectionInfo = (closure: Closure) => {
        if (closure.geometry.type !== 'LineString' || closure.geometry.coordinates.length < 2) {
            return null;
        }

        const coordinates = closure.geometry.coordinates;
        const [lng1, lat1] = coordinates[0];
        const [lng2, lat2] = coordinates[coordinates.length - 1];
        const bearing = calculateBearing(lat1, lng1, lat2, lng2);

        return {
            bearing,
            arrow: closure.is_bidirectional ? '⟷' : getDirectionArrow(bearing),
            description: closure.is_bidirectional
                ? 'Bidirectional'
                : `${Math.round(bearing)}° ${getCompassDirection(bearing)}`
        };
    };

    const getCompassDirection = (bearing: number): string => {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(bearing / 45) % 8;
        return directions[index];
    };

    const handleClosureClick = (closure: Closure) => {
        selectClosure(closure);
        if (window.innerWidth < 768) {
            onClose();
        }
    };

    const activeClosures = closures.filter(c => getClosureStatus(c) === 'active').length;
    const upcomingClosures = closures.filter(c => getClosureStatus(c) === 'upcoming').length;
    const expiredClosures = closures.filter(c => getClosureStatus(c) === 'expired').length;

    // Direction statistics
    const lineStringClosures = closures.filter(c => c.geometry.type === 'LineString');
    const bidirectionalClosures = lineStringClosures.filter(c => c.is_bidirectional).length;
    const unidirectionalClosures = lineStringClosures.filter(c => !c.is_bidirectional).length;

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:top-0 md:h-full md:translate-x-0 md:shadow-none md:border-r md:border-gray-200
            `}>
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Road Closures ({closures.length})
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Click on a closure to view on map
                    </p>

                    {/* Status Summary */}
                    <div className="flex space-x-2 mt-3">
                        <div className="flex-1 text-center p-2 bg-red-50 rounded-lg">
                            <div className="text-sm font-semibold text-red-800">{activeClosures}</div>
                            <div className="text-xs text-red-600">Active</div>
                        </div>
                        <div className="flex-1 text-center p-2 bg-yellow-50 rounded-lg">
                            <div className="text-sm font-semibold text-yellow-800">{upcomingClosures}</div>
                            <div className="text-xs text-yellow-600">Upcoming</div>
                        </div>
                        <div className="flex-1 text-center p-2 bg-gray-50 rounded-lg">
                            <div className="text-sm font-semibold text-gray-800">{expiredClosures}</div>
                            <div className="text-xs text-gray-600">Expired</div>
                        </div>
                    </div>

                    {/* Direction Summary - Only show if there are LineString closures */}
                    {lineStringClosures.length > 0 && (
                        <div className="flex space-x-2 mt-2">
                            <div className="flex-1 text-center p-2 bg-blue-50 rounded-lg">
                                <div className="text-sm font-semibold text-blue-800 flex items-center justify-center space-x-1">
                                    <span>{bidirectionalClosures}</span>
                                    <ArrowLeftRight className="w-3 h-3" />
                                </div>
                                <div className="text-xs text-blue-600">Bidirectional</div>
                            </div>
                            <div className="flex-1 text-center p-2 bg-green-50 rounded-lg">
                                <div className="text-sm font-semibold text-green-800 flex items-center justify-center space-x-1">
                                    <span>{unidirectionalClosures}</span>
                                    <Navigation className="w-3 h-3" />
                                </div>
                                <div className="text-xs text-green-600">Unidirectional</div>
                            </div>
                        </div>
                    )}

                    {/* Authentication Status */}
                    {!isAuthenticated && (
                        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <AlertCircle className="w-4 h-4 text-orange-600" />
                                <span className="text-sm text-orange-700">Demo Mode - Limited Features</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Closures List */}
                <div className="flex-1 overflow-y-auto hide-scrollbar max-h-[calc(100vh-16rem)]">
                    {loading ? (
                        <div className="p-4 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-sm text-gray-500 mt-2">Loading closures...</p>
                        </div>
                    ) : closures.length === 0 ? (
                        <div className="p-4 text-center">
                            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">No road closures reported</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Be the first to report a closure!
                            </p>
                        </div>
                    ) : (
                        <div className="p-2 overflow-y-auto hide-scrollbar">
                            {closures.map((closure) => {
                                const status = getClosureStatus(closure);
                                const isSelected = selectedClosure?.id === closure.id;
                                const directionInfo = getDirectionInfo(closure);

                                return (
                                    <div
                                        key={closure.id}
                                        onClick={() => handleClosureClick(closure)}
                                        className={`
                                            p-3 mb-2 rounded-lg border cursor-pointer transition-colors
                                            ${isSelected
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        {/* Header with Status and Confidence */}
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`
                                                inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
                                                ${getStatusColor(status)}
                                            `}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </span>
                                            <div className="flex items-center space-x-2">
                                                <div className="flex items-center space-x-1">
                                                    <Zap className="w-3 h-3 text-gray-400" />
                                                    <span className={`text-xs font-medium ${getConfidenceColor(closure.confidence_level)}`}>
                                                        {closure.confidence_level}/10
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {formatDuration(closure.duration_hours)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                                            {closure.description}
                                        </h3>

                                        {/* Closure Type and Direction */}
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-1">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                <span className="text-sm text-gray-600 capitalize">
                                                    {closure.closure_type.replace('_', ' ')}
                                                </span>
                                            </div>

                                            {/* Direction Indicator */}
                                            {directionInfo && (
                                                <div className="flex items-center space-x-1">
                                                    <span className="text-lg text-gray-600" title={directionInfo.description}>
                                                        {directionInfo.arrow}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {closure.is_bidirectional ? 'Both' : 'One-way'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Direction Details for LineString */}
                                        {directionInfo && !closure.is_bidirectional && (
                                            <div className="mb-2 p-2 bg-gray-50 rounded text-xs">
                                                <div className="flex items-center space-x-2">
                                                    <Navigation className="w-3 h-3 text-gray-500" />
                                                    <span className="text-gray-600">
                                                        Direction: {directionInfo.description}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Timing */}
                                        <div className="space-y-1 text-xs text-gray-500">
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>
                                                    {format(new Date(closure.start_time), 'MMM dd, HH:mm')} -
                                                    {format(new Date(closure.end_time), 'MMM dd, HH:mm')}
                                                </span>
                                            </div>

                                            <div className="flex items-center space-x-1">
                                                <Building2 className="w-3 h-3" />
                                                <span>Source: {closure.source}</span>
                                            </div>

                                            {closure.openlr_code && (
                                                <div className="flex items-center space-x-1">
                                                    <MapPin className="w-3 h-3" />
                                                    <span className="font-mono text-xs">
                                                        OpenLR: {closure.openlr_code.substring(0, 8)}...
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Validation Status */}
                                        {!closure.is_valid && (
                                            <div className="mt-2 flex items-center space-x-1">
                                                <AlertCircle className="w-3 h-3 text-yellow-500" />
                                                <span className="text-xs text-yellow-600">Needs validation</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <div className="text-xs text-gray-500 text-center space-y-1">
                        <div>
                            {isAuthenticated ? (
                                <span>✓ Connected to backend API</span>
                            ) : (
                                <span>⚠ Using demo data</span>
                            )}
                        </div>
                        {lineStringClosures.length > 0 && (
                            <div className="flex items-center justify-center space-x-4 text-xs">
                                <span className="flex items-center space-x-1">
                                    <span>⟷</span>
                                    <span>{bidirectionalClosures} bidirectional</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                    <span>→</span>
                                    <span>{unidirectionalClosures} unidirectional</span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;