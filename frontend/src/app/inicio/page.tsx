'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import EstadoBadge from '@/components/EstadoBadge'
import PedidoActions from '@/components/PedidoActions'
import { fetchApi } from '@/lib/api'

interface DashboardStats {
  totalPedidos: number;
  pedidosPendientes: number;
  pedidosCompletados: number;
  usuariosActivos: number;
}

interface Pedido {
  id_pedido: number
  numero_pedido: string
  estado: string
  fecha_creacion: string
  mensajero_que_recogio?: string
  maquila_que_recibio?: string
}

interface Usuario {
  id: number
  nombre: string
  usuario: string
  rol: string
}

export default function InicioPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalPedidos: 0,
    pedidosPendientes: 0,
    pedidosCompletados: 0,
    usuariosActivos: 0
  })
  const [pedidosRelevantes, setPedidosRelevantes] = useState<Pedido[]>([])
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]
    console.log('Token en inicio:', token ? 'Presente' : 'No encontrado')
    if (!token) {
      console.log('Redirigiendo a login por falta de token...')
      router.push('/login')
      return
    }

    // Decodificar token para obtener información del usuario
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUsuario({
        id: payload.id,
        nombre: payload.nombre,
        usuario: payload.usuario,
        rol: payload.rol
      })
    } catch (error) {
      console.error('Error al decodificar token:', error)
      router.push('/login')
      return
    }

    // Cargar estadísticas
    fetchStats()
  }, [router])

  // Recargar pedidos cuando cambie el usuario
  useEffect(() => {
    if (usuario) {
      fetchPedidosRelevantes()
    }
  }, [usuario])

  const refreshData = () => {
    fetchStats()
    fetchPedidosRelevantes()
  }

  const fetchPedidosRelevantes = async () => {
    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]
      if (!token) return

      const data = await fetchApi('/pedidos', {
        token
      })
      // Filtrar pedidos según el rol del usuario
      const pedidosFiltrados = (data.datos || []).filter((pedido: Pedido) => {
        if (!usuario) return false
        switch (usuario.rol) {
          case 'Bodega':
            return pedido.estado === 'En_Bodega'
          case 'Despachos':
            return pedido.estado === 'Entregado_a_Despachos' || pedido.estado === 'Recibido_por_Despachos'
          case 'Mensajero':
            return pedido.estado === 'Entregado_por_Despachos' || pedido.estado === 'Recibido_por_Mensajero'
          case 'Maquilas':
            return pedido.estado === 'Entregado_a_Maquila'
          case 'Admin':
            return true // Admin ve todos
          default:
            return false
        }
      })
      setPedidosRelevantes(pedidosFiltrados)
    } catch (error) {
      console.error('Error al cargar pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]
      if (!token) return
      const data = await fetchApi('/dashboard/stats', { token })
      setStats(data)
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    }
  }

  return (
    <div>
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Inicio</h1>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total de Pedidos */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total de Pedidos
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {stats.totalPedidos}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Pedidos Pendientes */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pedidos Pendientes
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {stats.pedidosPendientes}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Pedidos Completados */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pedidos Completados
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {stats.pedidosCompletados}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Usuarios Activos */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Usuarios Activos
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {stats.usuariosActivos}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Pedidos Disponibles */}
        <div className="mt-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                {usuario?.rol === 'Admin' ? 'Todos los Pedidos' : `Pedidos Disponibles`}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {usuario?.rol === 'Bodega' && 'Pedidos listos para entregar a despachos'}
                {usuario?.rol === 'Despachos' && 'Pedidos para recibir y entregar a mensajeros'}
                {usuario?.rol === 'Mensajero' && 'Pedidos disponibles para recoger y entregar'}
                {usuario?.rol === 'Maquilas' && 'Pedidos pendientes de recepción'}
                {usuario?.rol === 'Admin' && 'Vista general de todos los pedidos'}
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                onClick={refreshData}
                className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualizar
              </button>
            </div>
          </div>

          {/* Lista de Pedidos */}
          <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="mt-2 text-gray-600">Cargando pedidos...</p>
              </div>
            ) : pedidosRelevantes.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pedidos disponibles</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {usuario?.rol === 'Bodega' && 'No hay pedidos en bodega para entregar'}
                  {usuario?.rol === 'Despachos' && 'No hay pedidos en despachos para gestionar'}
                  {usuario?.rol === 'Mensajero' && 'No hay pedidos disponibles para recoger'}
                  {usuario?.rol === 'Maquilas' && 'No hay pedidos pendientes de recepción'}
                  {usuario?.rol === 'Admin' && 'No hay pedidos en el sistema'}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {pedidosRelevantes.map((pedido) => (
                  <li key={pedido.id_pedido} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-semibold text-sm">
                              #{pedido.numero_pedido.slice(-3)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-medium text-gray-900">
                              Pedido #{pedido.numero_pedido}
                            </p>
                            <EstadoBadge estado={pedido.estado} />
                          </div>
                          <p className="text-sm text-gray-500">
                            Creado: {new Date(pedido.fecha_creacion).toLocaleDateString('es-ES')}
                            {pedido.mensajero_que_recogio && (
                              <span className="ml-2">• Mensajero: {pedido.mensajero_que_recogio}</span>
                            )}
                            {pedido.maquila_que_recibio && (
                              <span className="ml-2">• Maquila: {pedido.maquila_que_recibio}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => router.push(`/pedidos/${pedido.id_pedido}`)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Ver detalles
                        </button>
                        {usuario && (
                          <PedidoActions
                            pedido={pedido}
                            userRole={usuario.rol}
                            userName={usuario.usuario}
                            onActionComplete={refreshData}
                          />
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}