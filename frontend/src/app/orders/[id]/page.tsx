'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { api } from '@/lib/api'

interface PedidoForm {
  cliente: string;
  productos: {
    nombre: string;
    cantidad: number;
    precio: number;
  }[];
  estado: string;
}

export default function PedidoFormPage({ params }: { params: { id?: string } }) {
  const router = useRouter()
  const [formData, setFormData] = useState<PedidoForm>({
    cliente: '',
    productos: [{ nombre: '', cantidad: 0, precio: 0 }],
    estado: 'pendiente'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const isEditing = Boolean(params.id)

  useEffect(() => {
    if (isEditing) {
      fetchPedido()
    }
  }, [isEditing])

  const fetchPedido = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const data = await api.getPedidos(token)
      const pedido = data.find((p: any) => p.id.toString() === params.id)
      if (pedido) {
        setFormData({
          cliente: pedido.cliente,
          productos: pedido.productos,
          estado: pedido.estado
        })
      }
    } catch (err) {
      setError('Error al cargar el pedido')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      if (isEditing) {
        await api.updatePedido(token, params.id!, formData)
      } else {
        await api.createPedido(token, formData)
      }

      router.push('/orders')
    } catch (err) {
      setError('Error al guardar el pedido')
    } finally {
      setLoading(false)
    }
  }

  const addProducto = () => {
    setFormData(prev => ({
      ...prev,
      productos: [...prev.productos, { nombre: '', cantidad: 0, precio: 0 }]
    }))
  }

  const removeProducto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      productos: prev.productos.filter((_, i) => i !== index)
    }))
  }

  const updateProducto = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      productos: prev.productos.map((producto, i) =>
        i === index ? { ...producto, [field]: value } : producto
      )
    }))
  }

  return (
    <div>
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {isEditing ? 'Editar Pedido' : 'Nuevo Pedido'}
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cliente
              </label>
              <input
                type="text"
                value={formData.cliente}
                onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Productos
              </label>
              {formData.productos.map((producto, index) => (
                <div key={index} className="flex space-x-4 mb-4">
                  <input
                    type="text"
                    value={producto.nombre}
                    onChange={(e) => updateProducto(index, 'nombre', e.target.value)}
                    placeholder="Nombre del producto"
                    className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    required
                  />
                  <input
                    type="number"
                    value={producto.cantidad}
                    onChange={(e) => updateProducto(index, 'cantidad', parseInt(e.target.value))}
                    placeholder="Cantidad"
                    className="w-24 border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    required
                  />
                  <input
                    type="number"
                    value={producto.precio}
                    onChange={(e) => updateProducto(index, 'precio', parseFloat(e.target.value))}
                    placeholder="Precio"
                    className="w-32 border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeProducto(index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addProducto}
                className="mt-2 text-blue-600 hover:text-blue-900"
              >
                + Agregar Producto
              </button>
            </div>

            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Estado
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/orders')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}