import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MapPin, Calendar, TrendingUp, FileBarChart } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Search Events",
      description: "Find events near hotel",
      icon: MapPin,
      color: "blue",
      href: createPageUrl("Events")
    },
    {
      title: "Today's Schedule", 
      description: "View current day events",
      icon: Calendar,
      color: "emerald",
      href: createPageUrl("Events?filter=today")
    },
    {
      title: "Analytics", 
      description: "View reports & insights", 
      icon: TrendingUp,
      color: "purple",
      href: createPageUrl("Analytics")
    },
    {
      title: "Generate Report",
      description: "Export analysis data",
      icon: FileBarChart,
      color: "amber",
      href: createPageUrl("Analytics?action=report")
    }
  ];

  const colorClasses = {
    blue: "bg-blue-500 hover:bg-blue-600",
    emerald: "bg-emerald-500 hover:bg-emerald-600",
    purple: "bg-purple-500 hover:bg-purple-600", 
    amber: "bg-amber-500 hover:bg-amber-600"
  };

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Link key={index} to={action.href}>
              <Button 
                variant="ghost" 
                className={`h-auto p-4 w-full flex-col items-start gap-2 hover:bg-gray-50 transition-colors duration-200 ${colorClasses[action.color]} text-white hover:text-white`}
              >
                <action.icon className="w-5 h-5" />
                <div className="text-left">
                  <h4 className="font-medium text-sm mb-1">{action.title}</h4>
                  <p className="text-xs opacity-90">{action.description}</p>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}