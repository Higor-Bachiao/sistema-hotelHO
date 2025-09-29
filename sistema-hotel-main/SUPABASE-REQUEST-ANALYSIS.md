# Análise de Consumo de Requests - Supabase

## 📊 Cálculo Atual de Requests

### Sistema Antes das Otimizações
- **Sync rooms**: A cada 10s = 6 req/min = 8.640 req/dia = 259.200 req/mês
- **Estatísticas**: A cada 30s = 2 req/min = 2.880 req/dia = 86.400 req/mês
- **Operações manuais**: ~50 req/dia = 1.500 req/mês
- **Total ANTES**: ~347.100 req/mês ❌ (Excede limite)

### Sistema Após Otimizações Atuais
- **Sync rooms**: A cada 60s + cache 30s = 1 req/min = 1.440 req/dia = 43.200 req/mês
- **Estatísticas**: A cada 2min + cache 2min = 0.5 req/min = 720 req/dia = 21.600 req/mês
- **Operações manuais**: ~50 req/dia = 1.500 req/mês
- **Total ATUAL**: ~66.300 req/mês ⚠️ (Ainda acima do limite)

## 🎯 Otimizações Adicionais Recomendadas

### 1. Aumentar Intervalos de Sincronização

#### Opção Conservadora
- **Sync rooms**: 2 minutos (metade dos requests)
- **Estatísticas**: 5 minutos (reduz drasticamente)
- **Total estimado**: ~26.000 req/mês ✅

#### Opção Eficiente
- **Sync rooms**: 5 minutos (apenas quando necessário)
- **Estatísticas**: 10 minutos (dados menos críticos)
- **Total estimado**: ~12.000 req/mês ✅

### 2. Sincronização Inteligente por Demanda

#### Em vez de polling constante:
- **Sync apenas quando usuário interage**: 80% menos requests
- **WebSockets para updates críticos**: Real-time sem polling
- **Cache mais longo em horários ociosos**: Noite/madrugada

#### Benefícios:
- **Horário comercial (8h)**: Sync normal
- **Horário ocioso (16h)**: Cache de 15-30 minutos
- **Redução estimada**: 60-70% do consumo total

### 3. Cache Mais Agressivo

#### Frontend
```typescript
// Rooms: 2 minutos de cache (era 30s)
RequestCache.set(key, data, 120000)

// Estatísticas: 10 minutos de cache (era 2min)
RequestCache.set(key, data, 600000)
```

#### Backend
```typescript
// Middleware cache: 2 minutos (era 30s)
cacheMiddleware(120000)

// Estatísticas: 10 minutos (era 2min)
cacheMiddleware(600000)
```

## 🏨 Análise por Cenário de Uso

### Hotel Pequeno (1-2 usuários simultâneos)
- **Sync a cada 5min**: 8.640 req/mês
- **Estatísticas a cada 15min**: 2.880 req/mês
- **Total**: ~12.000 req/mês ✅ (24% do limite)

### Hotel Médio (3-5 usuários simultâneos)
- **Sync a cada 3min**: 14.400 req/mês
- **Estatísticas a cada 10min**: 4.320 req/mês
- **Total**: ~20.000 req/mês ✅ (40% do limite)

### Hotel Grande (5+ usuários simultâneos)
- **Sync a cada 2min**: 21.600 req/mês
- **Estatísticas a cada 5min**: 8.640 req/mês
- **Total**: ~32.000 req/mês ✅ (64% do limite)

## 💡 Recomendações Finais

### Para ficar SEGURO dentro do limite:

1. **Sync rooms**: 3-5 minutos
2. **Estatísticas**: 10-15 minutos
3. **Cache frontend**: 2-5 minutos
4. **Cache backend**: 2-10 minutos

### Total estimado: 15.000-25.000 req/mês ✅

### Benefícios:
- ✅ **Dentro do limite do Supabase**
- ✅ **Margem de segurança de 50%**
- ✅ **Performance ainda excelente**
- ✅ **UX praticamente idêntica**

## 🔧 Implementação Sugerida

Criar configuração por ambiente:
```typescript
const SYNC_INTERVALS = {
  development: { rooms: 60000, stats: 120000 }, // Atual
  production: { rooms: 300000, stats: 600000 }  // Otimizado
}
```