import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendDirection, 
  color = "blue",
  badge,
  comparison,
  gradient
}) {
  const colorClasses = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500", 
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    purple: "bg-purple-500"
  };

  const bgColor = colorClasses[color];
  const TrendIcon = trendDirection === 'up' ? TrendingUp : trendDirection === 'down' ? TrendingDown : Minus;

  return (
    <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-lg ${bgColor} shadow-sm`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {badge && (
            <Badge className={`${badge.color} border-0 font-medium text-xs`}>
              {badge.text}
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">
            {value}
          </h3>
          
          <div className="flex items-center gap-2 text-sm">
            {trend && (
              <div className={`flex items-center gap-1 font-medium px-2 py-1 rounded-full text-xs ${
                trendDirection === 'up' ? 'bg-green-100 text-green-800' : 
                trendDirection === 'down' ? 'bg-red-100 text-red-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                <TrendIcon className="w-3 h-3" />
                <span>{trend}</span>
              </div>
            )}
            {comparison && (
                <p className="text-gray-500 text-xs">{comparison}</p>
            )}
          </div>
          
          {subtitle && (
            <p className="text-sm text-gray-500 pt-1">
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
