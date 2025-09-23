"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import type { Room, Reservation, HotelFilters, HotelStatistics, Expense, Guest } from "@/types/hotel"
import { getNumberOfNights } from "@/lib/price-utils"

// Detectar URL da API baseado no ambiente
const getAPIBaseURL = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:3001/api'
  }
  
  // SOLUÇÃO TEMPORÁRIA: Sempre usar o IP da máquina para compartilhar dados
  // Isso garante que localhost e remoto usem a mesma instância da API
  return 'http://192.168.100.36:3001/api'
}

// URL base da API
let API_BASE_URL = getAPIBaseURL()

// Interface para histórico de hóspedes
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
  addRoom: (room: Omit<Room, "id" | "status" | "guest">) => void
  updateRoom: (roomId: string, updates: Partial<Room>) => void
  deleteRoom: (roomId: string) => void
  checkoutRoom: (roomId: string) => void
  makeReservation: (reservation: Omit<Reservation, "id" | "createdAt">) => Promise<void>
  addExpenseToRoom: (roomId: string, expense: Expense) => void
  getStatistics: () => HotelStatistics
  getFutureReservations: () => Room[]
  futureReservations: Reservation[]
  cancelFutureReservation: (reservationId: string) => void
  guestHistory: GuestHistory[]
  getGuestHistory: () => GuestHistory[]
  deleteGuestHistory: (historyId: string) => void
  debugUpdateHistoryStatus: (guestName: string, newStatus: "active" | "completed" | "cancelled") => void
  isLoading: boolean
  error: string | null
  lastSync: Date | null
  isOnline: boolean
}

const HotelContext = createContext<HotelContextType | undefined>(undefined)

