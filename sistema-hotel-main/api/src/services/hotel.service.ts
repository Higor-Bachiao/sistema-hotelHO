import { supabaseAdmin } from '../config/database';
import { Room, Guest, Reservation, Expense, HotelStatistics, HotelFilters } from '../types';

// Cache para evitar requests desnecessárias
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time To Live em ms
}

class CacheManager {
  private static cache = new Map<string, CacheEntry<any>>();
  
  static set<T>(key: string, data: T, ttlMs: number = 30000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }
  
  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  static invalidate(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}

// Debounce para sincronização
let syncInProgress = false;
let lastSyncTime = 0;

// Tipos auxiliares para conversão entre camelCase (frontend) e snake_case (banco)
interface DatabaseGuest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  check_in: string;
  check_out: string;
  num_guests: number;
}

interface DatabaseReservation {
  id: string;
  room_id: string;
  guest_id: string;
  status: string;
  created_at: string;
}

export class HotelService {
  // ROOMS
  static async getAllRooms(filters?: HotelFilters): Promise<Room[]> {
    // Verificar cache primeiro
    const cacheKey = `rooms:${JSON.stringify(filters || {})}`;
    const cachedRooms = CacheManager.get<Room[]>(cacheKey);
    if (cachedRooms) {
      console.log('✅ Rooms carregados do cache');
      return cachedRooms;
    }

    // Sincronizar apenas se necessário (debounce de 1 minuto)
    const now = Date.now();
    if (now - lastSyncTime > 60000 && !syncInProgress) {
      await HotelService.syncReservationStatuses();
      lastSyncTime = now;
    }
    
    let query = supabaseAdmin.from('rooms').select('*');

    if (filters?.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    const { data: rooms, error } = await query.order('number');

    if (error) {
      throw new Error(`Erro ao buscar quartos: ${error.message}`);
    }

    // Buscar reservas ativas e futuras para atualizar status dos quartos
    const { data: activeReservations } = await supabaseAdmin
      .from('reservations')
      .select('room_id, status')
      .in('status', ['active', 'future']);

    // Criar mapa de quartos com reservas
    const roomReservationMap = new Map();
    activeReservations?.forEach(reservation => {
      roomReservationMap.set(reservation.room_id, reservation.status);
    });

    // Atualizar status dos quartos baseado nas reservas
    const roomsWithUpdatedStatus = (rooms || []).map(room => {
      const reservationStatus = roomReservationMap.get(room.id);
      
      if (reservationStatus === 'active') {
        return { ...room, status: 'occupied' };
      } else if (reservationStatus === 'future' && room.status === 'available') {
        return { ...room, status: 'reserved' };
      }
      
      return room;
    });

    // Cachear resultado por 30 segundos
    CacheManager.set(cacheKey, roomsWithUpdatedStatus, 30000);
    console.log('✅ Rooms carregados do banco e cacheados');
    
    return roomsWithUpdatedStatus;
  }

  // Função para sincronizar status dos quartos com as reservas
  static async syncRoomStatuses(): Promise<void> {
    
    // Buscar todas as reservas ativas e futuras
    const { data: activeReservations } = await supabaseAdmin
      .from('reservations')
      .select('room_id, status')
      .in('status', ['active', 'future']);

    // Buscar todos os quartos
    const { data: rooms } = await supabaseAdmin
      .from('rooms')
      .select('id, status');

    if (!rooms || !activeReservations) return;

    // Criar mapa de quartos com reservas
    const roomReservationMap = new Map();
    activeReservations.forEach(reservation => {
      roomReservationMap.set(reservation.room_id, reservation.status);
    });

    // Atualizar status dos quartos
    const updatePromises = rooms.map(async room => {
      const reservationStatus = roomReservationMap.get(room.id);
      let newStatus = room.status;

      if (reservationStatus === 'active') {
        newStatus = 'occupied';
      } else if (reservationStatus === 'future' && room.status === 'available') {
        newStatus = 'reserved';
      } else if (!reservationStatus && (room.status === 'occupied' || room.status === 'reserved')) {
        // Se não há reserva mas quarto está ocupado/reservado, liberar
        newStatus = 'available';
      }

      if (newStatus !== room.status) {
        await supabaseAdmin
          .from('rooms')
          .update({ status: newStatus })
          .eq('id', room.id);
      }
    });

    await Promise.all(updatePromises);
    console.log('✅ Sincronização de status dos quartos concluída');
  }

  // Função para sincronizar status das reservas baseado na data atual
  static async syncReservationStatuses(): Promise<void> {
    if (syncInProgress) {
      console.log('⏳ Sincronização já em andamento, pulando...');
      return;
    }
    
    try {
      syncInProgress = true;
      console.log('🔄 Sincronizando status das reservas...');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Buscar reservas futuras que já passaram da data de check-in
      const { data: overdueReservations, error: overdueError } = await supabaseAdmin
        .from('reservations')
        .select(`
          id,
          room_id,
          status,
          guests!inner (
            check_in,
            check_out,
            name
          )
        `)
        .eq('status', 'future');

      if (overdueError) {
        console.error('❌ Erro ao buscar reservas em atraso:', overdueError);
        return;
      }

      if (!overdueReservations || overdueReservations.length === 0) {
        console.log('✅ Nenhuma reserva futura para verificar');
        return;
      }

      // Atualizar reservas que já passaram da data
      const updatePromises = overdueReservations.map(async (reservation) => {
        const guest = Array.isArray(reservation.guests) ? reservation.guests[0] : reservation.guests;
        if (!guest) return;

        const checkInDate = new Date(guest.check_in);
        const checkOutDate = new Date(guest.check_out);
        checkInDate.setHours(0, 0, 0, 0);
        checkOutDate.setHours(0, 0, 0, 0);

        let newStatus = 'future';
        let newRoomStatus = null;

        // Determinar novo status baseado nas datas
        if (today >= checkOutDate) {
          // Já passou do check-out, marcar como completada
          newStatus = 'completed';
          newRoomStatus = 'available';
          console.log(`📅 Reserva ${reservation.id} completada (passou do check-out)`);
        } else if (today >= checkInDate) {
          // Já passou do check-in, marcar como ativa
          newStatus = 'active';
          newRoomStatus = 'occupied';
          console.log(`📅 Reserva ${reservation.id} agora está ativa (check-in chegou)`);
        }

        // Atualizar status da reserva se necessário
        if (newStatus !== 'future') {
          await supabaseAdmin
            .from('reservations')
            .update({ status: newStatus })
            .eq('id', reservation.id);

          // Atualizar status do quarto se necessário
          if (newRoomStatus) {
            await supabaseAdmin
              .from('rooms')
              .update({ status: newRoomStatus })
              .eq('id', reservation.room_id);
          }
        }
      });

      await Promise.all(updatePromises);
      console.log('✅ Sincronização de reservas concluída');
      
      // Invalidar cache relacionado
      CacheManager.invalidate('rooms');
      CacheManager.invalidate('reservations');
      
    } catch (error: any) {
      console.error('❌ Erro ao sincronizar status das reservas:', error);
    } finally {
      syncInProgress = false;
    }
  }

  static async getRoomById(id: string): Promise<Room | null> {
    const { data, error } = await supabaseAdmin
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Erro ao buscar quarto: ${error.message}`);
    }

    return data;
  }

  static async createRoom(room: Omit<Room, 'id'>): Promise<Room> {
    const { data, error } = await supabaseAdmin
      .from('rooms')
      .insert([{
        number: room.number,
        type: room.type,
        capacity: room.capacity,
        beds: room.beds,
        price: room.price,
        amenities: room.amenities,
        status: room.status
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar quarto: ${error.message}`);
    }

