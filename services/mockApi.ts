// services/mockApi.ts - Updated with direction support
import {
    Closure,
    CreateClosureData,
    BoundingBox,
    ClosureStats
} from './api';
import {
    mockClosures,
    mockClosureStats,
    filterClosuresByBounds,
    simulateApiDelay
} from '../data/mockClosures';

// In-memory storage for demo (resets on page refresh)
let closuresStorage: Closure[] = [...mockClosures];
let nextId = 1000;

// Generate a unique ID for new closures
const generateId = (): number => {
    return ++nextId;
};

// Generate current timestamp
const getCurrentTimestamp = (): string => {
    return new Date().toISOString();
};

// Determine closure status based on timestamps
const determineStatus = (startTime: string, endTime: string): 'active' | 'inactive' | 'expired' => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now >= start && now <= end) {
        return 'active';
    }
    if (now > end) {
        return 'expired';
    }
    return 'inactive';
};

// Calculate duration in hours
const calculateDuration = (startTime: string, endTime: string): number => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60) * 10) / 10;
};

export const mockClosuresApi = {
    // Get closures within a bounding box
    getClosures: async (bbox?: BoundingBox): Promise<Closure[]> => {
        await simulateApiDelay();

        let filteredClosures = closuresStorage;

        if (bbox) {
            filteredClosures = filterClosuresByBounds(closuresStorage, bbox);
        }

        // Update status based on current time
        filteredClosures = filteredClosures.map(closure => ({
            ...closure,
            status: determineStatus(closure.start_time, closure.end_time)
        }));

        // Sort by created_at (newest first)
        return filteredClosures.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    },

    // Get a specific closure by ID
    getClosure: async (id: number): Promise<Closure> => {
        await simulateApiDelay(300);

        const closure = closuresStorage.find(c => c.id === id);
        if (!closure) {
            throw new Error(`Closure with ID ${id} not found`);
        }

        return {
            ...closure,
            status: determineStatus(closure.start_time, closure.end_time)
        };
    },

    // Create a new closure
    createClosure: async (data: CreateClosureData): Promise<Closure> => {
        await simulateApiDelay(600);

        const now = getCurrentTimestamp();
        const duration = calculateDuration(data.start_time, data.end_time);

        const newClosure: Closure = {
            id: generateId(),
            geometry: data.geometry,
            start_time: data.start_time,
            end_time: data.end_time,
            description: data.description,
            closure_type: data.closure_type,
            status: determineStatus(data.start_time, data.end_time),
            source: data.source,
            confidence_level: data.confidence_level,
            submitter_id: 1, // Mock submitter ID
            created_at: now,
            updated_at: now,
            is_valid: true,
            duration_hours: duration,
            // Handle direction - default to false for Point, use provided value for LineString
            is_bidirectional: data.geometry.type === 'Point' ? false : (data.is_bidirectional || false),
            // Generate a mock OpenLR string
            openlr_code: `CwRbWyNG9RpsCQC${Math.random().toString(36).substr(2, 4)}=`
        };

        closuresStorage.unshift(newClosure); // Add to beginning
        console.log('📝 Created closure with direction:', {
            id: newClosure.id,
            type: newClosure.geometry.type,
            bidirectional: newClosure.is_bidirectional,
            coordinates: newClosure.geometry.coordinates.length
        });

        return newClosure;
    },

    // Update a closure
    updateClosure: async (id: number, data: Partial<CreateClosureData>): Promise<Closure> => {
        await simulateApiDelay(500);

        const closureIndex = closuresStorage.findIndex(c => c.id === id);
        if (closureIndex === -1) {
            throw new Error(`Closure with ID ${id} not found`);
        }

        const existingClosure = closuresStorage[closureIndex];
        const updatedStartTime = data.start_time || existingClosure.start_time;
        const updatedEndTime = data.end_time || existingClosure.end_time;
        const duration = calculateDuration(updatedStartTime, updatedEndTime);

        const updatedClosure: Closure = {
            ...existingClosure,
            ...data,
            id: existingClosure.id, // Ensure ID doesn't change
            created_at: existingClosure.created_at, // Preserve creation time
            updated_at: getCurrentTimestamp(),
            duration_hours: duration,
            status: determineStatus(updatedStartTime, updatedEndTime),
            // Handle direction updates
            is_bidirectional: data.geometry?.type === 'Point'
                ? false
                : (data.is_bidirectional !== undefined ? data.is_bidirectional : existingClosure.is_bidirectional)
        };

        closuresStorage[closureIndex] = updatedClosure;
        return updatedClosure;
    },

    // Delete a closure
    deleteClosure: async (id: number): Promise<void> => {
        await simulateApiDelay(400);

        const closureIndex = closuresStorage.findIndex(c => c.id === id);
        if (closureIndex === -1) {
            throw new Error(`Closure with ID ${id} not found`);
        }

        closuresStorage.splice(closureIndex, 1);
    },

    // Get closure statistics
    getClosureStats: async (): Promise<ClosureStats> => {
        await simulateApiDelay(400);

        const now = new Date();
        const currentClosures = closuresStorage;

        // Calculate real-time statistics
        const active = currentClosures.filter(c => {
            const start = new Date(c.start_time);
            const end = new Date(c.end_time);
            return now >= start && now <= end;
        }).length;

        const upcoming = currentClosures.filter(c => {
            const start = new Date(c.start_time);
            return start > now;
        }).length;

        const expired = currentClosures.filter(c => {
            const end = new Date(c.end_time);
            return end < now;
        }).length;

        const byClosureType = currentClosures.reduce((acc, closure) => {
            acc[closure.closure_type] = (acc[closure.closure_type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const byStatus = currentClosures.reduce((acc, closure) => {
            const status = determineStatus(closure.start_time, closure.end_time);
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Calculate average duration
        const durations = currentClosures.map(closure => closure.duration_hours);
        const averageDuration = durations.length > 0
            ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length
            : 0;

        const totalDuration = durations.reduce((sum, duration) => sum + duration, 0);

        // Direction statistics
        const lineStringClosures = currentClosures.filter(c => c.geometry.type === 'LineString');
        const bidirectionalCount = lineStringClosures.filter(c => c.is_bidirectional).length;
        const unidirectionalCount = lineStringClosures.filter(c => !c.is_bidirectional).length;

        return {
            total: currentClosures.length,
            active,
            upcoming,
            expired,
            byClosureType,
            byStatus,
            byTimeOfDay: {
                morning: Math.floor(currentClosures.length * 0.25),
                afternoon: Math.floor(currentClosures.length * 0.35),
                evening: Math.floor(currentClosures.length * 0.3),
                night: Math.floor(currentClosures.length * 0.1)
            },
            averageDuration: Math.round(averageDuration * 10) / 10,
            totalDuration: Math.round(totalDuration * 10) / 10
        };
    },

    // Reset data to initial state (useful for demo)
    resetData: async (): Promise<void> => {
        await simulateApiDelay(200);
        closuresStorage = [...mockClosures];
        nextId = 1000;
        console.log('🔄 Mock data reset to initial state');
    }
};