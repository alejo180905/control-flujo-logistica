'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import EstadoBadge from '@/components/EstadoBadge'
import PedidoActions from '@/components/PedidoActions'

interface Pedido {
  id_pedido: number
  numero_pedido: string
  estado: string
  started_at: string
  fecha_creacion: string
  completed_at?: string
  total_movimientos: number
  mensajero_que_recogio?: string
  maquila_que_recibio?: string
}

interface Usuario {
  rol: string
  nombre: string
  usuario: string
}

export default function PedidosPage() {
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [pedidosFiltrados, setPedidosFiltrados] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  
  // Estados para filtros
  const [filtroNumero, setFiltroNumero] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')

  useEffect(() => {
    const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]
    if (!token) {
      console.log('Redirigiendo a login por falta de token...')
      router.push('/login')
      return
    }

    // Decodificar el token para obtener la información del usuario
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUsuario(payload)
    } catch (error) {
      console.error('Error al decodificar token:', error)
    }

    fetchPedidos()
  }, [router])

  const fetchPedidos = async () => {
    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]
      const response = await fetch('http://localhost:3000/api/pedidos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al cargar los pedidos')
      }

      const data = await response.json()
      setPedidos(data.datos || [])
      setPedidosFiltrados(data.datos || []) // Inicializar filtrados con todos los pedidos
    } catch (error) {
      console.error('Error:', error)
      setError('Error al cargar los pedidos')
    } finally {
      setLoading(false)
    }
  }

  // Función para aplicar filtros
  const aplicarFiltros = () => {
    let resultado = [...pedidos]

    // Filtro por número de pedido
    if (filtroNumero.trim()) {
      resultado = resultado.filter(pedido => 
        pedido.numero_pedido.toLowerCase().includes(filtroNumero.toLowerCase())
      )
    }

    // Filtro por estado
    if (filtroEstado) {
      resultado = resultado.filter(pedido => pedido.estado === filtroEstado)
    }

    // Filtro por fecha (comparación exacta por día)
    if (filtroFecha.trim()) {
      resultado = resultado.filter(pedido => {
        // Convertir la fecha del pedido a formato YYYY-MM-DD para comparar
        const fechaPedido = new Date(pedido.fecha_creacion)
        const fechaPedidoStr = fechaPedido.getFullYear() + '-' + 
                               String(fechaPedido.getMonth() + 1).padStart(2, '0') + '-' + 
                               String(fechaPedido.getDate()).padStart(2, '0')
        return fechaPedidoStr === filtroFecha
      })
    }

    setPedidosFiltrados(resultado)
  }

  // useEffect para aplicar filtros cuando cambien
  useEffect(() => {
    aplicarFiltros()
  }, [filtroNumero, filtroEstado, filtroFecha, pedidos])

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltroNumero('')
    setFiltroEstado('')
    setFiltroFecha('')
  }

  // Función para obtener el color según el estado
  const getEstadoColor = (estado: string) => {
    const colores = {
      'BODEGA': 'bg-yellow-100 text-yellow-800',
      'DESPACHOS': 'bg-blue-100 text-blue-800',
      'MENSAJERO': 'bg-purple-100 text-purple-800',
      'MAQUILAS': 'bg-indigo-100 text-indigo-800',
      'FINALIZADO': 'bg-green-100 text-green-800'
    }
    return colores[estado as keyof typeof colores] || 'bg-gray-100 text-gray-800'
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

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Cargando pedidos...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Lista de Pedidos</h1>
            {usuario?.rol === 'Admin' && (
              <button
                onClick={() => router.push('/pedidos/nuevo')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Nuevo Pedido
              </button>
            )}
          </div>

          {/* Sección de Filtros */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros de Búsqueda</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Filtro por Número */}
              <div>
                <label htmlFor="filtro-numero" className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Pedido
                </label>
                <input
                  type="text"
                  id="filtro-numero"
                  value={filtroNumero}
                  onChange={(e) => setFiltroNumero(e.target.value)}
                  placeholder="Buscar por número..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filtro por Estado */}
              <div>
                <label htmlFor="filtro-estado" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  id="filtro-estado"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="En_Bodega">En Bodega</option>
                  <option value="Entregado_a_Despachos">Entregado a Despachos</option>
                  <option value="Recibido_por_Despachos">Recibido por Despachos</option>
                  <option value="Entregado_por_Despachos">Listo para Mensajero</option>
                  <option value="Recibido_por_Mensajero">Con Mensajero</option>
                  <option value="Entregado_a_Maquila">Entregado a Maquila</option>
                  <option value="Recibido_por_Maquila">Completado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              {/* Filtro por Fecha */}
              <div>
                <label htmlFor="filtro-fecha" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Creación
                </label>
                <input
                  type="date"
                  id="filtro-fecha"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Botón Limpiar Filtros */}
              <div className="flex items-end">
                <button
                  onClick={limpiarFiltros}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>

            {/* Contador de resultados */}
            <div className="mt-4 text-sm text-gray-600">
              Mostrando {pedidosFiltrados.length} de {pedidos.length} pedidos
            </div>
          </div>

          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Creación
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Movimientos
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pedidosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      {pedidos.length === 0 ? 'No hay pedidos registrados' : 'No se encontraron pedidos que coincidan con los filtros'}
                    </td>
                  </tr>
                ) : (
                  pedidosFiltrados.map((pedido) => (
                    <tr key={pedido.id_pedido}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {pedido.numero_pedido}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <EstadoBadge estado={pedido.estado} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFecha(pedido.fecha_creacion)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pedido.total_movimientos}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() => router.push(`/pedidos/${pedido.id_pedido}`)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Ver detalles
                          </button>
                          {usuario && (
                            <PedidoActions
                              pedido={pedido}
                              userRole={usuario.rol}
                              userName={usuario.usuario}
                              onActionComplete={fetchPedidos}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}