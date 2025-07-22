import React, { useState, useEffect } from "react";
import { HotelConfig } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Hotel,
  MapPin,
  Settings as SettingsIcon,
  Database,
  Shield,
  Save,
  Clock,
  Sparkles,
  RefreshCw,
  Building2,
  Globe,
  Bell,
  Zap,
  Target,
  Users,
  Mail,
  Key
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Settings() {
  const [configs, setConfigs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingConfig, setEditingConfig] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    hotelName: "",
    hotelAddress: "",
    hotelCoordinates: "",
    defaultSearchRadius: 10,
    notificationEmail: "",
    highImpactThreshold: 75,
    criticalImpactThreshold: 90,
    syncFrequencyHours: 6,
    pricingSystemConnected: false
  });

  useEffect(() => {
    loadConfigs();
    checkBackendStatus();
  }, []);

  const loadConfigs = async () => {
    setIsLoading(true);
    try {
      const configsData = await HotelConfig.list();
      console.log('Loaded configs from backend:', configsData);
      const configsArray = Array.isArray(configsData) ? configsData : [];
      setConfigs(configsArray);
      if (configsArray.length > 0) {
        const config = configsArray[0];
        setFormData({
          hotelName: config.hotelName || "",
          hotelAddress: config.hotelAddress || "",
          hotelCoordinates: config.hotelCoordinates || "",
          defaultSearchRadius: config.defaultSearchRadius || 10,
          notificationEmail: config.notificationEmail || "",
          highImpactThreshold: config.highImpactThreshold || 75,
          criticalImpactThreshold: config.criticalImpactThreshold || 90,
          syncFrequencyHours: config.syncFrequencyHours || 6,
          pricingSystemConnected: config.pricingSystemConnected || false
        });
        setEditingConfig(config);
      }
    } catch (error) {
      console.error('Error loading configs:', error);
      setConfigs([]);
      toast({
        title: "Error Loading Settings",
        description: "Failed to load configuration settings from backend.",
        variant: "destructive",
      });
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const configToSave = {
        ...formData,
        id: editingConfig?.id
      };
      
      console.log('Saving config to backend:', configToSave);
      
      if (editingConfig) {
        const updatedConfig = await HotelConfig.update(editingConfig.id, configToSave);
        console.log('Config updated successfully:', updatedConfig);
        toast({
          title: "Settings Updated",
          description: "Configuration has been successfully updated in the backend.",
        });
      } else {
        const newConfig = await HotelConfig.create(configToSave);
        console.log('Config created successfully:', newConfig);
        toast({
          title: "Settings Created",
          description: "New configuration has been created in the backend.",
        });
      }
      await loadConfigs();
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Error Saving Settings",
        description: "Failed to save configuration settings to backend.",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-full mx-auto px-6 lg:px-8 py-8">
        {/* Enhanced Page Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-8 mb-10">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-500 via-gray-500 to-zinc-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-slate-500/25">
              <SettingsIcon className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-slate-900 via-gray-900 to-zinc-900 bg-clip-text text-transparent leading-tight">
                Settings
              </h1>
              <p className="text-2xl text-slate-600 mt-4 font-medium">
                Configuration & Preferences
              </p>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-xl border border-slate-100/50">
              <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-bold text-slate-800">System Active</span>
            </div>
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-xl border border-gray-100/50">
              <Clock className="w-5 h-5 text-gray-600" />
              <span className="text-lg font-bold text-slate-800">Last sync: 2 min ago</span>
            </div>
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-xl border border-zinc-100/50">
              <MapPin className="w-5 h-5 text-zinc-600" />
              <span className="text-lg font-bold text-slate-800">Nashville Area</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Badge className="bg-gradient-to-r from-slate-500 via-gray-500 to-zinc-600 text-white px-6 py-3 text-base font-bold shadow-xl border border-white/20">
              <Sparkles className="w-5 h-5 mr-3" />
              System Configuration
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={loadConfigs}
              disabled={isLoading}
              variant="outline"
              className="border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <RefreshCw className={`w-5 h-5 mr-3 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Save className="w-5 h-5 mr-3" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hotel Configuration */}
          <Card className="lg:col-span-2 bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="p-8 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                     <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900">Hotel Configuration</CardTitle>
                  <p className="text-slate-600">Basic hotel information and settings</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="hotelName" className="text-sm font-bold text-slate-700">Hotel Name</Label>
                  <Input
                    id="hotelName"
                    value={formData.hotelName}
                    onChange={(e) => handleInputChange('hotelName', e.target.value)}
                    placeholder="Enter hotel name"
                    className="h-12 bg-white/80 backdrop-blur-sm border-slate-200 hover:border-blue-300 focus:border-blue-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hotelAddress" className="text-sm font-bold text-slate-700">Hotel Address</Label>
                  <Input
                    id="hotelAddress"
                    value={formData.hotelAddress}
                    onChange={(e) => handleInputChange('hotelAddress', e.target.value)}
                    placeholder="Enter hotel address"
                    className="h-12 bg-white/80 backdrop-blur-sm border-slate-200 hover:border-blue-300 focus:border-blue-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hotelCoordinates" className="text-sm font-bold text-slate-700">Coordinates</Label>
                  <Input
                    id="hotelCoordinates"
                    value={formData.hotelCoordinates}
                    onChange={(e) => handleInputChange('hotelCoordinates', e.target.value)}
                    placeholder="36.1656,-86.7781"
                    className="h-12 bg-white/80 backdrop-blur-sm border-slate-200 hover:border-blue-300 focus:border-blue-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="searchRadius" className="text-sm font-bold text-slate-700">Search Radius (miles)</Label>
                  <Input
                    id="searchRadius"
                    type="number"
                    value={formData.defaultSearchRadius}
                    onChange={(e) => handleInputChange('defaultSearchRadius', parseInt(e.target.value))}
                    className="h-12 bg-white/80 backdrop-blur-sm border-slate-200 hover:border-blue-300 focus:border-blue-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="p-8 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900">System Status</CardTitle>
                  <p className="text-slate-600">Current system health</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${
                      backendStatus === 'connected' ? 'bg-emerald-500' : 
                      backendStatus === 'checking' ? 'bg-amber-500' : 'bg-red-500'
                    }`}></div>
                    <span className="font-bold text-slate-900">API Status</span>
                  </div>
                  <Badge className={`font-bold ${
                    backendStatus === 'connected' 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' 
                      : backendStatus === 'checking'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                      : 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                  }`}>
                    {backendStatus === 'connected' ? 'Online' : 
                     backendStatus === 'checking' ? 'Checking...' : 'Offline'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-slate-900">Database</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold">
                    Connected
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100/50">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-purple-600" />
                    <span className="font-bold text-slate-900">External APIs</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold">
                    Active
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100/50">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <span className="font-bold text-slate-900">Last Sync</span>
                  </div>
                  <span className="text-sm text-slate-600">2 min ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Notification Settings */}
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="p-8 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900">Notifications</CardTitle>
                  <p className="text-slate-600">Alert and notification preferences</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="notificationEmail" className="text-sm font-bold text-slate-700">Notification Email</Label>
                  <Input
                    id="notificationEmail"
                    type="email"
                    value={formData.notificationEmail}
                    onChange={(e) => handleInputChange('notificationEmail', e.target.value)}
                    placeholder="manager@hotel.com"
                    className="h-12 bg-white/80 backdrop-blur-sm border-slate-200 hover:border-purple-300 focus:border-purple-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="highImpactThreshold" className="text-sm font-bold text-slate-700">High Impact Threshold</Label>
                  <Input
                    id="highImpactThreshold"
                    type="number"
                    value={formData.highImpactThreshold}
                    onChange={(e) => handleInputChange('highImpactThreshold', parseInt(e.target.value))}
                    className="h-12 bg-white/80 backdrop-blur-sm border-slate-200 hover:border-purple-300 focus:border-purple-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="criticalImpactThreshold" className="text-sm font-bold text-slate-700">Critical Impact Threshold</Label>
                  <Input
                    id="criticalImpactThreshold"
                    type="number"
                    value={formData.criticalImpactThreshold}
                    onChange={(e) => handleInputChange('criticalImpactThreshold', parseInt(e.target.value))}
                    className="h-12 bg-white/80 backdrop-blur-sm border-slate-200 hover:border-purple-300 focus:border-purple-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="syncFrequency" className="text-sm font-bold text-slate-700">Sync Frequency (hours)</Label>
                  <Input
                    id="syncFrequency"
                    type="number"
                    value={formData.syncFrequencyHours}
                    onChange={(e) => handleInputChange('syncFrequencyHours', parseInt(e.target.value))}
                    className="h-12 bg-white/80 backdrop-blur-sm border-slate-200 hover:border-purple-300 focus:border-purple-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integration Settings */}
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="p-8 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900">Integrations</CardTitle>
                  <p className="text-slate-600">External system connections</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100/50">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-bold text-slate-900">Pricing System</p>
                      <p className="text-sm text-slate-600">Connect to hotel pricing system</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.pricingSystemConnected}
                    onCheckedChange={(checked) => handleInputChange('pricingSystemConnected', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-bold text-slate-900">Staff Portal</p>
                      <p className="text-sm text-slate-600">Enable staff access</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100/50">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-bold text-slate-900">Email Alerts</p>
                      <p className="text-sm text-slate-600">Send email notifications</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100/50">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-bold text-slate-900">API Access</p>
                      <p className="text-sm text-slate-600">Enable API endpoints</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}