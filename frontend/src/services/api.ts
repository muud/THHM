export const getBaseUrl = async () => {
  return ''; // Unified Mono-architecture: APIs are natively hosted on the origin
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
