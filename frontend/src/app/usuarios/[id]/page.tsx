import Navigation from '@/components/Navigation'
import EditarUsuarioComponent from './EditarUsuarioComponent'

export default function EditarUsuarioPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <EditarUsuarioComponent id={params.id} />
      </div>
    </div>
  )
}