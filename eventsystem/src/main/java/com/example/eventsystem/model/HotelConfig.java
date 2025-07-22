package com.example.eventsystem.model;

public class HotelConfig {
    private String id;
    private String hotelName;
    private String hotelAddress;
    private String hotelCoordinates;
    private int defaultSearchRadius;
    private String notificationEmail;
    private int highImpactThreshold;
    private int criticalImpactThreshold;
    private int syncFrequencyHours;
    private boolean pricingSystemConnected;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getHotelName() { return hotelName; }
    public void setHotelName(String hotelName) { this.hotelName = hotelName; }

    public String getHotelAddress() { return hotelAddress; }
    public void setHotelAddress(String hotelAddress) { this.hotelAddress = hotelAddress; }

    public String getHotelCoordinates() { return hotelCoordinates; }
    public void setHotelCoordinates(String hotelCoordinates) { this.hotelCoordinates = hotelCoordinates; }

    public int getDefaultSearchRadius() { return defaultSearchRadius; }
    public void setDefaultSearchRadius(int defaultSearchRadius) { this.defaultSearchRadius = defaultSearchRadius; }

    public String getNotificationEmail() { return notificationEmail; }
    public void setNotificationEmail(String notificationEmail) { this.notificationEmail = notificationEmail; }

    public int getHighImpactThreshold() { return highImpactThreshold; }
    public void setHighImpactThreshold(int highImpactThreshold) { this.highImpactThreshold = highImpactThreshold; }

    public int getCriticalImpactThreshold() { return criticalImpactThreshold; }
    public void setCriticalImpactThreshold(int criticalImpactThreshold) { this.criticalImpactThreshold = criticalImpactThreshold; }

    public int getSyncFrequencyHours() { return syncFrequencyHours; }
    public void setSyncFrequencyHours(int syncFrequencyHours) { this.syncFrequencyHours = syncFrequencyHours; }

    public boolean isPricingSystemConnected() { return pricingSystemConnected; }
    public void setPricingSystemConnected(boolean pricingSystemConnected) { this.pricingSystemConnected = pricingSystemConnected; }
} 