import { Event } from "@/api/entities";
import { Venue } from "@/api/entities";

/**
 * Processes real Ticketmaster API response and maps to internal format
 */
function mapTicketmasterEventToInternal(tmEvent) {
    // Extract venue information
    const venue = tmEvent._embedded?.venues?.[0] || {};
    
    // Calculate impact score based on multiple factors
    let impactScore = 50; // Base score
    
    // Distance factor (closer = higher impact)
    if (tmEvent.distance) {
        impactScore += Math.max(0, (5 - tmEvent.distance) * 5);
    }
    
    // Price range factor (higher prices = higher impact)
    const priceRanges = tmEvent.priceRanges || [];
    if (priceRanges.length > 0) {
        const maxPrice = Math.max(...priceRanges.map(p => p.max || 0));
        if (maxPrice > 200) impactScore += 20;
        else if (maxPrice > 100) impactScore += 10;
        else if (maxPrice > 50) impactScore += 5;
    }
    
    // Venue size factor (larger venues = higher impact)
    if (venue.capacity) {
        if (venue.capacity > 10000) impactScore += 25;
        else if (venue.capacity > 5000) impactScore += 15;
        else if (venue.capacity > 1000) impactScore += 10;
    }
    
    // Sales status factor
    if (tmEvent.dates?.status?.code === 'onsale') impactScore += 5;
    else if (tmEvent.dates?.status?.code === 'offsale') impactScore += 15; // Sold out = high demand
    
    // Cap at 100
    impactScore = Math.min(100, Math.round(impactScore));
    
    // Determine impact level
    let impactLevel = 'LOW';
    if (impactScore >= 90) impactLevel = 'CRITICAL';
    else if (impactScore >= 75) impactLevel = 'HIGH';
    else if (impactScore >= 50) impactLevel = 'MEDIUM';
    
    // Determine venue tier based on capacity
    let venueTier = 'SMALL';
    const capacity = venue.capacity || estimateCapacityFromVenueName(venue.name);
    if (capacity > 50000) venueTier = 'MEGA';
    else if (capacity > 10000) venueTier = 'MAJOR';
    else if (capacity > 5000) venueTier = 'LARGE';
    else if (capacity > 1000) venueTier = 'MEDIUM';
    
    // Format price range
    let priceRange = 'Price TBA';
    if (priceRanges.length > 0) {
        const minPrice = Math.min(...priceRanges.map(p => p.min || 0));
        const maxPrice = Math.max(...priceRanges.map(p => p.max || 0));
        if (minPrice > 0 && maxPrice > 0) {
            priceRange = `$${minPrice} - $${maxPrice}`;
        }
    }
    
    // Determine ticket status
    let ticketStatus = 'Available';
    const statusCode = tmEvent.dates?.status?.code;
    if (statusCode === 'offsale') ticketStatus = 'Sold Out';
    else if (statusCode === 'presale') ticketStatus = 'Limited';
    else if (statusCode === 'cancelled') ticketStatus = 'Not On Sale';
    
    // Get venue type from classifications
    let venueType = 'Other';
    const segment = tmEvent.classifications?.[0]?.segment?.name;
    if (segment === 'Music') venueType = 'Music';
    else if (segment === 'Sports') venueType = 'Sports';
    else if (segment === 'Arts & Theatre') venueType = 'Theater';
    else if (segment === 'Miscellaneous') venueType = 'Other';
    
    // Get category/genre
    const category = tmEvent.classifications?.[0]?.genre?.name || 'General';
    
    return {
        id: tmEvent.id,
        name: tmEvent.name,
        date: tmEvent.dates?.start?.localDate,
        time: tmEvent.dates?.start?.localTime,
        venue_name: venue.name,
        venue_capacity: capacity,
        venue_type: venueType,
        impact_score: impactScore,
        impact_level: impactLevel,
        distance_miles: tmEvent.distance,
        estimated_attendance: Math.round(capacity * 0.85), // Estimate 85% fill rate
        ticket_price_range: priceRange,
        ticket_status: ticketStatus,
        venue_tier: venueTier,
        category: category,
        description: `${tmEvent.name} at ${venue.name}`,
        venue_address: venue.address?.line1 || venue.city?.name || 'Nashville, TN',
        ticketmaster_url: tmEvent.url,
        event_image: tmEvent.images?.[0]?.url
    };
}

/**
 * Estimates venue capacity based on venue name matching
 */
function estimateCapacityFromVenueName(venueName) {
    if (!venueName) return 1000;
    
    const name = venueName.toLowerCase();
    
    // Nashville venue capacity database
    const venueCapacities = {
        'bridgestone arena': 20000,
        'nissan stadium': 69143,
        'ryman auditorium': 2362,
        'grand ole opry': 4372,
        'marathon music works': 1800,
        'the fillmore': 2300,
        'ascend amphitheater': 6800,
        'municipal auditorium': 9700,
        'vanderbilt stadium': 40350,
        'memorial gymnasium': 14316,
        'first horizon park': 10000,
        'cannery hall': 1000,
        'war memorial': 2044,
        'brooklyn bowl': 1200,
        'basement east': 500,
        'mercy lounge': 500,
        'listening room': 350,
        'bluebird cafe': 90,
        'tootsies': 200,
        'roberts western world': 150
    };
    
    // Find matching venue
    for (const [venue, capacity] of Object.entries(venueCapacities)) {
        if (name.includes(venue) || venue.includes(name)) {
            return capacity;
        }
    }
    
    // Default estimates based on venue type keywords
    if (name.includes('stadium')) return 40000;
    if (name.includes('arena')) return 15000;
    if (name.includes('amphitheater')) return 8000;
    if (name.includes('auditorium')) return 3000;
    if (name.includes('theater') || name.includes('theatre')) return 1500;
    if (name.includes('hall')) return 2000;
    if (name.includes('club') || name.includes('bar')) return 300;
    if (name.includes('cafe')) return 150;
    
    return 1000; // Default fallback
}

