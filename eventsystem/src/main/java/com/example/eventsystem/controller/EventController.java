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
            @RequestParam(defaultValue = "36.1656") double lat,
            @RequestParam(defaultValue = "-86.7781") double lon,
            @RequestParam(defaultValue = "10") int radius,
            @RequestParam(defaultValue = "miles") String unit,
            @RequestParam(defaultValue = "50") int size) {
        // Validate coordinates
        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            return ResponseEntity.badRequest().body(List.of(Map.of("error", "Invalid coordinates")));
        }
        if (radius <= 0) radius = 10;
        if (!unit.equalsIgnoreCase("miles") && !unit.equalsIgnoreCase("km")) unit = "miles";
        if (size <= 0) size = 50;
        try {
            List<Map<String, Object>> venues = ticketmasterService.fetchVenues(lat, lon, radius, unit, size);
            if (venues.isEmpty()) {
                return ResponseEntity.ok(List.of(Map.of("message", "No venues found in radius")));
            }
            return ResponseEntity.ok(venues);
        } catch (Exception e) {
            logger.error("Error fetching venues: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(List.of(Map.of("error", "Failed to fetch venues")));
        }
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

    @GetMapping("/integrations/ticketmaster")
    public ResponseEntity<Map<String, Object>> getTicketmasterIntegration() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Mock Ticketmaster integration settings
            Map<String, Object> settings = new HashMap<>();
            settings.put("enabled", true);
            settings.put("apiKey", "demo-key-12345");
            settings.put("baseUrl", "https://app.ticketmaster.com/discovery/v2/");
            settings.put("rateLimit", 2000);
            settings.put("syncInterval", 6);
            settings.put("lastSync", "2 minutes ago");
            settings.put("status", "connected");
            settings.put("endpoint", "api.ticketmasterapi.com");
            settings.put("dataFlow", "Real-time");
            
            response.put("settings", settings);
            response.put("success", true);
            
        } catch (Exception e) {
            logger.error("Error getting Ticketmaster integration: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/integrations/ticketmaster")
    public ResponseEntity<Map<String, Object>> saveTicketmasterIntegration(@RequestBody Map<String, Object> settings) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("Saving Ticketmaster integration settings: {}", settings);
            
            // In a real app, this would save to database
            // For now, we'll just return success
            response.put("settings", settings);
            response.put("success", true);
            response.put("message", "Ticketmaster integration settings saved successfully");
            
        } catch (Exception e) {
            logger.error("Error saving Ticketmaster integration: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/integrations/ticketmaster/toggle")
    public ResponseEntity<Map<String, Object>> toggleTicketmasterIntegration(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Boolean enabled = (Boolean) request.get("enabled");
            logger.info("Toggling Ticketmaster integration: enabled = {}", enabled);
            
            // In a real app, this would update the database
            // For now, we'll just return success
            response.put("enabled", enabled);
            response.put("success", true);
            response.put("message", enabled ? "Ticketmaster integration enabled" : "Ticketmaster integration disabled");
            
        } catch (Exception e) {
            logger.error("Error toggling Ticketmaster integration: {}", e.getMessage(), e);
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