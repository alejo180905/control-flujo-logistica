'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { fetchApi } from '@/lib/api'

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
  const [deleting, setDeleting] = useState(false)
  const [userRole, setUserRole] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingPedido, setEditingPedido] = useState(false)
  const [newNumeroPedido, setNewNumeroPedido] = useState('')

  useEffect(() => {
    const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]
    if (!token) {
      console.log('Redirigiendo a login por falta de token...')
      router.push('/login')
      return
    }

    // Obtener información del usuario
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUserRole(payload.rol)
    } catch {
      router.push('/login')
      return
    }

    fetchHistorial()
  }, [params.id, router])

  const fetchHistorial = async () => {
    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]
      
      // Obtener historial y datos del pedido en paralelo
      const [historialData, pedidosData] = await Promise.all([
        fetchApi(`/pedidos/${params.id}/historial`, { token }),
        fetchApi('/pedidos', { token })
      ])
      setHistorial(historialData.datos || [])
      const pedidoActual = pedidosData.datos?.find((p: Pedido) => p.id_pedido === parseInt(params.id))
      if (pedidoActual) {
        setPedido(pedidoActual)
        setNewNumeroPedido(pedidoActual.numero_pedido)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setError('Error al cargar el historial del pedido')
      setLoading(false)
    }
  }

  const eliminarPedido = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.')) {
      return
    }

    setDeleting(true)
    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]
      const data = await fetchApi(`/pedidos/${params.id}`, {
        method: 'DELETE',
        token
      })
      if (data && !data.error) {
        alert('Pedido eliminado correctamente')
        router.push('/pedidos')
      } else {
        throw new Error(data.mensaje || 'Error al eliminar el pedido')
      }
    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : 'Error al eliminar el pedido')
    } finally {
      setDeleting(false)
    }
  }

  const editarPedido = async () => {
    if (!newNumeroPedido.trim()) {
      alert('El número de pedido no puede estar vacío')
      return
    }

    if (newNumeroPedido.trim() === pedido?.numero_pedido) {
      setShowEditModal(false)
      return
    }

    setEditingPedido(true)
    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]
      const data = await fetchApi(`/pedidos/${params.id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify({ numero_pedido: newNumeroPedido.trim() })
      })
      if (data && !data.error) {
        alert('Pedido editado correctamente')
        setShowEditModal(false)
        fetchHistorial()
      } else {
        throw new Error(data.mensaje || 'Error al editar el pedido')
      }
    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : 'Error al editar el pedido')
    } finally {
      setEditingPedido(false)
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

  // Función para formatear el texto de la acción
  const formatearAccion = (accion: string, etapa: string) => {
    const acciones = {
      'RECIBIDO': 'Recibido',
      'ENTREGADO': 'Entregado',
      'EDITADO': 'Pedido Editado'
    }
    return acciones[accion as keyof typeof acciones] || accion
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
              <h1 className="text-3xl font-bold text-gray-900">
                Historial del Pedido {pedido?.numero_pedido || ''}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Estado: <span className="font-medium">{pedido?.estado || 'Cargando...'}</span> | 
                Seguimiento de todas las acciones realizadas
              </p>
            </div>
            <div className="flex space-x-3">
              {userRole === 'Admin' && pedido?.estado === 'BODEGA' && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar Pedido
                </button>
              )}
              {userRole === 'Admin' && (
                <button
                  onClick={eliminarPedido}
                  disabled={deleting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar Pedido
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => router.push('/pedidos')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Volver a la lista
              </button>
            </div>
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
                        {item.accion === 'RECIBIDO' && item.etapa === 'BODEGA' 
                          ? `Recibido en bodega (pedido creado por ${item.nombre_usuario} (${item.rol_usuario}))`
                          : `${formatearAccion(item.accion, item.etapa)} por ${item.nombre_usuario} (${item.rol_usuario})`
                        }
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

      {/* Modal de edición */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Editar Número de Pedido
              </h3>
              
              <div className="mb-4">
                <label htmlFor="numero-pedido" className="block text-sm font-medium text-gray-700 mb-2">
                  Número Actual: <span className="font-bold">{pedido?.numero_pedido}</span>
                </label>
                <label htmlFor="numero-pedido" className="block text-sm font-medium text-gray-700 mb-1">
                  Nuevo Número de Pedido
                </label>
                <input
                  type="text"
                  id="numero-pedido"
                  value={newNumeroPedido}
                  onChange={(e) => setNewNumeroPedido(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ingresa el nuevo número"
                />
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Importante:</strong> Solo se pueden editar pedidos en estado BODEGA.
                      Esta acción se registrará en el historial.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={editarPedido}
                  disabled={editingPedido}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {editingPedido ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setNewNumeroPedido(pedido?.numero_pedido || '')
                  }}
                  disabled={editingPedido}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}