import { useState, useEffect, useCallback } from 'react';
import { Room } from '@/types/hotel';
import { RequestCache } from '@/lib/debounce';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface UseOptimizedRoomsOptions {
  enableCache?: boolean;
  cacheTimeout?: number;
  enablePolling?: boolean;
  pollingInterval?: number;
}

export function useOptimizedRooms(options: UseOptimizedRoomsOptions = {}) {
  const {
    enableCache = true,
    cacheTimeout = 30000, // 30 segundos
    enablePolling = false,
    pollingInterval = 60000 // 1 minuto
  } = options;

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchRooms = useCallback(async (forceRefresh = false) => {
    const cacheKey = 'optimized:rooms';
    
    // Verificar cache se não forçar refresh
    if (enableCache && !forceRefresh) {
      const cachedRooms = RequestCache.get<Room[]>(cacheKey);
      if (cachedRooms) {
        setRooms(cachedRooms);
        setLoading(false);
        console.log('⚡ Rooms carregados do cache otimizado');
        return cachedRooms;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setRooms(data.data);
        setLastFetch(new Date());
        
        // Cachear resultado se cache habilitado
        if (enableCache) {
          RequestCache.set(cacheKey, data.data, cacheTimeout);
        }
        
        console.log(`✅ ${data.data.length} rooms carregados da API`);
        return data.data;
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (err: any) {
      console.error('❌ Erro ao carregar rooms:', err);
      setError(err.message);
      
      // Tentar carregar do cache mesmo com erro
      if (enableCache) {
        const cachedRooms = RequestCache.get<Room[]>(cacheKey);
        if (cachedRooms) {
          setRooms(cachedRooms);
          setError(`API indisponível - usando cache: ${err.message}`);
          return cachedRooms;
        }
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [enableCache, cacheTimeout]);

  // Função para invalidar cache e recarregar
  const refresh = useCallback(() => {
    RequestCache.invalidate('optimized:rooms');
    return fetchRooms(true);
  }, [fetchRooms]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Polling opcional
  useEffect(() => {
    if (!enablePolling) return;

    const interval = setInterval(() => {
      fetchRooms();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [enablePolling, pollingInterval, fetchRooms]);

  return {
    rooms,
    loading,
    error,
    lastFetch,
    refresh,
    fetchRooms
  };
}