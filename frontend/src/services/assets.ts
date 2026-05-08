export const getAssetUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Use VITE_BASE_URL if provided, otherwise fallback to local dev vs django logic
  const isDev = import.meta.env.DEV;
  const base = isDev ? '/' : '/static/frontend/';
  
  return `${base}${cleanPath}`;
};
