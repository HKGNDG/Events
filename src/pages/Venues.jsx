import React, { useState, useEffect } from "react";
import { Venue } from "@/api/entities";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Building2 as BuildingIcon,
  Users,
  Star,
  ExternalLink,
  Calendar,
  TrendingUp,
  Filter,
  Sparkles,
  Zap,
  Target,
  Clock,
  AlertCircle,
  Globe,
  Phone,
  RefreshCw
} from "lucide-react";

import { useToast } from "@/components/ui/use-toast";
import { haversineDistance } from "@/utils/geoUtils";

// Venue data with official links
const VENUE_LINKS = {
  "Nissan Stadium": "https://nissanstadium.com/",
  "Bridgestone Arena": "https://www.bridgestonearena.com/",
  "Ryman Auditorium": "https://www.ryman.com/",
  "Grand Ole Opry House": "https://www.opry.com/",
  "Geodis Park": "https://www.nashvillesc.com/geodis-park",
  "Music City Center": "https://www.musiccitycenter.com/",
  "Gaylord Opryland Resort & Conv. Ctr.": "https://www.marriott.com/en-us/hotels/bnaol-gaylord-opryland-resort-and-convention-center/",
  "Nashville Municipal Auditorium": "https://municipalauditorium.com/",
  "Ascend Amphitheater": "https://www.ascendamphitheater.com/",
  "Schermerhorn Symphony Center": "https://www.nashvillesymphony.org/scherm/",
  "War Memorial Auditorium": "https://www.warmemorialauditorium.com/",
  "Andrew Jackson Hall (TPAC)": "https://www.tpac.org/",
  "James K. Polk Theater (TPAC)": "https://www.tpac.org/",
  "Johnson Theater (TPAC)": "https://www.tpac.org/",
  "Marathon Music Works": "https://www.marathonmusicworks.com/",
  "The Station Inn": "https://www.stationinn.com/",
  "Exit/In": "https://www.exitin.com/",
  "The Bluebird Café": "https://www.bluebirdcafe.com/",
  "The Basement": "https://www.thebasementnashville.com/",
  "Basement East": "https://www.basementeast.com/",
  "Wildhorse Saloon": "https://www.wildhorsesaloon.com/",
  "Brooklyn Bowl Nashville": "https://www.brooklynbowlnashville.com/",
  "3rd & Lindsley": "https://www.3rdandlindsley.com/"
};

const HOTEL_LAT = 36.1527289;
const HOTEL_LON = -86.7890460;

const VENUE_SIZES = [50, 100, 200, 500];

// Helper to display capacity
function getDisplayCapacity(capacity) {
  return (typeof capacity === 'number' && !isNaN(capacity) && capacity > 0)
    ? capacity.toLocaleString()
    : 'Not specified';
}

// Helper to display upcoming events count
function getUpcomingEventsCount(upcoming) {
  if (upcoming && typeof upcoming === 'object' && typeof upcoming._total === 'number') {
    return upcoming._total;
  }
  if (typeof upcoming === 'number') {
    return upcoming;
  }
  return 0;
}

