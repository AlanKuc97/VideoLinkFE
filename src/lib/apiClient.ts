
'use client';

import { AuthTokenManager } from './authTokenManager';

const apiClient = async (path: string, options: RequestInit = {}) => {
  const token = AuthTokenManager.getAccessToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // In a real app, you would implement token refresh logic here.
    // For now, we'll just log out the user by clearing tokens.
    AuthTokenManager.clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'An API error occurred');
  }
  
  if (response.status === 204) {
    return null;
  }
  
  try {
    return await response.json();
  } catch (error) {
    return null; // Handle cases where response is OK but has no body, e.g., 201 No Content.
  }
};

export default apiClient;
