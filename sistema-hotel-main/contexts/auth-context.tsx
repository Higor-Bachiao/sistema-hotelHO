"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "staff" | "guest"
  phone?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: Omit<User, "id" | "role"> & { password: string }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Auto-login com usuário admin
    const adminUser = {
      id: "1",
      name: "Administrador", 
      email: "admin@hotel.com",
      role: "admin" as const
    }
    setUser(adminUser)
  }, [])

  const login = async (email: string, password: string) => {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Aceita qualquer login para demo
    const loggedUser = {
      id: "1",
      name: "Administrador",
      email: email,
      role: "admin" as const
    }
    setUser(loggedUser)
  }

  const register = async (userData: Omit<User, "id" | "role"> & { password: string }) => {
    // Simular registro
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newUser = {
      id: Math.random().toString(),
      name: userData.name,
      email: userData.email,
      role: "guest" as const,
      phone: userData.phone
    }
    setUser(newUser)
  }

  const logout = () => {
    setUser(null)
  }

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}