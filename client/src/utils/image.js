/**
 * getImageUrl — resolves a product image path to a fully qualified URL.
 *
 * The DB can store one of two forms:
 *   1. A full https:// URL  (direct image link pasted by admin, or uploaded to
 *      a backend that already prepends BACKEND_URL)  → return as-is
 *   2. A legacy relative path like "/uploads/xxx.jpg"  → prefix with the
 *      backend base URL (VITE_API_URL in prod, localhost:8000 in dev)
 */
export const getImageUrl = (path) => {
  if (!path) return 'https://placehold.co/300?text=No+Image';

  // Already a full URL — return as-is (handles https:// images and data: URIs)
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  // Legacy relative path — prefix with backend base URL
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
  return `${base}${cleanPath}`;
};
