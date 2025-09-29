import { Request, Response, NextFunction } from 'express';

// Cache simples para evitar requests duplicadas
interface RequestCacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class RequestDedupe {
  private static cache = new Map<string, RequestCacheEntry>();
  private static pendingRequests = new Map<string, Promise<any>>();

  static generateKey(req: Request): string {
    return `${req.method}:${req.path}:${JSON.stringify(req.query)}`;
  }

  static async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  static set(key: string, data: any, ttlMs: number = 30000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  static invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  static async dedupe<T>(
    key: string, 
    operation: () => Promise<T>,
    ttlMs: number = 30000
  ): Promise<T> {
    // Verificar cache primeiro
    const cached = await this.get<T>(key);
    if (cached) {
      return cached;
    }

    // Verificar se já há uma operação pendente
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending as Promise<T>;
    }

    // Executar operação e cachear
    const promise = operation().then(result => {
      this.set(key, result, ttlMs);
      this.pendingRequests.delete(key);
      return result;
    }).catch(error => {
      this.pendingRequests.delete(key);
      throw error;
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }
}

// Middleware para cache de requests GET
export const cacheMiddleware = (ttlMs: number = 30000) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Aplicar cache apenas em requests GET
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = RequestDedupe.generateKey(req);
    
    try {
      const cachedResponse = await RequestDedupe.get(cacheKey);
      
      if (cachedResponse) {
        console.log(`⚡ Cache hit para ${cacheKey}`);
        return res.json(cachedResponse);
      }

      // Override do res.json para capturar a resposta
      const originalJson = res.json;
      res.json = function(data: any) {
        // Cachear apenas respostas de sucesso
        if (res.statusCode >= 200 && res.statusCode < 300) {
          RequestDedupe.set(cacheKey, data, ttlMs);
          console.log(`💾 Cached response para ${cacheKey}`);
        }
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('❌ Erro no cache middleware:', error);
      next();
    }
  };
};

// Middleware para invalidar cache em operações de escrita
export const invalidateCacheMiddleware = (patterns: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Override do res.json para invalidar cache após operação bem-sucedida
    const originalJson = res.json;
    res.json = function(data: any) {
      // Invalidar cache apenas em respostas de sucesso para operações de escrita
      if (req.method !== 'GET' && res.statusCode >= 200 && res.statusCode < 300) {
        patterns.forEach(pattern => {
          RequestDedupe.invalidatePattern(pattern);
          console.log(`🗑️ Cache invalidado para padrão: ${pattern}`);
        });
      }
      return originalJson.call(this, data);
    };

    next();
  };
};

export { RequestDedupe };