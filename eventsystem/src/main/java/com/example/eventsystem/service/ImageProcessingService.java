package com.example.eventsystem.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ImageProcessingService {
    private static final Logger logger = LoggerFactory.getLogger(ImageProcessingService.class);

    // Image priority configuration
    private static final Map<String, Integer> IMAGE_PRIORITIES = new HashMap<>();
    static {
        IMAGE_PRIORITIES.put("TABLET_LANDSCAPE_LARGE_16_9", 1);
        IMAGE_PRIORITIES.put("TABLET_LANDSCAPE_16_9", 2);
        IMAGE_PRIORITIES.put("TABLET_LANDSCAPE_SMALL_16_9", 3);
        IMAGE_PRIORITIES.put("TABLET_PORTRAIT_LARGE_16_9", 4);
        IMAGE_PRIORITIES.put("SOURCE", 5);
        IMAGE_PRIORITIES.put("TABLET_LANDSCAPE_16_9", 6);
        IMAGE_PRIORITIES.put("TABLET_PORTRAIT_16_9", 7);
        IMAGE_PRIORITIES.put("TABLET_LANDSCAPE_SMALL_16_9", 8);
        IMAGE_PRIORITIES.put("TABLET_PORTRAIT_SMALL_16_9", 9);
    }

    // Quality thresholds
    private static final int HIGH_QUALITY_PIXELS = 2048 * 1152; // ~2.4M pixels
    private static final int MEDIUM_QUALITY_PIXELS = 1024 * 576; // ~600K pixels
    private static final int LOW_QUALITY_PIXELS = 512 * 288; // ~150K pixels

    /**
     * Process and select the best image from a list of available images
     * @param images List of image maps from Ticketmaster API
     * @param eventName Name of the event for logging
     * @return Map containing selected image data and metadata
     */
    public Map<String, Object> processEventImages(List<Map<String, Object>> images, String eventName) {
        if (images == null || images.isEmpty()) {
            logger.info("Event: {} - No images available", eventName);
            return createPlaceholderImage(eventName);
        }

        logger.info("Event: {} - Found {} images", eventName, images.size());

        // Filter and validate images
        List<Map<String, Object>> validImages = filterValidImages(images);
        
        if (validImages.isEmpty()) {
            logger.warn("Event: {} - No valid images found", eventName);
            return createPlaceholderImage(eventName);
        }

        // Sort images by priority and quality
        List<Map<String, Object>> sortedImages = sortImagesByPriority(validImages);
        
        // Select the best image
        Map<String, Object> bestImage = selectBestImage(sortedImages);
        
        // Log the selection
        if (bestImage != null) {
            String selectedUrl = (String) bestImage.get("url");
            String dimensions = bestImage.get("width") + "x" + bestImage.get("height");
            logger.info("Event: {} - Selected preferred image: {} - {}", eventName, dimensions, selectedUrl);
        }

        return bestImage;
    }

    /**
     * Filter out invalid or missing images
     */
    private List<Map<String, Object>> filterValidImages(List<Map<String, Object>> images) {
        return images.stream()
                .filter(img -> img != null && img.get("url") != null)
                .filter(img -> {
                    String url = (String) img.get("url");
                    return !url.trim().isEmpty() && url.startsWith("http");
                })
                .collect(Collectors.toList());
    }

    /**
     * Sort images by priority and quality
     */
    private List<Map<String, Object>> sortImagesByPriority(List<Map<String, Object>> images) {
        return images.stream()
                .map(this::calculateImagePriority)
                .sorted((img1, img2) -> {
                    Integer priority1 = (Integer) img1.get("priority");
                    Integer priority2 = (Integer) img2.get("priority");
                    
                    if (!priority1.equals(priority2)) {
                        return priority1.compareTo(priority2);
                    }
                    
                    // If same priority, sort by quality (higher pixels first)
                    Integer pixels1 = (Integer) img1.get("pixels");
                    Integer pixels2 = (Integer) img2.get("pixels");
                    return pixels2.compareTo(pixels1);
                })
                .collect(Collectors.toList());
    }

    /**
     * Calculate priority and metadata for an image
     */
    private Map<String, Object> calculateImagePriority(Map<String, Object> image) {
        Map<String, Object> enhancedImage = new HashMap<>(image);
        
        // Calculate priority
        String size = (String) image.get("size");
        Integer priority = IMAGE_PRIORITIES.getOrDefault(size, 10);
        enhancedImage.put("priority", priority);
        
        // Calculate pixels and quality
        Integer width = getIntegerValue(image.get("width"));
        Integer height = getIntegerValue(image.get("height"));
        
        if (width != null && height != null) {
            int pixels = width * height;
            enhancedImage.put("pixels", pixels);
            enhancedImage.put("aspectRatio", (double) width / height);
            enhancedImage.put("quality", determineQuality(pixels));
            enhancedImage.put("fileSize", estimateFileSize(pixels));
        }
        
        return enhancedImage;
    }

    /**
     * Select the best image based on criteria
     */
    private Map<String, Object> selectBestImage(List<Map<String, Object>> sortedImages) {
        // Prefer 16:9 landscape images
        for (Map<String, Object> image : sortedImages) {
            String ratio = (String) image.get("ratio");
            if ("16_9".equals(ratio)) {
                Double aspectRatio = (Double) image.get("aspectRatio");
                if (aspectRatio != null && aspectRatio > 1.0) { // Landscape
                    return createImageResult(image);
                }
            }
        }
        
        // Fallback to any 16:9 image
        for (Map<String, Object> image : sortedImages) {
            String ratio = (String) image.get("ratio");
            if ("16_9".equals(ratio)) {
                return createImageResult(image);
            }
        }
        
        // Fallback to any image
        if (!sortedImages.isEmpty()) {
            return createImageResult(sortedImages.get(0));
        }
        
        return null;
    }

    /**
     * Create the final image result with all metadata
     */
    private Map<String, Object> createImageResult(Map<String, Object> image) {
        Map<String, Object> result = new HashMap<>();
        
        result.put("url", image.get("url"));
        result.put("width", image.get("width"));
        result.put("height", image.get("height"));
        result.put("ratio", image.get("ratio"));
        result.put("size", image.get("size"));
        result.put("priority", image.get("priority"));
        result.put("quality", image.get("quality"));
        result.put("fileSize", image.get("fileSize"));
        result.put("aspectRatio", image.get("aspectRatio"));
        
        // Create metadata map
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("quality", image.get("quality"));
        metadata.put("fileSize", image.get("fileSize"));
        metadata.put("aspectRatio", image.get("aspectRatio"));
        metadata.put("pixels", image.get("pixels"));
        metadata.put("priority", image.get("priority"));
        
        result.put("metadata", metadata);
        
        return result;
    }

    /**
     * Determine image quality based on pixel count
     */
    private String determineQuality(int pixels) {
        if (pixels >= HIGH_QUALITY_PIXELS) return "High";
        if (pixels >= MEDIUM_QUALITY_PIXELS) return "Medium";
        if (pixels >= LOW_QUALITY_PIXELS) return "Low";
        return "Very Low";
    }

    /**
     * Estimate file size based on pixels
     */
    private String estimateFileSize(int pixels) {
        // Rough estimate: 3 bytes per pixel (RGB)
        int estimatedBytes = pixels * 3;
        
        if (estimatedBytes < 1024 * 1024) {
            return Math.round(estimatedBytes / 1024.0) + "KB";
        } else {
            return Math.round(estimatedBytes / (1024.0 * 1024.0)) + "MB";
        }
    }

    /**
     * Create a placeholder image when no images are available
     */
    private Map<String, Object> createPlaceholderImage(String eventName) {
        Map<String, Object> placeholder = new HashMap<>();
        placeholder.put("url", generatePlaceholderUrl(eventName));
        placeholder.put("width", 400);
        placeholder.put("height", 225);
        placeholder.put("ratio", "16_9");
        placeholder.put("size", "PLACEHOLDER");
        placeholder.put("priority", 999);
        placeholder.put("quality", "Placeholder");
        placeholder.put("fileSize", "1KB");
        placeholder.put("aspectRatio", 16.0 / 9.0);
        
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("quality", "Placeholder");
        metadata.put("fileSize", "1KB");
        metadata.put("aspectRatio", 16.0 / 9.0);
        metadata.put("pixels", 400 * 225);
        metadata.put("priority", 999);
        
        placeholder.put("metadata", metadata);
        
        return placeholder;
    }

    /**
     * Generate a placeholder URL for events without images
     */
    private String generatePlaceholderUrl(String eventName) {
        // Create a data URL for a simple placeholder
        String svg = String.format(
            "<svg width='400' height='225' viewBox='0 0 400 225' xmlns='http://www.w3.org/2000/svg'>" +
            "<defs><linearGradient id='grad' x1='0%%' y1='0%%' x2='100%%' y2='100%%'>" +
            "<stop offset='0%%' style='stop-color:#6366f1;stop-opacity:1' />" +
            "<stop offset='100%%' style='stop-color:#8b5cf6;stop-opacity:1' />" +
            "</linearGradient></defs>" +
            "<rect width='400' height='225' fill='url(#grad)'/>" +
            "<text x='200' y='100' font-family='Arial, sans-serif' font-size='16' fill='white' text-anchor='middle'>%s</text>" +
            "<text x='200' y='125' font-family='Arial, sans-serif' font-size='12' fill='white' text-anchor='middle' opacity='0.8'>Event</text>" +
            "</svg>",
            eventName.length() > 30 ? eventName.substring(0, 30) + "..." : eventName
        );
        
        return "data:image/svg+xml," + java.net.URLEncoder.encode(svg, java.nio.charset.StandardCharsets.UTF_8);
    }

    /**
     * Safely get integer value from object
     */
    private Integer getIntegerValue(Object value) {
        if (value == null) return null;
        try {
            if (value instanceof Integer) return (Integer) value;
            if (value instanceof String) return Integer.parseInt((String) value);
            if (value instanceof Number) return ((Number) value).intValue();
        } catch (NumberFormatException e) {
            logger.warn("Could not parse integer value: {}", value);
        }
        return null;
    }

    /**
     * Validate image URL
     */
    public boolean isValidImageUrl(String url) {
        if (url == null || url.trim().isEmpty()) return false;
        return url.startsWith("http") || url.startsWith("data:");
    }

    /**
     * Get image statistics for debugging
     */
    public Map<String, Object> getImageStatistics(List<Map<String, Object>> images) {
        Map<String, Object> stats = new HashMap<>();
        
        if (images == null || images.isEmpty()) {
            stats.put("total", 0);
            stats.put("valid", 0);
            return stats;
        }
        
        List<Map<String, Object>> validImages = filterValidImages(images);
        
        stats.put("total", images.size());
        stats.put("valid", validImages.size());
        
        // Count by ratio
        Map<String, Long> ratioCount = validImages.stream()
                .collect(Collectors.groupingBy(
                    img -> (String) img.get("ratio"),
                    Collectors.counting()
                ));
        stats.put("byRatio", ratioCount);
        
        // Count by size
        Map<String, Long> sizeCount = validImages.stream()
                .collect(Collectors.groupingBy(
                    img -> (String) img.get("size"),
                    Collectors.counting()
                ));
        stats.put("bySize", sizeCount);
        
        return stats;
    }
} 