'use client'

import { useState } from 'react'

interface PedidoActionsProps {
  pedido: {
    id_pedido: number
    numero_pedido: string
    estado: string
  }
  userRole: string
  userName: string
  onActionComplete: () => void
}

export default function PedidoActions({ pedido, userRole, userName, onActionComplete }: PedidoActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const getToken = () => {
    return document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]
  }

  const makeRequest = async (endpoint: string, method: string = 'PUT', body?: any) => {
    const token = getToken()
    const response = await fetch(`http://localhost:3000/api/pedidos${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: body ? JSON.stringify(body) : undefined
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.mensaje || 'Error en la operación')
    }

    return await response.json()
  }

  const handleAction = async (action: string, endpoint: string) => {
    try {
      setLoading(action)
      await makeRequest(endpoint, 'PUT')
      onActionComplete()
    } catch (error) {
      console.error('Error:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setLoading(null)
    }
  }

  // Determinar qué botones mostrar según el rol y estado
  const getAvailableActions = () => {
    const actions = []

    switch (userRole) {
      case 'Bodega':
        if (pedido.estado === 'En_Bodega') {
          actions.push({
            label: 'Entregar a Despachos',
            action: 'entregar-despachos',
            endpoint: `/${pedido.id_pedido}/bodega/entregar-despachos`,
            color: 'bg-blue-600 hover:bg-blue-700'
          })
        }
        break

      case 'Despachos':
        if (pedido.estado === 'Entregado_a_Despachos') {
          actions.push({
            label: 'Recibir en Despachos',
            action: 'recibir-despachos',
            endpoint: `/${pedido.id_pedido}/despachos/recibir`,
            color: 'bg-blue-600 hover:bg-blue-700'
          })
        } else if (pedido.estado === 'Recibido_por_Despachos') {
          actions.push({
            label: 'Entregar a Mensajero',
            action: 'entregar-mensajero',
            endpoint: `/${pedido.id_pedido}/despachos/entregar-mensajero`,
            color: 'bg-orange-600 hover:bg-orange-700'
          })
        }
        break

      case 'Mensajero':
        if (pedido.estado === 'Entregado_por_Despachos') {
          actions.push({
            label: 'Recoger de Despachos',
            action: 'recoger',
            endpoint: `/${pedido.id_pedido}/mensajero/recoger`,
            color: 'bg-green-600 hover:bg-green-700'
          })
        } else if (pedido.estado === 'Recibido_por_Mensajero') {
          // Cualquier mensajero puede entregar (sin verificar quien recogió)
          actions.push({
            label: 'Entregar a Maquila',
            action: 'entregar-maquila',
            endpoint: `/${pedido.id_pedido}/mensajero/entregar-maquila`,
            color: 'bg-orange-600 hover:bg-orange-700'
          })
        }
        break

      case 'Maquilas':
        if (pedido.estado === 'Entregado_a_Maquila') {
          actions.push({
            label: 'Confirmar Recepción',
            action: 'recibir',
            endpoint: `/${pedido.id_pedido}/maquilas/recibir`,
            color: 'bg-purple-600 hover:bg-purple-700'
          })
        }
        break
    }

    return actions
  }

  const actions = getAvailableActions()

  if (actions.length === 0) {
    return null
  }

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        {actions.map((action) => (
          <button
            key={action.action}
            onClick={() => handleAction(action.action, action.endpoint)}
            disabled={loading !== null}
            className={`px-3 py-1 text-white text-sm rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed ${action.color}`}
          >
            {loading === action.action ? (
              <>
                <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                Procesando...
              </>
            ) : (
              action.label
            )}
          </button>
        ))}
      </div>

    </>
  )
}