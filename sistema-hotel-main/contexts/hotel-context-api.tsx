"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import type { Room, Reservation, HotelFilters, HotelStatistics, Expense, Guest } from "@/types/hotel"
import { HotelService } from "@/lib/hotel-service"
import { getNumberOfNights } from "@/lib/price-utils"

// Nova interface para histórico de hóspedes
interface GuestHistory {
  id: string
  guest: Guest
  roomNumber: string
  roomType: string
  checkInDate: string
  checkOutDate: string
  totalPrice: number
  status: "active" | "completed" | "cancelled"
  createdAt: string
}

interface HotelContextType {
  rooms: Room[]
  filteredRooms: Room[]
  filters: HotelFilters
  setFilters: (filters: HotelFilters) => void
  clearFilters: () => void
  searchRooms: (term: string) => void
  addRoom: (room: Omit<Room, "id" | "status" | "guest">) => Promise<void>
  updateRoom: (roomId: string, updates: Partial<Room>) => Promise<void>
  deleteRoom: (roomId: string) => Promise<void>
  checkoutRoom: (roomId: string) => Promise<void>
  makeReservation: (reservation: Omit<Reservation, "id" | "createdAt">) => Promise<void>
  addExpenseToRoom: (roomId: string, expense: Expense) => Promise<void>
  getStatistics: () => Promise<HotelStatistics>
  getFutureReservations: () => Promise<Reservation[]>
  futureReservations: Reservation[]
  cancelFutureReservation: (reservationId: string) => Promise<void>
  guestHistory: GuestHistory[]
  getGuestHistory: () => GuestHistory[]
  deleteGuestHistory: (historyId: string) => void
  isLoading: boolean
  error: string | null
  lastSync: Date | null
  isOnline: boolean
  refreshData: () => Promise<void>
}

const HotelContext = createContext<HotelContextType | undefined>(undefined)

