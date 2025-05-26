import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { Closure, CreateClosureData, BoundingBox, closuresApi } from '@/services/api';
import toast from 'react-hot-toast';

// State interface
interface ClosuresState {
    closures: Closure[];
    loading: boolean;
    error: string | null;
    selectedClosure: Closure | null;
}

// Action types
type ClosuresAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_CLOSURES'; payload: Closure[] }
    | { type: 'ADD_CLOSURE'; payload: Closure }
    | { type: 'UPDATE_CLOSURE'; payload: Closure }
    | { type: 'DELETE_CLOSURE'; payload: string }
    | { type: 'SET_SELECTED_CLOSURE'; payload: Closure | null }
    | { type: 'SET_ERROR'; payload: string | null };

// Context interface
interface ClosuresContextType {
    state: ClosuresState;
    fetchClosures: (bbox?: BoundingBox) => Promise<void>;
    createClosure: (data: CreateClosureData) => Promise<void>;
    updateClosure: (id: string, data: Partial<CreateClosureData>) => Promise<void>;
    deleteClosure: (id: string) => Promise<void>;
    selectClosure: (closure: Closure | null) => void;
}

// Initial state
const initialState: ClosuresState = {
    closures: [],
    loading: false,
    error: null,
    selectedClosure: null,
};

// Reducer
const closuresReducer = (state: ClosuresState, action: ClosuresAction): ClosuresState => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };

        case 'SET_CLOSURES':
            return { ...state, closures: action.payload, loading: false, error: null };

        case 'ADD_CLOSURE':
            return {
                ...state,
                closures: [...state.closures, action.payload],
                loading: false,
                error: null
            };

        case 'UPDATE_CLOSURE':
            return {
                ...state,
                closures: state.closures.map(closure =>
                    closure.id === action.payload.id ? action.payload : closure
                ),
                selectedClosure: state.selectedClosure?.id === action.payload.id
                    ? action.payload
                    : state.selectedClosure,
                loading: false,
                error: null
            };

        case 'DELETE_CLOSURE':
            return {
                ...state,
                closures: state.closures.filter(closure => closure.id !== action.payload),
                selectedClosure: state.selectedClosure?.id === action.payload
                    ? null
                    : state.selectedClosure,
                loading: false,
                error: null
            };

        case 'SET_SELECTED_CLOSURE':
            return { ...state, selectedClosure: action.payload };

        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };

        default:
            return state;
    }
};

// Create context
const ClosuresContext = createContext<ClosuresContextType | undefined>(undefined);

// Provider component
interface ClosuresProviderProps {
    children: ReactNode;
}

export const ClosuresProvider: React.FC<ClosuresProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(closuresReducer, initialState);

    const fetchClosures = useCallback(async (bbox?: BoundingBox) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const closures = await closuresApi.getClosures(bbox);
            dispatch({ type: 'SET_CLOSURES', payload: closures });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch closures';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            toast.error(errorMessage);
        }
    }, []);

    const createClosure = useCallback(async (data: CreateClosureData) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const newClosure = await closuresApi.createClosure(data);
            dispatch({ type: 'ADD_CLOSURE', payload: newClosure });
            toast.success('Road closure reported successfully!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create closure';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            toast.error(errorMessage);
        }
    }, []);

    const updateClosure = useCallback(async (id: string, data: Partial<CreateClosureData>) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const updatedClosure = await closuresApi.updateClosure(id, data);
            dispatch({ type: 'UPDATE_CLOSURE', payload: updatedClosure });
            toast.success('Closure updated successfully!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update closure';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            toast.error(errorMessage);
        }
    }, []);

    const deleteClosure = useCallback(async (id: string) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await closuresApi.deleteClosure(id);
            dispatch({ type: 'DELETE_CLOSURE', payload: id });
            toast.success('Closure deleted successfully!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete closure';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            toast.error(errorMessage);
        }
    }, []);

    const selectClosure = useCallback((closure: Closure | null) => {
        dispatch({ type: 'SET_SELECTED_CLOSURE', payload: closure });
    }, []);

    const value: ClosuresContextType = {
        state,
        fetchClosures,
        createClosure,
        updateClosure,
        deleteClosure,
        selectClosure,
    };

    return (
        <ClosuresContext.Provider value={value}>
            {children}
        </ClosuresContext.Provider>
    );
};

// Hook to use the context
export const useClosures = (): ClosuresContextType => {
    const context = useContext(ClosuresContext);
    if (!context) {
        throw new Error('useClosures must be used within a ClosuresProvider');
    }
    return context;
};