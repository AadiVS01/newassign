// Image utility functions for handling local and remote images

/**
 * Get the full image URL, handling both local and remote images
 * @param {string} imageUrl - The image URL or filename
 * @returns {string} - Full image URL
 */
export const getImageUrl = (imageUrl) => {
  // If no image URL provided, return empty string (no fallback)
  if (!imageUrl) {
    return "";
  }

  // If it's already a full URL (starts with http), return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  // If it's a local filename, construct the local path
  return `/images/products/${imageUrl}`;
};

/**
 * Get optimized image URL with specific dimensions
 * @param {string} imageUrl - The image URL or filename
 * @param {number} width - Desired width
 * @param {number} height - Desired height
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (imageUrl, width = 600, height = 400) => {
  const fullUrl = getImageUrl(imageUrl);
  
  // If no image URL, return empty string
  if (!fullUrl) {
    return "";
  }
  
  // If it's an Unsplash image, add optimization parameters
  if (fullUrl.includes('unsplash.com')) {
    return `${fullUrl.split('?')[0]}?w=${width}&h=${height}&fit=crop&q=80`;
  }
  
  // For local images, return as is
  return fullUrl;
};

/**
 * Generate different image sizes for responsive design
 * @param {string} imageUrl - The image URL or filename
 * @returns {object} - Object with different image sizes
 */
export const getResponsiveImageUrls = (imageUrl) => {
  const baseUrl = getImageUrl(imageUrl);
  
  if (baseUrl.includes('unsplash.com')) {
    const baseUnsplashUrl = baseUrl.split('?')[0];
    return {
      thumbnail: `${baseUnsplashUrl}?w=120&h=120&fit=crop&q=80`,
      small: `${baseUnsplashUrl}?w=300&h=300&fit=crop&q=80`,
      medium: `${baseUnsplashUrl}?w=600&h=400&fit=crop&q=80`,
      large: `${baseUnsplashUrl}?w=1200&h=800&fit=crop&q=80`,
      original: baseUrl
    };
  }
  
  // For local images, return same URL for all sizes
  return {
    thumbnail: baseUrl,
    small: baseUrl,
    medium: baseUrl,
    large: baseUrl,
    original: baseUrl
  };
};

/**
 * Validate image file extension
 * @param {string} filename - The filename to validate
 * @returns {boolean} - Whether the file extension is valid
 */
export const isValidImageFile = (filename) => {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return validExtensions.includes(extension);
};

/**
 * Generate a safe filename for storing images
 * @param {string} originalName - Original filename
 * @param {string} productId - Product ID for uniqueness
 * @returns {string} - Safe filename
 */
export const generateSafeFilename = (originalName, productId) => {
  const extension = originalName.substring(originalName.lastIndexOf('.'));
  const timestamp = Date.now();
  const safeName = originalName
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `product-${productId}-${timestamp}-${safeName}`;
};

// Default fallback images for different categories
export const DEFAULT_IMAGES = {
  electronics: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop&q=80",
  laptop: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop&q=80",
  phone: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&h=400&fit=crop&q=80",
  headphones: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop&q=80",
  monitor: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=400&fit=crop&q=80",
  mouse: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=400&fit=crop&q=80",
  keyboard: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&h=400&fit=crop&q=80"
};