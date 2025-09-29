// Configurações de sincronização por ambiente
interface SyncConfig {
  rooms: number;      // Intervalo de sync de rooms (ms)
  statistics: number; // Intervalo de sync de estatísticas (ms)
  cache: {
    rooms: number;    // Cache TTL para rooms (ms)
    statistics: number; // Cache TTL para estatísticas (ms)
  };
}

const SYNC_CONFIGS: Record<string, SyncConfig> = {
  // Desenvolvimento - intervalos menores para testes
  development: {
    rooms: 60000,      // 1 minuto
    statistics: 120000, // 2 minutos
    cache: {
      rooms: 30000,     // 30 segundos
      statistics: 60000 // 1 minuto
    }
  },
  
  // Produção - intervalos otimizados para economizar requests
  production: {
    rooms: 300000,      // 5 minutos
    statistics: 600000, // 10 minutos
    cache: {
      rooms: 120000,     // 2 minutos
      statistics: 300000 // 5 minutos
    }
  },
  
  // Modo econômico - para hotéis com baixo movimento
  economy: {
    rooms: 600000,      // 10 minutos
    statistics: 900000, // 15 minutos
    cache: {
      rooms: 300000,     // 5 minutos
      statistics: 600000 // 10 minutos
    }
  }
};

// Detectar ambiente atual
const getCurrentEnv = (): string => {
  if (typeof window === 'undefined') {
    return process.env.NODE_ENV || 'development';
  }
  
  // No cliente, verificar se é localhost ou produção
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  }
  
  // Verificar se é modo econômico via localStorage
  if (typeof localStorage !== 'undefined' && localStorage.getItem('sync_mode') === 'economy') {
    return 'economy';
  }
  
  return 'production';
};

// Obter configuração atual
export const getSyncConfig = (): SyncConfig => {
  const env = getCurrentEnv();
  return SYNC_CONFIGS[env] || SYNC_CONFIGS.development;
};

// Função para alternar modo econômico
export const toggleEconomyMode = (enable: boolean): void => {
  if (typeof localStorage !== 'undefined') {
    if (enable) {
      localStorage.setItem('sync_mode', 'economy');
    } else {
      localStorage.removeItem('sync_mode');
    }
    
    // Recarregar página para aplicar nova configuração
    window.location.reload();
  }
};

// Função para calcular requests por mês estimados
export const estimateMonthlyRequests = (config: SyncConfig): number => {
  const msPerMonth = 30 * 24 * 60 * 60 * 1000; // 30 dias em millisegundos
  
  const roomsRequests = msPerMonth / config.rooms;
  const statsRequests = msPerMonth / config.statistics;
  const manualRequests = 1500; // Estimativa de operações manuais
  
  return Math.round(roomsRequests + statsRequests + manualRequests);
};

// Log da configuração atual
export const logCurrentConfig = (): void => {
  const config = getSyncConfig();
  const env = getCurrentEnv();
  const estimated = estimateMonthlyRequests(config);
  
  console.log(`🔧 Configuração de Sync (${env.toUpperCase()}):`, {
    rooms: `${config.rooms / 1000}s`,
    statistics: `${config.statistics / 1000}s`,
    cache: {
      rooms: `${config.cache.rooms / 1000}s`,
      statistics: `${config.cache.statistics / 1000}s`
    },
    estimatedMonthlyRequests: estimated,
    withinSupabaseLimit: estimated < 50000 ? '✅' : '❌'
  });
};