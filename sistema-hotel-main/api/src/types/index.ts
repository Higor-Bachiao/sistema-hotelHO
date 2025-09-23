export interface Room {
  id: string;
  number: string;
  type: string;
  capacity: number;
  beds: number;
  price: number;
  amenities: any; // JSONB do Postgres
  status: "available" | "occupied" | "maintenance" | "cleaning" | "reserved";
}

export interface Guest {
  id: string;
  name: string;
  email: string; // Obrigatório no banco
  phone?: string;
  cpf?: string; // Opcional mas unique quando presente
  check_in: string; // DATE no formato string
  check_out: string; // DATE no formato string
  num_guests: number;
}

export interface Reservation {
  id: string;
  room_id: string;
  guest_id: string;
  status: 'future' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  created_at: string;
}

export interface Expense {
  id: number; // SERIAL no Postgres
  guest_id: string;
  description: string;
  value: number; // Campo chamado 'value' no banco
  created_at: string;
}

export interface HotelFilters {
  type?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface HotelStatistics {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  reservedRooms: number;
  maintenanceRooms: number;
  occupancyRate: number;
  roomsByType: Record<string, number>;
  monthlyRevenue: number;
  activeGuests: number;
}

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

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}