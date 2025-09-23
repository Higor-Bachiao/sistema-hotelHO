// Utilitários de rede para detectar configuração de API

export const getLocalIP = async (): Promise<string | null> => {
  try {
    // Tenta usar WebRTC para detectar IP local
    const pc = new RTCPeerConnection({
      iceServers: []
    })
    
    pc.createDataChannel('')
    
    return new Promise((resolve) => {
      pc.onicecandidate = (ice) => {
        if (!ice || !ice.candidate || !ice.candidate.candidate) {
          resolve(null)
          return
        }
        
        const myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)?.[1]
        
        if (myIP) {
          resolve(myIP)
          pc.close()
        }
      }
      
      pc.createOffer().then(offer => pc.setLocalDescription(offer))
      
      // Timeout after 3 seconds
      setTimeout(() => {
        resolve(null)
        pc.close()
      }, 3000)
    })
  } catch (error) {
    console.warn('Não foi possível detectar IP local:', error)
    return null
  }
}

export const detectAPIEndpoint = async (): Promise<string> => {
  const defaultEndpoint = 'http://localhost:3001/api'
  
  // Se estamos no servidor, usar localhost
  if (typeof window === 'undefined') {
    return defaultEndpoint
  }
  
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '::1'
  
  // Se estamos em localhost, usar localhost
  if (isLocalhost) {
    return defaultEndpoint
  }
  
  // Para dispositivos móveis/externos, tentar detectar IP
  const localIP = await getLocalIP()
  
  if (localIP && localIP !== '127.0.0.1') {
    const endpoint = `http://${localIP}:3001/api`
    console.log('🌐 IP local detectado, tentando endpoint:', endpoint)
    
    // Testar se o endpoint funciona
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(`${endpoint}/rooms`, {
        method: 'GET',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        console.log('✅ Endpoint detectado funcionando:', endpoint)
        return endpoint
      }
    } catch (error) {
      console.warn('❌ Endpoint detectado não funciona:', endpoint)
    }
  }
  
  // Fallback para localhost
  console.log('🔄 Usando endpoint padrão:', defaultEndpoint)
  return defaultEndpoint
}

export const testAPIConnection = async (baseURL: string): Promise<boolean> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(`${baseURL}/rooms`, {
      signal: controller.signal,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
    
    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    console.warn('Teste de conexão falhou:', error)
    return false
  }
}