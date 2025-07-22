import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ExternalLink,
  Star,
  TrendingUp,
  Music,
  Ticket,
  Eye,
  Heart,
  Share2,
  Zap,
  Image
} from "lucide-react";
import { format } from "date-fns";

export default function EventCard({ event, onViewDetails, onAddToWatchlist }) {
  const impactColors = {
    CRITICAL: "bg-gradient-to-r from-red-500 via-rose-500 to-pink-600 text-white shadow-xl shadow-red-500/25",
    HIGH: "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-600 text-white shadow-xl shadow-orange-500/25", 
    MEDIUM: "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-xl shadow-blue-500/25",
    LOW: "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white shadow-xl shadow-emerald-500/25"
  };

  const tierColors = {
    "Mega Venue (50,000+)": "bg-gradient-to-r from-purple-500 via-pink-500 to-rose-600 text-white shadow-xl shadow-purple-500/25",
    "Major Arena (15,000-25,000)": "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-600 text-white shadow-xl shadow-indigo-500/25",
    "Large Theater (2,000-5,000)": "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-xl shadow-blue-500/25",
    "Medium Theater (1,000-2,500)": "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white shadow-xl shadow-emerald-500/25",
    "Small Music Venue (100-500)": "bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white shadow-xl shadow-amber-500/25",
    "Intimate Venue (Under 200)": "bg-gradient-to-r from-slate-500 via-gray-500 to-zinc-600 text-white shadow-xl shadow-slate-500/25"
  };

  const venueTypeColors = {
    "Music": "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-600 text-white shadow-xl shadow-indigo-500/25",
    "Sports": "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white shadow-xl shadow-emerald-500/25",
    "Theater": "bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white shadow-xl shadow-amber-500/25",
    "Country Music Heritage": "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-600 text-white shadow-xl shadow-orange-500/25",
    "Other": "bg-gradient-to-r from-slate-500 via-gray-500 to-zinc-600 text-white shadow-xl shadow-slate-500/25"
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'music': return <Music className="w-4 h-4" />;
      case 'sports': return '🏟️';
      case 'theater': return '🎭';
      default: return <Music className="w-4 h-4" />;
    }
  };

  const getImpactIcon = (level) => {
    switch (level) {
      case 'CRITICAL': return <Zap className="w-3 h-3" />;
      case 'HIGH': return <Star className="w-3 h-3" />;
      case 'MEDIUM': return <Zap className="w-3 h-3" />;
      case 'LOW': return <Star className="w-3 h-3" />;
      default: return <Star className="w-3 h-3" />;
    }
  };

  const getImageQualityColor = (quality) => {
    switch (quality) {
      case 'High': return "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white shadow-xl shadow-emerald-500/25";
      case 'Medium': return "bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white shadow-xl shadow-amber-500/25";
      case 'Low': return "bg-gradient-to-r from-slate-500 via-gray-500 to-zinc-600 text-white shadow-xl shadow-slate-500/25";
      default: return "bg-gradient-to-r from-slate-500 via-gray-500 to-zinc-600 text-white shadow-xl shadow-slate-500/25";
    }
  };

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-sm border border-blue-100/50 shadow-xl hover:scale-[1.02] cursor-pointer overflow-hidden relative">
      {/* Animated gradient top border */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-indigo-500 animate-pulse"></div>
      
      {/* Event Image */}
      {event.event_image && (
        <div className="relative h-64 overflow-hidden">
          <img 
            src={event.event_image} 
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          {/* Fallback when image fails to load */}
          <div className="hidden w-full h-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
            <div className="text-center">
              <Music className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
              <p className="text-lg text-blue-600 font-bold">{event.name}</p>
            </div>
          </div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Overlay with badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <Badge className={`${impactColors[event.impact_level]} text-xs font-bold shadow-xl backdrop-blur-sm border border-white/20`}>
              <div className="flex items-center gap-1">
                {getImpactIcon(event.impact_level)}
                {event.impact_level}
              </div>
            </Badge>
            <Badge className={`${venueTypeColors[event.venue_type] || venueTypeColors.Other} text-xs font-bold shadow-xl backdrop-blur-sm border border-white/20`}>
              {event.venue_type}
            </Badge>
            <Badge className={`${tierColors[event.venue_tier]} text-xs font-bold shadow-xl backdrop-blur-sm border border-white/20`}>
              {event.venue_tier}
            </Badge>
            {/* Image Quality Badge */}
            {event.image_metadata?.quality && (
              <Badge className={`${getImageQualityColor(event.image_metadata.quality)} text-xs font-bold shadow-xl backdrop-blur-sm border border-white/20`}>
                <Image className="w-3 h-3 mr-1" />
                {event.image_metadata.quality}
              </Badge>
            )}
          </div>
          
          {/* Impact Score Overlay */}
          <div className="absolute top-4 right-4 z-10">
            <div className="flex items-center gap-2 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-xl border border-white/20">
              <Star className="w-4 h-4 fill-current text-yellow-400" />
              <span className="font-bold text-sm">{event.impact_score}</span>
            </div>
          </div>
          
          {/* Quick action buttons on hover */}
          <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <Button size="sm" variant="ghost" className="bg-white/90 backdrop-blur-sm hover:bg-white text-slate-700 rounded-full w-10 h-10 p-0 shadow-lg">
              <Heart className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="bg-white/90 backdrop-blur-sm hover:bg-white text-slate-700 rounded-full w-10 h-10 p-0 shadow-lg">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* Show badges here only if no image */}
            {!event.event_image && (
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge className={`${impactColors[event.impact_level]} text-xs font-bold shadow-lg`}>
                  <div className="flex items-center gap-1">
                    {getImpactIcon(event.impact_level)}
                    {event.impact_level}
                  </div>
                </Badge>
                <Badge className={`${venueTypeColors[event.venue_type] || venueTypeColors.Other} text-xs font-bold shadow-lg`}>
                  {event.venue_type}
                </Badge>
                <Badge className={`${tierColors[event.venue_tier]} text-xs font-bold shadow-lg`}>
                  {event.venue_tier}
                </Badge>
                {/* Image Quality Badge */}
                {event.image_metadata?.quality && (
                  <Badge className={`${getImageQualityColor(event.image_metadata.quality)} text-xs font-bold shadow-lg border`}>
                    <Image className="w-3 h-3 mr-1" />
                    {event.image_metadata.quality}
                  </Badge>
                )}
              </div>
            )}
            <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
              {event.name}
            </h3>
          </div>
          {/* Show impact score here only if no image */}
          {!event.event_image && (
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white px-3 py-1 rounded-full shadow-lg">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold text-sm">{event.impact_score}</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Impact Score</p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Event Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100/50 group-hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <span className="font-bold text-sm text-slate-800">
                {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
              </span>
              {event.time && (
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span className="text-xs text-slate-600 font-medium">{event.time}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-700 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100/50 group-hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm text-slate-800">{event.venue_name}</span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-slate-600 font-medium">
                  {event.distance_miles?.toFixed(1)} miles away
                </span>
              </div>
            </div>
          </div>

          {event.venue_capacity && (
            <div className="flex items-center gap-3 text-slate-700 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100/50 group-hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <span className="font-bold text-sm text-slate-800">
                  Capacity: {event.venue_capacity.toLocaleString()}
                </span>
                {event.estimated_attendance && (
                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs bg-white/80 border-purple-200">
                      Est. {Math.round((event.estimated_attendance / event.venue_capacity) * 100)}% full
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Category and Price Info */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-100/50 group-hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 rounded-lg flex items-center justify-center shadow-md">
              {getCategoryIcon(event.category)}
            </div>
            <span className="font-bold text-sm text-slate-700">{event.category || 'Music'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-bold text-slate-700">
              {event.ticket_price_range || 'Price TBA'}
            </span>
          </div>
        </div>

        {/* Image Metadata (if available and no image shown) */}
        {!event.event_image && event.image_metadata && (
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100/50">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Image className="w-3 h-3 text-blue-600" />
                <span className="text-slate-600">Image:</span>
                <span className="font-semibold text-slate-700">{event.image_metadata.quality}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-600">{event.image_metadata.width}×{event.image_metadata.height}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-600">{event.image_metadata.fileSize}</span>
              </div>
            </div>
          </div>
        )}

        {/* Ticket Status */}
        <div className="flex items-center justify-between">
          <Badge 
            variant={event.ticket_status === 'Available' ? 'default' : 'secondary'}
            className={`${
              event.ticket_status === 'Available' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' 
                : 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg'
            } font-bold`}
          >
            {event.ticket_status || 'Unknown'}
          </Badge>
          
          {event.venue_type && (
            <Badge className={`${venueTypeColors[event.venue_type] || venueTypeColors.Other} text-xs font-bold shadow-lg`}>
              {event.venue_type}
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-slate-200/50">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(event);
            }}
            className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Details
          </Button>
          <Button 
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onAddToWatchlist(event);
            }}
            className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 shadow-md"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl"></div>
    </Card>
  );
}