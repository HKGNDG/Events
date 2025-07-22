import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent, 
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar as CalendarIcon } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  Filter,
  Calendar,
  AlertTriangle,
  Building2,
  MapPin,
  LayoutGrid,
  List,
  SortAsc,
  Sparkles,
  Zap,
  Target,
  Star,
  Clock,
  TrendingUp,
  Users,
  Navigation
} from "lucide-react";

export default function EventFilters({ 
  filters, 
  onFiltersChange, 
  viewMode, 
  onViewModeChange,
  eventCount = 0
}) {
  const [activeFilters, setActiveFilters] = useState(0);
  const [customDate, setCustomDate] = useState(null);

  const dateRangeOptions = [
    { value: "today", label: "TODAY", icon: Star, color: "from-emerald-500 to-teal-600" },
    { value: "week", label: "THIS WEEK", icon: Calendar, color: "from-blue-500 to-indigo-600" },
    { value: "month", label: "THIS MONTH", icon: Clock, color: "from-purple-500 to-pink-600" },
    { value: "year", label: "THIS YEAR", icon: Target, color: "from-orange-500 to-red-600" },
    { value: "custom", label: "CUSTOM DATE", icon: Calendar, color: "from-indigo-500 to-purple-600" }
  ];

  const impactLevels = [
    { value: "all", label: "All Impact Levels", color: "text-slate-600", bg: "bg-slate-50" },
    { value: "CRITICAL", label: "Critical", color: "text-red-600", bg: "bg-red-50", gradient: "from-red-500 to-pink-600" },
    { value: "HIGH", label: "High", color: "text-orange-600", bg: "bg-orange-50", gradient: "from-orange-500 to-amber-600" },
    { value: "MEDIUM", label: "Medium", color: "text-blue-600", bg: "bg-blue-50", gradient: "from-blue-500 to-indigo-600" },
    { value: "LOW", label: "Low", color: "text-emerald-600", bg: "bg-emerald-50", gradient: "from-emerald-500 to-teal-600" }
  ];

  const venueTypes = [
    { value: "all", label: "All Venue Types", icon: Building2 },
    { value: "Music", label: "Music", icon: TrendingUp, gradient: "from-indigo-500 to-purple-600" },
    { value: "Sports", label: "Sports", icon: Target, gradient: "from-emerald-500 to-teal-600" },
    { value: "Theater", label: "Theater", icon: Star, gradient: "from-amber-500 to-orange-600" },
    { value: "Other", label: "Other", icon: Building2, gradient: "from-slate-500 to-gray-600" }
  ];

  const sortOptions = [
    { value: "impact_score", label: "Impact Score", icon: TrendingUp },
    { value: "date", label: "Date", icon: Calendar },
    { value: "venue_capacity", label: "Venue Capacity", icon: Users },
    { value: "distance_miles", label: "Distance", icon: Navigation }
  ];

  return (
    <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl">
      <CardContent className="p-8">
        {/* Header with event count */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Filter className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Event Filters
              </h3>
              <p className="text-slate-600 font-medium text-lg">Refine your search results</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-600 text-white px-8 py-4 text-base font-bold shadow-xl border border-white/20">
            <Sparkles className="w-5 h-5 mr-3" />
            {eventCount.toLocaleString()} events found
          </Badge>
        </div>

        {/* Top Row - Date Range Tabs */}
        <div className="mb-10">
          <label className="text-base font-bold text-slate-700 mb-6 block flex items-center gap-3">
            <Calendar className="w-5 h-5 text-purple-600" />
            Date Range
          </label>
          <div className="flex flex-wrap gap-4">
            {dateRangeOptions.map((option) => (
              <Button
                key={option.value}
                variant={filters.dateRange === option.value ? "default" : "outline"}
                className={`font-bold transition-all duration-300 transform hover:scale-105 rounded-2xl px-6 py-4 text-base ${
                  filters.dateRange === option.value 
                    ? `bg-gradient-to-r ${option.color} hover:shadow-xl text-white shadow-xl border-0` 
                    : "hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 border-slate-200 hover:border-purple-300 text-slate-700 hover:text-purple-700 shadow-lg hover:shadow-xl"
                }`}
                onClick={() => {
                  console.log('Date range clicked:', option.value);
                  if (option.value === 'custom') {
                    // Don't change the filter yet, let the calendar picker handle it
                    return;
                  }
                  onFiltersChange({ ...filters, dateRange: option.value });
                }}
              >
                <option.icon className="w-5 h-5 mr-3" />
                {option.label}
              </Button>
            ))}
          </div>
          
          {/* Custom Date Calendar Picker */}
          {filters.dateRange === 'custom' && (
            <div className="mt-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/50">
              <div className="flex items-center gap-4 mb-4">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-slate-900">Select Custom Date</h4>
              </div>
              <div className="flex items-center gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[280px] justify-start text-left font-normal bg-white border-indigo-200 hover:border-indigo-300 rounded-xl px-4 py-3",
                        !customDate && "text-slate-500"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {customDate ? format(customDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white rounded-2xl shadow-xl border border-slate-200">
                    <CalendarIcon
                      mode="single"
                      selected={customDate}
                      onSelect={(date) => {
                        setCustomDate(date);
                        if (date) {
                          onFiltersChange({ 
                            ...filters, 
                            dateRange: 'custom',
                            customDate: date.toISOString().split('T')[0]
                          });
                        }
                      }}
                      initialFocus
                      className="rounded-2xl"
                    />
                  </PopoverContent>
                </Popover>
                {customDate && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCustomDate(null);
                      onFiltersChange({ ...filters, dateRange: 'month' });
                    }}
                    className="px-4 py-3 border-red-200 hover:border-red-300 text-red-600 hover:text-red-700 rounded-xl"
                  >
                    Clear
                  </Button>
                )}
              </div>
              {customDate && (
                <p className="text-sm text-slate-600 mt-2">
                  Selected: {format(customDate, "EEEE, MMMM do, yyyy")}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Impact Level Filter */}
          <div className="space-y-4">
            <label className="text-base font-bold text-slate-700 flex items-center gap-3">
              <Zap className="w-5 h-5 text-purple-600" />
              Impact Level
            </label>
            <Select 
              value={filters.impactLevel} 
              onValueChange={(value) => onFiltersChange({ ...filters, impactLevel: value })}
            >
              <SelectTrigger className="bg-white border-slate-200 hover:border-purple-300 focus:border-purple-500 h-14 text-slate-700 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl">
                {impactLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value} className="hover:bg-slate-50 text-slate-700 rounded-lg py-3">
                    <span className={level.color}>{level.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Venue Type Filter */}
          <div className="space-y-4">
            <label className="text-base font-bold text-slate-700 flex items-center gap-3">
              <Building2 className="w-5 h-5 text-purple-600" />
              Venue Type
            </label>
            <Select 
              value={filters.venueType} 
              onValueChange={(value) => onFiltersChange({ ...filters, venueType: value })}
            >
              <SelectTrigger className="bg-white border-slate-200 hover:border-purple-300 focus:border-purple-500 h-14 text-slate-700 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl">
                {venueTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="hover:bg-slate-50 text-slate-700 rounded-lg py-3">
                    <type.icon className="w-5 h-5 mr-3" />
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Distance Filter */}
          <div className="space-y-4">
            <label className="text-base font-bold text-slate-700 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-purple-600" />
              Distance: {filters.distance}mi
            </label>
            <div className="bg-white rounded-xl border border-slate-200 h-14 flex items-center px-6 relative shadow-lg hover:shadow-xl transition-all duration-300">
              <Slider
                value={[filters.distance]}
                onValueChange={(value) => onFiltersChange({ ...filters, distance: value[0] })}
                max={25}
                min={1}
                step={1}
                className="flex-1"
              />
            </div>
            <div className="flex justify-between text-sm text-slate-600 px-2 font-bold">
              <span>1 mi</span>
              <span>25 mi</span>
            </div>
          </div>

          {/* Sort Options */}
          <div className="space-y-4">
            <label className="text-base font-bold text-slate-700 flex items-center gap-3">
              <SortAsc className="w-5 h-5 text-purple-600" />
              Sort By
            </label>
            <Select 
              value={filters.sortBy} 
              onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value })}
            >
              <SelectTrigger className="bg-white border-slate-200 hover:border-purple-300 focus:border-purple-500 h-14 text-slate-700 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                <SelectValue placeholder="Select sort option" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl">
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="hover:bg-slate-50 text-slate-700 rounded-lg py-3">
                    <option.icon className="w-5 h-5 mr-3" />
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-base font-bold text-slate-700">View Mode:</span>
            <div className="flex bg-slate-100 rounded-xl p-1 shadow-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className={`rounded-lg px-4 py-2 font-bold transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className={`rounded-lg px-4 py-2 font-bold transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <List className="w-4 h-4 mr-2" />
                List
              </Button>
            </div>
          </div>
          
          {/* Active Filters Count */}
          <div className="flex items-center gap-3">
            <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 font-bold shadow-lg">
              <Target className="w-4 h-4 mr-2" />
              {activeFilters} active filters
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}