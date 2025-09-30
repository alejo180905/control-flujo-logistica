'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'

interface Usuario {
  id_usuario: number
  nombre: string
  usuario: string
  rol: string
  activo: boolean
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userRole, setUserRole] = useState('')

  useEffect(() => {
    const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]
    if (!token) {
      router.push('/login')
      return
    }

    // Verificar que sea Admin
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.rol !== 'Admin') {
        router.push('/dashboard')
        return
      }
      setUserRole(payload.rol)
    } catch (error) {
      console.error('Error al decodificar token:', error)
      router.push('/login')
      return
    }

    fetchUsuarios()
  }, [router])

  const fetchUsuarios = async () => {
    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]
      const response = await fetch('http://localhost:3000/api/usuarios', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al cargar usuarios')
      }

      const data = await response.json()
      // Filtrar para excluir el usuario actual y mostrar solo usuarios activos
      const usuariosFiltrados = data.filter((user: Usuario) => 
        user.activo && user.rol !== 'Admin'
      )
      setUsuarios(usuariosFiltrados)
    } catch (error) {
      console.error('Error:', error)
      setError('Error al cargar la lista de usuarios')
    } finally {
      setLoadingUsers(false)
    }
  }

  const generarPasswordTemporal = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = 'temp_'
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNuevaPassword(result)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!selectedUserId) {
      setError('Selecciona un usuario')
      setLoading(false)
      return
    }

    if (!nuevaPassword || nuevaPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]
      
      const payload = {
        id_usuario: parseInt(selectedUserId),
        nueva_password: nuevaPassword
      }
      
      console.log('Enviando payload:', payload)
      
      const response = await fetch('http://localhost:3000/api/usuarios/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        setSuccess(`Contraseña reseteada para ${data.datos.usuario_actualizado}. Nueva contraseña: ${data.datos.nueva_password_temporal}`)
        setSelectedUserId('')
        setNuevaPassword('')
      } else {
        console.error('Error response:', data)
        console.error('Response status:', response.status)
        setError(data.mensaje || data.error || `Error ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setError(`Error al conectar con el servidor: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setLoading(false)
    }
  }

  if (userRole !== 'Admin') {
    return (
      <div>
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
            <p className="mt-2 text-gray-600">Solo los administradores pueden acceder a esta página.</p>
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
          <div className="max-w-md mx-auto bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-red-50 border-b">
              <h1 className="text-2xl font-bold text-gray-900">Resetear Contraseña</h1>
              <p className="text-sm text-gray-600">Generar nueva contraseña temporal para usuarios</p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              {/* Advertencia */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Importante:</strong> Esta acción cambiará la contraseña del usuario seleccionado. 
                      Asegúrate de comunicarle la nueva contraseña temporal.
                    </p>
                  </div>
                </div>
              </div>

              {/* Seleccionar usuario */}
              <div>
                <label htmlFor="usuario" className="block text-sm font-medium text-gray-700 mb-1">
                  Seleccionar Usuario
                </label>
                {loadingUsers ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    <span className="ml-2 text-sm text-gray-600">Cargando usuarios...</span>
                  </div>
                ) : (
                  <select
                    id="usuario"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Seleccionar usuario...</option>
                    {usuarios.map((usuario) => (
                      <option key={usuario.id_usuario} value={usuario.id_usuario}>
                        {usuario.usuario} - {usuario.nombre} ({usuario.rol})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Nueva contraseña */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Nueva Contraseña Temporal
                  </label>
                  <button
                    type="button"
                    onClick={generarPasswordTemporal}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    🔄 Generar
                  </button>
                </div>
                <input
                  type="text"
                  id="password"
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Haz clic en "Generar" para crear una contraseña temporal automática
                </p>
              </div>

              {/* Mensajes */}
              {error && (
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
              )}

              {success && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700 whitespace-pre-line">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Reseteando...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Resetear Contraseña
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => router.push('/usuarios')}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Volver
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}