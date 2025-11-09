'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { leaveEvent } from '@/app/actions/events'

export default function LeaveEventButton({ eventId }: { eventId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const handleLeave = async () => {
    setLoading(true)
    setError('')

    const result = await leaveEvent(eventId)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  if (showConfirm) {
    return (
      <div className="flex gap-2 items-center">
        <button
          onClick={handleLeave}
          disabled={loading}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
        >
          {loading ? 'Saindo...' : 'Confirmar Saída'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
        >
          Cancelar
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-medium"
    >
      Sair do Evento
    </button>
  )
}
