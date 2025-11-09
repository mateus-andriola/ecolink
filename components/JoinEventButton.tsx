'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { joinEvent } from '@/app/actions/events'

export default function JoinEventButton({ eventId }: { eventId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showRoleSelect, setShowRoleSelect] = useState(false)

  const handleJoin = async (role: 'VOLUNTEER' | 'PARTNER') => {
    setLoading(true)
    setError('')

    const result = await joinEvent({ eventId, role })

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
      setShowRoleSelect(false)
    }
  }

  if (showRoleSelect) {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => handleJoin('VOLUNTEER')}
          disabled={loading}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
        >
          Participar como Voluntário
        </button>
        <button
          onClick={() => handleJoin('PARTNER')}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          Participar como Parceiro
        </button>
        <button
          onClick={() => setShowRoleSelect(false)}
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
      onClick={() => setShowRoleSelect(true)}
      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
    >
      Participar do Evento
    </button>
  )
}
