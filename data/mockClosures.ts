// data/mockClosures.ts
import { Closure, ClosureStats } from '@/services/api';

// Generate realistic timestamps
const now = new Date();
const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
const twelvehHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000);
const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);
const eightHoursFromNow = new Date(now.getTime() + 8 * 60 * 60 * 1000);
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

export const mockClosures: Closure[] = [
    // EMERGENCY CLOSURES
    {
        id: 1,
        geometry: {
            type: "Point",
            coordinates: [[-87.6298, 41.8781]] // Chicago downtown
        },
        start_time: oneHourAgo.toISOString(),
        end_time: sixHoursFromNow.toISOString(),
        description: "Water main break on Michigan Avenue - Emergency repair crews on site",
        closure_type: "emergency",
        status: "active",
        source: "Chicago Water Management",
        confidence_level: 9,
        submitter_id: 1,
        created_at: oneHourAgo.toISOString(),
        updated_at: thirtyMinutesAgo.toISOString(),
        openlr_code: "CwRbWyNG9RpsCQCaAL4=",
        is_valid: true,
        duration_hours: 5,
        is_bidirectional: false // Point closures don't have direction
    },
    {
        id: 2,
        geometry: {
            type: "LineString",
            coordinates: [
                [-87.6590, 41.9100],
                [-87.6580, 41.9090],
                [-87.6570, 41.9080]
            ]
        },
        start_time: twoHoursAgo.toISOString(),
        end_time: fourHoursFromNow.toISOString(),
        description: "Gas leak emergency - Evacuating nearby buildings on Lincoln Avenue",
        closure_type: "emergency",
        status: "active",
        source: "Peoples Gas Emergency Response",
        confidence_level: 10,
        submitter_id: 2,
        created_at: twoHoursAgo.toISOString(),
        updated_at: oneHourAgo.toISOString(),
        openlr_code: "CwRbWyNG9RpsCQCaAL5=",
        is_valid: true,
        duration_hours: 6,
        is_bidirectional: true // Complete road closure - both directions
    },
    {
        id: 3,
        geometry: {
            type: "Point",
            coordinates: [[-87.6180, 41.8690]] // South Loop
        },
        start_time: fourHoursAgo.toISOString(),
        end_time: thirtyMinutesAgo.toISOString(),
        description: "Fire department emergency response - Building fire contained",
        closure_type: "emergency",
        status: "expired",
        source: "Chicago Fire Department",
        confidence_level: 8,
        submitter_id: 3,
        created_at: fourHoursAgo.toISOString(),
        updated_at: thirtyMinutesAgo.toISOString(),
        openlr_code: "CwRbWyNG9RpsCQCaAL6=",
        is_valid: true,
        duration_hours: 3.5,
        is_bidirectional: false
    },

    // CONSTRUCTION CLOSURES
    {
        id: 4,
        geometry: {
            type: "LineString",
            coordinates: [
                [-87.6244, 41.8756],
                [-87.6200, 41.8742],
                [-87.6180, 41.8738],
                [-87.6160, 41.8734]
            ]
        },
        start_time: twoDaysAgo.toISOString(),
        end_time: twoHoursFromNow.toISOString(),
        description: "Road construction - Lane closure on State Street for new bike lane installation",
        closure_type: "construction",
        status: "active",
        source: "CDOT Construction Division",
        confidence_level: 7,
        submitter_id: 4,
        created_at: twoDaysAgo.toISOString(),
        updated_at: now.toISOString(),
        openlr_code: "CwRbWyNG9RpsCQCbBM6=",
        is_valid: true,
        duration_hours: 50,
        is_bidirectional: false // Single lane closure, one direction
    },
    {
        id: 5,
        geometry: {
            type: "LineString",
            coordinates: [
                [-87.6340, 41.8950],
                [-87.6320, 41.8945],
                [-87.6300, 41.8940],
                [-87.6280, 41.8935]
            ]
        },
        start_time: tomorrow.toISOString(),
        end_time: oneWeekFromNow.toISOString(),
        description: "Major construction project - Complete street reconstruction on North Clark Street",
        closure_type: "construction",
        status: "inactive",
        source: "Walsh Construction",
        confidence_level: 9,
        submitter_id: 5,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        openlr_code: "CwRbWyNG9RpsCQCcCN7=",
        is_valid: true,
        duration_hours: 144,
        is_bidirectional: true // Complete street reconstruction - both directions
    },
    {
        id: 6,
        geometry: {
            type: "Point",
            coordinates: [[-87.6280, 41.8620]] // Near McCormick Place
        },
        start_time: threeDaysFromNow.toISOString(),
        end_time: twoWeeksFromNow.toISOString(),
        description: "Bridge reconstruction - Temporary bridge installation on 31st Street",
        closure_type: "construction",
        status: "inactive",
        source: "Chicago Bridge & Iron",
        confidence_level: 8,
        submitter_id: 6,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        openlr_code: "CwRbWyNG9RpsCQCdDO8=",
        is_valid: true,
        duration_hours: 264,
        is_bidirectional: false
    },

    // ACCIDENT CLOSURES
    {
        id: 7,
        geometry: {
            type: "LineString",
            coordinates: [
                [-87.6340, 41.8850],
                [-87.6320, 41.8845],
                [-87.6300, 41.8840]
            ]
        },
        start_time: twoDaysAgo.toISOString(),
        end_time: oneHourAgo.toISOString(),
        description: "Multi-vehicle collision cleared - All lanes reopened on Lake Shore Drive",
        closure_type: "accident",
        status: "expired",
        source: "Chicago Police Traffic Division",
        confidence_level: 10,
        submitter_id: 7,
        created_at: twoDaysAgo.toISOString(),
        updated_at: oneHourAgo.toISOString(),
        openlr_code: "CwRbWyNG9RpsCQCeEP0=",
        is_valid: true,
        duration_hours: 47,
        is_bidirectional: false // Accident typically affects one direction more
    },
    {
        id: 8,
        geometry: {
            type: "Point",
            coordinates: [[-87.6450, 41.8750]] // West Loop
        },
        start_time: thirtyMinutesAgo.toISOString(),
        end_time: twoHoursFromNow.toISOString(),
        description: "Vehicle accident - Tow truck removing disabled vehicle from intersection",
        closure_type: "accident",
        status: "active",
        source: "CPD District 1",
        confidence_level: 6,
        submitter_id: 8,
        created_at: thirtyMinutesAgo.toISOString(),
        updated_at: now.toISOString(),
        openlr_code: "CwRbWyNG9RpsCQCeEP1=",
        is_valid: true,
        duration_hours: 2.5,
        is_bidirectional: false
    },
    {
        id: 9,
        geometry: {
            type: "LineString",
            coordinates: [
                [-87.6700, 41.9200],
                [-87.6680, 41.9190],
                [-87.6660, 41.9180]
            ]
        },
        start_time: sixHoursAgo.toISOString(),
        end_time: twoHoursAgo.toISOString(),
        description: "Truck rollover incident cleared - Traffic restored on Fullerton Parkway",
        closure_type: "accident",
        status: "expired",
        source: "Illinois State Police",
        confidence_level: 9,
        submitter_id: 9,
        created_at: sixHoursAgo.toISOString(),
        updated_at: twoHoursAgo.toISOString(),
        openlr_code: "CwRbWyNG9RpsCQCjJU2=",
        is_valid: true,
        duration_hours: 4,
        is_bidirectional: true // Major truck accident - affected both directions
    },

    // EVENT CLOSURES
    {
        id: 10,
        geometry: {
            type: "LineString",
            coordinates: [
                [-87.6270, 41.8825], // Grant Park area
                [-87.6250, 41.8820],
                [-87.6230, 41.8815],
                [-87.6210, 41.8810]
            ]
        },
        start_time: tomorrow.toISOString(),
        end_time: new Date(tomorrow.getTime() + 8 * 60 * 60 * 1000).toISOString(),
        description: "Chicago Marathon 2025 - Complete road closure in Grant Park and downtown area",
        closure_type: "event",
        status: "inactive",
        source: "Chicago Marathon Organizers",
        confidence_level: 10,
        submitter_id: 10,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        openlr_code: "CwRbWyNG9RpsCQCcCN8=",
        is_valid: true,
        duration_hours: 8,
        is_bidirectional: true // Marathon - complete road closure
    },
    {
        id: 11,
        geometry: {
            type: "Point",
            coordinates: [[-87.6240, 41.8900]] // Near Navy Pier
        },
        start_time: twoDaysFromNow.toISOString(),
        end_time: new Date(twoDaysFromNow.getTime() + 6 * 60 * 60 * 1000).toISOString(),
        description: "Street festival setup - Taste of Chicago preparation on Lower Wacker",
        closure_type: "event",
        status: "inactive",
        source: "Chicago Special Events",
        confidence_level: 7,
        submitter_id: 11,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        openlr_code: "CwRbWyNG9RpsCQCfFQ9=",
        is_valid: true,
        duration_hours: 6,
        is_bidirectional: false
    },
    {
        id: 12,
        geometry: {
            type: "LineString",
            coordinates: [
                [-87.6240, 41.8780],
                [-87.6220, 41.8775],
                [-87.6200, 41.8770]
            ]
        },
        start_time: oneWeekFromNow.toISOString(),
        end_time: new Date(oneWeekFromNow.getTime() + 12 * 60 * 60 * 1000).toISOString(),
        description: "Bulls parade route - Victory celebration planned for Michigan Avenue",
        closure_type: "event",
        status: "inactive",
        source: "City of Chicago Events",
        confidence_level: 8,
        submitter_id: 12,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        openlr_code: "CwRbWyNG9RpsCQCgGR1=",
        is_valid: true,
        duration_hours: 12,
        is_bidirectional: true // Parade - typically affects entire street
    },

    // MAINTENANCE CLOSURES
    {
        id: 13,
        geometry: {
            type: "Point",
            coordinates: [[-87.6400, 41.8790]] // West Loop
        },
        start_time: now.toISOString(),
        end_time: twoHoursFromNow.toISOString(),
        description: "Utility maintenance - Scheduled gas line inspection on Randolph Street",
        closure_type: "maintenance",
        status: "active",
        source: "Peoples Gas Maintenance",
        confidence_level: 7,
        submitter_id: 13,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        openlr_code: "CwRbWyNG9RpsCQCdDO9=",
        is_valid: true,
        duration_hours: 2,
        is_bidirectional: false
    },
    {
        id: 14,
        geometry: {
            type: "LineString",
            coordinates: [
                [-87.6100, 41.8650],
                [-87.6080, 41.8645],
                [-87.6060, 41.8640]
            ]
        },
        start_time: tomorrow.toISOString(),
        end_time: new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000).toISOString(),
        description: "Street cleaning and pothole repair - Lane restrictions on Cermak Road",
        closure_type: "maintenance",
        status: "inactive",
        source: "Streets & Sanitation",
        confidence_level: 6,
        submitter_id: 14,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        openlr_code: "CwRbWyNG9RpsCQChHS3=",
        is_valid: true,
        duration_hours: 4,
        is_bidirectional: false // Street cleaning - usually one direction at a time
    },
    {
        id: 15,
        geometry: {
            type: "LineString",
            coordinates: [
                [-87.6800, 41.9000],
                [-87.6780, 41.8995],
                [-87.6760, 41.8990]
            ]
        },
        start_time: oneHourFromNow.toISOString(),
        end_time: sixHoursFromNow.toISOString(),
        description: "Traffic signal maintenance - Upgrading intersection controllers on North Avenue",
        closure_type: "maintenance",
        status: "active",
        source: "CDOT Signal Division",
        confidence_level: 8,
        submitter_id: 15,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        openlr_code: "CwRbWyNG9RpsCQChHS1=",
        is_valid: true,
        duration_hours: 5,
        is_bidirectional: false // Signal work - typically affects one direction
    },

    // WEATHER CLOSURES
    {
        id: 16,
        geometry: {
            type: "Point",
            coordinates: [[-87.6150, 41.8700]] // South Loop
        },
        start_time: thirtyMinutesAgo.toISOString(),
        end_time: oneHourFromNow.toISOString(),
        description: "Ice removal operations - Salting trucks active on Roosevelt Road",
        closure_type: "weather",
        status: "active",
        source: "CDOT Snow Operations",
        confidence_level: 7,
        submitter_id: 16,
        created_at: thirtyMinutesAgo.toISOString(),
        updated_at: now.toISOString(),
        openlr_code: "CwRbWyNG9RpsCQCeEP0=",
        is_valid: true,
        duration_hours: 1.5,
        is_bidirectional: false
    },
    {
        id: 17,
        geometry: {
            type: "LineString",
            coordinates: [
                [-87.6400, 41.9100],
                [-87.6380, 41.9095],
                [-87.6360, 41.9090],
                [-87.6340, 41.9085]
            ]
        },
        start_time: oneDayAgo.toISOString(),
        end_time: fourHoursAgo.toISOString(),
        description: "Snow removal completed - All lanes cleared on Armitage Avenue",
        closure_type: "weather",
        status: "expired",
        source: "Chicago Snow Command",
        confidence_level: 9,
        submitter_id: 17,
        created_at: oneDayAgo.toISOString(),
        updated_at: fourHoursAgo.toISOString(),
        openlr_code: "CwRbWyNG9RpsCQCiIT4=",
        is_valid: true,
        duration_hours: 20,
        is_bidirectional: true // Heavy snow - affected entire street
    },
    {
        id: 18,
        geometry: {
            type: "Point",
            coordinates: [[-87.6500, 41.8500]] // Bridgeport area
        },
        start_time: threeDaysAgo.toISOString(),
        end_time: oneDayAgo.toISOString(),
        description: "Flooding cleared - Drainage pumps removed from 35th Street underpass",
        closure_type: "weather",
        status: "expired",
        source: "Chicago Emergency Management",
        confidence_level: 10,
        submitter_id: 18,
        created_at: threeDaysAgo.toISOString(),
        updated_at: oneDayAgo.toISOString(),
        openlr_code: "CwRbWyNG9RpsCQCkKV5=",
        is_valid: true,
        duration_hours: 48,
        is_bidirectional: false
    },

    // ADDITIONAL VARIETY CLOSURES WITH INTERESTING DIRECTIONS
    {
        id: 19,
        geometry: {
            type: "LineString",
            coordinates: [
                [-87.6500, 41.8800],
                [-87.6480, 41.8805],
                [-87.6460, 41.8810],
                [-87.6440, 41.8815]
            ]
        },
        start_time: threeDaysFromNow.toISOString(),
        end_time: new Date(threeDaysFromNow.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        description: "Bridge inspection and maintenance - Periodic safety check on Harrison Street Bridge",
        closure_type: "maintenance",
        status: "inactive",
        source: "Chicago Bridge Engineering",
        confidence_level: 8,
        submitter_id: 19,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        openlr_code: "CwRbWyNG9RpsCQClLW6=",
        is_valid: true,
        duration_hours: 48,
        is_bidirectional: true // Bridge work - typically affects both directions
    },
    {
        id: 20,
        geometry: {
            type: "LineString",
            coordinates: [
                [-87.6200, 41.8950],
                [-87.6180, 41.8945],
                [-87.6160, 41.8940]
            ]
        },
        start_time: fourHoursFromNow.toISOString(),
        end_time: eightHoursFromNow.toISOString(),
        description: "Film production - Movie shoot requiring temporary street closure on North Wells",
        closure_type: "event",
        status: "inactive",
        source: "Chicago Film Office",
        confidence_level: 7,
        submitter_id: 20,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        openlr_code: "CwRbWyNG9RpsCQCiIT2=",
        is_valid: true,
        duration_hours: 4,
        is_bidirectional: false // Film shoot - usually affects one direction
    }
];

