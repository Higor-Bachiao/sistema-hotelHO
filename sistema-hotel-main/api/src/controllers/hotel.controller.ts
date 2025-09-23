import { Request, Response } from 'express';
import { HotelService } from '../services/hotel.service';

export class HotelController {
  // ROOMS
  static async getAllRooms(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        type: req.query.type as string,
        status: req.query.status as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      };

      const rooms = await HotelService.getAllRooms(filters);

      res.json({
        success: true,
        data: rooms
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getRoomById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'ID do quarto é obrigatório'
        });
        return;
      }
      
      const room = await HotelService.getRoomById(id);

      if (!room) {
        res.status(404).json({
          success: false,
          error: 'Quarto não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: room
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async createRoom(req: Request, res: Response): Promise<void> {
    try {
      const roomData = req.body;
      const room = await HotelService.createRoom(roomData);

      res.status(201).json({
        success: true,
        data: room
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async updateRoom(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'ID do quarto é obrigatório'
        });
        return;
      }

      const room = await HotelService.updateRoom(id, updates);

      res.json({
        success: true,
        data: room
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async deleteRoom(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'ID do quarto é obrigatório'
        });
        return;
      }

      await HotelService.deleteRoom(id);

      res.json({
        success: true,
        message: 'Quarto deletado com sucesso'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // RESERVATIONS
  static async getFutureReservations(req: Request, res: Response): Promise<void> {
    try {
      const reservations = await HotelService.getFutureReservations();

      res.json({
        success: true,
        data: reservations
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getActiveReservationByRoom(req: Request, res: Response): Promise<void> {
    try {
      const { roomId } = req.params;
      
      if (!roomId) {
        res.status(400).json({
          success: false,
          error: 'Room ID é obrigatório'
        });
        return;
      }

      const reservation = await HotelService.getActiveReservationByRoom(roomId);

      res.json({
        success: true,
        data: reservation
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async createReservation(req: Request, res: Response): Promise<void> {
    try {
      const reservationData = req.body;
      const reservation = await HotelService.createReservation(reservationData);

      res.status(201).json({
        success: true,
        data: reservation
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async cancelReservation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'ID da reserva é obrigatório'
        });
        return;
      }

      await HotelService.cancelReservation(id);

      res.json({
        success: true,
        message: 'Reserva cancelada com sucesso'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async checkIn(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'ID da reserva é obrigatório'
        });
        return;
      }

      await HotelService.checkIn(id);

      res.json({
        success: true,
        message: 'Check-in realizado com sucesso'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async checkOut(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'ID da reserva é obrigatório'
        });
        return;
      }

      await HotelService.checkOut(id);

      res.json({
        success: true,
        message: 'Check-out realizado com sucesso'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // EXPENSES
  static async addExpense(req: Request, res: Response): Promise<void> {
    try {
      const { guestId } = req.params;
      const expenseData = req.body;

      if (!guestId) {
        res.status(400).json({
          success: false,
          error: 'ID do hóspede é obrigatório'
        });
        return;
      }

      const expense = await HotelService.addExpense(guestId, expenseData);

      res.status(201).json({
        success: true,
        data: expense
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getGuestExpenses(req: Request, res: Response): Promise<void> {
    try {
      const { guestId } = req.params;

      if (!guestId) {
        res.status(400).json({
          success: false,
          error: 'ID do hóspede é obrigatório'
        });
        return;
      }

      const expenses = await HotelService.getGuestExpenses(guestId);

      res.json({
        success: true,
        data: expenses
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // STATISTICS
  static async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await HotelService.getHotelStatistics();

      res.json({
        success: true,
        data: statistics
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}