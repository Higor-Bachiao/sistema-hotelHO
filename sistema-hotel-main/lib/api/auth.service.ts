import { apiClient } from './client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
  created_at?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export class AuthApiService {
  static async login(email: string, password: string) {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password
    });

    if (response.success && response.data?.token) {
      apiClient.setToken(response.data.token);
    }

    return response;
  }

  static async logout() {
    apiClient.removeToken();
  }

  static async getProfile() {
    return apiClient.get<User>('/auth/profile');
  }

  static async register(userData: {
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'staff';
  }) {
    return apiClient.post<User>('/auth/register', userData);
  }

  static async getAllUsers() {
    return apiClient.get<User[]>('/auth/users');
  }

  static async updateUser(id: string, updates: Partial<User>) {
    return apiClient.put<User>(`/auth/users/${id}`, updates);
  }

  static async deleteUser(id: string) {
    return apiClient.delete(`/auth/users/${id}`);
  }

  static async changePassword(currentPassword: string, newPassword: string) {
    return apiClient.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
  }

  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('hotel_token');
  }
}