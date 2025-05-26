import React from 'react';
import { Road, AlertTriangle, Menu, X } from 'lucide-react';

interface HeaderProps {
    onToggleForm: () => void;
    isFormOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleForm, isFormOpen }) => {
    return (
        <header className="bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Title */}
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                            <Road className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                OSM Road Closures
                            </h1>
                            <p className="text-sm text-gray-500">
                                Community-driven road closure reporting
                            </p>
                        </div>
                    </div>

                    {/* Navigation and Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Stats */}
                        <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                <span>Live Updates</span>
                            </div>
                        </div>

                        {/* Report Closure Button */}
                        <button
                            onClick={onToggleForm}
                            className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors
                ${isFormOpen
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }
              `}
                        >
                            {isFormOpen ? (
                                <>
                                    <X className="w-4 h-4" />
                                    <span>Cancel</span>
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>Report Closure</span>
                                </>
                            )}
                        </button>

                        {/* Mobile menu button */}
                        <button className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;