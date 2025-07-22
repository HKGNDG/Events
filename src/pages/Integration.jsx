import React, { useState, useEffect } from "react";
import { HotelConfig } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { 
  Link as LinkIcon, 
  Activity, 
  DollarSign, 
  Settings, 
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Zap,
  Target,
  Clock,
  Building2,
  Music,
  Globe,
  Database,
  Shield,
  Plus,
  Trash2,
  Mail,
  Phone,
  Users,
  Key,
  ExternalLink,
  X,
  Save
} from "lucide-react";

export default function Integration() {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [ticketmasterSettings, setTicketmasterSettings] = useState({
    apiKey: '',
    baseUrl: 'https://app.ticketmaster.com/discovery/v2/',
    rateLimit: 2000,
    syncInterval: 6,
    enabled: true
  });
  const [showTicketmasterSettings, setShowTicketmasterSettings] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
    checkBackendStatus();
    loadTicketmasterSettings();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const configs = await HotelConfig.list();
      console.log('Loaded integration config from backend:', configs);
      const configsArray = Array.isArray(configs) ? configs : [];
      const config = configsArray[0] || null;
      setConfig(config);
      
      if (config) {
        console.log('Integration config loaded:', {
          pricingSystemConnected: config.pricingSystemConnected,
          hotelName: config.hotelName,
          notificationEmail: config.notificationEmail
        });
      }
    } catch (error) {
      console.error("Error loading integration config:", error);
      setConfig(null);
    }
    setIsLoading(false);
  };

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('/api/config');
      if (response.ok) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('disconnected');
      }
    } catch (error) {
      console.error('Backend status check failed:', error);
      setBackendStatus('disconnected');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      console.log('Starting integration sync...');
      // Simulate API sync with backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Integration sync completed');
      
      // Reload config after sync
      await loadConfig();
    } catch (error) {
      console.error('Error during sync:', error);
    }
    setSyncing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'disconnected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4" />;
      case 'disconnected':
        return <AlertCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleToggleIntegration = async (integrationId) => {
    try {
      console.log('Toggling integration:', integrationId);
      
      if (integrationId === 3 && config) { // Pricing System
        const updatedConfig = {
          ...config,
          pricingSystemConnected: !config.pricingSystemConnected
        };
        
        console.log('Updating pricing system connection:', updatedConfig);
        await HotelConfig.update(config.id, updatedConfig);
        
        // Reload config to reflect changes
        await loadConfig();
        
        console.log('Pricing system toggled successfully');
      }
    } catch (error) {
      console.error('Error toggling integration:', error);
    }
  };

  const loadTicketmasterSettings = async () => {
    try {
      const response = await fetch('/api/integrations/ticketmaster');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          setTicketmasterSettings({
            apiKey: data.settings.apiKey || '',
            baseUrl: data.settings.baseUrl || 'https://app.ticketmaster.com/discovery/v2/',
            rateLimit: data.settings.rateLimit || 2000,
            syncInterval: data.settings.syncInterval || 6,
            enabled: data.settings.enabled || false
          });
          console.log('Loaded Ticketmaster settings from backend:', data.settings);
        }
      } else {
        console.error('Failed to load Ticketmaster settings from backend');
      }
    } catch (error) {
      console.error('Error loading Ticketmaster settings:', error);
    }
  };

  const saveTicketmasterSettings = async () => {
    try {
      const response = await fetch('/api/integrations/ticketmaster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketmasterSettings),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast({
            title: "Settings Saved",
            description: "Ticketmaster API settings have been updated successfully in the backend.",
          });
          setShowTicketmasterSettings(false);
          console.log('Ticketmaster settings saved to backend:', data);
        } else {
          throw new Error(data.error || 'Failed to save settings');
        }
      } else {
        throw new Error('Failed to save settings to backend');
      }
    } catch (error) {
      console.error('Error saving Ticketmaster settings:', error);
      toast({
        title: "Error Saving Settings",
        description: "Failed to save Ticketmaster API settings to backend.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnectTicketmaster = async () => {
    setIsDisconnecting(true);
    try {
      console.log('Disconnecting Ticketmaster API...');
      
      const response = await fetch('/api/integrations/ticketmaster/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: false }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTicketmasterSettings(prev => ({ ...prev, enabled: false }));
          toast({
            title: "Ticketmaster API Disconnected",
            description: "The Ticketmaster API integration has been successfully disconnected.",
          });
          console.log('Ticketmaster API disconnected successfully:', data);
        } else {
          throw new Error(data.error || 'Failed to disconnect');
        }
      } else {
        throw new Error('Failed to disconnect from backend');
      }
    } catch (error) {
      console.error('Error disconnecting Ticketmaster API:', error);
      toast({
        title: "Error Disconnecting",
        description: "Failed to disconnect Ticketmaster API integration.",
        variant: "destructive",
      });
    }
    setIsDisconnecting(false);
  };

  const handleConnectTicketmaster = async () => {
    try {
      console.log('Connecting Ticketmaster API...');
      
      const response = await fetch('/api/integrations/ticketmaster/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: true }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTicketmasterSettings(prev => ({ ...prev, enabled: true }));
          toast({
            title: "Ticketmaster API Connected",
            description: "The Ticketmaster API integration has been successfully connected.",
          });
          console.log('Ticketmaster API connected successfully:', data);
        } else {
          throw new Error(data.error || 'Failed to connect');
        }
      } else {
        throw new Error('Failed to connect to backend');
      }
    } catch (error) {
      console.error('Error connecting Ticketmaster API:', error);
      toast({
        title: "Error Connecting",
        description: "Failed to connect Ticketmaster API integration.",
        variant: "destructive",
      });
    }
  };

  const openTicketmasterDocs = () => {
    window.open('https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/', '_blank');
  };

  const openTicketmasterAPI = () => {
    window.open('https://app.ticketmaster.com/discovery/v2/', '_blank');
  };

  const integrations = [
    {
      id: 1,
      name: "Ticketmaster API",
      status: ticketmasterSettings.enabled ? "connected" : "disconnected",
      lastSync: "2 minutes ago",
      rateLimit: "1,847 / 2,000",
      icon: LinkIcon,
      color: ticketmasterSettings.enabled ? "from-emerald-500 to-teal-600" : "from-rose-500 to-pink-600",
      description: "Event data and ticket information",
      endpoint: "api.ticketmasterapi.com",
      dataFlow: "Real-time"
    },
    {
      id: 2,
      name: "Google Services",
      status: "connected", 
      lastSync: "5 minutes ago",
      rateLimit: "245 / 1,000",
      icon: Activity,
      color: "from-blue-500 to-indigo-600",
      description: "Analytics and location services",
      endpoint: "api.google.com",
      dataFlow: "Real-time"
    },
    {
      id: 3,
      name: "Pricing System",
      status: config?.pricingSystemConnected ? "connected" : "disconnected",
      lastSync: "Never",
      rateLimit: "N/A",
      icon: DollarSign,
      color: config?.pricingSystemConnected ? "from-emerald-500 to-teal-600" : "from-rose-500 to-pink-600",
      description: "Dynamic pricing and revenue management",
      endpoint: "api.pricing.com",
      dataFlow: "On-demand"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-full mx-auto px-6 lg:px-8 py-8">
        {/* Enhanced Page Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-8 mb-10">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/25">
              <LinkIcon className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent leading-tight">
                Integration
              </h1>
              <p className="text-2xl text-slate-600 mt-4 font-medium">
                Pricing Systems & External APIs
              </p>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-xl border border-indigo-100/50">
              <div className={`w-4 h-4 rounded-full animate-pulse ${
                backendStatus === 'connected' ? 'bg-emerald-500' : 
                backendStatus === 'checking' ? 'bg-amber-500' : 'bg-red-500'
              }`}></div>
              <span className="text-lg font-bold text-slate-800">
                {backendStatus === 'connected' ? 'Backend Connected' : 
                 backendStatus === 'checking' ? 'Checking Backend...' : 'Backend Disconnected'}
              </span>
            </div>
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-xl border border-purple-100/50">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="text-lg font-bold text-slate-800">Last sync: 2 min ago</span>
            </div>
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-xl border border-pink-100/50">
              <Globe className="w-5 h-5 text-pink-600" />
              <span className="text-lg font-bold text-slate-800">API Health: 95%</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Badge className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-600 text-white px-6 py-3 text-base font-bold shadow-xl border border-white/20">
              <Sparkles className="w-5 h-5 mr-3" />
              System Integrations
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="border-2 border-indigo-200 hover:border-indigo-300 text-indigo-700 px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-3" />
              Add Integration
            </Button>
            <Button
              onClick={handleSync}
              disabled={syncing}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <RefreshCw className={`w-5 h-5 mr-3 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Refreshing...' : 'Refresh All'}
            </Button>
          </div>
        </div>

        {/* Integration Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden group hover:scale-105 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold">
                  Active
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">3</h3>
              <p className="text-slate-600">Connected APIs</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden group hover:scale-105 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold">
                  Inactive
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">1</h3>
              <p className="text-slate-600">Disconnected APIs</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden group hover:scale-105 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold">
                  95%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">95%</h3>
              <p className="text-slate-600">Uptime</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden group hover:scale-105 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold">
                  2 min
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">2 min</h3>
              <p className="text-slate-600">Last Sync</p>
            </CardContent>
          </Card>
        </div>

        {/* Integration Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {integrations.map((integration) => (
            <Card key={integration.name} className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden group hover:scale-[1.02] transition-all duration-500">
              <CardHeader className="p-8 pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${integration.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <integration.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-slate-900">{integration.name}</CardTitle>
                      <p className="text-slate-600">{integration.description}</p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(integration.status)} font-bold shadow-lg`}>
                    {getStatusIcon(integration.status)}
                    <span className="ml-2">{integration.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="space-y-6">
                  {/* Status Details */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl border border-slate-100/50">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-slate-600" />
                      <span className="font-bold text-slate-900">Last Sync</span>
                    </div>
                    <span className="text-slate-600">{integration.lastSync}</span>
                  </div>

                  {/* Connection Details */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-blue-600" />
                      <span className="font-bold text-slate-900">API Endpoint</span>
                    </div>
                    <span className="text-slate-600">{integration.endpoint}</span>
                  </div>

                  {/* Data Flow */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100/50">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-emerald-600" />
                      <span className="font-bold text-slate-900">Data Flow</span>
                    </div>
                    <span className="text-slate-600">{integration.dataFlow}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-4">
                    <Button
                      onClick={() => {
                        if (integration.id === 1) { // Ticketmaster API
                          if (integration.status === 'connected') {
                            handleDisconnectTicketmaster();
                          } else {
                            handleConnectTicketmaster();
                          }
                        } else {
                          handleToggleIntegration(integration.id);
                        }
                      }}
                      disabled={integration.id === 1 && isDisconnecting}
                      variant={integration.status === 'connected' ? "outline" : "default"}
                      className={`flex-1 font-bold transition-all duration-300 transform hover:scale-105 ${
                        integration.status === 'connected'
                          ? "border-2 border-red-200 hover:border-red-300 text-red-700 hover:bg-red-50"
                          : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                      }`}
                    >
                      {integration.id === 1 && isDisconnecting ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Disconnecting...
                        </>
                      ) : integration.status === 'connected' ? (
                        <>
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Disconnect
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Connect
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        if (integration.id === 1) { // Ticketmaster API
                          setShowTicketmasterSettings(true);
                        }
                      }}
                      variant="outline"
                      className="w-12 h-12 p-0 border-2 border-slate-200 hover:border-slate-300 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Settings className="w-5 h-5 text-slate-600" />
                    </Button>
                    
                    <Button
                      onClick={() => {
                        if (integration.id === 1) { // Ticketmaster API
                          openTicketmasterAPI();
                        }
                      }}
                      variant="outline"
                      className="w-12 h-12 p-0 border-2 border-slate-200 hover:border-slate-300 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <ExternalLink className="w-5 h-5 text-slate-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* API Documentation */}
        <div className="mt-12">
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="p-8 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Key className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900">API Documentation</CardTitle>
                  <p className="text-slate-600">Integration guides and technical specifications</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50">
                  <h4 className="font-bold text-slate-900 mb-2">Ticketmaster API</h4>
                  <p className="text-sm text-slate-600 mb-3">Event discovery and ticketing integration</p>
                  <Button variant="outline" size="sm" className="w-full" onClick={openTicketmasterDocs}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Docs
                  </Button>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100/50">
                  <h4 className="font-bold text-slate-900 mb-2">Hotel Management</h4>
                  <p className="text-sm text-slate-600 mb-3">Room availability and pricing sync</p>
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Docs
                  </Button>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100/50">
                  <h4 className="font-bold text-slate-900 mb-2">Revenue Management</h4>
                  <p className="text-sm text-slate-600 mb-3">Dynamic pricing and yield optimization</p>
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Docs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ticketmaster API Settings Modal */}
        <Dialog open={showTicketmasterSettings} onOpenChange={setShowTicketmasterSettings}>
          <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl">
            <DialogHeader className="pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <LinkIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-slate-900">Ticketmaster API Settings</DialogTitle>
                  <p className="text-slate-600">Configure your Ticketmaster API integration</p>
                </div>
              </div>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="text-sm font-bold text-slate-700">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={ticketmasterSettings.apiKey}
                    onChange={(e) => setTicketmasterSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="Enter your Ticketmaster API key"
                    className="h-12 bg-white/80 backdrop-blur-sm border-slate-200 hover:border-emerald-300 focus:border-emerald-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="baseUrl" className="text-sm font-bold text-slate-700">Base URL</Label>
                  <Input
                    id="baseUrl"
                    value={ticketmasterSettings.baseUrl}
                    onChange={(e) => setTicketmasterSettings(prev => ({ ...prev, baseUrl: e.target.value }))}
                    placeholder="https://app.ticketmaster.com/discovery/v2/"
                    className="h-12 bg-white/80 backdrop-blur-sm border-slate-200 hover:border-emerald-300 focus:border-emerald-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rateLimit" className="text-sm font-bold text-slate-700">Rate Limit (requests/day)</Label>
                  <Input
                    id="rateLimit"
                    type="number"
                    value={ticketmasterSettings.rateLimit}
                    onChange={(e) => setTicketmasterSettings(prev => ({ ...prev, rateLimit: parseInt(e.target.value) }))}
                    className="h-12 bg-white/80 backdrop-blur-sm border-slate-200 hover:border-emerald-300 focus:border-emerald-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="syncInterval" className="text-sm font-bold text-slate-700">Sync Interval (hours)</Label>
                  <Input
                    id="syncInterval"
                    type="number"
                    value={ticketmasterSettings.syncInterval}
                    onChange={(e) => setTicketmasterSettings(prev => ({ ...prev, syncInterval: parseInt(e.target.value) }))}
                    className="h-12 bg-white/80 backdrop-blur-sm border-slate-200 hover:border-emerald-300 focus:border-emerald-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100/50">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={ticketmasterSettings.enabled}
                    onCheckedChange={(checked) => setTicketmasterSettings(prev => ({ ...prev, enabled: checked }))}
                  />
                  <div>
                    <p className="font-bold text-slate-900">Enable Integration</p>
                    <p className="text-sm text-slate-600">Allow data synchronization with Ticketmaster API</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 pt-6">
                <Button
                  onClick={saveTicketmasterSettings}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Save className="w-5 h-5 mr-3" />
                  Save Settings
                </Button>
                
                <Button
                  onClick={() => setShowTicketmasterSettings(false)}
                  variant="outline"
                  className="border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <X className="w-5 h-5 mr-3" />
                  Cancel
                </Button>
                
                <Button
                  onClick={openTicketmasterDocs}
                  variant="outline"
                  className="border-2 border-blue-200 hover:border-blue-300 text-blue-700 px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <ExternalLink className="w-5 h-5 mr-3" />
                  View Documentation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}