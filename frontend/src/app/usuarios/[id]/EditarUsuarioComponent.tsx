'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchApi } from '@/lib/api'

interface Usuario {
  id_usuario: number
  nombre: string
  usuario: string
  rol: string
  activo: boolean
}

export default function EditarUsuarioComponent({ id }: { id: string }) {
  const router = useRouter()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    async function loadUser() {
      try {
        if (!id) {
          throw new Error('ID de usuario no válido')
        }

        const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]
        if (!token) {
          router.push('/login')
          return
        }

        const data = await fetchApi(`/usuarios/${id}`, { token })
        setUsuario(data)
      } catch (error: any) {
        console.error('Error loading user:', error)
        setError(error?.message || 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [id, router])

  const handleDelete = async () => {
    if (!id) return

    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]
      if (!token) {
        setError('No se encontró el token de autenticación')
        return
      }

      const data = await fetchApi(`/usuarios/${id}`, {
        method: 'DELETE',
        token
      })
      if (data && !data.error) {
        alert('Usuario eliminado correctamente')
        router.push('/usuarios')
      } else {
        throw new Error(data.mensaje || 'Error al eliminar el usuario')
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al eliminar el usuario'
      setError(errorMessage)
      setConfirmDelete(false) // Cerrar el modal de confirmación
    }
  }

  const handleToggleStatus = async () => {
    if (!usuario || !id) return

    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]
      if (!token) return

      const data = await fetchApi(`/usuarios/${id}/toggle-status`, {
        method: 'PUT',
        token
      })
      if (data && !data.error) {
        setUsuario(prev => prev ? { ...prev, activo: !prev.activo } : null)
      } else {
        throw new Error(data.mensaje || 'Error al cambiar el estado del usuario')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Error al cambiar el estado del usuario')
    }
  }

  if (loading) {
    return (
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-gray-600">Cargando usuario...</p>
      </div>
    )
  }

  if (error) {
    return (
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
    )
  }

  if (!usuario) {
    return (
      <div className="text-center">
        <p className="text-gray-600">Usuario no encontrado</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Editar Usuario</h1>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Nombre</dt>
              <dd className="mt-1 text-sm text-gray-900">{usuario.nombre}</dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Usuario</dt>
              <dd className="mt-1 text-sm text-gray-900">{usuario.usuario}</dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Rol</dt>
              <dd className="mt-1 text-sm text-gray-900">{usuario.rol}</dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Estado</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  usuario.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {usuario.activo ? 'Activo' : 'Inactivo'}
                </span>
              </dd>
            </div>
          </dl>

          <div className="mt-8 space-y-4">
            <button
              onClick={handleToggleStatus}
              className={`${
                usuario.activo
                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                  : 'bg-orange-700 hover:bg-orange-800 focus:ring-orange-600'
              } w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              {usuario.activo ? 'Deshabilitar Usuario' : 'Habilitar Usuario'}
            </button>

            {confirmDelete ? (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.</p>
                    <div className="mt-4 flex space-x-4">
                      <button
                        onClick={handleDelete}
                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Sí, Eliminar
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Eliminar Usuario
              </button>
            )}

            <button
              onClick={() => router.push('/usuarios')}
              className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Volver a la Lista
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}