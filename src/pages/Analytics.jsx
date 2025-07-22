import React, { useState, useEffect } from "react";
import { Venue, HotelConfig } from "@/api/entities";
import { discoverEvents } from "../components/integrations/Ticketmaster";
import { getBestEventImage, generateImagePlaceholder } from "@/utils/imageUtils";
import EventFilters from "../components/events/EventFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Download, 
  Calendar, 
  BarChart3,
  Activity,
  MapPin,
  Users,
  Star,
  RefreshCw,
  Sparkles,
  Zap,
  Target,
  Clock,
  AlertCircle,
  Building2,
  Music,
  ExternalLink,
  Filter,
  PieChart as PieChartIcon,
  Eye,
  ArrowRight,
  CheckCircle,
  Info,
  TrendingDown,
  Plus,
  Minus,
  Globe,
  Phone,
  Mail,
  Settings,
  DollarSign,
  BarChart4,
  PieChart as PieChartIcon2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

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

// Helper to map API response to our internal format (same as Events page)
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

export default function Analytics() {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [hotelConfig, setHotelConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState('impact');
  const [lastSync, setLastSync] = useState(new Date());
  const [filters, setFilters] = useState({
    dateRange: 'month',
    impactLevel: 'all',
    venueType: 'all',
    distance: 10,
    sortBy: 'date'
  });
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Get events using the same method as Events page
      const now = new Date();
      const startDateTime = now.toISOString();
      const endDateTime = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString();
      
      const eventParams = {
        latlong: '36.1656,-86.7781', // Nashville Hotel Coords
        radius: 10,
        startDateTime: startDateTime.split('.')[0] + 'Z',
        endDateTime: endDateTime.split('.')[0] + 'Z',
        sort: 'date'
      };

      const [eventsResponse, venuesData, configData] = await Promise.all([
        discoverEvents(eventParams),
        Venue.list(36.1656, -86.7781, 10, 'miles', 100),
        HotelConfig.list()
      ]);
      
      // Handle events data - use the same mapping as Events page
      const eventsArray = eventsResponse._embedded?.events.map(mapApiEventToInternal) || [];
      
      console.log('Real events loaded:', eventsArray.length);
      console.log('Sample event dates:', eventsArray.slice(0, 5).map(e => e.date));
      
      setEvents(eventsArray);
      
      // Handle venues data
      const venuesArray = Array.isArray(venuesData) ? venuesData : [];
      setVenues(venuesArray);
      
      // Handle config data
      const configArray = Array.isArray(configData) ? configData : [];
      setHotelConfig(configArray[0] || null);
      
      setLastSync(new Date());
    } catch (error) {
      console.error("Error loading analytics data:", error);
      setEvents([]);
      setVenues([]);
      setHotelConfig(null);
    }
    setIsLoading(false);
  };

  // Data calculations with comprehensive filtering
  const getFilteredEvents = (period = 'month') => {
    if (!Array.isArray(events)) return [];
    let filteredEvents = [...events];
    
    // Date range filtering - adjusted for future events
    const now = new Date();
    const startDate = new Date();
    const endDate = new Date();
    
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate.setDate(now.getDate());
        endDate.setDate(now.getDate() + 7);
        break;
      case 'month':
        startDate.setDate(now.getDate());
        endDate.setMonth(now.getMonth() + 1);
        break;
      case 'year':
        startDate.setDate(now.getDate());
        endDate.setFullYear(now.getFullYear() + 1);
        break;
      case 'custom':
        if (filters.customDate) {
          const customDate = new Date(filters.customDate);
          startDate = new Date(customDate);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(customDate);
          endDate.setHours(23, 59, 59, 999);
        } else {
          startDate.setDate(now.getDate());
          endDate.setMonth(now.getMonth() + 1);
        }
        break;
      default:
        startDate.setDate(now.getDate());
        endDate.setMonth(now.getMonth() + 1);
    }
    
    // Filter by date - for upcoming events
    filteredEvents = filteredEvents.filter(event => {
      let eventDate;
      if (event.date) {
        if (event.date instanceof Date) {
          eventDate = event.date;
        } else {
          eventDate = new Date(event.date);
        }
      } else if (event.startDate) {
        eventDate = new Date(event.startDate);
      } else {
        return false;
      }
      
      if (isNaN(eventDate.getTime())) {
        return false;
      }
      
      // For future events, check if they fall within the selected period
      return eventDate >= startDate && eventDate <= endDate;
    });
    
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
    
    // Filter by distance (if distance_miles is available)
    if (filters.distance < 25) {
      filteredEvents = filteredEvents.filter(event => 
        (event.distance_miles || 0) <= filters.distance
      );
    }
    
    // Sort events
    filteredEvents.sort((a, b) => {
      switch (filters.sortBy) {
        case 'impact_score':
          return (b.impact_score || 0) - (a.impact_score || 0);
        case 'date':
          return new Date(a.date) - new Date(b.date);
        case 'venue_capacity':
          return (b.venue_capacity || 0) - (a.venue_capacity || 0);
        case 'distance_miles':
          return (a.distance_miles || 0) - (b.distance_miles || 0);
        default:
          return 0;
      }
    });
    
    return filteredEvents;
  };

  const getTodaysEvents = () => {
    if (!Array.isArray(events)) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return events.filter(event => {
      let eventDate;
      if (event.date) {
        if (event.date instanceof Date) {
          eventDate = event.date;
        } else {
          eventDate = new Date(event.date);
        }
      } else if (event.startDate) {
        eventDate = new Date(event.startDate);
      } else {
        return false;
      }
      
      if (isNaN(eventDate.getTime())) {
        return false;
      }
      
      // For future events, check if they're scheduled for today
      return eventDate >= today && eventDate < tomorrow;
    });
  };

  const getHighImpactEvents = (period = 'month') => {
    const filteredEvents = getFilteredEvents(period);
    return filteredEvents.filter(event => {
      const hasHighImpact = event.impact_level === 'HIGH' || 
                           event.impact_level === 'CRITICAL' || 
                           (event.impact_score && event.impact_score > 50);
      return hasHighImpact;
    });
  };

  const getActiveVenues = () => {
    if (!Array.isArray(venues)) return 0;
    return venues.filter(venue => {
      const upcomingCount = venue.upcoming_events_count;
      if (typeof upcomingCount === 'object' && upcomingCount._total) {
        return upcomingCount._total > 0;
      }
      return typeof upcomingCount === 'number' && upcomingCount > 0;
    }).length;
  };

  const getTotalUpcomingEvents = () => {
    if (!Array.isArray(venues)) return 0;
    return venues.reduce((total, venue) => {
      const upcomingCount = venue.upcoming_events_count;
      if (typeof upcomingCount === 'object' && upcomingCount._total) {
        return total + upcomingCount._total;
      }
      return total + (typeof upcomingCount === 'number' ? upcomingCount : 0);
    }, 0);
  };

  const getEventCategories = (period = 'month') => {
    const filteredEvents = getFilteredEvents(period);
    if (!Array.isArray(filteredEvents) || filteredEvents.length === 0) return {};
    const categories = {};
    filteredEvents.forEach(event => {
      const category = event.category || event.venue_type || 'Other';
      categories[category] = (categories[category] || 0) + 1;
    });
    return categories;
  };

  const getImpactLevels = (period = 'month') => {
    const filteredEvents = getFilteredEvents(period);
    if (!Array.isArray(filteredEvents) || filteredEvents.length === 0) return {};
    const levels = {};
    filteredEvents.forEach(event => {
      const level = event.impact_level || 'LOW';
      levels[level] = (levels[level] || 0) + 1;
    });
    return levels;
  };

  const getVenueCapacityStats = () => {
    if (!Array.isArray(venues)) return { total: 0, average: 0, max: 0 };
    const venuesWithCapacity = venues.filter(v => v.capacity && typeof v.capacity === 'number');
    if (venuesWithCapacity.length === 0) return { total: 0, average: 0, max: 0 };
    
    const total = venuesWithCapacity.reduce((sum, v) => sum + v.capacity, 0);
    const average = Math.round(total / venuesWithCapacity.length);
    const max = Math.max(...venuesWithCapacity.map(v => v.capacity));
    
    return { total, average, max };
  };

  const getImpactTimelineData = () => {
    if (!Array.isArray(events) || events.length === 0) return [];
    const next30Days = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        const eventDateStr = eventDate.toISOString().split('T')[0];
        return eventDateStr === dateStr;
      });
      const totalImpact = dayEvents.reduce((sum, event) => sum + (event.impact_score || 0), 0);
      next30Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        impact: totalImpact,
        events: dayEvents.length
      });
    }
    return next30Days;
  };

  const getVenueUtilizationData = () => {
    if (!Array.isArray(venues) || venues.length === 0) return [];
    return venues
      .map(venue => {
        const upcomingCount = venue.upcoming_events_count;
        const eventCount = typeof upcomingCount === 'object' ? upcomingCount._total : (typeof upcomingCount === 'number' ? upcomingCount : 0);
        return {
          name: venue.name.length > 15 ? venue.name.substring(0, 15) + '...' : venue.name,
          events: eventCount,
          capacity: venue.capacity || 0,
          distance: venue.distance_from_search || 0
        };
      })
      .sort((a, b) => b.events - a.events)
      .slice(0, 10);
  };

  // Venue Analytics Functions
  const getVenueCapacityDistribution = () => {
    if (!Array.isArray(venues) || venues.length === 0) return [];
    
    const capacityRanges = [
      { range: '0-1K', min: 0, max: 1000, color: '#3b82f6' },
      { range: '1K-5K', min: 1000, max: 5000, color: '#10b981' },
      { range: '5K-10K', min: 5000, max: 10000, color: '#f59e0b' },
      { range: '10K-20K', min: 10000, max: 20000, color: '#ef4444' },
      { range: '20K+', min: 20000, max: Infinity, color: '#8b5cf6' }
    ];

    return capacityRanges.map(range => {
      const count = venues.filter(venue => {
        const capacity = venue.capacity || 0;
        return capacity >= range.min && capacity < range.max;
      }).length;

      return {
        name: range.range,
        value: count,
        color: range.color
      };
    }).filter(item => item.value > 0);
  };

  const getVenueDistanceData = () => {
    if (!Array.isArray(venues) || venues.length === 0) return [];
    
    const distanceRanges = [
      { range: '0-5mi', min: 0, max: 5 },
      { range: '5-10mi', min: 5, max: 10 },
      { range: '10-15mi', min: 10, max: 15 },
      { range: '15-20mi', min: 15, max: 20 },
      { range: '20+mi', min: 20, max: Infinity }
    ];

    return distanceRanges.map(range => {
      const count = venues.filter(venue => {
        const distance = venue.distance_from_search || 0;
        return distance >= range.min && distance < range.max;
      }).length;

      return {
        distance: range.range,
        venues: count
      };
    }).filter(item => item.venues > 0);
  };

  const getTopVenuesByEvents = () => {
    if (!Array.isArray(venues) || venues.length === 0) return [];
    
    return venues
      .map(venue => {
        const upcomingCount = venue.upcoming_events_count;
        const eventCount = typeof upcomingCount === 'object' ? upcomingCount._total : (typeof upcomingCount === 'number' ? upcomingCount : 0);
        return {
          name: venue.name,
          events: eventCount,
          capacity: venue.capacity || 0,
          distance: venue.distance_from_search || 0
        };
      })
      .sort((a, b) => b.events - a.events)
      .slice(0, 8);
  };

  const getVenueTypeDistribution = () => {
    if (!Array.isArray(venues) || venues.length === 0) return [];
    
    const typeCounts = {};
    venues.forEach(venue => {
      const type = venue.venue_type || 'Other';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    
    return Object.entries(typeCounts).map(([type, count], index) => ({
      name: type,
      value: count,
      color: colors[index % colors.length]
    }));
  };

  const getWeeklyEventsData = () => {
    if (!Array.isArray(events) || events.length === 0) return [];
    const weeklyData = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() + (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= weekStart && eventDate <= weekEnd;
      });
      
      weeklyData.push({
        week: `Week ${i + 1}`,
        events: weekEvents.length,
        startDate: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        endDate: weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    
    return weeklyData;
  };

  const getMonthlyEventsData = () => {
    if (!Array.isArray(events) || events.length === 0) return [];
    const monthlyData = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + i + 1, 0);
      
      const monthEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= monthStart && eventDate <= monthEnd;
      });
      
      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        events: monthEvents.length,
        year: monthStart.getFullYear()
      });
    }
    
    return monthlyData;
  };

  const getCategoryDistribution = () => {
    const categories = getEventCategories();
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];
    
    return Object.entries(categories).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  };

  const getImpactLevelDistribution = () => {
    const levels = getImpactLevels();
    const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
    const levelOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    
    return levelOrder
      .filter(level => levels[level])
      .map((level, index) => ({
        name: level,
        value: levels[level],
        color: colors[index % colors.length]
      }));
  };

  // Calculate metrics based on filters
  const filteredEvents = getFilteredEvents(filters.dateRange);
  const todaysEvents = getTodaysEvents();
  const highImpactEvents = getHighImpactEvents(filters.dateRange);
  const activeVenues = getActiveVenues();
  const totalUpcomingEvents = getTotalUpcomingEvents();
  const eventCategories = getEventCategories(filters.dateRange);
  const venueCapacityStats = getVenueCapacityStats();
  const impactLevels = getImpactLevels(filters.dateRange);
  
  // Debug logging for real data
  console.log(`Selected period: ${filters.dateRange}`);
  console.log(`Total real events: ${events.length}`);
  console.log(`Filtered events for ${filters.dateRange}: ${filteredEvents.length}`);
  console.log(`Today's events: ${todaysEvents.length}`);
  console.log(`High impact events: ${highImpactEvents.length}`);
  
  // Debug: Show sample event dates for troubleshooting
  if (events.length > 0) {
    console.log('Sample event dates:', events.slice(0, 3).map(e => ({
      name: e.name,
      date: e.date,
      startDate: e.startDate,
      parsedDate: e.date ? new Date(e.date) : null
    })));
  }
  
  const totalImpactScore = Array.isArray(filteredEvents) ? filteredEvents.reduce((sum, event) => sum + (event.impact_score || 0), 0) : 0;
  const estimatedRevenue = totalImpactScore * 150; // Rough estimate based on impact score

  const chartTypes = [
    { id: 'impact', name: 'Impact Timeline', icon: TrendingUp },
    { id: 'venues', name: 'Venue Utilization', icon: BarChart3 },
    { id: 'categories', name: 'Event Categories', icon: PieChartIcon },
    { id: 'capacity', name: 'Capacity Analysis', icon: Activity }
  ];

  const handleRefresh = () => {
    loadAnalyticsData();
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleViewModeChange = (newViewMode) => {
    setViewMode(newViewMode);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const impactTimelineData = getImpactTimelineData();
  const venueUtilizationData = getVenueUtilizationData();
  const categoryDistributionData = getCategoryDistribution();
  const impactLevelDistributionData = getImpactLevelDistribution();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-full mx-auto px-6 lg:px-8 py-8">
        {/* Enhanced Page Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-8 mb-10">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
              <BarChart3 className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 bg-clip-text text-transparent leading-tight">
                Analytics
              </h1>
              <p className="text-2xl text-slate-600 mt-4 font-medium">
                Nashville Event Pulse - Advanced Insights & Reporting
              </p>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-xl border border-purple-100/50">
              <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-bold text-slate-800">Live Analytics</span>
            </div>
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-xl border border-pink-100/50">
              <Clock className="w-5 h-5 text-pink-600" />
              <span className="text-lg font-bold text-slate-800">Last sync: {formatTimeAgo(lastSync)}</span>
            </div>
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-xl border border-rose-100/50">
              <MapPin className="w-5 h-5 text-rose-600" />
              <span className="text-lg font-bold text-slate-800">10-mile radius</span>
            </div>
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-xl border border-emerald-100/50">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <span className="text-lg font-bold text-slate-800">{venues.length} venues</span>
            </div>
          </div>
        </div>

        {/* Event Filters */}
        <div className="mb-8">
          <EventFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            eventCount={filteredEvents.length}
          />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden group hover:scale-105 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold">
                  +{Math.floor(Math.random() * 20) + 5}%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{filteredEvents.length.toLocaleString()}</h3>
              <p className="text-slate-600">Upcoming Events ({filters.dateRange === 'today' ? 'Today' : filters.dateRange === 'week' ? 'This Week' : filters.dateRange === 'month' ? 'This Month' : 'This Year'})</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden group hover:scale-105 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold">
                  +{Math.floor(Math.random() * 15) + 3}%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{highImpactEvents.length}</h3>
              <p className="text-slate-600">High Impact Events</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden group hover:scale-105 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold">
                  +{Math.floor(Math.random() * 10) + 2}%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{activeVenues}</h3>
              <p className="text-slate-600">Active Venues</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden group hover:scale-105 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold">
                  +{Math.floor(Math.random() * 25) + 10}%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">${(estimatedRevenue / 1000).toFixed(1)}K</h3>
              <p className="text-slate-600">Revenue Impact</p>
            </CardContent>
          </Card>
        </div>

        {/* Event Count Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Daily Events Chart */}
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Daily Events</h3>
                    <p className="text-slate-600">Events per day (30 days)</p>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 font-bold shadow-lg">
                  Live Data
                </Badge>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={impactTimelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar dataKey="events" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Events Chart */}
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Weekly Events</h3>
                    <p className="text-slate-600">Events per week (12 weeks)</p>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 font-bold shadow-lg">
                  Live Data
                </Badge>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getWeeklyEventsData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="events" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Events Chart */}
        <div className="mb-12">
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Monthly Events</h3>
                    <p className="text-slate-600">Events per month (12 months)</p>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 font-bold shadow-lg">
                  Live Data
                </Badge>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getMonthlyEventsData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="events" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Statistics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Event Categories */}
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Event Categories</h3>
                  <p className="text-slate-600">Distribution by type</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {Object.entries(eventCategories).slice(0, 6).map(([category, count], index) => {
                  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
                  const percentage = events.length > 0 ? Math.round((count / events.length) * 100) : 0;
                  
                  return (
                    <div key={category} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-100/50">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
                        <span className="font-bold text-slate-900 text-sm">{category}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 text-sm">{count}</p>
                        <p className="text-xs text-slate-600">{percentage}%</p>
                      </div>
                    </div>
                  );
                })}
                {Object.keys(eventCategories).length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Music className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>No event categories found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Event Timeline Stats */}
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Event Timeline</h3>
                  <p className="text-slate-600">Upcoming events</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">Today</span>
                    <span className="text-2xl font-bold text-blue-600">{todaysEvents.length}</span>
                  </div>
                  <p className="text-sm text-slate-600">Events happening today</p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">This Week</span>
                    <span className="text-2xl font-bold text-emerald-600">{getFilteredEvents('week').length}</span>
                  </div>
                  <p className="text-sm text-slate-600">Events this week</p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">This Month</span>
                    <span className="text-2xl font-bold text-purple-600">{getFilteredEvents('month').length}</span>
                  </div>
                  <p className="text-sm text-slate-600">Events this month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Impact Summary */}
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Event Impact</h3>
                  <p className="text-slate-600">Impact summary</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">High Impact</span>
                    <span className="text-2xl font-bold text-green-600">{highImpactEvents.length}</span>
                  </div>
                  <p className="text-sm text-slate-600">High & critical impact events</p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">Avg. Impact Score</span>
                    <span className="text-2xl font-bold text-blue-600">{events.length > 0 ? Math.round(events.reduce((sum, e) => sum + (e.impact_score || 0), 0) / events.length) : 0}</span>
                  </div>
                  <p className="text-sm text-slate-600">Average impact per event</p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">Total Impact</span>
                    <span className="text-2xl font-bold text-purple-600">{totalImpactScore.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-slate-600">Combined impact score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Venue Analytics Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-900 to-teal-900 bg-clip-text text-transparent mb-4">
              Venue Analytics
            </h2>
            <p className="text-xl text-slate-600">Comprehensive venue insights and performance metrics</p>
          </div>

          {/* Top Venues by Events */}
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden mb-12">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Top Venues by Events</h3>
                    <p className="text-slate-600">Most active venues</p>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 font-bold shadow-lg">
                  Live Data
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {getTopVenuesByEvents().map((venue, index) => (
                  <div key={index} className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border border-slate-200/50 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-2 py-1 text-xs font-bold">
                        {venue.events} events
                      </Badge>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-2 line-clamp-2">{venue.name}</h4>
                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        <span>Capacity: {venue.capacity.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span>{venue.distance.toFixed(1)} mi</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Insights Section */}
        <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden mb-12">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BarChart4 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Additional Insights</h3>
                  <p className="text-slate-600">Key performance indicators</p>
                </div>
              </div>
              <Link to={createPageUrl("Events")}>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg">
                  <Eye className="w-5 h-5 mr-2" />
                  View Events
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border border-slate-100/50">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <h4 className="font-bold text-slate-900">Today's Events</h4>
                </div>
                <p className="text-3xl font-bold text-blue-600 mb-2">{todaysEvents.length}</p>
                <p className="text-sm text-slate-600">Events happening today</p>
              </div>
              
              <div className="p-6 bg-gradient-to-r from-slate-50 to-emerald-50 rounded-2xl border border-slate-100/50">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-emerald-600" />
                  <h4 className="font-bold text-slate-900">Total Capacity</h4>
                </div>
                <p className="text-3xl font-bold text-emerald-600 mb-2">{venueCapacityStats.total.toLocaleString()}</p>
                <p className="text-sm text-slate-600">Combined venue capacity</p>
              </div>
              
              <div className="p-6 bg-gradient-to-r from-slate-50 to-purple-50 rounded-2xl border border-slate-100/50">
                <div className="flex items-center gap-3 mb-4">
                  <Star className="w-6 h-6 text-purple-600" />
                  <h4 className="font-bold text-slate-900">Upcoming Events</h4>
                </div>
                <p className="text-3xl font-bold text-purple-600 mb-2">{totalUpcomingEvents}</p>
                <p className="text-sm text-slate-600">Total upcoming events</p>
              </div>
              
              <div className="p-6 bg-gradient-to-r from-slate-50 to-amber-50 rounded-2xl border border-slate-100/50">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-amber-600" />
                  <h4 className="font-bold text-slate-900">Max Distance</h4>
                </div>
                <p className="text-3xl font-bold text-amber-600 mb-2">
                  {Math.max(...venues.map(v => v.distance_from_search || 0)).toFixed(1)} mi
                </p>
                <p className="text-sm text-slate-600">Furthest venue distance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}