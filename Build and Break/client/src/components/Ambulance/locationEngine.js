// ───── Location Proximity Engine ─────────────────────────────────────────────
// Simulated travel time matrix between known locations (in minutes).
// Since we don't have a real map API, we use realistic driving distances
// between central MP (Madhya Pradesh) locations.

const TRAVEL_TIMES = {
    'Sehore PHC': {
        'Sehore Village PHC': 5, 'Sehore Market': 4, 'Raisen Community Center': 35,
        'Vidisha PHC': 55, 'Vidisha Bus Stand': 52, 'Hoshangabad Road': 60,
        'Ashta Town': 30, 'City General Hospital, Bhopal': 40,
        'District Medical Center, Indore': 180, 'Rural Health Institute, Sehore': 8,
        'Bhopal Station': 38, 'Raisen Hub': 32, 'Vidisha Depot': 50,
        'Hoshangabad Base': 65, 'Apollo Rural Clinic, Vidisha': 55,
    },
    'Bhopal Station': {
        'Sehore Village PHC': 42, 'Sehore Market': 40, 'Raisen Community Center': 28,
        'Vidisha PHC': 60, 'Vidisha Bus Stand': 58, 'Hoshangabad Road': 48,
        'Ashta Town': 70, 'City General Hospital, Bhopal': 12,
        'District Medical Center, Indore': 195, 'Rural Health Institute, Sehore': 45,
        'Raisen Hub': 25, 'Vidisha Depot': 55, 'Hoshangabad Base': 50,
        'Apollo Rural Clinic, Vidisha': 62,
    },
    'Raisen Hub': {
        'Sehore Village PHC': 38, 'Sehore Market': 35, 'Raisen Community Center': 8,
        'Vidisha PHC': 45, 'Vidisha Bus Stand': 42, 'Hoshangabad Road': 55,
        'Ashta Town': 65, 'City General Hospital, Bhopal': 30,
        'District Medical Center, Indore': 210, 'Rural Health Institute, Sehore': 40,
        'Bhopal Station': 25, 'Vidisha Depot': 40, 'Hoshangabad Base': 58,
        'Apollo Rural Clinic, Vidisha': 48,
    },
    'Vidisha Depot': {
        'Sehore Village PHC': 55, 'Sehore Market': 52, 'Raisen Community Center': 40,
        'Vidisha PHC': 6, 'Vidisha Bus Stand': 4, 'Hoshangabad Road': 70,
        'Ashta Town': 80, 'City General Hospital, Bhopal': 60,
        'District Medical Center, Indore': 230, 'Rural Health Institute, Sehore': 58,
        'Bhopal Station': 55, 'Raisen Hub': 40, 'Hoshangabad Base': 75,
        'Apollo Rural Clinic, Vidisha': 8,
    },
    'Hoshangabad Base': {
        'Sehore Village PHC': 68, 'Sehore Market': 65, 'Raisen Community Center': 55,
        'Vidisha PHC': 78, 'Vidisha Bus Stand': 75, 'Hoshangabad Road': 10,
        'Ashta Town': 45, 'City General Hospital, Bhopal': 50,
        'District Medical Center, Indore': 160, 'Rural Health Institute, Sehore': 70,
        'Bhopal Station': 50, 'Raisen Hub': 58, 'Vidisha Depot': 75,
        'Apollo Rural Clinic, Vidisha': 80,
    },
};

/**
 * Get estimated travel time (minutes) from ambulance location to pickup.
 * Falls back to a heuristic if no entry exists.
 */
export function getTravelTime(fromLocation, toLocation) {
    if (fromLocation === toLocation) return 2; // same place

    const fromMatrix = TRAVEL_TIMES[fromLocation];
    if (fromMatrix && fromMatrix[toLocation] !== undefined) {
        return fromMatrix[toLocation];
    }

    // Reverse lookup
    const toMatrix = TRAVEL_TIMES[toLocation];
    if (toMatrix && toMatrix[fromLocation] !== undefined) {
        return toMatrix[fromLocation];
    }

    // Heuristic: return 45 min as a default for unknown routes
    return 45;
}

/**
 * Find the best available ambulance for a given pickup location.
 * Returns { ambulance, travelTime } or null if none available.
 */
export function findBestAmbulance(fleet, pickupLocation) {
    const available = fleet.filter(a => a.status === 'Available');
    if (available.length === 0) return null;

    let best = null;
    let bestTime = Infinity;

    for (const amb of available) {
        const time = getTravelTime(amb.location, pickupLocation);
        if (time < bestTime) {
            bestTime = time;
            best = amb;
        }
    }

    return best ? { ambulance: best, travelTime: bestTime } : null;
}

/**
 * Rank all available ambulances by proximity to a pickup location.
 * Returns array of { ambulance, travelTime } sorted by travelTime ascending.
 */
export function rankAmbulances(fleet, pickupLocation) {
    const available = fleet.filter(a => a.status === 'Available');
    return available
        .map(amb => ({ ambulance: amb, travelTime: getTravelTime(amb.location, pickupLocation) }))
        .sort((a, b) => a.travelTime - b.travelTime);
}
