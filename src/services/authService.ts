import apiClient from './apiClient';
import type { UserRole } from '../pages/Login';

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
  organization?: string;
  hospital?: string;
  warehouse?: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res: any = await apiClient.post('/auth/login', { email, password });
    if (res.data?.token) {
      localStorage.setItem('pharmtrack_token', res.data.token);
      localStorage.setItem('pharmtrack_user', JSON.stringify(res.data));
    }
    return res.data;
  },

  register: async (userData: any): Promise<AuthResponse> => {
    const res: any = await apiClient.post('/auth/register', userData);
    if (res.data?.token) {
      localStorage.setItem('pharmtrack_token', res.data.token);
      localStorage.setItem('pharmtrack_user', JSON.stringify(res.data));
    }
    return res.data;
  },

  getProfile: async (): Promise<any> => {
    const res: any = await apiClient.get('/auth/me');
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('pharmtrack_token');
    localStorage.removeItem('pharmtrack_user');
  },

  getCurrentUser: (): AuthResponse | null => {
    const saved = localStorage.getItem('pharmtrack_user');
    return saved ? JSON.parse(saved) : null;
  },
};
