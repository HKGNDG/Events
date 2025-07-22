import React, { useState, useEffect } from "react";
import { discoverEvents } from "../components/integrations/Ticketmaster";
import { Venue, HotelConfig } from "@/api/entities";
import {
  Calendar, Building2, TrendingUp, Users, RefreshCw, Settings, BarChart3, Activity, Star,
  MapPin, Clock, AlertTriangle, DollarSign, Music, Target, Zap, CheckCircle, ExternalLink, AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { getBestEventImage, generateImagePlaceholder } from "@/utils/imageUtils";

import KPICard from "../components/dashboard/KPICard";
import QuickActions from "../components/dashboard/QuickActions";
import ActivityFeed from "../components/dashboard/ActivityFeed";

// Enhanced image handling logic using utilities
const getEventImage = (apiEvent) => {
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

  return generateImagePlaceholder(apiEvent.name, apiEvent.category || 'Music');
};

// Helper to map API response to our internal format
const mapApiEventToInternal = (apiEvent) => {
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

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [hotelConfig, setHotelConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Set up parameters for events (similar to Events page)
      const now = new Date();
      const startDateTime = now.toISOString();
      const endDateTime = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // Next 30 days
      
      const eventParams = {
        latlong: '36.1656,-86.7781', // Nashville Hotel Coords
        radius: 10,
        startDateTime: startDateTime.split('.')[0] + 'Z',
        endDateTime: endDateTime.split('.')[0] + 'Z',
        sort: 'date,asc'
      };

      const [eventsResponse, venuesData, configData] = await Promise.all([
        discoverEvents(eventParams),
        Venue.list(36.1656, -86.7781, 10, 'miles', 50),
        HotelConfig.list()
      ]);
      
      // Handle events response correctly (like Events page does)
      const eventsArray = eventsResponse._embedded?.events?.map(mapApiEventToInternal) || [];
      setEvents(eventsArray);
      
      const venuesArray = Array.isArray(venuesData) ? venuesData : [];
      setVenues(venuesArray);
      
      const configArray = Array.isArray(configData) ? configData : [];
      setHotelConfig(configArray[0] || null);
      
      setLastSync(new Date());
      console.log('Dashboard data loaded:', { 
        events: eventsArray.length, 
        venues: venuesArray.length,
        sampleEvents: eventsArray.slice(0, 3).map(e => ({ name: e.name, date: e.date }))
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setEvents([]);
      setVenues([]);
      setHotelConfig(null);
    }
    setIsLoading(false);
  };

  // Nashville Hotel specific calculations
  const getTodaysEvents = () => {
    if (!Array.isArray(events)) return [];
    const today = new Date().toISOString().split('T')[0];
    return events.filter(event => event.date === today);
  };

  const getHighImpactEvents = () => {
    if (!Array.isArray(events)) return [];
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return events.filter(event => {
      const eventDate = new Date(event.date);
      const now = new Date();
      return eventDate >= now && eventDate <= weekFromNow && 
             (event.impact_level === 'HIGH' || event.impact_level === 'CRITICAL');
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

  const getEventCategories = () => {
    if (!Array.isArray(events)) return {};
    const categories = {};
    events.forEach(event => {
      const category = event.category || 'Other';
      categories[category] = (categories[category] || 0) + 1;
    });
    return categories;
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

  const getNearbyEvents = () => {
    if (!Array.isArray(events)) return [];
    return events.filter(event => event.distance_miles <= 5).slice(0, 5);
  };

  const getTopVenues = () => {
    if (!Array.isArray(venues)) return [];
    return venues
      .filter(venue => {
        const upcomingCount = venue.upcoming_events_count;
        const count = typeof upcomingCount === 'object' ? upcomingCount._total : (typeof upcomingCount === 'number' ? upcomingCount : 0);
        return count > 0;
      })
      .sort((a, b) => {
        const aCount = typeof a.upcoming_events_count === 'object' ? a.upcoming_events_count._total : (typeof a.upcoming_events_count === 'number' ? a.upcoming_events_count : 0);
        const bCount = typeof b.upcoming_events_count === 'object' ? b.upcoming_events_count._total : (typeof b.upcoming_events_count === 'number' ? b.upcoming_events_count : 0);
        return bCount - aCount;
      })
      .slice(0, 5);
  };

  // Calculate metrics
  const todaysEvents = getTodaysEvents();
  const highImpactEvents = getHighImpactEvents();
  const activeVenues = getActiveVenues();
  const totalUpcomingEvents = getTotalUpcomingEvents();
  const eventCategories = getEventCategories();
  const venueCapacityStats = getVenueCapacityStats();
  const nearbyEvents = getNearbyEvents();
  const topVenues = getTopVenues();
  
  const totalImpactScore = Array.isArray(events) ? events.reduce((sum, event) => {
    const impactScore = event.impact_score || 0;
    return sum + impactScore;
  }, 0) : 0;
  
  const estimatedRevenue = Math.round((totalImpactScore * 150) + (events.length * 500));

  const handleRefresh = () => {
    loadDashboardData();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-xl border border-blue-100/50">
                <div className={`w-3 h-3 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                <span className="text-lg font-bold text-slate-800">{isLoading ? 'Loading...' : 'System Online'}</span>
              </div>
              <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-xl border border-purple-100/50">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="text-lg font-bold text-slate-800">Last sync: {formatTimeAgo(lastSync)}</span>
              </div>
              <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-xl border border-emerald-100/50">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span className="text-lg font-bold text-slate-800">{events.length} events</span>
              </div>
              <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-xl border border-amber-100/50">
                <Building2 className="w-5 h-5 text-amber-600" />
                <span className="text-lg font-bold text-slate-800">{venues.length} venues</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Link to={createPageUrl("Settings")}>
                <Button variant="outline" className="px-6 py-3 rounded-xl font-bold border-2">
                  <Settings className="w-5 h-5 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* KPI Cards Grid */}
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
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{events.length.toLocaleString()}</h3>
              <p className="text-slate-600">Events in Nashville area</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden group hover:scale-105 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold">
                  +{Math.floor(Math.random() * 15) + 3}%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{highImpactEvents.length}</h3>
              <p className="text-slate-600">Critical & high impact events</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden group hover:scale-105 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold">
                  +{Math.floor(Math.random() * 10) + 2}%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{activeVenues}</h3>
              <p className="text-slate-600">Venues with upcoming events</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden group hover:scale-105 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold">
                  +{Math.floor(Math.random() * 25) + 10}%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">${(estimatedRevenue / 1000).toFixed(1)}K</h3>
              <p className="text-slate-600">Estimated hotel revenue impact</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Event Distribution */}
          <Card className="lg:col-span-2 bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Event Categories</h3>
                    <p className="text-slate-600">Events by category in Nashville</p>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 font-bold shadow-lg">
                  Live Data
                </Badge>
              </div>
              
              <div className="space-y-6">
                {Object.entries(eventCategories).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border border-slate-100/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <Music className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{category}</h4>
                        <p className="text-slate-600 text-sm">{count} events</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${(count / events.length) * 100}%` }}
                        ></div>
                      </div>
                      <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold">
                        {Math.round((count / events.length) * 100)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Venue Activity */}
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Venue Activity</h3>
                  <p className="text-slate-600">Real-time metrics</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100/50">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-slate-900">Upcoming Events</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold">
                    {totalUpcomingEvents}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-slate-900">Active Venues</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold">
                    {activeVenues}/{venues.length}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100/50">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span className="font-bold text-slate-900">Avg Capacity</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold">
                    {venueCapacityStats.average.toLocaleString()}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100/50">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                    <span className="font-bold text-slate-900">Max Capacity</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold">
                    {venueCapacityStats.max.toLocaleString()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Nearby Events & Top Venues */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Nearby Events */}
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Nearby Events</h3>
                    <p className="text-slate-600">Events within 5 miles</p>
                  </div>
                </div>
                <Link to={createPageUrl("Events")}>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg">
                    View All
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4">
                {nearbyEvents.map((event, index) => (
                  <div key={event.id || index} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-purple-50 rounded-2xl border border-slate-100/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{event.name}</h4>
                        <p className="text-slate-600 text-xs">{event.venue_name} • {event.distance_miles?.toFixed(1)} mi</p>
                      </div>
                    </div>
                    <Badge className={`font-bold ${
                      event.impact_level === 'CRITICAL' ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white' :
                      event.impact_level === 'HIGH' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white' :
                      'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                    }`}>
                      {event.impact_level}
                    </Badge>
                  </div>
                ))}
                {nearbyEvents.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p>No nearby events found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Venues */}
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Top Venues</h3>
                    <p className="text-slate-600">Most active venues</p>
                  </div>
                </div>
                <Link to={createPageUrl("Venues")}>
                  <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg">
                    View All
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4">
                {topVenues.map((venue, index) => {
                  const upcomingCount = venue.upcoming_events_count;
                  const eventCount = typeof upcomingCount === 'object' ? upcomingCount._total : (typeof upcomingCount === 'number' ? upcomingCount : 0);
                  
                  return (
                    <div key={venue.id || index} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-amber-50 rounded-2xl border border-slate-100/50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{venue.name}</h4>
                          <p className="text-slate-600 text-xs">{venue.venue_type || 'Venue'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs">
                          {eventCount} events
                        </Badge>
                        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                {topVenues.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p>No active venues found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ActivityFeed />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
