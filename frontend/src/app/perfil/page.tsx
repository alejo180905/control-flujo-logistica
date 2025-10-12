'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { fetchApi } from '@/lib/api'

interface Usuario {
  id: number
  nombre: string
  usuario: string
  rol: string
}

export default function PerfilPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [nombre, setNombre] = useState('')
  const [passwordActual, setPasswordActual] = useState('')
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]
    if (!token) {
      router.push('/login')
      return
    }

    // Decodificar el token para obtener la información del usuario
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUsuario({
        id: payload.id,
        nombre: payload.nombre,
        usuario: payload.usuario,
        rol: payload.rol
      })
      setNombre(payload.nombre)
    } catch (error) {
      console.error('Error al decodificar token:', error)
      router.push('/login')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validaciones
    if (!nombre.trim()) {
      setError('El nombre es requerido')
      setLoading(false)
      return
    }

    if (password && password !== confirmarPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (password && password.length < 6) {
      setError('La contraseña nueva debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    if (password && !passwordActual) {
      setError('Debes ingresar tu contraseña actual para cambiarla')
      setLoading(false)
      return
    }

    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
      if (!token) throw new Error('No se encontró el token');
      const body = { nombre: nombre.trim(), passwordActual, password };
      const response = await fetchApi('/usuarios/perfil', {
        method: 'PUT',
        token,
        body: JSON.stringify(body)
      });
      if (response.ok) {
        setSuccess('Perfil actualizado correctamente');
        setPasswordActual('');
        setPassword('');
        setConfirmarPassword('');
        if (usuario) {
          setUsuario({ ...usuario, nombre: nombre.trim() });
        }
      } else {
        setError(response.mensaje || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="max-w-md mx-auto bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
              <p className="text-sm text-gray-600">Actualiza tu información personal</p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              {/* Información del usuario */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Información de la cuenta</h3>
                <div className="text-sm text-blue-700">
                  <p><strong>Usuario:</strong> {usuario?.usuario ?? ''}</p>
                  <p><strong>Rol:</strong> {usuario?.rol ?? ''}</p>
                </div>
              </div>

              {/* Nombre */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tu nombre completo"
                  required
                />
              </div>

              {/* Cambiar contraseña */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Cambiar Contraseña (Opcional)</h3>

                <div className="space-y-3">
                  <div>
                    <label htmlFor="passwordActual" className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña Actual
                    </label>
                    <input
                      type="password"
                      id="passwordActual"
                      value={passwordActual}
                      onChange={(e) => setPasswordActual(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tu contraseña actual"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmarPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      id="confirmarPassword"
                      value={confirmarPassword}
                      onChange={(e) => setConfirmarPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Repite la nueva contraseña"
                    />
                  </div>
                </div>
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
                      <p className="text-sm text-green-700">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Guardar Cambios
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

  )
}