export function HotelProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [futureReservations, setFutureReservations] = useState<Reservation[]>([])
  const [guestHistory, setGuestHistory] = useState<GuestHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [filters, setFilters] = useState<HotelFilters>({
    type: "",
    status: "",
    minPrice: 0,
    maxPrice: 1000,
  })

  // 🌐 Inicializar URL da API no lado do cliente
  useEffect(() => {
    API_BASE_URL = getAPIBaseURL()
    console.log('🌐 URL da API configurada para:', API_BASE_URL)
    
    // Fazer uma tentativa simples de conexão
    const testConnection = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)
        
        const response = await fetch(`${API_BASE_URL}/rooms`, { 
          method: 'HEAD',
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        console.log('🌐 Status da conexão:', response.ok ? 'Conectado' : 'Erro')
      } catch (error) {
        console.log('🌐 API não acessível, usando modo offline')
        setError('Modo offline - algumas funcionalidades podem estar limitadas')
      }
    }
    
    testConnection()
  }, [])

  // 🌐 Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      console.log('🌐 Conexão restaurada - tentando sincronizar')
      syncData(false)
    }
    const handleOffline = () => {
      setIsOnline(false)
      console.log('🌐 Conexão perdida - modo offline')
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // 🔄 Função para carregar quartos da API com retry e fallback
  const loadRoomsFromAPI = async (retryCount = 0) => {
    const maxRetries = 3
    
    try {
      console.log(`📡 Tentativa ${retryCount + 1}/${maxRetries + 1} - Carregando quartos da API:`, API_BASE_URL)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout
      
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })
      
      clearTimeout(timeoutId)
      
      console.log('📡 Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('📊 Dados JSON recebidos:', data)
      
      if (data.success && data.data && Array.isArray(data.data)) {
        setRooms(data.data)
        console.log(`✅ Carregados ${data.data.length} quartos da API`)
        setError(null)
        
        // Salvar no localStorage como backup
        localStorage.setItem("hotel_rooms_backup", JSON.stringify(data.data))
        
        return true
      } else {
        throw new Error('Formato de resposta inválido da API')
      }
    } catch (error: any) {
      console.error(`❌ Erro na tentativa ${retryCount + 1}:`, error.message)
      
      // Se ainda temos tentativas, tenta novamente
      if (retryCount < maxRetries && error.name !== 'AbortError') {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))) // Backoff
        return loadRoomsFromAPI(retryCount + 1)
      }
      
      // Se todas as tentativas falharam, tenta carregar dados locais
      // Tentar carregar dados locais de backup
      const backupData = localStorage.getItem("hotel_rooms_backup")
      
      if (backupData) {
        try {
          const parsedData = JSON.parse(backupData)
          setRooms(parsedData)
          console.log(`📱 Carregados ${parsedData.length} quartos do backup local`)
          setError("Usando dados offline - algumas informações podem estar desatualizadas")
          return true
        } catch (e) {
          console.error('❌ Erro ao carregar backup:', e)
        }
      }
      
      // Se nada funcionou, usar dados padrão
      const defaultRooms = [
        {
          id: "fallback-1",
          number: "101",
          type: "Solteiro",
          capacity: 1,
          beds: 1,
          price: 80,
          amenities: ["wifi", "tv"],
          status: "available" as const,
          expenses: []
        },
        {
          id: "fallback-2",
          number: "102",
          type: "Casal",
          capacity: 2,
          beds: 1,
          price: 120,
          amenities: ["wifi", "tv", "ar-condicionado"],
          status: "available" as const,
          expenses: []
        }
      ]
      
      setRooms(defaultRooms)
      setError(`API indisponível: ${error.message}. Usando dados de demonstração.`)
      console.log('📱 Carregados dados de demonstração')
      return false
    }
  }

  // 🔄 Função para carregar reservas futuras da API
  const loadReservationsFromAPI = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/future`)
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.data) {
        setFutureReservations(data.data)
        console.log(`✅ Carregadas ${data.data.length} reservas futuras da API`)
        console.log('📋 Dados das reservas:', data.data)
      }
    } catch (error: any) {
      console.error("❌ Erro ao carregar reservas da API:", error)
    }
  }

  //  Função para sincronizar dados automaticamente
  const syncData = async (silent = true) => {
    if (!isOnline) return

    try {
      if (!silent) {
        console.log("🔄 Sincronizando dados...")
      }

      await Promise.all([
        loadRoomsFromAPI(),
        loadReservationsFromAPI()
      ])

      setLastSync(new Date())

      if (!silent) {
        console.log("✅ Dados sincronizados com sucesso")
      }
    } catch (error: any) {
      console.error("❌ Erro na sincronização:", error)
      setError(`Erro de sincronização: ${error.message}`)
    }
  }

  // 🔄 Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true)
        console.log("🔄 Carregando dados iniciais da API...")

        // Limpar dados antigos que podem interferir
        localStorage.removeItem("hotel_rooms")
        localStorage.removeItem("hotel_future_reservations")
        
        // Carregar dados da API
        await syncData(false)

        // Carregar histórico usando a nova função que prioriza dados mais recentes
        const storedHistory = loadFromStorage("hotel_guest_history")
        if (storedHistory) {
          setGuestHistory(storedHistory)
          console.log("📋 Histórico carregado:", storedHistory.length, "entradas")
        }

        console.log("✅ Dados iniciais carregados")
      } catch (error: any) {
        console.error("❌ Erro ao carregar dados:", error)
        setError(`Erro ao carregar dados: ${error.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // 🔄 Configurar sincronização automática
  useEffect(() => {
    if (!isLoading && isOnline) {
      console.log("⏰ Iniciando sincronização automática (10s)")

      syncIntervalRef.current = setInterval(() => {
        syncData(true)
      }, 10000) // Sincronizar a cada 10 segundos

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current)
        }
      }
    }
  }, [isLoading, isOnline])

  // 💾 Função para salvar histórico com timestamp
  const saveToStorage = (key: string, data: any) => {
    const dataWithTimestamp = {
      data,
      timestamp: Date.now(),
      source: window.location.hostname
    }
    localStorage.setItem(key, JSON.stringify(dataWithTimestamp))
    
    // Também salvar em uma chave global compartilhada
    localStorage.setItem(`shared_${key}`, JSON.stringify(dataWithTimestamp))
  }

  // 💾 Função para carregar dados do storage priorizando os mais recentes
  const loadFromStorage = (key: string) => {
    try {
      // Tentar carregar da chave compartilhada primeiro
      const sharedData = localStorage.getItem(`shared_${key}`)
      const localData = localStorage.getItem(key)
      
      let sharedParsed = null
      let localParsed = null
      
      if (sharedData) {
        sharedParsed = JSON.parse(sharedData)
      }
      
      if (localData) {
        localParsed = JSON.parse(localData)
      }
      
      // Se ambos existem, usar o mais recente
      if (sharedParsed && localParsed) {
        const sharedTime = sharedParsed.timestamp || 0
        const localTime = localParsed.timestamp || 0
        
        return sharedTime > localTime ? sharedParsed.data : localParsed.data
      }
      
      // Se só um existe, usar esse
      if (sharedParsed) return sharedParsed.data
      if (localParsed) return localParsed.data
      
      return null
    } catch (e) {
      console.warn(`Erro ao carregar ${key}:`, e)
      return null
    }
  }

  // 💾 Salvar histórico quando mudar
  useEffect(() => {
    if (!isLoading && guestHistory.length > 0) {
      saveToStorage("hotel_guest_history", guestHistory)
    }
  }, [guestHistory, isLoading])

  // 🔄 Listener para sincronização entre instâncias
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'shared_hotel_guest_history' && e.newValue) {
        try {
          const newData = JSON.parse(e.newValue)
          // Só atualizar se os dados são mais recentes
          const currentData = loadFromStorage("hotel_guest_history")
          const currentTimestamp = Date.now() - 1000 // 1 segundo de tolerância
          
          if (newData.timestamp > currentTimestamp) {
            console.log("🔄 Sincronizando histórico de outra instância")
            setGuestHistory(newData.data)
          }
        } catch (e) {
          console.warn("Erro ao sincronizar histórico:", e)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // 📊 Aplicar filtros
  useEffect(() => {
    let filtered = rooms

    if (filters.type) {
      filtered = filtered.filter((room) => room.type === filters.type)
    }

    if (filters.status) {
      filtered = filtered.filter((room) => {
        if (filters.status === "available") {
          return room.status === "available"
        } else {
          return room.status === filters.status
        }
      })
    }

    if (filters.minPrice > 0) {
      filtered = filtered.filter((room) => room.price >= filters.minPrice)
    }

    if (filters.maxPrice < 1000) {
      filtered = filtered.filter((room) => room.price <= filters.maxPrice)
    }

    setFilteredRooms(filtered)
  }, [rooms, filters])

  // 📝 Função para adicionar ao histórico
  const addToGuestHistory = (guest: Guest, roomId: string, status: "active" | "completed" | "cancelled" = "active") => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return

    const nights = getNumberOfNights(guest.checkIn, guest.checkOut)
    const totalPrice = room.price * guest.guests * nights + (guest.expenses?.reduce((sum, exp) => sum + exp.value, 0) || 0)

    const historyEntry: GuestHistory = {
      id: Date.now().toString(),
      guest,
      roomNumber: room.number,
      roomType: room.type,
      checkInDate: guest.checkIn,
      checkOutDate: guest.checkOut,
      totalPrice,
      status,
      createdAt: new Date().toISOString(),
    }

    setGuestHistory((prev) => [historyEntry, ...prev])
  }

  // 🔍 Funções de busca e filtro
  const clearFilters = () => {
    setFilters({
      type: "",
      status: "",
      minPrice: 0,
      maxPrice: 1000,
    })
  }

  const searchRooms = (term: string) => {
    if (!term) {
      setFilteredRooms(rooms)
      return
    }

    const filtered = rooms.filter(
      (room) =>
        room.number.toLowerCase().includes(term.toLowerCase()) ||
        room.type.toLowerCase().includes(term.toLowerCase()) ||
        room.guest?.name?.toLowerCase().includes(term.toLowerCase()),
    )

    setFilteredRooms(filtered)
  }

  // Funções de gerenciamento de quartos
  const addRoom = async (room: Omit<Room, "id" | "status" | "guest">) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(room),
      })

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Forçar recarregamento completo dos dados
        await syncData(false)
        setError(null)
      }
    } catch (error: any) {
      console.error("❌ Erro ao adicionar quarto:", error)
      setError(`Erro ao adicionar quarto: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const updateRoom = async (roomId: string, updates: Partial<Room>) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Forçar recarregamento completo dos dados
        await syncData(false)
        setError(null)
      }
    } catch (error: any) {
      console.error("❌ Erro ao atualizar quarto:", error)
      setError(`Erro ao atualizar quarto: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteRoom = async (roomId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        await syncData(false)
        setError(null)
      }
    } catch (error: any) {
      console.error("❌ Erro ao deletar quarto:", error)
      setError(`Erro ao deletar quarto: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const checkoutRoom = async (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId)
    console.log("🔍 Iniciando checkout para room:", roomId, "Room encontrado:", room)
    
    // Função para atualizar o histórico
    const updateGuestHistory = () => {
      if (room && room.guest) {
        console.log("📝 Atualizando histórico para hóspede:", room.guest.name, "Quarto:", room.number)
        
        setGuestHistory((prev) => {
          const updated = prev.map((entry) => {
            const shouldUpdate = (
              (entry.roomNumber === room.number || 
               (entry.guest.id && room.guest?.id && entry.guest.id === room.guest.id)) && 
              entry.status === "active"
            )
            
            if (shouldUpdate) {
              console.log("✅ Atualizando entrada do histórico:", entry.id, "de 'active' para 'completed'")
              return { ...entry, status: "completed" as const }
            }
            return entry
          })
          
          console.log("📊 Estado do histórico após atualização:", updated.map(h => ({
            id: h.id, 
            guest: h.guest.name, 
            room: h.roomNumber, 
            status: h.status
          })))
          
          return updated
        })
      } else {
        console.log("⚠️ Não foi possível atualizar histórico - room ou guest não encontrado")
      }
    }

    try {
      // Buscar a reserva ativa para este quarto usando o novo endpoint
      const reservationResponse = await fetch(`${API_BASE_URL}/reservations/active/${roomId}`)
      if (!reservationResponse.ok) {
        throw new Error('Erro ao buscar reserva ativa')
      }
      
      const reservationData = await reservationResponse.json()
      const activeReservation = reservationData.data
      
      if (!activeReservation) {
        // Se não há reserva ativa, liberar quarto diretamente
        const updateResponse = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'available' })
        })
        
        if (updateResponse.ok) {
          updateGuestHistory() // Atualizar histórico
          await syncData(false) // Sincronizar dados forçadamente
          console.log("✅ Quarto liberado diretamente")
        }
        return
      }

      // Fazer checkout da reserva ativa
      const response = await fetch(`${API_BASE_URL}/reservations/${activeReservation.id}/checkout`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        updateGuestHistory() // Atualizar histórico após checkout bem-sucedido
        await syncData(false) // Sincronizar dados forçadamente
        console.log("✅ Checkout realizado")
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro no checkout')
      }
    } catch (error: any) {
      console.error("❌ Erro ao fazer checkout:", error)
      // Tentar liberar o quarto manualmente como fallback
      try {
        updateGuestHistory() // Atualizar histórico mesmo no fallback
        setRooms((prev) =>
          prev.map((room) =>
            room.id === roomId ? { ...room, status: "available", guest: undefined } : room,
          ),
        )
      } catch (fallbackError) {
        console.error("❌ Erro no fallback:", fallbackError)
      }
    }
  }

  // Funções de reserva
  const makeReservation = async (reservation: Omit<Reservation, "id" | "createdAt">) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservation),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro HTTP: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Forçar sincronização completa
        await syncData(false)
        addToGuestHistory(reservation.guest, reservation.roomId, "active")
        setError(null)
      } else {
        throw new Error(data.error || "Erro desconhecido ao criar reserva")
      }
    } catch (error: any) {
      console.error("❌ Erro detalhado ao criar reserva:", error)
      setError(`Erro ao criar reserva: ${error.message}`)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const cancelFutureReservation = async (reservationId: string) => {
    try {
      const reservation = futureReservations.find((r) => r.id === reservationId)
      
      const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        if (reservation) {
          setGuestHistory((prev) =>
            prev.map((entry) =>
              (entry.guest.name === reservation.guest.name ||
               (entry.guest.id && reservation.guest.id && entry.guest.id === reservation.guest.id)) &&
              entry.checkInDate === reservation.guest.checkIn &&
              entry.status === "active"
                ? { ...entry, status: "cancelled" }
                : entry,
            ),
          )
        }

        await syncData(false) // Sincronizar dados forçadamente
        console.log("✅ Reserva cancelada")
      }
    } catch (error: any) {
      console.error("❌ Erro ao cancelar reserva:", error)
      setError(`Erro ao cancelar reserva: ${error.message}`)
    }
  }

  // 💰 Função de despesas
  const addExpenseToRoom = (roomId: string, expense: Expense) => {
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id === roomId && room.guest) {
          const updatedRoom = {
            ...room,
            guest: {
              ...room.guest,
              expenses: [...(room.guest.expenses || []), expense],
            },
          }

          setGuestHistory((prevHistory) =>
            prevHistory.map((entry) =>
              (entry.roomNumber === room.number || 
               (entry.guest.id && room.guest?.id && entry.guest.id === room.guest.id)) && 
              entry.status === "active"
                ? {
                    ...entry,
                    totalPrice: entry.totalPrice + expense.value,
                    guest: {
                      ...entry.guest,
                      expenses: [...(entry.guest.expenses || []), expense],
                    },
                  }
                : entry,
            ),
          )

          return updatedRoom
        }
        return room
      }),
    )
  }

  // 📊 Funções de estatísticas
  const getStatistics = (): HotelStatistics => {
    const totalRooms = rooms.length
    const occupiedRooms = rooms.filter((room) => room.status === "occupied").length
    const availableRooms = rooms.filter((room) => room.status === "available").length
    const reservedRooms = futureReservations.length
    const maintenanceRooms = rooms.filter((room) => room.status === "maintenance" || room.status === "cleaning").length

    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0

    const roomsByType = rooms.reduce(
      (acc, room) => {
        acc[room.type] = (acc[room.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const monthlyRevenue = rooms
      .filter((room) => room.status === "occupied" && room.guest)
      .reduce((total, room) => {
        const nights = room.guest ? getNumberOfNights(room.guest.checkIn, room.guest.checkOut) : 0
        const expensesTotal = room.guest?.expenses?.reduce((sum, exp) => sum + exp.value, 0) || 0
        return total + room.price * (room.guest?.guests || 0) * nights + expensesTotal
      }, 0)

    const activeGuests = rooms
      .filter((room) => room.guest && room.status === "occupied")
      .reduce((total, room) => total + (room.guest?.guests || 0), 0)

    return {
      totalRooms,
      occupiedRooms,
      availableRooms,
      reservedRooms,
      maintenanceRooms,
      occupancyRate,
      roomsByType,
      monthlyRevenue,
      activeGuests,
    }
  }

  const getFutureReservations = (): Room[] => {
    return futureReservations
      .map((reservation) => {
        const room = rooms.find((r) => r.id === reservation.roomId)
        if (!room || !reservation.guest) return null

        return {
          ...room,
          status: "reserved" as const,
          guest: {
            id: reservation.guest.id,
            name: reservation.guest.name,
            email: reservation.guest.email,
            phone: reservation.guest.phone,
            cpf: reservation.guest.cpf,
            checkIn: reservation.guest.checkIn,
            checkOut: reservation.guest.checkOut,
            guests: (reservation.guest as any).numGuests || reservation.guest.guests || 1
          },
        }
      })
      .filter(Boolean) as Room[]
  }

  const getGuestHistory = (): GuestHistory[] => {
    return guestHistory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const deleteGuestHistory = (historyId: string) => {
    setGuestHistory((prev) => prev.filter((entry) => entry.id !== historyId))
  }

  // 🔧 Função de debug para atualizar status do histórico
  const debugUpdateHistoryStatus = (guestName: string, newStatus: "active" | "completed" | "cancelled") => {
    console.log(`🔧 DEBUG: Atualizando status de ${guestName} para ${newStatus}`)
    console.log("📋 Estado atual do histórico:", guestHistory.map(h => ({
      id: h.id,
      guest: h.guest.name, 
      status: h.status,
      room: h.roomNumber
    })))
    
    setGuestHistory((prev) => {
      console.log("📝 Procurando por:", guestName)
      const updated = prev.map((entry) => {
        console.log(`🔍 Verificando: "${entry.guest.name}" === "${guestName}"?`, entry.guest.name === guestName)
        if (entry.guest.name === guestName) {
          console.log(`✅ Encontrado ${guestName}, atualizando de ${entry.status} para ${newStatus}`)
          return { ...entry, status: newStatus }
        }
        return entry
      })
      console.log("📊 Estado após debug update:", updated.map(h => ({
        guest: h.guest.name, 
        status: h.status
      })))
      
      // Forçar salvamento no localStorage
      setTimeout(() => {
        saveToStorage("hotel_guest_history", updated)
        console.log("💾 Histórico salvo no localStorage")
      }, 100)
      
      return updated
    })
  }

  return (
    <HotelContext.Provider
      value={{
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
        getFutureReservations,
        futureReservations,
        cancelFutureReservation,
        guestHistory,
        getGuestHistory,
        deleteGuestHistory,
        debugUpdateHistoryStatus,
        isLoading,
        error,
        lastSync,
        isOnline,
      }}
    >
      {children}
    </HotelContext.Provider>
  )
}

export function useHotel() {
  const context = useContext(HotelContext)
  if (context === undefined) {
    throw new Error("useHotel must be used within a HotelProvider")
  }
  return context
}