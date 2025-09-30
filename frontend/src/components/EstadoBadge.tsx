interface EstadoBadgeProps {
  estado: string
  className?: string
}

export default function EstadoBadge({ estado, className = '' }: EstadoBadgeProps) {
  const getEstadoConfig = (estado: string) => {
    switch (estado) {
      case 'En_Bodega':
        return {
          label: 'En Bodega',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: '📦'
        }
      case 'Entregado_a_Despachos':
        return {
          label: 'Entregado a Despachos',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: '📋'
        }
      case 'Recibido_por_Despachos':
        return {
          label: 'Recibido por Despachos',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: '📦'
        }
      case 'Entregado_por_Despachos':
        return {
          label: 'Listo para Mensajero',
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: '🚚'
        }
      case 'Recibido_por_Mensajero':
        return {
          label: 'Con Mensajero',
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: '🚚'
        }
      case 'Entregado_a_Maquila':
        return {
          label: 'Entregado a Maquila',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: '🏭'
        }
      case 'Recibido_por_Maquila':
        return {
          label: 'Completado',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: '✅'
        }
      case 'Cancelado':
        return {
          label: 'Cancelado',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: '❌'
        }
      default:
        return {
          label: estado,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '❓'
        }
    }
  }

  const config = getEstadoConfig(estado)

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color} ${className}`}>
      <span>{config.icon}</span>
      {config.label}
    </span>
  )
}