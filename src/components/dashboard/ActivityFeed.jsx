
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
  ArrowRight,
  Check,
  Eye
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ActivityFeed() {
  const activities = [
    {
      type: "high-impact",
      title: "New High-Impact Event Detected",
      description: "Taylor Swift Concert at Bridgestone Arena",
      time: new Date(Date.now() - 5 * 60 * 1000),
      icon: AlertTriangle,
      color: "rose",
      badge: "CRITICAL",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200"
    },
    {
      type: "venue-update",
      title: "Venue Capacity Updated", 
      description: "Grand Ole Opry - capacity verified at 4,372",
      time: new Date(Date.now() - 15 * 60 * 1000),
      icon: Building2,
      color: "blue",
      badge: "UPDATED",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200"
    },
    {
      type: "system-alert",
      title: "API Sync Completed",
      description: "Ticketmaster data refreshed - 23 new events",
      time: new Date(Date.now() - 30 * 60 * 1000),
      icon: Activity,
      color: "emerald",
      badge: "SUCCESS",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200"
    },
    {
      type: "pricing",
      title: "Pricing Recommendation Generated",
      description: "Increase rates 35% for March 15-17 weekend",
      time: new Date(Date.now() - 45 * 60 * 1000),
      icon: DollarSign,
      color: "amber",
      badge: "OPPORTUNITY",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200"
    }
  ];

  const iconColorClasses = {
    rose: "bg-rose-100 text-rose-600",
    blue: "bg-blue-100 text-blue-600", 
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600"
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
          Recent Activity
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600">
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activities.map((activity, index) => (
            <div 
              key={index}
              className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50/80 transition-colors duration-200 group"
            >
              <div className={`p-2 rounded-lg ${iconColorClasses[activity.color]} group-hover:scale-110 transition-transform duration-200`}>
                <activity.icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors duration-200">
                    {activity.title}
                  </h4>
                  <Badge className={`${activity.badgeColor} text-xs font-medium border`}>
                    {activity.badge}
                  </Badge>
                </div>
                <p className="text-slate-600 text-sm mb-2 leading-relaxed">
                  {activity.description}
                </p>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatDistanceToNow(activity.time, { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-slate-600 hover:bg-slate-200">
                            <Eye className="w-3 h-3 mr-1" />
                            Details
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-slate-600 hover:bg-slate-200">
                            <Check className="w-3 h-3 mr-1" />
                            Dismiss
                        </Button>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
