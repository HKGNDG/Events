import React, { useState, useEffect } from "react";
import { discoverEvents } from "../components/integrations/Ticketmaster";
import EventCard from "../components/events/EventCard";
import EventFilters from "../components/events/EventFilters";
import { CalendarX, Sparkles, TrendingUp, X, MapPin, Calendar, Clock, Users, Ticket, ExternalLink, Filter, Grid, List, Search, RefreshCw, Music, Star, Zap, Target, Eye, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { getBestEventImage, generateImagePlaceholder } from "@/utils/imageUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Image } from "lucide-react";

// Enhanced image handling logic using utilities
const getEventImage = (apiEvent) => {
  // Use the utility function for better image selection
  const selectedImage = getBestEventImage(apiEvent.images, {
    preferredRatio: '16_9',
    minWidth: 512,
    minHeight: 288,
    maxWidth: 2048,
    maxHeight: 1152,
    allowPortrait: false
  });

  if (selectedImage) {
    return selectedImage;
  }

  // Generate placeholder if no image is available
  return generateImagePlaceholder(apiEvent.name, apiEvent.category || 'Music');
};

// Helper to map API response to our internal format
const mapApiEventToInternal = (apiEvent) => {
  // Use the image data directly from the backend if available
  if (apiEvent.event_image) {
    return {
      id: apiEvent.id,
      name: apiEvent.name,
      date: apiEvent.date,
      time: apiEvent.time,
      venue_name: apiEvent.venue,
      venue_capacity: apiEvent.venueCapacity || 5000,
      venue_type: apiEvent.venueType || 'Other',
      impact_score: apiEvent.impactScore || 50,
      impact_level: apiEvent.impactLevel || 'MEDIUM',
      distance_miles: apiEvent.distance || 0,
      ticket_price_range: apiEvent.price || 'Price TBA',
      ticket_status: apiEvent.status || 'Available',
      venue_tier: apiEvent.venueTier || 'MEDIUM',
      category: apiEvent.category || 'General',
      venue_address: apiEvent.address || '',
      description: apiEvent.description || `${apiEvent.name} at ${apiEvent.venue}`,
      ticketUrl: apiEvent.ticketUrl || null,
      event_image: apiEvent.event_image,
      image_metadata: apiEvent.image_metadata || null
    };
  }
  
  // Fallback to processing images if backend didn't provide them
  const eventImage = getEventImage(apiEvent);
  
  return {
    id: apiEvent.id,
    name: apiEvent.name,
    date: apiEvent.date,
    time: apiEvent.time,
    venue_name: apiEvent.venue,
    venue_capacity: apiEvent.venueCapacity || 5000,
    venue_type: apiEvent.venueType || 'Other',
    impact_score: apiEvent.impactScore || 50,
    impact_level: apiEvent.impactLevel || 'MEDIUM',
    distance_miles: apiEvent.distance || 0,
    ticket_price_range: apiEvent.price || 'Price TBA',
    ticket_status: apiEvent.status || 'Available',
    venue_tier: apiEvent.venueTier || 'MEDIUM',
    category: apiEvent.category || 'General',
    venue_address: apiEvent.address || '',
    description: apiEvent.description || `${apiEvent.name} at ${apiEvent.venue}`,
    ticketUrl: apiEvent.ticketUrl || null,
    event_image: eventImage?.url || null,
    image_metadata: eventImage ? {
      width: eventImage.width,
      height: eventImage.height,
      ratio: eventImage.ratio,
      size: eventImage.size,
      priority: eventImage.priority,
      quality: eventImage.metadata?.quality,
      fileSize: eventImage.metadata?.fileSize,
      aspectRatio: eventImage.metadata?.aspectRatio
    } : null
  };
};

// Event Details Modal Component
const EventDetailsModal = ({ event, isOpen, onClose }) => {
  const { toast } = useToast();
  
  if (!isOpen || !event) return null;

  const impactColors = {
    CRITICAL: "bg-gradient-to-r from-red-500 via-rose-500 to-pink-600 text-white",
    HIGH: "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-600 text-white", 
    MEDIUM: "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white",
    LOW: "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white"
  };

  const handleGetTickets = () => {
    if (event.ticketUrl) {
      window.open(event.ticketUrl, '_blank', 'noopener,noreferrer');
      toast({
        title: "Opening Ticketmaster",
        description: `Redirecting to purchase tickets for ${event.name}`,
      });
    } else {
      const searchUrl = `https://www.ticketmaster.com/search?q=${encodeURIComponent(event.name)}`;
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
      toast({
        title: "Searching for Tickets",
        description: `Opening Ticketmaster search for ${event.name}`,
      });
    }
  };

  const handleAddToWatchlist = () => {
    console.log("Added to watchlist:", event.name);
    toast({
      title: "Added to Watchlist",
      description: `${event.name} has been added to your watchlist`,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Event Image Header */}
        {event.event_image && (
          <div className="relative h-80 overflow-hidden rounded-t-3xl">
            <img 
              src={event.event_image} 
              alt={event.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback when image fails to load */}
            <div className="hidden w-full h-full bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 flex items-center justify-center">
              <div className="text-center">
                <Calendar className="w-20 h-20 text-blue-500 mx-auto mb-6 animate-pulse" />
                <p className="text-2xl text-blue-600 font-bold">{event.name}</p>
              </div>
            </div>
            {/* Overlay with close button and badges */}
            <div className="absolute top-6 right-6">
              <button
                onClick={onClose}
                className="w-10 h-10 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="absolute bottom-6 left-6 flex flex-col gap-3">
              <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-xl ${impactColors[event.impact_level]}`}>
                {event.impact_level} IMPACT
              </span>
              <span className="px-4 py-2 bg-black/70 backdrop-blur-sm text-white rounded-full text-sm font-bold shadow-xl">
                Score: {event.impact_score}
              </span>
              {event.image_metadata?.quality && (
                <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-slate-700 rounded-full text-sm font-bold shadow-xl">
                  Quality: {event.image_metadata.quality}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Header (only if no image) */}
        {!event.event_image && (
          <div className="relative p-8 border-b border-slate-200">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-all duration-300"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
            
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${impactColors[event.impact_level]}`}>
                    {event.impact_level} IMPACT
                  </span>
                  <span className="px-4 py-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white rounded-full text-sm font-bold">
                    Score: {event.impact_score}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3">{event.name}</h2>
                <p className="text-slate-600 text-lg">{event.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className={`${event.event_image ? 'p-8' : 'p-8 pt-0'} space-y-8`}>
          {/* Event Title (only if image is shown) */}
          {event.event_image && (
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-slate-900 mb-3">{event.name}</h2>
              <p className="text-slate-600 text-xl">{event.description}</p>
            </div>
          )}

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-lg">
                    {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
                  </p>
                  {event.time && (
                    <p className="text-sm text-slate-600 flex items-center gap-2 mt-2">
                      <Clock className="w-4 h-4" />
                      {event.time}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100/50">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-lg">{event.venue_name}</p>
                  <p className="text-sm text-slate-600">{event.distance_miles?.toFixed(1)} miles away</p>
                  {event.venue_address && (
                    <p className="text-sm text-slate-500">{event.venue_address}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border border-purple-100/50">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-violet-500 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-lg">
                    Capacity: {event.venue_capacity?.toLocaleString() || 'TBA'}
                  </p>
                  <p className="text-sm text-slate-600">{event.venue_tier} Venue</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl border border-slate-100/50">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-500 via-gray-500 to-zinc-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-lg">{event.ticket_price_range}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                    event.ticket_status === 'Available' 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {event.ticket_status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50">
              <p className="text-3xl font-bold text-slate-800">{event.impact_score}</p>
              <p className="text-sm text-slate-600 font-semibold">Impact Score</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100/50">
              <p className="text-3xl font-bold text-slate-800">{event.distance_miles?.toFixed(1)}</p>
              <p className="text-sm text-slate-600 font-semibold">Miles Away</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100/50">
              <p className="text-3xl font-bold text-slate-800">{event.venue_tier}</p>
              <p className="text-sm text-slate-600 font-semibold">Venue Tier</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-100/50">
              <p className="text-3xl font-bold text-slate-800">{event.category}</p>
              <p className="text-sm text-slate-600 font-semibold">Category</p>
            </div>
          </div>

          {/* Image Metadata (if available) */}
          {event.image_metadata && (
            <div className="p-6 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl border border-slate-100/50">
              <h4 className="font-bold text-slate-800 mb-3">Image Information</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Quality:</span>
                  <span className="font-semibold text-slate-800 ml-2">{event.image_metadata.quality}</span>
                </div>
                <div>
                  <span className="text-slate-600">Size:</span>
                  <span className="font-semibold text-slate-800 ml-2">{event.image_metadata.fileSize}</span>
                </div>
                <div>
                  <span className="text-slate-600">Dimensions:</span>
                  <span className="font-semibold text-slate-800 ml-2">{event.image_metadata.width}×{event.image_metadata.height}</span>
                </div>
                <div>
                  <span className="text-slate-600">Ratio:</span>
                  <span className="font-semibold text-slate-800 ml-2">{event.image_metadata.ratio}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-slate-200">
            <button 
              onClick={handleGetTickets}
              className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-4 px-8 rounded-2xl font-bold hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 text-lg"
            >
              <ExternalLink className="w-5 h-5" />
              Get Tickets
            </button>
            <button 
              onClick={handleAddToWatchlist}
              className="px-8 py-4 border-2 border-blue-200 text-blue-700 rounded-2xl font-bold hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 text-lg"
            >
              Add to Watchlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Events() {
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 1,
    totalElements: 0,
    pageSize: 1000,
    hasNextPage: false,
    hasPreviousPage: false,
    pageNumbers: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filters, setFilters] = useState({
    dateRange: 'month',
    impactLevel: 'all',
    venueType: 'all',
    distance: 25,
    sortBy: 'date'
  });

  useEffect(() => {
    console.log('Filters changed:', filters);
    loadEvents();
  }, [filters.dateRange, filters.distance, filters.sortBy]);

  useEffect(() => {
    applyFilters();
  }, [filters.impactLevel, filters.venueType, allEvents, searchTerm]);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      let startDateTime, endDateTime;

      switch (filters.dateRange) {
        case 'today':
          startDateTime = now.toISOString();
          endDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'week':
          startDateTime = now.toISOString();
          endDateTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'month':
           startDateTime = now.toISOString();
           const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
           endDateTime = nextMonth.toISOString();
           break;
        case 'year':
            startDateTime = now.toISOString();
            const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
            endDateTime = nextYear.toISOString();
            break;
      }
      
      const params = {
        latlong: '36.1656,-86.7781', // Nashville Hotel Coords
        radius: filters.distance,
        startDateTime: startDateTime.split('.')[0] + 'Z',
        endDateTime: endDateTime.split('.')[0] + 'Z',
        sort: filters.sortBy
      };

      const response = await discoverEvents(params);
      const mappedEvents = response._embedded?.events.map(mapApiEventToInternal) || [];
      
      setAllEvents(mappedEvents);
      setPagination({
        currentPage: response.page.number || 0,
        totalPages: response.page.totalPages || 1,
        totalElements: response.page.totalElements || mappedEvents.length,
        pageSize: response.page.size || 20,
        hasNextPage: response.page.hasNextPage || false,
        hasPreviousPage: response.page.hasPreviousPage || false,
        pageNumbers: response.page.pageNumbers || []
      });

    } catch (error) {
      console.error("Error loading events:", error);
      toast({
        title: "Error Loading Events",
        description: "Failed to load events. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filteredEvents = [...allEvents];

    // Filter by search query
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filteredEvents = filteredEvents.filter(event => 
        event.name.toLowerCase().includes(query) ||
        event.venue_name.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query)
      );
    }

    // Filter by impact level
    if (filters.impactLevel !== 'all') {
      filteredEvents = filteredEvents.filter(event => 
        event.impact_level === filters.impactLevel
      );
    }

    // Filter by venue type
    if (filters.venueType !== 'all') {
      filteredEvents = filteredEvents.filter(event => 
        event.venue_type === filters.venueType
      );
    }

    setEvents(filteredEvents);
  };
  
  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleAddToWatchlist = (event) => {
    console.log("Added to watchlist:", event.name);
    toast({
      title: "Added to Watchlist",
      description: `${event.name} has been added to your watchlist`,
    });
  };

  const handleRefresh = () => {
    loadEvents();
    toast({
      title: "Refreshing Events",
      description: "Loading latest event data...",
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      // Update pagination state
      setPagination(prev => ({
        ...prev,
        currentPage: newPage
      }));
      
      // Reload events with new page
      loadEventsWithPage(newPage);
    }
  };

  const loadEventsWithPage = async (page = 0) => {
    setIsLoading(true);
    try {
      const now = new Date();
      let startDateTime, endDateTime;

      switch (filters.dateRange) {
        case 'today':
          startDateTime = now.toISOString();
          endDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'week':
          startDateTime = now.toISOString();
          endDateTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'month':
           startDateTime = now.toISOString();
           const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
           endDateTime = nextMonth.toISOString();
           break;
        case 'year':
            startDateTime = now.toISOString();
            const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
            endDateTime = nextYear.toISOString();
            break;
      }
      
      const params = {
        latlong: '36.1656,-86.7781', // Nashville Hotel Coords
        radius: filters.distance,
        startDateTime: startDateTime.split('.')[0] + 'Z',
        endDateTime: endDateTime.split('.')[0] + 'Z',
        sort: filters.sortBy,
        page: page,
        size: pagination.pageSize
      };

      const response = await discoverEvents(params);
      const mappedEvents = response._embedded?.events.map(mapApiEventToInternal) || [];
      
      setAllEvents(mappedEvents);
      setPagination({
        currentPage: response.page.number || page,
        totalPages: response.page.totalPages || 1,
        totalElements: response.page.totalElements || mappedEvents.length,
        pageSize: response.page.size || pagination.pageSize,
        hasNextPage: response.page.hasNextPage || false,
        hasPreviousPage: response.page.hasPreviousPage || false,
        pageNumbers: response.page.pageNumbers || []
      });

    } catch (error) {
      console.error("Error loading events:", error);
      toast({
        title: "Error Loading Events",
        description: "Failed to load events. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-full mx-auto px-6 lg:px-8 py-8">
        {/* Enhanced Page Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-8 mb-10">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
              <Music className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent leading-tight">
                Events
              </h1>
              <p className="text-2xl text-slate-600 mt-4 font-medium">
                Discover amazing events in Nashville
              </p>
            </div>
          </div>
          
          {/* Quick Stats Bar */}
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-xl border border-blue-100/50">
              <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-bold text-slate-800">Live Events</span>
            </div>
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-xl border border-purple-100/50">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="text-lg font-bold text-slate-800">Real-time Updates</span>
            </div>
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-xl border border-indigo-100/50">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <span className="text-lg font-bold text-slate-800">Nashville Area</span>
            </div>
          </div>
        </div>

        {/* Search and Refresh Bar */}
        <div className="flex items-center gap-6 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search events, venues, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-4 text-lg bg-white/90 backdrop-blur-sm border-slate-200 hover:border-purple-300 focus:border-purple-500 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            />
          </div>
          <Button
            onClick={handleRefresh}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <RefreshCw className="w-5 h-5 mr-3" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-10">
          <EventFilters
            filters={filters}
            onFiltersChange={setFilters}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            eventCount={events.length}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-spin">
                <RefreshCw className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Loading Events</h3>
              <p className="text-slate-600">Fetching the latest events from Nashville...</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-xl rounded-3xl overflow-hidden animate-pulse">
                  <div className="h-64 bg-slate-200"></div>
                  <CardContent className="p-6 space-y-4">
                    <div className="h-6 bg-slate-200 rounded"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="space-y-3">
                      <div className="h-12 bg-slate-200 rounded-xl"></div>
                      <div className="h-12 bg-slate-200 rounded-xl"></div>
                      <div className="h-12 bg-slate-200 rounded-xl"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Events Grid/List */}
        {!isLoading && events.length > 0 && (
          <div className="space-y-8">
            {/* Events Display */}
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                : "space-y-6"
            }>
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onViewDetails={handleViewDetails}
                  onAddToWatchlist={handleAddToWatchlist}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="mt-16 pt-8 border-t border-slate-200/50">
                <div className="flex items-center justify-between">
                  <div className="text-base text-slate-600">
                    Showing <span className="font-bold text-slate-800">{events.length}</span> events
                    {allEvents.length !== events.length && (
                      <span className="ml-3 text-slate-500">
                        (filtered from {allEvents.length.toLocaleString()} total)
                      </span>
                    )}
                    <span className="ml-6">
                      Page <span className="font-bold text-slate-800">{pagination.currentPage + 1}</span> of <span className="font-bold text-slate-800">{pagination.totalPages}</span>
                    </span>
                  </div>
                  
                  {/* Pagination Buttons */}
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPreviousPage}
                      className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                        pagination.hasPreviousPage
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Previous
                    </Button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-2">
                      {pagination.pageNumbers.map((pageNum) => (
                        <Button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-12 h-12 rounded-xl font-bold transition-all duration-300 ${
                            pageNum === pagination.currentPage
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl transform scale-110'
                              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-blue-300 shadow-lg hover:shadow-xl'
                          }`}
                        >
                          {pageNum + 1}
                        </Button>
                      ))}
                    </div>
                    
                    <Button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                        pagination.hasNextPage
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Next
                    </Button>
                  </div>
                  
                  <div className="text-base text-slate-600">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            )}

            {/* Footer Stats (when no pagination) */}
            {pagination.totalPages <= 1 && (
              <div className="mt-16 pt-8 border-t border-slate-200/50">
                <div className="flex items-center justify-between">
                  <div className="text-base text-slate-600">
                    Showing <span className="font-bold text-slate-800">{events.length}</span> events
                    {allEvents.length !== events.length && (
                      <span className="ml-3 text-slate-500">
                        (filtered from {allEvents.length.toLocaleString()} total)
                      </span>
                    )}
                  </div>
                  <div className="text-base text-slate-600">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && events.length === 0 && (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertCircle className="w-16 h-16 text-slate-400" />
            </div>
            <h3 className="text-3xl font-bold text-slate-800 mb-4">No Events Found</h3>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Try adjusting your filters or search terms to find more events in the Nashville area.
            </p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setFilters({
                  dateRange: 'month',
                  impactLevel: 'all',
                  venueType: 'all',
                  distance: 25,
                  sortBy: 'date'
                });
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Filter className="w-5 h-5 mr-3" />
              Reset Filters
            </Button>
          </div>
        )}

        {/* Event Details Modal */}
        {showModal && selectedEvent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="relative">
                {selectedEvent.event_image && (
                  <div className="relative h-80 overflow-hidden rounded-t-3xl">
                    <img
                      src={selectedEvent.event_image}
                      alt={selectedEvent.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <h2 className="text-4xl font-bold text-white mb-2">{selectedEvent.name}</h2>
                      <p className="text-white/90 text-lg">{selectedEvent.venue_name}</p>
                    </div>
                  </div>
                )}
                <Button
                  onClick={() => setShowModal(false)}
                  className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-700 rounded-full w-12 h-12 p-0 shadow-xl"
                >
                  ×
                </Button>
              </div>
              
              <div className="p-8 space-y-8">
                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
                      <Calendar className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-bold text-slate-900">
                          {new Date(selectedEvent.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-slate-600">{selectedEvent.time}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl">
                      <MapPin className="w-6 h-6 text-emerald-600" />
                      <div>
                        <p className="font-bold text-slate-900">{selectedEvent.venue_name}</p>
                        <p className="text-slate-600">{selectedEvent.distance_miles} miles away</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                      <Users className="w-6 h-6 text-purple-600" />
                      <div>
                        <p className="font-bold text-slate-900">Capacity: {selectedEvent.venue_capacity?.toLocaleString()}</p>
                        <p className="text-slate-600">{selectedEvent.venue_tier}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl">
                      <Star className="w-6 h-6 text-amber-600" />
                      <div>
                        <p className="font-bold text-slate-900">Impact Score: {selectedEvent.impact_score}</p>
                        <p className="text-slate-600">{selectedEvent.impact_level} Impact</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl">
                      <Music className="w-6 h-6 text-indigo-600" />
                      <div>
                        <p className="font-bold text-slate-900">{selectedEvent.category}</p>
                        <p className="text-slate-600">{selectedEvent.venue_type}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl">
                      <TrendingUp className="w-6 h-6 text-slate-600" />
                      <div>
                        <p className="font-bold text-slate-900">{selectedEvent.ticket_price_range}</p>
                        <p className="text-slate-600">Status: {selectedEvent.ticket_status}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                {selectedEvent.description && (
                  <div className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">About This Event</h3>
                    <p className="text-slate-700 leading-relaxed">{selectedEvent.description}</p>
                  </div>
                )}
                
                {/* Image Information */}
                {selectedEvent.image_metadata && (
                  <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl">
                    <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-3">
                      <Image className="w-6 h-6 text-emerald-600" />
                      Image Information
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-bold text-slate-700">Quality</p>
                        <p className="text-slate-600">{selectedEvent.image_metadata.quality}</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">Resolution</p>
                        <p className="text-slate-600">{selectedEvent.image_metadata.width}×{selectedEvent.image_metadata.height}</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">Aspect Ratio</p>
                        <p className="text-slate-600">{selectedEvent.image_metadata.aspectRatio}</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">File Size</p>
                        <p className="text-slate-600">{selectedEvent.image_metadata.fileSize}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex items-center gap-4 pt-6">
                  {selectedEvent.ticketUrl && (
                    <Button
                      onClick={() => window.open(selectedEvent.ticketUrl, '_blank')}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <ExternalLink className="w-5 h-5 mr-3" />
                      Get Tickets
                    </Button>
                  )}
                  <Button
                    onClick={() => handleAddToWatchlist(selectedEvent)}
                    variant="outline"
                    className="px-8 py-4 border-2 border-slate-200 hover:border-blue-300 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Eye className="w-5 h-5 mr-3" />
                    Add to Watchlist
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}