import { Router } from 'express';
import { HotelController } from '../controllers/hotel.controller';

const router = Router();

// Todas as rotas públicas
router.get('/rooms', HotelController.getAllRooms);
router.get('/rooms/:id', HotelController.getRoomById);
router.post('/rooms', HotelController.createRoom);
router.put('/rooms/:id', HotelController.updateRoom);
router.delete('/rooms/:id', HotelController.deleteRoom);

router.get('/reservations/future', HotelController.getFutureReservations);
router.get('/reservations/active/:roomId', HotelController.getActiveReservationByRoom);
router.post('/reservations', HotelController.createReservation);
router.put('/reservations/:id/cancel', HotelController.cancelReservation);
router.put('/reservations/:id/checkin', HotelController.checkIn);
router.put('/reservations/:id/checkout', HotelController.checkOut);

router.get('/statistics', HotelController.getStatistics);
router.get('/guests/:guestId/expenses', HotelController.getGuestExpenses);
router.post('/guests/:guestId/expenses', HotelController.addExpense);

export default router;