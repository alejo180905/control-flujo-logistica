'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'

interface Usuario {
  id_usuario: number
  nombre: string
  usuario: string
  rol: string
  activo: boolean
}

export default function UsuariosPage() {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  useEffect(() => {
    const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]
    if (!token) {
      console.log('Redirigiendo a login por falta de token...')
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
        throw new Error('Error al cargar los usuarios')
      }

      const data = await response.json()
      setUsuarios(data || [])
    } catch (error) {
      console.error('Error:', error)
      setError('Error al cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  // Función para obtener el color según el rol
  const getRolColor = (rol: string) => {
    const colores = {
      'Admin': 'bg-purple-100 text-purple-800',
      'Bodega': 'bg-blue-100 text-blue-800',
      'Despachos': 'bg-green-100 text-green-800',
      'Mensajero': 'bg-yellow-100 text-yellow-800',
      'Maquilas': 'bg-indigo-100 text-indigo-800'
    }
    return colores[rol as keyof typeof colores] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Cargando usuarios...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Lista de Usuarios</h1>
            <button
              onClick={() => router.push('/usuarios/nuevo')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Nuevo Usuario
            </button>
          </div>

          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuarios.map((usuario) => (
                  <tr key={usuario.id_usuario}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {usuario.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {usuario.usuario}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRolColor(usuario.rol)}`}>
                        {usuario.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        usuario.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a
                        href={`/usuarios/${usuario.id_usuario}`}
                        className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                      >
                        Editar
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}