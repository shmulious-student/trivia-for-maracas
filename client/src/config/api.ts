/**
 * API Configuration
 * Centralized API URL management for development and production
 */

// Use environment variable if available, fallback to localhost for development
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Full API base path
export const API_BASE = `${API_BASE_URL}/api`;

// Helper to get full URL for uploads/static files
export const getAssetUrl = (path: string): string => {
    if (!path) return '';
    // If path already includes http or is a blob URL, return as is
    if (path.startsWith('http') || path.startsWith('blob:')) return path;
    // Otherwise, prepend the base URL
    return `${API_BASE_URL}${path}`;
};
