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
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600", 
    amber: "from-amber-500 to-amber-600",
    rose: "from-rose-500 to-rose-600",
    purple: "from-purple-500 to-purple-600"
  };

  const gradientClass = gradient || colorClasses[color];
  const TrendIcon = trendDirection === 'up' ? TrendingUp : trendDirection === 'down' ? TrendingDown : Minus;

  return (
    <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 group hover:scale-105">
      {/* Animated background gradient */}
      <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${gradientClass} opacity-5 rounded-full transform translate-x-10 -translate-y-10 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500`} />
      
      {/* Top accent border */}
      <div className={`h-1 bg-gradient-to-r ${gradientClass} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <CardContent className="p-8 relative">
        <div className="flex justify-between items-start mb-6">
          <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradientClass} shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          {badge && (
            <Badge className={`${badge.color} border-0 font-bold shadow-lg`}>
              {badge.text}
            </Badge>
          )}
        </div>
        
        <div className="space-y-3">
          <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">{title}</p>
          <h3 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
            {value}
          </h3>
          
          <div className="flex items-center gap-3 text-sm">
            {trend && (
              <div className={`flex items-center gap-2 font-bold px-3 py-1 rounded-full ${
                trendDirection === 'up' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 
                trendDirection === 'down' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 
                'bg-slate-100 text-slate-800 border border-slate-200'
              }`}>
                <TrendIcon className="w-4 h-4" />
                <span>{trend}</span>
              </div>
            )}
            {comparison && (
                <p className="text-slate-500 text-xs font-medium">{comparison}</p>
            )}
          </div>
          
          {subtitle && (
            <p className="text-sm text-slate-500 font-semibold pt-2 border-t border-slate-100/50">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Hover effect overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
      </CardContent>
    </Card>
  );
}
