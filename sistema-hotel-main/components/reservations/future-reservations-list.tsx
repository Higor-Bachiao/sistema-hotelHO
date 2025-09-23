"use client"

import { useHotel } from "@/contexts/hotel-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, User, Mail, Phone, X } from "lucide-react"

export default function FutureReservationsList() {
  const { getFutureReservations, cancelFutureReservation, futureReservations } = useHotel()
  const futureReservationsRooms = getFutureReservations()

  const handleCancelReservation = (reservationId: string, guestName: string, roomNumber: string) => {
    cancelFutureReservation(reservationId)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            Próximas Reservas
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Lista de quartos reservados para datas futuras.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {futureReservationsRooms.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm min-w-[60px]">Quarto</TableHead>
                    <TableHead className="text-xs sm:text-sm min-w-[100px]">Hóspede</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Check-in</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Check-out</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Hóspedes</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Contato</TableHead>
                    <TableHead className="text-xs sm:text-sm min-w-[60px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {futureReservationsRooms.map((room) => {
                    // Encontrar a reserva correspondente para obter o ID
                    const reservation = futureReservations.find((r) => r.roomId === room.id)

                    return (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium text-xs sm:text-sm">
                          <div>
                            <div>Quarto {room.number}</div>
                            <div className="text-xs text-muted-foreground">{room.type}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <User className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                            <span className="text-xs sm:text-sm">{room.guest?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm hidden sm:table-cell">
                          {room.guest?.checkIn
                            ? format(new Date(room.guest.checkIn), "dd/MM/yyyy", { locale: ptBR })
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm hidden sm:table-cell">
                          {room.guest?.checkOut
                            ? format(new Date(room.guest.checkOut), "dd/MM/yyyy", { locale: ptBR })
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm hidden md:table-cell">{room.guest?.guests}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-col text-xs space-y-1">
                            {room.guest?.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-muted-foreground" />
                                <span className="truncate max-w-[120px]">{room.guest.email}</span>
                              </div>
                            )}
                            {room.guest?.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                <span>{room.guest.phone}</span>
                              </div>
                            )}
                            {!room.guest?.email && !room.guest?.phone && (
                              <span className="text-muted-foreground text-xs">Não informado</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {reservation && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleCancelReservation(reservation.id, room.guest?.name || "Hóspede", room.number)
                              }
                              className="h-6 w-auto sm:h-8 px-2 sm:px-3"
                            >
                              <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              <span className="text-xs sm:text-sm">Cancelar</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-4 sm:p-6 text-center text-muted-foreground">
              <p className="text-sm sm:text-base">Nenhuma reserva futura encontrada.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
