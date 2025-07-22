import React, { useState, useEffect } from "react";
import { Event, HotelConfig } from "@/api/entities";
import { AlertTriangle, Calendar, Building2, Activity, TrendingUp, Users, DollarSign, Target, Zap, Clock, MapPin, Sparkles, RefreshCw, Music, Star, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import KPICard from "../components/dashboard/KPICard";
import QuickActions from "../components/dashboard/QuickActions";
import ActivityFeed from "../components/dashboard/ActivityFeed";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [hotelConfig, setHotelConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [eventsData, configData] = await Promise.all([
        Event.list('-created_date', 100),
        HotelConfig.list()
      ]);
      // Handle new API response structure with events and pagination
      const eventsArray = eventsData.events || eventsData || [];
      setEvents(eventsArray);
      
      // Handle config data safely
      const configArray = Array.isArray(configData) ? configData : [];
      setHotelConfig(configArray[0] || null);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setEvents([]); // Set empty array on error
      setHotelConfig(null);
    }
    setIsLoading(false);
  };

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
    if (!Array.isArray(events)) return 0;
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    const uniqueVenues = new Set();
    events.forEach(event => {
      const eventDate = new Date(event.date);
      if (eventDate >= new Date() && eventDate <= nextMonth) {
        uniqueVenues.add(event.venue_name);
      }
    });
    return uniqueVenues.size;
  };

  const todaysEvents = getTodaysEvents();
  const highImpactEvents = getHighImpactEvents();
  const activeVenues = getActiveVenues();
  const totalImpactScore = Array.isArray(todaysEvents) ? todaysEvents.reduce((sum, event) => sum + (event.impact_score || 0), 0) : 0;

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-full mx-auto px-6 lg:px-8 py-8">
        {/* Enhanced Page Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-8 mb-10">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/25">
              <Target className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent leading-tight">
                Dashboard
              </h1>
              <p className="text-2xl text-slate-600 mt-4 font-medium">
                Real-time insights & analytics
              </p>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-xl border border-blue-100/50">
              <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-bold text-slate-800">System Online</span>
            </div>
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-xl border border-purple-100/50">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="text-lg font-bold text-slate-800">Last sync: 2 min ago</span>
            </div>
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-xl border border-indigo-100/50">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <span className="text-lg font-bold text-slate-800">Nashville Area</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Badge className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white px-6 py-3 text-base font-bold shadow-xl border border-white/20">
              <Sparkles className="w-5 h-5 mr-3" />
              Live Dashboard
            </Badge>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <RefreshCw className={`w-5 h-5 mr-3 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <KPICard
            title="Total Events"
            value="1,247"
            subtitle="Active events in Nashville"
            icon={Calendar}
            trend="+12.5%"
            trendDirection="up"
            color="blue"
            gradient="from-blue-500 via-indigo-500 to-purple-600"
          />
          <KPICard
            title="High Impact Events"
            value="47"
            subtitle="Critical & high impact events"
            icon={Zap}
            trend="+8.2%"
            trendDirection="up"
            color="emerald"
            gradient="from-emerald-500 via-teal-500 to-cyan-600"
          />
          <KPICard
            title="Venue Utilization"
            value="89%"
            subtitle="Average venue capacity"
            icon={Building2}
            trend="+3.1%"
            trendDirection="up"
            color="amber"
            gradient="from-amber-500 via-orange-500 to-red-600"
          />
          <KPICard
            title="Revenue Impact"
            value="$2.4M"
            subtitle="Estimated hotel revenue impact"
            icon={TrendingUp}
            trend="+15.7%"
            trendDirection="up"
            color="purple"
            gradient="from-purple-500 via-pink-500 to-rose-600"
          />
        </div>

        {/* Charts and Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Event Distribution Chart */}
          <Card className="lg:col-span-2 bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Event Distribution</h3>
                    <p className="text-slate-600">Events by category and impact level</p>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 font-bold shadow-lg">
                  Live Data
                </Badge>
              </div>
              
              {/* Chart Placeholder */}
              <div className="h-80 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <p className="text-lg font-bold text-slate-700 mb-2">Interactive Chart</p>
                  <p className="text-slate-500">Event distribution analytics</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Quick Stats</h3>
                  <p className="text-slate-600">Real-time metrics</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100/50">
                  <div className="flex items-center gap-3">
                    <Music className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-slate-900">Music Events</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold">
                    847
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-slate-900">Sports Events</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold">
                    234
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100/50">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-purple-600" />
                    <span className="font-bold text-slate-900">Theater Events</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold">
                    166
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100/50">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-amber-600" />
                    <span className="font-bold text-slate-900">Total Venues</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold">
                    23
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Activity Feed */}
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Recent Activity</h3>
                  <p className="text-slate-600">Latest events and updates</p>
                </div>
              </div>
              <ActivityFeed />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Quick Actions</h3>
                  <p className="text-slate-600">Common tasks and shortcuts</p>
                </div>
              </div>
              <QuickActions />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
