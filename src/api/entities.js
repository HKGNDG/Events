// Direct API calls to backend (replacing Base44 SDK)

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Event API
export const Event = {
  list: async (sortBy = 'date', limit = 100) => {
    const response = await fetch(`${API_BASE}/events?sortBy=${sortBy}&size=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch events');
    const data = await response.json();
    return data;
  },
  create: async (eventData) => {
    const response = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    if (!response.ok) throw new Error('Failed to create event');
    return response.json();
  },
  update: async (id, eventData) => {
    const response = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    if (!response.ok) throw new Error('Failed to update event');
    return response.json();
  },
  delete: async (id) => {
    const response = await fetch(`${API_BASE}/events/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete event');
    return response.json();
  }
};

// Venue API
export const Venue = {
  list: async (sortBy = 'name', limit = 50) => {
    const response = await fetch(`${API_BASE}/venues?sortBy=${sortBy}&size=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch venues');
    return response.json();
  },
  create: async (venueData) => {
    const response = await fetch(`${API_BASE}/venues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(venueData)
    });
    if (!response.ok) throw new Error('Failed to create venue');
    return response.json();
  },
  update: async (id, venueData) => {
    const response = await fetch(`${API_BASE}/venues/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(venueData)
    });
    if (!response.ok) throw new Error('Failed to update venue');
    return response.json();
  },
  delete: async (id) => {
    const response = await fetch(`${API_BASE}/venues/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete venue');
    return response.json();
  }
};

// HotelConfig API
export const HotelConfig = {
  list: async () => {
    const response = await fetch(`${API_BASE}/config`);
    if (!response.ok) throw new Error('Failed to fetch hotel config');
    const data = await response.json();
    return data;
  },
  create: async (configData) => {
    const response = await fetch(`${API_BASE}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configData)
    });
    if (!response.ok) throw new Error('Failed to create hotel config');
    return response.json();
  },
  update: async (id, configData) => {
    const response = await fetch(`${API_BASE}/config/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configData)
    });
    if (!response.ok) throw new Error('Failed to update hotel config');
    return response.json();
  },
  delete: async (id) => {
    const response = await fetch(`${API_BASE}/config/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete hotel config');
    return response.json();
  }
};

// If you want to implement direct authentication, define and export your own User logic here.
// export const User = { login: async (username, password) => { /* ... */ } };