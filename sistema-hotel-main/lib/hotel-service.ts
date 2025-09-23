import { HotelApiService } from './api/hotel.service';
import type { Room, Reservation, Expense, HotelFilters, HotelStatistics } from "@/types/hotel"

export class HotelService {
  // ROOMS
  static async getAllRooms(filters?: HotelFilters): Promise<Room[]> {
    const response = await HotelApiService.getAllRooms(filters);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erro ao buscar quartos');
    }
    return response.data;
  }

  static async createRoom(room: Omit<Room, "id">): Promise<string> {
    const response = await HotelApiService.createRoom(room);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erro ao criar quarto');
    }
    return response.data.id;
  }

  static async updateRoom(id: string, updates: Partial<Room>): Promise<void> {
    const response = await HotelApiService.updateRoom(id, updates);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao atualizar quarto');
    }
  }

  static async deleteRoom(id: string): Promise<void> {
    const response = await HotelApiService.deleteRoom(id);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao deletar quarto');
    }
  }

  // RESERVATIONS
  static async getFutureReservations(): Promise<Reservation[]> {
    const response = await HotelApiService.getFutureReservations();
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erro ao buscar reservas futuras');
    }
    return response.data;
  }

  static async createReservation(reservation: Omit<Reservation, "id" | "createdAt">): Promise<string> {
    const response = await HotelApiService.createReservation(reservation);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erro ao criar reserva');
    }
    return response.data.id;
  }

  static async cancelReservation(reservationId: string): Promise<void> {
    const response = await HotelApiService.cancelReservation(reservationId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao cancelar reserva');
    }
  }

  // CHECK-IN/CHECK-OUT
  static async checkIn(reservationId: string): Promise<void> {
    const response = await HotelApiService.checkIn(reservationId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao fazer check-in');
    }
  }

  static async checkOut(reservationId: string): Promise<void> {
    const response = await HotelApiService.checkOut(reservationId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao fazer check-out');
    }
  }

  // EXPENSES
  static async addExpense(guestId: string, expense: Expense): Promise<void> {
    const response = await HotelApiService.addExpense(guestId, expense);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao adicionar despesa');
    }
  }

  static async getGuestExpenses(guestId: string): Promise<Expense[]> {
    const response = await HotelApiService.getGuestExpenses(guestId);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erro ao buscar despesas');
    }
    return response.data;
  }

  // STATISTICS
  static async getHotelStatistics(): Promise<HotelStatistics> {
    const response = await HotelApiService.getStatistics();
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erro ao buscar estatísticas');
    }
    return response.data;
  }
}