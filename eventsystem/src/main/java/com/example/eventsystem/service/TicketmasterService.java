package com.example.eventsystem.service;

import com.example.eventsystem.model.EventResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;

@Service
public class TicketmasterService {
    private static final Logger logger = LoggerFactory.getLogger(TicketmasterService.class);

    @Value("${api.ticketmaster.key}")
    private String apiKey;

    @Value("${api.ticketmaster.base-url}")
    private String baseUrl;

    @Autowired
    private ImageProcessingService imageProcessingService;

    private final RestTemplate restTemplate = new RestTemplate();

    // Venue metadata mapping
    private static final Map<String, String[]> VENUE_METADATA = new HashMap<>();
    static {
        VENUE_METADATA.put("Nissan Stadium", new String[]{"Mega Venue (50,000+)", "Sports Venue"});
        VENUE_METADATA.put("Bridgestone Arena", new String[]{"Major Arena (15,000-25,000)", "Sports Venue"});
        VENUE_METADATA.put("Grand Ole Opry House", new String[]{"Large Theater (2,000-5,000)", "Country Music Heritage"});
        VENUE_METADATA.put("Tennessee Performing Arts Center", new String[]{"Large Theater (2,000-5,000)", "Classical/Symphony"});
        VENUE_METADATA.put("Ryman Auditorium", new String[]{"Medium Theater (1,000-2,500)", "Country Music Heritage"});
        VENUE_METADATA.put("Schermerhorn Symphony Center", new String[]{"Medium Theater (1,000-2,500)", "Classical/Symphony"});
        VENUE_METADATA.put("Marathon Music Works", new String[]{"Large Music Venue (1,000-2,000)", "Contemporary Music"});
        VENUE_METADATA.put("Cannery Hall", new String[]{"Large Music Venue (1,000-2,000)", "Contemporary Music"});
        VENUE_METADATA.put("Brooklyn Bowl", new String[]{"Large Music Venue (1,000-2,000)", "Contemporary Music"});
        VENUE_METADATA.put("CMA Theater", new String[]{"Medium Music Venue (500-1,000)", "Contemporary Music"});
        VENUE_METADATA.put("City Winery", new String[]{"Small Music Venue (100-500)", "Contemporary Music"});
        VENUE_METADATA.put("The Country", new String[]{"Small Music Venue (100-500)", "Contemporary Music"});
        VENUE_METADATA.put("Listening Room Cafe", new String[]{"Small Music Venue (100-500)", "Songwriter Venue"});
        VENUE_METADATA.put("Tin Roof", new String[]{"Small Music Venue (100-500)", "Contemporary Music"});
        VENUE_METADATA.put("The Bluebird Cafe", new String[]{"Intimate Venue (Under 200)", "Country Music Heritage"});
        VENUE_METADATA.put("The Cobra", new String[]{"Intimate Venue (Under 200)", "Contemporary Music"});
        VENUE_METADATA.put("Ascend Amphitheater", new String[]{"Amphitheater", "Outdoor"});
        VENUE_METADATA.put("Nashville Municipal Auditorium", new String[]{"Multi-Purpose Venue", "Multi-Purpose/Historic"});
        VENUE_METADATA.put("War Memorial Auditorium", new String[]{"Multi-Purpose Venue", "Multi-Purpose/Historic"});
    }

