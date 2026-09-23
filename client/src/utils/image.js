export const getImageUrl = (path) => {
  if (!path) return 'https://placehold.co/300?text=No+Image';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // 1. If VITE_API_URL is configured, use the deployed backend API URL
  if (import.meta.env.VITE_API_URL) {
    const baseUrl = import.meta.env.VITE_API_URL.replace(/\/+$/, '');
    return `${baseUrl}${cleanPath}`;
  }

  // 2. If running on Vercel production without VITE_API_URL, fallback to GitHub Raw repo uploads
  if (import.meta.env.PROD) {
    return `https://raw.githubusercontent.com/SivaVaishnavi/ShopZe/main/server${cleanPath}`;
  }

  // 3. In local development, fallback to local backend port 8000
  return `http://localhost:8000${cleanPath}`;
};
