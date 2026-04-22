export const getBaseUrl = async () => {
  // Use VITE_API_URL if provided (e.g. on Netlify), otherwise fallback to same-origin
  return (import.meta as any).env.VITE_API_URL || '';
};


export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = await getBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};
