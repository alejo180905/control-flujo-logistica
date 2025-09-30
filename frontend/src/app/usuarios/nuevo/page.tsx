'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'

interface FormData {
  nombre: string
  usuario: string
  contraseña: string
  rol: string
}

export default function NuevoUsuarioPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    usuario: '',
    contraseña: '',
    rol: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const roles = ['Admin', 'Bodega', 'Despachos', 'Mensajero', 'Maquilas']

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones básicas
    if (!formData.nombre.trim() || !formData.usuario.trim() || !formData.contraseña.trim() || !formData.rol) {
      setError('Todos los campos son obligatorios')
      return
    }

    if (formData.contraseña.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]
      
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('http://localhost:3000/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.mensaje || 'Error al crear el usuario')
      }

      alert('Usuario creado correctamente')
      router.push('/usuarios')
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'Error al crear el usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Usuario</h1>
            <button
              onClick={() => router.push('/usuarios')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Volver a la Lista
            </button>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
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

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Nombre */}
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: Juan Pérez"
                      required
                    />
                  </div>

                  {/* Usuario */}
                  <div>
                    <label htmlFor="usuario" className="block text-sm font-medium text-gray-700">
                      Nombre de Usuario *
                    </label>
                    <input
                      type="text"
                      id="usuario"
                      name="usuario"
                      value={formData.usuario}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: juan.perez"
                      required
                    />
                  </div>

                  {/* Contraseña */}
                  <div>
                    <label htmlFor="contraseña" className="block text-sm font-medium text-gray-700">
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      id="contraseña"
                      name="contraseña"
                      value={formData.contraseña}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
                      required
                    />
                  </div>

                  {/* Rol */}
                  <div>
                    <label htmlFor="rol" className="block text-sm font-medium text-gray-700">
                      Rol *
                    </label>
                    <select
                      id="rol"
                      name="rol"
                      value={formData.rol}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Seleccionar rol...</option>
                      {roles.map(rol => (
                        <option key={rol} value={rol}>{rol}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        <strong>Información sobre los roles:</strong>
                      </p>
                      <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
                        <li><strong>Admin:</strong> Acceso completo al sistema, puede crear pedidos y gestionar usuarios</li>
                        <li><strong>Bodega:</strong> Puede entregar pedidos a despachos</li>
                        <li><strong>Despachos:</strong> Puede recibir de bodega y entregar a mensajeros</li>
                        <li><strong>Mensajero:</strong> Puede recoger de despachos y entregar a maquilas</li>
                        <li><strong>Maquilas:</strong> Puede confirmar recepción de pedidos</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => router.push('/usuarios')}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creando...
                      </>
                    ) : (
                      'Crear Usuario'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}