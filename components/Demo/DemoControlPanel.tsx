import React, { useState, useEffect } from 'react';
import { Database, Wifi, WifiOff, RotateCcw, Info } from 'lucide-react';
import { closuresApi } from '@/services/api';
import toast from 'react-hot-toast';

interface DemoControlPanelProps {
    className?: string;
}

const DemoControlPanel: React.FC<DemoControlPanelProps> = ({ className = '' }) => {
    const [apiStatus, setApiStatus] = useState(closuresApi.getApiStatus());
    const [isResetting, setIsResetting] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        // Update status periodically
        const interval = setInterval(() => {
            setApiStatus(closuresApi.getApiStatus());
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleResetData = async () => {
        if (!apiStatus.usingMock) {
            toast.error('Reset is only available in demo mode');
            return;
        }

        setIsResetting(true);
        try {
            await closuresApi.resetMockData();
            toast.success('Demo data has been reset to initial state');
            // Trigger a refresh of the closures
            window.location.reload();
        } catch (error) {
            toast.error('Failed to reset demo data');
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
            {/* Collapsed state - just the indicator */}
            {!isExpanded && (
                <button
                    onClick={() => setIsExpanded(true)}
                    className={`
            flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm
            ${apiStatus.usingMock
                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }
            hover:shadow-xl transition-all duration-200
          `}
                >
                    {apiStatus.usingMock ? (
                        <Database className="w-4 h-4" />
                    ) : (
                        <Wifi className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">
                        {apiStatus.usingMock ? 'Demo Mode' : 'Live API'}
                    </span>
                </button>
            )}

            {/* Expanded state - full panel */}
            {isExpanded && (
                <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 min-w-[280px]">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                            <Info className="w-4 h-4 text-blue-500" />
                            <h3 className="text-sm font-semibold text-gray-900">API Status</h3>
                        </div>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                        >
                            ×
                        </button>
                    </div>

                    {/* Status Information */}
                    <div className="space-y-3">
                        {/* Connection Status */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Connection:</span>
                            <div className="flex items-center space-x-1">
                                {apiStatus.backendAvailable === null ? (
                                    <>
                                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                        <span className="text-sm text-yellow-600">Checking...</span>
                                    </>
                                ) : apiStatus.backendAvailable ? (
                                    <>
                                        <Wifi className="w-3 h-3 text-green-500" />
                                        <span className="text-sm text-green-600">Live</span>
                                    </>
                                ) : (
                                    <>
                                        <WifiOff className="w-3 h-3 text-red-500" />
                                        <span className="text-sm text-red-600">Offline</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Data Source */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Data Source:</span>
                            <div className="flex items-center space-x-1">
                                {apiStatus.usingMock ? (
                                    <>
                                        <Database className="w-3 h-3 text-orange-500" />
                                        <span className="text-sm text-orange-600">Mock Data</span>
                                    </>
                                ) : (
                                    <>
                                        <Wifi className="w-3 h-3 text-blue-500" />
                                        <span className="text-sm text-blue-600">Backend API</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Backend URL */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Backend:</span>
                            <span className="text-xs text-gray-500 font-mono max-w-[120px] truncate">
                                {apiStatus.backendUrl}
                            </span>
                        </div>

                        {/* Demo Mode Notice */}
                        {apiStatus.usingMock && (
                            <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mt-3">
                                <div className="flex items-start space-x-2">
                                    <Database className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                    <div className="text-xs text-orange-700">
                                        <p className="font-medium mb-1">Demo Mode Active</p>
                                        <p>Using sample data with 8 closures in Chicago area. All changes are temporary and reset on page refresh.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        {apiStatus.usingMock && (
                            <div className="pt-3 border-t border-gray-200">
                                <button
                                    onClick={handleResetData}
                                    disabled={isResetting}
                                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                >
                                    <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
                                    <span>{isResetting ? 'Resetting...' : 'Reset Demo Data'}</span>
                                </button>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="pt-3 border-t border-gray-200">
                            <div className="text-xs text-gray-500 space-y-1">
                                <p>• Create new closures using the form</p>
                                <p>• Click closures on map for details</p>
                                <p>• View statistics in the sidebar</p>
                                {apiStatus.usingMock && (
                                    <p className="text-orange-600">• Changes persist until page refresh</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DemoControlPanel;