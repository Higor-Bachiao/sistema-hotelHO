export interface Room {
  id: string
  number: string
  type: string
  capacity: number
  beds: number
  price: number // Preço por pessoa
  amenities: string[]
  status: "available" | "occupied" | "maintenance" | "cleaning" | "reserved"
  guest?: Guest
}

// Novo: Interface para despesas
export interface Expense {
  id: number
  guest_id: string
  description: string
  value: number
  created_at: string
}

// Atualizado: Email agora é obrigatório, id opcional para criação
export interface Guest {
  id?: string // Opcional para criação, obrigatório quando retornado
  name: string
  email: string // Agora obrigatório
  phone?: string // Opcional
  cpf?: string // Opcional
  checkIn: string
  checkOut: string
  guests: number
  expenses?: Expense[]
}

export interface Reservation {
  id: string
  roomId: string
  guest: Guest
  createdAt: string
}

export interface HotelFilters {
  type: string
  status: string
  minPrice: number
  maxPrice: number
}

export interface HotelStatistics {
  totalRooms: number
  occupiedRooms: number
  availableRooms: number
  reservedRooms: number
  maintenanceRooms: number
  occupancyRate: number
  roomsByType: Record<string, number>
  monthlyRevenue: number
  activeGuests: number
}