/**
 * Fetches events from the backend Ticketmaster Event System API.
 */
async function discoverEvents(params = {}) {
    // Map frontend params to backend API query params
    const query = new URLSearchParams();
    if (params.startDateTime) query.append('startDate', params.startDateTime);
    if (params.endDateTime) query.append('endDate', params.endDateTime);
    if (params.radius) query.append('radius', params.radius);
    if (params.latlong) {
        const [lat, lon] = params.latlong.split(',');
        query.append('lat', lat);
        query.append('lon', lon);
    }
    if (params.sort) {
        const [sortBy, sortDir] = params.sort.split(',');
        query.append('sortBy', sortBy);
        query.append('sortDir', sortDir);
    }
    if (params.keyword) query.append('keyword', params.keyword);
    if (params.page) query.append('page', params.page);
    
    // Request a large size to get all events (up to 1000)
    query.append('size', '1000');
    
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
    const url = `${API_BASE}/events?${query.toString()}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Handle new pagination response format
        const events = data.events || data;
        const pagination = data.pagination || { currentPage: 0, pageSize: events.length, totalElements: events.length };
        
        // Transform the backend response to match expected format
        return {
            _embedded: {
                events: events.map(event => ({
                    id: event.id,
                    name: event.name,
                    date: event.date,
                    time: event.time,
                    venue: event.venue,
                    venueCapacity: event.venueCapacity,
                    venueType: event.venueType,
                    impactScore: event.impactScore,
                    impactLevel: event.impactLevel,
                    distance: event.distance,
                    price: event.price,
                    status: event.status,
                    venueTier: event.venueTier,
                    category: event.category,
                    address: event.address,
                    description: event.description,
                    ticketUrl: event.ticketUrl,
                    // Include all the new image fields
                    event_image: event.eventImage,
                    images: event.allImages || [],
                    image_metadata: event.imageMetadata
                }))
            },
            page: {
                number: pagination.currentPage || 0,
                totalPages: Math.ceil((pagination.totalElements || events.length) / (pagination.pageSize || events.length)),
                totalElements: pagination.totalElements || events.length,
                size: pagination.pageSize || events.length,
                hasNextPage: pagination.hasNextPage || false,
                hasPreviousPage: pagination.hasPreviousPage || false,
                pageNumbers: pagination.pageNumbers || []
            }
        };
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
}

/**
 * Processes a real Ticketmaster API response
 */
function processTicketmasterResponse(apiResponse) {
    if (!apiResponse._embedded?.events) {
        return [];
    }
    
    return apiResponse._embedded.events.map(mapTicketmasterEventToInternal);
}

/**
 * Simulates fetching venues from the Ticketmaster Discovery API.
 */
async function discoverVenues(params = {}) {
    const { keyword, radius = 10, latlong } = params;
    
    const allVenues = await Venue.list();
    let filteredVenues = allVenues;

    if (keyword) {
        filteredVenues = filteredVenues.filter(v => 
            v.name.toLowerCase().includes(keyword.toLowerCase())
        );
    }
    
    if (radius) {
        filteredVenues = filteredVenues.filter(v => v.distance_from_hotel <= radius);
    }

    // Format data to mimic Ticketmaster API response
    const formattedVenues = filteredVenues.map(venue => ({
        id: venue.id,
        name: venue.name,
        type: 'venue',
        url: `https://www.ticketmaster.com/venue/${venue.id}`,
        locale: 'en-us',
        images: [],
        distance: venue.distance_from_hotel,
        units: 'MILES',
        postalCode: venue.address?.split(',').pop().trim().split(' ')[1] || '37203',
        timezone: 'America/Chicago',
        city: { name: 'Nashville' },
        state: { name: 'Tennessee', stateCode: 'TN' },
        country: { name: 'United States Of America', countryCode: 'US' },
        address: { line1: venue.address },
        location: {
            longitude: venue.coordinates?.split(',')[1]?.trim() || '-86.7781',
            latitude: venue.coordinates?.split(',')[0]?.trim() || '36.1656'
        },
        capacity: venue.capacity,
        markets: [{ name: 'Nashville', id: '35' }],
        dmas: [{ id: 659 }],
        upcomingEvents: { _total: venue.upcoming_events_count || 0, _filtered: 0 }
    }));

    return {
        _embedded: {
            venues: formattedVenues
        },
        _links: {
            self: { href: '/discovery/v2/venues' }
        },
        page: {
            size: filteredVenues.length,
            totalElements: filteredVenues.length,
            totalPages: 1,
            number: 0
        }
    };
}

export { discoverEvents, discoverVenues, processTicketmasterResponse, mapTicketmasterEventToInternal };