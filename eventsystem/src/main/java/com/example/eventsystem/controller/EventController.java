package com.example.eventsystem.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.eventsystem.service.TicketmasterService;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import com.example.eventsystem.model.EventResponse;
import com.example.eventsystem.model.HotelConfig;
import com.example.eventsystem.service.ImageProcessingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class EventController {
    private static final Logger logger = LoggerFactory.getLogger(EventController.class);

    @Autowired
    private TicketmasterService ticketmasterService;

    @Autowired
    private ImageProcessingService imageProcessingService;

    @GetMapping("/events")
    public ResponseEntity<Map<String, Object>> getEvents(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "date") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "36.1656") double lat,
            @RequestParam(defaultValue = "-86.7781") double lon,
            @RequestParam(defaultValue = "10") int radius,
            @RequestParam(required = false) String period) {
        
        logger.info("Fetching events with parameters: lat={}, lon={}, radius={}, period={}, page={}, size={}", 
                   lat, lon, radius, period, page, size);
        
        try {
            List<EventResponse> events = ticketmasterService.fetchEvents(
                startDate, endDate, keyword, page, size, sortBy, sortDir, lat, lon, radius, period);
            
            // Log image processing statistics
            logImageStatistics(events);
            
            // Create pagination response
            Map<String, Object> response = new HashMap<>();
            response.put("events", events);
            response.put("pagination", createPaginationInfo(page, size, events.size()));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching events: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/venues")
    public ResponseEntity<List<Map<String, Object>>> getVenues(
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "50") int size) {
        
        // Comprehensive Nashville venue database
        List<Map<String, Object>> venues = new ArrayList<>();
        
        // Stadiums and Large Venues
        Map<String, Object> venue1 = new HashMap<>();
        venue1.put("id", "venue-1");
        venue1.put("name", "Nissan Stadium");
        venue1.put("address", "1 Titans Way, Nashville, TN 37213");
        venue1.put("capacity", 69143);
        venue1.put("tier", "MEGA");
        venue1.put("activity_level", "HIGH");
        venue1.put("distance_from_hotel", 2.5);
        venue1.put("data_quality_score", 95);
        venue1.put("seating_capacity", 69143);
        venue1.put("standing_capacity", 0);
        venue1.put("upcoming_events_count", 12);
        venue1.put("coordinates", "36.16639,-86.77139");
        venue1.put("venue_type", "Sports Stadium (NFL/MLS)");
        venues.add(venue1);

        Map<String, Object> venue2 = new HashMap<>();
        venue2.put("id", "venue-2");
        venue2.put("name", "Bridgestone Arena");
        venue2.put("address", "501 Broadway, Nashville, TN 37203");
        venue2.put("capacity", 20000);
        venue2.put("tier", "MEGA");
        venue2.put("activity_level", "HIGH");
        venue2.put("distance_from_hotel", 0.8);
        venue2.put("data_quality_score", 92);
        venue2.put("seating_capacity", 20000);
        venue2.put("standing_capacity", 0);
        venue2.put("upcoming_events_count", 8);
        venue2.put("coordinates", "36.15917,-86.77861");
        venue2.put("venue_type", "Multi-purpose Arena (NHL & Concerts)");
        venues.add(venue2);

        Map<String, Object> venue3 = new HashMap<>();
        venue3.put("id", "venue-3");
        venue3.put("name", "Geodis Park");
        venue3.put("address", "501 Benton Ave, Nashville, TN 37203");
        venue3.put("capacity", 30109);
        venue3.put("tier", "MEGA");
        venue3.put("activity_level", "HIGH");
        venue3.put("distance_from_hotel", 3.2);
        venue3.put("data_quality_score", 90);
        venue3.put("seating_capacity", 30109);
        venue3.put("standing_capacity", 0);
        venue3.put("upcoming_events_count", 15);
        venue3.put("coordinates", "36.13002,-86.76597");
        venue3.put("venue_type", "Soccer Stadium (MLS)");
        venues.add(venue3);

        // Convention Centers
        Map<String, Object> venue4 = new HashMap<>();
        venue4.put("id", "venue-4");
        venue4.put("name", "Music City Center");
        venue4.put("address", "201 5th Ave S, Nashville, TN 37203");
        venue4.put("capacity", 6000);
        venue4.put("tier", "LARGE");
        venue4.put("activity_level", "MEDIUM");
        venue4.put("distance_from_hotel", 0.5);
        venue4.put("data_quality_score", 88);
        venue4.put("seating_capacity", 6000);
        venue4.put("standing_capacity", 0);
        venue4.put("upcoming_events_count", 6);
        venue4.put("coordinates", "36.1566,-86.7784");
        venue4.put("venue_type", "Convention Center");
        venues.add(venue4);

        Map<String, Object> venue5 = new HashMap<>();
        venue5.put("id", "venue-5");
        venue5.put("name", "Gaylord Opryland Resort & Conv. Ctr.");
        venue5.put("address", "2800 Opryland Dr, Nashville, TN 37214");
        venue5.put("capacity", 10000);
        venue5.put("tier", "LARGE");
        venue5.put("activity_level", "MEDIUM");
        venue5.put("distance_from_hotel", 8.5);
        venue5.put("data_quality_score", 85);
        venue5.put("seating_capacity", 10000);
        venue5.put("standing_capacity", 0);
        venue5.put("upcoming_events_count", 4);
        venue5.put("coordinates", "36.21139,-86.69444");
        venue5.put("venue_type", "Resort & Convention Center");
        venues.add(venue5);

        // Auditoriums and Large Theaters
        Map<String, Object> venue6 = new HashMap<>();
        venue6.put("id", "venue-6");
        venue6.put("name", "Nashville Municipal Auditorium");
        venue6.put("address", "417 4th Ave N, Nashville, TN 37201");
        venue6.put("capacity", 9600);
        venue6.put("tier", "LARGE");
        venue6.put("activity_level", "MEDIUM");
        venue6.put("distance_from_hotel", 1.8);
        venue6.put("data_quality_score", 87);
        venue6.put("seating_capacity", 9600);
        venue6.put("standing_capacity", 0);
        venue6.put("upcoming_events_count", 7);
        venue6.put("coordinates", "36.16758,-86.78224");
        venue6.put("venue_type", "Indoor Arena/Auditorium");
        venues.add(venue6);

        Map<String, Object> venue7 = new HashMap<>();
        venue7.put("id", "venue-7");
        venue7.put("name", "Grand Ole Opry House");
        venue7.put("address", "2804 Opryland Dr, Nashville, TN 37214");
        venue7.put("capacity", 4400);
        venue7.put("tier", "LARGE");
        venue7.put("activity_level", "HIGH");
        venue7.put("distance_from_hotel", 8.2);
        venue7.put("data_quality_score", 88);
        venue7.put("seating_capacity", 4400);
        venue7.put("standing_capacity", 0);
        venue7.put("upcoming_events_count", 5);
        venue7.put("coordinates", "36.20667,-86.69222");
        venue7.put("venue_type", "Concert Hall (Country Music)");
        venues.add(venue7);

        Map<String, Object> venue8 = new HashMap<>();
        venue8.put("id", "venue-8");
        venue8.put("name", "Ryman Auditorium");
        venue8.put("address", "116 Rep. John Lewis Way N, Nashville, TN 37219");
        venue8.put("capacity", 2362);
        venue8.put("tier", "MEDIUM");
        venue8.put("activity_level", "HIGH");
        venue8.put("distance_from_hotel", 0.3);
        venue8.put("data_quality_score", 90);
        venue8.put("seating_capacity", 2362);
        venue8.put("standing_capacity", 0);
        venue8.put("upcoming_events_count", 15);
        venue8.put("coordinates", "36.161278,-86.778500");
        venue8.put("venue_type", "Historic Concert Hall");
        venues.add(venue8);

        Map<String, Object> venue9 = new HashMap<>();
        venue9.put("id", "venue-9");
        venue9.put("name", "Ascend Amphitheater");
        venue9.put("address", "310 1st Ave S, Nashville, TN 37201");
        venue9.put("capacity", 6800);
        venue9.put("tier", "LARGE");
        venue9.put("activity_level", "MEDIUM");
        venue9.put("distance_from_hotel", 1.2);
        venue9.put("data_quality_score", 85);
        venue9.put("seating_capacity", 4500);
        venue9.put("standing_capacity", 2300);
        venue9.put("upcoming_events_count", 6);
        venue9.put("coordinates", "36.15947,-86.77183");
        venue9.put("venue_type", "Outdoor Amphitheater (Riverfront Park)");
        venues.add(venue9);

        Map<String, Object> venue10 = new HashMap<>();
        venue10.put("id", "venue-10");
        venue10.put("name", "Schermerhorn Symphony Center");
        venue10.put("address", "One Symphony Place, Nashville, TN 37201");
        venue10.put("capacity", 1844);
        venue10.put("tier", "MEDIUM");
        venue10.put("activity_level", "MEDIUM");
        venue10.put("distance_from_hotel", 0.7);
        venue10.put("data_quality_score", 89);
        venue10.put("seating_capacity", 1844);
        venue10.put("standing_capacity", 0);
        venue10.put("upcoming_events_count", 12);
        venue10.put("coordinates", "36.15972,-86.77528");
        venue10.put("venue_type", "Concert Hall (Orchestra)");
        venues.add(venue10);

        Map<String, Object> venue11 = new HashMap<>();
        venue11.put("id", "venue-11");
        venue11.put("name", "War Memorial Auditorium");
        venue11.put("address", "301 6th Ave N, Nashville, TN 37243");
        venue11.put("capacity", 2000);
        venue11.put("tier", "MEDIUM");
        venue11.put("activity_level", "MEDIUM");
        venue11.put("distance_from_hotel", 1.5);
        venue11.put("data_quality_score", 86);
        venue11.put("seating_capacity", 2000);
        venue11.put("standing_capacity", 0);
        venue11.put("upcoming_events_count", 8);
        venue11.put("coordinates", "36.1644,-86.7837");
        venue11.put("venue_type", "Auditorium / Theater");
        venues.add(venue11);

        // TPAC Theaters
        Map<String, Object> venue12 = new HashMap<>();
        venue12.put("id", "venue-12");
        venue12.put("name", "Andrew Jackson Hall (TPAC)");
        venue12.put("address", "505 Deaderick St, Nashville, TN 37219");
        venue12.put("capacity", 2472);
        venue12.put("tier", "MEDIUM");
        venue12.put("activity_level", "HIGH");
        venue12.put("distance_from_hotel", 0.9);
        venue12.put("data_quality_score", 91);
        venue12.put("seating_capacity", 2472);
        venue12.put("standing_capacity", 0);
        venue12.put("upcoming_events_count", 10);
        venue12.put("coordinates", "36.1649,-86.7817");
        venue12.put("venue_type", "Performing Arts Theater");
        venues.add(venue12);

        Map<String, Object> venue13 = new HashMap<>();
        venue13.put("id", "venue-13");
        venue13.put("name", "James K. Polk Theater (TPAC)");
        venue13.put("address", "505 Deaderick St, Nashville, TN 37219");
        venue13.put("capacity", 1075);
        venue13.put("tier", "SMALL");
        venue13.put("activity_level", "MEDIUM");
        venue13.put("distance_from_hotel", 0.9);
        venue13.put("data_quality_score", 88);
        venue13.put("seating_capacity", 1075);
        venue13.put("standing_capacity", 0);
        venue13.put("upcoming_events_count", 6);
        venue13.put("coordinates", "36.1649,-86.7817");
        venue13.put("venue_type", "Performing Arts Theater");
        venues.add(venue13);

        Map<String, Object> venue14 = new HashMap<>();
        venue14.put("id", "venue-14");
        venue14.put("name", "Andrew Johnson Theater (TPAC)");
        venue14.put("address", "505 Deaderick St, Nashville, TN 37219");
        venue14.put("capacity", 256);
        venue14.put("tier", "SMALL");
        venue14.put("activity_level", "LOW");
        venue14.put("distance_from_hotel", 0.9);
        venue14.put("data_quality_score", 85);
        venue14.put("seating_capacity", 256);
        venue14.put("standing_capacity", 0);
        venue14.put("upcoming_events_count", 3);
        venue14.put("coordinates", "36.1649,-86.7817");
        venue14.put("venue_type", "Performing Arts Theater");
        venues.add(venue14);

        // Music Venues
        Map<String, Object> venue15 = new HashMap<>();
        venue15.put("id", "venue-15");
        venue15.put("name", "Marathon Music Works");
        venue15.put("address", "1402 Clinton St, Nashville, TN 37203");
        venue15.put("capacity", 1800);
        venue15.put("tier", "MEDIUM");
        venue15.put("activity_level", "HIGH");
        venue15.put("distance_from_hotel", 2.1);
        venue15.put("data_quality_score", 87);
        venue15.put("seating_capacity", 0);
        venue15.put("standing_capacity", 1800);
        venue15.put("upcoming_events_count", 9);
        venue15.put("coordinates", "36.163963,-86.797381");
        venue15.put("venue_type", "Concert Hall / Event Space");
        venues.add(venue15);

        Map<String, Object> venue16 = new HashMap<>();
        venue16.put("id", "venue-16");
        venue16.put("name", "The Station Inn");
        venue16.put("address", "402 12th Ave S, Nashville, TN 37203");
        venue16.put("capacity", 175);
        venue16.put("tier", "SMALL");
        venue16.put("activity_level", "HIGH");
        venue16.put("distance_from_hotel", 1.8);
        venue16.put("data_quality_score", 89);
        venue16.put("seating_capacity", 175);
        venue16.put("standing_capacity", 0);
        venue16.put("upcoming_events_count", 14);
        venue16.put("coordinates", "36.152915,-86.784353");
        venue16.put("venue_type", "Bluegrass Music Club (Listening Room)");
        venues.add(venue16);

        Map<String, Object> venue17 = new HashMap<>();
        venue17.put("id", "venue-17");
        venue17.put("name", "Exit/In");
        venue17.put("address", "2208 Elliston Pl, Nashville, TN 37203");
        venue17.put("capacity", 500);
        venue17.put("tier", "SMALL");
        venue17.put("activity_level", "HIGH");
        venue17.put("distance_from_hotel", 2.8);
        venue17.put("data_quality_score", 86);
        venue17.put("seating_capacity", 0);
        venue17.put("standing_capacity", 500);
        venue17.put("upcoming_events_count", 11);
        venue17.put("coordinates", "36.15135,-86.80434");
        venue17.put("venue_type", "Rock Club (General Admission)");
        venues.add(venue17);

        Map<String, Object> venue18 = new HashMap<>();
        venue18.put("id", "venue-18");
        venue18.put("name", "The Bluebird Café");
        venue18.put("address", "4104 Hillsboro Pike, Nashville, TN 37215");
        venue18.put("capacity", 90);
        venue18.put("tier", "SMALL");
        venue18.put("activity_level", "HIGH");
        venue18.put("distance_from_hotel", 4.2);
        venue18.put("data_quality_score", 92);
        venue18.put("seating_capacity", 90);
        venue18.put("standing_capacity", 0);
        venue18.put("upcoming_events_count", 18);
        venue18.put("coordinates", "36.102028,-86.816833");
        venue18.put("venue_type", "\"Listening Room\" Café");
        venues.add(venue18);

        Map<String, Object> venue19 = new HashMap<>();
        venue19.put("id", "venue-19");
        venue19.put("name", "The Basement");
        venue19.put("address", "1604 8th Ave S, Nashville, TN 37203");
        venue19.put("capacity", 100);
        venue19.put("tier", "SMALL");
        venue19.put("activity_level", "MEDIUM");
        venue19.put("distance_from_hotel", 1.9);
        venue19.put("data_quality_score", 84);
        venue19.put("seating_capacity", 0);
        venue19.put("standing_capacity", 100);
        venue19.put("upcoming_events_count", 7);
        venue19.put("coordinates", "36.137050,-86.781066");
        venue19.put("venue_type", "Small Music Club (Basement venue)");
        venues.add(venue19);

        Map<String, Object> venue20 = new HashMap<>();
        venue20.put("id", "venue-20");
        venue20.put("name", "The Basement East");
        venue20.put("address", "917 Woodland St, Nashville, TN 37206");
        venue20.put("capacity", 575);
        venue20.put("tier", "SMALL");
        venue20.put("activity_level", "HIGH");
        venue20.put("distance_from_hotel", 2.3);
        venue20.put("data_quality_score", 87);
        venue20.put("seating_capacity", 0);
        venue20.put("standing_capacity", 575);
        venue20.put("upcoming_events_count", 12);
        venue20.put("coordinates", "36.177,-86.754");
        venue20.put("venue_type", "Mid-size Music Club (\"The Beast\")");
        venues.add(venue20);

        Map<String, Object> venue21 = new HashMap<>();
        venue21.put("id", "venue-21");
        venue21.put("name", "Wildhorse Saloon");
        venue21.put("address", "120 2nd Ave N, Nashville, TN 37201");
        venue21.put("capacity", 2000);
        venue21.put("tier", "MEDIUM");
        venue21.put("activity_level", "HIGH");
        venue21.put("distance_from_hotel", 0.2);
        venue21.put("data_quality_score", 85);
        venue21.put("seating_capacity", 0);
        venue21.put("standing_capacity", 2000);
        venue21.put("upcoming_events_count", 8);
        venue21.put("coordinates", "36.162611,-86.775444");
        venue21.put("venue_type", "Live Music Club & Dance Hall");
        venues.add(venue21);

        Map<String, Object> venue22 = new HashMap<>();
        venue22.put("id", "venue-22");
        venue22.put("name", "Brooklyn Bowl Nashville");
        venue22.put("address", "925 3rd Ave N, Nashville, TN 37201");
        venue22.put("capacity", 1200);
        venue22.put("tier", "MEDIUM");
        venue22.put("activity_level", "MEDIUM");
        venue22.put("distance_from_hotel", 1.6);
        venue22.put("data_quality_score", 83);
        venue22.put("seating_capacity", 0);
        venue22.put("standing_capacity", 1200);
        venue22.put("upcoming_events_count", 5);
        venue22.put("coordinates", "36.179,-86.785");
        venue22.put("venue_type", "Bowling Alley & Concert Venue");
        venues.add(venue22);

        Map<String, Object> venue23 = new HashMap<>();
        venue23.put("id", "venue-23");
        venue23.put("name", "3rd & Lindsley");
        venue23.put("address", "818 3rd Ave S, Nashville, TN 37210");
        venue23.put("capacity", 700);
        venue23.put("tier", "SMALL");
        venue23.put("activity_level", "HIGH");
        venue23.put("distance_from_hotel", 1.4);
        venue23.put("data_quality_score", 86);
        venue23.put("seating_capacity", 0);
        venue23.put("standing_capacity", 700);
        venue23.put("upcoming_events_count", 10);
        venue23.put("coordinates", "36.153,-86.775");
        venue23.put("venue_type", "Music Club & Bar (Live Music)");
        venues.add(venue23);

        // Sort venues based on sortBy parameter
        if ("capacity".equals(sortBy)) {
            venues.sort((a, b) -> {
                Integer capacityA = (Integer) a.get("capacity");
                Integer capacityB = (Integer) b.get("capacity");
                return capacityB.compareTo(capacityA); // Descending order for capacity
            });
        } else if ("name".equals(sortBy)) {
            venues.sort((a, b) -> {
                String nameA = (String) a.get("name");
                String nameB = (String) b.get("name");
                return nameA.compareToIgnoreCase(nameB);
            });
        } else if ("tier".equals(sortBy)) {
            venues.sort((a, b) -> {
                String tierA = (String) a.get("tier");
                String tierB = (String) b.get("tier");
                return tierA.compareToIgnoreCase(tierB);
            });
        }

        // Limit the number of venues returned
        if (venues.size() > size) {
            venues = venues.subList(0, size);
        }

        return ResponseEntity.ok(venues);
    }

    @GetMapping("/config")
    public ResponseEntity<List<HotelConfig>> getConfig() {
        // Mock config data for now
        List<HotelConfig> configs = new ArrayList<>();
        HotelConfig config = new HotelConfig();
        config.setId("config-1");
        config.setHotelName("Nashville Grand Hotel");
        config.setHotelAddress("123 Broadway, Nashville, TN 37201");
        config.setHotelCoordinates("36.1627,-86.7816");
        config.setDefaultSearchRadius(10);
        config.setNotificationEmail("manager@nashvillegrand.com");
        config.setHighImpactThreshold(75);
        config.setCriticalImpactThreshold(90);
        config.setSyncFrequencyHours(6);
        config.setPricingSystemConnected(false);
        configs.add(config);
        
        return ResponseEntity.ok(configs);
    }

    @PostMapping("/config")
    public ResponseEntity<HotelConfig> createConfig(@RequestBody HotelConfig config) {
        // In a real app, this would save to database
        config.setId("config-" + System.currentTimeMillis());
        return ResponseEntity.ok(config);
    }

    @PutMapping("/config/{id}")
    public ResponseEntity<HotelConfig> updateConfig(@PathVariable String id, @RequestBody HotelConfig config) {
        // In a real app, this would update in database
        config.setId(id);
        return ResponseEntity.ok(config);
    }

    @DeleteMapping("/config/{id}")
    public ResponseEntity<Void> deleteConfig(@PathVariable String id) {
        // In a real app, this would delete from database
        return ResponseEntity.ok().build();
    }

    @GetMapping("/test-images")
    public ResponseEntity<Map<String, Object>> testImageProcessing() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Fetch a small sample of events to test image processing
            List<EventResponse> events = ticketmasterService.fetchEvents(
                null, null, null, 0, 5, "date", "asc", 36.1656, -86.7781, 10, "week");
            
            response.put("totalEvents", events.size());
            response.put("eventsWithImages", events.stream().filter(e -> e.getEventImage() != null).count());
            response.put("eventsWithoutImages", events.stream().filter(e -> e.getEventImage() == null).count());
            
            // Sample image data
            List<Map<String, Object>> sampleImages = events.stream()
                .filter(e -> e.getEventImage() != null)
                .limit(3)
                .map(e -> {
                    Map<String, Object> img = new HashMap<>();
                    img.put("eventName", e.getName());
                    img.put("imageUrl", e.getEventImage());
                    img.put("quality", e.getImageQuality());
                    img.put("dimensions", e.getImageWidth() + "x" + e.getImageHeight());
                    img.put("fileSize", e.getImageFileSize());
                    img.put("ratio", e.getImageRatio());
                    img.put("priority", e.getImagePriority());
                    return img;
                })
                .toList();
            
            response.put("sampleImages", sampleImages);
            response.put("success", true);
            
        } catch (Exception e) {
            logger.error("Error testing image processing: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/image-stats")
    public ResponseEntity<Map<String, Object>> getImageStatistics() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Fetch events to analyze image statistics
            List<EventResponse> events = ticketmasterService.fetchEvents(
                null, null, null, 0, 50, "date", "asc", 36.1656, -86.7781, 10, "week");
            
            long totalEvents = events.size();
            long eventsWithImages = events.stream().filter(e -> e.getEventImage() != null).count();
            long eventsWithoutImages = totalEvents - eventsWithImages;
            
            // Quality distribution
            Map<String, Long> qualityDistribution = events.stream()
                .filter(e -> e.getImageQuality() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                    EventResponse::getImageQuality,
                    java.util.stream.Collectors.counting()
                ));
            
            // Ratio distribution
            Map<String, Long> ratioDistribution = events.stream()
                .filter(e -> e.getImageRatio() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                    EventResponse::getImageRatio,
                    java.util.stream.Collectors.counting()
                ));
            
            response.put("totalEvents", totalEvents);
            response.put("eventsWithImages", eventsWithImages);
            response.put("eventsWithoutImages", eventsWithoutImages);
            response.put("imageCoveragePercentage", totalEvents > 0 ? (double) eventsWithImages / totalEvents * 100 : 0);
            response.put("qualityDistribution", qualityDistribution);
            response.put("ratioDistribution", ratioDistribution);
            response.put("success", true);
            
        } catch (Exception e) {
            logger.error("Error getting image statistics: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> createPaginationInfo(int currentPage, int pageSize, int currentPageSize) {
        Map<String, Object> pagination = new HashMap<>();
        pagination.put("currentPage", currentPage);
        pagination.put("pageSize", pageSize);
        pagination.put("currentPageSize", currentPageSize);
        pagination.put("hasNextPage", currentPageSize == pageSize);
        pagination.put("hasPreviousPage", currentPage > 0);
        pagination.put("nextPage", currentPage + 1);
        pagination.put("previousPage", Math.max(0, currentPage - 1));
        
        // Generate page numbers for navigation (1-5 style)
        List<Integer> pageNumbers = new ArrayList<>();
        int startPage = Math.max(0, currentPage - 2);
        int endPage = currentPage + 2;
        
        for (int i = startPage; i <= endPage; i++) {
            pageNumbers.add(i);
        }
        
        pagination.put("pageNumbers", pageNumbers);
        return pagination;
    }

    private void logImageStatistics(List<EventResponse> events) {
        if (events == null || events.isEmpty()) {
            logger.info("No events to analyze for image statistics");
            return;
        }
        
        long totalEvents = events.size();
        long eventsWithImages = events.stream().filter(e -> e.getEventImage() != null).count();
        long eventsWithoutImages = totalEvents - eventsWithImages;
        
        logger.info("Image Processing Statistics:");
        logger.info("  Total events: {}", totalEvents);
        logger.info("  Events with images: {} ({:.1f}%)", 
                   eventsWithImages, (double) eventsWithImages / totalEvents * 100);
        logger.info("  Events without images: {} ({:.1f}%)", 
                   eventsWithoutImages, (double) eventsWithoutImages / totalEvents * 100);
        
        // Log quality distribution
        Map<String, Long> qualityDistribution = events.stream()
            .filter(e -> e.getImageQuality() != null)
            .collect(java.util.stream.Collectors.groupingBy(
                EventResponse::getImageQuality,
                java.util.stream.Collectors.counting()
            ));
        
        if (!qualityDistribution.isEmpty()) {
            logger.info("  Image Quality Distribution:");
            qualityDistribution.forEach((quality, count) -> 
                logger.info("    {}: {} ({:.1f}%)", quality, count, (double) count / eventsWithImages * 100));
        }
    }
} 