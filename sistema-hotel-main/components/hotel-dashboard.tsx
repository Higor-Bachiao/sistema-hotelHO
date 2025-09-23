"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import LoginForm from "./auth/login-form"
import Navbar from "./layout/navbar"
import RoomGrid from "./rooms/room-grid"
import AdminPanel from "./admin/admin-panel"
import FutureReservationsList from "./reservations/future-reservations-list"
import StatisticsPanel from "./dashboard/statistics-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HotelDashboard() {
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState("rooms")

  if (!isAuthenticated) {
    return <LoginForm />
  }

  // Definir abas baseado no role do usuário
  const getAvailableTabs = () => {
    const tabs = []

    // Todos podem ver quartos e reservas
    tabs.push({ value: "rooms", label: "Quartos" }, { value: "future-reservations", label: "Reservas Futuras" })

    // Admin e Staff podem administrar
    if (user?.role === "admin" || user?.role === "staff") {
      tabs.push({ value: "admin", label: "Administração" })
    }

    // Apenas Admin pode ver estatísticas
    if (user?.role === "admin") {
      tabs.push({ value: "statistics", label: "Estatísticas" })
    }

    return tabs
  }

  const availableTabs = getAvailableTabs()

  // Verificar se a aba ativa está disponível
  const isTabAvailable = availableTabs.some((tab) => tab.value === activeTab)
  const currentTab = isTabAvailable ? activeTab : "rooms"

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Sistema de Gerenciamento Hoteleiro
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Bem-vindo, {user?.name}!{user?.role === "admin" && " (Administrador)"}
            {user?.role === "staff" && " (Funcionário)"}
            {user?.role === "guest" }
          </p>
        </div>

        <Tabs value={currentTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full gap-1 mb-4 sm:mb-8 h-auto p-1" style={{
            gridTemplateColumns: `repeat(${availableTabs.length}, minmax(0, 1fr))`
          }}>
            {availableTabs.map((tab) => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value} 
                className="text-xs sm:text-sm px-2 py-2 whitespace-nowrap overflow-hidden text-ellipsis"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="rooms" className="mt-0">
            <RoomGrid />
          </TabsContent>

          <TabsContent value="future-reservations" className="mt-0">
            <FutureReservationsList />
          </TabsContent>

          {/* Admin e Staff podem administrar */}
          {(user?.role === "admin" || user?.role === "staff") && (
            <TabsContent value="admin" className="mt-0">
              <AdminPanel />
            </TabsContent>
          )}

          {/* Apenas Admin pode ver estatísticas */}
          {user?.role === "admin" && (
            <TabsContent value="statistics" className="mt-0">
              <StatisticsPanel />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}
