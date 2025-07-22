// Image handling utilities for events
export const IMAGE_PRIORITIES = {
  // High quality landscape images (preferred)
  TABLET_LANDSCAPE_LARGE_16_9: {
    priority: 1,
    minWidth: 2048,
    minHeight: 1152,
    ratio: '16_9',
    description: 'High quality landscape'
  },
  TABLET_LANDSCAPE_16_9: {
    priority: 2,
    minWidth: 1024,
    minHeight: 576,
    ratio: '16_9',
    description: 'Medium landscape'
  },
  TABLET_LANDSCAPE_SMALL_16_9: {
    priority: 3,
    minWidth: 512,
    minHeight: 288,
    ratio: '16_9',
    description: 'Small landscape'
  },
  // Portrait fallbacks
  TABLET_PORTRAIT_LARGE_16_9: {
    priority: 4,
    minWidth: 1152,
    minHeight: 2048,
    ratio: '16_9',
    description: 'Large portrait'
  },
  // Original source (highest quality but may be large)
  SOURCE: {
    priority: 5,
    description: 'Original source'
  }
};

/**
 * Get the best event image based on priority and quality
 * @param {Array} images - Array of image objects from API
 * @param {Object} options - Options for image selection
 * @returns {Object|null} - Selected image object or null
 */
export const getBestEventImage = (images, options = {}) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return null;
  }

  const {
    preferredRatio = '16_9',
    minWidth = 512,
    minHeight = 288,
    maxWidth = 2048,
    maxHeight = 1152,
    allowPortrait = false
  } = options;

  // Sort images by priority
  const sortedImages = images
    .filter(img => img.url && img.url.trim() !== '')
    .map(img => {
      const priority = getImagePriority(img);
      return { ...img, priority };
    })
    .sort((a, b) => a.priority - b.priority);

  // Find the best image based on criteria
  for (const image of sortedImages) {
    if (isImageSuitable(image, { preferredRatio, minWidth, minHeight, maxWidth, maxHeight, allowPortrait })) {
      return {
        url: image.url,
        width: image.width,
        height: image.height,
        ratio: image.ratio,
        size: image.size,
        priority: image.priority,
        metadata: {
          aspectRatio: image.width && image.height ? image.width / image.height : null,
          fileSize: estimateFileSize(image),
          quality: getImageQuality(image)
        }
      };
    }
  }

  // Fallback to any available image
  return sortedImages.length > 0 ? {
    url: sortedImages[0].url,
    width: sortedImages[0].width,
    height: sortedImages[0].height,
    ratio: sortedImages[0].ratio,
    size: sortedImages[0].size,
    priority: sortedImages[0].priority,
    metadata: {
      aspectRatio: sortedImages[0].width && sortedImages[0].height ? sortedImages[0].width / sortedImages[0].height : null,
      fileSize: estimateFileSize(sortedImages[0]),
      quality: getImageQuality(sortedImages[0])
    }
  } : null;
};

/**
 * Get image priority based on size and type
 * @param {Object} image - Image object
 * @returns {number} - Priority number (lower is better)
 */
const getImagePriority = (image) => {
  // Check for exact matches first
  for (const [key, config] of Object.entries(IMAGE_PRIORITIES)) {
    if (image.size === key || image.url?.includes(key.toLowerCase())) {
      return config.priority;
    }
  }

  // Calculate priority based on dimensions and ratio
  if (image.width && image.height) {
    const aspectRatio = image.width / image.height;
    const area = image.width * image.height;

    // Prefer 16:9 ratio
    if (Math.abs(aspectRatio - 16/9) < 0.1) {
      if (area >= 2048 * 1152) return 1; // Large
      if (area >= 1024 * 576) return 2;  // Medium
      if (area >= 512 * 288) return 3;   // Small
    }

    // Prefer landscape over portrait
    if (aspectRatio > 1) {
      if (area >= 1024 * 576) return 4;  // Large landscape
      if (area >= 512 * 288) return 5;   // Medium landscape
    } else {
      if (area >= 1152 * 2048) return 6; // Large portrait
      if (area >= 576 * 1024) return 7;  // Medium portrait
    }
  }

  return 10; // Default low priority
};

/**
 * Check if image meets the specified criteria
 * @param {Object} image - Image object
 * @param {Object} criteria - Selection criteria
 * @returns {boolean} - Whether image is suitable
 */
