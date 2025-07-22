import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Building2, 
  Users, 
  Activity,
  Globe,
  Phone,
  ExternalLink,
  Star
} from "lucide-react";

export default function VenueCard({ venue }) {
  console.log('VenueCard venue:', venue); // Debug output
  const tierColors = {
    MEGA: "bg-purple-100 text-purple-800 border-purple-200",
    MAJOR: "bg-blue-100 text-blue-800 border-blue-200",
    LARGE: "bg-teal-100 text-teal-800 border-teal-200",
    MEDIUM: "bg-slate-100 text-slate-800 border-slate-200",
    SMALL: "bg-gray-100 text-gray-800 border-gray-200"
  };

  const activityColors = {
    High: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Medium: "bg-amber-100 text-amber-800 border-amber-200",
    Low: "bg-slate-100 text-slate-800 border-slate-200"
  };

  const distanceColor = 
    venue.distance_from_hotel < 2 ? "text-emerald-600" :
    venue.distance_from_hotel < 5 ? "text-amber-600" :
    "text-rose-600";

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${tierColors[venue.tier]} text-xs font-semibold border`}>
                {venue.tier}
              </Badge>
              <Badge className={`${activityColors[venue.activity_level]} text-xs font-medium border`}>
                {venue.activity_level} Activity
              </Badge>
            </div>
            <CardTitle className="font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors duration-200">
              {venue.name}
            </CardTitle>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-blue-600">
              <Star className="w-4 h-4 fill-current text-amber-500" />
              <span className="font-bold text-sm">{venue.data_quality_score}</span>
            </div>
            <p className="text-xs text-slate-500">Quality Score</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location */}
        <div className="flex items-start gap-2 text-slate-700">
          <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{venue.address}</p>
            <p className={`text-xs font-semibold ${distanceColor}`}>
              {venue.distance_from_hotel !== undefined && venue.distance_from_hotel !== null
                ? `${venue.distance_from_hotel.toFixed(2)} miles from hotel`
                : 'N/A'}
            </p>
          </div>
        </div>

        {/* Capacity */}
        <div className="space-y-2 text-slate-700">
            <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="text-sm font-medium">
                    {venue.capacity.toLocaleString()} Capacity
                </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div 
                    className="bg-purple-600 h-2.5 rounded-full" 
                    style={{ width: `${(venue.capacity / 70000) * 100}%` }}
                ></div>
            </div>
             {venue.seating_capacity && venue.standing_capacity && (
                <p className="text-xs text-slate-500 text-right">
                    {venue.seating_capacity.toLocaleString()} seated, {venue.standing_capacity.toLocaleString()} standing
                </p>
            )}
        </div>

        {/* Upcoming Events */}
        <div className="flex items-center gap-2 text-slate-700">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span className="text-sm">
            {venue.upcoming_events_count || 0} upcoming events
          </span>
        </div>

        {/* Action Button */}
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
          size="sm"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}