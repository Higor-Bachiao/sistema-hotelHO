import { useState, useEffect } from 'react'
import type { HotelStatistics } from '@/types/hotel'
import { getSyncConfig } from '@/lib/sync-config'

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
    const config = getSyncConfig();
    
    loadStatistics()
    
    // Usar configuração dinâmica para intervalo
    const interval = setInterval(loadStatistics, config.statistics)
    
    console.log(`📊 Estatísticas configuradas para atualizar a cada ${config.statistics / 1000}s`)
    
    return () => clearInterval(interval)
  }, [])

  return {
    statistics,
    loading,
    error,
    refresh: loadStatistics
  }
}