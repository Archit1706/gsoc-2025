import axios from 'axios';
import { mockClosuresApi } from './mockApi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || false;

// Create axios instance for real API
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Types
export interface Closure {
    id: string;
    geometry: {
        type: 'LineString' | 'Point';
        coordinates: number[] | number[][];
    };
    start_time: string;
    end_time: string;
    description: string;
    reason: string;
    status: 'active' | 'inactive' | 'pending';
    submitter: string;
    created_at: string;
    updated_at: string;
    openlr?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface CreateClosureData {
    geometry: {
        type: 'LineString' | 'Point';
        coordinates: number[] | number[][];
    };
    start_time: string;
    end_time: string;
    description: string;
    reason: string;
    submitter: string;
    severity: string;
    contact_info?: string;
    alternative_routes?: string[];
}

export interface BoundingBox {
    north: number;
    south: number;
    east: number;
    west: number;
}

export interface ClosureStats {
    total: number;
    active: number;
    upcoming: number;
    expired: number;
    byReason: Record<string, number>;
    bySeverity: Record<string, number>;
    byTimeOfDay: Record<string, number>;
    averageDuration: number;
    totalDuration: number;
}

// Real API functions
const realApi = {
    getClosures: async (bbox?: BoundingBox): Promise<Closure[]> => {
        try {
            const params = bbox
                ? { bbox: `${bbox.west},${bbox.south},${bbox.east},${bbox.north}` }
                : {};

            const response = await api.get('/closures', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching closures:', error);
            throw error;
        }
    },

    getClosure: async (id: string): Promise<Closure> => {
        try {
            const response = await api.get(`/closures/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching closure:', error);
            throw error;
        }
    },

    createClosure: async (data: CreateClosureData): Promise<Closure> => {
        try {
            const response = await api.post('/closures', data);
            return response.data;
        } catch (error) {
            console.error('Error creating closure:', error);
            throw error;
        }
    },

    updateClosure: async (id: string, data: Partial<CreateClosureData>): Promise<Closure> => {
        try {
            const response = await api.put(`/closures/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating closure:', error);
            throw error;
        }
    },

    deleteClosure: async (id: string): Promise<void> => {
        try {
            await api.delete(`/closures/${id}`);
        } catch (error) {
            console.error('Error deleting closure:', error);
            throw error;
        }
    },

    getClosureStats: async (): Promise<ClosureStats> => {
        try {
            const response = await api.get('/closures/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching closure stats:', error);
            throw error;
        }
    }
};

// Auto-detect if backend is available
let useRealApi = !USE_MOCK_API;
let backendAvailable: boolean | null = null;

const checkBackendAvailability = async (): Promise<boolean> => {
    if (backendAvailable !== null) {
        return backendAvailable;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        backendAvailable = response.ok;
    } catch (error) {
        console.log('Backend not available, using mock data for demo');
        backendAvailable = false;
    }

    useRealApi = backendAvailable && !USE_MOCK_API;
    return backendAvailable;
};

// Main API object that switches between real and mock
export const closuresApi = {
    getClosures: async (bbox?: BoundingBox): Promise<Closure[]> => {
        if (USE_MOCK_API || !(await checkBackendAvailability())) {
            console.log('📍 Using mock data for closures');
            return mockClosuresApi.getClosures(bbox);
        }
        return realApi.getClosures(bbox);
    },

    getClosure: async (id: string): Promise<Closure> => {
        if (USE_MOCK_API || !(await checkBackendAvailability())) {
            return mockClosuresApi.getClosure(id);
        }
        return realApi.getClosure(id);
    },

    createClosure: async (data: CreateClosureData): Promise<Closure> => {
        if (USE_MOCK_API || !(await checkBackendAvailability())) {
            console.log('📝 Creating closure with mock API');
            return mockClosuresApi.createClosure(data);
        }
        return realApi.createClosure(data);
    },

    updateClosure: async (id: string, data: Partial<CreateClosureData>): Promise<Closure> => {
        if (USE_MOCK_API || !(await checkBackendAvailability())) {
            return mockClosuresApi.updateClosure(id, data);
        }
        return realApi.updateClosure(id, data);
    },

    deleteClosure: async (id: string): Promise<void> => {
        if (USE_MOCK_API || !(await checkBackendAvailability())) {
            return mockClosuresApi.deleteClosure(id);
        }
        return realApi.deleteClosure(id);
    },

    getClosureStats: async (): Promise<ClosureStats> => {
        if (USE_MOCK_API || !(await checkBackendAvailability())) {
            console.log('📊 Using mock data for statistics');
            return mockClosuresApi.getClosureStats();
        }
        return realApi.getClosureStats();
    },

    // Utility functions for demo
    isUsingMockData: (): boolean => {
        return USE_MOCK_API || !useRealApi;
    },

    resetMockData: async (): Promise<void> => {
        if (USE_MOCK_API || !useRealApi) {
            return mockClosuresApi.resetData();
        }
        throw new Error('Reset is only available when using mock data');
    },

    getApiStatus: (): {
        usingMock: boolean;
        backendUrl: string;
        forceMock: boolean;
        backendAvailable: boolean | null;
    } => {
        return {
            usingMock: USE_MOCK_API || !useRealApi,
            backendUrl: API_BASE_URL,
            forceMock: USE_MOCK_API,
            backendAvailable
        };
    }
};

export default api;