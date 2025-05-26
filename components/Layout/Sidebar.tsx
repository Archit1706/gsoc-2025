"use client"
import React from 'react';
import { Calendar, Clock, MapPin, User, AlertCircle } from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { useClosures } from '@/context/ClosuresContext';
import { Closure } from '@/services/api';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { state, selectClosure } = useClosures();
    const { closures, selectedClosure, loading } = state;

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

    const handleClosureClick = (closure: Closure) => {
        selectClosure(closure);
        if (window.innerWidth < 768) {
            onClose();
        }
    };

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
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Active Closures ({closures.length})
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Click on a closure to view on map
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar max-h-[calc(100vh-8rem)]">
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
                                        {/* Status Badge */}
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`
                        inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
                        ${getStatusColor(status)}
                      `}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {format(new Date(closure.created_at), 'MMM dd')}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                                            {closure.description}
                                        </h3>

                                        {/* Reason */}
                                        <p className="text-sm text-gray-600 mb-3 capitalize">
                                            {closure.reason.replace('_', ' ')}
                                        </p>

                                        {/* Details */}
                                        <div className="space-y-1 text-xs text-gray-500">
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>
                                                    {format(new Date(closure.start_time), 'MMM dd, HH:mm')} -
                                                    {format(new Date(closure.end_time), 'MMM dd, HH:mm')}
                                                </span>
                                            </div>

                                            <div className="flex items-center space-x-1">
                                                <User className="w-3 h-3" />
                                                <span>Reported by {closure.submitter}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Sidebar;