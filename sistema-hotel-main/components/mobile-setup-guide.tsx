"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Smartphone, 
  Wifi, 
  Info, 
  Copy, 
  CheckCircle, 
  AlertTriangle,
  Monitor,
  Router
} from "lucide-react"

interface MobileSetupGuideProps {
  apiUrl: string
  isConnected: boolean
}

export default function MobileSetupGuide({ apiUrl, isConnected }: MobileSetupGuideProps) {
  const [showGuide, setShowGuide] = useState(false)
  const [copied, setCopied] = useState(false)

  const getLocalIP = () => {
    // IP atual da máquina
    return "192.168.100.155"
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isConnected) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Conexão Estabelecida</AlertTitle>
        <AlertDescription className="text-green-700">
          API funcionando normalmente em: {apiUrl}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <Alert className="bg-orange-50 border-orange-200">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-800">Problema de Conectividade</AlertTitle>
        <AlertDescription className="text-orange-700">
          Não foi possível conectar à API. {apiUrl}
          <Button 
            variant="link" 
            size="sm" 
            onClick={() => setShowGuide(!showGuide)}
            className="p-0 h-auto text-orange-800 underline ml-1"
          >
            Ver instruções para mobile
          </Button>
        </AlertDescription>
      </Alert>

      {showGuide && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Smartphone className="h-5 w-5" />
              Configuração para Dispositivos Móveis
            </CardTitle>
            <CardDescription>
              Para acessar o sistema pelo celular, siga estas instruções:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Passo 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">1</Badge>
                <h3 className="font-semibold flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Descubra seu IP Local
                </h3>
              </div>
              <div className="pl-8 space-y-2">
                <p className="text-sm text-gray-600">
                  No computador onde a API está rodando, execute:
                </p>
                <div className="bg-gray-100 p-3 rounded-md font-mono text-sm flex items-center justify-between">
                  <code>ipconfig | findstr IPv4</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard("ipconfig | findstr IPv4")}
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Procure por algo como: 192.168.1.100 ou 10.0.0.5
                </p>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">2</Badge>
                <h3 className="font-semibold flex items-center gap-2">
                  <Router className="h-4 w-4" />
                  Configure o Firewall
                </h3>
              </div>
              <div className="pl-8 space-y-2">
                <p className="text-sm text-gray-600">
                  Libere a porta 3001 no Windows Firewall:
                </p>
                <div className="bg-gray-100 p-3 rounded-md">
                  <ol className="text-sm space-y-1">
                    <li>1. Painel de Controle → Sistema e Segurança → Windows Defender Firewall</li>
                    <li>2. Configurações Avançadas → Regras de Entrada → Nova Regra</li>
                    <li>3. Tipo: Porta → Protocolo: TCP → Porta: 3001</li>
                    <li>4. Permitir conexão → Aplicar a todos os perfis</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">3</Badge>
                <h3 className="font-semibold flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Acesse pelo Mobile
                </h3>
              </div>
              <div className="pl-8 space-y-2">
                <p className="text-sm text-gray-600">
                  No seu celular, acesse usando o IP local:
                </p>
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm font-mono text-blue-800">
                    http://SEU_IP_LOCAL:3000
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Exemplo: http://192.168.1.100:3000
                  </p>
                </div>
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700 text-sm">
                    Certifique-se de que o celular está na mesma rede Wi-Fi do computador.
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            {/* Troubleshooting */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-semibold text-gray-800 mb-2">💡 Dicas de Resolução de Problemas:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Verifique se ambos dispositivos estão na mesma rede</li>
                <li>• Teste pingando o IP: <code className="bg-white px-1 rounded">ping SEU_IP</code></li>
                <li>• Desative temporariamente antivírus se necessário</li>
                <li>• Use modo de dados móveis se Wi-Fi não funcionar</li>
              </ul>
            </div>

          </CardContent>
        </Card>
      )}
    </div>
  )
}