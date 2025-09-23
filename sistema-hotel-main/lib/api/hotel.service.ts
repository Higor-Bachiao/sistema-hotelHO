import { apiClient } from './client';
import type { Room, Reservation, Expense, HotelStatistics, HotelFilters } from '@/types/hotel';

export class HotelApiService {
  // ROOMS
  static async getAllRooms(filters?: HotelFilters) {
    const params = new URLSearchParams();
    
    if (filters?.type && filters.type !== 'all') {
      params.append('type', filters.type);
    }
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters?.minPrice) {
      params.append('minPrice', filters.minPrice.toString());
    }
    if (filters?.maxPrice) {
      params.append('maxPrice', filters.maxPrice.toString());
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/hotel/rooms?${queryString}` : '/hotel/rooms';
    
    return apiClient.get<Room[]>(endpoint);
  }

  static async getRoomById(id: string) {
    return apiClient.get<Room>(`/hotel/rooms/${id}`);
  }

  static async createRoom(room: Omit<Room, 'id'>) {
    return apiClient.post<Room>('/hotel/rooms', room);
  }

  static async updateRoom(id: string, updates: Partial<Room>) {
    return apiClient.put<Room>(`/hotel/rooms/${id}`, updates);
  }

  static async deleteRoom(id: string) {
    return apiClient.delete(`/hotel/rooms/${id}`);
  }

  // RESERVATIONS
  static async getFutureReservations() {
    return apiClient.get<Reservation[]>('/hotel/reservations/future');
  }

  static async createReservation(reservation: Omit<Reservation, 'id' | 'createdAt'>) {
    return apiClient.post<Reservation>('/hotel/reservations', reservation);
  }

  static async cancelReservation(reservationId: string) {
    return apiClient.put(`/hotel/reservations/${reservationId}/cancel`);
  }

  static async checkIn(reservationId: string) {
    return apiClient.put(`/hotel/reservations/${reservationId}/checkin`);
  }

  static async checkOut(reservationId: string) {
    return apiClient.put(`/hotel/reservations/${reservationId}/checkout`);
  }

  // EXPENSES
  static async addExpense(guestId: string, expense: Omit<Expense, 'id'>) {
    return apiClient.post<Expense>(`/hotel/guests/${guestId}/expenses`, expense);
  }

  static async getGuestExpenses(guestId: string) {
    return apiClient.get<Expense[]>(`/hotel/guests/${guestId}/expenses`);
  }

  // STATISTICS
  static async getStatistics() {
    return apiClient.get<HotelStatistics>('/hotel/statistics');
  }
}