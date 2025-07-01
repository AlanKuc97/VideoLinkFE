
import type { User, Tokens } from '@/lib/types';
import apiClient from '../apiClient';

type RegisterData = Omit<User, 'id'> & { password: string };
type LoginData = Pick<User, 'email'> & { password: string };

export const registerUser = (data: RegisterData): Promise<User> => {
  return apiClient('/authorization/v1/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const loginUser = (data: LoginData): Promise<Tokens> => {
  return apiClient('/authorization/v1/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const refreshToken = (token: string): Promise<Tokens> => {
  return apiClient('/authorization/v1/refresh-token', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
};
