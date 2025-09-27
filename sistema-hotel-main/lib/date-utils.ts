import { addDays, differenceInDays, isAfter, isBefore, isToday, parseISO } from "date-fns"

/**
 * Obtém a data atual sem horário (apenas data)
 */
export const getCurrentDate = (): Date => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/**
 * Converte uma string de data para objeto Date sem horário
 */
export const parseDate = (dateString: string): Date => {
  const parsed = parseISO(dateString)
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
}

/**
 * Verifica se uma reserva futura está dentro do período de bloqueio (1 dia)
 * @param checkInDate - Data de check-in da reserva
 * @param checkOutDate - Data de check-out da reserva
 * @returns true se a reserva está dentro do próximo 1 dia
 */
export const isReservationInBlockingPeriod = (checkInDate: string, checkOutDate: string): boolean => {
  const today = getCurrentDate()
  const checkIn = parseDate(checkInDate)
  const checkOut = parseDate(checkOutDate)
  const oneDayFromNow = addDays(today, 1)
  
  // Verifica se o check-in está dentro do próximo 1 dia
  // ou se hoje está dentro do período de ocupação
  return (
    (isAfter(checkIn, today) || isToday(checkIn)) && 
    (isBefore(checkIn, oneDayFromNow) || isToday(checkIn))
  ) || (
    isBefore(checkIn, today) && isAfter(checkOut, today)
  )
}

/**
 * Verifica se um quarto pode ser reservado considerando reservas futuras
 * @param roomStatus - Status atual do quarto
 * @param futureReservations - Lista de reservas futuras
 * @param roomId - ID do quarto
 * @returns true se o quarto pode ser reservado
 */
export const canReserveRoom = (
  roomStatus: string, 
  futureReservations: Array<{roomId: string, guest: {checkIn: string, checkOut: string}}>, 
  roomId: string
): boolean => {
  // Se o quarto não está disponível nem reservado (com reserva futura), não pode ser reservado
  if (roomStatus !== 'available' && roomStatus !== 'reserved') {
    return false
  }

  // Verificar se há reserva futura que bloqueia o quarto
  const roomFutureReservation = futureReservations.find(reservation => reservation.roomId === roomId)
  
  if (roomFutureReservation) {
    // Se há reserva futura, verificar se está dentro do período de bloqueio (1 dia)
    return !isReservationInBlockingPeriod(
      roomFutureReservation.guest.checkIn, 
      roomFutureReservation.guest.checkOut
    )
  }

  // Se não há reserva futura, só pode ser reservado se estiver disponível
  return roomStatus === 'available'
}

/**
 * Obtém informações da reserva futura de um quarto
 * @param futureReservations - Lista de reservas futuras
 * @param roomId - ID do quarto
 * @returns Informações da reserva futura ou null
 */
export const getRoomFutureReservation = (
  futureReservations: Array<{roomId: string, guest: {name: string, checkIn: string, checkOut: string}}>, 
  roomId: string
) => {
  return futureReservations.find(reservation => reservation.roomId === roomId)
}

/**
 * Formata uma data para exibição
 * @param dateString - Data em string
 * @returns Data formatada para exibição brasileira
 */
export const formatDateForDisplay = (dateString: string): string => {
  const date = parseDate(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Calcula quantos dias faltam para uma data
 * @param dateString - Data em string
 * @returns Número de dias até a data
 */
export const getDaysUntilDate = (dateString: string): number => {
  const today = getCurrentDate()
  const targetDate = parseDate(dateString)
  return differenceInDays(targetDate, today)
}