    // Invalidar cache de rooms
    CacheManager.invalidate('rooms');
    
    return data;
  }

  static async updateRoom(id: string, updates: Partial<Room>): Promise<Room> {
    const { data, error } = await supabaseAdmin
      .from('rooms')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar quarto: ${error.message}`);
    }

    // Invalidar cache relacionado
    CacheManager.invalidate('rooms');
    CacheManager.invalidate('statistics');
    
    return data;
  }

  static async deleteRoom(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('rooms')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar quarto: ${error.message}`);
    }
  }

  // GUESTS
  static async createGuest(guest: Omit<Guest, 'id'>): Promise<Guest> {
    // Gerar um ID único para o hóspede
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { data, error } = await supabaseAdmin
      .from('guests')
      .insert([{
        id: guestId,
        name: guest.name,
        email: guest.email,
        phone: guest.phone,
        cpf: guest.cpf,
        check_in: (guest as any).checkIn,
        check_out: (guest as any).checkOut,
        num_guests: (guest as any).guests
      }])
      .select()
      .single();

    if (error) {
      // Tratamento específico para erros de constraint
      if (error.code === '23505') { // Unique constraint violation
        if (error.message.includes('guests_email_key')) {
          throw new Error('Este email já está cadastrado para outro hóspede');
        } else if (error.message.includes('guests_cpf_key')) {
          throw new Error('Este CPF já está cadastrado para outro hóspede');
        }
      }
      throw new Error(`Erro ao criar hóspede: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      cpf: data.cpf,
      check_in: data.check_in,
      check_out: data.check_out,
      num_guests: data.num_guests
    };
  }

  static async findOrCreateGuest(guestData: any): Promise<Guest> {
    console.log('🔍 Buscando hóspede existente...', { email: guestData.email, cpf: guestData.cpf });
    
    let existingGuest = null;

    // Primeiro, tentar encontrar hóspede existente pelo email
    if (guestData.email) {
      const { data } = await supabaseAdmin
        .from('guests')
        .select('*')
        .eq('email', guestData.email)
        .single();
      
      if (data) {
        existingGuest = data;
      }
    }

    // Se não encontrou por email, tentar por CPF
    if (!existingGuest && guestData.cpf) {
      const { data } = await supabaseAdmin
        .from('guests')
        .select('*')
        .eq('cpf', guestData.cpf)
        .single();
      
      if (data) {
        console.log('✅ Hóspede encontrado por CPF:', data.id);
        existingGuest = data;
      }
    }

    if (existingGuest) {
      console.log('🔄 Atualizando dados do hóspede existente...');
      // Atualizar dados do hóspede existente
      const { data: updatedGuest, error: updateError } = await supabaseAdmin
        .from('guests')
        .update({
          name: guestData.name,
          email: guestData.email,
          phone: guestData.phone,
          cpf: guestData.cpf,
          check_in: guestData.checkIn,
          check_out: guestData.checkOut,
          num_guests: guestData.guests
        })
        .eq('id', existingGuest.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Erro ao atualizar hóspede: ${updateError.message}`);
      }

      console.log('✅ Hóspede atualizado com sucesso');
      return {
        id: updatedGuest.id,
        name: updatedGuest.name,
        email: updatedGuest.email,
        phone: updatedGuest.phone,
        cpf: updatedGuest.cpf,
        check_in: updatedGuest.check_in,
        check_out: updatedGuest.check_out,
        num_guests: updatedGuest.num_guests
      };
    }

    console.log('➕ Criando novo hóspede...');
    // Se não encontrou, criar novo hóspede
    return await HotelService.createGuest(guestData);
  }

  static async getGuestById(id: string): Promise<Guest | null> {
    const { data, error } = await supabaseAdmin
      .from('guests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Erro ao buscar hóspede: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      cpf: data.cpf,
      check_in: data.check_in,
      check_out: data.check_out,
      num_guests: data.num_guests
    };
  }

  // RESERVATIONS
  static async getFutureReservations(): Promise<any[]> {
    try {
      console.log('🔍 Buscando reservas futuras...');
      
      // Sincronizar status das reservas antes de buscar
      await HotelService.syncReservationStatuses();
      
      const { data, error } = await supabaseAdmin
        .from('reservations')
        .select(`
          id,
          room_id,
          guest_id,
          status,
          created_at,
          guests:guest_id(id, name, email, phone, cpf, check_in, check_out, num_guests),
          rooms:room_id(id, number, type, price)
        `)
        .eq('status', 'future')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar reservas:', error);
        throw new Error(`Erro ao buscar reservas futuras: ${error.message}`);
      }

      console.log(`✅ Encontradas ${data?.length || 0} reservas futuras`);
      console.log('📋 Dados das reservas:', JSON.stringify(data, null, 2));
      
      return (data || []).map(reservation => {
        const guest = Array.isArray(reservation.guests) ? reservation.guests[0] : reservation.guests;
        const room = Array.isArray(reservation.rooms) ? reservation.rooms[0] : reservation.rooms;
        
        return {
          id: reservation.id,
          roomId: reservation.room_id,
          guestId: reservation.guest_id,
          status: reservation.status,
          createdAt: reservation.created_at,
          guest: guest ? {
            id: guest.id,
            name: guest.name,
            email: guest.email,
            phone: guest.phone,
            cpf: guest.cpf,
            checkIn: guest.check_in,
            checkOut: guest.check_out,
            numGuests: guest.num_guests
          } : null,
          room: room ? {
            id: room.id,
            number: room.number,
            type: room.type,
            price: room.price
          } : null
        };
      });
    } catch (error: any) {
      console.error('❌ Erro ao buscar reservas futuras:', error);
      return [];
    }
  }

  static async getActiveReservationByRoom(roomId: string): Promise<any | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('reservations')
        .select('*')
        .eq('room_id', roomId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar reserva ativa:', error);
      return null;
    }
  }

  // Função para verificar conflitos de datas entre reservas
  static async checkReservationConflicts(
    roomId: string, 
    newCheckIn: string, 
    newCheckOut: string
  ): Promise<{ hasConflict: boolean; message?: string }> {
    try {
      console.log('🔍 Verificando conflitos para quarto:', roomId, 'período:', newCheckIn, 'até', newCheckOut);
      
      // Buscar todas as reservas ativas e futuras para este quarto
      const { data: existingReservations, error } = await supabaseAdmin
        .from('reservations')
        .select(`
          id,
          status,
          guest_id,
          guests!inner (
            check_in,
            check_out,
            name
          )
        `)
        .eq('room_id', roomId)
        .in('status', ['active', 'future']);

      if (error) {
        console.error('❌ Erro ao buscar reservas existentes:', error);
        return { hasConflict: false };
      }

      console.log('📋 Reservas encontradas:', existingReservations?.length || 0);

      if (!existingReservations || existingReservations.length === 0) {
        console.log('✅ Nenhuma reserva existente, sem conflito');
        return { hasConflict: false };
      }

      const newCheckInDate = new Date(newCheckIn);
      const newCheckOutDate = new Date(newCheckOut);

      // Verificar sobreposição com cada reserva existente
      for (const reservation of existingReservations) {
        const guest = Array.isArray(reservation.guests) ? reservation.guests[0] : reservation.guests;
        if (!guest) continue;

        const existingCheckIn = new Date(guest.check_in);
        const existingCheckOut = new Date(guest.check_out);

        console.log('🔄 Comparando com reserva existente:', {
          guestName: guest.name,
          existingPeriod: `${existingCheckIn.toLocaleDateString()} até ${existingCheckOut.toLocaleDateString()}`,
          newPeriod: `${newCheckInDate.toLocaleDateString()} até ${newCheckOutDate.toLocaleDateString()}`
        });

        // Verifica se há sobreposição de datas
        const hasOverlap = (newCheckInDate < existingCheckOut && newCheckOutDate > existingCheckIn);

        if (hasOverlap) {
          const guestName = guest.name || 'Hóspede';
          const existingCheckInFormatted = existingCheckIn.toLocaleDateString('pt-BR');
          const existingCheckOutFormatted = existingCheckOut.toLocaleDateString('pt-BR');
          
          console.log('❌ Conflito detectado!');
          
          return {
            hasConflict: true,
            message: `Este quarto já possui uma reserva para ${guestName} de ${existingCheckInFormatted} a ${existingCheckOutFormatted}`
          };
        }
      }

      console.log('✅ Nenhum conflito detectado');
      return { hasConflict: false };
    } catch (error: any) {
      console.error('❌ Erro ao verificar conflitos de reserva:', error);
      return { hasConflict: false };
    }
  }

  static async createReservation(reservation: Omit<Reservation, 'id' | 'createdAt'>): Promise<Reservation> {
    const reservationData = reservation as any;
    
    console.log('🔄 Criando reserva - dados recebidos:', {
      roomId: reservationData.roomId,
      guestName: reservationData.guest?.name,
      guestEmail: reservationData.guest?.email,
      guestCpf: reservationData.guest?.cpf,
      checkIn: reservationData.guest?.checkIn,
      checkOut: reservationData.guest?.checkOut
    });
    
    // Verificar se o quarto existe
    const room = await HotelService.getRoomById(reservationData.roomId);
    if (!room) {
      throw new Error('Quarto não encontrado');
    }

    // Verificar conflitos de datas com reservas existentes
    const hasConflict = await HotelService.checkReservationConflicts(
      reservationData.roomId,
      reservationData.guest.checkIn,
      reservationData.guest.checkOut
    );

    if (hasConflict.hasConflict) {
      throw new Error(`Conflito de datas: ${hasConflict.message}`);
    }

    // Verificar se o quarto pode receber reservas
    // Permite reservas em quartos disponíveis ou reservados (sem conflito de datas)
    if (room.status === 'maintenance' || room.status === 'cleaning') {
      throw new Error('Quarto não está disponível para reservas (em manutenção ou limpeza)');
    }

    console.log('✅ Quarto e datas verificados, buscando/criando hóspede...');
    
    let guest: Guest;
    let isNewGuest = false;
    
    try {
      // Verificar se hóspede já existe
      let existingGuest = null;
      if (reservationData.guest.email) {
        const { data } = await supabaseAdmin
          .from('guests')
          .select('*')
          .eq('email', reservationData.guest.email)
          .single();
        existingGuest = data;
      }
      
      if (!existingGuest && reservationData.guest.cpf) {
        const { data } = await supabaseAdmin
          .from('guests')
          .select('*')
          .eq('cpf', reservationData.guest.cpf)
          .single();
        existingGuest = data;
      }
      
      if (existingGuest) {
        // Atualizar hóspede existente
        guest = await HotelService.findOrCreateGuest(reservationData.guest);
        console.log('✅ Hóspede existente atualizado:', { id: guest.id, name: guest.name });
      } else {
        // Criar novo hóspede
        guest = await HotelService.createGuest(reservationData.guest);
        isNewGuest = true;
        console.log('✅ Novo hóspede criado:', { id: guest.id, name: guest.name });
      }
    } catch (guestError: any) {
      console.error('❌ Erro ao processar hóspede:', guestError);
      throw new Error(`Erro ao processar hóspede: ${guestError.message}`);
    }

    // Determinar status da reserva
    const checkInDate = new Date(reservationData.guest.checkIn);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const status = checkInDate <= today ? 'active' : 'future';

    console.log('🔄 Criando reserva no banco...', { room_id: reservationData.roomId, guest_id: guest.id, status });

    // Gerar um ID único para a reserva
    const reservationId = `reservation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Criar reserva
    const { data, error } = await supabaseAdmin
      .from('reservations')
      .insert([{
        id: reservationId,
        room_id: reservationData.roomId,
        guest_id: guest.id,
        status: status
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar reserva:', error);
      
      // Se foi criado um novo hóspede e a reserva falhou, fazer rollback
      if (isNewGuest) {
        console.log('🔄 Fazendo rollback do hóspede criado...');
        try {
          await supabaseAdmin
            .from('guests')
            .delete()
            .eq('id', guest.id);
          console.log('✅ Rollback do hóspede concluído');
        } catch (rollbackError) {
          console.error('❌ Erro no rollback do hóspede:', rollbackError);
        }
      }
      
      throw new Error(`Erro ao criar reserva: ${error.message}`);
    }

    console.log('✅ Reserva criada com sucesso:', { id: data.id, status: data.status });

    // Atualizar status do quarto se necessário
    console.log('🔄 Atualizando status do quarto...');
    if (status === 'active') {
      await HotelService.updateRoom(reservationData.roomId, { status: 'occupied' });
      console.log('✅ Quarto marcado como ocupado');
    } else {
      // Por enquanto manter como available até corrigir a interface
      await HotelService.updateRoom(reservationData.roomId, { status: 'available' });
      console.log('✅ Quarto mantido como disponível');
    }

    console.log('🎉 Processo de criação de reserva finalizado com sucesso!');

    // Sincronizar status dos quartos
    await HotelService.syncRoomStatuses();

    return {
      id: data.id,
      room_id: data.room_id,
      guest_id: guest.id,
      status: data.status,
      created_at: data.created_at
    };
  }

  static async cancelReservation(reservationId: string): Promise<void> {
    // Buscar a reserva
    const { data: reservation, error: reservationError } = await supabaseAdmin
      .from('reservations')
      .select('room_id')
      .eq('id', reservationId)
      .single();

    if (reservationError) {
      throw new Error(`Erro ao buscar reserva: ${reservationError.message}`);
    }

    // Atualizar status da reserva
    const { error: updateError } = await supabaseAdmin
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', reservationId);

    if (updateError) {
      throw new Error(`Erro ao cancelar reserva: ${updateError.message}`);
    }

    // Liberar quarto
    await HotelService.updateRoom(reservation.room_id, { status: 'available' });
  }

  // EXPENSES
  static async addExpense(guestId: string, expense: Omit<Expense, 'id'>): Promise<Expense> {
    const { data, error } = await supabaseAdmin
      .from('expenses')
      .insert([{
        guest_id: guestId,
        description: expense.description,
        value: expense.value
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao adicionar despesa: ${error.message}`);
    }

    return {
      id: data.id,
      guest_id: data.guest_id,
      description: data.description,
      value: data.value,
      created_at: data.created_at
    };
  }

  static async getGuestExpenses(guestId: string): Promise<Expense[]> {
    const { data, error } = await supabaseAdmin
      .from('expenses')
      .select('*')
      .eq('guest_id', guestId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar despesas: ${error.message}`);
    }

    return (data || []).map(item => ({
      id: item.id,
      guest_id: item.guest_id,
      description: item.description,
      value: item.value,
      created_at: item.created_at
    }));
  }

  // STATISTICS
  static async getHotelStatistics(): Promise<HotelStatistics> {
    // Verificar cache primeiro (cache mais longo para estatísticas)
    const cacheKey = 'statistics:all';
    const cachedStats = CacheManager.get<HotelStatistics>(cacheKey);
    if (cachedStats) {
      console.log('✅ Estatísticas carregadas do cache');
      return cachedStats;
    }

    console.log('📊 Calculando estatísticas do hotel...');
    
    // Buscar todos os quartos
    const { data: rooms, error: roomsError } = await supabaseAdmin
      .from('rooms')
      .select('*');

    if (roomsError) {
      throw new Error(`Erro ao buscar estatísticas: ${roomsError.message}`);
    }

    // Buscar reservas ativas e futuras
    const { data: activeReservations, error: reservationsError } = await supabaseAdmin
      .from('reservations')
      .select(`
        id,
        room_id,
        status,
        guests:guest_id(id, name, check_in, check_out, num_guests)
      `)
      .in('status', ['active', 'future']);

    if (reservationsError) {
      throw new Error(`Erro ao buscar reservas ativas: ${reservationsError.message}`);
    }

    console.log(`📊 Encontradas ${activeReservations?.length || 0} reservas ativas/futuras`);

    // Criar um mapa de quartos ocupados/reservados por reservas
    const occupiedRoomIds = new Set();
    const reservedRoomIds = new Set();
    
    activeReservations?.forEach(reservation => {
      if (reservation.status === 'active') {
        occupiedRoomIds.add(reservation.room_id);
      } else if (reservation.status === 'future') {
        reservedRoomIds.add(reservation.room_id);
      }
    });

    // Atualizar status dos quartos baseado nas reservas
    const roomsWithUpdatedStatus = rooms?.map(room => {
      if (occupiedRoomIds.has(room.id)) {
        return { ...room, status: 'occupied' };
      } else if (reservedRoomIds.has(room.id) && room.status === 'available') {
        return { ...room, status: 'reserved' };
      }
      return room;
    }) || [];

    // Calcular estatísticas
    const totalRooms = roomsWithUpdatedStatus.length;
    const occupiedRooms = roomsWithUpdatedStatus.filter(room => room.status === 'occupied').length;
    const availableRooms = roomsWithUpdatedStatus.filter(room => room.status === 'available').length;
    const reservedRooms = roomsWithUpdatedStatus.filter(room => room.status === 'reserved').length;
    const maintenanceRooms = roomsWithUpdatedStatus.filter(room => room.status === 'maintenance' || room.status === 'cleaning').length;
    
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
    
    console.log('📊 Estatísticas calculadas:', {
      totalRooms,
      occupiedRooms,
      availableRooms,
      reservedRooms,
      maintenanceRooms,
      occupancyRate: Math.round(occupancyRate * 100) / 100
    });
    
    // Quartos por tipo
    const roomsByType: Record<string, number> = {};
    roomsWithUpdatedStatus.forEach(room => {
      roomsByType[room.type] = (roomsByType[room.type] || 0) + 1;
    });

    // Receita mensal acumulada (baseada em estadias que ocorrem neste mês)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];
    
    console.log(`📊 Calculando receita mensal para período: ${firstDayOfMonth} a ${lastDayOfMonth}`);
    
    // Buscar todas as reservas que têm estadia durante este mês
    const { data: monthlyReservations, error: revenueError } = await supabaseAdmin
      .from('reservations')
      .select(`
        guests(*),
        rooms(price)
      `)
      .in('status', ['active', 'completed', 'future']);

    if (revenueError) {
      console.error('❌ Erro ao buscar reservas para receita:', revenueError);
    }

    console.log(`📋 Encontradas ${monthlyReservations?.length || 0} reservas para análise de receita`);

    let monthlyRevenue = 0;
    
    (monthlyReservations || []).forEach((reservation, index) => {
      const guest = Array.isArray(reservation.guests) ? reservation.guests[0] : reservation.guests;
      const room = Array.isArray(reservation.rooms) ? reservation.rooms[0] : reservation.rooms;
      
      if (!guest || !room) {
        console.log(`⚠️ Reserva ${index + 1}: Dados incompletos (guest: ${!!guest}, room: ${!!room})`);
        return;
      }
      
      const checkIn = new Date(guest.check_in);
      const checkOut = new Date(guest.check_out);
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
      
      // Verificar se a estadia intercepta com o mês atual
      const hasOverlap = checkIn <= lastDay && checkOut >= firstDay;
      
      if (!hasOverlap) {
        console.log(`⏭️ Reserva ${index + 1}: Sem sobreposição com mês atual (${guest.check_in} a ${guest.check_out})`);
        return;
      }
      
      // Calcular período que intercepta com o mês atual
      const stayStart = checkIn > firstDay ? checkIn : firstDay;
      const stayEnd = checkOut < lastDay ? checkOut : lastDay;
      
      // Calcular noites apenas do período dentro do mês atual
      const nightsInMonth = Math.max(0, Math.ceil((stayEnd.getTime() - stayStart.getTime()) / (1000 * 60 * 60 * 24)));
      
      if (nightsInMonth > 0) {
        const totalGuests = guest.num_guests;
        const pricePerPerson = room.price;
        const reservationRevenue = nightsInMonth * totalGuests * pricePerPerson;
        monthlyRevenue += reservationRevenue;
        
        console.log(`💰 Reserva ${index + 1}: ${nightsInMonth} noites × ${totalGuests} hóspedes × R$${pricePerPerson} = R$${reservationRevenue}`);
      } else {
        console.log(`⏭️ Reserva ${index + 1}: 0 noites no mês atual`);
      }
    });

    console.log(`💵 Receita mensal total calculada: R$${monthlyRevenue}`);

    const statistics = {
      totalRooms,
      occupiedRooms,
      availableRooms,
      reservedRooms,
      maintenanceRooms,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      roomsByType,
      monthlyRevenue,
      activeGuests: activeReservations?.length || 0
    };

    // Cachear por 2 minutos (estatísticas podem ser menos frequentes)
    CacheManager.set(cacheKey, statistics, 120000);
    console.log('✅ Estatísticas calculadas e cacheadas');

    return statistics;
  }

  // CHECK-IN/CHECK-OUT
  static async checkIn(reservationId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('reservations')
      .update({ status: 'active' })
      .eq('id', reservationId);

    if (error) {
      throw new Error(`Erro ao fazer check-in: ${error.message}`);
    }
  }

  static async checkOut(reservationId: string): Promise<void> {
    // Buscar a reserva
    const { data: reservation, error: reservationError } = await supabaseAdmin
      .from('reservations')
      .select('room_id')
      .eq('id', reservationId)
      .single();

    if (reservationError) {
      throw new Error(`Erro ao buscar reserva: ${reservationError.message}`);
    }

    // Finalizar reserva
    const { error: updateError } = await supabaseAdmin
      .from('reservations')
      .update({ status: 'completed' })
      .eq('id', reservationId);

    if (updateError) {
      throw new Error(`Erro ao fazer check-out: ${updateError.message}`);
    }

    // Liberar quarto
    await HotelService.updateRoom(reservation.room_id, { status: 'available' });
  }
}