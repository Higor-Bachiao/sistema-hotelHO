"use client"

import { useState } from "react"
import { useHotel } from "@/contexts/hotel-context"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, Bed, DollarSign, Settings, Wrench, CheckCircle } from "lucide-react"
import type { Room } from "@/types/hotel"

export default function AdminPanel() {
  const { rooms, addRoom, updateRoom, deleteRoom } = useHotel()
  const { user } = useAuth()
  
  // Estados para adicionar quarto
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [newRoom, setNewRoom] = useState({
    number: "",
    type: "",
    capacity: 2,
    beds: 1,
    price: 0,
    amenities: [] as string[],
  })

  // Estados para editar quarto
  const [showEditRoom, setShowEditRoom] = useState(false)
  const [selectedRoomForEdit, setSelectedRoomForEdit] = useState<Partial<Room> | null>(null)

  // Estados para edição rápida de preço
  const [editingRoom, setEditingRoom] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState<number>(0)

  const roomTypes = ["Solteiro", "Casal", "Casal com AR", "Triplo"]
  const amenityOptions = ["wifi", "tv", "minibar", "balcony", "parking", "breakfast", "gym", "pool", "ar-condicionado"]

  // Função para adicionar novo quarto
  const handleAddRoom = () => {
    if (!newRoom.number || !newRoom.type || newRoom.price <= 0) {
      return
    }

    addRoom({
      number: newRoom.number,
      type: newRoom.type,
      capacity: newRoom.capacity,
      beds: newRoom.beds,
      price: newRoom.price,
      amenities: newRoom.amenities,
    })

    setNewRoom({
      number: "",
      type: "",
      capacity: 2,
      beds: 1,
      price: 0,
      amenities: [],
    })
    setShowAddRoom(false)
  }

  // Função para deletar quarto
  const handleDeleteRoom = (roomId: string) => {
    deleteRoom(roomId)
  }

  // Funções para edição rápida de preço
  const handleEditPrice = (roomId: string, currentPrice: number) => {
    setEditingRoom(roomId)
    setEditPrice(currentPrice)
  }

  const handleSavePrice = (roomId: string) => {
    if (editPrice <= 0) {
      return
    }

    updateRoom(roomId, { price: editPrice })
    setEditingRoom(null)
    setEditPrice(0)
  }

  const handleCancelEdit = () => {
    setEditingRoom(null)
    setEditPrice(0)
  }

  // Funções para edição completa do quarto
  const handleEditRoom = (room: Room) => {
    setSelectedRoomForEdit({ ...room })
    setShowEditRoom(true)
  }

  const handleSaveEditRoom = () => {
    if (!selectedRoomForEdit?.number || !selectedRoomForEdit?.type || (selectedRoomForEdit?.price || 0) <= 0) {
      return
    }

    const { id, guest, ...updates } = selectedRoomForEdit as any
    updateRoom(id, updates)
    setShowEditRoom(false)
    setSelectedRoomForEdit(null)
  }

  // Função para alterar status do quarto
  const handleStatusChange = (roomId: string, newStatus: string) => {
    const validStatuses = ['available', 'occupied', 'maintenance', 'cleaning', 'reserved'] as const
    type RoomStatus = typeof validStatuses[number]
    
    if (!validStatuses.includes(newStatus as RoomStatus)) {
      return
    }
    
    updateRoom(roomId, { status: newStatus as RoomStatus })
  }

  // Funções para comodidades
  const toggleAmenity = (amenity: string) => {
    setNewRoom((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const toggleAmenityEdit = (amenity: string) => {
    setSelectedRoomForEdit((prev: any) => ({
      ...prev,
      amenities: prev?.amenities?.includes(amenity)
        ? prev.amenities.filter((a: string) => a !== amenity)
        : [...(prev?.amenities || []), amenity]
    }))
  }

  // Função para obter badge de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800">Disponível</Badge>
      case "occupied":
        return <Badge className="bg-red-100 text-red-800">Ocupado</Badge>
      case "reserved":
        return <Badge className="bg-blue-100 text-blue-800">Reservado</Badge>
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800">Manutenção</Badge>
      case "cleaning":
        return <Badge className="bg-purple-100 text-purple-800">Limpeza</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Painel de Administração</h1>
        <Dialog open={showAddRoom} onOpenChange={setShowAddRoom}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Quarto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Quarto</DialogTitle>
              <DialogDescription>Preencha as informações do novo quarto</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="number">Número do Quarto*</Label>
                <Input
                  id="number"
                  value={newRoom.number}
                  onChange={(e) => setNewRoom({ ...newRoom, number: e.target.value })}
                  placeholder="Ex: 101"
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo*</Label>
                <Select value={newRoom.type} onValueChange={(value) => setNewRoom({ ...newRoom, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="capacity">Capacidade</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newRoom.capacity}
                  onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="beds">Número de Camas</Label>
                <Input
                  id="beds"
                  type="number"
                  value={newRoom.beds}
                  onChange={(e) => setNewRoom({ ...newRoom, beds: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="price">Preço por Pessoa/Noite*</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newRoom.price}
                  onChange={(e) => setNewRoom({ ...newRoom, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            
            <div>
              <Label>Comodidades</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {amenityOptions.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={newRoom.amenities.includes(amenity)}
                      onCheckedChange={() => toggleAmenity(amenity)}
                    />
                    <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddRoom(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddRoom}>
                Adicionar Quarto
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Quartos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Comodidades</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Bed className="w-4 h-4 mr-2 text-muted-foreground" />
                        {room.number}
                      </div>
                    </TableCell>
                    <TableCell>{room.type}</TableCell>
                    <TableCell>{room.capacity} pessoas</TableCell>
                    <TableCell>
                      {editingRoom === room.id ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={editPrice}
                            onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                            className="w-20"
                          />
                          <Button size="sm" onClick={() => handleSavePrice(room.id)}>
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <div 
                          className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                          onClick={() => handleEditPrice(room.id, room.price)}
                        >
                          <DollarSign className="w-4 h-4 mr-1 text-muted-foreground" />
                          R$ {room.price.toFixed(2)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(room.status)}
                        {room.status !== 'occupied' && room.status !== 'reserved' && (
                          <Select value={room.status} onValueChange={(value) => handleStatusChange(room.id, value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Disponível</SelectItem>
                              <SelectItem value="maintenance">Manutenção</SelectItem>
                              <SelectItem value="cleaning">Limpeza</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {room.amenities.slice(0, 3).map((amenity) => (
                          <Badge key={amenity} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {room.amenities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{room.amenities.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditRoom(room)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteRoom(room.id)}
                          disabled={room.status === 'occupied' || room.status === 'reserved'}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para editar quarto completo */}
      <Dialog open={showEditRoom} onOpenChange={setShowEditRoom}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Quarto {selectedRoomForEdit?.number}</DialogTitle>
            <DialogDescription>Modifique as informações do quarto</DialogDescription>
          </DialogHeader>
          {selectedRoomForEdit && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-number">Número do Quarto*</Label>
                <Input
                  id="edit-number"
                  value={selectedRoomForEdit.number || ""}
                  onChange={(e) => setSelectedRoomForEdit({ ...selectedRoomForEdit, number: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Tipo*</Label>
                <Select 
                  value={selectedRoomForEdit.type || ""} 
                  onValueChange={(value) => setSelectedRoomForEdit({ ...selectedRoomForEdit, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-capacity">Capacidade</Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  value={selectedRoomForEdit.capacity || 0}
                  onChange={(e) => setSelectedRoomForEdit({ ...selectedRoomForEdit, capacity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-beds">Número de Camas</Label>
                <Input
                  id="edit-beds"
                  type="number"
                  value={selectedRoomForEdit.beds || 0}
                  onChange={(e) => setSelectedRoomForEdit({ ...selectedRoomForEdit, beds: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-price">Preço por Pessoa/Noite*</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={selectedRoomForEdit.price || 0}
                  onChange={(e) => setSelectedRoomForEdit({ ...selectedRoomForEdit, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          )}
          
          <div>
            <Label>Comodidades</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {amenityOptions.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`edit-${amenity}`}
                    checked={selectedRoomForEdit?.amenities?.includes(amenity) || false}
                    onCheckedChange={() => toggleAmenityEdit(amenity)}
                  />
                  <Label htmlFor={`edit-${amenity}`} className="text-sm">{amenity}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowEditRoom(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEditRoom}>
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}