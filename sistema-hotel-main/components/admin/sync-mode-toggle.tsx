import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getSyncConfig, toggleEconomyMode, estimateMonthlyRequests, logCurrentConfig } from '@/lib/sync-config'

export function SyncModeToggle() {
  const [isEconomyMode, setIsEconomyMode] = useState(false)
  const [config, setConfig] = useState(getSyncConfig())
  const [estimatedRequests, setEstimatedRequests] = useState(0)

  useEffect(() => {
    // Verificar se está em modo econômico
    const economyMode = typeof localStorage !== 'undefined' && 
                       localStorage.getItem('sync_mode') === 'economy'
    setIsEconomyMode(economyMode)
    
    // Atualizar configuração
    const currentConfig = getSyncConfig()
    setConfig(currentConfig)
    setEstimatedRequests(estimateMonthlyRequests(currentConfig))
    
    // Log da configuração atual
    logCurrentConfig()
  }, [])

  const handleToggle = () => {
    const newMode = !isEconomyMode
    toggleEconomyMode(newMode)
    // A página será recarregada automaticamente pelo toggleEconomyMode
  }

  const getStatusColor = () => {
    if (estimatedRequests < 25000) return 'bg-green-500'
    if (estimatedRequests < 40000) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getStatusText = () => {
    if (estimatedRequests < 25000) return 'Muito Seguro'
    if (estimatedRequests < 40000) return 'Seguro'
    return 'Atenção'
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Configuração de Sincronização</h3>
        <Badge className={getStatusColor()}>
          {getStatusText()}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Sync Quartos:</span>
          <span className="ml-2">{config.rooms / 1000}s</span>
        </div>
        <div>
          <span className="font-medium">Sync Estatísticas:</span>
          <span className="ml-2">{config.statistics / 1000}s</span>
        </div>
        <div>
          <span className="font-medium">Cache Quartos:</span>
          <span className="ml-2">{config.cache.rooms / 1000}s</span>
        </div>
        <div>
          <span className="font-medium">Cache Estatísticas:</span>
          <span className="ml-2">{config.cache.statistics / 1000}s</span>
        </div>
      </div>

      <div className="p-3 bg-white rounded border">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Consumo Estimado/Mês:</span>
          <span className="text-lg font-bold">
            {estimatedRequests.toLocaleString()} / 50.000
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getStatusColor()}`}
            style={{ width: `${Math.min((estimatedRequests / 50000) * 100, 100)}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {((estimatedRequests / 50000) * 100).toFixed(1)}% do limite do Supabase
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">
            Modo {isEconomyMode ? 'Econômico' : 'Normal'}
          </p>
          <p className="text-sm text-gray-600">
            {isEconomyMode 
              ? 'Menor consumo, atualizações menos frequentes'
              : 'Atualizações mais frequentes, maior consumo'
            }
          </p>
        </div>
        <Button
          onClick={handleToggle}
          variant={isEconomyMode ? 'default' : 'outline'}
          size="sm"
        >
          {isEconomyMode ? 'Modo Normal' : 'Modo Econômico'}
        </Button>
      </div>

      {estimatedRequests > 45000 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800 text-sm font-medium">
            ⚠️ Consumo próximo ao limite!
          </p>
          <p className="text-red-600 text-xs">
            Recomendamos ativar o modo econômico para evitar exceder o limite do Supabase.
          </p>
        </div>
      )}
    </div>
  )
}