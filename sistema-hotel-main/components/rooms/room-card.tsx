"use client"

import { useState } from "react"
import { useHotel } from "@/contexts/hotel-context"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Bed, Users, Wifi, Car, Coffee, Tv, CheckCircle, Calendar, DollarSign, PlusCircle, Clock } from "lucide-react"
import type { Room } from "@/types/hotel"
import { calculateTotalStayPrice, getNumberOfNights } from "@/lib/price-utils"
import { canReserveRoom, getRoomFutureReservation, formatDateForDisplay, getDaysUntilDate } from "@/lib/date-utils"
import ReservationForm from "@/components/reservations/reservation-form"

interface RoomCardProps {
  room: Room
}

export default function RoomCard({ room }: RoomCardProps) {
  const { checkoutRoom, addExpenseToRoom, futureReservations } = useHotel()
  const [showDetails, setShowDetails] = useState(false)
  const [showReservationDialog, setShowReservationDialog] = useState(false)
  const [newExpenseDescription, setNewExpenseDescription] = useState("")
  const [newExpenseValue, setNewExpenseValue] = useState<number | string>("")

  // Obter informações da reserva futura (apenas para quartos disponíveis/reservados)
  const futureReservation = (room.status === "available" || room.status === "reserved") 
    ? getRoomFutureReservation(futureReservations, room.id) 
    : null
    
  const canReserveThisRoom = canReserveRoom(room.status, futureReservations, room.id)

  const getStatusDisplay = () => {
    // Se o quarto está ocupado, não mostrar informações de reserva futura
    if (room.status === "occupied") {
      return { statusText: "Ocupado", statusColor: "bg-red-100 text-red-800 border-red-200" }
    }

    // Lógica para quartos disponíveis ou reservados com reserva futura
    if ((room.status === "available" || room.status === "reserved") && futureReservation) {
      const daysUntilReservation = getDaysUntilDate(futureReservation.guest.checkIn)
      
      if (daysUntilReservation <= 1) {
        return {
          statusText: "Reserva Próxima",
          statusColor: "bg-orange-100 text-orange-800 border-orange-200",
        }
      } else {
        return {
          statusText: "Disponível (Reservado Futuro)",
          statusColor: "bg-green-100 text-green-800 border-green-200",
        }
      }
    }

    // Status padrão para quartos sem reserva futura
    switch (room.status) {
      case "available":
        return { statusText: "Disponível", statusColor: "bg-green-100 text-green-800 border-green-200" }
      case "maintenance":
        return { statusText: "Manutenção", statusColor: "bg-yellow-100 text-yellow-800 border-yellow-200" }
      case "cleaning":
        return { statusText: "Limpeza", statusColor: "bg-purple-100 text-purple-800 border-purple-200" }
      case "reserved":
        return { statusText: "Reservado", statusColor: "bg-blue-100 text-blue-800 border-blue-200" }
      default:
        return { statusText: "Desconhecido", statusColor: "bg-gray-100 text-gray-800 border-gray-200" }
    }
  }

  const { statusText: displayedStatusText, statusColor: displayedStatusColor } = getStatusDisplay()

  const handleLiberarQuarto = async () => {
    await checkoutRoom(room.id)
  }

  const handleAddExpense = async () => {
    if (room.guest && newExpenseDescription && newExpenseValue !== "" && Number(newExpenseValue) > 0) {
      const expense = {
        id: Date.now(),
        guest_id: room.guest.id || '',
        description: newExpenseDescription,
        value: Number(newExpenseValue),
        created_at: new Date().toISOString()
      }
      await addExpenseToRoom(room.id, expense)
      setNewExpenseDescription("")
      setNewExpenseValue("")
    } else {
      console.log("Preencha a descrição e um valor válido para a despesa.")
    }
  }

  const displayPrice = room.guest
    ? calculateTotalStayPrice(
        room.price,
        room.guest.guests,
        room.guest.checkIn,
        room.guest.checkOut,
        room.guest.expenses || [],
      )
    : room.price

  const numberOfNights = room.guest ? getNumberOfNights(room.guest.checkIn, room.guest.checkOut) : 0

  // Usar a nova lógica para verificar se pode reservar
  const canReserve = canReserveThisRoom

  // Quarto pode ser liberado se estiver ocupado
  const canCheckout = room.status === "occupied"

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold truncate">Quarto {room.number}</h3>
            <Badge className={`${displayedStatusColor} text-xs`}>{displayedStatusText}</Badge>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 truncate">{room.type}</p>
        </CardHeader>

        <CardContent className="space-y-3 flex-1">
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-bold text-blue-600">R$ {displayPrice.toFixed(2)}</span>
            <span className="text-xs text-gray-500 leading-tight">
              {room.guest
                ? `R$ ${room.price.toFixed(2)}/pessoa/noite + despesas`
                : `R$ ${room.price.toFixed(2)} por pessoa/noite`}
            </span>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{room.capacity}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bed className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{room.beds}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {room.amenities.includes("wifi") && <Wifi className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />}
            {room.amenities.includes("parking") && <Car className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />}
            {room.amenities.includes("breakfast") && <Coffee className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />}
            {room.amenities.includes("tv") && <Tv className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />}
            {room.amenities.includes("ar-condicionado") && (
              <img src="/placeholder.svg?height=16&width=16" alt="Ar Condicionado" className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </div>

          {room.guest && (
            <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
              <p className="text-xs sm:text-sm font-medium truncate">{room.guest.name}</p>
              {room.guest.email && <p className="text-xs text-gray-600 truncate">{room.guest.email}</p>}
              <p className="text-xs text-gray-600">Check-in: {new Date(room.guest.checkIn).toLocaleDateString()}</p>
            </div>
          )}

          {!room.guest && futureReservation && (
            <div className="bg-blue-50 border border-blue-200 p-2 sm:p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                <p className="text-xs sm:text-sm font-medium text-blue-800">Reserva Futura</p>
              </div>
              <p className="text-xs sm:text-sm font-medium truncate text-blue-700">{futureReservation.guest.name}</p>
              <div className="text-xs text-blue-600 space-y-1">
                <p>Check-in: {formatDateForDisplay(futureReservation.guest.checkIn)}</p>
                <p>Check-out: {formatDateForDisplay(futureReservation.guest.checkOut)}</p>
                {getDaysUntilDate(futureReservation.guest.checkIn) >= 0 && (
                  <p className="font-medium">
                    {getDaysUntilDate(futureReservation.guest.checkIn) === 0 
                      ? "Hoje" 
                      : getDaysUntilDate(futureReservation.guest.checkIn) === 1
                      ? "Amanhã" 
                      : `Em ${getDaysUntilDate(futureReservation.guest.checkIn)} dias`
                    }
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-2 pt-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowDetails(true)} 
            className="w-full sm:flex-1 text-xs sm:text-sm"
          >
            Detalhes
          </Button>

          {canReserve && (
            <Dialog open={showReservationDialog} onOpenChange={setShowReservationDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full sm:flex-1 text-xs sm:text-sm">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Reservar
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-2 max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
                <DialogHeader>
                  <DialogTitle>Reservar Quarto {room.number}</DialogTitle>
                  <DialogDescription>Preencha os dados para confirmar a reserva.</DialogDescription>
                </DialogHeader>
                <ReservationForm initialRoomId={room.id} onReservationSuccess={() => setShowReservationDialog(false)} />
              </DialogContent>
            </Dialog>
          )}

          {canCheckout && (
            <Button 
              size="sm" 
              onClick={handleLiberarQuarto} 
              variant="destructive" 
              className="w-full sm:flex-1 text-xs sm:text-sm"
            >
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Liberar Quarto
            </Button>
          )}
        </CardFooter>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto flex flex-col">
          <DialogHeader>
            <DialogTitle>Quarto {room.number} - Detalhes</DialogTitle>
            <DialogDescription>Informações completas do quarto</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Informações Básicas</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Tipo:</strong> {room.type}
                  </p>
                  <p>
                    <strong>Capacidade:</strong> {room.capacity} pessoas
                  </p>
                  <p>
                    <strong>Camas:</strong> {room.beds}
                  </p>
                  <p>
                    <strong>Preço por pessoa/noite:</strong> R$ {room.price.toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Comodidades</h4>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              {room.guest && (
                <>
                  <div>
                    <h4 className="font-medium mb-2">Hóspede Atual</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Nome:</strong> {room.guest.name}
                      </p>
                      {room.guest.email && (
                        <p>
                          <strong>Email:</strong> {room.guest.email}
                        </p>
                      )}
                      {room.guest.phone && (
                        <p>
                          <strong>Telefone:</strong> {room.guest.phone}
                        </p>
                      )}
                      {room.guest.cpf && (
                        <p>
                          <strong>CPF:</strong> {room.guest.cpf}
                        </p>
                      )}
                      <p>
                        <strong>Check-in:</strong> {new Date(room.guest.checkIn).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Check-out previsto:</strong> {new Date(room.guest.checkOut).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Hóspedes:</strong> {room.guest.guests}
                      </p>
                      <p>
                        <strong>Noites:</strong> {getNumberOfNights(room.guest.checkIn, room.guest.checkOut)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Despesas Adicionais
                    </h4>
                    {room.guest.expenses && room.guest.expenses.length > 0 ? (
                      <ul className="space-y-1 text-sm">
                        {room.guest.expenses.map((expense, index) => (
                          <li key={index} className="flex justify-between">
                            <span>{expense.description}</span>
                            <span>R$ {(expense.value || 0).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhuma despesa adicional.</p>
                    )}

                    <div className="mt-4 space-y-2">
                      <Label htmlFor="newExpenseDescription">Adicionar Nova Despesa</Label>
                      <Input
                        id="newExpenseDescription"
                        placeholder="Descrição (ex: Consumo do frigobar)"
                        value={newExpenseDescription}
                        onChange={(e) => setNewExpenseDescription(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Valor (R$)"
                        value={newExpenseValue}
                        onChange={(e) => setNewExpenseValue(e.target.value)}
                        min="0"
                        step="0.01"
                      />
                      <Button onClick={handleAddExpense} className="w-full">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Adicionar Despesa
                      </Button>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg mt-4">
                    <div className="flex justify-between font-bold text-blue-900">
                      <span>Total da Estadia (com despesas):</span>
                      <span>
                        R${" "}
                        {calculateTotalStayPrice(
                          room.price,
                          room.guest.guests,
                          room.guest.checkIn,
                          room.guest.checkOut,
                          room.guest.expenses || [],
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
