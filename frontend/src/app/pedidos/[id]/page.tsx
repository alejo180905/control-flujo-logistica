'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'

interface HistorialItem {
  id_historial: number
  id_pedido: number
  id_usuario: number
  accion: string
  etapa: string
  fecha: string
  nombre_usuario: string
  rol_usuario: string
}

interface Pedido {
  id_pedido: number
  numero_pedido: string
  estado: string
  started_at: string
  fecha_creacion: string
  completed_at?: string
}

export default function PedidoDetallePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [historial, setHistorial] = useState<HistorialItem[]>([])
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]
    if (!token) {
      console.log('Redirigiendo a login por falta de token...')
      router.push('/login')
      return
    }

    fetchHistorial()
  }, [params.id, router])

  const fetchHistorial = async () => {
    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]
      const response = await fetch(`http://localhost:3000/api/pedidos/${params.id}/historial`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al cargar el historial')
      }

      const data = await response.json()
      setHistorial(data.datos || [])
      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setError('Error al cargar el historial del pedido')
      setLoading(false)
    }
  }

  // Función para formatear la fecha
  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Función para obtener el color según la etapa
  const getEtapaColor = (etapa: string) => {
    const colores = {
      'BODEGA': 'bg-yellow-100 text-yellow-800',
      'DESPACHOS': 'bg-blue-100 text-blue-800',
      'MENSAJERO': 'bg-purple-100 text-purple-800',
      'MAQUILAS': 'bg-indigo-100 text-indigo-800',
      'FINALIZADO': 'bg-green-100 text-green-800'
    }
    return colores[etapa as keyof typeof colores] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Cargando historial...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Historial del Pedido</h1>
              <p className="mt-1 text-sm text-gray-500">
                Seguimiento de todas las acciones realizadas
              </p>
            </div>
            <button
              onClick={() => router.push('/pedidos')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Volver a la lista
            </button>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="border-t border-gray-200">
              {historial.map((item, index) => (
                <div key={item.id_historial} className={`px-4 py-5 sm:p-6 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEtapaColor(item.etapa)}`}>
                        {item.etapa}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {item.accion} por {item.nombre_usuario} ({item.rol_usuario})
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatFecha(item.fecha)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}