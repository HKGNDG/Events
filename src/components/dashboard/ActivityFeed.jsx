import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Building2, 
  Activity, 
  DollarSign, 
  Clock,
  ArrowRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ActivityFeed() {
  const activities = [
    {
      type: "high-impact",
      title: "New High-Impact Event",
      description: "Taylor Swift Concert at Bridgestone Arena",
      time: new Date(Date.now() - 5 * 60 * 1000),
      icon: AlertTriangle,
      color: "rose",
      badge: "CRITICAL",
      badgeColor: "bg-red-100 text-red-800"
    },
    {
      type: "venue-update",
      title: "Venue Capacity Updated", 
      description: "Grand Ole Opry - capacity verified at 4,372",
      time: new Date(Date.now() - 15 * 60 * 1000),
      icon: Building2,
      color: "blue",
      badge: "UPDATED",
      badgeColor: "bg-blue-100 text-blue-800"
    },
    {
      type: "system-alert",
      title: "API Sync Completed",
      description: "Ticketmaster data refreshed - 23 new events",
      time: new Date(Date.now() - 30 * 60 * 1000),
      icon: Activity,
      color: "emerald",
      badge: "SUCCESS",
      badgeColor: "bg-green-100 text-green-800"
    },
    {
      type: "pricing",
      title: "Pricing Recommendation",
      description: "Increase rates 35% for March 15-17 weekend",
      time: new Date(Date.now() - 45 * 60 * 1000),
      icon: DollarSign,
      color: "amber",
      badge: "OPPORTUNITY",
      badgeColor: "bg-yellow-100 text-yellow-800"
    }
  ];

  const iconColorClasses = {
    rose: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-600", 
    emerald: "bg-green-100 text-green-600",
    amber: "bg-yellow-100 text-yellow-600"
  };

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Recent Activity
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <div className={`p-2 rounded-md ${iconColorClasses[activity.color]}`}>
                <activity.icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {activity.title}
                  </h4>
                  <Badge className={`${activity.badgeColor} text-xs font-medium`}>
                    {activity.badge}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mb-2">
                  {activity.description}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatDistanceToNow(activity.time, { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