export function HotelProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [filters, setFilters] = useState<HotelFilters>({
    type: "all",
    status: "all",
    minPrice: 0,
    maxPrice: 1000,
  })
  const [futureReservations, setFutureReservations] = useState<Reservation[]>([])
  const [guestHistory, setGuestHistory] = useState<GuestHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const searchTerm = useRef("")

  // Carregar dados iniciais
  useEffect(() => {
    refreshData()
  }, [])

  // Monitorar status online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Função para atualizar dados da API
  const refreshData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Carregar quartos
      const roomsData = await HotelService.getAllRooms(filters)
      setRooms(roomsData)
      
      // Carregar reservas futuras
      const reservationsData = await HotelService.getFutureReservations()
      setFutureReservations(reservationsData)
      
      setLastSync(new Date())
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar dados')
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Aplicar filtros
  useEffect(() => {
    const applyFilters = async () => {
      try {
        const filtered = await HotelService.getAllRooms(filters)
        let result = filtered

        // Aplicar busca textual se houver
        if (searchTerm.current) {
          result = result.filter(room =>
            room.number.toLowerCase().includes(searchTerm.current.toLowerCase()) ||
            room.type.toLowerCase().includes(searchTerm.current.toLowerCase())
          )
        }

        setFilteredRooms(result)
      } catch (error: any) {
        setError(error.message || 'Erro ao filtrar quartos')
      }
    }

    applyFilters()
  }, [filters, rooms])

  const clearFilters = () => {
    setFilters({
      type: "all",
      status: "all",
      minPrice: 0,
      maxPrice: 1000,
    })
    searchTerm.current = ""
  }

  const searchRooms = (term: string) => {
    searchTerm.current = term
    
    let result = rooms
    if (term) {
      result = rooms.filter(room =>
        room.number.toLowerCase().includes(term.toLowerCase()) ||
        room.type.toLowerCase().includes(term.toLowerCase())
      )
    }
    
    setFilteredRooms(result)
  }

  const addRoom = async (room: Omit<Room, "id" | "status" | "guest">) => {
    setIsLoading(true)
    try {
      const newRoomData = {
        ...room,
        status: "available" as const
      }
      await HotelService.createRoom(newRoomData)
      await refreshData() // Recarregar dados
    } catch (error: any) {
      setError(error.message || 'Erro ao adicionar quarto')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateRoom = async (roomId: string, updates: Partial<Room>) => {
    setIsLoading(true)
    try {
      await HotelService.updateRoom(roomId, updates)
      await refreshData() // Recarregar dados
    } catch (error: any) {
      setError(error.message || 'Erro ao atualizar quarto')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const deleteRoom = async (roomId: string) => {
    setIsLoading(true)
    try {
      await HotelService.deleteRoom(roomId)
      await refreshData() // Recarregar dados
    } catch (error: any) {
      setError(error.message || 'Erro ao deletar quarto')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const checkoutRoom = async (roomId: string) => {
    setIsLoading(true)
    try {
      // Encontrar a reserva ativa para este quarto
      const room = rooms.find(r => r.id === roomId)
      if (!room?.guest) {
        throw new Error('Nenhum hóspede encontrado neste quarto')
      }

      // Implementar lógica de checkout através da API
      // Por enquanto, apenas atualizar o status do quarto
      await HotelService.updateRoom(roomId, { status: 'available' })
      await refreshData()
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer checkout')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const makeReservation = async (reservation: Omit<Reservation, "id" | "createdAt">) => {
    setIsLoading(true)
    try {
      await HotelService.createReservation(reservation)
      await refreshData() // Recarregar dados
    } catch (error: any) {
      setError(error.message || 'Erro ao criar reserva')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const addExpenseToRoom = async (roomId: string, expense: Expense) => {
    setIsLoading(true)
    try {
      // Encontrar o hóspede do quarto
      const room = rooms.find(r => r.id === roomId)
      if (!room?.guest?.id) {
        throw new Error('Nenhum hóspede encontrado neste quarto')
      }

      await HotelService.addExpense(room.guest.id, expense)
      await refreshData() // Recarregar dados
    } catch (error: any) {
      setError(error.message || 'Erro ao adicionar despesa')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const getStatistics = async (): Promise<HotelStatistics> => {
    try {
      return await HotelService.getHotelStatistics()
    } catch (error: any) {
      setError(error.message || 'Erro ao buscar estatísticas')
      throw error
    }
  }

  const getFutureReservationsData = async (): Promise<Reservation[]> => {
    try {
      return await HotelService.getFutureReservations()
    } catch (error: any) {
      setError(error.message || 'Erro ao buscar reservas futuras')
      throw error
    }
  }

  const cancelFutureReservation = async (reservationId: string) => {
    setIsLoading(true)
    try {
      await HotelService.cancelReservation(reservationId)
      await refreshData() // Recarregar dados
    } catch (error: any) {
      setError(error.message || 'Erro ao cancelar reserva')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const getGuestHistory = () => {
    // Implementar histórico de hóspedes baseado nas reservas
    return guestHistory
  }

  const deleteGuestHistory = (historyId: string) => {
    setGuestHistory(prev => prev.filter(history => history.id !== historyId))
  }

  const value: HotelContextType = {
    rooms,
    filteredRooms,
    filters,
    setFilters,
    clearFilters,
    searchRooms,
    addRoom,
    updateRoom,
    deleteRoom,
    checkoutRoom,
    makeReservation,
    addExpenseToRoom,
    getStatistics,
    getFutureReservations: getFutureReservationsData,
    futureReservations,
    cancelFutureReservation,
    guestHistory,
    getGuestHistory,
    deleteGuestHistory,
    isLoading,
    error,
    lastSync,
    isOnline,
    refreshData,
  }

  return <HotelContext.Provider value={value}>{children}</HotelContext.Provider>
}

export function useHotel() {
  const context = useContext(HotelContext)
  if (context === undefined) {
    throw new Error("useHotel must be used within a HotelProvider")
  }
  return context
}