"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useHotel } from "@/contexts/hotel-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, AlertCircle } from "lucide-react"
import { calculateTotalStayPrice, getNumberOfNights } from "@/lib/price-utils"
import { parseDate, formatDateForDisplay } from "@/lib/date-utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ReservationFormProps {
  initialRoomId?: string
  onReservationSuccess?: () => void
}

export default function ReservationForm({ initialRoomId, onReservationSuccess }: ReservationFormProps) {
  const { rooms, makeReservation, futureReservations } = useHotel()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const [formData, setFormData] = useState({
    roomId: initialRoomId || "",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    guestCpf: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
  })

  // Quartos disponíveis incluem: available + reserved com reserva futura > 1 dia
  const availableRooms = rooms.filter((room) => {
    if (room.status === "available") return true
    
    if (room.status === "reserved") {
      // Verificar se a reserva futura permite novas reservas
      const futureReservation = futureReservations.find(res => res.roomId === room.id)
      if (futureReservation) {
        const daysUntilReservation = Math.ceil(
          (parseDate(futureReservation.guest.checkIn).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
        return daysUntilReservation > 1 // Só permite se for > 1 dia
      }
    }
    
    return false
  })
  
  const selectedRoom = availableRooms.find((r) => r.id === formData.roomId) || null

  // Função para verificar conflitos com reservas futuras
  const checkDateConflicts = (roomId: string, checkIn: string, checkOut: string) => {
    const futureReservation = futureReservations.find(res => res.roomId === roomId)
    
    if (!futureReservation) {
      return null // Sem conflito
    }

    const newCheckIn = parseDate(checkIn)
    const newCheckOut = parseDate(checkOut)
    const existingCheckIn = parseDate(futureReservation.guest.checkIn)
    const existingCheckOut = parseDate(futureReservation.guest.checkOut)

    // Verifica se há sobreposição de datas
    const hasOverlap = (newCheckIn < existingCheckOut && newCheckOut > existingCheckIn)

    if (hasOverlap) {
      return {
        guestName: futureReservation.guest.name,
        checkIn: formatDateForDisplay(futureReservation.guest.checkIn),
        checkOut: formatDateForDisplay(futureReservation.guest.checkOut)
      }
    }

    return null // Sem conflito
  }

  useEffect(() => {
    if (initialRoomId && formData.roomId !== initialRoomId) {
      setFormData((prev) => ({ ...prev, roomId: initialRoomId }))
    }
  }, [initialRoomId, formData.roomId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage("")

    try {
      // Validação de campos obrigatórios
      if (!formData.guestName || !formData.guestEmail) {
        setErrorMessage("Preencha todos os campos obrigatórios")
        setIsSubmitting(false)
        return
      }

      // Validação de email válido
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.guestEmail)) {
        setErrorMessage("Email inválido")
        setIsSubmitting(false)
        return
      }

      if (!selectedRoom) {
        setErrorMessage("Nenhum quarto selecionado")
        setIsSubmitting(false)
        return
      }

      // Validação de datas
      const today = new Date()
      const todayString = today.getFullYear() + '-' + 
        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
        String(today.getDate()).padStart(2, '0')
      
      // Verificar se check-in é no mínimo hoje (comparar strings de data)
      if (formData.checkIn < todayString) {
        setErrorMessage("Data de check-in não pode ser anterior a hoje")
        setIsSubmitting(false)
        return
      }
      
      // Verificar se check-out é depois do check-in
      if (formData.checkOut <= formData.checkIn) {
        setErrorMessage("Data de check-out deve ser posterior ao check-in")
        setIsSubmitting(false)
        return
      }

      // Validação de conflitos com reservas futuras
      const conflict = checkDateConflicts(formData.roomId, formData.checkIn, formData.checkOut)
      if (conflict) {
        setErrorMessage(
          `Conflito de datas! Este quarto já possui uma reserva futura para ${conflict.guestName} ` +
          `de ${conflict.checkIn} a ${conflict.checkOut}. Escolha outras datas.`
        )
        setIsSubmitting(false)
        return
      }

      await makeReservation({
        roomId: formData.roomId,
        guest: {
          name: formData.guestName,
          email: formData.guestEmail,
          phone: formData.guestPhone || undefined,
          cpf: formData.guestCpf || undefined,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          guests: formData.guests,
        },
      })

      setFormData({
        roomId: "",
        guestName: "",
        guestEmail: "",
        guestPhone: "",
        guestCpf: "",
        checkIn: "",
        checkOut: "",
        guests: 1,
      })

      if (onReservationSuccess) {
        onReservationSuccess()
      }
    } catch (error: any) {
      console.error("Erro ao fazer reserva:", error)
      setErrorMessage(`Erro ao fazer reserva: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Limpar mensagem de erro quando o usuário começar a digitar
    if (errorMessage) {
      setErrorMessage("")
    }
  }

  const totalStayPrice = selectedRoom
    ? calculateTotalStayPrice(selectedRoom.price, formData.guests, formData.checkIn, formData.checkOut)
    : 0
  const numberOfNights = selectedRoom ? getNumberOfNights(formData.checkIn, formData.checkOut) : 0

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room">Quarto</Label>
              <Select
                value={formData.roomId}
                onValueChange={(value) => handleInputChange("roomId", value)}
                disabled={!!initialRoomId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um quarto" />
                </SelectTrigger>
                <SelectContent>
                  {availableRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      Quarto {room.number} - {room.type} (R$ {room.price.toFixed(2)}/pessoa)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guests">Número de Hóspedes</Label>
              <Select
                value={formData.guests.toString()}
                onValueChange={(value) => handleInputChange("guests", Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "pessoa" : "pessoas"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <User className="w-5 h-5" />
              Dados do Hóspede
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guestName">
                  Nome Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="guestName"
                  value={formData.guestName}
                  onChange={(e) => handleInputChange("guestName", e.target.value)}
                  placeholder="Nome do hóspede"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestEmail">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="guestEmail"
                  type="email"
                  value={formData.guestEmail}
                  onChange={(e) => handleInputChange("guestEmail", e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestPhone">
                  Telefone <span className="text-gray-400 text-sm">(opcional)</span>
                </Label>
                <Input
                  id="guestPhone"
                  type="tel"
                  value={formData.guestPhone}
                  onChange={(e) => handleInputChange("guestPhone", e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestCpf">
                  CPF <span className="text-gray-400 text-sm">(opcional)</span>
                </Label>
                <Input
                  id="guestCpf"
                  value={formData.guestCpf}
                  onChange={(e) => handleInputChange("guestCpf", e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Datas da Estadia</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkIn">
                  Check-in <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="checkIn"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.checkIn}
                  onChange={(e) => handleInputChange("checkIn", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkOut">
                  Check-out <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="checkOut"
                  type="date"
                  min={formData.checkIn || new Date().toISOString().split('T')[0]}
                  value={formData.checkOut}
                  onChange={(e) => handleInputChange("checkOut", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {selectedRoom && numberOfNights > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Resumo da Reserva</h4>
              <div className="space-y-1 text-sm">
                <p>Quarto {selectedRoom.number} - {selectedRoom.type}</p>
                <p>{numberOfNights} {numberOfNights === 1 ? "noite" : "noites"}</p>
                <p>{formData.guests} {formData.guests === 1 ? "hóspede" : "hóspedes"}</p>
                <p className="font-medium">Total: R$ {totalStayPrice.toFixed(2)}</p>
              </div>
            </div>
          )}
        </form>
      </div>

      <div className="px-6 py-4 border-t bg-white">
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Confirmando..." : "Confirmar Reserva"}
        </Button>
      </div>
    </div>
  )
}