const isImageSuitable = (image, criteria) => {
  const { preferredRatio, minWidth, minHeight, maxWidth, maxHeight, allowPortrait } = criteria;

  if (!image.width || !image.height) {
    return true; // Accept images without dimensions
  }

  // Check ratio preference
  if (preferredRatio === '16_9') {
    const aspectRatio = image.width / image.height;
    const is16_9 = Math.abs(aspectRatio - 16/9) < 0.1;
    if (!is16_9 && !allowPortrait) return false;
  }

  // Check size constraints
  if (image.width < minWidth || image.height < minHeight) return false;
  if (image.width > maxWidth || image.height > maxHeight) return false;

  return true;
};

/**
 * Estimate file size based on image dimensions
 * @param {Object} image - Image object
 * @returns {string} - Estimated file size
 */
const estimateFileSize = (image) => {
  if (!image.width || !image.height) return 'Unknown';
  
  const pixels = image.width * image.height;
  const bytesPerPixel = 3; // RGB
  const estimatedBytes = pixels * bytesPerPixel;
  
  if (estimatedBytes < 1024 * 1024) {
    return `${Math.round(estimatedBytes / 1024)}KB`;
  } else {
    return `${Math.round(estimatedBytes / (1024 * 1024))}MB`;
  }
};

/**
 * Get image quality rating
 * @param {Object} image - Image object
 * @returns {string} - Quality rating
 */
const getImageQuality = (image) => {
  if (!image.width || !image.height) return 'Unknown';
  
  const pixels = image.width * image.height;
  
  if (pixels >= 2048 * 1152) return 'High';
  if (pixels >= 1024 * 576) return 'Medium';
  if (pixels >= 512 * 288) return 'Low';
  return 'Very Low';
};

/**
 * Generate image placeholder for failed loads
 * @param {string} eventName - Event name
 * @param {string} category - Event category
 * @returns {Object} - Placeholder image data
 */
export const generateImagePlaceholder = (eventName, category = 'Music') => {
  const colors = {
    Music: ['from-indigo-500', 'to-purple-600'],
    Sports: ['from-emerald-500', 'to-teal-600'],
    Theater: ['from-amber-500', 'to-orange-600'],
    Other: ['from-slate-500', 'to-gray-600']
  };

  const [fromColor, toColor] = colors[category] || colors.Other;
  
  return {
    url: `data:image/svg+xml,${encodeURIComponent(`
      <svg width="400" height="225" viewBox="0 0 400 225" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${fromColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${toColor};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="225" fill="url(#grad)"/>
        <text x="200" y="100" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle">
          ${eventName.substring(0, 30)}${eventName.length > 30 ? '...' : ''}
        </text>
        <text x="200" y="125" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle" opacity="0.8">
          ${category}
        </text>
      </svg>
    `)}`,
    width: 400,
    height: 225,
    ratio: '16_9',
    size: 'PLACEHOLDER',
    priority: 999,
    metadata: {
      aspectRatio: 16/9,
      fileSize: '1KB',
      quality: 'Placeholder'
    }
  };
};

/**
 * Optimize image URL for different use cases
 * @param {string} imageUrl - Original image URL
 * @param {Object} options - Optimization options
 * @returns {string} - Optimized image URL
 */
export const optimizeImageUrl = (imageUrl, options = {}) => {
  if (!imageUrl) return null;

  const { width, height, quality = 80, format = 'webp' } = options;

  // If it's a data URL or placeholder, return as is
  if (imageUrl.startsWith('data:')) return imageUrl;

  // For external URLs, we could add CDN parameters if available
  // This is a placeholder for future CDN integration
  if (imageUrl.includes('ticketm.net')) {
    // Ticketmaster images - could add optimization parameters
    return imageUrl;
  }

  return imageUrl;
};

/**
 * Preload image for better performance
 * @param {string} imageUrl - Image URL to preload
 * @returns {Promise} - Promise that resolves when image is loaded
 */
export const preloadImage = (imageUrl) => {
  return new Promise((resolve, reject) => {
    if (!imageUrl) {
      reject(new Error('No image URL provided'));
      return;
    }

    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
    img.src = imageUrl;
  });
};

/**
 * Batch preload multiple images
 * @param {Array} imageUrls - Array of image URLs
 * @returns {Promise} - Promise that resolves when all images are loaded
 */
export const preloadImages = async (imageUrls) => {
  const promises = imageUrls.map(url => preloadImage(url).catch(err => {
    console.warn('Failed to preload image:', err.message);
    return null;
  }));

  return Promise.all(promises);
}; 