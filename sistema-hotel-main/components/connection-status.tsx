"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"

interface ConnectionStatusProps {
  isOnline: boolean
  error: string | null
  lastSync: Date | null
}

export default function ConnectionStatus({ isOnline, error, lastSync }: ConnectionStatusProps) {
  const [showDetails, setShowDetails] = useState(false)

  // Auto-hide error after 10 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setShowDetails(false)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [error])

  if (!error && isOnline) {
    return null // Não mostrar nada quando tudo está funcionando
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert 
        className={`${
          error ? 'border-orange-200 bg-orange-50' : 'border-red-200 bg-red-50'
        } shadow-lg`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-orange-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            <Badge variant={isOnline ? "secondary" : "destructive"} className="text-xs">
              {isOnline ? "API Limitada" : "Offline"}
            </Badge>
          </div>
          <RefreshCw 
            className="h-3 w-3 text-gray-400 cursor-pointer hover:text-gray-600" 
            onClick={(e) => {
              e.stopPropagation()
              window.location.reload()
            }}
          />
        </div>
        
        {showDetails && (
          <AlertDescription className="mt-2 text-xs">
            {error || "Conexão perdida. Usando dados offline."}
            {lastSync && (
              <div className="mt-1 text-gray-500">
                Última sincronização: {lastSync.toLocaleTimeString()}
              </div>
            )}
          </AlertDescription>
        )}
      </Alert>
    </div>
  )
}