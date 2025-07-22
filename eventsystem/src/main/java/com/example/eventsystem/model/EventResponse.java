package com.example.eventsystem.model;

import java.util.List;
import java.util.Map;

public class EventResponse {
    private String id;
    private String name;
    private String date;
    private String time;
    private String venue;
    private String address;
    private String category;
    private String price;
    private String ticketUrl;
    private String status;
    private String description;
    private String venueTier;
    private String venueType;
    private int impactScore;
    private String impactLevel;
    private double distance;
    
    // Image fields
    private String eventImage;
    private String imageUrl;
    private Integer imageWidth;
    private Integer imageHeight;
    private String imageRatio;
    private String imageSize;
    private String imageQuality;
    private String imageFileSize;
    private Double imageAspectRatio;
    private Integer imagePriority;
    private List<Map<String, Object>> allImages;
    private Map<String, Object> imageMetadata;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPrice() { return price; }
    public void setPrice(String price) { this.price = price; }

    public String getTicketUrl() { return ticketUrl; }
    public void setTicketUrl(String ticketUrl) { this.ticketUrl = ticketUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getVenueTier() { return venueTier; }
    public void setVenueTier(String venueTier) { this.venueTier = venueTier; }

    public String getVenueType() { return venueType; }
    public void setVenueType(String venueType) { this.venueType = venueType; }

    public int getImpactScore() { return impactScore; }
    public void setImpactScore(int impactScore) { this.impactScore = impactScore; }

    public String getImpactLevel() { return impactLevel; }
    public void setImpactLevel(String impactLevel) { this.impactLevel = impactLevel; }

    public double getDistance() { return distance; }
    public void setDistance(double distance) { this.distance = distance; }

    // Image getters and setters
    public String getEventImage() { return eventImage; }
    public void setEventImage(String eventImage) { this.eventImage = eventImage; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Integer getImageWidth() { return imageWidth; }
    public void setImageWidth(Integer imageWidth) { this.imageWidth = imageWidth; }

    public Integer getImageHeight() { return imageHeight; }
    public void setImageHeight(Integer imageHeight) { this.imageHeight = imageHeight; }

    public String getImageRatio() { return imageRatio; }
    public void setImageRatio(String imageRatio) { this.imageRatio = imageRatio; }

    public String getImageSize() { return imageSize; }
    public void setImageSize(String imageSize) { this.imageSize = imageSize; }

    public String getImageQuality() { return imageQuality; }
    public void setImageQuality(String imageQuality) { this.imageQuality = imageQuality; }

    public String getImageFileSize() { return imageFileSize; }
    public void setImageFileSize(String imageFileSize) { this.imageFileSize = imageFileSize; }

    public Double getImageAspectRatio() { return imageAspectRatio; }
    public void setImageAspectRatio(Double imageAspectRatio) { this.imageAspectRatio = imageAspectRatio; }

    public Integer getImagePriority() { return imagePriority; }
    public void setImagePriority(Integer imagePriority) { this.imagePriority = imagePriority; }

    public List<Map<String, Object>> getAllImages() { return allImages; }
    public void setAllImages(List<Map<String, Object>> allImages) { this.allImages = allImages; }

    public Map<String, Object> getImageMetadata() { return imageMetadata; }
    public void setImageMetadata(Map<String, Object> imageMetadata) { this.imageMetadata = imageMetadata; }
} 