export default function Venues() {
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();
  const [venueLimit, setVenueLimit] = useState(200); // default to 200
  const [currentPage, setCurrentPage] = useState(1);
  const [venuesPerPage] = useState(20);

  useEffect(() => {
    loadVenues();
  }, [venueLimit]);

  useEffect(() => {
    if (!Array.isArray(venues)) {
      setFilteredVenues([]);
      return;
    }
    
    if (searchTerm) {
      setFilteredVenues(
        venues.filter(venue =>
          venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          venue.address.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredVenues(venues);
    }
    setCurrentPage(1); // Reset to first page when search changes
  }, [venues, searchTerm]);

  const loadVenues = async () => {
    setIsLoading(true);
    try {
      const venuesData = await Venue.list(36.1656, -86.7781, 10, 'miles', venueLimit);
      const venuesArray = Array.isArray(venuesData) ? venuesData : [];
      setVenues(venuesArray);
      setFilteredVenues(venuesArray); // Initialize filtered venues with all data
    } catch (error) {
      console.error("Error loading venues:", error);
      setVenues([]);
      setFilteredVenues([]);
      toast({
        title: "Error Loading Venues",
        description: "Failed to load venues. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleViewDetails = (venue) => {
    setSelectedVenue(venue);
    setShowModal(true);
  };

  const handleVisitWebsite = (venueName) => {
    const url = VENUE_LINKS[venueName];
    if (url) {
      window.open(url, '_blank');
    } else {
      toast({
        title: "Website Not Available",
        description: `Official website for ${venueName} is not available.`,
        variant: "destructive",
      });
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'MEGA': return "bg-gradient-to-r from-purple-500 via-pink-500 to-rose-600 text-white shadow-xl shadow-purple-500/25";
      case 'LARGE': return "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-xl shadow-blue-500/25";
      case 'MEDIUM': return "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white shadow-xl shadow-emerald-500/25";
      case 'SMALL': return "bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white shadow-xl shadow-amber-500/25";
      default: return "bg-gradient-to-r from-slate-500 via-gray-500 to-zinc-600 text-white shadow-xl shadow-slate-500/25";
    }
  };

  const getActivityColor = (activity) => {
    switch (activity) {
      case 'HIGH': return "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white shadow-xl shadow-emerald-500/25";
      case 'MEDIUM': return "bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white shadow-xl shadow-amber-500/25";
      case 'LOW': return "bg-gradient-to-r from-slate-500 via-gray-500 to-zinc-600 text-white shadow-xl shadow-slate-500/25";
      default: return "bg-gradient-to-r from-slate-500 via-gray-500 to-zinc-600 text-white shadow-xl shadow-slate-500/25";
    }
  };

  // Pagination logic
  const indexOfLastVenue = currentPage * venuesPerPage;
  const indexOfFirstVenue = indexOfLastVenue - venuesPerPage;
  const currentVenues = filteredVenues.slice(indexOfFirstVenue, indexOfLastVenue);
  const totalPages = Math.ceil(filteredVenues.length / venuesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-full mx-auto px-6 lg:px-8 py-8">
        {/* Enhanced Page Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-8 mb-10">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/25">
              <BuildingIcon className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent leading-tight">
                Venues
              </h1>
              <p className="text-2xl text-slate-600 mt-4 font-medium">
                Venue Management & Analytics
              </p>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-xl border border-emerald-100/50">
              <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-bold text-slate-800">Live Venues</span>
            </div>
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-xl border border-teal-100/50">
              <Clock className="w-5 h-5 text-teal-600" />
              <span className="text-lg font-bold text-slate-800">Real-time Data</span>
            </div>
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-xl border border-cyan-100/50">
              <MapPin className="w-5 h-5 text-cyan-600" />
              <span className="text-lg font-bold text-slate-800">Nashville Area</span>
            </div>
          </div>
        </div>

        {/* Venue Limit Dropdown */}
        <div className="flex items-center gap-6 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search venues, capacity, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-4 text-lg bg-white/90 backdrop-blur-sm border-slate-200 hover:border-emerald-300 focus:border-emerald-500 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            />
          </div>
          <div>
            <label htmlFor="venue-limit" className="mr-2 font-bold text-slate-700">Show</label>
            <select
              id="venue-limit"
              value={venueLimit}
              onChange={e => setVenueLimit(Number(e.target.value))}
              className="px-4 py-2 rounded-lg border border-emerald-200 bg-white text-emerald-700 font-bold shadow-md"
            >
              {VENUE_SIZES.map(size => (
                <option key={size} value={size}>{size} venues</option>
              ))}
            </select>
          </div>
          <Button
            onClick={loadVenues}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <RefreshCw className="w-5 h-5 mr-3" />
            Refresh
          </Button>
        </div>

        {/* Venues Count */}
        <div className="mb-8">
          <Badge className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white px-6 py-3 text-base font-bold shadow-xl border border-white/20">
            <Sparkles className="w-5 h-5 mr-3" />
            Showing {filteredVenues.length} of {venues.length} venues
          </Badge>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-spin">
                <RefreshCw className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Loading Venues</h3>
              <p className="text-slate-600">Fetching venue data from Nashville...</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-xl rounded-3xl overflow-hidden animate-pulse">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-6 bg-slate-200 rounded"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="space-y-3">
                      <div className="h-12 bg-slate-200 rounded-xl"></div>
                      <div className="h-12 bg-slate-200 rounded-xl"></div>
                      <div className="h-12 bg-slate-200 rounded-xl"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Venues Grid */}
        {!isLoading && filteredVenues.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {currentVenues.map((venue) => (
              <Card key={venue.id} className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-slate-100 overflow-hidden">
                {/* Venue Image - Always show image area for consistent layout */}
                <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                  {venue.image_url ? (
                    <>
                      <img 
                        src={venue.image_url} 
                        alt={venue.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center" style={{display: 'none'}}>
                        <BuildingIcon className="w-16 h-16 text-slate-400" />
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden">
                      {/* Animated background pattern */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-4 left-4 w-8 h-8 bg-emerald-400 rounded-full animate-pulse"></div>
                        <div className="absolute top-12 right-8 w-6 h-6 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                        <div className="absolute bottom-8 left-8 w-4 h-4 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                        <div className="absolute bottom-16 right-4 w-10 h-10 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
                      </div>
                      
                      {/* Main icon with glow effect */}
                      <div className="relative z-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 animate-pulse">
                          <BuildingIcon className="w-10 h-10 text-white" />
                        </div>
                        <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                      </div>
                      
                      {/* Floating elements */}
                      <div className="absolute top-6 left-6 w-3 h-3 bg-emerald-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="absolute top-8 right-6 w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                      <div className="absolute bottom-6 left-6 w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{animationDelay: '0.6s'}}></div>
                      <div className="absolute bottom-8 right-6 w-3 h-3 bg-cyan-300 rounded-full animate-bounce" style={{animationDelay: '0.8s'}}></div>
                    </div>
                  )}
                </div>

                {/* Action Icons */}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0 bg-white/80 hover:bg-white rounded-full shadow-lg">
                    <Star className="w-4 h-4 text-yellow-500" />
                  </Button>
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0 bg-white/80 hover:bg-white rounded-full shadow-lg">
                    <span className="text-slate-400">−</span>
                  </Button>
                </div>

                <CardContent className="p-6 space-y-4">
                  {/* Venue Name */}
                  <h3 className="text-xl font-bold text-slate-900">
                    {venue.name}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100/50">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-sm">{venue.address || '—'}</p>
                      <p className="text-slate-600 text-xs">{venue.distance_from_search ? `${venue.distance_from_search.toFixed(2)} miles from search point` : ''}</p>
                    </div>
                  </div>

                  {/* Quick Stats Row */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Capacity */}
                    <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100/50">
                      <Users className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="font-bold text-slate-900 text-xs">Capacity</p>
                        <p className="text-slate-600 text-xs">{getDisplayCapacity(venue.capacity)}</p>
                      </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100/50">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-bold text-slate-900 text-xs">Events</p>
                        <p className="text-slate-600 text-xs">{getUpcomingEventsCount(venue.upcoming_events_count)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Venue Type */}
                  {venue.venue_type && (
                    <div className="flex items-center gap-2">
                      <BuildingIcon className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-600 text-sm">{venue.venue_type}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      onClick={() => handleViewDetails(venue)}
                      className="flex-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    {VENUE_LINKS[venue.name] && (
                      <Button
                        onClick={() => handleVisitWebsite(venue.name)}
                        variant="outline"
                        className="w-12 h-12 p-0 border-2 border-emerald-200 hover:border-emerald-300 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <Globe className="w-5 h-5 text-emerald-600" />
                      </Button>
                    )}
                  </div>
                </CardContent>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl"></div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              <Button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-xl shadow-lg transition-all duration-300 ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </Button>
            </div>
          )}

          {/* Page Info */}
          <div className="text-center mt-6">
            <p className="text-slate-600">
              Showing {indexOfFirstVenue + 1}-{Math.min(indexOfLastVenue, filteredVenues.length)} of {filteredVenues.length} venues
            </p>
          </div>
        </>
        )}

        {/* Empty State */}
        {!isLoading && filteredVenues.length === 0 && (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertCircle className="w-16 h-16 text-slate-400" />
            </div>
            <h3 className="text-3xl font-bold text-slate-800 mb-4">No Venues Found</h3>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Try adjusting your search terms to find venues in the Nashville area.
            </p>
                         <Button
               onClick={() => setSearchTerm('')}
               className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
             >
              <Filter className="w-5 h-5 mr-3" />
              Clear Search
            </Button>
          </div>
        )}

        {/* Venue Details Modal */}
        {showModal && selectedVenue && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="relative p-8">
                <Button
                  onClick={() => setShowModal(false)}
                  className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-700 rounded-full w-12 h-12 p-0 shadow-xl"
                >
                  ×
                </Button>
                
                <div className="space-y-8">
                  {/* Header with Image */}
                  <div className="text-center">
                    {selectedVenue.image_url && (
                      <div className="mb-6">
                        <img 
                          src={selectedVenue.image_url} 
                          alt={selectedVenue.name}
                          className="w-full max-w-md mx-auto h-64 object-cover rounded-2xl shadow-xl"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <h2 className="text-4xl font-bold text-slate-900 mb-2">{selectedVenue.name}</h2>
                    <p className="text-xl text-slate-600">{selectedVenue.venue_type}</p>
                    {selectedVenue.url && (
                      <a href={selectedVenue.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-2 text-emerald-600 hover:underline">
                        <ExternalLink className="w-4 h-4" />
                        Visit Official Website
                      </a>
                    )}
                  </div>

                  {/* Venue Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl">
                        <MapPin className="w-6 h-6 text-emerald-600" />
                        <div>
                          <p className="font-bold text-slate-900">{selectedVenue.address}</p>
                          <p className="text-slate-600">{selectedVenue.distance_from_search ? `${selectedVenue.distance_from_search.toFixed(2)} miles from search point` : ''}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                        <Users className="w-6 h-6 text-purple-600" />
                        <div>
                          <p className="font-bold text-slate-900">Capacity: {getDisplayCapacity(selectedVenue.capacity)}</p>
                          <p className="text-slate-600">Venue type: {selectedVenue.venue_type || 'Other'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
                        <Calendar className="w-6 h-6 text-blue-600" />
                        <div>
                          <p className="font-bold text-slate-900">
                            {getUpcomingEventsCount(selectedVenue.upcoming_events_count)} upcoming events
                          </p>
                          <p className="text-slate-600">Event activity</p>
                        </div>
                      </div>

                      {/* Contact Information */}
                      {selectedVenue.contact_phone && (
                        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl">
                          <Phone className="w-6 h-6 text-amber-600" />
                          <div>
                            <p className="font-bold text-slate-900">Contact: {selectedVenue.contact_phone}</p>
                            <p className="text-slate-600">Box office information</p>
                          </div>
                        </div>
                      )}

                      {/* Box Office Hours */}
                      {selectedVenue.box_office_hours && (
                        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
                          <Clock className="w-6 h-6 text-green-600" />
                          <div>
                            <p className="font-bold text-slate-900">Box Office Hours</p>
                            <p className="text-slate-600 text-sm">{selectedVenue.box_office_hours}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl">
                        <Target className="w-6 h-6 text-indigo-600" />
                        <div>
                          <p className="font-bold text-slate-900">Coordinates</p>
                          <p className="text-slate-600">{selectedVenue.coordinates || 'Not available'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl">
                        <MapPin className="w-6 h-6 text-slate-600" />
                        <div>
                          <p className="font-bold text-slate-900">Venue ID</p>
                          <p className="text-slate-600">{selectedVenue.id || 'Not available'}</p>
                        </div>
                      </div>

                      {/* Parking Information */}
                      {selectedVenue.parking_info && (
                        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
                          <BuildingIcon className="w-6 h-6 text-blue-600" />
                          <div>
                            <p className="font-bold text-slate-900">Parking Information</p>
                            <p className="text-slate-600 text-sm">{selectedVenue.parking_info}</p>
                          </div>
                        </div>
                      )}

                      {/* Accessibility Information */}
                      {selectedVenue.accessibility_info && (
                        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                          <Users className="w-6 h-6 text-purple-600" />
                          <div>
                            <p className="font-bold text-slate-900">Accessibility</p>
                            <p className="text-slate-600 text-sm">{selectedVenue.accessibility_info}</p>
                          </div>
                        </div>
                      )}

                      {/* Accepted Payment Methods */}
                      {selectedVenue.accepted_payment && (
                        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
                          <Globe className="w-6 h-6 text-green-600" />
                          <div>
                            <p className="font-bold text-slate-900">Accepted Payment</p>
                            <p className="text-slate-600 text-sm">{selectedVenue.accepted_payment}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Information */}
                  {(selectedVenue.general_rules || selectedVenue.child_policy || selectedVenue.will_call_info) && (
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-slate-900">Additional Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedVenue.general_rules && (
                          <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl">
                            <h4 className="font-bold text-slate-900 mb-2">General Rules</h4>
                            <p className="text-slate-600 text-sm">{selectedVenue.general_rules}</p>
                          </div>
                        )}
                        {selectedVenue.child_policy && (
                          <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl">
                            <h4 className="font-bold text-slate-900 mb-2">Child Policy</h4>
                            <p className="text-slate-600 text-sm">{selectedVenue.child_policy}</p>
                          </div>
                        )}
                        {selectedVenue.will_call_info && (
                          <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl">
                            <h4 className="font-bold text-slate-900 mb-2">Will Call Information</h4>
                            <p className="text-slate-600 text-sm">{selectedVenue.will_call_info}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Social Media */}
                  {selectedVenue.twitter_handle && (
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">Social Media</h3>
                      <a 
                        href={`https://twitter.com/${selectedVenue.twitter_handle.replace('@','')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors duration-300"
                      >
                        <span>Follow on Twitter</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-4 pt-6">
                    {VENUE_LINKS[selectedVenue.name] && (
                      <Button
                        onClick={() => handleVisitWebsite(selectedVenue.name)}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <Globe className="w-5 h-5 mr-3" />
                        Visit Official Website
                      </Button>
                    )}
                    {selectedVenue.contact_phone && (
                      <Button
                        variant="outline"
                        className="px-8 py-4 border-2 border-emerald-200 hover:border-emerald-300 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        onClick={() => window.open(`tel:${selectedVenue.contact_phone}`)}
                      >
                        <Phone className="w-5 h-5 mr-3" />
                        Call Venue
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