        public List<EventResponse> fetchEvents(String startDate, String endDate, String keyword, int page, int size, String sortBy, String sortDir, double lat, double lon, int radius, String period) {
        // If period is provided and startDate/endDate are not, calculate date range
        if (period != null && (startDate == null || endDate == null)) {
            LocalDate today = LocalDate.now();
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");
            if (period.equalsIgnoreCase("today")) {
                LocalDateTime start = today.atStartOfDay();
                LocalDateTime end = today.atTime(23, 59, 59);
                startDate = start.atZone(ZoneOffset.systemDefault()).withZoneSameInstant(ZoneOffset.UTC).format(dtf);
                endDate = end.atZone(ZoneOffset.systemDefault()).withZoneSameInstant(ZoneOffset.UTC).format(dtf);
            } else if (period.equalsIgnoreCase("week")) {
                LocalDateTime start = today.atStartOfDay();
                LocalDateTime end = today.plusDays(6).atTime(23, 59, 59);
                startDate = start.atZone(ZoneOffset.systemDefault()).withZoneSameInstant(ZoneOffset.UTC).format(dtf);
                endDate = end.atZone(ZoneOffset.systemDefault()).withZoneSameInstant(ZoneOffset.UTC).format(dtf);
            } else if (period.equalsIgnoreCase("month")) {
                LocalDateTime start = today.atStartOfDay();
                LocalDate lastDay = today.withDayOfMonth(today.lengthOfMonth());
                LocalDateTime end = lastDay.atTime(23, 59, 59);
                startDate = start.atZone(ZoneOffset.systemDefault()).withZoneSameInstant(ZoneOffset.UTC).format(dtf);
                endDate = end.atZone(ZoneOffset.systemDefault()).withZoneSameInstant(ZoneOffset.UTC).format(dtf);
            }
        }
        
        // If no dates are provided at all, set default date range (next 30 days)
        if (startDate == null && endDate == null) {
            LocalDate today = LocalDate.now();
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");
            LocalDateTime start = today.atStartOfDay();
            LocalDateTime end = today.plusDays(30).atTime(23, 59, 59);
            startDate = start.atZone(ZoneOffset.systemDefault()).withZoneSameInstant(ZoneOffset.UTC).format(dtf);
            endDate = end.atZone(ZoneOffset.systemDefault()).withZoneSameInstant(ZoneOffset.UTC).format(dtf);
        }
        
        // Enforce correct date format for startDate and endDate
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");
        startDate = ensureDateTimeFormat(startDate, true, dtf);
        endDate = ensureDateTimeFormat(endDate, false, dtf);

        // Fetch all events by making multiple API calls if needed
        List<EventResponse> allEvents = new ArrayList<>();
        int currentPage = 0;
        int maxPages = 10; // Limit to prevent infinite loops
        int pageSize = 200; // Ticketmaster's max per page
        
        try {
            while (currentPage < maxPages) {
                UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(baseUrl)
                    .queryParam("apikey", apiKey)
                    .queryParam("size", pageSize)
                    .queryParam("page", currentPage)
                    .queryParam("latlong", lat + "," + lon)
                    .queryParam("radius", radius)
                    .queryParam("unit", "miles");
                if (startDate != null) builder.queryParam("startDateTime", startDate);
                if (endDate != null) builder.queryParam("endDateTime", endDate);
                if (keyword != null) builder.queryParam("keyword", keyword);
                
                String url = builder.toUriString();
                logger.info("Fetching events page {} from Ticketmaster API: {}", currentPage, url);
                
                Map response = restTemplate.getForObject(url, Map.class);
                if (response == null || !response.containsKey("_embedded")) {
                    break;
                }
                
                Map embedded = (Map) response.get("_embedded");
                List<Map> rawEvents = (List<Map>) embedded.get("events");
                if (rawEvents == null || rawEvents.isEmpty()) {
                    break;
                }
                
                // Process events from this page
                for (Map event : rawEvents) {
                    EventResponse er = new EventResponse();
                    er.setId((String) event.get("id"));
                    er.setName((String) event.get("name"));
                    
                    // Process images using the new ImageProcessingService
                    processEventImages(er, event);
                    
                    Map dates = (Map) event.get("dates");
                    if (dates != null && dates.containsKey("start")) {
                        Map start = (Map) dates.get("start");
                        er.setDate((String) start.get("localDate"));
                        er.setTime((String) start.get("localTime"));
                    }
                    Map venue = null;
                    Double venueLat = null, venueLon = null;
                    if (event.containsKey("_embedded")) {
                        Map embedded2 = (Map) event.get("_embedded");
                        List<Map> venues = (List<Map>) embedded2.get("venues");
                        if (venues != null && !venues.isEmpty()) {
                            venue = venues.get(0);
                            Map location = (Map) venue.get("location");
                            if (location != null) {
                                try {
                                    venueLat = location.get("latitude") != null ? Double.parseDouble(location.get("latitude").toString()) : null;
                                    venueLon = location.get("longitude") != null ? Double.parseDouble(location.get("longitude").toString()) : null;
                                } catch (Exception ignore) {}
                            }
                        }
                    }
                    if (venue != null) {
                        String venueName = (String) venue.get("name");
                        er.setVenue(venueName);
                        StringBuilder address = new StringBuilder();
                        Map addr = (Map) venue.get("address");
                        if (addr != null && addr.get("line1") != null) address.append(addr.get("line1")).append(", ");
                        Map city = (Map) venue.get("city");
                        if (city != null && city.get("name") != null) address.append(city.get("name")).append(", ");
                        Map state = (Map) venue.get("state");
                        if (state != null && state.get("stateCode") != null) address.append(state.get("stateCode")).append(", ");
                        if (venue.get("postalCode") != null) address.append(venue.get("postalCode"));
                        er.setAddress(address.toString());
                        // Venue tier/type
                        String[] meta = VENUE_METADATA.getOrDefault(venueName, new String[]{"Other Venue","Other"});
                        er.setVenueTier(meta[0]);
                        er.setVenueType(meta[1]);
                    } else {
                        er.setVenueTier("Other Venue");
                        er.setVenueType("Other");
                    }
                    // Distance calculation
                    if (venueLat != null && venueLon != null) {
                        er.setDistance(haversine(lat, lon, venueLat, venueLon));
                    } else {
                        er.setDistance(-1);
                    }
                    // Category
                    List<Map> classifications = (List<Map>) event.get("classifications");
                    if (classifications != null && !classifications.isEmpty()) {
                        Map segment = (Map) classifications.get(0).get("segment");
                        if (segment != null && segment.get("name") != null) {
                            er.setCategory((String) segment.get("name"));
                        }
                    }
                    // Price
                    List<Map> priceRanges = (List<Map>) event.get("priceRanges");
                    if (priceRanges != null && !priceRanges.isEmpty()) {
                        Map price = priceRanges.get(0);
                        String currency = (String) price.getOrDefault("currency", "USD");
                        Object min = price.get("min");
                        Object max = price.get("max");
                        er.setPrice(currency + " " + min + (max != null ? (" - " + max) : ""));
                    } else {
                        er.setPrice("Price not available");
                    }
                    er.setTicketUrl((String) event.get("url"));
                    Map dates2 = (Map) event.get("dates");
                    if (dates2 != null && dates2.get("status") != null) {
                        Map status = (Map) dates2.get("status");
                        er.setStatus((String) status.get("code"));
                    }
                    er.setDescription((String) event.getOrDefault("info", ""));
                    // Impact score/level calculation
                    int impactScore = calculateImpactScore(er);
                    er.setImpactScore(impactScore);
                    er.setImpactLevel(getImpactLevel(impactScore));
                    allEvents.add(er);
                }
                
                // Check if we've reached the requested size or if there are no more events
                if (allEvents.size() >= size || rawEvents.size() < pageSize) {
                    break;
                }
                
                currentPage++;
            }
            
            logger.info("Total events fetched: {}", allEvents.size());
            
            // Sorting
            Comparator<EventResponse> comparator;
            switch (sortBy) {
                case "name":
                    comparator = Comparator.comparing(EventResponse::getName, Comparator.nullsLast(String::compareToIgnoreCase));
                    break;
                case "venue":
                    comparator = Comparator.comparing(EventResponse::getVenue, Comparator.nullsLast(String::compareToIgnoreCase));
                    break;
                case "date":
                default:
                    comparator = Comparator.comparing(EventResponse::getDate, Comparator.nullsLast(String::compareTo));
            }
            if (sortDir.equalsIgnoreCase("desc")) {
                comparator = comparator.reversed();
            }
            allEvents = allEvents.stream().sorted(comparator).collect(Collectors.toList());
            
            // Pagination
            int fromIndex = Math.min(page * size, allEvents.size());
            int toIndex = Math.min(fromIndex + size, allEvents.size());
            return allEvents.subList(fromIndex, toIndex);
            
        } catch (Exception e) {
            logger.error("Error fetching events: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Process images for an event using the ImageProcessingService
     */
    private void processEventImages(EventResponse event, Map<String, Object> rawEvent) {
        try {
            List<Map<String, Object>> images = (List<Map<String, Object>>) rawEvent.get("images");
            
            // Store all images for reference
            event.setAllImages(images);
            
            // Process images to get the best one
            Map<String, Object> processedImage = imageProcessingService.processEventImages(images, event.getName());
            
            if (processedImage != null) {
                // Set the selected image URL
                event.setEventImage((String) processedImage.get("url"));
                event.setImageUrl((String) processedImage.get("url"));
                
                // Set image dimensions
                Object width = processedImage.get("width");
                Object height = processedImage.get("height");
                if (width instanceof Integer) event.setImageWidth((Integer) width);
                if (height instanceof Integer) event.setImageHeight((Integer) height);
                
                // Set other image properties
                event.setImageRatio((String) processedImage.get("ratio"));
                event.setImageSize((String) processedImage.get("size"));
                event.setImageQuality((String) processedImage.get("quality"));
                event.setImageFileSize((String) processedImage.get("fileSize"));
                
                // Set numeric values
                Object aspectRatio = processedImage.get("aspectRatio");
                Object priority = processedImage.get("priority");
                if (aspectRatio instanceof Double) event.setImageAspectRatio((Double) aspectRatio);
                if (priority instanceof Integer) event.setImagePriority((Integer) priority);
                
                // Set metadata
                Map<String, Object> metadata = (Map<String, Object>) processedImage.get("metadata");
                event.setImageMetadata(metadata);
                
                logger.debug("Processed images for event '{}': selected image with quality {}", 
                    event.getName(), event.getImageQuality());
            } else {
                logger.warn("No valid images found for event: {}", event.getName());
            }
        } catch (Exception e) {
            logger.error("Error processing images for event {}: {}", event.getName(), e.getMessage());
        }
    }

    // Helper to ensure date string is in the correct format
    private String ensureDateTimeFormat(String dateStr, boolean isStart, DateTimeFormatter dtf) {
        if (dateStr == null) return null;
        try {
            // If already in correct format, return as is
            LocalDateTime.parse(dateStr, dtf);
            return dateStr;
        } catch (DateTimeParseException e) {
            // Try parsing as yyyy-MM-dd
            try {
                LocalDate d = LocalDate.parse(dateStr);
                LocalDateTime dt = isStart ? d.atStartOfDay() : d.atTime(23, 59, 59);
                return dt.atZone(ZoneOffset.systemDefault()).withZoneSameInstant(ZoneOffset.UTC).format(dtf);
            } catch (DateTimeParseException ex) {
                // Invalid format, return as is
                return dateStr;
            }
        }
    }

    // Haversine formula for distance in miles
    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        final int R = 3959; // Radius of the earth in miles
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10.0) / 10.0; // round to 1 decimal
    }

    /**
     * Helper method to extract upcoming events count from the venue data
     */
    private int getUpcomingEventsCount(Object upcoming) {
        if (upcoming instanceof Map) {
            Map upcomingMap = (Map) upcoming;
            Object total = upcomingMap.get("_total");
            if (total instanceof Number) {
                return ((Number) total).intValue();
            }
        }
        if (upcoming instanceof Number) {
            return ((Number) upcoming).intValue();
        }
        return 0;
    }

    // Simple impact score calculation
    private int calculateImpactScore(EventResponse er) {
        int score = 0;
        // Venue tier
        if (er.getVenueTier() != null) {
            if (er.getVenueTier().contains("Mega Venue")) score += 40;
            else if (er.getVenueTier().contains("Major Arena")) score += 30;
            else if (er.getVenueTier().contains("Large")) score += 20;
            else if (er.getVenueTier().contains("Medium")) score += 15;
            else if (er.getVenueTier().contains("Small")) score += 10;
            else if (er.getVenueTier().contains("Intimate")) score += 5;
        }
        // Category
        if (er.getCategory() != null) {
            if (er.getCategory().equalsIgnoreCase("Music")) score += 15;
            else if (er.getCategory().equalsIgnoreCase("Sports")) score += 12;
            else if (er.getCategory().equalsIgnoreCase("Arts & Theatre")) score += 10;
        }
        // Date proximity (today = highest)
        if (er.getDate() != null) {
            try {
                LocalDate eventDate = LocalDate.parse(er.getDate());
                LocalDate today = LocalDate.now();
                long days = Math.abs(today.until(eventDate).getDays());
                if (days == 0) score += 15;
                else if (days <= 2) score += 10;
                else if (days <= 7) score += 5;
            } catch (Exception ignore) {}
        }
        // Price (higher price = higher impact)
        if (er.getPrice() != null && er.getPrice().matches(".*\\d+.*")) {
            try {
                String[] parts = er.getPrice().split(" ");
                double price = Double.parseDouble(parts[1]);
                if (price > 100) score += 10;
                else if (price > 50) score += 5;
            } catch (Exception ignore) {}
        }
        return score;
    }

    private String getImpactLevel(int score) {
        if (score >= 60) return "Critical";
        if (score >= 40) return "High";
        if (score >= 25) return "Medium";
        return "Low";
    }

    /**
     * Fetch venues from Ticketmaster API based on coordinates, radius, and unit.
     * @param lat Latitude in decimal degrees
     * @param lon Longitude in decimal degrees
     * @param radius Search radius (default 25)
     * @param unit 'miles' or 'km' (default 'miles')
     * @param size Max venues per page (default 200)
     * @return List of venue maps with required fields
     */
    public List<Map<String, Object>> fetchVenues(double lat, double lon, int radius, String unit, int size) {
        List<Map<String, Object>> allVenues = new ArrayList<>();
        int currentPage = 0;
        int pageSize = Math.min(size, 200); // Ticketmaster max per page
        boolean morePages = true;
        String venuesUrl = "https://app.ticketmaster.com/discovery/v2/venues.json";

        try {
            while (morePages) {
                UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(venuesUrl)
                    .queryParam("apikey", apiKey)
                    .queryParam("latlong", lat + "," + lon)
                    .queryParam("radius", radius)
                    .queryParam("unit", unit)
                    .queryParam("size", pageSize)
                    .queryParam("page", currentPage);

                String url = builder.toUriString();
                logger.info("Fetching venues page {} from Ticketmaster API: {}", currentPage, url);

                Map response = restTemplate.getForObject(url, Map.class);
                if (response == null || !response.containsKey("_embedded")) {
                    break;
                }
                Map embedded = (Map) response.get("_embedded");
                List<Map> venues = (List<Map>) embedded.get("venues");
                if (venues == null || venues.isEmpty()) {
                    break;
                }

                for (Map venue : venues) {
                    Map<String, Object> venueMap = new HashMap<>();
                    venueMap.put("id", venue.get("id"));
                    venueMap.put("name", venue.get("name"));
                    venueMap.put("url", venue.get("url")); // Website URL

                    // Images - get the best image
                    List<Map> images = (List<Map>) venue.get("images");
                    if (images != null && !images.isEmpty()) {
                        // Find the best image (prefer 16:9 ratio, then 4:3, then any)
                        Map bestImage = null;
                        for (Map img : images) {
                            String ratio = (String) img.get("ratio");
                            if ("16_9".equals(ratio)) {
                                bestImage = img;
                                break;
                            } else if ("4_3".equals(ratio) && bestImage == null) {
                                bestImage = img;
                            } else if (bestImage == null) {
                                bestImage = img;
                            }
                        }
                        if (bestImage != null) {
                            venueMap.put("image_url", bestImage.get("url"));
                            venueMap.put("image_width", bestImage.get("width"));
                            venueMap.put("image_height", bestImage.get("height"));
                            venueMap.put("image_ratio", bestImage.get("ratio"));
                        }
                    }

                    // Address
                    StringBuilder address = new StringBuilder();
                    Map addr = (Map) venue.get("address");
                    if (addr != null && addr.get("line1") != null) address.append(addr.get("line1")).append(", ");
                    Map city = (Map) venue.get("city");
                    if (city != null && city.get("name") != null) address.append(city.get("name")).append(", ");
                    Map state = (Map) venue.get("state");
                    if (state != null && state.get("stateCode") != null) address.append(state.get("stateCode")).append(", ");
                    if (venue.get("postalCode") != null) address.append(venue.get("postalCode"));
                    venueMap.put("address", address.toString());

                    // Coordinates
                    Map location = (Map) venue.get("location");
                    Double venueLat = null, venueLon = null;
                    if (location != null) {
                        try {
                            venueLat = location.get("latitude") != null ? Double.parseDouble(location.get("latitude").toString()) : null;
                            venueLon = location.get("longitude") != null ? Double.parseDouble(location.get("longitude").toString()) : null;
                        } catch (Exception ignore) {}
                    }
                    venueMap.put("latitude", venueLat);
                    venueMap.put("longitude", venueLon);
                    venueMap.put("coordinates", (venueLat != null && venueLon != null) ? (venueLat + "," + venueLon) : "");

                    // Distance calculation
                    if (venueLat != null && venueLon != null) {
                        venueMap.put("distance_from_search", haversine(lat, lon, venueLat, venueLon));
                    } else {
                        venueMap.put("distance_from_search", null);
                    }

                    // Box Office Info
                    Map boxOffice = (Map) venue.get("boxOfficeInfo");
                    if (boxOffice != null) {
                        venueMap.put("contact_phone", boxOffice.get("phoneNumberDetail"));
                        venueMap.put("box_office_hours", boxOffice.get("openHoursDetail"));
                        venueMap.put("accepted_payment", boxOffice.get("acceptedPaymentDetail"));
                        venueMap.put("will_call_info", boxOffice.get("willCallDetail"));
                    } else {
                        venueMap.put("contact_phone", null);
                        venueMap.put("box_office_hours", null);
                        venueMap.put("accepted_payment", null);
                        venueMap.put("will_call_info", null);
                    }

                    // Parking and Accessibility
                    venueMap.put("parking_info", venue.get("parkingDetail"));
                    venueMap.put("accessibility_info", venue.get("accessibleSeatingDetail"));

                    // General Info
                    Map generalInfo = (Map) venue.get("generalInfo");
                    if (generalInfo != null) {
                        venueMap.put("general_rules", generalInfo.get("generalRule"));
                        venueMap.put("child_policy", generalInfo.get("childRule"));
                    } else {
                        venueMap.put("general_rules", null);
                        venueMap.put("child_policy", null);
                    }

                    // Social Media
                    Map social = (Map) venue.get("social");
                    if (social != null) {
                        Map twitter = (Map) social.get("twitter");
                        if (twitter != null) {
                            venueMap.put("twitter_handle", twitter.get("handle"));
                        }
                    }

                    // Venue type/category
                    List<Map> classifications = (List<Map>) venue.get("classifications");
                    if (classifications != null && !classifications.isEmpty()) {
                        Map segment = (Map) classifications.get(0).get("segment");
                        if (segment != null && segment.get("name") != null) {
                            venueMap.put("venue_type", segment.get("name"));
                        }
                    } else {
                        venueMap.put("venue_type", "Other");
                    }

                    // Capacity (if available)
                    Object rawCapacity = venue.get("capacity");
                    if (rawCapacity != null) {
                        try {
                            int capacity = Integer.parseInt(rawCapacity.toString());
                            venueMap.put("capacity", capacity);
                        } catch (Exception e) {
                            venueMap.put("capacity", null);
                        }
                    } else {
                        venueMap.put("capacity", null);
                    }

                    // Timezone and other details
                    venueMap.put("timezone", venue.get("timezone"));
                    venueMap.put("postal_code", venue.get("postalCode"));

                    // Upcoming events
                    venueMap.put("upcoming_events_count", venue.get("upcomingEvents"));

                    // Legacy fields for compatibility
                    venueMap.put("seating_capacity", null);
                    venueMap.put("standing_capacity", null);
                    venueMap.put("tier", "");
                    venueMap.put("activity_level", "");
                    venueMap.put("data_quality_score", "");

                    allVenues.add(venueMap);
                }

                // Pagination
                Map pageInfo = (Map) response.get("page");
                int totalPages = (pageInfo != null && pageInfo.get("totalPages") != null) ? ((Number) pageInfo.get("totalPages")).intValue() : 1;
                currentPage++;
                // Only stop if we've collected enough venues or reached the last page
                if (currentPage >= totalPages || allVenues.size() >= size) {
                    morePages = false;
                }
            }
        } catch (Exception e) {
            logger.error("Error fetching venues from Ticketmaster API: {}", e.getMessage());
        }
        // Sort by upcoming events count (descending), then by completeness score (descending), then by distance (ascending)
        allVenues.sort((v1, v2) -> {
            // First, compare by upcoming events count (descending)
            int upcoming1 = getUpcomingEventsCount(v1.get("upcoming_events_count"));
            int upcoming2 = getUpcomingEventsCount(v2.get("upcoming_events_count"));
            
            if (upcoming1 != upcoming2) {
                return Integer.compare(upcoming2, upcoming1); // Descending - more events first
            }
            
            // If upcoming events are equal, sort by completeness score (descending)
            int score1 = 0;
            int score2 = 0;
            if (v1.get("capacity") != null) score1++;
            if (v1.get("image_url") != null) score1++;
            if (v1.get("address") != null && !v1.get("address").toString().isBlank()) score1++;
            if (v1.get("contact_phone") != null) score1++;
            if (v1.get("box_office_hours") != null) score1++;
            if (v1.get("parking_info") != null) score1++;
            if (v1.get("accessibility_info") != null) score1++;
            if (v1.get("general_rules") != null) score1++;

            if (v2.get("capacity") != null) score2++;
            if (v2.get("image_url") != null) score2++;
            if (v2.get("address") != null && !v2.get("address").toString().isBlank()) score2++;
            if (v2.get("contact_phone") != null) score2++;
            if (v2.get("box_office_hours") != null) score2++;
            if (v2.get("parking_info") != null) score2++;
            if (v2.get("accessibility_info") != null) score2++;
            if (v2.get("general_rules") != null) score2++;

            if (score1 != score2) {
                return Integer.compare(score2, score1); // Descending
            }
            
            // If scores are equal, sort by distance (ascending)
            double d1 = v1.get("distance_from_search") instanceof Number ? ((Number)v1.get("distance_from_search")).doubleValue() : Double.MAX_VALUE;
            double d2 = v2.get("distance_from_search") instanceof Number ? ((Number)v2.get("distance_from_search")).doubleValue() : Double.MAX_VALUE;
            return Double.compare(d1, d2);
        });
        // Return only up to the requested size
        return allVenues.size() > size ? allVenues.subList(0, size) : allVenues;
    }
} 