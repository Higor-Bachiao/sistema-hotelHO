import { useState, useEffect } from 'react'
import type { HotelStatistics } from '@/types/hotel'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export function useApiStatistics() {
  const [statistics, setStatistics] = useState<HotelStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStatistics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/statistics`)
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.data) {
        setStatistics(data.data)
        console.log('📊 Estatísticas carregadas da API:', data.data)
      } else {
        throw new Error(data.error || 'Erro ao carregar estatísticas')
      }
    } catch (err: any) {
      console.error('❌ Erro ao carregar estatísticas da API:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatistics()
    
    // Atualizar estatísticas a cada 30 segundos
    const interval = setInterval(loadStatistics, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return {
    statistics,
    loading,
    error,
    refresh: loadStatistics
  }
}