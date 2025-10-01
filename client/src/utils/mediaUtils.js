// Utility functions for media handling

/**
 * Get the full URL for a media file
 * @param {string} url - The relative URL from the API (e.g., "/uploads/filename.png")
 * @returns {string} - The full URL pointing to the backend server
 */
export const getMediaUrl = (url) => {
  if (!url) return ''
  
  // If it's already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // In development, use the Vite proxy (same origin)
  // In production, use the full backend URL
  if (import.meta.env.DEV) {
    // Ensure the URL starts with / for the proxy
    return url.startsWith('/') ? url : `/${url}`
  } else {
    // Production: use the full backend server URL
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url
    return `${backendUrl}/${cleanUrl}`
  }
}

/**
 * Get the file extension from a URL
 * @param {string} url - The file URL
 * @returns {string} - The file extension (e.g., "png", "jpg", "mp4")
 */
export const getFileExtension = (url) => {
  if (!url) return ''
  return url.split('.').pop()?.toLowerCase() || ''
}

/**
 * Check if a file is an image based on its extension
 * @param {string} url - The file URL
 * @returns {boolean} - True if the file is an image
 */
export const isImage = (url) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']
  return imageExtensions.includes(getFileExtension(url))
}

/**
 * Check if a file is a video based on its extension
 * @param {string} url - The file URL
 * @returns {boolean} - True if the file is a video
 */
export const isVideo = (url) => {
  const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv']
  return videoExtensions.includes(getFileExtension(url))
}

/**
 * Check if a file is an audio file based on its extension
 * @param {string} url - The file URL
 * @returns {boolean} - True if the file is an audio file
 */
export const isAudio = (url) => {
  const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a']
  return audioExtensions.includes(getFileExtension(url))
}

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}
