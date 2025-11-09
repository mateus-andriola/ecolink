'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteResource } from '@/app/actions/resources'

type Resource = {
  id: string
  name: string
  quantity: number
  unit: string
}

export default function ResourceList({ 
  resources, 
  isOrganizer 
}: { 
  resources: Resource[]
  isOrganizer: boolean 
}) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleDelete = async (resourceId: string) => {
    if (!confirm('Tem certeza que deseja excluir este recurso?')) {
      return
    }

    setDeletingId(resourceId)
    setError('')

    const result = await deleteResource(resourceId)

    if (result.error) {
      setError(result.error)
      setDeletingId(null)
    } else {
      router.refresh()
    }
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-gray-900 text-lg">{resource.name}</h3>
              {isOrganizer && (
                <button
                  onClick={() => handleDelete(resource.id)}
                  disabled={deletingId === resource.id}
                  className="text-red-600 hover:text-red-700 disabled:opacity-50 text-sm"
                  title="Excluir recurso"
                >
                  {deletingId === resource.id ? '...' : '✕'}
                </button>
              )}
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {resource.quantity} <span className="text-lg text-gray-600">{resource.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
