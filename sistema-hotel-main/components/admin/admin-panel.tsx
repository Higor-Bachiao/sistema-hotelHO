"use client"

import { useState } from "react"
import { useHotel } from "@/contexts/hotel-context"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
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
import { Plus, Edit, Trash2, Bed, DollarSign } from "lucide-react"

export default function AdminPanel() {
  const { rooms, addRoom, updateRoom, deleteRoom } = useHotel()
  const { user } = useAuth()
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [editingRoom, setEditingRoom] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState<number>(0)
  const [showEditRoom, setShowEditRoom] = useState(false)
  const [selectedRoomForEdit, setSelectedRoomForEdit] = useState<any>(null)

  const [newRoom, setNewRoom] = useState({
    number: "",
    type: "",
    capacity: 2,
    beds: 1,
    price: 0,
    amenities: [] as string[],
  })

  const roomTypes = ["Solteiro", "Casal", "Casal com AR", "Triplo"]
  const amenityOptions = ["wifi", "tv", "minibar", "balcony", "parking", "breakfast", "gym", "pool", "ar-condicionado"]

  const handleAddRoom = () => {
    if (!newRoom.number || !newRoom.type || newRoom.price <= 0) {
      console.log("Preencha todos os campos obrigatórios")
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

  const handleDeleteRoom = (roomId: string) => {
    deleteRoom(roomId)
  }

  const handleEditPrice = (roomId: string, currentPrice: number) => {
    setEditingRoom(roomId)
    setEditPrice(currentPrice)
  }

  const handleSavePrice = (roomId: string) => {
    if (editPrice <= 0) {
      console.log("O preço deve ser maior que zero")
      return
    }

    updateRoom(roomId, { price: editPrice })
    setEditingRoom(null)
    setEditPrice(0)
  }

  const handleEditRoom = (room: any) => {
    setSelectedRoomForEdit({ ...room })
    setShowEditRoom(true)
  }

  const handleSaveEditRoom = () => {
    if (!selectedRoomForEdit.number || !selectedRoomForEdit.type || selectedRoomForEdit.price <= 0) {
      console.log("Preencha todos os campos obrigatórios")
      return
    }

    const { id, guest, ...updates } = selectedRoomForEdit
    updateRoom(id, updates)
    setShowEditRoom(false)
    setSelectedRoomForEdit(null)
  }

  const handleStatusChange = (roomId: string, newStatus: string) => {
    updateRoom(roomId, { status: newStatus as "available" | "occupied" | "maintenance" | "cleaning" | "reserved" })
  }

  const handleCancelEdit = () => {
    setEditingRoom(null)
    setEditPrice(0)
  }

  const toggleAmenity = (amenity: string) => {
    setNewRoom((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">
            {user?.role === "admin" ? "Painel Administrativo" : "Painel de Gerenciamento"}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            {user?.role === "admin" ? "Controle total do sistema" : "Gerencie quartos e reservas"}
          </p>
        </div>
      </div>

      <Tabs defaultValue="rooms" className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="rooms" className="flex items-center gap-2 text-xs sm:text-sm">
            <Bed className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Gerenciar Quartos</span>
            <span className="sm:hidden">Quartos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
            <div>
              <h3 className="text-base sm:text-lg font-medium">Quartos do Hotel</h3>
              <p className="text-xs sm:text-sm text-gray-600">Adicione, edite ou remova quartos do sistema</p>
            </div>
            <Dialog open={showAddRoom} onOpenChange={setShowAddRoom}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Adicionar Quarto</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm sm:max-w-md mx-2">
                <DialogHeader>
                  <DialogTitle className="text-base sm:text-lg">Adicionar Novo Quarto</DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm">Preencha os dados do novo quarto</DialogDescription>
                </DialogHeader>

                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="number" className="text-xs sm:text-sm">Número</Label>
                      <Input
                        id="number"
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                        value={newRoom.number}
                        onChange={(e) => setNewRoom((prev) => ({ ...prev, number: e.target.value }))}
                        placeholder="101"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-xs sm:text-sm">Tipo</Label>
                      <Select
                        value={newRoom.type}
                        onValueChange={(value) => setNewRoom((prev) => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {roomTypes.map((type) => (
                            <SelectItem key={type} value={type} className="text-xs sm:text-sm">
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="capacity" className="text-xs sm:text-sm">Capacidade</Label>
                      <Input
                        id="capacity"
                        type="number"
                        min="1"
                        max="10"
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                        value={newRoom.capacity}
                        onChange={(e) => setNewRoom((prev) => ({ ...prev, capacity: Number.parseInt(e.target.value) }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="beds" className="text-xs sm:text-sm">Camas</Label>
                      <Input
                        id="beds"
                        type="number"
                        min="1"
                        max="5"
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                        value={newRoom.beds}
                        onChange={(e) => setNewRoom((prev) => ({ ...prev, beds: Number.parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-xs sm:text-sm">Preço (R$ por pessoa/noite)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      className="h-8 sm:h-10 text-xs sm:text-sm"
                      value={newRoom.price}
                      onChange={(e) => setNewRoom((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Comodidades</Label>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {amenityOptions.map((amenity) => (
                        <Badge
                          key={amenity}
                          variant={newRoom.amenities.includes(amenity) ? "default" : "outline"}
                          className="cursor-pointer text-xs px-2 py-1"
                          onClick={() => toggleAmenity(amenity)}
                        >
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleAddRoom} className="w-full h-8 sm:h-10 text-xs sm:text-sm">
                    Adicionar Quarto
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm min-w-[60px]">Número</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Tipo</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden md:table-cell">Capacidade</TableHead>
                      <TableHead className="text-xs sm:text-sm">Preço/Pessoa</TableHead>
                      <TableHead className="text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="text-xs sm:text-sm min-w-[80px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium text-xs sm:text-sm">{room.number}</TableCell>
                        <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{room.type}</TableCell>
                        <TableCell className="text-xs sm:text-sm hidden md:table-cell">{room.capacity} pessoas</TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {editingRoom === room.id ? (
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={editPrice}
                                onChange={(e) => setEditPrice(Number.parseFloat(e.target.value))}
                                className="w-16 sm:w-24 h-6 sm:h-8 text-xs"
                              />
                              <Button size="sm" onClick={() => handleSavePrice(room.id)} className="h-6 w-6 sm:h-8 sm:w-8 p-0">
                                <span className="text-xs">✓</span>
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-6 w-6 sm:h-8 sm:w-8 p-0">
                                <span className="text-xs">✕</span>
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 sm:gap-2">
                              <span className="text-xs sm:text-sm">R$ {room.price.toFixed(2)}</span>
                              <Button size="sm" variant="ghost" onClick={() => handleEditPrice(room.id, room.price)} className="h-6 w-6 sm:h-8 sm:w-8 p-0">
                                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`text-xs px-1 sm:px-2 py-0.5 sm:py-1 ${
                              room.status === "available" 
                                ? "bg-green-100 text-green-800" 
                                : room.status === "occupied"
                                  ? "bg-red-100 text-red-800"
                                  : room.status === "maintenance"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : room.status === "cleaning"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-blue-100 text-blue-800" // reserved
                            }`}
                          >
                            {room.status === "available"
                              ? "Disponível"
                              : room.status === "occupied"
                                ? "Ocupado"
                                : room.status === "maintenance"
                                  ? "Manutenção"
                                : room.status === "cleaning"
                                  ? "Limpeza"
                                  : "Reservado"}
                        </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 sm:gap-2">
                            <Button variant="outline" size="sm" className="h-6 w-6 sm:h-8 sm:w-8 p-0">
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteRoom(room.id)} className="h-6 w-6 sm:h-8 sm:w-8 p-0">
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
