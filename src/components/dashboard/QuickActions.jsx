import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MapPin, Calendar, TrendingUp, FileBarChart } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Search Events Near Hotel",
      description: "Find events within configured radius",
      icon: MapPin,
      color: "blue",
      href: createPageUrl("Events")
    },
    {
      title: "Check Today's Schedule", 
      description: "View current day event impact",
      icon: Calendar,
      color: "emerald",
      href: createPageUrl("Events?filter=today")
    },
    {
      title: "View Weekly Forecast",
      description: "7-day event impact overview", 
      icon: TrendingUp,
      color: "purple",
      href: createPageUrl("Analytics")
    },
    {
      title: "Generate Impact Report",
      description: "Comprehensive analysis export",
      icon: FileBarChart,
      color: "amber",
      href: createPageUrl("Analytics?action=report")
    }
  ];

  const colorClasses = {
    blue: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/25",
    emerald: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25",
    purple: "bg-purple-600 hover:bg-purple-700 shadow-purple-600/25", 
    amber: "bg-amber-600 hover:bg-amber-700 shadow-amber-600/25"
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
          Quick Actions
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <Link key={index} to={action.href}>
              <Button 
                variant="ghost" 
                className={`h-auto p-6 w-full flex-col items-start gap-3 hover:scale-105 transition-all duration-300 ${colorClasses[action.color]} text-white hover:text-white group shadow-lg`}
              >
                <action.icon className="w-8 h-8 group-hover:scale-110 transition-transform duration-200" />
                <div className="text-left">
                  <h4 className="font-semibold text-sm mb-1">{action.title}</h4>
                  <p className="text-xs opacity-90 leading-relaxed">{action.description}</p>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}