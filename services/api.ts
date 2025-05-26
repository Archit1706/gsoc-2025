import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
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

// API Functions
export const closuresApi = {
    // Get closures within a bounding box
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

    // Get a specific closure by ID
    getClosure: async (id: string): Promise<Closure> => {
        try {
            const response = await api.get(`/closures/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching closure:', error);
            throw error;
        }
    },

    // Create a new closure
    createClosure: async (data: CreateClosureData): Promise<Closure> => {
        try {
            const response = await api.post('/closures', data);
            return response.data;
        } catch (error) {
            console.error('Error creating closure:', error);
            throw error;
        }
    },

    // Update a closure
    updateClosure: async (id: string, data: Partial<CreateClosureData>): Promise<Closure> => {
        try {
            const response = await api.put(`/closures/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating closure:', error);
            throw error;
        }
    },

    // Delete a closure
    deleteClosure: async (id: string): Promise<void> => {
        try {
            await api.delete(`/closures/${id}`);
        } catch (error) {
            console.error('Error deleting closure:', error);
            throw error;
        }
    }
};

export default api;