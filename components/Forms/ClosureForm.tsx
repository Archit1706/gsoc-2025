import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Clock, MapPin, User, TriangleAlert, X, Info, Phone, Route } from 'lucide-react';
import { useClosures } from '@/context/ClosuresContext';
import { CreateClosureData } from '@/services/api';
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
    reason: 'construction' | 'accident' | 'event' | 'maintenance' | 'weather' | 'emergency' | 'other';
    submitter: string;
    start_time: string;
    end_time: string;
    geometry_type: 'Point' | 'LineString';
    severity: 'low' | 'medium' | 'high' | 'critical';
    contact_info: string;
    alternative_routes: string;
}

const CLOSURE_REASONS = [
    { value: 'construction', label: 'Construction Work', icon: '🚧' },
    { value: 'accident', label: 'Traffic Accident', icon: '💥' },
    { value: 'event', label: 'Public Event', icon: '🎉' },
    { value: 'maintenance', label: 'Road Maintenance', icon: '🔧' },
    { value: 'weather', label: 'Weather Conditions', icon: '🌧️' },
    { value: 'emergency', label: 'Emergency Services', icon: '🚨' },
    { value: 'other', label: 'Other', icon: '❓' },
];

const SEVERITY_LEVELS = [
    { value: 'low', label: 'Low', color: 'text-green-600', description: 'Minor disruption, alternative routes available' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600', description: 'Moderate disruption, some delays expected' },
    { value: 'high', label: 'High', color: 'text-orange-600', description: 'Major disruption, significant delays' },
    { value: 'critical', label: 'Critical', color: 'text-red-600', description: 'Complete closure, no through traffic' },
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
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
        trigger,
    } = useForm<FormData>({
        defaultValues: {
            geometry_type: 'Point',
            start_time: new Date().toISOString().slice(0, 16),
            end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
            severity: 'medium',
            contact_info: '',
            alternative_routes: '',
        },
    });

    const watchedSeverity = watch('severity');
    const watchedReason = watch('reason');

    // Reset form when closing
    useEffect(() => {
        if (!isOpen) {
            reset();
            setCurrentStep(1);
        }
    }, [isOpen, reset]);

    const nextStep = async () => {
        const fieldsToValidate = currentStep === 1
            ? ['description', 'reason', 'severity']
            : currentStep === 2
                ? ['start_time', 'end_time', 'submitter']
                : [];

        const isValid = await trigger(fieldsToValidate as any);
        if (isValid && currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

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
            severity: data.severity,
            contact_info: data.contact_info || undefined,
            alternative_routes: data.alternative_routes ? data.alternative_routes.split(',').map(r => r.trim()) : undefined,
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
            setCurrentStep(1);
            onClose();
        } catch (error) {
            console.error('Error creating closure:', error);
        }
    };

    if (!isOpen) return null;

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <>
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
                            <div className="grid grid-cols-2 gap-2">
                                {CLOSURE_REASONS.map(reason => (
                                    <label
                                        key={reason.value}
                                        className={`
                                            flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors
                                            ${watchedReason === reason.value
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                            }
                                        `}
                                    >
                                        <input
                                            type="radio"
                                            value={reason.value}
                                            className="text-blue-600"
                                            {...register('reason', { required: 'Please select a reason' })}
                                        />
                                        <span className="text-lg">{reason.icon}</span>
                                        <span className="text-sm font-medium">{reason.label}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.reason && (
                                <p className="text-sm text-red-600">{errors.reason.message}</p>
                            )}
                        </div>

                        {/* Severity */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Severity *
                            </label>
                            <div className="space-y-2">
                                {SEVERITY_LEVELS.map(level => (
                                    <label
                                        key={level.value}
                                        className={`
                                            flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors
                                            ${watchedSeverity === level.value
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                            }
                                        `}
                                    >
                                        <input
                                            type="radio"
                                            value={level.value}
                                            className="mt-1 text-blue-600"
                                            {...register('severity')}
                                        />
                                        <div className="flex-1">
                                            <div className={`font-medium ${level.color}`}>
                                                {level.label}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {level.description}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </>
                );

            case 2:
                return (
                    <>
                        {/* Location Selection */}
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                <MapPin className="w-4 h-4" />
                                <span>Location *</span>
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
                    </>
                );

            case 3:
                return (
                    <>
                        {/* Contact Info */}
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                <Phone className="w-4 h-4" />
                                <span>Contact Information (Optional)</span>
                            </label>
                            <input
                                type="text"
                                {...register('contact_info')}
                                placeholder="Phone number, email, or other contact details"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500">
                                Provide contact information if others need to verify or get updates about this closure
                            </p>
                        </div>

                        {/* Alternative Routes */}
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                <Route className="w-4 h-4" />
                                <span>Alternative Routes (Optional)</span>
                            </label>
                            <textarea
                                {...register('alternative_routes')}
                                placeholder="Suggest alternative routes (e.g., Use Main St instead of Oak Ave, Detour via Highway 101)"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={3}
                            />
                            <p className="text-xs text-gray-500">
                                Separate multiple routes with commas
                            </p>
                        </div>

                        {/* Summary */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>Type:</strong> {watchedReason && CLOSURE_REASONS.find(r => r.value === watchedReason)?.label}</p>
                                <p><strong>Severity:</strong> {watchedSeverity && SEVERITY_LEVELS.find(s => s.value === watchedSeverity)?.label}</p>
                                <p><strong>Location:</strong> {selectedLocation ? `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}` : 'Not selected'}</p>
                            </div>
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            />

            {/* Form Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <TriangleAlert className="w-5 h-5" />
                        <h2 className="text-lg font-semibold">Report Road Closure</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-blue-700 rounded"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex items-center">
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                                    ${step <= currentStep
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-600'
                                    }
                                `}>
                                    {step}
                                </div>
                                {step < 3 && (
                                    <div className={`
                                        w-16 h-1 mx-2
                                        ${step < currentStep ? 'bg-blue-600' : 'bg-gray-200'}
                                    `} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                        Step {currentStep} of {totalSteps}: {
                            currentStep === 1 ? 'Closure Details' :
                                currentStep === 2 ? 'Location & Timing' :
                                    'Additional Information'
                        }
                    </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="p-4 overflow-y-auto max-h-[calc(90vh-12rem)] space-y-4">
                        {renderStepContent()}
                    </div>

                    {/* Footer with Navigation */}
                    <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex space-x-2">
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                                >
                                    Previous
                                </button>
                            )}
                        </div>

                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>

                            {currentStep < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading || !selectedLocation}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Reporting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <TriangleAlert className="w-4 h-4" />
                                            <span>Report Closure</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClosureForm;