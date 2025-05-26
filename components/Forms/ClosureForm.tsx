import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Clock, MapPin, User, AlertTriangle, X } from 'lucide-react';
import { useClosures } from '../../context/ClosuresContext';
import { CreateClosureData } from '../../services/api';
import L from 'leaflet';

interface ClosureFormProps {
    isOpen: boolean;
    onClose: () => void;
    selectedLocation?: L.LatLng | null;
    onLocationSelect: () => void;
    isSelectingLocation: boolean;
}

interface FormData {
    description: string;
    reason: string;
    submitter: string;
    start_time: string;
    end_time: string;
    geometry_type: 'Point' | 'LineString';
}

const CLOSURE_REASONS = [
    { value: 'construction', label: 'Construction Work' },
    { value: 'accident', label: 'Traffic Accident' },
    { value: 'event', label: 'Public Event' },
    { value: 'maintenance', label: 'Road Maintenance' },
    { value: 'weather', label: 'Weather Conditions' },
    { value: 'emergency', label: 'Emergency Services' },
    { value: 'other', label: 'Other' },
];

const ClosureForm: React.FC<ClosureFormProps> = ({
    isOpen,
    onClose,
    selectedLocation,
    onLocationSelect,
    isSelectingLocation,
}) => {
    const { createClosure, state } = useClosures();
    const { loading } = state;

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm<FormData>({
        defaultValues: {
            geometry_type: 'Point',
            start_time: new Date().toISOString().slice(0, 16),
            end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16), // 2 hours from now
        },
    });

    const geometryType = watch('geometry_type');

    // Reset form when closing
    useEffect(() => {
        if (!isOpen) {
            reset();
        }
    }, [isOpen, reset]);

    const onSubmit = async (data: FormData) => {
        if (!selectedLocation) {
            alert('Please select a location on the map');
            return;
        }

        const closureData: CreateClosureData = {
            description: data.description,
            reason: data.reason,
            submitter: data.submitter,
            start_time: data.start_time,
            end_time: data.end_time,
            geometry: {
                type: data.geometry_type,
                coordinates: data.geometry_type === 'Point'
                    ? [selectedLocation.lng, selectedLocation.lat]
                    : [[selectedLocation.lng, selectedLocation.lat]], // For now, LineString is just one point
            },
        };

        try {
            await createClosure(closureData);
            reset();
            onClose();
        } catch (error) {
            console.error('Error creating closure:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            />

            {/* Form Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5" />
                        <h2 className="text-lg font-semibold">Report Road Closure</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-blue-700 rounded"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-4 overflow-y-auto max-h-[calc(90vh-4rem)]">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Location Selection */}
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                <MapPin className="w-4 h-4" />
                                <span>Location</span>
                            </label>

                            <button
                                type="button"
                                onClick={onLocationSelect}
                                className={`
                  w-full p-3 border rounded-lg text-left transition-colors
                  ${isSelectingLocation
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : selectedLocation
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }
                `}
                            >
                                {isSelectingLocation ? (
                                    'Click on the map to select location...'
                                ) : selectedLocation ? (
                                    `Selected: ${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`
                                ) : (
                                    'Click to select location on map'
                                )}
                            </button>
                        </div>

                        {/* Geometry Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Closure Type
                            </label>
                            <div className="flex space-x-4">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        value="Point"
                                        className="text-blue-600"
                                        {...register('geometry_type')}
                                    />
                                    <span className="text-sm">Point (intersection/specific location)</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        value="LineString"
                                        className="text-blue-600"
                                        {...register('geometry_type')}
                                    />
                                    <span className="text-sm">Road segment</span>
                                </label>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Description *
                            </label>
                            <textarea
                                {...register('description', {
                                    required: 'Description is required',
                                    minLength: { value: 10, message: 'Description must be at least 10 characters' }
                                })}
                                placeholder="Describe the road closure (e.g., Water main repair blocking northbound traffic)"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={3}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-600">{errors.description.message}</p>
                            )}
                        </div>

                        {/* Reason */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Reason *
                            </label>
                            <select
                                {...register('reason', { required: 'Please select a reason' })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select reason...</option>
                                {CLOSURE_REASONS.map(reason => (
                                    <option key={reason.value} value={reason.value}>
                                        {reason.label}
                                    </option>
                                ))}
                            </select>
                            {errors.reason && (
                                <p className="text-sm text-red-600">{errors.reason.message}</p>
                            )}
                        </div>

                        {/* Time Range */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                    <Calendar className="w-4 h-4" />
                                    <span>Start Time *</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    {...register('start_time', { required: 'Start time is required' })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {errors.start_time && (
                                    <p className="text-sm text-red-600">{errors.start_time.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                    <Clock className="w-4 h-4" />
                                    <span>End Time *</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    {...register('end_time', {
                                        required: 'End time is required',
                                        validate: (value, formValues) => {
                                            return new Date(value) > new Date(formValues.start_time) || 'End time must be after start time';
                                        }
                                    })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {errors.end_time && (
                                    <p className="text-sm text-red-600">{errors.end_time.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Submitter */}
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                <User className="w-4 h-4" />
                                <span>Your Name *</span>
                            </label>
                            <input
                                type="text"
                                {...register('submitter', {
                                    required: 'Name is required',
                                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                                })}
                                placeholder="Enter your name"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {errors.submitter && (
                                <p className="text-sm text-red-600">{errors.submitter.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !selectedLocation}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Reporting...</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="w-4 h-4" />
                                        <span>Report Closure</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ClosureForm;