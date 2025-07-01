
import type { SearchUserResponse, Partner } from '@/lib/types';
import apiClient from '../apiClient';

interface SearchUsersPayload {
  latitude: number;
  longitude: number;
  radius_km: number;
  signal_id: string; // Assuming signal_id is managed client-side for WebRTC
}

export const searchUsers = (data: SearchUsersPayload): Promise<SearchUserResponse> => {
  return apiClient('/core/v1/search-users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getPartner = (searchUserId: string): Promise<Partner | null> => {
  return apiClient(`/core/v1/partners/${searchUserId}`, {
    method: 'GET',
  });
};
