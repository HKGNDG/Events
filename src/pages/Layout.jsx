import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, 
  Calendar, 
  Building2, 
  BarChart3, 
  Link as LinkIcon, 
  Settings,
  Menu,
  X,
  Hotel,
  Bell,
  User
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
    description: "Overview & KPIs",
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Events", 
    url: createPageUrl("Events"),
    icon: Calendar,
    description: "Event Discovery",
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Venues",
    url: createPageUrl("Venues"), 
    icon: Building2,
    description: "Venue Management",
    color: "from-emerald-500 to-teal-500"
  },
  {
    title: "Analytics",
    url: createPageUrl("Analytics"),
    icon: BarChart3,
    description: "Reporting & Insights",
    color: "from-orange-500 to-red-500"
  },
  {
    title: "Integration",
    url: createPageUrl("Integration"),
    icon: LinkIcon,
    description: "Pricing Systems",
    color: "from-indigo-500 to-purple-500"
  },
  {
    title: "Settings",
    url: createPageUrl("Settings"),
    icon: Settings,
    description: "Configuration",
    color: "from-slate-500 to-gray-500"
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const pageTitle = currentPageName || navigationItems.find(item => item.url === location.pathname)?.title || "Dashboard";

  // Helper to close sidebar on mobile after nav
  const handleNavClick = () => {
    // For mobile, we'll use a simple approach - just navigate and let the sidebar auto-close
    // The sidebar will close automatically on mobile when clicking outside or navigating
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <style>{`
          :root {
            --primary: 59 130 246;
            --primary-foreground: 248 250 252;
            --secondary: 248 250 252;
            --secondary-foreground: 15 23 42;
            --accent: 245 158 11;
            --accent-foreground: 15 23 42;
            --muted: 248 250 252;
            --muted-foreground: 100 116 139;
            --border: 226 232 240;
            --success: 16 185 129;
            --warning: 245 158 11;
            --destructive: 239 68 68;
          }
          
          .glass-effect {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .sidebar-gradient {
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
            backdrop-filter: blur(20px);
          }
          
          .nav-item-hover {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
            border: 1px solid rgba(59, 130, 246, 0.2);
          }
        `}</style>

        <Sidebar className="border-r border-slate-200/60 sidebar-gradient shadow-xl min-w-[280px]">
          <SidebarHeader className="border-b border-slate-200/40 p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Hotel className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-xl tracking-tight">Nashville Hotel</h2>
                <p className="text-sm text-slate-600 font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                  Event Intelligence
                </p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4 overflow-y-auto">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 py-4">
                Platform
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`group relative overflow-hidden transition-all duration-300 rounded-2xl mb-2 ${
                            isActive 
                              ? `bg-gradient-to-r ${item.color} text-white shadow-xl shadow-blue-500/25 transform scale-105` 
                              : 'hover:nav-item-hover hover:shadow-lg hover:scale-105'
                          }`}
                          onClick={handleNavClick}
                        >
                          <Link to={item.url} aria-current={isActive ? "page" : undefined} className="flex items-center gap-4 px-4 py-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                              isActive 
                                ? 'bg-white/20 backdrop-blur-sm' 
                                : `bg-gradient-to-br ${item.color} opacity-80 group-hover:opacity-100`
                            }`}>
                              <item.icon className={`w-5 h-5 transition-all duration-300 ${
                                isActive ? 'text-white' : 'text-white group-hover:scale-110'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className={`font-bold text-sm block truncate ${
                                isActive ? 'text-white' : 'text-slate-900'
                              }`}>
                                {item.title}
                              </span>
                              <p className={`text-xs block truncate ${
                                isActive ? 'text-white/80' : 'text-slate-500'
                              }`}>
                                {item.description}
                              </p>
                            </div>
                            {isActive && (
                              <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 py-4">
                System Status
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-3 space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200/50">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-slate-700">API Status</span>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-bold">
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
                    <span className="text-sm font-semibold text-slate-700">Last Sync</span>
                    <span className="text-slate-600 text-xs font-bold">2 min ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200/50">
                    <span className="text-sm font-semibold text-slate-700">Active Events</span>
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs font-bold">
                      47
                    </Badge>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200/40 p-4">
            <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-200/50">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-gray-700 rounded-full flex items-center justify-center shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm block truncate">Operations Manager</p>
                <p className="text-xs text-slate-500 block truncate">Nashville Hotel</p>
              </div>
              <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Enhanced App Header */}
          <header className="flex-shrink-0 glass-effect border-b border-slate-200/60 shadow-sm">
            <div className="mx-auto px-6 h-20 flex items-center">
              {/* Page Title / Mobile Menu Trigger */}
              <div className="flex items-center gap-6">
                <SidebarTrigger className="md:hidden -ml-2 hover:bg-slate-100 p-2 rounded-xl transition-all duration-200 hover:scale-105" />
                <div className="pl-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {pageTitle}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {navigationItems.find(item => item.url === location.pathname)?.description || "Overview & Analytics"}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50/50 via-blue-50/20 to-indigo-50/20">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