// Calculate comprehensive statistics based on the expanded sample data
const calculateStats = (): ClosureStats => {
    const currentTime = now;

    const active = mockClosures.filter(c => {
        const start = new Date(c.start_time);
        const end = new Date(c.end_time);
        return currentTime >= start && currentTime <= end;
    }).length;

    const upcoming = mockClosures.filter(c => {
        const start = new Date(c.start_time);
        return start > currentTime;
    }).length;

    const expired = mockClosures.filter(c => {
        const end = new Date(c.end_time);
        return end < currentTime;
    }).length;

    const byClosureType = mockClosures.reduce((acc, closure) => {
        acc[closure.closure_type] = (acc[closure.closure_type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const byStatus = mockClosures.reduce((acc, closure) => {
        acc[closure.status] = (acc[closure.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Calculate durations
    const durations = mockClosures.map(closure => closure.duration_hours);
    const totalDuration = durations.reduce((sum, duration) => sum + duration, 0);
    const averageDuration = durations.length > 0 ? totalDuration / durations.length : 0;

    // Direction statistics
    const lineStringClosures = mockClosures.filter(c => c.geometry.type === 'LineString');
    const bidirectionalCount = lineStringClosures.filter(c => c.is_bidirectional).length;
    const unidirectionalCount = lineStringClosures.filter(c => !c.is_bidirectional).length;

    return {
        total: mockClosures.length,
        active,
        upcoming,
        expired,
        byClosureType,
        byStatus,
        byTimeOfDay: {
            morning: Math.floor(mockClosures.length * 0.25),
            afternoon: Math.floor(mockClosures.length * 0.35),
            evening: Math.floor(mockClosures.length * 0.25),
            night: Math.floor(mockClosures.length * 0.15)
        },
        averageDuration: Math.round(averageDuration * 10) / 10,
        totalDuration: Math.round(totalDuration * 10) / 10
    };
};

export const mockClosureStats: ClosureStats = calculateStats();

// Helper function to filter closures by bounding box
export const filterClosuresByBounds = (
    closures: Closure[],
    bbox: { north: number; south: number; east: number; west: number }
): Closure[] => {
    return closures.filter(closure => {
        if (closure.geometry.type === 'Point') {
            const [lng, lat] = closure.geometry.coordinates[0] as number[];
            return lat >= bbox.south && lat <= bbox.north &&
                lng >= bbox.west && lng <= bbox.east;
        } else if (closure.geometry.type === 'LineString') {
            // Check if any point in the LineString is within bounds
            const coordinates = closure.geometry.coordinates as number[][];
            return coordinates.some(([lng, lat]) =>
                lat >= bbox.south && lat <= bbox.north &&
                lng >= bbox.west && lng <= bbox.east
            );
        }
        return false;
    });
};

// Simulate API delay with some randomness for realism
export const simulateApiDelay = (ms: number = 800): Promise<void> => {
    const randomDelay = ms + Math.random() * 400; // Add 0-400ms random delay
    return new Promise(resolve => setTimeout(resolve, randomDelay));
};