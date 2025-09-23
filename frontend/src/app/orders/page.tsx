'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import DataTable from '@/components/DataTable'
import { api } from '@/lib/api'

interface Pedido {
  id: number;
  cliente: string;
  estado: string;
  fechaCreacion: string;
  total: number;
}

export default function PedidosPage() {
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [error, setError] = useState('')

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'estado', label: 'Estado' },
    { key: 'fechaCreacion', label: 'Fecha' },
    { key: 'total', label: 'Total' },
  ]

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchPedidos()
  }, [router])

  const fetchPedidos = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const data = await api.getPedidos(token)
      setPedidos(data)
    } catch (err) {
      setError('Error al cargar los pedidos')
    }
  }

  const handleEdit = (pedido: Pedido) => {
    router.push(`/orders/${pedido.id}/edit`)
  }

  const handleDelete = async (pedido: Pedido) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este pedido?')) return

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      await api.deletePedido(token, pedido.id.toString())
      fetchPedidos() // Recargar la lista
    } catch (err) {
      setError('Error al eliminar el pedido')
    }
  }

  return (
    <div>
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
            <button
              onClick={() => router.push('/orders/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Nuevo Pedido
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <DataTable
            columns={columns}
            data={pedidos}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  )
}