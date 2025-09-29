import { Router } from 'express';
import { HotelController } from '../controllers/hotel.controller';
import { cacheMiddleware, invalidateCacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();

// Aplicar cache em rotas GET (30 segundos)
const cacheGET = cacheMiddleware(30000);

// Invalidar cache em operações de escrita
const invalidateRooms = invalidateCacheMiddleware(['rooms', 'statistics']);
const invalidateReservations = invalidateCacheMiddleware(['reservations', 'rooms', 'statistics']);

// Rotas com cache para leitura
router.get('/rooms', cacheGET, HotelController.getAllRooms);
router.get('/rooms/:id', cacheGET, HotelController.getRoomById);
router.get('/reservations/future', cacheGET, HotelController.getFutureReservations);
router.get('/reservations/active/:roomId', cacheGET, HotelController.getActiveReservationByRoom);
router.get('/statistics', cacheMiddleware(120000), HotelController.getStatistics); // Cache mais longo para estatísticas
router.get('/guests/:guestId/expenses', cacheGET, HotelController.getGuestExpenses);

// Rotas de escrita com invalidação de cache
router.post('/rooms', invalidateRooms, HotelController.createRoom);
router.put('/rooms/:id', invalidateRooms, HotelController.updateRoom);
router.delete('/rooms/:id', invalidateRooms, HotelController.deleteRoom);

router.post('/reservations', invalidateReservations, HotelController.createReservation);
router.put('/reservations/:id/cancel', invalidateReservations, HotelController.cancelReservation);
router.put('/reservations/:id/checkin', invalidateReservations, HotelController.checkIn);
router.put('/reservations/:id/checkout', invalidateReservations, HotelController.checkOut);

router.post('/guests/:guestId/expenses', invalidateCacheMiddleware(['expenses', 'statistics']), HotelController.addExpense);

// Rota para sincronização manual (sem cache)
router.post('/sync/reservations', HotelController.syncReservations);

export default router;