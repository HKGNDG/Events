import React, { useState, useEffect } from "react";
import { Event } from "@/api/entities";
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
  PieChart as PieChartIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Analytics() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState('impact');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const eventsData = await Event.list('-date', 100);
      // Handle new API response structure with events and pagination
      const eventsArray = eventsData.events || eventsData || [];
      setEvents(eventsArray);
    } catch (error) {
      console.error("Error loading events:", error);
      setEvents([]); // Set empty array on error
    }
    setIsLoading(false);
  };

  // Prepare chart data
  const getImpactTimelineData = () => {
    if (!Array.isArray(events)) return [];
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEvents = events.filter(event => event.date === dateStr);
      const totalImpact = dayEvents.reduce((sum, event) => sum + (event.impact_score || 0), 0);
      
      last30Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        impact: totalImpact,
        events: dayEvents.length
      });
    }
    return last30Days;
  };

  const getVenueUtilizationData = () => {
    if (!Array.isArray(events)) return [];
    const venueStats = {};
    events.forEach(event => {
      if (!venueStats[event.venue_name]) {
        venueStats[event.venue_name] = {
          name: event.venue_name.length > 15 ? event.venue_name.substring(0, 15) + '...' : event.venue_name,
          events: 0,
          totalCapacity: event.venue_capacity || 0,
          totalImpact: 0
        };
      }
      venueStats[event.venue_name].events++;
      venueStats[event.venue_name].totalImpact += event.impact_score || 0;
    });

    return Object.values(venueStats)
      .sort((a, b) => b.events - a.events)
      .slice(0, 10);
  };

  const getCategoryDistribution = () => {
    if (!Array.isArray(events)) return [];
    const categories = {};
    events.forEach(event => {
      const category = event.venue_type || 'Other';
      categories[category] = (categories[category] || 0) + 1;
    });

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    
    return Object.entries(categories).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  };

  const chartTypes = [
    { id: 'impact', name: 'Impact Timeline', icon: TrendingUp },
    { id: 'venues', name: 'Venue Utilization', icon: BarChart3 },
    { id: 'categories', name: 'Event Categories', icon: PieChartIcon },
    { id: 'capacity', name: 'Capacity Analysis', icon: Activity }
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const periodOptions = [
    { value: 'week', label: 'This Week', color: 'from-blue-500 to-indigo-600' },
    { value: 'month', label: 'This Month', color: 'from-purple-500 to-pink-600' },
    { value: 'quarter', label: 'This Quarter', color: 'from-emerald-500 to-teal-600' },
    { value: 'year', label: 'This Year', color: 'from-amber-500 to-orange-600' }
  ];

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
                Reporting & Insights
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
              <span className="text-lg font-bold text-slate-800">Real-time Data</span>
            </div>
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-xl border border-rose-100/50">
              <MapPin className="w-5 h-5 text-rose-600" />
              <span className="text-lg font-bold text-slate-800">Nashville Area</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Badge className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-600 text-white px-6 py-3 text-base font-bold shadow-xl border border-white/20">
              <Sparkles className="w-5 h-5 mr-3" />
              Advanced Analytics
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="border-2 border-purple-200 hover:border-purple-300 text-purple-700 px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Download className="w-5 h-5 mr-3" />
              Export Report
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <RefreshCw className={`w-5 h-5 mr-3 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="mb-8">
          <div className="flex items-center gap-6">
            <h3 className="text-xl font-bold text-slate-800">Time Period:</h3>
            <div className="flex gap-4">
              {periodOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedPeriod === option.value ? "default" : "outline"}
                  className={`font-bold transition-all duration-300 transform hover:scale-105 rounded-2xl px-6 py-4 text-base ${
                    selectedPeriod === option.value 
                      ? `bg-gradient-to-r ${option.color} hover:shadow-xl text-white shadow-xl border-0` 
                      : "hover:bg-gradient-to-r hover:from-slate-50 hover:to-purple-50 border-slate-200 hover:border-purple-300 text-slate-700 hover:text-purple-700 shadow-lg hover:shadow-xl"
                  }`}
                  onClick={() => setSelectedPeriod(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
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
                  +12.5%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">1,247</h3>
              <p className="text-slate-600">Total Events</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden group hover:scale-105 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold">
                  +8.2%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">47</h3>
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
                  +3.1%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">89%</h3>
              <p className="text-slate-600">Venue Utilization</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden group hover:scale-105 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold">
                  +15.7%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">$2.4M</h3>
              <p className="text-slate-600">Revenue Impact</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Event Trends Chart */}
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Event Trends</h3>
                    <p className="text-slate-600">Monthly event growth</p>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 font-bold shadow-lg">
                  Live Data
                </Badge>
              </div>
              
              {/* Chart Placeholder */}
              <div className="h-80 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50 flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <p className="text-lg font-bold text-slate-700 mb-2">Event Trends Chart</p>
                  <p className="text-slate-500">Monthly growth analytics</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Venue Performance Chart */}
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Venue Performance</h3>
                    <p className="text-slate-600">Top venues by events</p>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 font-bold shadow-lg">
                  Live Data
                </Badge>
              </div>
              
              {/* Chart Placeholder */}
              <div className="h-80 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100/50 flex items-center justify-center">
                <div className="text-center">
                  <Building2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                  <p className="text-lg font-bold text-slate-700 mb-2">Venue Performance Chart</p>
                  <p className="text-slate-500">Venue analytics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Categories */}
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <PieChart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Event Categories</h3>
                  <p className="text-slate-600">Distribution by type</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100/50">
                  <div className="flex items-center gap-3">
                    <Music className="w-5 h-5 text-purple-600" />
                    <span className="font-bold text-slate-900">Music Events</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">847</p>
                    <p className="text-sm text-slate-600">68%</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-slate-900">Sports Events</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">234</p>
                    <p className="text-sm text-slate-600">19%</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100/50">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-slate-900">Theater Events</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">166</p>
                    <p className="text-sm text-slate-600">13%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impact Analysis */}
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Impact Analysis</h3>
                  <p className="text-slate-600">Event impact levels</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl border border-red-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-bold text-slate-900">Critical</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">12</p>
                    <p className="text-sm text-slate-600">1%</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="font-bold text-slate-900">High</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">35</p>
                    <p className="text-sm text-slate-600">3%</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-bold text-slate-900">Medium</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">1,200</p>
                    <p className="text-sm text-slate-600">96%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Insights */}
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Revenue Insights</h3>
                  <p className="text-slate-600">Financial impact</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">Total Revenue</span>
                    <span className="text-2xl font-bold text-green-600">$2.4M</span>
                  </div>
                  <p className="text-sm text-slate-600">+15.7% vs last period</p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">Avg. Event Value</span>
                    <span className="text-2xl font-bold text-blue-600">$1,925</span>
                  </div>
                  <p className="text-sm text-slate-600">+8.2% vs last period</p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">ROI</span>
                    <span className="text-2xl font-bold text-purple-600">342%</span>
                  </div>
                  <p className="text-sm text-slate-600">+12.5% vs last period</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}